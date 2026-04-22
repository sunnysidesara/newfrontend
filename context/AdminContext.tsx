"use client";
import { createContext, useState, useContext, ReactNode } from "react";
import { AuthContext } from "./AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL;

interface DashboardData {
  total_users: number;
  total_posts: number;
  total_comments: number;
  total_messages: number;
  posts_by_status: {
    sharing_idea: number;
    open_to_collaborate: number;
    seeking_investment: number;
  };
  top_contributors: any[];
  recent_posts: any[];
  recent_users: any[];
}

interface AdminContextType {
  dashboardData: DashboardData | null;
  loading: boolean;
  fetchDashboard: () => Promise<void>;
  fetchUsers: () => Promise<any[]>;
  fetchAllPosts: () => Promise<any[]>;
  createUser: (data: any) => Promise<void>;
  updateUserRole: (
    userId: number,
    role: string,
    isAdmin: boolean,
  ) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  deletePost: (postId: number) => Promise<void>;
}

export const AdminContext = createContext<AdminContextType>(
  {} as AdminContextType,
);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { token } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    const res = await fetch(`${API}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.users;
  };

  const fetchAllPosts = async () => {
    const res = await fetch(`${API}/admin/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.posts;
  };

  const createUser = async (userData: any) => {
    const res = await fetch(`${API}/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw new Error("Failed to create user");
  };

  const updateUserRole = async (
    userId: number,
    role: string,
    isAdmin: boolean,
  ) => {
    const res = await fetch(`${API}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role, is_admin: isAdmin }),
    });
    if (!res.ok) throw new Error("Failed to update user role");
  };

  const deleteUser = async (userId: number) => {
    const res = await fetch(`${API}/admin/users/${userId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete user");
  };

  const deletePost = async (postId: number) => {
    const res = await fetch(`${API}/admin/posts/${postId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete post");
  };

  return (
    <AdminContext.Provider
      value={{
        dashboardData,
        loading,
        fetchDashboard,
        fetchUsers,
        fetchAllPosts,
        createUser,
        updateUserRole,
        deleteUser,
        deletePost,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
