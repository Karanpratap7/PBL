"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle } from "lucide-react"

interface SendAlertButtonProps {
  userId: string
}

export function SendAlertButton({ userId }: SendAlertButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSendAlert = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Get user's current location
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser")
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords

          const supabase = createClient()

          const { data: hospitals, error: hospitalsError } = await supabase.from("hospitals").select("*")

          if (hospitalsError) throw hospitalsError

          if (!hospitals || hospitals.length === 0) {
            setError("No hospitals found in database. Please try again later.")
            setIsLoading(false)
            return
          }

          // Calculate distance and filter hospitals within radius
          const nearbyHospitals = hospitals.filter((hospital) => {
            const distance = calculateDistance(latitude, longitude, hospital.latitude, hospital.longitude)
            console.log(`[v0] Distance to ${hospital.name}: ${distance.toFixed(2)}km (radius: ${hospital.radius_km}km)`)
            return distance <= hospital.radius_km
          })

          if (nearbyHospitals.length === 0) {
            setError("No hospitals within alert range. Please move closer to a hospital.")
            setIsLoading(false)
            return
          }

          // Send alerts to all nearby hospitals
          const alerts = nearbyHospitals.map((hospital) => ({
            user_id: userId,
            hospital_id: hospital.id,
            user_latitude: latitude,
            user_longitude: longitude,
            status: "pending",
          }))

          const { error: alertError } = await supabase.from("alerts").insert(alerts)

          if (alertError) throw alertError

          setSuccess(true)
          setTimeout(() => setSuccess(false), 5000)
        },
        (error) => {
          setError(`Location error: ${error.message}`)
          setIsLoading(false)
        },
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSendAlert}
        disabled={isLoading}
        size="lg"
        className="w-full bg-destructive hover:bg-destructive/90"
      >
        <AlertCircle className="mr-2 h-5 w-5" />
        {isLoading ? "Sending Alert..." : "Send Emergency Alert"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-green-600">Alert sent successfully to nearby hospitals!</p>}
    </div>
  )
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
