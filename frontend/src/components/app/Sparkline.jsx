import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts'

export default function Sparkline({ data, color = '#1F3A2A', height = 40, width = 120, dashed = null }) {
  const gid = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <div style={{ width, height }} className="shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`sparkFill${gid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.18} />
              <stop offset="100%" stopColor={color} stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ stroke: 'rgba(23,26,22,0.12)' }}
            formatter={(v) => ['₹' + Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 }), 'Price']}
            labelFormatter={(l) => String(l)}
            contentStyle={{ background: '#fff', border: '1px solid rgba(23,26,22,0.1)', borderRadius: 12, fontSize: 12, padding: '6px 10px' }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.6}
            strokeDasharray={typeof dashed === 'string' ? dashed : undefined}
            fill={`url(#sparkFill${gid})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}