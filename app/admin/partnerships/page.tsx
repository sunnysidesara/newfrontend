"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { AdminContext } from "@/context/AdminContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  Users,
  FileText,
  Trash2,
  X,
  LogOut,
  LayoutDashboard,
  Mail,
  Loader2,
  Search,
  Handshake,
} from "lucide-react";
import "../../admin/admin.css";

function AdminNav() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("partnerships");

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className="admin-nav">
      <div className="admin-nav-inner">
        <Link href="/admin" className="admin-brand">
          VENTURA ADMIN
        </Link>
        <div className="admin-nav-links">
          <Link
            href="/admin"
            className="admin-nav-link"
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="admin-nav-link"
            onClick={() => setActiveTab("users")}
          >
            <Users size={16} /> Users
          </Link>
          <Link
            href="/admin/posts"
            className="admin-nav-link"
            onClick={() => setActiveTab("posts")}
          >
            <FileText size={16} /> Posts
          </Link>
          <Link
            href="/admin/partnerships"
            className="admin-nav-link active"
            onClick={() => setActiveTab("partnerships")}
          >
            <Handshake size={16} /> Partnerships
          </Link>
          <Link
            href="/admin/messages"
            className="admin-nav-link"
            onClick={() => setActiveTab("messages")}
          >
            <Mail size={16} /> Messages
          </Link>
          <Link href="/feed" className="admin-nav-link">
            <Home size={16} /> Back to Feed
          </Link>
        </div>
        <button onClick={logout} className="admin-logout-btn">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}

interface PartnershipView {
  id: number;
  name: string;
  role: string;
  status: string;
  since: string;
}

export default function AdminPartnerships() {
  const { user, token, loading: authLoading } = useContext(AuthContext);
  const { adminSearchUsers } = useContext(AdminContext);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [partnershipsList, setPartnershipsList] = useState<PartnershipView[]>(
    [],
  );
  const [loadingPartnerships, setLoadingPartnerships] = useState(false);

  // Search users - runs EVERY TIME searchQuery changes
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError("");
      try {
        const results = await adminSearchUsers(searchQuery);
        setSearchResults(results || []);
      } catch (error) {
        setSearchError("Failed to search users");
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, adminSearchUsers]);

  const handleSelectUser = async (selected: any) => {
    // Clear search results but keep search query
    setSearchResults([]);
    setSelectedUser(selected);
    setLoadingPartnerships(true);
    setPartnershipsList([]);

    try {
      const res = await fetch(
        `${apiUrl}/admin/user-partnerships/${selected.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();

      const formatted: PartnershipView[] = [];

      if (data.pending_from_others && data.pending_from_others.length > 0) {
        data.pending_from_others.forEach((p: any) => {
          formatted.push({
            id: p.requester_id,
            name: p.requester?.name || "Unknown",
            role: p.requester?.role || "-",
            status: "Pending Approval",
            since: new Date(p.created_at).toLocaleDateString(),
          });
        });
      }

      if (data.requested_to_others && data.requested_to_others.length > 0) {
        data.requested_to_others.forEach((p: any) => {
          formatted.push({
            id: p.requested_id,
            name: p.requested?.name || "Unknown",
            role: p.requested?.role || "-",
            status: "Requested",
            since: new Date(p.created_at).toLocaleDateString(),
          });
        });
      }

      if (data.partners && data.partners.length > 0) {
        data.partners.forEach((p: any) => {
          const partnerId =
            p.requester_id === selected.id ? p.requested_id : p.requester_id;
          const partner =
            p.requester_id === selected.id ? p.requested : p.requester;
          formatted.push({
            id: partnerId,
            name: partner?.name || "Unknown",
            role: partner?.role || "-",
            status: "Partners",
            since: new Date(p.created_at).toLocaleDateString(),
          });
        });
      }

      setPartnershipsList(formatted);
    } catch (error) {
      console.error("Error fetching partnerships:", error);
      setPartnershipsList([]);
    } finally {
      setLoadingPartnerships(false);
    }
  };

  if (authLoading) {
    return (
      <div className="admin-loading-black">
        <Loader fullPage text="Authenticating..." />
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <ProtectedRoute>
        <div className="admin-access-denied">
          <div className="access-denied-card">
            <h2>Access Denied</h2>
            <p>You don't have permission to access this page.</p>
            <Link href="/feed">Go to Feed</Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="admin-page">
        <AdminNav />
        <div className="admin-container">
          <div className="admin-header">
            <h1 className="admin-title">Partnership Management</h1>
          </div>

          {/* Search Section - Always visible, always works */}
          <div className="partnership-search-section">
            <label className="search-label">Search User</label>
            <div className="partnership-search-card">
              <div className="partnership-search-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="partnership-search-input"
                />
              </div>
            </div>
            {searching && (
              <div className="search-loading-indicator">Searching...</div>
            )}
            {searchError && (
              <div className="search-error-msg">{searchError}</div>
            )}
          </div>

          {/* Search Results - Show when there are results (overrides/above table) */}
          {searchResults.length > 0 && (
            <div className="partnership-results-card">
              <div className="results-header">
                <span>Search Results ({searchResults.length})</span>
              </div>
              <div className="results-list">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    className="result-item"
                    onClick={() => handleSelectUser(result)}
                  >
                    <div className="result-avatar">
                      {result.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="result-details">
                      <div className="result-name">{result.name}</div>
                      <div className="result-email">{result.email}</div>
                      <div className="result-role-badge">
                        {result.role === "innovator" ? "Innovator" : "Investor"}
                      </div>
                    </div>
                    <div className="result-arrow">→</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected User Partnerships Table - Shows below search results when a user is selected */}
          {selectedUser && (
            <div className="partnerships-table-card">
              <div className="table-header-section">
                <h3 className="table-title">
                  {selectedUser.name} - Partnerships
                </h3>
              </div>

              <div className="data-table">
                <div className="table-row-header">
                  <div className="col-id">ID</div>
                  <div className="col-name">Name</div>
                  <div className="col-role">ROLE</div>
                  <div className="col-status">Status</div>
                  <div className="col-since">Since</div>
                </div>

                {loadingPartnerships ? (
                  <div className="table-loading">
                    <Loader2 size={24} className="spin" />
                    <p>Loading partnerships...</p>
                  </div>
                ) : partnershipsList.length === 0 ? (
                  <div className="table-empty">No partners yet.</div>
                ) : (
                  partnershipsList.map((p) => (
                    <div key={p.id} className="table-row">
                      <div className="col-id">#{p.id}</div>
                      <div className="col-name">{p.name}</div>
                      <div className="col-role">
                        <span
                          className={`role-badge ${p.role === "innovator" ? "role-innovator" : "role-investor"}`}
                        >
                          {p.role === "innovator" ? "Innovator" : "Investor"}
                        </span>
                      </div>
                      <div className="col-status">{p.status}</div>
                      <div className="col-since">{p.since}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
