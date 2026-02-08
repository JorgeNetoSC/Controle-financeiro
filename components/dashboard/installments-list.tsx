"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Layers, Trash2, MoreVertical, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function InstallmentsList({ userId }: { userId: string }) {
  const [installments, setInstallments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const fetchInstallments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("installments")
      .select("*, categories(name)")
      .eq("user_id", userId)
      .order("due_date", { ascending: true })
    setInstallments(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchInstallments() }, [])

  const handleDelete = async (id: string, groupId: string, all: boolean) => {
    const msg = all ? "Eliminar TODAS as parcelas deste grupo?" : "Eliminar apenas esta parcela?"
    if (!confirm(msg)) return

    try {
      if (all) {
        await supabase.from("installments").delete().eq("group_id", groupId)
      } else {
        await supabase.from("installments").delete().eq("id", id)
      }
      
      toast({ title: "Sucesso", description: "Parcela(s) removida(s)." })
      fetchInstallments()
    } catch (err) {
      toast({ title: "Erro", variant: "destructive" })
    }
  }

  if (loading) return <div className="text-center py-10 text-gray-500 animate-pulse">A carregar parcelas...</div>

  if (installments.length === 0) {
    return (
      <div className="text-center py-10">
        <Layers className="mx-auto text-gray-700 mb-2" size={32} />
        <p className="text-gray-500">Nenhum parcelamento ativo.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {installments.map((inst) => (
        <div key={inst.id} className="flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-xl hover:bg-slate-900/60 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-bold text-sm text-white">{inst.description}</p>
              <p className="text-[10px] text-gray-500 uppercase font-black">
                {inst.categories?.name} • PARCELA {inst.installment_number}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-black text-red-500">
                R$ {inst.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[10px] text-gray-500">
                Vence em {format(new Date(inst.due_date + 'T12:00:00'), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500"><MoreVertical size={16} /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-white">
                <DropdownMenuItem onClick={() => handleDelete(inst.id, inst.group_id, false)} className="flex gap-2 cursor-pointer">
                   Eliminar esta
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(inst.id, inst.group_id, true)} className="flex gap-2 cursor-pointer text-red-500">
                   Eliminar GRUPO (Tudo)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  )
}