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
} from "lucide-react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface DashboardSidebarProps {
  selectedAccount: string
  setSelectedAccount: (v: string) => void
  dateRange: { from: string; to: string }
  setDateRange: (v: { from: string; to: string }) => void
  selectedYear: string
  setSelectedYear: (v: string) => void
  selectedMonth: string
  setSelectedMonth: (v: string) => void
}

export function DashboardSidebar({
  selectedAccount,
  setSelectedAccount,
  dateRange,
  setDateRange,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
}: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  /* ========================= */
  /* BUSCA USUÁRIO */
  /* ========================= */
  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    getUser()
  }, [supabase])

  /* ========================= */
  /* CONTROLE MOBILE / DESKTOP */
  /* ========================= */
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setIsOpen(true) // desktop
      } else {
        setIsOpen(false) // mobile
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  /* ========================= */
  /* LOGOUT */
  /* ========================= */
  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace("/auth/login")
  }

  return (
    <>
      {/* BOTÃO MOBILE (hamburger) */}
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Button
          size="icon"
          variant="ghost"
          className="bg-slate-900 text-slate-200"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={20} />
        </Button>
      </div>

      {/* OVERLAY MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed z-50 flex h-screen flex-col
          border-r border-slate-800 bg-slate-900
          transition-all duration-300
          ${isOpen ? "left-0 w-64" : "-left-full w-64"}
          lg:static lg:left-0 lg:w-64
        `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <div className="flex flex-col overflow-hidden">
            <span className="text-lg font-bold text-white leading-tight">
              FinTrack
            </span>
            <span className="truncate text-xs text-slate-400">
              {user?.email}
            </span>
          </div>

          {/* FECHAR NO MOBILE */}
          <Button
            size="icon"
            variant="ghost"
            className="text-slate-300 hover:bg-slate-800 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X size={18} />
          </Button>
        </div>

        {/* MENU */}
        <nav className="flex flex-1 flex-col gap-1 p-2">
          <SidebarItem icon={<Home size={18} />} label="Dashboard" />
          <SidebarItem icon={<ArrowLeftRight size={18} />} label="Transações" />
          <SidebarItem icon={<Layers size={18} />} label="Parcelas" />
          <SidebarItem icon={<TrendingUp size={18} />} label="Projeções" />
        </nav>

        {/* FOOTER */}
        <div className="border-t border-slate-800 p-2">
          <button
            onClick={handleLogout}
            className="
              flex w-full items-center gap-3 rounded-md
              border border-slate-700 px-3 py-2
              text-sm text-red-400
              hover:bg-slate-800 transition
            "
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  )
}

/* ========================= */
/* ITEM DO MENU */
/* ========================= */
function SidebarItem({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <button
      className="
        flex items-center gap-3 rounded-md px-3 py-2
        text-sm text-slate-300
        hover:bg-slate-800 transition
      "
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
