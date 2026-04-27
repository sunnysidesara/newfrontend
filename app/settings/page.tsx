"use client";
import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import { PartnershipContext } from "@/context/PartnershipContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  Save,
  X,
  Check,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  Users,
  Key,
} from "lucide-react";
import "./settings.css";

function AppNav() {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const { pendingRequests } = useContext(PartnershipContext);
  const router = useRouter();

  const totalPendingRequests = pendingRequests.length;

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
          <Link href="/partners" className="settings-nav-link partners-link">
            <Users size={18} />
            <span>Partners</span>
            {totalPendingRequests > 0 && (
              <span className="nav-request-badge">{totalPendingRequests}</span>
            )}
          </Link>
          <Link href="/messages" className="settings-nav-link">
            <MessageSquare size={18} />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="settings-unread-badge">{unreadCount}</span>
            )}
          </Link>
          <Link href="/settings" className="settings-nav-link active">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          {user?.is_admin && (
            <Link href="/admin" className="settings-nav-link">
              <User size={18} />
              <span>Admin</span>
            </Link>
          )}
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

  // Profile fields
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [role, setRole] = useState(user?.role ?? "innovator");

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete account modal with password verification
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // UI states
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setEmail(user.email ?? "");
      setBio(user.bio ?? "");
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
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update profile");
      }

      const data = await res.json();

      const storedUser = localStorage.getItem("ventur_user");
      if (storedUser) {
        const updatedUser = {
          ...JSON.parse(storedUser),
          name,
          email,
          bio,
          role,
        };
        localStorage.setItem("ventur_user", JSON.stringify(updatedUser));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSaved(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch(`${apiUrl}/users/${user?.id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Current password is incorrect.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Please enter your password to delete your account.");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      // First, verify the password
      const verifyRes = await fetch(`${apiUrl}/verify-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        setDeleteError(
          errorData.message || "Incorrect password. Please try again.",
        );
        setDeleting(false);
        return;
      }

      // Password verified, proceed with deletion
      const deleteRes = await fetch(`${apiUrl}/users/${user?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await deleteRes.json();

      if (!deleteRes.ok) {
        // Check for specific admin error messages
        if (data.message && data.message.includes("only admin")) {
          setDeleteError(
            "Cannot delete account: You are the only admin. Please assign another admin first before deleting your account.",
          );
        } else if (data.message && data.message.includes("admin")) {
          setDeleteError(
            "Admin accounts cannot be deleted. Please contact another admin to remove your admin privileges first.",
          );
        } else {
          setDeleteError(data.message || "Failed to delete account");
        }
        setDeleting(false);
        return;
      }

      // Clear all local storage
      localStorage.removeItem("ventur_token");
      localStorage.removeItem("ventur_user");

      // Close the modal
      setShowDeleteModal(false);

      // Force a hard navigation to signup page to reset all contexts
      window.location.href = "/signup";
    } catch (err: any) {
      console.error("Delete account error:", err);
      setDeleteError(
        err.message || "Failed to delete account. Please try again.",
      );
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      localStorage.removeItem("ventur_token");
      localStorage.removeItem("ventur_user");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
      window.location.href = "/login";
    }
  };

  const hasChanges = () => {
    return (
      name !== (user?.name ?? "") ||
      email !== (user?.email ?? "") ||
      bio !== (user?.bio ?? "") ||
      role !== (user?.role ?? "innovator")
    );
  };

  const handleDiscard = () => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setBio(user?.bio ?? "");
    setRole(user?.role ?? "innovator");
  };

  const openDeleteModal = () => {
    setDeletePassword("");
    setDeleteError("");
    setShowDeleteModal(true);
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

          {/* Profile Information Section */}
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
                <option value="innovator">Innovator</option>
                <option value="investor">Investor</option>
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

            {error && (
              <div className="settings-error-msg">
                <X size={14} />
                {error}
              </div>
            )}

            {saved && (
              <div className="settings-success-msg">
                <Check size={14} />
                Profile updated successfully.
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

          {/* Change Password Section */}
          <div className="settings-card">
            <div className="settings-card-title">
              <Lock size={16} className="settings-card-icon" />
              Change Password
            </div>

            <p className="settings-password-hint">
              To change password, enter your current password. If you forgot
              your password, please contact an admin.
            </p>

            <div className="settings-field">
              <label className="settings-label">Current Password</label>
              <div className="settings-password-wrapper">
                <input
                  className="settings-input"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label className="settings-label">New Password</label>
              <div className="settings-password-wrapper">
                <input
                  className="settings-input"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 8 characters)"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label className="settings-label">Confirm New Password</label>
              <div className="settings-password-wrapper">
                <input
                  className="settings-input"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="settings-error-msg">
                <X size={14} />
                {passwordError}
              </div>
            )}

            {passwordSaved && (
              <div className="settings-success-msg">
                <Check size={14} />
                Password changed successfully.
              </div>
            )}

            <div className="settings-save-row">
              <button
                className="settings-btn-save"
                onClick={handleChangePassword}
                disabled={
                  savingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
              >
                {savingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>

          {/* Danger Zone */}
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
              <button className="settings-btn-danger" onClick={openDeleteModal}>
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal with Password Input */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="modal-container delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Delete Account</h3>
              <button onClick={() => setShowDeleteModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning-icon">
                <AlertTriangle size={48} />
              </div>
              <p>Are you sure you want to delete your account?</p>
              <p className="modal-warning">
                This action is <strong>permanent and cannot be undone</strong>.
                All your posts, comments, conversations will be permanently
                deleted. You will lose access to your account!
              </p>

              {/* Password Input Section */}
              <div className="delete-password-section">
                <label className="delete-password-label">
                  <Key size={16} />
                  Enter your password to confirm:
                </label>
                <div className="delete-password-wrapper">
                  <input
                    type={showDeletePassword ? "text" : "password"}
                    className="delete-password-input"
                    placeholder="Your account password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="delete-password-toggle"
                    onClick={() => setShowDeletePassword(!showDeletePassword)}
                  >
                    {showDeletePassword ? (
                      <Eye size={18} />
                    ) : (
                      <EyeOff size={18} />
                    )}
                  </button>
                </div>
                <p className="delete-password-hint">
                  Forgot your password? Please contact an admin.
                </p>
              </div>

              {deleteError && <p className="delete-error">{deleteError}</p>}
            </div>
            <div className="modal-footer">
              <button
                className="modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-delete-account"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete My Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
