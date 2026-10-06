import Modal from './Modal'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Êtes-vous sûr ?', message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <button onClick={onClose} className="btn-secondary">{cancelLabel}</button>
          <button onClick={() => { onConfirm(); onClose() }} className={danger ? 'btn-danger' : 'btn-primary'}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
    </Modal>
  )
}   