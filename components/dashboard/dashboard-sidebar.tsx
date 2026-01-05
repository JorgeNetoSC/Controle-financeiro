"use client"

import { useState, useEffect } from "react"
import {
  Home,
  ArrowLeftRight,
  Layers,
  TrendingUp,
  Menu,
  LogOut,
  X,
  Plus,       // Ícone para Transação
  CreditCard, // Ícone para Parcela
  Tag         // Ícone para Categoria
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface DashboardSidebarProps {
  actions?: React.ReactNode
}

export function DashboardSidebar({ actions }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsOpen(false)
      else setIsOpen(true)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [supabase])

  return (
    <aside
      className={`
        fixed md:relative z-40
        flex h-screen flex-col
        border-r border-slate-800 bg-slate-900
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-16"}
      `}
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        {isOpen && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-lg font-bold text-white leading-tight">FinTrack</span>
            <span className="truncate text-[10px] text-slate-400 italic">
              {user?.email}
            </span>
          </div>
        )}

        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className={`text-slate-300 hover:bg-slate-800 ${!isOpen && "mx-auto"}`}
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* ================= AÇÕES (Botões Azuis) ================= */}
      {actions && (
        <div className="border-b border-slate-800 p-3 overflow-hidden">
          <div
            className={`
              flex flex-col gap-2 transition-all duration-300
              ${isOpen ? "items-stretch" : "items-center"}
              
              /* PADRONIZAÇÃO DOS BOTÕES DENTRO DE ACTIONS */
              [&_button]:bg-blue-600 
              [&_button]:text-white 
              [&_button]:hover:bg-blue-700
              [&_button]:transition-all
              [&_button]:flex 
              [&_button]:items-center 
              [&_button]:gap-2
              
              /* ESTADO FECHADO (MODO ÍCONE) */
              ${!isOpen ? `
                [&_button]:w-10 
                [&_button]:h-10 
                [&_button]:p-0 
                [&_button]:justify-center
                [&_button]:text-[0px]
                [&_button_span]:hidden
                [&_button_svg]:m-0
                [&_button_svg]:w-5
                [&_button_svg]:h-5
              ` : ""}
            `}
          >
            {actions}
          </div>
        </div>
      )}

      {/* ================= MENU ================= */}
      <nav className="flex flex-1 flex-col gap-1 p-2 overflow-y-auto">
        <SidebarItem icon={<Home size={18} />} label="Dashboard" isOpen={isOpen} />
        <SidebarItem icon={<ArrowLeftRight size={18} />} label="Transações" isOpen={isOpen} />
        <SidebarItem icon={<Layers size={18} />} label="Parcelas" isOpen={isOpen} />
        <SidebarItem icon={<TrendingUp size={18} />} label="Projeções" isOpen={isOpen} />
      </nav>

      {/* ================= FOOTER ================= */}
      <div className="border-t border-slate-800 p-2">
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.push("/auth/login")
          }}
          className={`
            flex items-center gap-3 rounded-md
            border border-slate-700 px-3 py-2
            text-sm text-red-400 w-full
            hover:bg-slate-800 transition-all
            ${!isOpen ? "justify-center px-0 border-transparent" : ""}
          `}
        >
          <LogOut size={18} />
          {isOpen && <span>Sair</span>}
        </button>
      </div>
    </aside>
  )
}

function SidebarItem({ icon, label, isOpen }: { icon: React.ReactNode; label: string; isOpen: boolean }) {
  return (
    <button
      className={`
        flex items-center gap-3 rounded-md px-3 py-2 w-full
        text-sm text-slate-300 hover:bg-slate-800 transition-all
        ${!isOpen ? "justify-center px-0" : ""}
      `}
    >
      <div className="flex-shrink-0">{icon}</div>
      {isOpen && <span className="truncate">{label}</span>}
    </button>
  )
}