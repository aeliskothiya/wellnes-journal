import type { LucideIcon } from 'lucide-react'
import { BarChart3, BookOpen, Home, Leaf, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigationItems: { label: string; path: string; icon: LucideIcon }[] = [
  { label: 'Dashboard', path: '/', icon: Home },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Journal Entry', path: '/journal', icon: BookOpen },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <>
      <div className="sticky top-0 hidden h-screen shrink-0 flex-col bg-(--app-sidebar) p-4 text-(--app-sidebar-text) md:flex md:w-50 lg:w-64 lg:p-5">
        <div className="mb-8 flex items-center gap-3 lg:mb-10 bg-amber-50/10 p-3 rounded-xl">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--app-accent) text-xl font-bold text-(--app-sidebar)"
            aria-hidden="true"
          >
            <Leaf size={21} strokeWidth={2.5} />
          </span>
          <div className="min-w-0">
            <h2 className="m-0 text-lg font-bold">Wellness</h2>
            <p className="m-0 text-xs opacity-75">Your daily journal</p>
          </div>
        </div>
        <nav aria-label="Main navigation" className="flex flex-col gap-2 lg:gap-3">
          {navigationItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-colors lg:px-4 ${
                  isActive
                    ? 'bg-(--app-sidebar-active) text-(--app-sidebar)'
                    : 'text-(--app-sidebar-text)'
                }`
              }
            >
              <item.icon size={19} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-(--app-accent)/20 p-3 text-sm lg:p-4">
          <p className="m-0 font-semibold">Keep going</p>
          <p className="m-0 mt-1 text-xs opacity-75">
            Small reflections create meaningful change.
          </p>
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-(--app-border) bg-(--app-sidebar) px-2 py-2 text-(--app-sidebar-text) md:hidden"
      >
        {navigationItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-medium ${
                isActive
                  ? 'bg-(--app-sidebar-active) text-(--app-sidebar)'
                  : 'text-(--app-sidebar-text)'
              }`
            }
          >
            <item.icon size={18} aria-hidden="true" />
            <span className="max-w-full truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
