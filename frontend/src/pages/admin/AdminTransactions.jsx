import useApi from '../../hooks/useApi'
import { PageHeader, Card, Skeleton, ErrorCard, NothingYet, Tag, inr } from '../../components/app/Cards'
import { Receipt } from 'lucide-react'

export function TransactionTable({ transactions }) {
  return (
    <Card className="overflow-hidden">
      {transactions.map((t) => (
        <div key={t.id} className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/[0.06] px-6 py-5 last:border-0 md:px-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-[0.92rem] font-semibold text-ink">{t.crop}</p>
              <span className="rounded-full bg-ink/[0.05] px-3 py-1 font-mono text-[0.62rem] text-sage">{t.orderCode}</span>
              <Tag status={t.status} />
            </div>
            <p className="mt-1 text-[0.72rem] text-sage">{t.farmer} → {t.buyer} · {inr(t.quantityKg)} kg · ₹{inr(t.pricePerKg)}/kg · {t.createdAt}</p>
          </div>
          <p className="shrink-0 text-[0.94rem] font-semibold text-ink">₹{inr(t.value)}</p>
        </div>
      ))}
    </Card>
  )
}

export default function AdminTransactions() {
  const { data, error, loading, reload } = useApi('/admin/transactions')
  const transactions = data?.transactions || []
  return (
    <>
      <PageHeader eyebrow="Ledger" title="Transactions" desc="Every order moved from offer to fulfilment across the marketplace." />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && transactions.length === 0 && <NothingYet icon={Receipt} title="No transactions yet" desc="Accepted offers appear here automatically." />}
      {!loading && !error && transactions.length > 0 && <TransactionTable transactions={transactions} />}
    </>
  )
}