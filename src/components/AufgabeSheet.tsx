import { useState } from 'react'
import Sheet from './Sheet'
import { Knopf, LoeschKnopf } from './Ui'
import {
  AuswahlFeld,
  DatumFeld,
  FarbWahl,
  NotizFeld,
  TextFeld,
  ZeitFeld,
} from './Formular'
import { useDaten } from '../store'
import { STANDARD_FARBE, type Aufgabe, type ISODatum } from '../types'

type Props = {
  /** null = neue Aufgabe anlegen, sonst wird diese bearbeitet */
  aufgabe: Aufgabe | null
  /** Vorbelegtes Datum, z.B. wenn man im Kalender auf einen Tag tippt */
  standardDatum?: ISODatum | null
  /** Vorbelegtes Projekt, wenn man aus einem Projekt heraus anlegt */
  standardProjektId?: string | null
  onSchliessen: () => void
}

/* Dialog zum Anlegen und Bearbeiten einer Aufgabe.
   Wird von der Projekte-Seite UND spaeter vom Kalender benutzt. */
export default function AufgabeSheet({
  aufgabe,
  standardDatum = null,
  standardProjektId = null,
  onSchliessen,
}: Props) {
  const { daten, aufgabeHinzufuegen, aufgabeAendern, aufgabeLoeschen } = useDaten()

  const bearbeitet = aufgabe !== null

  // Zwischenspeicher fuer die Eingaben - erst beim Speichern uebernommen
  const [titel, setTitel] = useState(aufgabe?.titel ?? '')
  const [notiz, setNotiz] = useState(aufgabe?.notiz ?? '')
  const [datum, setDatum] = useState<string | null>(aufgabe?.datum ?? standardDatum)
  const [uhrzeit, setUhrzeit] = useState<string | null>(aufgabe?.uhrzeit ?? null)
  const [projektId, setProjektId] = useState(
    aufgabe?.projektId ?? standardProjektId ?? '',
  )
  const [farbe, setFarbe] = useState(aufgabe?.farbe ?? STANDARD_FARBE)

  const projektOptionen = [
    { wert: '', text: 'Kein Projekt' },
    ...daten.projekte
      .filter((p) => !p.erledigt)
      .map((p) => ({ wert: p.id, text: p.titel })),
  ]

  function speichern() {
    const sauber = titel.trim()
    if (!sauber) return

    const werte = {
      titel: sauber,
      notiz,
      datum,
      uhrzeit,
      projektId: projektId || null,
      farbe,
    }

    if (aufgabe) {
      aufgabeAendern(aufgabe.id, werte)
    } else {
      aufgabeHinzufuegen(werte)
    }
    onSchliessen()
  }

  function loeschen() {
    if (aufgabe) aufgabeLoeschen(aufgabe.id)
    onSchliessen()
  }

  return (
    <Sheet
      offen
      titel={bearbeitet ? 'Aufgabe bearbeiten' : 'Neue Aufgabe'}
      onSchliessen={onSchliessen}
      fussleiste={
        <Knopf breit onClick={speichern} deaktiviert={!titel.trim()}>
          {bearbeitet ? 'Speichern' : 'Aufgabe anlegen'}
        </Knopf>
      }
    >
      <div className="space-y-4">
        <TextFeld
          label="Was ist zu tun?"
          wert={titel}
          onChange={setTitel}
          platzhalter="z.B. Rechnung bezahlen"
          autoFokus={!bearbeitet}
        />

        <div className="grid grid-cols-2 gap-3">
          <DatumFeld label="Datum" wert={datum} onChange={setDatum} />
          <ZeitFeld label="Uhrzeit" wert={uhrzeit} onChange={setUhrzeit} />
        </div>

        {datum && (
          <p className="-mt-1 text-xs text-muted">
            Mit Datum erscheint die Aufgabe automatisch im Kalender.
          </p>
        )}

        <AuswahlFeld
          label="Gehoert zu Projekt"
          wert={projektId}
          onChange={setProjektId}
          optionen={projektOptionen}
        />

        <NotizFeld
          label="Notiz"
          wert={notiz}
          onChange={setNotiz}
          platzhalter="Platz fuer Details ..."
          zeilen={3}
        />

        <FarbWahl wert={farbe} onChange={setFarbe} />

        {bearbeitet && (
          <div className="pt-2">
            <LoeschKnopf onLoeschen={loeschen} text="Aufgabe loeschen" />
          </div>
        )}
      </div>
    </Sheet>
  )
}
