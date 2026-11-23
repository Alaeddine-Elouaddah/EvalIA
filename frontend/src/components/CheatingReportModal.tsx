import React from 'react'
import { AlertTriangle, ShieldAlert, X } from 'lucide-react'
import type { ExamAttemptDTO } from '../types'

interface CheatingReportModalProps {
  attempt: ExamAttemptDTO | null
  onClose: () => void
}

export const CheatingReportModal: React.FC<CheatingReportModalProps> = ({ attempt, onClose }) => {
  if (!attempt) return null

  // Découper le log des infractions
  const violationEntries = attempt.violationLog
    ? attempt.violationLog
        .split(' | ')
        .map((entry) => entry.trim())
        .filter(Boolean)
    : []

  const integrityScore = attempt.integrityScore ?? 100
  const isHighRisk = integrityScore < 60
  const isModerateRisk = integrityScore >= 60 && integrityScore < 85

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                isHighRisk
                  ? 'bg-rose-100 text-rose-600'
                  : isModerateRisk
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-emerald-100 text-emerald-600'
              }`}
            >
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Rapport d'Intégrité Anti-Triche</h2>
              <p className="text-xs text-slate-500">Examen : {attempt.examTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Détails Étudiant & Score */}
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-xs">
          <div>
            <p className="text-slate-500">Étudiant :</p>
            <p className="mt-0.5 font-bold text-slate-800">{attempt.studentName}</p>
            <p className="text-slate-400 truncate">{attempt.studentEmail}</p>
          </div>
          <div>
            <p className="text-slate-500">Note obtenue :</p>
            <p className="mt-0.5 font-bold text-indigo-600 text-base">
              {attempt.score.toLocaleString('fr-FR')}% ({attempt.correctCount}/{attempt.totalQuestions})
            </p>
          </div>
        </div>

        {/* Jauge d'intégrité */}
        <div className="mt-4 rounded-2xl border p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">Indice de confiance / intégrité</span>
            <span
              className={`font-bold text-sm ${
                isHighRisk ? 'text-rose-600' : isModerateRisk ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              {integrityScore}%
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full transition-all duration-300 ${
                isHighRisk ? 'bg-rose-500' : isModerateRisk ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${integrityScore}%` }}
            />
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {attempt.violationCount ?? 0} infraction(s) constatée(s) pendant la session d'examen.
          </p>
        </div>

        {/* Liste détaillée des infractions et leurs types */}
        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Journal détaillé des infractions
          </p>

          {violationEntries.length === 0 ? (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-800">
              <span className="font-semibold">Aucune anomalie détectée :</span> l'étudiant est resté en plein écran et sans changer d'onglet tout au long de l'épreuve.
            </div>
          ) : (
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
              {violationEntries.map((entry, index) => {
                // Déduire le type d'infraction pour badge visuel
                let badgeLabel = "Anomalie"
                let badgeClass = "bg-slate-100 text-slate-700"

                if (entry.includes("onglet") || entry.includes("Perte de focus")) {
                  badgeLabel = "Changement d'onglet"
                  badgeClass = "bg-rose-100 text-rose-800 border-rose-200"
                } else if (entry.includes("plein écran")) {
                  badgeLabel = "Sortie Plein écran"
                  badgeClass = "bg-amber-100 text-amber-800 border-amber-200"
                } else if (entry.includes("copie") || entry.includes("collage") || entry.includes("coupure")) {
                  badgeLabel = "Presse-papier"
                  badgeClass = "bg-purple-100 text-purple-800 border-purple-200"
                } else if (entry.includes("clavier") || entry.includes("DevTools") || entry.includes("F12")) {
                  badgeLabel = "Raccourci bloqué"
                  badgeClass = "bg-blue-100 text-blue-800 border-blue-200"
                }

                return (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 rounded-xl border border-rose-100 bg-rose-50/50 p-2.5 text-xs text-slate-800"
                  >
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${badgeClass}`}>
                          {badgeLabel}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-snug">{entry}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bouton fermer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            Fermer le rapport
          </button>
        </div>
      </div>
    </div>
  )
}
