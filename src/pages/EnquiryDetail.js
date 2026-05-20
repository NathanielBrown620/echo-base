import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { Nav, pageStyle, cardStyle, tableStyle, btnStyle, badge, colors } from '../theme'

function EnquiryDetail() {
  const [enquiry, setEnquiry] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const { id } = useParams()

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('enquiries').select('*').eq('id', id).single()
      if (error) console.error(error)
      else { setEnquiry(data); setForm(data) }
    }
    load()
  }, [id])

  async function saveEnquiry() {
    const { error } = await supabase.from('enquiries').update(form).eq('id', id)
    if (error) console.error(error)
    else {
      setEditing(false)
      const { data } = await supabase.from('enquiries').select('*').eq('id', id).single()
      if (data) { setEnquiry(data); setForm(data) }
    }
  }

  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '0.5px solid #e2e8f0', backgroundColor: '#fff', color: '#1a2332', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginTop: '0.3rem' }
  const lbl = { color: '#64748b', fontSize: '12px', display: 'block', marginTop: '0.75rem', fontWeight: '500' }

  if (!enquiry) return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="enquiries" />
      <div style={{ padding: '2rem', color: '#64748b' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="enquiries" />

      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => window.location.href = '/enquiries'} style={btnStyle.ghost}>← Back to Enquiries</button>
        </div>

        <div style={pageStyle.header}>
          <div>
            <div style={pageStyle.title}>{enquiry.client_name}</div>
            <div style={pageStyle.subtitle}>{enquiry.description}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={badge(enquiry.status)}>{enquiry.status}</span>
            <button onClick={() => window.location.href = `/cost/${enquiry.id}`}
              style={{ backgroundColor: '#e8f6fd', color: '#29ABE2', border: '0.5px solid #29ABE2', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
              Cost Model
            </button>
            <button onClick={() => setEditing(!editing)} style={editing ? btnStyle.secondary : btnStyle.primary}>
              {editing ? 'Cancel' : 'Edit'}
            </button>
            {editing && (
              <button onClick={saveEnquiry} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: '500', cursor: 'pointer', fontSize: '13px' }}>
                Save
              </button>
            )}
          </div>
        </div>

        <div style={{ ...cardStyle.statGrid, marginBottom: '1.5rem' }}>
          {[
            { label: 'Estimated Value', value: `£${Number(enquiry.estimated_value || 0).toLocaleString()}` },
            { label: 'Assigned To', value: enquiry.assigned_to || '—' },
            { label: 'Date Received', value: enquiry.date_received || '—' },
            { label: 'Quote Due', value: enquiry.quote_due_date || '—' },
          ].map((stat) => (
            <div key={stat.label} style={cardStyle.card}>
              <div style={cardStyle.statLabel}>{stat.label}</div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1a2332', marginTop: '2px' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {!editing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={cardStyle.card}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '0.75rem' }}>Contact Details</div>
              <div style={{ fontSize: '13px', lineHeight: '2', color: '#374151' }}>
                <div><span style={{ color: '#94a3b8' }}>Name: </span>{enquiry.contact_name || '—'}</div>
                <div><span style={{ color: '#94a3b8' }}>Email: </span>{enquiry.contact_email || '—'}</div>
                <div><span style={{ color: '#94a3b8' }}>Phone: </span>{enquiry.contact_phone || '—'}</div>
              </div>
            </div>
            <div style={cardStyle.card}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '0.75rem' }}>Key Assumptions</div>
              <div style={{ fontSize: '13px', color: '#374151' }}>{enquiry.assumptions || '—'}</div>
            </div>
            <div style={cardStyle.card}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', marginBottom: '0.75rem' }}>Exclusions</div>
              <div style={{ fontSize: '13px', color: '#374151' }}>{enquiry.exclusions || '—'}</div>
            </div>
          </div>
        ) : (
          <div style={{ ...cardStyle.card, maxWidth: '600px' }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a2332', marginBottom: '1rem' }}>Edit Enquiry</div>

            <label style={lbl}>Client Name</label>
            <input style={inp} value={form.client_name || ''} onChange={e => setForm({...form, client_name: e.target.value})} />

            <label style={lbl}>Contact Name</label>
            <input style={inp} value={form.contact_name || ''} onChange={e => setForm({...form, contact_name: e.target.value})} />

            <label style={lbl}>Contact Email</label>
            <input style={inp} value={form.contact_email || ''} onChange={e => setForm({...form, contact_email: e.target.value})} />

            <label style={lbl}>Contact Phone</label>
            <input style={inp} value={form.contact_phone || ''} onChange={e => setForm({...form, contact_phone: e.target.value})} />

            <label style={lbl}>Description of Works</label>
            <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />

            <label style={lbl}>Status</label>
            <select style={inp} value={form.status || 'Enquiry'} onChange={e => setForm({...form, status: e.target.value})}>
              <option>Enquiry</option>
              <option>Estimating</option>
              <option>Quoted</option>
              <option>Awarded</option>
              <option>Lost</option>
              <option>On Hold</option>
            </select>

            <label style={lbl}>Assigned To</label>
            <input style={inp} value={form.assigned_to || ''} onChange={e => setForm({...form, assigned_to: e.target.value})} />

            <label style={lbl}>Date Received</label>
            <input style={inp} type="date" value={form.date_received || ''} onChange={e => setForm({...form, date_received: e.target.value})} />

            <label style={lbl}>Quote Due Date</label>
            <input style={inp} type="date" value={form.quote_due_date || ''} onChange={e => setForm({...form, quote_due_date: e.target.value})} />

            <label style={lbl}>Key Assumptions</label>
            <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.assumptions || ''} onChange={e => setForm({...form, assumptions: e.target.value})} />

            <label style={lbl}>Exclusions</label>
            <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.exclusions || ''} onChange={e => setForm({...form, exclusions: e.target.value})} />
          </div>
        )}
      </div>
    </div>
  )
}

export default EnquiryDetail