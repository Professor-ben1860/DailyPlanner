# Daily Planner

Kalender, Aufgaben, Projekte, Gewohnheiten und Notizen an einem Ort.
Laeuft als Web-App im Browser (PWA) und spaeter als echte Android-App
mit Homescreen-Widgets.

## Befehle

| Befehl | Was er macht |
| --- | --- |
| `npm run dev` | Startet die App zum Entwickeln auf http://localhost:5173 |
| `npm run build` | Baut die fertige App in den Ordner `dist` |
| `npm run preview` | Zeigt die gebaute App auf http://localhost:4173 |
| `npm run icons` | Zeichnet die App-Symbole neu (nach Farbaenderung) |

## Wo was liegt

| Datei / Ordner | Inhalt |
| --- | --- |
| `src/index.css` | Alle Farben der App an einer Stelle |
| `src/types.ts` | Das Datenmodell: welche Felder Aufgaben, Termine usw. haben |
| `src/storage.ts` | Speichern und Laden der Daten |
| `src/store.tsx` | Alle Funktionen zum Hinzufuegen, Aendern, Loeschen |
| `src/auswahl.ts` | Fragen wie "Was steht heute an?" |
| `src/pages/` | Die fuenf Seiten der App |
| `src/components/` | Wiederverwendbare Bausteine (Dialoge, Eingabefelder) |
| `scripts/icons-erzeugen.mjs` | Erzeugt die App-Symbole |
| `.github/workflows/deploy.yml` | Veroeffentlicht die App automatisch auf GitHub Pages |

## Veroeffentlichung

Bei jedem `git push` auf den Zweig `main` baut GitHub die App
automatisch und stellt sie auf GitHub Pages bereit.
