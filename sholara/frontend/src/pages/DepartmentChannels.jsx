import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getDepartmentPosts,
  createDepartmentPost,
  togglePinDepartmentPost,
  deleteDepartmentPost,
  addDepartmentPostComment,
  getDepartmentChannels,
  createDepartmentChannel,
} from "../api/departmentChannel";
import { useToast } from "@/hooks/use-toast";

export default function DepartmentChannels() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected Filters
  const [selectedDept, setSelectedDept] = useState(
    user?.department || "Computer Science & Engineering"
  );
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Post Modal & Comment State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postFormData, setPostFormData] = useState({
    title: "",
    content: "",
    department: "Computer Science & Engineering",
    category: "notice",
    isPinned: false,
    fileUrl: "",
  });

  // Channel Creation Modal State (Faculty & Admin)
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [channelFormData, setChannelFormData] = useState({
    name: "",
    description: "",
    icon: "domain",
  });
  const [submittingChannel, setSubmittingChannel] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  const categoriesList = [
    { id: "All", label: "All Posts", icon: "grid_view" },
    { id: "notice", label: "Notices & Advisories", icon: "campaign" },
    { id: "opportunity", label: "Opportunities & Internships", icon: "work" },
    { id: "update", label: "Department Updates", icon: "newspaper" },
  ];

  const isFacultyOrAdmin =
    user?.role === "faculty" || user?.role === "teacher" || user?.role === "ta" || user?.role === "admin";

  const fetchChannels = async () => {
    try {
      const data = await getDepartmentChannels();
      setChannels(data);
    } catch (err) {
      console.error("Failed to load department channels:", err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getDepartmentPosts(
        selectedDept === "All Departments" ? "All" : selectedDept,
        selectedCategory
      );
      setPosts(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load department posts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedDept, selectedCategory]);

  const handleCreateChannelSubmit = async (e) => {
    e.preventDefault();
    if (!channelFormData.name.trim()) {
      toast({ title: "Error", description: "Channel name is required", variant: "destructive" });
      return;
    }

    try {
      setSubmittingChannel(true);
      const newChannel = await createDepartmentChannel(channelFormData);
      setChannels([...channels, newChannel]);
      setSelectedDept(newChannel.name);
      setShowCreateChannelModal(false);
      setChannelFormData({ name: "", description: "", icon: "domain" });
      toast({
        title: "Channel Created!",
        description: `Department channel '${newChannel.name}' created successfully.`,
      });
    } catch (err) {
      toast({
        title: "Creation Failed",
        description: err.response?.data?.message || "Failed to create department channel",
        variant: "destructive",
      });
    } finally {
      setSubmittingChannel(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postFormData.title || !postFormData.content) {
      toast({ title: "Error", description: "Title and Content are required", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const newPost = await createDepartmentPost({
        ...postFormData,
        department: selectedDept !== "All Departments" ? selectedDept : postFormData.department,
      });
      setPosts([newPost, ...posts]);
      setShowCreateModal(false);
      setPostFormData({
        title: "",
        content: "",
        department: selectedDept !== "All Departments" ? selectedDept : "Computer Science & Engineering",
        category: "notice",
        isPinned: false,
        fileUrl: "",
      });
      toast({ title: "Posted!", description: "Department announcement broadcasted successfully." });
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to broadcast post",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async (postId) => {
    try {
      const updated = await togglePinDepartmentPost(postId);
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
      toast({
        title: updated.isPinned ? "Post Pinned" : "Post Unpinned",
        description: updated.isPinned ? "Announcement pinned to top." : "Post unpinned.",
      });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update pin state", variant: "destructive" });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this department post?")) return;
    try {
      await deleteDepartmentPost(postId);
      setPosts(posts.filter((p) => p._id !== postId));
      toast({ title: "Deleted", description: "Department announcement removed." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete post", variant: "destructive" });
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const updated = await addDepartmentPostComment(postId, text);
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
      setCommentInputs({ ...commentInputs, [postId]: "" });
      toast({ title: "Comment Added", description: "Reply added to announcement." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
    }
  };

  const toggleCommentsView = (postId) => {
    setExpandedComments({
      ...expandedComments,
      [postId]: !expandedComments[postId],
    });
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allChannelNames = [
    ...channels.map((c) => c.name),
    "All Departments",
  ];

  return (
    <DashboardLayout profile={user}>
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 pt-20 md:pt-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#002045] via-[#1a365d] to-[#002045] rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 z-10">
            <span className="bg-[#62fae3] text-[#003730] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Department Communication Hub
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Department Channels</h1>
            <p className="text-blue-100 text-sm max-w-xl">
              Stay up-to-date with official department notices, academic advisories, research opportunities, and announcements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10">
            {isFacultyOrAdmin && (
              <button
                onClick={() => setShowCreateChannelModal(true)}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                New Channel
              </button>
            )}

            {isFacultyOrAdmin && (
              <button
                onClick={() => {
                  setPostFormData((prev) => ({
                    ...prev,
                    department: selectedDept !== "All Departments" ? selectedDept : "Computer Science & Engineering",
                  }));
                  setShowCreateModal(true);
                }}
                className="bg-[#62fae3] text-[#003730] hover:bg-[#40ebd3] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow"
              >
                <span className="material-symbols-outlined text-[20px]">campaign</span>
                Post Announcement
              </button>
            )}
          </div>
        </div>

        {/* Department Selection Bar */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-[#dae2fd] pb-2">
          {allChannelNames.map((dept) => {
            const isActive = selectedDept === dept;
            return (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  isActive
                    ? "bg-[#002045] text-white shadow-sm"
                    : "bg-white text-[#43474e] hover:bg-[#faf8ff] border border-[#dae2fd]"
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>

        {/* Category Filters & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-[#dae2fd] shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            {categoriesList.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#eaedff] text-[#002045] border border-[#002045]"
                      : "text-[#74777f] hover:bg-[#faf8ff]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f] text-sm">
              search
            </span>
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#faf8ff] border border-[#c4c6cf] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#002045]"
            />
          </div>
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#002045]"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#dae2fd] text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#eaedff] text-[#002045] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">campaign</span>
            </div>
            <h3 className="text-lg font-bold text-[#131b2e]">No Department Channel Posts</h3>
            <p className="text-sm text-[#74777f] max-w-md mx-auto">
              No announcements or opportunities posted for {selectedDept} under this category.
            </p>
            {isFacultyOrAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 bg-[#002045] text-white rounded-lg text-sm font-bold hover:bg-[#1a365d]"
              >
                Broadcast First Notice
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => {
              const isAuthor = post.author?._id === user?._id;
              const showComments = expandedComments[post._id];

              return (
                <div
                  key={post._id}
                  className={`bg-white rounded-2xl border transition shadow-sm p-6 space-y-4 ${
                    post.isPinned ? "border-[#002045] ring-1 ring-[#002045]" : "border-[#dae2fd]"
                  }`}
                >
                  {/* Top Header */}
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.author?.profilePicture || "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"}
                        alt="author"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-[#dae2fd]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#131b2e]">{post.author?.fullName}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            post.author?.role === "teacher" || post.author?.role === "faculty"
                              ? "bg-[#002045] text-white"
                              : "bg-[#eaedff] text-[#002045]"
                          }`}>
                            {post.author?.role === "teacher" || post.author?.role === "faculty" ? "Faculty" : post.author?.role === "admin" ? "Admin" : "Student"}
                          </span>
                        </div>
                        <p className="text-xs text-[#74777f]">
                          {post.department} • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.isPinned && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">push_pin</span>
                          Pinned Notice
                        </span>
                      )}

                      {isFacultyOrAdmin && (
                        <button
                          onClick={() => handleTogglePin(post._id)}
                          className="p-1.5 text-[#74777f] hover:text-[#002045] hover:bg-[#faf8ff] rounded-lg transition"
                          title="Toggle Pin"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {post.isPinned ? "keep_off" : "push_pin"}
                          </span>
                        </button>
                      )}

                      {(isAuthor || isFacultyOrAdmin) && (
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete Post"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#002045]">{post.title}</h3>
                    <p className="text-sm text-[#43474e] leading-relaxed whitespace-pre-line">
                      {post.content}
                    </p>
                    {post.fileUrl && (
                      <div className="pt-2">
                        <a
                          href={post.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#eaedff] text-[#002045] text-xs font-semibold hover:bg-[#d6e3ff] transition"
                        >
                          <span className="material-symbols-outlined text-base">attachment</span>
                          View Attachment Document
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions & Comment Count */}
                  <div className="flex justify-between items-center pt-3 border-t border-[#f2f3ff] text-xs text-[#74777f]">
                    <button
                      onClick={() => toggleCommentsView(post._id)}
                      className="flex items-center gap-1.5 font-semibold text-[#002045] hover:underline"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat_bubble_outline</span>
                      {post.comments?.length || 0} Discussion Replies
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments && (
                    <div className="bg-[#faf8ff] p-4 rounded-xl space-y-4 border border-[#dae2fd]">
                      {post.comments?.length > 0 && (
                        <div className="space-y-3">
                          {post.comments.map((c, idx) => (
                            <div key={idx} className="flex gap-2.5 text-xs">
                              <img
                                src={c.author?.profilePicture || "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"}
                                alt="avatar"
                                className="w-7 h-7 rounded-full object-cover mt-0.5"
                              />
                              <div className="flex-1 bg-white p-3 rounded-xl border border-[#dae2fd] space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-[#131b2e]">{c.author?.fullName}</span>
                                  <span className="text-[10px] text-[#74777f]">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-[#43474e]">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Write a comment or reply..."
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                          }
                          className="flex-1 px-3 py-2 border border-[#c4c6cf] rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#002045]"
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="px-4 py-2 bg-[#002045] text-white text-xs font-bold rounded-lg hover:bg-[#1a365d]"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE DEPARTMENT CHANNEL MODAL (Faculty & Admin Only) */}
      {showCreateChannelModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dae2fd] space-y-4">
            <div className="flex justify-between items-center border-b border-[#dae2fd] pb-3">
              <h3 className="text-lg font-bold text-[#002045] flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-700">domain_add</span>
                Create Department Channel
              </h3>
              <button onClick={() => setShowCreateChannelModal(false)} className="text-[#74777f] hover:text-[#002045]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateChannelSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Software Engineering, Civil Engineering"
                  value={channelFormData.name}
                  onChange={(e) => setChannelFormData({ ...channelFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Description / Channel Purpose
                </label>
                <textarea
                  rows="3"
                  placeholder="Channel description, academic scope & advisories..."
                  value={channelFormData.description}
                  onChange={(e) => setChannelFormData({ ...channelFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#dae2fd]">
                <button
                  type="button"
                  onClick={() => setShowCreateChannelModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#74777f] hover:bg-[#eaedff] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingChannel}
                  className="px-5 py-2 text-xs font-bold bg-[#002045] text-white hover:bg-[#1a365d] rounded-lg disabled:opacity-50"
                >
                  {submittingChannel ? "Creating..." : "Create Channel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ANNOUNCEMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#dae2fd] space-y-4">
            <div className="flex justify-between items-center border-b border-[#dae2fd] pb-3">
              <h3 className="text-lg font-bold text-[#002045] flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">campaign</span>
                Broadcast Department Announcement
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#74777f] hover:text-[#002045]">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Examination Routine & Research Grants"
                  value={postFormData.title}
                  onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Department Channel
                  </label>
                  <select
                    value={postFormData.department}
                    onChange={(e) => setPostFormData({ ...postFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#002045]"
                  >
                    {allChannelNames
                      .filter((d) => d !== "All Departments")
                      .map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">Category</label>
                  <select
                    value={postFormData.category}
                    onChange={(e) => setPostFormData({ ...postFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#002045]"
                  >
                    <option value="notice">Notice / Advisory</option>
                    <option value="opportunity">Opportunity / Internship / Research</option>
                    <option value="update">Department Update / Event</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Attachment Link / Document URL
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={postFormData.fileUrl}
                  onChange={(e) => setPostFormData({ ...postFormData, fileUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Content & Details *
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Full announcement text..."
                  value={postFormData.content}
                  onChange={(e) => setPostFormData({ ...postFormData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={postFormData.isPinned}
                  onChange={(e) => setPostFormData({ ...postFormData, isPinned: e.target.checked })}
                  className="w-4 h-4 text-[#002045] rounded border-[#c4c6cf]"
                />
                <label htmlFor="isPinned" className="text-xs font-semibold text-[#131b2e]">
                  Pin this announcement to top of feed
                </label>
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
                  {submitting ? "Broadcasting..." : "Post Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
