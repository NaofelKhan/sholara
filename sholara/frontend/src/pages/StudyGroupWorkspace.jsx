import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getStudyGroupById,
  deleteStudyGroup,
  removeMemberFromGroup,
  getGroupMessages,
  sendGroupMessage,
  getGroupResources,
  createGroupResource,
  deleteGroupResource,
  getGroupSessions,
  createGroupSession,
  toggleSessionRSVP,
} from "../api/studyGroup";
import { useToast } from "@/hooks/use-toast";

export default function StudyGroupWorkspace() {
  const [, params] = useRoute("/study-groups/:id");
  const groupId = params?.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");

  // Tab Data States
  const [messages, setMessages] = useState([]);
  const [resources, setResources] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);

  // Message Form
  const [messageInput, setMessageInput] = useState("");
  const chatBottomRef = useRef(null);

  // Resource Form
  const [showAddResource, setShowAddResource] = useState(false);
  const [resourceForm, setResourceForm] = useState({ title: "", description: "", fileUrl: "", fileType: "link" });

  // Session Form
  const [showScheduleSession, setShowScheduleSession] = useState(false);
  const [sessionForm, setSessionForm] = useState({ title: "", description: "", scheduledAt: "", locationOrLink: "Library Room 3B" });

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      const data = await getStudyGroupById(groupId);
      setGroup(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load study group",
        variant: "destructive",
      });
      setLocation("/study-groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  // Load Tab Content dynamically
  useEffect(() => {
    if (!groupId) return;

    const loadTabData = async () => {
      setTabLoading(true);
      try {
        if (activeTab === "chat") {
          const res = await getGroupMessages(groupId);
          setMessages(res);
        } else if (activeTab === "resources") {
          const res = await getGroupResources(groupId);
          setResources(res);
        } else if (activeTab === "sessions") {
          const res = await getGroupSessions(groupId);
          setSessions(res);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: err.response?.data?.message || `Failed to load ${activeTab}`,
          variant: "destructive",
        });
      } finally {
        setTabLoading(false);
      }
    };

    loadTabData();
  }, [activeTab, groupId]);

  useEffect(() => {
    if (activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  if (loading || !group) {
    return (
      <DashboardLayout profile={user}>
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002045]"></div>
        </div>
      </DashboardLayout>
    );
  }

  const isCreator =
    group.creator?._id === user?._id || group.creator === user?._id;

  const copyJoinCode = () => {
    navigator.clipboard.writeText(group.joinCode);
    toast({ title: "Copied!", description: `Group Code '${group.joinCode}' copied to clipboard.` });
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("Are you sure you want to delete this study group?")) return;
    try {
      await deleteStudyGroup(groupId);
      toast({ title: "Group Deleted", description: "Study group workspace deleted." });
      setLocation("/study-groups");
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete group", variant: "destructive" });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const newMsg = await sendGroupMessage(groupId, messageInput.trim());
      setMessages([...messages, newMsg]);
      setMessageInput("");
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to send message", variant: "destructive" });
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const res = await createGroupResource(groupId, resourceForm);
      setResources([res, ...resources]);
      setShowAddResource(false);
      setResourceForm({ title: "", description: "", fileUrl: "", fileType: "link" });
      toast({ title: "Resource Added", description: `Added '${res.title}'` });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to add resource", variant: "destructive" });
    }
  };

  const handleDeleteRes = async (resId) => {
    try {
      await deleteGroupResource(groupId, resId);
      setResources(resources.filter((r) => r._id !== resId));
      toast({ title: "Deleted", description: "Resource removed." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete resource", variant: "destructive" });
    }
  };

  const handleScheduleSession = async (e) => {
    e.preventDefault();
    try {
      const res = await createGroupSession(groupId, sessionForm);
      setSessions([...sessions, res]);
      setShowScheduleSession(false);
      setSessionForm({ title: "", description: "", scheduledAt: "", locationOrLink: "Library Room 3B" });
      toast({ title: "Session Scheduled", description: `Scheduled '${res.title}'` });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to schedule session", variant: "destructive" });
    }
  };

  const handleRSVP = async (sessionId) => {
    try {
      const updated = await toggleSessionRSVP(groupId, sessionId);
      setSessions(sessions.map((s) => (s._id === sessionId ? updated : s)));
      toast({ title: "RSVP Updated", description: "Session attendance status updated." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update RSVP", variant: "destructive" });
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove member from study group?")) return;
    try {
      await removeMemberFromGroup(groupId, memberId);
      setGroup({
        ...group,
        members: group.members.filter((m) => m._id !== memberId),
      });
      toast({ title: "Member Removed", description: "Member removed from group." });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to remove member", variant: "destructive" });
    }
  };

  const tabs = [
    { id: "chat", label: "Group Chat & Discussions", icon: "chat" },
    { id: "resources", label: "Shared Resources", icon: "folder_shared" },
    { id: "sessions", label: "Study Sessions", icon: "event" },
    { id: "members", label: "Group Members", icon: "group" },
  ];

  return (
    <DashboardLayout profile={user}>
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Workspace Banner */}
        <div className={`bg-gradient-to-r ${group.coverGradient || "from-[#002045] to-[#003730]"} rounded-2xl p-8 text-white shadow-lg relative overflow-hidden space-y-4`}>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#62fae3] text-[#003730] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                  {group.subject}
                </span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full border border-white/20">
                  {group.members?.length || 0} / {group.maxMembers} Members
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight pt-1">{group.title}</h1>
              <p className="text-blue-100 text-sm max-w-2xl">{group.description || "Peer study group for collaborative problem solving."}</p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
              <div className="text-right text-xs">
                <p className="text-blue-200 uppercase font-semibold text-[10px]">Group Join Code</p>
                <p className="font-mono text-base font-bold tracking-widest text-[#62fae3]">{group.joinCode}</p>
              </div>
              <button
                onClick={copyJoinCode}
                title="Copy Join Code"
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center pt-4 border-t border-white/10 text-xs text-blue-100 gap-4">
            <div className="flex items-center gap-4">
              <span>
                Group Lead: <strong className="text-white">{group.creator?.fullName}</strong>
              </span>
              <span>•</span>
              <span>
                Location: <strong className="text-white">{group.meetingLocation}</strong>
              </span>
            </div>

            {isCreator && (
              <button
                onClick={handleDeleteGroup}
                className="text-red-300 hover:text-red-100 text-xs font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete Study Group
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-[#dae2fd] p-1.5 flex overflow-x-auto gap-1 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-[#002045] text-white shadow-sm"
                    : "text-[#43474e] hover:bg-[#faf8ff] hover:text-[#002045]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        {tabLoading ? (
          <div className="flex justify-center items-center py-20 bg-white rounded-2xl border border-[#dae2fd]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#002045]"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 1. CHAT / DISCUSSIONS TAB */}
            {activeTab === "chat" && (
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-4 flex flex-col h-[550px]">
                <div className="border-b border-[#dae2fd] pb-3">
                  <h3 className="text-lg font-bold text-[#002045] flex items-center gap-2">
                    <span className="material-symbols-outlined">forum</span>
                    Group Discussion Channel
                  </h3>
                  <p className="text-xs text-[#74777f]">Post questions, discuss topics, and chat in real-time with group members.</p>
                </div>

                {/* Message Feed */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {messages.length === 0 ? (
                    <div className="text-center py-16 text-[#74777f] space-y-2">
                      <span className="material-symbols-outlined text-4xl text-[#002045]/40">chat_bubble_outline</span>
                      <p className="text-sm font-semibold">No messages yet. Send a message to start the study discussion!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender?._id === user?._id;

                      return (
                        <div
                          key={msg._id}
                          className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}
                        >
                          <img
                            src={msg.sender?.profilePicture || "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"}
                            alt="sender"
                            className="w-8 h-8 rounded-full object-cover shrink-0 ring-2 ring-[#dae2fd]"
                          />
                          <div className={`max-w-md space-y-1 ${isMe ? "items-end text-right" : ""}`}>
                            <div className="flex items-center gap-2 text-[11px] text-[#74777f]">
                              <span className="font-bold text-[#131b2e]">{msg.sender?.fullName}</span>
                              <span>•</span>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isMe
                                  ? "bg-[#002045] text-white rounded-tr-none"
                                  : "bg-[#faf8ff] text-[#131b2e] border border-[#dae2fd] rounded-tl-none"
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-[#dae2fd] pt-3">
                  <input
                    type="text"
                    placeholder="Type a message or question..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-[#faf8ff] border border-[#c4c6cf] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#002045]"
                  />
                  <button
                    type="submit"
                    className="bg-[#002045] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1a365d] transition flex items-center gap-1"
                  >
                    Send
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </form>
              </div>
            )}

            {/* 2. SHARED RESOURCES TAB */}
            {activeTab === "resources" && (
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-[#002045]">Shared Resources & Notes</h3>
                    <p className="text-xs text-[#74777f]">Access study guides, drive links, PDFs, and notes shared by members.</p>
                  </div>

                  <button
                    onClick={() => setShowAddResource(true)}
                    className="bg-[#002045] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#1a365d] transition"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_link</span>
                    Share Resource
                  </button>
                </div>

                {resources.length === 0 ? (
                  <div className="text-center py-12 text-[#74777f] space-y-2">
                    <span className="material-symbols-outlined text-4xl text-[#002045]/40">folder_shared</span>
                    <p className="text-sm font-semibold">No study resources shared yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resources.map((res) => (
                      <div key={res._id} className="p-4 border border-[#dae2fd] rounded-xl hover:border-[#002045] transition flex items-start justify-between bg-[#faf8ff]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#003730] text-[#62fae3] flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-xl">
                              {res.fileType === "pdf" ? "picture_as_pdf" : res.fileType === "doc" ? "description" : "link"}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[#131b2e]">{res.title}</h4>
                            <p className="text-xs text-[#74777f]">{res.description || "No description."}</p>
                            <div className="flex items-center gap-3 text-[11px] text-[#74777f] pt-1">
                              <span>By {res.uploadedBy?.fullName || "Member"}</span>
                              <span>•</span>
                              <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {res.fileUrl && (
                            <a
                              href={res.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-[#eaedff] text-[#002045] hover:bg-[#002045] hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            >
                              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              View
                            </a>
                          )}
                          {(isCreator || res.uploadedBy?._id === user?._id) && (
                            <button
                              onClick={() => handleDeleteRes(res._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete Resource"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. STUDY SESSIONS TAB */}
            {activeTab === "sessions" && (
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-[#002045]">Study Sessions & Meetups</h3>
                    <p className="text-xs text-[#74777f]">Schedule and RSVP for upcoming study meetups, review sessions, or online calls.</p>
                  </div>

                  <button
                    onClick={() => setShowScheduleSession(true)}
                    className="bg-[#002045] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#1a365d] transition"
                  >
                    <span className="material-symbols-outlined text-[18px]">event</span>
                    Schedule Session
                  </button>
                </div>

                {sessions.length === 0 ? (
                  <div className="text-center py-12 text-[#74777f] space-y-2">
                    <span className="material-symbols-outlined text-4xl text-[#002045]/40">event_busy</span>
                    <p className="text-sm font-semibold">No study sessions scheduled yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((sess) => {
                      const isAttending = sess.attendees?.some((a) => a._id === user?._id || a === user?._id);

                      return (
                        <div key={sess._id} className="p-5 border border-[#dae2fd] rounded-2xl bg-[#faf8ff] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-[#002045]">{sess.title}</h4>
                              <span className="bg-[#eaedff] text-[#002045] text-xs font-bold px-2.5 py-0.5 rounded-full">
                                {new Date(sess.scheduledAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs text-[#43474e]">{sess.description || "Group study meetup."}</p>
                            <div className="flex items-center gap-4 text-xs text-[#74777f] pt-1">
                              <span className="flex items-center gap-1 text-[#002045] font-semibold">
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                {sess.locationOrLink}
                              </span>
                              <span>•</span>
                              <span>Organized by {sess.createdBy?.fullName || "Member"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right text-xs">
                              <p className="font-bold text-[#002045]">{sess.attendees?.length || 0} Attending</p>
                            </div>
                            <button
                              onClick={() => handleRSVP(sess._id)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                                isAttending
                                  ? "bg-emerald-600 text-white shadow"
                                  : "bg-[#002045] text-white hover:bg-[#1a365d]"
                              }`}
                            >
                              {isAttending ? "✓ Attending" : "RSVP / Join"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. MEMBERS TAB */}
            {activeTab === "members" && (
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#002045]">Group Roster ({group.members?.length || 0})</h3>
                  <p className="text-xs text-[#74777f]">List of students collaborating in this study group.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.members?.map((m) => {
                    const isGroupCreator = m._id === group.creator?._id || m._id === group.creator;

                    return (
                      <div key={m._id} className="p-4 border border-[#dae2fd] rounded-xl flex items-center justify-between bg-[#faf8ff]">
                        <div className="flex items-center gap-3">
                          <img
                            src={m.profilePicture || "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"}
                            alt="member"
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#002045]"
                          />
                          <div>
                            <p className="text-sm font-bold text-[#131b2e]">{m.fullName}</p>
                            <p className="text-xs text-[#74777f]">{m.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isGroupCreator && (
                            <span className="bg-[#002045] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                              Group Lead
                            </span>
                          )}
                          {isCreator && !isGroupCreator && (
                            <button
                              onClick={() => handleRemoveMember(m._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold"
                              title="Remove Member"
                            >
                              <span className="material-symbols-outlined text-[18px]">person_remove</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD RESOURCE MODAL */}
      {showAddResource && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dae2fd] space-y-4">
            <h3 className="text-lg font-bold text-[#002045]">Share Study Resource</h3>
            <form onSubmit={handleAddResource} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e]">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Cheat Sheet PDF"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#131b2e]">Type</label>
                <select
                  value={resourceForm.fileType}
                  onChange={(e) => setResourceForm({ ...resourceForm, fileType: e.target.value })}
                  className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs bg-white"
                >
                  <option value="link">Web Link / Drive</option>
                  <option value="pdf">PDF Document</option>
                  <option value="notes">Study Notes</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#131b2e]">Resource Link / URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={resourceForm.fileUrl}
                  onChange={(e) => setResourceForm({ ...resourceForm, fileUrl: e.target.value })}
                  className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#131b2e]">Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief note for study group members..."
                  value={resourceForm.description}
                  onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddResource(false)} className="px-3 py-1.5 text-xs text-[#74777f]">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#002045] text-white font-bold text-xs rounded-lg">Share Resource</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE SESSION MODAL */}
      {showScheduleSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dae2fd] space-y-4">
            <h3 className="text-lg font-bold text-[#002045]">Schedule Study Session</h3>
            <form onSubmit={handleScheduleSession} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e]">Session Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Practice Problems"
                  value={sessionForm.title}
                  onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                  className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#131b2e]">Date & Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={sessionForm.scheduledAt}
                  onChange={(e) => setSessionForm({ ...sessionForm, scheduledAt: e.target.value })}
                  className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#131b2e]">Location or Link</label>
                <input
                  type="text"
                  placeholder="e.g. Library Room 3B or Meet Link"
                  value={sessionForm.locationOrLink}
                  onChange={(e) => setSessionForm({ ...sessionForm, locationOrLink: e.target.value })}
                  className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#131b2e]">Description</label>
                <textarea
                  rows="2"
                  placeholder="Goals for this study meetup..."
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                  className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowScheduleSession(false)} className="px-3 py-1.5 text-xs text-[#74777f]">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#002045] text-white font-bold text-xs rounded-lg">Schedule Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
