import { createServerClient } from "@/lib/supabase/server"
import { runFinancialAgent } from "@/lib/agent/orchestrator"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const message =
      body?.data?.message?.conversation ||
      body?.data?.message?.extendedTextMessage?.text

    const rawJid: string =
      body?.data?.key?.remoteJid || body?.data?.remoteJid || ""

    if (!message || !rawJid || rawJid.endsWith("@g.us")) {
      return new Response("ok", { status: 200 })
    }

    const phone = rawJid.replace("@s.whatsapp.net", "").replace(/\D/g, "")

    const supabase = await createServerClient()

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, user_id")
      .eq("phone", phone)
      .maybeSingle()

    if (!profile) {
      await sendWhatsAppMessage(
        phone,
        "⚠️ Número não encontrado. Cadastre seu telefone no sistema."
      )
      return new Response("ok", { status: 200 })
    }

    let { data: session } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("phone", phone)
      .maybeSingle()

    if (!session) {
      const { data: newSession } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: profile.user_id,
          phone,
          messages: [],
          pending_action: null,
        })
        .select()
        .single()
      session = newSession
    }

    if (!session) {
      console.error("Falha ao criar sessão para:", phone)
      return new Response("ok", { status: 200 })
    }

    const response = await runFinancialAgent({
      userMessage: message,
      session,
      supabase,
    })

    await sendWhatsAppMessage(phone, response)

    return new Response("ok", { status: 200 })
  } catch (error) {
    console.error("Erro no webhook WhatsApp:", error)
    return new Response("ok", { status: 200 })
  }
}

export async function sendWhatsAppMessage(phone: string, text: string) {
  const baseUrl = process.env.EVOLUTION_API_URL
  const instance = process.env.EVOLUTION_INSTANCE
  const apiKey = process.env.EVOLUTION_API_KEY

  if (!baseUrl || !instance || !apiKey) {
    console.error("Variáveis Evolution API não configuradas")
    return
  }

  try {
    const res = await fetch(`${baseUrl}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({
        number: `${phone}@s.whatsapp.net`,
        textMessage: { text },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Erro ao enviar mensagem WhatsApp:", err)
    }
  } catch (err) {
    console.error("Falha na chamada Evolution API:", err)
  }
}