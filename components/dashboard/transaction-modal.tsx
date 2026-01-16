"use client"

import type React from "react"
import { useEffect, useState, ReactNode } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

import { createClient } from "@/lib/supabase/client"
import { createInstallments } from "@/lib/finance/create-installments"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarIcon,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"

interface TransactionModalProps {
  userId: string
  onSuccess?: () => void
  trigger?: ReactNode
}

export function TransactionModal({ userId, onSuccess, trigger }: TransactionModalProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")

  // Campos do formulário
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [accountId, setAccountId] = useState("")
  const [categoryId, setCategoryId] = useState("")

  // Parcelamento (Reintegrado)
  const [isInstallment, setIsInstallment] = useState<"no" | "yes">("no")
  const [installments, setInstallments] = useState(2)
  const [frequency, setFrequency] = useState<"monthly" | "weekly">("monthly")

  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      const supabase = createClient()
      const { data: accs } = await supabase.from("accounts").select("*").eq("user_id", userId)
      const { data: cats } = await supabase.from("categories").select("*").eq("user_id", userId).eq("type", type)

      setAccounts(accs || [])
      setCategories(cats || [])
    }
    loadData()
  }, [open, type, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const value = Number(amount)
      if (!accountId) throw new Error("Selecione uma conta")
      if (!description.trim()) throw new Error("Descrição obrigatória")
      if (!value || value <= 0) throw new Error("Valor inválido")

      if (isInstallment === "yes") {
        await createInstallments({
          userId,
          description,
          totalAmount: value,
          installmentsCount: installments,
          frequency,
          startDate: date,
          type,
          accountId,
          categoryId: categoryId || null,
        })
      } else {
        const supabase = createClient()
        const { error } = await supabase.from("transactions").insert({
          user_id: userId,
          account_id: accountId,
          category_id: categoryId || null,
          description,
          amount: value,
          type,
          date: format(date, "yyyy-MM-dd"),
        })
        if (error) throw error
        
        await supabase.rpc("update_account_balance", { 
          account_uuid: accountId, 
          amount_change: type === "income" ? value : -value 
        })
      }

      toast({ title: "Sucesso", description: "Transação salva com sucesso!" })
      
      // Reset total
      setDescription("")
      setAmount("")
      setAccountId("")
      setCategoryId("")
      setIsInstallment("no")
      setOpen(false)
      onSuccess?.()
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return trigger ? <div className="opacity-0">{trigger}</div> : null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700 font-semibold">
            <Plus className="mr-2 h-4 w-4" /> Nova Transação
          </Button>
        )}
      </DialogTrigger>

      <DialogContent 
        className="sm:max-w-[450px] bg-slate-900 border-slate-800 text-white overflow-visible max-h-[95vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nova Transação</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as any)} className="w-full">
          <TabsList className="grid grid-cols-2 bg-slate-800 mb-6">
            <TabsTrigger value="expense" className="data-[state=active]:bg-red-600 text-sm font-medium">
              <ArrowDownCircle className="mr-2 h-4 w-4" /> Despesa
            </TabsTrigger>
            <TabsTrigger value="income" className="data-[state=active]:bg-green-600 text-sm font-medium">
              <ArrowUpCircle className="mr-2 h-4 w-4" /> Receita
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-5 pb-2">
            {/* DESCRIÇÃO E VALOR */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Descrição</Label>
                <Input 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="bg-slate-800 border-slate-700 h-11 focus:ring-blue-500" 
                  placeholder="Ex: Supermercado" 
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Valor (R$)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className="bg-slate-800 border-slate-700 h-11 text-lg font-semibold" 
                  placeholder="0,00" 
                />
              </div>
            </div>

            {/* SELETORES: CONTA E CATEGORIA */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Conta</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 h-11">
                    <SelectValue placeholder="Qual conta?" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white z-[10001]">
                    {accounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-300">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 h-11">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white z-[10001]">
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* DATA */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-300">Data da Transação</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start bg-slate-800 border-slate-700 h-11 font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 bg-slate-800 border-slate-700 z-[10001]" align="center">
                  <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} className="text-white" />
                </PopoverContent>
              </Popover>
            </div>

            {/* PARCELAMENTO (SESSÃO REINTEGRADA) */}
            <div className="pt-2 border-t border-slate-800 space-y-3">
              <Label className="text-sm font-medium text-slate-300">Esta transação é parcelada?</Label>
              <RadioGroup
                value={isInstallment}
                onValueChange={(v) => setIsInstallment(v as any)}
                className="flex gap-6 pt-1"
              >
                <div className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="no" id="no" className="border-slate-500" />
                  <Label htmlFor="no" className="text-sm cursor-pointer">Pagamento Único</Label>
                </div>
                <div className="flex items-center gap-2 cursor-pointer">
                  <RadioGroupItem value="yes" id="yes" className="border-slate-500" />
                  <Label htmlFor="yes" className="text-sm cursor-pointer">Parcelar Valor</Label>
                </div>
              </RadioGroup>

              {isInstallment === "yes" && (
                <div className="grid grid-cols-2 gap-4 mt-4 p-3 bg-slate-950/50 rounded-lg border border-slate-800 animate-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400 font-bold uppercase">Nº de Parcelas</Label>
                    <Input 
                      type="number" 
                      min={2} 
                      value={installments} 
                      onChange={(e) => setInstallments(Number(e.target.value))} 
                      className="bg-slate-800 border-slate-700 h-10" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-400 font-bold uppercase">Frequência</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white z-[10001]">
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* BOTÃO SUBMIT */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 font-bold text-lg shadow-lg transition-all active:scale-95 ${
                type === "income" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isLoading ? "Salvando..." : `Confirmar ${type === "income" ? "Receita" : "Despesa"}`}
            </Button>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}