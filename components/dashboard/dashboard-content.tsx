"use client"

import { useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InstallmentsModal } from "./installments-modal"
import { TransactionModal } from "./transaction-modal"
import { InstallmentsList } from "./installments-list"
import { ProjectionsChart } from "./projections-chart"
import { TransactionsList } from "./transactions-list"
import { createClient } from "@/lib/supabase/client"
import { TrendingUp, TrendingDown, Wallet } from "lucide-react"
import { CategoryModal } from "./category-modal"

interface DashboardContentProps {
  user: User
}

interface FinancialSummary {
  totalBalance: number
  totalIncome: number
  totalExpenses: number
  expensePercentage: number
}

interface CategoryData {
  name: string
  amount: number
  percentage: number
  color: string
}

export function DashboardContent({ user }: DashboardContentProps) {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0,
    expensePercentage: 0,
  })
  const [topIncomeCategories, setTopIncomeCategories] = useState<CategoryData[]>([])
  const [topExpenseCategories, setTopExpenseCategories] = useState<CategoryData[]>([])
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; income: number; expenses: number }>>([])

  useEffect(() => {
    loadDashboardData()
  }, [user.id])

  const loadDashboardData = async () => {
    const supabase = createClient()

    // Load accounts balance
    const { data: accounts } = await supabase.from("accounts").select("balance").eq("user_id", user.id)

    let totalBalance = 0
    accounts?.forEach((acc) => {
      totalBalance += Number.parseFloat(acc.balance.toString())
    })

    // Load transactions
    const { data: transactions } = await supabase
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("user_id", user.id)

    let totalIncome = 0
    let totalExpenses = 0
    const incomeByCategory: Record<string, { amount: number; color: string }> = {}
    const expenseByCategory: Record<string, { amount: number; color: string }> = {}

    transactions?.forEach((t) => {
      const amount = Number.parseFloat(t.amount.toString())
      const categoryName = t.categories?.name || "Sem categoria"
      const categoryColor = t.categories?.color || "#6366f1"

      if (t.type === "income") {
        totalIncome += amount
        if (!incomeByCategory[categoryName]) {
          incomeByCategory[categoryName] = { amount: 0, color: categoryColor }
        }
        incomeByCategory[categoryName].amount += amount
      } else {
        totalExpenses += amount
        if (!expenseByCategory[categoryName]) {
          expenseByCategory[categoryName] = { amount: 0, color: categoryColor }
        }
        expenseByCategory[categoryName].amount += amount
      }
    })

    // Calculate top categories
    const topIncome = Object.entries(incomeByCategory)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        percentage: (data.amount / totalIncome) * 100,
        color: data.color,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    const topExpenses = Object.entries(expenseByCategory)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        percentage: (data.amount / totalExpenses) * 100,
        color: data.color,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    setSummary({
      totalBalance,
      totalIncome,
      totalExpenses,
      expensePercentage: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0,
    })
    setTopIncomeCategories(topIncome)
    setTopExpenseCategories(topExpenses)

    // Mock monthly data for the chart
    setMonthlyData([
      { month: "jul", income: 18000, expenses: 14000 },
      { month: "ago", income: 19000, expenses: 15000 },
      { month: "set", income: 20000, expenses: 14500 },
      { month: "out", income: 19500, expenses: 15500 },
      { month: "nov", income: 21000, expenses: 16000 },
      { month: "dez", income: 20300, expenses: 16084 },
    ])
  }

  // Calculate cumulative balance
  const cumulativeData = monthlyData.map((data, index) => {
    const balance = data.income - data.expenses
    const cumulative = monthlyData.slice(0, index + 1).reduce((sum, d) => sum + (d.income - d.expenses), 0)
    return { ...data, cumulative }
  })
const remainingBalance = summary.totalIncome - summary.totalExpenses

  return (
    <main className="flex-1 overflow-y-auto p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex gap-3">
            <TransactionModal userId={user.id} onSuccess={loadDashboardData} />
            <InstallmentsModal userId={user.id} onSuccess={loadDashboardData} />
            <CategoryModal userId={user.id} onSuccess={loadDashboardData} />
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="border-slate-800 bg-slate-900">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-blue-600">
              Transações
            </TabsTrigger>
            <TabsTrigger value="installments" className="data-[state=active]:bg-blue-600">
              Parcelas
            </TabsTrigger>
            <TabsTrigger value="projections" className="data-[state=active]:bg-blue-600">
              Projeções
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="group relative overflow-hidden border-slate-800 bg-slate-900 p-6 transition-transform hover:scale-105">
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-400">Saldo Restante</p>
      <Wallet
        className={`h-5 w-5 ${
          remainingBalance >= 0 ? "text-blue-500" : "text-red-500"
        }`}
      />
    </div>

    <p
      className={`text-4xl font-bold ${
        remainingBalance >= 0 ? "text-blue-400" : "text-red-400"
      }`}
    >
      R$ {remainingBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
    </p>

    <p className="text-xs text-slate-500">
      Entradas − Despesas
    </p>

    <div className="h-16">
      <svg viewBox="0 0 100 30" className="h-full w-full" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={remainingBalance >= 0 ? "#3b82f6" : "#ef4444"}
          strokeWidth="2"
          points="0,20 20,18 40,15 60,12 80,10 100,8"
          opacity="0.8"
        />
      </svg>
    </div>
  </div>
</Card>


              <Card className="group relative overflow-hidden border-slate-800 bg-slate-900 p-6 transition-transform hover:scale-105">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-400">Entradas</p>
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                  <p className="text-4xl font-bold text-white">
                    R$ {summary.totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="h-16">
                    <svg viewBox="0 0 100 30" className="h-full w-full" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        points="0,25 20,23 40,20 60,18 80,15 100,10"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                </div>
              </Card>

              <Card className="group relative overflow-hidden border-slate-800 bg-slate-900 p-6 transition-transform hover:scale-105">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-400">Despesas</p>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-red-500" />
                      <span className="text-xs text-slate-500">{summary.expensePercentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <p className="text-4xl font-bold text-white">
                    R$ {summary.totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="h-16">
                    <svg viewBox="0 0 100 30" className="h-full w-full" preserveAspectRatio="none">
                      <polyline
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        points="0,15 20,18 40,12 60,20 80,10 100,8"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            </div>

            {/* Category Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-slate-800 bg-slate-900 p-6">
                <h3 className="mb-6 text-lg font-semibold text-white">Top 5 Entradas por categoria</h3>
                <div className="flex h-64 items-center justify-center">
                  <div className="relative h-48 w-48">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="20" />
                      {topIncomeCategories.map((category, index) => {
                        const circumference = 2 * Math.PI * 40
                        const dashArray = (category.percentage / 100) * circumference
                        const prevPercentage = topIncomeCategories
                          .slice(0, index)
                          .reduce((sum, cat) => sum + cat.percentage, 0)
                        const dashOffset = -(prevPercentage / 100) * circumference

                        return (
                          <circle
                            key={category.name}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={category.color}
                            strokeWidth="20"
                            strokeDasharray={`${dashArray} ${circumference}`}
                            strokeDashoffset={dashOffset}
                          />
                        )
                      })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="text-lg font-bold text-white">R$ {(summary.totalIncome / 1000).toFixed(1)}k</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  {topIncomeCategories.slice(0, 3).map((category) => (
                    <div key={category.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-slate-400">{category.name}</span>
                      </div>
                      <span className="text-slate-300">
                        R$ {(category.amount / 1000).toFixed(1)}k ({category.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-slate-800 bg-slate-900 p-6">
                <h3 className="mb-6 text-lg font-semibold text-white">Top 5 Despesas por categoria</h3>
                <div className="flex h-64 items-center justify-center">
                  <div className="relative h-48 w-48">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="20" />
                      {topExpenseCategories.map((category, index) => {
                        const circumference = 2 * Math.PI * 40
                        const dashArray = (category.percentage / 100) * circumference
                        const prevPercentage = topExpenseCategories
                          .slice(0, index)
                          .reduce((sum, cat) => sum + cat.percentage, 0)
                        const dashOffset = -(prevPercentage / 100) * circumference

                        return (
                          <circle
                            key={category.name}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={category.color}
                            strokeWidth="20"
                            strokeDasharray={`${dashArray} ${circumference}`}
                            strokeDashoffset={dashOffset}
                          />
                        )
                      })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="text-lg font-bold text-white">R$ {(summary.totalExpenses / 1000).toFixed(1)}k</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  {topExpenseCategories.slice(0, 3).map((category) => (
                    <div key={category.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-slate-400">{category.name}</span>
                      </div>
                      <span className="text-slate-300">
                        R$ {(category.amount / 1000).toFixed(1)}k ({category.percentage.toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="border-slate-800 bg-slate-900 p-6">
              <h3 className="mb-6 text-lg font-semibold text-white">Saldo Acumulado</h3>
              <div className="relative h-80">
                <svg viewBox="0 0 1000 300" className="h-full w-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#214989ff" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[0, 1, 2, 3, 4].map((i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={60 * i}
                      x2="1000"
                      y2={60 * i}
                      stroke="#1e293b"
                      strokeWidth="1"
                      opacity="0.5"
                    />
                  ))}

                  {/* Area fill */}
                  <polyline
                    fill="url(#balanceGradient)"
                    stroke="none"
                    points={`0,250 ${cumulativeData.map((d, i) => `${(i / (cumulativeData.length - 1)) * 1000},${250 - (d.cumulative / Math.max(...cumulativeData.map((d) => d.cumulative))) * 200}`).join(" ")} 1000,300 0,300`}
                  />

                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    points={cumulativeData
                      .map(
                        (d, i) =>
                          `${(i / (cumulativeData.length - 1)) * 1000},${250 - (d.cumulative / Math.max(...cumulativeData.map((d) => d.cumulative))) * 200}`,
                      )
                      .join(" ")}
                  />

                  {/* Data points */}
                  {cumulativeData.map((d, i) => (
                    <circle
                      key={i}
                      cx={(i / (cumulativeData.length - 1)) * 1000}
                      cy={250 - (d.cumulative / Math.max(...cumulativeData.map((d) => d.cumulative))) * 200}
                      r="5"
                      fill="#3b82f6"
                      stroke="#1e293b"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-slate-500">
                  {monthlyData.map((data) => (
                    <span key={data.month}>{data.month}</span>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-slate-400">Entradas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-slate-400">Despesas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-slate-400">Saldo</span>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsList userId={user.id} />
          </TabsContent>

          <TabsContent value="installments">
            <InstallmentsList userId={user.id} />
          </TabsContent>

          <TabsContent value="projections">
            <ProjectionsChart userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
