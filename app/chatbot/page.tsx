import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ChatbotClient } from "@/components/chatbot/chatbot-client"

export default async function ChatbotPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <ChatbotClient user={user} />
}
