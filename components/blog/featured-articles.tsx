"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Eye } from "lucide-react"

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string
  featured_image: string
  views: number
  published_at: string
  blog_categories: { name: string; slug: string }
}

export function FeaturedArticles() {
  const [articles, setArticles] = useState<Article[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchArticles() {
      const { data } = await supabase
        .from("articles")
        .select(
          `
          *,
          blog_categories (name, slug)
        `,
        )
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3)

      if (data) setArticles(data)
    }

    fetchArticles()
  }, [])

  if (articles.length === 0) return null

  return (
    <section className="px-4 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">Em Destaque</h2>
        <div className="h-1 flex-1 bg-gradient-to-r from-red-600 to-transparent" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link key={article.id} href={`/artigo/${article.slug}`}>
            <Card className="group overflow-hidden bg-zinc-800 border-zinc-700 hover:border-red-600 transition">
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={
                    article.featured_image ||
                    `/placeholder.svg?height=400&width=600&query=${article.title || "/placeholder.svg"}`
                  }
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <Badge className="absolute top-4 left-4 bg-red-600">{article.blog_categories?.name}</Badge>
              </div>
              <div className="p-4 space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-red-600 transition line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(article.published_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.views}
                  </span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
