import { createClient } from "@/lib/supabase/client"

export async function getDashboardData(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  const supabase = createClient()

  let query = supabase
    .from("v_transactions_all")
    .select("amount, type, date, category_id")
    .eq("user_id", userId)

  if (startDate) query = query.gte("date", startDate)
  if (endDate) query = query.lte("date", endDate)

  const { data, error } = await query

  if (error) throw error

  return data || []
}
