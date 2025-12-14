import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  MapPin,
  Trophy,
  ImageIcon,
  UserCheck,
  UserX,
  Crown,
  Pencil,
  Repeat2,
  Users,
  Link2,
  Lock, // ✅ NEW
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

/* ========= Status badge ========= */
function StatusBadge({ kind }) {
  if (kind === "host") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-blue-50 border-blue-300 text-blue-700">
        <Crown className="h-3.5 w-3.5" /> Host
      </span>
    );
  }
  if (kind === "responded") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-lime-50 border-lime-300 text-lime-700">
        <UserCheck className="h-3.5 w-3.5" /> Responded
      </span>
    );
  }
  // ✅ NEW: Closed (invitee missed deadline)
  if (kind === "closed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-slate-50 border-slate-300 text-slate-700">
        <Lock className="h-3.5 w-3.5" /> Closed
      </span>
    );
  }
  if (kind === "pending") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-amber-50 border-amber-300 text-amber-700">
        <UserX className="h-3.5 w-3.5" /> Pending
      </span>
    );
  }
  if (kind === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-green-50 border-green-300 text-green-700">
        <UserX className="h-3.5 w-3.5" /> Accepted
      </span>
    );
  }
  if (kind === "declined") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-red-50 border-red-300 text-red-700">
        <UserX className="h-3.5 w-3.5" /> Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border bg-muted text-foreground/70">
      Not invited
    </span>
  );
}

export default function PlanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [viewer, setViewer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // fetch viewer + plan
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        // viewer
        try {
          const pres = await fetch("/api/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (pres.ok) {
            const pjson = await pres.json();
            setViewer(pjson.user || null);
          }
        } catch {}

        // plan
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

    fetchAll();

    // live refetch when others update (Plan page, Respond page)
    const onRefresh = () => fetchAll();
    window.addEventListener("plans:updated", onRefresh);
    window.addEventListener("votes:submitted", onRefresh);
    return () => {
      window.removeEventListener("plans:updated", onRefresh);
      window.removeEventListener("votes:submitted", onRefresh);
    };
  }, [id]);

  // Cancel plan (mark status = 'cancelled') - only host sees this button
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this plan? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/plans/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.message || 'Failed to cancel plan');
      }

      // Notify other parts of the app and navigate away
      window.dispatchEvent(new Event('plans:updated'));
      navigate('/home');
    } catch (e) {
      alert(e.message || 'Failed to cancel plan');
    }
  };

  const now = new Date();

  const {
    title,
    image,
    location,
    deadlineISO,
    votingClosed,
    dateOptions,
    activityOptions,
    winningDates,
    winningActivities,
    viewerStatus,
    viewerInviteToken,
    respondedList,
    pendingList,
    acceptedList,
    declinedList,
  } = useMemo(() => {
    if (!plan) {
      return {
        title: "",
        image: "",
        location: "",
        deadlineISO: null,
        votingClosed: false,
        dateOptions: [],
        activityOptions: [],
        winningDates: [],
        winningActivities: [],
        viewerStatus: "not_invited",
        viewerInviteToken: null,
        respondedList: [],
        pendingList: [],
        acceptedList: [],
        declinedList: [],
      };
    }

    const title = plan.title || plan.eventTitle || "Untitled Plan";
    const image = plan.image_url || plan.image || "";
    const location = plan.location || plan.place || "";

    // deadline and closed flag
    const deadlineISO = plan.deadline || plan.voting_deadline || null;
    const closed = deadlineISO ? now > new Date(deadlineISO) : false;
    const votingClosed = closed;

    // ----- Date & Time options (with suggestions) -----
    let dateOptions = [];
    if (Array.isArray(plan.dates) && plan.dates.length) {
      dateOptions = plan.dates
        .map((d) => {
          if (typeof d === "string") {
            return { date: d.slice(0, 10), time: plan.time || "", votes: Number(d.vote_count) || 0 };
          }
          const dateStr = String(d?.date || d?.name || "").slice(0, 10);
          const timeStr = String(d?.time || "").slice(0, 5) || plan.time || "";
          return {
            date: dateStr,
            time: timeStr,
            votes: Number(d?.vote_count) || Number(d?.votes) || 0,
            suggested_by: d?.suggested_by || d?.by || null,
          };
        })
        .filter((x) => x.date);
    } else {
      const baseDate =
        (plan.hangoutDate && String(plan.hangoutDate).slice(0, 10)) ||
        (plan.date && String(plan.date).slice(0, 10)) ||
        (plan.deadline && String(plan.deadline).slice(0, 10)) ||
        "";
      if (baseDate) {
        dateOptions = [{ date: baseDate, time: plan.time || "", votes: 0 }];
      }
    }

    const dateKey = (x) => `${x.date}__${x.time || ""}`;
    const dateMap = new Map();
    for (const x of dateOptions) {
      const k = dateKey(x);
      const prev = dateMap.get(k);
      dateMap.set(k, prev ? { ...prev, votes: (prev.votes || 0) + (x.votes || 0) } : x);
    }
    dateOptions = Array.from(dateMap.values()).sort(byVotesDesc);

    // ----- Activity & Location options (with suggestions) -----
    let activityOptions = Array.isArray(plan.activities)
      ? plan.activities.map((a) => ({
          name: typeof a === "string" ? a : a?.name || "Activity",
          location: typeof a === "string" ? "" : a?.location || "",
          votes: Number(a?.vote_count) || Number(a?.votes) || 0,
          suggested_by: a?.suggested_by || a?.by || null,
        }))
      : [];

    const actKey = (x) => `${x.name}__${x.location || ""}`.toLowerCase();
    const actMap = new Map();
    for (const x of activityOptions) {
      const k = actKey(x);
      const prev = actMap.get(k);
      actMap.set(k, prev ? { ...prev, votes: (prev.votes || 0) + (x.votes || 0) } : x);
    }
    activityOptions = Array.from(actMap.values()).sort(byVotesDesc);

    // winners (ties allowed) after deadline
    const topDateVotes = maxVotes(dateOptions);
    const topActVotes = maxVotes(activityOptions);
    const winningDates =
      votingClosed && topDateVotes > 0
        ? dateOptions.filter((x) => (x.votes || 0) === topDateVotes)
        : [];
    const winningActivities =
      votingClosed && topActVotes > 0
        ? activityOptions.filter((x) => (x.votes || 0) === topActVotes)
        : [];

    // viewer status
    let viewerStatus = "not_invited";
    let viewerInviteToken = null;
    const hostId = plan.host_id || plan.hostId;

    if (viewer && viewer.id && hostId && viewer.id === hostId) {
      viewerStatus = "host";
    } else if (Array.isArray(plan.invitations)) {
      const match = plan.invitations.find((inv) => {
        if (!inv) return false;
        const byId = viewer && viewer.id && (inv.invitee_id === viewer.id || inv.inviteeId === viewer.id);
        const byEmail =
          viewer &&
          viewer.email &&
          typeof inv.invitee_email === "string" &&
          inv.invitee_email.toLowerCase() === viewer.email.toLowerCase();
        return byId || byEmail;
      });
      if (match) {
        const st = (match.status || "").toLowerCase();
        if (st === "accepted") viewerStatus = "accepted";
        else if (st === "declined") viewerStatus = "declined";
        else if (st === "pending") viewerStatus = "pending";
        else if (st === "responded") viewerStatus = "responded";
        if (typeof match.token === "string" && match.token) viewerInviteToken = match.token;
      }
    }

    // ✅ NEW: if invitee is still pending but deadline passed → show "Closed"
    if (viewerStatus === "pending" && votingClosed) {
      viewerStatus = "closed";
    }

    // responses list
    const respondedList = [];
    const pendingList = [];
    const acceptedList = [];
    const declinedList = [];
    if (Array.isArray(plan.invitations)) {
      for (const inv of plan.invitations) {
        const name = inv?.invitee_name || inv?.name || "";
        const email = inv?.invitee_email || inv?.email || "";
        const status = (inv?.status || "").toLowerCase();
        const item = { name: name || email || "Unknown user", email };
        if (status === "accepted") acceptedList.push(item);
        else if (status === "declined") declinedList.push(item);
        else if (status === "pending") pendingList.push(item);
        else respondedList.push(item); // responded
      }
    }

    return {
      title,
      image,
      location,
      deadlineISO,
      votingClosed,
      dateOptions,
      activityOptions,
      winningDates,
      winningActivities,
      viewerStatus,
      viewerInviteToken,
      respondedList,
      pendingList,
      acceptedList,
      declinedList,
    };
  }, [plan, viewer, now]);

  // === Invite link prompt handler ===
  const handleUseInviteLink = () => {
    const raw = window.prompt(
      "Paste your invite link (e.g., https://letsgo/respond/123abc) or just the token:"
    );
    if (!raw) return;

    const m =
      raw.match(/\/respond\/([A-Za-z0-9_-]+)/i) ||
      raw.match(/[?&]token=([A-Za-z0-9_-]+)/i);

    const token = m ? m[1] : raw.trim();

    if (!/^[A-Za-z0-9_-]+$/.test(token)) {
      alert("That doesn't look like a valid invite token. Please check your link.");
      return;
    }
    navigate(`/respond/${token}`);
  };

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
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <CardTitle className={`text-2xl ${plan.status === "cancelled" ? "opacity-50 pointer-events-none" : ""}`}>{title}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-2 flex-wrap">
                {location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </span>
                ) : (
                  <span className="opacity-70"></span>
                )}
              </CardDescription>
            </div>

            <div className="flex flex-col items-end gap-2">
              <StatusBadge kind={viewerStatus} />
              {plan.status === "cancelled" ? (
                <span
                  className="text-xs px-2 py-1 rounded border bg-red-50 border-red-300 text-red-700"
                  title="Plan cancelled"
                >
                  Plan Cancelled by Host
                </span>
              ) : deadlineISO ? (
                <span
                  className={[
                    "text-xs px-2 py-1 rounded border",
                    votingClosed
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-amber-50 border-amber-300 text-amber-700",
                  ].join(" ")}
                  title="Voting deadline"
                >
                  {`${votingClosed ? "Voting closed" : "Voting open"} • ${new Date(deadlineISO).toLocaleString()}`}
                </span>
              ) : (
                <span className="text-xs px-2 py-1 rounded border bg-muted text-foreground/70">
                  No deadline
                </span>
              )}

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                {viewerStatus === "host" ? (
                  <>
                    {/* Update Plan */}
                    <Button
                      size="sm"
                      onClick={() => navigate(`/plan?planId=${id}`)}
                      disabled={plan.status === "cancelled"}
                      title="Update this plan"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Update plan
                    </Button>

                    {/* Cancel Plan */}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleCancel}
                      disabled={plan.status === "cancelled"}
                      title={
                        plan.status === "cancelled"
                          ? "This plan is already cancelled"
                          : "Cancel this plan"
                      }
                    >
                      Cancel Plan
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Edit Response (if user already responded) */}
                    {viewerInviteToken && (
                      <Link to={`/respond/${viewerInviteToken}`}>
                        <Button size="sm" variant="secondary" title="Edit your response">
                          <Repeat2 className="h-4 w-4 mr-2" />
                          Edit your response
                        </Button>
                      </Link>
                    )}

                    {/* Use Invite Link */}
                    <Button
                      size="sm"
                      variant="outline"
                      title="Use an invite link from your email"
                      onClick={handleUseInviteLink}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      Use invite link
                    </Button>
                  </>
                )}
              </div>

              <Link to="/calendar">
                <Button size="sm" variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className={`space-y-8 ${plan.status === "cancelled" ? "opacity-50 pointer-events-none" : ""}`}>
          {/* Winners (after deadline) */}
          {votingClosed && (
            <section className="rounded-lg border bg-card">
              <div className="p-4 flex items-center gap-2 border-b">
                <Trophy className="h-5 w-5" />
                <div className="font-semibold">Most Popular Choices</div>
              </div>

              <div className="p-4 grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Date & Time
                  </div>
                  {(Array.isArray(winningDates) && winningDates.length) ? (
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

                <div>
                  <div className="text-sm font-medium mb-2">Activity & Location</div>
                  {Array.isArray(winningActivities) && winningActivities.length ? (
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

          <Separator />

          {/* Proposals (shows original + suggestions) */}
          <section className={`rounded-lg border bg-card ${plan.status === "cancelled" ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="p-4 border-b font-semibold">
              {votingClosed ? "All Considered Options" : "Current Proposals (with Suggestions)"}
            </div>

            <div className="p-4 grid gap-6 sm:grid-cols-2">
              {/* Date & Time */}
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

              {/* Activity & Location */}
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

          {/* Responses section */}
          <section className="rounded-lg border bg-card">
            <div className="p-4 flex items-center gap-2 border-b">
              <Users className="h-5 w-5" />
              <div className="font-semibold">Responses</div>
            </div>

            <div className="p-4 grid gap-6 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium mb-2">Responded ({respondedList.length})</div>
                {respondedList.length ? (
                  <ul className="text-sm space-y-1">
                    {respondedList.map((u, i) => (
                      <li key={`r-${i}`}>
                        {u.name}
                        {u.email ? <span className="opacity-60"> — {u.email}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm opacity-70">No one has responded yet.</div>
                )}
              </div>

              <div>
                <div className="text-sm font-medium mb-2">Pending ({pendingList.length})</div>
                {pendingList.length ? (
                  <ul className="text-sm space-y-1">
                    {pendingList.map((u, i) => (
                      <li key={`p-${i}`}>
                        {u.name}
                        {u.email ? <span className="opacity-60"> — {u.email}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm opacity-70">No pending invitees.</div>
                )}
              </div>
            </div>
          </section>

          {/* Final Decisions section */}
          <section className="rounded-lg border bg-card">
            <div className="p-4 flex items-center gap-2 border-b">
              <UserCheck className="h-5 w-5" />
              <div className="font-semibold">Final Decisions</div>
            </div>

            <div className="p-4 grid gap-6 sm:grid-cols-2">
              {/* Accepted */}
              <div>
                <div className="text-sm font-medium mb-2 text-green-700">
                  Accepted ({acceptedList.length})
                </div>
                {acceptedList.length ? (
                  <ul className="text-sm space-y-1">
                    {acceptedList.map((u, i) => (
                      <li key={`a-${i}`}>
                        {u.name}
                        {u.email ? <span className="opacity-60"> — {u.email}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm opacity-70">No accepted invitees.</div>
                )}
              </div>

              {/* Declined */}
              <div>
                <div className="text-sm font-medium mb-2 text-red-700">
                  Declined ({declinedList.length})
                </div>
                {declinedList.length ? (
                  <ul className="text-sm space-y-1">
                    {declinedList.map((u, i) => (
                      <li key={`d-${i}`}>
                        {u.name}
                        {u.email ? <span className="opacity-60"> — {u.email}</span> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm opacity-70">No declined invitees.</div>
                )}
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
