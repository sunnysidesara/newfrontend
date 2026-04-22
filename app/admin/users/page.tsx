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
  Edit,
  PlusCircle,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import "../admin.css";

function AdminNav() {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("users");

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
            <LayoutDashboard size={16} />
            Dashboard
          </Link>
          <Link href="/admin/users" className={`admin-nav-link active`}>
            <Users size={16} />
            Users
          </Link>
          <Link
            href="/admin/posts"
            className="admin-nav-link"
            onClick={() => setActiveTab("posts")}
          >
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

export default function AdminUsers() {
  const { user } = useContext(AuthContext);
  const { fetchUsers, deleteUser, updateUserRole } = useContext(AdminContext);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const [showRoleModal, setShowRoleModal] = useState<{
    id: number;
    role: string;
    isAdmin: boolean;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "innovator",
    is_admin: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && !user.is_admin) {
      router.push("/feed");
    }
    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("ventur_token")}`,
        },
        body: JSON.stringify(formData),
      });
      setShowCreateModal(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "innovator",
        is_admin: false,
      });
      loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    }
    setSubmitting(false);
  };

  const handleDeleteUser = async (id: number) => {
    await deleteUser(id);
    setShowDeleteConfirm(null);
    loadUsers();
  };

  const handleUpdateRole = async (
    id: number,
    role: string,
    isAdmin: boolean,
  ) => {
    await updateUserRole(id, role, isAdmin);
    setShowRoleModal(null);
    loadUsers();
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
            <h1 className="admin-title">User Management</h1>
            <button
              className="create-btn"
              onClick={() => setShowCreateModal(true)}
            >
              <PlusCircle size={18} /> Add New User
            </button>
          </div>

          <div className="admin-card">
            {loading ? (
              <div className="loading-spinner">Loading users...</div>
            ) : (
              <table className="admin-table full-width">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Admin</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        {u.is_admin ? (
                          <span className="admin-badge">Admin</span>
                        ) : (
                          <span className="user-badge">User</span>
                        )}
                      </td>
                      <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button
                          className="icon-btn edit"
                          onClick={() =>
                            setShowRoleModal({
                              id: u.id,
                              role: u.role,
                              isAdmin: u.is_admin,
                            })
                          }
                          title="Edit Role"
                        >
                          <Edit size={16} />
                        </button>
                        {u.id !== user.id && (
                          <button
                            className="icon-btn delete"
                            onClick={() => setShowDeleteConfirm(u.id)}
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Create New User</h3>
                <button onClick={() => setShowCreateModal(false)}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                  >
                    <option value="innovator">Innovator</option>
                    <option value="investor">Investor</option>
                  </select>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_admin}
                      onChange={(e) =>
                        setFormData({ ...formData, is_admin: e.target.checked })
                      }
                    />
                    Make this user an Admin
                  </label>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-create"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Role Modal */}
        {showRoleModal && (
          <div className="modal-overlay" onClick={() => setShowRoleModal(null)}>
            <div
              className="modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Update User Role</h3>
                <button onClick={() => setShowRoleModal(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <select
                  value={showRoleModal.role}
                  onChange={(e) =>
                    setShowRoleModal({ ...showRoleModal, role: e.target.value })
                  }
                >
                  <option value="innovator">Innovator</option>
                  <option value="investor">Investor</option>
                </select>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={showRoleModal.isAdmin}
                    onChange={(e) =>
                      setShowRoleModal({
                        ...showRoleModal,
                        isAdmin: e.target.checked,
                      })
                    }
                  />
                  Admin Privileges
                </label>
              </div>
              <div className="modal-footer">
                <button
                  className="modal-cancel"
                  onClick={() => setShowRoleModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="modal-create"
                  onClick={() =>
                    handleUpdateRole(
                      showRoleModal.id,
                      showRoleModal.role,
                      showRoleModal.isAdmin,
                    )
                  }
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        )}

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
                <h3>Delete User</h3>
                <button onClick={() => setShowDeleteConfirm(null)}>
                  <X size={18} />
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this user?</p>
                <p className="modal-warning">
                  This action cannot be undone. All their posts and comments
                  will be deleted.
                </p>
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
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
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
