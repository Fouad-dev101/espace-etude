import { useEffect, useMemo, useRef, useState } from 'react'
import { Search as SearchIcon, BookOpen, FileText, Calendar, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

export default function SearchModal({ open, onClose }) {
  const { state } = useApp()
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else setQ('')
  }, [open])

  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (!query) return []
    const out = []
    for (const s of state.subjects) {
      if (s.name.toLowerCase().includes(query)) out.push({ type: 'Matière', icon: BookOpen, title: s.name, subtitle: s.description, to: `/subjects/${s.id}` })
      for (const c of (s.chapters || [])) {
        if (c.name.toLowerCase().includes(query)) out.push({ type: 'Chapitre', icon: BookOpen, title: c.name, subtitle: s.name, to: `/subjects/${s.id}` })
        for (const l of (c.lessons || [])) {
          if (l.name.toLowerCase().includes(query)) out.push({ type: 'Leçon', icon: BookOpen, title: l.name, subtitle: `${s.name} → ${c.name}`, to: `/subjects/${s.id}/chapters/${c.id}/lessons/${l.id}` })
        }
      }
    }
    for (const n of state.notes) {
      if ((n.title + ' ' + n.content).toLowerCase().includes(query)) {
        out.push({ type: 'Fiche', icon: FileText, title: n.title, subtitle: n.content?.slice(0, 60), to: '/vault' })
      }
    }
    for (const e of state.exams) {
      if (e.title.toLowerCase().includes(query)) out.push({ type: 'Épreuve', icon: Calendar, title: e.title, subtitle: e.date, to: '/planner' })
    }
    return out.slice(0, 12)
  }, [q, state])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 px-4 border-b border-slate-200 dark:border-slate-800">
          <SearchIcon size={18} className="text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Rechercher matières, leçons, fiches, épreuves..."
            className="flex-1 h-14 bg-transparent outline-none text-sm placeholder:text-slate-400"
          />
          <kbd className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500">ÉCHAP</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto scroll-thin">
          {!q && (
            <div className="p-6 text-center text-sm text-slate-400">
              Commencez à taper pour rechercher dans votre espace
            </div>
          )}
          {q && results.length === 0 && (
            <div className="p-6 text-center text-sm text-slate-400">Aucun résultat</div>
          )}
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => { nav(r.to); onClose() }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                <r.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{r.title}</div>
                {r.subtitle && <div className="text-xs text-slate-400 truncate">{r.subtitle}</div>}
              </div>
              <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-500">{r.type}</span>
              <ChevronRight size={14} className="text-slate-300" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}   