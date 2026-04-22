"use client";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { AdminContext } from "@/context/AdminContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
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
} from "lucide-react";
import "../admin.css";

function AdminNav() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

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
          <Link href="/admin" className="admin-nav-link">
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link href="/admin/users" className="admin-nav-link">
            <Users size={16} />
            Users
          </Link>
          <Link href="/admin/posts" className="admin-nav-link active">
            <FileText size={16} />
            Posts
          </Link>
          <Link href="/feed" className="admin-nav-link">
            <Home size={16} />
            Back to Feed
          </Link>
        </div>
        <div className="admin-nav-right">
          <div className="admin-user-info">
            <span className="admin-user-name">{user?.name}</span>
            <span className={`admin-user-role ${user?.role}`}>
              {user?.role}
            </span>
          </div>
          <button onClick={handleLogout} className="admin-logout-btn">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default function AdminPosts() {
  const { user } = useContext(AuthContext);
  const { fetchAllPosts, deletePost } = useContext(AdminContext);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (user && !user.is_admin) {
      router.push("/feed");
    }
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    setLoading(true);
    const data = await fetchAllPosts();
    setPosts(data);
    setLoading(false);
  };

  const handleDeletePost = async (id: number) => {
    await deletePost(id);
    setShowDeleteConfirm(null);
    loadPosts();
  };

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
            <h1 className="admin-title">Post Management</h1>
            <span className="post-count">{posts.length} total posts</span>
          </div>

          <div className="admin-card">
            {loading ? (
              <div className="loading-spinner">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="empty-state">No posts yet</div>
            ) : (
              <div className="posts-list-admin">
                {posts.map((post) => (
                  <div key={post.id} className="admin-post-item">
                    <div className="admin-post-header">
                      <div className="admin-post-user">
                        <div className="admin-post-avatar">
                          {post.user?.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="admin-post-name">
                            {post.user?.name}
                          </div>
                          <div className="admin-post-email">
                            {post.user?.email}
                          </div>
                        </div>
                      </div>
                      <span className={`status-badge ${post.status}`}>
                        {post.status?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="admin-post-content">
                      <h3 className="admin-post-title">{post.title}</h3>
                      <p className="admin-post-body">{post.body}</p>
                    </div>
                    <div className="admin-post-footer">
                      <span className="admin-post-date">
                        {new Date(post.created_at).toLocaleDateString()} at{" "}
                        {new Date(post.created_at).toLocaleTimeString()}
                      </span>
                      <button
                        className="admin-delete-post"
                        onClick={() => setShowDeleteConfirm(post.id)}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div
            className="modal-overlay"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <div
              className="modal-container delete-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Delete Post</h3>
                <button onClick={() => setShowDeleteConfirm(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this post?</p>
                <p className="modal-warning">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-cancel"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="modal-delete"
                  onClick={() => handleDeletePost(showDeleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
