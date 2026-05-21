import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SiteDashboard from './pages/SiteDashboard'
import ProjectDetail from './pages/ProjectDetail'
import ProjectChat from './pages/ProjectChat'
import ProjectTasks from './pages/ProjectTasks'
import Enquiries from './pages/Enquiries'
import EnquiryDetail from './pages/EnquiryDetail'
import CostSheet from './pages/CostSheet'
import Login from './pages/Login'
import Users from './pages/Users'
import { getUser, canAccess } from './auth'

function ProtectedRoute({ children, section }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" />
  if (section && !canAccess(user, section)) {
    return (
      <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", backgroundColor: '#f0f4f8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <div style={{ fontSize: '24px', marginBottom: '0.5rem' }}>🚫</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1a2332', marginBottom: '0.5rem' }}>Access Denied</div>
          <div style={{ fontSize: '13px', marginBottom: '1rem' }}>You don't have permission to view this page.</div>
          <button onClick={() => window.location.href = '/'} style={{ backgroundColor: '#29ABE2', color: 'white', border: 'none', padding: '0.5rem 1.2rem', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  return children
}

function HomeDashboard() {
  const user = getUser()
  if (!user) return <Navigate to="/login" />
  const hasOfficeRole = user.roles.some(r => ['admin', 'operations', 'project_manager', 'engineer', 'sales'].includes(r))
  if (!hasOfficeRole && user.roles.includes('site_delivery')) return <SiteDashboard />
  return <Dashboard />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/project/:id" element={<ProtectedRoute section="projects"><ProjectDetail /></ProtectedRoute>} />
        <Route path="/project/:id/chat" element={<ProtectedRoute section="projects"><ProjectChat /></ProtectedRoute>} />
        <Route path="/project/:id/tasks" element={<ProtectedRoute section="projects"><ProjectTasks /></ProtectedRoute>} />
        <Route path="/enquiries" element={<ProtectedRoute section="enquiries"><Enquiries /></ProtectedRoute>} />
        <Route path="/enquiry/:id" element={<ProtectedRoute section="enquiries"><EnquiryDetail /></ProtectedRoute>} />
        <Route path="/cost/:id" element={<ProtectedRoute section="costmodel"><CostSheet /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute section="admin"><Users /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App