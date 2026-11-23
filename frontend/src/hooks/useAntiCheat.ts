import { useEffect, useRef, useState, useCallback } from 'react'

export interface AntiCheatOptions {
  maxViolations?: number
  onAutoSubmit?: (currentCount: number, currentViolations: string[]) => void
  onViolation?: (reason: string, currentCount: number) => void
  enabled?: boolean
}

export interface AntiCheatState {
  violationCount: number
  violations: string[]
  isFullscreen: boolean
  warningModalOpen: boolean
  lastWarningMessage: string
  dismissWarning: () => void
  requestFullscreen: () => Promise<void>
  getLatestViolations: () => { count: number; violations: string[] }
}

export function useAntiCheat({
  maxViolations = 3,
  onAutoSubmit,
  onViolation,
  enabled = true,
}: AntiCheatOptions = {}): AntiCheatState {
  const [violationCount, setViolationCount] = useState(0)
  const [violations, setViolations] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [warningModalOpen, setWarningModalOpen] = useState(false)
  const [lastWarningMessage, setLastWarningMessage] = useState('')

  // Réf toujours à jour pour éviter tout problème de closure stale
  const violationCountRef = useRef(0)
  const violationsListRef = useRef<string[]>([])
  const autoSubmitTriggeredRef = useRef(false)
  const hasEverEnteredFullscreenRef = useRef(false)

  const onAutoSubmitRef = useRef(onAutoSubmit)
  const onViolationRef = useRef(onViolation)
  useEffect(() => {
    onAutoSubmitRef.current = onAutoSubmit
  }, [onAutoSubmit])
  useEffect(() => {
    onViolationRef.current = onViolation
  }, [onViolation])

  const triggerViolation = useCallback(
    (reason: string) => {
      if (!enabled || autoSubmitTriggeredRef.current) return

      const timestamp = new Date().toLocaleTimeString('fr-FR')
      const message = `[${timestamp}] ${reason}`

      violationCountRef.current += 1
      violationsListRef.current.push(message)

      const count = violationCountRef.current
      const currentList = [...violationsListRef.current]

      setViolationCount(count)
      setViolations(currentList)
      setLastWarningMessage(
        count >= maxViolations
          ? `Limite d'infractions atteinte (${count}/${maxViolations}). Soumission automatique de votre examen en cours...`
          : `Avertissement (${count}/${maxViolations}) : ${reason}. Veuillez rester concentré sur l'examen !`
      )
      setWarningModalOpen(true)
      onViolationRef.current?.(message, count)

      if (count >= maxViolations) {
        autoSubmitTriggeredRef.current = true
        if (onAutoSubmitRef.current) {
          setTimeout(() => {
            if (onAutoSubmitRef.current) {
              onAutoSubmitRef.current(count, currentList)
            }
          }, 1200)
        }
      }
    },
    [enabled, maxViolations]
  )

  const requestFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        setIsFullscreen(true)
        hasEverEnteredFullscreenRef.current = true
      }
    } catch (err) {
      console.warn("Fullscreen request failed or was refused:", err)
    }
  }, [])

  // 1. Détection de la touche Échap (Escape)
  useEffect(() => {
    if (!enabled) return

    function handleKeyDownEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        triggerViolation("Sortie du mode plein écran (Touche Échap détectée)")
      }
    }

    window.addEventListener('keydown', handleKeyDownEscape, { capture: true })
    return () => {
      window.removeEventListener('keydown', handleKeyDownEscape, { capture: true })
    }
  }, [enabled, triggerViolation])

  // 2. Détection du changement de plein écran (fullscreenchange)
  useEffect(() => {
    if (!enabled) return

    function handleFullscreenChange() {
      const active = Boolean(document.fullscreenElement)
      setIsFullscreen(active)
      // Si l'étudiant était en plein écran et le quitte
      if (hasEverEnteredFullscreenRef.current && !active) {
        triggerViolation("Sortie du mode plein écran obligatoire")
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [enabled, triggerViolation])

  // 3. Détection de changement d'onglet ou minimisation de la fenêtre
  useEffect(() => {
    if (!enabled) return

    function handleVisibilityChange() {
      if (document.hidden) {
        triggerViolation("Sortie de l'onglet d'examen détectée (changement d'application ou d'onglet)")
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, triggerViolation])

  // 4. Blocage clic droit, copier, coller, couper
  useEffect(() => {
    if (!enabled) return

    function handleCopy(e: ClipboardEvent) {
      e.preventDefault()
      triggerViolation("Tentative de copie de contenu non autorisée")
    }

    function handleCut(e: ClipboardEvent) {
      e.preventDefault()
      triggerViolation("Tentative de coupure de contenu")
    }

    function handlePaste(e: ClipboardEvent) {
      e.preventDefault()
      triggerViolation("Tentative de collage de contenu")
    }

    function handleContextMenu(e: MouseEvent) {
      e.preventDefault()
      triggerViolation("Clic droit désactivé durant l'examen")
    }

    document.addEventListener('copy', handleCopy)
    document.addEventListener('cut', handleCut)
    document.addEventListener('paste', handlePaste)
    document.addEventListener('contextmenu', handleContextMenu)

    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('cut', handleCut)
      document.removeEventListener('paste', handlePaste)
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [enabled, triggerViolation])

  // 5. Blocage raccourcis clavier (Ctrl+C, Ctrl+V, F12, DevTools)
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toUpperCase()
      const isCtrlOrMeta = e.ctrlKey || e.metaKey

      // Bloquer F12 (Inspecteur)
      if (e.key === 'F12') {
        e.preventDefault()
        triggerViolation("Touche F12 (Inspecteur DevTools) bloquée")
        return
      }

      // Bloquer Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
      if (isCtrlOrMeta && e.shiftKey && (key === 'I' || key === 'J' || key === 'C')) {
        e.preventDefault()
        triggerViolation("Ouverture des outils de développement bloquée")
        return
      }

      // Bloquer Ctrl+U (Afficher code source)
      if (isCtrlOrMeta && key === 'U') {
        e.preventDefault()
        triggerViolation("Affichage du code source bloqué")
        return
      }

      // Bloquer Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P
      if (isCtrlOrMeta && (key === 'C' || key === 'V' || key === 'X' || key === 'A' || key === 'P')) {
        e.preventDefault()
        triggerViolation(`Raccourci clavier Ctrl+${key} bloqué durant l'examen`)
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [enabled, triggerViolation])

  const dismissWarning = useCallback(() => {
    setWarningModalOpen(false)
  }, [])

  const getLatestViolations = useCallback(() => {
    return {
      count: violationCountRef.current,
      violations: [...violationsListRef.current],
    }
  }, [])

  return {
    violationCount,
    violations,
    isFullscreen,
    warningModalOpen,
    lastWarningMessage,
    dismissWarning,
    requestFullscreen,
    getLatestViolations,
  }
}
