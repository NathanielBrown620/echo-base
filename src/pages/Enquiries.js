import React, { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { Nav, pageStyle, cardStyle, tableStyle, btnStyle, badge, colors, inputStyle } from '../theme'

function Enquiries() {
  const [enquiries, setEnquiries] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    client_name: '', contact_name: '', contact_email: '', contact_phone: '',
    description: '', status: 'Enquiry', assigned_to: '',
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
      setForm({ client_name: '', contact_name: '', contact_email: '', contact_phone: '', description: '', status: 'Enquiry', assigned_to: '', date_received: '', quote_due_date: '', assumptions: '', exclusions: '' })
      const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
      if (data) setEnquiries(data)
    }
  }

  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '0.5px solid #e2e8f0', backgroundColor: '#fff', color: '#1a2332', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginTop: '0.3rem' }
  const lbl = { color: '#64748b', fontSize: '12px', display: 'block', marginTop: '0.75rem', fontWeight: '500' }

  const totalValue = enquiries.reduce((sum, e) => sum + (Number(e.estimated_value) || 0), 0)
  const awarded = enquiries.filter(e => e.status === 'Awarded').length
  const quoted = enquiries.filter(e => e.status === 'Quoted').length

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="enquiries" onNewEnquiry={() => setShowForm(true)} />

      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={pageStyle.header}>
          <div>
            <div style={pageStyle.title}>Enquiries</div>
            <div style={pageStyle.subtitle}>Sales pipeline and enquiry management</div>
          </div>
        </div>

        <div style={cardStyle.statGrid}>
          {[
            { label: 'Total Enquiries', value: enquiries.length },
            { label: 'Quoted', value: quoted },
            { label: 'Awarded', value: awarded },
            { label: 'Pipeline Value', value: `£${totalValue.toLocaleString()}` },
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
                {['Client', 'Description', 'Value', 'Status', 'Assigned To', 'Received', 'Quote Due', 'Actions'].map(h => (
                  <th key={h} style={tableStyle.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 ? (
                <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No enquiries yet — click + New Enquiry to add one</td></tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e.id}
                    onClick={() => window.location.href = `/enquiry/${e.id}`}
                    style={{ cursor: 'pointer' }}
                    onMouseOver={ev => ev.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={ev => ev.currentTarget.style.backgroundColor = ''}>
                    <td style={{ ...tableStyle.td, fontWeight: '500', color: '#1a2332' }}>{e.client_name}</td>
                    <td style={{ ...tableStyle.td, color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description}</td>
                    <td style={tableStyle.td}>£{Number(e.estimated_value || 0).toLocaleString()}</td>
                    <td style={tableStyle.td}><span style={badge(e.status)}>{e.status}</span></td>
                    <td style={{ ...tableStyle.td, color: '#64748b' }}>{e.assigned_to}</td>
                    <td style={{ ...tableStyle.td, color: '#64748b' }}>{e.date_received}</td>
                    <td style={{ ...tableStyle.td, color: '#64748b' }}>{e.quote_due_date}</td>
                    <td style={tableStyle.td}>
                      <button onClick={ev => { ev.stopPropagation(); window.location.href = `/cost/${e.id}` }}
                        style={{ backgroundColor: '#e8f6fd', color: '#29ABE2', border: '0.5px solid #29ABE2', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: '500' }}>
                        Cost Model
                      </button>
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
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', width: '550px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, fontSize: '16px', fontWeight: '600', color: '#1a2332', marginBottom: '1rem' }}>New Enquiry</h2>

            <label style={lbl}>Client Name</label>
            <input style={inp} value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} />

            <label style={lbl}>Contact Name</label>
            <input style={inp} value={form.contact_name} onChange={e => setForm({...form, contact_name: e.target.value})} />

            <label style={lbl}>Contact Email</label>
            <input style={inp} type="email" value={form.contact_email} onChange={e => setForm({...form, contact_email: e.target.value})} />

            <label style={lbl}>Contact Phone</label>
            <input style={inp} value={form.contact_phone} onChange={e => setForm({...form, contact_phone: e.target.value})} />

            <label style={lbl}>Description of Works</label>
            <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />

            <label style={lbl}>Status</label>
            <select style={inp} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option>Enquiry</option>
              <option>Estimating</option>
              <option>Quoted</option>
              <option>Awarded</option>
              <option>Lost</option>
              <option>On Hold</option>
            </select>

            <label style={lbl}>Assigned To</label>
            <input style={inp} value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})} />

            <label style={lbl}>Date Received</label>
            <input style={inp} type="date" value={form.date_received} onChange={e => setForm({...form, date_received: e.target.value})} />

            <label style={lbl}>Quote Due Date</label>
            <input style={inp} type="date" value={form.quote_due_date} onChange={e => setForm({...form, quote_due_date: e.target.value})} />

            <label style={lbl}>Key Assumptions</label>
            <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.assumptions} onChange={e => setForm({...form, assumptions: e.target.value})} />

            <label style={lbl}>Exclusions</label>
            <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.exclusions} onChange={e => setForm({...form, exclusions: e.target.value})} />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={addEnquiry} style={{ ...btnStyle.primary, flex: 1, padding: '0.65rem' }}>Save Enquiry</button>
              <button onClick={() => setShowForm(false)} style={{ ...btnStyle.secondary, flex: 1, padding: '0.65rem' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Enquiries