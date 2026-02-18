import axios from 'axios'
import { auth } from './firebase'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Chat ──────────────────────────────────────────────────────────────────────

export const sendMessage = async (query, sessionId) => {
  const { data } = await api.post('/chat', { query, session_id: sessionId })
  return data
}

export const fetchHistory = async () => {
  const { data } = await api.get('/chat/history')
  return data.messages
}

export const clearHistory = async () => {
  await api.delete('/chat/history')
}

// ── Upload ────────────────────────────────────────────────────────────────────

export const uploadDocument = async (file, sessionId, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  form.append('session_id', sessionId)
  const { data } = await api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total))
    },
  })
  return data
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const fetchMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}