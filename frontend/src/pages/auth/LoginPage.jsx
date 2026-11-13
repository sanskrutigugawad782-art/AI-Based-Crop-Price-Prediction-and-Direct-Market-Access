import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { roleHome } from '../../utils/roles'
import { EASE } from '../../lib/motion'
import Button from '../../components/ui/Button'
import { Logo } from '../../components/ui/Logo'
import { Leaf, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

const DEMO = [
  { label: 'Farmer', email: 'farmer@agriconnect.in', password: 'demo1234', desc: '2 crops · Bengaluru' },
  { label: 'Buyer',  email: 'buyer@agriconnect.in',  password: 'demo1234', desc: 'ABC Foods' },
  { label: 'Admin',  email: 'admin@agriconnect.in',  password: 'demo1234', desc: 'Platform access' },
]

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [show, setShow]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  if (user) return <Navigate to={roleHome(user.role)} replace />

  const handle = async (e) => {
    e.preventDefault(); setError(null); setLoading(true)
    try { const { user } = await login(form); navigate(roleHome(user.role)) }
    catch (err) { setError(err.error || 'Login failed. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex min-h-screen bg-ivory">
      {/* LEFT — brand panel (desktop) */}
      <div className="hidden relative w-[480px] shrink-0 items-center justify-center overflow-hidden bg-agri-deep p-12 lg:flex">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_100%_at_50%_100%,rgba(200,219,166,0.15),transparent_50%)]" aria-hidden />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="relative z-10 max-w-[340px]">
          <Logo className="!brightness-invert" />
          <h2 className="u-display mt-10 text-[2.6rem] text-ivory">
            Intelligence
            <br />
            for Better
            <br />
            Farming.
          </h2>
          <p className="mt-6 text-[0.92rem] leading-relaxed text-ivory/65">
            AI-powered crop intelligence, market prediction, and direct access
            to verified buyers.
          </p>
        </motion.div>
      </div>

      {/* RIGHT — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: EASE }} className="w-full max-w-[420px]">
          <div className="lg:hidden mb-12">
            <Logo />
          </div>
          <p className="u-eyebrow mb-6 text-sage">Sign in to your account</p>
          <h1 className="u-display text-[2.4rem] text-ink">Welcome Back.</h1>
          <p className="mt-3 text-[0.92rem] text-smoke">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-medium text-agri transition-colors hover:text-moss">Create one</Link>
          </p>

          {error && (
            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
              <AlertCircle className="h-[18px] w-[18px] shrink-0 text-red-600" strokeWidth={1.5} />
              <p className="text-[0.84rem] text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handle} className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-charcoal">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-sage" strokeWidth={1.5} />
                <input
                  type="email" required autoFocus autoComplete="email"
                  value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}
                  className="w-full rounded-xl border border-ink/[0.1] bg-white/80 py-3.5 pl-11 pr-4 text-[0.9rem] text-ink placeholder:text-sage/50 transition-colors focus:border-agri/50 focus:outline-none"
                  placeholder="you@email.com"
                />
              </div>
            </div>
            {/* Password */}
            <div>
              <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-charcoal">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-sage" strokeWidth={1.5} />
                <input
                  type={show?'text':'password'} required autoComplete="current-password"
                  value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}
                  className="w-full rounded-xl border border-ink/[0.1] bg-white/80 py-3.5 pl-11 pr-11 text-[0.9rem] text-ink placeholder:text-sage/50 transition-colors focus:border-agri/50 focus:outline-none"
                  placeholder="Enter password"
                />
                <button type="button" onClick={()=>setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-sage transition-colors hover:text-ink">
                  {show ? <EyeOff className="h-4 w-4" strokeWidth={1.5}/> : <Eye className="h-4 w-4" strokeWidth={1.5}/>}
                </button>
              </div>
            </div>
            <Button type="submit" size="lg" variant="dark" className="w-full justify-center !rounded-2xl" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          {/* Demo quick login */}
          <div className="mt-10 border-t border-ink/[0.07] pt-8">
            <p className="mb-4 text-[0.64rem] font-medium uppercase tracking-[0.24em] text-sage">Quick demo access</p>
            <div className="grid grid-cols-3 gap-3">
              {DEMO.map((d) => (
                <button
                  key={d.email}
                  onClick={async () => { setError(null); setLoading(true); try { const { user } = await login(d); navigate(roleHome(user.role)) } catch(e){ setError(e.error||'Failed') } finally{ setLoading(false) }}}
                  className="group flex flex-col items-start rounded-xl border border-ink/[0.07] bg-white/60 p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-agri/30 hover:shadow-[0_12px_28px_-12px_rgba(31,58,42,0.15)]"
                >
                  <span className="text-[0.72rem] font-semibold text-ink transition-colors group-hover:text-agri">{d.label}</span>
                  <span className="mt-1 text-[0.64rem] leading-snug text-sage">{d.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )}