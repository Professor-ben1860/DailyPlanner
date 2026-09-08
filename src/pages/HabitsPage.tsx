import { useState } from 'react'
import { Check, Circle, Minus, Plus } from 'lucide-react'
import { SeitenKopf, Abschnitt, LeerHinweis } from '../components/Ui'
import HabitSheet from '../components/HabitSheet'
import { useDaten } from '../store'
import { heuteISO } from '../datum'
import {
  aktiveHabits,
  habitGeschafft,
  habitStreak,
  habitWert,
  letzteTage,
} from '../auswahl'
import type { AppDaten, Habit } from '../types'

export default function HabitsPage() {
  const { daten, habitWertSetzen } = useDaten()
  const heute = heuteISO()

  const [dialog, setDialog] = useState<{ habit: Habit | null } | null>(null)
  const habits = aktiveHabits(daten)

  return (
    <div className="space-y-7">
      <SeitenKopf titel="Habits" beschreibung="Kleine Dinge, jeden Tag." />

      <Abschnitt
        titel="Gewohnheiten"
        onHinzufuegen={() => setDialog({ habit: null })}
        hinzufuegenLabel="Neue Gewohnheit"
      >
        {habits.length === 0 ? (
          <LeerHinweis>
            Noch keine Gewohnheiten.
            <br />
            Fang mit einer einzigen an - das haelt am laengsten.
          </LeerHinweis>
        ) : (
          <ul className="space-y-2">
            {habits.map((habit) => (
              <HabitKarte
                key={habit.id}
                habit={habit}
                daten={daten}
                heute={heute}
                onWert={(wert) => habitWertSetzen(habit.id, heute, wert)}
                onOeffnen={() => setDialog({ habit })}
              />
            ))}
          </ul>
        )}
      </Abschnitt>

      {dialog && (
        <HabitSheet habit={dialog.habit} onSchliessen={() => setDialog(null)} />
      )}
    </div>
  )
}

/* ---------- Eine Gewohnheit als Karte ---------- */
function HabitKarte({
  habit,
  daten,
  heute,
  onWert,
  onOeffnen,
}: {
  habit: Habit
  daten: AppDaten
  heute: string
  onWert: (wert: number) => void
  onOeffnen: () => void
}) {
  const wert = habitWert(daten, habit.id, heute)
  const geschafft = habitGeschafft(habit, wert)
  const serie = habitStreak(daten, habit, heute)
  const woche = letzteTage(heute, 7)

  return (
    <li className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <span
          className="h-9 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: habit.farbe }}
        />

        {/* Antippen oeffnet den Bearbeiten-Dialog */}
        <button onClick={onOeffnen} className="min-w-0 flex-1 text-left">
          <p className="truncate font-medium">{habit.titel}</p>
          <p className="mt-0.5 text-xs text-muted">
            {serie > 0
              ? `${serie} ${serie === 1 ? 'Tag' : 'Tage'} am Stueck`
              : habit.typ === 'zaehlen'
                ? `${habit.wenigerIstBesser ? 'hoechstens' : 'mindestens'} ${habit.ziel} ${habit.einheit}`.trim()
                : 'taeglich'}
          </p>
        </button>

        {/* Rechts: abhaken oder zaehlen */}
        {habit.typ === 'abhaken' ? (
          <button
            onClick={() => onWert(wert > 0 ? 0 : 1)}
            aria-label="Abhaken"
            className="shrink-0 p-1"
          >
            {wert > 0 ? (
              <Check size={24} className="animate-haken text-done" strokeWidth={3} />
            ) : (
              <Circle size={24} className="text-muted" strokeWidth={1.5} />
            )}
          </button>
        ) : (
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => onWert(wert - 1)}
              className="rounded-lg border border-line p-2 text-muted active:bg-surface-2"
              aria-label="Weniger"
            >
              <Minus size={14} />
            </button>
            <span
              className={`w-8 text-center text-lg tabular-nums ${
                geschafft ? 'text-done' : 'text-text'
              }`}
            >
              {wert}
            </span>
            <button
              onClick={() => onWert(wert + 1)}
              className="rounded-lg border border-line p-2 text-muted active:bg-surface-2"
              aria-label="Mehr"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Die letzten sieben Tage als Punktreihe.
          Verpasste Tage bleiben unauffaellig grau - kein Rot, keine Mahnung. */}
      <div className="mt-3 flex items-center gap-1.5 pl-4">
        {woche.map((tag) => {
          const tagesWert = habitWert(daten, habit.id, tag)
          const tagGeschafft = habitGeschafft(habit, tagesWert)
          const istHeute = tag === heute
          const vorAnlage = tag < habit.erstelltAm.slice(0, 10)

          return (
            <span
              key={tag}
              title={tag}
              className="h-1.5 flex-1 rounded-full"
              style={{
                backgroundColor:
                  vorAnlage || !tagGeschafft ? '#242424' : habit.farbe,
                opacity: istHeute ? 1 : 0.75,
              }}
            />
          )
        })}
      </div>
    </li>
  )
}
