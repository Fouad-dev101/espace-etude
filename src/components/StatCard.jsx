export default function StatCard({ icon: Icon, label, value, sub, accent = 'indigo' }) {
  const accents = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  }
  return (
    <div className="card p-4 md:p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accents[accent]}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-bold tracking-tight font-display">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{label}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-1.5">{sub}</div>}
    </div>
  )
}