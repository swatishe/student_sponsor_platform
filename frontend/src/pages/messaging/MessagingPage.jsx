// src/pages/messaging/MessagingPage.jsx
// Real-time chat using WebSocket (with REST fallback).
//@author sshende
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { messagingAPI } from '../../api/services'
import { useAuth } from '../../context/AuthContext'
import Avatar from '../../components/common/Avatar'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import { Send, MessageSquare, Search, ArrowLeft } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import styles from './Messaging.module.css'

// WebSocket base — empty string means same host (works with Vite proxy)
const WS_BASE = import.meta.env.VITE_WS_URL
  || import.meta.env.VITE_API_URL?.replace('https://', 'wss://').replace('http://', 'ws://')
  || ''

export default function MessagingPage() {
  const { convId }  = useParams()
  const { user }    = useAuth()
  const navigate    = useNavigate()

  const [conversations, setConversations] = useState([])
  const [messages, setMessages]           = useState([])
  const [activeConv, setActiveConv]       = useState(null)
  const [input, setInput]                 = useState('')
  const [loading, setLoading]             = useState(true)
  const [convSearch, setConvSearch]       = useState('')

  const wsRef     = useRef(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // ── Load conversations ────────────────────────────────────────────────
  useEffect(() => {
    messagingAPI.getConversations()
      .then(({ data }) => {
        const convs = data?.results ?? data ?? []
        setConversations(convs)
        // Auto-open if URL has a conv ID
        if (convId) {
          const found = convs.find((c) => String(c.id) === String(convId))
          if (found) openConversation(found)
        }
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll to bottom when messages change ─────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Open conversation: load history + open WS ─────────────────────────
  const openConversation = useCallback(async (conv) => {
    setActiveConv(conv)
    navigate(`/messages/${conv.id}`, { replace: true })

    // Close previous WS
    if (wsRef.current) { wsRef.current.close(1000); wsRef.current = null }

    // Load message history
    const { data } = await messagingAPI.getMessages(conv.id)
    setMessages(data?.results ?? data ?? [])

    // Open WebSocket
    const token = localStorage.getItem('access_token')
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${conv.id}/?token=${token}`)

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.type === 'message') {
          setMessages((prev) => {
            if (prev.find((m) => m.id === payload.message_id)) return prev
            return [...prev, {
              id: payload.message_id,
              content: payload.content,
              created_at: payload.created_at,
              is_read: false,
              sender: { id: payload.sender_id, first_name: payload.sender_name?.split(' ')[0] || '', last_name: payload.sender_name?.split(' ').slice(1).join(' ') || '' },
            }]
          })
          // Bump conversation's preview to top
          setConversations((prev) => {
            const updated = prev.map((c) =>
              c.id === conv.id ? { ...c, updated_at: new Date().toISOString(), last_message: { content: payload.content } } : c
            )
            return [...updated].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          })
        }
      } catch { /* non-JSON */ }
    }

    ws.onerror = () => console.error('[WS] connection error')
    wsRef.current = ws
    setTimeout(() => inputRef.current?.focus(), 150)
  }, [navigate])

  // ── Cleanup WS on unmount ─────────────────────────────────────────────
  useEffect(() => () => wsRef.current?.close(1000), [])

  // ── Send message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const content = input.trim()
    if (!content || !activeConv) return
    setInput('')

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      // Send via WebSocket (consumer persists + broadcasts)
      wsRef.current.send(JSON.stringify({ message: content }))
    } else {
      // REST fallback
      try {
        const { data } = await messagingAPI.sendMessage(activeConv.id, content)
        setMessages((prev) => [...prev, data])
      } catch { setInput(content) }
    }
  }, [input, activeConv])

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const otherParticipant = (conv) => conv.participants?.find((p) => p.id !== user?.id)

  const filteredConvs = conversations.filter((c) => {
    const other = otherParticipant(c)
    return `${other?.first_name} ${other?.last_name}`.toLowerCase().includes(convSearch.toLowerCase())
  })

  return (
    <div className={styles.container}>

      {/* ── Conversations sidebar ── */}
      <div className={`${styles.sidebar} ${activeConv ? styles.hideMobile : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>Messages</h2>
          <div style={{ position: 'relative', marginTop: 10 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input type="text" placeholder="Search…" value={convSearch} onChange={(e) => setConvSearch(e.target.value)}
              className="form-input" style={{ paddingLeft: 30, fontSize: '0.82rem', padding: '7px 7px 7px 30px' }} />
          </div>
        </div>

        <div className={styles.convList}>
          {loading
            ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading…</div>
            : filteredConvs.length === 0
              ? <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {conversations.length === 0 ? 'No conversations yet' : 'No results'}
                </div>
              : filteredConvs.map((conv) => {
                  const other    = otherParticipant(conv)
                  const isActive = activeConv?.id === conv.id
                  return (
                    <button key={conv.id} onClick={() => openConversation(conv)}
                      className={`${styles.convItem} ${isActive ? styles.convActive : ''}`}>
                      <Avatar user={other} size={40} radius={10} />
                      <div className={styles.convInfo}>
                        <div className={styles.convName}>
                          {other?.first_name} {other?.last_name}
                          {conv.unread_count > 0 && <span className={styles.unreadBadge}>{conv.unread_count}</span>}
                        </div>
                        <div className={styles.convPreview}>{conv.last_message?.content || 'No messages yet'}</div>
                      </div>
                      <div className={styles.convTime}>
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: false })}
                      </div>
                    </button>
                  )
                })
          }
        </div>
      </div>

      {/* ── Chat panel ── */}
      <div className={`${styles.chat} ${!activeConv ? styles.hideMobile : ''}`}>
        {activeConv ? (
          <>
            {/* Header */}
            <div className={styles.chatHeader}>
              <button className={styles.backBtn} onClick={() => { setActiveConv(null); navigate('/messages') }}>
                <ArrowLeft size={18} />
              </button>
              {(() => {
                const other = otherParticipant(activeConv)
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar user={other} size={38} radius={10} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{other?.first_name} {other?.last_name}</div>
                      <Badge variant={other?.role} />
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Messages */}
            <div className={styles.messages}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '40px 20px' }}>
                  Start the conversation below ↓
                </div>
              )}
              {messages.map((msg) => {
                const isMine = msg.sender?.id === user?.id
                return (
                  <div key={msg.id} className={`${styles.bubble} ${isMine ? styles.mine : styles.theirs}`}>
                    {!isMine && (
                      <div className={styles.senderName}>{msg.sender?.first_name} {msg.sender?.last_name}</div>
                    )}
                    <div className={styles.bubbleContent}>{msg.content}</div>
                    <div className={styles.bubbleTime}>{format(new Date(msg.created_at), 'h:mm a')}</div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className={styles.inputBar}>
              <textarea ref={inputRef} className={styles.messageInput}
                placeholder="Type a message… (Enter to send)" value={input}
                onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} rows={1} />
              <button className={`btn btn-primary ${styles.sendBtn}`} onClick={sendMessage} disabled={!input.trim()}>
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className={styles.emptyChat}>
            <MessageSquare size={48} style={{ opacity: 0.18, marginBottom: 16 }} />
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the list, or start one from a project page.</p>
          </div>
        )}
      </div>
    </div>
  )
}
