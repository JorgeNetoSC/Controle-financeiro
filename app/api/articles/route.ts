import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const limit = searchParams.get("limit") || "10"
  const status = searchParams.get("status") || "published"

  const supabase = await createServerClient()

  let query = supabase
    .from("articles")
    .select(
      `
      *,
      blog_categories (name, slug)
    `,
    )
    .eq("status", status)
    .order("published_at", { ascending: false })
    .limit(Number.parseInt(limit))

  if (category) {
    query = query.eq("blog_categories.slug", category)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user is admin
  const { data: adminRole } = await supabase.from("admin_roles").select("role").eq("user_id", user.id).single()

  if (!adminRole) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from("articles")
    .insert({
      ...body,
      author_id: user.id,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
