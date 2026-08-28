import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/AuthContext";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import {
  getConversations,
  getMessageHistory,
  sendMessage,
  searchUsers,
} from "../api/directMessage";
import C from "../constants/colors";
import MI from "../components/MI";

const DUMMY_AVATAR =
  "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg";

export default function DirectMessages() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const profile = {
    fullName: user?.fullName,
    firstName: user?.fullName?.split(" ")[0],
    profilePicture: user?.profilePicture,
    department: user?.department,
    role: user?.role,
  };

  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch conversations list
  const fetchConversationsList = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data || []);
      return data;
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      return [];
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  // Fetch messages with selected partner
  const fetchMessages = useCallback(async (partnerId) => {
    if (!partnerId) return;
    try {
      const data = await getMessageHistory(partnerId);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load message history:", err);
    }
  }, []);

  // Initial load & URL param check (?user=...)
  useEffect(() => {
    const init = async () => {
      const convs = await fetchConversationsList();

      const urlParams = new URLSearchParams(window.location.search);
      const targetUserId = urlParams.get("user");

      if (targetUserId) {
        // Find existing or search target user
        const existing = convs.find((c) => c.partner?._id === targetUserId);
        if (existing) {
          setSelectedPartner(existing.partner);
        } else {
          try {
            const users = await searchUsers("");
            const target = users.find((u) => u._id === targetUserId);
            if (target) {
              setSelectedPartner(target);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else if (convs.length > 0 && !selectedPartner) {
        setSelectedPartner(convs[0].partner);
      }
    };
    init();
  }, [fetchConversationsList]);

  // Load message history when partner changes
  useEffect(() => {
    if (selectedPartner?._id) {
      setLoadingMessages(true);
      fetchMessages(selectedPartner._id).finally(() => {
        setLoadingMessages(false);
        setTimeout(scrollToBottom, 100);
      });
    }
  }, [selectedPartner, fetchMessages]);

  // Periodic polling for active chat & conversations
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversationsList();
      if (selectedPartner?._id) {
        fetchMessages(selectedPartner._id);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchConversationsList, fetchMessages, selectedPartner]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Search users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery.trim());
        setSearchResults(results || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedPartner?._id || sending) return;

    const content = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const newMsg = await sendMessage({
        recipientId: selectedPartner._id,
        content,
      });
      setMessages((prev) => [...prev, newMsg]);
      fetchConversationsList();
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    setSearchQuery("");
    setSearchResults([]);
  };

  const formatMsgTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <DashboardLayout profile={profile}>
      <main
        className="h-[calc(100vh-4rem)] flex flex-col p-4 md:p-8"
        style={{ background: C.background }}
      >
        <div
          className="flex-1 rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row border"
          style={{
            background: C.surfaceContainerLowest,
            borderColor: C.outlineVariant,
          }}
        >
          {/* Left Panel: Conversation Threads & User Search */}
          <div
            className="w-full md:w-80 lg:w-96 border-r flex flex-col h-full flex-shrink-0"
            style={{
              borderColor: C.outlineVariant,
              background: C.surfaceContainerLow,
            }}
          >
            {/* Search Bar Header */}
            <div className="p-4 border-b space-y-3" style={{ borderColor: C.outlineVariant }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: C.onSurface }}>
                  Direct Messages
                </h2>
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: C.primary, color: C.onPrimary }}
                >
                  {conversations.length} Active
                </span>
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find student, mentor, or peer..."
                  className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-xs border focus:ring-2 focus:ring-[#002045] outline-none transition"
                  style={{ borderColor: C.outlineVariant }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <MI name="close" size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Conversation List / Search Results */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {searchQuery.trim() ? (
                // Search Results
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider px-4 py-2 text-gray-400">
                    Search Results
                  </p>
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-gray-400">
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-500">
                      No matching scholars found.
                    </div>
                  ) : (
                    searchResults.map((usr) => (
                      <button
                        key={usr._id}
                        onClick={() => handleSelectPartner(usr)}
                        className={`w-full p-3.5 flex items-center gap-3 text-left transition hover:bg-white ${
                          selectedPartner?._id === usr._id ? "bg-white border-l-4 border-[#002045]" : ""
                        }`}
                      >
                        <img
                          src={usr.profilePicture || DUMMY_AVATAR}
                          alt={usr.fullName}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-blue-100 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs truncate" style={{ color: C.onSurface }}>
                            {usr.fullName}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            {usr.department || usr.role || "Member"}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-gray-400 text-sm">
                          chat
                        </span>
                      </button>
                    ))
                  )}
                </div>
              ) : loadingConvs ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-2xl animate-pulse"
                      style={{ background: C.surfaceContainerHigh }}
                    />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ background: C.surfaceContainer }}
                  >
                    <MI name="forum" size={24} color={C.outline} />
                  </div>
                  <p className="font-bold text-sm" style={{ color: C.onSurface }}>
                    No conversations yet
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Search for a peer above or message a mentor from Skill Exchange.
                  </p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const partner = conv.partner;
                  const isSelected = selectedPartner?._id === partner?._id;
                  const unread = conv.unreadCount || 0;

                  return (
                    <button
                      key={partner?._id}
                      onClick={() => handleSelectPartner(partner)}
                      className={`w-full p-4 flex items-center gap-3 text-left transition relative ${
                        isSelected
                          ? "bg-white shadow-sm border-l-4 border-[#002045]"
                          : "hover:bg-[#faf8ff]"
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={partner?.profilePicture || DUMMY_AVATAR}
                          alt={partner?.fullName}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p
                            className={`text-xs truncate ${
                              unread > 0 ? "font-black text-[#002045]" : "font-bold"
                            }`}
                            style={{ color: C.onSurface }}
                          >
                            {partner?.fullName}
                          </p>
                          {conv.lastMessage?.createdAt && (
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">
                              {formatMsgTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-xs truncate ${
                              unread > 0
                                ? "font-bold text-gray-900"
                                : "text-gray-500"
                            }`}
                          >
                            {conv.lastMessage?.content || "Started a conversation"}
                          </p>

                          {unread > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#ba1a1a] text-white flex-shrink-0">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat Room */}
          <div className="flex-1 flex flex-col h-full bg-white">
            {selectedPartner ? (
              <>
                {/* Chat Partner Header */}
                <div
                  className="p-4 border-b flex items-center justify-between bg-white"
                  style={{ borderColor: C.outlineVariant }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={selectedPartner.profilePicture || DUMMY_AVATAR}
                        alt={selectedPartner.fullName}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-200"
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                    </div>

                    <div>
                      <h3 className="font-bold text-sm" style={{ color: C.onSurface }}>
                        {selectedPartner.fullName}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        {selectedPartner.department || selectedPartner.role || "Scholar Member"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate("/skill-exchange")}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 hover:bg-gray-50 transition"
                      style={{ borderColor: C.outlineVariant, color: C.primary }}
                    >
                      <MI name="handshake" size={16} />
                      <span className="hidden sm:inline">Exchange Skills</span>
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div
                  className="flex-1 p-6 overflow-y-auto space-y-4"
                  style={{ background: "#faf8ff" }}
                >
                  {loadingMessages ? (
                    <div className="py-20 text-center text-xs text-gray-400">
                      <MI name="sync" size={28} className="animate-spin text-blue-600 mx-auto mb-2" />
                      Loading chat messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                        <MI name="chat_bubble" size={32} />
                      </div>
                      <p className="font-bold text-sm" style={{ color: C.onSurface }}>
                        Direct message with {selectedPartner.fullName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        Say hello and start discussing assignments, skill sharing, or scheduling sessions!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender?._id === user?._id || msg.sender === user?._id;

                      return (
                        <div
                          key={msg._id}
                          className={`flex items-end gap-2 ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isMe && (
                            <img
                              src={selectedPartner.profilePicture || DUMMY_AVATAR}
                              alt={selectedPartner.fullName}
                              className="w-7 h-7 rounded-full object-cover mb-1 flex-shrink-0"
                            />
                          )}

                          <div
                            className={`max-w-[75%] md:max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                              isMe
                                ? "bg-[#002045] text-white rounded-br-none"
                                : "bg-white text-gray-900 border rounded-bl-none"
                            }`}
                            style={!isMe ? { borderColor: C.outlineVariant } : {}}
                          >
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>

                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                                isMe ? "text-blue-200" : "text-gray-400"
                              }`}
                            >
                              <span>{formatMsgTime(msg.createdAt)}</span>
                              {isMe && (
                                <MI
                                  name={msg.isRead ? "done_all" : "done"}
                                  size={13}
                                  className={msg.isRead ? "text-cyan-300" : "text-blue-300"}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-4 border-t bg-white flex items-center gap-3"
                  style={{ borderColor: C.outlineVariant }}
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Message ${selectedPartner.fullName}...`}
                    className="flex-1 px-4 py-3 bg-[#f1f5f9] rounded-2xl text-xs outline-none focus:ring-2 focus:ring-[#002045] transition"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="p-3 rounded-2xl bg-[#002045] text-white hover:bg-[#1a365d] transition shadow-md disabled:opacity-40 flex items-center justify-center"
                  >
                    <MI name="send" size={18} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: C.surfaceContainer, color: C.primary }}
                >
                  <MI name="forum" size={32} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: C.onSurface }}>
                  Select a Conversation
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  Choose an existing thread on the left or search for a classmate, mentor, or TA to start chatting.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}
