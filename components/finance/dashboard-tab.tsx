"use client"

import { Plus, Target, CreditCard, BarChart3 } from "lucide-react"
import { SummaryCards } from "./summary-cards"
import { RecentTransactions } from "./recent-transactions"
import type { Transaction } from "./types"

interface DashboardTabProps {
  transactions: Transaction[]
  setShowModal: (modal: string | null) => void
  setActiveTab: (tab: string) => void
  deleteTransaction: (id: number) => void
}

export function DashboardTab({ transactions, setShowModal, setActiveTab, deleteTransaction }: DashboardTabProps) {
  return (
    <div className="space-y-6">
      <SummaryCards transactions={transactions} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setShowModal("transaction")}
          className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 p-6 rounded-xl hover:bg-opacity-20 transition"
        >
          <Plus className="text-purple-400 mx-auto mb-2" size={32} />
          <p className="text-white font-semibold">Nova Transação</p>
        </button>
        <button
          onClick={() => setShowModal("goal")}
          className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 p-6 rounded-xl hover:bg-opacity-20 transition"
        >
          <Target className="text-purple-400 mx-auto mb-2" size={32} />
          <p className="text-white font-semibold">Nova Meta</p>
        </button>
        <button
          onClick={() => setShowModal("card")}
          className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 p-6 rounded-xl hover:bg-opacity-20 transition"
        >
          <CreditCard className="text-purple-400 mx-auto mb-2" size={32} />
          <p className="text-white font-semibold">Novo Cartão</p>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 p-6 rounded-xl hover:bg-opacity-20 transition"
        >
          <BarChart3 className="text-purple-400 mx-auto mb-2" size={32} />
          <p className="text-white font-semibold">Ver Análises</p>
        </button>
      </div>

      <RecentTransactions transactions={transactions.slice(0, 5)} />
    </div>
  )
}
