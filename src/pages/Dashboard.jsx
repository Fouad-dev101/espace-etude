import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  overallProgress, countLessons, countCompletedLessons,
  countChapters, countCompletedChapters, lessonProgress,
} from '../utils/progress'
import { todayKey, uid } from '../utils/id'
import StatCard from '../components/StatCard'
import ProgressBar from '../components/ProgressBar'
import ProgressRing from '../components/ProgressRing'
import Modal from '../components/Modal'
import {
  BookOpen, Layers, Clock, Flame, Sparkles, ChevronRight, Plus, Check,
  Calendar as CalendarIcon, Target, Zap, X,
} from 'lucide-react'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function fmtDuration(ms) {
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

export default function Dashboard() {
  const { state, dispatch, toast } = useApp()
  const nav = useNavigate()
  const [goalModal, setGoalModal] = useState(false)
  const [goalText, setGoalText] = useState('')
  const [recModal, setRecModal] = useState(false)

  const overall = overallProgress(state.subjects)
  const lessonsDone = countCompletedLessons(state.subjects)
  const lessonsTotal = countLessons(state.subjects)
  const chaptersDone = countCompletedChapters(state.subjects)
  const chaptersTotal = countChapters(state.subjects)

  const weekMs = useMemo(() => {
    const weekAgo = Date.now() - 7 * 86400000
    return state.sessions
      .filter(s => new Date(s.date).getTime() > weekAgo)
      .reduce((a, s) => a + s.duration, 0)
  }, [state.sessions])

  const today = todayKey()
  const goals = state.goalsByDate[today] || []
  const goalsDone = goals.filter(g => g.done).length

  const lastLesson = useMemo(() => {
    if (!state.lastOpenedLesson) return null
    const { subjectId, chapterId, lessonId } = state.lastOpenedLesson
    const s = state.subjects.find(x => x.id === subjectId)
    if (!s) return null
    const c = s.chapters?.find(x => x.id === chapterId)
    if (!c) return null
    const l = c.lessons?.find(x => x.id === lessonId)
    if (!l) return null
    return { subject: s, chapter: c, lesson: l }
  }, [state.lastOpenedLesson, state.subjects])

  const upcomingExams = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return [...state.exams]
      .filter(e => new Date(e.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4)
  }, [state.exams])

  const recommendation = useMemo(() => {
    const candidates = []
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    state.reviews.forEach(r => {
      if (new Date(r.date) <= now) {
        const s = state.subjects.find(x => x.id === r.subjectId)
        if (!s) return
        const c = s.chapters?.find(x => x.id === r.chapterId)
        if (!c) return
        const l = c.lessons?.find(x => x.id === r.lessonId)
        if (!l) return
        candidates.push({
          score: 100, subject: s, chapter: c, lesson: l,
          reason: 'Tu avais prévu cette révision aujourd\'hui.',
        })
      }
    })

    state.subjects.forEach(s => {
      const exam = state.exams
        .filter(e => e.subjectId === s.id && new Date(e.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
      s.chapters?.forEach(c => {
        c.lessons?.forEach(l => {
          const prog = lessonProgress(l)
          let score = 0
          let reason = ''
          if (l.mastery === 'bad') { score += 80; reason = 'Tu as marqué cette leçon comme difficile.' }
          else if (l.mastery === 'review') { score += 50; reason = 'Tu voulais revoir cette leçon.' }
          if (prog > 0 && prog < 100) { score += 30; reason = reason || `Tu es à ${prog}% de cette leçon.` }
          else if (prog === 0) { score += 10; reason = reason || 'Tu n\'as pas encore commencé cette leçon.' }
          if (exam) {
            const days = Math.ceil((new Date(exam.date) - now) / 86400000)
            if (days <= 7 && days >= 0) {
              score += 40
              reason = reason || `Épreuve « ${exam.title} » dans ${days} jour${days === 1 ? '' : 's'}.`
            }
          }
          if (score > 0) candidates.push({ score, subject: s, chapter: c, lesson: l, reason })
        })
      })
    })

    if (candidates.length === 0 && goals.filter(g => !g.done).length > 0) {
      const s = state.subjects[0]
      const c = s?.chapters?.[0]
      const l = c?.lessons?.[0]
      if (s && c && l) {
        candidates.push({
          score: 5, subject: s, chapter: c, lesson: l,
          reason: `Il te reste ${goals.filter(g => !g.done).length} objectif(s) aujourd'hui.`,
        })
      }
    }

    candidates.sort((a, b) => b.score - a.score)
    return candidates[0] || null
  }, [state, goals])

  const motivational = useMemo(() => {
    if (lessonsDone === 0) return 'Ajoute une matière et commence ta première leçon pour créer ton élan.'
    if (state.streak.current >= 7) return `🔥 Série de ${state.streak.current} jours — tu es inarrêtable.`
    if (state.streak.current >= 3) return `🔥 Série de ${state.streak.current} jours — continue comme ça !`
    if (goals.length && goalsDone === goals.length) return 'Tous les objectifs du jour accomplis — excellent travail !'
    return `Tu as terminé ${lessonsDone} leçon${lessonsDone === 1 ? '' : 's'}. Continue !`
  }, [lessonsDone, state.streak.current, goals, goalsDone])

  const toggleGoal = (id) => {
    const newGoals = goals.map(g => (g.id === id ? { ...g, done: !g.done } : g))
    dispatch({ type: 'SET_GOALS_FOR_DATE', dateKey: today, goals: newGoals })
    const g = newGoals.find(x => x.id === id)
    if (g?.done) toast('Objectif atteint ✓')
  }

  const addGoal = () => {
    if (!goalText.trim()) return
    dispatch({
      type: 'SET_GOALS_FOR_DATE',
      dateKey: today,
      goals: [...goals, { id: uid(), text: goalText.trim(), done: false }],
    })
    setGoalText('')
    setGoalModal(false)
    toast('Objectif ajouté')
  }

  const deleteGoal = (id) => {
    dispatch({
      type: 'SET_GOALS_FOR_DATE',
      dateKey: today,
      goals: goals.filter(g => g.id !== id),
    })
  }

  const startRecommendation = () => {
    if (!recommendation) return
    const { subject, chapter, lesson } = recommendation
    nav(`/subjects/${subject.id}/chapters/${chapter.id}/lessons/${lesson.id}`)
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto space-y-6">
      {/* Salutation */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">
          {greeting()}, {state.profile.name || 'Étudiant(e)'} 👋
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{motivational}</p>
      </div>

      {/* Progression globale */}
      <div className="card p-5 md:p-6">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-5">
            <ProgressRing value={overall} size={104} stroke={9}>
              <div className="text-center">
                <div className="text-xl font-bold font-display">{overall}%</div>
                <div className="text-[9px] text-slate-400 uppercase tracking-wider">Terminé</div>
              </div>
            </ProgressRing>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Progression globale
              </div>
              <div className="text-lg font-semibold font-display">Ton parcours scolaire</div>
              <div className="text-sm text-slate-500 mt-1">
                {lessonsDone}/{lessonsTotal} leçons · {chaptersDone}/{chaptersTotal} chapitres
              </div>
            </div>
          </div>
          <button onClick={() => setRecModal(true)} className="btn-primary">
            <Sparkles size={16} /> Que dois-je étudier ?
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={BookOpen} label="Leçons terminées" value={lessonsDone} sub={`${lessonsTotal} au total`} accent="indigo" />
        <StatCard icon={Layers} label="Chapitres terminés" value={chaptersDone} sub={`${chaptersTotal} au total`} accent="violet" />
        <StatCard icon={Clock} label="Temps d'étude cette semaine" value={fmtDuration(weekMs)} accent="blue" />
        <StatCard icon={Flame} label="Série actuelle" value={`${state.streak.current} jour${state.streak.current === 1 ? '' : 's'}`} sub={`Record : ${state.streak.longest}`} accent="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Objectifs du jour */}
          <div className="card p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold font-display flex items-center gap-2">
                  <Target size={18} className="text-indigo-500" /> Objectifs du jour
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {goalsDone} / {goals.length} terminés
                </p>
              </div>
              <button onClick={() => setGoalModal(true)} className="btn-ghost">
                <Plus size={14} /> Ajouter
              </button>
            </div>
            {goals.length > 0 && (
              <ProgressBar value={goals.length ? (goalsDone / goals.length) * 100 : 0} className="mb-4" />
            )}
            {goals.length === 0 ? (
              <div className="text-sm text-slate-400 text-center py-4">
                Aucun objectif pour aujourd'hui. Ajoutes-en un pour commencer.
              </div>
            ) : (
              <div className="space-y-1.5">
                {goals.map(g => (
                  <div key={g.id} className="group flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <button
                      onClick={() => toggleGoal(g.id)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                        ${g.done ? 'bg-indigo-500 border-indigo-500 animate-check' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}
                    >
                      {g.done && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>
                    <span className={`text-sm flex-1 ${g.done ? 'text-slate-400 line-through' : ''}`}>{g.text}</span>
                    <button onClick={() => deleteGoal(g.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reprendre l'étude */}
          {lastLesson && (
            <div className="card p-5 md:p-6">
              <h2 className="text-base font-semibold font-display mb-4">Reprendre l'étude</h2>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${lastLesson.subject.color || '#6366f1'}20` }}>
                  {lastLesson.subject.icon || '📖'}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <div className="text-xs text-slate-400">
                    {lastLesson.subject.name} → {lastLesson.chapter.name}
                  </div>
                  <div className="text-sm font-semibold truncate">{lastLesson.lesson.name}</div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <ProgressBar value={lessonProgress(lastLesson.lesson)} size="sm" />
                    <span className="text-xs text-slate-500 shrink-0">{lessonProgress(lastLesson.lesson)}%</span>
                  </div>
                </div>
                <button
                  onClick={() => nav(`/subjects/${lastLesson.subject.id}/chapters/${lastLesson.chapter.id}/lessons/${lastLesson.lesson.id}`)}
                  className="btn-primary shrink-0"
                >
                  Reprendre <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Recommandé */}
          {recommendation && (
            <div className="card p-5 md:p-6 border-indigo-200 dark:border-indigo-500/30 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-500/5 dark:to-slate-900">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Recommandé pour toi
                </span>
              </div>
              <div className="flex items-start gap-4 flex-wrap">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${recommendation.subject.color || '#6366f1'}20` }}>
                  {recommendation.subject.icon || '📖'}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <div className="text-xs text-slate-400">
                    {recommendation.subject.name} → {recommendation.chapter.name}
                  </div>
                  <div className="text-base font-semibold font-display">{recommendation.lesson.name}</div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{recommendation.reason}</p>
                </div>
                <button onClick={startRecommendation} className="btn-primary shrink-0">
                  Commencer <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Épreuves à venir */}
          <div className="card p-5 md:p-6">
            <h2 className="text-base font-semibold font-display mb-4 flex items-center gap-2">
              <CalendarIcon size={18} className="text-rose-500" /> À venir
            </h2>
            {upcomingExams.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Aucune épreuve ni échéance à venir.</p>
            ) : (
              <div className="space-y-2">
                {upcomingExams.map(e => {
                  const d = new Date(e.date)
                  const days = Math.ceil((d - new Date().setHours(0, 0, 0, 0)) / 86400000)
                  const urgent = days <= 3
                  return (
                    <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0
                        ${urgent ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                        <div className="text-[9px] uppercase font-semibold">
                          {d.toLocaleString('fr', { month: 'short' })}
                        </div>
                        <div className="text-sm font-bold -mt-0.5">{d.getDate()}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{e.title}</div>
                        <div className="text-xs text-slate-500">
                          {days === 0 ? "Aujourd'hui" : days === 1 ? 'Demain' : `Dans ${days} jours`}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div className="card p-5 md:p-6">
            <h2 className="text-base font-semibold font-display mb-4 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> Actions rapides
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => nav('/subjects')} className="btn-secondary justify-start"><BookOpen size={14} /> Matières</button>
              <button onClick={() => nav('/timer')} className="btn-secondary justify-start"><Clock size={14} /> Minuteur</button>
              <button onClick={() => nav('/vault')} className="btn-secondary justify-start"><Layers size={14} /> Bibliothèque</button>
              <button onClick={() => nav('/reviews')} className="btn-secondary justify-start"><Sparkles size={14} /> Révisions</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal objectif */}
      <Modal
        open={goalModal}
        onClose={() => setGoalModal(false)}
        title="Ajouter un objectif du jour"
        size="sm"
        footer={
          <>
            <button onClick={() => setGoalModal(false)} className="btn-secondary">Annuler</button>
            <button onClick={addGoal} className="btn-primary">Ajouter</button>
          </>
        }
      >
        <label className="label">Que veux-tu accomplir aujourd'hui ?</label>
        <input
          autoFocus
          className="input"
          value={goalText}
          onChange={e => setGoalText(e.target.value)}
          placeholder="ex : Terminer la leçon d'Algèbre"
          onKeyDown={e => e.key === 'Enter' && addGoal()}
        />
      </Modal>

      {/* Modal recommandation */}
      <Modal
        open={recModal}
        onClose={() => setRecModal(false)}
        title="✨ Que dois-je étudier ?"
        size="md"
        footer={
          recommendation && (
            <button
              onClick={() => { setRecModal(false); startRecommendation() }}
              className="btn-primary"
            >
              Commencer <ChevronRight size={16} />
            </button>
          )
        }
      >
        {!recommendation ? (
          <p className="text-sm text-slate-500">
            Ajoute des matières et des leçons pour recevoir des recommandations personnalisées.
          </p>
        ) : (
          <div>
            <div className="text-xs text-slate-400 mb-1">
              {recommendation.subject.name} → {recommendation.chapter.name}
            </div>
            <h3 className="text-xl font-bold font-display mb-3">{recommendation.lesson.name}</h3>
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-sm text-indigo-900 dark:text-indigo-200">
              <div className="font-medium mb-1">Pourquoi ?</div>
              {recommendation.reason}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}