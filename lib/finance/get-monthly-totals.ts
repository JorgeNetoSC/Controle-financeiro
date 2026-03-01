import { createClient } from "@/lib/supabase/client"
import { startOfMonth, endOfMonth, format } from "date-fns"

// Definimos a interface para o TypeScript entender o retorno do banco
interface MonthlyItem {
  amount: number
  status: string
  installments: {
    type: "income" | "expense"
  }
}

export async function getMonthlyTotals(userId: string, date: Date) {
  const supabase = createClient()
  const start = format(startOfMonth(date), "yyyy-MM-dd")
  const end = format(endOfMonth(date), "yyyy-MM-dd")

  // Fazemos o fetch forçando a tipagem dos dados retornados
  const { data, error } = await supabase
    .from("installment_items")
    .select(`
      amount,
      status,
      installments:installment_id (
        type
      )
    `)
    .eq("user_id", userId)
    .gte("due_date", start)
    .lte("due_date", end)

  if (error) {
    console.error("Erro ao buscar totais mensais:", error)
    return { income: 0, expense: 0 }
  }

  // Cast do dado para o tipo que definimos
  const typedData = (data as unknown) as MonthlyItem[]

  // Agora o reduce funciona sem erro de type
  const totals = typedData.reduce(
    (acc, item) => {
      // Proteção: verifica se a relação installments existe
      const type = item.installments?.type
      
      if (type === "income") {
        acc.income += item.amount
      } else if (type === "expense") {
        acc.expense += item.amount
      }
      
      return acc
    },
    { income: 0, expense: 0 }
  )

  return totals
}