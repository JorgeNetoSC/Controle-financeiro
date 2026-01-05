"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardContent } from "./dashboard-content"
import { TransactionModal } from "./transaction-modal"
import { InstallmentsModal } from "./installments-modal"
import { CategoryModal } from "./category-modal"

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
         actions={
          <div className="flex flex-col gap-2">
            <TransactionModal
              userId={user.id}
              onSuccess={() => {}}
            />
            <InstallmentsModal
              userId={user.id}
              onSuccess={() => {}}
            />
            <CategoryModal
              userId={user.id}
              onSuccess={() => {}}
            />
          </div>
        }
      />

      <DashboardContent user={user} />
      
    </div>
    
  )
}
