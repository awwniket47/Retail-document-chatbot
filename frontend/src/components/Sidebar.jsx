import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import {
  Plus, Trash2, LogOut, LogIn, FileText,
  ChevronDown, Sparkles, X, MessageSquare
} from 'lucide-react'

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { documents = [], pastSessions = [], newChat, restoreSession, deleteHistory, loadHistory } = useChat()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState(null)

  useEffect(() => {
    if (user) loadHistory()
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleNewChat = () => {
    newChat()
    setActiveSessionId(null)
    onClose()
  }

  const handleRestoreSession = (session) => {
    restoreSession(session)
    setActiveSessionId(session.id)
    onClose()
  }

  const timeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-surface-1 border-r border-border z-30
        flex flex-col transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Sparkles size={14} className="text-accent" />
            </div>
            <span className="text-white font-semibold text-sm tracking-tight">Retail Doc Intel</span>
          </div>
          <button onClick={onClose} className="lg:hidden btn-ghost p-1.5">
            <X size={16} />
          </button>
        </div>

        {/* New Chat */}
        <div className="p-3 shrink-0">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border hover:border-accent/30 hover:bg-accent/5 text-white/60 hover:text-white transition-all text-sm group"
          >
            <Plus size={15} className="group-hover:text-accent transition-colors" />
            New Chat
          </button>
        </div>

        {/* Current session documents */}
        {documents.length > 0 && (
          <div className="px-3 pb-3 shrink-0">
            <p className="text-white/25 text-xs font-medium px-1 mb-1.5 uppercase tracking-wider">
              Current Docs
            </p>
            <div className="space-y-1">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-surface-2">
                  <FileText size={12} className="text-accent shrink-0" />
                  <span className="text-white/60 text-xs truncate">{doc.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0">
          {pastSessions.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <p className="text-white/25 text-xs font-medium uppercase tracking-wider">History</p>
                <button
                  onClick={deleteHistory}
                  className="text-white/20 hover:text-red-400 transition-colors"
                  title="Clear all history"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="space-y-0.5">
                {pastSessions.map(session => (
                  <button
                    key={session.id}
                    onClick={() => handleRestoreSession(session)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg hover:bg-surface-3 group transition-colors
                      ${activeSessionId === session.id ? 'bg-surface-3 border border-accent/20' : ''}`}
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare size={12} className="text-white/25 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-white/50 text-xs truncate group-hover:text-white/70 transition-colors">
                          {session.title}
                        </p>
                        {session.documents?.length > 0 && (
                          <p className="text-white/20 text-xs truncate mt-0.5">
                            {session.documents.map(d => d.name).join(', ')}
                          </p>
                        )}
                        <p className="text-white/15 text-xs mt-0.5">
                          {timeAgo(session.timestamp)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-white/15 text-xs text-center mt-6 px-2">
              Your chat history will appear here
            </p>
          )}
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-border shrink-0">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(v => !v)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-surface-3 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white/80 text-xs font-medium truncate">
                    {user.displayName || 'User'}
                  </p>
                  <p className="text-white/30 text-xs truncate">{user.email}</p>
                </div>
                <ChevronDown size={13} className="text-white/30 shrink-0" />
              </button>

              {showUserMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-1 glass rounded-xl p-1 animate-fade-in">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white text-sm transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-surface-3 text-white/40 hover:text-white/70 transition-colors text-sm"
            >
              <LogIn size={14} />
              Sign in
            </button>
          )}
        </div>
      </aside>
    </>
  )
}