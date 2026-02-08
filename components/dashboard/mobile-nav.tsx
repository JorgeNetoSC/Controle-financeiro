"use client"

import { LayoutDashboard, Receipt, CreditCard, Settings, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"

export function MobileNav() {
  const pathname = usePathname()

  const menuItems = [
    { icon: <LayoutDashboard size={24} />, label: "Início", href: "/dashboard" },
    { icon: <Receipt size={24} />, label: "Transações", href: "/dashboard/transactions" },
    { icon: <Plus size={24} />, label: "Novo", href: "#", isCenter: true },
    { icon: <CreditCard size={24} />, label: "Cartões", href: "/dashboard/cards" },
    { icon: <Settings size={24} />, label: "Ajustes", href: "/dashboard/settings" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Efeito de desfoque de fundo (Glassmorphism) */}
      <div className="bg-background/80 backdrop-blur-lg border-t border-white/5 px-6 py-3 flex items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.4)]">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href

          if (item.isCenter) {
            return (
              <button
                key={index}
                className="relative -top-7 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 active:scale-95 transition-transform"
              >
                {item.icon}
              </button>
            )
          }

          return (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}