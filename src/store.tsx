import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { datenLaden, datenSpeichern, neueId } from './storage'
import {
  LEERE_DATEN,
  STANDARD_FARBE,
  type AppDaten,
  type Aufgabe,
  type Habit,
  type HabitEintrag,
  type ISODatum,
  type Notiz,
  type Projekt,
  type Termin,
} from './types'

/* ============================================================
   DER DATEN-SPEICHER
   ------------------------------------------------------------
   Diese Datei haelt ALLE Daten der App an einer Stelle und bietet
   Funktionen zum Hinzufuegen, Aendern und Loeschen an.

   Jede Seite kann sie so benutzen:

       const { daten, aufgabeHinzufuegen } = useDaten()

   Nach jeder Aenderung wird automatisch gespeichert.
   ============================================================ */

/** Beim Anlegen ist nur der Titel Pflicht, alles andere optional. */
type Teilweise<T> = Partial<T> & { titel: string }

type DatenContext = {
  daten: AppDaten

  // Aufgaben
  aufgabeHinzufuegen: (werte: Teilweise<Aufgabe>) => Aufgabe
  aufgabeAendern: (id: string, werte: Partial<Aufgabe>) => void
  aufgabeLoeschen: (id: string) => void
  aufgabeAbhaken: (id: string) => void
  fokusUmschalten: (id: string, datum: ISODatum) => void

  // Projekte
  projektHinzufuegen: (werte: Teilweise<Projekt>) => Projekt
  projektAendern: (id: string, werte: Partial<Projekt>) => void
  projektLoeschen: (id: string) => void

  // Termine
  terminHinzufuegen: (werte: Teilweise<Termin> & { datum: ISODatum }) => Termin
  terminAendern: (id: string, werte: Partial<Termin>) => void
  terminLoeschen: (id: string) => void

  // Habits
  habitHinzufuegen: (werte: Teilweise<Habit>) => Habit
  habitAendern: (id: string, werte: Partial<Habit>) => void
  habitLoeschen: (id: string) => void
  habitWertSetzen: (habitId: string, datum: ISODatum, wert: number) => void

  // Notizen
  notizHinzufuegen: (werte: Teilweise<Notiz>) => Notiz
  notizAendern: (id: string, werte: Partial<Notiz>) => void
  notizLoeschen: (id: string) => void

  /** Loescht wirklich alles - praktisch zum Ausprobieren */
  allesZuruecksetzen: () => void
}

const Context = createContext<DatenContext | null>(null)

export function DatenProvider({ children }: { children: ReactNode }) {
  const [daten, setDaten] = useState<AppDaten>(LEERE_DATEN)

  /* Der Speicher antwortet auf dem Handy nicht sofort. Deshalb starten
     wir leer und merken uns, ob die echten Daten schon da sind. */
  const [geladen, setGeladen] = useState(false)

  // Beim Start einmal aus dem Speicher lesen
  useEffect(() => {
    let abgebrochen = false

    datenLaden().then((gelesen) => {
      if (abgebrochen) return
      setDaten(gelesen)
      setGeladen(true)
    })

    // Falls die App vorher geschlossen wird: Ergebnis verwerfen
    return () => {
      abgebrochen = true
    }
  }, [])

  // Nach jeder Aenderung automatisch zurueckschreiben
  useEffect(() => {
    // WICHTIG: Solange nicht geladen ist, wuerden wir die noch leeren
    // Startdaten ueber die echten schreiben und alles loeschen.
    if (!geladen) return
    datenSpeichern(daten)
  }, [daten, geladen])

  /* ---------------- Aufgaben ---------------- */

  const aufgabeHinzufuegen = useCallback((werte: Teilweise<Aufgabe>) => {
    const neu: Aufgabe = {
      id: neueId(),
      notiz: '',
      datum: null,
      uhrzeit: null,
      erledigt: false,
      erledigtAm: null,
      projektId: null,
      fokusAm: null,
      farbe: STANDARD_FARBE,
      erinnerung: null,
      erstelltAm: new Date().toISOString(),
      ...werte,
    }
    setDaten((d) => ({ ...d, aufgaben: [...d.aufgaben, neu] }))
    return neu
  }, [])

  const aufgabeAendern = useCallback((id: string, werte: Partial<Aufgabe>) => {
    setDaten((d) => ({
      ...d,
      aufgaben: d.aufgaben.map((a) => (a.id === id ? { ...a, ...werte } : a)),
    }))
  }, [])

  const aufgabeLoeschen = useCallback((id: string) => {
    setDaten((d) => ({ ...d, aufgaben: d.aufgaben.filter((a) => a.id !== id) }))
  }, [])

  const aufgabeAbhaken = useCallback((id: string) => {
    setDaten((d) => ({
      ...d,
      aufgaben: d.aufgaben.map((a) =>
        a.id === id
          ? {
              ...a,
              erledigt: !a.erledigt,
              erledigtAm: a.erledigt ? null : new Date().toISOString(),
            }
          : a,
      ),
    }))
  }, [])

  /** Markiert eine Aufgabe als Tagesfokus - oder nimmt die Markierung weg. */
  const fokusUmschalten = useCallback((id: string, datum: ISODatum) => {
    setDaten((d) => ({
      ...d,
      aufgaben: d.aufgaben.map((a) =>
        a.id === id ? { ...a, fokusAm: a.fokusAm === datum ? null : datum } : a,
      ),
    }))
  }, [])

  /* ---------------- Projekte ---------------- */

  const projektHinzufuegen = useCallback((werte: Teilweise<Projekt>) => {
    const neu: Projekt = {
      id: neueId(),
      notiz: '',
      startDatum: null,
      zielDatum: null,
      farbe: STANDARD_FARBE,
      erledigt: false,
      erinnerung: null,
      erstelltAm: new Date().toISOString(),
      ...werte,
    }
    setDaten((d) => ({ ...d, projekte: [...d.projekte, neu] }))
    return neu
  }, [])

  const projektAendern = useCallback((id: string, werte: Partial<Projekt>) => {
    setDaten((d) => ({
      ...d,
      projekte: d.projekte.map((p) => (p.id === id ? { ...p, ...werte } : p)),
    }))
  }, [])

  /** Loescht das Projekt und loest die Zuordnung seiner Aufgaben. */
  const projektLoeschen = useCallback((id: string) => {
    setDaten((d) => ({
      ...d,
      projekte: d.projekte.filter((p) => p.id !== id),
      aufgaben: d.aufgaben.map((a) =>
        a.projektId === id ? { ...a, projektId: null } : a,
      ),
    }))
  }, [])

  /* ---------------- Termine ---------------- */

  const terminHinzufuegen = useCallback(
    (werte: Teilweise<Termin> & { datum: ISODatum }) => {
      const neu: Termin = {
        id: neueId(),
        notiz: '',
        ganztags: false,
        startZeit: null,
        endZeit: null,
        kategorie: '',
        farbe: STANDARD_FARBE,
        erinnerung: null,
        erstelltAm: new Date().toISOString(),
        ...werte,
      }
      setDaten((d) => ({ ...d, termine: [...d.termine, neu] }))
      return neu
    },
    [],
  )

  const terminAendern = useCallback((id: string, werte: Partial<Termin>) => {
    setDaten((d) => ({
      ...d,
      termine: d.termine.map((t) => (t.id === id ? { ...t, ...werte } : t)),
    }))
  }, [])

  const terminLoeschen = useCallback((id: string) => {
    setDaten((d) => ({ ...d, termine: d.termine.filter((t) => t.id !== id) }))
  }, [])

  /* ---------------- Habits ---------------- */

  const habitHinzufuegen = useCallback((werte: Teilweise<Habit>) => {
    const neu: Habit = {
      id: neueId(),
      typ: 'abhaken',
      ziel: 1,
      einheit: '',
      wenigerIstBesser: false,
      farbe: STANDARD_FARBE,
      erinnerung: null,
      archiviert: false,
      erstelltAm: new Date().toISOString(),
      ...werte,
    }
    setDaten((d) => ({ ...d, habits: [...d.habits, neu] }))
    return neu
  }, [])

  const habitAendern = useCallback((id: string, werte: Partial<Habit>) => {
    setDaten((d) => ({
      ...d,
      habits: d.habits.map((h) => (h.id === id ? { ...h, ...werte } : h)),
    }))
  }, [])

  /** Loescht die Gewohnheit samt aller erfassten Tageswerte. */
  const habitLoeschen = useCallback((id: string) => {
    setDaten((d) => ({
      ...d,
      habits: d.habits.filter((h) => h.id !== id),
      habitEintraege: d.habitEintraege.filter((e) => e.habitId !== id),
    }))
  }, [])

  const habitWertSetzen = useCallback(
    (habitId: string, datum: ISODatum, wert: number) => {
      const id = habitId + '__' + datum
      const sicher = Math.max(0, wert)

      setDaten((d) => {
        // Wert 0 braucht keinen Eintrag - haelt den Speicher klein
        if (sicher === 0) {
          return {
            ...d,
            habitEintraege: d.habitEintraege.filter((e) => e.id !== id),
          }
        }

        const vorhanden = d.habitEintraege.some((e) => e.id === id)
        if (vorhanden) {
          return {
            ...d,
            habitEintraege: d.habitEintraege.map((e) =>
              e.id === id ? { ...e, wert: sicher } : e,
            ),
          }
        }

        const neu: HabitEintrag = { id, habitId, datum, wert: sicher }
        return { ...d, habitEintraege: [...d.habitEintraege, neu] }
      })
    },
    [],
  )

  /* ---------------- Notizen ---------------- */

  const notizHinzufuegen = useCallback((werte: Teilweise<Notiz>) => {
    const zeitpunkt = new Date().toISOString()
    const neu: Notiz = {
      id: neueId(),
      inhalt: '',
      farbe: STANDARD_FARBE,
      erstelltAm: zeitpunkt,
      geaendertAm: zeitpunkt,
      ...werte,
    }
    // Neueste Notiz kommt nach oben
    setDaten((d) => ({ ...d, notizen: [neu, ...d.notizen] }))
    return neu
  }, [])

  const notizAendern = useCallback((id: string, werte: Partial<Notiz>) => {
    setDaten((d) => ({
      ...d,
      notizen: d.notizen.map((n) =>
        n.id === id
          ? { ...n, ...werte, geaendertAm: new Date().toISOString() }
          : n,
      ),
    }))
  }, [])

  const notizLoeschen = useCallback((id: string) => {
    setDaten((d) => ({ ...d, notizen: d.notizen.filter((n) => n.id !== id) }))
  }, [])

  const allesZuruecksetzen = useCallback(() => {
    setDaten(LEERE_DATEN)
  }, [])

  const wert = useMemo<DatenContext>(
    () => ({
      daten,
      aufgabeHinzufuegen,
      aufgabeAendern,
      aufgabeLoeschen,
      aufgabeAbhaken,
      fokusUmschalten,
      projektHinzufuegen,
      projektAendern,
      projektLoeschen,
      terminHinzufuegen,
      terminAendern,
      terminLoeschen,
      habitHinzufuegen,
      habitAendern,
      habitLoeschen,
      habitWertSetzen,
      notizHinzufuegen,
      notizAendern,
      notizLoeschen,
      allesZuruecksetzen,
    }),
    [
      daten,
      aufgabeHinzufuegen,
      aufgabeAendern,
      aufgabeLoeschen,
      aufgabeAbhaken,
      fokusUmschalten,
      projektHinzufuegen,
      projektAendern,
      projektLoeschen,
      terminHinzufuegen,
      terminAendern,
      terminLoeschen,
      habitHinzufuegen,
      habitAendern,
      habitLoeschen,
      habitWertSetzen,
      notizHinzufuegen,
      notizAendern,
      notizLoeschen,
      allesZuruecksetzen,
    ],
  )

  /* Bis die Daten da sind, ein ruhiger schwarzer Bildschirm mit
     pulsierendem Punkt - meist nur den Bruchteil einer Sekunde. */
  if (!geladen) {
    return (
      <div className="flex h-full items-center justify-center bg-ink">
        <span className="h-3 w-3 animate-pulse rounded-full bg-accent" />
      </div>
    )
  }

  return <Context.Provider value={wert}>{children}</Context.Provider>
}

/** Zugriff auf die Daten von jeder Seite aus. */
export function useDaten(): DatenContext {
  const context = useContext(Context)
  if (!context) {
    throw new Error('useDaten muss innerhalb von <DatenProvider> benutzt werden')
  }
  return context
}
