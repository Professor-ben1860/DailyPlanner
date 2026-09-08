import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

type Props = {
  offen: boolean
  titel: string
  onSchliessen: () => void
  children: ReactNode
  /** Knoepfe am unteren Rand, z.B. "Speichern" */
  fussleiste?: ReactNode
}

/* ============================================================
   SHEET - das Fenster, das von unten hereinfaehrt
   ------------------------------------------------------------
   Wird zum Hinzufuegen und Bearbeiten benutzt. Auf dem Handy
   fuehlt sich das natuerlicher an als ein Fenster in der Mitte,
   weil es in Daumennaehe erscheint.
   ============================================================ */
export default function Sheet({
  offen,
  titel,
  onSchliessen,
  children,
  fussleiste,
}: Props) {
  // Mit der Escape-Taste schliessen (praktisch am Computer)
  useEffect(() => {
    if (!offen) return

    function beiTaste(e: KeyboardEvent) {
      if (e.key === 'Escape') onSchliessen()
    }
    window.addEventListener('keydown', beiTaste)
    return () => window.removeEventListener('keydown', beiTaste)
  }, [offen, onSchliessen])

  // Hintergrund nicht mitscrollen lassen, solange das Sheet offen ist
  useEffect(() => {
    if (!offen) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [offen])

  if (!offen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Abdunkelnder Hintergrund - Antippen schliesst */}
      <button
        onClick={onSchliessen}
        className="animate-fade absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Schliessen"
      />

      {/* Das eigentliche Fenster */}
      <div
        className="animate-sheet relative flex max-h-[88vh] flex-col rounded-t-3xl
                   border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
      >
        {/* Kleiner Griff wie bei nativen Apps */}
        <div className="flex justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-line" />
        </div>

        <header className="flex items-center justify-between px-5 pb-3 pt-3">
          <h2 className="text-lg font-semibold">{titel}</h2>
          <button
            onClick={onSchliessen}
            className="rounded-full p-1.5 text-muted active:bg-surface-2"
            aria-label="Schliessen"
          >
            <X size={20} />
          </button>
        </header>

        {/* Scrollbarer Inhalt */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>

        {fussleiste && (
          <div className="border-t border-line px-5 py-3">{fussleiste}</div>
        )}
      </div>
    </div>
  )
}
