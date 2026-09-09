# Daily Planner

Kalender, Aufgaben, Projekte, Gewohnheiten und Notizen an einem Ort.
Laeuft als Web-App im Browser (PWA) und als echte Android-App
mit Homescreen-Widgets.

## Befehle

| Befehl | Was er macht |
| --- | --- |
| `npm run dev` | Startet die App zum Entwickeln auf http://localhost:5173 |
| `npm run build` | Baut die fertige App in den Ordner `dist` |
| `npm run preview` | Zeigt die gebaute App auf http://localhost:4173 |
| `npm run icons` | Zeichnet die App-Symbole neu (nach Farbaenderung) |
| `npm run android` | Baut die Android-App und legt `DailyPlanner.apk` auf den Desktop |

## Wo was liegt

| Datei / Ordner | Inhalt |
| --- | --- |
| `src/index.css` | Alle Farben der App an einer Stelle |
| `src/types.ts` | Das Datenmodell: welche Felder Aufgaben, Termine usw. haben |
| `src/storage.ts` | Speichern und Laden der Daten (Capacitor Preferences) |
| `src/store.tsx` | Alle Funktionen zum Hinzufuegen, Aendern, Loeschen |
| `src/auswahl.ts` | Fragen wie "Was steht heute an?" |
| `src/pages/` | Die fuenf Seiten der App |
| `src/components/` | Wiederverwendbare Bausteine (Dialoge, Eingabefelder) |
| `android/` | Das Android-Projekt (von Capacitor erzeugt) |
| `scripts/icons-erzeugen.mjs` | Erzeugt die App-Symbole |
| `scripts/android-bauen.mjs` | Baut die Android-App in einem Rutsch |
| `.github/workflows/deploy.yml` | Veroeffentlicht die App automatisch auf GitHub Pages |

## Veroeffentlichung

**Als Web-App:** Bei jedem `git push` auf den Zweig `main` baut GitHub
die App automatisch und stellt sie auf GitHub Pages bereit.

**Als Android-App:** `npm run android` ausfuehren, die entstandene
`DailyPlanner.apk` aufs Handy uebertragen und dort antippen.

## Wo die Daten liegen

Alle Eintraege bleiben auf dem Geraet - im Browser im lokalen Speicher,
in der Android-App in den SharedPreferences unter dem Schluessel
`CapacitorStorage.dailyplanner.v1`. Von dort liest spaeter auch das
Homescreen-Widget.
