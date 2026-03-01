"use client"

import { Plus, CreditCard, X } from "lucide-react"
import type { Card } from "./types"

interface CardsTabProps {
  cards: Card[]
  setShowModal: (modal: string | null) => void
  deleteCard: (id: number) => void
}

export function CardsTab({ cards, setShowModal, deleteCard }: CardsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Meus Cartões</h2>
        <button
          onClick={() => setShowModal("card")}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition"
        >
          <Plus size={20} />
          Novo Cartão
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.length === 0 ? (
          <div className="col-span-full bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-12 text-center">
            <CreditCard className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-400">Nenhum cartão cadastrado</p>
          </div>
        ) : (
          cards.map((card) => {
            const usage = (card.spent / card.limit) * 100
            const remaining = card.limit - card.spent
            return (
              <div key={card.id} className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 shadow-2xl">
                <div className="flex justify-between items-start mb-6">
                  <CreditCard className="text-white" size={32} />
                  <button onClick={() => deleteCard(card.id)} className="text-white hover:text-red-200 transition">
                    <X size={20} />
                  </button>
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">{card.name}</h3>
                <p className="text-purple-100 text-sm mb-6">Vencimento dia {card.dueDay}</p>

                <div className="bg-white bg-opacity-20 rounded-xl p-4 mb-4">
                  <p className="text-purple-100 text-sm">Disponível</p>
                  <p className="text-3xl font-bold text-white">R$ {remaining.toFixed(2)}</p>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-purple-100">Utilizado</span>
                    <span className="text-white font-semibold">{usage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-20 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        usage > 80 ? "bg-red-400" : usage > 50 ? "bg-yellow-400" : "bg-green-400"
                      }`}
                      style={{ width: `${Math.min(usage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm text-purple-100">
                  <span>R$ {card.spent.toFixed(2)} gasto</span>
                  <span>Limite R$ {card.limit.toFixed(2)}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
