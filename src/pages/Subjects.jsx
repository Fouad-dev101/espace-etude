import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { subjectProgress, countLessons, subjectMastery } from '../utils/progress'
import { uid } from '../utils/id'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import ProgressBar from '../components/ProgressBar'
import { Plus, BookOpen, Pencil, Trash2, ChevronRight, Search } from 'lucide-react'

const ICONS = ['📐', '🔬', '🧪', '📖', '🌍', '💻', '🎨', '🎵', '📊', '⚗️', '🧬', '🗣️', '🏛️', '📚', '🕌', '⚖️', '🧠', '🇫🇷', '🇬🇧', '🕋']
const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#0ea5e9']

export default function Subjects() {
  const { state, dispatch, toast } = useApp()
  const nav = useNavigate()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({ name: '', icon: '📖', color: COLORS[0], description: '' })
  const [confirm, setConfirm] = useState(null)
  const [q, setQ] = useState('')

  const openAdd = () => {
    setForm({ name: '', icon: '📖', color: COLORS[Math.floor(Math.random() * COLORS.length)], description: '' })
    setModal({ mode: 'add' })
  }
  const openEdit = (subject) => {
    setForm({ name: subject.name, icon: subject.icon || '📖', color: subject.color || COLORS[0], description: subject.description || '' })
    setModal({ mode: 'edit', subject })
  }

  const save = () => {
    if (!form.name.trim()) return
    if (modal.mode === 'add') {
      dispatch({ type: 'ADD_SUBJECT', subject: { id: uid(), ...form, name: form.name.trim(), chapters: [] } })
      toast('Matière créée ✓')
    } else {
      dispatch({ type: 'UPDATE_SUBJECT', id: modal.subject.id, patch: { ...form, name: form.name.trim() } })
      toast('Matière mise à jour ✓')
    }
    setModal(null)
  }

  const remove = (subject) => {
    dispatch({ type: 'DELETE_SUBJECT', id: subject.id })
    toast('Matière supprimée')
  }

  const filtered = state.subjects.filter(s =>
    !q || s.name.toLowerCase().includes(q.toLowerCase()) || (s.description || '').toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Matières</h1>
          <p className="text-sm text-slate-500 mt-1">
            {state.subjects.length} matière{state.subjects.length === 1 ? '' : 's'} dans ton espace
          </p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Ajouter une matière</button>
      </div>

      {state.subjects.length > 3 && (
        <div className="relative mb-5 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder="Rechercher une matière..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
      )}

      {state.subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Tu n'as encore aucune matière"
          description="Ajoute ta première matière pour commencer à organiser tes études."
          action={<button onClick={openAdd} className="btn-primary"><Plus size={16} /> Ajouter ta première matière</button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Aucun résultat" description="Essaie un autre terme de recherche." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => {
            const prog = subjectProgress(s)
            const lessons = countLessons([s])
            const master = subjectMastery(s)
            return (
              <div key={s.id} className="card p-5 hover:shadow-card-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all group">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${s.color}20` }}>
                    {s.icon || '📖'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold font-display truncate">{s.name}</h3>
                    <p className="text-xs text-slate-500 truncate">
                      {s.description || `${lessons} leçon${lessons === 1 ? '' : 's'}`}
                    </p>
                  </div>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirm(s)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Progression</span>
                    <span className="font-semibold">{prog}%</span>
                  </div>
                  <ProgressBar value={prog} />
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>📖 {lessons} leçons</span>
                    <span>🧠 {master}% maîtrise</span>
                  </div>
                </div>

                <button onClick={() => nav(`/subjects/${s.id}`)} className="btn-secondary w-full justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Ouvrir <ChevronRight size={14} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'Ajouter une matière' : 'Modifier la matière'}
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Annuler</button>
            <button onClick={save} disabled={!form.name.trim()} className="btn-primary">
              {modal?.mode === 'add' ? 'Créer' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Nom de la matière</label>
            <input autoFocus className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ex : Mathématiques" />
          </div>
          <div>
            <label className="label">Description (optionnel)</label>
            <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Une courte description" />
          </div>
          <div>
            <label className="label">Icône</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(ic => (
                <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                  className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition
                    ${form.icon === ic ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Couleur</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })}
                  className={`w-8 h-8 rounded-full transition ${form.color === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-slate-400' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => remove(confirm)}
        title="Supprimer la matière ?"
        message={`Supprimer « ${confirm?.name} » ? Tous les chapitres et leçons seront définitivement supprimés. Cette action est irréversible.`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}