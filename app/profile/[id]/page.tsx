"use client";
import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import { PartnershipContext } from "@/context/PartnershipContext";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import {
  Home,
  MessageSquare,
  Settings,
  Users,
  UserPlus,
  UserCheck,
  Clock,
  Loader2,
  XCircle,
  UserMinus,
  User,
  X,
  Check,
} from "lucide-react";
import "./profile.css";

interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: "innovator" | "investor";
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Post {
  id: number;
  user_id: number;
  title: string;
  body: string;
  status: string | null;
  created_at: string;
  user?: { id: number; name: string; role: string };
}

interface Partner {
  id: number;
  name: string;
  role: string;
  partnership_id: number;
}

function AppNav() {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const { pendingRequests } = useContext(PartnershipContext);
  const router = useRouter();

  const totalPendingRequests = pendingRequests.length;

  return (
    <header className="profile-nav">
      <div className="profile-nav-inner">
        <Link href="/feed" className="profile-brand">
          VENTURA
        </Link>
        <div className="profile-nav-links">
          <Link href="/feed" className="profile-nav-link">
            <Home size={18} />
            <span>Feed</span>
          </Link>
          <Link href="/partners" className="profile-nav-link partners-link">
            <Users size={18} />
            <span>Partners</span>
            {totalPendingRequests > 0 && (
              <span className="profile-nav-partner-badge">
                {totalPendingRequests}
              </span>
            )}
          </Link>
          <Link href="/messages" className="profile-nav-link">
            <MessageSquare size={18} />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="profile-unread-badge">{unreadCount}</span>
            )}
          </Link>
          <Link href="/settings" className="profile-nav-link">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          {user?.is_admin && (
            <Link href="/admin" className="profile-nav-link">
              <User size={18} />
              <span>Admin</span>
            </Link>
          )}
        </div>
        <div className="profile-nav-right">
          <button className="profile-icon-btn"></button>
          <div
            className="profile-avatar-btn"
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

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser, token } = useContext(AuthContext);

  // All hooks at the top
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnershipStatus, setPartnershipStatus] = useState<{
    status: string | null;
    partnership_id: number | null;
    is_requester: boolean;
  } | null>(null);
  const [partnershipLoading, setPartnershipLoading] = useState(false);
  const [showPartnersModal, setShowPartnersModal] = useState(false);
  const [partnersList, setPartnersList] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const profileId = Number(id);
  const isOwner = currentUser?.id === profileId;

  // ✅ FIX: Use useCallback to memoize fetch functions
  const fetchPartnersList = useCallback(async () => {
    if (!token) return;
    setPartnersLoading(true);
    try {
      const res = await fetch(`${apiUrl}/partners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPartnersList(data.partners || []);
    } catch (err) {
      console.error("Error fetching partners:", err);
    } finally {
      setPartnersLoading(false);
    }
  }, [token, apiUrl]);

  // All useEffect hooks
  useEffect(() => {
    if (!token || !id) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const [profileRes, postsRes] = await Promise.all([
          fetch(`${apiUrl}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiUrl}/users/${id}/posts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileRes.json();
        const postsData = await postsRes.json();

        setProfile(profileData.user);
        setUserPosts(postsData.posts ?? []);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPartnershipStatus = async () => {
      if (isOwner) return;
      try {
        const res = await fetch(`${apiUrl}/partners/status/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setPartnershipStatus(data);
      } catch (err) {
        console.error("Error fetching partnership status:", err);
      }
    };

    fetchProfile();
    fetchPartnershipStatus();

    // ✅ Fetch partners list only if owner
    if (isOwner) {
      fetchPartnersList();
    }
  }, [id, token, apiUrl, isOwner, fetchPartnersList]); // ✅ Fixed dependencies

  const handleOpenPartnersModal = async () => {
    await fetchPartnersList();
    setShowPartnersModal(true);
  };

  const handlePartnershipAction = async (action?: string) => {
    if (!profile) return;
    setPartnershipLoading(true);
    try {
      if (action === "cancel" && partnershipStatus?.partnership_id) {
        const res = await fetch(
          `${apiUrl}/partners/${partnershipStatus.partnership_id}/cancel`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          setPartnershipStatus(null);
          if (isOwner) await fetchPartnersList();
        }
      } else if (!partnershipStatus || partnershipStatus.status === null) {
        const res = await fetch(`${apiUrl}/partners/request/${profile.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setPartnershipStatus({
            status: "pending",
            partnership_id: data.partnership?.id,
            is_requester: true,
          });
        }
      } else if (
        partnershipStatus.status === "pending" &&
        !partnershipStatus.is_requester
      ) {
        const res = await fetch(
          `${apiUrl}/partners/${partnershipStatus.partnership_id}/accept`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          setPartnershipStatus({ ...partnershipStatus, status: "accepted" });
          if (isOwner) await fetchPartnersList();
        }
      } else if (partnershipStatus.status === "accepted") {
        const res = await fetch(
          `${apiUrl}/partners/${partnershipStatus.partnership_id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (res.ok) {
          setPartnershipStatus(null);
          if (isOwner) await fetchPartnersList();
        }
      }
    } catch (err) {
      console.error("Error with partnership action:", err);
    } finally {
      setPartnershipLoading(false);
    }
  };

  const handleRemovePartnerFromList = async (partnershipId: number) => {
    try {
      const res = await fetch(`${apiUrl}/partners/${partnershipId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchPartnersList();
        if (partnershipStatus?.partnership_id === partnershipId) {
          setPartnershipStatus(null);
        }
      }
    } catch (err) {
      console.error("Error removing partner:", err);
    }
  };

  // No-op handlers for PostCard
  const handleUpdate = async (
    id: number,
    data: { title: string; body: string; status: string },
  ) => {};
  const handleDelete = async (id: number) => {};

  // Only ONE loading state - profile data
  if (loading) {
    return <Loader fullPage text="Loading profile..." />;
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="profile-page">
          <AppNav />
          <div className="profile-layout">
            <div className="profile-error-card">
              <p>User not found</p>
              <Link href="/feed" className="profile-error-btn">
                Go to Feed
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="profile-page">
        <AppNav />
        <div className="profile-layout">
          {/* Hero Card */}
          <div className="profile-hero-card">
            <div className="profile-cover">
              <div className="profile-cover-pattern" />
            </div>
            <div className="profile-hero-body">
              <div className="profile-top-row">
                <div className="profile-big-avatar">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.name} />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                {isOwner && (
                  <div className="profile-hero-actions">
                    <button
                      onClick={handleOpenPartnersModal}
                      className="profile-btn-outline"
                    >
                      <Users size={14} />
                      Partners ({partnersList.length})
                    </button>
                  </div>
                )}
                {!isOwner && (
                  <div className="profile-hero-actions">
                    {partnershipLoading ? (
                      <button className="profile-btn-outline" disabled>
                        <Loader2 size={14} className="profile-spin" />
                        ...
                      </button>
                    ) : !partnershipStatus ||
                      partnershipStatus.status === null ? (
                      <button
                        onClick={() => handlePartnershipAction()}
                        className="profile-btn-partner"
                      >
                        <UserPlus size={14} />
                        Add Partner
                      </button>
                    ) : partnershipStatus.status === "pending" ? (
                      partnershipStatus.is_requester ? (
                        <div className="profile-partner-actions">
                          <span className="profile-badge-pending">
                            <Clock size={14} />
                            Request Sent
                          </span>
                          <button
                            onClick={() => handlePartnershipAction("cancel")}
                            className="profile-btn-cancel-request"
                            title="Cancel Request"
                          >
                            <XCircle size={14} />
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handlePartnershipAction()}
                          className="profile-btn-accept"
                        >
                          <Check size={14} />
                          Accept Request
                        </button>
                      )
                    ) : partnershipStatus.status === "accepted" ? (
                      <div className="profile-partner-actions">
                        <span className="profile-badge-partner">
                          <UserCheck size={14} />
                          Partner
                        </span>
                        <button
                          onClick={() => handlePartnershipAction()}
                          className="profile-btn-remove"
                          title="Remove Partner"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : partnershipStatus.status === "declined" ? (
                      <button
                        onClick={() => handlePartnershipAction()}
                        className="profile-btn-partner"
                      >
                        <UserPlus size={14} />
                        Add Partner
                      </button>
                    ) : null}
                  </div>
                )}
              </div>

              <div className="profile-name-block">
                <h1 className="profile-full-name">{profile.name}</h1>
                <span
                  className={`profile-role-tag ${profile.role === "innovator" ? "role-innovator" : "role-investor"}`}
                >
                  {profile.role === "innovator" ? "Innovator" : "Investor"}
                </span>
              </div>

              <div className="profile-meta-row">
                <span className="profile-meta-item">{profile.email}</span>
                <span className="profile-meta-item">
                  Joined{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Bio Section */}
              <div className="profile-bio-section">
                <p
                  className={
                    profile.bio ? "profile-bio-display" : "profile-bio-empty"
                  }
                >
                  {profile.bio || "No bio yet."}
                </p>
              </div>
            </div>
          </div>

          {/* Posts Card */}
          <div className="profile-card">
            <div className="profile-card-title">
              Posts{" "}
              <span className="profile-post-count">({userPosts.length})</span>
            </div>
            {userPosts.length === 0 ? (
              <div className="profile-no-posts">
                <p>No posts yet.</p>
                {isOwner && (
                  <Link href="/feed" className="profile-no-posts-btn">
                    Create your first post
                  </Link>
                )}
              </div>
            ) : (
              <div className="profile-posts-list">
                {userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={currentUser?.id || 0}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Partners List Modal */}
      {showPartnersModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPartnersModal(false)}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Your Partners ({partnersList.length})</h3>
              <button onClick={() => setShowPartnersModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {partnersLoading ? (
                <div className="center-msg">
                  <Loader2 size={24} className="spin" />
                  <p>Loading partners...</p>
                </div>
              ) : partnersList.length === 0 ? (
                <div className="center-msg">
                  <p>No partners yet.</p>
                  <Link href="/partners" className="find-partners-link">
                    Find Partners
                  </Link>
                </div>
              ) : (
                <div className="partners-list">
                  {partnersList.map((partner) => (
                    <div key={partner.id} className="partner-item">
                      <div
                        className="partner-info"
                        onClick={() => {
                          setShowPartnersModal(false);
                          router.push(`/profile/${partner.id}`);
                        }}
                      >
                        <div className="partner-avatar">
                          {partner.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="partner-name">{partner.name}</div>
                          <div className="partner-role">
                            {partner.role === "innovator"
                              ? "Innovator"
                              : "Investor"}
                          </div>
                        </div>
                      </div>
                      <button
                        className="partner-remove"
                        onClick={() =>
                          handleRemovePartnerFromList(partner.partnership_id)
                        }
                        title="Remove Partner"
                      >
                        <UserMinus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
