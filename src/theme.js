import React from 'react'

export const ECHO_BLUE = '#29ABE2'
export const ECHO_BLUE_DARK = '#1a8fc4'
export const ECHO_BLUE_LIGHT = '#e8f6fd'

export const colors = {
  bg: '#f0f4f8',
  white: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  text: '#1a2332',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  blue: ECHO_BLUE,
  blueDark: ECHO_BLUE_DARK,
  blueLight: ECHO_BLUE_LIGHT,
  green: '#166534',
  greenBg: '#dcfce7',
  amber: '#854d0e',
  amberBg: '#fef9c3',
  red: '#991b1b',
  redBg: '#fee2e2',
  purple: '#6b21a8',
  purpleBg: '#f3e8ff',
}

export const navStyle = {
  nav: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '0', height: '80px', position: 'sticky', top: 0, zIndex: 100 },
  logo: { display: 'flex', alignItems: 'center', marginRight: '2rem' },
  logoImg: { height: '64px' },
  navTab: { fontSize: '15px', color: '#64748b', padding: '0 1.5rem', cursor: 'pointer', border: 'none', background: 'none', height: '80px', display: 'flex', alignItems: 'center', borderBottom: '3px solid transparent', fontWeight: '400' },
  navTabActive: { fontSize: '15px', color: '#ffffff', padding: '0 1.5rem', cursor: 'pointer', border: 'none', background: '#29ABE2', height: '80px', display: 'flex', alignItems: 'center', borderBottom: '3px solid #1a8fc4', fontWeight: '600' },
  spacer: { flex: 1 },
}

export const pageStyle = {
  page: { fontFamily: "'Segoe UI', system-ui, sans-serif", padding: '1.5rem 2rem', backgroundColor: '#f0f4f8', minHeight: '100vh', color: '#1a2332' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '20px', fontWeight: '600', color: '#1a2332' },
  subtitle: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
}

export const cardStyle = {
  card: { background: '#fff', borderRadius: '8px', border: '0.5px solid #e2e8f0', padding: '1.2rem' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' },
  statLabel: { fontSize: '12px', color: '#64748b', marginBottom: '4px' },
  statValue: { fontSize: '22px', fontWeight: '600', color: '#1a2332' },
}

export const tableStyle = {
  wrap: { background: '#fff', borderRadius: '8px', border: '0.5px solid #e2e8f0', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '11px', color: '#94a3b8', fontWeight: '500', padding: '8px 16px', textAlign: 'left', backgroundColor: '#f8fafc', borderBottom: '0.5px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '10px 16px', fontSize: '13px', borderBottom: '0.5px solid #f1f5f9', color: '#374151' },
}

export const btnStyle = {
  primary: { backgroundColor: ECHO_BLUE, color: 'white', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '14px' },
  secondary: { backgroundColor: '#fff', color: '#374151', border: '0.5px solid #e2e8f0', padding: '0.6rem 1.5rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', fontSize: '13px' },
  danger: { backgroundColor: '#fee2e2', color: '#991b1b', border: '0.5px solid #fecaca', padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', fontSize: '13px' },
  ghost: { background: 'none', border: 'none', color: ECHO_BLUE, cursor: 'pointer', fontSize: '13px', padding: '0' },
}

export const inputStyle = {
  input: { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '0.5px solid #e2e8f0', backgroundColor: '#fff', color: '#1a2332', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
  label: { color: '#64748b', fontSize: '12px', display: 'block', marginTop: '0.75rem', marginBottom: '2px', fontWeight: '500' },
}

export const badge = (status) => {
  const map = {
    'Awarded': { bg: '#dbeafe', color: '#1d4ed8' },
    'On Site': { bg: '#dcfce7', color: '#166534' },
    'Handover': { bg: '#fef9c3', color: '#854d0e' },
    'Pricing': { bg: '#f3e8ff', color: '#6b21a8' },
    'Pre-Construction': { bg: '#e0f2fe', color: '#0369a1' },
    'Commissioning': { bg: '#fef3c7', color: '#92400e' },
    'Complete': { bg: '#f0fdf4', color: '#166534' },
    'Enquiry': { bg: '#f3e8ff', color: '#6b21a8' },
    'Estimating': { bg: '#fef9c3', color: '#854d0e' },
    'Quoted': { bg: '#dbeafe', color: '#1d4ed8' },
    'Lost': { bg: '#fee2e2', color: '#991b1b' },
    'On Hold': { bg: '#f1f5f9', color: '#475569' },
  }
  const s = map[status] || { bg: '#f1f5f9', color: '#475569' }
  return { backgroundColor: s.bg, color: s.color, padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', display: 'inline-block' }
}

export const Nav = ({ active, onNewProject, onNewEnquiry }) => {
  const user = JSON.parse(localStorage.getItem('echobase_user') || '{}')
  const isAdmin = user.roles?.includes('admin')
  const canSeeEnquiries = user.roles?.some(r => ['admin', 'operations', 'project_manager', 'sales'].includes(r))
  const canSeeProjects = user.roles?.some(r => ['admin', 'operations', 'project_manager', 'engineer', 'site_delivery'].includes(r))
  const [unread, setUnread] = React.useState(0)
  const [showNotifs, setShowNotifs] = React.useState(false)
  const [notifs, setNotifs] = React.useState([])

  React.useEffect(() => {
    if (!user.id) return
    async function loadNotifs() {
      const { createClient } = await import('@supabase/supabase-js')
      const sb = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY)
      const { data } = await sb.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20)
      if (data) {
        setNotifs(data)
        setUnread(data.filter(n => !n.read).length)
      }
    }
    loadNotifs()
    const interval = setInterval(loadNotifs, 30000)
    return () => clearInterval(interval)
  }, [user.id])

  async function markAllRead() {
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY)
    await sb.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setUnread(0)
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div style={navStyle.nav}>
      <div style={navStyle.logo}>
        <img src="/echo-logo.png" alt="Echo Engineering Solutions" style={navStyle.logoImg} />
      </div>
      {canSeeProjects && (
        <button onClick={() => window.location.href = '/'} style={active === 'dashboard' ? navStyle.navTabActive : navStyle.navTab}>Dashboard</button>
      )}
      {canSeeEnquiries && (
        <button onClick={() => window.location.href = '/enquiries'} style={active === 'enquiries' ? navStyle.navTabActive : navStyle.navTab}>Enquiries</button>
      )}
      {isAdmin && (
        <button onClick={() => window.location.href = '/users'} style={active === 'users' ? navStyle.navTabActive : navStyle.navTab}>Users</button>
      )}
      <div style={navStyle.spacer}></div>
      {onNewEnquiry && <button onClick={onNewEnquiry} style={{ ...btnStyle.primary, marginRight: '0.5rem' }}>+ New Enquiry</button>}
      {onNewProject && <button onClick={onNewProject} style={{ ...btnStyle.primary, marginRight: '1rem' }}>+ New Project</button>}

      <div style={{ position: 'relative', marginRight: '1rem' }}>
        <button onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead() }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          {unread > 0 && (
            <span style={{ position: 'absolute', top: '0', right: '0', backgroundColor: '#ef4444', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        {showNotifs && (
          <div style={{ position: 'absolute', right: 0, top: '48px', width: '320px', backgroundColor: '#fff', borderRadius: '8px', border: '0.5px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 200 }}>
            <div style={{ padding: '12px 16px', borderBottom: '0.5px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332' }}>Notifications</span>
              <button onClick={markAllRead} style={{ fontSize: '11px', color: '#29ABE2', background: 'none', border: 'none', cursor: 'pointer' }}>Mark all read</button>
            </div>
            <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
              {notifs.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No notifications</div>
              ) : (
                notifs.map(n => (
                  <div key={n.id}
                    onClick={() => { if (n.link) window.location.href = n.link; setShowNotifs(false) }}
                    style={{ padding: '12px 16px', borderBottom: '0.5px solid #f1f5f9', backgroundColor: n.read ? '#fff' : '#f0f9ff', cursor: n.link ? 'pointer' : 'default' }}
                    onMouseOver={e => { if (n.link) e.currentTarget.style.backgroundColor = '#e8f6fd' }}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = n.read ? '#fff' : '#f0f9ff'}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a2332', marginBottom: '2px' }}>{n.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{n.message}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{new Date(n.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ fontSize: '13px', color: '#64748b' }}>{user.full_name}</div>
        <button onClick={() => { localStorage.removeItem('echobase_user'); window.location.href = '/login' }}
          style={{ backgroundColor: '#f1f5f9', color: '#64748b', border: '0.5px solid #e2e8f0', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}