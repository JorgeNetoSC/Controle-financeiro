"use client"

import { Wallet, DollarSign, BarChart3, Target, CreditCard } from "lucide-react"

const tabs = [
  { id: "dashboard", label: "Início", icon: Wallet },
  { id: "transactions", label: "Transações", icon: DollarSign },
  { id: "analytics", label: "Análises", icon: BarChart3 },
  { id: "goals", label: "Metas", icon: Target },
  { id: "cards", label: "Cartões", icon: CreditCard },
]

interface NavigationTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function NavigationTabs({ activeTab, setActiveTab }: NavigationTabsProps) {
  return (
    <div className="bg-black bg-opacity-20 backdrop-blur-lg border-b border-white border-opacity-10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition whitespace-nowrap ${
                  activeTab === tab.id ? "text-white border-b-2 border-purple-500" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
