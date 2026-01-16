import { TrendingUp, TrendingDown } from "lucide-react"
import type { Transaction } from "./types"

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Transações Recentes</h2>
      {transactions.length > 0 ? (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-black bg-opacity-30 p-4 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${transaction.type === "income" ? "bg-green-500 bg-opacity-20" : "bg-red-500 bg-opacity-20"}`}
                >
                  {transaction.type === "income" ? (
                    <TrendingUp className="text-green-400" size={20} />
                  ) : (
                    <TrendingDown className="text-red-400" size={20} />
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold">{transaction.description}</p>
                  <p className="text-gray-400 text-sm">{transaction.category}</p>
                </div>
              </div>
              <span
                className={`text-lg font-bold ${transaction.type === "income" ? "text-green-400" : "text-red-400"}`}
              >
                {transaction.type === "income" ? "+" : "-"} R$ {transaction.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">Nenhuma transação ainda</p>
      )}
    </div>
  )
}
