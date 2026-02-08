"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"

interface SummaryData {
  balance: number
  income: number
  expense: number
}

export function SummaryCards({ data }: { data: SummaryData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Saldo Atual */}
      <Card className="bg-card border-none p-6 relative overflow-hidden shadow-xl group hover:bg-card/80 transition-all">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">
              Saldo Atual
            </p>
            <h2 className="text-3xl font-black text-white">
              R$ {data.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Wallet size={20} />
          </div>
        </div>
      </Card>

      {/* Entradas */}
      <Card className="bg-card border-none p-6 relative overflow-hidden shadow-xl group hover:bg-card/80 transition-all">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">
              Entradas
            </p>
            <h2 className="text-3xl font-black text-green-500">
              + R$ {data.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
            <TrendingUp size={20} />
          </div>
        </div>
      </Card>

      {/* Despesas */}
      <Card className="bg-card border-none p-6 relative overflow-hidden shadow-xl group hover:bg-card/80 transition-all">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest mb-1">
              Despesas
            </p>
            <h2 className="text-3xl font-black text-red-500">
              - R$ {data.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
            <TrendingDown size={20} />
          </div>
        </div>
      </Card>
    </div>
  )
}