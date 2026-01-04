import Link from "next/link"
import { Instagram, Youtube, Facebook, Twitter } from "lucide-react"

export function BlogFooter() {
  return (
    <footer className="bg-black border-t border-zinc-800 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="text-3xl font-black text-red-600 tracking-tighter">
              BREGA<span className="text-white">PE</span>
            </div>
            <p className="text-sm text-zinc-400">
              O portal do brega funk de Recife. Tudo sobre a cena, direto da fonte.
            </p>
            <div className="flex gap-3">
              <Link href="#" className="text-zinc-400 hover:text-red-600 transition">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-red-600 transition">
                <Youtube className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-red-600 transition">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-zinc-400 hover:text-red-600 transition">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm">Categorias</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/categoria/musica" className="hover:text-red-600">
                  Música
                </Link>
              </li>
              <li>
                <Link href="/categoria/artistas" className="hover:text-red-600">
                  Artistas
                </Link>
              </li>
              <li>
                <Link href="/categoria/eventos" className="hover:text-red-600">
                  Eventos
                </Link>
              </li>
              <li>
                <Link href="/categoria/cultura" className="hover:text-red-600">
                  Cultura
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm">Sobre</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>
                <Link href="/sobre" className="hover:text-red-600">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link href="/contato" className="hover:text-red-600">
                  Contato
                </Link>
              </li>
              <li>
                <Link href="/anuncie" className="hover:text-red-600">
                  Anuncie Conosco
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 uppercase text-sm">Newsletter</h4>
            <p className="text-sm text-zinc-400 mb-4">Receba as últimas notícias do brega funk</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Seu email"
                className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600"
              />
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-sm transition">
                OK
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-sm text-zinc-500">
          <p>© 2025 BregaPE. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
