const Course = require("../models/Course");
const CourseAssignment = require("../models/CourseAssignment");
const CourseAnnouncement = require("../models/CourseAnnouncement");
const Appointment = require("../models/Appointment");
const Booking = require("../models/Booking");
const StudyGroup = require("../models/StudyGroup");
const StudyGroupSession = require("../models/StudyGroupSession");
const Notification = require("../models/Notification");
const User = require("../models/User");

const ACTIVITY_TYPE_MAP = {
  skill_exchange: "skill",
  grade: "grade",
  announcement: "announcement",
  assignment: "announcement",
  appointment: "announcement",
  message: "announcement",
  review: "skill",
  certificate: "skill",
  system: "announcement",
};

const formatDue = (date) => {
  const due = new Date(date);
  const diffMs = due.getTime() - Date.now();
  const hours = diffMs / (1000 * 60 * 60);

  if (Number.isNaN(due.getTime())) return "";
  if (hours < 0) return "Overdue";
  if (hours < 1) return "Due soon";
  if (hours < 24) {
    const n = Math.max(1, Math.round(hours));
    return `Due in ${n} hour${n === 1 ? "" : "s"}`;
  }
  const days = Math.round(hours / 24);
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
};

const formatRelativeTime = (date) => {
  const then = new Date(date);
  const diffMs = Date.now() - then.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

const formatClock = (dateOrTime) => {
  if (!dateOrTime) return "";
  if (typeof dateOrTime === "string" && /^\d{1,2}:\d{2}/.test(dateOrTime)) {
    const [h, m] = dateOrTime.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m || 0, 0, 0);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const d = new Date(dateOrTime);
  if (Number.isNaN(d.getTime())) return String(dateOrTime);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const formatEventWhen = (date, timeStr) => {
  const d = date instanceof Date ? date : new Date(date);
  const dateLabel = Number.isNaN(d.getTime())
    ? String(date || "")
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
  const timeLabel = timeStr || (Number.isNaN(d.getTime()) ? "" : formatClock(d));
  return [dateLabel, timeLabel].filter(Boolean).join(" · ");
};

const parseAppointmentDate = (dateStr, timeStr) => {
  if (!dateStr) return new Date();
  const iso = timeStr ? `${dateStr}T${timeStr}` : `${dateStr}T00:00:00`;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? new Date(dateStr) : parsed;
};

const userCourseQuery = (user) => {
  if (user.role === "admin") return {};
  return {
    $or: [
      { instructor: user._id },
      { enrolledStudents: user._id },
      { teachingAssistants: user._id },
    ],
  };
};

// GET /api/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;
    const now = new Date();

    const courses = await Course.find(userCourseQuery(user)).select(
      "_id title code instructor enrolledStudents teachingAssistants"
    );
    const courseIds = courses.map((c) => c._id);

    const groups = await StudyGroup.find({
      $or: [{ creator: userId }, { members: userId }],
    }).select("_id title");
    const groupIds = groups.map((g) => g._id);

    const [
      assignments,
      announcements,
      appointments,
      bookings,
      sessions,
      notifications,
      facultyMembers,
    ] = await Promise.all([
      courseIds.length
        ? CourseAssignment.find({
            course: { $in: courseIds },
            dueDate: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
          })
            .populate("course", "title code")
            .sort({ dueDate: 1 })
            .limit(20)
        : [],
      courseIds.length
        ? CourseAnnouncement.find({ course: { $in: courseIds } })
            .populate("course", "title code")
            .populate("author", "fullName")
            .sort({ createdAt: -1 })
            .limit(8)
        : [],
      Appointment.find({
        $or: [{ student: userId }, { faculty: userId }],
        status: { $ne: "cancelled" },
      })
        .populate("faculty", "fullName department")
        .populate("student", "fullName")
        .sort({ date: 1, startTime: 1 }),
      Booking.find({
        $or: [{ student: userId }, { mentor: userId }],
        status: { $in: ["pending", "confirmed", "rescheduled"] },
        scheduledAt: { $gte: now },
      })
        .populate("skill", "title")
        .populate("mentor", "fullName")
        .populate("student", "fullName")
        .sort({ scheduledAt: 1 })
        .limit(20),
      groupIds.length
        ? StudyGroupSession.find({
            group: { $in: groupIds },
            scheduledAt: { $gte: now },
          })
            .populate("group", "title")
            .sort({ scheduledAt: 1 })
            .limit(20)
        : [],
      Notification.find({ recipient: userId })
        .populate("sender", "fullName profilePicture")
        .sort({ createdAt: -1 })
        .limit(12),
      User.find({ role: { $in: ["faculty", "teacher"] } })
        .select("fullName department role")
        .limit(20),
    ]);

    const isStudent = (user.role || "student").toLowerCase() === "student";

    const assignmentTasks = assignments
      .filter((a) => {
        if (!isStudent) return true;
        const submitted = (a.submissions || []).some(
          (s) => s.student && s.student.toString() === userId.toString()
        );
        return !submitted;
      })
      .map((a) => ({
        id: a._id.toString(),
        title: a.title,
        due: formatDue(a.dueDate),
        urgent: new Date(a.dueDate).getTime() - now.getTime() < 24 * 60 * 60 * 1000,
        href: `/courses/${a.course?._id || a.course}`,
        kind: "assignment",
        course: a.course?.title || "",
      }));

    const bookingTasks = bookings.map((b) => {
      const skillTitle = b.skill?.title || "Skill session";
      const other =
        b.mentor?._id?.toString() === userId.toString()
          ? b.student?.fullName
          : b.mentor?.fullName;
      return {
        id: `booking-${b._id}`,
        title: other ? `${skillTitle} with ${other}` : skillTitle,
        due: formatDue(b.scheduledAt),
        urgent: new Date(b.scheduledAt).getTime() - now.getTime() < 24 * 60 * 60 * 1000,
        href: "/my-sessions",
        kind: "booking",
      };
    });

    const tasks = [...assignmentTasks, ...bookingTasks]
      .sort((a, b) => Number(b.urgent) - Number(a.urgent))
      .slice(0, 6);

    const calendarEvents = [];

    bookings.forEach((b) => {
      calendarEvents.push({
        id: `cal-booking-${b._id}`,
        title: b.skill?.title
          ? `Skill Exchange: ${b.skill.title}`
          : "Skill Exchange Session",
        time: formatEventWhen(b.scheduledAt),
        sortAt: new Date(b.scheduledAt).getTime(),
        href: "/my-sessions",
        kind: "booking",
      });
    });

    appointments.forEach((apt) => {
      const when = parseAppointmentDate(apt.date, apt.startTime);
      const other =
        apt.faculty?._id?.toString() === userId.toString()
          ? apt.student?.fullName
          : apt.faculty?.fullName;
      calendarEvents.push({
        id: `cal-apt-${apt._id}`,
        title: other
          ? `Appointment with ${other}`
          : apt.reason || "Faculty appointment",
        time: formatEventWhen(when, formatClock(apt.startTime)),
        sortAt: when.getTime(),
        href: "/calendar",
        kind: "appointment",
      });
    });

    sessions.forEach((s) => {
      calendarEvents.push({
        id: `cal-session-${s._id}`,
        title: s.group?.title
          ? `Study Group: ${s.title}`
          : s.title,
        time: formatEventWhen(s.scheduledAt),
        sortAt: new Date(s.scheduledAt).getTime(),
        href: `/study-groups/${s.group?._id || s.group}`,
        kind: "study-session",
      });
    });

    assignments.slice(0, 8).forEach((a) => {
      calendarEvents.push({
        id: `cal-assign-${a._id}`,
        title: a.course?.code
          ? `${a.course.code}: ${a.title}`
          : a.title,
        time: formatEventWhen(a.dueDate, "Due"),
        sortAt: new Date(a.dueDate).getTime(),
        href: `/courses/${a.course?._id || a.course}`,
        kind: "assignment",
      });
    });

    calendarEvents.sort((a, b) => a.sortAt - b.sortAt);

    const activities = notifications.map((n) => ({
      id: n._id.toString(),
      type: ACTIVITY_TYPE_MAP[n.type] || "announcement",
      actor: n.sender?.fullName || "Scholara",
      action: n.message,
      course: "",
      time: formatRelativeTime(n.createdAt),
      href: n.link || "",
      title: n.title,
    }));

    const mappedAnnouncements = announcements.map((note) => ({
      id: note._id.toString(),
      text: note.course?.title
        ? `${note.title} (${note.course.title})`
        : note.title,
      time: formatRelativeTime(note.createdAt),
      href: `/courses/${note.course?._id || note.course}`,
    }));

    res.json({
      tasks,
      calendarEvents: calendarEvents.slice(0, 12),
      activities,
      announcements: mappedAnnouncements,
      facultyMembers: facultyMembers.map((f) => ({
        _id: f._id,
        name: f.fullName,
        fullName: f.fullName,
        department: f.department || "",
      })),
    });
  } catch (error) {
    console.error("Get Dashboard Error:", error);
    res.status(500).json({
      message: "Failed to load dashboard",
      error: error.message,
    });
  }
};
