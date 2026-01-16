"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Building2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  const supabase = createClient()
  setIsLoading(true)
  setError(null)

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    router.push("/dashboard")
  } catch (error: unknown) {
    setError(error instanceof Error ? error.message : "Erro ao fazer login")
  } finally {
    setIsLoading(false)
  }
}


  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="w-full max-w-md p-6">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">FABRIDATA</h1>
          <p className="text-sm text-slate-400">Dashboard Finanças Pessoais</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Login</h2>
            <p className="text-sm text-slate-400">Entre com suas credenciais</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-slate-300">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-700 bg-slate-800/50 text-white placeholder:text-slate-500"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </div>
            <div className="mt-6 text-center text-sm text-slate-400">
              Não tem uma conta?{" "}
              <Link href="/auth/sign-up" className="text-blue-400 underline underline-offset-4 hover:text-blue-300">
                Cadastre-se
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
