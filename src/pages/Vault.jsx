import { useMemo, useState } from 'react'
import { useApp } from '../context/AppContext'
import { uid } from '../utils/id'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyState from '../components/EmptyState'
import { Plus, Search, FileText, Ruler, Calculator, Lightbulb, Star, BookOpen, Pencil, Trash2 } from 'lucide-react'

const TYPES = [
  { id: 'note', label: 'Note', icon: FileText },
  { id: 'rule', label: 'Règle', icon: Ruler },
  { id: 'formula', label: 'Formule', icon: Calculator },
  { id: 'concept', label: 'Concept', icon: Lightbulb },
  { id: 'important', label: 'Important', icon: Star },
]

const typeMeta = (t) => TYPES.find(x => x.id === t) || TYPES[0]

export default function Vault() {
  const { state, dispatch, toast } = useApp()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({
    title: '', content: '', type: 'note',
    subjectId: '', chapterId: '', lessonId: '',
    tags: '', favorite: false,
  })
  const [q, setQ] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterSubject, setFilterSubject] = useState('all')
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const openAdd = () => {
    setForm({ title: '', content: '', type: 'note', subjectId: '', chapterId: '', lessonId: '', tags: '', favorite: false })
    setModal({ mode: 'add' })
  }

  const openEdit = (note) => {
    setForm({
      title: note.title, content: note.content, type: note.type,
      subjectId: note.subjectId || '', chapterId: note.chapterId || '', lessonId: note.lessonId || '',
      tags: (note.tags || []).join(', '), favorite: !!note.favorite,
    })
    setModal({ mode: 'edit', note })
  }

  const save = () => {
    if (!form.title.trim()) return toast('Le titre est requis', 'error')
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    if (modal.mode === 'add') {
      dispatch({ type: 'ADD_NOTE', note: {
        id: uid(), ...form, title: form.title.trim(), content: form.content.trim(),
        tags, created: new Date().toISOString(), updated: new Date().toISOString(),
      }})
      toast('Fiche enregistrée ✓')
    } else {
      dispatch({ type: 'UPDATE_NOTE', id: modal.note.id, patch: { ...form, title: form.title.trim(), content: form.content.trim(), tags } })
      toast('Fiche mise à jour ✓')
    }
    setModal(null)
  }

  const filtered = useMemo(() => {
    return state.notes.filter(n => {
      if (filterType !== 'all' && n.type !== filterType) return false
      if (filterSubject !== 'all' && n.subjectId !== filterSubject) return false
      if (onlyFavorites && !n.favorite) return false
      if (q) {
        const s = (n.title + ' ' + n.content + ' ' + (n.tags || []).join(' ')).toLowerCase()
        if (!s.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [state.notes, q, filterType, filterSubject, onlyFavorites])

  const activeSubject = form.subjectId ? state.subjects.find(s => s.id === form.subjectId) : null
  const activeChapter = activeSubject?.chapters?.find(c => c.id === form.chapterId)

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Bibliothèque</h1>
          <p className="text-sm text-slate-500 mt-1">Notes, règles, formules et concepts importants</p>
        </div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Nouvelle fiche</button>
      </div>

      {state.notes.length > 0 && (
        <div className="card p-4 mb-5">
          <div className="flex gap-2 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="input pl-10" placeholder="Rechercher dans ta bibliothèque..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <select className="input w-auto" value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">Tous les types</option>
              {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <select className="input w-auto" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="all">Toutes les matières</option>
              {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={() => setOnlyFavorites(!onlyFavorites)} className={`btn ${onlyFavorites ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'btn-secondary'}`}>
              <Star size={14} fill={onlyFavorites ? 'currentColor' : 'none'} /> Favoris
            </button>
          </div>
        </div>
      )}

      {state.notes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Ta bibliothèque est vide"
          description="Enregistre ici tes notes, règles, formules et concepts importants. Tu les auras toujours sous la main."
          action={<button onClick={openAdd} className="btn-primary"><Plus size={16} /> Créer ta première fiche</button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="Aucun résultat" description="Ajuste tes filtres ou ta recherche." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(n => {
            const t = typeMeta(n.type)
            const subject = state.subjects.find(s => s.id === n.subjectId)
            const Icon = t.icon
            return (
              <div key={n.id} className="card p-4 flex flex-col group hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      <Icon size={14} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t.label}</span>
                  </div>
                  {n.favorite && <Star size={14} className="text-amber-500" fill="currentColor" />}
                </div>

                <h3 className="font-semibold font-display mb-1.5 line-clamp-2">{n.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-4 whitespace-pre-wrap flex-1">{n.content || 'Aucun contenu'}</p>

                {n.tags && n.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-3">
                    {n.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">#{tag}</span>
                    ))}
                  </div>
                )}

                {subject && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
                    <span>{subject.icon}</span>
                    <span className="truncate">{subject.name}</span>
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => dispatch({ type: 'UPDATE_NOTE', id: n.id, patch: { favorite: !n.favorite } })}
                    className={`text-xs ${n.favorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}>
                    <Star size={12} fill={n.favorite ? 'currentColor' : 'none'} className="inline mr-1" />
                    {n.favorite ? 'Favori' : 'Ajouter aux favoris'}
                  </button>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(n)} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setConfirm(n)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Modifier la fiche' : 'Nouvelle fiche'}
        size="lg"
        footer={
          <>
            <button onClick={() => setModal(null)} className="btn-secondary">Annuler</button>
            <button onClick={save} disabled={!form.title.trim()} className="btn-primary">
              {modal?.mode === 'edit' ? 'Enregistrer' : 'Créer la fiche'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-5 gap-1.5">
              {TYPES.map(t => {
                const Icon = t.icon
                const active = form.type === t.id
                return (
                  <button key={t.id} onClick={() => setForm({ ...form, type: t.id })}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-medium transition
                      ${active ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/40 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
                    <Icon size={16} />
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="label">Titre</label>
            <input autoFocus className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="ex : Règle du produit" />
          </div>
          <div>
            <label className="label">Contenu</label>
            <textarea className="input resize-none font-mono text-sm" rows={5} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Écris ce que tu veux..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label">Matière (optionnel)</label>
              <select className="input" value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value, chapterId: '', lessonId: '' })}>
                <option value="">— Aucune —</option>
                {state.subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Chapitre (optionnel)</label>
              <select className="input" disabled={!activeSubject} value={form.chapterId} onChange={e => setForm({ ...form, chapterId: e.target.value, lessonId: '' })}>
                <option value="">— Aucun —</option>
                {activeSubject?.chapters?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Leçon (optionnel)</label>
              <select className="input" disabled={!form.chapterId} value={form.lessonId} onChange={e => setForm({ ...form, lessonId: e.target.value })}>
                <option value="">— Aucune —</option>
                {activeChapter?.lessons?.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Étiquettes (séparées par des virgules)</label>
            <input className="input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="ex : examen, important, dérivées" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="rounded" checked={form.favorite} onChange={e => setForm({ ...form, favorite: e.target.checked })} />
            Marquer comme favori
          </label>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => { dispatch({ type: 'DELETE_NOTE', id: confirm.id }); toast('Fiche supprimée') }}
        title="Supprimer la fiche ?"
        message={`Supprimer « ${confirm?.title} » ?`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}