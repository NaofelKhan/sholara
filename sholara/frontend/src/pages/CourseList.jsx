import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { getCourses, createCourse, joinCourse } from "../api/course";
import { useToast } from "@/hooks/use-toast";

export default function CourseList() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Forms
  const [createFormData, setCreateFormData] = useState({
    title: "",
    code: "",
    description: "",
    department: "",
    semester: "Fall 2026",
    coverGradient: "from-[#002045] to-[#1a365d]",
  });
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchUserCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserCourses();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createFormData.title || !createFormData.code) {
      toast({ title: "Error", description: "Title and Course Code are required", variant: "destructive" });
      return;
    }

    try {
      setSubmitting(true);
      const newCourse = await createCourse(createFormData);
      setCourses([newCourse, ...courses]);
      setShowCreateModal(false);
      setCreateFormData({
        title: "",
        code: "",
        description: "",
        department: "",
        semester: "Fall 2026",
        coverGradient: "from-[#002045] to-[#1a365d]",
      });
      toast({ title: "Success!", description: `Course '${newCourse.title}' created successfully.` });
    } catch (err) {
      toast({
        title: "Create Failed",
        description: err.response?.data?.message || "Error creating course",
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
      const joinedCourse = await joinCourse(joinCodeInput.trim());
      setCourses((prev) => {
        const exists = prev.find((c) => c._id === joinedCourse._id);
        if (exists) return prev;
        return [joinedCourse, ...prev];
      });
      setShowJoinModal(false);
      setJoinCodeInput("");
      toast({ title: "Enrolled!", description: `Joined course '${joinedCourse.title}' successfully!` });
    } catch (err) {
      toast({
        title: "Join Failed",
        description: err.response?.data?.message || "Invalid course code",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.department && c.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <DashboardLayout profile={user}>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#002045] via-[#1a365d] to-[#002045] rounded-2xl p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 z-10">
            <span className="bg-[#62fae3] text-[#006b5f] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Academic Hub
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Course Workspaces</h1>
            <p className="text-blue-100 text-sm max-w-xl">
              Access your dedicated learning spaces, view course materials, submit assignments, participate in discussions, and track grades & attendance.
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
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Create Course
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-[#dae2fd] shadow-sm">
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#74777f]">
              search
            </span>
            <input
              type="text"
              placeholder="Search by title, code, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#faf8ff] rounded-lg border border-[#c4c6cf] text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
            />
          </div>

          <div className="text-xs font-semibold text-[#43474e]">
            Showing <span className="text-[#002045] font-bold">{filteredCourses.length}</span> course workspace(s)
          </div>
        </div>

        {/* Course Cards Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#002045]"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-[#dae2fd] text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-[#eaedff] text-[#002045] rounded-full flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <h3 className="text-lg font-bold text-[#131b2e]">No Course Workspaces Found</h3>
            <p className="text-sm text-[#74777f] max-w-md mx-auto">
              You aren't enrolled in any courses yet. Create a course workspace or join an existing course using a join code.
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
                Create Course
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const isInstructor =
                course.instructor?._id === user?._id || course.instructor === user?._id;

              return (
                <div
                  key={course._id}
                  onClick={() => setLocation(`/courses/${course._id}`)}
                  className="bg-white rounded-2xl border border-[#dae2fd] shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden flex flex-col group"
                >
                  {/* Card Banner Header */}
                  <div className={`h-28 bg-gradient-to-r ${course.coverGradient || "from-[#002045] to-[#1a365d]"} p-5 text-white flex flex-col justify-between relative`}>
                    <div className="flex justify-between items-start">
                      <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide text-white border border-white/20">
                        {course.code}
                      </span>
                      <span className="bg-[#62fae3]/20 text-[#62fae3] px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#62fae3]/30">
                        {isInstructor ? "Instructor" : "Enrolled"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:underline">
                      {course.title}
                    </h3>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-xs text-[#43474e] line-clamp-2">
                      {course.description || "No description provided for this course workspace."}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[#f2f3ff]">
                      <div className="flex items-center gap-2 text-xs text-[#74777f]">
                        <span className="material-symbols-outlined text-[18px] text-[#002045]">
                          person
                        </span>
                        <span>Instructor: <strong className="text-[#131b2e]">{course.instructor?.fullName || "Instructor"}</strong></span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-[#74777f]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[18px]">groups</span>
                          {course.enrolledStudents?.length || 0} Member(s)
                        </span>
                        <span className="font-semibold text-[#002045] bg-[#eaedff] px-2 py-0.5 rounded">
                          {course.semester}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="px-5 py-3 bg-[#faf8ff] border-t border-[#dae2fd] flex justify-between items-center text-xs font-bold text-[#002045]">
                    <span>Enter Workspace</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE COURSE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#dae2fd] space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-[#dae2fd] pb-4">
              <h2 className="text-xl font-bold text-[#002045] flex items-center gap-2">
                <span className="material-symbols-outlined">add_school</span>
                Create Course Workspace
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
                  Course Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Structures & Algorithms"
                  required
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE-201"
                    required
                    value={createFormData.code}
                    onChange={(e) => setCreateFormData({ ...createFormData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Semester
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fall 2026"
                    value={createFormData.semester}
                    onChange={(e) => setCreateFormData({ ...createFormData, semester: e.target.value })}
                    className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={createFormData.department}
                  onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="Brief description of the course content..."
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
                  {submitting ? "Creating..." : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN COURSE MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dae2fd] space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center border-b border-[#dae2fd] pb-4">
              <h2 className="text-xl font-bold text-[#002045] flex items-center gap-2">
                <span className="material-symbols-outlined">key</span>
                Join Course Workspace
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
                Ask your course instructor for the 6-character Join Code to enroll directly into the workspace.
              </p>

              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Join Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. SCH-8X92"
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
                  {submitting ? "Joining..." : "Join Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
