"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Bot, Send, Sparkles, Trash2, ArrowDown } from "lucide-react"

interface AssistantTabProps {
  totalIncome: number
  totalExpenses: number
  totalBalance: number
}

function getMessageText(message: { parts?: Array<{ type: string; text?: string }> }): string {
  if (!message.parts || !Array.isArray(message.parts)) return ""
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

export function AssistantTab({ totalIncome, totalExpenses, totalBalance }: AssistantTabProps) {
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
          context: { totalIncome, totalExpenses, totalBalance },
        },
      }),
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const suggestions = [
    "Como estao minhas financas?",
    "Dicas para economizar",
    "Analise meu saldo",
    "Como posso investir?",
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-220px)] md:h-[calc(100vh-160px)] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="bg-[#161b22] border border-gray-800 rounded-t-[24px] p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/20 p-2.5 rounded-xl">
            <Bot size={22} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-white font-black uppercase tracking-wider text-xs">
              FinBot Assistente
            </h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">
              {isLoading ? "Digitando..." : "Online"}
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-gray-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10"
            title="Limpar conversa"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Messages */}
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
            <h3 className="text-white font-black text-lg mb-2">
              Ola! Sou o FinBot
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
              Seu assistente financeiro pessoal. Pergunte sobre suas financas, peca dicas de economia ou analises dos seus gastos.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    sendMessage({ text: suggestion })
                  }}
                  className="text-left bg-[#161b22] border border-gray-800 rounded-xl p-3 text-gray-400 text-xs hover:border-blue-500/50 hover:text-blue-400 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const text = getMessageText(message)
            if (!text) return null

            const isUser = message.role === "user"

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
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
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{text}</p>
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
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />

        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="sticky bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10"
          >
            <ArrowDown size={16} />
          </button>
        )}
      </div>

      {/* Input */}
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
            placeholder="Digite sua pergunta..."
            disabled={isLoading}
            className="flex-1 bg-[#0d1117] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-blue-600 text-white p-3 rounded-xl transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}
