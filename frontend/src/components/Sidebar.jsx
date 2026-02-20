import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import {
  Plus, Trash2, LogOut, LogIn, FileText, ChevronDown,
  Sparkles, X, MessageSquare, Search, Clock, ChevronRight,
  FolderOpen, Archive, SlidersHorizontal, CheckCheck, AlertCircle
} from 'lucide-react'

const timeAgo = (ts) => {
  if (!ts) return ''
  const m = Math.floor((Date.now() - new Date(ts)) / 60000)
  const d = Math.floor(m / 1440)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  if (m < 1440) return `${Math.floor(m / 60)}h ago`
  if (d === 1) return 'yesterday'
  if (d < 7) return `${d}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const groupByDate = (sessions) => {
  const g = { Today: [], Yesterday: [], 'This Week': [], Older: [] }
  sessions.forEach(s => {
    const d = Math.floor((Date.now() - new Date(s.timestamp)) / 86400000)
    if (d < 1) g.Today.push(s)
    else if (d < 2) g.Yesterday.push(s)
    else if (d < 7) g['This Week'].push(s)
    else g.Older.push(s)
  })
  return g
}

const FILTERS = { all: 'All chats', 'with-docs': 'With documents', recent: 'Last 7 days' }
const MAX = 10

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { documents = [], pastSessions = [], newChat, restoreSession, deleteHistory, deleteSession, loadHistory } = useChat()
  const navigate = useNavigate()

  const [activeId, setActiveId]     = useState(null)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('all')
  const [showFilter, setShowFilter] = useState(false)
  const [showUser, setShowUser]     = useState(false)
  const [clearOk, setClearOk]       = useState(false)
  const [deleteOk, setDeleteOk]     = useState(null)
  const searchRef  = useRef(null)
  const clearTimer = useRef(null)
  const delTimer   = useRef(null)

  useEffect(() => { if (user) loadHistory() }, [user]) // eslint-disable-line
  useEffect(() => {
    const fn = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); searchRef.current?.focus() } }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])
  useEffect(() => () => { clearTimeout(clearTimer.current); clearTimeout(delTimer.current) }, [])

  const sessions = useCallback(() => {
    let s = [...pastSessions].slice(0, MAX)
    if (filter === 'with-docs') s = s.filter(x => x.documents?.length > 0)
    if (filter === 'recent') s = s.filter(x => Date.now() - new Date(x.timestamp) < 7 * 86400000)
    if (search.trim()) {
      const q = search.toLowerCase()
      s = s.filter(x =>
        x.title?.toLowerCase().includes(q) ||
        x.documents?.some(d => d.name?.toLowerCase().includes(q)) ||
        x.messages?.some(m => m.content?.toLowerCase().includes(q))
      )
    }
    return s
  }, [pastSessions, filter, search])()

  const grouped = groupByDate(sessions)
  const hasResults = Object.values(grouped).some(g => g.length > 0)

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (deleteOk === id) { deleteSession?.(id); setDeleteOk(null); if (activeId === id) setActiveId(null) }
    else { setDeleteOk(id); delTimer.current = setTimeout(() => setDeleteOk(null), 2500) }
  }

  const handleClearAll = () => {
    if (clearOk) { deleteHistory(); setClearOk(false); setActiveId(null) }
    else { setClearOk(true); clearTimer.current = setTimeout(() => setClearOk(false), 2500) }
  }

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-[260px] bg-surface-1 border-r border-border z-30 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>

        {/* Header */}
        <div className="px-4 pt-4 pb-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Sparkles size={13} className="text-accent" />
            </div>
            <div>
              <p className="text-white/90 font-semibold text-sm tracking-tight">Retail Doc Intel</p>
              <p className="text-white/20 text-xs leading-none">AI Assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* New Chat */}
        <div className="px-3 pb-3 shrink-0">
          <button onClick={() => { newChat(); setActiveId(null); onClose() }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-dashed border-white/10 hover:border-accent/30 hover:bg-accent/5 text-white/40 hover:text-white/80 transition-all text-xs font-medium group">
            <div className="w-4 h-4 rounded-md bg-white/5 group-hover:bg-accent/20 flex items-center justify-center transition-colors">
              <Plus size={11} className="group-hover:text-accent transition-colors" />
            </div>
            New conversation
            <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-40 transition-opacity" />
          </button>
        </div>

        {/* Active docs */}
        {documents.length > 0 && (
          <div className="px-3 pb-3 shrink-0">
            <div className="rounded-xl border border-accent/15 bg-accent/5 p-2.5">
              <div className="flex items-center gap-1.5 mb-2">
                <FolderOpen size={11} className="text-accent/70" />
                <span className="text-accent/70 text-xs font-semibold uppercase tracking-wider">Active Session</span>
              </div>
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg bg-accent/10 mb-1 last:mb-0">
                  <FileText size={10} className="text-accent/60 shrink-0" />
                  <span className="text-white/60 text-xs truncate">{doc.name}</span>
                  {doc.chunks && <span className="ml-auto text-accent/40 text-xs shrink-0">{doc.chunks}c</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-3 pb-2 shrink-0"><div className="h-px bg-border" /></div>

        {/* History header + controls */}
        <div className="px-3 pb-2 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-white/25" />
            <span className="text-white/30 text-xs font-semibold uppercase tracking-wider">History</span>
            {pastSessions.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-surface-4 border border-white/8 text-white/25 text-xs leading-none">
                {Math.min(pastSessions.length, MAX)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button onClick={() => setShowFilter(v => !v)}
                className={`p-1.5 rounded-lg transition-colors ${filter !== 'all' ? 'bg-accent/15 text-accent border border-accent/20' : 'hover:bg-surface-3 text-white/25 hover:text-white/60'}`}>
                <SlidersHorizontal size={12} />
              </button>
              {showFilter && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-surface-2 border border-border rounded-xl p-1 z-10 shadow-2xl animate-fade-in">
                  {Object.entries(FILTERS).map(([key, label]) => (
                    <button key={key} onClick={() => { setFilter(key); setShowFilter(false) }}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors ${filter === key ? 'bg-accent/10 text-accent' : 'text-white/50 hover:bg-surface-3 hover:text-white/80'}`}>
                      {filter === key ? <CheckCheck size={11} /> : <span className="w-[11px]" />}
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {pastSessions.length > 0 && (
              <button onClick={handleClearAll} title={clearOk ? 'Click again to confirm' : 'Clear all history'}
                className={`p-1.5 rounded-lg transition-all ${clearOk ? 'bg-red-500/15 text-red-400 border border-red-500/25' : 'hover:bg-surface-3 text-white/20 hover:text-red-400'}`}>
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        {pastSessions.length > 0 && (
          <div className="px-3 pb-2 shrink-0 relative">
            <Search size={13} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search chats…"
              className="w-full bg-surface-3 border border-border rounded-xl pl-8 pr-8 py-2 text-xs text-white/70 placeholder-white/20 focus:outline-none focus:border-accent/30 transition-all" />
            {search
              ? <button onClick={() => setSearch('')} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"><X size={12} /></button>
              : <kbd className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:block px-1 py-0.5 rounded bg-surface-4 border border-white/8 text-white/15 text-xs font-mono leading-none">⌘K</kbd>
            }
          </div>
        )}

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 min-h-0" style={{ scrollbarWidth: 'thin' }}>
          {pastSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-10 h-10 rounded-xl bg-surface-3 border border-border flex items-center justify-center mb-3">
                <Archive size={16} className="text-white/20" />
              </div>
              <p className="text-white/20 text-xs">No conversations yet</p>
            </div>
          ) : !hasResults ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Search size={16} className="text-white/20 mb-2" />
              <p className="text-white/25 text-xs">No results found</p>
              <button onClick={() => { setSearch(''); setFilter('all') }} className="text-accent/60 hover:text-accent text-xs mt-2 transition-colors">
                Clear filters
              </button>
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => items.length === 0 ? null : (
              <div key={group} className="mb-1">
                <p className="text-white/18 text-xs font-semibold uppercase tracking-wider px-1 py-1.5">{group}</p>
                {items.map(s => (
                  <div key={s.id} onClick={() => { restoreSession(s); setActiveId(s.id); onClose() }}
                    className={`group flex items-start gap-2.5 px-2.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 mb-0.5 ${activeId === s.id ? 'bg-accent/10 border border-accent/20' : 'hover:bg-surface-3 border border-transparent hover:border-white/5'}`}>
                    <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${activeId === s.id ? 'bg-accent/20' : 'bg-surface-4'}`}>
                      <MessageSquare size={11} className={activeId === s.id ? 'text-accent' : 'text-white/30'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate font-medium ${activeId === s.id ? 'text-white/90' : 'text-white/55 group-hover:text-white/75'}`}>{s.title}</p>
                      {s.documents?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {s.documents.slice(0, 2).map((d, i) => (
                            <span key={i} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-surface-4 border border-white/5 text-white/25 text-xs leading-none">
                              <FileText size={9} /><span className="truncate max-w-[70px]">{d.name?.replace('.pdf', '')}</span>
                            </span>
                          ))}
                          {s.documents.length > 2 && <span className="text-white/20 text-xs">+{s.documents.length - 2}</span>}
                        </div>
                      )}
                      <p className="text-white/20 text-xs mt-1">{timeAgo(s.timestamp)}</p>
                    </div>
                    <button onClick={(e) => handleDelete(e, s.id)}
                      className={`shrink-0 w-5 h-5 rounded-md items-center justify-center transition-all hidden group-hover:flex ${deleteOk === s.id ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-surface-4 text-white/25 hover:text-red-400 hover:bg-red-500/10'}`}
                      title={deleteOk === s.id ? 'Click again to confirm' : 'Delete'}>
                      {deleteOk === s.id ? <AlertCircle size={10} /> : <Trash2 size={10} />}
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
          {pastSessions.length > MAX && !search && (
            <p className="text-white/15 text-xs text-center pt-2">Showing {MAX} most recent chats</p>
          )}
        </div>

        {/* User section */}
        <div className="px-3 py-3 border-t border-border shrink-0">
          {user ? (
            <div className="relative">
              <button onClick={() => setShowUser(v => !v)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-3 transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent/40 to-accent/20 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                  {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-white/80 text-xs font-medium truncate">{user.displayName || 'User'}</p>
                  <p className="text-white/25 text-xs truncate">{user.email}</p>
                </div>
                <ChevronDown size={12} className={`text-white/25 shrink-0 transition-transform ${showUser ? 'rotate-180' : ''}`} />
              </button>
              {showUser && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface-2 border border-border rounded-xl p-1 shadow-2xl animate-fade-in">
                  <button onClick={async () => { await logout(); navigate('/') }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white text-xs transition-colors">
                    <LogOut size={13} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => navigate('/')}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-surface-3 text-white/35 hover:text-white/60 transition-colors text-xs">
              <LogIn size={13} /> Sign in for history & sync
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
