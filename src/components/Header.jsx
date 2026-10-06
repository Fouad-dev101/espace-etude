import { Search, Moon, Sun, Flame } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SearchModal from './Search'
import { useState } from 'react'

export default function Header() {
  const { state, dispatch } = useApp()
  const [searchOpen, setSearchOpen] = useState(false)

  const theme = state.theme
  const setTheme = (t) => dispatch({ type: 'SET_THEME', theme: t })

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200/60 dark:border-slate-800">
        <div className="h-16 px-4 md:px-8 flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2 mr-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">É</div>
          </div>
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 flex-1 max-w-md px-3.5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <Search size={16} />
            <span>Rechercher...</span>
            <kbd className="hidden md:inline ml-auto text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">⌘K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 border border-orange-200/60 dark:border-orange-500/20">
              <Flame size={16} className="text-orange-500" />
              <span className="text-sm font-semibold text-orange-700 dark:text-orange-400">{state.streak.current}</span>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              aria-label="Changer de thème"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-semibold">
              {(state.profile.name || 'É').slice(0, 1).toUpperCase()}
            </div>
          </div>
        </div>
      </header>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}