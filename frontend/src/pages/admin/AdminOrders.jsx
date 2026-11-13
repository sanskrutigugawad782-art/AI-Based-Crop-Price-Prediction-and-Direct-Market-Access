import useApi from '../../hooks/useApi'
import { PageHeader, Skeleton, ErrorCard, NothingYet } from '../../components/app/Cards'
import { TransactionTable } from './AdminTransactions'
import { Package } from 'lucide-react'

export default function AdminOrders() {
  const { data, error, loading, reload } = useApi('/admin/orders')
  const orders = data?.transactions || []
  return (
    <>
      <PageHeader eyebrow="Fulfilment" title="Orders" desc="All purchase orders in the pipeline, with value and current status." />
      {loading && <Skeleton className="h-[300px] w-full" />}
      {error && <ErrorCard onRetry={reload} />}
      {!loading && !error && orders.length === 0 && <NothingYet icon={Package} title="No orders yet" desc="Orders appear once an offer is accepted." />}
      {!loading && !error && orders.length > 0 && <TransactionTable transactions={orders} />}
    </>
  )
}