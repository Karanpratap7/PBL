"use client"

import type { User } from "@supabase/supabase-js"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, LogOut, MapPin, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { AlertDetailModal } from "./alert-detail-modal"
import { format } from "date-fns"

interface HospitalDashboardClientProps {
  user: User
  profile: any
}

export function HospitalDashboardClient({ user, profile }: HospitalDashboardClientProps) {
  const router = useRouter()
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState<any>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    fetchAlerts()
    // Poll for new alerts every 5 seconds
    const interval = setInterval(fetchAlerts, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("alerts")
      .select("*, profiles(full_name, email, phone)")
      .eq("hospital_id", profile?.hospital_id)
      .order("created_at", { ascending: false })

    setAlerts(data || [])
    setIsLoading(false)
  }

  const handleViewAlert = (alert: any) => {
    setSelectedAlert(alert)
    setShowDetailModal(true)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const pendingAlerts = alerts.filter((a) => a.status === "pending")
  const respondedAlerts = alerts.filter((a) => a.status !== "pending")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hospital Dashboard</h1>
            <p className="text-sm text-muted-foreground">Staff: {profile?.full_name || "User"}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Pending Alerts Section */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Incoming Alerts</h2>
            <Badge variant="destructive">{pendingAlerts.length}</Badge>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading alerts...</p>
          ) : pendingAlerts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-sm text-muted-foreground">No pending alerts at this time.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingAlerts.map((alert) => (
                <Card key={alert.id} className="border-2 border-destructive/50 bg-destructive/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      {alert.profiles?.full_name || "Unknown Patient"}
                    </CardTitle>
                    <CardDescription>{alert.profiles?.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(alert.created_at), "PPpp")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {alert.user_latitude.toFixed(4)}, {alert.user_longitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => handleViewAlert(alert)} className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Responded Alerts Section */}
        {respondedAlerts.length > 0 && (
          <div>
            <h2 className="mb-4 text-xl font-bold">Alert History</h2>
            <div className="space-y-2">
              {respondedAlerts.map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{alert.profiles?.full_name || "Unknown Patient"}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(alert.created_at), "PPpp")}</p>
                    </div>
                    <Badge variant={alert.status === "accepted" ? "default" : "secondary"}>{alert.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlert}
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        onAlertUpdated={fetchAlerts}
      />
    </div>
  )
}
