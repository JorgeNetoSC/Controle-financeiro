"use client"

import { useEffect, useState, Dispatch, SetStateAction } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { OverviewCharts } from "./overview-charts"
import { PeriodFilter } from "./period-filter"
import { TransactionsList } from "./transactions-list"
import { InstallmentsList } from "./installments-list"

interface DashboardContentProps {
  user: User;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export function DashboardContent({ user, activeTab, setActiveTab }: DashboardContentProps) {
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  
  const [data, setData] = useState({
    income: 0,
    expenses: 0,
    categories: [] as any[],
    monthly: [] as any[],
    combinedItems: [] as any[]
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      // Procura Transações Simples e Parcelas que vencem neste mês
      const [transRes, instRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, categories(name, color)')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate),
        supabase
          .from('installments')
          .select('*, categories(name, color)')
          .eq('user_id', user.id)
          .gte('due_date', startDate)
          .lte('due_date', endDate)
      ])

      // Normaliza os dados das duas tabelas para um único formato
      const normalizedTransactions = (transRes.data || []).map(t => ({
        ...t,
        category_name: t.categories?.name || 'Geral',
        isInstallment: false
      }))

      const normalizedInstallments = (instRes.data || []).map(i => ({
        ...i,
        date: i.due_date, // Para a lista usar a mesma propriedade
        description: `${i.description} (${i.installment_number}/${i.total_installments || '?'})`,
        category_name: i.categories?.name || 'Parcela',
        isInstallment: true
      }))

      const allItems = [...normalizedTransactions, ...normalizedInstallments]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      let inc = 0, exp = 0
      const catMap: any = {}

      allItems.forEach(t => {
        const val = Number(t.amount)
        if (t.type === 'income') {
          inc += val
        } else {
          exp += val
          const catName = t.category_name
          catMap[catName] = (catMap[catName] || 0) + val
        }
      })

      setData({
        income: inc,
        expenses: exp,
        categories: Object.keys(catMap).map(name => ({
          name,
          value: catMap[name],
          color: allItems.find(t => t.category_name === name)?.categories?.color || '#3b82f6'
        })),
        monthly: [{ name: 'Resumo', entradas: inc, despesas: exp }],
        combinedItems: allItems
      })
    }
    loadData()
  }, [month, year, user.id, activeTab]) // Recarrega ao mudar de aba

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Resumo Financeiro</h1>
          <p className="text-gray-400 text-sm">Controlo de {month}/{year}</p>
        </div>
        <PeriodFilter 
          month={month} 
          year={year} 
          onChange={(m, y) => { setMonth(m); setYear(y); }} 
        />
      </div>

      <div className="w-full">
        {activeTab === 'geral' && (
          <div className="animate-in fade-in duration-500">
            <OverviewCharts 
              income={data.income} 
              expenses={data.expenses} 
              categoriesData={data.categories}
              monthlyData={data.monthly}
            />
          </div>
        )}

        {activeTab === 'transacoes' && (
          <div className="animate-in fade-in duration-500 bg-[#161b22] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-6">Extrato Unificado (Com Parcelas)</h3>
            <TransactionsList transactions={data.combinedItems} />
          </div>
        )}

        {activeTab === 'parcelas' && (
          <div className="animate-in fade-in duration-500 bg-[#161b22] border border-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-6">Gestão de Carnês / Parcelamentos</h3>
            <InstallmentsList userId={user.id} />
          </div>
        )}
      </div>
    </div>
  )
}