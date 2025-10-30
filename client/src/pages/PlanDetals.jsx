import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Trophy,
  ImageIcon,
} from "lucide-react";

/* ========= Date/time helpers (timezone-safe) ========= */
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
function formatTime(hhmm /* 'HH:MM' or 'HH:MM:SS' */) {
  if (!hhmm || typeof hhmm !== "string") return "";
  const [H, M] = hhmm.split(":").map(Number);
  if (Number.isNaN(H)) return "";
  const d = new Date();
  d.setHours(H);
  d.setMinutes(Number.isNaN(M) ? 0 : M);
  d.setSeconds(0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

/* ========= Small utilities ========= */
function byVotesDesc(a, b) {
  const va = typeof a.votes === "number" ? a.votes : 0;
  const vb = typeof b.votes === "number" ? b.votes : 0;
  return vb - va;
}
function maxVotes(items) {
  return items.reduce((m, x) => Math.max(m, typeof x.votes === "number" ? x.votes : 0), 0);
}
function isHttps(url) {
  return typeof url === "string" && /^https:\/\//i.test(url);
}

export default function PlanDetails() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load plan");
        const json = await res.json();
        setPlan(json.plan);
      } catch (e) {
        setErr(e.message || "Failed to load plan");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  const now = new Date();

  const {
    title,
    image,
    location,
    deadlineISO,
    dateOptions,
    activityOptions,
    votingClosed,
    winningDates,
    winningActivities,
  } = useMemo(() => {
    if (!plan) {
      return {
        title: "",
        image: "",
        location: "",
        deadlineISO: null,
        dateOptions: [],
        activityOptions: [],
        votingClosed: false,
        winningDates: [],
        winningActivities: [],
      };
    }

    const title = plan.title || plan.eventTitle || "Untitled Plan";
    const image = plan.image_url || plan.image || "";
    const location = plan.location || plan.place || "";

    // Deadline (ISO string or 'YYYY-MM-DDTHH:mm')
    const deadlineISO = plan.deadline || plan.voting_deadline || null;
    const deadlineDate = deadlineISO ? new Date(deadlineISO) : null;
    const votingClosed = deadlineDate ? now > deadlineDate : false;

    // ----- DATE/TIME options -----
    // We accept formats like:
    // - plan.dates: [{ date: 'YYYY-MM-DD', time?: 'HH:MM', votes?: n, suggested_by?: ... }, ...]
    // - or array of strings 'YYYY-MM-DD'
    // - plus single fields plan.hangoutDate/plan.date and plan.time (from creation)
    let dateOptions = [];
    if (Array.isArray(plan.dates) && plan.dates.length) {
      dateOptions = plan.dates
        .map((d) => {
          if (typeof d === "string") {
            return { date: d.slice(0, 10), time: plan.time || "", votes: 0 };
          }
          const dateStr = String(d?.date || d?.name || "").slice(0, 10);
          const timeStr = String(d?.time || "").slice(0, 5) || plan.time || "";
          return {
            date: dateStr,
            time: timeStr,
            votes: typeof d?.votes === "number" ? d.votes : 0,
            suggested_by: d?.suggested_by || d?.by || null,
          };
        })
        .filter((x) => x.date);
    } else {
      // fallbacks from Plan creation
      const baseDate =
        (plan.hangoutDate && String(plan.hangoutDate).slice(0, 10)) ||
        (plan.date && String(plan.date).slice(0, 10)) ||
        (plan.deadline && String(plan.deadline).slice(0, 10)) ||
        "";
      if (baseDate) {
        dateOptions = [{ date: baseDate, time: plan.time || "", votes: 0 }];
      }
    }

    // Remove duplicates (same date+time), summing votes if duplicated
    const dateKey = (x) => `${x.date}__${x.time || ""}`;
    const dateMap = new Map();
    for (const x of dateOptions) {
      const k = dateKey(x);
      const prev = dateMap.get(k);
      if (prev) {
        dateMap.set(k, { ...prev, votes: (prev.votes || 0) + (x.votes || 0) });
      } else {
        dateMap.set(k, x);
      }
    }
    dateOptions = Array.from(dateMap.values()).sort(byVotesDesc);

    // ----- ACTIVITY options -----
    // Expect plan.activities like:
    // [{ name: 'Bowling', location: 'Main Lanes', votes: 3, suggested_by?: ... }, ...]
    let activityOptions = Array.isArray(plan.activities)
      ? plan.activities.map((a) => ({
          name: typeof a === "string" ? a : a?.name || "Activity",
          location: typeof a === "string" ? "" : a?.location || "",
          votes: typeof a?.votes === "number" ? a.votes : 0,
          suggested_by: a?.suggested_by || a?.by || null,
        }))
      : [];

    // Remove duplicates (same name+location)
    const actKey = (x) => `${x.name}__${x.location || ""}`.toLowerCase();
    const actMap = new Map();
    for (const x of activityOptions) {
      const k = actKey(x);
      const prev = actMap.get(k);
      if (prev) {
        actMap.set(k, { ...prev, votes: (prev.votes || 0) + (x.votes || 0) });
      } else {
        actMap.set(k, x);
      }
    }
    activityOptions = Array.from(actMap.values()).sort(byVotesDesc);

    // Winners (support ties)
    const topDateVotes = maxVotes(dateOptions);
    const topActVotes = maxVotes(activityOptions);
    const winningDates =
      topDateVotes > 0
        ? dateOptions.filter((x) => (x.votes || 0) === topDateVotes)
        : [];
    const winningActivities =
      topActVotes > 0
        ? activityOptions.filter((x) => (x.votes || 0) === topActVotes)
        : [];

    return {
      title,
      image,
      location,
      deadlineISO,
      dateOptions,
      activityOptions,
      votingClosed,
      winningDates,
      winningActivities,
    };
  }, [plan, now]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Loading…</CardTitle>
            <CardDescription>Fetching your plan details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 rounded-md bg-muted animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (err || !plan) {
    return (
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Plan not found</CardTitle>
            <CardDescription>{err || "Try again later."}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/calendar">
              <Button variant="outline">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Calendar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center p-4">
      <Card className="w-full max-w-4xl overflow-hidden">
        {/* Banner */}
        {isHttps(image) ? (
          <div
            className="h-56 w-full bg-center bg-cover"
            style={{ backgroundImage: `url(${image})` }}
            aria-label={`${title} image`}
          />
        ) : (
          <div className="h-24 w-full grid place-items-center text-muted-foreground bg-muted/40">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}

        {/* Header */}
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>
                {location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </span>
                ) : (
                    // location tbd
                  <span className="opacity-70"></span>
                )}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              {deadlineISO ? (
                <span
                  className={[
                    "text-xs px-2 py-1 rounded border",
                    votingClosed
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-amber-50 border-amber-300 text-amber-700",
                  ].join(" ")}
                  title="Voting deadline"
                >
                  {votingClosed ? "Voting closed" : "Voting open"} •{" "}
                  {new Date(deadlineISO).toLocaleString()}
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded border bg-muted text-foreground/70">
                  No deadline
                </span>
              )}
              <Link to="/calendar">
                <Button size="sm" variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* ===== Final result (if voting closed) ===== */}
          {votingClosed && (
            <section className="rounded-lg border bg-card">
              <div className="p-4 flex items-center gap-2 border-b">
                <Trophy className="h-5 w-5" />
                <div className="font-semibold">Most Popular Choices</div>
              </div>

              <div className="p-4 grid gap-6 sm:grid-cols-2">
                {/* Winning date/time */}
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Date & Time
                  </div>
                  {winningDates.length ? (
                    <ul className="text-sm space-y-1">
                      {winningDates.map((x, i) => (
                        <li key={i}>
                          {formatYMD(x.date)}
                          {x.time ? ` • ${formatTime(x.time)}` : ""}
                          {typeof x.votes === "number" ? `  (votes: ${x.votes})` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm opacity-70">No winning date/time.</div>
                  )}
                </div>

                {/* Winning activity/location */}
                <div>
                  <div className="text-sm font-medium mb-2">Activity & Location</div>
                  {winningActivities.length ? (
                    <ul className="text-sm space-y-1">
                      {winningActivities.map((a, i) => (
                        <li key={i}>
                          {a.name}
                          {a.location ? ` — ${a.location}` : ""}
                          {typeof a.votes === "number" ? `  (votes: ${a.votes})` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm opacity-70">No winning activity/location.</div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ===== All options (shows suggested ones too) ===== */}
          <section className="rounded-lg border bg-card">
            <div className="p-4 flex items-center gap-2 border-b">
              <div className="font-semibold">
                {votingClosed ? "All Considered Options" : "Current Proposals (with Suggestions)"}
              </div>
            </div>

            <div className="p-4 grid gap-6 sm:grid-cols-2">
              {/* Date & Time options */}
              <div>
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Date & Time
                </div>
                {dateOptions.length ? (
                  <ul className="text-sm space-y-1">
                    {dateOptions.map((x, i) => (
                      <li key={i}>
                        {formatYMD(x.date)}
                        {x.time ? ` • ${formatTime(x.time)}` : ""}
                        {typeof x.votes === "number" ? `  (votes: ${x.votes})` : ""}
                        {x.suggested_by ? (
                          <span className="opacity-60">{` — suggested by ${x.suggested_by}`}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm opacity-70">No date/time options.</div>
                )}
              </div>

              {/* Activity options */}
              <div>
                <div className="text-sm font-medium mb-2">Activity & Location</div>
                {activityOptions.length ? (
                  <ul className="text-sm space-y-1">
                    {activityOptions.map((a, i) => (
                      <li key={i}>
                        {a.name}
                        {a.location ? ` — ${a.location}` : ""}
                        {typeof a.votes === "number" ? `  (votes: ${a.votes})` : ""}
                        {a.suggested_by ? (
                          <span className="opacity-60">{` — suggested by ${a.suggested_by}`}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm opacity-70">No activity/location options.</div>
                )}
              </div>
            </div>
          </section>

          {/* You can add invitees / notes here if desired */}
        </CardContent>
      </Card>
    </div>
  );
}
