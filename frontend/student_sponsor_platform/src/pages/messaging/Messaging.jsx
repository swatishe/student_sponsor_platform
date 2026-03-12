import React, { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { messagingService } from '@/services'
import useAuthStore from '@/store/authStore'
import useChat from '@/hooks/useChat'
import { Avatar, Button, Spinner, EmptyState } from '@/components/ui'
import { fmtTime, fmtRelative } from '@/utils/helpers'

function ConvItem({ conv, active, onClick, currentUser }) {
  const other = conv.participants?.find(p => p.id !== currentUser?.id)
  const last  = conv.last_message
  return (
    <div onClick={onClick} style={{
      display:'flex', alignItems:'center', gap:'12px', padding:'14px 16px',
      cursor:'pointer', background: active ? 'var(--amber-bg)' : 'transparent',
      borderLeft: active ? '2px solid var(--amber)' : '2px solid transparent',
      transition:'background .15s',
    }}
    onMouseEnter={e => { if(!active) e.currentTarget.style.background='var(--bg-hover)' }}
    onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent' }}>
      <Avatar name={other?.profile?.full_name || other?.username} src={other?.profile?.avatar} size={38} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:'14px' }}>{other?.profile?.full_name || other?.username}</div>
        {last && <div style={{ fontSize:'12px', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{last.content}</div>}
      </div>
      {last && <div style={{ fontSize:'11px', color:'var(--text-muted)', flexShrink:0 }}>{fmtRelative(last.created_at)}</div>}
    </div>
  )
}

export default function Messaging() {
  const { user }     = useAuthStore()
  const [activeId, setActiveId] = useState(null)
  const [text, setText] = useState('')
  const bottomRef    = useRef(null)

  const { data: convsData, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn:  () => messagingService.conversations().then(r => r.data),
    refetchInterval: 10_000,
  })

  const { data: historyData } = useQuery({
    queryKey: ['messages', activeId],
    queryFn:  () => messagingService.messages(activeId).then(r => r.data),
    enabled:  !!activeId,
  })

  const { messages, setMessages, typing, connected, sendMessage, sendTyping } = useChat(activeId)

  useEffect(() => {
    if (historyData?.results) setMessages(historyData.results)
  }, [historyData])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const convs = convsData?.results || []

  const send = () => {
    const t = text.trim()
    if (!t || !connected) return
    sendMessage(t)
    setText('')
  }

  const onKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
    else sendTyping(true)
  }

  const activeConv = convs.find(c => c.id === activeId)
  const other = activeConv?.participants?.find(p => p.id !== user?.id)

  return (
    <div style={{ height:'100vh', display:'flex', overflow:'hidden' }}>
      {/* Sidebar */}
      <div style={{ width:280, borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', background:'var(--bg-surface)' }}>
        <div style={{ padding:'20px 16px', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'16px' }}>Messages</h2>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {isLoading ? <div style={{ padding:'20px', textAlign:'center' }}><Spinner /></div> :
           convs.length === 0 ? <div style={{ padding:'20px', color:'var(--text-muted)', fontSize:'13px', textAlign:'center' }}>No conversations yet.<br/>Message a sponsor from a project page.</div> :
           convs.map(c => <ConvItem key={c.id} conv={c} active={c.id===activeId} currentUser={user} onClick={() => setActiveId(c.id)} />)
          }
        </div>
      </div>

      {/* Chat area */}
      {!activeId
        ? <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <EmptyState icon="💬" title="Select a conversation" description="Choose from the list to start chatting." />
          </div>
        : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'12px', background:'var(--bg-surface)' }}>
              <Avatar name={other?.profile?.full_name || other?.username} src={other?.profile?.avatar} size={36} />
              <div>
                <div style={{ fontWeight:600 }}>{other?.profile?.full_name || other?.username}</div>
                <div style={{ fontSize:'12px', color: connected ? 'var(--green)' : 'var(--text-muted)' }}>
                  {connected ? 'Connected' : 'Connecting...'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:'12px' }}>
              {messages.map((m, i) => {
                const mine = m.sender_id === String(user?.id) || m.sender?.id === user?.id
                return (
                  <div key={m.id || i} style={{ display:'flex', justifyContent: mine ? 'flex-end' : 'flex-start', gap:'8px', alignItems:'flex-end' }}>
                    {!mine && <Avatar name={m.sender_name || m.sender?.username} src={m.sender_avatar || m.sender?.profile?.avatar} size={28} />}
                    <div style={{
                      maxWidth:'65%', padding:'10px 14px', borderRadius:mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: mine ? 'var(--amber)' : 'var(--bg-card)',
                      color: mine ? '#000' : 'var(--text-primary)',
                      border: mine ? 'none' : '1px solid var(--border)',
                      fontSize:'14px', lineHeight:1.5,
                    }}>
                      {m.content}
                      <div style={{ fontSize:'10px', marginTop:'4px', opacity:.6, textAlign:'right' }}>{fmtTime(m.created_at)}</div>
                    </div>
                  </div>
                )
              })}
              {typing && (
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <div style={{ fontSize:'12px', color:'var(--text-muted)', fontStyle:'italic' }}>typing…</div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div style={{ padding:'16px 24px', borderTop:'1px solid var(--border)', display:'flex', gap:'12px', background:'var(--bg-surface)' }}>
              <textarea
                rows={1}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type a message… (Enter to send)"
                style={{
                  flex:1, background:'var(--bg-input)', border:'1px solid var(--border)',
                  borderRadius:'var(--radius-md)', padding:'10px 14px', fontSize:'14px',
                  color:'var(--text-primary)', outline:'none', resize:'none', fontFamily:'var(--font-body)',
                }}
              />
              <Button onClick={send} disabled={!text.trim() || !connected}>Send</Button>
            </div>
          </div>
        )
      }
    </div>
  )
}
