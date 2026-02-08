"use client"

import { TrendingUp, TrendingDown, Calendar, MoreVertical, Trash2, Edit2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  date: string
  category_name?: string
  account_id: string
}

export function TransactionsList({ transactions = [] }: { transactions?: Transaction[] }) {
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async (id: string, amount: number, type: string, accountId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta transação?")) return

    try {
      // 1. Deletar a transação
      const { error: deleteError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)

      if (deleteError) throw deleteError

      // 2. Estornar o valor do saldo da conta
      // Se era despesa, soma de volta. Se era receita, subtrai.
      const reverseAmount = type === "income" ? -amount : amount
      
      await supabase.rpc("update_account_balance", { 
        account_uuid: accountId, 
        amount_change: reverseAmount 
      })

      toast({ title: "Sucesso", description: "Transação excluída e saldo atualizado." })
      window.location.reload() // Recarrega para atualizar os gráficos e a lista
    } catch (error: any) {
      toast({ 
        title: "Erro ao excluir", 
        description: error.message, 
        variant: "destructive" 
      })
    }
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="bg-slate-800/50 p-3 rounded-full mb-3">
          <Calendar className="text-slate-500 h-5 w-5" />
        </div>
        <p className="text-slate-400 text-sm">Nenhuma transação encontrada.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between group p-3 rounded-xl border border-transparent hover:border-gray-800 hover:bg-white/[0.02] transition-all"
        >
          <div className="flex items-center gap-4">
            {/* Ícone */}
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center border-2 shadow-sm",
              transaction.type === "income" 
                ? "bg-green-500/10 border-green-500/20 text-green-500" 
                : "bg-red-500/10 border-red-500/20 text-red-500"
            )}>
              {transaction.type === "income" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </div>

            {/* Info */}
            <div>
              <p className="text-sm font-bold text-white leading-tight">
                {transaction.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">
                  {transaction.category_name || "Geral"}
                </span>
                <span className="text-gray-600 text-[10px]">•</span>
                <span className="text-[10px] font-medium text-gray-500">
                  {format(new Date(transaction.date + 'T12:00:00'), "dd MMM yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Valor */}
            <div className="text-right">
              <p className={cn(
                "text-sm font-black tracking-tight",
                transaction.type === "income" ? "text-green-500" : "text-red-500"
              )}>
                {transaction.type === "income" ? "+" : "-"} R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Menu de Ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#161b22] border-gray-800 text-white">
                <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-gray-800 focus:text-white">
                  <Edit2 size={14} /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDelete(transaction.id, transaction.amount, transaction.type, transaction.account_id)}
                  className="flex items-center gap-2 cursor-pointer text-red-500 focus:bg-red-500/10 focus:text-red-500"
                >
                  <Trash2 size={14} /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}