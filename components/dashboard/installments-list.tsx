"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Layers, Trash2, MoreVertical, Loader2, Calendar, AlertCircle } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchInstallments = useCallback(async () => {
    try {
      setLoading(true)

      // 1. Buscamos carnês e categorias separadamente para evitar erro de relacionamento (Join)
      const [instRes, catsRes] = await Promise.all([
        supabase
          .from("installments")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("categories")
          .select("id, name, color")
      ])

      if (instRes.error) throw instRes.error

      // 2. Mesclamos os dados no Front-end
      const enrichedData = (instRes.data || []).map(inst => ({
        ...inst,
        category: catsRes.data?.find(c => c.id === inst.category_id) || { name: 'Geral', color: '#888' }
      }))

      setInstallments(enrichedData)
    } catch (error: any) {
      console.error("Erro ao carregar carnês:", error.message)
      toast({ 
        title: "Erro na listagem", 
        description: "Não foi possível carregar suas parcelas.",
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }, [userId, supabase, toast])

  useEffect(() => {
    if (userId) {
      fetchInstallments()
    }
  }, [userId, fetchInstallments])

  const handleDelete = async (id: string) => {
    if (!confirm("Isso excluirá o carnê completo e todas as suas parcelas. Deseja continuar?")) return

    try {
      const { error } = await supabase.from("installments").delete().eq("id", id)
      if (error) throw error

      setInstallments(prev => prev.filter(i => i.id !== id))
      
      if (onSuccess) onSuccess()
      
      toast({ title: "Carnê excluído com sucesso!" })
    } catch (e: any) {
      toast({ 
        title: "Erro ao excluir", 
        description: e.message, 
        variant: "destructive" 
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-blue-500" size={40} />
        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Sincronizando Carnês...</p>
      </div>
    )
  }

  if (installments.length === 0) {
    return (
      <div className="bg-[#161b22] border-2 border-dashed border-gray-800 rounded-[32px] p-16 text-center">
        <AlertCircle className="mx-auto text-gray-700 mb-4" size={48} />
        <h3 className="text-white font-black text-xl italic uppercase tracking-tighter">Nenhum Carnê Ativo</h3>
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
        {installments.map((inst) => (
          <div 
            key={inst.id} 
            className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-[#0d1117] rounded-2xl border border-gray-800 hover:border-blue-500/30 transition-all group gap-4"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                inst.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                <Layers size={22} />
              </div>
              <div>
                <p className="text-white font-bold text-sm uppercase tracking-tight">
                  {inst.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-blue-400 text-[10px] font-black uppercase tracking-tighter">
                    {inst.category?.name}
                  </span>
                  <span className="text-gray-700 text-[10px]">•</span>
                  <span className="text-gray-500 text-[10px] font-bold uppercase">
                    {inst.installments_count} Parcelas
                  </span>
                  <span className="text-gray-700 text-[10px]">•</span>
                  <span className="flex items-center gap-1 text-gray-500 text-[10px] font-bold uppercase">
                    <Calendar size={10} /> 
                    Início: {format(new Date(inst.start_date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-gray-800">
              <div className="text-left md:text-right">
                <p className={`text-sm font-black ${inst.type === 'income' ? 'text-green-500' : 'text-white'}`}>
                  R$ {Number(inst.total_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Valor Total</p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-white rounded-full hover:bg-gray-800">
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
        ))}
      </div>
    </div>
  )
}