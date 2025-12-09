import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";

export default function ProfileModal({ open, onClose }) {
  const { setAuthUser } = useAuth();
  const [profile, setProfile] = useState(null);

  // editable fields
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");

  // password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [passwordError, setPasswordError] = useState("");

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
    // Reset error
    setPasswordError("");

    // Required fields
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    // Minimum length
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    // Passwords must match
    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    // Make API call
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
      setPasswordError(data.message || "Failed to update password.");
      return;
    }

    alert("Password updated successfully!");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[75vh] overflow-y-auto space-y-4">
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
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="w-full p-2 border rounded pr-10"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label>New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="w-full p-2 border rounded pr-10"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label>Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmNewPassword ? "text" : "password"}
                  className="w-full p-2 border rounded pr-10"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {passwordError && (<p className="text-red-500 text-sm">{passwordError}</p>)}

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