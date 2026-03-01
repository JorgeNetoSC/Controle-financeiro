// src/lib/finance/pay-installment.ts
import { createClient } from "@/lib/supabase/client"

export async function payInstallment({ itemId, accountId, amount, type, description }: any) {
  const supabase = createClient()

  // 1. Atualizar o item da parcela para 'paid'
  const { error: itemError } = await supabase
    .from("installment_items")
    .update({ status: "paid" })
    .eq("id", itemId)

  if (itemError) throw itemError

  // 2. CRIAR UMA TRANSAÇÃO REAL (Para aparecer no extrato da conta)
  const { error: transError } = await supabase
    .from("transactions")
    .insert({
      account_id: accountId,
      description: `Pagam. Parcela: ${description}`,
      amount: amount,
      type: type, // 'income' ou 'expense'
      date: new Date().toISOString(),
      category_id: null, // Ou passar a categoria do parcelamento pai
      status: "paid"
    })

  if (transError) throw transError

  // 3. Atualizar o saldo da conta (RPC)
  const balanceChange = type === "income" ? amount : -amount
  const { error: balanceError } = await supabase.rpc("update_account_balance", {
    account_uuid: accountId,
    amount_change: balanceChange,
  })

  if (balanceError) throw balanceError

  return { success: true }
}