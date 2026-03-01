"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { payInstallment } from "@/lib/finance/pay-installment"
import { useToast } from "@/hooks/use-toast"

export function InstallmentDetailsModal({ installment, open, onOpenChange, onSuccess }: any) {
  const [items, setItems] = useState<any[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (open && installment) loadItems()
  }, [open, installment])

  async function loadItems() {
    const supabase = createClient()
    const { data } = await supabase
      .from("installment_items")
      .select("*")
      .eq("installment_id", installment.id)
      .order("installment_number", { ascending: true })
    setItems(data || [])
  }

  async function handlePay(item: any) {
    setLoadingId(item.id)
    try {
      await payInstallment({
        itemId: item.id,
        accountId: installment.account_id,
        amount: item.amount,
        type: installment.type
      })
      toast({ title: "Parcela Paga!" })
      loadItems()
      onSuccess?.()
    } catch (err) {
      toast({ title: "Erro ao pagar", variant: "destructive" })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white">
        <DialogHeader><DialogTitle>{installment?.description}</DialogTitle></DialogHeader>
        <div className="space-y-3 mt-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
              <span>Parcela {item.installment_number}</span>
              <div className="flex items-center gap-3">
                <span className="font-bold">R$ {item.amount.toFixed(2)}</span>
                {item.status === "paid" ? (
                  <CheckCircle2 className="text-green-500 h-5 w-5" />
                ) : (
                  <Button size="sm" onClick={() => handlePay(item)} disabled={!!loadingId}>
                    {loadingId === item.id ? <Loader2 className="animate-spin h-4 w-4" /> : "Pagar"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}