"use client"

import { Plus, DollarSign, TrendingUp, TrendingDown, X, Tag, Calendar } from "lucide-react"
import type { Transaction } from "./types"

interface TransactionsTabProps {
  transactions: Transaction[]
  setShowModal: (modal: string | null) => void
  deleteTransaction: (id: number) => void
}

export function TransactionsTab({ transactions, setShowModal, deleteTransaction }: TransactionsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Todas as Transações</h2>
        <button
          onClick={() => setShowModal("transaction")}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition"
        >
          <Plus size={20} />
          Nova Transação
        </button>
      </div>

      <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-6">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-400">Nenhuma transação registrada</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-black bg-opacity-30 p-4 rounded-xl flex items-center justify-between hover:bg-opacity-40 transition"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`p-3 rounded-lg ${transaction.type === "income" ? "bg-green-500 bg-opacity-20" : "bg-red-500 bg-opacity-20"}`}
                  >
                    {transaction.type === "income" ? (
                      <TrendingUp className="text-green-400" size={24} />
                    ) : (
                      <TrendingDown className="text-red-400" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-lg">{transaction.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Tag size={14} />
                        {transaction.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(transaction.date).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`text-xl font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}
                  >
                    {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteTransaction(transaction.id)}
                    className="text-gray-400 hover:text-red-400 transition"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
