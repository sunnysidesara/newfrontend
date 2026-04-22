"use client";
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { AuthContext } from "./AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL;

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  sender?: { id: number; name: string; role: string };
  receiver?: { id: number; name: string; role: string };
}

export interface Conversation {
  id: number;
  user_one: number;
  user_two: number;
  last_message_at: string;
  user_one_data?: {
    id: number;
    name: string;
    role: string;
    avatar_url?: string;
  };
  user_two_data?: {
    id: number;
    name: string;
    role: string;
    avatar_url?: string;
  };
  messages?: Message[];
  last_message?: Message;
}

interface MessageContextType {
  conversations: Conversation[];
  messages: Message[];
  loading: boolean;
  unreadCount: number;
  fetchConversations: () => Promise<void>;
  fetchMessages: (userId: number) => Promise<void>;
  sendMessage: (userId: number, message: string) => Promise<void>;
  searchUsers: (query: string) => Promise<any[]>;
  markAsRead: (messageId: number) => Promise<void>;
  deleteConversation: (conversationId: number) => Promise<void>;
}

export const MessageContext = createContext<MessageContextType>(
  {} as MessageContextType,
);

export function MessageProvider({ children }: { children: ReactNode }) {
  const { token, user } = useContext(AuthContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchConversations = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const convs = data.conversations || [];
      setConversations(convs);

      const unread = convs.reduce((count: number, conv: any) => {
        const unreadMessages = (conv.messages || []).filter(
          (msg: any) => msg.receiver_id === user?.id && !msg.is_read,
        ).length;
        return count + unreadMessages;
      }, 0);
      setUnreadCount(unread);
    } catch (error) {
      setConversations([]);
    }
    setLoading(false);
  };

  const fetchMessages = async (userId: number) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/conversations/${userId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      setMessages([]);
    }
    setLoading(false);
  };

  const sendMessage = async (userId: number, message: string) => {
    if (!token) return;
    const res = await fetch(`${API}/conversations/${userId}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessages((prev) => [...prev, data.message]);
      await fetchConversations();
    }
  };

  const searchUsers = async (query: string) => {
    if (!token || query.length < 1) return [];
    try {
      const res = await fetch(
        `${API}/users/search?query=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      return data.users || [];
    } catch (error) {
      return [];
    }
  };

  const markAsRead = async (messageId: number) => {
    if (!token) return;
    await fetch(`${API}/messages/${messageId}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchConversations();
  };

  const deleteConversation = async (conversationId: number) => {
    if (!token) return;
    await fetch(`${API}/conversations/${conversationId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchConversations();
    setMessages([]);
  };

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchConversations();
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <MessageContext.Provider
      value={{
        conversations,
        messages,
        loading,
        unreadCount,
        fetchConversations,
        fetchMessages,
        sendMessage,
        searchUsers,
        markAsRead,
        deleteConversation,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}
