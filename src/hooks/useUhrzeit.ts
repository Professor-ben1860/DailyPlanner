import { useEffect, useState } from 'react'

/* Liefert die aktuelle Uhrzeit und aktualisiert sie jede Sekunde,
   damit die Anzeige auf der Heute-Seite mitlaeuft. */
export function useUhrzeit() {
  const [jetzt, setJetzt] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setJetzt(new Date()), 1000)
    // Aufraeumen: den Timer stoppen, wenn die Seite verlassen wird
    return () => window.clearInterval(timer)
  }, [])

  return jetzt
}
