import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../services/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (u) setIsGuest(false)
      setLoading(false)
    })
    return unsub
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const signup = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    if (displayName) await updateProfile(cred.user, { displayName })
    return cred
  }

  const logout = () => {
    setIsGuest(false)
    return signOut(auth)
  }

  const continueAsGuest = () => {
    setIsGuest(true)
  }

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, login, signup, logout, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
