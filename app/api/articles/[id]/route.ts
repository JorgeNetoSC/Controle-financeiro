import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

/**
 * GET /api/articles/:id
 * Público – busca artigo por ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("articles")
    .select(`
      *,
      blog_categories (name, slug)
    `)
    .eq("id", id)
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}

/**
 * PUT /api/articles/:id
 * Somente ADMIN
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Verifica se é admin
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!adminRole) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from("articles")
    .update(body)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}

/**
 * DELETE /api/articles/:id
 * Somente ADMIN
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }

  // Verifica se é admin
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .single()

  if (!adminRole) {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    )
  }

  const { error } = await supabase
    .from("articles")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
