import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

export default function useApi(path) {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const tokenRef = useRef(token)
  tokenRef.current = token

  async function load(manualToken) {
    const tok = manualToken || tokenRef.current
    if (!tok) { setError({ error: 'Not signed in.' }); setLoading(false); return }
    try {
      const json = await apiFetch(path, { token: tok })
      setData(json)
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    load()
  }, [path])

  return { data, error, loading, reload: load }
}