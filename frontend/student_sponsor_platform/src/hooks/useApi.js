// src/hooks/useApi.js
// Generic hook for data fetching with loading / error state management.
// Usage:
//   const { data, loading, error, refetch } = useApi(projectAPI.getProjects)
//@author sshende
import { useState, useEffect, useCallback } from 'react'

/**
 * @param {Function} apiFn   - async function that returns an axios response
 * @param {Array}    deps    - dependency array (re-fetches when these change)
 * @param {any}      initial - initial data value (default: null)
 */
export default function useApi(apiFn, deps = [], initial = null) {
  const [data, setData]       = useState(initial)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetch = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiFn(...args)
      // Support both paginated { results: [] } and plain array responses
      setData(res.data?.results ?? res.data)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
