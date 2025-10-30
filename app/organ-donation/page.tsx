import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { OrganDonationClient } from "@/components/organ-donation/organ-donation-client"

export default async function OrganDonationPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Redirect hospital staff
  if (profile?.user_role === "hospital_staff") {
    redirect("/hospital-dashboard")
  }

  return <OrganDonationClient user={user} />
}
