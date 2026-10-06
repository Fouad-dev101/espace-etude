import { useApp } from '../context/AppContext'
import { ACHIEVEMENTS } from '../utils/achievements'
import { Trophy, Lock } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'

export default function Achievements() {
  const { state } = useApp()
  const unlocked = new Set(state.achievements.map(a => a.id))
  const count = state.achievements.length
  const total = ACHIEVEMENTS.length
  const pct = total === 0 ? 0 : Math.round((count / total) * 100)

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">
          Achievements
        </h1>
        <p className="text-sm text-slate-500 mt-1">Milestones along the way</p>
      </div>

      <div className="card p-5 md:p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Trophy size={24} />
          </div>
          <div className="flex-1">
            <div className="text-sm text-slate-500 mb-1">
              {count} of {total} unlocked
            </div>
            <ProgressBar value={pct} color="bg-gradient-to-r from-amber-400 to-orange-500" />
          </div>
          <div className="text-2xl font-bold font-display">{pct}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map(a => {
          const isUnlocked = unlocked.has(a.id)
          const unlockedAt = state.achievements.find(x => x.id === a.id)?.date
          return (
            <div
              key={a.id}
              className={`card p-5 text-center transition ${isUnlocked ? 'border-amber-200 dark:border-amber-500/30 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-500/5 dark:to-slate-900' : 'opacity-60'}`}
            >
              <div
                className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-3 ${isUnlocked ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-slate-100 dark:bg-slate-800 grayscale'}`}
              >
                {isUnlocked ? a.icon : <Lock size={22} className="text-slate-400" />}
              </div>
              <h3
                className={`text-sm font-semibold font-display mb-1 ${isUnlocked ? '' : 'text-slate-400'}`}
              >
                {a.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{a.desc}</p>
              {isUnlocked && unlockedAt && (
                <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
                  Unlocked {new Date(unlockedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}