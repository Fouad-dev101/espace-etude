import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { uid } from '../utils/id'
import { lessonProgress, masteryScore } from '../utils/progress'
import ProgressBar from '../components/ProgressBar'
import ProgressRing from '../components/ProgressRing'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { Plus, ArrowLeft, Pencil, Trash2, Check, Circle, PlayCircle, Lightbulb } from 'lucide-react'

const MASTERY = [
  { id: 'good', label: 'Je comprends', color: 'emerald', emoji: '🟢' },
  { id: 'review', label: 'Je dois réviser', color: 'amber', emoji: '🟡' },
  { id: 'bad', label: 'Je ne comprends pas', color: 'red', emoji: '🔴' },
]

export default function LessonDetail() {
  const { subjectId, chapterId, lessonId } = useParams()
  const nav = useNavigate()
  const { state, dispatch, toast } = useApp()

  const subject = state.subjects.find(s => s.id === subjectId)
  const chapter = subject?.chapters?.find(c => c.id === chapterId)
  const lesson = chapter?.lessons?.find(l => l.id === lessonId)

  const [sectionModal, setSectionModal] = useState(null)
  const [sectionForm, setSectionForm] = useState({ name: '' })
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    if (subject && chapter && lesson) {
      dispatch({ type: 'SET_LAST_LESSON', payload: { subjectId, chapterId, lessonId } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, chapterId, lessonId])

  if (!subject || !chapter || !lesson) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">
        <button onClick={() => nav('/subjects')} className="btn-ghost mb-4"><ArrowLeft size={16} /> Retour</button>
        <div className="card p-8 text-center text-slate-400">Leçon introuvable</div>
      </div>
    )
  }

  const prog = lessonProgress(lesson)
  const mastery = masteryScore(lesson)
  const sections = lesson.sections || []

  const updateSection = (sectionId, patch) => {
    dispatch({ type: 'UPDATE_SECTION', subjectId, chapterId, lessonId, sectionId, patch })
  }

  const cycleStatus = (section) => {
    const next = section.status === 'done' ? 'todo' : section.status === 'doing' ? 'done' : 'doing'
    updateSection(section.id, { status: next })
    if (next === 'done') toast('Section terminée ✓')
  }

  const addSection = () => {
    if (!sectionForm.name.trim()) return
    if (sectionModal.mode === 'edit') {
      dispatch({ type: 'UPDATE_SECTION', subjectId, chapterId, lessonId, sectionId: sectionModal.section.id, patch: { name: sectionForm.name.trim() } })
    } else {
      dispatch({ type: 'ADD_SECTION', subjectId, chapterId, lessonId, section: { id: uid(), name: sectionForm.name.trim(), status: 'todo' } })
    }
    setSectionModal(null)
    setSectionForm({ name: '' })
  }

  const setMastery = (m) => {
    dispatch({ type: 'UPDATE_LESSON', subjectId, chapterId, lessonId, patch: { mastery: lesson.mastery === m ? null : m } })
    toast('Niveau de maîtrise mis à jour ✓')
  }

  const markLessonDone = () => {
    const allDone = sections.every(s => s.status === 'done')
    const newStatus = allDone ? 'todo' : 'done'
    sections.forEach(s =>
      dispatch({ type: 'UPDATE_SECTION', subjectId, chapterId, lessonId, sectionId: s.id, patch: { status: newStatus } })
    )
    if (newStatus === 'done') toast('Leçon terminée ✓')
  }

  const hasSections = sections.length > 0
  const allDone = hasSections && sections.every(s => s.status === 'done')

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <button onClick={() => nav(`/subjects/${subjectId}`)} className="btn-ghost -ml-3 mb-4">
        <ArrowLeft size={16} /> {subject.name}
      </button>

      <div className="text-xs text-slate-400 mb-2">{subject.name} → {chapter.name}</div>

      <div className="card p-5 md:p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <h1 className="text-2xl font-bold font-display tracking-tight">{lesson.name}</h1>
            {lesson.description && <p className="text-sm text-slate-500 mt-1">{lesson.description}</p>}

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-500">Progression</span>
                <span className="font-semibold">{prog}%</span>
              </div>
              <ProgressBar value={prog} />
            </div>

            {hasSections && (
              <button onClick={markLessonDone} className={`btn-ghost text-xs mt-3 ${allDone ? 'text-slate-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                <Check size={13} /> {allDone ? 'Tout marquer comme non commencé' : 'Tout marquer comme terminé'}
              </button>
            )}
          </div>

          <ProgressRing value={mastery} size={90} stroke={8} color="#10b981">
            <div className="text-center">
              <div className="text-base font-bold font-display">{mastery}%</div>
              <div className="text-[9px] text-slate-400 uppercase tracking-wide">Maîtrise</div>
            </div>
          </ProgressRing>
        </div>
      </div>

      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={16} className="text-amber-500" />
          <h2 className="text-sm font-semibold font-display">À quel point comprends-tu cette leçon ?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {MASTERY.map(m => {
            const active = lesson.mastery === m.id
            return (
              <button
                key={m.id}
                onClick={() => setMastery(m.id)}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition text-left
                  ${active
                    ? m.color === 'emerald'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/40 dark:text-emerald-300'
                      : m.color === 'amber'
                      ? 'bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/40 dark:text-amber-300'
                      : 'bg-red-50 border-red-300 text-red-700 dark:bg-red-500/10 dark:border-red-500/40 dark:text-red-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
              >
                <span className="text-base">{m.emoji}</span>
                <span className="flex-1 text-xs sm:text-sm">{m.label}</span>
                {active && <Check size={14} />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold font-display">Sections et sous-thèmes</h2>
          <button onClick={() => { setSectionForm({ name: '' }); setSectionModal({ mode: 'add' }) }} className="btn-ghost text-xs">
            <Plus size={14} /> Ajouter une section
          </button>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            <div className="mb-3">Découpe cette leçon en sections</div>
            <button onClick={() => { setSectionForm({ name: '' }); setSectionModal({ mode: 'add' }) }} className="btn-primary">
              <Plus size={14} /> Ajouter ta première section
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {sections.map(s => {
              const Icon = s.status === 'done' ? Check : s.status === 'doing' ? PlayCircle : Circle
              const cls = s.status === 'done' ? 'text-emerald-500' : s.status === 'doing' ? 'text-indigo-500' : 'text-slate-300 dark:text-slate-600'
              return (
                <div key={s.id} className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <button onClick={() => cycleStatus(s)} className={`shrink-0 ${cls}`}>
                    <Icon size={20} />
                  </button>
                  <button onClick={() => cycleStatus(s)} className={`flex-1 text-left text-sm ${s.status === 'done' ? 'line-through text-slate-400' : ''}`}>
                    {s.name}
                  </button>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => { setSectionForm({ name: s.name }); setSectionModal({ mode: 'edit', section: s }) }} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setConfirm(s)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal
        open={!!sectionModal}
        onClose={() => setSectionModal(null)}
        title={sectionModal?.mode === 'edit' ? 'Modifier la section' : 'Ajouter une section'}
        size="sm"
        footer={
          <>
            <button onClick={() => setSectionModal(null)} className="btn-secondary">Annuler</button>
            <button onClick={addSection} disabled={!sectionForm.name.trim()} className="btn-primary">
              {sectionModal?.mode === 'edit' ? 'Enregistrer' : 'Ajouter'}
            </button>
          </>
        }
      >
        <label className="label">Nom de la section</label>
        <input autoFocus className="input" value={sectionForm.name} onChange={e => setSectionForm({ name: e.target.value })} placeholder="ex : Définition" onKeyDown={e => e.key === 'Enter' && addSection()} />
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => dispatch({ type: 'DELETE_SECTION', subjectId, chapterId, lessonId, sectionId: confirm.id })}
        title="Supprimer la section ?"
        message={`Supprimer « ${confirm?.name} » ?`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}