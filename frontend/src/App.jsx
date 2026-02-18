import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ChatProvider } from './context/ChatContext'
import LoginPage from './pages/LoginPage'
import ChatPage from './pages/ChatPage'

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/"     element={<LoginPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="*"     element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <AppRoutes />
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}