import { useState } from 'react'
import TabBar from './components/TabBar'
import type { TabId } from './tabs'
import TodayPage from './pages/TodayPage'
import CalendarPage from './pages/CalendarPage'
import ProjectsPage from './pages/ProjectsPage'
import HabitsPage from './pages/HabitsPage'
import NotesPage from './pages/NotesPage'

export default function App() {
  /* "useState" ist Reacts Gedaechtnis: hier merkt sich die App,
     welche Seite gerade offen ist. Start ist immer "heute". */
  const [aktiveSeite, setAktiveSeite] = useState<TabId>('heute')

  return (
    <div className="flex h-full flex-col bg-ink text-text">
      {/* Der scrollbare Bereich in der Mitte */}
      <main className="flex-1 overflow-y-auto px-4 pb-6 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <div className="mx-auto w-full max-w-md">
          {aktiveSeite === 'heute' && <TodayPage />}
          {aktiveSeite === 'kalender' && <CalendarPage />}
          {aktiveSeite === 'projekte' && <ProjectsPage />}
          {aktiveSeite === 'habits' && <HabitsPage />}
          {aktiveSeite === 'notizen' && <NotesPage />}
        </div>
      </main>

      {/* Die Homebar bleibt immer unten stehen */}
      <TabBar active={aktiveSeite} onChange={setAktiveSeite} />
    </div>
  )
}
