import { createClient } from "@/lib/supabase/client"

export async function getDashboardData(userId: string, startDate?: string, endDate?: string) {
  const supabase = createClient()

  // 1. Busca Saldo Real da tabela public.users (conforme seu esquema)
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("balance")
    .eq("id", userId)
    .single()

  if (userError) console.error("Erro ao buscar saldo:", userError)

  // 2. Busca Transações da View Unificada
  let query = supabase
    .from("v_transactions_all")
    .select("*")
    .eq("user_id", userId)

  if (startDate) query = query.gte("date", startDate)
  if (endDate) query = query.lte("date", endDate)

  const { data: transactions, error: transError } = await query
  if (transError) throw transError

  // 3. Processamento para o Gráfico e Totais
  const totals = (transactions || []).reduce(
    (acc, item) => {
      const amount = Number(item.amount)
      if (item.type === "income") {
        acc.income += amount
      } else {
        acc.expense += amount
        const catName = item.category_name || "Outros"
        acc.categories[catName] = (acc.categories[catName] || 0) + amount
      }
      return acc
    },
    { income: 0, expense: 0, categories: {} as Record<string, number> }
  )

  const chartData = Object.entries(totals.categories).map(([name, value]) => ({
    name,
    value,
  }))

  return {
    totalBalance: userData?.balance || 0,
    income: totals.income,
    expense: totals.expense,
    chartData,
    transactions: transactions || []
  }
}