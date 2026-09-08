import { useEffect, useState, type ReactNode } from 'react'
import { Check, Minus, Plus } from 'lucide-react'
import { FARBEN } from '../types'

/* ============================================================
   FORMULAR-BAUSTEINE
   ------------------------------------------------------------
   Diese kleinen Bausteine benutzen wir in allen Dialogen, damit
   ueberall dieselbe Optik und dasselbe Verhalten herrscht.
   Willst du das Aussehen aller Eingabefelder aendern, aenderst
   du es hier einmal.
   ============================================================ */

const feldStil =
  'w-full rounded-xl border border-line bg-ink px-4 py-3 text-text ' +
  'placeholder:text-muted/60 outline-none focus:border-accent/60 ' +
  'transition-colors'

/** Beschriftung ueber einem Eingabefeld */
function Beschriftung({ children }: { children: ReactNode }) {
  return (
    <span className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted">
      {children}
    </span>
  )
}

/* ---------- einzeiliges Textfeld ---------- */
export function TextFeld({
  label,
  wert,
  onChange,
  platzhalter,
  autoFokus,
}: {
  label: string
  wert: string
  onChange: (neu: string) => void
  platzhalter?: string
  autoFokus?: boolean
}) {
  return (
    <label className="block">
      <Beschriftung>{label}</Beschriftung>
      <input
        value={wert}
        onChange={(e) => onChange(e.target.value)}
        placeholder={platzhalter}
        autoFocus={autoFokus}
        className={feldStil}
      />
    </label>
  )
}

/* ---------- mehrzeiliges Textfeld ---------- */
export function NotizFeld({
  label,
  wert,
  onChange,
  platzhalter,
  zeilen = 4,
}: {
  label: string
  wert: string
  onChange: (neu: string) => void
  platzhalter?: string
  zeilen?: number
}) {
  return (
    <label className="block">
      <Beschriftung>{label}</Beschriftung>
      <textarea
        value={wert}
        onChange={(e) => onChange(e.target.value)}
        placeholder={platzhalter}
        rows={zeilen}
        className={feldStil + ' resize-none leading-relaxed'}
      />
    </label>
  )
}

/* ---------- Datum ---------- */
export function DatumFeld({
  label,
  wert,
  onChange,
}: {
  label: string
  wert: string | null
  onChange: (neu: string | null) => void
}) {
  return (
    <label className="block">
      <Beschriftung>{label}</Beschriftung>
      <input
        type="date"
        value={wert ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={feldStil + ' [color-scheme:dark]'}
      />
    </label>
  )
}

/* ---------- Uhrzeit ---------- */
export function ZeitFeld({
  label,
  wert,
  onChange,
}: {
  label: string
  wert: string | null
  onChange: (neu: string | null) => void
}) {
  return (
    <label className="block">
      <Beschriftung>{label}</Beschriftung>
      <input
        type="time"
        value={wert ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className={feldStil + ' [color-scheme:dark]'}
      />
    </label>
  )
}

/* ---------- Zahl ---------- */
export function ZahlFeld({
  label,
  wert,
  onChange,
  min = 0,
}: {
  label: string
  wert: number
  onChange: (neu: number) => void
  min?: number
}) {
  /* Wichtig: Das Feld merkt sich den GETIPPTEN TEXT, nicht nur die Zahl.
     Sonst koennte man das Feld nie leeren, um eine neue Zahl einzugeben -
     es wuerde beim ersten Loeschen sofort auf den Mindestwert zurueck-
     springen. Erst wenn wirklich eine Zahl dasteht, wird sie uebernommen. */
  const [text, setText] = useState(String(wert))

  // Wenn der Wert von aussen kommt (Plus/Minus-Knopf), Text nachziehen
  useEffect(() => {
    setText((bisher) => (Number(bisher) === wert ? bisher : String(wert)))
  }, [wert])

  function beimTippen(roh: string) {
    setText(roh)
    // Leeres Feld beim Tippen erlauben - noch nichts uebernehmen
    if (roh.trim() === '') return
    const zahl = Number(roh)
    if (Number.isFinite(zahl)) onChange(Math.max(min, Math.floor(zahl)))
  }

  // Beim Verlassen ein leeres Feld wieder auffuellen
  function beimVerlassen() {
    if (text.trim() === '' || !Number.isFinite(Number(text))) {
      setText(String(wert))
    }
  }

  return (
    <div>
      <Beschriftung>{label}</Beschriftung>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, wert - 1))}
          className="shrink-0 rounded-xl border border-line p-3 text-muted active:bg-surface-2"
          aria-label="Weniger"
        >
          <Minus size={16} />
        </button>

        <input
          type="number"
          inputMode="numeric"
          min={min}
          value={text}
          onChange={(e) => beimTippen(e.target.value)}
          onBlur={beimVerlassen}
          onFocus={(e) => e.target.select()}
          className={feldStil + ' text-center tabular-nums'}
        />

        <button
          type="button"
          onClick={() => onChange(wert + 1)}
          className="shrink-0 rounded-xl border border-line p-3 text-muted active:bg-surface-2"
          aria-label="Mehr"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

/* ---------- Farbauswahl ---------- */
export function FarbWahl({
  wert,
  onChange,
}: {
  wert: string
  onChange: (neu: string) => void
}) {
  return (
    <div>
      <Beschriftung>Farbe</Beschriftung>
      <div className="flex flex-wrap gap-2.5">
        {FARBEN.map((farbe) => (
          <button
            key={farbe.wert}
            type="button"
            onClick={() => onChange(farbe.wert)}
            title={farbe.name}
            aria-label={farbe.name}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform active:scale-90"
            style={{
              backgroundColor: farbe.wert,
              outline: wert === farbe.wert ? '2px solid #f5f5f4' : 'none',
              outlineOffset: '2px',
            }}
          >
            {wert === farbe.wert && (
              <Check size={16} className="text-black" strokeWidth={3} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ---------- Auswahlliste ---------- */
export function AuswahlFeld({
  label,
  wert,
  onChange,
  optionen,
}: {
  label: string
  wert: string
  onChange: (neu: string) => void
  optionen: { wert: string; text: string }[]
}) {
  return (
    <label className="block">
      <Beschriftung>{label}</Beschriftung>
      <select
        value={wert}
        onChange={(e) => onChange(e.target.value)}
        className={feldStil + ' appearance-none'}
      >
        {optionen.map((o) => (
          <option key={o.wert} value={o.wert} className="bg-ink">
            {o.text}
          </option>
        ))}
      </select>
    </label>
  )
}

/* ---------- Umschalter zwischen zwei Moeglichkeiten ---------- */
export function Umschalter<T extends string>({
  label,
  wert,
  onChange,
  optionen,
}: {
  label: string
  wert: T
  onChange: (neu: T) => void
  optionen: { wert: T; text: string }[]
}) {
  return (
    <div>
      <Beschriftung>{label}</Beschriftung>
      <div className="flex gap-1 rounded-xl border border-line bg-ink p-1">
        {optionen.map((o) => (
          <button
            key={o.wert}
            type="button"
            onClick={() => onChange(o.wert)}
            className={`flex-1 rounded-lg py-2 text-sm transition-colors ${
              wert === o.wert
                ? 'bg-accent font-medium text-ink'
                : 'text-muted active:bg-surface-2'
            }`}
          >
            {o.text}
          </button>
        ))}
      </div>
    </div>
  )
}
