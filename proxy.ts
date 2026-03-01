import { updateSession } from "@/lib/supabase/proxy"
import type { NextRequest } from "next/server"

// ✅ O NOME PRECISA SER "proxy"
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/(.*)",
    "/admin",
    "/admin/(.*)",
  ],
}

