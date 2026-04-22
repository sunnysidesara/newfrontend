"use client";
import { useContext, useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { MessageContext } from "@/context/MessageContext";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Home,
  MessageSquare,
  Settings,
  User,
  Search,
  X,
  Send,
  PlusCircle,
  Users,
  Lightbulb,
  Briefcase,
  MailOpen,
  Trash2,
} from "lucide-react";
import "./messages.css";

function AppNav() {
  const { user } = useContext(AuthContext);
  const { unreadCount } = useContext(MessageContext);
  const router = useRouter();
  return (
    <header className="messages-nav">
      <div className="messages-nav-inner">
        <Link href="/feed" className="messages-brand">
          VENTURA
        </Link>
        <div className="messages-nav-links">
          <Link href="/feed" className="messages-nav-link">
            <Home size={18} />
            <span>Feed</span>
          </Link>
          <Link href="/messages" className="messages-nav-link active">
            <MessageSquare size={18} />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="nav-unread-badge">{unreadCount}</span>
            )}
          </Link>
          <Link href="/settings" className="messages-nav-link">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </div>
        <div className="messages-nav-right">
          <div
            className="messages-avatar-btn"
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

type CategoryType = "all" | "unread" | "innovator" | "investor";

interface Category {
  id: CategoryType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const categories: Category[] = [
  {
    id: "all",
    label: "All Conversations",
    icon: <Users size={18} />,
    description: "All your messages",
  },
  {
    id: "unread",
    label: "Unread",
    icon: <MailOpen size={18} />,
    description: "Messages you haven't seen",
  },
  {
    id: "innovator",
    label: "Innovators",
    icon: <Lightbulb size={18} />,
    description: "Chats with innovators",
  },
  {
    id: "investor",
    label: "Investors",
    icon: <Briefcase size={18} />,
    description: "Chats with investors",
  },
];

// Main component wrapped in Suspense for useSearchParams
function MessagesPageContent() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    conversations,
    messages,
    loading,
    fetchConversations,
    fetchMessages,
    sendMessage,
    searchUsers,
    deleteConversation,
  } = useContext(MessageContext);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check URL parameters for preselected user from post message button
  useEffect(() => {
    const userId = searchParams.get("userId");
    const userName = searchParams.get("userName");
    const userRole = searchParams.get("userRole");

    if (userId && userName && !selectedUser) {
      setSelectedUser({
        id: parseInt(userId),
        name: decodeURIComponent(userName),
        role: userRole,
      });
      // Remove query params from URL without refreshing
      router.replace("/messages", { shallow: true });
    }
  }, [searchParams, selectedUser, router]);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !selectedUser) return;
    setSending(true);
    await sendMessage(selectedUser.id, inputMessage);
    setInputMessage("");
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSearch = async () => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const results = await searchUsers(searchQuery);
    setSearchResults(results);
    setSearching(false);
  };

  const startNewChat = (otherUser: any) => {
    setSelectedUser(otherUser);
    setShowNewChat(false);
    setSearchQuery("");
    setSearchResults([]);
    setTimeout(() => fetchConversations(), 500);
  };

  const handleDeleteConversation = async (convId: number) => {
    await deleteConversation(convId);
    setShowDeleteConfirm(null);
    if (selectedUser) {
      const conversationExists = conversations.some((c) => c.id === convId);
      if (!conversationExists) {
        setSelectedUser(null);
      }
    }
  };

  const getConversationPartner = (conv: any) => {
    return conv.user_one?.id === user?.id ? conv.user_two : conv.user_one;
  };

  const getPartnerRole = (conv: any) => {
    const partner = getConversationPartner(conv);
    return partner?.role;
  };

  const getUnreadCount = (conv: any) => {
    return (conv.messages || []).filter(
      (msg: any) => msg.receiver_id === user?.id && !msg.is_read,
    ).length;
  };

  const hasUnreadMessages = (conv: any) => {
    return getUnreadCount(conv) > 0;
  };

  const filteredConversations = conversations.filter((conv) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "unread") return hasUnreadMessages(conv);
    const partnerRole = getPartnerRole(conv);
    return partnerRole === selectedCategory;
  });

  const getCategoryUnreadCount = (categoryId: CategoryType) => {
    if (categoryId === "all") {
      return conversations.reduce(
        (count, conv) => count + getUnreadCount(conv),
        0,
      );
    }
    if (categoryId === "unread") {
      return conversations
        .filter((conv) => hasUnreadMessages(conv))
        .reduce((count, conv) => count + getUnreadCount(conv), 0);
    }
    return conversations
      .filter((conv) => getPartnerRole(conv) === categoryId)
      .reduce((count, conv) => count + getUnreadCount(conv), 0);
  };

  if (!user) return null;

  return (
    <div className="messages-page">
      <AppNav />
      <div className="messages-layout-three-col">
        {/* COLUMN 1: Categories */}
        <div className="categories-column">
          <div className="categories-header">
            <h3>Filters</h3>
          </div>
          <div className="categories-list">
            {categories.map((cat) => {
              const unreadCount = getCategoryUnreadCount(cat.id);
              return (
                <button
                  key={cat.id}
                  className={`category-item ${selectedCategory === cat.id ? "active" : ""}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  <span className="category-icon">{cat.icon}</span>
                  <div className="category-info">
                    <span className="category-label">{cat.label}</span>
                    <span className="category-desc">{cat.description}</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="category-unread">{unreadCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* COLUMN 2: Conversations List */}
        <div className="conversations-column">
          <div className="conv-header">
            <h2>{categories.find((c) => c.id === selectedCategory)?.label}</h2>
            <span className="conv-count">
              {filteredConversations.length} conversations
            </span>
          </div>

          <div className="new-message-container">
            <button
              className="new-message-btn"
              onClick={() => setShowNewChat(true)}
            >
              <PlusCircle size={18} />
              <span>New Message</span>
            </button>
          </div>

          <div className="conv-list">
            {loading && filteredConversations.length === 0 ? (
              <div className="conv-loading">Loading conversations...</div>
            ) : filteredConversations.length === 0 ? (
              <div className="conv-empty">
                <p>No conversations</p>
                {selectedCategory === "unread" && (
                  <p className="conv-empty-hint">You're all caught up</p>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = getConversationPartner(conv);
                const unread = getUnreadCount(conv);
                const lastMessage = conv.messages?.[conv.messages.length - 1];
                return (
                  <div
                    key={conv.id}
                    className={`conv-item ${
                      selectedUser?.id === partner?.id ? "active" : ""
                    }`}
                  >
                    <div
                      className="conv-item-content"
                      onClick={() => setSelectedUser(partner)}
                    >
                      <div className="conv-avatar">
                        {partner?.name?.charAt(0)?.toUpperCase() || "U"}
                        {unread > 0 && (
                          <span className="conv-unread-badge">{unread}</span>
                        )}
                      </div>
                      <div className="conv-details">
                        <div className="conv-name">
                          {partner?.name}
                          {unread > 0 && <span className="conv-unread-dot" />}
                        </div>
                        <div className="conv-last-message">
                          {lastMessage?.sender_id === user.id ? "You: " : ""}
                          {lastMessage?.message?.substring(0, 40) ||
                            "Tap to start chatting"}
                        </div>
                      </div>
                      <div className="conv-meta">
                        <div className="conv-role-badge">
                          {partner?.role === "innovator"
                            ? "Innovator"
                            : "Investor"}
                        </div>
                        {lastMessage?.created_at && (
                          <div className="conv-time">
                            {new Date(
                              lastMessage.created_at,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      className="conv-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(conv.id);
                      }}
                      title="Delete conversation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: Chat Window */}
        {selectedUser ? (
          <div className="chat-column">
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="chat-avatar">
                  {selectedUser.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <div className="chat-name">{selectedUser.name}</div>
                  <div className="chat-role">
                    {selectedUser.role === "innovator"
                      ? "Innovator"
                      : "Investor"}
                  </div>
                </div>
              </div>
              <Link
                href={`/profile/${selectedUser.id}`}
                className="chat-view-profile"
              >
                <User size={16} /> Profile
              </Link>
            </div>

            <div className="chat-messages-area">
              {loading && messages.length === 0 ? (
                <div className="chat-loading">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="chat-empty-state">
                  <p>No messages yet</p>
                  <span>Send a message to start the conversation</span>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`chat-bubble ${isMine ? "mine" : "theirs"}`}
                    >
                      <div className="chat-bubble-text">{msg.message}</div>
                      <div className="chat-bubble-time">
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-wrapper">
              <textarea
                rows={1}
                placeholder={`Message ${selectedUser.name}...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              <button
                onClick={handleSend}
                disabled={sending || !inputMessage.trim()}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-column-empty">
            <p className="chat-empty-main-text">No conversation selected</p>
            <p className="chat-empty-sub-text">
              Select a conversation or start a new one
            </p>
            <button
              onClick={() => setShowNewChat(true)}
              className="empty-new-chat-btn"
            >
              <PlusCircle size={14} /> New Message
            </button>
          </div>
        )}
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
              <h3>Delete Conversation</h3>
              <button onClick={() => setShowDeleteConfirm(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this conversation?</p>
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
                onClick={() => handleDeleteConversation(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="modal-overlay" onClick={() => setShowNewChat(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Message</h3>
              <button onClick={() => setShowNewChat(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch();
                }}
                autoFocus
              />
            </div>
            <div className="modal-results">
              {searching ? (
                <div className="modal-loading">Searching...</div>
              ) : searchResults.length === 0 && searchQuery ? (
                <div className="modal-empty">No users found</div>
              ) : (
                searchResults.map((u) => (
                  <div
                    key={u.id}
                    className="modal-user"
                    onClick={() => startNewChat(u)}
                  >
                    <div className="modal-user-avatar">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="modal-user-info">
                      <div className="modal-user-name">{u.name}</div>
                      <div className="modal-user-role">
                        {u.role === "innovator" ? "Innovator" : "Investor"}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export wrapped component with Suspense
export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="messages-page">
          <div className="loading">Loading...</div>
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  );
}
