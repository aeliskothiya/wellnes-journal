import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import Footer from './Components/footer.tsx'
import Header from './Components/header.tsx'
import Sidebar from './Components/sidebar.tsx'
import Analytics from './pages/Analytics.tsx'
import Dashboard from './pages/Dashboard.tsx'
import JournalEntry from './pages/JournalEntry.tsx'
import Settings from './pages/Settings.tsx'
import type { AppearanceMode, ColorTheme } from './theme.ts'

function App() {
  const [userName, setUserName] = useState(
    () => localStorage.getItem('userName') || '',
  )
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('theme') === 'dark',
  )
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    const savedTheme = localStorage.getItem('colorTheme')

    return savedTheme === 'gimmer' || savedTheme === 'alabaster'
      ? savedTheme
      : 'sandwood'
  })

  useEffect(() => {
    localStorage.setItem('userName', userName)
  }, [userName])

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    document.documentElement.dataset.palette = colorTheme
      localStorage.setItem('colorTheme', colorTheme)
  }, [colorTheme])

  return (
    <BrowserRouter>
      <AppLayout
        colorTheme={colorTheme}
        isDark={isDark}
        onColorThemeChange={setColorTheme}
        onAppearanceModeChange={(mode) => setIsDark(mode === 'dark')}
        userName={userName}
        onNameChange={setUserName}
        onThemeChange={() => setIsDark((current) => !current)}
      />
    </BrowserRouter>
  )
}

type AppLayoutProps = {
  colorTheme: ColorTheme
  isDark: boolean
  onColorThemeChange: (theme: ColorTheme) => void
  onAppearanceModeChange: (mode: AppearanceMode) => void
  userName: string
  onNameChange: (name: string) => void
  onThemeChange: () => void
}

function AppLayout({
  colorTheme,
  isDark,
  onColorThemeChange,
  onAppearanceModeChange,
  userName,
  onNameChange,
  onThemeChange,
}: AppLayoutProps) {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen w-full bg-(--app-background) text-(--app-text)">
      <Sidebar />
      <section className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <Header
          userName={userName}
          isDark={isDark}
          onNameChange={onNameChange}
          onThemeChange={onThemeChange}
        />
        <div className="min-w-0 flex-1 bg-(--app-background) p-4 sm:p-6 lg:p-10">
          <Routes>
            <Route
              path="/"
              element={<Dashboard onNewEntry={() => navigate('/journal')} />}
            />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/journal" element={<JournalEntry />} />
            <Route
              path="/settings"
              element={
                <Settings
                  colorTheme={colorTheme}
                  isDark={isDark}
                  onColorThemeChange={onColorThemeChange}
                  onAppearanceModeChange={onAppearanceModeChange}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Footer />
      </section>
    </main>
  )
}

export default App
