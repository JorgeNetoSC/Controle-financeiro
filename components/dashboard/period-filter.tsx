"use client"

interface PeriodFilterProps {
  month: number
  year: number
  onChange: (month: number, year: number) => void
}

export function PeriodFilter({
  month,
  year,
  onChange,
}: PeriodFilterProps) {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* MÊS */}
      <select
        value={month}
        onChange={(e) => onChange(Number(e.target.value), year)}
        className="rounded bg-slate-800 border border-slate-700 px-3 py-2 text-white"
      >
        {months.map((label, index) => (
          <option key={index} value={index + 1}>
            {label}
          </option>
        ))}
      </select>

      {/* ANO */}
      <select
        value={year}
        onChange={(e) => onChange(month, Number(e.target.value))}
        className="rounded bg-slate-800 border border-slate-700 px-3 py-2 text-white"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}
