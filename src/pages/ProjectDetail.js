import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { Nav, pageStyle, cardStyle, tableStyle, btnStyle, badge, colors } from '../theme'

function ProjectDetail() {
  const [project, setProject] = useState(null)
  const { id } = useParams()

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
      if (error) console.error(error)
      else setProject(data)
    }
    load()
  }, [id])

  const ragColour = (rag) => {
    if (rag === 'green') return '#22c55e'
    if (rag === 'amber') return '#f59e0b'
    if (rag === 'red') return '#ef4444'
    return '#94a3b8'
  }

  const sections = ['Sales Handover', 'Commercial', 'Project Management', 'Engineering', 'Procurement', 'HSEQ', 'Change Control', 'Handover']

  if (!project) return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="dashboard" />
      <div style={{ padding: '2rem', color: '#64748b' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="dashboard" />

      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => window.location.href = '/'} style={btnStyle.ghost}>← Back to Dashboard</button>
        </div>

        <div style={pageStyle.header}>
          <div>
            <div style={pageStyle.title}>{project.name}</div>
            <div style={pageStyle.subtitle}>{project.client}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ backgroundColor: ragColour(project.rag_status), borderRadius: '50%', display: 'inline-block', width: '12px', height: '12px' }}></span>
            <span style={badge(project.stage)}>{project.stage}</span>
          </div>
        </div>

        <div style={{ ...cardStyle.statGrid, marginBottom: '1.5rem' }}>
          {[
            { label: 'Contract Value', value: `£${Number(project.value || 0).toLocaleString()}` },
            { label: 'Project Manager', value: project.project_manager || '—' },
            { label: 'Start Date', value: project.start_date || '—' },
            { label: 'Completion Date', value: project.end_date || '—' },
          ].map((stat) => (
            <div key={stat.label} style={cardStyle.card}>
              <div style={cardStyle.statLabel}>{stat.label}</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a2332', marginTop: '2px' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {project.description && (
          <div style={{ ...cardStyle.card, marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '0.5rem' }}>Description</div>
            <div style={{ fontSize: '13px', color: '#374151' }}>{project.description}</div>
          </div>
        )}

        <div style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Project Sections</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {sections.map((section) => (
            <div key={section} style={{ ...cardStyle.card, cursor: 'pointer', transition: 'border-color 0.15s' }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#29ABE2'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
              <div style={{ fontWeight: '500', fontSize: '13px', color: '#1a2332', marginBottom: '4px' }}>{section}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>0 items</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail