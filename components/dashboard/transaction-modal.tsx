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
import { CalendarIcon, Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

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
  const [isLoading, setIsLoading] = useState(false)
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const { toast } = useToast()

  // Load accounts and categories when modal opens
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

      // Create transaction
      const { error } = await supabase.from("transactions").insert({
        user_id: userId,
        account_id: accountId,
        category_id: categoryId || null,
        description,
        amount: Number.parseFloat(amount),
        type,
        date: format(date, "yyyy-MM-dd"),
      })

      if (error) throw error

      // Update account balance
      const amountValue = Number.parseFloat(amount)
      const balanceChange = type === "income" ? amountValue : -amountValue

      await supabase.rpc("update_account_balance", {
        account_uuid: accountId,
        amount_change: balanceChange,
      })

      toast({
        title: type === "income" ? "Receita adicionada!" : "Despesa adicionada!",
        description: `${description} - R$ ${amount}`,
      })

      // Reset form
      setDescription("")
      setAmount("")
      setDate(new Date())
      setAccountId("")
      setCategoryId("")
      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error("[v0] Error creating transaction:", error)
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a transação",
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
          <Plus className="mr-2 h-4 w-4" />
          Nova Transação
        </Button>
      </DialogTrigger>
      <DialogContent className="border-slate-800 bg-slate-900 text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
        </DialogHeader>

        <Tabs value={type} onValueChange={(v) => setType(v as "income" | "expense")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
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
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={type === "income" ? "Ex: Salário, Freelance" : "Ex: Supermercado, Conta de luz"}
                  required
                  className="border-slate-700 bg-slate-800 text-white"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="border-slate-700 bg-slate-800 text-white"
                />
              </div>

              <div className="grid gap-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start border-slate-700 bg-slate-800 text-left font-normal text-white hover:bg-slate-700"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto border-slate-700 bg-slate-800 p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
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

              <div className="flex gap-2 pt-4">
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
                  {isLoading ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
