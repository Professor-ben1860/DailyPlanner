import { useState } from 'react'
import Sheet from './Sheet'
import { Knopf, LoeschKnopf } from './Ui'
import { FarbWahl, TextFeld, Umschalter, ZahlFeld } from './Formular'
import { useDaten } from '../store'
import { STANDARD_FARBE, type Habit, type HabitTyp } from '../types'

type Props = {
  /** null = neue Gewohnheit anlegen */
  habit: Habit | null
  onSchliessen: () => void
}

/* Dialog zum Anlegen und Bearbeiten einer Gewohnheit. */
export default function HabitSheet({ habit, onSchliessen }: Props) {
  const { habitHinzufuegen, habitAendern, habitLoeschen } = useDaten()

  const bearbeitet = habit !== null

  const [titel, setTitel] = useState(habit?.titel ?? '')
  const [typ, setTyp] = useState<HabitTyp>(habit?.typ ?? 'abhaken')
  const [ziel, setZiel] = useState(habit?.ziel ?? 1)
  const [einheit, setEinheit] = useState(habit?.einheit ?? '')
  const [richtung, setRichtung] = useState<'mehr' | 'weniger'>(
    habit?.wenigerIstBesser ? 'weniger' : 'mehr',
  )
  const [farbe, setFarbe] = useState(habit?.farbe ?? STANDARD_FARBE)

  function speichern() {
    const sauber = titel.trim()
    if (!sauber) return

    const werte = {
      titel: sauber,
      typ,
      // Beim Abhaken ist das Ziel immer genau 1
      ziel: typ === 'abhaken' ? 1 : Math.max(1, ziel),
      einheit: typ === 'abhaken' ? '' : einheit.trim(),
      wenigerIstBesser: typ === 'zaehlen' && richtung === 'weniger',
      farbe,
    }

    if (habit) {
      habitAendern(habit.id, werte)
    } else {
      habitHinzufuegen(werte)
    }
    onSchliessen()
  }

  function loeschen() {
    if (habit) habitLoeschen(habit.id)
    onSchliessen()
  }

  return (
    <Sheet
      offen
      titel={bearbeitet ? 'Gewohnheit bearbeiten' : 'Neue Gewohnheit'}
      onSchliessen={onSchliessen}
      fussleiste={
        <Knopf breit onClick={speichern} deaktiviert={!titel.trim()}>
          {bearbeitet ? 'Speichern' : 'Gewohnheit anlegen'}
        </Knopf>
      }
    >
      <div className="space-y-4">
        <TextFeld
          label="Gewohnheit"
          wert={titel}
          onChange={setTitel}
          platzhalter="z.B. Spazieren gehen"
          autoFokus={!bearbeitet}
        />

        <Umschalter
          label="Art"
          wert={typ}
          onChange={setTyp}
          optionen={[
            { wert: 'abhaken', text: 'Abhaken' },
            { wert: 'zaehlen', text: 'Zaehlen' },
          ]}
        />

        <p className="-mt-1 text-xs leading-relaxed text-muted">
          {typ === 'abhaken'
            ? 'Einmal am Tag antippen - geschafft oder nicht.'
            : 'Du erfasst eine Anzahl, z.B. Glaeser Wasser oder Zigaretten.'}
        </p>

        {typ === 'zaehlen' && (
          <>
            <ZahlFeld label="Tagesziel" wert={ziel} onChange={setZiel} min={1} />
            <TextFeld
              label="Einheit"
              wert={einheit}
              onChange={setEinheit}
              platzhalter="Stueck, Glas ..."
            />

            <Umschalter
              label="Ziel erreicht, wenn"
              wert={richtung}
              onChange={setRichtung}
              optionen={[
                { wert: 'mehr', text: 'mindestens' },
                { wert: 'weniger', text: 'hoechstens' },
              ]}
            />

            <p className="-mt-1 text-xs leading-relaxed text-muted">
              {richtung === 'mehr'
                ? `Geschafft ab ${ziel} ${einheit || 'Stueck'} am Tag.`
                : `Geschafft, solange du bei hoechstens ${ziel} ${einheit || 'Stueck'} bleibst.`}
            </p>
          </>
        )}

        <FarbWahl wert={farbe} onChange={setFarbe} />

        {bearbeitet && (
          <div className="pt-2">
            <LoeschKnopf onLoeschen={loeschen} text="Gewohnheit loeschen" />
          </div>
        )}
      </div>
    </Sheet>
  )
}
