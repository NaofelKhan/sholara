import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import {
  getCourseById,
  getMaterials,
  createMaterial,
  deleteMaterial,
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getDiscussions,
  createDiscussion,
  addReply,
  getAttendance,
  markAttendance,
  getGrades,
  removeMember,
  deleteCourse,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../api/course";
import { useToast } from "@/hooks/use-toast";

export default function CourseWorkspace() {
  const [, params] = useRoute("/courses/:id");
  const courseId = params?.id;
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [announcements, setAnnouncements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [gradesData, setGradesData] = useState(null);

  const [tabLoading, setTabLoading] = useState(false);

  const [showPostAnnouncement, setShowPostAnnouncement] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: "", content: "", isPinned: false });
  const [submittingAnnouncement, setSubmittingAnnouncement] = useState(false);

  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [materialForm, setMaterialForm] = useState({ title: "", description: "", fileUrl: "", fileType: "link" });

  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ title: "", description: "", dueDate: "", maxPoints: 100 });

  const [submitModalAssignment, setSubmitModalAssignment] = useState(null);
  const [submissionForm, setSubmissionForm] = useState({ fileUrl: "", textContent: "" });

  const [gradeModalData, setGradeModalData] = useState(null);
  const [gradeForm, setGradeForm] = useState({ grade: 0, feedback: "" });

  const [showCreateDiscussion, setShowCreateDiscussion] = useState(false);
  const [discussionForm, setDiscussionForm] = useState({ title: "", content: "" });
  const [activeDiscussionId, setActiveDiscussionId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState({ topic: "Lecture Session", date: new Date().toISOString().split("T")[0] });
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const data = await getCourseById(courseId);
      setCourse(data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to load course details",
        variant: "destructive",
      });
      setLocation("/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  useEffect(() => {
    if (!courseId) return;

    const loadTabData = async () => {
      setTabLoading(true);
      try {
        if (activeTab === "overview") {
          const res = await getAnnouncements(courseId);
          setAnnouncements(res);
        } else if (activeTab === "materials") {
          const res = await getMaterials(courseId);
          setMaterials(res);
        } else if (activeTab === "assignments") {
          const res = await getAssignments(courseId);
          setAssignments(res);
        } else if (activeTab === "discussions") {
          const res = await getDiscussions(courseId);
          setDiscussions(res);
        } else if (activeTab === "attendance") {
          const res = await getAttendance(courseId);
          setAttendance(res);
        } else if (activeTab === "grades") {
          const res = await getGrades(courseId);
          setGradesData(res);
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
  }, [activeTab, courseId]);

  if (loading || !course) {
    return (
      <DashboardLayout profile={user}>
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#002045]"></div>
        </div>
      </DashboardLayout>
    );
  }

  const isInstructor =
    course.instructor?._id === user?._id || course.instructor === user?._id;

  const copyJoinCode = () => {
    navigator.clipboard.writeText(course.joinCode);
    toast({ title: "Copied!", description: `Join Code '${course.joinCode}' copied to clipboard.` });
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Are you sure you want to delete this course workspace? This action cannot be undone.")) return;
    try {
      await deleteCourse(courseId);
      toast({ title: "Course Deleted", description: "Course workspace deleted." });
      setLocation("/courses");
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to delete course", variant: "destructive" });
    }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.title || !announcementForm.content) return;
    try {
      setSubmittingAnnouncement(true);
      const res = await createAnnouncement(courseId, announcementForm);
      setAnnouncements([res, ...announcements]);
      setShowPostAnnouncement(false);
      setAnnouncementForm({ title: "", content: "", isPinned: false });
      toast({ title: "Announcement Broadcasted", description: `Posted '${res.title}'` });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to post announcement", variant: "destructive" });
    } finally {
      setSubmittingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm("Are you sure you want to delete this course announcement?")) return;
    try {
      await deleteAnnouncement(courseId, annId);
      setAnnouncements(announcements.filter((a) => a._id !== annId));
      toast({ title: "Deleted", description: "Announcement removed." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" });
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      const res = await createMaterial(courseId, materialForm);
      setMaterials([res, ...materials]);
      setShowAddMaterial(false);
      setMaterialForm({ title: "", description: "", fileUrl: "", fileType: "link" });
      toast({ title: "Material Added", description: `Added '${res.title}'` });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to add material", variant: "destructive" });
    }
  };

  const handleDeleteMat = async (matId) => {
    try {
      await deleteMaterial(courseId, matId);
      setMaterials(materials.filter((m) => m._id !== matId));
      toast({ title: "Deleted", description: "Material removed." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete material", variant: "destructive" });
    }
  };

  const handleCreateAssign = async (e) => {
    e.preventDefault();
    try {
      const res = await createAssignment(courseId, assignmentForm);
      setAssignments([res, ...assignments]);
      setShowCreateAssignment(false);
      setAssignmentForm({ title: "", description: "", dueDate: "", maxPoints: 100 });
      toast({ title: "Assignment Created", description: `Assignment '${res.title}' created.` });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to create assignment", variant: "destructive" });
    }
  };

  const handleSubmitAssign = async (e) => {
    e.preventDefault();
    try {
      const updated = await submitAssignment(courseId, submitModalAssignment._id, submissionForm);
      setAssignments(assignments.map((a) => (a._id === updated._id ? updated : a)));
      setSubmitModalAssignment(null);
      setSubmissionForm({ fileUrl: "", textContent: "" });
      toast({ title: "Submitted!", description: "Assignment solution submitted successfully." });
    } catch (err) {
      toast({ title: "Submission Error", description: err.response?.data?.message || "Failed to submit assignment", variant: "destructive" });
    }
  };

  const handleGradeAssign = async (e) => {
    e.preventDefault();
    try {
      const updated = await gradeSubmission(courseId, gradeModalData.assignment._id, {
        studentId: gradeModalData.submission.student._id,
        grade: Number(gradeForm.grade),
        feedback: gradeForm.feedback,
      });
      setAssignments(assignments.map((a) => (a._id === updated._id ? updated : a)));
      setGradeModalData(null);
      toast({ title: "Graded!", description: "Student submission graded successfully." });
    } catch (err) {
      toast({ title: "Grading Error", description: err.response?.data?.message || "Failed to grade", variant: "destructive" });
    }
  };

  const handleCreateDisc = async (e) => {
    e.preventDefault();
    try {
      const res = await createDiscussion(courseId, discussionForm);
      setDiscussions([res, ...discussions]);
      setShowCreateDiscussion(false);
      setDiscussionForm({ title: "", content: "" });
      toast({ title: "Topic Created", description: "Discussion thread posted." });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to post discussion", variant: "destructive" });
    }
  };

  const handleAddReply = async (discId) => {
    if (!replyContent.trim()) return;
    try {
      const updated = await addReply(courseId, discId, { content: replyContent });
      setDiscussions(discussions.map((d) => (d._id === discId ? updated : d)));
      setReplyContent("");
      toast({ title: "Reply Posted", description: "Your response was added." });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to reply", variant: "destructive" });
    }
  };

  const openMarkAttendanceModal = () => {
    const initialRecords = (course.enrolledStudents || []).map((s) => ({
      student: s._id,
      name: s.fullName,
      studentId: s.studentId,
      status: "present",
    }));
    setAttendanceRecords(initialRecords);
    setShowMarkAttendance(true);
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        date: attendanceForm.date,
        topic: attendanceForm.topic,
        records: attendanceRecords.map((r) => ({ student: r.student, status: r.status })),
      };
      const res = await markAttendance(courseId, payload);
      setAttendance([res, ...attendance]);
      setShowMarkAttendance(false);
      toast({ title: "Attendance Saved", description: "Session attendance recorded." });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to save attendance", variant: "destructive" });
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Remove member from course?")) return;
    try {
      await removeMember(courseId, studentId);
      setCourse({
        ...course,
        enrolledStudents: course.enrolledStudents.filter((s) => s._id !== studentId),
      });
      toast({ title: "Member Removed", description: "Student removed from course workspace." });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to remove member", variant: "destructive" });
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "dashboard" },
    { id: "materials", label: "Materials", icon: "folder" },
    { id: "assignments", label: "Assignments", icon: "assignment" },
    { id: "discussions", label: "Discussions", icon: "forum" },
    { id: "attendance", label: "Attendance", icon: "how_to_reg" },
    { id: "grades", label: "Grades", icon: "grade" },
    { id: "members", label: "Members", icon: "group" },
  ];

  return (
    <DashboardLayout profile={user}>
      <div className="p-8 max-w-7xl mx-auto space-y-6">

        {/* Workspace Banner */}
        <div className={`bg-gradient-to-r ${course.coverGradient || "from-[#002045] to-[#1a365d]"} rounded-2xl p-8 text-white shadow-lg relative overflow-hidden space-y-4`}>
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-[#62fae3] text-[#003730] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                  {course.code}
                </span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full border border-white/20">
                  {course.semester}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight pt-1">{course.title}</h1>
              <p className="text-blue-100 text-sm">{course.department || "Academic Department"}</p>
            </div>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
              <div className="text-right text-xs">
                <p className="text-blue-200 uppercase font-semibold text-[10px]">Course Join Code</p>
                <p className="font-mono text-base font-bold tracking-widest text-[#62fae3]">{course.joinCode}</p>
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
              <span>Instructor: <strong className="text-white">{course.instructor?.fullName}</strong></span>
              <span>•</span>
              <span>{course.enrolledStudents?.length || 0} Enrolled Student(s)</span>
            </div>
            {isInstructor && (
              <button
                onClick={handleDeleteCourse}
                className="text-red-300 hover:text-red-100 text-xs font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Delete Course
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${isActive
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

            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* About Course */}
                  <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-3">
                    <h3 className="text-lg font-bold text-[#002045] flex items-center gap-2">
                      <span className="material-symbols-outlined">info</span>
                      About this Course Workspace
                    </h3>
                    <p className="text-sm text-[#43474e] leading-relaxed">
                      {course.description || "Welcome to the workspace! Use the tabs above to access course lecture materials, submit assignments, participate in class discussions, view attendance logs, and track your grades."}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-5 border border-[#dae2fd] shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#eaedff] text-[#002045] flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">folder</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#74777f]">Materials</p>
                        <p className="text-xl font-extrabold text-[#002045]">{materials.length || "Active"}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-[#dae2fd] shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#eaedff] text-[#002045] flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">assignment</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#74777f]">Assignments</p>
                        <p className="text-xl font-extrabold text-[#002045]">{assignments.length || "Active"}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-5 border border-[#dae2fd] shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#eaedff] text-[#002045] flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">group</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-[#74777f]">Students</p>
                        <p className="text-xl font-extrabold text-[#002045]">{course.enrolledStudents?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Announcement Board */}
                  <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-[#f2f3ff] pb-4">
                      <div className="space-y-0.5">
                        <h3 className="text-lg font-bold text-[#002045] flex items-center gap-2">
                          <span className="material-symbols-outlined text-amber-500">campaign</span>
                          Course Announcement Board
                        </h3>
                        <p className="text-xs text-[#74777f]">
                          Important course updates, schedule notices, and announcements from instructor.
                        </p>
                      </div>
                      {isInstructor && (
                        <button
                          onClick={() => setShowPostAnnouncement(true)}
                          className="px-4 py-2 bg-[#002045] text-white hover:bg-[#1a365d] rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_comment</span>
                          Post Announcement
                        </button>
                      )}
                    </div>

                    {announcements.length === 0 ? (
                      <div className="p-8 text-center bg-[#faf8ff] rounded-xl border border-dashed border-[#dae2fd] space-y-2">
                        <span className="material-symbols-outlined text-3xl text-[#74777f]">campaign</span>
                        <p className="text-xs font-semibold text-[#74777f]">No course announcements posted yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {announcements.map((ann) => (
                          <div
                            key={ann._id}
                            className={`p-4 rounded-xl border transition space-y-2 ${ann.isPinned
                                ? "bg-[#fffdf5] border-amber-300 ring-1 ring-amber-200"
                                : "bg-[#faf8ff] border-[#dae2fd]"
                              }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src={ann.author?.profilePicture || "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"}
                                  alt="author"
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="text-xs font-bold text-[#002045]">{ann.author?.fullName}</h5>
                                    <span className="text-[10px] font-bold bg-[#002045] text-white px-2 py-0.5 rounded uppercase">
                                      {ann.author?.role === "teacher" || ann.author?.role === "faculty" ? "Instructor" : "Author"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[#74777f]">{new Date(ann.createdAt).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {ann.isPinned && (
                                  <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                                    <span className="material-symbols-outlined text-[12px]">push_pin</span>
                                    Pinned Notice
                                  </span>
                                )}
                                {isInstructor && (
                                  <button
                                    onClick={() => handleDeleteAnnouncement(ann._id)}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                                    title="Delete Announcement"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                            <h4 className="text-sm font-bold text-[#002045]">{ann.title}</h4>
                            <p className="text-xs text-[#43474e] leading-relaxed whitespace-pre-line">{ann.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-[#002045] uppercase tracking-wider">Instructor Details</h4>
                    <div className="flex items-center gap-3">
                      <img
                        src={course.instructor?.profilePicture || "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"}
                        alt="Instructor"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-[#dae2fd]"
                      />
                      <div>
                        <p className="text-sm font-bold text-[#131b2e]">{course.instructor?.fullName}</p>
                        <p className="text-xs text-[#74777f]">{course.instructor?.email}</p>
                        <span className="text-[10px] bg-[#eaedff] text-[#002045] px-2 py-0.5 rounded font-semibold">
                          {course.instructor?.department || "Department Faculty"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#faf8ff] rounded-2xl border border-[#dae2fd] p-5 space-y-3">
                    <h4 className="text-xs font-bold text-[#002045] uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">help</span>
                      Need Assistance?
                    </h4>
                    <p className="text-xs text-[#74777f]">
                      Use the course discussion forum to post questions or reply to existing threads.
                    </p>
                    <button
                      onClick={() => setActiveTab("discussions")}
                      className="w-full text-center py-2 bg-[#002045] text-white text-xs font-bold rounded-lg hover:bg-[#1a365d] transition"
                    >
                      Go to Discussions
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MATERIALS TAB */}
            {activeTab === "materials" && (
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-[#002045]">Learning Materials</h3>
                    <p className="text-xs text-[#74777f]">Access slides, lecture notes, syllabus, and external resources.</p>
                  </div>
                  {isInstructor && (
                    <button
                      onClick={() => setShowAddMaterial(true)}
                      className="bg-[#002045] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#1a365d] transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">upload_file</span>
                      Add Material
                    </button>
                  )}
                </div>

                {materials.length === 0 ? (
                  <div className="text-center py-12 text-[#74777f] space-y-2">
                    <span className="material-symbols-outlined text-4xl text-[#002045]/40">folder_open</span>
                    <p className="text-sm font-semibold">No materials uploaded yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materials.map((mat) => (
                      <div key={mat._id} className="p-4 border border-[#dae2fd] rounded-xl hover:border-[#002045] transition flex items-start justify-between bg-[#faf8ff]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#002045] text-white flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-xl">
                              {mat.fileType === "pdf" ? "picture_as_pdf" : mat.fileType === "doc" ? "description" : "link"}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-[#131b2e]">{mat.title}</h4>
                            <p className="text-xs text-[#74777f]">{mat.description || "No description."}</p>
                            <div className="flex items-center gap-3 text-[11px] text-[#74777f] pt-1">
                              <span>By {mat.uploadedBy?.fullName || "Instructor"}</span>
                              <span>•</span>
                              <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {mat.fileUrl && (
                            <a
                              href={mat.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-[#eaedff] text-[#002045] hover:bg-[#002045] hover:text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                            >
                              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                              View
                            </a>
                          )}
                          {isInstructor && (
                            <button
                              onClick={() => handleDeleteMat(mat._id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete Material"
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

            {/* 3. ASSIGNMENTS TAB */}
            {activeTab === "assignments" && (
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-[#002045]">Course Assignments</h3>
                    <p className="text-xs text-[#74777f]">View due dates, submit tasks, and review grades.</p>
                  </div>
                  {isInstructor && (
                    <button
                      onClick={() => setShowCreateAssignment(true)}
                      className="bg-[#002045] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#1a365d] transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_task</span>
                      Create Assignment
                    </button>
                  )}
                </div>

                {assignments.length === 0 ? (
                  <div className="text-center py-12 text-[#74777f] space-y-2">
                    <span className="material-symbols-outlined text-4xl text-[#002045]/40">assignment</span>
                    <p className="text-sm font-semibold">No assignments posted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignments.map((assign) => {
                      const userSub = assign.submissions?.find((s) => s.student._id === user?._id || s.student === user?._id);
                      const isGraded = userSub && userSub.grade !== null && userSub.grade !== undefined;

                      return (
                        <div key={assign._id} className="p-5 border border-[#dae2fd] rounded-2xl bg-[#faf8ff] space-y-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-[#dae2fd] pb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-[#002045]">{assign.title}</h4>
                                <span className="bg-[#eaedff] text-[#002045] text-xs font-bold px-2.5 py-0.5 rounded-full">
                                  Max: {assign.maxPoints} pts
                                </span>
                              </div>
                              <p className="text-xs text-[#74777f]">
                                Due Date: <strong className="text-[#131b2e]">{new Date(assign.dueDate).toLocaleDateString()}</strong>
                              </p>
                            </div>

                            {!isInstructor ? (
                              <div>
                                {isGraded ? (
                                  <div className="bg-emerald-100 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-300">
                                    Graded: {userSub.grade} / {assign.maxPoints} pts
                                  </div>
                                ) : userSub ? (
                                  <div className="flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-800 font-semibold text-xs px-3 py-1.5 rounded-xl border border-blue-200">
                                      Submitted
                                    </span>
                                    <button
                                      onClick={() => setSubmitModalAssignment(assign)}
                                      className="text-xs text-[#002045] font-bold underline"
                                    >
                                      Resubmit
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setSubmitModalAssignment(assign)}
                                    className="bg-[#002045] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1a365d] transition shadow"
                                  >
                                    Submit Assignment
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-[#74777f] font-semibold">
                                Submissions: <strong className="text-[#002045] font-extrabold">{assign.submissions?.length || 0}</strong> / {course.enrolledStudents?.length || 0}
                              </div>
                            )}
                          </div>

                          <p className="text-xs text-[#43474e]">{assign.description || "No instructions provided."}</p>

                          {!isInstructor && isGraded && userSub.feedback && (
                            <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
                              <p className="font-bold text-emerald-900">Instructor Feedback:</p>
                              <p className="text-emerald-800">{userSub.feedback}</p>
                            </div>
                          )}

                          {isInstructor && assign.submissions?.length > 0 && (
                            <div className="bg-white p-4 rounded-xl border border-[#dae2fd] space-y-3 mt-3">
                              <h5 className="text-xs font-bold text-[#002045] uppercase tracking-wider">
                                Student Submissions ({assign.submissions.length})
                              </h5>
                              <div className="divide-y divide-[#f2f3ff]">
                                {assign.submissions.map((sub) => (
                                  <div key={sub.student?._id || sub._id} className="py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="space-y-0.5">
                                      <p className="text-xs font-bold text-[#131b2e]">{sub.student?.fullName || "Student"}</p>
                                      <p className="text-[11px] text-[#74777f]">Submitted on: {new Date(sub.submittedAt).toLocaleString()}</p>
                                      {sub.textContent && <p className="text-xs text-[#43474e] italic">"{sub.textContent}"</p>}
                                      {sub.fileUrl && (
                                        <a href={sub.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold underline block">
                                          View Attached Link
                                        </a>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => {
                                        setGradeModalData({ assignment: assign, submission: sub });
                                        setGradeForm({ grade: sub.grade || 0, feedback: sub.feedback || "" });
                                      }}
                                      className="px-3 py-1.5 bg-[#eaedff] text-[#002045] hover:bg-[#002045] hover:text-white rounded-lg text-xs font-bold transition"
                                    >
                                      {sub.grade !== null && sub.grade !== undefined ? `Grade: ${sub.grade} pts` : "Grade Submission"}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 4. DISCUSSIONS TAB */}
            {activeTab === "discussions" && (
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-[#002045]">Course Discussion Forum</h3>
                    <p className="text-xs text-[#74777f]">Ask questions, collaborate, and exchange ideas with peers and instructors.</p>
                  </div>
                  <button
                    onClick={() => setShowCreateDiscussion(true)}
                    className="bg-[#002045] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#1a365d] transition"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_comment</span>
                    New Topic
                  </button>
                </div>

                {discussions.length === 0 ? (
                  <div className="text-center py-12 text-[#74777f] space-y-2">
                    <span className="material-symbols-outlined text-4xl text-[#002045]/40">forum</span>
                    <p className="text-sm font-semibold">No discussion topics posted yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {discussions.map((disc) => (
                      <div key={disc._id} className="p-5 border border-[#dae2fd] rounded-2xl bg-[#faf8ff] space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={disc.author?.profilePicture || "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"}
                              alt="Author"
                              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#dae2fd]"
                            />
                            <div>
                              <h4 className="text-base font-bold text-[#002045]">{disc.title}</h4>
                              <p className="text-xs text-[#74777f]">
                                Posted by <strong className="text-[#131b2e]">{disc.author?.fullName}</strong> • {new Date(disc.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className="bg-[#eaedff] text-[#002045] text-xs font-bold px-2.5 py-1 rounded-full">
                            {disc.replies?.length || 0} Replies
                          </span>
                        </div>

                        <p className="text-xs text-[#43474e] leading-relaxed bg-white p-4 rounded-xl border border-[#dae2fd]">
                          {disc.content}
                        </p>

                        <div className="space-y-3 pt-2">
                          {disc.replies?.map((rep, idx) => (
                            <div key={idx} className="ml-6 p-3 bg-white rounded-xl border border-[#dae2fd] space-y-1">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-[#002045]">{rep.author?.fullName || "Member"}</span>
                                <span className="text-[10px] text-[#74777f]">{new Date(rep.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-xs text-[#43474e]">{rep.content}</p>
                            </div>
                          ))}

                          <div className="flex gap-2 pt-2">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={activeDiscussionId === disc._id ? replyContent : ""}
                              onChange={(e) => {
                                setActiveDiscussionId(disc._id);
                                setReplyContent(e.target.value);
                              }}
                              className="flex-1 px-3 py-2 text-xs border border-[#c4c6cf] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002045]"
                            />
                            <button
                              onClick={() => handleAddReply(disc._id)}
                              className="bg-[#002045] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#1a365d] transition"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. ATTENDANCE TAB */}
            {activeTab === "attendance" && (
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-[#002045]">Attendance Log</h3>
                    <p className="text-xs text-[#74777f]">Track class presence and lecture attendance records.</p>
                  </div>
                  {isInstructor && (
                    <button
                      onClick={openMarkAttendanceModal}
                      className="bg-[#002045] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-[#1a365d] transition"
                    >
                      <span className="material-symbols-outlined text-[18px]">fact_check</span>
                      Mark New Attendance
                    </button>
                  )}
                </div>

                {attendance.length === 0 ? (
                  <div className="text-center py-12 text-[#74777f] space-y-2">
                    <span className="material-symbols-outlined text-4xl text-[#002045]/40">how_to_reg</span>
                    <p className="text-sm font-semibold">No attendance sessions logged yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {attendance.map((session) => {
                      const userRecord = session.records?.find((r) => r.student?._id === user?._id || r.student === user?._id);
                      return (
                        <div key={session._id} className="p-4 border border-[#dae2fd] rounded-xl bg-[#faf8ff] space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-bold text-[#002045]">{session.topic}</h4>
                              <p className="text-xs text-[#74777f]">Date: {new Date(session.date).toLocaleDateString()}</p>
                            </div>
                            {!isInstructor && userRecord && (
                              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${userRecord.status === "present"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : userRecord.status === "late"
                                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                                    : "bg-red-100 text-red-800 border border-red-300"
                                }`}>
                                Status: {userRecord.status}
                              </span>
                            )}
                          </div>
                          {isInstructor && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#dae2fd]">
                              {session.records?.map((r, idx) => (
                                <div key={idx} className="p-2 bg-white rounded-lg border border-[#dae2fd] text-xs space-y-1">
                                  <p className="font-bold text-[#131b2e] truncate">{r.student?.fullName || "Student"}</p>
                                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded capitalize ${r.status === "present" ? "bg-emerald-100 text-emerald-800" : r.status === "late" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"
                                    }`}>
                                    {r.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 6. GRADES TAB */}
            {activeTab === "grades" && (
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-[#002045]">Course Gradebook</h3>
                  <p className="text-xs text-[#74777f]">Summary of assignment scores and academic performance.</p>
                </div>

                {!gradesData || gradesData.gradebook?.length === 0 ? (
                  <div className="text-center py-12 text-[#74777f] space-y-2">
                    <span className="material-symbols-outlined text-4xl text-[#002045]/40">grade</span>
                    <p className="text-sm font-semibold">No grades recorded yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#faf8ff] border-b border-[#dae2fd] text-xs font-bold text-[#002045]">
                          <th className="p-3">Student</th>
                          {gradesData.assignments?.map((a) => (
                            <th key={a.id} className="p-3 whitespace-nowrap">
                              {a.title} ({a.maxPoints} pts)
                            </th>
                          ))}
                          <th className="p-3">Total Earned</th>
                          <th className="p-3">Grade %</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f2f3ff] text-xs text-[#131b2e]">
                        {gradesData.gradebook.map((row) => (
                          <tr key={row.student._id} className="hover:bg-[#faf8ff]">
                            <td className="p-3 font-semibold flex items-center gap-2">
                              <img
                                src={row.student.profilePicture || "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"}
                                alt="avatar"
                                className="w-7 h-7 rounded-full object-cover"
                              />
                              {row.student.fullName}
                            </td>
                            {row.scores?.map((sc) => (
                              <td key={sc.assignmentId} className="p-3">
                                {sc.grade !== null ? (
                                  <span className="font-bold text-emerald-700">{sc.grade} pts</span>
                                ) : (
                                  <span className="text-[#74777f]">-</span>
                                )}
                              </td>
                            ))}
                            <td className="p-3 font-bold text-[#002045]">{row.totalEarned} / {row.totalMax}</td>
                            <td className="p-3">
                              <span className="bg-[#eaedff] text-[#002045] font-extrabold px-2.5 py-1 rounded-md">
                                {row.percentage}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 7. MEMBERS TAB */}
            {activeTab === "members" && (
              <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-[#002045]">Enrolled Members</h3>
                    <p className="text-xs text-[#74777f]">List of course instructor and enrolled students.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#002045] uppercase tracking-wider">Instructor</h4>
                    <div className="p-4 border border-[#dae2fd] rounded-xl flex items-center justify-between bg-[#faf8ff]">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.instructor?.profilePicture || "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"}
                          alt="Instructor"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-[#002045]"
                        />
                        <div>
                          <p className="text-sm font-bold text-[#131b2e]">{course.instructor?.fullName}</p>
                          <p className="text-xs text-[#74777f]">{course.instructor?.email}</p>
                        </div>
                      </div>
                      <span className="bg-[#002045] text-white text-xs font-bold px-3 py-1 rounded-full">
                        Course Owner
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#002045] uppercase tracking-wider">
                      Students ({course.enrolledStudents?.length || 0})
                    </h4>
                    {course.enrolledStudents?.length === 0 ? (
                      <p className="text-xs text-[#74777f] py-4">No students enrolled yet. Share the Join Code!</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {course.enrolledStudents.map((st) => (
                          <div key={st._id} className="p-3 border border-[#dae2fd] rounded-xl flex items-center justify-between bg-white hover:border-[#002045] transition">
                            <div className="flex items-center gap-3">
                              <img
                                src={st.profilePicture || "https://media.istockphoto.com/id/1288129985/tr/vekt%C3%B6r/bir-ki%C5%9Finin-yer-tutucunun-eksik-g%C3%B6r%C3%BCnt%C3%BCs%C3%BC.jpg"}
                                alt="Student"
                                className="w-9 h-9 rounded-full object-cover"
                              />
                              <div>
                                <p className="text-xs font-bold text-[#131b2e]">{st.fullName}</p>
                                <p className="text-[11px] text-[#74777f]">{st.email}</p>
                              </div>
                            </div>
                            {isInstructor && (
                              <button
                                onClick={() => handleRemoveStudent(st._id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold"
                                title="Remove Student"
                              >
                                <span className="material-symbols-outlined text-[18px]">person_remove</span>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ADD MATERIAL MODAL */}
        {showAddMaterial && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dae2fd] space-y-4">
              <h3 className="text-lg font-bold text-[#002045]">Add Learning Material</h3>
              <form onSubmit={handleAddMaterial} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chapter 1 Lecture Notes"
                    value={materialForm.title}
                    onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Type</label>
                  <select
                    value={materialForm.fileType}
                    onChange={(e) => setMaterialForm({ ...materialForm, fileType: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs bg-white"
                  >
                    <option value="link">Web Link / Resource</option>
                    <option value="pdf">PDF Document</option>
                    <option value="doc">Word / Text Document</option>
                    <option value="video">Video Lecture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Resource Link / File URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={materialForm.fileUrl}
                    onChange={(e) => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Description</label>
                  <textarea
                    rows="2"
                    placeholder="Brief note for students..."
                    value={materialForm.description}
                    onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddMaterial(false)} className="px-3 py-1.5 text-xs text-[#74777f]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#002045] text-white font-bold text-xs rounded-lg">Add Material</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE ASSIGNMENT MODAL */}
        {showCreateAssignment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dae2fd] space-y-4">
              <h3 className="text-lg font-bold text-[#002045]">Create Assignment</h3>
              <form onSubmit={handleCreateAssign} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Assignment 1: Array Operations"
                    value={assignmentForm.title}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#131b2e]">Due Date *</label>
                    <input
                      type="date"
                      required
                      value={assignmentForm.dueDate}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                      className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#131b2e]">Max Points</label>
                    <input
                      type="number"
                      value={assignmentForm.maxPoints}
                      onChange={(e) => setAssignmentForm({ ...assignmentForm, maxPoints: e.target.value })}
                      className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Instructions</label>
                  <textarea
                    rows="3"
                    placeholder="Task requirements..."
                    value={assignmentForm.description}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreateAssignment(false)} className="px-3 py-1.5 text-xs text-[#74777f]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#002045] text-white font-bold text-xs rounded-lg">Create Assignment</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SUBMIT ASSIGNMENT MODAL */}
        {submitModalAssignment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dae2fd] space-y-4">
              <h3 className="text-lg font-bold text-[#002045]">Submit Assignment: {submitModalAssignment.title}</h3>
              <form onSubmit={handleSubmitAssign} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Solution Text / Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Enter your written answer or notes..."
                    value={submissionForm.textContent}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, textContent: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Submission Link / File URL</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={submissionForm.fileUrl}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, fileUrl: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setSubmitModalAssignment(null)} className="px-3 py-1.5 text-xs text-[#74777f]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#002045] text-white font-bold text-xs rounded-lg">Submit Solution</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* GRADE SUBMISSION MODAL */}
        {gradeModalData && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dae2fd] space-y-4">
              <h3 className="text-lg font-bold text-[#002045]">Grade {gradeModalData.submission.student?.fullName}</h3>
              <form onSubmit={handleGradeAssign} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Grade Score (out of {gradeModalData.assignment.maxPoints})</label>
                  <input
                    type="number"
                    max={gradeModalData.assignment.maxPoints}
                    min={0}
                    required
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs font-bold text-[#002045]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Feedback</label>
                  <textarea
                    rows="3"
                    placeholder="Feedback for student..."
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setGradeModalData(null)} className="px-3 py-1.5 text-xs text-[#74777f]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#002045] text-white font-bold text-xs rounded-lg">Save Grade</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CREATE DISCUSSION MODAL */}
        {showCreateDiscussion && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#dae2fd] space-y-4">
              <h3 className="text-lg font-bold text-[#002045]">Post Discussion Topic</h3>
              <form onSubmit={handleCreateDisc} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Topic Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Question on Midterm Topic 2"
                    value={discussionForm.title}
                    onChange={(e) => setDiscussionForm({ ...discussionForm, title: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e]">Content *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Details of your discussion topic..."
                    value={discussionForm.content}
                    onChange={(e) => setDiscussionForm({ ...discussionForm, content: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowCreateDiscussion(false)} className="px-3 py-1.5 text-xs text-[#74777f]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#002045] text-white font-bold text-xs rounded-lg">Post Topic</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MARK ATTENDANCE MODAL */}
        {showMarkAttendance && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#dae2fd] space-y-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-[#002045]">Mark Attendance</h3>
              <form onSubmit={handleSaveAttendance} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#131b2e]">Session Date *</label>
                    <input
                      type="date"
                      required
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                      className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#131b2e]">Topic</label>
                    <input
                      type="text"
                      value={attendanceForm.topic}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, topic: e.target.value })}
                      className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-[#002045]">Student Roster</label>
                  {attendanceRecords.length === 0 ? (
                    <p className="text-xs text-[#74777f]">No students enrolled to mark.</p>
                  ) : (
                    <div className="divide-y divide-[#f2f3ff] border border-[#dae2fd] rounded-xl p-2 bg-[#faf8ff]">
                      {attendanceRecords.map((rec, idx) => (
                        <div key={rec.student} className="py-2 flex items-center justify-between text-xs">
                          <span className="font-bold text-[#131b2e]">{rec.name}</span>
                          <div className="flex gap-2">
                            {["present", "late", "absent"].map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => {
                                  const next = [...attendanceRecords];
                                  next[idx].status = st;
                                  setAttendanceRecords(next);
                                }}
                                className={`px-2.5 py-1 rounded text-[11px] font-bold capitalize transition ${rec.status === st
                                    ? st === "present"
                                      ? "bg-emerald-600 text-white"
                                      : st === "late"
                                        ? "bg-amber-500 text-white"
                                        : "bg-red-600 text-white"
                                    : "bg-white text-[#74777f] border border-[#c4c6cf]"
                                  }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#dae2fd]">
                  <button type="button" onClick={() => setShowMarkAttendance(false)} className="px-3 py-1.5 text-xs text-[#74777f]">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#002045] text-white font-bold text-xs rounded-lg">Save Record</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* POST ANNOUNCEMENT MODAL */}
        {showPostAnnouncement && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#dae2fd] space-y-4">
              <div className="flex justify-between items-center border-b border-[#dae2fd] pb-3">
                <h3 className="text-lg font-bold text-[#002045] flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">campaign</span>
                  Broadcast Course Announcement
                </h3>
                <button onClick={() => setShowPostAnnouncement(false)} className="text-[#74777f] hover:text-[#002045]">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Class Schedule Change & Lecture 5 Slides"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#002045]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">Content & Details *</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Full announcement content for students..."
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    className="w-full p-2 border border-[#c4c6cf] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#002045]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="annIsPinned"
                    checked={announcementForm.isPinned}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })}
                    className="w-4 h-4 text-[#002045] rounded border-[#c4c6cf]"
                  />
                  <label htmlFor="annIsPinned" className="text-xs font-semibold text-[#131b2e]">
                    Pin this notice to top of Course Overview
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-[#dae2fd]">
                  <button
                    type="button"
                    onClick={() => setShowPostAnnouncement(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#74777f] hover:bg-[#eaedff] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingAnnouncement}
                    className="px-5 py-2 text-xs font-bold bg-[#002045] text-white hover:bg-[#1a365d] rounded-lg disabled:opacity-50"
                  >
                    {submittingAnnouncement ? "Posting..." : "Broadcast Announcement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}