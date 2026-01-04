import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import type { Transaction } from "./types"

interface SummaryCardsProps {
  transactions: Transaction[]
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === "income") {
        acc.income += t.amount
      } else {
        acc.expense += t.amount
      }
      return acc
    },
    { income: 0, expense: 0 },
  )

  const balance = totals.income - totals.expense

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="text-white" size={24} />
          <span className="text-white font-semibold text-lg">Receitas</span>
        </div>
        <p className="text-3xl font-bold text-white">R$ {totals.income.toFixed(2)}</p>
        <p className="text-green-100 text-sm mt-1">Este mês</p>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="text-white" size={24} />
          <span className="text-white font-semibold text-lg">Despesas</span>
        </div>
        <p className="text-3xl font-bold text-white">R$ {totals.expense.toFixed(2)}</p>
        <p className="text-red-100 text-sm mt-1">Este mês</p>
      </div>

      <div
        className={`bg-gradient-to-br ${balance >= 0 ? "from-blue-500 to-indigo-600" : "from-orange-500 to-amber-600"} p-6 rounded-2xl shadow-2xl`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="text-white" size={24} />
          <span className="text-white font-semibold text-lg">Saldo</span>
        </div>
        <p className="text-3xl font-bold text-white">R$ {balance.toFixed(2)}</p>
        <p className={`${balance >= 0 ? "text-blue-100" : "text-orange-100"} text-sm mt-1`}>
          {balance >= 0 ? "Positivo" : "Negativo"}
        </p>
      </div>
    </div>
  )
}
