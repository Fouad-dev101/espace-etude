export default function ProgressBar({ value = 0, size = 'md', color, className = '' }) {
  const h = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
  const c = color || 'bg-gradient-to-r from-indigo-500 to-violet-500'
  return (
    <div className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${h} ${className}`}>
      <div
        className={`h-full ${c} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}