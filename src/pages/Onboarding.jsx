import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { uid } from '../utils/id'
import { buildCurriculum } from '../utils/curriculum'
import { GraduationCap, Plus, X, ArrowRight, Check, Sparkles } from 'lucide-react'

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6']
const ICONS = ['📐', '🔬', '🧪', '📖', '🌍', '💻', '🎨', '🎵', '📊', '⚗️', '🧬', '🗣️']

export default function Onboarding() {
  const { dispatch, toast } = useApp()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('1BAC Sciences Économiques & Gestion')
  const [school, setSchool] = useState('')
  const [subjects, setSubjects] = useState([])
  const [loadedPreset, setLoadedPreset] = useState(false)
  const [newSub, setNewSub] = useState({ name: '', icon: '📖', color: COLORS[1] })

  const loadPreset = () => {
    setSubjects(buildCurriculum())
    setLoadedPreset(true)
    toast('Programme 1BAC SEG chargé ✓')
  }

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => Math.max(0, s - 1))

  const finish = () => {
    dispatch({
      type: 'SET_PROFILE',
      profile: {
        name: name.trim() || 'Étudiant(e)',
        school,
        grade,
        year: String(new Date().getFullYear()),
      },
    })
    subjects.forEach(s => dispatch({ type: 'ADD_SUBJECT', subject: s }))
    dispatch({ type: 'COMPLETE_ONBOARDING' })
    toast(`Bienvenue, ${name || 'Étudiant(e)'} ! 🎉`)
  }

  const addSubject = () => {
    if (!newSub.name.trim()) return
    setSubjects([
      ...subjects,
      {
        id: uid(),
        name: newSub.name.trim(),
        icon: newSub.icon,
        color: newSub.color,
        description: '',
        chapters: [],
      },
    ])
    setNewSub({ name: '', icon: '📖', color: COLORS[Math.floor(Math.random() * COLORS.length)] })
  }

  const removeSubject = (id) => setSubjects(subjects.filter(s => s.id !== id))

  const steps = [
    {
      title: 'Bienvenue dans ton espace d\'étude 👋',
      subtitle: "Configurons ton espace personnel d'apprentissage.",
      content: (
        <div className="space-y-4">
          <div>
            <label className="label">Comment dois-je t'appeler ?</label>
            <input
              className="input"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ton prénom"
            />
          </div>
          <div>
            <label className="label">École (optionnel)</label>
            <input
              className="input"
              value={school}
              onChange={e => setSchool(e.target.value)}
              placeholder="Ton établissement"
            />
          </div>
        </div>
      ),
      valid: name.trim().length > 0,
    },
    {
      title: 'En quelle classe es-tu ?',
      subtitle: 'Tu pourras modifier ça plus tard dans les paramètres.',
      content: (
        <div>
          <label className="label">Niveau / Classe</label>
          <input
            className="input"
            autoFocus
            value={grade}
            onChange={e => setGrade(e.target.value)}
            placeholder="ex : 1BAC Sciences Économiques"
          />
        </div>
      ),
      valid: true,
    },
    {
      title: 'Ajoute tes matières',
      subtitle: 'Charge le programme 1BAC SEG ou ajoute les tiennes.',
      content: (
        <div className="space-y-4">
          {!loadedPreset && (
            <button
              onClick={loadPreset}
              className="w-full p-4 rounded-xl border-2 border-indigo-200 dark:border-indigo-500/40 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 text-left hover:border-indigo-400 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Charger le programme 1BAC Sciences Économiques & Gestion</div>
                  <div className="text-xs text-slate-500 mt-0.5">12 matières · programme marocain complet</div>
                </div>
              </div>
            </button>
          )}

          {subjects.length > 0 && (
            <div className="space-y-1.5 max-h-52 overflow-y-auto scroll-thin">
              {subjects.map(s => (
                <div
                  key={s.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ background: `${s.color}20` }}
                  >
                    {s.icon}
                  </div>
                  <span className="text-sm font-medium flex-1 truncate">{s.name}</span>
                  <button
                    onClick={() => removeSubject(s.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {!loadedPreset && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white dark:bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-400">
                    ou ajouter manuellement
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
                <div className="flex gap-2">
                  <input
                    className="input"
                    value={newSub.name}
                    onChange={e => setNewSub({ ...newSub, name: e.target.value })}
                    placeholder="Nom de la matière"
                    onKeyDown={e => e.key === 'Enter' && addSubject()}
                  />
                  <button onClick={addSubject} className="btn-primary shrink-0">
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {ICONS.map(ic => (
                    <button
                      key={ic}
                      onClick={() => setNewSub({ ...newSub, icon: ic })}
                      className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition
                        ${newSub.icon === ic ? 'bg-indigo-100 dark:bg-indigo-500/20 ring-2 ring-indigo-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ),
      valid: true,
    },
  ]

  const cur = steps[step]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/20">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap size={24} />
          </div>
          <div>
            <div className="text-lg font-bold font-display">Espace d'étude</div>
            <div className="text-xs text-slate-500 -mt-0.5">Mon espace personnel</div>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`}
              />
            ))}
          </div>

          <h1 className="text-xl md:text-2xl font-bold font-display mb-1">{cur.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{cur.subtitle}</p>

          <div className="mb-6">{cur.content}</div>

          <div className="flex gap-2">
            {step > 0 && (
              <button onClick={back} className="btn-secondary">
                Retour
              </button>
            )}
            {step < steps.length - 1 ? (
              <button onClick={next} disabled={!cur.valid} className="btn-primary ml-auto">
                Continuer <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={finish} className="btn-primary ml-auto">
                <Check size={16} /> Entrer dans mon espace
              </button>
            )}
          </div>
        </div>

        {step === steps.length - 1 && subjects.length === 0 && (
          <p className="text-center text-xs text-slate-500 mt-4">
            Tu peux passer cette étape et ajouter des matières plus tard.
          </p>
        )}
      </div>
    </div>
  )
}