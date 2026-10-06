import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { uid, todayKey } from '../utils/id'
import { lessonProgress } from '../utils/progress'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import { RefreshCw, Plus, ChevronRight, AlertCircle, Clock, CheckCircle2, Trash2 } from 'lucide-react'

export default function Reviews() {
  const { state, dispatch, toast } = useApp()
  const nav = useNavigate()
  const [tab, setTab] = useState('bad')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ subjectId: '', chapterId: '', lessonId: '', date: todayKey() })

  const buckets = useMemo(() => {
    const bad = [], review = [], good = []
    state.subjects.forEach(s => {
      s.chapters?.forEach(c => {
        c.lessons?.forEach(l => {
          if (l.mastery === 'bad') bad.push({ s, c, l })
          else if (l.mastery === 'review') review.push({ s, c, l })
          else if (l.mastery === 'good') good.push({ s, c, l })
        })
      })
    })
    return { bad, review, good }
  }, [state.subjects])

  const manualReviews = useMemo(() => {
    return [...state.reviews]
      .map(r => {
        const s = state.subjects.find(x => x.id === r.subjectId)
        const c = s?.chapters?.find(x => x.id === r.chapterId)
        const l = c?.lessons?.find(x => x.id === r.lessonId)
        return s && c && l ? { ...r, s, c, l } : null
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [state.reviews, state.subjects])

  const addManual = () => {
    if (!form.subjectId || !form.chapterId || !form.lessonId || !form.date) return
    dispatch({ type: 'ADD_REVIEW', review: { id: uid(), ...form } })
    toast('Révision planifiée ✓')
    setModal(false)
    setForm({ subjectId: '', chapterId: '', lessonId: '', date: todayKey() })
  }

  const activeSubject = state.subjects.find(s => s.id === form.subjectId)
  const activeChapter = activeSubject?.chapters?.find(c => c.id === form.chapterId)
  const cur = buckets[tab]

  const TABS = [
    { id: 'bad', label: 'À revoir en priorité', count: buckets.bad.length, color: 'red', icon: AlertCircle },
    { id: 'review', label: 'À réviser bientôt', count: buckets.review.length, color: 'amber', icon: Clock },
    { id: 'good', label: 'Maîtrisé', count: buckets.good.length, color: 'emerald', icon: CheckCircle2 },
  ]

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Révisions</h1>
          <p className="text-sm text-slate-500 mt-1">Renforce tes points faibles</p>
        </div>
        <button onClick={() => setModal(true)} className="btn-primary"><Plus size={16} /> Planifier une révision</button>
      </div>

      {manualReviews.length > 0 && (
        <div className="card p-5 mb-6">
          <h2 className="text-sm font-semibold font-display mb-3 flex items-center gap-2">
            <Clock size={16} className="text-indigo-500" /> Planifiées
          </h2>
          <div className="space-y-1.5">
            {manualReviews.map(r => {
              const overdue = new Date(r.date) <= new Date()
              return (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition group">
                  <div className={`w-2 h-2 rounded-full ${overdue ? 'bg-red-500' : 'bg-indigo-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.s.name} → {r.c.name} → {r.l.name}</div>
                    <div className="text-xs text-slate-400">
                      {new Date(r.date).toLocaleDateString('fr', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {overdue && <span className="ml-1 text-red-500">· À faire maintenant</span>}
                    </div>
                  </div>
                  <button onClick={() => nav(`/subjects/${r.s.id}/chapters/${r.c.id}/lessons/${r.l.id}`)} className="btn-ghost text-xs">
                    Réviser <ChevronRight size={13} />
                  </button>
                  <button onClick={() => dispatch({ type: 'DELETE_REVIEW', id: r.id })} className="p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-5 overflow-x-auto scroll-thin">
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition
                ${active
                  ? t.color === 'red' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400'
                  : t.color === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}>
              <Icon size={15} />
              {t.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/60 dark:bg-black/30' : 'bg-slate-100 dark:bg-slate-800'}`}>{t.count}</span>
            </button>
          )
        })}
      </div>

      {cur.length === 0 ? (
        <EmptyState
          icon={tab === 'good' ? CheckCircle2 : RefreshCw}
          title={tab === 'bad' ? 'Rien à revoir en priorité 🎉' : tab === 'review' ? 'Rien à réviser pour le moment' : 'Aucune leçon maîtrisée pour l\'instant'}
          description={tab === 'bad' ? "Tu es à jour." : tab === 'review' ? 'Continue à parcourir tes leçons.' : 'Marque des leçons comme comprises pour les voir ici.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cur.map(({ s, c, l }) => {
            const prog = lessonProgress(l)
            return (
              <div key={l.id} className="card p-4 flex items-center gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${s.color}20` }}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-slate-400 truncate">{s.name} → {c.name}</div>
                  <div className="text-sm font-semibold truncate">{l.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{prog}% terminé</div>
                </div>
                <button onClick={() => nav(`/subjects/${s.id}/chapters/${c.id}/lessons/${l.id}`)} className="btn-secondary text-xs shrink-0">
                  Réviser <ChevronRight size={13} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Planifier une révision"
        footer={<>
          <button onClick={() => setModal(false)} className="btn-secondary">Annuler</button>
          <button onClick={addManual} disabled={!form.lessonId} className="btn-primary">Planifier</button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="label">Matière</label>
            <select className="input" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value, chapterId: '', lessonId: '' })}>
              <option value="">Sélectionner...</option>
              {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Chapitre</label>
            <select className="input" disabled={!activeSubject} value={form.chapterId} onChange={e => setForm({ ...form, chapterId: e.target.value, lessonId: '' })}>
              <option value="">Sélectionner...</option>
              {activeSubject?.chapters?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Leçon</label>
            <select className="input" disabled={!activeChapter} value={form.lessonId} onChange={e => setForm({ ...form, lessonId: e.target.value })}>
              <option value="">Sélectionner...</option>
              {activeChapter?.lessons?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
      </Modal>
    </div>
  )
}