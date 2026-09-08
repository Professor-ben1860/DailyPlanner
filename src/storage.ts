import { LEERE_DATEN, type AppDaten } from './types'

/* ============================================================
   SPEICHERN & LADEN
   ------------------------------------------------------------
   Aktuell speichern wir im "localStorage" des Browsers. Das ist
   ein kleiner Speicher, den jede Webseite fuer sich hat - die
   Daten bleiben also erhalten, wenn du die App schliesst.

   Ab Schritt 6 tauschen wir hier drin den Speicher gegen
   @capacitor/preferences aus, damit auch die Homescreen-Widgets
   an die Daten kommen. Weil alles in DIESER Datei gekapselt ist,
   muss der Rest der App dafuer nicht angefasst werden.
   ============================================================ */

const SPEICHER_SCHLUESSEL = 'dailyplanner.v1'

/** Holt die gespeicherten Daten. Bei Problemen: leer starten. */
export function datenLaden(): AppDaten {
  try {
    const roh = localStorage.getItem(SPEICHER_SCHLUESSEL)
    if (!roh) return LEERE_DATEN

    const gelesen = JSON.parse(roh) as Partial<AppDaten>

    // Fehlende Listen auffuellen - schuetzt vor Abstuerzen, falls
    // eine aeltere Version der App weniger Felder gespeichert hat.
    return { ...LEERE_DATEN, ...gelesen }
  } catch (fehler) {
    console.error('Daten konnten nicht gelesen werden:', fehler)
    return LEERE_DATEN
  }
}

/** Schreibt die Daten in den Speicher. */
export function datenSpeichern(daten: AppDaten): void {
  try {
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(daten))
  } catch (fehler) {
    console.error('Daten konnten nicht gespeichert werden:', fehler)
  }
}

/** Erzeugt eine eindeutige Kennung fuer neue Eintraege. */
export function neueId(): string {
  return crypto.randomUUID()
}
