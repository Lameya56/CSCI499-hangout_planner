import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Home = () => {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    const load = async () => {
      try {
        const profileRes = await fetch("/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        if (!profileRes.ok) throw new Error();

        setUser(profileData.user);

        const plansRes = await fetch("/api/plans", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const plansData = await plansRes.json();

        const formatted = plansData.plans.map((p) => ({
          ...p,
          image: p.image_url,
        }));

        setPlans(formatted);
      } catch {
        window.location.href = "/login";
      }
    };

    load();
  }, []);

  if (!user) return <p>Loading...</p>;

  /* =========================
     STATUS TEXT
  ========================= */
  const getPlanText = (plan) => {
    const now = new Date();
    const deadline = new Date(plan.deadline);

    if (plan.status === "cancelled") return "Cancelled";

    if (plan.status === "pending" && now < deadline) {
      return `Planning in progress • Respond by ${deadline.toLocaleString()}`;
    }

    if (plan.status === "confirmed" && !plan.decision_over_email_sent) {
      if (plan.host_id === user.id) {
        return `Final plan selected • Awaiting guests' decisions by ${new Date(deadline.getTime() + 24 * 60 * 60 * 1000).toLocaleString()}`;
      }
      return `Final plan selected • Awaiting your decision by ${new Date(deadline.getTime() + 24 * 60 * 60 * 1000).toLocaleString()}`;
    }

    if (plan.status === "confirmed" && plan.decision_over_email_sent) {
      return "Decision window closed";
    }

    return "";
  };

  /* =========================
     STATUS COLOR
  ========================= */
  const getStatusColor = (plan) => {
    const invite = plan.invitation_status;

    if (plan.status === "cancelled") return "bg-black";

    if (!invite && plan.host_id === user.id && plan.status === "pending") return "bg-blue-500"; // host automatically responded status

    if (plan.status === "pending") {
      if (invite === "pending") return "bg-yellow-400";
      if (invite === "responded") return "bg-blue-500";
    }

    if (!invite && plan.host_id === user.id && plan.status === "confirmed") return "bg-green-500"; // host automatically accepted status

    if (plan.status === "confirmed" && !plan.decision_over_email_sent) {
      if (invite === "accepted") return "bg-green-500";
      if (invite === "declined") return "bg-red-500";
      return "bg-purple-500";
    }

    if (plan.status === "confirmed" && plan.decision_over_email_sent) {
      if (invite === "accepted") return "bg-green-500";
      if (invite === "declined") return "bg-red-500";
      return "bg-gray-400";
    }

    return "bg-gray-300";
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">
        Welcome back, {user.name} 👋
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Link
            key={plan.id}
            to={`/plans/${plan.id}`}                            // ⬅️ makes the whole card clickable
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-2xl"
            aria-label={`Open plan: ${plan.title || "Plan"}`}
          >
            <Card className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition group p-0 gap-0">
              <img
                src={plan.image}
                alt={plan.title}
                className="w-full h-50 object-cover rounded-t-2xl"
              />

              <CardContent className="text-left p-4">
                <h2 className="text-lg font-semibold text-gray 900">{plan.title} {plan.host_id == user.id && " (Host)"}</h2>
                <p className="text-sm text-gray-600">{getPlanText(plan)}</p>
              </CardContent>

              <div
                className={`absolute bottom-4 right-4 w-5 h-5 rounded-full ${getStatusColor(
                  plan
                )}`}
                title={
                  plan.status === "cancelled"
                    ? "Cancelled"
                    : plan.status === "confirmed" && plan.decision_over_email_sent
                    ? "Decision window closed"
                    : plan.status === "confirmed"
                    ? "Final plan selected"
                    : new Date(plan.deadline) > new Date()
                    ? "Before deadline"
                    : "Past deadline"
                }
              />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Home;