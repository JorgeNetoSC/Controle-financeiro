"use client"

import { useState, useEffect, useCallback } from "react"
import { TrendingUp, Wallet, LayoutDashboard, Receipt, Layers, Bot } from "lucide-react"
import { TransactionsList } from "./transactions-list"
import { InstallmentsList } from "./installments-list"
import { BalanceMascot } from "./balance-mascot"
import { EvolutionChart } from "./evolution-chart"
import { AssistantTab } from "./assistant-tab"
import { PeriodFilter } from "./period-filter"
import { CategoryChart } from "./category-chart"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface DashboardContentProps {
  userId?: string
  user: User
  activeTab: any
  setActiveTab: (tab: any) => void
}

export function DashboardContent({ userId, user, activeTab, setActiveTab }: DashboardContentProps) {
  const effectiveUserId = userId || user?.id
  const now = new Date()

  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const handlePeriodChange = (m: number, y: number) => {
    setMonth(m)
    setYear(y)
  }

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalBalance: 0,
    pendingInstallmentsTotal: 0,
    combinedItems: [] as any[],
    installmentsSummary: [] as any[],
    categoryData: [] as { name: string; value: number }[],
  })

  const supabase = createClient()

  const loadData = useCallback(async () => {
    if (!effectiveUserId) return

    try {
      setLoading(true)

      const start = `${year}-${String(month).padStart(2, "0")}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`

      const [transRes, instItemsRes, instRes] = await Promise.all([
        supabase
          .from("transactions")
          .select("*, categories(name)")
          .eq("user_id", effectiveUserId)
          .gte("date", start)
          .lte("date", end),
        supabase
          .from("installment_items")
          .select("*, installments(description, type, category_id)")
          .eq("user_id", effectiveUserId)
          .gte("due_date", start)
          .lte("due_date", end),
        supabase
          .from("installments")
          .select("*")
          .eq("user_id", effectiveUserId)
          .eq("status", "active"),
      ])

      const normalTrans = (transRes.data || []).map((t) => ({
        ...t,
        category_name: t.categories?.name || "Geral",
        isInstallment: false,
        date: t.date,
      }))

      const mappedInst = (instItemsRes.data || []).map((i) => ({
        id: i.id,
        description: i.installments?.description || "Parcela",
        amount: i.amount,
        date: i.due_date,
        type: i.installments?.type || "expense",
        status: i.status || "pending",
        category_name: "Geral",
        isInstallment: true,
        installment_id: i.installment_id,
      }))

      const combined = [...normalTrans, ...mappedInst].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      const income = combined
        .filter((i) => i.type === "income")
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

      const paidExpenses = combined
        .filter((i) => i.type === "expense" && i.status !== "pending")
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

      const pendingInstallmentsTotal = mappedInst
        .filter((i) => i.type === "expense" && i.status === "pending")
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

      const totalExpenses = paidExpenses + pendingInstallmentsTotal

      const installmentsSummary = (instRes.data || []).map((inst) => ({
        description: inst.description,
        totalAmount: Number(inst.total_amount),
        installmentsCount: inst.installments_count || inst.total_installments,
        paidInstallments: inst.paid_installments || 0,
        type: inst.type,
        status: inst.status,
        monthlyAmount: Number(
          inst.installment_amount ||
          inst.total_amount / (inst.installments_count || 1)
        ),
      }))

      const categoryMap: Record<string, number> = {}
      for (const item of combined) {
        if (item.type !== "expense") continue
        const cat = item.category_name || "Geral"
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(item.amount)
      }
      const categoryData = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)

      setData({
        totalIncome: income,
        totalExpenses,
        totalBalance: income - totalExpenses,
        pendingInstallmentsTotal,
        combinedItems: combined,
        installmentsSummary,
        categoryData,
      })
    } catch (error) {
      console.error("Erro no Dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [effectiveUserId, month, year])

  useEffect(() => {
    loadData()
  }, [loadData])

  const isFutureMonth =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth() + 1)

  const chartData = data.combinedItems
    .reduce((acc: any[], item) => {
      const dateLabel = new Date(item.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      })
      const existing = acc.find((a) => a.date === dateLabel)
      if (existing) {
        if (item.type === "income") existing.income += Number(item.amount)
        else existing.expenses += Number(item.amount)
      } else {
        acc.push({
          date: dateLabel,
          income: item.type === "income" ? Number(item.amount) : 0,
          expenses: item.type === "expense" ? Number(item.amount) : 0,
        })
      }
      return acc
    }, [])
    .slice(0, 7)
    .reverse()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-black italic uppercase tracking-[0.3em] text-[10px]">
          Sincronizando HUB...
        </p>
      </div>
    )
  }

  const COLORS = ["#3b82f6","#ef4444","#f59e0b","#22c55e","#8b5cf6","#ec4899"]

  return (
    <div className="max-w-7xl mx-auto space-y-10">

      {/* HEADER DE NAVEGAÇÃO */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0d1117]/50 p-4 rounded-[24px] border border-gray-800/50">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            MY<span className="text-blue-500">WALLET</span>
          </h1>
        </div>
        <nav className="flex bg-[#161b22] p-1 rounded-2xl border border-gray-800">
          {[
            { key: "geral", icon: <LayoutDashboard size={14} />, label: "Início" },
            { key: "transacoes", icon: <Receipt size={14} />, label: "Extrato" },
            { key: "parcelas", icon: <Layers size={14} />, label: "Parcelas" },
            { key: "assistente", icon: <Bot size={14} />, label: "FinBot" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ABA INÍCIO */}
      {activeTab === "geral" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* FILTRO DE MÊS */}
          <PeriodFilter month={month} year={year} onChange={handlePeriodChange} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RESUMO FINANCEIRO */}
            <div className="bg-[#161b22] border border-gray-800 rounded-[40px] p-8 flex flex-col justify-between shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                    Resumo Mensal
                  </h3>
                  <p className="text-gray-600 text-[9px] font-bold uppercase mt-0.5 capitalize">
                    {["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][month - 1]} {year}
                    {isFutureMonth && " · Projeção"}
                  </p>
                </div>
                <Wallet size={20} className="text-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0d1117] rounded-[20px] border border-gray-800">
                  <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Receitas</span>
                  <span className="text-green-500 font-black text-xl italic">
                    R$ {data.totalIncome.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-[20px] border border-gray-800">
                  <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Despesas</span>
                  <span className="text-red-500 font-black text-xl italic">
                    R$ {data.totalExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {data.pendingInstallmentsTotal > 0 && (
                <div className="mt-4 p-3 bg-amber-950/30 border border-amber-800/40 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-amber-500/80 uppercase block">
                      Parcelas pendentes
                    </span>
                    <span className="text-amber-400 font-black text-sm">
                      R$ {data.pendingInstallmentsTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-amber-500/50 text-[9px] font-black uppercase">
                    Ainda não pagas
                  </span>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-gray-800">
                <p className="text-[10px] font-black text-gray-500 uppercase italic">
                  {isFutureMonth ? "Saldo Projetado" : "Saldo Disponível"}
                </p>
                <p className={`text-3xl font-black tracking-tighter ${
                  data.totalBalance >= 0 ? "text-white" : "text-red-400"
                }`}>
                  R$ {data.totalBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {/* SAÚDE FINANCEIRA */}
            <div className="bg-[#161b22] border border-gray-800 rounded-[40px] p-8 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125">
                <BalanceMascot income={data.totalIncome} totalBalance={data.totalBalance} />
              </div>
              <div>
                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">
                  Saúde Financeira
                </h3>
                <p className="text-6xl font-black text-white italic tracking-tighter">
                  {data.totalIncome > 0
                    ? Math.max(0, (data.totalBalance / data.totalIncome) * 100).toFixed(0)
                    : 0}%
                </p>
              </div>
              <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800 mt-6 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{
                    width: `${Math.max(0, Math.min(100, (data.totalBalance / data.totalIncome) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* FLUXO + GRÁFICO DE BARRAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#161b22] border border-gray-800 rounded-[40px] p-8">
              <h3 className="text-white font-black uppercase italic tracking-widest text-[10px] mb-6">
                Fluxo do Mês
              </h3>
              <TransactionsList
                transactions={data.combinedItems.slice(0, 5)}
                onRefresh={loadData}
              />
            </div>
            <div className="lg:col-span-2 bg-[#161b22] border border-gray-800 rounded-[40px] p-8 shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-white font-black uppercase italic tracking-widest text-sm">
                    Análise de Fluxo
                  </h3>
                  <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">
                    Ganhos vs Gastos por período
                  </p>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-xl">
                  <TrendingUp size={16} className="text-blue-500" />
                </div>
              </div>
              <EvolutionChart data={chartData} />
            </div>
          </div>

          {/* GRÁFICO DE CATEGORIAS */}
          {data.categoryData.length > 0 && (
            <div className="bg-[#161b22] border border-gray-800 rounded-[40px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-white font-black uppercase italic tracking-widest text-sm">
                    Gastos por Categoria
                  </h3>
                  <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">
                    Distribuição das despesas do mês
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <CategoryChart data={data.categoryData} />
                <div className="grid gap-3">
                  {data.categoryData.map((cat, i) => {
                    const pct = data.totalExpenses > 0
                      ? ((cat.value / data.totalExpenses) * 100).toFixed(1)
                      : "0"
                    return (
                      <div key={cat.name} className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-400 text-xs truncate">{cat.name}</span>
                            <span className="text-white text-xs font-black ml-2 shrink-0">
                              {pct}%
                            </span>
                          </div>
                          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: COLORS[i % COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-gray-500 text-[10px] font-bold shrink-0">
                          R$ {cat.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ABA EXTRATO */}
      {activeTab === "transacoes" && (
        <div className="space-y-4 animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between">
            <PeriodFilter month={month} year={year} onChange={handlePeriodChange} />
            <span className="text-gray-600 text-[10px] font-black uppercase">
              {data.combinedItems.length} itens
            </span>
          </div>
          <div className="bg-[#161b22] border border-gray-800 rounded-[40px] p-8 shadow-2xl">
            <TransactionsList transactions={data.combinedItems} onRefresh={loadData} />
          </div>
        </div>
      )}

      {/* ABA PARCELAS */}
      {activeTab === "parcelas" && (
        <div className="animate-in slide-in-from-right-8 duration-600">
          <InstallmentsList userId={effectiveUserId} onSuccess={loadData} />
        </div>
      )}

      {/* ABA ASSISTENTE */}
      {activeTab === "assistente" && (
        <AssistantTab
          totalIncome={data.totalIncome}
          totalExpenses={data.totalExpenses}
          totalBalance={data.totalBalance}
          userId={effectiveUserId || ""}
          transactions={data.combinedItems}
          installmentsSummary={data.installmentsSummary}
          onTransactionCreated={loadData}
        />
      )}
    </div>
  )
}