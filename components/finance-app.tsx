"use client"

import { useState, useEffect } from "react"
import { Header } from "./finance/header"
import { NavigationTabs } from "./finance/navigation-tabs"
import { DashboardTab } from "./finance/dashboard-tab"
import { TransactionsTab } from "./finance/transactions-tab"
import { AnalyticsTab } from "./finance/analytics-tab"
import { GoalsTab } from "./finance/goals-tab"
import { CardsTab } from "./finance/cards-tab"
import { TransactionModal } from "./finance/transaction-modal"
import { GoalModal } from "./finance/goal-modal"
import { CardModal } from "./finance/card-modal"
import type { Transaction, Goal, Card } from "./finance/types"

export default function FinanceApp() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [cards, setCards] = useState<Card[]>([])
  const [showModal, setShowModal] = useState<string | null>(null)

  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions")
    const savedGoals = localStorage.getItem("goals")
    const savedCards = localStorage.getItem("cards")
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions))
    if (savedGoals) setGoals(JSON.parse(savedGoals))
    if (savedCards) setCards(JSON.parse(savedCards))
  }, [])

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem("cards", JSON.stringify(cards))
  }, [cards])

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      id: Date.now(),
      ...transaction,
    }
    setTransactions([newTransaction, ...transactions])
    setShowModal(null)
  }

  const addGoal = (goal: Omit<Goal, "id">) => {
    const newGoal = {
      id: Date.now(),
      ...goal,
    }
    setGoals([...goals, newGoal])
    setShowModal(null)
  }

  const addCard = (card: Omit<Card, "id">) => {
    const newCard = {
      id: Date.now(),
      ...card,
    }
    setCards([...cards, newCard])
    setShowModal(null)
  }

  const deleteTransaction = (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id))
  }

  const deleteGoal = (id: number) => {
    setGoals(goals.filter((g) => g.id !== id))
  }

  const deleteCard = (id: number) => {
    setCards(cards.filter((c) => c.id !== id))
  }

  const updateGoalProgress = (id: number, amount: number) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, current: g.current + amount } : g)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && (
          <DashboardTab
            transactions={transactions}
            setShowModal={setShowModal}
            setActiveTab={setActiveTab}
            deleteTransaction={deleteTransaction}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsTab
            transactions={transactions}
            setShowModal={setShowModal}
            deleteTransaction={deleteTransaction}
          />
        )}

        {activeTab === "analytics" && <AnalyticsTab transactions={transactions} />}

        {activeTab === "goals" && (
          <GoalsTab
            goals={goals}
            setShowModal={setShowModal}
            deleteGoal={deleteGoal}
            updateGoalProgress={updateGoalProgress}
          />
        )}

        {activeTab === "cards" && <CardsTab cards={cards} setShowModal={setShowModal} deleteCard={deleteCard} />}
      </div>

      {showModal === "transaction" && <TransactionModal onClose={() => setShowModal(null)} onSubmit={addTransaction} />}

      {showModal === "goal" && <GoalModal onClose={() => setShowModal(null)} onSubmit={addGoal} />}

      {showModal === "card" && <CardModal onClose={() => setShowModal(null)} onSubmit={addCard} />}
    </div>
  )
}
