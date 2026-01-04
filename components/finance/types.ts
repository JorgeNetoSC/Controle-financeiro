export interface Transaction {
  id: number
  type: "income" | "expense"
  description: string
  amount: number
  category: string
  date: string
}

export interface Goal {
  id: number
  name: string
  target: number
  current: number
  deadline?: string
}

export interface Card {
  id: number
  name: string
  limit: number
  spent: number
  dueDay: string
}

export const CATEGORIES = {
  expense: ["Alimentação", "Transporte", "Moradia", "Saúde", "Lazer", "Educação", "Compras", "Outros"],
  income: ["Salário", "Freelance", "Investimentos", "Presente", "Outros"],
}
