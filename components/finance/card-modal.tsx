"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { Card } from "./types"

interface CardModalProps {
  onClose: () => void
  onSubmit: (card: Omit<Card, "id">) => void
}

export function CardModal({ onClose, onSubmit }: CardModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    limit: "",
    spent: "0",
    dueDay: "",
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.limit || !formData.dueDay) {
      alert("Preencha todos os campos")
      return
    }
    onSubmit({
      name: formData.name,
      limit: Number.parseFloat(formData.limit),
      spent: Number.parseFloat(formData.spent),
      dueDay: formData.dueDay,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white border-opacity-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Novo Cartão</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Cartão</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Nubank"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Limite (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.limit}
              onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="10000,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valor Gasto (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.spent}
              onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Dia do Vencimento</label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.dueDay}
              onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="15"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition shadow-lg"
          >
            Adicionar Cartão
          </button>
        </div>
      </div>
    </div>
  )
}
