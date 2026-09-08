import { useState } from 'react'
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfWeek,
  format,
  isSameMonth,
  startOfWeek,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useDaten } from '../store'
import { heuteISO, vonISO, zuISO } from '../datum'
import HinzufuegenSheet, {
  type Hinzufuegbar,
} from '../components/HinzufuegenSheet'
import TerminSheet from '../components/TerminSheet'
import AufgabeSheet from '../components/AufgabeSheet'
import ProjektSheet from '../components/ProjektSheet'
import HabitSheet from '../components/HabitSheet'
import MonatsAnsicht from './kalender/MonatsAnsicht'
import WochenAnsicht from './kalender/WochenAnsicht'
import JahresAnsicht from './kalender/JahresAnsicht'
import EintragsListe from './kalender/EintragsListe'
import type {
  Aufgabe,
  Habit,
  KalenderEintrag,
  Projekt,
  Termin,
} from '../types'

type Ansicht = 'jahr' | 'monat' | 'woche' | 'tag'

const ANSICHTEN: { wert: Ansicht; text: string }[] = [
  { wert: 'jahr', text: 'Jahr' },
  { wert: 'monat', text: 'Monat' },
  { wert: 'woche', text: 'Woche' },
  { wert: 'tag', text: 'Tag' },
]

export default function CalendarPage() {
  const { daten } = useDaten()

  const [ansicht, setAnsicht] = useState<Ansicht>('monat')

  /* Ein einziges Datum steuert alles: Es ist gleichzeitig der
     ausgewaehlte Tag UND der Anker fuer Monat, Woche und Jahr. */
  const [anker, setAnker] = useState<Date>(() => new Date())
  const gewaehlt = zuISO(anker)

  // Welcher Dialog ist offen?
  const [hinzufuegenOffen, setHinzufuegenOffen] = useState(false)
  const [terminDialog, setTerminDialog] = useState<{ termin: Termin | null } | null>(
    null,
  )
  const [aufgabeDialog, setAufgabeDialog] = useState<{
    aufgabe: Aufgabe | null
  } | null>(null)
  const [projektDialog, setProjektDialog] = useState<{
    projekt: Projekt | null
  } | null>(null)
  const [habitDialog, setHabitDialog] = useState<{ habit: Habit | null } | null>(null)

  /* ---------- Blaettern ---------- */
  function verschieben(richtung: -1 | 1) {
    setAnker((a) => {
      if (ansicht === 'jahr') return addYears(a, richtung)
      if (ansicht === 'monat') return addMonths(a, richtung)
      if (ansicht === 'woche') return addWeeks(a, richtung)
      return addDays(a, richtung)
    })
  }

  /** Beschriftung in der Mitte der Blaetterleiste */
  function zeitraumTitel(): string {
    if (ansicht === 'jahr') return format(anker, 'yyyy')
    if (ansicht === 'monat') return format(anker, 'MMMM yyyy', { locale: de })
    if (ansicht === 'tag') return format(anker, 'EEEE, d. MMMM', { locale: de })

    const start = startOfWeek(anker, { weekStartsOn: 1 })
    const ende = endOfWeek(anker, { weekStartsOn: 1 })
    const startText = isSameMonth(start, ende)
      ? format(start, 'd.')
      : format(start, 'd. MMM', { locale: de })
    return `${startText} - ${format(ende, 'd. MMM yyyy', { locale: de })}`
  }

  /* ---------- Einen vorhandenen Eintrag oeffnen ---------- */
  function eintragOeffnen(eintrag: KalenderEintrag) {
    if (eintrag.art === 'termin') {
      const termin = daten.termine.find((t) => t.id === eintrag.quellId)
      if (termin) setTerminDialog({ termin })
      return
    }
    if (eintrag.art === 'aufgabe') {
      const aufgabe = daten.aufgaben.find((a) => a.id === eintrag.quellId)
      if (aufgabe) setAufgabeDialog({ aufgabe })
      return
    }
    // projekt-start und projekt-ziel fuehren beide zum Projekt
    const projekt = daten.projekte.find((p) => p.id === eintrag.quellId)
    if (projekt) setProjektDialog({ projekt })
  }

  /* ---------- Neu anlegen ----------
     Egal was hier entsteht - es landet automatisch auch auf der
     passenden anderen Seite, weil alle Seiten dieselben Daten lesen. */
  function neuAnlegen(art: Hinzufuegbar) {
    setHinzufuegenOffen(false)
    if (art === 'termin') setTerminDialog({ termin: null })
    if (art === 'aufgabe') setAufgabeDialog({ aufgabe: null })
    if (art === 'projekt') setProjektDialog({ projekt: null })
    if (art === 'habit') setHabitDialog({ habit: null })
  }

  const istHeute = gewaehlt === heuteISO()

  return (
    <div className="space-y-4">
      {/* ---------- Kopf ---------- */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Kalender</h1>
        <button
          onClick={() => setHinzufuegenOffen(true)}
          aria-label="Hinzufuegen"
          className="-mr-1 rounded-full p-1.5 text-accent transition-transform
                     active:scale-90 active:bg-surface"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </header>

      {/* ---------- Umschalter Jahr / Monat / Woche / Tag ---------- */}
      <div className="flex gap-1 rounded-xl border border-line bg-surface p-1">
        {ANSICHTEN.map((a) => (
          <button
            key={a.wert}
            onClick={() => setAnsicht(a.wert)}
            className={`flex-1 rounded-lg py-1.5 text-sm transition-colors ${
              ansicht === a.wert
                ? 'bg-accent font-medium text-ink'
                : 'text-muted active:bg-surface-2'
            }`}
          >
            {a.text}
          </button>
        ))}
      </div>

      {/* ---------- Blaetterleiste ---------- */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => verschieben(-1)}
          aria-label="Zurueck"
          className="rounded-full p-2 text-muted active:bg-surface"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <p className="font-medium">{zeitraumTitel()}</p>
          {!istHeute && (
            <button
              onClick={() => setAnker(new Date())}
              className="text-xs text-accent"
            >
              zu heute springen
            </button>
          )}
        </div>

        <button
          onClick={() => verschieben(1)}
          aria-label="Weiter"
          className="rounded-full p-2 text-muted active:bg-surface"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* ---------- Die eigentliche Ansicht ---------- */}
      {ansicht === 'jahr' && (
        <JahresAnsicht
          jahr={anker.getFullYear()}
          onMonatWaehlen={(monat) => {
            setAnker(monat)
            setAnsicht('monat')
          }}
        />
      )}

      {ansicht === 'monat' && (
        <>
          <MonatsAnsicht
            anker={anker}
            gewaehlt={gewaehlt}
            onWaehlen={(datum) => setAnker(vonISO(datum))}
          />

          {/* Unter dem Raster stehen die Eintraege des gewaehlten Tages */}
          <section className="border-t border-line pt-4">
            <h2 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">
              {format(anker, 'EEEE, d. MMMM', { locale: de })}
            </h2>
            <EintragsListe
              datum={gewaehlt}
              onOeffnen={eintragOeffnen}
              leerText="Nichts geplant. Mit dem Plus oben rechts legst du etwas an."
            />
          </section>
        </>
      )}

      {ansicht === 'woche' && (
        <WochenAnsicht
          anker={anker}
          onOeffnen={eintragOeffnen}
          onTagWaehlen={(datum) => {
            setAnker(vonISO(datum))
            setAnsicht('tag')
          }}
        />
      )}

      {ansicht === 'tag' && (
        <EintragsListe
          datum={gewaehlt}
          onOeffnen={eintragOeffnen}
          leerText="Nichts geplant. Mit dem Plus oben rechts legst du etwas an."
        />
      )}

      {/* ---------- Dialoge ---------- */}
      {hinzufuegenOffen && (
        <HinzufuegenSheet
          onWahl={neuAnlegen}
          onSchliessen={() => setHinzufuegenOffen(false)}
        />
      )}

      {terminDialog && (
        <TerminSheet
          termin={terminDialog.termin}
          standardDatum={gewaehlt}
          onSchliessen={() => setTerminDialog(null)}
        />
      )}

      {aufgabeDialog && (
        <AufgabeSheet
          aufgabe={aufgabeDialog.aufgabe}
          standardDatum={gewaehlt}
          onSchliessen={() => setAufgabeDialog(null)}
        />
      )}

      {projektDialog && (
        <ProjektSheet
          projekt={projektDialog.projekt}
          standardDatum={gewaehlt}
          onSchliessen={() => setProjektDialog(null)}
        />
      )}

      {habitDialog && (
        <HabitSheet
          habit={habitDialog.habit}
          onSchliessen={() => setHabitDialog(null)}
        />
      )}
    </div>
  )
}
