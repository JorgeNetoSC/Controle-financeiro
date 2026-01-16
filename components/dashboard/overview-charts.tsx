"use client"

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface MonthlyData {
  name: string;
  entradas: number;
  despesas: number;
}

interface OverviewChartsProps {
  income: number;
  expenses: number;
  categoriesData: CategoryData[];
  monthlyData: MonthlyData[];
}

export function OverviewCharts({ income, expenses, categoriesData, monthlyData }: OverviewChartsProps) {
  const saldo = income - expenses;

  return (
    <div className="space-y-6">
      {/* CARDS DE RESUMO - RESPONSIVO MOBILE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#161b22] p-5 rounded-2xl border border-gray-800 shadow-sm">
          <p className="text-gray-400 text-xs uppercase font-semibold">Saldo Atual</p>
          <h3 className={`text-2xl font-bold mt-1 ${saldo >= 0 ? 'text-blue-400' : 'text-orange-500'}`}>
            R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
        
        <div className="bg-[#161b22] p-5 rounded-2xl border border-gray-800 border-l-4 border-l-green-500">
          <p className="text-gray-400 text-xs uppercase font-semibold">Entradas</p>
          <h3 className="text-2xl font-bold text-green-500 mt-1">
            + R$ {income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-[#161b22] p-5 rounded-2xl border border-gray-800 border-l-4 border-l-red-500">
          <p className="text-gray-400 text-xs uppercase font-semibold">Despesas</p>
          <h3 className="text-2xl font-bold text-red-500 mt-1">
            - R$ {expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h3>
        </div>
      </div>

      {/* GRÁFICOS - STACK VERTICAL NO MOBILE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Categorias */}
        <div className="bg-[#161b22] p-4 sm:p-6 rounded-2xl border border-gray-800">
          <h4 className="text-white font-medium mb-6">Gastos por Categoria</h4>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoriesData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value"
                >
                  {categoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '8px' }} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Colunas */}
        <div className="bg-[#161b22] p-4 sm:p-6 rounded-2xl border border-gray-800">
          <h4 className="text-white font-medium mb-6">Fluxo do Período</h4>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />
                <XAxis dataKey="name" stroke="#8b949e" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#21262d'}} contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #30363d', borderRadius: '8px' }} />
                <Bar dataKey="entradas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}