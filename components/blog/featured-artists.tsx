"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import Link from "next/link"

type Artist = {
  id: string
  name: string
  slug: string
  photo: string
}

export function FeaturedArtists() {
  const [artists, setArtists] = useState<Artist[]>([])
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchArtists() {
      const { data } = await supabase.from("artists").select("*").eq("featured", true).limit(3)

      if (data) setArtists(data)
    }

    fetchArtists()
  }, [])

  return (
    <section className="space-y-4">
      <h3 className="text-xl font-black text-white uppercase tracking-tight">Artistas em Alta</h3>

      <div className="space-y-3">
        {artists.map((artist) => (
          <Link key={artist.id} href={`/artista/${artist.slug}`}>
            <Card className="group overflow-hidden bg-zinc-800 border-zinc-700 hover:border-red-600 transition flex items-center gap-3 p-3">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={
                    artist.photo || `/placeholder.svg?height=100&width=100&query=${artist.name || "/placeholder.svg"}`
                  }
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white group-hover:text-red-600 transition">{artist.name}</h4>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
