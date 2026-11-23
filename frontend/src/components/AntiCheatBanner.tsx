import React from 'react'
import { AlertTriangle, ShieldAlert, Maximize2 } from 'lucide-react'

interface AntiCheatBannerProps {
  violationCount: number
  maxViolations?: number
  isFullscreen: boolean
  onRequestFullscreen: () => void
}

export const AntiCheatBanner: React.FC<AntiCheatBannerProps> = ({
  violationCount,
  maxViolations = 3,
  isFullscreen,
  onRequestFullscreen,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-xs text-amber-900 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
        <span className="font-semibold">Mode Examen Sécurisé Actif</span>
        <span className="text-amber-700">· Tout changement d'onglet ou raccourci est surveillé</span>
      </div>

      <div className="flex items-center gap-4">
        {!isFullscreen && (
          <button
            type="button"
            onClick={onRequestFullscreen}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-amber-700"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Plein écran requis
          </button>
        )}
        <div className="flex items-center gap-1.5 font-medium">
          <span>Avertissements :</span>
          <span
            className={`rounded-full px-2 py-0.5 font-bold ${
              violationCount === 0
                ? 'bg-emerald-100 text-emerald-800'
                : violationCount >= maxViolations
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {violationCount} / {maxViolations}
          </span>
        </div>
      </div>
    </div>
  )
}

interface AntiCheatModalProps {
  isOpen: boolean
  message: string
  violationCount: number
  maxViolations?: number
  onClose: () => void
  onRequestFullscreen: () => void
}

export const AntiCheatModal: React.FC<AntiCheatModalProps> = ({
  isOpen,
  message,
  violationCount,
  maxViolations = 3,
  onClose,
  onRequestFullscreen,
}) => {
  if (!isOpen) return null

  const isCritical = violationCount >= maxViolations

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl transition-all sm:p-8 text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="mt-4 text-xl font-bold text-slate-900">
          {isCritical ? 'Examen Interrompu' : 'Infraction Détectée'}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {message}
        </p>

        <div className="my-5 rounded-xl bg-rose-50 p-3.5 border border-rose-100 text-xs font-semibold text-rose-800">
          Infractions enregistrées : {violationCount} / {maxViolations}
          {isCritical && (
            <p className="mt-1 font-normal text-rose-700">
              Votre copie est en cours de soumission avec le rapport d'incident envoyé à l'enseignant.
            </p>
          )}
        </div>

        {!isCritical && (
          <button
            type="button"
            onClick={() => {
              onClose()
              onRequestFullscreen()
            }}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            J'ai compris, reprendre l'examen
          </button>
        )}
      </div>
    </div>
  )
}
