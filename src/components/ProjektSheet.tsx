import { useState } from 'react'
import Sheet from './Sheet'
import { Knopf, LoeschKnopf } from './Ui'
import { DatumFeld, FarbWahl, NotizFeld, TextFeld, Umschalter } from './Formular'
import { useDaten } from '../store'
import { STANDARD_FARBE, type Projekt } from '../types'

type Props = {
  /** null = neues Projekt anlegen */
  projekt: Projekt | null
  /** Vorbelegtes Startdatum, z.B. der im Kalender angetippte Tag */
  standardDatum?: string | null
  onSchliessen: () => void
}

/* Dialog zum Anlegen und Bearbeiten eines Projekts. */
export default function ProjektSheet({
  projekt,
  standardDatum = null,
  onSchliessen,
}: Props) {
  const { projektHinzufuegen, projektAendern, projektLoeschen } = useDaten()

  const bearbeitet = projekt !== null

  const [titel, setTitel] = useState(projekt?.titel ?? '')
  const [notiz, setNotiz] = useState(projekt?.notiz ?? '')
  const [startDatum, setStartDatum] = useState<string | null>(
    projekt?.startDatum ?? standardDatum,
  )
  const [zielDatum, setZielDatum] = useState<string | null>(projekt?.zielDatum ?? null)
  const [farbe, setFarbe] = useState(projekt?.farbe ?? STANDARD_FARBE)
  const [status, setStatus] = useState<'aktiv' | 'fertig'>(
    projekt?.erledigt ? 'fertig' : 'aktiv',
  )

  function speichern() {
    const sauber = titel.trim()
    if (!sauber) return

    const werte = {
      titel: sauber,
      notiz,
      startDatum,
      zielDatum,
      farbe,
      erledigt: status === 'fertig',
    }

    if (projekt) {
      projektAendern(projekt.id, werte)
    } else {
      projektHinzufuegen(werte)
    }
    onSchliessen()
  }

  function loeschen() {
    if (projekt) projektLoeschen(projekt.id)
    onSchliessen()
  }

  return (
    <Sheet
      offen
      titel={bearbeitet ? 'Projekt bearbeiten' : 'Neues Projekt'}
      onSchliessen={onSchliessen}
      fussleiste={
        <Knopf breit onClick={speichern} deaktiviert={!titel.trim()}>
          {bearbeitet ? 'Speichern' : 'Projekt anlegen'}
        </Knopf>
      }
    >
      <div className="space-y-4">
        <TextFeld
          label="Projektname"
          wert={titel}
          onChange={setTitel}
          platzhalter="z.B. Wohnung renovieren"
          autoFokus={!bearbeitet}
        />

        <div className="grid grid-cols-2 gap-3">
          <DatumFeld label="Start" wert={startDatum} onChange={setStartDatum} />
          <DatumFeld label="Ziel" wert={zielDatum} onChange={setZielDatum} />
        </div>

        {(startDatum || zielDatum) && (
          <p className="-mt-1 text-xs text-muted">
            Start und Ziel erscheinen automatisch im Kalender.
          </p>
        )}

        <NotizFeld
          label="Notiz"
          wert={notiz}
          onChange={setNotiz}
          platzhalter="Worum geht es? Was ist der naechste Schritt?"
        />

        {bearbeitet && (
          <Umschalter
            label="Status"
            wert={status}
            onChange={setStatus}
            optionen={[
              { wert: 'aktiv', text: 'Aktiv' },
              { wert: 'fertig', text: 'Abgeschlossen' },
            ]}
          />
        )}

        <FarbWahl wert={farbe} onChange={setFarbe} />

        {bearbeitet && (
          <div className="pt-2">
            <LoeschKnopf onLoeschen={loeschen} text="Projekt loeschen" />
          </div>
        )}
      </div>
    </Sheet>
  )
}
