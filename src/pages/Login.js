import React, { useState } from 'react'
import { supabase } from '../supabase'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!username || !password) { setError('Please enter username and password'); return }
    setLoading(true)
    setError('')
    const { data, error } = await supabase.from('app_users').select('*').eq('username', username.toLowerCase().trim()).eq('password', password).eq('active', true).single()
    if (error || !data) { setError('Invalid username or password'); setLoading(false); return }
    localStorage.setItem('echobase_user', JSON.stringify({ id: data.id, full_name: data.full_name, username: data.username, roles: data.roles }))
    window.location.href = '/'
    setLoading(false)
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: '#f0f4f8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '0 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/echo-logo.png" alt="Echo Engineering Solutions" style={{ height: '70px', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '13px', color: '#64748b', letterSpacing: '0.5px' }}>EchoBase — Project Management</div>
        </div>
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '0.5px solid #e2e8f0', padding: '2rem' }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a2332', marginBottom: '1.5rem' }}>Sign in to your account</div>
          {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '13px', marginBottom: '1rem' }}>{error}</div>}
          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter your username" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '0.5px solid #e2e8f0', fontSize: '13px', color: '#1a2332', outline: 'none', boxSizing: 'border-box', marginBottom: '1rem' }} />
          <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="Enter your password" style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '6px', border: '0.5px solid #e2e8f0', fontSize: '13px', color: '#1a2332', outline: 'none', boxSizing: 'border-box', marginBottom: '1.5rem' }} />
          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', backgroundColor: '#29ABE2', color: 'white', border: 'none', padding: '0.7rem', borderRadius: '6px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '12px', color: '#94a3b8' }}>Contact your administrator if you need access</div>
      </div>
    </div>
  )
}

export default Login