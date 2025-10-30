"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

interface MedicalRecordsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function MedicalRecordsDrawer({ open, onOpenChange, userId }: MedicalRecordsDrawerProps) {
  const [records, setRecords] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    blood_type: "",
    allergies: "",
    chronic_conditions: "",
    medications: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    notes: "",
  })

  useEffect(() => {
    if (open) {
      fetchRecords()
    }
  }, [open])

  const fetchRecords = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from("medical_records").select("*").eq("user_id", userId).single()

    if (data) {
      setRecords(data)
      setFormData({
        blood_type: data.blood_type || "",
        allergies: (data.allergies || []).join(", "),
        chronic_conditions: (data.chronic_conditions || []).join(", "),
        medications: (data.medications || []).join(", "),
        emergency_contact_name: data.emergency_contact_name || "",
        emergency_contact_phone: data.emergency_contact_phone || "",
        emergency_contact_relationship: data.emergency_contact_relationship || "",
        notes: data.notes || "",
      })
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const dataToSave = {
      user_id: userId,
      blood_type: formData.blood_type,
      allergies: formData.allergies.split(",").map((a) => a.trim()),
      chronic_conditions: formData.chronic_conditions.split(",").map((c) => c.trim()),
      medications: formData.medications.split(",").map((m) => m.trim()),
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      emergency_contact_relationship: formData.emergency_contact_relationship,
      notes: formData.notes,
    }

    if (records?.id) {
      await supabase.from("medical_records").update(dataToSave).eq("id", records.id)
    } else {
      await supabase.from("medical_records").insert([dataToSave])
    }

    setIsEditing(false)
    await fetchRecords()
    setIsLoading(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Medical Records</SheetTitle>
          <SheetDescription>View and manage your health information</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="blood_type">Blood Type</Label>
                <Input
                  id="blood_type"
                  value={formData.blood_type}
                  onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                  placeholder="e.g., O+"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="e.g., Penicillin, Peanuts"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="chronic_conditions">Chronic Conditions (comma-separated)</Label>
                <Input
                  id="chronic_conditions"
                  value={formData.chronic_conditions}
                  onChange={(e) => setFormData({ ...formData, chronic_conditions: e.target.value })}
                  placeholder="e.g., Diabetes, Hypertension"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="medications">Current Medications (comma-separated)</Label>
                <Input
                  id="medications"
                  value={formData.medications}
                  onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                  placeholder="e.g., Metformin, Lisinopril"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                  placeholder="Full name"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                <Input
                  id="emergency_contact_relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                  placeholder="e.g., Spouse, Parent"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional medical information"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isLoading}>
                  Save Records
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {records ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Blood Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{records.blood_type || "Not provided"}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Allergies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{records.allergies?.join(", ") || "None"}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Chronic Conditions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{records.chronic_conditions?.join(", ") || "None"}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Current Medications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{records.medications?.join(", ") || "None"}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong> {records.emergency_contact_name || "Not provided"}
                      </p>
                      <p>
                        <strong>Phone:</strong> {records.emergency_contact_phone || "Not provided"}
                      </p>
                      <p>
                        <strong>Relationship:</strong> {records.emergency_contact_relationship || "Not provided"}
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No medical records found. Create one to get started.</p>
              )}

              <Button onClick={() => setIsEditing(true)} className="w-full">
                {records ? "Edit Records" : "Create Records"}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
