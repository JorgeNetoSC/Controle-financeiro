"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ReceiptText, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  MoreVertical 
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function TransactionsList({ 
  transactions, 
  onRefresh 
}: { 
  transactions: any[], 
  onRefresh?: () => void 
}) {
  const { toast } = useToast()
  const supabase = createClient()

  // Função para alternar entre pago e pendente (Apenas para parcelas)
  const toggleStatus = async (id: string, currentStatus: string, isInstallment: boolean) => {
    if (!isInstallment) return

    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid'

    try {
      const { error } = await supabase
        .from('installment_items')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      toast({ title: `Status: ${newStatus === 'paid' ? 'Pago' : 'Pendente'}` })
      if (onRefresh) onRefresh()
    } catch (err) {
      toast({ title: "Erro ao atualizar status", variant: "destructive" })
    }
  }

  // FUNÇÃO DE EXCLUSÃO
  const handleDelete = async (item: any) => {
    const confirmMsg = item.isInstallment 
      ? "Excluir apenas esta parcela? O restante do carnê continuará existindo."
      : "Deseja excluir esta transação?"
    
    if (!confirm(confirmMsg)) return

    try {
      const table = item.isInstallment ? 'installment_items' : 'transactions'
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', item.id)

      if (error) throw error

      toast({ title: "Excluído com sucesso!" })
      if (onRefresh) onRefresh() // Atualiza o Dashboard automaticamente
    } catch (err: any) {
      toast({ 
        title: "Erro ao excluir", 
        description: err.message, 
        variant: "destructive" 
      })
    }
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-2xl">
        <ReceiptText className="mx-auto text-gray-700 mb-2" size={40} />
        <p className="text-gray-500 font-medium italic uppercase text-xs tracking-widest">
          Sem movimentações neste período
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((t) => (
        <div 
          key={t.id} 
          className={`flex items-center justify-between p-4 bg-[#0d1117] rounded-2xl border transition-all group ${
            t.status === 'paid' ? 'border-green-500/20 opacity-80' : 'border-gray-800 hover:border-gray-700'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Ícone Interativo ou Fixo */}
            {t.isInstallment ? (
              <button 
                onClick={() => toggleStatus(t.id, t.status, true)}
                className={`transition-colors ${t.status === 'paid' ? 'text-green-500' : 'text-gray-600 hover:text-white'}`}
              >
                {t.status === 'paid' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
            ) : (
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
              </div>
            )}

            <div>
              <p className={`text-sm font-bold uppercase tracking-tight leading-none mb-1 ${
                t.status === 'paid' ? 'text-gray-400 line-through' : 'text-white'
              }`}>
                {t.description}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 uppercase tracking-tighter">
                  {t.category_name}
                </span>
                {t.isInstallment && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                    t.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                  }`}>
                    Parcela
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className={`text-sm font-black ${
                t.type === 'income' ? 'text-green-500' : (t.status === 'paid' ? 'text-gray-400' : 'text-white')
              }`}>
                {t.type === 'income' ? '+' : '-'} R$ {Number(t.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-gray-500 font-medium uppercase">
                {format(new Date(t.date + 'T12:00:00'), "dd MMM", { locale: ptBR })}
              </p>
            </div>

            {/* MENU DE AÇÕES (EXCLUIR) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white rounded-full">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1c2128] border-gray-800 text-white shadow-2xl">
                <DropdownMenuItem 
                  onClick={() => handleDelete(t)} 
                  className="text-red-500 font-bold cursor-pointer focus:bg-red-500/10 focus:text-red-500"
                >
                  <Trash2 size={16} className="mr-2" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}