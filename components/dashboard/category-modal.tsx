"use client"

import { useState } from "react"
import { createCategory } from "./category-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CategoryModalProps {
  userId: string
  onSuccess?: () => void
}

export function CategoryModal({ userId, onSuccess }: CategoryModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSave = async () => {
    if (!name) return

    setLoading(true)

    await createCategory({
      userId,
      name,
      type,
      color: type === "income" ? "#22c55e" : "#ef4444",
    })

    setName("")
    setType("expense")
    setLoading(false)
    setOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Nova Categoria</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Categoria</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Nome da categoria"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Despesa</SelectItem>
              <SelectItem value="income">Receita</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleSave}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Salvando..." : "Criar Categoria"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
