import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
} from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function POST(req: Request) {
  const {
    messages,
    context,
  }: {
    messages: UIMessage[]
    context?: {
      totalIncome: number
      totalExpenses: number
      totalBalance: number
      userId: string
      transactions: Array<{
        description: string
        amount: number
        type: string
        date: string
        category_name: string
        isInstallment: boolean
        status?: string
      }>
      installmentsSummary: Array<{
        description: string
        totalAmount: number
        installmentsCount: number
        paidInstallments: number
        type: string
        status: string
        monthlyAmount: number
      }>
    }
  } = await req.json()

  const supabase = await createClient()

  // Buscar contas e categorias do usuario para usar nas tools
  let accounts: Array<{ id: string; name: string; type: string }> = []
  let categories: Array<{ id: string; name: string; type: string }> = []

  if (context?.userId) {
    const [accsRes, catsRes] = await Promise.all([
      supabase.from("accounts").select("id, name, type").eq("user_id", context.userId),
      supabase.from("categories").select("id, name, type").eq("user_id", context.userId),
    ])
    accounts = accsRes.data || []
    categories = catsRes.data || []
  }

  const recentTransactions = context?.transactions?.slice(0, 15) || []
  const installmentsSummary = context?.installmentsSummary || []

  const systemPrompt = `Voce e um assistente financeiro inteligente chamado FinBot. Voce ajuda os usuarios a entender e gerenciar melhor suas financas pessoais.

${
  context
    ? `## DADOS FINANCEIROS DO USUARIO

### Resumo Geral
- Receitas totais: R$ ${context.totalIncome.toFixed(2)}
- Despesas totais: R$ ${context.totalExpenses.toFixed(2)}
- Saldo atual: R$ ${context.totalBalance.toFixed(2)}

### Contas Disponiveis
${accounts.map((a) => `- ${a.name} (${a.type}) [ID: ${a.id}]`).join("\n")}

### Categorias Disponiveis
${categories.map((c) => `- ${c.name} (${c.type}) [ID: ${c.id}]`).join("\n")}

### Ultimas Transacoes
${
  recentTransactions.length > 0
    ? recentTransactions
        .map(
          (t) =>
            `- ${t.date}: ${t.description} | R$ ${Number(t.amount).toFixed(2)} | ${t.type === "income" ? "RECEITA" : "DESPESA"} | ${t.category_name}${t.isInstallment ? " (PARCELA)" : ""}`
        )
        .join("\n")
    : "Nenhuma transacao recente."
}

### Parcelamentos Ativos
${
  installmentsSummary.length > 0
    ? installmentsSummary
        .map(
          (i) =>
            `- ${i.description}: R$ ${i.totalAmount.toFixed(2)} total | ${i.paidInstallments}/${i.installmentsCount} pagas | R$ ${i.monthlyAmount.toFixed(2)}/mes | ${i.type === "income" ? "RECEITA" : "DESPESA"} | Status: ${i.status}`
        )
        .join("\n")
    : "Nenhum parcelamento ativo."
}`
    : "Sem dados financeiros disponiveis no momento."
}

## DIRETRIZES
- Responda sempre em portugues brasileiro.
- Seja direto e objetivo nas respostas.
- Forneca dicas praticas de economia e investimento quando apropriado.
- Use emojis com moderacao para tornar a conversa mais amigavel.
- Se o usuario perguntar algo fora do contexto financeiro, redirecione educadamente para o tema.
- Quando analisar os dados do usuario, seja especifico com numeros e percentuais.
- Os parcelamentos fazem parte dos calculos mensais - inclua-os nas analises.
- Sugira melhorias concretas baseadas nos dados quando possivel.

## INSERIR TRANSACOES
- Quando o usuario pedir para registrar/adicionar/inserir uma transacao, use a tool addTransaction.
- Antes de inserir, confirme os dados com o usuario na mensagem (descricao, valor, tipo, conta).
- Se o usuario nao especificar a conta, use a primeira conta disponivel.
- Se o usuario nao especificar a categoria, tente inferir pela descricao e use a mais apropriada. Se nenhuma se encaixar, deixe sem categoria.
- Apos inserir com sucesso, confirme na mensagem e sugira que o usuario atualize o dashboard.`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
    tools: {
      addTransaction: tool({
        description:
          "Adiciona uma nova transacao financeira (receita ou despesa) no banco de dados do usuario. Use quando o usuario pedir para registrar, adicionar ou salvar uma transacao.",
        inputSchema: z.object({
          description: z.string().describe("Descricao da transacao, ex: 'Supermercado', 'Salario'"),
          amount: z.number().positive().describe("Valor da transacao em reais (numero positivo)"),
          type: z.enum(["income", "expense"]).describe("Tipo: 'income' para receita, 'expense' para despesa"),
          accountId: z.string().describe("ID da conta (UUID). Use a primeira conta disponivel se o usuario nao especificar."),
          categoryId: z
            .string()
            .nullable()
            .describe("ID da categoria (UUID) ou null se nao especificada"),
          date: z
            .string()
            .nullable()
            .describe("Data da transacao no formato YYYY-MM-DD. Se nao especificada, usar null para data de hoje."),
        }),
        execute: async ({ description, amount, type, accountId, categoryId, date }) => {
          if (!context?.userId) {
            return { success: false, error: "Usuario nao autenticado." }
          }

          const transactionDate = date || new Date().toISOString().split("T")[0]

          const { error } = await supabase.from("transactions").insert({
            user_id: context.userId,
            account_id: accountId,
            category_id: categoryId || null,
            description,
            amount,
            type,
            date: transactionDate,
          })

          if (error) {
            return { success: false, error: error.message }
          }

          // Atualizar saldo da conta
          const balanceChange = type === "income" ? amount : -amount
          await supabase.rpc("update_account_balance", {
            account_uuid: accountId,
            amount_change: balanceChange,
          })

          return {
            success: true,
            transaction: {
              description,
              amount,
              type,
              date: transactionDate,
              accountId,
            },
          }
        },
      }),
      getAccountBalance: tool({
        description:
          "Consulta o saldo atual de uma conta especifica do usuario.",
        inputSchema: z.object({
          accountId: z.string().describe("ID da conta (UUID)"),
        }),
        execute: async ({ accountId }) => {
          const { data, error } = await supabase
            .from("accounts")
            .select("name, balance, type")
            .eq("id", accountId)
            .single()

          if (error) return { success: false, error: error.message }
          return { success: true, account: data }
        },
      }),
    },
    maxSteps: 3,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
