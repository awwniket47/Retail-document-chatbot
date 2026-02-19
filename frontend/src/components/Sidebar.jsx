import { MessageSquare, FileText, Settings, LogOut, Bot } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar({ active }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const menuItems = [
    { name: 'Chat', icon: MessageSquare, path: '/chat' },
    { name: 'Documents', icon: FileText, path: '/documents' },
    { name: 'Settings', icon: Settings, path: '/settings' }
  ]

  return (
    <div className="h-screen w-64 bg-[#0F1E2E] border-r border-white/5 flex flex-col justify-between">

      <div>
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">
                Retail AI
              </h1>
              <p className="text-xs text-gray-400">
                Document Intelligence
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 px-3 space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = active === item.name

            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200
                ${
                  isActive
                    ? 'bg-[#1E3A5F] text-white shadow-sm'
                    : 'text-gray-400 hover:bg-[#162A3D] hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-3 py-4 border-t border-white/5">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition"
        >
          <LogOut size={18}  path=''/>
          Logout
        </button>
      </div>
    </div>
  )
}
