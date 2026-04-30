"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import {
  Bot, Send, Sparkles, Trash2, ArrowDown,
  CheckCircle, XCircle, RefreshCw,
  TrendingUp, TrendingDown, CreditCard, Wallet,
} from "lucide-react"

interface TransactionItem {
  description: string
  amount: number
  type: string
  date: string
  category_name: string
  isInstallment: boolean
  status?: string
}

interface InstallmentSummary {
  description: string
  totalAmount: number
  installmentsCount: number
  paidInstallments: number
  type: string
  status: string
  monthlyAmount: number
}

export interface AssistantTabProps {
  totalIncome: number
  totalExpenses: number
  totalBalance: number
  userId: string
  transactions: TransactionItem[]
  installmentsSummary: InstallmentSummary[]
  onTransactionCreated?: () => void
}

function getMessageText(message: {
  parts?: Array<{ type: string; text?: string }>
}): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter(
      (p): p is { type: "text"; text: string } =>
        p.type === "text" && typeof p.text === "string"
    )
    .map((p) => p.text)
    .join("")
}

function ToolResultCard({ part }: { part: any }) {
  const result = part.result
  if (!result) return null

  if (part.toolName === "addTransaction") {
    if (result.success) {
      const isIncome = result.transaction?.type === "income"
      return (
        <div className="bg-green-950/40 border border-green-800/50 rounded-xl p-3 my-2">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-green-400 text-[10px] font-black uppercase">Transação Registrada</span>
          </div>
          <div className="flex items-center gap-2">
            {isIncome
              ? <TrendingUp size={12} className="text-green-400" />
              : <TrendingDown size={12} className="text-red-400" />}
            <p className="text-green-200 text-xs">
              {isIncome ? "Receita" : "Despesa"}: {result.transaction?.description} — R$ {Number(result.transaction?.amount).toFixed(2)}
            </p>
          </div>
        </div>
      )
    }
    return (
      <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-3 my-2">
        <div className="flex items-center gap-2 mb-1">
          <XCircle size={14} className="text-red-400" />
          <span className="text-red-400 text-[10px] font-black uppercase">Erro ao Registrar</span>
        </div>
        <p className="text-red-200 text-xs">{result.error}</p>
      </div>
    )
  }

  if (part.toolName === "addInstallment") {
    if (result.success) {
      return (
        <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3 my-2">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={14} className="text-purple-400" />
            <span className="text-purple-400 text-[10px] font-black uppercase">Parcelamento Cadastrado</span>
          </div>
          <p className="text-purple-200 text-xs">{result.installmentsCreated}x parcelas criadas</p>
          <p className="text-purple-300/70 text-[10px] mt-0.5">De {result.firstDue} até {result.lastDue}</p>
        </div>
      )
    }
    return (
      <div className="bg-red-950/40 border border-red-800/50 rounded-xl p-3 my-2">
        <div className="flex items-center gap-2 mb-1">
          <XCircle size={14} className="text-red-400" />
          <span className="text-red-400 text-[10px] font-black uppercase">Erro no Parcelamento</span>
        </div>
        <p className="text-red-200 text-xs">{result.error}</p>
      </div>
    )
  }

  if (part.toolName === "getMonthlyForecast" && result.success) {
    const isPositive = result.balance >= 0
    return (
      <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-3 my-2">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={14} className="text-blue-400" />
          <span className="text-blue-400 text-[10px] font-black uppercase">
            Fechamento — {result.month}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-green-400 text-xs font-bold">R$ {Number(result.income).toFixed(2)}</p>
            <p className="text-gray-500 text-[9px] uppercase">Receitas</p>
          </div>
          <div>
            <p className="text-red-400 text-xs font-bold">R$ {Number(result.expenses).toFixed(2)}</p>
            <p className="text-gray-500 text-[9px] uppercase">Despesas</p>
          </div>
          <div>
            <p className={`text-xs font-bold ${isPositive ? "text-green-400" : "text-red-400"}`}>
              {isPositive ? "+" : ""}R$ {Number(result.balance).toFixed(2)}
            </p>
            <p className="text-gray-500 text-[9px] uppercase">Saldo</p>
          </div>
        </div>
      </div>
    )
  }

  if (part.toolName === "getAccountBalance" && result.success) {
    return (
      <div className="bg-blue-950/40 border border-blue-800/50 rounded-xl p-3 my-2">
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={14} className="text-blue-400" />
          <span className="text-blue-400 text-[10px] font-black uppercase">Saldo da Conta</span>
        </div>
        <p className="text-blue-200 text-xs">
          {result.account.name}: R$ {Number(result.account.balance).toFixed(2)}
        </p>
      </div>
    )
  }

  return null
}

export function AssistantTab({
  totalIncome,
  totalExpenses,
  totalBalance,
  userId,
  transactions,
  installmentsSummary,
  onTransactionCreated,
}: AssistantTabProps) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollDown, setShowScrollDown] = useState(false)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai",
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          messages,
          id,
          context: {
            totalIncome,
            totalExpenses,
            totalBalance,
            userId,
            transactions: transactions.slice(0, 15).map((t) => ({
              description: t.description,
              amount: t.amount,
              type: t.type,
              date: t.date,
              category_name: t.category_name,
              isInstallment: t.isInstallment,
              status: t.status,
            })),
            installmentsSummary,
          },
        },
      }),
    }),
    onFinish: () => {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg?.parts) {
        const hasNewData = lastMsg.parts.some(
          (p: any) =>
            p.type === "tool-invocation" &&
            (p.toolName === "addTransaction" || p.toolName === "addInstallment") &&
            p.result?.success
        )
        if (hasNewData) onTransactionCreated?.()
      }
    },
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg?.role === "assistant" && lastMsg.parts) {
        const hasNewData = lastMsg.parts.some(
          (p: any) =>
            p.type === "tool-invocation" &&
            (p.toolName === "addTransaction" || p.toolName === "addInstallment") &&
            p.state === "output-available" &&
            p.result?.success
        )
        if (hasNewData) onTransactionCreated?.()
      }
    }
  }, [isLoading, messages, onTransactionCreated])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100)
  }

  const suggestions = [
    "Como estão minhas finanças este mês?",
    "Registrar despesa de R$50 no supermercado",
    "Como vai ser meu fechamento de maio?",
    "Comprei TV em 12x de R$180, começa em 10/06",
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-[#161b22] border border-gray-800 rounded-t-[24px] p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2.5 rounded-xl">
            <Bot size={22} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-black uppercase tracking-wider text-xs">FinBot Assistente</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">
              {isLoading ? "Processando..." : "Online · Transações, parcelas e projeções"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onTransactionCreated && (
            <button
              onClick={onTransactionCreated}
              className="text-gray-600 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-blue-400/10"
            >
              <RefreshCw size={16} />
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="text-gray-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto bg-[#0d1117] border-x border-gray-800 p-4 space-y-4 relative"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="bg-blue-600/10 p-5 rounded-2xl mb-5 border border-blue-500/20">
              <Sparkles size={36} className="text-blue-400" />
            </div>
            <h3 className="text-white font-black text-lg mb-2">Olá! Sou o FinBot</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-2">
              Registre transações, parcelamentos, consulte projeções ou peça análises.
            </p>
            <p className="text-blue-400/70 text-xs max-w-sm mb-6">
              Também disponível via WhatsApp — cadastre seu número no perfil.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage({ text: s })}
                  className="text-left bg-[#161b22] border border-gray-800 rounded-xl p-3 text-gray-400 text-xs hover:border-blue-500/50 hover:text-blue-400 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const text = getMessageText(message)
            const isUser = message.role === "user"
            const toolParts =
              message.parts?.filter(
                (p: any) => p.type === "tool-invocation" && p.state === "output-available"
              ) || []

            if (!text && toolParts.length === 0) return null

            return (
              <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    isUser
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-[#161b22] border border-gray-800 text-gray-200 rounded-bl-sm"
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Bot size={12} className="text-blue-400" />
                      <span className="text-blue-400 text-[10px] font-black uppercase">FinBot</span>
                    </div>
                  )}
                  {toolParts.map((part: any, idx: number) => (
                    <ToolResultCard key={idx} part={part} />
                  ))}
                  {text && <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>}
                </div>
              </div>
            )
          })
        )}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="bg-[#161b22] border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Bot size={12} className="text-blue-400" />
                <span className="text-blue-400 text-[10px] font-black uppercase">FinBot</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[0, 150, 300].map((delay) => (
                  <div
                    key={delay}
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {showScrollDown && (
          <button
            onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10"
          >
            <ArrowDown size={16} />
          </button>
        )}
      </div>

      <div className="bg-[#161b22] border border-gray-800 rounded-b-[24px] p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!input.trim() || isLoading) return
            sendMessage({ text: input })
            setInput("")
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: 'Gastei 280 no mercado débito' ou 'Como fica maio?'"
            disabled={isLoading}
            className="flex-1 bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 text-white p-3 rounded-xl transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}