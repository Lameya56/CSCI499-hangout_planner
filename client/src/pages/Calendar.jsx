import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const ymd = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

/* ========= Date helpers (timezone-safe for 'YYYY-MM-DD') ========= */
function ymdToLocalDate(ymd /* 'YYYY-MM-DD' */) {
  if (!ymd || typeof ymd !== "string") return null;
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function formatYMD(ymd, opts) {
  const dt = ymdToLocalDate(ymd);
  if (!dt) return ymd || "";
  return dt.toLocaleDateString(
    undefined,
    opts || { year: "numeric", month: "long", day: "numeric" }
  );
}

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

// Load from API and flatten into calendar rows
function useCalendarDays() {
  const [rows, setRows] = useState([]);

  const normalizeFromPlans = (plans = []) => {
    const out = [];
    for (const p of plans) {
      const id = p.id || p.plan_id;
      const title = p.title || p.eventTitle || "Untitled Plan";
      const image = p.image || p.image_url || "";
      const rawDates = Array.isArray(p.dates)
        ? p.dates.map((d) => (typeof d === "string" ? d : d?.name || d?.date))
        : [p.hangoutDate || p.date || p.deadline];

      for (const d of rawDates.filter(Boolean)) {
        const dateStr = String(d).slice(0, 10); // keep as Y-M-D string (no Date parsing)
        if (dateStr) out.push({ planId: id, date: dateStr, title, image });
      }
    }
    return out;
  };

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load plans");
      const json = await res.json();
      setRows(normalizeFromPlans(json.plans || []));
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    load();
    const onUpdated = () => load();
    const onStorage = (e) => e.key === "token" && load();
    window.addEventListener("plans:updated", onUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("plans:updated", onUpdated);
      window.removeEventListener("storage", onStorage);
    };
  }, [load]);

  return rows; // [{ planId, date, title, image }]
}

export default function Calendar() {
  const navigate = useNavigate();

  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);

  // chooser state for multiple plans in a day
  const [chooserOpen, setChooserOpen] = useState(false);
  const [chooserDate, setChooserDate] = useState(null); // 'YYYY-MM-DD'
  const [chooserPlans, setChooserPlans] = useState([]); // [{planId,title,image}]

  const dayRows = useCalendarDays();
  const plansByDay = useMemo(() => {
    const m = new Map();
    for (const r of dayRows) {
      if (!m.has(r.date)) m.set(r.date, []);
      m.get(r.date).push(r);
    }
    return m;
  }, [dayRows]);

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

  // Fixed-position arrows via fixed-width month label
  const MonthControls = (
    <div className="grid grid-cols-[2rem,10rem,2rem] items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 text-foreground/70 hover:text-foreground bg-card hover:bg-accent"
        onClick={goPrevMonth}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <CardTitle className="text-lg text-center truncate">{monthLabel}</CardTitle>
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
  );

  const YearControls = (
    <div className="grid grid-cols-[2rem,3.5rem,2rem] items-center gap-2">
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8 text-foreground/70 hover:text-foreground bg-card hover:bg-accent"
        onClick={goPrevYear}
        aria-label="Previous year"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <CardDescription className="text-sm font-semibold text-center">{viewYear}</CardDescription>
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
  );

  const handleDayClick = (dateObj) => {
    const key = ymd(dateObj);
    setSelectedDate(dateObj);

    const dayPlans = plansByDay.get(key) || [];
    if (dayPlans.length === 0) return;

    if (dayPlans.length === 1) {
      navigate(`/plans/${dayPlans[0].planId}`);
      return;
    }

    // multiple plans → open chooser sheet
    setChooserDate(key);
    setChooserPlans(dayPlans);
    setChooserOpen(true);
  };

  return (
    <div className="flex items-start justify-center p-3">
      <Card className="w-full max-w-[880px]">
        <CardHeader className="pb-1">
          <div className="flex items-center justify-between gap-2">
            {MonthControls}
            {YearControls}
          </div>

          <div className="mt-3 grid grid-cols-7 text-center text-[11px] font-medium opacity-80">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div
            className="grid grid-cols-7 gap-1 w-full"
            style={{
              height: 320, // compact height (no page scroll)
              gridTemplateRows: "repeat(6, minmax(0, 1fr))",
            }}
          >
            {grid.map((date, idx) => {
              const key = ymd(date);
              const dayPlans = plansByDay.get(key) || [];
              const firstImage = dayPlans.find((r) => /^https:\/\//i.test(r.image))?.image;

              const isCurrentMonth = date.getMonth() === viewMonth;
              const isToday = date.toDateString() === new Date().toDateString();
              const isSelected =
                selectedDate && date.toDateString() === selectedDate.toDateString();

              const bgStyle = firstImage
                ? {
                    backgroundImage: `url(${firstImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined;

              const clickable = dayPlans.length > 0;

              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(date)}
                  className={[
                    "relative rounded-md border text-[12px] transition",
                    clickable
                      ? "cursor-pointer hover:bg-accent/60 hover:border-accent"
                      : "cursor-default",
                    "focus-visible:ring-2 focus-visible:ring-ring/50 outline-none",
                    "flex items-start justify-start p-1.5",
                    !isCurrentMonth ? "opacity-60" : "",
                    isToday ? "ring-2 ring-offset-1 ring-ring/40" : "",
                    isSelected ? "bg-primary/70 text-primary-foreground" : "",
                    "min-h-12",
                  ].join(" ")}
                  style={bgStyle}
                  aria-label={
                    clickable
                      ? `Open plans for ${key} (${dayPlans.length})`
                      : `No plans for ${key}`
                  }
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

      {/* MULTI-PLAN CHOOSER */}
      <Sheet open={chooserOpen} onOpenChange={setChooserOpen}>
        <SheetContent side="right" className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {chooserDate ? formatYMD(chooserDate) : "Select a plan"}
            </SheetTitle>
            <SheetDescription>Multiple plans on this day. Pick one:</SheetDescription>
          </SheetHeader>

          <div className="mt-4 space-y-3">
            {chooserPlans.map((p, i) => (
              <button
                key={`${p.planId}-${i}`}
                onClick={() => navigate(`/plans/${p.planId}`)}
                className="w-full text-left border rounded-md overflow-hidden hover:bg-accent transition focus-visible:ring-2 focus-visible:ring-ring/50 outline-none"
              >
                {/* thumbnail */}
                {/^(https):\/\//i.test(p.image) ? (
                  <div
                    className="h-24 w-full bg-center bg-cover"
                    style={{ backgroundImage: `url(${p.image})` }}
                    aria-label={`${p.title} image`}
                  />
                ) : (
                  <div className="h-24 w-full grid place-items-center text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="p-3">
                  <div className="text-sm font-medium line-clamp-1">{p.title}</div>
                </div>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
