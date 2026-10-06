import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Vault, RefreshCw, Calendar, BarChart3,
  Timer, Trophy, Settings as SettingsIcon, GraduationCap
} from 'lucide-react'

const nav = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/subjects', label: 'Matières', icon: BookOpen },
  { to: '/vault', label: 'Bibliothèque', icon: Vault },
  { to: '/reviews', label: 'Révisions', icon: RefreshCw },
  { to: '/planner', label: 'Planning', icon: Calendar },
  { to: '/statistics', label: 'Statistiques', icon: BarChart3 },
  { to: '/timer', label: 'Minuteur', icon: Timer },
  { to: '/achievements', label: 'Récompenses', icon: Trophy },
  { to: '/settings', label: 'Paramètres', icon: SettingsIcon },
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950">
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-slate-200/70 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <GraduationCap size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight font-display">Espace d'étude</span>
          <span className="text-[10px] text-slate-400 -mt-0.5">Mon espace personnel</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto scroll-thin px-3 py-4 space-y-1">
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
              ${isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-100'}
            `}
          >
            <item.icon size={18} strokeWidth={2} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 border-t border-slate-200/70 dark:border-slate-800">
        <div className="text-[10px] text-slate-400 text-center">v1.0 · 100% local</div>
      </div>
    </aside>
  )
}