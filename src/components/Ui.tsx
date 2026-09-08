import { useEffect, useState, type ReactNode } from 'react'
import { Plus, Trash2 } from 'lucide-react'

/* ============================================================
   ALLGEMEINE BAUSTEINE
   Ueberschriften, Knoepfe und Hinweise - ueberall gleich.
   ============================================================ */

/** Grosse Ueberschrift ganz oben auf einer Seite */
export function SeitenKopf({
  titel,
  beschreibung,
}: {
  titel: string
  beschreibung?: string
}) {
  return (
    <header>
      <h1 className="text-3xl font-semibold tracking-tight">{titel}</h1>
      {beschreibung && <p className="mt-1 text-sm text-muted">{beschreibung}</p>}
    </header>
  )
}

/** Abschnitt mit grauer Ueberschrift und optionalem Plus-Knopf rechts */
export function Abschnitt({
  titel,
  onHinzufuegen,
  hinzufuegenLabel = 'Hinzufuegen',
  children,
}: {
  titel: string
  onHinzufuegen?: () => void
  hinzufuegenLabel?: string
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-medium uppercase tracking-widest text-muted">
          {titel}
        </h2>
        {onHinzufuegen && (
          <button
            onClick={onHinzufuegen}
            aria-label={hinzufuegenLabel}
            className="-mr-1 rounded-full p-1.5 text-accent transition-transform
                       active:scale-90 active:bg-surface"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

/** Standardknopf in drei Ausfuehrungen */
export function Knopf({
  children,
  onClick,
  variante = 'primaer',
  typ = 'button',
  breit,
  deaktiviert,
}: {
  children: ReactNode
  onClick?: () => void
  variante?: 'primaer' | 'sekundaer' | 'gefahr'
  typ?: 'button' | 'submit'
  breit?: boolean
  /** Ausgegraut und nicht anklickbar, solange Pflichtfelder fehlen */
  deaktiviert?: boolean
}) {
  const stile = {
    primaer: 'bg-accent text-ink font-medium',
    sekundaer: 'border border-line text-text',
    gefahr: 'text-red-400 border border-red-400/30',
  }

  return (
    <button
      type={typ}
      onClick={onClick}
      disabled={deaktiviert}
      className={`rounded-xl px-5 py-3 transition-opacity ${stile[variante]} ${
        breit ? 'w-full' : ''
      } ${deaktiviert ? 'cursor-not-allowed opacity-35' : 'active:opacity-70'}`}
    >
      {children}
    </button>
  )
}

/** Loeschen mit Sicherheitsabfrage: der erste Klick fragt nur nach. */
export function LoeschKnopf({
  onLoeschen,
  text = 'Loeschen',
}: {
  onLoeschen: () => void
  text?: string
}) {
  const [fragt, setFragt] = useState(false)

  // Nachfrage nach 4 Sekunden von selbst zuruecknehmen
  useEffect(() => {
    if (!fragt) return
    const timer = window.setTimeout(() => setFragt(false), 4000)
    return () => window.clearTimeout(timer)
  }, [fragt])

  if (fragt) {
    return (
      <div className="flex gap-2">
        <button
          onClick={onLoeschen}
          className="flex-1 rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3
                     text-red-300 transition-opacity active:opacity-70"
        >
          Wirklich loeschen
        </button>
        <button
          onClick={() => setFragt(false)}
          className="rounded-xl border border-line px-4 py-3 text-muted active:opacity-70"
        >
          Abbrechen
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setFragt(true)}
      className="flex w-full items-center justify-center gap-2 rounded-xl border
                 border-line px-4 py-3 text-muted transition-colors active:bg-surface-2"
    >
      <Trash2 size={16} />
      {text}
    </button>
  )
}

/** Ruhiger Hinweis, wenn eine Liste noch leer ist */
export function LeerHinweis({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-4 py-8 text-center">
      <p className="text-sm leading-relaxed text-muted">{children}</p>
    </div>
  )
}
