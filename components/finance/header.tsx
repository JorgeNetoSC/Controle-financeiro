import { Wallet, Settings } from "lucide-react"

export function Header() {
  return (
    <div className="bg-black bg-opacity-30 backdrop-blur-lg border-b border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
              <Wallet className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">FinanceHub</h1>
              <p className="text-purple-300 text-sm">Seu dinheiro sob controle</p>
            </div>
          </div>
          <button className="text-white hover:text-purple-300 transition">
            <Settings size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}
