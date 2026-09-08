import { useState } from 'react'
import Sheet from './Sheet'
import { Knopf, LoeschKnopf } from './Ui'
import { FarbWahl, NotizFeld, TextFeld } from './Formular'
import { useDaten } from '../store'
import { STANDARD_FARBE, type Notiz } from '../types'

type Props = {
  /** null = neue Notiz anlegen */
  notiz: Notiz | null
  onSchliessen: () => void
}

/* Dialog zum Schreiben und Bearbeiten einer Notiz. */
export default function NotizSheet({ notiz, onSchliessen }: Props) {
  const { notizHinzufuegen, notizAendern, notizLoeschen } = useDaten()

  const bearbeitet = notiz !== null

  const [titel, setTitel] = useState(notiz?.titel ?? '')
  const [inhalt, setInhalt] = useState(notiz?.inhalt ?? '')
  const [farbe, setFarbe] = useState(notiz?.farbe ?? STANDARD_FARBE)

  function speichern() {
    const sauberTitel = titel.trim()
    const sauberInhalt = inhalt.trim()

    // Ganz leere Notizen legen wir gar nicht erst an
    if (!sauberTitel && !sauberInhalt) {
      onSchliessen()
      return
    }

    const werte = {
      titel: sauberTitel || 'Ohne Titel',
      inhalt,
      farbe,
    }

    if (notiz) {
      notizAendern(notiz.id, werte)
    } else {
      notizHinzufuegen(werte)
    }
    onSchliessen()
  }

  function loeschen() {
    if (notiz) notizLoeschen(notiz.id)
    onSchliessen()
  }

  return (
    <Sheet
      offen
      titel={bearbeitet ? 'Notiz' : 'Neue Notiz'}
      onSchliessen={onSchliessen}
      fussleiste={
        <Knopf breit onClick={speichern}>
          Speichern
        </Knopf>
      }
    >
      <div className="space-y-4">
        <TextFeld
          label="Ueberschrift"
          wert={titel}
          onChange={setTitel}
          platzhalter="z.B. Einkaufsliste"
          autoFokus={!bearbeitet}
        />

        <NotizFeld
          label="Inhalt"
          wert={inhalt}
          onChange={setInhalt}
          platzhalter="Schreib einfach los ..."
          zeilen={10}
        />

        <FarbWahl wert={farbe} onChange={setFarbe} />
        <p className="-mt-1 text-xs text-muted">
          Die Farbe faerbt nur die Umrandung - die Notiz selbst bleibt schwarz.
        </p>

        {bearbeitet && (
          <div className="pt-2">
            <LoeschKnopf onLoeschen={loeschen} text="Notiz loeschen" />
          </div>
        )}
      </div>
    </Sheet>
  )
}
