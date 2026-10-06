import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Vault, Calendar, Menu, BarChart3, RefreshCw, Timer, Trophy, Settings as SettingsIcon, X } from 'lucide-react'
import { useState } from 'react'

const primary = [
  { to: '/', label: 'Accueil', icon: LayoutDashboard, end: true },
  { to: '/subjects', label: 'Matières', icon: BookOpen },
  { to: '/vault', label: 'Biblio', icon: Vault },
  { to: '/planner', label: 'Planning', icon: Calendar },
]

const more = [
  { to: '/reviews', label: 'Révisions', icon: RefreshCw },
  { to: '/statistics', label: 'Stats', icon: BarChart3 },
  { to: '/timer', label: 'Minuteur', icon: Timer },
  { to: '/achievements', label: 'Récompenses', icon: Trophy },
  { to: '/settings', label: 'Paramètres', icon: SettingsIcon },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const moreActive = more.some(m => loc.pathname.startsWith(m.to))

  return (
    <>
      {open && (
        <div className="md:hidden fixed inset-0 z-40 animate-fade-in" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
          <div className="absolute bottom-20 left-4 right-4 card p-3 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Plus</span>
              <button onClick={() => setOpen(false)} className="p-1 text-slate-400"><X size={16} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {more.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `
                    flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl text-xs font-medium
                    ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}
                  `}
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-t border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-5 pb-safe">
          {primary.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `
                flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium
                ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={() => setOpen(!open)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium
              ${moreActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}
          >
            <Menu size={20} />
            Plus
          </button>
        </div>
      </nav>
    </>
  )
}