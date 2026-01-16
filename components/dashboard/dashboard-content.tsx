"use client"

import { useEffect, useState, Dispatch, SetStateAction } from "react"
import type { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { OverviewCharts } from "./overview-charts"
import { PeriodFilter } from "./period-filter"
import { TransactionsList } from "./transactions-list"
import { InstallmentsList } from "./installments-list"

// Interface atualizada para resolver o erro ts(2322)
interface DashboardContentProps {
  user: User;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
}

export function DashboardContent({ user, activeTab, setActiveTab }: DashboardContentProps) {
  // Estados para o Filtro de Período
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  
  // Estado para armazenar os dados do banco
  const [data, setData] = useState({
    income: 0,
    expenses: 0,
    categories: [] as any[],
    monthly: [] as any[]
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      // Define o intervalo do mês selecionado
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const { data: transactions } = await supabase
        .from('transactions')
        .select('*, categories(name, color)')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)

      if (transactions) {
        let inc = 0, exp = 0
        const catMap: any = {}

        transactions.forEach(t => {
          const val = Number(t.amount)
          if (t.type === 'income') {
            inc += val
          } else {
            exp += val
            const catName = t.categories?.name || 'Outros'
            catMap[catName] = (catMap[catName] || 0) + val
          }
        })

        setData({
          income: inc,
          expenses: exp,
          categories: Object.keys(catMap).map(name => ({
            name,
            value: catMap[name],
            color: transactions.find(t => t.categories?.name === name)?.categories?.color || '#3b82f6'
          })),
          monthly: [{ name: 'Mês Atual', entradas: inc, despesas: exp }]
        })
      }
    }
    loadData()
  }, [month, year, user.id])

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho Responsivo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Resumo Financeiro</h1>
          <p className="text-gray-400 text-sm">Olá, {user.email?.split('@')[0]}</p>
        </div>
        <PeriodFilter 
          month={month} 
          year={year} 
          onChange={(m, y) => { setMonth(m); setYear(y); }} 
        />
      </div>

      {/* Renderização Condicional das Abas */}
      <div className="w-full pb-10">
        {activeTab === 'geral' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OverviewCharts 
              income={data.income} 
              expenses={data.expenses} 
              categoriesData={data.categories}
              monthlyData={data.monthly}
            />
          </div>
        )}

        {activeTab === 'transacoes' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-bold">Extrato de Transações</h3>
            </div>
            <TransactionsList userId={user.id} />
          </div>
        )}

        {activeTab === 'parcelas' && (
          <div className="animate-in fade-in duration-500">
            <h3 className="text-lg font-bold mb-4">Gerenciamento de Parcelas</h3>
            <InstallmentsList userId={user.id} />
          </div>
        )}
      </div>
    </div>
  )
}