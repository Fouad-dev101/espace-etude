import { createContext, useCallback, useContext, useState } from 'react'
import { Check, X, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2800)
  }, [])

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id))

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white px-4 py-3 shadow-lg animate-slide-up min-w-[240px]"
          >
            <div className={`shrink-0 ${t.type === 'error' ? 'text-red-400' : t.type === 'info' ? 'text-blue-400' : t.type === 'warn' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {t.type === 'error' ? <AlertTriangle size={18} /> : t.type === 'info' ? <Info size={18} /> : <Check size={18} />}
            </div>
            <div className="text-sm flex-1">{t.message}</div>
            <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)