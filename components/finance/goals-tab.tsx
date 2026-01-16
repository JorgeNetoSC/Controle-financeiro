"use client"

import { Plus, Target, X } from "lucide-react"
import type { Goal } from "./types"

interface GoalsTabProps {
  goals: Goal[]
  setShowModal: (modal: string | null) => void
  deleteGoal: (id: number) => void
  updateGoalProgress: (id: number, amount: number) => void
}

export function GoalsTab({ goals, setShowModal, deleteGoal, updateGoalProgress }: GoalsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Minhas Metas</h2>
        <button
          onClick={() => setShowModal("goal")}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition"
        >
          <Plus size={20} />
          Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.length === 0 ? (
          <div className="col-span-full bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-12 text-center">
            <Target className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-400">Nenhuma meta cadastrada</p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100
            const remaining = goal.target - goal.current
            return (
              <div
                key={goal.id}
                className="bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20 rounded-2xl p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{goal.name}</h3>
                    {goal.deadline && (
                      <p className="text-gray-400 text-sm">
                        Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="text-gray-400 hover:text-red-400 transition">
                    <X size={20} />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Progresso</span>
                    <span className="text-white font-semibold">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-black bg-opacity-30 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-gray-400 text-sm">Atual</p>
                    <p className="text-2xl font-bold text-white">R$ {goal.current.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Meta</p>
                    <p className="text-xl font-semibold text-gray-300">R$ {goal.target.toFixed(2)}</p>
                  </div>
                </div>

                {remaining > 0 && (
                  <p className="text-center text-gray-400 text-sm mt-4">Faltam R$ {remaining.toFixed(2)}</p>
                )}

                {progress >= 100 && (
                  <div className="mt-4 bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-3 text-center">
                    <p className="text-green-400 font-semibold">🎉 Meta alcançada!</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
