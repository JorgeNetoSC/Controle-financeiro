"use client"

import { useState } from "react"
import { X, TrendingUp, TrendingDown } from "lucide-react"
import { CATEGORIES, type Transaction } from "./types"

interface TransactionModalProps {
  onClose: () => void
  onSubmit: (transaction: Omit<Transaction, "id">) => void
}

export function TransactionModal({ onClose, onSubmit }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    description: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  })

  const handleSubmit = () => {
    if (!formData.description || !formData.amount || !formData.category) {
      alert("Preencha todos os campos")
      return
    }
    onSubmit({
      ...formData,
      amount: Number.parseFloat(formData.amount),
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-white border-opacity-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Nova Transação</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormData({ ...formData, type: "expense", category: "" })}
                className={`p-3 rounded-lg border-2 transition ${formData.type === "expense" ? "border-red-500 bg-red-500 bg-opacity-20" : "border-gray-600 bg-gray-800"}`}
              >
                <TrendingDown
                  className={`mx-auto mb-1 ${formData.type === "expense" ? "text-red-400" : "text-gray-400"}`}
                  size={24}
                />
                <span
                  className={`text-sm font-medium ${formData.type === "expense" ? "text-red-300" : "text-gray-400"}`}
                >
                  Despesa
                </span>
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: "income", category: "" })}
                className={`p-3 rounded-lg border-2 transition ${formData.type === "income" ? "border-green-500 bg-green-500 bg-opacity-20" : "border-gray-600 bg-gray-800"}`}
              >
                <TrendingUp
                  className={`mx-auto mb-1 ${formData.type === "income" ? "text-green-400" : "text-gray-400"}`}
                  size={24}
                />
                <span
                  className={`text-sm font-medium ${formData.type === "income" ? "text-green-300" : "text-gray-400"}`}
                >
                  Receita
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ex: Supermercado"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0,00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Categoria</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Selecione</option>
              {CATEGORIES[formData.type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Data</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition shadow-lg"
          >
            Adicionar Transação
          </button>
        </div>
      </div>
    </div>
  )
}
