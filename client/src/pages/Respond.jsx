import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";

const Respond = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [plan, setPlan] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [newActivities, setNewActivities] = useState([{ name: '', location: '' }]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkInvitation();
  }, [token]);

  // ✅ First check if invitation exists and if user needs to login
  const checkInvitation = async () => {
    try {
      const res = await fetch(`/api/invitations/${token}/check`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }

      if (data.requiresAuth) {
        // User needs to sign up/login
        setRequiresAuth(true);
        setLoading(false);
      } else {
        // User is already linked, try to fetch full details
        fetchInvitationDetails();
      }
    } catch (err) {
      setError('Failed to load invitation');
      setLoading(false);
    }
  };

  // ✅ Fetch full invitation details (requires auth)
  const fetchInvitationDetails = async () => {
    try {
      const localToken = localStorage.getItem("token");
      
      if (!localToken) {
        setRequiresAuth(true);
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/invitations/${token}`, {
        headers: {
          Authorization: `Bearer ${localToken}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setInvitation(data.invitation);
        setPlan(data.plan);
        
        // Load existing votes if any
        if (data.existingVotes) {
          setSelectedDates(data.existingVotes.dates || []);
          setSelectedActivities(data.existingVotes.activities || []);
        }
        
        setRequiresAuth(false);
      } else {
          if (data.alreadyResponded) {
            console.log('⚠️ Already responded');
            setError('You have already responded to this invitation! ✅');
            setLoading(false);
            // Show error for 2 seconds, then redirect
            setTimeout(() => {
            navigate('/home');
            }, 2000);
            return;
        }
        
        if (data.expired) {
            setError('This invitation has expired.');
            setLoading(false);
            return;
        }
        if (res.status === 401 || res.status === 403) {
          setRequiresAuth(true);
        } else {
          setError(data.message);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleDateToggle = (dateId) => {
    setSelectedDates(prev =>
      prev.includes(dateId)
        ? prev.filter(id => id !== dateId)
        : [...prev, dateId]
    );
  };

  const handleActivityToggle = (activityId) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const addNewActivityField = () => {
    setNewActivities([...newActivities, { name: '', location: '' }]);
  };

  const updateNewActivity = (index, field, value) => {
    const updated = [...newActivities];
    updated[index][field] = value;
    setNewActivities(updated);
  };

  const removeNewActivity = (index) => {
    setNewActivities(newActivities.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (selectedDates.length === 0) {
      alert('Please select at least one date');
      setSubmitting(false);
      return;
    }

    const validNewActivities = newActivities.filter(a => a.name && a.location);

    if (selectedActivities.length === 0 && validNewActivities.length === 0) {
      alert('Please select at least one activity or suggest a new one');
      setSubmitting(false);
      return;
    }

    try {
      const localToken = localStorage.getItem("token");
      
      const res = await fetch(`/api/votes/submit/${token}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localToken}`
        },
        body: JSON.stringify({
          dateIds: selectedDates,
          activityIds: selectedActivities,
          newActivities: validNewActivities
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Your response has been submitted successfully! 🎉');
        navigate('/home');
      } else {
        alert(data.message || 'Failed to submit response');
      }
    } catch (err) {
      alert('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Show login/signup prompt
  if (requiresAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required 🔐</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              You need to create an account or sign in to respond to this invitation.
            </p>
            <p className="text-sm text-gray-500">
              Don't worry! Your invitation will be waiting for you after you sign in.
            </p>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button 
              onClick={() => navigate(`/signup?redirect=/respond/${token}`)}
              className="flex-1"
            >
              Sign Up
            </Button>
            <Button 
              onClick={() => navigate(`/login?redirect=/respond/${token}`)}
              variant="outline"
              className="flex-1"
            >
              Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Loading invitation...</p>
    </div>
  );
  
  if (error) return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    </div>
  );

  if (!plan) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">You're Invited! 🎉</CardTitle>
          <p className="text-gray-600">{plan.title}</p>
          <p className="text-sm text-gray-500">Hosted by {plan.host_name}</p>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Event Image */}
            {plan.image_url && (
              <img
                src={plan.image_url}
                alt={plan.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}

            {/* Deadline Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm font-semibold text-yellow-800">
                ⏰ Please respond by: {new Date(plan.deadline).toLocaleString()}
              </p>
            </div>

            {/* Select Dates */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">
                Which dates work for you? <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-gray-500 mb-3">Select all dates you're available</p>
              <div className="space-y-2">
                {plan.dates && plan.dates.map((date) => (
                  <div 
                    key={date.id} 
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleDateToggle(date.id)}
                  >
                    <Input
                      type="checkbox"
                      checked={selectedDates.includes(date.id)}
                      onChange={() => handleDateToggle(date.id)}
                    />
                    <Label className="flex-1 cursor-pointer">
                      {new Date(date.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                      <span className="text-sm text-gray-500 ml-2">
                        ({date.vote_count} {date.vote_count === 1 ? 'vote' : 'votes'})
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Select Activities */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">
                What activities interest you? <span className="text-red-500">*</span>
              </Label>
              <p className="text-sm text-gray-500 mb-3">Select all activities you'd enjoy</p>
              <div className="space-y-2">
                {plan.activities && plan.activities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleActivityToggle(activity.id)}
                  >
                    <Input
                      type="checkbox"
                      checked={selectedActivities.includes(activity.id)}
                      onChange={() => handleActivityToggle(activity.id)}
                    />
                    <div className="flex-1">
                      <Label className="cursor-pointer font-medium">{activity.name}</Label>
                      <p className="text-sm text-gray-500">📍 {activity.location}</p>
                      {activity.suggested_by_name && (
                        <p className="text-xs text-blue-500">Suggested by {activity.suggested_by_name}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        ({activity.vote_count} {activity.vote_count === 1 ? 'vote' : 'votes'})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggest New Activities */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Suggest New Activities (Optional)</Label>
              <p className="text-sm text-gray-500 mb-3">Have other ideas? Add them here!</p>
              {newActivities.map((activity, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Activity name"
                    value={activity.name}
                    onChange={(e) => updateNewActivity(index, 'name', e.target.value)}
                  />
                  <Input
                    placeholder="Location"
                    value={activity.location}
                    onChange={(e) => updateNewActivity(index, 'location', e.target.value)}
                  />
                  {newActivities.length > 1 && (
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={() => removeNewActivity(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button 
                type="button" 
                variant="secondary" 
                onClick={addNewActivityField} 
                className="mt-2"
              >
                + Add Another Activity
              </Button>
            </div>

            {/* Vote Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Your Selections:</p>
              <p className="text-sm">✅ {selectedDates.length} dates selected</p>
              <p className="text-sm">✅ {selectedActivities.length} activities selected</p>
              {newActivities.filter(a => a.name && a.location).length > 0 && (
                <p className="text-sm">✨ {newActivities.filter(a => a.name && a.location).length} new activities suggested</p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting || selectedDates.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Respond;