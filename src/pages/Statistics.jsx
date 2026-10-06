import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import {
  subjectProgress, subjectMastery, countCompletedLessons, countCompletedChapters,
  countLessons, countChapters, overallProgress,
} from '../utils/progress'
import ProgressBar from '../components/ProgressBar'
import StatCard from '../components/StatCard'
import { BarChart3, BookOpen, Clock, Flame, Layers, TrendingUp, TrendingDown, Award } from 'lucide-react'

function lastNDays(n) {
  const days = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
    days.push(d)
  }
  return days
}

export default function Statistics() {
  const { state } = useApp()

  const fmtMs = (ms) => {
    const m = Math.floor(ms / 60000)
    if (m < 60) return `${m} min`
    return `${Math.floor(m / 60)} h ${m % 60} min`
  }

  const overall = overallProgress(state.subjects)
  const lessonsDone = countCompletedLessons(state.subjects)
  const lessonsTotal = countLessons(state.subjects)
  const chaptersDone = countCompletedChapters(state.subjects)
  const chaptersTotal = countChapters(state.subjects)

  const weekSessions = useMemo(() => {
    const start = new Date(); start.setDate(start.getDate() - 7); start.setHours(0, 0, 0, 0)
    return state.sessions.filter(s => new Date(s.date) >= start)
  }, [state.sessions])

  const monthSessions = useMemo(() => {
    const start = new Date(); start.setDate(start.getDate() - 30); start.setHours(0, 0, 0, 0)
    return state.sessions.filter(s => new Date(s.date) >= start)
  }, [state.sessions])

  const weekMs = weekSessions.reduce((a, s) => a + s.duration, 0)
  const monthMs = monthSessions.reduce((a, s) => a + s.duration, 0)
  const totalMs = state.sessions.reduce((a, s) => a + s.duration, 0)

  const subjectsSorted = useMemo(() => {
    return [...state.subjects]
      .map(s => ({ s, progress: subjectProgress(s), mastery: subjectMastery(s) }))
      .sort((a, b) => b.progress - a.progress)
  }, [state.subjects])

  const weakest = [...subjectsSorted].reverse().slice(0, 3)
  const strongest = subjectsSorted.slice(0, 3)

  const mastery = useMemo(() => {
    let good = 0, review = 0, bad = 0, none = 0
    state.subjects.forEach(s => s.chapters?.forEach(c => c.lessons?.forEach(l => {
      if (l.mastery === 'good') good++
      else if (l.mastery === 'review') review++
      else if (l.mastery === 'bad') bad++
      else none++
    })))
    return { good, review, bad, none, total: good + review + bad + none }
  }, [state.subjects])

  const heatmap = useMemo(() => {
    const days = lastNDays(12 * 7)
    const counts = {}
    state.sessions.forEach(s => {
      const key = s.date.slice(0, 10)
      counts[key] = (counts[key] || 0) + s.duration
    })
    return days.map(d => ({
      date: d, key: d.toISOString().slice(0, 10),
      duration: counts[d.toISOString().slice(0, 10)] || 0,
    }))
  }, [state.sessions])

  const intensity = (ms) => {
    if (ms === 0) return 'bg-slate-100 dark:bg-slate-800'
    if (ms < 15 * 60000) return 'bg-indigo-200 dark:bg-indigo-900/60'
    if (ms < 45 * 60000) return 'bg-indigo-300 dark:bg-indigo-700'
    if (ms < 90 * 60000) return 'bg-indigo-500'
    return 'bg-indigo-700 dark:bg-indigo-300'
  }

  const week = lastNDays(7).map(d => {
    const key = d.toISOString().slice(0, 10)
    const total = state.sessions.filter(s => s.date.slice(0, 10) === key).reduce((a, s) => a + s.duration, 0)
    return { day: d.toLocaleString('fr', { weekday: 'short' }), date: key, total }
  })
  const maxWeek = Math.max(...week.map(d => d.total), 60000)

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Statistiques</h1>
        <p className="text-sm text-slate-500 mt-1">Tes insights d'étude</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <StatCard icon={TrendingUp} label="Progression globale" value={`${overall}%`} accent="indigo" />
        <StatCard icon={BookOpen} label="Leçons terminées" value={`${lessonsDone}/${lessonsTotal}`} accent="violet" />
        <StatCard icon={Layers} label="Chapitres terminés" value={`${chaptersDone}/${chaptersTotal}`} accent="blue" />
        <StatCard icon={Award} label="Temps d'étude total" value={fmtMs(totalMs)} accent="emerald" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold font-display mb-4">Activité de la semaine</h3>
          <div className="h-40 flex items-end gap-2 md:gap-3">
            {week.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="flex-1 w-full flex items-end">
                  <div className={`w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-500 transition-all ${d.total === 0 ? 'bg-slate-200 dark:bg-slate-700 !bg-none' : ''}`}
                    style={{ height: `${Math.max(4, (d.total / maxWeek) * 100)}%` }} title={fmtMs(d.total)} />
                </div>
                <div className="text-[10px] text-slate-500 font-medium">{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold font-display mb-4">Temps d'étude</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1.5"><Clock size={12} /> Cette semaine</span>
              <span className="text-sm font-semibold">{fmtMs(weekMs)}</span>
            </div>
            <ProgressBar value={(weekMs / (5 * 3600000)) * 100} size="sm" />
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 flex items-center gap-1.5"><Clock size={12} /> Ce mois</span>
              <span className="text-sm font-semibold">{fmtMs(monthMs)}</span>
            </div>
            <ProgressBar value={(monthMs / (30 * 3600000)) * 100} size="sm" />
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 flex items-center gap-1.5"><Flame size={12} /> Série</span>
              <span className="text-sm font-semibold">{state.streak.current} jours</span>
            </div>
            <div className="text-[10px] text-slate-400">Record : {state.streak.longest} jours · Jours étudiés : {state.streak.daysStudied.length}</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <h3 className="text-sm font-semibold font-display mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-indigo-500" /> Progression par matière
          </h3>
          {subjectsSorted.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Aucune matière</p>
          ) : (
            <div className="space-y-3">
              {subjectsSorted.map(({ s, progress, mastery }) => (
                <div key={s.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5 font-medium"><span>{s.icon}</span>{s.name}</span>
                    <span className="text-slate-500">{progress}% · {mastery}% maîtrise</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold font-display mb-4">Répartition de la maîtrise</h3>
          {mastery.total === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">Aucune leçon</p>
          ) : (
            <>
              <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800">
                <div className="bg-emerald-500" style={{ width: `${(mastery.good / mastery.total) * 100}%` }} />
                <div className="bg-amber-500" style={{ width: `${(mastery.review / mastery.total) * 100}%` }} />
                <div className="bg-red-500" style={{ width: `${(mastery.bad / mastery.total) * 100}%` }} />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Je comprends</span><span className="font-semibold">{mastery.good}</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> À réviser</span><span className="font-semibold">{mastery.review}</span></div>
                <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Pas compris</span><span className="font-semibold">{mastery.bad}</span></div>
                <div className="flex items-center justify-between text-slate-400"><span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" /> Non évalué</span><span className="font-semibold">{mastery.none}</span></div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card p-5 mb-6">
        <h3 className="text-sm font-semibold font-display mb-4">Carte de chaleur d'étude</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {Array.from({ length: 12 }).map((_, w) => (
              <div key={w} className="flex flex-col gap-1">
                {heatmap.slice(w * 7, w * 7 + 7).map(d => (
                  <div key={d.key} className={`w-3.5 h-3.5 rounded-sm ${intensity(d.duration)}`} title={`${d.key}: ${fmtMs(d.duration)}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400">
          <span>Moins</span>
          <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
          <div className="w-3 h-3 rounded-sm bg-indigo-200 dark:bg-indigo-900/60" />
          <div className="w-3 h-3 rounded-sm bg-indigo-300 dark:bg-indigo-700" />
          <div className="w-3 h-3 rounded-sm bg-indigo-500" />
          <div className="w-3 h-3 rounded-sm bg-indigo-700 dark:bg-indigo-300" />
          <span>Plus</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="text-sm font-semibold font-display mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" /> Matières les plus fortes
          </h3>
          {strongest.length === 0 ? <p className="text-sm text-slate-400">Pas encore de données</p> : (
            <div className="space-y-3">
              {strongest.map(({ s, progress }) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: `${s.color}20` }}>{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-xs text-slate-400">{progress}% de progression</div>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{progress}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold font-display mb-4 flex items-center gap-2">
            <TrendingDown size={16} className="text-amber-500" /> Nécessitent de l'attention
          </h3>
          {weakest.length === 0 ? <p className="text-sm text-slate-400">Pas encore de données</p> : (
            <div className="space-y-3">
              {weakest.map(({ s, progress }) => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: `${s.color}20` }}>{s.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{s.name}</div>
                    <div className="text-xs text-slate-400">{progress}% de progression</div>
                  </div>
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{progress}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}