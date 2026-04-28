"use client";

import { useContext, useEffect, useState, useMemo } from "react";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  PlusCircle,
  X,
  Search,
  Users,
  TrendingUp,
  Mail,
  Bell,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import PostCard from "@/components/PostCard";
import PostForm from "@/components/PostForm";
import Loader from "@/components/Loader";
import { PostContext } from "@/context/PostContext";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import { PartnershipContext } from "@/context/PartnershipContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./feed.module.css";

export default function FeedPage() {
  const { posts, loading, fetchPosts, createPost, updatePost, deletePost } =
    useContext(PostContext);
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const { pendingRequests } = useContext(PartnershipContext);
  const router = useRouter();
  const [showPostForm, setShowPostForm] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const totalPendingRequests = pendingRequests.length;

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreate = async (data: {
    title: string;
    body: string;
    status: string;
  }) => {
    await createPost(data);
    setShowPostForm(false);
    setShowMobileModal(false);
  };

  const handleCancelForm = () => {
    setShowPostForm(false);
  };

  const handleUpdate = async (
    id: number,
    data: { title: string; body: string; status: string },
  ) => {
    await updatePost(id, data);
  };

  const handleDelete = async (id: number) => {
    await deletePost(id);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Get filtered posts
  const getFilteredPosts = () => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.user?.name?.toLowerCase().includes(q),
      );
    }

    if (activeFilter !== "all") {
      result = result.filter((post) => post.status === activeFilter);
    }

    if (roleFilter !== "all") {
      result = result.filter((post) => post.user?.role === roleFilter);
    }

    return result;
  };

  const filteredPosts = getFilteredPosts();

  // Get counts for filters
  const getFilterCount = (status: string | null) => {
    let base = posts;
    if (roleFilter !== "all") {
      base = base.filter((p) => p.user?.role === roleFilter);
    }
    if (status === null) return base.length;
    return base.filter((post) => post.status === status).length;
  };

  const getRoleCount = (role: string) => {
    let base = posts;
    if (activeFilter !== "all") {
      base = base.filter((p) => p.status === activeFilter);
    }
    if (role === "all") return base.length;
    return base.filter((post) => post.user?.role === role).length;
  };

  if (!user) return null;

  return (
    <div className={styles.app}>
      {/* BLACK SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <Link href="/feed" className="settings-logoLink">
            <img
              src="/newhite.png"
              alt="VENTURA"
              className="settings-logoImage"
            />
          </Link>
        </div>

        <nav className={styles.sidebarNav}>
          <Link href="/feed" className={`${styles.navItem} ${styles.active}`}>
            <Home size={18} />
            <span>Feed</span>
          </Link>
          <Link href="/partners" className={styles.navItem}>
            <Users size={18} />
            <span>Partners</span>
            {totalPendingRequests > 0 && (
              <span className={styles.navBadge}>{totalPendingRequests}</span>
            )}
          </Link>
          <Link href="/messages" className={styles.navItem}>
            <MessageSquare size={18} />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className={styles.navBadge}>{unreadCount}</span>
            )}
          </Link>
          <Link href="/trends" className={styles.navItem}>
            <TrendingUp size={18} />
            <span>Trends</span>
          </Link>
          <Link href="/settings" className={styles.navItem}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>
          {user.is_admin && (
            <Link href="/admin" className={styles.navItem}>
              <LayoutDashboard size={18} />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userRole}>
                {user.role === "innovator" ? "Innovator" : "Investor"}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* WHITE MAIN CONTENT */}
      <main className={styles.mainContent}>
        {/* Header with Search and Avatar on same line */}
        <div className={styles.headerRow}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search posts by title, content, or people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.searchClear}
                onClick={() => setSearchQuery("")}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className={styles.headerRight}>
            <Link href={`/profile/${user.id}`} className={styles.headerAvatar}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </Link>
          </div>
        </div>

        {/* Create Post Section */}
        <div className={styles.createPostSection}>
          {!showPostForm ? (
            <div className={styles.createPostHeader}>
              <div className={styles.createPostAvatar}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <button
                className={styles.createPostTrigger}
                onClick={() => setShowPostForm(true)}
              >
                What's on your mind, {user.name?.split(" ")[0]}?
              </button>
            </div>
          ) : (
            <div className={styles.createPostFormWrapper}>
              <div className={styles.createPostFormHeader}>
                <h4>Create Post</h4>
                <button
                  className={styles.cancelPostBtn}
                  onClick={handleCancelForm}
                >
                  Cancel
                </button>
              </div>
              <PostForm onSubmit={handleCreate} onClose={handleCancelForm} />
            </div>
          )}
        </div>

        {/* FILTERS */}
        <div className={styles.filtersRow}>
          {/* Filter by People */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>FILTER BY PEOPLE</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterBtn} ${roleFilter === "all" ? styles.active : ""}`}
                onClick={() => setRoleFilter("all")}
              >
                Everyone{" "}
                <span className={styles.filterCount}>
                  {getRoleCount("all")}
                </span>
              </button>
              <button
                className={`${styles.filterBtn} ${roleFilter === "innovator" ? styles.active : ""}`}
                onClick={() => setRoleFilter("innovator")}
              >
                Innovators{" "}
                <span className={styles.filterCount}>
                  {getRoleCount("innovator")}
                </span>
              </button>
              <button
                className={`${styles.filterBtn} ${roleFilter === "investor" ? styles.active : ""}`}
                onClick={() => setRoleFilter("investor")}
              >
                Investors{" "}
                <span className={styles.filterCount}>
                  {getRoleCount("investor")}
                </span>
              </button>
            </div>
          </div>

          {/* Filter by Post Type */}
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>FILTER BY POST TYPE</label>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterBtn} ${activeFilter === "all" ? styles.active : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Posts{" "}
                <span className={styles.filterCount}>
                  {getFilterCount(null)}
                </span>
              </button>
              <button
                className={`${styles.filterBtn} ${activeFilter === "sharing_idea" ? styles.active : ""}`}
                onClick={() => setActiveFilter("sharing_idea")}
              >
                Ideas{" "}
                <span className={styles.filterCount}>
                  {getFilterCount("sharing_idea")}
                </span>
              </button>
              <button
                className={`${styles.filterBtn} ${activeFilter === "open_to_collaborate" ? styles.active : ""}`}
                onClick={() => setActiveFilter("open_to_collaborate")}
              >
                Collab{" "}
                <span className={styles.filterCount}>
                  {getFilterCount("open_to_collaborate")}
                </span>
              </button>
              <button
                className={`${styles.filterBtn} ${activeFilter === "seeking_investment" ? styles.active : ""}`}
                onClick={() => setActiveFilter("seeking_investment")}
              >
                Invest{" "}
                <span className={styles.filterCount}>
                  {getFilterCount("seeking_investment")}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className={styles.postsContainer}>
          {loading ? (
            <>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </>
          ) : filteredPosts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No posts found</p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={styles.clearSearchBtn}
                >
                  Clear search
                </button>
              )}
              {!searchQuery &&
                activeFilter === "all" &&
                roleFilter === "all" && (
                  <button
                    onClick={() => setShowPostForm(true)}
                    className={styles.createFirstBtn}
                  >
                    Create your first post
                  </button>
                )}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={user.id}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>

      {/* Mobile Create Post Modal */}
      {showMobileModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowMobileModal(false)}
        >
          <div
            className={styles.modalContainer}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Create Post</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowMobileModal(false)}
              >
                ×
              </button>
            </div>
            <PostForm
              onSubmit={handleCreate}
              onClose={() => setShowMobileModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
