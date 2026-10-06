import { chapterProgress, lessonProgress } from '../utils/progress'
import { Check, Circle, PlayCircle } from 'lucide-react'

export default function StudyMap({ subject }) {
  if (!subject.chapters?.length) {
    return <div className="card p-8 text-center text-slate-400 text-sm">Add chapters to see your study map.</div>
  }
  return (
    <div className="card p-5 md:p-6 overflow-x-auto">
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Study Map</div>
      <div className="space-y-6 min-w-max">
        {subject.chapters.map(chapter => {
          const cp = chapterProgress(chapter)
          return (
            <div key={chapter.id} className="flex items-center gap-6">
              <div className="w-40 shrink-0">
                <div className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-sm font-semibold truncate">{chapter.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{cp}% complete</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(chapter.lessons || []).map((l, i) => {
                  const lp = lessonProgress(l)
                  const status = lp === 100 ? 'done' : lp > 0 ? 'doing' : 'todo'
                  return (
                    <div key={l.id} className="flex items-center gap-2">
                      {i > 0 && <div className="w-6 h-px bg-slate-300 dark:bg-slate-700" />}
                      <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium whitespace-nowrap
                        ${status === 'done' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400'
                        : status === 'doing' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400'
                        : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-400'}`}>
                        {status === 'done' ? <Check size={12} /> : status === 'doing' ? <PlayCircle size={12} /> : <Circle size={12} />}
                        {l.name}
                        <span className="text-[10px] opacity-60">{lp}%</span>
                      </div>
                    </div>
                  )
                })}
                {(chapter.lessons || []).length === 0 && <div className="text-xs text-slate-400 italic">No lessons yet</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}