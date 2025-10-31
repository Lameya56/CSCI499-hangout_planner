import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Decide = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch finalized plan + invitation
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const res = await fetch(`/api/plans/finalized/${token}`);
        const data = await res.json();
        if (res.ok) {
          setPlanData(data);
        } else {
          setError(data.message || "Failed to load plan");
        }
      } catch (err) {
        setError("Server error fetching plan");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [token]);

  const handleDecision = async (choice) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/invitations/confirm/${choice}?token=${token}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        navigate("/home");
      } else {
        alert(data.message || "Failed to submit response");
      }
    } catch (err) {
      alert("Server error submitting response");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading plan details...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!planData) return null;

  const { plan, invitation } = planData;
  console.log(plan);

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">{plan.title}</CardTitle>
          <p className="text-sm text-gray-500">Hosted by: {plan.host_name}</p>
        </CardHeader>

        <CardContent>
          <div className="mb-4">
            <p className="font-semibold">Winning Date:</p>
            <p>{new Date(`${plan.finalized_datetime}`).toLocaleString()}</p>
          </div>

          <div className="mb-4">
            <p className="font-semibold">Winning Activity:</p>
            <p>{plan.winning_activity.name}</p>
            <p className="text-sm text-gray-500">📍 {plan.winning_activity.location}</p>
          </div>

          <div className="mb-4">
            <p className="font-semibold">Invitees:</p>
            <ul className="list-disc list-inside text-sm">
              {plan.invitees.map((i) => (
                <li key={i.email}>{i.email}</li>
              ))}
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex gap-4">
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => handleDecision("accepted")}
            disabled={submitting || invitation.status !== "responded"}
          >
            Accept
          </Button>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            onClick={() => handleDecision("declined")}
            disabled={submitting || invitation.status !== "responded"}
          >
            Decline
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Decide;