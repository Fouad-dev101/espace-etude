import { countCompletedLessons, countCompletedChapters, subjectProgress, subjectMastery } from './progress'

export const ACHIEVEMENTS = [
  { id: 'first_lesson', icon: '🏆', name: 'Première leçon', desc: 'Termine ta première leçon', check: (s) => countCompletedLessons(s.subjects) >= 1 },
  { id: 'first_subject', icon: '📚', name: 'Premiers pas', desc: 'Crée ta première matière', check: (s) => s.subjects.length >= 1 },
  { id: 'first_note', icon: '📝', name: 'Preneur de notes', desc: 'Crée ta première fiche', check: (s) => s.notes.length >= 1 },
  { id: 'streak_3', icon: '🔥', name: 'Série de 3 jours', desc: 'Étudie 3 jours d\'affilée', check: (s) => s.streak.longest >= 3 },
  { id: 'streak_7', icon: '🔥', name: 'Série de 7 jours', desc: 'Étudie 7 jours d\'affilée', check: (s) => s.streak.longest >= 7 },
  { id: 'streak_30', icon: '🔥', name: 'Série de 30 jours', desc: 'Étudie 30 jours d\'affilée', check: (s) => s.streak.longest >= 30 },
  { id: 'notes_10', icon: '📚', name: 'Collectionneur', desc: 'Crée 10 fiches', check: (s) => s.notes.length >= 10 },
  { id: 'notes_50', icon: '📚', name: 'Érudit(e)', desc: 'Crée 50 fiches', check: (s) => s.notes.length >= 50 },
  { id: 'lessons_10', icon: '🎯', name: 'Concentré(e)', desc: 'Termine 10 leçons', check: (s) => countCompletedLessons(s.subjects) >= 10 },
  { id: 'lessons_50', icon: '🧠', name: 'Génie', desc: 'Termine 50 leçons', check: (s) => countCompletedLessons(s.subjects) >= 50 },
  { id: 'chapter_master', icon: '👑', name: 'Maître de chapitre', desc: 'Termine un chapitre entier', check: (s) => countCompletedChapters(s.subjects) >= 1 },
  { id: 'subject_master', icon: '🌟', name: 'Expert de matière', desc: 'Atteins 100% dans une matière', check: (s) => s.subjects.some(sub => subjectProgress(sub) === 100) },
  { id: 'study_10h', icon: '⏱️', name: 'Machine à étudier', desc: 'Étudie pendant 10 heures au total', check: (s) => s.sessions.reduce((a, x) => a + x.duration, 0) >= 36000 },
  { id: 'study_50h', icon: '⏱️', name: 'Travail en profondeur', desc: 'Étudie pendant 50 heures au total', check: (s) => s.sessions.reduce((a, x) => a + x.duration, 0) >= 180000 },
  { id: 'perfect_mastery', icon: '💎', name: 'Mémoire parfaite', desc: 'Maîtrise 5 leçons', check: (s) => s.subjects.reduce((a, sub) => a + (sub.chapters||[]).reduce((b,c) => b + (c.lessons||[]).filter(l => l.mastery === 'good').length, 0), 0) >= 5 },
]

export function evaluateAchievements(state, prevAchievements = []) {
  const unlocked = new Set(prevAchievements.map(a => a.id))
  const newlyUnlocked = []
  for (const a of ACHIEVEMENTS) {
    if (!unlocked.has(a.id)) {
      try {
        if (a.check(state)) {
          unlocked.add(a.id)
          newlyUnlocked.push({ id: a.id, date: new Date().toISOString() })
        }
      } catch {}
    }
  }
  return newlyUnlocked
}