import { useState } from 'react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { roleHome } from '../../utils/roles'
import { EASE } from '../../lib/motion'
import { Logo } from '../../components/ui/Logo'
import { Mail, Lock, User, Phone, MapPin, AlertCircle, Check } from 'lucide-react'

const ROLES = [
  { id: 'farmer', label: 'Farmer', desc: 'Grow, list crops & sell direct' },
  { id: 'buyer',  label: 'Buyer',  desc: 'Source produce from verified farms' },
]

const FIELD = 'w-full rounded-xl border border-ink/[0.1] bg-white/80 py-3.5 pl-11 pr-4 text-[0.9rem] text-ink placeholder:text-sage/50 transition-colors focus:border-agri/50 focus:outline-none'

export default function RegisterPage() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', phone: '', location: '', role: 'farmer', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [fields, setFields]   = useState({})

  if (user) return <Navigate to={roleHome(user.role)} replace />

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })
  const handle = async (e) => {
    e.preventDefault(); setError(null); setFields({}); setLoading(true)
    try { const { user } = await register(form); navigate(roleHome(user.role)) }
    catch (err) { setError(err.error || 'Registration failed. Please try again.'); setFields(err.fields || {}) }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-ivory px-6 py-10 lg:px-12">
      <div className="mx-auto w-full max-w-[1020px]">
        <div className="flex items-center justify-between">
          <Logo />
          <p className="text-[0.84rem] text-smoke">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-agri hover:text-moss">Sign in</Link>
          </p>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mt-14 mb-8">
          <p className="u-eyebrow mb-5 text-sage">Create your account</p>
          <h1 className="u-display text-[2.4rem] text-ink">Join AgriConnect.</h1>
          <p className="mt-3 max-w-[520px] text-[0.92rem] text-smoke">
            Choose your account type to get started with AI-powered farming
            intelligence and direct market access.
          </p>
        </motion.div>

        {error && (
          <div className="mb-7 flex max-w-[640px] items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
            <AlertCircle className="h-[18px] w-[18px] shrink-0 text-red-600" strokeWidth={1.5} />
            <p className="text-[0.84rem] text-red-700">{error}</p>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          {/* ROLE SELECT */}
          <div>
            <p className="mb-4 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-charcoal">Account type</p>
            <div className="space-y-3">
              {ROLES.map((r) => (
                <button
                  key={r.id} type="button" onClick={() => setForm({ ...form, role: r.id })}
                  className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-300 ${
                    form.role === r.id ? 'border-agri/40 bg-lime-soft/50 shadow-[0_10px_24px_-14px_rgba(31,58,42,0.25)]' : 'border-ink/[0.08] bg-white/50 hover:border-ink/20'
                  }`}
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border ${form.role === r.id ? 'border-agri bg-agri text-lime' : 'border-ink/[0.15] text-sage'}`}>
                    <Check className="h-4 w-4" strokeWidth={2}/>
                  </span>
                  <span>
                    <span className={`block text-[0.95rem] font-semibold ${form.role === r.id ? 'text-agri' : 'text-ink'}`}>{r.label}</span>
                    <span className="mt-0.5 block text-[0.78rem] text-smoke">{r.desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FORM */}
          <form onSubmit={handle} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-charcoal">
                {form.role === 'buyer' ? 'Company / business name' : 'Full name'}
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-sage" strokeWidth={1.5}/>
                <input required value={form.name} onChange={set('name')} className={FIELD} placeholder="Your name" />
              </div>
              {fields.name && <p className="mt-1.5 text-[0.76rem] text-red-600">{fields.name}</p>}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-charcoal">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-sage" strokeWidth={1.5}/>
                  <input type="email" required value={form.email} onChange={set('email')} className={FIELD} placeholder="you@email.com" />
                </div>
                {fields.email && <p className="mt-1.5 text-[0.76rem] text-red-600">{fields.email}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-charcoal">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-sage" strokeWidth={1.5}/>
                  <input value={form.phone} onChange={set('phone')} className={FIELD} placeholder="+91" />
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-charcoal">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-sage" strokeWidth={1.5}/>
                <input value={form.location} onChange={set('location')} className={FIELD} placeholder="District, State" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.2em] text-charcoal">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-[16px] w-[16px] -translate-y-1/2 text-sage" strokeWidth={1.5}/>
                <input type="password" minLength={8} required value={form.password} onChange={set('password')} className={FIELD} placeholder="Minimum 8 characters" />
              </div>
              {fields.password && <p className="mt-1.5 text-[0.76rem] text-red-600">{fields.password}</p>}
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-[16px] bg-ink py-4 text-[0.78rem] font-medium uppercase tracking-[0.18em] text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-agri disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
            <p className="text-[0.72rem] leading-relaxed text-sage">
              By creating an account you agree to AgriConnect's terms. Your
              data is stored securely and never shared without consent.
            </p>
          </form>
        </div>
      </div>
    </div>
  )}