import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { defaultState, loadState, saveState, clearState } from '../utils/storage'
import { uid, todayKey } from '../utils/id'
import { evaluateAchievements } from '../utils/achievements'
import { useToast } from './ToastContext'

const AppContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'REPLACE': return action.state
    case 'PATCH': return { ...state, ...action.patch }

    case 'SET_THEME': return { ...state, theme: action.theme }
    case 'SET_PROFILE': return { ...state, profile: { ...state.profile, ...action.profile } }
    case 'COMPLETE_ONBOARDING': return { ...state, onboarded: true }

    case 'ADD_SUBJECT': return { ...state, subjects: [...state.subjects, action.subject] }
    case 'UPDATE_SUBJECT': return { ...state, subjects: state.subjects.map(s => s.id === action.id ? { ...s, ...action.patch } : s) }
    case 'DELETE_SUBJECT': return { ...state, subjects: state.subjects.filter(s => s.id !== action.id) }

    case 'ADD_CHAPTER': return { ...state, subjects: state.subjects.map(s => s.id === action.subjectId ? { ...s, chapters: [...(s.chapters||[]), action.chapter] } : s) }
    case 'UPDATE_CHAPTER': return { ...state, subjects: state.subjects.map(s => s.id === action.subjectId ? { ...s, chapters: s.chapters.map(c => c.id === action.chapterId ? { ...c, ...action.patch } : c) } : s) }
    case 'DELETE_CHAPTER': return { ...state, subjects: state.subjects.map(s => s.id === action.subjectId ? { ...s, chapters: s.chapters.filter(c => c.id !== action.chapterId) } : s) }

    case 'ADD_LESSON': return { ...state, subjects: state.subjects.map(s => s.id === action.subjectId ? { ...s, chapters: s.chapters.map(c => c.id === action.chapterId ? { ...c, lessons: [...(c.lessons||[]), action.lesson] } : c) } : s) }
    case 'UPDATE_LESSON': return { ...state, subjects: state.subjects.map(s => s.id === action.subjectId ? { ...s, chapters: s.chapters.map(c => c.id === action.chapterId ? { ...c, lessons: c.lessons.map(l => l.id === action.lessonId ? { ...l, ...action.patch } : l) } : c) } : s) }
    case 'DELETE_LESSON': return { ...state, subjects: state.subjects.map(s => s.id === action.subjectId ? { ...s, chapters: s.chapters.map(c => c.id === action.chapterId ? { ...c, lessons: c.lessons.filter(l => l.id !== action.lessonId) } : c) } : s) }

    case 'ADD_SECTION': return { ...state, subjects: state.subjects.map(s => s.id === action.subjectId ? { ...s, chapters: s.chapters.map(c => c.id === action.chapterId ? { ...c, lessons: c.lessons.map(l => l.id === action.lessonId ? { ...l, sections: [...(l.sections||[]), action.section] } : l) } : c) } : s) }
    case 'UPDATE_SECTION': return { ...state, subjects: state.subjects.map(s => s.id === action.subjectId ? { ...s, chapters: s.chapters.map(c => c.id === action.chapterId ? { ...c, lessons: c.lessons.map(l => l.id === action.lessonId ? { ...l, sections: l.sections.map(sec => sec.id === action.sectionId ? { ...sec, ...action.patch } : sec) } : l) } : c) } : s) }
    case 'DELETE_SECTION': return { ...state, subjects: state.subjects.map(s => s.id === action.subjectId ? { ...s, chapters: s.chapters.map(c => c.id === action.chapterId ? { ...c, lessons: c.lessons.map(l => l.id === action.lessonId ? { ...l, sections: l.sections.filter(sec => sec.id !== action.sectionId) } : l) } : c) } : s) }

    case 'SET_LAST_LESSON': return { ...state, lastOpenedLesson: action.payload }

    case 'ADD_NOTE': return { ...state, notes: [action.note, ...state.notes] }
    case 'UPDATE_NOTE': return { ...state, notes: state.notes.map(n => n.id === action.id ? { ...n, ...action.patch, updated: new Date().toISOString() } : n) }
    case 'DELETE_NOTE': return { ...state, notes: state.notes.filter(n => n.id !== action.id) }

    case 'ADD_TASK': return { ...state, tasks: [...state.tasks, action.task] }
    case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, ...action.patch } : t) }
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) }

    case 'ADD_EXAM': return { ...state, exams: [...state.exams, action.exam] }
    case 'UPDATE_EXAM': return { ...state, exams: state.exams.map(e => e.id === action.id ? { ...e, ...action.patch } : e) }
    case 'DELETE_EXAM': return { ...state, exams: state.exams.filter(e => e.id !== action.id) }

    case 'ADD_REVIEW': return { ...state, reviews: [...state.reviews, action.review] }
    case 'DELETE_REVIEW': return { ...state, reviews: state.reviews.filter(r => r.id !== action.id) }

    case 'ADD_SESSION': return { ...state, sessions: [...state.sessions, action.session] }

    case 'SET_GOALS_FOR_DATE': {
      const key = action.dateKey
      return { ...state, goalsByDate: { ...state.goalsByDate, [key]: action.goals } }
    }

    case 'UNLOCK_ACHIEVEMENTS': return { ...state, achievements: [...state.achievements, ...action.achievements] }

    case 'STREAK_TOUCH': {
      const today = todayKey()
      const streak = { ...state.streak }
      if (streak.lastDate === today) return state
      const yesterday = todayKey(new Date(Date.now() - 86400000))
      if (streak.lastDate === yesterday) streak.current += 1
      else streak.current = 1
      streak.longest = Math.max(streak.longest || 0, streak.current)
      streak.lastDate = today
      if (!streak.daysStudied.includes(today)) streak.daysStudied = [...streak.daysStudied, today].slice(-400)
      return { ...state, streak }
    }

    default: return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const toast = useToast()

  // Persist
  useEffect(() => { saveState(state) }, [state])

  // Theme application
  useEffect(() => {
    const root = document.documentElement
    if (state.theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [state.theme])

  // Achievements check
  useEffect(() => {
    if (!state.onboarded) return
    const unlocked = evaluateAchievements(state, state.achievements)
    if (unlocked.length > 0) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENTS', achievements: unlocked })
    }
  }, [state.subjects, state.notes, state.sessions, state.streak.longest, state.onboarded])

  const api = useMemo(() => {
    const value = { state, dispatch, toast }

    value.toggleSectionStatus = (subjectId, chapterId, lessonId, sectionId, status) => {
      dispatch({ type: 'UPDATE_SECTION', subjectId, chapterId, lessonId, sectionId, patch: { status } })
    }

    value.touchStreak = () => dispatch({ type: 'STREAK_TOUCH' })

    value.resetAll = () => {
      clearState()
      dispatch({ type: 'REPLACE', state: { ...defaultState } })
    }

    value.exportData = () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `academic-os-backup-${new Date().toISOString().slice(0,10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    }

    value.importData = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result)
          if (typeof parsed !== 'object' || parsed === null) throw new Error('Invalid file')
          dispatch({ type: 'REPLACE', state: { ...defaultState, ...parsed } })
          resolve()
        } catch (e) { reject(e) }
      }
      reader.onerror = reject
      reader.readAsText(file)
    })

    return value
  }, [state, toast])

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)