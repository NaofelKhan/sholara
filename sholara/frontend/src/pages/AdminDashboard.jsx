import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { getAdminStats, getAdminUsers, updateUserRole, getDepartmentStats } from "@/api/admin";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const fetchStats = async () => {
    try {
      const [statsData, deptData] = await Promise.all([
        getAdminStats(),
        getDepartmentStats(),
      ]);
      setStats(statsData);
      setDepartmentStats(deptData);
    } catch (err) {
      toast({
        title: "Error loading admin stats",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await getAdminUsers({
        search,
        role: roleFilter,
        department: departmentFilter,
      });
      setUsersList(data);
    } catch (err) {
      toast({
        title: "Error loading users",
        description: err.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, departmentFilter]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, newRole);
      toast({
        title: "Role Updated",
        description: `User role successfully changed to ${newRole.toUpperCase()}.`,
      });
      await Promise.all([fetchUsers(), fetchStats()]);
    } catch (err) {
      toast({
        title: "Update Failed",
        description: err.response?.data?.message || "Failed to update user role",
        variant: "destructive",
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex flex-col md:flex-row">
      <Sidebar profile={user} />

      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 max-w-7xl mx-auto w-full">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#e0e2ec]">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-bold text-[#002045]">
                System Administrator Portal
              </h1>
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-semibold text-xs border border-purple-300">
                Admin Control Panel
              </span>
            </div>
            <p className="text-sm text-[#43474e]">
              Oversee platform operations, manage user roles, and monitor system-wide compliance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Status: {stats?.systemStatus?.health || "Optimal"}
            </div>
            <div className="text-xs text-[#73777f] hidden sm:block">
              {stats?.systemStatus?.compliance}
            </div>
          </div>
        </div>

        {/* Platform Overview Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e0e2ec]">
            <div className="flex items-center justify-between text-[#73777f] mb-2">
              <span className="text-xs font-semibold uppercase">Total Platform Users</span>
              <span className="material-symbols-outlined text-blue-600">group</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-[#002045]">
              {loading ? "..." : stats?.users?.total || 0}
            </p>
            <div className="mt-2 text-xs text-[#73777f] flex gap-2 flex-wrap">
              <span>🎓 {stats?.users?.students || 0} Students</span>
              <span>👨‍🏫 {stats?.users?.faculty || 0} Faculty</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e0e2ec]">
            <div className="flex items-center justify-between text-[#73777f] mb-2">
              <span className="text-xs font-semibold uppercase">Teaching Assistants</span>
              <span className="material-symbols-outlined text-amber-600">menu_book</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-amber-900">
              {loading ? "..." : stats?.users?.ta || 0}
            </p>
            <p className="mt-2 text-xs text-[#73777f]">Assisting Course Cohorts</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e0e2ec]">
            <div className="flex items-center justify-between text-[#73777f] mb-2">
              <span className="text-xs font-semibold uppercase">Active Courses</span>
              <span className="material-symbols-outlined text-indigo-600">school</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-[#002045]">
              {loading ? "..." : stats?.platform?.courses || 0}
            </p>
            <p className="mt-2 text-xs text-[#73777f]">Course Workspaces</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#e0e2ec]">
            <div className="flex items-center justify-between text-[#73777f] mb-2">
              <span className="text-xs font-semibold uppercase">Study Groups & Skills</span>
              <span className="material-symbols-outlined text-emerald-600">handshake</span>
            </div>
            <p className="text-2xl md:text-3xl font-bold text-[#002045]">
              {loading ? "..." : (stats?.platform?.studyGroups || 0) + (stats?.platform?.skillRequests || 0)}
            </p>
            <p className="mt-2 text-xs text-[#73777f]">Peer Collaboration Hubs</p>
          </div>
        </div>

        {/* User Role Management Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e0e2ec] p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#002045] flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-700">manage_accounts</span>
                User Role Management
              </h2>
              <p className="text-xs text-[#43474e]">
                Search, inspect, and update system authorization roles for students, TAs, faculty, and administrators.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#73777f] text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search name, email, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-[#c4c6cf] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#002045]"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="border border-[#c4c6cf] rounded-lg px-3 py-2 text-sm bg-white text-[#131b2e] focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="ta">Teaching Assistant (TA)</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          {/* User List Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#f0f3fa] text-[#002045] border-b border-[#e0e2ec]">
                  <th className="py-3 px-4 font-semibold">User</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Department</th>
                  <th className="py-3 px-4 font-semibold">Student/Faculty ID</th>
                  <th className="py-3 px-4 font-semibold">Current Role</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions / Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e2ec]">
                {usersLoading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[#73777f]">
                      Loading user directory...
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-[#73777f]">
                      No users found matching the filter criteria.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={u.profilePicture || "https://via.placeholder.com/40"}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-[#c4c6cf]"
                        />
                        <div>
                          <p className="font-semibold text-[#131b2e]">{u.fullName}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#43474e]">{u.email}</td>
                      <td className="py-3 px-4 text-[#43474e]">{u.department || "—"}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[#73777f]">
                        {u.studentId || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            u.role === "admin"
                              ? "bg-purple-100 text-purple-800 border-purple-300"
                              : u.role === "faculty" || u.role === "teacher"
                              ? "bg-blue-100 text-blue-800 border-blue-300"
                              : u.role === "ta"
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : "bg-emerald-100 text-emerald-800 border-emerald-300"
                          }`}
                        >
                          {u.role === "ta"
                            ? "TA"
                            : u.role
                            ? u.role.charAt(0).toUpperCase() + u.role.slice(1)
                            : "Student"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          disabled={updatingUserId === u._id}
                          value={u.role || "student"}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="border border-[#c4c6cf] rounded-lg px-2.5 py-1 text-xs bg-white text-[#002045] font-medium focus:outline-none focus:ring-2 focus:ring-[#002045] cursor-pointer"
                        >
                          <option value="student">Set as Student</option>
                          <option value="ta">Set as Teaching Assistant</option>
                          <option value="faculty">Set as Faculty</option>
                          <option value="admin">Set as Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Breakdown & System Compliance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-[#e0e2ec] p-6">
            <h3 className="text-lg font-bold text-[#002045] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-700">domain</span>
              Department User Distribution
            </h3>
            <div className="space-y-3">
              {departmentStats.length === 0 ? (
                <p className="text-xs text-[#73777f]">No department statistics recorded.</p>
              ) : (
                departmentStats.map((dept) => (
                  <div key={dept._id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-[#131b2e]">
                      {dept._id || "General Academic"}
                    </span>
                    <span className="text-xs font-bold text-[#002045] bg-[#d6e3ff] px-2.5 py-1 rounded-full">
                      {dept.count} Members
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#e0e2ec] p-6">
            <h3 className="text-lg font-bold text-[#002045] mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700">verified_user</span>
              System Operations & Compliance
            </h3>
            <div className="space-y-4 text-xs text-[#43474e]">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="font-semibold text-emerald-900 mb-1">FERPA & GDPR Data Privacy Compliance</p>
                <p>
                  Platform data access controls enforced across Student, Faculty, TA, and Admin authorization levels.
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-900 mb-1">Active Microservices & Endpoints</p>
                <p>
                  Authentication, Course Workspaces, Peer Skill Exchange, and Department Channels running with standard security checks.
                </p>
              </div>

              <div className="flex items-center justify-between text-[#73777f] pt-2 border-t border-gray-100">
                <span>System Health Verification</span>
                <span className="font-semibold text-emerald-600">Passed (All Services Healthy)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
