import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import Enquiries from './pages/Enquiries'
import EnquiryDetail from './pages/EnquiryDetail'
import CostSheet from './pages/CostSheet'
import Login from './pages/Login'
import { getUser } from './auth'

function ProtectedRoute({ children }) {
  const user = getUser()
  if (!user) return <Navigate to="/login" />
  return children
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        <Route path="/enquiries" element={<ProtectedRoute><Enquiries /></ProtectedRoute>} />
        <Route path="/enquiry/:id" element={<ProtectedRoute><EnquiryDetail /></ProtectedRoute>} />
        <Route path="/cost/:id" element={<ProtectedRoute><CostSheet /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App