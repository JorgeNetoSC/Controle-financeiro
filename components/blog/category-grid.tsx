import Link from "next/link"
import { Music, Star, Calendar, MapPin, Shirt, Newspaper } from "lucide-react"

const categories = [
  {
    name: "Música",
    slug: "musica",
    icon: Music,
    color: "from-red-600 to-orange-600",
  },
  {
    name: "Artistas",
    slug: "artistas",
    icon: Star,
    color: "from-purple-600 to-pink-600",
  },
  {
    name: "Eventos",
    slug: "eventos",
    icon: Calendar,
    color: "from-blue-600 to-cyan-600",
  },
  {
    name: "Cultura",
    slug: "cultura",
    icon: MapPin,
    color: "from-green-600 to-emerald-600",
  },
  {
    name: "Moda",
    slug: "moda",
    icon: Shirt,
    color: "from-yellow-600 to-orange-600",
  },
  {
    name: "Notícias",
    slug: "noticias",
    icon: Newspaper,
    color: "from-indigo-600 to-blue-600",
  },
]

export function CategoryGrid() {
  return (
    <section className="px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link key={category.slug} href={`/categoria/${category.slug}`} className="group">
            <div className="relative overflow-hidden rounded-lg aspect-square">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition`}
              />
              <div className="relative h-full flex flex-col items-center justify-center gap-2 p-4">
                <category.icon className="h-8 w-8 text-white" />
                <span className="text-white font-black text-center uppercase tracking-wide">{category.name}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
