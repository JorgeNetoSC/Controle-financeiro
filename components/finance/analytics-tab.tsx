import { PieChart, BarChart3 } from "lucide-react"
import type { Transaction } from "./types"

interface AnalyticsTabProps {
  transactions: Transaction[]
}

export function AnalyticsTab({ transactions }: AnalyticsTabProps) {
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

  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>,
    )

  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Análise Financeira</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="text-purple-400" size={24} />
            <h3 className="text-xl font-bold text-white">Gastos por Categoria</h3>
          </div>
          {topCategories.length > 0 ? (
            <div className="space-y-4">
              {topCategories.map(([category, amount]) => {
                const percentage = (amount / totals.expense) * 100
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white font-medium">{category}</span>
                      <span className="text-gray-400">R$ {amount.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-black bg-opacity-30 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <p className="text-gray-400 text-xs mt-1">{percentage.toFixed(1)}% do total</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Sem dados para análise</p>
          )}
        </div>

        <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-purple-400" size={24} />
            <h3 className="text-xl font-bold text-white">Resumo Financeiro</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-black bg-opacity-30 p-4 rounded-xl">
              <p className="text-gray-400 text-sm">Média de Gastos</p>
              <p className="text-2xl font-bold text-white">
                R${" "}
                {transactions.length > 0
                  ? (totals.expense / Math.max(1, transactions.filter((t) => t.type === "expense").length)).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="bg-black bg-opacity-30 p-4 rounded-xl">
              <p className="text-gray-400 text-sm">Maior Despesa</p>
              <p className="text-2xl font-bold text-white">
                R${" "}
                {transactions.filter((t) => t.type === "expense").length > 0
                  ? Math.max(...transactions.filter((t) => t.type === "expense").map((t) => t.amount)).toFixed(2)
                  : "0.00"}
              </p>
            </div>
            <div className="bg-black bg-opacity-30 p-4 rounded-xl">
              <p className="text-gray-400 text-sm">Total de Transações</p>
              <p className="text-2xl font-bold text-white">{transactions.length}</p>
            </div>
            <div className="bg-black bg-opacity-30 p-4 rounded-xl">
              <p className="text-gray-400 text-sm">Taxa de Poupança</p>
              <p className="text-2xl font-bold text-white">
                {totals.income > 0 ? ((balance / totals.income) * 100).toFixed(1) : "0"}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
