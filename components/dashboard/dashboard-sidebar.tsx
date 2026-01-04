"use client"

import { useState, useEffect } from "react"
import {
  Home,
  ArrowLeftRight,
  Layers,
  TrendingUp,
  Menu,
  LogOut,
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
  const [isOpen, setIsOpen] = useState(true)
  const [user, setUser] = useState<{ email?: string } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
  <aside
    className={`
      flex h-screen flex-col
      border-r border-slate-800 bg-slate-900
      transition-all duration-300
      ${isOpen ? "w-64" : "w-16"}
    `}
  >
    {/* HEADER */}
    <div className="flex items-center justify-between border-b border-slate-800 p-4">
      {isOpen && (
        <div className="flex flex-col overflow-hidden">
          <span className="text-lg font-bold text-white leading-tight">
            FinTrack
          </span>

          {/* EMAIL – nunca quebra */}
          <span className="truncate text-xs text-slate-400">
            {user?.email}
          </span>
        </div>
      )}

      <Button
        size="icon"
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-300 hover:bg-slate-800"
      >
        <Menu size={20} />
      </Button>
    </div>

    {/* MENU */}
    <nav className="flex flex-1 flex-col gap-1 p-2">
      <SidebarItem icon={<Home size={18} />} label="Dashboard" isOpen={isOpen} />
      <SidebarItem icon={<ArrowLeftRight size={18} />} label="Transações" isOpen={isOpen} />
      <SidebarItem icon={<Layers size={18} />} label="Parcelas" isOpen={isOpen} />
      <SidebarItem icon={<TrendingUp size={18} />} label="Projeções" isOpen={isOpen} />
    </nav>

    {/* FOOTER */}
    <div className="border-t border-slate-800 p-2">
      <button
        onClick={handleLogout}
        className={`
          flex w-full items-center gap-3 rounded-md
          border border-slate-700 px-3 py-2
          text-sm text-red-400
          hover:bg-slate-800 transition
          ${!isOpen && "justify-center px-0"}
        `}
      >
        <LogOut size={18} />
        {isOpen && <span>Sair</span>}
      </button>
    </div>
  </aside>
)

}

/* ========================= */
/* ITEM DO MENU */
/* ========================= */

function SidebarItem({
  icon,
  label,
  isOpen,
}: {
  icon: React.ReactNode
  label: string
  isOpen: boolean
}) {
  return (
    <button
      className={`
        flex items-center gap-3 rounded-md px-3 py-2
        text-sm text-slate-300 hover:bg-slate-800 transition
        ${!isOpen && "justify-center px-0"}
      `}
    >
      {icon}
      {isOpen && <span>{label}</span>}
    </button>
  )
}
