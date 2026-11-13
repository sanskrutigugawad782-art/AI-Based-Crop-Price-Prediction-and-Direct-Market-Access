import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { roleHome } from './utils/roles'
import HomePage from './pages/landing/HomePage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AppShell from './layouts/AppShell'
import { BuyerShell, AdminShell } from './layouts/AppShell'

import DashboardPage from './pages/app/DashboardPage'
import FarmPage from './pages/app/FarmPage'
import MarketPage from './pages/app/MarketPage'
import AdvisorPage from './pages/app/AdvisorPage'
import PlannerPage from './pages/app/PlannerPage'
import MarketplacePage from './pages/app/MarketplacePage'
import OrdersPage from './pages/app/OrdersPage'
import NotificationsPage from './pages/app/NotificationsPage'
import ProfilePage from './pages/app/ProfilePage'
import SettingsPage from './pages/app/SettingsPage'

import BuyerDashboard from './pages/buyer/BuyerDashboard'
import Procurement from './pages/buyer/Procurement'
import FindProduce from './pages/buyer/FindProduce'
import MyRequirements from './pages/buyer/MyRequirements'
import Matches from './pages/buyer/Matches'
import Offers from './pages/buyer/Offers'
import BuyerOrders from './pages/buyer/BuyerOrders'
import Suppliers from './pages/buyer/Suppliers'
import Analytics from './pages/buyer/Analytics'
import BuyerProfile from './pages/buyer/BuyerProfile'

import AdminOverview from './pages/admin/AdminOverview'
import AdminUsers from './pages/admin/AdminUsers'
import AdminFarmers from './pages/admin/AdminFarmers'
import AdminBuyers from './pages/admin/AdminBuyers'
import AdminCrops from './pages/admin/AdminCrops'
import AdminMarkets from './pages/admin/AdminMarkets'
import AdminMarketData from './pages/admin/AdminMarketData'
import AdminListings from './pages/admin/AdminListings'
import AdminRequirements from './pages/admin/AdminRequirements'
import AdminTransactions from './pages/admin/AdminTransactions'
import AdminOrders from './pages/admin/AdminOrders'
import AdminReports from './pages/admin/AdminReports'
import AdminAiModels from './pages/admin/AdminAiModels'

function Loader() {
  return (
    <div className="flex flex-col items-center gap-5">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-ink/[0.12] border-t-agri" />
      <p className="text-[0.68rem] uppercase tracking-[0.26em] text-sage">Preparing your workspace</p>
    </div>
  )
}

function Guarded({ roles, shell: Shell }) {
  const { user, ready } = useAuth()
  if (!ready) return <div className="grid min-h-screen place-items-center bg-ivory"><Loader /></div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />
  return <Shell />
}

function RootRedirect() {
  const { user, ready } = useAuth()
  if (!ready) return null
  return <Navigate to={user ? roleHome(user.role) : '/'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/app/farmer" element={<Guarded roles={['farmer']} shell={AppShell} />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<DashboardPage />} />
        <Route path="farm"          element={<FarmPage />} />
        <Route path="market"        element={<MarketPage />} />
        <Route path="advisor"       element={<AdvisorPage />} />
        <Route path="planner"       element={<PlannerPage />} />
        <Route path="marketplace"   element={<MarketplacePage />} />
        <Route path="orders"        element={<OrdersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile"       element={<ProfilePage />} />
        <Route path="settings"      element={<SettingsPage />} />
      </Route>

      <Route path="/app/buyer" element={<Guarded roles={['buyer']} shell={BuyerShell} />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard"     element={<BuyerDashboard />} />
        <Route path="procurement"   element={<Procurement />} />
        <Route path="find-produce"  element={<FindProduce />} />
        <Route path="requirements"  element={<MyRequirements />} />
        <Route path="matches"       element={<Matches />} />
        <Route path="offers"        element={<Offers />} />
        <Route path="orders"        element={<BuyerOrders />} />
        <Route path="suppliers"     element={<Suppliers />} />
        <Route path="analytics"     element={<Analytics />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile"       element={<BuyerProfile />} />
        <Route path="settings"      element={<SettingsPage />} />
      </Route>

      <Route path="/admin" element={<Guarded roles={['admin']} shell={AdminShell} />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview"      element={<AdminOverview />} />
        <Route path="users"         element={<AdminUsers />} />
        <Route path="farmers"       element={<AdminFarmers />} />
        <Route path="buyers"        element={<AdminBuyers />} />
        <Route path="crops"         element={<AdminCrops />} />
        <Route path="markets"       element={<AdminMarkets />} />
        <Route path="market-data"   element={<AdminMarketData />} />
        <Route path="listings"      element={<AdminListings />} />
        <Route path="requirements"  element={<AdminRequirements />} />
        <Route path="transactions"  element={<AdminTransactions />} />
        <Route path="orders"        element={<AdminOrders />} />
        <Route path="reports"       element={<AdminReports />} />
        <Route path="ai-models"     element={<AdminAiModels />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings"      element={<SettingsPage />} />
      </Route>

      <Route path="/app" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  )
}