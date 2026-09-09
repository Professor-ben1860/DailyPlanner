/* ============================================================
   APP-ICONS ERZEUGEN
   ------------------------------------------------------------
   Erzeugt die PNG-Symbole, die Android und iOS auf dem
   Startbildschirm anzeigen. Aufruf im Projektordner:

       npm run icons

   Wenn du unten FARBE oder GRUND aenderst und den Befehl noch
   einmal ausfuehrst, werden alle Symbole neu gezeichnet.
   Es wird keine zusaetzliche Software benoetigt - das Skript
   schreibt die PNG-Dateien selbst.
   ============================================================ */

import { deflateSync } from 'node:zlib'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/* ---------- Aussehen ---------- */
const GRUND = [0, 0, 0] // Hintergrund: schwarz
const FARBE = [255, 122, 26] // Kreis: orange (#ff7a1a)
const HAKEN = [0, 0, 0] // Haekchen im Kreis: schwarz

const ZIEL = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')

/* ============================================================
   Teil 1: PNG-Datei schreiben
   ============================================================ */

// Pruefsumme, die das PNG-Format fuer jeden Abschnitt verlangt
const CRC_TABELLE = (() => {
  const tabelle = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabelle[i] = c >>> 0
  }
  return tabelle
})()

function crc32(daten) {
  let c = 0xffffffff
  for (const byte of daten) c = CRC_TABELLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function abschnitt(typ, daten) {
  const laenge = Buffer.alloc(4)
  laenge.writeUInt32BE(daten.length)
  const inhalt = Buffer.concat([Buffer.from(typ, 'ascii'), daten])
  const pruef = Buffer.alloc(4)
  pruef.writeUInt32BE(crc32(inhalt))
  return Buffer.concat([laenge, inhalt, pruef])
}

/** Baut aus Bildpunkten (RGBA) eine fertige PNG-Datei */
function alsPng(breite, hoehe, punkte) {
  const kopf = Buffer.alloc(13)
  kopf.writeUInt32BE(breite, 0)
  kopf.writeUInt32BE(hoehe, 4)
  kopf[8] = 8 // 8 Bit je Farbkanal
  kopf[9] = 6 // Farbtyp 6 = Rot/Gruen/Blau/Transparenz
  kopf[10] = 0
  kopf[11] = 0
  kopf[12] = 0

  // Jede Bildzeile beginnt im PNG mit einem Filter-Byte (0 = keiner)
  const zeilen = Buffer.alloc(hoehe * (1 + breite * 4))
  for (let y = 0; y < hoehe; y++) {
    const ziel = y * (1 + breite * 4)
    zeilen[ziel] = 0
    punkte.copy(zeilen, ziel + 1, y * breite * 4, (y + 1) * breite * 4)
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    abschnitt('IHDR', kopf),
    abschnitt('IDAT', deflateSync(zeilen, { level: 9 })),
    abschnitt('IEND', Buffer.alloc(0)),
  ])
}

/* ============================================================
   Teil 2: Das Symbol zeichnen
   ============================================================ */

/** Mischt eine Farbe ueber die vorhandene - fuer weiche Kanten */
function malen(punkte, index, farbe, deckung) {
  if (deckung <= 0) return
  const d = Math.min(1, deckung)
  const altA = punkte[index + 3] / 255
  const neuA = d + altA * (1 - d)
  if (neuA <= 0) return

  for (let k = 0; k < 3; k++) {
    const alt = punkte[index + k] * altA * (1 - d)
    punkte[index + k] = Math.round((farbe[k] * d + alt) / neuA)
  }
  punkte[index + 3] = Math.round(neuA * 255)
}

/** Abstand eines Punktes zu einer Strecke - fuer das Haekchen */
function abstandZurStrecke(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const laenge = dx * dx + dy * dy
  let anteil = laenge === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / laenge
  anteil = Math.max(0, Math.min(1, anteil))
  const nx = x1 + anteil * dx
  const ny = y1 + anteil * dy
  return Math.hypot(px - nx, py - ny)
}

/**
 * Zeichnet das Symbol.
 * @param groesse       Kantenlaenge in Bildpunkten
 * @param mitHintergrund false = durchsichtiger Hintergrund (fuer Androids
 *                       "adaptive icons", bei denen das System den Grund malt)
 * @param radiusAnteil   Groesse des Kreises im Verhaeltnis zum Bild
 */
function zeichneSymbol(groesse, mitHintergrund = true, radiusAnteil = 0.34) {
  const punkte = Buffer.alloc(groesse * groesse * 4)

  if (mitHintergrund) {
    for (let i = 0; i < groesse * groesse; i++) {
      punkte[i * 4] = GRUND[0]
      punkte[i * 4 + 1] = GRUND[1]
      punkte[i * 4 + 2] = GRUND[2]
      punkte[i * 4 + 3] = 255
    }
  }

  const mitte = groesse / 2
  // Radius bewusst klein: Android schneidet Symbole rund oder eckig zu,
  // der Rand muss also frei bleiben ("Sicherheitsbereich").
  const radius = groesse * radiusAnteil

  // Eckpunkte des Haekchens - im Verhaeltnis zum Kreis, damit es
  // bei jeder Kreisgroesse gleich aussieht
  const h1x = mitte - radius * 0.397
  const h1y = mitte + radius * 0.015
  const h2x = mitte - radius * 0.103
  const h2y = mitte + radius * 0.309
  const h3x = mitte + radius * 0.441
  const h3y = mitte - radius * 0.309
  const dicke = radius * 0.162

  for (let y = 0; y < groesse; y++) {
    for (let x = 0; x < groesse; x++) {
      const index = (y * groesse + x) * 4
      const px = x + 0.5
      const py = y + 0.5

      // Kreis
      const abstandKreis = Math.hypot(px - mitte, py - mitte)
      malen(punkte, index, FARBE, radius - abstandKreis + 0.5)

      // Haekchen (nur innerhalb des Kreises sichtbar)
      if (abstandKreis < radius) {
        const abstandHaken = Math.min(
          abstandZurStrecke(px, py, h1x, h1y, h2x, h2y),
          abstandZurStrecke(px, py, h2x, h2y, h3x, h3y),
        )
        malen(punkte, index, HAKEN, dicke / 2 - abstandHaken + 0.5)
      }
    }
  }

  return alsPng(groesse, groesse, punkte)
}

/* ============================================================
   Teil 3: Dateien schreiben
   ============================================================ */

mkdirSync(ZIEL, { recursive: true })

const DATEIEN = [
  ['icon-192.png', 192], // Android, kleine Anzeige
  ['icon-512.png', 512], // Android, grosse Anzeige
  ['apple-touch-icon.png', 180], // iPhone und iPad
]

for (const [name, groesse] of DATEIEN) {
  writeFileSync(join(ZIEL, name), zeichneSymbol(groesse))
  console.log('geschrieben:', name, groesse + 'x' + groesse)
}

// Das Symbol im Browser-Tab - als SVG, damit es immer scharf bleibt
const farbeHex =
  '#' + FARBE.map((z) => z.toString(16).padStart(2, '0')).join('')
const grundHex =
  '#' + GRUND.map((z) => z.toString(16).padStart(2, '0')).join('')

writeFileSync(
  join(ZIEL, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="${grundHex}"/>
  <circle cx="50" cy="50" r="34" fill="${farbeHex}"/>
  <path d="M36.5 50.5 L46.5 60.5 L65 39.5" fill="none" stroke="${grundHex}"
        stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`,
)
console.log('geschrieben: favicon.svg')

/* ============================================================
   Teil 4: Symbole fuer die Android-App
   ------------------------------------------------------------
   Android braucht das Symbol in fuenf Aufloesungen. Zusaetzlich
   gibt es das "adaptive icon": Dabei liefert die App nur das
   Motiv (Vordergrund) und das Betriebssystem malt den Hintergrund
   und schneidet die Form zu - rund, eckig oder tropfenfoermig,
   je nach Handy. Das Motiv muss deshalb kleiner sein.
   ============================================================ */

const ANDROID = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'android',
  'app',
  'src',
  'main',
  'res',
)

// Ordnername -> [Symbolgroesse, Groesse des Vordergrundbildes]
const DICHTEN = {
  'mipmap-mdpi': [48, 108],
  'mipmap-hdpi': [72, 162],
  'mipmap-xhdpi': [96, 216],
  'mipmap-xxhdpi': [144, 324],
  'mipmap-xxxhdpi': [192, 432],
}

if (existsSync(ANDROID)) {
  for (const [ordner, [klein, gross]] of Object.entries(DICHTEN)) {
    const ziel = join(ANDROID, ordner)
    mkdirSync(ziel, { recursive: true })

    const symbol = zeichneSymbol(klein)
    writeFileSync(join(ziel, 'ic_launcher.png'), symbol)
    writeFileSync(join(ziel, 'ic_launcher_round.png'), symbol)

    // Vordergrund: durchsichtig und kleineres Motiv, damit beim
    // Zuschneiden nichts vom Haekchen verloren geht
    writeFileSync(
      join(ziel, 'ic_launcher_foreground.png'),
      zeichneSymbol(gross, false, 0.227),
    )
  }

  // Den Hintergrund des adaptiven Symbols auf Schwarz stellen
  mkdirSync(join(ANDROID, 'values'), { recursive: true })
  writeFileSync(
    join(ANDROID, 'values', 'ic_launcher_background.xml'),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">${grundHex}</color>
</resources>
`,
  )

  console.log('geschrieben: Android-Symbole in 5 Aufloesungen')
} else {
  console.log('uebersprungen: Android-Ordner noch nicht vorhanden')
}
