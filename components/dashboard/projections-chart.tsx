"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { format, addMonths, startOfMonth } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ProjectionsChartProps {
  userId: string
}

interface MonthlyProjection {
  month: string
  income: number
  expenses: number
  balance: number
}

export function ProjectionsChart({ userId }: ProjectionsChartProps) {
  const [projections, setProjections] = useState<MonthlyProjection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProjections()
  }, [userId])

  const loadProjections = async () => {
    try {
      const supabase = createClient()
      const startDate = startOfMonth(new Date())
      const monthsToProject = 6

      const projectionData: MonthlyProjection[] = []

      for (let i = 0; i < monthsToProject; i++) {
        const currentMonth = addMonths(startDate, i)
        const monthStart = format(currentMonth, "yyyy-MM-01")
        const monthEnd = format(addMonths(currentMonth, 1), "yyyy-MM-01")

        // Get transactions for the month
        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", userId)
          .gte("date", monthStart)
          .lt("date", monthEnd)

        let income = 0
        let expenses = 0

        transactions?.forEach((t) => {
          if (t.type === "income") {
            income += Number.parseFloat(t.amount.toString())
          } else {
            expenses += Number.parseFloat(t.amount.toString())
          }
        })

        projectionData.push({
          month: format(currentMonth, "MMM/yy", { locale: ptBR }),
          income,
          expenses,
          balance: income - expenses,
        })
      }

      setProjections(projectionData)
    } catch (error) {
      console.error("[v0] Error loading projections:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-slate-400">Carregando projeções...</div>
  }

  const maxValue = Math.max(...projections.map((p) => Math.max(p.income, p.expenses)))

  return (
    <Card className="border-slate-800 bg-slate-900 p-6">
      <h3 className="mb-6 text-lg font-semibold text-white">Projeção dos Próximos Meses</h3>

      <div className="space-y-6">
        {projections.map((projection, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-white">{projection.month}</span>
              <div className="flex gap-4 text-xs">
                <span className="text-green-400">+R$ {projection.income.toFixed(2)}</span>
                <span className="text-red-400">-R$ {projection.expenses.toFixed(2)}</span>
                <span className={projection.balance >= 0 ? "text-green-400" : "text-red-400"}>
                  {projection.balance >= 0 ? "+" : ""}R$ {projection.balance.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="relative h-8 overflow-hidden rounded-lg bg-slate-800">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600"
                style={{ width: `${(projection.income / maxValue) * 50}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-600"
                style={{ width: `${(projection.expenses / maxValue) * 50}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
