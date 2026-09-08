import { useState } from 'react'
import Sheet from './Sheet'
import { Knopf, LoeschKnopf } from './Ui'
import {
  DatumFeld,
  FarbWahl,
  NotizFeld,
  TextFeld,
  Umschalter,
  ZeitFeld,
} from './Formular'
import { useDaten } from '../store'
import { STANDARD_FARBE, type ISODatum, type Termin } from '../types'

type Props = {
  /** null = neuen Termin anlegen */
  termin: Termin | null
  /** Vorbelegtes Datum, z.B. der im Kalender angetippte Tag */
  standardDatum?: ISODatum
  onSchliessen: () => void
}

/* Dialog zum Anlegen und Bearbeiten eines Termins. */
export default function TerminSheet({
  termin,
  standardDatum,
  onSchliessen,
}: Props) {
  const { daten, terminHinzufuegen, terminAendern, terminLoeschen } = useDaten()

  const bearbeitet = termin !== null

  const [titel, setTitel] = useState(termin?.titel ?? '')
  const [datum, setDatum] = useState<string | null>(
    termin?.datum ?? standardDatum ?? null,
  )
  const [dauer, setDauer] = useState<'zeit' | 'ganztags'>(
    termin?.ganztags ? 'ganztags' : 'zeit',
  )
  const [startZeit, setStartZeit] = useState<string | null>(termin?.startZeit ?? null)
  const [endZeit, setEndZeit] = useState<string | null>(termin?.endZeit ?? null)
  const [kategorie, setKategorie] = useState(termin?.kategorie ?? '')
  const [notiz, setNotiz] = useState(termin?.notiz ?? '')
  const [farbe, setFarbe] = useState(termin?.farbe ?? STANDARD_FARBE)

  // Bereits benutzte Kategorien zum schnellen Wiederverwenden
  const bekannteKategorien = [
    ...new Set(daten.termine.map((t) => t.kategorie).filter(Boolean)),
  ]

  function speichern() {
    const sauber = titel.trim()
    if (!sauber || !datum) return

    const ganztags = dauer === 'ganztags'
    const werte = {
      titel: sauber,
      datum,
      ganztags,
      startZeit: ganztags ? null : startZeit,
      endZeit: ganztags ? null : endZeit,
      kategorie: kategorie.trim(),
      notiz,
      farbe,
    }

    if (termin) {
      terminAendern(termin.id, werte)
    } else {
      terminHinzufuegen(werte)
    }
    onSchliessen()
  }

  function loeschen() {
    if (termin) terminLoeschen(termin.id)
    onSchliessen()
  }

  return (
    <Sheet
      offen
      titel={bearbeitet ? 'Termin bearbeiten' : 'Neuer Termin'}
      onSchliessen={onSchliessen}
      fussleiste={
        <>
          <Knopf
            breit
            onClick={speichern}
            deaktiviert={!titel.trim() || !datum}
          >
            {bearbeitet ? 'Speichern' : 'Termin anlegen'}
          </Knopf>
          {/* Sagt, WARUM der Knopf gerade nicht geht */}
          {(!titel.trim() || !datum) && (
            <p className="mt-2 text-center text-xs text-muted">
              {!titel.trim() ? 'Gib dem Termin einen Namen.' : 'Waehle ein Datum.'}
            </p>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <TextFeld
          label="Termin"
          wert={titel}
          onChange={setTitel}
          platzhalter="z.B. Zahnarzt"
          autoFokus={!bearbeitet}
        />

        <DatumFeld label="Datum" wert={datum} onChange={setDatum} />

        <Umschalter
          label="Zeit"
          wert={dauer}
          onChange={setDauer}
          optionen={[
            { wert: 'zeit', text: 'Mit Uhrzeit' },
            { wert: 'ganztags', text: 'Ganztaegig' },
          ]}
        />

        {dauer === 'zeit' && (
          <div className="grid grid-cols-2 gap-3">
            <ZeitFeld label="Von" wert={startZeit} onChange={setStartZeit} />
            <ZeitFeld label="Bis" wert={endZeit} onChange={setEndZeit} />
          </div>
        )}

        <div>
          <TextFeld
            label="Kategorie"
            wert={kategorie}
            onChange={setKategorie}
            platzhalter="z.B. Arbeit, Privat, Arzt"
          />
          {bekannteKategorien.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {bekannteKategorien.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKategorie(k)}
                  className="rounded-full border border-line px-3 py-1 text-xs text-muted
                             active:bg-surface-2"
                >
                  {k}
                </button>
              ))}
            </div>
          )}
        </div>

        <NotizFeld
          label="Notiz"
          wert={notiz}
          onChange={setNotiz}
          platzhalter="Ort, Details ..."
          zeilen={3}
        />

        <FarbWahl wert={farbe} onChange={setFarbe} />

        {bearbeitet && (
          <div className="pt-2">
            <LoeschKnopf onLoeschen={loeschen} text="Termin loeschen" />
          </div>
        )}
      </div>
    </Sheet>
  )
}
