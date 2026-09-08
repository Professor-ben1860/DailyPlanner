import { format, parseISO } from 'date-fns'
import { de } from 'date-fns/locale'
import type { ISODatum } from './types'

/* Kleine Helfer rund ums Datum.
   Wir speichern Daten immer als "2026-09-08" - dieses Format laesst
   sich sortieren, vergleichen und ist unabhaengig von der Zeitzone. */

/** Wandelt ein Datum in unser Speicherformat um: "2026-09-08" */
export function zuISO(datum: Date): ISODatum {
  return format(datum, 'yyyy-MM-dd')
}

/** Das heutige Datum im Speicherformat */
export function heuteISO(): ISODatum {
  return zuISO(new Date())
}

/** Macht aus "2026-09-08" wieder ein echtes Datum */
export function vonISO(text: ISODatum): Date {
  return parseISO(text)
}

/** Lesbare Ausgabe, z.B. "8. September 2026" */
export function langesDatum(text: ISODatum): string {
  return format(vonISO(text), 'd. MMMM yyyy', { locale: de })
}

/** Kurze Ausgabe, z.B. "Di, 8. Sep." */
export function kurzesDatum(text: ISODatum): string {
  return format(vonISO(text), 'EEE, d. MMM', { locale: de })
}
