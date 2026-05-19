import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function EnquiryDetail() {
  const [enquiry, setEnquiry] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const id = window.location.pathname.split('/').pop()

  useEffect(() => { fetchEnquiry() }, [id])

  async function fetchEnquiry() {
    const { data, error } = await supabase.from('enquiries').select('*').eq('id', id).single()
    if (error) console.error(error)
    else { setEnquiry(data); setForm(data) }
  }

  async function saveEnquiry() {
    const { error } = await supabase.from('enquiries').update(form).eq('id', id)
    if (error) console.error(error)
    else { setEditing(false); fetchEnquiry() }
  }

  const statusColour = (status) => {
    if (status === 'Awarded') return { bg: '#166534', text: '#86efac' }
    if (status === 'Quoted') return { bg: '#1e3a5f', text: '#93c5fd' }
    if (status === 'Estimating') return { bg: '#78350f', text: '#fcd34d' }
    if (status === 'Lost') return { bg: '#7f1d1d', text: '#fca5a5' }
    if (status === 'On Hold') return { bg: '#374151', text: '#9ca3af' }
    return { bg: '#4c1d95', text: '#c4b5fd' }
  }

  const input = { width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', marginTop: '0.3rem', boxSizing: 'border-box' }
  const label = { color: '#94a3b8', fontSize: '0.85rem', display: 'block', marginTop: '0.75rem' }

  if (!enquiry) return <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', padding: '2rem' }}>Loading...</div>

  const sc = statusColour(enquiry.status)

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>

      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => window.location.href = '/enquiries'} style={{ backgroundColor: 'transparent', color: '#38bdf8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
          ← Back to Enquiries
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', margin: 0 }}>{enquiry.client_name}</h1>
          <div style={{ color: '#94a3b8', marginTop: '0.3rem' }}>{enquiry.description}</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ backgroundColor: sc.bg, color: sc.text, padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem' }}>{enquiry.status}</span>
          <button onClick={() => window.location.href = `/cost/${enquiry.id}`} style={{ backgroundColor: '#1e3a5f', color: '#93c5fd', border: '1px solid #1e40af', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>
            Cost Model
          </button>
          <button onClick={() => setEditing(!editing)} style={{ backgroundColor: editing ? '#334155' : '#38bdf8', color: editing ? 'white' : '#0f172a', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
            {editing ? 'Cancel' : 'Edit'}
          </button>
          {editing && (
            <button onClick={saveEnquiry} style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}>
              Save
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Estimated Value', value: `£${Number(enquiry.estimated_value).toLocaleString()}` },
          { label: 'Assigned To', value: enquiry.assigned_to },
          { label: 'Date Received', value: enquiry.date_received },
          { label: 'Quote Due', value: enquiry.quote_due_date },
        ].map((stat) => (
          <div key={stat.label} style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{stat.label}</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'white', marginTop: '0.3rem' }}>{stat.value || '—'}</div>
          </div>
        ))}
      </div>

      {!editing ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Contact Details</div>
            <div style={{ fontSize: '13px', lineHeight: '2' }}>
              <div><span style={{ color: '#94a3b8' }}>Name: </span>{enquiry.contact_name || '—'}</div>
              <div><span style={{ color: '#94a3b8' }}>Email: </span>{enquiry.contact_email || '—'}</div>
              <div><span style={{ color: '#94a3b8' }}>Phone: </span>{enquiry.contact_phone || '—'}</div>
            </div>
          </div>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Key Assumptions</div>
            <div style={{ fontSize: '13px', color: 'white' }}>{enquiry.assumptions || '—'}</div>
          </div>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Exclusions</div>
            <div style={{ fontSize: '13px', color: 'white' }}>{enquiry.exclusions || '—'}</div>
          </div>
        </div>
      ) : (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.5rem' }}>
          <h3 style={{ color: '#38bdf8', marginTop: 0 }}>Edit Enquiry</h3>

          <label style={label}>Client Name</label>
          <input style={input} value={form.client_name || ''} onChange={e => setForm({...form, client_name: e.target.value})} />

          <label style={label}>Contact Name</label>
          <input style={input} value={form.contact_name || ''} onChange={e => setForm({...form, contact_name: e.target.value})} />

          <label style={label}>Contact Email</label>
          <input style={input} value={form.contact_email || ''} onChange={e => setForm({...form, contact_email: e.target.value})} />

          <label style={label}>Contact Phone</label>
          <input style={input} value={form.contact_phone || ''} onChange={e => setForm({...form, contact_phone: e.target.value})} />

          <label style={label}>Description of Works</label>
          <textarea style={{...input, height: '80px', resize: 'vertical'}} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} />

          <label style={label}>Estimated Value (£)</label>
          <input style={input} type="number" value={form.estimated_value || ''} onChange={e => setForm({...form, estimated_value: e.target.value})} />

          <label style={label}>Status</label>
          <select style={input} value={form.status || 'Enquiry'} onChange={e => setForm({...form, status: e.target.value})}>
            <option>Enquiry</option>
            <option>Estimating</option>
            <option>Quoted</option>
            <option>Awarded</option>
            <option>Lost</option>
            <option>On Hold</option>
          </select>

          <label style={label}>Assigned To</label>
          <input style={input} value={form.assigned_to || ''} onChange={e => setForm({...form, assigned_to: e.target.value})} />

          <label style={label}>Date Received</label>
          <input style={input} type="date" value={form.date_received || ''} onChange={e => setForm({...form, date_received: e.target.value})} />

          <label style={label}>Quote Due Date</label>
          <input style={input} type="date" value={form.quote_due_date || ''} onChange={e => setForm({...form, quote_due_date: e.target.value})} />

          <label style={label}>Key Assumptions</label>
          <textarea style={{...input, height: '80px', resize: 'vertical'}} value={form.assumptions || ''} onChange={e => setForm({...form, assumptions: e.target.value})} />

          <label style={label}>Exclusions</label>
          <textarea style={{...input, height: '80px', resize: 'vertical'}} value={form.exclusions || ''} onChange={e => setForm({...form, exclusions: e.target.value})} />
        </div>
      )}
    </div>
  )
}

export default EnquiryDetail