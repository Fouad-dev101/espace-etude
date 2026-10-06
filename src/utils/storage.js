const KEY = 'academic-os-v1'

export const defaultState = {
  version: 1,
  profile: { name: '', school: '', grade: '', year: '', avatar: null },
  onboarded: false,
  theme: 'dark',
  settings: { weekStart: 1, dailyGoal: 3, pomodoro: { focus: 25, break: 5 } },
  subjects: [],
  notes: [],
  tasks: [],
  exams: [],
  sessions: [],
  achievements: [],
  streak: { current: 0, longest: 0, lastDate: null, daysStudied: [] },
  goalsByDate: {}, // dateKey -> [{id, text, done}]
  lastOpenedLesson: null, // {subjectId, chapterId, lessonId}
  reviews: [], // manual scheduled reviews: {id, subjectId, chapterId, lessonId, date}
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultState }
    const parsed = JSON.parse(raw)
    return { ...defaultState, ...parsed }
  } catch {
    return { ...defaultState }
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save state', e)
  }
}

export function clearState() {
  localStorage.removeItem(KEY)
}