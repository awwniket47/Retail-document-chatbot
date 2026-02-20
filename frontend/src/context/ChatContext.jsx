import { createContext, useContext, useState, useCallback } from 'react'
import { sendMessage, fetchHistory, clearHistory, uploadDocument } from '../services/api'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)

const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

const MAX_PAST_SESSIONS = 10

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const [messages, setMessages]             = useState([])
  const [documents, setDocuments]           = useState([])
  const [isTyping, setIsTyping]             = useState(false)
  const [uploading, setUploading]           = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [sessionId, setSessionId]           = useState(generateSessionId)
  const [pastSessions, setPastSessions]     = useState([])

  const loadHistory = useCallback(async () => {
    if (!user) return
    try {
      const history = await fetchHistory()
      setMessages(history.map(m => ({
        id: m.id,
        role: m.role,
        content: m.content,
        sources: m.sources || [],
        timestamp: m.timestamp,
      })))
    } catch (err) {
      console.error('Failed to load history', err)
    }
  }, [user])

  const chat = useCallback(async (query) => {
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      sources: [],
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsTyping(true)

    try {
      const data = await sendMessage(query, sessionId)
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        sources: [],
        timestamp: new Date().toISOString(),
        error: true,
      }])
    } finally {
      setIsTyping(false)
    }
  }, [sessionId])

  const upload = useCallback(async (file) => {
    setUploading(true)
    setUploadProgress(0)
    try {
      const result = await uploadDocument(file, sessionId, setUploadProgress)
      setDocuments(prev => [...prev, { name: result.filename, chunks: result.chunks_added }])
      return result
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [sessionId])

  const newChat = useCallback(() => {
    if (messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user')
      setPastSessions(prev => {
        const updated = [
          {
            id: sessionId,
            title: firstUserMsg?.content?.slice(0, 60) || 'Untitled chat',
            messages,
            documents,
            timestamp: new Date().toISOString(),
          },
          ...prev.filter(s => s.id !== sessionId), // avoid duplicates
        ]
        // Keep only the most recent MAX_PAST_SESSIONS
        return updated.slice(0, MAX_PAST_SESSIONS)
      })
    }
    setMessages([])
    setDocuments([])
    setSessionId(generateSessionId())
  }, [messages, documents, sessionId])

  const restoreSession = useCallback((session) => {
    setMessages(session.messages)
    setDocuments(session.documents)
    setSessionId(session.id)
  }, [])

  const deleteSession = useCallback((id) => {
    setPastSessions(prev => prev.filter(s => s.id !== id))
  }, [])

  const deleteHistory = useCallback(async () => {
    if (user) {
      try { await clearHistory() } catch (e) { console.error(e) }
    }
    setMessages([])
    setPastSessions([])
  }, [user])

  return (
    <ChatContext.Provider value={{
      messages,
      documents,
      isTyping,
      uploading,
      uploadProgress,
      sessionId,
      pastSessions,
      chat,
      upload,
      loadHistory,
      newChat,
      restoreSession,
      deleteSession,
      deleteHistory,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => useContext(ChatContext)
