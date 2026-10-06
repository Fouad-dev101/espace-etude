import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { uid, todayKey } from '../utils/id'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { Plus, Calendar as CalendarIcon, Trash2, Pencil, AlertCircle, ClipboardList } from 'lucide-react'

const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const startOfWeek = (d) => {
  const dt = new Date(d)
  const day = dt.getDay() || 7
  dt.setDate(dt.getDate() - (day - 1))
  dt.setHours(0, 0, 0, 0)
  return dt
}

export default function Planner() {
  const { state, dispatch, toast } = useApp()
  const [tab, setTab] = useState('today')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ title: '', subjectId: '', date: todayKey(), type: 'exam', notes: '' })
  const [confirm, setConfirm] = useState(null)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tKey = dayKey(today)
  const weekStart = startOfWeek(today)
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7)

  const sorted = useMemo(() => [...state.exams].sort((a, b) => new Date(a.date) - new Date(b.date)), [state.exams])

  const todayItems = sorted.filter(e => e.date === tKey)
  const weekItems = sorted.filter(e => {
    const d = new Date(e.date)
    return d >= weekStart && d < weekEnd && e.date !== tKey
  })
  const upcomingItems = sorted.filter(e => new Date(e.date) > weekEnd)

  const openAdd = () => {
    setForm({ title: '', subjectId: '', date: todayKey(), type: 'exam', notes: '' })
    setModal({ mode: 'add' })
  }

  const openEdit = (e) => {
    setForm({ title: e.title, subjectId: e.subjectId || '', date: e.date, type: e.type || 'exam', notes: e.notes || '' })
    setModal({ mode: 'edit', exam: e })
  }

  const save = () => {
    if (!form.title.trim() || !form.date) return toast('Titre et date requis', 'error')
    if (modal.mode === 'add') {
      dispatch({ type: 'ADD_EXAM', exam: { id: uid(), ...form, title: form.title.trim() } })
      toast('Ajouté au planning ✓')
    } else {
      dispatch({ type: 'UPDATE_EXAM', id: modal.exam.id, patch: { ...form, title: form.title.trim() } })
      toast('Mis à jour ✓')
    }
    setModal(null)
  }

  const remove = (e) => {
    dispatch({ type: 'DELETE_EXAM', id: e.id })
    toast('Retiré du planning')
  }

  const fmtDate = (d) => new Date(d).toLocaleDateString('fr', { weekday: 'long', day: 'numeric', month: 'long' })

  const renderGroup = (title, items) => (
    <div className="card p-5">
      <h3 className="text-sm font-semibold font-display mb-3">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 py-2">Rien de planifié.</p>
      ) : (
        <div className="space-y-2">
          {items.map(e => {
            const s = state.subjects.find(x => x.id === e.subjectId)
            const days = Math.ceil((new Date(e.date) - today) / 86400000)
            const urgent = days <= 2 && days >= 0
            return (
              <div key={e.id} className="group flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition">
                <div className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center shrink-0 ${urgent ? 'bg-red-50 text-red-600 dark:bg-red-500/10' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  <div className="text-[9px] uppercase font-semibold">{new Date(e.date).toLocaleString('fr', { month: 'short' })}</div>
                  <div className="text-sm font-bold -mt-0.5">{new Date(e.date).getDate()}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate flex items-center gap-2">
                    {e.type === 'exam' && <AlertCircle size={13} className="text-rose-500" />}
                    {e.type === 'assignment' && <ClipboardList size={13} className="text-amber-500" />}
                    {e.title}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {s?.name || 'Général'} · {days === 0 ? "Aujourd'hui" : days > 0 ? `Dans ${days} jour${days === 1 ? '' : 's'}` : `Il y a ${-days} j`}
                  </div>
                  {e.notes && <div className="text-xs text-slate-500 mt-1 line-clamp-1">{e.notes}</div>}
                </div>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => openEdit(e)} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirm(e)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Planning</h1>
          <p className="text-sm text-slate-500 mt-1">Épreuves, devoirs et échéances</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Ajouter</button>
      </div>

      {state.exams.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="Ton planning est vide"
          description="Ajoute tes épreuves, devoirs et échéances pour ne rien oublier."
          action={<button onClick={openAdd} className="btn-primary"><Plus size={16} /> Ajouter ton premier élément</button>}
        />
      ) : (
        <>
          <div className="flex gap-2 mb-5">
            {[
              { id: 'today', label: "Aujourd'hui", count: todayItems.length },
              { id: 'week', label: 'Cette semaine', count: weekItems.length },
              { id: 'upcoming', label: 'À venir', count: upcomingItems.length },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition
                  ${tab === t.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'}`}>
                {t.label}
                <span className="ml-2 text-xs opacity-60">{t.count}</span>
              </button>
            ))}
          </div>

          {tab === 'today' && renderGroup(fmtDate(today), todayItems)}
          {tab === 'week' && renderGroup('Le reste de la semaine', weekItems)}
          {tab === 'upcoming' && renderGroup('À venir', upcomingItems)}
        </>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Modifier' : 'Ajouter au planning'}
        footer={<>
          <button onClick={() => setModal(null)} className="btn-secondary">Annuler</button>
          <button onClick={save} disabled={!form.title.trim() || !form.date} className="btn-primary">
            {modal?.mode === 'edit' ? 'Enregistrer' : 'Ajouter'}
          </button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="label">Titre</label>
            <input autoFocus className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="ex : Épreuve de Mathématiques" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="exam">Épreuve</option>
                <option value="assignment">Devoir</option>
                <option value="deadline">Échéance</option>
                <option value="study">Session d'étude</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Matière (optionnel)</label>
            <select className="input" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}>
              <option value="">Général</option>
              {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Notes (optionnel)</label>
            <textarea rows={3} className="input resize-none" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Détails supplémentaires..." />
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)} title="Retirer du planning ?"
        message={`Supprimer « ${confirm?.title} » de ton planning ?`} confirmLabel="Supprimer" />
    </div>
  )
}