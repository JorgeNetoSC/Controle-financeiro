"use client"

import { ReactNode } from "react"
import { Card } from "@/components/ui/card"

interface DateRange {
  from: string
  to: string
}

interface DashboardSidebarProps {
  selectedAccount: string
  setSelectedAccount: React.Dispatch<React.SetStateAction<string>>

  dateRange: DateRange
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>

  actions?: ReactNode
}

export function DashboardSidebar({
  selectedAccount,
  setSelectedAccount,
  dateRange,
  setDateRange,
  actions,
}: DashboardSidebarProps) {
  return (
    <Card className="border-slate-800 bg-slate-900 p-4 space-y-4">
      {/* CONTA */}
      <div>
        <p className="text-sm text-slate-400 mb-1">Conta</p>
        <select
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
          className="w-full rounded bg-slate-800 border border-slate-700 p-2 text-white"
        >
          <option value="">Todas</option>
          <option value="checking">Conta Corrente</option>
          <option value="credit">Crédito</option>
          <option value="cash">Dinheiro</option>
        </select>
      </div>

      {/* PERÍODO */}
      <div>
        <p className="text-sm text-slate-400 mb-1">Período</p>
        <div className="flex gap-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, from: e.target.value }))
            }
            className="flex-1 rounded bg-slate-800 border border-slate-700 p-2 text-white"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) =>
              setDateRange((prev) => ({ ...prev, to: e.target.value }))
            }
            className="flex-1 rounded bg-slate-800 border border-slate-700 p-2 text-white"
          />
        </div>
      </div>

      {/* AÇÕES EXTRAS */}
      {actions && <div className="pt-2">{actions}</div>}
    </Card>
  )
}
