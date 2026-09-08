import { TABS, type TabId } from '../tabs'

type Props = {
  active: TabId
  onChange: (id: TabId) => void
}

/* Die Leiste am unteren Bildschirmrand. */
export default function TabBar({ active, onChange }: Props) {
  return (
    <nav
      className="shrink-0 border-t border-line bg-ink/95 backdrop-blur
                 pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === active

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5
                         transition-colors duration-200 active:bg-surface"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.2 : 1.7}
                className={isActive ? 'text-accent' : 'text-muted'}
              />
              <span
                className={`text-[10px] tracking-wide ${
                  isActive ? 'text-accent font-medium' : 'text-muted'
                }`}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
