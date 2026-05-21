import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { Nav, colors, btnStyle, cardStyle, ECHO_BLUE } from '../theme'
import { getUser } from '../auth'

function SalesHandover() {
  const { id: enquiryId } = useParams()
  const [enquiry, setEnquiry] = useState(null)
  const [users, setUsers] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [checklist, setChecklist] = useState({
    po_received: false,
    value_agreed: false,
    start_confirmed: false,
    site_briefed: false,
  })
  const [form, setForm] = useState({
    name: '',
    po_number: '',
    po_document_url: '',
    value: '',
    start_date: '',
    end_date: '',
    project_manager: '',
    description: '',
    assumptions: '',
    exclusions: '',
    client_contact_name: '',
    client_contact_email: '',
    client_contact_phone: '',
  })
  const user = getUser()

  useEffect(() => {
    async function load() {
      const { data: enq } = await supabase.from('enquiries').select('*').eq('id', enquiryId).single()
      if (enq) {
        setEnquiry(enq)
        setForm(prev => ({
          ...prev,
          name: enq.client_name + ' — ' + (enq.description || ''),
          value: enq.estimated_value || '',
          assumptions: enq.assumptions || '',
          exclusions: enq.exclusions || '',
          client_contact_name: enq.contact_name || '',
          client_contact_email: enq.contact_email || '',
          client_contact_phone: enq.contact_phone || '',
          description: enq.description || '',
        }))
      }
      const { data: u } = await supabase.from('app_users').select('id, full_name').eq('active', true)
      if (u) setUsers(u)
    }
    load()
  }, [enquiryId])

  async function uploadPO(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fileName = `${enquiryId}/${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('po-documents').upload(fileName, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('po-documents').getPublicUrl(fileName)
      setForm(prev => ({ ...prev, po_document_url: urlData.publicUrl }))
    }
    setUploading(false)
  }

  const allChecked = Object.values(checklist).every(v => v)
  const canSubmit = form.name && form.po_number && form.po_document_url && form.value && form.start_date && form.end_date && form.project_manager && allChecked

  async function createProject() {
    if (!canSubmit) return
    setSubmitting(true)

    const { data: project, error } = await supabase.from('projects').insert([{
      name: form.name,
      client: enquiry.client_name,
      value: form.value,
      stage: 'Awarded',
      rag_status: 'green',
      start_date: form.start_date,
      end_date: form.end_date,
      project_manager: users.find(u => u.id === form.project_manager)?.full_name || '',
      description: form.description,
      enquiry_id: enquiryId,
      po_number: form.po_number,
      po_document_url: form.po_document_url,
      assumptions: form.assumptions,
      exclusions: form.exclusions,
      client_contact_name: form.client_contact_name,
      client_contact_email: form.client_contact_email,
      client_contact_phone: form.client_contact_phone,
    }]).select().single()

    if (error) { console.error(error); setSubmitting(false); return }

    await supabase.from('enquiries').update({ status: 'Awarded' }).eq('id', enquiryId)

    const { data: allUsers } = await supabase.from('app_users').select('id').eq('active', true)
    if (allUsers) {
      const others = allUsers.filter(u => u.id !== user.id)
      if (others.length > 0) {
        await supabase.from('notifications').insert(
          others.map(u => ({
            user_id: u.id,
            type: 'project',
            title: `New project created: ${form.name}`,
            message: `Sales handover completed by ${user.full_name}`,
            link: `/project/${project.id}`,
            read: false
          }))
        )
      }
    }

    setSubmitting(false)
    window.location.href = `/project/${project.id}`
  }

  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '0.5px solid #e2e8f0', backgroundColor: '#fff', color: '#1a2332', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginTop: '0.3rem' }
  const lbl = { color: '#64748b', fontSize: '12px', display: 'block', marginTop: '0.75rem', fontWeight: '500' }
  const section = { ...cardStyle.card, marginBottom: '1rem' }
  const sectionTitle = { fontSize: '14px', fontWeight: '600', color: '#1a2332', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '0.5px solid #e2e8f0' }

  if (!enquiry) return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="enquiries" />
      <div style={{ padding: '2rem', color: '#64748b' }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: colors.bg, minHeight: '100vh' }}>
      <Nav active="enquiries" />

      <div style={{ padding: '1.5rem 2rem', maxWidth: '800px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={() => window.location.href = `/enquiry/${enquiryId}`} style={btnStyle.ghost}>← Back to Enquiry</button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a2332' }}>Sales Handover</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{enquiry.client_name} — converting enquiry to live project</div>
        </div>

        <div style={section}>
          <div style={sectionTitle}>Commercial</div>

          <label style={lbl}>PO Number <span style={{ color: '#ef4444' }}>*</span></label>
          <input style={inp} value={form.po_number} onChange={e => setForm({...form, po_number: e.target.value})} placeholder="e.g. PO-2026-001" />

          <label style={lbl}>PO Document <span style={{ color: '#ef4444' }}>*</span></label>
          {form.po_document_url ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.3rem' }}>
              <a href={form.po_document_url} target="_blank" rel="noopener noreferrer"
                style={{ color: ECHO_BLUE, fontSize: '13px', textDecoration: 'none' }}>
                📄 View uploaded PO
              </a>
              <button onClick={() => setForm({...form, po_document_url: ''})}
                style={{ ...btnStyle.danger, padding: '0.2rem 0.6rem', fontSize: '11px' }}>Remove</button>
            </div>
          ) : (
            <label style={{ ...btnStyle.secondary, display: 'inline-block', cursor: 'pointer', marginTop: '0.3rem' }}>
              {uploading ? 'Uploading...' : '📎 Upload PO Document'}
              <input type="file" accept=".pdf,.doc,.docx,.jpg,.png" style={{ display: 'none' }} onChange={uploadPO} disabled={uploading} />
            </label>
          )}

          <label style={lbl}>Contract Value (£) <span style={{ color: '#ef4444' }}>*</span></label>
          <input style={inp} type="number" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
        </div>

        <div style={section}>
          <div style={sectionTitle}>Project Details</div>

          <label style={lbl}>Project Name <span style={{ color: '#ef4444' }}>*</span></label>
          <input style={inp} value={form.name} onChange={e => setForm({...form, name: e.target.value})} />

          <label style={lbl}>Description</label>
          <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={lbl}>Start Date <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={inp} type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
            </div>
            <div>
              <label style={lbl}>Completion Date <span style={{ color: '#ef4444' }}>*</span></label>
              <input style={inp} type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
            </div>
          </div>

          <label style={lbl}>Project Manager <span style={{ color: '#ef4444' }}>*</span></label>
          <select style={inp} value={form.project_manager} onChange={e => setForm({...form, project_manager: e.target.value})}>
            <option value="">Select PM</option>
            {users.filter(u => u.id !== user.id || true).map(u => (
              <option key={u.id} value={u.id}>{u.full_name}</option>
            ))}
          </select>
        </div>

        <div style={section}>
          <div style={sectionTitle}>Scope</div>

          <label style={lbl}>Key Assumptions</label>
          <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.assumptions} onChange={e => setForm({...form, assumptions: e.target.value})} />

          <label style={lbl}>Exclusions</label>
          <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.exclusions} onChange={e => setForm({...form, exclusions: e.target.value})} />
        </div>

        <div style={section}>
          <div style={sectionTitle}>Client Contact</div>

          <label style={lbl}>Contact Name</label>
          <input style={inp} value={form.client_contact_name} onChange={e => setForm({...form, client_contact_name: e.target.value})} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={lbl}>Contact Email</label>
              <input style={inp} value={form.client_contact_email} onChange={e => setForm({...form, client_contact_email: e.target.value})} />
            </div>
            <div>
              <label style={lbl}>Contact Phone</label>
              <input style={inp} value={form.client_contact_phone} onChange={e => setForm({...form, client_contact_phone: e.target.value})} />
            </div>
          </div>
        </div>

        <div style={section}>
          <div style={sectionTitle}>Handover Confirmation</div>
          <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '1rem' }}>All items must be confirmed before the project can be created.</div>
          {[
            { key: 'po_received', label: 'PO received and saved to project' },
            { key: 'value_agreed', label: 'Contract value agreed and confirmed with client' },
            { key: 'start_confirmed', label: 'Start date confirmed with client' },
            { key: 'site_briefed', label: 'Site team has been briefed on the project' },
          ].map(item => (
            <div key={item.key} onClick={() => setChecklist(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer', marginBottom: '0.5rem', backgroundColor: checklist[item.key] ? '#f0fdf4' : '#f8fafc', border: `0.5px solid ${checklist[item.key] ? '#22c55e' : '#e2e8f0'}` }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${checklist[item.key] ? '#22c55e' : '#d1d5db'}`, backgroundColor: checklist[item.key] ? '#22c55e' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {checklist[item.key] && <span style={{ color: 'white', fontSize: '12px' }}>✓</span>}
              </div>
              <span style={{ fontSize: '13px', color: '#1a2332' }}>{item.label}</span>
            </div>
          ))}
        </div>

        {!canSubmit && (
          <div style={{ backgroundColor: '#fef9c3', border: '0.5px solid #fbbf24', borderRadius: '6px', padding: '0.75rem 1rem', fontSize: '13px', color: '#854d0e', marginBottom: '1rem' }}>
            ⚠️ Please complete all required fields, upload the PO document and tick all confirmation items before creating the project.
          </div>
        )}

        <button onClick={createProject} disabled={!canSubmit || submitting}
          style={{ ...btnStyle.primary, width: '100%', padding: '0.85rem', fontSize: '15px', opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
          {submitting ? 'Creating Project...' : '🚀 Create Live Project'}
        </button>
      </div>
    </div>
  )
}

export default SalesHandover