export default function ProgressRing({ value = 0, size = 120, stroke = 10, children, color = '#6366f1' }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c - (value / 100) * c
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke}
          className="stroke-slate-100 dark:stroke-slate-800" fill="none" />
        <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke}
          stroke={color} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  )
}