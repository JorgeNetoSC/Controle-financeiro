"use client"

import Link from "next/link"
import { Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function BlogHeader() {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-red-600/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-3xl font-black text-red-600 tracking-tighter">
              BREGA<span className="text-white">PE</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/categoria/musica"
              className="text-sm font-bold text-white hover:text-red-600 transition uppercase tracking-wide"
            >
              Música
            </Link>
            <Link
              href="/categoria/artistas"
              className="text-sm font-bold text-white hover:text-red-600 transition uppercase tracking-wide"
            >
              Artistas
            </Link>
            <Link
              href="/categoria/eventos"
              className="text-sm font-bold text-white hover:text-red-600 transition uppercase tracking-wide"
            >
              Eventos
            </Link>
            <Link
              href="/categoria/cultura"
              className="text-sm font-bold text-white hover:text-red-600 transition uppercase tracking-wide"
            >
              Cultura
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(!showSearch)}
              className="text-white hover:text-red-600"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/auth/login">
              <Button variant="ghost" size="icon" className="text-white hover:text-red-600">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="md:hidden text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="pb-4">
            <Input
              placeholder="Buscar artistas, músicas, notícias..."
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>
        )}
      </div>
    </header>
  )
}
