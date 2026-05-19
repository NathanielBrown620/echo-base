import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ProjectDetail from './pages/ProjectDetail'
import Enquiries from './pages/Enquiries'
import CostSheet from './pages/CostSheet'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/project/:id" element={<ProjectDetail />} />
        <Route path="/enquiries" element={<Enquiries />} />
        <Route path="/enquiry/:id" element={<Enquiries />} />
        <Route path="/cost/:id" element={<CostSheet />} />
      </Routes>
    </Router>
  )
}

export default App