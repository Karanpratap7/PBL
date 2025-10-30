import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json()

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google API key not configured" }, { status: 500 })
    }

    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Format conversation history for context
    const conversationContext = conversationHistory
      .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n")

    const systemPrompt = `You are a helpful medical assistant AI. You provide general medical information and health guidance based on common medical knowledge. 

IMPORTANT GUIDELINES:
1. Always remind users that you are not a substitute for professional medical advice
2. For serious symptoms or emergencies, always recommend seeing a doctor immediately
3. Provide accurate, evidence-based health information
4. Be empathetic and supportive in your responses
5. If you're unsure about something, say so and recommend consulting a healthcare professional
6. Keep responses concise and easy to understand
7. Do not diagnose conditions - only provide general information
8. Encourage healthy lifestyle choices

Current conversation:
${conversationContext}`

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}\n\nUser message: ${message}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    })

    const responseText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try again."

    return NextResponse.json({ message: responseText })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
  }
}
