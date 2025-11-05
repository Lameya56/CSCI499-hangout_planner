// client/src/pages/Calendar.jsx
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
function formatYMD(ymdStr, opts) {
  const dt = ymdToLocalDate(ymdStr);
  if (!dt) return ymdStr || "";
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

/* ==== Pick the winning date from a plan's detailed dates (after deadline) ==== */
function pickWinningDateFromDates(dates = []) {
  // dates may have fields: { id, date: 'YYYY-MM-DD...', vote_count?, votes? }
  if (!Array.isArray(dates) || dates.length === 0) return null;
  // Normalize to {dateStr, votes}
  const norm = dates
    .map((d) => ({
      dateStr: String(d?.date || d?.name || "").slice(0, 10),
      votes: Number(d?.vote_count ?? d?.votes ?? 0),
    }))
    .filter((x) => x.dateStr);

  if (norm.length === 0) return null;

  // Find max votes
  const maxVotes = norm.reduce((m, x) => Math.max(m, x.votes), 0);
  const top = norm.filter((x) => x.votes === maxVotes);

  // Tie-breaker: earliest date
  const winner = top.sort((a, b) => (a.dateStr < b.dateStr ? -1 : a.dateStr > b.dateStr ? 1 : 0))[0];
  return winner?.dateStr || null;
}

/* ==== Load and derive the single display date per plan (deadline → winning date after) ==== */
function useCalendarDays() {
  const [rows, setRows] = useState([]); // [{ planId, date, title, image }]

  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const listRes = await fetch("/api/plans", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!listRes.ok) throw new Error("Failed to load plans");
      const listJson = await listRes.json();
      const plans = Array.isArray(listJson.plans) ? listJson.plans : [];

      const now = new Date();

      // Build rows: default to deadline if not passed; else pick most popular date.
      const outputs = [];

      // First pass: compute which plans need details
      const needDetail = [];
      for (const p of plans) {
        const id = p.id || p.plan_id;
        const title = p.title || p.eventTitle || "Untitled Plan";
        const image = p.image || p.image_url || "";

        const deadlineISO = p.deadline || p.voting_deadline || "";
        const deadlineStr = deadlineISO ? String(deadlineISO).slice(0, 10) : "";

        const deadlinePassed = deadlineISO ? new Date(deadlineISO) < now : false;

        if (!deadlinePassed) {
          // until deadline → display on deadline
          if (deadlineStr) {
            outputs.push({ planId: id, date: deadlineStr, title, image });
          }
        } else {
          // after deadline → try to pick a winning date from list data if available
          // if list item already has vote counts on dates, we can compute locally
          let winnerDate = null;

          if (Array.isArray(p.dates) && p.dates.length) {
            winnerDate = pickWinningDateFromDates(p.dates);
          }

          if (winnerDate) {
            outputs.push({ planId: id, date: winnerDate, title, image });
          } else {
            // Need detail fetch to compute winner
            needDetail.push({ id, title, image });
          }
        }
      }

      // Fetch details only for those we couldn't resolve winner from list
      if (needDetail.length) {
        const token = localStorage.getItem("token");
        const detailPromises = needDetail.map(async ({ id, title, image }) => {
          try {
            const res = await fetch(`/api/plans/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return null;
            const json = await res.json();
            const dates = json?.plan?.dates || [];
            const winner = pickWinningDateFromDates(dates);
            return winner ? { planId: id, date: winner.slice(0, 10), title, image } : null;
          } catch {
            return null;
          }
        });

        const details = await Promise.all(detailPromises);
        for (const row of details) {
          if (row && row.date) outputs.push(row);
        }
      }

      setRows(outputs);
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    load();
    const onUpdated = () => load();
    const onStorage = (e) => e.key === "token" && load();
    window.addEventListener("plans:updated", onUpdated);
    window.addEventListener("votes:submitted", onUpdated);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("plans:updated", onUpdated);
      window.removeEventListener("votes:submitted", onUpdated);
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

  // Fixed-position arrows via fixed-width month label (unchanged)
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

      {/* MULTI-PLAN CHOOSER (now scrollable for many events) */}
      <Sheet open={chooserOpen} onOpenChange={setChooserOpen}>
        <SheetContent side="right" className="sm:max-w-md p-0">
          <div className="p-6 border-b">
            <SheetHeader>
              <SheetTitle>
                {chooserDate ? formatYMD(chooserDate) : "Select a plan"}
              </SheetTitle>
              <SheetDescription>Multiple plans on this day. Pick one:</SheetDescription>
            </SheetHeader>
          </div>

          {/* Scrollable list */}
          <div className="max-h-[70vh] overflow-y-auto p-6 space-y-3">
            {chooserPlans.map((p, i) => (
              <button
                key={`${p.planId}-${i}`}
                onClick={() => navigate(`/plans/${p.planId}`)}
                className="w-full text-left border rounded-md overflow-hidden hover:bg-accent transition focus-visible:ring-2 focus-visible:ring-ring/50 outline-none"
              >
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
            {chooserPlans.length === 0 && (
              <div className="text-sm opacity-70">No plans for this day.</div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
