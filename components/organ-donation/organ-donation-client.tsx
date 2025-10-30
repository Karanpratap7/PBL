"use client"

import type React from "react"

import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Heart } from "lucide-react"
import Link from "next/link"

interface OrganDonationClientProps {
  user: User
}

const AVAILABLE_ORGANS = [
  { id: "heart", label: "Heart" },
  { id: "lungs", label: "Lungs" },
  { id: "liver", label: "Liver" },
  { id: "kidneys", label: "Kidneys" },
  { id: "pancreas", label: "Pancreas" },
  { id: "corneas", label: "Corneas" },
  { id: "bone_marrow", label: "Bone Marrow" },
  { id: "skin", label: "Skin" },
]

export function OrganDonationClient({ user }: OrganDonationClientProps) {
  const [isDonor, setIsDonor] = useState(false)
  const [selectedOrgans, setSelectedOrgans] = useState<string[]>([])
  const [bloodType, setBloodType] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    fetchDonationData()
  }, [])

  const fetchDonationData = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("organ_donations").select("*").eq("user_id", user.id).single()

    if (data) {
      setIsDonor(data.is_donor || false)
      setSelectedOrgans(data.organs || [])
      setBloodType(data.blood_type_for_donation || "")
      setNotes(data.notes || "")
    }
    setIsLoading(false)
  }

  const handleOrganToggle = (organId: string) => {
    setSelectedOrgans((prev) => (prev.includes(organId) ? prev.filter((id) => id !== organId) : [...prev, organId]))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMessage("")

    const supabase = createClient()

    const donationData = {
      user_id: user.id,
      is_donor: isDonor,
      organs: isDonor ? selectedOrgans : [],
      blood_type_for_donation: isDonor ? bloodType : null,
      notes: isDonor ? notes : null,
    }

    const { data: existingData } = await supabase.from("organ_donations").select("id").eq("user_id", user.id).single()

    if (existingData) {
      await supabase.from("organ_donations").update(donationData).eq("user_id", user.id)
    } else {
      await supabase.from("organ_donations").insert([donationData])
    }

    setSuccessMessage("Your organ donation preferences have been saved successfully!")
    setTimeout(() => setSuccessMessage(""), 5000)
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Organ Donation Preferences</h1>
            <p className="text-sm text-muted-foreground">Manage your organ donation registration</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Donor Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Organ Donor Status
              </CardTitle>
              <CardDescription>Register as an organ donor to help save lives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="isDonor"
                  checked={isDonor}
                  onCheckedChange={(checked) => setIsDonor(checked as boolean)}
                />
                <Label htmlFor="isDonor" className="cursor-pointer font-medium">
                  Yes, I want to be an organ donor
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Organs Selection */}
          {isDonor && (
            <Card>
              <CardHeader>
                <CardTitle>Select Organs for Donation</CardTitle>
                <CardDescription>Choose which organs you&apos;re willing to donate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {AVAILABLE_ORGANS.map((organ) => (
                    <div key={organ.id} className="flex items-center gap-3">
                      <Checkbox
                        id={organ.id}
                        checked={selectedOrgans.includes(organ.id)}
                        onCheckedChange={() => handleOrganToggle(organ.id)}
                      />
                      <Label htmlFor={organ.id} className="cursor-pointer">
                        {organ.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Blood Type */}
          {isDonor && (
            <Card>
              <CardHeader>
                <CardTitle>Blood Type for Donation</CardTitle>
                <CardDescription>Your blood type helps match recipients</CardDescription>
              </CardHeader>
              <CardContent>
                <Input
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  placeholder="e.g., O+, A-, B+, AB"
                  className="max-w-xs"
                />
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          {isDonor && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Any special instructions or information</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional information about your donation preferences..."
                  rows={4}
                />
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>Important:</strong> Your organ donation preferences will be shared with hospitals when you send
                an emergency alert. This information helps medical professionals make informed decisions in critical
                situations.
              </p>
            </CardContent>
          </Card>

          {/* Success Message */}
          {successMessage && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <p className="text-sm text-green-900">{successMessage}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? "Saving..." : "Save Preferences"}
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full bg-transparent">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
