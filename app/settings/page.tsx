"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";
import "./settings.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Bell,
  Home,
  MessageSquare,
  Settings,
  User,
  Save,
  X,
  Check,
} from "lucide-react";
import "./settings.css";

function AppNav() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  return (
    <header className="settings-nav">
      <div className="settings-nav-inner">
        <Link href="/feed" className="settings-brand">
          VENTURA
        </Link>
        <div className="settings-nav-links">
          <Link href="/feed" className="settings-nav-link">
            <Home size={18} />
            <span>Feed</span>
          </Link>
          <Link href="/messages" className="settings-nav-link">
            <MessageSquare size={18} />
            <span>Messages</span>
          </Link>
          <Link href="/settings" className="settings-nav-link active">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
        <div className="settings-nav-right">
          <button className="settings-icon-btn"></button>
          <div
            className="settings-avatar-btn"
            onClick={() => router.push(`/profile/${user?.id}`)}
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} />
            ) : (
              (user?.name?.charAt(0)?.toUpperCase() ?? "U")
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function SettingsPage() {
  const { user, token, logout } = useContext(AuthContext);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [status, setStatus] = useState(user?.status ?? "");
  const [role, setRole] = useState(user?.role ?? "innovator");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setBio(user.bio ?? "");
      setStatus(user.status ?? "");
      setRole(user.role ?? "innovator");
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          bio,
          status,
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update profile");
      }

      const data = await res.json();

      // Update local user data in localStorage and context
      const storedUser = localStorage.getItem("ventur_user");
      if (storedUser) {
        const updatedUser = {
          ...JSON.parse(storedUser),
          name,
          email,
          bio,
          status,
          role,
        };
        localStorage.setItem("ventur_user", JSON.stringify(updatedUser));
      }

      // Update the user object in the AuthContext (optional - page will refresh data)
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/login");
  };

  const hasChanges = () => {
    return (
      name !== (user?.name ?? "") ||
      email !== (user?.email ?? "") ||
      bio !== (user?.bio ?? "") ||
      status !== (user?.status ?? "") ||
      role !== (user?.role ?? "innovator")
    );
  };

  const handleDiscard = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setBio(user?.bio ?? "");
    setStatus(user?.status ?? "");
    setRole(user?.role ?? "innovator");
  };

  if (!user) return null;

  return (
    <ProtectedRoute>
      <div className="settings-page">
        <AppNav />
        <div className="settings-layout">
          {/* Header */}
          <div className="settings-header-card">
            <div>
              <div className="settings-title">Account Settings</div>
              <div className="settings-sub">
                Manage your VENTURA profile and preferences
              </div>
            </div>
            <Link
              href={`/profile/${user?.id}`}
              className="settings-btn-outline"
            >
              <User size={16} />
              View Profile
            </Link>
          </div>

          {/* Profile section */}
          <div className="settings-card">
            <div className="settings-card-title">Profile Information</div>

            <div className="settings-avatar-row">
              <div className="settings-avatar-preview">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} />
                ) : (
                  (user?.name?.charAt(0)?.toUpperCase() ?? "U")
                )}
              </div>
              <div className="settings-avatar-info">
                <strong>Profile photo</strong>
                <p>Upload a photo to personalize your profile.</p>
                <button className="settings-upload-btn" disabled>
                  Coming soon
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label className="settings-label">Full Name</label>
              <input
                className="settings-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
              <p className="settings-hint">Your display name on VENTURA.</p>
            </div>

            <div className="settings-field">
              <label className="settings-label">Email Address</label>
              <input
                className="settings-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
              <p className="settings-hint">Used for login and notifications.</p>
            </div>

            <div className="settings-field">
              <label className="settings-label">Role</label>
              <select
                className="settings-select"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "innovator" | "investor")
                }
              >
                <option value="innovator">🚀 Innovator</option>
                <option value="investor">💰 Investor</option>
              </select>
              <p className="settings-hint">
                Your role determines how others see you on the platform.
              </p>
            </div>

            <div className="settings-field">
              <label className="settings-label">Bio</label>
              <textarea
                className="settings-textarea"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself, your interests, and what you're looking for..."
                rows={4}
              />
            </div>

            <div className="settings-field">
              <label className="settings-label">Status</label>
              <select
                className="settings-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Select a status</option>
                <option value="looking_for_investor">
                  🔍 Looking for Investor
                </option>
                <option value="looking_to_collaborate">
                  🤝 Looking to Collaborate
                </option>
                <option value="open_to_connect">🌐 Open to Connect</option>
              </select>
              <p className="settings-hint">
                Let others know what you're currently looking for.
              </p>
            </div>

            {error && (
              <div className="settings-error-msg">
                <X size={14} />
                {error}
              </div>
            )}

            {saved && (
              <div className="settings-success-msg">
                <Check size={14} />
                Changes saved successfully.
              </div>
            )}

            <div className="settings-save-row">
              <button
                className="settings-btn-discard"
                onClick={handleDiscard}
                disabled={!hasChanges()}
              >
                Discard Changes
              </button>
              <button
                className="settings-btn-save"
                onClick={handleSave}
                disabled={saving || !hasChanges()}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="settings-card settings-danger-zone">
            <div className="settings-card-title settings-danger-title">
              Danger Zone
            </div>

            <div className="settings-danger-row">
              <div>
                <div className="settings-danger-label">Sign out</div>
                <div className="settings-danger-sub">
                  Sign out of your VENTURA account on this device.
                </div>
              </div>
              <button
                className="settings-btn-danger"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>

            <div className="settings-danger-row">
              <div>
                <div className="settings-danger-label">Delete account</div>
                <div className="settings-danger-sub">
                  Permanently delete your account and all data. This action
                  cannot be undone.
                </div>
              </div>
              <button
                className="settings-btn-danger"
                onClick={() =>
                  alert("Please contact support to delete your account.")
                }
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
