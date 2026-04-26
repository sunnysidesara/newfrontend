"use client";
import { AuthProvider } from "./AuthContext";
import { PostProvider } from "./PostContext";
import { MessageProvider } from "./MessageContext";
import { AdminProvider } from "./AdminContext";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PostProvider>
        <MessageProvider>
          <AdminProvider>{children}</AdminProvider>
        </MessageProvider>
      </PostProvider>
    </AuthProvider>
  );
}
