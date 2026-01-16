"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react"
import { getMonthlyTotals } from "@/lib/finance/get-monthly-totals"
import { format, addMonths, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"

export function FutureFlow({ userId }: { userId: string }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [totals, setTotals] = useState({ income: 0, expense: 0 })

  useEffect(() => {
    async function load() {
      const data = await getMonthlyTotals(userId, currentDate)
      setTotals(data)
    }
    load()
  }, [currentDate, userId])

  return (
    <Card className="bg-slate-900 border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold">Projeção Mensal</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4 text-slate-400" />
          </Button>
          <span className="text-sm text-white font-medium capitalize w-32 text-center">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-slate-800/40 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <TrendingUp className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase">Receitas Previstas</span>
          </div>
          <p className="text-xl font-black text-white">R$ {totals.income.toLocaleString('pt-BR')}</p>
        </div>

        <div className="p-4 bg-slate-800/40 rounded-lg border border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <TrendingDown className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase">Despesas Previstas</span>
          </div>
          <p className="text-xl font-black text-white">R$ {totals.expense.toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </Card>
  )
}