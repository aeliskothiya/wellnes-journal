import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MoodEntryRecord = {
  id: number;
  mood: string;
  createdAt: string;
  note?: string;
};

type CalendarDay = {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
};
const moodStorageKey = "mood-entries";
const moods = [
  { value: "Happy 😊", label: "Happy", emoji: "😊" },
  { value: "Good 😁", label: "Good", emoji: "😁" },
  { value: "Okay 😐", label: "Okay", emoji: "😐" },
  { value: "Sad 😢", label: "Sad", emoji: "😢" },
  { value: "Stressed 😰", label: "Stressed", emoji: "😰" },
  { value: "Boring 😴", label: "Boring", emoji: "😴" },
];
const moodScores: Record<string, number> = {
  "Happy 😊": 5,
  "Good 😁": 4,
  "Okay 😐": 3,
  "Sad 😢": 2,
  "Stressed 😰": 1,
  "Boring 😴": 1,
};
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function padNumber(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getTodayKey() {
  return formatDateKey(new Date());
}

function isMoodEntry(entry: unknown): entry is MoodEntryRecord {
  return (
    typeof entry === "object" &&
    entry !== null &&
    typeof (entry as MoodEntryRecord).id === "number" &&
    typeof (entry as MoodEntryRecord).mood === "string" &&
    typeof (entry as MoodEntryRecord).createdAt === "string"
  );
}

function getSavedMoodEntries(): MoodEntryRecord[] {
  const savedEntries = localStorage.getItem(moodStorageKey);
  if (!savedEntries) return [];

  try {
    const data: unknown = JSON.parse(savedEntries);
    if (!Array.isArray(data)) return [];

    return data.filter(isMoodEntry);
  } catch (error) {
    console.error("Could not read saved mood entries.", error);
    return [];
  }
}

function getEntryDateKey(entry: MoodEntryRecord) {
  return entry.createdAt.slice(0, 10);
}

// function getCalendarDays(month: Date): CalendarDay[] {
//   const firstDay = new Date(month.getFullYear(), month.getMonth(), 1)
//   const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
//   const daysInPreviousMonth = new Date(month.getFullYear(), month.getMonth(), 0).getDate()
//   const days: CalendarDay[] = []

//   for (let index = firstDay.getDay() -1 ; index >= 0; index -= 1) {
//     const date = new Date(month.getFullYear(), month.getMonth() - 1, daysInPreviousMonth - index)
//     days.push({ date: formatDateKey(date), dayNumber: date.getDate(), isCurrentMonth: false })
//   }

//   for (let day = 1; day <= daysInMonth; day += 1) {
//     const date = new Date(month.getFullYear(), month.getMonth(), day)
//     days.push({ date: formatDateKey(date), dayNumber: day, isCurrentMonth: true })
//   }

//   while (days.length < 42) {
//     const date = new Date(month.getFullYear(), month.getMonth(), 1 + days.length - firstDay.getDay())
//     days.push({ date: formatDateKey(date), dayNumber: date.getDate(), isCurrentMonth: false })
//   }

//   return days
// }

function getCalendarDays(month: Date): CalendarDay[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(firstDay);
  start.setDate(1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);

    return {
      date: formatDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month.getMonth(),
    };
  });
}

function formatDate(dateKey: string, options: Intl.DateTimeFormatOptions) {
  return dateFromKey(dateKey).toLocaleDateString(undefined, options);
}

function isFutureDate(dateKey: string) {
  return dateKey > getTodayKey();
}

function getWeekRange(dateKey: string) {
  const date = dateFromKey(dateKey);
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: formatDateKey(start), end: formatDateKey(end) };
}

function getEntryTime(entry: MoodEntryRecord) {
  const parsedDate = new Date(entry.createdAt);
  return Number.isNaN(parsedDate.getTime())
    ? "Time not recorded"
    : parsedDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function Analytics() {
  const todayKey = getTodayKey();
  const [entries, setEntries] =
    useState<MoodEntryRecord[]>(getSavedMoodEntries);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [visibleMonth, setVisibleMonth] = useState(() => dateFromKey(todayKey));
  const [mood, setMood] = useState("");
  const [entryDate, setEntryDate] = useState(todayKey);
  const [entryTime, setEntryTime] = useState(() => {
    const now = new Date();
    return `${padNumber(now.getHours())}:${padNumber(now.getMinutes())}`;
  });
  const [note, setNote] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const refreshEntries = () => setEntries(getSavedMoodEntries());
    window.addEventListener("storage", refreshEntries);
    return () => window.removeEventListener("storage", refreshEntries);
  }, []);

  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, MoodEntryRecord[]>();
    entries.forEach((entry) => {
      const dateKey = getEntryDateKey(entry);
      if (!dateKey) return;
      grouped.set(dateKey, [...(grouped.get(dateKey) || []), entry]);
    });
    return grouped;
  }, [entries]);

  const selectedEntries = entriesByDate.get(selectedDate) || [];
  const weekRange = getWeekRange(selectedDate);
  const weekEntries = entries.filter((entry) => {
    const dateKey = getEntryDateKey(entry);
    return dateKey >= weekRange.start && dateKey <= weekRange.end;
  });

  const graphEntries =
    selectedEntries.length > 0 ? selectedEntries : weekEntries;
  const calendarDays = getCalendarDays(visibleMonth);
  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
  const canGoToNextMonth =
    visibleMonth.getFullYear() < new Date().getFullYear() ||
    (visibleMonth.getFullYear() === new Date().getFullYear() &&
      visibleMonth.getMonth() < new Date().getMonth());

  const graphPoints = graphEntries
    .map((entry) => ({
      entry,
      score: moodScores[entry.mood],
      dateKey: getEntryDateKey(entry),
    }))
    .filter((point) => point.score !== undefined)
    .sort(
      (a, b) =>
        new Date(a.entry.createdAt).getTime() -
        new Date(b.entry.createdAt).getTime(),
    );

  const graphData = graphPoints.map((point) => ({
    id: point.entry.id,
    date: point.dateKey,
    dateLabel: formatDate(point.dateKey, { month: "short", day: "numeric" }),
    mood: point.entry.mood,
    time: getEntryTime(point.entry),
    pointLabel: `${formatDate(point.dateKey, { month: "short", day: "numeric" })} ${getEntryTime(point.entry)}`,
    score: point.score,
  }));
  const averageMoodScore =
    graphData.length > 0
      ? graphData.reduce((sum, point) => sum + point.score, 0) /
        graphData.length
      : null;
  const averageMoodEmoji =
    averageMoodScore === null
      ? ""
      : ({ 1: "😰", 2: "😢", 3: "😐", 4: "😁", 5: "😊" } as Record<
          number,
          string
        >)[Math.max(1, Math.min(5, Math.round(averageMoodScore)))];

  const selectDate = (dateKey: string) => {
    if (isFutureDate(dateKey)) return;
    setSelectedDate(dateKey);
    setEntryDate(dateKey);
    setErrorMessage("");
  };

  const changeMonth = (amount: number) => {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  const saveMood = () => {
    const selectedDateTime = new Date(`${entryDate}T${entryTime}`);
    if (!mood) {
      setErrorMessage("Please choose a mood.");
      return;
    }
    if (
      Number.isNaN(selectedDateTime.getTime()) ||
      selectedDateTime > new Date()
    ) {
      setErrorMessage(
        "Mood entries cannot be saved for a future date or time.",
      );
      return;
    }

    const newEntry: MoodEntryRecord = {
      id: Date.now(),
      mood,
      createdAt: selectedDateTime.toISOString(),
      note: note.trim() || undefined,
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    localStorage.setItem(moodStorageKey, JSON.stringify(updatedEntries));
    setSelectedDate(entryDate);
    setVisibleMonth(dateFromKey(entryDate));
    setNote("");
    setMood("");
    setErrorMessage("");
  };

  const deleteEntry = (entryId: number) => {
    if (!window.confirm("Are you sure you want to delete this mood entry?"))
      return;
    const updatedEntries = entries.filter((entry) => entry.id !== entryId);
    setEntries(updatedEntries);
    localStorage.setItem(moodStorageKey, JSON.stringify(updatedEntries));
  };

  return (
    <div className="w-full space-y-6">
      <header>
        <p className="m-0 text-sm font-medium text-(--app-primary)">
          Your wellness insights
        </p>
        <h1 className="m-0 mt-1 text-2xl font-bold sm:text-3xl">Analytics</h1>
        <p className="mt-2 opacity-75">
          Choose a day to see your mood patterns and reflections.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Calendar</h2>
                <p className="mt-1 text-sm text-(--app-primary)">
                  Select a day to explore.
                </p>
              </div>
              <CalendarDays
                className="text-(--app-primary)"
                aria-hidden="true"
              />
            </div>
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="rounded-lg p-2 hover:bg-(--app-background)"
                aria-label="Previous month"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="text-base font-bold">{monthLabel}</h3>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                disabled={!canGoToNextMonth}
                className="rounded-lg p-2 hover:bg-(--app-background) disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next month"
              >
                <ChevronRight size={20} />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-(--app-primary)">
              {weekDays.map((day) => (
                <span key={day} className="py-2">
                  {day}
                </span>
              ))}
              {calendarDays.map((day) => {
                const hasEntries =
                  (entriesByDate.get(day.date) || []).length > 0;
                const isSelected = day.date === selectedDate;
                const disabled = isFutureDate(day.date);
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => selectDate(day.date)}
                    disabled={disabled}
                    className={`relative min-h-11 rounded-xl text-sm transition-colors ${
                      isSelected
                        ? "bg-(--app-primary) font-bold text-(--app-text-on-primary)"
                        : day.isCurrentMonth
                          ? "hover:bg-(--app-background)"
                          : "opacity-40"
                    } ${disabled ? "cursor-not-allowed opacity-25" : ""}`}

                  >
                    {day.dayNumber}
                    {hasEntries && (
                      <span
                        className={`absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full ${isSelected ? "bg-(--app-text-on-primary)" : "bg-(--app-accent)"}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-bold">Log a mood</h2>
            <p className="mt-1 text-sm text-(--app-primary)">
              A quick check-in is enough.
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-semibold">Mood</p>
                <div
                  className="mt-2 grid grid-cols-3 gap-2"
                  role="group"
                  aria-label="Choose a mood"
                >
                  {moods.map((moodOption) => (
                    <button
                      key={moodOption.value}
                      type="button"
                      onClick={() => setMood(moodOption.value)}
                      aria-pressed={mood === moodOption.value}
                      className={`flex min-h-20 flex-col items-center justify-center rounded-xl border px-2 py-2 text-sm transition-colors ${
                        mood === moodOption.value
                          ? "border-(--app-primary) bg-(--app-primary) font-semibold text-(--app-text-on-primary)"
                          : "border-(--app-border) bg-(--app-background) hover:border-(--app-primary)"
                      }`}
                    >
                      <span className="text-2xl" aria-hidden="true">
                        {moodOption.emoji}
                      </span>
                      <span className="mt-1">{moodOption.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold" htmlFor="mood-date">
                    Date
                  </label>
                  <input
                    id="mood-date"
                    type="date"
                    max={todayKey}
                    value={entryDate}
                    onChange={(event) => setEntryDate(event.target.value)}
                    className="mt-2 min-h-11 w-full rounded-xl border border-(--app-border) bg-(--app-background) px-3 py-2 outline-none focus:border-(--app-primary)"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold" htmlFor="mood-time">
                    Time
                  </label>
                  <input
                    id="mood-time"
                    type="time"
                    value={entryTime}
                    onChange={(event) => setEntryTime(event.target.value)}
                    className="mt-2 min-h-11 w-full rounded-xl border border-(--app-border) bg-(--app-background) px-3 py-2 outline-none focus:border-(--app-primary)"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold" htmlFor="mood-note">
                  Note{" "}
                  <span className="font-normal opacity-70">(optional)</span>
                </label>
                <textarea
                  id="mood-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="What is on your mind?"
                  className="mt-2 min-h-24 w-full resize-y rounded-xl border border-(--app-border) bg-(--app-background) p-3 outline-none focus:border-(--app-primary)"
                />
              </div>
              {errorMessage && (
                <p
                  className="text-sm font-semibold text-(--app-danger)"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}
              <button
                type="button"
                onClick={saveMood}
                className="flex min-h-11 items-center gap-2 rounded-xl bg-(--app-primary) px-5 py-3 text-sm font-semibold text-(--app-text-on-primary) transition-opacity hover:opacity-90"
              >
                <Save size={17} aria-hidden="true" /> Save mood
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Mood trend</h2>
                <p className="mt-1 text-sm text-(--app-primary)">
                  {selectedEntries.length > 0
                    ? `Entries for ${formatDate(selectedDate, { month: "long", day: "numeric" })}`
                    : `Week of ${formatDate(weekRange.start, { month: "short", day: "numeric" })}`}
                </p>
              </div>
              <span className="rounded-full bg-(--app-sidebar-active) px-3 py-1 text-xs font-semibold">
                {graphEntries.length}{" "}
                {graphEntries.length === 1 ? "entry" : "entries"}
              </span>
            </div>
            {graphData.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-(--app-border) p-8 text-center text-sm text-(--app-primary)">
                No mood entries for this week yet. Your trend will appear here
                after your first check-in.
              </p>
            ) : (
              <div
                className="mt-5 w-full"
                role="img"
                aria-label="Mood trend area chart"
              >
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={graphData}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                    <defs>
                      <linearGradient
                        id="mood-area-fill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="var(--app-accent)"
                          stopOpacity={0.55}
                        />
                        <stop
                          offset="100%"
                          stopColor="var(--app-accent)"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      stroke="var(--app-border)"
                      strokeDasharray="4 5"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="pointLabel"
                      tick={{ fill: "var(--app-primary)", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                      tick={{ fill: "var(--app-primary)", fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      shared={false}
                      contentStyle={{
                        backgroundColor: "var(--app-surface)",
                        border: "1px solid var(--app-border)",
                        borderRadius: "12px",
                        color: "var(--app-text)",
                      }}
                      labelStyle={{ color: "var(--app-primary)" }}
                      labelFormatter={(_label, payload) =>
                        payload[0]?.payload.dateLabel || ""
                      }
                      formatter={(value, _name, item) => [
                        `${item.payload.mood} · ${item.payload.time}`,
                        `Mood score: ${value}`,
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="var(--app-primary)"
                      strokeWidth={3}
                      fill="url(#mood-area-fill)"
                      dot={{
                        r: 5,
                        fill: "var(--app-accent)",
                        stroke: "var(--app-surface)",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 7 }}
                    >
                      <LabelList
                        dataKey="score"
                        position="top"
                        fill="var(--app-text)"
                        fontSize={12}
                        fontWeight={600}
                      />
                    </Area>

                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="sr-only">
                  Mood scores range from 1, needs care, to 5, great.
                </div>
                <div className="mt-2 flex justify-between text-xs text-(--app-primary)">
                  <span>{graphData[0]?.dateLabel}</span>
                  <span>{graphData[graphData.length - 1]?.dateLabel}</span>
                </div>
                <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-(--app-primary)">
                  <span>1 · Needs care</span>
                  <span>3 · Okay</span>
                  <span>5 · Great</span>
                </div>
              </div>
            )}
          </section>
            <section className="rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
                <div className="flex items-center justify-center">
                  <p className="text-sm text-(--app-primary)">
                    Your average mood for these entries
                  </p>
                  <span className="ml-2 rounded-full bg-(--app-sidebar-active) px-3 py-1 text-xs font-semibold">
                    {averageMoodScore === null
                      ? "No entries"
                      : `${averageMoodScore.toFixed(1)} ${averageMoodEmoji}`}
                  </span>
                </div>
            </section>

          <section className="rounded-2xl bg-(--app-surface) p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold">Mood history</h2>
                <p className="mt-1 text-sm text-(--app-primary)">
                  {formatDate(selectedDate, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <span className="text-sm text-(--app-primary)">
                {selectedEntries.length}{" "}
                {selectedEntries.length === 1 ? "check-in" : "check-ins"}
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {selectedEntries.length === 0 ? (
                <p className="rounded-xl border border-dashed border-(--app-border) p-6 text-center text-sm text-(--app-primary)">
                  No mood entries for this date. Add a check-in whenever you are
                  ready.
                </p>
              ) : (
                selectedEntries.map((entry) => (
                  <article
                    key={entry.id}
                    className="rounded-xl border border-(--app-border) bg-(--app-background) p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <span className="rounded-full bg-(--app-sidebar-active) px-3 py-1 text-xs font-semibold">
                          {entry.mood}
                        </span>
                        <p className="mt-3 text-xs text-(--app-primary)">
                          {formatDate(selectedDate, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          at {getEntryTime(entry)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-(--app-danger) px-3 py-2 text-sm font-semibold text-(--app-danger) hover:bg-(--app-danger-surface)"
                        aria-label={`Delete ${entry.mood} mood entry`}
                      >
                        <Trash2 size={16} aria-hidden="true" /> Delete
                      </button>
                    </div>
                    {entry.note && (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                        {entry.note}
                      </p>

                    )}
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
