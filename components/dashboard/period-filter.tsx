"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface PeriodFilterProps {
  month: number
  year: number
  onChange: (month: number, year: number) => void
}

export function PeriodFilter({ month, year, onChange }: PeriodFilterProps) {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]

  const now = new Date()
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear()
  const isFutureMonth =
    year > now.getFullYear() ||
    (year === now.getFullYear() && month > now.getMonth() + 1)

  const goPrev = () => {
    if (month === 1) onChange(12, year - 1)
    else onChange(month - 1, year)
  }

  const goNext = () => {
    if (month === 12) onChange(1, year + 1)
    else onChange(month + 1, year)
  }

  const goToday = () => {
    onChange(now.getMonth() + 1, now.getFullYear())
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 bg-[#161b22] border border-gray-800 rounded-2xl px-3 py-2">
        <button
          onClick={goPrev}
          className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
        >
          <ChevronLeft size={16} />
        </button>

        <span className="text-white font-black uppercase tracking-wider text-xs min-w-[150px] text-center capitalize">
          {months[month - 1]} {year}
        </span>

        <button
          onClick={goNext}
          className="text-gray-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {!isCurrentMonth && (
        <button
          onClick={goToday}
          className="text-blue-400 hover:text-blue-300 text-[10px] font-black uppercase tracking-wider transition-colors bg-blue-400/10 hover:bg-blue-400/20 px-3 py-2 rounded-xl"
        >
          Hoje
        </button>
      )}

      {isFutureMonth && (
        <span className="text-amber-400/70 text-[10px] font-black uppercase tracking-wider">
          Projeção
        </span>
      )}
    </div>
  )
}