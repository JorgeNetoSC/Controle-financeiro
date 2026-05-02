"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Layers, Trash2, MoreVertical, Loader2,
  Calendar, AlertCircle, ChevronDown, ChevronUp,
  CheckCircle2, Clock, CircleDollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface InstallmentsListProps {
  userId: string
  onSuccess?: () => void
}

export function InstallmentsList({ userId, onSuccess }: InstallmentsListProps) {
  const [installments, setInstallments] = useState<any[]>([])
  const [itemsMap, setItemsMap] = useState<Record<string, any[]>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [paying, setPaying] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchInstallments = useCallback(async () => {
    try {
      setLoading(true)

      const [instRes, catsRes, itemsRes] = await Promise.all([
        supabase
          .from("installments")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("id, name, color"),
        supabase
          .from("installment_items")
          .select("*")
          .eq("user_id", userId)
          .order("due_date", { ascending: true }),
      ])

      if (instRes.error) throw instRes.error

      const enrichedData = (instRes.data || []).map((inst) => ({
        ...inst,
        category:
          catsRes.data?.find((c) => c.id === inst.category_id) ||
          { name: "Geral", color: "#888" },
      }))

      // Agrupa parcelas por installment_id
      const grouped: Record<string, any[]> = {}
      for (const item of itemsRes.data || []) {
        if (!grouped[item.installment_id]) grouped[item.installment_id] = []
        grouped[item.installment_id].push(item)
      }

      setInstallments(enrichedData)
      setItemsMap(grouped)
    } catch (error: any) {
      console.error("Erro ao carregar carnês:", error.message)
      toast({
        title: "Erro na listagem",
        description: "Não foi possível carregar suas parcelas.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) fetchInstallments()
  }, [userId, fetchInstallments])

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // ── Marcar parcela como paga ───────────────────────────────────────────────
  const handlePayItem = async (item: any, inst: any) => {
    if (item.status === "paid") return
    setPaying(item.id)

    try {
      // 1. Atualiza o status da parcela
      const { error: itemError } = await supabase
        .from("installment_items")
        .update({
          status: "paid",
          paid: true,
        })
        .eq("id", item.id)

      if (itemError) throw itemError

      // 2. Incrementa paid_installments no carnê
      const { error: instError } = await supabase
        .from("installments")
        .update({
          paid_installments: (inst.paid_installments || 0) + 1,
          // Se todas foram pagas, marca o carnê como concluído
          status:
            (inst.paid_installments || 0) + 1 >= inst.installments_count
              ? "completed"
              : "active",
        })
        .eq("id", inst.id)

      if (instError) throw instError

      // 3. Desconta do saldo da conta
      const { data: account } = await supabase
        .from("accounts")
        .select("id, balance")
        .eq("user_id", userId)
        .limit(1)
        .single()

      if (account) {
        await supabase.rpc("update_account_balance", {
          account_uuid: account.id,
          amount_change: inst.type === "expense"
            ? -Number(item.amount)
            : Number(item.amount),
        })
      }

      // 4. Atualiza estado local sem refetch
      setItemsMap((prev) => ({
        ...prev,
        [inst.id]: prev[inst.id].map((i) =>
          i.id === item.id ? { ...i, status: "paid", paid: true } : i
        ),
      }))

      setInstallments((prev) =>
        prev.map((i) =>
          i.id === inst.id
            ? {
                ...i,
                paid_installments: (i.paid_installments || 0) + 1,
                status:
                  (i.paid_installments || 0) + 1 >= i.installments_count
                    ? "completed"
                    : "active",
              }
            : i
        )
      )

      toast({ title: `✅ Parcela ${item.installment_number} marcada como paga!` })
      onSuccess?.()
    } catch (e: any) {
      toast({ title: "Erro ao pagar parcela", description: e.message, variant: "destructive" })
    } finally {
      setPaying(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Isso excluirá o carnê completo e todas as suas parcelas. Deseja continuar?")) return

    try {
      const { error } = await supabase.from("installments").delete().eq("id", id)
      if (error) throw error

      setInstallments((prev) => prev.filter((i) => i.id !== id))
      onSuccess?.()
      toast({ title: "Carnê excluído com sucesso!" })
    } catch (e: any) {
      toast({ title: "Erro ao excluir", description: e.message, variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">
          Sincronizando Carnês...
        </p>
      </div>
    )
  }

  if (installments.length === 0) {
    return (
      <div className="bg-[#161b22] border-2 border-dashed border-gray-800 rounded-[32px] p-16 text-center">
        <AlertCircle className="mx-auto text-gray-700 mb-4" size={48} />
        <h3 className="text-white font-black text-xl italic uppercase tracking-tighter">
          Nenhum Carnê Ativo
        </h3>
        <p className="text-gray-500 text-sm mt-2 max-w-xs mx-auto">
          Suas compras parceladas cadastradas aparecerão nesta lista.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#161b22] border border-gray-800 rounded-[32px] p-8 shadow-2xl animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
          Gerenciador de Carnês
        </h3>
        <div className="px-4 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
          <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest">
            {installments.length} Ativos
          </span>
        </div>
      </div>

      <div className="grid gap-4">
        {installments.map((inst) => {
          const items = itemsMap[inst.id] || []
          const paidCount = items.filter((i) => i.status === "paid").length
          const totalCount = items.length || inst.installments_count
          const progress = totalCount > 0 ? (paidCount / totalCount) * 100 : 0
          const isExpanded = expanded[inst.id]
          const nextPending = items.find((i) => i.status === "pending")

          return (
            <div
              key={inst.id}
              className="bg-[#0d1117] rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all overflow-hidden"
            >
              {/* Cabeçalho do carnê */}
              <div className="flex flex-col md:flex-row md:items-center justify-between p-5 gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    inst.type === "income"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}>
                    <Layers size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm uppercase tracking-tight truncate">
                      {inst.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-blue-400 text-[10px] font-black uppercase">
                        {inst.category?.name}
                      </span>
                      <span className="text-gray-700 text-[10px]">•</span>
                      <span className="text-gray-500 text-[10px] font-bold uppercase">
                        {paidCount}/{totalCount} pagas
                      </span>
                      {nextPending && (
                        <>
                          <span className="text-gray-700 text-[10px]">•</span>
                          <span className="flex items-center gap-1 text-amber-500/80 text-[10px] font-bold uppercase">
                            <Clock size={10} />
                            Próxima: {format(new Date(nextPending.due_date + "T12:00:00"), "dd/MM/yy", { locale: ptBR })}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Barra de progresso */}
                    <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-gray-800">
                  <div className="text-left md:text-right">
                    <p className={`text-sm font-black ${inst.type === "income" ? "text-green-500" : "text-white"}`}>
                      R$ {Number(inst.total_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                      Valor Total
                    </p>
                  </div>

                  {/* Botão expandir */}
                  <button
                    onClick={() => toggleExpand(inst.id)}
                    className="text-gray-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-gray-800"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-gray-500 hover:text-white rounded-full hover:bg-gray-800"
                      >
                        <MoreVertical size={20} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1c2128] border-gray-800 text-white shadow-2xl">
                      <DropdownMenuItem
                        onClick={() => handleDelete(inst.id)}
                        className="text-red-500 font-bold cursor-pointer focus:bg-red-500/10 focus:text-red-500"
                      >
                        <Trash2 size={16} className="mr-2" /> Excluir Carnê
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Lista de parcelas expandida */}
              {isExpanded && (
                <div className="border-t border-gray-800 px-5 pb-5">
                  <div className="grid gap-2 mt-4">
                    {items.length === 0 ? (
                      <p className="text-gray-600 text-xs text-center py-4">
                        Nenhuma parcela encontrada
                      </p>
                    ) : (
                      items.map((item) => {
                        const isPaid = item.status === "paid"
                        const isPayingThis = paying === item.id

                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                              isPaid
                                ? "bg-green-950/20 border border-green-900/30"
                                : "bg-[#161b22] border border-gray-800"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isPaid ? (
                                <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                              ) : (
                                <Clock size={16} className="text-amber-500/60 shrink-0" />
                              )}
                              <div>
                                <p className={`text-xs font-bold uppercase ${isPaid ? "text-gray-500 line-through" : "text-white"}`}>
                                  Parcela {item.installment_number}/{totalCount}
                                </p>
                                <p className="text-[10px] text-gray-600 font-bold uppercase flex items-center gap-1">
                                  <Calendar size={9} />
                                  {format(new Date(item.due_date + "T12:00:00"), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <p className={`text-sm font-black ${isPaid ? "text-gray-500" : "text-white"}`}>
                                R$ {Number(item.amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>

                              {!isPaid && (
                                <button
                                  onClick={() => handlePayItem(item, inst)}
                                  disabled={isPayingThis}
                                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all active:scale-95"
                                >
                                  {isPayingThis ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <CircleDollarSign size={12} />
                                  )}
                                  Pagar
                                </button>
                              )}

                              {isPaid && (
                                <span className="text-green-600 text-[10px] font-black uppercase tracking-wider">
                                  Pago ✓
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}