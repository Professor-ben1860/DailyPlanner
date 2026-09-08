import { useState } from 'react'
import { Check, ChevronDown, ChevronRight, Circle } from 'lucide-react'
import { SeitenKopf, Abschnitt, LeerHinweis } from '../components/Ui'
import AufgabeSheet from '../components/AufgabeSheet'
import ProjektSheet from '../components/ProjektSheet'
import { useDaten } from '../store'
import { kurzesDatum } from '../datum'
import { aufgabenVonProjekt } from '../auswahl'
import type { Aufgabe, Projekt } from '../types'

/* Die Projekte-Seite mit zwei Feldern:
   1. Aufgaben zum Abhaken
   2. Laufende Projekte */
export default function ProjectsPage() {
  const { daten, aufgabeAbhaken } = useDaten()

  // Welcher Dialog ist gerade offen?
  const [aufgabeDialog, setAufgabeDialog] = useState<
    { aufgabe: Aufgabe | null } | null
  >(null)
  const [projektDialog, setProjektDialog] = useState<
    { projekt: Projekt | null } | null
  >(null)

  const [erledigteZeigen, setErledigteZeigen] = useState(false)

  const offeneAufgaben = daten.aufgaben.filter((a) => !a.erledigt)
  const erledigteAufgaben = daten.aufgaben.filter((a) => a.erledigt)

  const aktiveProjekte = daten.projekte.filter((p) => !p.erledigt)
  const fertigeProjekte = daten.projekte.filter((p) => p.erledigt)

  /** Zeigt Datum und Projektname unter dem Aufgabentitel an */
  function untertitel(aufgabe: Aufgabe): string {
    const teile: string[] = []
    if (aufgabe.datum) {
      teile.push(kurzesDatum(aufgabe.datum) + (aufgabe.uhrzeit ? ' · ' + aufgabe.uhrzeit : ''))
    }
    const projekt = daten.projekte.find((p) => p.id === aufgabe.projektId)
    if (projekt) teile.push(projekt.titel)
    return teile.join('  ·  ')
  }

  return (
    <div className="space-y-7">
      <SeitenKopf titel="Aktive Projekte" />

      {/* ---------------- Feld 1: Aufgaben ---------------- */}
      <Abschnitt
        titel="Aufgaben"
        onHinzufuegen={() => setAufgabeDialog({ aufgabe: null })}
        hinzufuegenLabel="Neue Aufgabe"
      >
        {offeneAufgaben.length === 0 ? (
          <LeerHinweis>
            Keine offenen Aufgaben.
            <br />
            Mit dem Plus oben rechts legst du eine an.
          </LeerHinweis>
        ) : (
          <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
            {offeneAufgaben.map((aufgabe, i) => (
              <li
                key={aufgabe.id}
                className={`flex items-center ${i > 0 ? 'border-t border-line' : ''}`}
              >
                <button
                  onClick={() => aufgabeAbhaken(aufgabe.id)}
                  className="py-3.5 pl-4 pr-3"
                  aria-label="Abhaken"
                >
                  <Circle size={18} className="text-muted" strokeWidth={1.5} />
                </button>

                <button
                  onClick={() => setAufgabeDialog({ aufgabe })}
                  className="flex-1 py-3.5 pr-4 text-left active:bg-surface-2"
                >
                  <span className="block">{aufgabe.titel}</span>
                  {untertitel(aufgabe) && (
                    <span className="mt-0.5 block text-xs text-muted">
                      {untertitel(aufgabe)}
                    </span>
                  )}
                </button>

                <span
                  className="mr-4 h-6 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: aufgabe.farbe }}
                />
              </li>
            ))}
          </ul>
        )}

        {/* Erledigtes bleibt eingeklappt, damit die Liste ruhig bleibt */}
        {erledigteAufgaben.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setErledigteZeigen((z) => !z)}
              className="flex w-full items-center gap-1.5 px-1 py-2 text-xs text-muted"
            >
              {erledigteZeigen ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
              Erledigt ({erledigteAufgaben.length})
            </button>

            {erledigteZeigen && (
              <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
                {erledigteAufgaben.map((aufgabe, i) => (
                  <li
                    key={aufgabe.id}
                    className={`flex items-center ${i > 0 ? 'border-t border-line' : ''}`}
                  >
                    <button
                      onClick={() => aufgabeAbhaken(aufgabe.id)}
                      className="py-3.5 pl-4 pr-3"
                      aria-label="Wieder oeffnen"
                    >
                      <Check
                        size={18}
                        className="animate-haken text-done"
                        strokeWidth={3}
                      />
                    </button>
                    <button
                      onClick={() => setAufgabeDialog({ aufgabe })}
                      className="flex-1 py-3.5 pr-4 text-left text-muted line-through active:bg-surface-2"
                    >
                      {aufgabe.titel}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Abschnitt>

      {/* ---------------- Feld 2: Projekte ---------------- */}
      <Abschnitt
        titel="Projekte"
        onHinzufuegen={() => setProjektDialog({ projekt: null })}
        hinzufuegenLabel="Neues Projekt"
      >
        {aktiveProjekte.length === 0 ? (
          <LeerHinweis>
            Noch keine aktiven Projekte.
            <br />
            Ein Projekt buendelt mehrere Aufgaben zu einem Vorhaben.
          </LeerHinweis>
        ) : (
          <ul className="space-y-2">
            {aktiveProjekte.map((projekt) => (
              <ProjektKarte
                key={projekt.id}
                projekt={projekt}
                erledigteAnzahl={
                  aufgabenVonProjekt(daten, projekt.id).filter((a) => a.erledigt).length
                }
                gesamtAnzahl={aufgabenVonProjekt(daten, projekt.id).length}
                onOeffnen={() => setProjektDialog({ projekt })}
              />
            ))}
          </ul>
        )}

        {fertigeProjekte.length > 0 && (
          <ul className="mt-2 space-y-2">
            {fertigeProjekte.map((projekt) => (
              <li key={projekt.id}>
                <button
                  onClick={() => setProjektDialog({ projekt })}
                  className="flex w-full items-center gap-3 rounded-2xl border border-line
                             px-4 py-3 text-left opacity-50 active:bg-surface"
                >
                  <Check size={16} className="text-done" strokeWidth={3} />
                  <span className="line-through">{projekt.titel}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Abschnitt>

      {/* ---------------- Dialoge ---------------- */}
      {aufgabeDialog && (
        <AufgabeSheet
          aufgabe={aufgabeDialog.aufgabe}
          onSchliessen={() => setAufgabeDialog(null)}
        />
      )}

      {projektDialog && (
        <ProjektSheet
          projekt={projektDialog.projekt}
          onSchliessen={() => setProjektDialog(null)}
        />
      )}
    </div>
  )
}

/* ---------- Eine einzelne Projektkarte ---------- */
function ProjektKarte({
  projekt,
  erledigteAnzahl,
  gesamtAnzahl,
  onOeffnen,
}: {
  projekt: Projekt
  erledigteAnzahl: number
  gesamtAnzahl: number
  onOeffnen: () => void
}) {
  const anteil = gesamtAnzahl > 0 ? erledigteAnzahl / gesamtAnzahl : 0

  const zeitraum = [
    projekt.startDatum ? kurzesDatum(projekt.startDatum) : null,
    projekt.zielDatum ? kurzesDatum(projekt.zielDatum) : null,
  ]
    .filter(Boolean)
    .join('  bis  ')

  return (
    <li>
      <button
        onClick={onOeffnen}
        className="w-full rounded-2xl border border-line bg-surface p-4 text-left
                   transition-colors active:bg-surface-2"
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-1 h-full min-h-10 w-1 shrink-0 rounded-full"
            style={{ backgroundColor: projekt.farbe }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium">{projekt.titel}</p>

            {zeitraum && <p className="mt-0.5 text-xs text-muted">{zeitraum}</p>}

            {projekt.notiz && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                {projekt.notiz}
              </p>
            )}

            {gesamtAnzahl > 0 && (
              <div className="mt-3">
                <div className="h-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${anteil * 100}%`,
                      backgroundColor: projekt.farbe,
                    }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  {erledigteAnzahl} von {gesamtAnzahl} Aufgaben erledigt
                </p>
              </div>
            )}
          </div>
        </div>
      </button>
    </li>
  )
}
