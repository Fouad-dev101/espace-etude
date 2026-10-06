import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { uid } from '../utils/id'
import { subjectProgress, chapterProgress, lessonProgress } from '../utils/progress'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import ProgressBar from '../components/ProgressBar'
import ProgressRing from '../components/ProgressRing'
import EmptyState from '../components/EmptyState'
import StudyMap from '../components/StudyMap'
import { Plus, Folder, Pencil, Trash2, ArrowLeft, ChevronRight, Map, List } from 'lucide-react'

export default function SubjectDetail() {
  const { subjectId } = useParams()
  const nav = useNavigate()
  const { state, dispatch, toast } = useApp()
  const subject = state.subjects.find(s => s.id === subjectId)

  const [view, setView] = useState('list')
  const [chapterModal, setChapterModal] = useState(null)
  const [chapterForm, setChapterForm] = useState({ name: '' })
  const [lessonModal, setLessonModal] = useState(null)
  const [lessonForm, setLessonForm] = useState({ name: '', description: '' })
  const [confirm, setConfirm] = useState(null)

  if (!subject) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-3xl mx-auto">
        <button onClick={() => nav('/subjects')} className="btn-ghost mb-4"><ArrowLeft size={16} /> Retour</button>
        <div className="card p-8 text-center text-slate-400">Matière introuvable</div>
      </div>
    )
  }

  const prog = subjectProgress(subject)

  const saveChapter = () => {
    if (!chapterForm.name.trim()) return
    if (chapterModal.mode === 'add') {
      dispatch({ type: 'ADD_CHAPTER', subjectId, chapter: { id: uid(), name: chapterForm.name.trim(), lessons: [] } })
      toast('Chapitre ajouté ✓')
    } else {
      dispatch({ type: 'UPDATE_CHAPTER', subjectId, chapterId: chapterModal.chapter.id, patch: { name: chapterForm.name.trim() } })
      toast('Chapitre mis à jour ✓')
    }
    setChapterModal(null)
  }

  const saveLesson = () => {
    if (!lessonForm.name.trim()) return
    const ch = lessonModal.chapterId
    if (lessonModal.mode === 'edit') {
      dispatch({ type: 'UPDATE_LESSON', subjectId, chapterId: ch, lessonId: lessonModal.lesson.id, patch: { name: lessonForm.name.trim(), description: lessonForm.description } })
      toast('Leçon mise à jour ✓')
    } else {
      dispatch({ type: 'ADD_LESSON', subjectId, chapterId: ch, lesson: {
        id: uid(), name: lessonForm.name.trim(), description: lessonForm.description,
        sections: [], mastery: null, completed: false,
      }})
      toast('Leçon ajoutée ✓')
    }
    setLessonModal(null)
  }

  const deleteChapter = (chapter) => {
    dispatch({ type: 'DELETE_CHAPTER', subjectId, chapterId: chapter.id })
    toast('Chapitre supprimé')
  }
  const deleteLesson = (chapter, lesson) => {
    dispatch({ type: 'DELETE_LESSON', subjectId, chapterId: chapter.id, lessonId: lesson.id })
    toast('Leçon supprimée')
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-6xl mx-auto">
      <button onClick={() => nav('/subjects')} className="btn-ghost -ml-3 mb-4">
        <ArrowLeft size={16} /> Toutes les matières
      </button>

      <div className="card p-5 md:p-6 mb-6">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: `${subject.color}20` }}>
            {subject.icon || '📖'}
          </div>
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">{subject.name}</h1>
            {subject.description && <p className="text-sm text-slate-500 mt-1">{subject.description}</p>}
          </div>
          <ProgressRing value={prog} size={90} stroke={8} color={subject.color}>
            <div className="text-center">
              <div className="text-base font-bold font-display">{prog}%</div>
            </div>
          </ProgressRing>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${view === 'list' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'}`}>
            <List size={14} /> Liste
          </button>
          <button onClick={() => setView('map')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition ${view === 'map' ? 'bg-white dark:bg-slate-900 shadow-sm' : 'text-slate-500'}`}>
            <Map size={14} /> Plan d'étude
          </button>
        </div>
        <div className="flex-1" />
        <button onClick={() => { setChapterForm({ name: '' }); setChapterModal({ mode: 'add' }) }} className="btn-primary">
          <Plus size={16} /> Ajouter un chapitre
        </button>
      </div>

      {view === 'map' ? (
        <StudyMap subject={subject} />
      ) : (subject.chapters || []).length === 0 ? (
        <EmptyState
          icon={Folder}
          title="Aucun chapitre"
          description="Découpe cette matière en chapitres pour organiser tes leçons."
          action={<button onClick={() => { setChapterForm({ name: '' }); setChapterModal({ mode: 'add' }) }} className="btn-primary"><Plus size={16} /> Ajouter un chapitre</button>}
        />
      ) : (
        <div className="space-y-4">
          {subject.chapters.map(chapter => {
            const cprog = chapterProgress(chapter)
            return (
              <div key={chapter.id} className="card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                    <Folder size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold font-display truncate">{chapter.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <ProgressBar value={cprog} size="sm" />
                      <span className="text-xs text-slate-500 shrink-0">{cprog}%</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => { setChapterForm({ name: chapter.name }); setChapterModal({ mode: 'edit', chapter }) }} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => setConfirm({ type: 'chapter', chapter })} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 mb-3">
                  {(chapter.lessons || []).map(lesson => {
                    const lprog = lessonProgress(lesson)
                    const masteryDot = lesson.mastery === 'good' ? 'bg-emerald-500' : lesson.mastery === 'review' ? 'bg-amber-500' : lesson.mastery === 'bad' ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
                    return (
                      <div key={lesson.id} className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${masteryDot}`} />
                        <button onClick={() => nav(`/subjects/${subjectId}/chapters/${chapter.id}/lessons/${lesson.id}`)} className="flex-1 text-left min-w-0">
                          <div className="text-sm font-medium truncate">{lesson.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <ProgressBar value={lprog} size="sm" />
                            <span className="text-[10px] text-slate-500 shrink-0">{lprog}%</span>
                          </div>
                        </button>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
                          <button onClick={() => { setLessonForm({ name: lesson.name, description: lesson.description || '' }); setLessonModal({ mode: 'edit', chapterId: chapter.id, lesson }) }} className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setConfirm({ type: 'lesson', chapter, lesson })} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg">
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <ChevronRight size={14} className="text-slate-300" />
                      </div>
                    )
                  })}
                </div>

                <button onClick={() => { setLessonForm({ name: '', description: '' }); setLessonModal({ chapterId: chapter.id, mode: 'add' }) }} className="btn-ghost text-xs">
                  <Plus size={14} /> Ajouter une leçon
                </button>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!chapterModal}
        onClose={() => setChapterModal(null)}
        title={chapterModal?.mode === 'add' ? 'Ajouter un chapitre' : 'Modifier le chapitre'}
        size="sm"
        footer={
          <>
            <button onClick={() => setChapterModal(null)} className="btn-secondary">Annuler</button>
            <button onClick={saveChapter} disabled={!chapterForm.name.trim()} className="btn-primary">
              {chapterModal?.mode === 'add' ? 'Ajouter' : 'Enregistrer'}
            </button>
          </>
        }
      >
        <label className="label">Nom du chapitre</label>
        <input autoFocus className="input" value={chapterForm.name} onChange={e => setChapterForm({ name: e.target.value })} placeholder="ex : Algèbre" onKeyDown={e => e.key === 'Enter' && saveChapter()} />
      </Modal>

      <Modal
        open={!!lessonModal}
        onClose={() => setLessonModal(null)}
        title={lessonModal?.mode === 'edit' ? 'Modifier la leçon' : 'Ajouter une leçon'}
        footer={
          <>
            <button onClick={() => setLessonModal(null)} className="btn-secondary">Annuler</button>
            <button onClick={saveLesson} disabled={!lessonForm.name.trim()} className="btn-primary">
              {lessonModal?.mode === 'edit' ? 'Enregistrer' : 'Ajouter'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">Nom de la leçon</label>
            <input autoFocus className="input" value={lessonForm.name} onChange={e => setLessonForm({ ...lessonForm, name: e.target.value })} placeholder="ex : Équations" />
          </div>
          <div>
            <label className="label">Description (optionnel)</label>
            <input className="input" value={lessonForm.description} onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })} placeholder="Courte description" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm.type === 'chapter') deleteChapter(confirm.chapter)
          else deleteLesson(confirm.chapter, confirm.lesson)
        }}
        title={`Supprimer ${confirm?.type === 'chapter' ? 'le chapitre' : 'la leçon'} ?`}
        message={confirm?.type === 'chapter'
          ? `« ${confirm.chapter.name} » et toutes ses leçons seront supprimés.`
          : `« ${confirm?.lesson?.name} » sera supprimée.`}
        confirmLabel="Supprimer"
      />
    </div>
  )
}