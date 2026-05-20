import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Nav, pageStyle, cardStyle, tableStyle, btnStyle, badge, colors } from '../theme'

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', client: '', value: '', stage: 'Pricing',
    rag_status: 'green', start_date: '', end_date: '',
    project_manager: '', description: ''
  })

  useEffect(() => { fetchProjects() }, [])

  async function fetchProjects() {
    const { data, error } = await supabase.from('projects').select('*')
    if (error) console.error(error)
    else setProjects(data)
  }

  async function addProject() {
    const { error } = await supabase.from('projects').insert([form])
    if (error) console.error(error)
    else {
      setShowForm(false)
      setForm({ name: '', client: '', value: '', stage: 'Pricing', rag_status: 'green', start_date: '', end_date: '', project_manager: '', description: '' })
      fetchProjects()
    }
  }

  const ragColour = (rag) => {
    if (rag === 'green') return '#22c55e'
    if (rag === 'amber') return '#f59e0b'
    if (rag === 'red') return '#ef4444'
    return '#94a3b8'
  }

  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '0.5px solid #e2e8f0', backgroundColor: '#fff', color: '#1a2332', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginTop: '0.3rem' }
  const lbl = { color: '#64748b', fontSize: '12px', display: 'block', marginTop: '0.75rem', fontWeight: '500' }

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="dashboard" onNewProject={() => setShowForm(true)} />

      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={pageStyle.header}>
          <div>
            <div style={pageStyle.title}>Dashboard</div>
            <div style={pageStyle.subtitle}>Overview of all live projects</div>
          </div>
        </div>

        <div style={cardStyle.statGrid}>
          {[
            { label: 'Total Projects', value: projects.length },
            { label: 'On Site', value: projects.filter(p => p.stage === 'On Site').length },
            { label: 'In Handover', value: projects.filter(p => p.stage === 'Handover').length },
            { label: 'Pricing', value: projects.filter(p => p.stage === 'Pricing').length },
          ].map((stat) => (
            <div key={stat.label} style={cardStyle.card}>
              <div style={cardStyle.statLabel}>{stat.label}</div>
              <div style={cardStyle.statValue}>{stat.value}</div>
            </div>
          ))}
        </div>

        <div style={tableStyle.wrap}>
          <table style={tableStyle.table}>
            <thead>
              <tr>
                {['Project', 'Client', 'Value', 'Stage', 'PM', 'Start', 'Completion', 'RAG'].map(h => (
                  <th key={h} style={tableStyle.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projects.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No projects yet — click + New Project to add one</td></tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id}
                    onClick={() => window.location.href = `/project/${project.id}`}
                    style={{ cursor: 'pointer' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = ''}>
                    <td style={{ ...tableStyle.td, fontWeight: '500', color: '#1a2332' }}>{project.name}</td>
                    <td style={{ ...tableStyle.td, color: '#64748b' }}>{project.client}</td>
                    <td style={tableStyle.td}>£{Number(project.value).toLocaleString()}</td>
                    <td style={tableStyle.td}><span style={badge(project.stage)}>{project.stage}</span></td>
                    <td style={{ ...tableStyle.td, color: '#64748b' }}>{project.project_manager}</td>
                    <td style={{ ...tableStyle.td, color: '#64748b' }}>{project.start_date}</td>
                    <td style={{ ...tableStyle.td, color: '#64748b' }}>{project.end_date}</td>
                    <td style={tableStyle.td}><span style={{ backgroundColor: ragColour(project.rag_status), borderRadius: '50%', display: 'inline-block', width: '10px', height: '10px' }}></span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, fontSize: '16px', fontWeight: '600', color: '#1a2332', marginBottom: '1rem' }}>New Project</h2>

            <label style={lbl}>Project Name</label>
            <input style={inp} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />

            <label style={lbl}>Client</label>
            <input style={inp} value={form.client} onChange={e => setForm({...form, client: e.target.value})} />

            <label style={lbl}>Value (£)</label>
            <input style={inp} type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />

            <label style={lbl}>Stage</label>
            <select style={inp} value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}>
              <option>Pricing</option>
              <option>Awarded</option>
              <option>Pre-Construction</option>
              <option>On Site</option>
              <option>Commissioning</option>
              <option>Handover</option>
              <option>Complete</option>
            </select>

            <label style={lbl}>Project Manager</label>
            <input style={inp} value={form.project_manager} onChange={e => setForm({...form, project_manager: e.target.value})} />

            <label style={lbl}>Start Date</label>
            <input style={inp} type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />

            <label style={lbl}>Completion Date</label>
            <input style={inp} type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />

            <label style={lbl}>RAG Status</label>
            <select style={inp} value={form.rag_status} onChange={e => setForm({...form, rag_status: e.target.value})}>
              <option value="green">Green</option>
              <option value="amber">Amber</option>
              <option value="red">Red</option>
            </select>

            <label style={lbl}>Description</label>
            <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={addProject} style={{ ...btnStyle.primary, flex: 1, padding: '0.65rem' }}>Save Project</button>
              <button onClick={() => setShowForm(false)} style={{ ...btnStyle.secondary, flex: 1, padding: '0.65rem' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard