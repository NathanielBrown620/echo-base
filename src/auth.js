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

export function hasRole(user, role) {
  if (!user) return false
  return user.roles.includes(role) || user.roles.includes('admin')
}

export function canAccess(user, section) {
  if (!user) return false
  if (user.roles.includes('admin')) return true

  const permissions = {
    operations: ['dashboard', 'enquiries', 'costmodel', 'projects', 'commercial'],
    project_manager: ['dashboard', 'projects', 'costmodel'],
    engineer: ['dashboard', 'projects'],
    site_delivery: ['dashboard', 'projects'],
    sales: ['enquiries', 'costmodel'],
  }

  return user.roles.some(role => permissions[role]?.includes(section))
}