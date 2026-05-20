import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { Nav, colors, ECHO_BLUE, btnStyle } from '../theme'
import { getUser } from '../auth'

function ProjectChat() {
  const { id: projectId } = useParams()
  const [project, setProject] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [expandedThreads, setExpandedThreads] = useState({})
  const messagesEndRef = useRef(null)
  const user = getUser()

  useEffect(() => {
    loadProject()
    loadMessages()
    markAsRead()

    const channel = supabase
      .channel('project-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`
      }, () => { loadMessages(); markAsRead() })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [projectId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadProject() {
    const { data } = await supabase.from('projects').select('*').eq('id', projectId).single()
    if (data) setProject(data)
  }

  async function loadMessages() {
    const { data } = await supabase
      .from('project_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  async function markAsRead() {
    await supabase.from('message_reads').upsert({
      user_id: user.id,
      project_id: projectId,
      last_read: new Date().toISOString()
    }, { onConflict: 'user_id,project_id' })
  }

  async function sendMessage() {
    if (!newMessage.trim()) return
    await supabase.from('project_messages').insert([{
      project_id: projectId,
      user_id: user.id,
      user_name: user.full_name,
      message: newMessage.trim(),
      parent_id: replyTo?.id || null
    }])
    setNewMessage('')
    setReplyTo(null)
  }

  function toggleThread(id) {
    setExpandedThreads(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const topLevel = messages.filter(m => !m.parent_id)
  const getReplies = (id) => messages.filter(m => m.parent_id === id)

  const formatTime = (ts) => {
    const d = new Date(ts)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    return isToday
      ? d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??'

  const avatarColours = ['#29ABE2', '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444']
  const getAvatarColour = (name) => avatarColours[(name?.charCodeAt(0) || 0) % avatarColours.length]

  if (!project) return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="dashboard" />
      <div style={{ padding: '2rem', color: '#64748b' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav active="dashboard" />

      <div style={{ padding: '1rem 2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => window.location.href = `/project/${projectId}`} style={btnStyle.ghost}>← Back to Project</button>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a2332' }}>{project.name} — Chat</div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>{project.client}</div>
      </div>

      <div style={{ flex: 1, padding: '1rem 2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 220px)' }}>
        {topLevel.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '3rem' }}>
            No messages yet — start the conversation
          </div>
        )}

        {topLevel.map(msg => {
          const replies = getReplies(msg.id)
          const isExpanded = expandedThreads[msg.id]
          const isOwn = msg.user_id === user.id

          return (
            <div key={msg.id} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: getAvatarColour(msg.user_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'white', flexShrink: 0 }}>
                  {getInitials(msg.user_name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332' }}>{msg.user_name}</span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatTime(msg.created_at)}</span>
                  </div>
                  <div style={{ backgroundColor: isOwn ? '#e8f6fd' : '#fff', border: `0.5px solid ${isOwn ? '#29ABE2' : '#e2e8f0'}`, borderRadius: '8px', padding: '0.75rem 1rem', fontSize: '13px', color: '#1a2332', display: 'inline-block', maxWidth: '80%' }}>
                    {msg.message}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '4px' }}>
                    <button onClick={() => setReplyTo(msg)} style={{ fontSize: '11px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
                      Reply
                    </button>
                    {replies.length > 0 && (
                      <button onClick={() => toggleThread(msg.id)} style={{ fontSize: '11px', color: ECHO_BLUE, background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
                        {isExpanded ? 'Hide' : `${replies.length} repl${replies.length === 1 ? 'y' : 'ies'}`}
                      </button>
                    )}
                  </div>

                  {isExpanded && replies.map(reply => (
                    <div key={reply.id} style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', marginLeft: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: getAvatarColour(reply.user_name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '600', color: 'white', flexShrink: 0 }}>
                        {getInitials(reply.user_name)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#1a2332' }}>{reply.user_name}</span>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatTime(reply.created_at)}</span>
                        </div>
                        <div style={{ backgroundColor: reply.user_id === user.id ? '#e8f6fd' : '#fff', border: `0.5px solid ${reply.user_id === user.id ? '#29ABE2' : '#e2e8f0'}`, borderRadius: '8px', padding: '0.6rem 0.9rem', fontSize: '13px', color: '#1a2332', display: 'inline-block', maxWidth: '80%' }}>
                          {reply.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ padding: '1rem 2rem', backgroundColor: '#fff', borderTop: '0.5px solid #e2e8f0' }}>
        {replyTo && (
          <div style={{ backgroundColor: '#f0f9ff', border: '0.5px solid #29ABE2', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '0.5rem', fontSize: '12px', color: '#0369a1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Replying to <strong>{replyTo.user_name}</strong>: {replyTo.message.slice(0, 60)}{replyTo.message.length > 60 ? '...' : ''}</span>
            <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '14px' }}>✕</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '0.5px solid #e2e8f0', fontSize: '13px', color: '#1a2332', outline: 'none', resize: 'none', minHeight: '44px', maxHeight: '120px', fontFamily: "'Segoe UI', system-ui, sans-serif" }}
            rows={1}
          />
          <button onClick={sendMessage} style={{ ...btnStyle.primary, padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default ProjectChat