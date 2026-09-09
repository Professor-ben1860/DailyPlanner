/* ============================================================
   ANDROID-APP BAUEN
   ------------------------------------------------------------
   Erledigt alle vier Schritte auf einmal:

       npm run android

   1. Web-App bauen
   2. Sie ins Android-Projekt kopieren
   3. Die APK-Datei erzeugen
   4. Sie als "DailyPlanner.apk" auf den Desktop legen

   Das noetige Java bringt Android Studio mit - dieses Skript
   sucht es selbst, du musst nichts einrichten.
   ============================================================ */

import { execSync } from 'node:child_process'
import { copyFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJEKT = join(dirname(fileURLToPath(import.meta.url)), '..')

/* ---------- Java finden ---------- */
const JAVA_ORTE = [
  'C:\\Program Files\\Android\\Android Studio\\jbr',
  'C:\\Program Files\\Android\\Android Studio1\\jbr',
  join(homedir(), 'AppData\\Local\\Programs\\Android Studio\\jbr'),
  process.env.JAVA_HOME,
].filter(Boolean)

const java = JAVA_ORTE.find((ort) => existsSync(join(ort, 'bin', 'java.exe')))

if (!java) {
  console.error(
    '\nJava wurde nicht gefunden.\n' +
      'Normalerweise bringt Android Studio es mit. Pruefe, ob Android\n' +
      'Studio installiert ist, oder setze JAVA_HOME auf ein JDK 17+.\n',
  )
  process.exit(1)
}

/* ---------- Android-SDK finden ---------- */
const SDK_ORTE = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  join(homedir(), 'AppData\\Local\\Android\\Sdk'),
].filter(Boolean)

const sdk = SDK_ORTE.find((ort) => existsSync(ort))

if (!sdk) {
  console.error(
    '\nDas Android-SDK wurde nicht gefunden.\n' +
      'Oeffne Android Studio einmal - es richtet das SDK dann ein.\n',
  )
  process.exit(1)
}

const umgebung = { ...process.env, JAVA_HOME: java, ANDROID_HOME: sdk }

/** Fuehrt einen Befehl aus und zeigt seine Ausgabe direkt an */
function schritt(beschreibung, befehl, ordner = PROJEKT) {
  console.log('\n=== ' + beschreibung + ' ===')
  execSync(befehl, { cwd: ordner, env: umgebung, stdio: 'inherit' })
}

console.log('Java:', java)
console.log('Android-SDK:', sdk)

schritt('1/4 Web-App bauen', 'npm run build')
schritt('2/4 Ins Android-Projekt kopieren', 'npx cap sync android')

/* Windows sucht Programme nicht im aktuellen Ordner. Deshalb geben
   wir den vollen Pfad an - in Anfuehrungszeichen, falls im Pfad
   Leerzeichen vorkommen. */
const gradlew = '"' + join(PROJEKT, 'android', 'gradlew.bat') + '"'

schritt(
  '3/4 APK erzeugen (beim ersten Mal dauert das einige Minuten)',
  gradlew + ' assembleDebug',
  join(PROJEKT, 'android'),
)

/* ---------- Fertige Datei bereitlegen ---------- */
const quelle = join(
  PROJEKT,
  'android',
  'app',
  'build',
  'outputs',
  'apk',
  'debug',
  'app-debug.apk',
)
const ziel = join(homedir(), 'Desktop', 'DailyPlanner.apk')

copyFileSync(quelle, ziel)
console.log('\n=== 4/4 Fertig ===')
console.log('Die App liegt jetzt hier:')
console.log('  ' + ziel)
console.log('\nUebertrage sie auf dein Handy und tippe sie dort an.')
