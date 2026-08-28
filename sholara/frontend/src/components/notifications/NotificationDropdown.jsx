import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearReadNotifications,
} from "../../api/notification";
import C from "../../constants/colors";
import MI from "../MI";

const TYPE_CONFIG = {
  assignment: {
    icon: "assignment",
    color: "#2563eb",
    bg: "#eff6ff",
    label: "Assignment",
  },
  announcement: {
    icon: "campaign",
    color: "#d97706",
    bg: "#fffbeb",
    label: "Announcement",
  },
  message: {
    icon: "chat",
    color: "#7c3aed",
    bg: "#f5f3ff",
    label: "Message",
  },
  grade: {
    icon: "grade",
    color: "#059669",
    bg: "#ecfdf5",
    label: "Grade",
  },
  appointment: {
    icon: "event",
    color: "#0284c7",
    bg: "#f0f9ff",
    label: "Appointment",
  },
  skill_exchange: {
    icon: "handshake",
    color: "#4f46e5",
    bg: "#eef2ff",
    label: "Skill Session",
  },
  review: {
    icon: "star",
    color: "#ea580c",
    bg: "#fff7ed",
    label: "Review",
  },
  certificate: {
    icon: "workspace_premium",
    color: "#b45309",
    bg: "#fef3c7",
    label: "Certificate",
  },
  system: {
    icon: "info",
    color: "#4b5563",
    bg: "#f3f4f6",
    label: "System",
  },
};

const TABS = [
  { key: "all", label: "All" },
  { key: "assignment", label: "Assignments" },
  { key: "announcement", label: "Announcements" },
  { key: "message", label: "Messages" },
  { key: "grade", label: "Grades" },
  { key: "appointment", label: "Appointments" },
];

export default function NotificationDropdown({ isOpen, onClose }) {
  const [, navigate] = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const dropdownRef = useRef(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const params = {};
      if (activeTab !== "all") params.type = activeTab;
      const data = await getNotifications(params);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchList();
    }
  }, [isOpen, activeTab]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsRead(notif._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Mark read error:", err);
      }
    }
    onClose();
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed mark all read:", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error("Delete notif error:", err);
    }
  };

  const handleClearRead = async () => {
    try {
      await clearReadNotifications();
      setNotifications((prev) => prev.filter((n) => !n.isRead));
    } catch (err) {
      console.error("Clear read error:", err);
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-14 w-96 max-w-[92vw] rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
      style={{
        background: C.surfaceContainerLowest,
        border: `1px solid ${C.outlineVariant}`,
      }}
    >
      {/* Header */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: C.outlineVariant, background: C.surfaceContainerLow }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-base" style={{ color: C.onSurface }}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: C.primary, color: C.onPrimary }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-semibold hover:underline"
              style={{ color: C.primary }}
              title="Mark all as read"
            >
              Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#e2e7ff] text-[#43474e]"
          >
            <MI name="close" size={18} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className="flex overflow-x-auto gap-1 p-2 border-b no-scrollbar"
        style={{ borderColor: C.outlineVariant, background: C.surfaceContainerLowest }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeTab === tab.key
                ? "bg-[#002045] text-white shadow-sm"
                : "text-[#43474e] hover:bg-[#eaedff]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-xl animate-pulse"
                style={{ background: C.surfaceContainerHigh }}
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center px-4">
            <div
              className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
              style={{ background: C.surfaceContainer }}
            >
              <MI name="notifications_off" size={24} color={C.outline} />
            </div>
            <p className="font-semibold text-sm" style={{ color: C.onSurface }}>
              No notifications yet
            </p>
            <p className="text-xs mt-1" style={{ color: C.onSurfaceVariant }}>
              We will notify you when there are assignments, announcements, grades, or messages.
            </p>
          </div>
        ) : (
          notifications.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
            return (
              <div
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-[#f2f3ff] relative group ${
                  !notif.isRead ? "bg-[#f8faff]" : ""
                }`}
              >
                {/* Type Icon */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: config.bg, color: config.color }}
                >
                  <MI name={config.icon} size={20} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className="text-xs font-bold truncate"
                      style={{ color: notif.isRead ? C.onSurfaceVariant : C.onSurface }}
                    >
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>

                  <p
                    className="text-xs line-clamp-2 leading-relaxed"
                    style={{ color: notif.isRead ? C.outline : C.onSurfaceVariant }}
                  >
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-1.5">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded"
                      style={{ background: config.bg, color: config.color }}
                    >
                      {config.label}
                    </span>

                    <button
                      onClick={(e) => handleDelete(e, notif._id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded transition"
                      title="Delete"
                    >
                      <MI name="delete" size={14} />
                    </button>
                  </div>
                </div>

                {/* Unread indicator dot */}
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 self-center" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      {notifications.some((n) => n.isRead) && (
        <div
          className="p-2.5 border-t text-center"
          style={{ borderColor: C.outlineVariant, background: C.surfaceContainerLow }}
        >
          <button
            onClick={handleClearRead}
            className="text-xs text-[#43474e] hover:text-[#002045] font-semibold"
          >
            Clear read notifications
          </button>
        </div>
      )}
    </div>
  );
}
