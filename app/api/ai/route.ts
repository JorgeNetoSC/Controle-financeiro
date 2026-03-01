import { openai } from "@ai-sdk/openai"
import { streamText, convertToModelMessages } from "ai"

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: await convertToModelMessages(messages),
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("ERRO NA API:", error)
    return new Response("Erro interno", { status: 500 })
  }
}