import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../supabase'
import { Nav, colors, btnStyle, cardStyle, ECHO_BLUE } from '../theme'
import { getUser } from '../auth'

function ProjectTasks() {
  const { id: projectId } = useParams()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', due_date: '' })
  const user = getUser()

  useEffect(() => {
    loadAll()
  }, [projectId])

  async function loadAll() {
    const { data: proj } = await supabase.from('projects').select('*').eq('id', projectId).single()
    if (proj) setProject(proj)

    const { data: t } = await supabase.from('project_tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    if (t) setTasks(t)

    const { data: u } = await supabase.from('app_users').select('id, full_name').eq('active', true)
    if (u) setUsers(u)
  }

  async function loadPhotos(taskId) {
    const { data } = await supabase.from('task_photos').select('*').eq('task_id', taskId)
    if (data) setPhotos(data)
  }

  async function createTask() {
    if (!form.title.trim()) return
    const assignedUser = users.find(u => u.id === form.assigned_to)
    await supabase.from('project_tasks').insert([{
      project_id: projectId,
      title: form.title,
      description: form.description,
      assigned_to: form.assigned_to || null,
      assigned_name: assignedUser?.full_name || null,
      created_by: user.full_name,
      due_date: form.due_date || null,
    }])

    if (form.assigned_to && form.assigned_to !== user.id) {
      await supabase.from('notifications').insert([{
        user_id: form.assigned_to,
        type: 'task',
        title: `New task assigned: ${form.title}`,
        message: `Assigned by ${user.full_name} on ${project?.name}`,
        link: `/project/${projectId}/tasks`,
        read: false
      }])
    }

    setShowForm(false)
    setForm({ title: '', description: '', assigned_to: '', due_date: '' })
    loadAll()
  }

  async function toggleComplete(task) {
    await supabase.from('project_tasks').update({
      completed: !task.completed,
      completed_at: !task.completed ? new Date().toISOString() : null,
      completed_by: !task.completed ? user.full_name : null
    }).eq('id', task.id)
    loadAll()
  }

  async function uploadPhoto(e, taskId) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fileName = `${taskId}/${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage.from('task-photos').upload(fileName, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('task-photos').getPublicUrl(fileName)
      await supabase.from('task_photos').insert([{
        task_id: taskId,
        url: urlData.publicUrl,
        uploaded_by: user.full_name
      }])
      loadPhotos(taskId)
    }
    setUploading(false)
  }

  async function openTask(task) {
    setSelectedTask(task)
    loadPhotos(task.id)
  }

  const inp = { width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '0.5px solid #e2e8f0', backgroundColor: '#fff', color: '#1a2332', fontSize: '13px', outline: 'none', boxSizing: 'border-box', marginTop: '0.3rem' }
  const lbl = { color: '#64748b', fontSize: '12px', display: 'block', marginTop: '0.75rem', fontWeight: '500' }

  const pending = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

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
          <button onClick={() => window.location.href = `/project/${projectId}`} style={btnStyle.ghost}>← Back to Project</button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#1a2332' }}>{project.name} — Tasks</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{pending.length} pending · {completed.length} completed</div>
          </div>
          <button onClick={() => setShowForm(true)} style={btnStyle.primary}>+ New Task</button>
        </div>

        {pending.length === 0 && completed.length === 0 && (
          <div style={{ ...cardStyle.card, textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '13px' }}>
            No tasks yet — click + New Task to add one
          </div>
        )}

        {pending.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Pending</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {pending.map(task => (
                <div key={task.id} style={{ ...cardStyle.card, display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer' }}
                  onClick={() => openTask(task)}>
                  <button onClick={e => { e.stopPropagation(); toggleComplete(task) }}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${ECHO_BLUE}`, background: 'none', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a2332' }}>{task.title}</div>
                    {task.description && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{task.description}</div>}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
                      {task.assigned_name && <span>👤 {task.assigned_name}</span>}
                      {task.due_date && <span>📅 Due {task.due_date}</span>}
                      <span>Created by {task.created_by}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completed.length > 0 && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Completed</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {completed.map(task => (
                <div key={task.id} style={{ ...cardStyle.card, display: 'flex', alignItems: 'flex-start', gap: '0.75rem', opacity: 0.6, cursor: 'pointer' }}
                  onClick={() => openTask(task)}>
                  <button onClick={e => { e.stopPropagation(); toggleComplete(task) }}
                    style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid #22c55e`, background: '#22c55e', cursor: 'pointer', flexShrink: 0, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px' }}>✓</button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a2332', textDecoration: 'line-through' }}>{task.title}</div>
                    {task.completed_by && <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Completed by {task.completed_by}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', width: '480px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginTop: 0, fontSize: '16px', fontWeight: '600', color: '#1a2332', marginBottom: '1rem' }}>New Task</h2>

            <label style={lbl}>Title</label>
            <input style={inp} value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="What needs to be done?" />

            <label style={lbl}>Description</label>
            <textarea style={{...inp, height: '80px', resize: 'vertical'}} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Optional details..." />

            <label style={lbl}>Assign To</label>
            <select style={inp} value={form.assigned_to} onChange={e => setForm({...form, assigned_to: e.target.value})}>
              <option value="">Unassigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>

            <label style={lbl}>Due Date</label>
            <input style={inp} type="date" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button onClick={createTask} style={{ ...btnStyle.primary, flex: 1, padding: '0.65rem' }}>Create Task</button>
              <button onClick={() => setShowForm(false)} style={{ ...btnStyle.secondary, flex: 1, padding: '0.65rem' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '2rem', width: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a2332' }}>{selectedTask.title}</div>
                {selectedTask.description && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{selectedTask.description}</div>}
              </div>
              <button onClick={() => setSelectedTask(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '18px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', fontSize: '12px', color: '#64748b', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {selectedTask.assigned_name && <span>👤 {selectedTask.assigned_name}</span>}
              {selectedTask.due_date && <span>📅 Due {selectedTask.due_date}</span>}
              <span>Created by {selectedTask.created_by}</span>
              {selectedTask.completed && <span style={{ color: '#22c55e' }}>✓ Completed by {selectedTask.completed_by}</span>}
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <button onClick={() => toggleComplete(selectedTask)}
                style={{ ...selectedTask.completed ? btnStyle.secondary : btnStyle.primary, width: '100%', padding: '0.65rem' }}>
                {selectedTask.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              </button>
            </div>

            <div style={{ borderTop: '0.5px solid #e2e8f0', paddingTop: '1rem' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a2332', marginBottom: '0.75rem' }}>Photos</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {photos.map(p => (
                  <img key={p.id} src={p.url} alt="task" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '0.5px solid #e2e8f0' }} />
                ))}
              </div>
              <label style={{ ...btnStyle.secondary, display: 'inline-block', cursor: 'pointer', textAlign: 'center', width: '100%', padding: '0.65rem' }}>
                {uploading ? 'Uploading...' : '📷 Upload Photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => uploadPhoto(e, selectedTask.id)} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectTasks