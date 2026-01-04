"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Installment {
  installments_count: number
  id: string
  description: string
  total_amount: number
  installment_amount: number
  total_installments: number
  paid_installments: number
  start_date: string
  status: string
  frequency: string
}

interface InstallmentsListProps {
  userId: string
}

export function InstallmentsList({ userId }: InstallmentsListProps) {
  const [installments, setInstallments] = useState<Installment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadInstallments()
  }, [userId])

  const loadInstallments = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("installments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setInstallments(data || [])
    } catch (error) {
      console.error("[v0] Error loading installments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-slate-400">Carregando...</div>
  }

  if (installments.length === 0) {
    return (
      <Card className="border-slate-800 bg-slate-900 p-6 text-center">
        <p className="text-slate-400">Nenhuma parcela encontrada</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {installments.map((installment) => {
        const progress = (installment.paid_installments / installment.total_installments) * 100

        return (
          <Card key={installment.id} className="border-slate-800 bg-slate-900 p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{installment.description}</h3>
                  <Badge
                    variant={installment.status === "active" ? "default" : "secondary"}
                    className={
                      installment.status === "active" ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300"
                    }
                  >
                    {installment.status === "active" ? "Ativa" : "Concluída"}
                  </Badge>
                </div>

                <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                  <span>
                    {installment.paid_installments}/{installment.total_installments} parcelas
                  </span>
                  <span>
  R$ {(installment.total_amount / installment.installments_count).toFixed(2)} por parcela
</span>

                  <span className="capitalize">
                    {installment.frequency === "monthly" ? "Mensal" : installment.frequency}
                  </span>
                </div>

                <div className="mt-4">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>

              <div className="text-right">
                <p className="text-2xl font-bold text-white">R$ {installment.total_amount.toFixed(2)}</p>
                <p className="text-sm text-slate-400">Total</p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
