"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash } from "lucide-react"
import Link from "next/link"

type Article = {
  id: string
  title: string
  status: string
  views: number
  published_at: string
  blog_categories: { name: string }
}

export function ArticlesTable() {
  const [articles, setArticles] = useState<Article[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchArticles()
  }, [])

  async function fetchArticles() {
    const { data } = await supabase
      .from("articles")
      .select(
        `
        *,
        blog_categories (name)
      `,
      )
      .order("created_at", { ascending: false })

    if (data) setArticles(data)
  }

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-lg">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-700 hover:bg-zinc-800">
            <TableHead className="text-zinc-300">Título</TableHead>
            <TableHead className="text-zinc-300">Categoria</TableHead>
            <TableHead className="text-zinc-300">Status</TableHead>
            <TableHead className="text-zinc-300">Visualizações</TableHead>
            <TableHead className="text-zinc-300">Data</TableHead>
            <TableHead className="text-zinc-300">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id} className="border-zinc-700 hover:bg-zinc-700/50">
              <TableCell className="font-medium text-white">{article.title}</TableCell>
              <TableCell className="text-zinc-400">{article.blog_categories?.name}</TableCell>
              <TableCell>
                <Badge
                  variant={article.status === "published" ? "default" : "secondary"}
                  className={article.status === "published" ? "bg-green-600" : "bg-zinc-600"}
                >
                  {article.status}
                </Badge>
              </TableCell>
              <TableCell className="text-zinc-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.views}
                </div>
              </TableCell>
              <TableCell className="text-zinc-400">
                {new Date(article.published_at).toLocaleDateString("pt-BR")}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/admin/artigos/${article.id}`}>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-600">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
