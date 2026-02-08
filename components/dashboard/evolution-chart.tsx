"use client"

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, TooltipProps } from 'recharts'

interface ChartData {
  date: string;
  income: number;
  expenses: number;
}

// Estilização do balão que aparece ao passar o mouse
const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1117] border border-gray-800 p-3 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black text-gray-500 uppercase mb-2 tracking-widest">{payload[0].payload.date}</p>
        <div className="space-y-1">
          <p className="text-xs font-bold text-green-500 flex justify-between gap-4">
            GANHOS: <span>R$ {payload[0].value?.toLocaleString('pt-BR')}</span>
          </p>
          <p className="text-xs font-bold text-red-500 flex justify-between gap-4">
            GASTOS: <span>R$ {payload[1].value?.toLocaleString('pt-BR')}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function EvolutionChart({ data }: { data: ChartData[] }) {
  return (
    <div className="w-full h-[280px] select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" opacity={0.5} />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#4b5563', fontSize: 10, fontWeight: 'bold' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#4b5563', fontSize: 10 }} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#374151', strokeWidth: 2 }} />
          <Area 
            type="monotone" 
            dataKey="income" 
            stroke="#22c55e" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorIncome)" 
            animationDuration={1500}
          />
          <Area 
            type="monotone" 
            dataKey="expenses" 
            stroke="#ef4444" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorExpenses)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}