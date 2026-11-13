import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

const STORE_KEY = 'agriconnect_token'
const USER_KEY  = 'agriconnect_user'

function readStored() {
  try { return { token: localStorage.getItem(STORE_KEY), user: JSON.parse(localStorage.getItem(USER_KEY) || 'null') } }
  catch { return { token: null, user: null } }
}

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => readStored().user)
  const [token, setToken] = useState(() => readStored().token)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ;(async () => {
      if (!token) { setReady(true); return }
      try {
        const { user } = await authAPI.me(token)
        setUser(user)
      } catch {
        setUser(null); setToken(null)
        localStorage.removeItem(STORE_KEY); localStorage.removeItem(USER_KEY)
      } finally { setReady(true) }
    })()
  }, [])

  const login = useCallback(async (data) => {
    const { token, user } = await authAPI.login(data)
    localStorage.setItem(STORE_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setToken(token); setUser(user)
    return { token, user }
  }, [])

  const register = useCallback(async (data) => {
    const { token, user } = await authAPI.register(data)
    localStorage.setItem(STORE_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    setToken(token); setUser(user)
    return { token, user }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORE_KEY); localStorage.removeItem(USER_KEY)
    setUser(null); setToken(null)
  }, [])

  const updateUser = useCallback((next) => {
    setUser(next)
    localStorage.setItem(USER_KEY, JSON.stringify(next))
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, ready, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)