import { format, addMonths, addWeeks } from "date-fns"
import { createClient } from "@/lib/supabase/client"

interface CreateInstallmentsParams {
  userId: string
  description: string
  totalAmount: number
  installmentsCount: number
  frequency: "monthly" | "weekly"
  startDate: Date
  type: "income" | "expense"
  accountId: string
  categoryId?: string | null
}

export async function createInstallments({
  userId,
  description,
  totalAmount,
  installmentsCount,
  frequency,
  startDate,
  type,
  accountId,
  categoryId,
}: CreateInstallmentsParams) {
  const supabase = createClient()

  /* ============================================================
     1️⃣ CRIA O REGISTRO MESTRE (O PLANO DE PARCELAMENTO)
  ============================================================ */
  const { data: installment, error: installmentError } = await supabase
    .from("installments")
    .insert({
      user_id: userId,
      description,
      total_amount: totalAmount,
      installments_count: installmentsCount,
      paid_installments: 1, // A primeira já nasce paga
      frequency,
      start_date: format(startDate, "yyyy-MM-dd"),
      status: "active",
      type,
      account_id: accountId,
      category_id: categoryId || null,
    })
    .select()
    .single()

  if (installmentError) {
    console.error("ERRO INSTALLMENTS:", JSON.stringify(installmentError, null, 2))
    throw new Error(installmentError.message)
  }

  /* ============================================================
     2️⃣ GERA E CRIA AS PARCELAS INDIVIDUAIS (ITENS)
  ============================================================ */
  const installmentValue = Number((totalAmount / installmentsCount).toFixed(2))

  const items = Array.from({ length: installmentsCount }).map((_, index) => {
    const dueDate = frequency === "monthly" 
      ? addMonths(startDate, index) 
      : addWeeks(startDate, index)

    return {
      installment_id: installment.id,
      user_id: userId,
      installment_number: index + 1,
      amount: installmentValue,
      due_date: format(dueDate, "yyyy-MM-dd"),
      status: index === 0 ? "paid" : "pending"
    }
  })

  const { error: itemsError } = await supabase
    .from("installment_items")
    .insert(items)

  if (itemsError) {
    console.error("ERRO INSTALLMENT_ITEMS:", JSON.stringify(itemsError, null, 2))
    throw new Error(itemsError.message)
  }

  /* ============================================================
     3️⃣ CRIA A TRANSAÇÃO NA CONTA (PARA APARECER NO EXTRATO)
     Aqui é onde "puxamos" a 1ª parcela para o histórico da conta
  ============================================================ */
  const { error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      account_id: accountId,
      category_id: categoryId || null,
      description: `${description} (1/${installmentsCount})`,
      amount: installmentValue,
      type: type,
      date: format(startDate, "yyyy-MM-dd"),
      status: "paid", // Como é a primeira, já entra como paga
      installment_item_id: null // Opcional: vincular ao item se tiver a coluna
    })

  if (transactionError) {
    console.error("ERRO AO GERAR TRANSAÇÃO NO EXTRATO:", transactionError.message)
    // Não damos throw aqui para não cancelar o processo se apenas o extrato falhar, 
    // mas o ideal é que a tabela transactions esteja correta.
  }

  /* ============================================================
     4️⃣ ATUALIZA O SALDO REAL DA CONTA (RPC)
  ============================================================ */
  const balanceChange = type === "income" ? installmentValue : -installmentValue

  const { error: balanceError } = await supabase.rpc(
    "update_account_balance",
    {
      account_uuid: accountId,
      amount_change: balanceChange,
    }
  )

  if (balanceError) {
    console.error("ERRO BALANCE RPC:", balanceError.message)
  }

  return installment
}