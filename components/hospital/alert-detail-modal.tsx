"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { MapPin, Clock, Heart } from "lucide-react"

interface AlertDetailModalProps {
  alert: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onAlertUpdated: () => void
}

export function AlertDetailModal({ alert, open, onOpenChange, onAlertUpdated }: AlertDetailModalProps) {
  const [medicalRecords, setMedicalRecords] = useState<any>(null)
  const [organDonation, setOrganDonation] = useState<any>(null)
  const [responseNotes, setResponseNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResponding, setIsResponding] = useState(false)

  useEffect(() => {
    if (open && alert) {
      fetchPatientData()
    }
  }, [open, alert])

  const fetchPatientData = async () => {
    setIsLoading(true)
    const supabase = createClient()

    // Fetch medical records
    const { data: records } = await supabase.from("medical_records").select("*").eq("user_id", alert.user_id).single()

    setMedicalRecords(records)

    // Fetch organ donation info
    const { data: donation } = await supabase.from("organ_donations").select("*").eq("user_id", alert.user_id).single()

    setOrganDonation(donation)
    setIsLoading(false)
  }

  const handleRespond = async (status: "accepted" | "rejected") => {
    setIsResponding(true)
    const supabase = createClient()

    const { error } = await supabase
      .from("alerts")
      .update({
        status,
        response_notes: responseNotes,
        responded_at: new Date().toISOString(),
      })
      .eq("id", alert.id)

    if (!error) {
      onAlertUpdated()
      onOpenChange(false)
    }
    setIsResponding(false)
  }

  if (!alert) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alert Details</DialogTitle>
          <DialogDescription>Patient: {alert.profiles?.full_name}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="donation">Donation</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>Name:</strong> {alert.profiles?.full_name}
                </p>
                <p>
                  <strong>Email:</strong> {alert.profiles?.email}
                </p>
                <p>
                  <strong>Phone:</strong> {alert.profiles?.phone || "Not provided"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>
                  Latitude: {alert.user_latitude.toFixed(6)}, Longitude: {alert.user_longitude.toFixed(6)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Alert Time
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{format(new Date(alert.created_at), "PPpp")}</p>
              </CardContent>
            </Card>

            {alert.status !== "pending" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Response</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Status:</strong> <Badge>{alert.status}</Badge>
                  </p>
                  {alert.response_notes && (
                    <p>
                      <strong>Notes:</strong> {alert.response_notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Medical Tab */}
          <TabsContent value="medical" className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading medical records...</p>
            ) : medicalRecords ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Blood Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold">{medicalRecords.blood_type || "Not provided"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Allergies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{medicalRecords.allergies?.join(", ") || "None"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Chronic Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{medicalRecords.chronic_conditions?.join(", ") || "None"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Current Medications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{medicalRecords.medications?.join(", ") || "None"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong> {medicalRecords.emergency_contact_name || "Not provided"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {medicalRecords.emergency_contact_phone || "Not provided"}
                    </p>
                    <p>
                      <strong>Relationship:</strong> {medicalRecords.emergency_contact_relationship || "Not provided"}
                    </p>
                  </CardContent>
                </Card>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No medical records available.</p>
            )}
          </TabsContent>

          {/* Donation Tab */}
          <TabsContent value="donation" className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading donation information...</p>
            ) : organDonation ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Heart className="h-4 w-4" />
                      Organ Donor Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={organDonation.is_donor ? "default" : "secondary"}>
                      {organDonation.is_donor ? "Registered Donor" : "Not a Donor"}
                    </Badge>
                  </CardContent>
                </Card>

                {organDonation.is_donor && (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Organs Available for Donation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{organDonation.organs?.join(", ") || "Not specified"}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Blood Type for Donation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{organDonation.blood_type_for_donation || "Not specified"}</p>
                      </CardContent>
                    </Card>
                  </>
                )}

                {organDonation.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{organDonation.notes}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No organ donation information available.</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Response Section */}
        {alert.status === "pending" && (
          <div className="space-y-4 border-t border-border pt-4">
            <div className="grid gap-2">
              <Label htmlFor="response-notes">Response Notes (Optional)</Label>
              <Textarea
                id="response-notes"
                placeholder="Add any notes about your response..."
                value={responseNotes}
                onChange={(e) => setResponseNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleRespond("accepted")}
                disabled={isResponding}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Accept Alert
              </Button>
              <Button
                onClick={() => handleRespond("rejected")}
                disabled={isResponding}
                variant="destructive"
                className="flex-1"
              >
                Reject Alert
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
