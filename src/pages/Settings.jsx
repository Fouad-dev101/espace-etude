import { useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { User, Palette, Database, Download, Upload, Trash2, Info } from 'lucide-react'

export default function Settings() {
  const { state, dispatch, toast, exportData, importData, resetAll } = useApp()
  const [profileModal, setProfileModal] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [importError, setImportError] = useState(null)
  const [profile, setProfile] = useState({ ...state.profile })
  const fileRef = useRef(null)

  const saveProfile = () => {
    dispatch({ type: 'SET_PROFILE', profile })
    toast('Profil mis à jour ✓')
    setProfileModal(false)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importData(file)
      toast('Données importées ✓')
      setImportError(null)
    } catch {
      setImportError('Format de fichier invalide')
      toast('Échec de l\'import', 'error')
    }
    e.target.value = ''
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto space-y-5">
      <div className="mb-2">
        <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">Paramètres</h1>
      </div>

      {/* Profil */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-indigo-500" />
          <h2 className="text-sm font-semibold font-display">Profil</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xl font-bold">
            {(state.profile.name || 'É').slice(0, 1).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{state.profile.name || 'Étudiant(e)'}</div>
            <div className="text-xs text-slate-500 truncate">
              {[state.profile.grade, state.profile.school].filter(Boolean).join(' · ') || 'Ajoute tes informations'}
            </div>
          </div>
          <button onClick={() => { setProfile({ ...state.profile }); setProfileModal(true) }} className="btn-secondary">
            Modifier
          </button>
        </div>
      </div>

      {/* Apparence */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={16} className="text-violet-500" />
          <h2 className="text-sm font-semibold font-display">Apparence</h2>
        </div>
        <div className="flex gap-2">
          {[
            { id: 'light', label: 'Clair ☀️' },
            { id: 'dark', label: 'Sombre 🌙' },
          ].map(t => (
            <button key={t.id} onClick={() => dispatch({ type: 'SET_THEME', theme: t.id })}
              className={`flex-1 px-4 py-3 rounded-xl border text-sm font-medium transition
                ${state.theme === t.id ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/40 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Données */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database size={16} className="text-emerald-500" />
          <h2 className="text-sm font-semibold font-display">Gestion des données</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div>
              <div className="text-sm font-medium">Exporter tes données</div>
              <div className="text-xs text-slate-500">Télécharger une sauvegarde JSON</div>
            </div>
            <button onClick={exportData} className="btn-secondary"><Download size={14} /> Exporter</button>
          </div>
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <div>
              <div className="text-sm font-medium">Importer des données</div>
              <div className="text-xs text-slate-500">Restaurer depuis une sauvegarde</div>
            </div>
            <button onClick={() => fileRef.current?.click()} className="btn-secondary"><Upload size={14} /> Importer</button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>
          {importError && <div className="text-xs text-red-500">{importError}</div>}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5">
            <div>
              <div className="text-sm font-medium text-red-700 dark:text-red-400">Réinitialiser toutes les données</div>
              <div className="text-xs text-red-600/70 dark:text-red-400/70">Efface tout. Irréversible.</div>
            </div>
            <button onClick={() => setConfirmReset(true)} className="btn-danger"><Trash2 size={14} /> Réinitialiser</button>
          </div>
        </div>
      </div>

      {/* À propos */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-slate-500" />
          <h2 className="text-sm font-semibold font-display">À propos</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Espace d'étude est ton espace personnel d'apprentissage. Toutes tes données sont stockées localement dans ton navigateur — elles ne quittent jamais ton appareil. Pense à exporter régulièrement des sauvegardes.
        </p>
        <div className="text-xs text-slate-400 mt-3">Version 1.0 · 100% local</div>
      </div>

      <Modal open={profileModal} onClose={() => setProfileModal(false)} title="Modifier le profil"
        footer={<>
          <button onClick={() => setProfileModal(false)} className="btn-secondary">Annuler</button>
          <button onClick={saveProfile} className="btn-primary">Enregistrer</button>
        </>}>
        <div className="space-y-4">
          <div>
            <label className="label">Prénom / Nom</label>
            <input className="input" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} />
          </div>
          <div>
            <label className="label">École</label>
            <input className="input" value={profile.school || ''} onChange={e => setProfile({ ...profile, school: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Classe / Niveau</label>
              <input className="input" value={profile.grade || ''} onChange={e => setProfile({ ...profile, grade: e.target.value })} />
            </div>
            <div>
              <label className="label">Année scolaire</label>
              <input className="input" value={profile.year || ''} onChange={e => setProfile({ ...profile, year: e.target.value })} />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmReset} onClose={() => setConfirmReset(false)}
        onConfirm={() => { resetAll(); toast('Toutes les données ont été réinitialisées', 'info') }}
        title="Réinitialiser toutes les données ?"
        message="Cela effacera définitivement toutes tes matières, leçons, fiches et statistiques. Cette action est irréversible. Assure-toi d'avoir exporté une sauvegarde avant."
        confirmLabel="Tout réinitialiser" />
    </div>
  )
}