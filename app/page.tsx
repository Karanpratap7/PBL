import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle, Heart, MessageCircle, Shield } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect authenticated users to their dashboard
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("user_role").eq("id", user.id).single()

    if (profile?.user_role === "hospital_staff") {
      redirect("/hospital-dashboard")
    } else {
      redirect("/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Healthcare Alert</h1>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold md:text-5xl">Emergency Medical Alert System</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Send your location and medical records to nearby hospitals in seconds. Get immediate help when you need it
            most.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border bg-card py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-3xl font-bold">Key Features</h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">Emergency Alerts</h4>
              <p className="text-sm text-muted-foreground">
                Send your location and medical records to nearby hospitals with one click.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">Medical Records</h4>
              <p className="text-sm text-muted-foreground">
                Store and manage your health information securely in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">Organ Donation</h4>
              <p className="text-sm text-muted-foreground">
                Register your organ donation preferences to help save lives.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold">AI Assistant</h4>
              <p className="text-sm text-muted-foreground">
                Get answers to basic medical questions from our AI medical assistant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="mb-12 text-3xl font-bold">How It Works</h3>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              1
            </div>
            <h4 className="font-semibold">Create Account</h4>
            <p className="text-sm text-muted-foreground">Sign up as a patient or hospital staff member.</p>
          </div>
          <div className="space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              2
            </div>
            <h4 className="font-semibold">Add Your Information</h4>
            <p className="text-sm text-muted-foreground">
              Fill in your medical records and organ donation preferences.
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              3
            </div>
            <h4 className="font-semibold">Send Alert</h4>
            <p className="text-sm text-muted-foreground">
              In an emergency, send your location to nearby hospitals instantly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-card py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 text-3xl font-bold">Ready to Get Started?</h3>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of users who trust Healthcare Alert for their emergency medical needs.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg">Create Your Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Healthcare Alert. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
