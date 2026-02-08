"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardContent } from "./dashboard-content"
import { TransactionModal } from "./transaction-modal"
import { Button } from "@/components/ui/button"
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
    <div className="flex min-h-screen bg-[#0d1117] text-white font-sans">
      {/* SIDEBAR DESKTOP */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        dateRange={dateRange}
        setDateRange={setDateRange}
        actions={
          <TransactionModal 
            userId={user.id} 
            onSuccess={() => window.location.reload()} 
            trigger={
              <Button className="w-full bg-blue-600 hover:bg-blue-700 h-11">
                <Plus size={20} className="mr-2" />
                <span>Nova Transação</span>
              </Button>
            }
          />
        }
      />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <DashboardContent 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </main>

      {/* NAVEGAÇÃO MOBILE */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161b22]/95 backdrop-blur-md border-t border-gray-800 px-6 py-3 z-50">
        <div className="flex justify-between items-center max-w-md mx-auto relative">
          
          <button onClick={() => setActiveTab('geral')} className={`flex flex-col items-center gap-1 ${activeTab === 'geral' ? 'text-blue-400' : 'text-gray-500'}`}>
            <LayoutDashboard size={22} />
            <span className="text-[10px]">Início</span>
          </button>

          <button onClick={() => setActiveTab('transacoes')} className={`flex flex-col items-center gap-1 ${activeTab === 'transacoes' ? 'text-blue-400' : 'text-gray-500'}`}>
            <Receipt size={22} />
            <span className="text-[10px]">Extrato</span>
          </button>

          {/* Botão Flutuante Central */}
          <div className="relative -top-8">
            <TransactionModal 
              userId={user.id} 
              onSuccess={() => window.location.reload()}
              trigger={
                <div className="bg-blue-600 p-4 rounded-full border-4 border-[#0d1117] shadow-xl active:scale-95 transition-all cursor-pointer">
                  <Plus size={28} className="text-white" strokeWidth={3} />
                </div>
              }
            />
          </div>

          <button onClick={() => setActiveTab('parcelas')} className={`flex flex-col items-center gap-1 ${activeTab === 'parcelas' ? 'text-blue-400' : 'text-gray-500'}`}>
            <PieChart size={22} />
            <span className="text-[10px]">Parcelas</span>
          </button>

          <div className="flex flex-col items-center gap-1 text-gray-500">
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px]">Perfil</span>
          </div>
        </div>
      </nav>
    </div>
  )
}