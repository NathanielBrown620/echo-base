export function getUser() {
  try {
    const user = localStorage.getItem('echobase_user')
    return user ? JSON.parse(user) : null
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem('echobase_user')
  window.location.href = '/login'
}

export function hasRole(user, ...roles) {
  if (!user) return false
  if (user.roles.includes('admin')) return true
  return roles.some(r => user.roles.includes(r))
}

export function canAccess(user, section) {
  if (!user) return false
  if (user.roles.includes('admin')) return true

  const permissions = {
    operations: ['dashboard', 'enquiries', 'costmodel', 'projects', 'commercial', 'handover', 'change_control'],
    project_manager: ['dashboard', 'enquiries', 'costmodel', 'projects', 'commercial', 'handover', 'change_control'],
    engineer: ['dashboard', 'projects', 'handover'],
    site_delivery: ['dashboard', 'projects'],
    sales: ['enquiries', 'costmodel'],
  }

  return user.roles.some(role => permissions[role]?.includes(section))
}

export function canSeeCommercial(user) {
  return canAccess(user, 'commercial')
}

export function canSeeEnquiries(user) {
  return canAccess(user, 'enquiries')
}

export function canSeeCostModel(user) {
  return canAccess(user, 'costmodel')
}