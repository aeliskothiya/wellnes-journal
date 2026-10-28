import type { AppearanceMode, ColorTheme } from '../theme.ts'
import { themeOptions } from '../theme.ts'

type SettingsProps = {
  colorTheme: ColorTheme
  isDark: boolean
  onColorThemeChange: (theme: ColorTheme) => void
  onAppearanceModeChange: (mode: AppearanceMode) => void
}

export default function Settings({
  colorTheme,
  onColorThemeChange,
}: SettingsProps) {
  const selectedTheme = themeOptions.find((theme) => theme.id === colorTheme)

  return (
    <div className="w-auto  space-y-6">
      <section className="rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
        <h1 className="text-xl font-bold sm:text-2xl">Settings</h1>
        <p className="mt-1 text-sm text-(--app-primary)">
          Personalize the look and feel of your journal.
        </p>
      </section>

      <section className="w-150 h-50 rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Theme</h2>
            <p className="mt-1 text-sm opacity-75">
              Choose a color palette for the whole application.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="text-sm font-semibold" htmlFor="color-theme">
            Color palette
          </label>
          <select
            id="color-theme"
            value={colorTheme}
            onChange={(event) =>
              onColorThemeChange(event.target.value as ColorTheme)
            }
            className="min-h-10 rounded-lg border border-(--app-border) bg-(--app-background) px-3 py-2 text-sm outline-none focus:border-(--app-primary)"
          >
            {themeOptions.map((theme) => (
              <option key={theme.id} value={theme.id}>
                {theme.name}
              </option>
            ))}
          </select>

          <div
            className="flex h-8 w-32 overflow-hidden rounded-lg border border-(--app-border)"
            aria-label={`${selectedTheme?.name || 'Selected'} color preview`}
          >
            {selectedTheme?.preview.map((color) => (
              <span
                key={color}
                className="flex-1"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
