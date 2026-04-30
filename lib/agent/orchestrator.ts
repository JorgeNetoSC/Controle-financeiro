import OpenAI from "openai"
import type { SupabaseClient } from "@supabase/supabase-js"
import { addMonths, format, startOfMonth, endOfMonth } from "date-fns"

const client = new OpenAI({
  apiKey:process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

const SYSTEM_PROMPT = `Você é o FinBot, assistente financeiro pessoal via WhatsApp.

ESTILO DE RESPOSTA:
- Mensagens curtas e diretas (é WhatsApp, não e-mail)
- Use emojis com moderação: ✅ sucesso, ❌ erro, 💰 dinheiro
- Valores sempre em R$ com 2 casas decimais
- Datas no formato DD/MM/AAAA

COMO INTERPRETAR MENSAGENS:
- "compra no supermercado débito 280" → despesa, R$280, descrição "Supermercado"
- "gastei 50 no ifood" → despesa, R$50, descrição "iFood"
- "recebi salário 3000" → receita, R$3000, descrição "Salário"
- "financiei TV em 12x de 150" → parcelamento, 12x, R$150/mês, total R$1800
- "como tô em maio?" → use getMonthlyForecast com 2025-05
- "qual meu saldo?" → use getAccountBalance

REGRA CRÍTICA:
- Se a mensagem for ambígua, use askClarification
- Para parcelamentos, SEMPRE confirme a data do 1º pagamento se não informada
- Nunca registre nada sem ter: descrição, valor, tipo e data
`

export interface AgentInput {
  userMessage: string
  session: {
    id: string
    user_id: string
    phone: string
    messages: Array<{ role: string; content: string }>
    pending_action: PendingAction | null
  }
  supabase: SupabaseClient
}

interface PendingAction {
  tool: string
  partialData: Record<string, unknown>
  waitingFor: string
}

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "addTransaction",
      description: "Registra uma transação simples (receita ou despesa) sem parcelamento.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string" },
          amount: { type: "number" },
          type: { type: "string", enum: ["income", "expense"] },
          date: { type: "string", description: "YYYY-MM-DD, padrão hoje" },
          method: { type: "string", enum: ["debit", "credit", "pix", "cash"] },
        },
        required: ["description", "amount", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "addInstallment",
      description: "Cadastra uma compra parcelada. Cria o plano e distribui as parcelas nos meses futuros.",
      parameters: {
        type: "object",
        properties: {
          description: { type: "string" },
          totalAmount: { type: "number", description: "Valor TOTAL da compra" },
          installmentsCount: { type: "number" },
          monthlyAmount: { type: "number", description: "Valor de cada parcela" },
          startDate: { type: "string", description: "Data da 1ª parcela YYYY-MM-DD" },
          type: { type: "string", enum: ["income", "expense"] },
        },
        required: ["description", "totalAmount", "installmentsCount", "monthlyAmount", "startDate"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getMonthlyForecast",
      description: "Calcula o fechamento de um mês: receitas, despesas e saldo projetado.",
      parameters: {
        type: "object",
        properties: {
          targetMonth: { type: "string", description: "YYYY-MM, ex: 2025-05" },
        },
        required: ["targetMonth"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getAccountBalance",
      description: "Retorna o saldo atual da conta.",
      parameters: {
        type: "object",
        properties: {
          accountName: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "askClarification",
      description: "Faz uma pergunta ao usuário quando falta informação essencial.",
      parameters: {
        type: "object",
        properties: {
          question: { type: "string" },
          partialData: { type: "object" },
          waitingFor: { type: "string" },
        },
        required: ["question", "partialData", "waitingFor"],
      },
    },
  },
]

export async function runFinancialAgent({
  userMessage,
  session,
  supabase,
}: AgentInput): Promise<string> {
  const today = format(new Date(), "yyyy-MM-dd")
  const financialContext = await getFinancialContext(session.user_id, supabase)
  const history = (session.messages || []).slice(-10)

  const pendingContext = session.pending_action
    ? `\nESTADO PENDENTE: aguardando "${session.pending_action.waitingFor}". Dados parciais: ${JSON.stringify(session.pending_action.partialData)}`
    : ""

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}

CONTEXTO DO USUÁRIO:
- Saldo atual: R$ ${financialContext.balance.toFixed(2)}
- Receitas este mês: R$ ${financialContext.monthIncome.toFixed(2)}
- Despesas este mês: R$ ${financialContext.monthExpense.toFixed(2)}
- Parcelas ativas: ${financialContext.activeInstallments}
- Hoje: ${today}
${pendingContext}`,
    },
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ]

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      tools: TOOLS,
      tool_choice: "auto",
    })

    const assistantMessage = response.choices[0].message
    let finalText = assistantMessage.content || ""
    let pendingAction: PendingAction | null = null

    // Se o modelo quer chamar uma tool
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
  const toolCall = assistantMessage.tool_calls[0] as any
  const toolName = toolCall.function.name
  const toolInput = JSON.parse(toolCall.function.arguments)

      if (toolName === "askClarification") {
        pendingAction = {
          tool: "askClarification",
          partialData: toolInput.partialData,
          waitingFor: toolInput.waitingFor,
        }
        finalText = toolInput.question
      } else {
        // Executa a tool
        const toolResult = await executeTool(toolName, toolInput, session, supabase)

        // Segunda chamada com o resultado da tool para gerar resposta final
        const followUpMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
          ...messages,
          assistantMessage,
          {
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify(toolResult),
          },
        ]

        const followUp = await client.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: followUpMessages,
          tools: TOOLS,
        })

        finalText = followUp.choices[0].message.content || ""
      }
    }

    // Salva histórico (máximo 20 mensagens)
    const updatedMessages = [
      ...history,
      { role: "user", content: userMessage },
      { role: "assistant", content: finalText },
    ].slice(-20)

    await supabase
      .from("chat_sessions")
      .update({
        messages: updatedMessages,
        pending_action: pendingAction,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.id)

    return finalText || "Desculpe, não consegui processar. Tente novamente."
  } catch (error) {
    console.error("Erro no agente:", error)
    return "❌ Erro interno. Tente novamente em instantes."
  }
}

async function getDefaultAccount(userId: string, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("accounts")
    .select("id, name, balance")
    .eq("user_id", userId)
    .limit(1)
    .single()

  if (error || !data) throw new Error("Nenhuma conta encontrada")
  return data
}

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  session: AgentInput["session"],
  supabase: SupabaseClient
): Promise<Record<string, unknown>> {
  try {
    switch (name) {
      case "addTransaction": {
        const account = await getDefaultAccount(session.user_id, supabase)
        const date = (input.date as string) || format(new Date(), "yyyy-MM-dd")

        const { data: transaction, error } = await supabase
          .from("transactions")
          .insert({
            user_id: session.user_id,
            account_id: account.id,
            description: input.description as string,
            amount: input.amount as number,
            type: input.type as string,
            date,
            notes: input.method ? `via ${input.method}` : null,
          })
          .select()
          .single()

        if (error) return { success: false, error: error.message }

        await supabase.rpc("update_account_balance", {
          account_uuid: account.id,
          amount_change:
            (input.type as string) === "income"
              ? (input.amount as number)
              : -(input.amount as number),
        })

        return { success: true, transaction }
      }

      case "addInstallment": {
        const account = await getDefaultAccount(session.user_id, supabase)
        const installmentsCount = input.installmentsCount as number
        const monthlyAmount = input.monthlyAmount as number
        const startDate = new Date(input.startDate as string)
        const type = (input.type as string) || "expense"

        const { data: installment, error: instError } = await supabase
  .from("installments")
  .insert({
    user_id: session.user_id,
    account_id: account.id,
    description: input.description as string,
    total_amount: input.totalAmount as number,
    installment_amount: monthlyAmount,
    installments_count: installmentsCount,
    total_installments: installmentsCount,
    paid_installments: 0,
    start_date: format(startDate, "yyyy-MM-dd"),
    frequency: "monthly",
    status: "active",
    type,
  })
          .select()
          .single()

        if (instError || !installment)
          return { success: false, error: instError?.message || "Erro ao criar parcelamento" }

        const transactions = Array.from({ length: installmentsCount }, (_, i) => ({
          user_id: session.user_id,
          account_id: account.id,
          description: `${input.description} (${i + 1}/${installmentsCount})`,
          amount: monthlyAmount,
          type,
          date: format(addMonths(startDate, i), "yyyy-MM-dd"),
          installment_id: installment.id,
        }))

        const { error: txError } = await supabase.from("transactions").insert(transactions)

        if (txError)
          return { success: false, error: `Parcelamento criado, erro nas parcelas: ${txError.message}` }

        return {
          success: true,
          installmentId: installment.id,
          installmentsCreated: installmentsCount,
          firstDue: format(startDate, "dd/MM/yyyy"),
          lastDue: format(addMonths(startDate, installmentsCount - 1), "dd/MM/yyyy"),
        }
      }

      case "getMonthlyForecast": {
        const refDate = new Date(`${input.targetMonth as string}-01`)
        const start = format(startOfMonth(refDate), "yyyy-MM-dd")
        const end = format(endOfMonth(refDate), "yyyy-MM-dd")

        const { data: transactions } = await supabase
          .from("transactions")
          .select("amount, type")
          .eq("user_id", session.user_id)
          .gte("date", start)
          .lte("date", end)

        const income = (transactions || [])
          .filter((t) => t.type === "income")
          .reduce((s, t) => s + Number(t.amount), 0)

        const expenses = (transactions || [])
          .filter((t) => t.type === "expense")
          .reduce((s, t) => s + Number(t.amount), 0)

        const [year, month] = (input.targetMonth as string).split("-")
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
      }

      case "getAccountBalance": {
        let query = supabase
          .from("accounts")
          .select("name, balance")
          .eq("user_id", session.user_id)
          .limit(1)

        if (input.accountName) {
          query = supabase
            .from("accounts")
            .select("name, balance")
            .eq("user_id", session.user_id)
            .ilike("name", `%${input.accountName}%`)
            .limit(1)
        }

        const { data: account, error } = await query.single()
        if (error || !account) return { success: false, error: "Conta não encontrada" }

        return { success: true, account }
      }

      default:
        return { error: `Ferramenta "${name}" não encontrada` }
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "Erro desconhecido",
    }
  }
}

async function getFinancialContext(userId: string, supabase: SupabaseClient) {
  const today = new Date()
  const start = format(startOfMonth(today), "yyyy-MM-dd")
  const end = format(endOfMonth(today), "yyyy-MM-dd")

  const [accountResult, transactionsResult, installmentsResult] = await Promise.all([
    supabase.from("accounts").select("balance").eq("user_id", userId).limit(1).single(),
    supabase.from("transactions").select("amount, type").eq("user_id", userId).gte("date", start).lte("date", end),
    supabase.from("installments").select("id").eq("user_id", userId).eq("status", "active"),
  ])

  const transactions = transactionsResult.data || []

  return {
    balance: Number(accountResult.data?.balance || 0),
    monthIncome: transactions.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
    monthExpense: transactions.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
    activeInstallments: installmentsResult.data?.length || 0,
  }
}