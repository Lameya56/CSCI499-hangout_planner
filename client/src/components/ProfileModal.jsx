import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProfileModal({ open, onClose }) {
  const { setAuthUser } = useAuth();
  const [profile, setProfile] = useState(null);

  // editable fields
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  // password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");

  // Fetch profile when modal opens
  useEffect(() => {
    if (!open) return;

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/profile", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (res.ok) {
          setProfile(data.user);
          setEditedName(data.user.name);
          setEditedEmail(data.user.email);
        } else {
          setError(data.message || "Failed to load profile.");
        }
      } catch (err) {
        setError("Failed to load profile.");
      }
    };

    fetchProfile();
  }, [open]);

  // Save name + email
  const handleSave = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/profile/update", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editedName,
        email: editedEmail,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update profile.");
      return;
    }

    // ⭐ Update authUser immediately so UI updates without refresh
    setAuthUser((prev) => ({
      ...prev,
      name: editedName,
      email: editedEmail,
    }));

    // ⭐ Persist updated user to localStorage if you use it
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...profile,
        name: editedName,
        email: editedEmail,
      })
    );

    alert("Profile updated successfully!");
    onClose();
  };

  // Update password
  const handlePasswordUpdate = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to update password.");
      return;
    }

    alert("Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md space-y-6">
        <DialogHeader>
          <DialogTitle>My Profile</DialogTitle>
        </DialogHeader>

        {error && <p className="text-red-500">{error}</p>}
        {!profile && !error && <p>Loading...</p>}

        {profile && (
          <>
            {/* NAME */}
            <div className="space-y-1">
              <label className="font-semibold">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </div>

            {/* EMAIL */}
            <div className="space-y-1">
              <label className="font-semibold">Email</label>
              <input
                type="email"
                className="w-full p-2 border rounded"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
              />
            </div>

            <button
              className="w-full bg-[#866b4eff] text-white py-2 rounded hover:bg-[#866b4ecc] mt-4"
              onClick={handleSave}
            >
              Save Changes
            </button>

            <hr className="my-4" />

            <h3 className="font-semibold text-lg">Change Password</h3>

            <div className="space-y-1">
              <label>Current Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label>New Password</label>
              <input
                type="password"
                className="w-full p-2 border rounded"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button
              className="w-full bg-[#866b4eff] text-white py-2 rounded hover:bg-[#866b4ecc] mt-4"
              onClick={handlePasswordUpdate}
            >
              Update Password
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}