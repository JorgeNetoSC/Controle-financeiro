"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"

type Video = {
  id: string
  title: string
  youtube_id: string
  thumbnail: string
}

export function TopVideos() {
  const [videos, setVideos] = useState<Video[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchVideos() {
      const { data } = await supabase.from("videos").select("*").order("views", { ascending: false }).limit(3)

      if (data) setVideos(data)
    }

    fetchVideos()
  }, [])

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-black text-white uppercase tracking-tight">Top Clipes</h3>

      <div className="space-y-3">
        {videos.map((video) => (
          <Card
            key={video.id}
            className="group overflow-hidden bg-zinc-800 border-zinc-700 hover:border-red-600 transition cursor-pointer"
          >
            <div className="aspect-video relative">
              <img
                src={
                  video.thumbnail ||
                  `https://img.youtube.com/vi/${video.youtube_id || "/placeholder.svg"}/mqdefault.jpg`
                }
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Play className="h-12 w-12 text-red-600" fill="currentColor" />
              </div>
            </div>
            <div className="p-3">
              <h4 className="text-sm font-bold text-white line-clamp-2">{video.title}</h4>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
