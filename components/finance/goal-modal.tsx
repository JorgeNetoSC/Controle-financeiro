"use client"

import { useState } from "react"
import { X } from "lucide-react"
import type { Goal } from "./types"

interface GoalModalProps {
  onClose: () => void
  onSubmit: (goal: Omit<Goal, "id">) => void
}

export function GoalModal({ onClose, onSubmit }: GoalModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    target: "",
    current: "0",
    deadline: "",
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.target) {
      alert("Preencha os campos obrigatórios")
      return
    }
    onSubmit({
      name: formData.name,
      target: Number.parseFloat(formData.target),
      current: Number.parseFloat(formData.current),
      deadline: formData.deadline || undefined,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white border-opacity-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Nova Meta</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome da Meta</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Viagem"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valor Alvo (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="5000,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valor Inicial (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Prazo (Opcional)</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition shadow-lg"
          >
            Criar Meta
          </button>
        </div>
      </div>
    </div>
  )
}
