"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { format } from "date-fns"

interface AlertHistoryDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function AlertHistoryDrawer({ open, onOpenChange, userId }: AlertHistoryDrawerProps) {
  const [alerts, setAlerts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchAlerts()
    }
  }, [open])

  const fetchAlerts = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("alerts")
      .select("*, hospitals(name, address)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    setAlerts(data || [])
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Alert History</SheetTitle>
          <SheetDescription>View your sent emergency alerts</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading alerts...</p>
          ) : alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts sent yet.</p>
          ) : (
            alerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{alert.hospitals?.name || "Unknown Hospital"}</CardTitle>
                      <CardDescription>{alert.hospitals?.address}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Sent:</strong> {format(new Date(alert.created_at), "PPpp")}
                  </p>
                  {alert.responded_at && (
                    <p>
                      <strong>Responded:</strong> {format(new Date(alert.responded_at), "PPpp")}
                    </p>
                  )}
                  {alert.response_notes && (
                    <p>
                      <strong>Notes:</strong> {alert.response_notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
