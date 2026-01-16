"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, RefreshCw, CreditCard } from "lucide-react"
import { InstallmentDetailsModal } from "./installment-details-modal" // Certifique-se de que o nome do arquivo bate

interface Installment {
  id: string
  description: string
  total_amount: number
  installments_count: number
  paid_installments: number
  start_date: string
  status: string
  frequency: string
  type: "income" | "expense"
  account_id: string
}

interface InstallmentsListProps {
  userId: string
}

export function InstallmentsList({ userId }: InstallmentsListProps) {
  const [installments, setInstallments] = useState<Installment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null)

  useEffect(() => {
    loadInstallments()
  }, [userId])

  const loadInstallments = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from("installments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setInstallments(data || [])
    } catch (error) {
      console.error("Erro ao carregar parcelas:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-slate-400">
        <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
        Carregando parcelamentos...
      </div>
    )
  }

  if (installments.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900 p-10 text-center">
        <p className="text-slate-400">Nenhum parcelamento ativo encontrado.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {installments.map((installment) => {
        // Cálculo de progresso e valores
        const total = installment.installments_count || 1
        const paid = installment.paid_installments || 0
        const progress = (paid / total) * 100
        const installmentValue = installment.total_amount / total

        return (
          <Card 
            key={installment.id} 
            onClick={() => setSelectedInstallment(installment)}
            className="border-slate-800 bg-slate-900 p-5 transition-all hover:border-blue-600/50 hover:bg-slate-800/50 cursor-pointer group"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                    {installment.description}
                  </h3>
                  <Badge
                    className={
                      installment.status === "active" 
                        ? "bg-blue-600/20 text-blue-400 border-blue-600/30" 
                        : "bg-green-600/20 text-green-400 border-green-600/30"
                    }
                  >
                    {installment.status === "active" ? "Em andamento" : "Concluído"}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{paid}/{total} parcelas pagas</span>
                  </div>
                  
                  <div className="flex items-center gap-1 font-medium">
                    <CreditCard className="h-4 w-4" />
                    <span className={installment.type === "income" ? "text-green-400" : "text-red-400"}>
                      R$ {installmentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-slate-500 text-xs lowercase">/{installment.frequency === "monthly" ? "mês" : "semana"}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    <span>Progresso de quitação</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5 bg-slate-800" />
                </div>
              </div>

              <div className="flex flex-col items-end justify-center border-t border-slate-800 pt-4 sm:border-0 sm:pt-0">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Valor Total</p>
                <p className={`text-2xl font-black ${installment.type === "income" ? "text-green-400" : "text-white"}`}>
                  R$ {installment.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-blue-500 font-bold mt-1 group-hover:underline">Ver detalhes e pagar</p>
              </div>
            </div>
          </Card>
        )
      })}

      {/* Modal que abre ao clicar no Card */}
      <InstallmentDetailsModal
        installment={selectedInstallment}
        open={!!selectedInstallment}
        onOpenChange={() => setSelectedInstallment(null)}
        onSuccess={loadInstallments}
      />
    </div>
  )
}