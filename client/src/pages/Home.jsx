import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {plansData} from "../data/plansData.js"
import { Button } from "@/components/ui/button";
const Home = () => {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, redirecting to login");
        window.location.href = "/login";
        return;
      }

      try {
        const res = await fetch("/api/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          try {
            const plansRes = await fetch("/api/plans", { headers: { Authorization: `Bearer ${token}` } });
          const plansData = await plansRes.json();
            if (plansRes.ok) {
              const formattedPlans = plansData.plans.map(p => ({
                ...p,
                image: p.image_url
              }));
              setPlans(formattedPlans);
            }
          }
          catch(err){
            console.error("Failed fetching plans:", err);
          }
          // setPlans(plansData); //loading mock data
        } else {
          console.error(data.message);
          window.location.href = "/login";
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  if (!user) return <p>Loading...</p>;
  

   const getStatusColor = (plan) => {
    if (plan.confirmed) return "bg-green-500"; // confirmed
    const now = new Date();
    const deadline = new Date(plan.deadline);
    return now < deadline ? "bg-yellow-400" : "bg-red-500"; // before or after deadline
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center">
        Welcome back, {user.name} 👋
      </h1>

      {/* Grid layout for 3 cards per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-lg transition group p-0 gap-0"
          >
            {/* Image section */}
            
            <img
              src={plan.image}
              alt={plan.title}
              className="w-full h-50 object-cover rounded-t-2xl"
            />
            {console.log(plans.map(p => p.image))}
            

            {/* Overlay text (bottom-left) */}
            <CardContent className="text-left p-4">
              <h2 className="text-lg font-semibold text-gray-900">{plan.title}</h2>
              <p className="text-sm text-gray-600">
                {plan.confirmed
                  ? `Hangout: ${new Date(plan.hangoutDate).toLocaleDateString()}`
                  : `Deadline: ${new Date(plan.deadline).toLocaleDateString()}`}
              </p>
            </CardContent>

            {/* Status Circle (bottom-right) */}
            <div
              className={`absolute bottom-4 right-4 w-5 h-5 rounded-full ${getStatusColor(
                plan
              )}`}
              title={
                plan.confirmed
                  ? "Confirmed"
                  : new Date(plan.deadline) > new Date()
                  ? "Before deadline"
                  : "Past deadline"
              }
            ></div>
          </Card>
        ))}
      </div>
    </div>

  );
};

export default Home;