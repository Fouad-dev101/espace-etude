// Section statuses: 'todo' | 'doing' | 'done'

export function lessonProgress(lesson) {
  const sections = lesson.sections || []
  if (sections.length === 0) return lesson.completed ? 100 : 0
  const done = sections.filter(s => s.status === 'done').length
  const doing = sections.filter(s => s.status === 'doing').length
  return Math.round(((done + doing * 0.5) / sections.length) * 100)
}

export function chapterProgress(chapter) {
  const lessons = chapter.lessons || []
  if (lessons.length === 0) return 0
  const sum = lessons.reduce((acc, l) => acc + lessonProgress(l), 0)
  return Math.round(sum / lessons.length)
}

export function subjectProgress(subject) {
  const chapters = subject.chapters || []
  if (chapters.length === 0) return 0
  const sum = chapters.reduce((acc, c) => acc + chapterProgress(c), 0)
  return Math.round(sum / chapters.length)
}

export function masteryScore(lesson) {
  const m = lesson.mastery // 'good' | 'review' | 'bad' | null
  if (m === 'good') return 100
  if (m === 'review') return 50
  if (m === 'bad') return 20
  return 0
}

export function subjectMastery(subject) {
  const lessons = (subject.chapters || []).flatMap(c => c.lessons || [])
  if (lessons.length === 0) return 0
  return Math.round(lessons.reduce((a, l) => a + masteryScore(l), 0) / lessons.length)
}

export function countLessons(subjects) {
  return subjects.reduce((a, s) => a + (s.chapters || []).reduce((b, c) => b + (c.lessons || []).length, 0), 0)
}

export function countCompletedLessons(subjects) {
  return subjects.reduce((a, s) =>
    a + (s.chapters || []).reduce((b, c) =>
      b + (c.lessons || []).filter(l => lessonProgress(l) === 100).length, 0), 0)
}

export function countChapters(subjects) {
  return subjects.reduce((a, s) => a + (s.chapters || []).length, 0)
}

export function countCompletedChapters(subjects) {
  return subjects.reduce((a, s) =>
    a + (s.chapters || []).filter(c => chapterProgress(c) === 100).length, 0)
}

export function overallProgress(subjects) {
  if (!subjects.length) return 0
  return Math.round(subjects.reduce((a, s) => a + subjectProgress(s), 0) / subjects.length)
}