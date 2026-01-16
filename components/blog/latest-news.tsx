"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { Calendar } from "lucide-react"

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  published_at: string
}

export function LatestNews() {
  const [articles, setArticles] = useState<Article[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchArticles() {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .range(3, 10)

      if (data) setArticles(data)
    }

    fetchArticles()
  }, [])

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-black text-white uppercase tracking-tight">Últimas Notícias</h2>

      <div className="space-y-4">
        {articles.map((article) => (
          <Link key={article.id} href={`/artigo/${article.slug}`}>
            <Card className="group overflow-hidden bg-zinc-800 border-zinc-700 hover:border-red-600 transition flex gap-4 p-4">
              <div className="w-32 h-32 flex-shrink-0 rounded overflow-hidden">
                <img
                  src={
                    article.featured_image ||
                    `/placeholder.svg?height=200&width=200&query=${article.title || "/placeholder.svg"}`
                  }
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-white group-hover:text-red-600 transition line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.published_at).toLocaleDateString("pt-BR")}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
