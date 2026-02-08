"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Receipt, PieChart, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  selectedAccount: string
  setSelectedAccount: (account: string) => void
  dateRange: { from: string; to: string }
  setDateRange: (range: any) => void
  actions?: React.ReactNode
}

export function DashboardSidebar({ 
  activeTab, 
  setActiveTab, 
  actions 
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col bg-[#0d1117] border-r border-gray-800 transition-all duration-300 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 h-6 w-6 rounded-full border border-gray-700 bg-[#0d1117] z-50 shadow-sm text-white hover:bg-gray-800"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>

      <div className={cn("p-6 flex items-center gap-3", isCollapsed && "justify-center")}>
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center">
          <Receipt className="text-white h-5 w-5" />
        </div>
        {!isCollapsed && <span className="text-xl font-black tracking-tighter text-white">FINTRACK</span>}
      </div>

      <nav className="flex-1 px-3 space-y-2 mt-4">
        <NavItem 
          icon={<LayoutDashboard size={20} />} 
          label="Início" 
          active={activeTab === 'geral'} 
          onClick={() => setActiveTab('geral')}
          collapsed={isCollapsed} 
        />
        <NavItem 
          icon={<Receipt size={20} />} 
          label="Extrato" 
          active={activeTab === 'transacoes'} 
          onClick={() => setActiveTab('transacoes')}
          collapsed={isCollapsed} 
        />
        <NavItem 
          icon={<PieChart size={20} />} 
          label="Parcelas" 
          active={activeTab === 'parcelas'} 
          onClick={() => setActiveTab('parcelas')}
          collapsed={isCollapsed} 
        />
      </nav>

      <div className="p-4 border-t border-gray-800">
        {actions}
      </div>
    </aside>
  )
}

function NavItem({ icon, label, active, onClick, collapsed }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-all group",
        active ? "bg-blue-600/20 text-blue-400" : "text-gray-400 hover:bg-gray-800",
        collapsed && "justify-center px-0"
      )}
    >
      {icon}
      {!collapsed && <span className="font-medium text-sm">{label}</span>}
    </button>
  )
}