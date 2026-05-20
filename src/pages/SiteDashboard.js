import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Nav, colors, ECHO_BLUE, badge } from '../theme'
import { getUser } from '../auth'

function SiteDashboard() {
  const [projects, setProjects] = useState([])
  const user = getUser()

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false })
      if (error) console.error(error)
      else setProjects(data)
    }
    load()
  }, [])

  const activeProjects = projects.filter(p => !['Complete', 'Pricing'].includes(p.stage))

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="dashboard" />
      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a2332' }}>Good to see you, {user?.full_name?.split(' ')[0]}</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Here are your active projects</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          {activeProjects.length === 0 ? (
            <div style={{ gridColumn: '1/-1', backgroundColor: '#fff', borderRadius: '8px', border: '0.5px solid #e2e8f0', padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
              No active projects at the moment
            </div>
          ) : (
            activeProjects.map(project => (
              <div key={project.id}
                onClick={() => window.location.href = `/project/${project.id}`}
                style={{ backgroundColor: '#fff', borderRadius: '8px', border: '0.5px solid #e2e8f0', padding: '1.25rem', cursor: 'pointer' }}
                onMouseOver={e => e.currentTarget.style.borderColor = ECHO_BLUE}
                onMouseOut={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a2332' }}>{project.name}</div>
                  <span style={badge(project.stage)}>{project.stage}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '0.5rem' }}>{project.client}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginTop: '1rem', borderTop: '0.5px solid #f1f5f9', paddingTop: '0.75rem' }}>
                  <span>PM: {project.project_manager || '—'}</span>
                  <span>Due: {project.end_date || '—'}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SiteDashboard