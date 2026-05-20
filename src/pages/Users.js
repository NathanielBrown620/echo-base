import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Nav, pageStyle, cardStyle, tableStyle, btnStyle, colors, badge } from '../theme'
import { getUser } from '../auth'

const ROLES = ['admin', 'operations', 'project_manager', 'engineer', 'site_delivery', 'sales']

const roleLabel = (role) => {
  const map = {
    admin: 'Admin',
    operations: 'Operations',
    project_manager: 'Project Manager',
    engineer: 'Engineer',
    site_delivery: 'Site Delivery',
    sales: 'Sales',
  }
  return map[role] || role
}

const roleBadgeStyle = (role) => {
  const map = {
    admin: { backgroundColor: '#fef3c7', color: '#92400e' },
    operations: { backgroundColor: '#e0f2fe', color: '#0369a1' },
    project_manager: { backgroundColor: '#dbeafe', color: '#1d4ed8' },
    engineer: { backgroundColor: '#dcfce7', color: '#166534' },
    site_delivery: { backgroundColor: '#f3e8ff', color: '#6b21a8' },
    sales: { backgroundColor: '#fee2e2', color: '#991b1b' },
  }
  const s = map[role] || { backgroundColor: '#f1f5f9', color: '#475569' }
  return { ...s, padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500', display: 'inline-block', marginRight: '4px' }
}

function Users() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', username: '', password: '', roles: [] })
  const currentUser = getUser()

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const { data, error } = await supabase.from('app_users').select('*').order('created_at')
    if (error) console.error(error)
    else setUsers(data)
  }

  async function createUser() {
    if (!form.full_name || !form.username || !form.password) return
    if (form.roles.length === 0) return alert('Please select at least one role')
    const { error } = await supabase.from('app_users').insert([form])
    if (error) { alert('Username already exists'); return }
    setShowForm(false)
    setForm({ full_name: '', username: '', password: '', roles: [] })
    loadUsers()
  }

  async function toggleActive(user) {
    await supabase.from('app_users').update({ active: !user.active }).eq('id', user.id)
    loadUsers()
  }

  function toggleRole(role) {
    const roles = form.roles.includes(role)
      ? form.roles.filter(r => r !== role)
      : [...form.roles, role]
    setForm({ ...form, roles })
  }

  if (!currentUser?.roles?.includes('admin')) {
    return (
      <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
        <Nav active="users" />
        <div style={{ padding: '2rem', color: '#64748b' }}>You do not have permission to view this page.</div>
      </div>
    )
  }

  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '0.5px solid #e2e8f0', backgroundColor: '#fff', color: '#1a2332', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginTop: '0.3rem' }
  const lbl = { color: '#64748b', fontSize: '12px', display: 'block', marginTop: '0.75rem', fontWeight: '500' }

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="users" />

      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={pageStyle.header}>
          <div>
            <div style={pageStyle.title}>User Management</div>
            <div style={pageStyle.subtitle}>Manage team access and roles</div>
          </div>
          <button onClick={() => setShowForm(true)} style={btnStyle.primary}>+ New User</button>
        </div>

        <div style={tableStyle.wrap}>
          <table style={tableStyle.table}>
            <thead>
              <tr>
                {['Name', 'Username', 'Roles', 'Status', 'Actions'].map(h => (
                  <th key={h} style={tableStyle.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No users yet</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = ''}>
                    <td style={{ ...tableStyle.td, fontWeight: '500', color: '#1a2332' }}>{user.full_name}</td>
                    <td style={{ ...tableStyle.td, color: '#64748b' }}>{user.username}</td>
                    <td style={tableStyle.td}>
                      {user.roles.map(role => (
                        <span key={role} style={roleBadgeStyle(role)}>{roleLabel(role)}</span>
                      ))}
                    </td>
                    <td style={tableStyle.td}>
                      <span style={{ backgroundColor: user.active ? '#dcfce7' : '#fee2e2', color: user.active ? '#166534' : '#991b1b', padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '500' }}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={tableStyle.td}>
                      {user.id !== currentUser.id && (
                        <button onClick={() => toggleActive(user)}
                          style={{ backgroundColor: user.active ? '#fee2e2' : '#dcfce7', color: user.active ? '#991b1b' : '#166534', border: 'none', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>
                          {user.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', width: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, fontSize: '16px', fontWeight: '600', color: '#1a2332', marginBottom: '1rem' }}>New User</h2>

            <label style={lbl}>Full Name</label>
            <input style={inp} value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} />

            <label style={lbl}>Username</label>
            <input style={inp} value={form.username} onChange={e => setForm({...form, username: e.target.value.toLowerCase()})} />

            <label style={lbl}>Password</label>
            <input style={inp} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />

            <label style={lbl}>Roles</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {ROLES.map(role => (
                <button key={role} onClick={() => toggleRole(role)} style={{
                  padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontWeight: '500', border: '0.5px solid',
                  backgroundColor: form.roles.includes(role) ? '#29ABE2' : '#f1f5f9',
                  color: form.roles.includes(role) ? 'white' : '#475569',
                  borderColor: form.roles.includes(role) ? '#29ABE2' : '#e2e8f0',
                }}>
                  {roleLabel(role)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={createUser} style={{ ...btnStyle.primary, flex: 1, padding: '0.65rem' }}>Create User</button>
              <button onClick={() => setShowForm(false)} style={{ ...btnStyle.secondary, flex: 1, padding: '0.65rem' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users