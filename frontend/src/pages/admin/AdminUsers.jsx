import { useState } from 'react'
import useApi from '../../hooks/useApi'
import { useAuth } from '../../context/AuthContext'
import { adminAPI } from '../../services/api'
import { PageHeader, Card, Skeleton, ErrorCard, Tag, NothingYet } from '../../components/app/Cards'
import Avatar from '../../components/ui/Avatar'
import { Users, Search, Ban, ShieldCheck, RefreshCw } from 'lucide-react'

export default function AdminUsers() {
  const { token } = useAuth()
  const { data, error, loading, reload } = useApi('/admin/users')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(null)

  const users = (data?.users || []).filter(
    (u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase())
  )

  const act = async (id, action) => {
    setBusy(id)
    try { await adminAPI.userAction(token, id, { action }); reload() }
    finally { setBusy(null) }
  }

  return (
    <>
      <PageHeader eyebrow="Identity" title="Users" desc={`${data?.count || 0} accounts on the platform. Verify, suspend or reactivate access here.`}>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-sage" strokeWidth={1.5} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, role…"
            className="w-full rounded-2xl border border-ink/[0.1] bg-white/80 py-3.5 pl-11 pr-4 text-[0.86rem] text-ink placeholder:text-sage/50 focus:border-agri/50 focus:outline-none" />
        </div>
      </PageHeader>

      {loading && <Skeleton className="h-[360px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && users.length === 0 && <NothingYet icon={Users} title="No users found" desc="Try a different search, or wait for new registrations." />}

      {!loading && !error && users.length > 0 && (
        <Card className="overflow-hidden">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/[0.06] px-6 py-5 last:border-0 md:px-8">
              <div className="flex min-w-0 items-center gap-4">
                <Avatar initials={u.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()} size={42} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <p className="text-[0.92rem] font-semibold text-ink">{u.name}</p>
                    <Tag status={u.role} />
                  </div>
                  <p className="mt-0.5 truncate text-[0.72rem] text-sage">{u.email}{u.location ? ` · ${u.location}` : ''}{u.farmSize ? ` · ${u.farmSize} acres` : ''}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Tag status={u.status} />
                {u.status === 'active' ? (
                  <button onClick={() => act(u.id, 'suspend')} disabled={busy === u.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50">
                    <Ban className="h-3.5 w-3.5" strokeWidth={1.75} /> Suspend
                  </button>
                ) : (
                  <button onClick={() => act(u.id, 'reactivate')} disabled={busy === u.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-lime px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:bg-lime-soft disabled:opacity-50">
                    <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} /> Reactivate
                  </button>
                )}
                {u.role !== 'admin' && (
                  <button onClick={() => act(u.id, 'verify')} disabled={busy === u.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-ink/15 px-4 py-2 text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-agri/40 hover:text-agri disabled:opacity-50">
                    <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.75} /> Verify
                  </button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  )
}