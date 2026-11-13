export const ROLE_HOME = {
  farmer: '/app/farmer/dashboard',
  buyer:  '/app/buyer/dashboard',
  admin:  '/admin/overview',
}

export const roleHome = (role) => ROLE_HOME[role] || ROLE_HOME.farmer