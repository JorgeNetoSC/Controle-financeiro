import { groq } from "@ai-sdk/groq"
import { streamText, convertToModelMessages, tool } from "ai"
import { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { addMonths, format, startOfMonth, endOfMonth } from "date-fns"

interface ChatContext {
  totalIncome?: number
  totalExpenses?: number
  totalBalance?: number
  userId?: string
  transactions?: Array<{
    description: string
    amount: number
    type: string
    date: string
    category_name?: string
    isInstallment?: boolean
    status?: string
  }>
  installmentsSummary?: Array<{
    description: string
    totalAmount: number
    installmentsCount: number
    paidInstallments: number
    type: string
    status: string
    monthlyAmount: number
  }>
}

const SYSTEM_PROMPT = `Você é o FinBot, assistente financeiro pessoal integrado ao dashboard.

OBJETIVOS:
- Responder de forma objetiva e amigável sobre finanças pessoais
- Usar o contexto enviado para análises personalizadas
- Registrar transações via addTransaction quando solicitado
- Cadastrar parcelamentos via addInstallment
- Calcular projeções mensais via getMonthlyForecast
- Consultar saldo via getAccountBalance

REGRAS:
- Sempre usar R$ ao mencionar valores
- Se faltar informação essencial, pergunte antes de agir
- Para parcelamentos, peça a data do 1º pagamento se não informada
- Nunca inventar dados
`

const requestSchema = z.object({
  messages: z.array(z.unknown()),
  context: z
    .object({
      totalIncome: z.number().optional(),
      totalExpenses: z.number().optional(),
      totalBalance: z.number().optional(),
      userId: z.string().optional(),
      transactions: z.array(z.any()).optional(),
      installmentsSummary: z.array(z.any()).optional(),
    })
    .optional(),
})

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function buildContextPrompt(context?: ChatContext): string {
  if (!context) return ""

  const recentTransactions = (context.transactions || [])
    .slice(0, 10)
    .map(
      (t) =>
        `- ${t.date} | ${t.type === "income" ? "Receita" : "Despesa"} | ${t.description} | R$ ${Number(t.amount).toFixed(2)}`
    )
    .join("\n")

  const installmentsSummary = (context.installmentsSummary || [])
    .slice(0, 5)
    .map(
      (i) =>
        `- ${i.description}: ${i.paidInstallments}/${i.installmentsCount}x | R$ ${Number(i.monthlyAmount).toFixed(2)}/mês`
    )
    .join("\n")

  return `
CONTEXTO FINANCEIRO (mês atual):
- Receitas: R$ ${Number(context.totalIncome || 0).toFixed(2)}
- Despesas: R$ ${Number(context.totalExpenses || 0).toFixed(2)}
- Saldo: R$ ${Number(context.totalBalance || 0).toFixed(2)}

TRANSAÇÕES RECENTES:
${recentTransactions || "Nenhuma"}

PARCELAMENTOS ATIVOS:
${installmentsSummary || "Nenhum"}

Hoje: ${format(new Date(), "dd/MM/yyyy")}
`
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
  return new Response("GROQ_API_KEY não configurada.", { status: 503 })
}

    const body = await req.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return new Response("Payload inválido.", { status: 400 })
    }

    const { messages, context } = parsed.data
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new Response("Usuário não autenticado.", { status: 401 })
    }

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: `${SYSTEM_PROMPT}\n\n${buildContextPrompt(context)}`,
      messages: await convertToModelMessages(messages as any),

      tools: {
        addTransaction: tool({
          description: "Registra uma transação de receita ou despesa simples.",
          inputSchema: z.object({
            description: z.string(),
            amount: z.number().positive(),
            type: z.enum(["income", "expense"]),
            date: z.string().optional(),
            method: z.enum(["debit", "credit", "pix", "cash"]).optional(),
          }),
          execute: async ({ description, amount, type, date, method }) => {
            try {
              const { data: account } = await supabase
                .from("accounts")
                .select("id")
                .eq("user_id", user.id)
                .limit(1)
                .single()

              if (!account) return { success: false, error: "Nenhuma conta encontrada." }

              const txDate =
                date && isIsoDate(date)
                  ? date
                  : format(new Date(), "yyyy-MM-dd")

              const { data: transaction, error } = await supabase
                .from("transactions")
                .insert({
                  user_id: user.id,
                  account_id: account.id,
                  description,
                  amount,
                  type,
                  date: txDate,
                  notes: method ? `via ${method}` : null,
                })
                .select()
                .single()

              if (error) return { success: false, error: error.message }

              await supabase.rpc("update_account_balance", {
                account_uuid: account.id,
                amount_change: type === "income" ? amount : -amount,
              })

              return { success: true, transaction }
            } catch (err) {
              return { success: false, error: err instanceof Error ? err.message : "Erro" }
            }
          },
        }),

        addInstallment: tool({
          description: "Cadastra uma compra parcelada e distribui as parcelas em cada mês.",
          inputSchema: z.object({
            description: z.string(),
            totalAmount: z.number().positive(),
            installmentsCount: z.number().int().positive(),
            monthlyAmount: z.number().positive(),
            startDate: z.string(),
            type: z.enum(["income", "expense"]).default("expense"),
          }),
          execute: async ({ description, totalAmount, installmentsCount, monthlyAmount, startDate, type }) => {
            try {
              const { data: account } = await supabase
                .from("accounts")
                .select("id")
                .eq("user_id", user.id)
                .limit(1)
                .single()

              if (!account) return { success: false, error: "Nenhuma conta encontrada." }

              const parsedStart = new Date(startDate)

              const { data: installment, error: instError } = await supabase
  .from("installments")
  .insert({
    user_id: user.id,
    account_id: account.id,
    description,
    total_amount: totalAmount,
    installment_amount: monthlyAmount,
    installments_count: installmentsCount,
    total_installments: installmentsCount,
    paid_installments: 0,
                  start_date: format(parsedStart, "yyyy-MM-dd"),
                  frequency: "monthly",
                  status: "active",
                  type,
                })
                .select()
                .single()

              if (instError || !installment)
                return { success: false, error: instError?.message || "Erro ao criar parcelamento" }

              const items = Array.from({ length: installmentsCount }, (_, i) => ({
  installment_id: installment.id,
  user_id: user.id,
  installment_number: i + 1,
  amount: monthlyAmount,
  due_date: format(addMonths(parsedStart, i), "yyyy-MM-dd"),
  status: "pending",
  paid: false,
}))

const { error: txError } = await supabase.from("installment_items").insert(items)

              if (txError)
                return { success: false, error: `Parcelamento criado, erro nas parcelas: ${txError.message}` }

              return {
                success: true,
                installmentId: installment.id,
                installmentsCreated: installmentsCount,
                firstDue: format(parsedStart, "dd/MM/yyyy"),
                lastDue: format(addMonths(parsedStart, installmentsCount - 1), "dd/MM/yyyy"),
              }
            } catch (err) {
              return { success: false, error: err instanceof Error ? err.message : "Erro" }
            }
          },
        }),

        getMonthlyForecast: tool({
          description: "Calcula o fechamento financeiro de um mês.",
          inputSchema: z.object({
            targetMonth: z.string().describe("YYYY-MM"),
          }),
          execute: async ({ targetMonth }) => {
            try {
              const refDate = new Date(`${targetMonth}-01`)
              const start = format(startOfMonth(refDate), "yyyy-MM-dd")
              const end = format(endOfMonth(refDate), "yyyy-MM-dd")

              const { data: transactions } = await supabase
                .from("transactions")
                .select("amount, type")
                .eq("user_id", user.id)
                .gte("date", start)
                .lte("date", end)

              const income = (transactions || [])
                .filter((t) => t.type === "income")
                .reduce((s, t) => s + Number(t.amount), 0)

              const expenses = (transactions || [])
                .filter((t) => t.type === "expense")
                .reduce((s, t) => s + Number(t.amount), 0)

              const [year, month] = targetMonth.split("-")
              const monthNames = [
                "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
              ]

              return {
                success: true,
                month: `${monthNames[parseInt(month)]} ${year}`,
                income,
                expenses,
                balance: income - expenses,
                transactionCount: (transactions || []).length,
              }
            } catch (err) {
              return { success: false, error: err instanceof Error ? err.message : "Erro" }
            }
          },
        }),

        getAccountBalance: tool({
          description: "Consulta o saldo atual de uma conta.",
          inputSchema: z.object({
            accountName: z.string().optional(),
          }),
          execute: async ({ accountName }) => {
            try {
              let query = supabase
                .from("accounts")
                .select("name, balance")
                .eq("user_id", user.id)
                .limit(1)

              if (accountName) {
                query = supabase
                  .from("accounts")
                  .select("name, balance")
                  .eq("user_id", user.id)
                  .ilike("name", `%${accountName}%`)
                  .limit(1)
              }

              const { data: account, error } = await query.single()
              if (error || !account) return { success: false, error: "Conta não encontrada." }

              return { success: true, account }
            } catch (err) {
              return { success: false, error: err instanceof Error ? err.message : "Erro" }
            }
          },
        }),
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("Erro na API /api/ai:", error)
    return new Response("Erro interno", { status: 500 })
  }
}