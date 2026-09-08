import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useDaten } from '../../store'
import { farbenFuerTag } from '../../auswahl'
import { zuISO } from '../../datum'
import type { ISODatum } from '../../types'

type Props = {
  /** Irgendein Tag des Monats, der gezeigt werden soll */
  anker: Date
  gewaehlt: ISODatum
  onWaehlen: (datum: ISODatum) => void
}

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

/* Das klassische Monatsraster.
   Die Woche beginnt am Montag - so wie in Deutschland ueblich. */
export default function MonatsAnsicht({ anker, gewaehlt, onWaehlen }: Props) {
  const { daten } = useDaten()

  // Das Raster beginnt am Montag VOR dem Monatsersten und endet am
  // Sonntag NACH dem Monatsletzten - dadurch bleiben die Zeilen voll.
  const tage = eachDayOfInterval({
    start: startOfWeek(startOfMonth(anker), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(anker), { weekStartsOn: 1 }),
  })

  return (
    <div>
      {/* Kopfzeile mit den Wochentagen */}
      <div className="mb-1 grid grid-cols-7">
        {WOCHENTAGE.map((tag) => (
          <div key={tag} className="py-1 text-center text-[11px] text-muted">
            {tag}
          </div>
        ))}
      </div>

      {/* Die Tage */}
      <div className="grid grid-cols-7 gap-y-1">
        {tage.map((tag) => {
          const datum = zuISO(tag)
          const imMonat = isSameMonth(tag, anker)
          const istHeute = isToday(tag)
          const istGewaehlt = datum === gewaehlt
          const farben = farbenFuerTag(daten, datum)

          return (
            <button
              key={datum}
              onClick={() => onWaehlen(datum)}
              className="flex flex-col items-center gap-1 py-1"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full
                            text-sm tabular-nums transition-colors ${
                              istGewaehlt
                                ? 'bg-accent font-medium text-ink'
                                : istHeute
                                  ? 'font-medium text-accent'
                                  : imMonat
                                    ? 'text-text'
                                    : 'text-muted/40'
                            }`}
              >
                {tag.getDate()}
              </span>

              {/* Kleine Punkte zeigen an, dass an dem Tag etwas ansteht */}
              <span className="flex h-1.5 items-center gap-0.5">
                {farben.map((farbe) => (
                  <span
                    key={farbe}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: farbe,
                      opacity: imMonat ? 1 : 0.4,
                    }}
                  />
                ))}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
