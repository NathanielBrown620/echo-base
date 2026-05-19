import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function ProjectDetail() {
  const [project, setProject] = useState(null)
  const id = window.location.pathname.split('/').pop()

  useEffect(() => { fetchProject() }, [id])

  async function fetchProject() {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
    if (error) console.error(error)
    else setProject(data)
  }

  if (!project) return <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', padding: '2rem' }}>Loading...</div>

  const sections = ['Sales Handover', 'Commercial', 'Project Management', 'Engineering', 'Procurement', 'HSEQ', 'Change Control', 'Handover']

  const ragColour = (rag) => {
    if (rag === 'green') return '#22c55e'
    if (rag === 'amber') return '#f59e0b'
    if (rag === 'red') return '#ef4444'
    return '#6b7280'
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>

      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => window.location.href = '/'} style={{ backgroundColor: 'transparent', color: '#38bdf8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{project.name}</h1>
          <div style={{ color: '#94a3b8', marginTop: '0.3rem' }}>{project.client}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ backgroundColor: ragColour(project.rag_status), borderRadius: '50%', display: 'inline-block', width: '12px', height: '12px' }}></span>
          <span style={{ backgroundColor: '#1e293b', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem' }}>{project.stage}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Contract Value', value: `£${Number(project.value).toLocaleString()}` },
          { label: 'Project Manager', value: project.project_manager },
          { label: 'Start Date', value: project.start_date },
          { label: 'Completion Date', value: project.end_date },
        ].map((stat) => (
          <div key={stat.label} style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{stat.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginTop: '0.3rem' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {project.description && (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.2rem', marginBottom: '2rem' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Description</div>
          <div>{project.description}</div>
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', color: '#94a3b8', marginBottom: '1rem' }}>Project Sections</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {sections.map((section) => (
          <div key={section} style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.2rem', cursor: 'pointer', border: '1px solid #334155' }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#38bdf8'}
            onMouseOut={e => e.currentTarget.style.borderColor = '#334155'}>
            <div style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>{section}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>0 items</div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default ProjectDetail