import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const h = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up`}>
        {title && (
          <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold font-display">{title}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto scroll-thin px-5 md:px-6 py-4">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 md:px-6 py-4 border-t border-slate-200 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}