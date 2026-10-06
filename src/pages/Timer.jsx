import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { Play, Pause, RotateCcw, Timer as TimerIcon, Coffee } from 'lucide-react'
import ProgressRing from '../components/ProgressRing'
import { todayKey } from '../utils/id'

const PRESETS = [
  { label: 'Pomodoro', focus: 25, break: 5 },
  { label: 'Long', focus: 50, break: 10 },
  { label: 'Travail profond', focus: 90, break: 15 },
  { label: 'Personnalisé', focus: 20, break: 5, custom: true },
]

export default function TimerPage() {
  const { state, dispatch, toast } = useApp()
  const [mode, setMode] = useState('focus')
  const [preset, setPreset] = useState(PRESETS[0])
  const [customFocus, setCustomFocus] = useState(45)
  const [customBreak, setCustomBreak] = useState(10)
  const [remaining, setRemaining] = useState(PRESETS[0].focus * 60)
  const [running, setRunning] = useState(false)
  const [subjectId, setSubjectId] = useState('')
  const [chapterId, setChapterId] = useState('')
  const [lessonId, setLessonId] = useState('')
  const intervalRef = useRef(null)
  const completeRef = useRef(false)

  const focusDur = preset.custom ? customFocus : preset.focus
  const breakDur = preset.custom ? customBreak : preset.break
  const totalSeconds = (mode === 'focus' ? focusDur : breakDur) * 60

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { completeRef.current = true; return 0 }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  useEffect(() => {
    if (remaining === 0 && completeRef.current) {
      completeRef.current = false
      setRunning(false)
      handleComplete()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  const handleComplete = () => {
    if (mode === 'focus') {
      const duration = focusDur * 60000
      const session = {
        id: Math.random().toString(36).slice(2),
        date: new Date().toISOString(),
        duration, subjectId, chapterId, lessonId,
      }
      dispatch({ type: 'ADD_SESSION', session })
      dispatch({ type: 'STREAK_TOUCH' })
      toast('Session d\'étude terminée 🎉')
      setMode('break')
      setRemaining(breakDur * 60)
    } else {
      toast('Pause terminée — reprends l\'étude !')
      setMode('focus')
      setRemaining(focusDur * 60)
    }
  }

  const changePreset = (p) => {
    setPreset(p); setRunning(false); setMode('focus')
    setRemaining((p.custom ? customFocus : p.focus) * 60)
  }

  const reset = () => { setRunning(false); setRemaining(totalSeconds) }

  const progress = totalSeconds === 0 ? 0 : ((totalSeconds - remaining) / totalSeconds) * 100
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  const activeSubject = state.subjects.find(s => s.id === subjectId)
  const activeChapter = activeSubject?.chapters?.find(c => c.id === chapterId)
  const todaySessions = state.sessions.filter(s => s.date.slice(0, 10) === todayKey()).reduce((a, x) => a + x.duration, 0)

  const fmtMs = (ms) => {
    const m = Math.floor(ms / 60000)
    if (m < 60) return `${m} min`
    return `${Math.floor(m / 60)} h ${m % 60} min`
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Minuteur</h1>
        <p className="text-sm text-slate-500 mt-1">Reste concentré(e), suis ton temps</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card p-6 flex flex-col items-center">
          <div className="flex gap-2 mb-6">
            <button onClick={() => { setMode('focus'); setRemaining(focusDur * 60); setRunning(false) }}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition
                ${mode === 'focus' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <TimerIcon size={14} /> Concentration
            </button>
            <button onClick={() => { setMode('break'); setRemaining(breakDur * 60); setRunning(false) }}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition
                ${mode === 'break' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
              <Coffee size={14} /> Pause
            </button>
          </div>

          <ProgressRing value={progress} size={260} stroke={14} color={mode === 'focus' ? '#6366f1' : '#10b981'}>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-bold font-display tabular-nums tracking-tight">{mm}:{ss}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-2">
                {mode === 'focus' ? 'Session de concentration' : 'Temps de pause'}
              </div>
            </div>
          </ProgressRing>

          <div className="flex gap-2 mt-8">
            <button onClick={() => setRunning(!running)} className="btn-primary !px-8 !py-3">
              {running ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Démarrer</>}
            </button>
            <button onClick={reset} className="btn-secondary !px-4 !py-3"><RotateCcw size={18} /></button>
          </div>

          <div className="flex gap-2 mt-6 flex-wrap justify-center">
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => changePreset(p)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition
                  ${preset.label === p.label ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                {p.label} {!p.custom && `· ${p.focus}/${p.break}`}
              </button>
            ))}
          </div>

          {preset.custom && (
            <div className="flex gap-3 mt-4 w-full max-w-sm">
              <div className="flex-1">
                <label className="label">Concentration (min)</label>
                <input type="number" min="1" className="input" value={customFocus}
                  onChange={e => {
                    const v = Math.max(1, +e.target.value || 1)
                    setCustomFocus(v)
                    if (mode === 'focus') setRemaining(v * 60)
                  }} />
              </div>
              <div className="flex-1">
                <label className="label">Pause (min)</label>
                <input type="number" min="1" className="input" value={customBreak}
                  onChange={e => {
                    const v = Math.max(1, +e.target.value || 1)
                    setCustomBreak(v)
                    if (mode === 'break') setRemaining(v * 60)
                  }} />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold font-display mb-3">Associer cette session</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Matière</label>
                <select className="input" value={subjectId} onChange={e => { setSubjectId(e.target.value); setChapterId(''); setLessonId('') }}>
                  <option value="">— Aucune —</option>
                  {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Chapitre</label>
                <select className="input" disabled={!activeSubject} value={chapterId} onChange={e => { setChapterId(e.target.value); setLessonId('') }}>
                  <option value="">— Aucun —</option>
                  {activeSubject?.chapters?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Leçon</label>
                <select className="input" disabled={!activeChapter} value={lessonId} onChange={e => setLessonId(e.target.value)}>
                  <option value="">— Aucune —</option>
                  {activeChapter?.lessons?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Aujourd'hui</div>
            <div className="text-2xl font-bold font-display">{fmtMs(todaySessions)}</div>
            <div className="text-xs text-slate-500 mt-1">
              {state.sessions.filter(s => s.date.slice(0, 10) === todayKey()).length} session
              {state.sessions.filter(s => s.date.slice(0, 10) === todayKey()).length === 1 ? '' : 's'} aujourd'hui
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}