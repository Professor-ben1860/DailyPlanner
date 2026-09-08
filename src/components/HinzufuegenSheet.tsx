import { Calendar, ListTodo, Repeat, Layers } from 'lucide-react'
import Sheet from './Sheet'

export type Hinzufuegbar = 'termin' | 'aufgabe' | 'projekt' | 'habit'

type Props = {
  onWahl: (art: Hinzufuegbar) => void
  onSchliessen: () => void
}

const MOEGLICHKEITEN = [
  {
    art: 'termin' as const,
    icon: Calendar,
    titel: 'Termin',
    erklaerung: 'Feste Uhrzeit oder ganztaegig',
  },
  {
    art: 'aufgabe' as const,
    icon: ListTodo,
    titel: 'Aufgabe',
    erklaerung: 'Erscheint auch unter Projekte',
  },
  {
    art: 'projekt' as const,
    icon: Layers,
    titel: 'Projekt',
    erklaerung: 'Start und Ziel landen im Kalender',
  },
  {
    art: 'habit' as const,
    icon: Repeat,
    titel: 'Gewohnheit',
    erklaerung: 'Erscheint auch unter Habits',
  },
]

/* Fragt zuerst, WAS angelegt werden soll. Danach oeffnet sich der
   passende Dialog. So bleibt ein einziger Plus-Knopf im Kalender. */
export default function HinzufuegenSheet({ onWahl, onSchliessen }: Props) {
  return (
    <Sheet offen titel="Was moechtest du anlegen?" onSchliessen={onSchliessen}>
      <ul className="space-y-2 pb-2">
        {MOEGLICHKEITEN.map((m) => {
          const Icon = m.icon
          return (
            <li key={m.art}>
              <button
                onClick={() => onWahl(m.art)}
                className="flex w-full items-center gap-4 rounded-2xl border border-line
                           bg-ink px-4 py-4 text-left transition-colors active:bg-surface-2"
              >
                <Icon size={22} className="shrink-0 text-accent" strokeWidth={1.8} />
                <span>
                  <span className="block font-medium">{m.titel}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {m.erklaerung}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
