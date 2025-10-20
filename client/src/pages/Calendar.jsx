import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Weekday labels (top row)
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Helpers
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

/** Build a fixed 6x7 grid for the visible month, including leading/trailing days */
function getMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay(); // 0..6 (Sun..Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const leading = Array.from({ length: startWeekday }, (_, i) => {
    const day = prevMonthDays - startWeekday + 1 + i;
    return new Date(year, month - 1, day);
  });

  const current = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));

  const total = 42;
  const trailingCount = total - (leading.length + current.length);
  const trailing = Array.from({ length: trailingCount }, (_, i) => new Date(year, month + 1, i + 1));

  return [...leading, ...current, ...trailing];
}

/** Load plans from localStorage; expected shape: [{ date: 'YYYY-MM-DD', image: 'https://...' }, ...] */
function usePlans() {
  const [plans, setPlans] = useState([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("plans");
      if (raw) setPlans(JSON.parse(raw));
    } catch (_) {}
  }, []);
  return plans;
}

export default function Calendar() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth()); // 0-based
  const [selectedDate, setSelectedDate] = useState(null);

  const plans = usePlans();
  // Map YYYY-MM-DD -> array of plan objects (to support multiple)
  const plansByDay = useMemo(() => {
    const m = new Map();
    for (const p of plans || []) {
      if (!p?.date) continue;
      if (!m.has(p.date)) m.set(p.date, []);
      m.get(p.date).push(p);
    }
    return m;
  }, [plans]);

  const grid = useMemo(() => getMonthGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long" }).format(
    new Date(viewYear, viewMonth, 1)
  );

  const goPrevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goNextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const goPrevYear = () => setViewYear((y) => y - 1);
  const goNextYear = () => setViewYear((y) => y + 1);

  return (
    <div className="flex items-start justify-center p-3">
      {/* Compact card height so the page doesn't scroll */}
      <Card className="w-full max-w-[880px]">
        <CardHeader className="pb-1">
          <div className="flex items-center justify-between gap-2">
            {/* Month controls (left) */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-foreground/70 hover:text-foreground bg-card hover:bg-accent"
                onClick={goPrevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

            {/* Fixed width: keeps arrows locked in place across different month names */}
            <div className="w-36 sm:w-40 text-center">
              <CardTitle className="text-lg truncate">{monthLabel}</CardTitle>
            </div>

              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-foreground/70 hover:text-foreground bg-card hover:bg-accent"
                onClick={goNextMonth}
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {/* Year controls (right) */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-foreground/70 hover:text-foreground bg-card hover:bg-accent"
                onClick={goPrevYear}
                aria-label="Previous year"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardDescription className="text-sm font-semibold">{viewYear}</CardDescription>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 text-foreground/70 hover:text-foreground bg-card hover:bg-accent"
                onClick={goNextYear}
                aria-label="Next year"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Weekday header (compact) */}
          <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-medium opacity-80">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Fixed grid height to avoid page scroll; tighter gaps */}
          <div
            className="grid grid-cols-7 gap-1 w-full"
            style={{
              // ~320px grid + header ≈ 400–440px total card height
              height: 320,
              gridTemplateRows: "repeat(6, minmax(0, 1fr))",
            }}
          >
            {grid.map((date, idx) => {
              const key = ymd(date);
              const dayPlans = plansByDay.get(key) || [];
              const firstImage = dayPlans.find(p => /^https:\/\//i.test(p?.image))?.image;

              const isCurrentMonth = date.getMonth() === viewMonth;
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();

              const bgStyle = firstImage
                ? {
                    backgroundImage: `url(${firstImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined;

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={[
                    "relative rounded-md border text-[12px] transition",
                    "hover:bg-accent/60 hover:border-accent",
                    "focus-visible:ring-2 focus-visible:ring-ring/50 outline-none",
                    "flex items-start justify-start p-1.5",
                    !isCurrentMonth ? "opacity-60" : "",
                    isToday ? "ring-2 ring-offset-1 ring-ring/40" : "",
                    isSelected ? "bg-primary/70 text-primary-foreground" : "",
                    "min-h-12",
                  ].join(" ")}
                  style={bgStyle}
                >
                  {firstImage && (
                    <div className="absolute inset-0 bg-black/25 rounded-md pointer-events-none" />
                  )}
                  <div className="relative z-10 text-[11px] font-medium px-1 py-0.5 rounded">
                    {date.getDate()}
                  </div>
                  {dayPlans.length > 0 && (
                    <div className="absolute bottom-1 right-1 z-10">
                      <span className="text-[10px] px-1 py-0.5 rounded bg-background/80 border">
                        {dayPlans.length}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selection summary */}
          <div className="mt-3 text-xs">
            {selectedDate ? (
              <div>
                Selected:{" "}
                <span className="font-medium">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "long",
                    day: "2-digit",
                    year: "numeric",
                  }).format(selectedDate)}
                </span>
              </div>
            ) : (
              <div className="opacity-70">Pick a day.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
