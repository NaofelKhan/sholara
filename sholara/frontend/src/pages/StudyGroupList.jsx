import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getStudyGroups, createStudyGroup, joinStudyGroup } from "../api/studyGroup";
import { useToast } from "@/hooks/use-toast";

export default function StudyGroupList() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Forms
  const [createFormData, setCreateFormData] = useState({
    title: "",
    subject: "",
    description: "",
    maxMembers: 10,
    meetingLocation: "Online / Library",
    coverGradient: "from-[#002045] to-[#003730]",
  });
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await getStudyGroups();
      setGroups(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load study groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.title || !createFormData.subject) {
      toast({ title: "Error", description: "Title and Subject are required", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const newGroup = await createStudyGroup(createFormData);
      setGroups([newGroup, ...groups]);
      setShowCreateModal(false);
      setCreateFormData({
        title: "",
        subject: "",
        description: "",
        maxMembers: 10,
        meetingLocation: "Online / Library",
        coverGradient: "from-[#002045] to-[#003730]",
      });
      toast({ title: "Success!", description: `Study group '${newGroup.title}' created!` });
    } catch (err) {
      toast({
        title: "Create Failed",
        description: err.response?.data?.message || "Error creating study group",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) {
      toast({ title: "Error", description: "Please enter a valid join code", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const joinedGroup = await joinStudyGroup({ joinCode: joinCodeInput.trim() });
      setGroups((prev) => {
        const exists = prev.find((g) => g._id === joinedGroup._id);
        if (exists) return prev.map((g) => (g._id === joinedGroup._id ? joinedGroup : g));
        return [joinedGroup, ...prev];
      });
      setShowJoinModal(false);
      setJoinCodeInput("");
      toast({ title: "Joined!", description: `Successfully joined '${joinedGroup.title}'` });
    } catch (err) {
      toast({
        title: "Join Failed",
        description: err.response?.data?.message || "Invalid join code",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickJoin = async (groupId) => {
    try {
      const joinedGroup = await joinStudyGroup({ groupId });
      setGroups(groups.map((g) => (g._id === groupId ? joinedGroup : g)));
      toast({ title: "Joined!", description: `Joined study group '${joinedGroup.title}'` });
    } catch (err) {
      toast({
        title: "Join Failed",
        description: err.response?.data?.message || "Failed to join group",
        variant: "destructive",
      });
    }
  };

  // Filter logic
  const subjects = ["All", ...new Set(groups.map((g) => g.subject).filter(Boolean))];

  const filteredGroups = groups.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === "All" || g.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <DashboardLayout profile={user}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#002045] via-[#003730] to-[#002045] rounded-2xl p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 z-10">
            <span className="bg-[#62fae3] text-[#003730] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Collaborative Learning
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Study Group Hub</h1>
            <p className="text-blue-100 text-sm max-w-xl">
              Connect with peers, form peer study circles, share resources, host study sessions, and solve coursework challenges together.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10">
            <button
              onClick={() => setShowJoinModal(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition"
            >
              <span className="material-symbols-outlined text-[20px]">key</span>
              Join with Code
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#62fae3] text-[#003730] hover:bg-[#40ebd3] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow"
            >
              <span className="material-symbols-outlined text-[20px]">group_add</span>
              Create Study Group
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-[#dae2fd] shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]">
                search
              </span>
              <input
                type="text"
                placeholder="Search study groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#faf8ff] rounded-lg border border-[#c4c6cf] text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
              />
            </div>

            {/* Subject Selector */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-[#faf8ff] border border-[#c4c6cf] rounded-lg text-sm text-[#131b2e] focus:outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs font-semibold text-[#43474e]">
            Showing <span className="text-[#002045] font-bold">{filteredGroups.length}</span> study group(s)
          </div>
        </div>

        {/* Group Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#002045]"></div>
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#dae2fd] text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-[#eaedff] text-[#002045] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">groups</span>
            </div>
            <h3 className="text-lg font-bold text-[#131b2e]">No Study Groups Found</h3>
            <p className="text-sm text-[#74777f] max-w-md mx-auto">
              Be the first to start a study group for your course or topic!
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 border border-[#002045] text-[#002045] rounded-lg text-sm font-semibold hover:bg-[#eaedff]"
              >
                Join with Code
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-[#002045] text-white rounded-lg text-sm font-semibold hover:bg-[#1a365d]"
              >
                Create Study Group
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => {
              const isMember = group.members?.some(
                (m) => m._id === user?._id || m === user?._id
              );
              const isCreator =
                group.creator?._id === user?._id || group.creator === user?._id;

              return (
                <div
                  key={group._id}
                  className="bg-white rounded-2xl border border-[#dae2fd] shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
                >
                  {/* Card Banner */}
                  <div
                    onClick={() => isMember && setLocation(`/study-groups/${group._id}`)}
                    className={`h-28 bg-gradient-to-r ${group.coverGradient || "from-[#002045] to-[#003730]"} p-5 text-white flex flex-col justify-between relative cursor-pointer`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide text-white border border-white/20">
                        {group.subject}
                      </span>
                      <span className="bg-[#62fae3]/20 text-[#62fae3] px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#62fae3]/30">
                        {isCreator ? "Creator" : isMember ? "Member" : "Public"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:underline">
                      {group.title}
                    </h3>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 space-y-3">
                    <p className="text-xs text-[#43474e] line-clamp-2">
                      {group.description || "Peer study group for collaborative problem solving and exam preparation."}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-[#f2f3ff] text-xs text-[#74777f]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#002045]">
                          meeting_room
                        </span>
                        <span>Location: <strong className="text-[#131b2e]">{group.meetingLocation}</strong></span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">group</span>
                          {group.members?.length || 0} / {group.maxMembers} Members
                        </span>
                        <span className="text-[11px] text-[#74777f]">
                          Lead: {group.creator?.fullName || "Student"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="px-5 py-3 bg-[#faf8ff] border-t border-[#dae2fd] flex justify-between items-center">
                    {isMember ? (
                      <button
                        onClick={() => setLocation(`/study-groups/${group._id}`)}
                        className="w-full text-center py-2 bg-[#002045] text-white rounded-lg text-xs font-bold hover:bg-[#1a365d] transition flex items-center justify-center gap-1"
                      >
                        Enter Group Workspace
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleQuickJoin(group._id)}
                        disabled={group.members?.length >= group.maxMembers}
                        className="w-full text-center py-2 bg-[#62fae3] text-[#003730] rounded-lg text-xs font-bold hover:bg-[#40ebd3] transition disabled:opacity-50"
                      >
                        {group.members?.length >= group.maxMembers ? "Group Full" : "Join Study Group"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE STUDY GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#dae2fd] space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-[#dae2fd] pb-4">
              <h2 className="text-xl font-bold text-[#002045] flex items-center gap-2">
                <span className="material-symbols-outlined">group_add</span>
                Create Study Group
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#74777f] hover:text-[#002045]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Study Group Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Algorithms & LeetCode Study Circle"
                  required
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Subject / Topic *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    required
                    value={createFormData.subject}
                    onChange={(e) => setCreateFormData({ ...createFormData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Max Member Capacity
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={createFormData.maxMembers}
                    onChange={(e) => setCreateFormData({ ...createFormData, maxMembers: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Meeting Location / Online Link
                </label>
                <input
                  type="text"
                  placeholder="e.g. Library Study Room 3B or Discord Link"
                  value={createFormData.meetingLocation}
                  onChange={(e) => setCreateFormData({ ...createFormData, meetingLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Description & Goals
                </label>
                <textarea
                  rows="3"
                  placeholder="Describe your study group's schedule and topics..."
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#dae2fd]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#74777f] hover:bg-[#eaedff] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold bg-[#002045] text-white hover:bg-[#1a365d] rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Study Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN WITH CODE MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dae2fd] space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-[#dae2fd] pb-4">
              <h2 className="text-xl font-bold text-[#002045] flex items-center gap-2">
                <span className="material-symbols-outlined">key</span>
                Join Study Group
              </h2>
              <button
                onClick={() => setShowJoinModal(false)}
                className="text-[#74777f] hover:text-[#002045]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <p className="text-xs text-[#74777f]">
                Enter the 6-character Group Code provided by your study group leader.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Group Join Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. GRP-9X21"
                  required
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 border border-[#c4c6cf] rounded-lg text-base font-mono tracking-widest text-center uppercase focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#dae2fd]">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#74777f] hover:bg-[#eaedff] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-bold bg-[#002045] text-white hover:bg-[#1a365d] rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Joining..." : "Join Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
