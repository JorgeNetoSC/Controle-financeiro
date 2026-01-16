"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface TransactionModalProps {
  userId: string
  onSuccess?: () => void
}

export function TransactionModal({ userId, onSuccess }: TransactionModalProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")

  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [accountId, setAccountId] = useState("")
  const [categoryId, setCategoryId] = useState("")

  const [isInstallment, setIsInstallment] = useState("no")
  const [installments, setInstallments] = useState(2)
  const [frequency, setFrequency] = useState<"monthly" | "weekly">("monthly")

  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      const supabase = createClient()

      const { data: acc } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", userId)

      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .eq("type", type)

      setAccounts(acc || [])
      setCategories(cat || [])
    }

    loadData()
  }, [open, type, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const value = Number(amount)

      if (isInstallment === "no") {
        const { error } = await supabase.from("transactions").insert({
          user_id: userId,
          account_id: accountId,
          category_id: categoryId || null,
          description,
          amount: value,
          type,
          date: format(date, "yyyy-MM-dd"),
        })

        if (error) {
          console.error("ERRO TRANSACTION:", error)
          throw error
        }
      } else {
        await createInstallments({
          userId,
          description,
          totalAmount: value,
          installmentsCount: installments,
          frequency,
          startDate: date,
          type,
          accountId,
          categoryId,
        })
      }

      toast({
        title: "Sucesso",
        description:
          isInstallment === "yes"
            ? "Parcelamento criado com sucesso"
            : "Transação criada com sucesso",
      })

      setOpen(false)
      onSuccess?.()
    } catch (err: any) {
      console.error("ERRO REAL:", err?.message || err)

      toast({
        title: "Erro ao salvar",
        description: err?.message || "Erro desconhecido",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as any)}>
          <TabsList className="grid grid-cols-2 bg-slate-800">
            <TabsTrigger value="expense" className="data-[state=active]:bg-red-600">
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Despesa
            </TabsTrigger>
            <TabsTrigger value="income" className="data-[state=active]:bg-green-600">
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Receita
            </TabsTrigger>
          </TabsList>

          <TabsContent value={type} className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">

              <div>
                <Label>Descrição</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>

              <div>
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>

              <div>
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(date, "PPP", { locale: ptBR })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Calendar mode="single" selected={date} onSelect={(d) => d && setDate(d)} />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label>Parcelado?</Label>
                <RadioGroup value={isInstallment} onValueChange={setIsInstallment} className="flex gap-6">
                  <RadioGroupItem value="no" /> Não
                  <RadioGroupItem value="yes" /> Sim
                </RadioGroup>
              </div>

              {isInstallment === "yes" && (
                <div className="grid grid-cols-2 gap-4">
                  <Input type="number" min={2} value={installments} onChange={(e) => setInstallments(Number(e.target.value))} />
                  <Select value={frequency} onValueChange={(v) => setFrequency(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensal</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Salvando..." : "Adicionar"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
