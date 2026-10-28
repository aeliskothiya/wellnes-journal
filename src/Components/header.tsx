import { useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type HeaderProps = {
  userName: string
  isDark: boolean
  onNameChange: (name: string) => void
  onThemeChange: () => void
}

export default function Header({
  userName,
  isDark,
  onNameChange,
  onThemeChange,
}: HeaderProps) {
  const [nameInput, setNameInput] = useState(userName)

  const setName = () => {
    const savedName = nameInput.trim()

    setNameInput(savedName)
    onNameChange(savedName)
  }

  return (
    <header className="flex flex-col gap-4 border-b border-(--app-border) bg-(--app-header) px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 lg:px-10">
      <div className="min-w-0">
        <p className="m-0 text-sm text-(--app-primary)">Good morning,</p>
        <h1 className="m-0 mt-1 text-xl font-bold sm:text-2xl">
          Welcome, {userName || 'Friend'}!
        </h1>
      </div>

      <div className="flex w-full min-w-0 items-center gap-3 sm:w-auto">
        <label className="sr-only" htmlFor="user-name">
          Your name
        </label>
        <input
          id="user-name"
          value={nameInput}
          onChange={(event) => setNameInput(event.target.value)}
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-(--app-border) bg-(--app-surface) px-3 py-2 text-sm outline-none focus:border-(--app-primary) sm:block sm:w-36 sm:flex-none"
          placeholder="Your name"
        />
        <button
          type="button"
          onClick={setName}
          className="min-h-11 shrink-0 rounded-lg bg-(--app-primary) px-3 py-2 text-sm font-medium text-(--app-text-on-primary) transition-opacity hover:opacity-90"
        >
          Set name
        </button>
        <button
          type="button"
          onClick={onThemeChange}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-(--app-border) px-3 py-2 text-sm font-medium transition-colors hover:bg-(--app-background)"
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
          <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </header>
  )
}
