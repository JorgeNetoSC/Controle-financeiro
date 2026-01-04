"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardContent } from "./dashboard-content"

interface DashboardLayoutProps {
  user: User
}

export function DashboardLayout({ user }: DashboardLayoutProps) {
  const [selectedAccount, setSelectedAccount] = useState("Todos")
  const [dateRange, setDateRange] = useState({
    from: "01/01/2026",
    to: "31/12/2026",
  })
  const [selectedYear, setSelectedYear] = useState("2026")
  const [selectedMonth, setSelectedMonth] = useState("Todos")

  return (
    <div className="flex min-h-screen bg-slate-950">
      <DashboardSidebar
        selectedAccount={selectedAccount}
        setSelectedAccount={setSelectedAccount}
        dateRange={dateRange}
        setDateRange={setDateRange}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
      />

      <DashboardContent user={user} />
    </div>
  )
}
