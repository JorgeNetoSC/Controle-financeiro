"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardContent } from "./dashboard-content"
import { TransactionModal } from "./transaction-modal"
import { LayoutDashboard, Receipt, PieChart, Plus } from "lucide-react"

interface DashboardLayoutProps {
  user: User
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const [activeTab, setActiveTab] = useState('geral')
  const [selectedAccount, setSelectedAccount] = useState("Todos")
  const [dateRange, setDateRange] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  })

  return (
    <div className="flex min-h-screen bg-[#0d1117] text-white">
      {/* SIDEBAR: Visível apenas no Desktop (md) */}
      <aside className="hidden md:flex w-64 border-r border-gray-800 flex-col sticky top-0 h-screen bg-[#0d1117]">
        <DashboardSidebar
          selectedAccount={selectedAccount}
          setSelectedAccount={setSelectedAccount}
          dateRange={dateRange}
          setDateRange={setDateRange}
          actions={
            <div className="mt-4 px-2">
              <TransactionModal userId={user.id} onSuccess={() => window.location.reload()} />
            </div>
          }
        />
      </aside>

      {/* CONTEÚDO: Padding de 80px embaixo no mobile para não cobrir a barra */}
      <main className="flex-1 overflow-y-auto">
        <DashboardContent 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </main>

      {/* BOTTOM NAV: Visível apenas no Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161b22]/95 backdrop-blur-md border-t border-gray-800 px-6 py-3 z-50">
        <div className="flex justify-between items-center max-w-md mx-auto relative">
          
          <button 
            onClick={() => setActiveTab('geral')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'geral' ? 'text-blue-400 scale-110' : 'text-gray-500'}`}
          >
            <LayoutDashboard size={22} />
            <span className="text-[10px] font-medium">Início</span>
          </button>

          <button 
            onClick={() => setActiveTab('transacoes')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'transacoes' ? 'text-blue-400 scale-110' : 'text-gray-500'}`}
          >
            <Receipt size={22} />
            <span className="text-[10px] font-medium">Extrato</span>
          </button>

          {/* Botão Flutuante Central no Mobile */}
<div className="relative -top-8 z-50">
  <TransactionModal 
    userId={user.id} 
    onSuccess={() => window.location.reload()}
    trigger={
      <div className="bg-blue-600 p-4 rounded-full border-4 border-[#0d1117] shadow-[0_4px_20px_rgba(0,0,0,0.5)] active:scale-95 transition-all cursor-pointer">
        <Plus size={28} className="text-white" strokeWidth={3} />
      </div>
    }
  />
</div>

          <button 
            onClick={() => setActiveTab('parcelas')}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'parcelas' ? 'text-blue-400 scale-110' : 'text-gray-500'}`}
          >
            <PieChart size={22} />
            <span className="text-[10px] font-medium">Parcelas</span>
          </button>

          <button className="flex flex-col items-center gap-1 text-gray-500">
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] font-medium">Perfil</span>
          </button>

        </div>
      </nav>
    </div>
  )
}