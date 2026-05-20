import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'

const LABOUR_GRADES = [
  { grade: 'Principal Engineer', types: [{ t: 'Normal Working', r: 50 }, { t: 'Time & Half', r: 75 }, { t: 'Double Time', r: 100 }] },
  { grade: 'Lead Engineer', types: [{ t: 'Normal Working', r: 45 }, { t: 'Time & Half', r: 67.5 }, { t: 'Double Time', r: 90 }] },
  { grade: 'Senior Engineer', types: [{ t: 'Normal Working', r: 40 }, { t: 'Time & Half', r: 60 }, { t: 'Double Time', r: 80 }] },
  { grade: 'Engineer', types: [{ t: 'Normal Working', r: 30 }, { t: 'Time & Half', r: 45 }, { t: 'Double Time', r: 60 }] },
  { grade: 'Junior Engineer', types: [{ t: 'Normal Working', r: 25 }, { t: 'Time & Half', r: 37.5 }, { t: 'Double Time', r: 50 }] },
  { grade: 'Trainee Engineer', types: [{ t: 'Normal Working', r: 20 }, { t: 'Time & Half', r: 30 }, { t: 'Double Time', r: 40 }] },
]

const DESIGN_GRADES = [
  { grade: 'Senior Design Engineer', types: [{ t: 'Normal Working', r: 80 }, { t: 'Overtime', r: 120 }] },
  { grade: 'Design Engineer', types: [{ t: 'Normal Working', r: 60 }, { t: 'Overtime', r: 90 }] },
  { grade: 'Junior Design Engineer', types: [{ t: 'Normal Working', r: 40 }, { t: 'Overtime', r: 60 }] },
]

const fmt = v => '£' + parseFloat(v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const n = v => parseFloat(v) || 0

const style = {
  page: { fontFamily: 'sans-serif', padding: '2rem', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white' },
  section: { backgroundColor: '#1e293b', borderRadius: '8px', marginBottom: '1rem', overflow: 'hidden' },
  secHeader: { padding: '8px 14px', fontWeight: 'bold', fontSize: '13px', backgroundColor: '#0f172a', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { fontSize: '11px', color: '#94a3b8', fontWeight: 'normal', padding: '5px 8px', textAlign: 'left', borderBottom: '1px solid #334155', backgroundColor: '#0f172a' },
  td: { padding: '4px 6px', borderBottom: '1px solid #1e293b' },
  input: { width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '12px', padding: '2px 4px', outline: 'none' },
  numInput: { width: '100%', background: 'transparent', border: 'none', color: 'white', fontSize: '12px', padding: '2px 4px', outline: 'none', textAlign: 'right' },
  addBtn: { fontSize: '11px', color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px' },
  delBtn: { fontSize: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' },
  gradeHeader: { fontSize: '11px', fontWeight: 'bold', color: '#94a3b8', backgroundColor: '#0f172a', padding: '4px 8px' },
}

function defaultLabourRows(grades) {
  const rows = []
  grades.forEach(g => {
    g.types.forEach(wt => {
      rows.push({ grade: g.grade, work_type: wt.t, days: 0, hours_per_day: 10, hourly_rate: wt.r })
    })
  })
  return rows
}

function CostSheet() {
  const { id: enquiryId } = useParams()
  const [lineItems, setLineItems] = useState([])
  const [activeItem, setActiveItem] = useState(null)
  const [showNewItem, setShowNewItem] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemDisc, setNewItemDisc] = useState('Mechanical')
  const [materials, setMaterials] = useState([])
  const [subcontract, setSubcontract] = useState([])
  const [labour, setLabour] = useState(defaultLabourRows(LABOUR_GRADES))
  const [tools, setTools] = useState([])
  const [subsistence, setSubsistence] = useState([])
  const [travel, setTravel] = useState([])
  const [design, setDesign] = useState(defaultLabourRows(DESIGN_GRADES))
  const [ovhPct, setOvhPct] = useState(15)
  const [gpPct, setGpPct] = useState(35)
  const [saving, setSaving] = useState(false)

  async function loadLineItem(item) {
    setActiveItem(item)
    setOvhPct(item.overheads_percent || 15)
    setGpPct(item.gp_percent || 35)
    const [mat, sub, lab, tool, subs, trav, des] = await Promise.all([
      supabase.from('cost_materials').select('*').eq('line_item_id', item.id),
      supabase.from('cost_subcontract').select('*').eq('line_item_id', item.id),
      supabase.from('cost_labour').select('*').eq('line_item_id', item.id),
      supabase.from('cost_tools').select('*').eq('line_item_id', item.id),
      supabase.from('cost_subsistence').select('*').eq('line_item_id', item.id),
      supabase.from('cost_travel').select('*').eq('line_item_id', item.id),
      supabase.from('cost_design').select('*').eq('line_item_id', item.id),
    ])
    setMaterials(mat.data?.length ? mat.data : [{ description: '', supplier: '', cost: 0, quantity: 1 }])
    setSubcontract(sub.data?.length ? sub.data : [{ aspect: '', company: '', cost: 0 }])
    setLabour(lab.data?.length ? lab.data : defaultLabourRows(LABOUR_GRADES))
    setTools(tool.data?.length ? tool.data : [{ description: '', supplier: '', cost_per_week: 0, num_weeks: 1 }])
    setSubsistence(subs.data?.length ? subs.data : [{ type: '', days: 0, daily_rate: 30 }])
    setTravel(trav.data?.length ? trav.data : [{ type: '', trips: 1, distance: 0, mileage_rate: 0.45 }])
    setDesign(des.data?.length ? des.data : defaultLabourRows(DESIGN_GRADES))
  }

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('cost_line_items').select('*').eq('enquiry_id', enquiryId).order('created_at')
      if (data) {
        setLineItems(data)
        if (data.length > 0) loadLineItem(data[0])
      }
    }
    load()
  }, [enquiryId])

  async function createLineItem() {
    if (!newItemName.trim()) return
    const { data } = await supabase.from('cost_line_items').insert([{
      enquiry_id: enquiryId, name: newItemName, discipline: newItemDisc,
      overheads_percent: 15, gp_percent: 35
    }]).select()
    if (data) {
      setShowNewItem(false)
      setNewItemName('')
      const { data: items } = await supabase.from('cost_line_items').select('*').eq('enquiry_id', enquiryId).order('created_at')
      if (items) setLineItems(items)
      loadLineItem(data[0])
    }
  }

  async function saveLineItem() {
    if (!activeItem) return
    setSaving(true)
    await supabase.from('cost_line_items').update({ overheads_percent: ovhPct, gp_percent: gpPct }).eq('id', activeItem.id)
    await supabase.from('cost_materials').delete().eq('line_item_id', activeItem.id)
    await supabase.from('cost_subcontract').delete().eq('line_item_id', activeItem.id)
    await supabase.from('cost_labour').delete().eq('line_item_id', activeItem.id)
    await supabase.from('cost_tools').delete().eq('line_item_id', activeItem.id)
    await supabase.from('cost_subsistence').delete().eq('line_item_id', activeItem.id)
    await supabase.from('cost_travel').delete().eq('line_item_id', activeItem.id)
    await supabase.from('cost_design').delete().eq('line_item_id', activeItem.id)
    const liId = activeItem.id
    if (materials.length) await supabase.from('cost_materials').insert(materials.map(r => ({ ...r, line_item_id: liId, id: undefined })))
    if (subcontract.length) await supabase.from('cost_subcontract').insert(subcontract.map(r => ({ ...r, line_item_id: liId, id: undefined })))
    if (labour.filter(r => n(r.days) > 0).length) await supabase.from('cost_labour').insert(labour.filter(r => n(r.days) > 0).map(r => ({ ...r, line_item_id: liId, id: undefined })))
    if (tools.length) await supabase.from('cost_tools').insert(tools.map(r => ({ ...r, line_item_id: liId, id: undefined })))
    if (subsistence.length) await supabase.from('cost_subsistence').insert(subsistence.map(r => ({ ...r, line_item_id: liId, id: undefined })))
    if (travel.length) await supabase.from('cost_travel').insert(travel.map(r => ({ ...r, line_item_id: liId, id: undefined })))
    if (design.filter(r => n(r.days) > 0).length) await supabase.from('cost_design').insert(design.filter(r => n(r.days) > 0).map(r => ({ ...r, line_item_id: liId, id: undefined })))
    setSaving(false)
    alert('Saved successfully')
  }

  const matTotal = materials.reduce((s, r) => s + n(r.cost) * n(r.quantity), 0)
  const subTotal = subcontract.reduce((s, r) => s + n(r.cost), 0)
  const labTotal = labour.reduce((s, r) => s + n(r.days) * n(r.hours_per_day) * n(r.hourly_rate), 0)
  const labHours = labour.reduce((s, r) => s + n(r.days) * n(r.hours_per_day), 0)
  const toolTotal = tools.reduce((s, r) => s + n(r.cost_per_week) * n(r.num_weeks), 0)
  const subsTotal = subsistence.reduce((s, r) => s + n(r.days) * n(r.daily_rate), 0)
  const travTotal = travel.reduce((s, r) => s + n(r.trips) * n(r.distance) * n(r.mileage_rate) * 2, 0)
  const desTotal = design.reduce((s, r) => s + n(r.days) * n(r.hours_per_day) * n(r.hourly_rate), 0)
  const totalCost = matTotal + subTotal + labTotal + toolTotal + subsTotal + travTotal + desTotal
  const budget = totalCost * (1 + n(ovhPct) / 100)
  const gpD = n(gpPct) / 100
  const sellingPrice = gpD >= 1 ? 0 : budget / (1 - gpD)

  return (
    <div style={style.page}>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => window.location.href = `/enquiry/${enquiryId}`} style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer' }}>← Back to Enquiry</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>Cost Model</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setShowNewItem(true)} style={{ backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>+ Line Item</button>
          {activeItem && <button onClick={saveLineItem} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>}
        </div>
      </div>

      {showNewItem && (
        <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Line item name" style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px' }} />
          <select value={newItemDisc} onChange={e => setNewItemDisc(e.target.value)} style={{ background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>
            <option>Mechanical</option><option>Electrical</option><option>Construction</option>
          </select>
          <button onClick={createLineItem} style={{ backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Create</button>
          <button onClick={() => setShowNewItem(false)} style={{ background: '#334155', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
        </div>
      )}

      {lineItems.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {lineItems.map(item => (
            <button key={item.id} onClick={() => loadLineItem(item)} style={{ padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', border: '1px solid #334155', backgroundColor: activeItem?.id === item.id ? '#38bdf8' : '#1e293b', color: activeItem?.id === item.id ? '#0f172a' : 'white', fontWeight: activeItem?.id === item.id ? 'bold' : 'normal' }}>
              {item.name}
            </button>
          ))}
        </div>
      )}

      {!activeItem && lineItems.length === 0 && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem' }}>No line items yet — click + Line Item to start</div>
      )}

      {activeItem && (<>
        <div style={style.section}>
          <div style={style.secHeader}><span>Materials</span><span style={{ color: '#94a3b8', fontSize: '12px' }}>{fmt(matTotal)}</span></div>
          <table style={style.table}>
            <thead><tr><th style={{...style.th, width:'35%'}}>Description</th><th style={{...style.th, width:'25%'}}>Supplier</th><th style={{...style.th, width:'15%', textAlign:'right'}}>Cost £</th><th style={{...style.th, width:'12%', textAlign:'right'}}>Qty</th><th style={{...style.th, width:'12%', textAlign:'right'}}>Total £</th><th style={{...style.th, width:'1%'}}></th></tr></thead>
            <tbody>
              {materials.map((r, i) => (
                <tr key={i}>
                  <td style={style.td}><input style={style.input} value={r.description || ''} onChange={e => { const a=[...materials]; a[i]={...a[i],description:e.target.value}; setMaterials(a) }} /></td>
                  <td style={style.td}><input style={style.input} value={r.supplier || ''} onChange={e => { const a=[...materials]; a[i]={...a[i],supplier:e.target.value}; setMaterials(a) }} /></td>
                  <td style={style.td}><input style={style.numInput} type="number" value={r.cost || 0} onChange={e => { const a=[...materials]; a[i]={...a[i],cost:e.target.value}; setMaterials(a) }} /></td>
                  <td style={style.td}><input style={style.numInput} type="number" value={r.quantity || 1} onChange={e => { const a=[...materials]; a[i]={...a[i],quantity:e.target.value}; setMaterials(a) }} /></td>
                  <td style={{...style.td, textAlign:'right', fontSize:'12px'}}>{fmt(n(r.cost)*n(r.quantity))}</td>
                  <td style={style.td}><button style={style.delBtn} onClick={() => setMaterials(materials.filter((_,j)=>j!==i))}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={style.addBtn} onClick={() => setMaterials([...materials, {description:'',supplier:'',cost:0,quantity:1}])}>+ add row</button>
        </div>

        <div style={style.section}>
          <div style={style.secHeader}><span>Sub-contract</span><span style={{ color: '#94a3b8', fontSize: '12px' }}>{fmt(subTotal)}</span></div>
          <table style={style.table}>
            <thead><tr><th style={{...style.th, width:'40%'}}>Aspect of works</th><th style={{...style.th, width:'40%'}}>Company / quote ref</th><th style={{...style.th, width:'18%', textAlign:'right'}}>Cost £</th><th style={{...style.th, width:'2%'}}></th></tr></thead>
            <tbody>
              {subcontract.map((r, i) => (
                <tr key={i}>
                  <td style={style.td}><input style={style.input} value={r.aspect || ''} onChange={e => { const a=[...subcontract]; a[i]={...a[i],aspect:e.target.value}; setSubcontract(a) }} /></td>
                  <td style={style.td}><input style={style.input} value={r.company || ''} onChange={e => { const a=[...subcontract]; a[i]={...a[i],company:e.target.value}; setSubcontract(a) }} /></td>
                  <td style={style.td}><input style={style.numInput} type="number" value={r.cost || 0} onChange={e => { const a=[...subcontract]; a[i]={...a[i],cost:e.target.value}; setSubcontract(a) }} /></td>
                  <td style={style.td}><button style={style.delBtn} onClick={() => setSubcontract(subcontract.filter((_,j)=>j!==i))}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={style.addBtn} onClick={() => setSubcontract([...subcontract, {aspect:'',company:'',cost:0}])}>+ add row</button>
        </div>

        <div style={style.section}>
          <div style={style.secHeader}><span>Labour</span><span style={{ color: '#94a3b8', fontSize: '12px' }}>{fmt(labTotal)}</span></div>
          <table style={style.table}>
            <thead><tr><th style={{...style.th,width:'28%'}}>Grade</th><th style={{...style.th,width:'20%'}}>Work type</th><th style={{...style.th,width:'13%',textAlign:'right'}}>Days</th><th style={{...style.th,width:'13%',textAlign:'right'}}>Hrs/day</th><th style={{...style.th,width:'13%',textAlign:'right'}}>Rate £</th><th style={{...style.th,width:'13%',textAlign:'right'}}>Total £</th></tr></thead>
            <tbody>
              {LABOUR_GRADES.map(g => (
                <React.Fragment key={g.grade}>
                  <tr><td colSpan="6" style={{...style.td, ...style.gradeHeader}}>{g.grade}</td></tr>
                  {g.types.map(wt => {
                    const idx = labour.findIndex(r => r.grade === g.grade && r.work_type === wt.t)
                    const row = labour[idx] || { grade: g.grade, work_type: wt.t, days: 0, hours_per_day: 10, hourly_rate: wt.r }
                    return (
                      <tr key={wt.t}>
                        <td style={{...style.td, paddingLeft:'16px', color:'#94a3b8', fontSize:'12px'}}>{wt.t}</td>
                        <td style={style.td}></td>
                        <td style={style.td}><input style={style.numInput} type="number" min="0" step="0.5" value={row.days || 0} onChange={e => { const a=[...labour]; if(idx>=0){a[idx]={...a[idx],days:e.target.value}}else{a.push({grade:g.grade,work_type:wt.t,days:e.target.value,hours_per_day:10,hourly_rate:wt.r})}; setLabour(a) }} /></td>
                        <td style={style.td}><input style={style.numInput} type="number" min="1" value={row.hours_per_day || 10} onChange={e => { const a=[...labour]; if(idx>=0){a[idx]={...a[idx],hours_per_day:e.target.value}}else{a.push({grade:g.grade,work_type:wt.t,days:0,hours_per_day:e.target.value,hourly_rate:wt.r})}; setLabour(a) }} /></td>
                        <td style={style.td}><input style={style.numInput} type="number" min="0" value={row.hourly_rate || wt.r} onChange={e => { const a=[...labour]; if(idx>=0){a[idx]={...a[idx],hourly_rate:e.target.value}}else{a.push({grade:g.grade,work_type:wt.t,days:0,hours_per_day:10,hourly_rate:e.target.value})}; setLabour(a) }} /></td>
                        <td style={{...style.td, textAlign:'right', fontSize:'12px'}}>{fmt(n(row.days)*n(row.hours_per_day)*n(row.hourly_rate))}</td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div style={style.section}>
          <div style={style.secHeader}><span>Tools / plant</span><span style={{ color: '#94a3b8', fontSize: '12px' }}>{fmt(toolTotal)}</span></div>
          <table style={style.table}>
            <thead><tr><th style={{...style.th,width:'30%'}}>Description</th><th style={{...style.th,width:'25%'}}>Supplier</th><th style={{...style.th,width:'18%',textAlign:'right'}}>Cost/week £</th><th style={{...style.th,width:'15%',textAlign:'right'}}>Weeks</th><th style={{...style.th,width:'10%',textAlign:'right'}}>Total £</th><th style={{...style.th,width:'2%'}}></th></tr></thead>
            <tbody>
              {tools.map((r, i) => (
                <tr key={i}>
                  <td style={style.td}><input style={style.input} value={r.description||''} onChange={e=>{const a=[...tools];a[i]={...a[i],description:e.target.value};setTools(a)}}/></td>
                  <td style={style.td}><input style={style.input} value={r.supplier||''} onChange={e=>{const a=[...tools];a[i]={...a[i],supplier:e.target.value};setTools(a)}}/></td>
                  <td style={style.td}><input style={style.numInput} type="number" value={r.cost_per_week||0} onChange={e=>{const a=[...tools];a[i]={...a[i],cost_per_week:e.target.value};setTools(a)}}/></td>
                  <td style={style.td}><input style={style.numInput} type="number" value={r.num_weeks||1} onChange={e=>{const a=[...tools];a[i]={...a[i],num_weeks:e.target.value};setTools(a)}}/></td>
                  <td style={{...style.td,textAlign:'right',fontSize:'12px'}}>{fmt(n(r.cost_per_week)*n(r.num_weeks))}</td>
                  <td style={style.td}><button style={style.delBtn} onClick={()=>setTools(tools.filter((_,j)=>j!==i))}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={style.addBtn} onClick={()=>setTools([...tools,{description:'',supplier:'',cost_per_week:0,num_weeks:1}])}>+ add row</button>
        </div>

        <div style={style.section}>
          <div style={style.secHeader}><span>Subsistence</span><span style={{ color: '#94a3b8', fontSize: '12px' }}>{fmt(subsTotal)}</span></div>
          <table style={style.table}>
            <thead><tr><th style={{...style.th,width:'40%'}}>Type</th><th style={{...style.th,width:'20%',textAlign:'right'}}>Days</th><th style={{...style.th,width:'20%',textAlign:'right'}}>Daily rate £</th><th style={{...style.th,width:'18%',textAlign:'right'}}>Total £</th><th style={{...style.th,width:'2%'}}></th></tr></thead>
            <tbody>
              {subsistence.map((r, i) => (
                <tr key={i}>
                  <td style={style.td}><input style={style.input} value={r.type||''} onChange={e=>{const a=[...subsistence];a[i]={...a[i],type:e.target.value};setSubsistence(a)}}/></td>
                  <td style={style.td}><input style={style.numInput} type="number" value={r.days||0} onChange={e=>{const a=[...subsistence];a[i]={...a[i],days:e.target.value};setSubsistence(a)}}/></td>
                  <td style={style.td}><input style={style.numInput} type="number" value={r.daily_rate||30} onChange={e=>{const a=[...subsistence];a[i]={...a[i],daily_rate:e.target.value};setSubsistence(a)}}/></td>
                  <td style={{...style.td,textAlign:'right',fontSize:'12px'}}>{fmt(n(r.days)*n(r.daily_rate))}</td>
                  <td style={style.td}><button style={style.delBtn} onClick={()=>setSubsistence(subsistence.filter((_,j)=>j!==i))}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={style.addBtn} onClick={()=>setSubsistence([...subsistence,{type:'',days:0,daily_rate:30}])}>+ add row</button>
        </div>

        <div style={style.section}>
          <div style={style.secHeader}><span>Travel / vehicles</span><span style={{ color: '#94a3b8', fontSize: '12px' }}>{fmt(travTotal)}</span></div>
          <table style={style.table}>
            <thead><tr><th style={{...style.th,width:'28%'}}>Type</th><th style={{...style.th,width:'14%',textAlign:'right'}}>Trips</th><th style={{...style.th,width:'16%',textAlign:'right'}}>Distance (mi)</th><th style={{...style.th,width:'16%',textAlign:'right'}}>Rate £/mi</th><th style={{...style.th,width:'14%',textAlign:'right'}}>Total £</th><th style={{...style.th,width:'2%'}}></th></tr></thead>
            <tbody>
              {travel.map((r, i) => (
                <tr key={i}>
                  <td style={style.td}><input style={style.input} value={r.type||''} onChange={e=>{const a=[...travel];a[i]={...a[i],type:e.target.value};setTravel(a)}}/></td>
                  <td style={style.td}><input style={style.numInput} type="number" value={r.trips||1} onChange={e=>{const a=[...travel];a[i]={...a[i],trips:e.target.value};setTravel(a)}}/></td>
                  <td style={style.td}><input style={style.numInput} type="number" value={r.distance||0} onChange={e=>{const a=[...travel];a[i]={...a[i],distance:e.target.value};setTravel(a)}}/></td>
                  <td style={style.td}><input style={style.numInput} type="number" value={r.mileage_rate||0.45} onChange={e=>{const a=[...travel];a[i]={...a[i],mileage_rate:e.target.value};setTravel(a)}}/></td>
                  <td style={{...style.td,textAlign:'right',fontSize:'12px'}}>{fmt(n(r.trips)*n(r.distance)*n(r.mileage_rate)*2)}</td>
                  <td style={style.td}><button style={style.delBtn} onClick={()=>setTravel(travel.filter((_,j)=>j!==i))}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button style={style.addBtn} onClick={()=>setTravel([...travel,{type:'',trips:1,distance:0,mileage_rate:0.45}])}>+ add row</button>
        </div>

        <div style={style.section}>
          <div style={style.secHeader}><span>Design engineering</span><span style={{ color: '#94a3b8', fontSize: '12px' }}>{fmt(desTotal)}</span></div>
          <table style={style.table}>
            <thead><tr><th style={{...style.th,width:'28%'}}>Grade</th><th style={{...style.th,width:'20%'}}>Work type</th><th style={{...style.th,width:'13%',textAlign:'right'}}>Days</th><th style={{...style.th,width:'13%',textAlign:'right'}}>Hrs/day</th><th style={{...style.th,width:'13%',textAlign:'right'}}>Rate £</th><th style={{...style.th,width:'13%',textAlign:'right'}}>Total £</th></tr></thead>
            <tbody>
              {DESIGN_GRADES.map(g => (
                <React.Fragment key={g.grade}>
                  <tr><td colSpan="6" style={{...style.td,...style.gradeHeader}}>{g.grade}</td></tr>
                  {g.types.map(wt => {
                    const idx = design.findIndex(r => r.grade === g.grade && r.work_type === wt.t)
                    const row = design[idx] || { grade: g.grade, work_type: wt.t, days: 0, hours_per_day: 10, hourly_rate: wt.r }
                    return (
                      <tr key={wt.t}>
                        <td style={{...style.td,paddingLeft:'16px',color:'#94a3b8',fontSize:'12px'}}>{wt.t}</td>
                        <td style={style.td}></td>
                        <td style={style.td}><input style={style.numInput} type="number" min="0" step="0.5" value={row.days||0} onChange={e=>{const a=[...design];if(idx>=0){a[idx]={...a[idx],days:e.target.value}}else{a.push({grade:g.grade,work_type:wt.t,days:e.target.value,hours_per_day:10,hourly_rate:wt.r})};setDesign(a)}}/></td>
                        <td style={style.td}><input style={style.numInput} type="number" min="1" value={row.hours_per_day||10} onChange={e=>{const a=[...design];if(idx>=0){a[idx]={...a[idx],hours_per_day:e.target.value}}else{a.push({grade:g.grade,work_type:wt.t,days:0,hours_per_day:e.target.value,hourly_rate:wt.r})};setDesign(a)}}/></td>
                        <td style={style.td}><input style={style.numInput} type="number" min="0" value={row.hourly_rate||wt.r} onChange={e=>{const a=[...design];if(idx>=0){a[idx]={...a[idx],hourly_rate:e.target.value}}else{a.push({grade:g.grade,work_type:wt.t,days:0,hours_per_day:10,hourly_rate:e.target.value})};setDesign(a)}}/></td>
                        <td style={{...style.td,textAlign:'right',fontSize:'12px'}}>{fmt(n(row.days)*n(row.hours_per_day)*n(row.hourly_rate))}</td>
                      </tr>
                    )
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '1.2rem', marginTop: '1rem' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px' }}>Summary</div>
          {[['Materials', matTotal], ['Labour', labTotal], ['Sub-contract', subTotal], ['Tools / plant', toolTotal], ['Subsistence', subsTotal], ['Travel / vehicles', travTotal], ['Design engineering', desTotal]].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #334155', fontSize: '13px' }}>
              <span style={{ color: '#94a3b8' }}>{label}</span><span>{fmt(val)}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #334155', fontWeight: 'bold' }}>
            <span>Total cost</span><span>{fmt(totalCost)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #334155', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Total man hours</span><span>{Math.round(labHours)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #334155', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Overheads %</span>
            <input type="number" value={ovhPct} onChange={e => setOvhPct(e.target.value)} style={{ width: '60px', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '2px 6px', borderRadius: '4px', textAlign: 'right' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #334155', fontSize: '13px' }}>
            <span style={{ color: '#94a3b8' }}>Gross profit %</span>
            <input type="number" value={gpPct} onChange={e => setGpPct(e.target.value)} style={{ width: '60px', background: '#0f172a', border: '1px solid #334155', color: 'white', padding: '2px 6px', borderRadius: '4px', textAlign: 'right' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 'bold', fontSize: '16px', color: '#38bdf8' }}>
            <span>Selling price</span><span>{fmt(sellingPrice)}</span>
          </div>
        </div>
      </>)}
    </div>
  )
}

export default CostSheet