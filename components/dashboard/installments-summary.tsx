"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Wallet, CheckCircle2, Clock } from "lucide-react"

export function InstallmentsSummary({ installments }: { installments: any[] }) {
  const total = installments.reduce((acc, i) => acc + (i.total_amount || 0), 0)
  const pago = installments.reduce((acc, i) => {
    const valorParc = i.total_amount / (i.installments_count || 1)
    return acc + (valorParc * (i.paid_installments || 0))
  }, 0)
  
  const restante = total - pago
  const progresso = total > 0 ? (pago / total) * 100 : 0

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm font-medium">Total Geral</span>
          <Wallet className="h-4 w-4 text-blue-500" />
        </div>
        <p className="text-2xl font-bold text-white">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </Card>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm font-medium">Total Pago</span>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </div>
        <p className="text-2xl font-bold text-green-400">R$ {pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      </Card>

      <Card className="bg-slate-900 border-slate-800 p-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm font-medium">Restante</span>
          <Clock className="h-4 w-4 text-amber-500" />
        </div>
        <p className="text-2xl font-bold text-white">R$ {restante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <Progress value={progresso} className="h-1.5 mt-4 bg-slate-800" />
      </Card>
    </div>
  )
}