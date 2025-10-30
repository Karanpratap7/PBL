import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HospitalDashboardClient } from "@/components/hospital/hospital-dashboard-client"

export default async function HospitalDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Redirect non-hospital staff to user dashboard
  if (profile?.user_role !== "hospital_staff") {
    redirect("/dashboard")
  }

  return <HospitalDashboardClient user={user} profile={profile} />
}
