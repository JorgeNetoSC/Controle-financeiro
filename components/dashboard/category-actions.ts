import { createClient } from "@/lib/supabase/client"

interface CreateCategoryParams {
  userId: string
  name: string
  type: "income" | "expense"
  color: string
}

export async function createCategory({
  userId,
  name,
  type,
  color,
}: CreateCategoryParams) {
  const supabase = createClient()

  const { error } = await supabase.from("categories").insert({
    user_id: userId,
    name,
    type,
    color,
  })

  if (error) {
    console.error(error)
    throw new Error("Erro ao criar categoria")
  }
}
