import { useState } from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { SeitenKopf, Abschnitt, LeerHinweis } from '../components/Ui'
import NotizSheet from '../components/NotizSheet'
import { useDaten } from '../store'
import type { Notiz } from '../types'

export default function NotesPage() {
  const { daten } = useDaten()
  const [dialog, setDialog] = useState<{ notiz: Notiz | null } | null>(null)

  // Zuletzt bearbeitete Notiz steht oben
  const notizen = [...daten.notizen].sort((a, b) =>
    b.geaendertAm.localeCompare(a.geaendertAm),
  )

  return (
    <div className="space-y-7">
      <SeitenKopf titel="Notizen" />

      <Abschnitt
        titel="Alle Notizen"
        onHinzufuegen={() => setDialog({ notiz: null })}
        hinzufuegenLabel="Neue Notiz"
      >
        {notizen.length === 0 ? (
          <LeerHinweis>
            Noch keine Notizen.
            <br />
            Gedanken, Listen, Ideen - alles darf hier hinein.
          </LeerHinweis>
        ) : (
          <ul className="space-y-2.5">
            {notizen.map((notiz) => (
              <li key={notiz.id}>
                <button
                  onClick={() => setDialog({ notiz })}
                  className="w-full rounded-2xl border bg-ink p-4 text-left
                             transition-colors active:bg-surface"
                  style={{ borderColor: notiz.farbe }}
                >
                  <p className="font-medium">{notiz.titel}</p>

                  {notiz.inhalt && (
                    <p className="mt-1.5 line-clamp-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                      {notiz.inhalt}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-muted/70">
                    {format(new Date(notiz.geaendertAm), 'd. MMM yyyy, HH:mm', {
                      locale: de,
                    })}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Abschnitt>

      {dialog && (
        <NotizSheet notiz={dialog.notiz} onSchliessen={() => setDialog(null)} />
      )}
    </div>
  )
}
