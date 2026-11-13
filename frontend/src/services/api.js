const API = '/api'

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${API}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined })
  let json
  try {
    json = await res.json()
  } catch {
    json = { error: `Server error (${res.status}). Please try again.` }
  }
  if (!res.ok) throw { status: res.status, ...json }
  return json
}

export const authAPI = {
  login:     (data)         => apiFetch('/auth/login',   { method: 'POST', body: data }),
  register:  (data)         => apiFetch('/auth/register',{ method: 'POST', body: data }),
  me:        (token)        => apiFetch('/auth/me',       { token }),
  logout:    (token)        => apiFetch('/auth/logout',  { method: 'POST', token }),
  updateProfile: (token, data) => apiFetch('/auth/profile', { method: 'PUT', body: data, token }),
}

export const notificationsAPI = {
  list:  (token) => apiFetch('/notifications', { token }),
  read:  (token, ids)   => apiFetch('/notifications/read', { method: 'POST', body: ids ? { ids } : {}, token }),
}

export const farmAPI   = {
  profile: (token) => apiFetch('/farm/profile', { token }),
  update:  (token, data) => apiFetch('/farm/profile', { method: 'PUT', body: data, token }),
  offers:  (token) => apiFetch('/farm/offers', { token }),
  counterOffer: (token, oid, data) => apiFetch(`/farm/offers/${oid}/counter`, { method: 'POST', body: data, token }),
  acceptOffer:  (token, oid) => apiFetch(`/farm/offers/${oid}/accept`, { method: 'POST', token }),
  declineOffer: (token, oid) => apiFetch(`/farm/offers/${oid}/decline`, { method: 'POST', token }),
}
export const marketAPI = {
  snapshot: (token) => apiFetch('/market/snapshot', { token }),
  universe: (token) => apiFetch('/market/universe', { token }),
  prices:   (token, crop, district) => apiFetch(`/market/prices?crop=${encodeURIComponent(crop)}&district=${encodeURIComponent(district)}`, { token }),
  history:  (token, crop, district, days = 90) => apiFetch(`/market/history?crop=${encodeURIComponent(crop)}&district=${encodeURIComponent(district)}&days=${days}`, { token }),
  districtComparison: (token, crop, district) => apiFetch(`/market/district-comparison?crop=${encodeURIComponent(crop)}&district=${encodeURIComponent(district)}`, { token }),
  markets: (token, params) => {
    const qs = Object.entries(params || {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return apiFetch(`/market/markets${qs ? `?${qs}` : ''}`, { token })
  },
  marketDetail: (token, params) => {
    const qs = Object.entries(params || {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return apiFetch(`/market/market-detail${qs ? `?${qs}` : ''}`, { token })
  },
  marketForecast: (token, params) => {
    const qs = Object.entries(params || {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return apiFetch(`/market/market-forecast${qs ? `?${qs}` : ''}`, { token })
  },
  marketForecastMulti: (token, params) => {
    const qs = Object.entries(params || {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return apiFetch(`/market/market-forecast-multi${qs ? `?${qs}` : ''}`, { token })
  },
  marketHistoryRange: (token, params) => {
    const qs = Object.entries(params || {})
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    return apiFetch(`/market/market-history${qs ? `?${qs}` : ''}`, { token })
  },
}
export const advisorAPI = {
  recommendation: (token) => apiFetch('/advisor/recommendation', { token }),
  yieldPrediction: (token, data) => apiFetch('/yield/predict', { method: 'POST', body: data, token }),
}
export const ordersAPI = {
  list:        (token) => apiFetch('/orders', { token }),
  updateStatus:(token, oid, status) => apiFetch(`/orders/${oid}/status`, { method: 'POST', body: { status }, token }),
  rate:        (token, oid, rating, comment) => apiFetch(`/orders/${oid}/rate`, { method: 'POST', body: { rating, comment }, token }),
}
export const marketplaceAPI = {
  listings: (token) => apiFetch('/marketplace/listings', { token }),
  accept:   (token, id) => apiFetch('/marketplace/accept', { method: 'POST', body: { id }, token }),
}

export const buyerAPI = {
  dashboard:  (token) => apiFetch('/buyer/dashboard', { token }),
  produce:    (token) => apiFetch('/buyer/produce', { token }),
  requirements: (token) => apiFetch('/buyer/requirements', { token }),
  createRequirement: (token, data) => apiFetch('/buyer/requirements', { method: 'POST', body: data, token }),
  matches:    (token) => apiFetch('/buyer/matches', { token }),
  matchAnalysis: (token, requirementId, listingId) => apiFetch(`/buyer/match-analysis?requirementId=${requirementId}&listingId=${listingId}`, { token }),
  offers:     (token) => apiFetch('/buyer/offers', { token }),
  createOffer: (token, data) => apiFetch('/buyer/offers', { method: 'POST', body: data, token }),
  counterOffer: (token, oid, data) => apiFetch(`/buyer/offers/${oid}/counter`, { method: 'POST', body: data, token }),
  acceptOffer: (token, oid) => apiFetch(`/buyer/offers/${oid}/accept`, { method: 'POST', token }),
  withdrawOffer: (token, oid) => apiFetch(`/buyer/offers/${oid}/withdraw`, { method: 'POST', token }),
  orders:     (token) => apiFetch('/buyer/orders', { token }),
  order:      (token, id) => apiFetch(`/buyer/orders/${id}`, { token }),
  suppliers:  (token) => apiFetch('/buyer/suppliers', { token }),
  analytics:  (token) => apiFetch('/buyer/analytics', { token }),
  profile:    (token) => apiFetch('/buyer/profile', { token }),
  updateProfile: (token, data) => apiFetch('/buyer/profile', { method: 'PUT', body: data, token }),
}

export const adminAPI = {
  overview:     (token) => apiFetch('/admin/overview', { token }),
  users:        (token) => apiFetch('/admin/users', { token }),
  userAction:   (token, id, data) => apiFetch(`/admin/users/${id}`, { method: 'PUT', body: data, token }),
  farmers:      (token) => apiFetch('/admin/farmers', { token }),
  buyers:       (token) => apiFetch('/admin/buyers', { token }),
  crops:        (token) => apiFetch('/admin/crops', { token }),
  markets:      (token) => apiFetch('/admin/markets', { token }),
  marketData:   (token) => apiFetch('/admin/market-data', { token }),
  listings:     (token) => apiFetch('/admin/listings', { token }),
  moderateListing: (token, id, data) => apiFetch(`/admin/listings/${id}/moderate`, { method: 'POST', body: data, token }),
  requirements: (token) => apiFetch('/admin/requirements', { token }),
  transactions: (token) => apiFetch('/admin/transactions', { token }),
  orders:       (token) => apiFetch('/admin/orders', { token }),
  reports:      (token) => apiFetch('/admin/reports', { token }),
  updateReport: (token, id, data) => apiFetch(`/admin/reports/${id}/update`, { method: 'POST', body: data, token }),
  aiModels:     (token) => apiFetch('/admin/ai-models', { token }),
  health:       (token) => apiFetch('/admin/health', { token }),
}

export const inr = (n) => (n == null ? '—' : n.toLocaleString('en-IN', { maximumFractionDigits: 1 }))
export const inr0 = (n) => (n == null ? '—' : n.toLocaleString('en-IN', { maximumFractionDigits: 0 }))