import { useState } from 'react'
import { Pencil, Save, Trash2, X } from 'lucide-react'

type JournalEntryRecord = {
  id: number
  title: string
  content: string
  mood: string
  tags: string[]
  createdAt: string
}

const storageKey = 'journals-entry'
const moods = ['Happy 😊', 'Good 😁', 'Okay 😐', 'Sad 😢', 'Stressed 😰' ,'Boring 😴']
const availableTags = ['Greaceful', 'School', 'Family', 'Friends', 'Health', 'Hobby', 'Travel', 'Other']


function getSavedEntries() {
  const savedEntries = localStorage.getItem(storageKey)

  if (!savedEntries) return []

  try {
    const data: unknown = JSON.parse(savedEntries)

    if (!Array.isArray(data)) return []

    return data.map((entry) => {
      const savedEntry = entry as JournalEntryRecord & { tags?: string | string[] }
      return savedEntry 
    })
  } catch (error) {
    console.error('Could not read saved journal entries.', error)
    return []
  }
}   

export default function JournalEntry() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [entries, setEntries] = useState<JournalEntryRecord[]>(getSavedEntries)
  const [titleFilter, setTitleFilter] = useState('')
  const [moodFilter, setMoodFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const saveEntry = () => {
    if ( !content.trim()) return

    const updatedEntries =
      editingId === null
        ? [
            {
              id: Date.now(),
              title: title.trim(),
              content: content.trim(),
              mood,
              tags: selectedTags,
              createdAt: new Date().toLocaleDateString(),
            },
            ...entries,
          ]
        : entries.map((entry) =>
            entry.id === editingId
              ? { ...entry, title: title.trim(), content: content.trim(), mood, tags: selectedTags }
              : entry,
          )

    setEntries(updatedEntries)
    localStorage.setItem(storageKey, JSON.stringify(updatedEntries))
    clearEditor()
  }

  const editEntry = (entry: JournalEntryRecord) => {
    setTitle(entry.title)
    setContent(entry.content)
    setMood(entry.mood)
    setSelectedTags(entry.tags)
    setEditingId(entry.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  const deleteEntry = (entryId: number) => {
    const shouldDelete = window.confirm('Are you sure you want to delete this journal entry?')

    if (!shouldDelete) return

    const updatedEntries = entries.filter((entry) => entry.id !== entryId)
    setEntries(updatedEntries)
    localStorage.setItem(storageKey, JSON.stringify(updatedEntries))

    if (editingId === entryId) clearEditor()
  }

  function clearEditor() {
    setTitle('')
    setContent('')
    setMood('')
    setSelectedTags([])
    setEditingId(null)
  }

  const filteredEntries = entries.filter((entry) => {
    const hasTitle = entry.title
      .toLowerCase()
      .includes(titleFilter.toLowerCase())
    const hasMood = !moodFilter || entry.mood === moodFilter
    const hasTag = !tagFilter || entry.tags.includes(tagFilter)
    
    return hasTitle && hasMood && hasTag
  })

  return (
    <div className="w-full space-y-6">
      <section className="rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
        <h2 className="wrap-break-word text-xl font-bold sm:text-2xl">
          {editingId === null ? 'New journal entry' : 'Edit journal entry'}
        </h2>
        <p className="mt-1 text-sm text-(--app-primary)">
          
          Take a moment to write about your day.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-[minmax(180px,0.35fr)_minmax(0,1fr)]">
          <div>
            <label
              className="text-sm font-semibold"
              htmlFor="journal-mood"
            >
              How are you feeling?
            </label>
            <select
              id="journal-mood"
              value={mood}
              onChange={(event) => setMood(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border border-(--app-border) bg-(--app-background) px-3 py-2 outline-none focus:border-(--app-primary)"
            >
              <option value="">Select a mood</option>
              {moods.map((moodOption) => (
                <option key={moodOption} value={moodOption}>
                  {moodOption}
                </option>
              ))}
            </select>

            <label
              className="mt-4 block text-sm font-semibold"
              htmlFor="journal-tags"
            >
              Tags
            </label>
            <div
              id="journal-tags"
              className="mt-2 flex flex-wrap gap-2 rounded-xl border border-(--app-border) bg-(--app-background) p-3"
            >
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() =>
                    setSelectedTags((currentTags) =>
                      currentTags.includes(tag)
                        ? currentTags.filter((currentTag) => currentTag !== tag)
                        : [...currentTags, tag],
                    )
                  }
                  className={`rounded-full border px-3 py-2 text-sm ${
                    selectedTags.includes(tag)
                      ? 'border-(--app-primary) bg-(--app-primary) text-(--app-text-on-primary)'
                      : 'border-(--app-border)'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="text-sm font-semibold"
              htmlFor="journal-title"
            >
              Journal title
            </label>
            <input
              id="journal-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 min-h-11 w-full rounded-xl border border-(--app-border) bg-(--app-background) px-3 py-2 outline-none focus:border-(--app-primary)"
              placeholder="Give your entry a title"
            />
            <label
              className="mt-4 block text-sm font-semibold"
              htmlFor="journal-content"
            >
              Journal content
            </label>
            <textarea
              id="journal-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className="mt-2 min-h-40 w-full resize-y rounded-xl border border-(--app-border) bg-(--app-background) p-4 outline-none focus:border-(--app-primary)"
              placeholder="Write how you are feeling today..."
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveEntry}
          disabled={ !content.trim() }
          className="mt-5 flex min-h-11 items-center gap-2 rounded-xl bg-(--app-primary) px-5 py-3 text-sm font-semibold text-(--app-text-on-primary) transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save size={17} aria-hidden="true" />
          {editingId === null ? 'Save entry' : 'Update entry'}
        </button>
        {editingId !== null && (
          <button
            type="button"
            onClick={clearEditor}
            className="ml-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-(--app-border) px-5 py-3 text-sm font-semibold"
          >
            <X size={17} aria-hidden="true" />
            Cancel
          </button>
        )}
      </section>

      <section className="rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">Your journal entries</h2>
            <p className="mt-1 text-sm text-(--app-primary)">
              Look back at your reflections.
            </p>
          </div>
          <span className="text-sm text-(--app-primary)">
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <label className="sr-only" htmlFor="title-filter">
              Filter by title
            </label>
            <input
              id="title-filter"
              value={titleFilter}
              onChange={(event) => setTitleFilter(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-(--app-border) bg-(--app-background) px-3 py-2 outline-none focus:border-(--app-primary)"
              placeholder="Filter by title"
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="mood-filter">
              Filter by mood
            </label>
            <select
              id="mood-filter"
              value={moodFilter}
              onChange={(event) => setMoodFilter(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-(--app-border) bg-(--app-background) px-3 py-2 outline-none focus:border-(--app-primary)"
            >
              <option value="">All moods</option>
              {moods.map((moodOption) => (
                <option key={moodOption} value={moodOption}>
                  {moodOption}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="sr-only" htmlFor="tags-filter">
              Filter by tags
            </label>
            <select
              id="tags-filter"
              value={tagFilter}
              onChange={(event) => setTagFilter(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-(--app-border) bg-(--app-background) px-3 py-2 outline-none focus:border-(--app-primary)"
            >
              <option value="">All tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filteredEntries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-(--app-border) p-6 text-center text-sm text-(--app-primary)">
              {entries.length === 0
                ? 'Your saved entries will appear here.'
                : 'No entries match your filters.'}
            </p>
          ) : (
            filteredEntries.map((entry) => (
              <article
                key={entry.id}
                className="rounded-xl border border-(--app-border) bg-(--app-background) p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-bold">{entry.title}</h3>
                  <span className="rounded-full bg-(--app-sidebar-active) px-3 py-1 text-xs font-semibold text-(--app-text)">
                    {entry.mood}
                  </span>
                </div>
                <p className="mt-1 text-xs text-(--app-primary)">
                  {entry.createdAt}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                  {entry.content}
                </p>
                {entry.tags.length > 0 && (
                  <p className="mt-3 text-sm font-semibold text-(--app-primary)">
                    Tags: {entry.tags.join(', ')}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => editEntry(entry)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-(--app-border) px-3 py-2 text-sm font-semibold hover:bg-(--app-surface)"
                  >
                    <Pencil size={15} aria-hidden="true" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-(--app-danger) px-3 py-2 text-sm font-semibold text-(--app-danger) hover:bg-(--app-danger-surface)"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
