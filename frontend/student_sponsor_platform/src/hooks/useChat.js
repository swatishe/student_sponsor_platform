import { useEffect, useRef, useState, useCallback } from 'react'
import useAuthStore from '@/store/authStore'

const WS_BASE = import.meta.env.VITE_WS_URL || ''

export default function useChat(conversationId) {
  const [messages, setMessages]       = useState([])
  const [typing, setTyping]           = useState(null)
  const [connected, setConnected]     = useState(false)
  const wsRef                         = useRef(null)
  const typingTimer                   = useRef(null)
  const token                         = useAuthStore.getState().accessToken

  useEffect(() => {
    if (!conversationId || !token) return

    const wsUrl = `${WS_BASE}/ws/chat/${conversationId}/?token=${token}`
    const ws    = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen  = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)

    ws.onmessage = (e) => {
      const frame = JSON.parse(e.data)
      if (frame.type === 'message') {
        setMessages((prev) => [...prev, frame.message])
      } else if (frame.type === 'typing') {
        setTyping(frame.is_typing ? frame.user_id : null)
        clearTimeout(typingTimer.current)
        if (frame.is_typing) {
          typingTimer.current = setTimeout(() => setTyping(null), 3000)
        }
      }
    }

    return () => {
      ws.close()
      clearTimeout(typingTimer.current)
    }
  }, [conversationId, token])

  const sendMessage = useCallback((content) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'message', content }))
    }
  }, [])

  const sendTyping = useCallback((isTyping) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: isTyping }))
    }
  }, [])

  return { messages, setMessages, typing, connected, sendMessage, sendTyping }
}
