"use client"

import type { User } from "@supabase/supabase-js"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Heart, MessageCircle, LogOut, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { MedicalRecordsDrawer } from "./medical-records-drawer"
import { AlertHistoryDrawer } from "./alert-history-drawer"
import { SendAlertButton } from "./send-alert-button"

interface DashboardClientProps {
  user: User
  profile: any
}

export function DashboardClient({ user, profile }: DashboardClientProps) {
  const router = useRouter()
  const [showMedicalRecords, setShowMedicalRecords] = useState(false)
  const [showAlertHistory, setShowAlertHistory] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Healthcare Alert</h1>
            <p className="text-sm text-muted-foreground">Welcome, {profile?.full_name || "User"}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Emergency Alert Card */}
          <Card className="md:col-span-2 lg:col-span-3 border-2 border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                Emergency Alert
              </CardTitle>
              <CardDescription>Send your location and medical records to nearby hospitals</CardDescription>
            </CardHeader>
            <CardContent>
              <SendAlertButton userId={user.id} />
            </CardContent>
          </Card>

          {/* Medical Records Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Medical Records
              </CardTitle>
              <CardDescription>View and manage your health information</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowMedicalRecords(true)} className="w-full">
                View Records
              </Button>
            </CardContent>
          </Card>

          {/* Organ Donation Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Organ Donation
              </CardTitle>
              <CardDescription>Manage your donation preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/organ-donation")} className="w-full">
                Update Preferences
              </Button>
            </CardContent>
          </Card>

          {/* AI Chatbot Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Medical Assistant
              </CardTitle>
              <CardDescription>Ask medical questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/chatbot")} className="w-full">
                Chat Now
              </Button>
            </CardContent>
          </Card>

          {/* Alert History Card */}
          <Card>
            <CardHeader>
              <CardTitle>Alert History</CardTitle>
              <CardDescription>View your sent alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowAlertHistory(true)} className="w-full">
                View History
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Drawers */}
      <MedicalRecordsDrawer open={showMedicalRecords} onOpenChange={setShowMedicalRecords} userId={user.id} />
      <AlertHistoryDrawer open={showAlertHistory} onOpenChange={setShowAlertHistory} userId={user.id} />
    </div>
  )
}
