import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import useApi from '../hooks/useApi'
import { Logo } from '../components/ui/Logo'
import Avatar from '../components/ui/Avatar'
import {
  LayoutDashboard, Sprout, BarChart3, Brain, Calculator,
  ArrowRightLeft, Package, Bell, User, Settings, LogOut, Menu, X,
  Building2, ClipboardList, FileText, Search, Sparkles, Users, Store,
  Landmark, Flag, BrainCircuit, Receipt,
} from 'lucide-react'

export const FARMER_NAV = [
  { to: '/app/farmer/dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { to: '/app/farmer/farm',         label: 'My Farm',       icon: Sprout },
  { to: '/app/farmer/market',       label: 'Market',        icon: BarChart3 },
  { to: '/app/farmer/advisor',      label: 'AI Advisor',    icon: Brain },
  { to: '/app/farmer/planner',      label: 'Profit Planner', icon: Calculator },
  { to: '/app/farmer/marketplace',  label: 'Marketplace',   icon: ArrowRightLeft },
  { to: '/app/farmer/orders',       label: 'Orders',        icon: Package },
  { to: '/app/farmer/notifications',label: 'Notifications', icon: Bell },
  { to: '/app/farmer/profile',      label: 'Profile',       icon: User },
  { to: '/app/farmer/settings',     label: 'Settings',      icon: Settings },
]

export const BUYER_NAV = [
  { to: '/app/buyer/dashboard',       label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/app/buyer/procurement',     label: 'Procurement',    icon: ClipboardList },
  { to: '/app/buyer/find-produce',    label: 'Find Produce',   icon: Search },
  { to: '/app/buyer/requirements',    label: 'My Requirements', icon: FileText },
  { to: '/app/buyer/matches',         label: 'Matches',        icon: Sparkles },
  { to: '/app/buyer/offers',          label: 'Offers',         icon: ArrowRightLeft },
  { to: '/app/buyer/orders',          label: 'Orders',         icon: Package },
  { to: '/app/buyer/suppliers',       label: 'Suppliers',      icon: Building2 },
  { to: '/app/buyer/analytics',       label: 'Analytics',      icon: BarChart3 },
  { to: '/app/buyer/notifications',   label: 'Notifications',  icon: Bell },
  { to: '/app/buyer/profile',         label: 'Profile',        icon: User },
  { to: '/app/buyer/settings',        label: 'Settings',       icon: Settings },
]

export const ADMIN_NAV = [
  { to: '/admin/overview',       label: 'Overview',        icon: LayoutDashboard },
  { to: '/admin/users',          label: 'Users',           icon: Users },
  { to: '/admin/farmers',        label: 'Farmers',         icon: Sprout },
  { to: '/admin/buyers',         label: 'Buyers',          icon: Store },
  { to: '/admin/crops',          label: 'Crops',           icon: Calculator },
  { to: '/admin/markets',        label: 'Markets',         icon: Landmark },
  { to: '/admin/market-data',    label: 'Market Data',     icon: BarChart3 },
  { to: '/admin/listings',       label: 'Listings',        icon: ClipboardList },
  { to: '/admin/requirements',   label: 'Requirements',    icon: FileText },
  { to: '/admin/transactions',   label: 'Transactions',    icon: Receipt },
  { to: '/admin/orders',         label: 'Orders',          icon: Package },
  { to: '/admin/reports',        label: 'Reports',         icon: Flag },
  { to: '/admin/ai-models',      label: 'AI & Models',     icon: BrainCircuit },
  { to: '/admin/notifications',  label: 'Notifications',   icon: Bell },
  { to: '/admin/settings',       label: 'System Settings', icon: Settings },
]

function NavLabel({ item, unread, notifTo }) {
  return (
    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
      <span className="truncate">{item.label}</span>
      {item.to === notifTo && unread > 0 && (
        <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-agri px-1.5 text-[0.58rem] font-bold text-ivory">{unread}</span>
      )}
    </span>
  )
}

function SidebarItem({ item, onNavigate, unread, notifTo }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      end
      className={({ isActive }) =>
        `group relative flex items-center gap-3.5 rounded-xl px-4 py-3 text-[0.82rem] transition-all duration-300 ${
          isActive
            ? 'bg-lime-soft/70 font-medium text-agri'
            : 'text-charcoal/70 hover:bg-ink/[0.03] hover:text-ink'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`absolute left-0 h-6 w-[3px] rounded-r-full transition-all duration-300 ${isActive ? 'bg-agri' : 'bg-transparent'}`} />
          <Icon className={`h-[17px] w-[17px] ${isActive ? 'text-agri' : ''}`} strokeWidth={isActive ? 2 : 1.6} />
          <NavLabel item={item} unread={unread} notifTo={notifTo} />
        </>
      )}
    </NavLink>
  )
}

function Sidebar({ nav, notifTo }) {
  const { user, logout } = useAuth()
  const { data } = useApi('/notifications')
  const unread = data?.unread || 0
  return (
    <aside className="hidden w-[264px] shrink-0 flex-col border-r border-ink/[0.07] bg-white/70 lg:flex">
      <div className="px-7 pt-8 pb-6">
        <Logo />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-4 pb-6">
        {nav.map((item) => <SidebarItem key={item.to} item={item} unread={unread} notifTo={notifTo} />)}
      </nav>
      <div className="border-t border-ink/[0.07] p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-ivory-deep/60 p-4">
          <Avatar initials={user?.initials || 'AC'} size={34} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.84rem] font-medium text-ink">{user?.name}</p>
            <p className="text-[0.64rem] font-medium uppercase tracking-[0.16em] text-sage">{user?.role}</p>
          </div>
          <button onClick={logout} title="Sign out" className="grid h-8 w-8 place-items-center rounded-full text-sage transition-colors hover:bg-red-50 hover:text-red-600">
            <LogOut className="h-4 w-4" strokeWidth={1.5}/>
          </button>
        </div>
      </div>
    </aside>
  )
}

function Topbar({ pageTitle, nav, notifTo }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { data } = useApi('/notifications')
  const unread = data?.unread || 0

  return (
    <>
      <header className="flex h-[72px] items-center justify-between gap-4 border-b border-ink/[0.07] bg-ivory px-5 md:px-8 lg:hidden">
        <Logo wordmark={false} />
        <div className="flex items-center gap-2">
          <NavLink to={notifTo} className="relative grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-white/60 text-ink">
            <Bell className="h-5 w-5" strokeWidth={1.5} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-agri px-1.5 text-[0.58rem] font-bold text-ivory">{unread}</span>
            )}
          </NavLink>
          <button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 bg-white/60 text-ink">
            <Menu className="h-5 w-5" strokeWidth={1.5}/>
          </button>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          >
            <motion.aside
              initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-y-0 left-0 flex w-[288px] flex-col bg-ivory pb-28 shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 pt-7 pb-5">
                <Logo />
                <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-ink/10 text-ink">
                  <X className="h-4 w-4" strokeWidth={1.5}/>
                </button>
              </div>
              <nav className="flex-1 space-y-0.5 overflow-y-auto px-4">
                {nav.map((item) => (
                  <NavLink
                    key={item.to} to={item.to} onClick={() => setOpen(false)} end
                    className={({ isActive }) => `flex items-center gap-3.5 rounded-xl px-4 py-3 text-[0.84rem] ${isActive ? 'bg-lime-soft/70 font-medium text-agri' : 'text-charcoal/70 hover:bg-ink/[0.03]'}`}
                  >
                    {({ isActive }) => { const Icon = item.icon; return (<><Icon className="h-[17px] w-[17px]" strokeWidth={isActive?2:1.6}/><NavLabel item={item} unread={unread} notifTo={notifTo} /></>) }}
                  </NavLink>
                ))}
              </nav>
              <div className="border-t border-ink/[0.07] p-4">
                <div className="flex items-center gap-3 rounded-2xl bg-ivory-deep/60 p-4">
                  <Avatar initials={user?.initials || 'AC'} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.84rem] font-medium text-ink">{user?.name}</p>
                    <p className="text-[0.64rem] uppercase tracking-[0.16em] text-sage">{user?.role}</p>
                  </div>
                  <button onClick={() => { logout(); setOpen(false) }} className="text-sage hover:text-red-600"><LogOut className="h-4 w-4" strokeWidth={1.5}/></button>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function MobileNav({ nav }) {
  const mobile = nav.slice(0, 5)
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t border-ink/[0.08] bg-white/92 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      {mobile.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to} to={item.to} end
            className={({ isActive }) => `flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-colors ${isActive ? 'text-agri' : 'text-sage'}`}
          >
            {({ isActive }) => (<>
              <Icon className={`h-[19px] w-[19px] ${isActive ? 'stroke-[2]' : ''}`} strokeWidth={1.6} />
              <span className="text-[0.56rem] font-medium uppercase tracking-[0.08em]">{item.label.split(' ')[0]}</span>
            </>)}
          </NavLink>
        )
      })}
    </nav>
  )
}

function RoleShell({ nav, notifTo }) {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const active = nav.find((n) => pathname.startsWith(n.to))

  return (
    <div className="flex min-h-screen bg-ivory">
      <Sidebar nav={nav} notifTo={notifTo} />
      <div className="flex min-w-0 flex-1 flex-col lg:pb-0 pb-20">
        <Topbar pageTitle={active?.label} nav={nav} notifTo={notifTo} />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 py-8 md:px-10 md:py-12">
          <Outlet />
        </main>
      </div>
      <MobileNav nav={nav} />
    </div>
  )
}

export default function AppShell() { return <RoleShell nav={FARMER_NAV} notifTo="/app/farmer/notifications" /> }
export function BuyerShell() { return <RoleShell nav={BUYER_NAV} notifTo="/app/buyer/notifications" /> }
export function AdminShell() { return <RoleShell nav={ADMIN_NAV} notifTo="/admin/notifications" /> }