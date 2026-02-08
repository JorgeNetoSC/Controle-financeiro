"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, Wallet, TrendingUp, Filter, LayoutDashboard, Receipt, Layers } from "lucide-react"
import { TransactionsList } from "./transactions-list"
import { InstallmentsList } from "./installments-list"
import { BalanceMascot } from "./balance-mascot"
import { EvolutionChart } from "./evolution-chart" // Importando o novo componente
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface DashboardContentProps {
  userId?: string; 
  user: User;      
  activeTab: any;
  setActiveTab: (tab: any) => void;
}

export function DashboardContent({ userId, user, activeTab, setActiveTab }: DashboardContentProps) {
  const effectiveUserId = userId || user?.id;

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalBalance: 0,
    combinedItems: [] as any[]
  })

  const supabase = createClient()

  const loadData = useCallback(async () => {
    if (!effectiveUserId) return;

    try {
      setLoading(true)
      
      const [transRes, instItemsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*, categories(name)')
          .eq('user_id', effectiveUserId),
        supabase
          .from('installment_items')
          .select('*, installments(description, type, category_id), categories(name)')
          .eq('user_id', effectiveUserId)
      ])
      
      const normalTrans = (transRes.data || []).map(t => ({
        ...t,
        category_name: t.categories?.name || 'Geral',
        isInstallment: false,
        date: t.date
      }))

      const mappedInst = (instItemsRes.data || []).map(i => ({
        id: i.id,
        description: i.installments?.description || 'Parcela',
        amount: i.amount,
        date: i.due_date,
        type: i.installments?.type || 'expense',
        status: i.status,
        category_name: i.categories?.name || 'Geral',
        isInstallment: true
      }))

      const combined = [...normalTrans, ...mappedInst].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      const income = combined
        .filter(i => i.type === 'income')
        .reduce((acc, curr) => acc + Number(curr.amount), 0)
      
      const expenses = combined
        .filter(i => i.type === 'expense')
        .reduce((acc, curr) => acc + Number(curr.amount), 0)

      setData({
        totalIncome: income,
        totalExpenses: expenses,
        totalBalance: income - expenses,
        combinedItems: combined
      })
    } catch (error) {
      console.error("Erro no Dashboard:", error)
    } finally {
      setLoading(false)
    }
  }, [effectiveUserId, supabase])

  useEffect(() => {
    loadData()
  }, [effectiveUserId, loadData])

  // Lógica para processar dados do gráfico
  const chartData = data.combinedItems.reduce((acc: any[], item) => {
    const dateLabel = new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const existing = acc.find(a => a.date === dateLabel);
    
    if (existing) {
      if (item.type === 'income') existing.income += Number(item.amount);
      else existing.expenses += Number(item.amount);
    } else {
      acc.push({
        date: dateLabel,
        income: item.type === 'income' ? Number(item.amount) : 0,
        expenses: item.type === 'expense' ? Number(item.amount) : 0
      });
    }
    return acc;
  }, []).slice(0, 7).reverse(); // Pega os últimos 7 dias com movimentação

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-black italic uppercase tracking-[0.3em] text-[10px]">Sincronizando HUB...</p>
      </div>
    )
  }

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
          <button
            onClick={() => setActiveTab('geral')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              activeTab === 'geral' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <LayoutDashboard size={14} /> Início
          </button>
          <button
            onClick={() => setActiveTab('transacoes')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              activeTab === 'transacoes' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Receipt size={14} /> Extrato
          </button>
          <button
            onClick={() => setActiveTab('parcelas')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
              activeTab === 'parcelas' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Layers size={14} /> Parcelas
          </button>
        </nav>
      </div>

      {/* CONTEÚDO DA ABA INÍCIO */}
      {activeTab === 'geral' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CARD 2: RESUMO FINANCEIRO */}
            <div className="bg-[#161b22] border border-gray-800 rounded-[40px] p-8 flex flex-col justify-between shadow-2xl relative">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">Resumo Mensal</h3>
                <Wallet size={20} className="text-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#0d1117] rounded-[20px] border border-gray-800">
                  <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Receitas</span>
                  <span className="text-green-500 font-black text-xl italic">R$ {data.totalIncome.toLocaleString('pt-BR')}</span>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-[20px] border border-gray-800">
                  <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Despesas</span>
                  <span className="text-red-500 font-black text-xl italic">R$ {data.totalExpenses.toLocaleString('pt-BR')}</span>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-gray-800">
                <p className="text-[10px] font-black text-gray-500 uppercase italic">Saldo Disponível</p>
                <p className="text-3xl font-black text-white tracking-tighter">
                  R$ {data.totalBalance.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {/* CARD 1: MASCOTE REATIVO */}
            <div className="bg-[#161b22] border border-gray-800 rounded-[40px] p-8 relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-all duration-700 group-hover:scale-125">
                <BalanceMascot income={data.totalIncome} totalBalance={data.totalBalance} />
              </div>
              <div>
                <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Saúde Financeira</h3>
                <p className="text-6xl font-black text-white italic tracking-tighter">
                  {data.totalIncome > 0 ? ((data.totalBalance / data.totalIncome) * 100).toFixed(0) : 0}%
                </p>
              </div>
              <div className="w-full h-3 bg-gray-950 rounded-full overflow-hidden border border-gray-800 mt-6 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${Math.max(0, Math.min(100, (data.totalBalance / data.totalIncome) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#161b22] border border-gray-800 rounded-[40px] p-8">
              <h3 className="text-white font-black uppercase italic tracking-widest text-[10px] mb-6">Fluxo Recente</h3>
              <TransactionsList transactions={data.combinedItems.slice(0, 5)} onRefresh={loadData} />
            </div>

            {/* GRÁFICO IMPLEMENTADO AQUI */}
            <div className="lg:col-span-2 bg-[#161b22] border border-gray-800 rounded-[40px] p-8 shadow-2xl overflow-hidden">
               <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-white font-black uppercase italic tracking-widest text-sm">Análise de Fluxo</h3>
                  <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Ganhos vs Gastos por período</p>
                </div>
                <div className="bg-gray-900/50 p-2 rounded-xl">
                  <TrendingUp size={16} className="text-blue-500" />
                </div>
               </div>
               <EvolutionChart data={chartData} />
            </div>
          </div>
        </div>
      )}

      {/* ABA EXTRATO */}
      {activeTab === 'transacoes' && (
        <div className="bg-[#161b22] border border-gray-800 rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-500">
          <TransactionsList transactions={data.combinedItems} onRefresh={loadData} />
        </div>
      )}

      {/* ABA PARCELAS */}
      {activeTab === 'parcelas' && (
        <div className="animate-in slide-in-from-right-8 duration-600">
          <InstallmentsList userId={effectiveUserId} onSuccess={loadData} />
        </div>
      )}

    </div>
  )
}