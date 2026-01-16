export function BlogHero() {
  return (
    <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/50 via-zinc-900/70 to-zinc-900" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: 'url("/recife-city-nightlife-urban-crowd-party.jpg")',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center space-y-4 px-4">
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
          BREGA<span className="text-red-600">PE</span>
        </h1>
        <p className="text-xl md:text-2xl font-bold text-red-600 uppercase tracking-wider">
          Tudo sobre Brega Funk de Recife
        </p>
        <p className="text-lg text-zinc-300 max-w-2xl mx-auto">
          Direto da fonte: Notícias, clipes, artistas e tudo que rola na cena do brega funk pernambucano
        </p>
      </div>
    </section>
  )
}
