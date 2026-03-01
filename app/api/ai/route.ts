import {
  consumeStream,
  convertToModelMessages,
  streamText,
  UIMessage,
} from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context?: { totalIncome: number; totalExpenses: number; totalBalance: number } } = await req.json()

  const systemPrompt = `Voce e um assistente financeiro inteligente chamado FinBot. Voce ajuda os usuarios a entender e gerenciar melhor suas financas pessoais.

${context ? `Dados financeiros atuais do usuario:
- Receitas totais: R$ ${context.totalIncome.toLocaleString("pt-BR")}
- Despesas totais: R$ ${context.totalExpenses.toLocaleString("pt-BR")}
- Saldo disponivel: R$ ${context.totalBalance.toLocaleString("pt-BR")}` : "Sem dados financeiros disponiveis no momento."}

Diretrizes:
- Responda sempre em portugues brasileiro.
- Seja direto e objetivo nas respostas.
- Forneca dicas praticas de economia e investimento quando apropriado.
- Use emojis com moderacao para tornar a conversa mais amigavel.
- Se o usuario perguntar algo fora do contexto financeiro, redirecione educadamente para o tema.
- Quando analisar os dados do usuario, seja especifico com numeros e percentuais.
- Sugira melhorias concretas baseadas nos dados quando possivel.`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    consumeSseStream: consumeStream,
  })
}
