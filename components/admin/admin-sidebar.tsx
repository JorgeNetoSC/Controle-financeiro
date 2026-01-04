"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FileText, Users, Video, FolderOpen, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/artigos", label: "Artigos", icon: FileText },
  { href: "/admin/artistas", label: "Artistas", icon: Users },
  { href: "/admin/videos", label: "Vídeos", icon: Video },
  { href: "/admin/categorias", label: "Categorias", icon: FolderOpen },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-black border-r border-zinc-800 p-4 space-y-8">
      <div>
        <div className="text-2xl font-black text-red-600 tracking-tighter mb-1">
          BREGA<span className="text-white">PE</span>
        </div>
        <p className="text-xs text-zinc-500 uppercase tracking-wide">Admin</p>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm font-medium",
              pathname === item.href ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800",
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="pt-8 border-t border-zinc-800">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg transition text-sm font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 w-full">
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  )
}
