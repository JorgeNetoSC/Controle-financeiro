"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIcon, CreditCard, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface InstallmentsModalProps {
  userId: string
  onSuccess?: () => void
}

export function InstallmentsModal({ userId, onSuccess }: InstallmentsModalProps) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<"income" | "expense">("expense")
  const [description, setDescription] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [totalInstallments, setTotalInstallments] = useState("")
  const [startDate, setStartDate] = useState<Date>()
  const [frequency, setFrequency] = useState("monthly")
  const [accountId, setAccountId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const { toast } = useToast()

  const loadData = async () => {
    const supabase = createClient()

    const { data: accountsData } = await supabase.from("accounts").select("*").eq("user_id", userId)

    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .eq("type", type)

    setAccounts(accountsData || [])
    setCategories(categoriesData || [])
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      loadData()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const installmentAmount = Number.parseFloat(totalAmount) / Number.parseInt(totalInstallments)

      const { data: installment, error: installmentError } = await supabase
        .from("installments")
        .insert({
          user_id: userId,
          account_id: accountId,
          category_id: categoryId || null,
          description,
          total_amount: Number.parseFloat(totalAmount),
          installment_amount: installmentAmount,
          total_installments: Number.parseInt(totalInstallments),
          start_date: startDate ? format(startDate, "yyyy-MM-dd") : null,
          frequency,
          status: "active",
          type, // Store if it's income or expense
        })
        .select()
        .single()

      if (installmentError) throw installmentError

      // Generate transactions
      const { error: functionError } = await supabase.rpc("generate_installment_transactions", {
        installment_uuid: installment.id,
      })

      if (functionError) throw functionError

      toast({
        title: "Parcelas criadas!",
        description: `${totalInstallments}x de R$ ${installmentAmount.toFixed(2)}`,
      })

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("[v0] Error creating installment:", error)
      toast({
        title: "Erro",
        description: "Não foi possível criar as parcelas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <CreditCard className="mr-2 h-4 w-4" />
          Nova Parcela
        </Button>
      </DialogTrigger>
      <DialogContent className="border-slate-800 bg-slate-900 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Parcelas Automáticas</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as "income" | "expense")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="expense" className="data-[state=active]:bg-red-600">
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Despesa Parcelada
            </TabsTrigger>
            <TabsTrigger value="income" className="data-[state=active]:bg-green-600">
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Receita Parcelada
            </TabsTrigger>
          </TabsList>

          <TabsContent value={type} className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={type === "income" ? "Ex: Projeto freelance" : "Ex: Notebook Dell"}
                  required
                  className="border-slate-700 bg-slate-800 text-white"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="totalAmount">Valor Total (R$)</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="1000.00"
                  required
                  className="border-slate-700 bg-slate-800 text-white"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="totalInstallments">Número de Parcelas</Label>
                <Input
                  id="totalInstallments"
                  type="number"
                  value={totalInstallments}
                  onChange={(e) => setTotalInstallments(e.target.value)}
                  placeholder="5"
                  min="2"
                  required
                  className="border-slate-700 bg-slate-800 text-white"
                />
              </div>

              <div className="grid gap-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start border-slate-700 bg-slate-800 text-left font-normal text-white hover:bg-slate-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto border-slate-700 bg-slate-800 p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequência</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="border-slate-700 bg-slate-800 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-800">
                    <SelectItem value="monthly" className="text-white">
                      Mensal
                    </SelectItem>
                    <SelectItem value="weekly" className="text-white">
                      Semanal
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="account">Conta</Label>
                <Select value={accountId} onValueChange={setAccountId} required>
                  <SelectTrigger className="border-slate-700 bg-slate-800 text-white">
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-800">
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-white">
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="border-slate-700 bg-slate-800 text-white">
                    <SelectValue placeholder="Selecione uma categoria (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="border-slate-700 bg-slate-800">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="text-white">
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {totalAmount && totalInstallments && (
                <div
                  className={`rounded-lg border p-4 ${type === "income" ? "border-green-700 bg-green-900/20" : "border-red-700 bg-red-900/20"}`}
                >
                  <p className="text-sm text-slate-400">Valor de cada parcela:</p>
                  <p className={`text-2xl font-bold ${type === "income" ? "text-green-400" : "text-red-400"}`}>
                    R$ {(Number.parseFloat(totalAmount) / Number.parseInt(totalInstallments)).toFixed(2)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {totalInstallments}x de R${" "}
                    {(Number.parseFloat(totalAmount) / Number.parseInt(totalInstallments)).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1 border-slate-700 text-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 ${type === "income" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}
                >
                  {isLoading ? "Criando..." : "Criar Parcelas"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
