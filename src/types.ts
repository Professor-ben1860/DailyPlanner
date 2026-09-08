/* ============================================================
   DATENMODELL - das Herzstueck der App
   ------------------------------------------------------------
   Wichtigste Idee: Es gibt nur EINE Aufgabenliste.
   Die Projekte-Seite und der Kalender sind nur zwei verschiedene
   Blickwinkel auf dieselben Aufgaben. Deshalb erscheint eine im
   Kalender angelegte Aufgabe automatisch auch bei den Projekten -
   ohne dass irgendetwas kopiert werden muss.

   "| null" heisst: das Feld darf leer sein.
   ============================================================ */

/** Ein Datum als Text, z.B. "2026-09-08" (Jahr-Monat-Tag) */
export type ISODatum = string

/** Eine Uhrzeit als Text, z.B. "14:30" */
export type ISOZeit = string

/* ---------- Aufgabe / To-Do ---------- */
export type Aufgabe = {
  id: string
  titel: string
  notiz: string
  /** Wenn gesetzt, taucht die Aufgabe an diesem Tag im Kalender auf */
  datum: ISODatum | null
  uhrzeit: ISOZeit | null
  erledigt: boolean
  /** Zeitpunkt des Abhakens - fuer spaetere Statistiken */
  erledigtAm: string | null
  /** Gehoert die Aufgabe zu einem Projekt? Dann steht hier dessen id */
  projektId: string | null
  /** An welchem Tag ist sie als "Fokus heute" markiert? */
  fokusAm: ISODatum | null
  farbe: string
  /** Zeitpunkt fuer eine Erinnerung - wird ab Schritt 6 genutzt */
  erinnerung: string | null
  erstelltAm: string
}

/* ---------- Projekt ---------- */
export type Projekt = {
  id: string
  titel: string
  notiz: string
  startDatum: ISODatum | null
  zielDatum: ISODatum | null
  farbe: string
  erledigt: boolean
  erinnerung: string | null
  erstelltAm: string
}

/* ---------- Termin (reiner Kalendereintrag) ---------- */
export type Termin = {
  id: string
  titel: string
  notiz: string
  datum: ISODatum
  ganztags: boolean
  startZeit: ISOZeit | null
  endZeit: ISOZeit | null
  /** Frei waehlbare Kategorie, z.B. "Arbeit", "Privat", "Arzt" */
  kategorie: string
  farbe: string
  erinnerung: string | null
  erstelltAm: string
}

/* ---------- Habit / Gewohnheit ---------- */
/** "abhaken" = geschafft ja/nein, "zaehlen" = eine Anzahl erfassen */
export type HabitTyp = 'abhaken' | 'zaehlen'

export type Habit = {
  id: string
  titel: string
  typ: HabitTyp
  /** Tagesziel: bei "abhaken" immer 1, bei "zaehlen" z.B. 8 Glas Wasser */
  ziel: number
  /** Einheit bei Zaehl-Gewohnheiten, z.B. "Glas", "Zigaretten" */
  einheit: string
  /** true = weniger ist besser (z.B. Zigaretten), false = mehr ist besser */
  wenigerIstBesser: boolean
  farbe: string
  erinnerung: string | null
  archiviert: boolean
  erstelltAm: string
}

/** Ein Tageswert einer Gewohnheit. id ist immer "habitId__datum". */
export type HabitEintrag = {
  id: string
  habitId: string
  datum: ISODatum
  wert: number
}

/* ---------- Notiz ---------- */
export type Notiz = {
  id: string
  titel: string
  inhalt: string
  /** Faerbt nur die Umrandung ein - die Grundflaeche bleibt schwarz */
  farbe: string
  erstelltAm: string
  geaendertAm: string
}

/* ---------- Alles zusammen ---------- */
export type AppDaten = {
  /** Erhoehen wir, falls sich das Datenmodell spaeter aendert */
  version: number
  aufgaben: Aufgabe[]
  projekte: Projekt[]
  termine: Termin[]
  habits: Habit[]
  habitEintraege: HabitEintrag[]
  notizen: Notiz[]
}

export const LEERE_DATEN: AppDaten = {
  version: 1,
  aufgaben: [],
  projekte: [],
  termine: [],
  habits: [],
  habitEintraege: [],
  notizen: [],
}

/* ---------- Farbauswahl ----------
   Diese Farben kannst du spaeter Terminen, Projekten und Notizen
   zuweisen. Gedaempfte Toene, damit die App ruhig bleibt. */
export const FARBEN = [
  { name: 'Orange', wert: '#ff7a1a' },
  { name: 'Blau', wert: '#60a5fa' },
  { name: 'Gruen', wert: '#4ade80' },
  { name: 'Lila', wert: '#a78bfa' },
  { name: 'Rosa', wert: '#f472b6' },
  { name: 'Gelb', wert: '#facc15' },
  { name: 'Tuerkis', wert: '#2dd4bf' },
  { name: 'Grau', wert: '#8a8a85' },
] as const

export const STANDARD_FARBE = FARBEN[0].wert

/* ---------- Kalender-Ansicht ----------
   Der Kalender zeigt Termine, datierte Aufgaben UND Projekt-Termine
   gemeinsam an. Damit die Ansichten nicht jedes Mal drei verschiedene
   Datentypen unterscheiden muessen, rechnen wir sie vorher in dieses
   einheitliche Format um. Gespeichert wird das nie - es entsteht nur
   zur Anzeige. */
export type EintragsArt = 'termin' | 'aufgabe' | 'projekt-start' | 'projekt-ziel'

export type KalenderEintrag = {
  /** Kennung des urspruenglichen Eintrags (Termin, Aufgabe oder Projekt) */
  quellId: string
  art: EintragsArt
  titel: string
  zeit: ISOZeit | null
  ganztags: boolean
  farbe: string
  erledigt: boolean
}
