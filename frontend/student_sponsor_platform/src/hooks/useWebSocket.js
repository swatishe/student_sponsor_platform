// src/hooks/useWebSocket.js
// Manages a single WebSocket connection lifecycle.
// Handles connect, disconnect, reconnect, and message dispatch.
//@author sshende
import { useEffect, useRef, useCallback } from 'react'

const WS_BASE = import.meta.env.VITE_WS_URL || ''

/**
 * @param {string|null}  url       - WebSocket path (e.g. /ws/chat/42/) — null = disabled
 * @param {Function}     onMessage - called with the parsed JSON payload on each message
 */
export default function useWebSocket(url, onMessage) {
  const wsRef       = useRef(null)
  const onMsgRef    = useRef(onMessage)
  const retryRef    = useRef(null)

  // Keep callback ref up-to-date without re-triggering the effect
  useEffect(() => { onMsgRef.current = onMessage }, [onMessage])

  const connect = useCallback(() => {
    if (!url) return

    const token  = localStorage.getItem('access_token')
    const fullUrl = `${WS_BASE}${url}${url.includes('?') ? '&' : '?'}token=${token}`
    const ws     = new WebSocket(fullUrl)

    ws.onopen    = () => {
      console.log('[WS] Connected:', url)
      // Clear any pending reconnect
      if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null }
    }

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        onMsgRef.current?.(payload)
      } catch {
        console.warn('[WS] Non-JSON message:', event.data)
      }
    }

    ws.onclose = (e) => {
      console.log('[WS] Closed:', e.code)
      // Reconnect after 3 s unless intentionally closed (code 1000/4001/4003)
      if (![1000, 4001, 4003].includes(e.code)) {
        retryRef.current = setTimeout(connect, 3000)
      }
    }

    ws.onerror = (err) => console.error('[WS] Error:', err)

    wsRef.current = ws
  }, [url])

  // Open WS when url changes; close on cleanup
  useEffect(() => {
    connect()
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current)
      wsRef.current?.close(1000, 'Component unmounted')
      wsRef.current = null
    }
  }, [connect])

  /** Send a JSON payload over the WebSocket */
  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
      return true
    }
    return false
  }, [])

  return { send, ws: wsRef }
}
