import { Check, Circle } from 'lucide-react'
import { useDaten } from '../../store'
import { eintraegeFuerTag } from '../../auswahl'
import type { ISODatum, KalenderEintrag } from '../../types'

type Props = {
  datum: ISODatum
  onOeffnen: (eintrag: KalenderEintrag) => void
  /** Text, falls an dem Tag nichts ansteht. Ohne Text bleibt es leer. */
  leerText?: string
}

/* Die Liste aller Eintraege eines Tages.
   Wird von der Tages-, Wochen- und Monatsansicht gemeinsam benutzt,
   damit ein Termin ueberall gleich aussieht. */
export default function EintragsListe({ datum, onOeffnen, leerText }: Props) {
  const { daten, aufgabeAbhaken } = useDaten()
  const eintraege = eintraegeFuerTag(daten, datum)

  if (eintraege.length === 0) {
    return leerText ? (
      <p className="px-1 py-3 text-sm text-muted">{leerText}</p>
    ) : null
  }

  return (
    <ul className="space-y-2">
      {eintraege.map((eintrag) => (
        <li
          key={eintrag.art + eintrag.quellId}
          className="flex items-center gap-3 rounded-2xl border border-line bg-surface pr-3"
        >
          <span
            className="my-3 ml-3 h-8 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: eintrag.farbe }}
          />

          {/* "ganztaegig" nur bei echten Terminen - eine Aufgabe ohne
              Uhrzeit ist nicht ganztaegig, sie hat einfach keine Zeit. */}
          <span className="w-12 shrink-0 text-xs tabular-nums text-muted">
            {eintrag.zeit ??
              (eintrag.art === 'termin' && eintrag.ganztags ? 'ganzt.' : '')}
          </span>

          <button
            onClick={() => onOeffnen(eintrag)}
            className="min-w-0 flex-1 py-3 text-left"
          >
            <span
              className={`block truncate ${
                eintrag.erledigt ? 'text-muted line-through' : ''
              }`}
            >
              {eintrag.titel}
            </span>
          </button>

          {/* Nur Aufgaben lassen sich direkt hier abhaken */}
          {eintrag.art === 'aufgabe' && (
            <button
              onClick={() => aufgabeAbhaken(eintrag.quellId)}
              className="shrink-0 p-1"
              aria-label="Abhaken"
            >
              {eintrag.erledigt ? (
                <Check size={18} className="animate-haken text-done" strokeWidth={3} />
              ) : (
                <Circle size={18} className="text-muted" strokeWidth={1.5} />
              )}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}
