import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'

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
    return '#6b7280'
  }

  const input = { width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', marginTop: '0.3rem', boxSizing: 'border-box' }
  const label = { color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginTop: '0.75rem' }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
       <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
  <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>EchoBase</h1>
  <button onClick={() => window.location.href = '/enquiries'} style={{ backgroundColor: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
    Enquiries
  </button>
</div>
        <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + New Project
        </button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '2rem', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, color: '#38bdf8' }}>New Project</h2>

            <label style={label}>Project Name</label>
            <input style={input} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />

            <label style={label}>Client</label>
            <input style={input} value={form.client} onChange={e => setForm({...form, client: e.target.value})} />

            <label style={label}>Value (£)</label>
            <input style={input} type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />

            <label style={label}>Stage</label>
            <select style={input} value={form.stage} onChange={e => setForm({...form, stage: e.target.value})}>
              <option>Pricing</option>
              <option>Awarded</option>
              <option>Pre-Construction</option>
              <option>On Site</option>
              <option>Commissioning</option>
              <option>Handover</option>
              <option>Complete</option>
            </select>

            <label style={label}>Project Manager</label>
            <input style={input} value={form.project_manager} onChange={e => setForm({...form, project_manager: e.target.value})} />

            <label style={label}>Start Date</label>
            <input style={input} type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />

            <label style={label}>Completion Date</label>
            <input style={input} type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />

            <label style={label}>RAG Status</label>
            <select style={input} value={form.rag_status} onChange={e => setForm({...form, rag_status: e.target.value})}>
              <option value="green">Green</option>
              <option value="amber">Amber</option>
              <option value="red">Red</option>
            </select>

            <label style={label}>Description</label>
            <textarea style={{...input, height: '80px', resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={addProject} style={{ flex: 1, backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                Save Project
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, backgroundColor: '#334155', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Projects', value: projects.length },
          { label: 'On Site', value: projects.filter(p => p.stage === 'On Site').length },
          { label: 'In Handover', value: projects.filter(p => p.stage === 'Handover').length },
          { label: 'Pricing', value: projects.filter(p => p.stage === 'Pricing').length },
        ].map((stat) => (
          <div key={stat.label} style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{stat.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '0.85rem' }}>
              {['Project', 'Client', 'Value', 'Stage', 'PM', 'Start', 'Completion', 'RAG'].map(h => (
                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No projects yet — click + New Project to add one
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} onClick={() => window.location.href = `/project/${project.id}`} style={{ borderTop: '1px solid #0f172a', cursor: 'pointer' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>{project.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{project.client}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>£{Number(project.value).toLocaleString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{project.stage}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{project.project_manager}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{project.start_date}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{project.end_date}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ backgroundColor: ragColour(project.rag_status), borderRadius: '50%', display: 'inline-block', width: '12px', height: '12px' }}></span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Dashboard