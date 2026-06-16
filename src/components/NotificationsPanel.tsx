import { AlertTriangle, XCircle, Info } from 'lucide-react'
import type { AppNotification } from '../lib/notifications'
import { Modal } from './ui/Modal'
import { Button } from './ui/Button'

interface Props {
  open: boolean
  onClose: () => void
  notifications: AppNotification[]
}

const levelIcon = {
  info: Info,
  warning: AlertTriangle,
  danger: XCircle,
}

const levelColor = {
  info: 'border-primary/30 bg-primary/5',
  warning: 'border-state-attention/50 bg-state-attention/10',
  danger: 'border-delete/30 bg-delete/10',
}

export function NotificationsPanel({ open, onClose, notifications }: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Alertes & notifications" size="md">
      {notifications.length === 0 ? (
        <p className="text-center text-slate-500 py-8">Aucune alerte active</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const Icon = levelIcon[n.level]
            return (
              <div
                key={n.id}
                className={`flex gap-3 rounded-xl border p-4 ${levelColor[n.level]}`}
              >
                <Icon size={20} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-slate-800">
                    {n.axeKey && <span className="text-primary mr-2">[{n.axeKey}]</span>}
                    {n.title}
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <Button variant="ghost" onClick={onClose}>Fermer</Button>
      </div>
    </Modal>
  )
}
