"use client"

import { useEffect, useState } from "react"

export function BalanceMascot({ income, totalBalance }: { income: number, totalBalance: number }) {
  const [mascot, setMascot] = useState({ 
    img: "feliz.png", 
    text: "Tudo Ótimo!", 
    color: "text-green-500" 
  })
  
  const percentage = income > 0 ? (totalBalance / income) * 100 : 0

  useEffect(() => {
    // Lógica para decidir qual imagem exibir
    if (percentage >= 50) {
      setMascot({ img: "feliz.png", text: "Tudo Ótimo!", color: "text-green-500" })
    } else if (percentage >= 0) {
      setMascot({ img: "preocupado.png", text: "UUUFA!", color: "text-orange-500" })
    } else {
      setMascot({ img: "desespero.png", text: "Emergência!", color: "text-red-500" })
    }
  }, [percentage])

  return (
    <div className="flex flex-col items-center justify-center transition-all duration-700">
      {/* Container da Imagem com Animação de Troca */}
      <div className="relative w-24 h-24 mb-2">
        <img 
          key={mascot.img} // A KEY é o segredo para a animação disparar na troca!
          src={`/${mascot.img}`} 
          alt="Mascote"
          className="w-full h-full object-contain animate-in fade-in zoom-in spin-in-2 duration-700 ease-out"
        />
      </div>
      
      <span className={`text-[10px] font-black uppercase tracking-widest ${mascot.color} animate-pulse text-center`}>
        {mascot.text}
      </span>
    </div>
  )
}