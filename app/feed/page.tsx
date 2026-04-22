"use client";
import { useContext, useEffect, useState } from "react";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  PlusCircle,
  X,
} from "lucide-react";
import PostCard from "@/components/PostCard";
import PostForm from "@/components/PostForm";
import { PostContext } from "@/context/PostContext";
import { AuthContext } from "@/context/AuthContext";
import Link from "next/link";
import styles from "./feed.module.css";

export default function FeedPage() {
  const { posts, loading, fetchPosts, createPost, updatePost, deletePost } =
    useContext(PostContext);
  const { user } = useContext(AuthContext);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");

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

  if (!user) return null;

  // Filter posts based on active filter
  const getFilteredPosts = () => {
    if (activeFilter === "all") return posts;
    return posts.filter((post) => post.status === activeFilter);
  };

  const filteredPosts = getFilteredPosts();

  // Get count for each filter
  const getFilterCount = (status: string | null) => {
    if (status === null) return posts.length;
    return posts.filter((post) => post.status === status).length;
  };

  const filters = [
    { id: "all", label: "All Posts", icon: "📰", count: getFilterCount(null) },
    {
      id: "sharing_idea",
      label: "Sharing Idea",
      icon: "💡",
      count: getFilterCount("sharing_idea"),
    },
    {
      id: "open_to_collaborate",
      label: "Open to Collaborate",
      icon: "🤝",
      count: getFilterCount("open_to_collaborate"),
    },
    {
      id: "seeking_investment",
      label: "Seeking Investment",
      icon: "💰",
      count: getFilterCount("seeking_investment"),
    },
  ];

  return (
    <div className={styles.app}>
      {/* TOP NAV */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/feed" className={styles.brand}>
            VENTURA
          </Link>
          <div className={styles.navLinks}>
            <Link href="/feed" className={`${styles.navLink} ${styles.active}`}>
              <Home size={18} />
              <span>Feed</span>
            </Link>
            <Link href="/messages" className={styles.navLink}>
              <MessageSquare size={18} />
              <span>Messages</span>
            </Link>
            <Link href="/settings" className={styles.navLink}>
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            {/* Admin Link - only visible to admin users */}
            {user.is_admin && (
              <Link href="/admin" className={styles.navLink}>
                <User size={18} />
                <span>Admin</span>
              </Link>
            )}
          </div>
          <div className={styles.navRight}>
            <Link href={`/profile/${user.id}`} className={styles.avatarBtn}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </Link>
          </div>
        </div>
      </header>

      {/* CENTER FEED */}
      <div className={styles.centerLayout}>
        <main className={styles.feedContainer}>
          {/* Create Post Card */}
          <div className={styles.createPostCard}>
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
              <div className={styles.createPostFormContainer}>
                <div className={styles.createPostFormHeader}>
                  <h4>Create Post</h4>
                  <button
                    className={styles.closeFormBtn}
                    onClick={handleCancelForm}
                  >
                    <X size={18} />
                  </button>
                </div>
                <PostForm onSubmit={handleCreate} onClose={handleCancelForm} />
              </div>
            )}
          </div>

          {/* Filter Tabs - Below Create Post */}
          <div className={styles.filterTabs}>
            {filters.map((filter) => (
              <button
                key={filter.id}
                className={`${styles.filterTab} ${
                  activeFilter === filter.id ? styles.filterTabActive : ""
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                <span className={styles.filterIcon}>{filter.icon}</span>
                <span className={styles.filterLabel}>{filter.label}</span>
                <span className={styles.filterCount}>{filter.count}</span>
              </button>
            ))}
          </div>

          {/* Mobile Create Post Button */}
          <button
            className={styles.mobileCreateBtn}
            onClick={() => setShowMobileModal(true)}
          >
            <PlusCircle size={18} /> Create Post
          </button>

          {/* Mobile Modal */}
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

          {/* Feed List */}
          {loading ? (
            <>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </>
          ) : filteredPosts.length === 0 ? (
            <div className={styles.emptyFeed}>
              <p>No posts found in this category.</p>
              <button onClick={() => setActiveFilter("all")}>
                View all posts
              </button>
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
        </main>
      </div>
    </div>
  );
}
