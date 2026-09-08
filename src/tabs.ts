import { Sun, Calendar, ListTodo, Repeat, StickyNote } from 'lucide-react'

/* Hier stehen die 5 Seiten der App in der Reihenfolge,
   in der sie unten in der Homebar erscheinen. */
export const TABS = [
  { id: 'heute',    label: 'Heute',    icon: Sun },
  { id: 'kalender', label: 'Kalender', icon: Calendar },
  { id: 'projekte', label: 'Projekte', icon: ListTodo },
  { id: 'habits',   label: 'Habits',   icon: Repeat },
  { id: 'notizen',  label: 'Notizen',  icon: StickyNote },
] as const

/* "TabId" ist automatisch einer dieser Texte:
   'heute' | 'kalender' | 'projekte' | 'habits' | 'notizen'
   TypeScript warnt dich damit sofort, wenn du dich vertippst. */
export type TabId = (typeof TABS)[number]['id']
