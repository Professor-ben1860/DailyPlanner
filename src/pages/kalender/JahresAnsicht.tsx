import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { de } from 'date-fns/locale'
import { useDaten } from '../../store'
import { tagHatEintraege } from '../../auswahl'
import { zuISO } from '../../datum'

type Props = {
  jahr: number
  /** Antippen eines Monats wechselt in die Monatsansicht */
  onMonatWaehlen: (monat: Date) => void
}

/* Zwoelf kleine Monatsraster als Jahresueberblick.
   Ein Tag mit Eintraegen wird orange hervorgehoben. */
export default function JahresAnsicht({ jahr, onMonatWaehlen }: Props) {
  const monate = Array.from({ length: 12 }, (_, i) => new Date(jahr, i, 1))

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
      {monate.map((monat) => (
        <MiniMonat
          key={monat.getMonth()}
          monat={monat}
          onWaehlen={() => onMonatWaehlen(monat)}
        />
      ))}
    </div>
  )
}

function MiniMonat({ monat, onWaehlen }: { monat: Date; onWaehlen: () => void }) {
  const { daten } = useDaten()

  const tage = eachDayOfInterval({
    start: startOfWeek(startOfMonth(monat), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(monat), { weekStartsOn: 1 }),
  })

  return (
    <button onClick={onWaehlen} className="text-left">
      <p className="mb-1.5 text-sm font-medium">
        {format(monat, 'MMMM', { locale: de })}
      </p>

      <div className="grid grid-cols-7 gap-y-0.5">
        {tage.map((tag) => {
          const datum = zuISO(tag)
          const imMonat = isSameMonth(tag, monat)
          const hatEintraege = imMonat && tagHatEintraege(daten, datum)

          return (
            <span
              key={datum}
              className={`flex h-4 items-center justify-center rounded text-[9px] tabular-nums ${
                !imMonat
                  ? 'text-transparent'
                  : hatEintraege
                    ? 'font-medium text-accent'
                    : isToday(tag)
                      ? 'text-text underline decoration-accent underline-offset-2'
                      : 'text-muted'
              }`}
            >
              {tag.getDate()}
            </span>
          )
        })}
      </div>
    </button>
  )
}
