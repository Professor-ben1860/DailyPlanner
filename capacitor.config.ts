import type { CapacitorConfig } from '@capacitor/cli'

/* ============================================================
   CAPACITOR-EINSTELLUNGEN
   ------------------------------------------------------------
   Capacitor packt die fertige Web-App in eine echte Android-App.
   - appId  ist die eindeutige Kennung im Betriebssystem.
     Sie darf sich spaeter NICHT mehr aendern, sonst haelt Android
     die App fuer eine voellig andere und die Daten waeren weg.
   - webDir sagt Capacitor, wo die gebaute App liegt (npm run build).
   ============================================================ */
const config: CapacitorConfig = {
  appId: 'de.dailyplanner.app',
  appName: 'Daily Planner',
  webDir: 'dist',
}

export default config
