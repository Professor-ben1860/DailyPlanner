import { eachDayOfInterval, endOfWeek, format, isToday, startOfWeek } from 'date-fns'
import { de } from 'date-fns/locale'
import { useDaten } from '../../store'
import { eintraegeFuerTag } from '../../auswahl'
import { zuISO } from '../../datum'
import EintragsListe from './EintragsListe'
import type { ISODatum, KalenderEintrag } from '../../types'

type Props = {
  /** Irgendein Tag der Woche, die gezeigt werden soll */
  anker: Date
  onOeffnen: (eintrag: KalenderEintrag) => void
  onTagWaehlen: (datum: ISODatum) => void
}

/* Die Woche als Liste untereinander - auf einem Handy deutlich besser
   lesbar als sieben schmale Spalten nebeneinander. */
export default function WochenAnsicht({ anker, onOeffnen, onTagWaehlen }: Props) {
  const { daten } = useDaten()

  const tage = eachDayOfInterval({
    start: startOfWeek(anker, { weekStartsOn: 1 }),
    end: endOfWeek(anker, { weekStartsOn: 1 }),
  })

  return (
    <div className="space-y-5">
      {tage.map((tag) => {
        const datum = zuISO(tag)
        const anzahl = eintraegeFuerTag(daten, datum).length
        const heute = isToday(tag)

        return (
          <section key={datum}>
            <button
              onClick={() => onTagWaehlen(datum)}
              className="mb-2 flex w-full items-baseline gap-2 text-left"
            >
              <span
                className={`text-sm font-medium ${heute ? 'text-accent' : 'text-text'}`}
              >
                {format(tag, 'EEEE', { locale: de })}
              </span>
              <span className="text-xs text-muted">
                {format(tag, 'd. MMM', { locale: de })}
              </span>
              {heute && (
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] text-accent">
                  heute
                </span>
              )}
            </button>

            {anzahl === 0 ? (
              <p className="rounded-2xl border border-dashed border-line px-4 py-3 text-sm text-muted/60">
                frei
              </p>
            ) : (
              <EintragsListe datum={datum} onOeffnen={onOeffnen} />
            )}
          </section>
        )
      })}
    </div>
  )
}
