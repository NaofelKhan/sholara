import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getDepartmentPosts,
  createDepartmentPost,
  togglePinDepartmentPost,
  deleteDepartmentPost,
  addDepartmentPostComment,
} from "../api/departmentChannel";
import { useToast } from "@/hooks/use-toast";

export default function DepartmentChannels() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
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
  const [submitting, setSubmitting] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  const departmentsList = [
    "Computer Science & Engineering",
    "Electrical & Electronic Engineering",
    "Business Administration",
    "All Departments",
  ];

  const categoriesList = [
    { id: "All", label: "All Posts", icon: "grid_view" },
    { id: "notice", label: "Notices & Advisories", icon: "campaign" },
    { id: "opportunity", label: "Opportunities & Internships", icon: "work" },
    { id: "update", label: "Department Updates", icon: "newspaper" },
  ];

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
    fetchPosts();
  }, [selectedDept, selectedCategory]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postFormData.title || !postFormData.content) {
      toast({ title: "Error", description: "Title and Content are required", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const newPost = await createDepartmentPost(postFormData);
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
    if (!window.confirm("Are you sure you want to delete this department post?")) return;
    try {
      await deleteDepartmentPost(postId);
      setPosts(posts.filter((p) => p._id !== postId));
      toast({ title: "Deleted", description: "Department post deleted." });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete post", variant: "destructive" });
    }
  };

  const handleAddComment = async (postId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const updated = await addDepartmentPostComment(postId, text.trim());
      setPosts(posts.map((p) => (p._id === postId ? updated : p)));
      setCommentInputs({ ...commentInputs, [postId]: "" });
      toast({ title: "Comment Posted", description: "Your inquiry/response was added." });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to comment", variant: "destructive" });
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout profile={user}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#002045] via-[#1a365d] to-[#002045] rounded-2xl p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 z-10">
            <span className="bg-[#62fae3] text-[#003730] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Department Communication
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Department Channels</h1>
            <p className="text-blue-100 text-sm max-w-xl">
              Stay up-to-date with official department notices, academic announcements, research & internship opportunities, and event updates.
            </p>
          </div>

          <button
            onClick={() => {
              setPostFormData((prev) => ({
                ...prev,
                department: selectedDept !== "All Departments" ? selectedDept : "Computer Science & Engineering",
              }));
              setShowCreateModal(true);
            }}
            className="bg-[#62fae3] text-[#003730] hover:bg-[#40ebd3] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition shadow z-10"
          >
            <span className="material-symbols-outlined text-[20px]">campaign</span>
            Post Announcement
          </button>
        </div>

        {/* Department Selection Bar */}
        <div className="flex overflow-x-auto gap-2 border-b border-[#dae2fd] pb-2">
          {departmentsList.map((dept) => {
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
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]">
              search
            </span>
            <input
              type="text"
              placeholder="Search notices & updates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#faf8ff] rounded-lg border border-[#c4c6cf] text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
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
            <div className="w-16 h-16 bg-[#eaedff] text-[#002045] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">campaign</span>
            </div>
            <h3 className="text-lg font-bold text-[#131b2e]">No Department Channel Posts</h3>
            <p className="text-sm text-[#74777f] max-w-md mx-auto">
              No announcements or opportunities posted for {selectedDept} under this category.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2 bg-[#002045] text-white rounded-lg text-sm font-bold hover:bg-[#1a365d]"
            >
              Broadcast First Notice
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => {
              const isAuthor = post.author?._id === user?._id;
              const isTeacher = user?.role === "teacher" || user?.role === "faculty" || user?.role === "admin";
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
                            {post.author?.role === "teacher" ? "Faculty" : "Student"}
                          </span>
                        </div>
                        <p className="text-xs text-[#74777f]">
                          {post.department} • {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {post.isPinned && (
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">push_pin</span>
                          Pinned Notice
                        </span>
                      )}

                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                        post.category === "opportunity"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : post.category === "update"
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "bg-purple-100 text-purple-800 border border-purple-300"
                      }`}>
                        {post.category}
                      </span>

                      {(isAuthor || isTeacher) && (
                        <div className="flex items-center gap-1 pl-2">
                          <button
                            onClick={() => handleTogglePin(post._id)}
                            className="p-1.5 text-[#74777f] hover:text-[#002045] rounded-lg hover:bg-[#eaedff]"
                            title={post.isPinned ? "Unpin Post" : "Pin Post"}
                          >
                            <span className="material-symbols-outlined text-[18px]">push_pin</span>
                          </button>

                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                            title="Delete Post"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Body */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-[#002045]">{post.title}</h3>
                    <p className="text-sm text-[#43474e] leading-relaxed whitespace-pre-line">{post.content}</p>
                  </div>

                  {/* Document / File Attachment */}
                  {post.fileUrl && (
                    <div className="pt-2">
                      <a
                        href={post.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#eaedff] text-[#002045] hover:bg-[#002045] hover:text-white rounded-xl text-xs font-bold transition"
                      >
                        <span className="material-symbols-outlined text-[18px]">attachment</span>
                        View Attached Document / Resource Link
                      </a>
                    </div>
                  )}

                  {/* Footer & Comments */}
                  <div className="border-t border-[#f2f3ff] pt-4 flex justify-between items-center text-xs">
                    <button
                      onClick={() =>
                        setExpandedComments({
                          ...expandedComments,
                          [post._id]: !showComments,
                        })
                      }
                      className="text-[#002045] font-bold flex items-center gap-1 hover:underline"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat_bubble_outline</span>
                      {post.comments?.length || 0} Inquiries & Responses
                    </button>
                  </div>

                  {showComments && (
                    <div className="bg-[#faf8ff] p-4 rounded-xl border border-[#dae2fd] space-y-4">
                      <div className="space-y-3">
                        {post.comments?.length === 0 ? (
                          <p className="text-xs text-[#74777f]">No inquiries yet. Be the first to comment!</p>
                        ) : (
                          post.comments.map((comm) => (
                            <div key={comm._id} className="p-3 bg-white rounded-xl border border-[#dae2fd] space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-[#002045]">{comm.author?.fullName || "Student"}</span>
                                <span className="text-[10px] text-[#74777f]">{new Date(comm.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-[#43474e]">{comm.content}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Write an inquiry or response..."
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                          }
                          className="flex-1 px-3 py-2 text-xs bg-white border border-[#c4c6cf] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002045]"
                        />
                        <button
                          onClick={() => handleAddComment(post._id)}
                          className="bg-[#002045] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1a365d] transition"
                        >
                          Submit
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

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#dae2fd] space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-[#dae2fd] pb-4">
              <h2 className="text-xl font-bold text-[#002045] flex items-center gap-2">
                <span className="material-symbols-outlined">campaign</span>
                Broadcast Department Announcement
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#74777f] hover:text-[#002045]"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fall 2026 Midterm Exam Schedule Released"
                  required
                  value={postFormData.title}
                  onChange={(e) => setPostFormData({ ...postFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Department
                  </label>
                  <select
                    value={postFormData.department}
                    onChange={(e) => setPostFormData({ ...postFormData, department: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#002045]"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Electrical & Electronic Engineering">Electrical & Electronic Engineering</option>
                    <option value="Business Administration">Business Administration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Category
                  </label>
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
