import { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Check, Circle, Minus, Plus, Trash2 } from 'lucide-react'
import { useUhrzeit } from '../hooks/useUhrzeit'
import { useDaten } from '../store'
import { heuteISO } from '../datum'
import {
  aktiveHabits,
  aufgabenFuerTag,
  fokusAufgaben,
  habitGeschafft,
  habitWert,
  termineFuerTag,
} from '../auswahl'

export default function TodayPage() {
  const jetzt = useUhrzeit()
  const heute = heuteISO()
  const { daten, aufgabeHinzufuegen, aufgabeAbhaken, aufgabeLoeschen, habitWertSetzen } =
    useDaten()

  // Text im Eingabefeld fuer neue Fokus-Aufgaben
  const [eingabe, setEingabe] = useState('')

  const fokus = fokusAufgaben(daten, heute)
  const termine = termineFuerTag(daten, heute)
  const habits = aktiveHabits(daten)

  // Aufgaben, die heute faellig sind, aber nicht im Fokus stehen
  const faellig = aufgabenFuerTag(daten, heute).filter((a) => a.fokusAm !== heute)

  const istLeer =
    fokus.length === 0 && termine.length === 0 && faellig.length === 0 && habits.length === 0

  function fokusAnlegen(event: React.FormEvent) {
    event.preventDefault()
    const titel = eingabe.trim()
    if (!titel) return

    // datum = heute sorgt dafuer, dass die Aufgabe auch im Kalender auftaucht
    aufgabeHinzufuegen({ titel, fokusAm: heute, datum: heute })
    setEingabe('')
  }

  return (
    <div className="space-y-7">
      {/* ---------- Kopfbereich mit Datum und laufender Uhr ---------- */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">
            {format(jetzt, 'EEEE', { locale: de })}
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight">
            {format(jetzt, 'd. MMMM', { locale: de })}
          </h1>
        </div>
        <div className="pb-1 text-right">
          <p className="text-3xl font-light tabular-nums leading-none text-accent">
            {format(jetzt, 'HH:mm')}
          </p>
          <p className="mt-1 text-xs tabular-nums text-muted">
            {format(jetzt, 'ss')} Sek.
          </p>
        </div>
      </header>

      {/* ---------- Fokus heute ---------- */}
      <section>
        <Ueberschrift>Fokus heute</Ueberschrift>

        {fokus.length > 0 && (
          <ul className="mb-2 overflow-hidden rounded-2xl border border-line bg-surface">
            {fokus.map((aufgabe, i) => (
              <li
                key={aufgabe.id}
                className={`group flex items-center gap-3 px-4 py-3.5 ${
                  i > 0 ? 'border-t border-line' : ''
                }`}
              >
                <button
                  onClick={() => aufgabeAbhaken(aufgabe.id)}
                  className="shrink-0"
                  aria-label={aufgabe.erledigt ? 'Wieder oeffnen' : 'Abhaken'}
                >
                  {aufgabe.erledigt ? (
                    <Check size={18} className="text-done" strokeWidth={3} />
                  ) : (
                    <Circle size={18} className="text-muted" strokeWidth={1.5} />
                  )}
                </button>

                <span
                  className={`flex-1 transition-all duration-300 ${
                    aufgabe.erledigt ? 'text-muted line-through' : 'text-text'
                  }`}
                >
                  {aufgabe.titel}
                </span>

                <button
                  onClick={() => aufgabeLoeschen(aufgabe.id)}
                  className="shrink-0 text-muted/50 transition-colors hover:text-text"
                  aria-label="Loeschen"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Schnelleingabe */}
        <form onSubmit={fokusAnlegen} className="flex gap-2">
          <input
            value={eingabe}
            onChange={(e) => setEingabe(e.target.value)}
            placeholder="Was ist heute wichtig?"
            className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-4 py-3
                       text-text placeholder:text-muted/70 outline-none
                       focus:border-accent/60"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-accent px-4 text-ink transition-opacity
                       active:opacity-70"
            aria-label="Hinzufuegen"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </form>

        {fokus.length >= 3 && (
          <p className="mt-2 text-xs text-muted">
            Du hast {fokus.length} Fokus-Aufgaben. Drei am Tag reichen meistens.
          </p>
        )}
      </section>

      {/* ---------- Termine ---------- */}
      {termine.length > 0 && (
        <section>
          <Ueberschrift>Termine</Ueberschrift>
          <ul className="space-y-2">
            {termine.map((termin) => (
              <li
                key={termin.id}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3.5"
              >
                <span
                  className="h-8 w-1 shrink-0 rounded-full"
                  style={{ backgroundColor: termin.farbe }}
                />
                <span className="w-12 shrink-0 text-sm tabular-nums text-muted">
                  {termin.ganztags ? 'ganzt.' : (termin.startZeit ?? '')}
                </span>
                <span className="flex-1">{termin.titel}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Heute faellig ---------- */}
      {faellig.length > 0 && (
        <section>
          <Ueberschrift>Heute faellig</Ueberschrift>
          <ul className="overflow-hidden rounded-2xl border border-line bg-surface">
            {faellig.map((aufgabe, i) => (
              <li
                key={aufgabe.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${
                  i > 0 ? 'border-t border-line' : ''
                }`}
              >
                <button onClick={() => aufgabeAbhaken(aufgabe.id)} className="shrink-0">
                  {aufgabe.erledigt ? (
                    <Check size={18} className="text-done" strokeWidth={3} />
                  ) : (
                    <Circle size={18} className="text-muted" strokeWidth={1.5} />
                  )}
                </button>
                <span
                  className={aufgabe.erledigt ? 'text-muted line-through' : 'text-text'}
                >
                  {aufgabe.titel}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- Gewohnheiten ---------- */}
      {habits.length > 0 && (
        <section>
          <Ueberschrift>Gewohnheiten</Ueberschrift>
          <ul className="space-y-2">
            {habits.map((habit) => {
              const wert = habitWert(daten, habit.id, heute)
              const geschafft = habitGeschafft(habit, wert)

              return (
                <li
                  key={habit.id}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3"
                >
                  <span
                    className="h-8 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: habit.farbe }}
                  />
                  <span className="flex-1">{habit.titel}</span>

                  {habit.typ === 'abhaken' ? (
                    <button
                      onClick={() => habitWertSetzen(habit.id, heute, wert > 0 ? 0 : 1)}
                      aria-label="Abhaken"
                    >
                      {wert > 0 ? (
                        <Check size={20} className="text-done" strokeWidth={3} />
                      ) : (
                        <Circle size={20} className="text-muted" strokeWidth={1.5} />
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => habitWertSetzen(habit.id, heute, wert - 1)}
                        className="rounded-lg border border-line p-1.5 text-muted active:bg-surface-2"
                        aria-label="Weniger"
                      >
                        <Minus size={14} />
                      </button>
                      <span
                        className={`w-10 text-center tabular-nums ${
                          geschafft ? 'text-done' : 'text-text'
                        }`}
                      >
                        {wert}
                      </span>
                      <button
                        onClick={() => habitWertSetzen(habit.id, heute, wert + 1)}
                        className="rounded-lg border border-line p-1.5 text-muted active:bg-surface-2"
                        aria-label="Mehr"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* ---------- Ruhiger Hinweis, wenn noch nichts da ist ---------- */}
      {istLeer && (
        <p className="pt-4 text-center text-sm leading-relaxed text-muted">
          Noch nichts geplant.
          <br />
          Trag oben ein, was heute zaehlt.
        </p>
      )}
    </div>
  )
}

/** Kleine graue Abschnittsueberschrift - damit alle gleich aussehen. */
function Ueberschrift({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 text-xs font-medium uppercase tracking-widest text-muted">
      {children}
    </h2>
  )
}
