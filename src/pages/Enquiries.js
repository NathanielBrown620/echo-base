import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Enquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    client_name: '', contact_name: '', contact_email: '', contact_phone: '',
    description: '', estimated_value: '', status: 'Enquiry', assigned_to: '',
    date_received: '', quote_due_date: '', assumptions: '', exclusions: ''
  })

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
      if (error) console.error(error)
      else setEnquiries(data)
    }
    load()
  }, [])

  async function addEnquiry() {
    const { error } = await supabase.from('enquiries').insert([form])
    if (error) console.error(error)
    else {
      setShowForm(false)
      setForm({ client_name: '', contact_name: '', contact_email: '', contact_phone: '', description: '', estimated_value: '', status: 'Enquiry', assigned_to: '', date_received: '', quote_due_date: '', assumptions: '', exclusions: '' })
      const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
      if (data) setEnquiries(data)
    }
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

  const totalValue = enquiries.reduce((sum, e) => sum + (Number(e.estimated_value) || 0), 0)
  const awarded = enquiries.filter(e => e.status === 'Awarded').length
  const quoted = enquiries.filter(e => e.status === 'Quoted').length

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <button onClick={() => window.location.href = '/'} style={{ backgroundColor: 'transparent', color: '#38bdf8', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: 0 }}>
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#38bdf8', margin: 0 }}>Enquiries</h1>
        <button onClick={() => setShowForm(true)} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + New Enquiry
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Enquiries', value: enquiries.length },
          { label: 'Quoted', value: quoted },
          { label: 'Awarded', value: awarded },
          { label: 'Pipeline Value', value: `£${totalValue.toLocaleString()}` },
        ].map((stat) => (
          <div key={stat.label} style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.2rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{stat.label}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', marginTop: '0.3rem' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#94a3b8', fontSize: '0.85rem' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Client</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Value</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Assigned To</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Received</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Quote Due</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                  No enquiries yet — click + New Enquiry to add one
                </td>
              </tr>
            ) : (
              enquiries.map((e) => {
                const sc = statusColour(e.status)
                return (
                  <tr key={e.id} onClick={() => window.location.href = `/enquiry/${e.id}`} style={{ borderTop: '1px solid #0f172a', cursor: 'pointer' }}>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 'bold' }}>{e.client_name}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>£{Number(e.estimated_value).toLocaleString()}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ backgroundColor: sc.bg, color: sc.text, padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem' }}>{e.status}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{e.assigned_to}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{e.date_received}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>{e.quote_due_date}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <button onClick={ev => { ev.stopPropagation(); window.location.href = `/cost/${e.id}` }}
                        style={{ backgroundColor: '#1e3a5f', color: '#93c5fd', border: '1px solid #1e40af', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        Cost Model
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '2rem', width: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, color: '#38bdf8' }}>New Enquiry</h2>
            <label style={label}>Client Name</label>
            <input style={input} value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} />
            <label style={label}>Contact Name</label>
            <input style={input} value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} />
            <label style={label}>Contact Email</label>
            <input style={input} type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} />
            <label style={label}>Contact Phone</label>
            <input style={input} value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} />
            <label style={label}>Description of Works</label>
            <textarea style={{...input, height: '80px', resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <label style={label}>Estimated Value (£)</label>
            <input style={input} type="number" value={form.estimated_value} onChange={e => setForm({...form, estimated_value: e.target.value})} />
            <label style={label}>Status</label>
            <select style={input} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option>Enquiry</option>
              <option>Estimating</option>
              <option>Quoted</option>
              <option>Awarded</option>
              <option>Lost</option>
              <option>On Hold</option>
            </select>
            <label style={label}>Assigned To</label>
            <input style={input} value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} />
            <label style={label}>Date Received</label>
            <input style={input} type="date" value={form.date_received} onChange={e => setForm({...form, date_received: e.target.value})} />
            <label style={label}>Quote Due Date</label>
            <input style={input} type="date" value={form.quote_due_date} onChange={e => setForm({...form, quote_due_date: e.target.value})} />
            <label style={label}>Key Assumptions</label>
            <textarea style={{...input, height: '80px', resize: 'vertical'}} value={form.assumptions} onChange={e => setForm({...form, assumptions: e.target.value})} />
            <label style={label}>Exclusions</label>
            <textarea style={{...input, height: '80px', resize: 'vertical'}} value={form.exclusions} onChange={e => setForm({...form, exclusions: e.target.value})} />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={addEnquiry} style={{ flex: 1, backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Save Enquiry</button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, backgroundColor: '#334155', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Enquiries