import { Preferences } from '@capacitor/preferences'
import { LEERE_DATEN, type AppDaten } from './types'

/* ============================================================
   SPEICHERN & LADEN
   ------------------------------------------------------------
   Wir benutzen @capacitor/preferences statt direkt localStorage.
   Der Grund ist wichtig fuer die Homescreen-Widgets:

   - Im Browser legt Preferences die Daten intern im localStorage ab
     (Schluessel "CapacitorStorage.dailyplanner.v1") - es aendert sich
     also nichts an der Funktion.
   - In der Android-App landen sie in den "SharedPreferences" des
     Betriebssystems. Genau dort kann ein Widget in Kotlin sie lesen,
     ohne dass die App laufen muss.

   Deshalb ist alles hier asynchron ("await"): Android antwortet nicht
   sofort, sondern gibt die Daten kurz darauf zurueck.
   ============================================================ */

const SCHLUESSEL = 'dailyplanner.v1'

/** Frueherer Speicherort, bevor wir auf Capacitor umgestellt haben */
const ALTER_SCHLUESSEL = 'dailyplanner.v1'

/** Holt die gespeicherten Daten. Bei Problemen: leer starten. */
export async function datenLaden(): Promise<AppDaten> {
  try {
    const { value } = await Preferences.get({ key: SCHLUESSEL })

    if (value) {
      const gelesen = JSON.parse(value) as Partial<AppDaten>
      // Fehlende Listen auffuellen - schuetzt vor Abstuerzen, falls
      // eine aeltere Version der App weniger Felder gespeichert hat.
      return { ...LEERE_DATEN, ...gelesen }
    }

    // Noch nichts da? Vielleicht liegen Daten aus einer aelteren
    // Version der App im alten Speicher - die holen wir herueber.
    const uebernommen = await alteDatenUebernehmen()
    if (uebernommen) return uebernommen

    return LEERE_DATEN
  } catch (fehler) {
    console.error('Daten konnten nicht gelesen werden:', fehler)
    return LEERE_DATEN
  }
}

/** Schreibt die Daten in den Speicher. */
export async function datenSpeichern(daten: AppDaten): Promise<void> {
  try {
    await Preferences.set({ key: SCHLUESSEL, value: JSON.stringify(daten) })
  } catch (fehler) {
    console.error('Daten konnten nicht gespeichert werden:', fehler)
  }
}

/** Einmaliger Umzug vom alten localStorage-Eintrag nach Capacitor. */
async function alteDatenUebernehmen(): Promise<AppDaten | null> {
  try {
    if (typeof localStorage === 'undefined') return null

    const alt = localStorage.getItem(ALTER_SCHLUESSEL)
    if (!alt) return null

    const daten = { ...LEERE_DATEN, ...(JSON.parse(alt) as Partial<AppDaten>) }
    await datenSpeichern(daten)
    localStorage.removeItem(ALTER_SCHLUESSEL)

    console.info('Bisherige Daten wurden in den neuen Speicher uebernommen.')
    return daten
  } catch (fehler) {
    console.error('Uebernahme der alten Daten fehlgeschlagen:', fehler)
    return null
  }
}

/** Erzeugt eine eindeutige Kennung fuer neue Eintraege. */
export function neueId(): string {
  return crypto.randomUUID()
}
