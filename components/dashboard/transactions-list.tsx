"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Pencil,
  Trash2,
} from "lucide-react"

interface TransactionsListProps {
  userId: string
}

export function TransactionsList({ userId }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [userId])

  // 🔹 BUSCAR TRANSAÇÕES
  const loadTransactions = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        *,
        accounts (name),
        categories (name, color)
      `)
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Erro ao carregar transações:", error)
    }

    setTransactions(data || [])
    setIsLoading(false)
  }

  // 🔹 DELETAR TRANSAÇÃO
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Deseja realmente excluir esta transação?")
    if (!confirmDelete) return

    const supabase = createClient()

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)

    if (error) {
      console.error("Erro ao excluir:", error)
      alert("Erro ao excluir transação")
      return
    }

    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  // 🔹 EDITAR (por enquanto só log – depois ligamos ao modal)
  const handleEdit = (transaction: any) => {
    console.log("Editar transação:", transaction)
    // aqui você vai abrir o modal de edição depois
  }
  

  if (isLoading) {
    return <div className="text-center text-slate-400">Carregando transações...</div>
  }

  return (
    <Card className="border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Todas as Transações
      </h2>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="group flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-800/50 p-4 transition hover:bg-slate-800 sm:flex-row sm:items-center sm:justify-between"
          >
            {/* ESQUERDA */}
            <div className="flex items-center gap-4">
              <div
                className={`rounded-full p-2 ${
                  transaction.type === "income"
                    ? "bg-green-600/20"
                    : "bg-red-600/20"
                }`}
              >
                {transaction.type === "income" ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-red-500" />
                )}
              </div>

              <div>
                <p className="font-medium text-white">
                  {transaction.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {format(new Date(transaction.date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                  <span>•</span>
                  <span>{transaction.accounts?.name}</span>

                  {transaction.categories && (
                    <>
                      <span>•</span>
                      <Badge
                        variant="outline"
                        className="border-slate-700"
                        style={{
                          borderColor: transaction.categories.color,
                          color: transaction.categories.color,
                        }}
                      >
                        {transaction.categories.name}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* DIREITA */}
            <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
              <p
                className={`text-lg font-bold ${
                  transaction.type === "income"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {transaction.type === "income" ? "+" : "-"} R${" "}
                {Number(transaction.amount).toFixed(2)}
              </p>

              {/* AÇÕES */}
              <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEdit(transaction)}
                >
                  <Pencil className="h-4 w-4 text-slate-400 hover:text-white" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDelete(transaction.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-400 hover:text-red-500" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <p className="py-8 text-center text-slate-500">
            Nenhuma transação encontrada
          </p>
        )}
      </div>
    </Card>
  )
}
