import { subDays } from 'date-fns'
import { vonISO, zuISO } from './datum'
import type {
  AppDaten,
  Aufgabe,
  Habit,
  ISODatum,
  KalenderEintrag,
  Termin,
} from './types'

/* ============================================================
   AUSWAHL-FUNKTIONEN ("Wer gehoert auf welche Seite?")
   ------------------------------------------------------------
   Diese Funktionen aendern nichts. Sie durchsuchen nur die Daten
   und geben zurueck, was gerade angezeigt werden soll.

   Genau hier entsteht der Effekt, den du dir gewuenscht hast:
   eine Aufgabe mit Datum erscheint automatisch im Kalender,
   ohne dass sie doppelt gespeichert wird.
   ============================================================ */

/** Sortiert nach Uhrzeit; Eintraege ohne Uhrzeit kommen nach oben. */
function nachUhrzeit(a: ISOZeitTraeger, b: ISOZeitTraeger): number {
  if (!a.zeit && !b.zeit) return 0
  if (!a.zeit) return -1
  if (!b.zeit) return 1
  return a.zeit.localeCompare(b.zeit)
}

type ISOZeitTraeger = { zeit: string | null }

/* ---------------- Termine ---------------- */

/** Alle Termine eines bestimmten Tages, zeitlich sortiert. */
export function termineFuerTag(daten: AppDaten, datum: ISODatum): Termin[] {
  return daten.termine
    .filter((t) => t.datum === datum)
    .sort((a, b) => nachUhrzeit({ zeit: a.startZeit }, { zeit: b.startZeit }))
}

/* ---------------- Aufgaben ---------------- */

/** Alle Aufgaben, die auf einen bestimmten Tag datiert sind. */
export function aufgabenFuerTag(daten: AppDaten, datum: ISODatum): Aufgabe[] {
  return daten.aufgaben
    .filter((a) => a.datum === datum)
    .sort((a, b) => nachUhrzeit({ zeit: a.uhrzeit }, { zeit: b.uhrzeit }))
}

/** Die als Tagesfokus markierten Aufgaben. */
export function fokusAufgaben(daten: AppDaten, datum: ISODatum): Aufgabe[] {
  return daten.aufgaben
    .filter((a) => a.fokusAm === datum)
    .sort((a, b) => a.erstelltAm.localeCompare(b.erstelltAm))
}

/** Offene Aufgaben ohne Datum - die "irgendwann"-Liste. */
export function offeneAufgabenOhneDatum(daten: AppDaten): Aufgabe[] {
  return daten.aufgaben.filter((a) => !a.erledigt && a.datum === null)
}

/** Alle Aufgaben, die zu einem Projekt gehoeren. */
export function aufgabenVonProjekt(daten: AppDaten, projektId: string): Aufgabe[] {
  return daten.aufgaben.filter((a) => a.projektId === projektId)
}

/* ---------------- Habits ---------------- */

/** Der erfasste Wert einer Gewohnheit an einem Tag (0 = noch nichts). */
export function habitWert(
  daten: AppDaten,
  habitId: string,
  datum: ISODatum,
): number {
  const eintrag = daten.habitEintraege.find(
    (e) => e.habitId === habitId && e.datum === datum,
  )
  return eintrag ? eintrag.wert : 0
}

/** Ist das Tagesziel erreicht? Beachtet auch "weniger ist besser". */
export function habitGeschafft(habit: Habit, wert: number): boolean {
  if (habit.wenigerIstBesser) return wert <= habit.ziel
  return wert >= habit.ziel
}

/** Alle aktiven (nicht archivierten) Gewohnheiten. */
export function aktiveHabits(daten: AppDaten): Habit[] {
  return daten.habits.filter((h) => !h.archiviert)
}

/* ---------------- Serien ("Streaks") ---------------- */

/** Liefert die letzten n Tage bis einschliesslich bisDatum, aelteste zuerst. */
export function letzteTage(bisDatum: ISODatum, anzahl: number): ISODatum[] {
  const tage: ISODatum[] = []
  const start = vonISO(bisDatum)
  for (let i = anzahl - 1; i >= 0; i--) {
    tage.push(zuISO(subDays(start, i)))
  }
  return tage
}

/**
 * Wie viele Tage am Stueck wurde das Ziel erreicht?
 * Der heutige Tag zaehlt nur mit, wenn er schon geschafft ist -
 * so entsteht kein "Verpasst"-Gefuehl mitten am Tag.
 */
export function habitStreak(
  daten: AppDaten,
  habit: Habit,
  bisDatum: ISODatum,
): number {
  // Vor dem Anlegen der Gewohnheit gibt es nichts zu zaehlen
  const erstelltTag = habit.erstelltAm.slice(0, 10)

  let tag = vonISO(bisDatum)
  if (!habitGeschafft(habit, habitWert(daten, habit.id, zuISO(tag)))) {
    tag = subDays(tag, 1)
  }

  let serie = 0
  while (zuISO(tag) >= erstelltTag) {
    if (!habitGeschafft(habit, habitWert(daten, habit.id, zuISO(tag)))) break
    serie++
    tag = subDays(tag, 1)
  }
  return serie
}

/* ---------------- Kalender ---------------- */

/**
 * Alles, was an einem Tag ansteht - aus allen drei Quellen zusammengefuehrt:
 * Termine, datierte Aufgaben sowie Start- und Zieltage von Projekten.
 * Genau hier entsteht der Effekt, dass eine Aufgabe mit Datum von selbst
 * im Kalender auftaucht.
 */
export function eintraegeFuerTag(
  daten: AppDaten,
  datum: ISODatum,
): KalenderEintrag[] {
  const eintraege: KalenderEintrag[] = []

  for (const termin of daten.termine) {
    if (termin.datum !== datum) continue
    eintraege.push({
      quellId: termin.id,
      art: 'termin',
      titel: termin.titel,
      zeit: termin.ganztags ? null : termin.startZeit,
      ganztags: termin.ganztags,
      farbe: termin.farbe,
      erledigt: false,
    })
  }

  for (const aufgabe of daten.aufgaben) {
    if (aufgabe.datum !== datum) continue
    eintraege.push({
      quellId: aufgabe.id,
      art: 'aufgabe',
      titel: aufgabe.titel,
      zeit: aufgabe.uhrzeit,
      ganztags: aufgabe.uhrzeit === null,
      farbe: aufgabe.farbe,
      erledigt: aufgabe.erledigt,
    })
  }

  for (const projekt of daten.projekte) {
    if (projekt.startDatum === datum) {
      eintraege.push({
        quellId: projekt.id,
        art: 'projekt-start',
        titel: projekt.titel + ' - Start',
        zeit: null,
        ganztags: true,
        farbe: projekt.farbe,
        erledigt: projekt.erledigt,
      })
    }
    if (projekt.zielDatum === datum) {
      eintraege.push({
        quellId: projekt.id,
        art: 'projekt-ziel',
        titel: projekt.titel + ' - Ziel',
        zeit: null,
        ganztags: true,
        farbe: projekt.farbe,
        erledigt: projekt.erledigt,
      })
    }
  }

  // Ohne Uhrzeit zuerst, danach chronologisch
  return eintraege.sort((a, b) => {
    if (!a.zeit && !b.zeit) return 0
    if (!a.zeit) return -1
    if (!b.zeit) return 1
    return a.zeit.localeCompare(b.zeit)
  })
}

/** Die Farben eines Tages - fuer die kleinen Punkte im Monatsraster. */
export function farbenFuerTag(
  daten: AppDaten,
  datum: ISODatum,
  hoechstens = 3,
): string[] {
  const farben: string[] = []
  for (const eintrag of eintraegeFuerTag(daten, datum)) {
    if (!farben.includes(eintrag.farbe)) farben.push(eintrag.farbe)
    if (farben.length >= hoechstens) break
  }
  return farben
}

/** Hat dieser Tag ueberhaupt Eintraege? Fuer die Jahresansicht. */
export function tagHatEintraege(daten: AppDaten, datum: ISODatum): boolean {
  return (
    daten.termine.some((t) => t.datum === datum) ||
    daten.aufgaben.some((a) => a.datum === datum) ||
    daten.projekte.some((p) => p.startDatum === datum || p.zielDatum === datum)
  )
}
