import "./globals.css"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-[#0d1117] text-white">
        {/* SEM SIDEBAR AQUI! */}
        {children}
      </body>
    </html>
  )
}