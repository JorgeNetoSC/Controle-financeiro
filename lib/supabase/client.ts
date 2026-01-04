import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

export function createBrowserClient() {
  return createSupabaseBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
const supabase = createClient()

const resendConfirmation = async () => {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: "SEU_EMAIL_AQUI",
  })

  if (error) {
    console.error(error.message)
    alert("Erro ao reenviar email")
  } else {
    alert("Email de verificação reenviado!")
  }
}


// Keep legacy export for compatibility
export function createClient() {
  return createBrowserClient()
}
