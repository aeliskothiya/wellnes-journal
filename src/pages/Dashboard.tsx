import { useEffect, useState } from 'react'
import { Plus, Quote } from 'lucide-react'

type DashboardProps = {
  onNewEntry: () => void
}

type QuoteData = {
  q: string
  a: string
}

export default function Dashboard({ onNewEntry }: DashboardProps) {
  const [dailyQuote, setDailyQuote] = useState<QuoteData | null>(null)
  const [quoteLoading, setQuoteLoading] = useState(true)

  useEffect(() => {
    const getDailyQuote = async () => {
      try {
        const response = await fetch('/api/today')
        if (!response.ok) {
          throw new Error('Could not load the daily quote.')
        }
        const data: unknown = await response.json()
        if (
          Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0] === 'object' &&
          data[0] !== null &&
          'q' in data[0] &&
          'a' in data[0] &&
          typeof data[0].q === 'string' &&
          typeof data[0].a === 'string'
        ) {
          setDailyQuote({ q: data[0].q, a: data[0].a })
        } else {
          throw new Error('The daily quote response was not valid.')
        }
      } catch (error) {
        console.error('Could not load the daily quote.', error)
      } finally {
        setQuoteLoading(false)
      }
    }
    void getDailyQuote()
  }, [])

  return (
    <div className="w-full space-y-6">
      <section className="rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
        <p className="m-0 text-sm font-medium text-(--app-primary)">
          Today&apos;s reflection
        </p>
        <h2 className="m-0 mt-2 wrap-break-word text-xl font-bold sm:text-2xl">
          How are you feeling today?
        </h2>
        <p className="mt-2 opacity-75">
          Take a moment to check in with yourself.
        </p>
        <button
          type="button"
          onClick={onNewEntry}
          className="mt-5 flex min-h-11 items-center gap-2 rounded-xl bg-(--app-primary) px-5 py-3 text-sm font-semibold text-(--app-text-on-primary) transition-opacity hover:opacity-90"
        >
          <Plus size={18} aria-hidden="true" />
          New entry
        </button>
      </section>

      <section className="rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
        <div className="flex items-center gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-(--app-sidebar-active) text-(--app-primary)"
            aria-hidden="true"
          >
            <Quote size={20} />
          </span>
          <div>
            <p className="m-0 text-sm font-medium text-(--app-primary)">
              Daily inspiration
            </p>
            <h2 className="m-0 mt-1 text-xl font-bold">Quote of the day</h2>
          </div>
        </div>

        {quoteLoading ? (
          <p className="mt-5 text-sm opacity-75">Loading today&apos;s quote...</p>
        ) : dailyQuote ? (
          <blockquote className="m-0 mt-5 border-l-4 border-(--app-accent) pl-4">
            <p className="m-0 text-lg italic leading-8">
              <strong>&ldquo;</strong> {dailyQuote.q}<strong>&rdquo;</strong>
            </p>
            <footer className="mt-3 text-sm font-semibold text-(--app-primary)">
              — {dailyQuote.a}
            </footer>
          </blockquote>
        ) : (
          <p className="mt-5 text-sm opacity-75">
            Today&apos;s quote is not available right now. Please try again later.
          </p>
        )}
      </section>
    </div>
  )
}
