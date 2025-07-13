import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiShield,
  FiLogOut,
  FiEye,
  FiCheck,
  FiX,
  FiFilter,
  FiSearch,
  FiDownload,
  FiGrid,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiAward,
  FiBook,
  FiTrendingUp,
  FiPieChart
} from "react-icons/fi";
import {
  getDashboardStats,
  getPendingMentors,
  getPendingMentees,
  getMentors,
  getMentees,
  getMentorDetails,
  getMenteeDetails,
  approveMentor,
  rejectMentor,
  approveMentee,
  rejectMentee,
  adminLogout,
} from "../../services/api/adminService";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProfileAvatar from "../../components/ProfileAvatar";
import { API_ENDPOINTS } from "../../services/api/config";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingMentors, setPendingMentors] = useState([]);
  const [pendingMentees, setPendingMentees] = useState([]);
  const [allMentors, setAllMentors] = useState([]);
  const [allMentees, setAllMentees] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    dateRange: "",
  });
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  
  const navigate = useNavigate();
  const itemsPerPage = 12;

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "all-mentors") {
      loadAllMentors();
    } else if (activeTab === "all-mentees") {
      loadAllMentees();
    }
  }, [activeTab, currentPage, filters]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [statsData, mentorsData, menteesData] = await Promise.all([
        getDashboardStats(),
        getPendingMentors(),
        getPendingMentees(),
      ]);

      setStats(statsData);
      setPendingMentors(mentorsData);
      setPendingMentees(menteesData);
    } catch (error) {
      toast.error("Failed to load dashboard data");
      if (error.message.includes("Token") || error.message.includes("401")) {
        navigate("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllMentors = async () => {
    try {
      setIsLoading(true);
      // For now, get all mentors and filter client-side
      const response = await getMentors("", currentPage, itemsPerPage);
      setAllMentors(response.mentors || response);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load mentors");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllMentees = async () => {
    try {
      setIsLoading(true);
      // For now, get all mentees and filter client-side
      const response = await getMentees("", currentPage, itemsPerPage);
      setAllMentees(response.mentees || response);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      toast.error("Failed to load mentees");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get user status
  const getUserStatus = (user) => {
    if (user.rejected) return 'rejected';
    if (user.verified) return 'approved';
    return 'pending';
  };

  // Filter users based on current filters
  const filterUsers = (users) => {
    return users.filter(user => {
      const status = getUserStatus(user);
      const matchesStatus = !filters.status || status === filters.status;
      const matchesSearch = !filters.search || 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  };

  const handleViewUserDetails = async (userId, type) => {
    try {
      setActionLoading({ ...actionLoading, [`view_${userId}`]: true });
      const details = type === "mentor" 
        ? await getMentorDetails(userId)
        : await getMenteeDetails(userId);
      setUserDetails({ ...details, type });
      setShowUserModal(true);
    } catch (error) {
      toast.error("Failed to load user details");
    } finally {
      setActionLoading({ ...actionLoading, [`view_${userId}`]: false });
    }
  };

  const handleApprove = async (id, type) => {
    try {
      setActionLoading({ ...actionLoading, [`${type}_${id}`]: true });

      if (type === "mentor") {
        await approveMentor(id);
        setPendingMentors((prev) => prev.filter((m) => m._id !== id));
        setAllMentors((prev) => prev.map(m => m._id === id ? {...m, verified: true, rejected: false} : m));
        toast.success("Mentor approved successfully!");
      } else {
        await approveMentee(id);
        setPendingMentees((prev) => prev.filter((m) => m._id !== id));
        setAllMentees((prev) => prev.map(m => m._id === id ? {...m, verified: true, rejected: false} : m));
        toast.success("Mentee approved successfully!");
      }

      // Refresh stats
      const newStats = await getDashboardStats();
      setStats(newStats);
    } catch (error) {
      toast.error(`Failed to approve ${type}`);
    } finally {
      setActionLoading({ ...actionLoading, [`${type}_${id}`]: false });
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setActionLoading({
        ...actionLoading,
        [`${selectedUser.type}_${selectedUser.id}`]: true,
      });

      if (selectedUser.type === "mentor") {
        await rejectMentor(selectedUser.id, rejectReason);
        setPendingMentors((prev) =>
          prev.filter((m) => m._id !== selectedUser.id)
        );
        setAllMentors((prev) => prev.map(m => m._id === selectedUser.id ? {...m, verified: false, rejected: true} : m));
        toast.success("Mentor rejected successfully!");
      } else {
        await rejectMentee(selectedUser.id, rejectReason);
        setPendingMentees((prev) =>
          prev.filter((m) => m._id !== selectedUser.id)
        );
        setAllMentees((prev) => prev.map(m => m._id === selectedUser.id ? {...m, verified: false, rejected: true} : m));
        toast.success("Mentee rejected successfully!");
      }

      // Refresh stats
      const newStats = await getDashboardStats();
      setStats(newStats);

      setShowRejectModal(false);
      setSelectedUser(null);
      setRejectReason("");
    } catch (error) {
      toast.error(`Failed to reject ${selectedUser.type}`);
    } finally {
      setActionLoading({
        ...actionLoading,
        [`${selectedUser.type}_${selectedUser.id}`]: false,
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      const currentType = activeTab === "mentors" ? "mentor" : "mentee";
      const promises = selectedUsers.map(id => 
        currentType === "mentor" ? approveMentor(id) : approveMentee(id)
      );
      
      await Promise.all(promises);
      
      if (currentType === "mentor") {
        setPendingMentors(prev => prev.filter(m => !selectedUsers.includes(m._id)));
      } else {
        setPendingMentees(prev => prev.filter(m => !selectedUsers.includes(m._id)));
      }
      
      setSelectedUsers([]);
      toast.success(`Bulk approved ${selectedUsers.length} ${currentType}s successfully!`);
      
      // Refresh stats and data
      await loadDashboardData();
    } catch (error) {
      toast.error("Failed to bulk approve users");
    }
  };

  const handleLogout = () => {
    adminLogout();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const exportData = () => {
    const rawData = activeTab === "all-mentors" ? allMentors : allMentees;
    const data = filterUsers(rawData);
    const csv = convertToCSV(data);
    const filename = `${activeTab}-${filters.status ? `${filters.status}-` : ''}${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
    toast.success(`Exported ${data.length} records successfully!`);
  };

  const convertToCSV = (data) => {
    if (!data.length) return "";
    
    const getStatus = (user) => {
      if (user.rejected) return 'rejected';
      if (user.verified) return 'approved';
      return 'pending';
    };
    
    const headers = ["Name", "Email", "Status", "Skills", "Registration Date"];
    const rows = data.map(user => [
      `${user.firstName} ${user.lastName}`,
      user.email,
      getStatus(user),
      user.profile?.skills?.join("; ") || "",
      new Date(user.createdAt).toLocaleDateString()
    ]);
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(",")).join("\n");
  };

  const downloadCSV = (csv, filename) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, onClick }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          {trend && (
            <p
              className={`text-sm mt-2 ${
                trend > 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {trend > 0 ? "+" : ""}
              {trend}% from last month
            </p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color}`}>
          <Icon className="text-2xl text-white" />
        </div>
      </div>
    </motion.div>
  );

  const UserCard = ({ user, type, onApprove, onReject, onView, isLoading, showCheckbox = false }) => {
    // Determine status based on verified and rejected flags
    const getStatus = () => {
      if (user.rejected) return 'rejected';
      if (user.verified) return 'approved';
      return 'pending';
    };
    
    const status = getStatus();
    
    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
          {showCheckbox && (
            <input
              type="checkbox"
              checked={selectedUsers.includes(user._id)}
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedUsers([...selectedUsers, user._id]);
                } else {
                  setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                }
              }}
              className="mt-4 w-4 h-4 text-primary-color bg-transparent border-white/20 rounded focus:ring-primary-color"
            />
          )}
          
        <ProfileAvatar
          name={`${user.firstName} ${user.lastName}`}
          email={user.email}
          image={user.profile?.profilePictureUrl}
          size="lg"
        />
          
        <div className="flex-1">
          <h3 className="text-white font-semibold">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-white/60 text-sm">{user.email}</p>
            
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${
                status === 'approved' ? 'bg-green-500/20 text-green-400' :
                status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {status}
              </span>
            </div>

          {/* Skills/Expertise */}
          {user.profile?.skills && user.profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.profile.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-color/20 text-primary-color text-xs rounded-full"
                >
                  {skill}
                </span>
              ))}
              {user.profile.skills.length > 3 && (
                <span className="text-white/40 text-xs">
                  +{user.profile.skills.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Bio */}
          {user.profile?.bio && (
            <p className="text-white/50 text-sm mt-2 line-clamp-2">
              {user.profile.bio}
            </p>
          )}

          <p className="text-white/40 text-xs mt-2">
            Registered: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onView(user._id, type)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm rounded-lg transition-all disabled:opacity-50"
          >
            <FiEye size={14} />
            View
          </motion.button>
          
          {status === 'pending' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onApprove(user._id, type)}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm rounded-lg transition-all disabled:opacity-50"
          >
            <FiCheck size={14} />
            Approve
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReject(user._id, type)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-all disabled:opacity-50"
          >
            <FiX size={14} />
            Reject
          </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A1128] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-color/30 border-t-primary-color rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A1128]">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiShield className="text-primary-color text-2xl" />
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all"
            >
              <FiLogOut size={16} />
              Logout
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: "overview", label: "Overview", icon: FiPieChart },
            { id: "mentors", label: "Pending Mentors", icon: FiUserCheck },
            { id: "mentees", label: "Pending Mentees", icon: FiUserX },
            { id: "all-mentors", label: "All Mentors", icon: FiUsers },
            { id: "all-mentees", label: "All Mentees", icon: FiUsers },
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTab(id);
                setCurrentPage(1);
                setSelectedUsers([]);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === id
                  ? "bg-primary-color text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </motion.button>
          ))}
        </div>

        {/* Filter Controls */}
        {(activeTab === "all-mentors" || activeTab === "all-mentees") && (
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-color"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-color"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all"
              >
                <FiDownload size={16} />
                Export CSV
              </motion.button>

              {/* View Mode Toggle */}
              <div className="flex bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "grid" 
                      ? "bg-primary-color text-white" 
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "list" 
                      ? "bg-primary-color text-white" 
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions for Pending Users */}
        {(activeTab === "mentors" || activeTab === "mentees") && selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary-color/20 backdrop-blur-xl rounded-xl border border-primary-color/30 p-4 mb-6"
          >
            <div className="flex items-center justify-between">
              <p className="text-primary-color font-medium">
                {selectedUsers.length} {activeTab === "mentors" ? "mentor" : "mentee"}
                {selectedUsers.length > 1 ? "s" : ""} selected
              </p>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBulkApprove}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all"
                >
                  <FiCheck size={16} />
                  Bulk Approve
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedUsers([])}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg transition-all"
                >
                  <FiX size={16} />
                  Clear Selection
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveTab("mentors")}
                className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-left hover:bg-yellow-500/20 transition-all"
              >
                <FiClock className="text-2xl text-yellow-400 mb-2" />
                <p className="text-white font-semibold">Review Pending</p>
                <p className="text-white/60 text-sm">
                  {(stats.pendingMentors || 0) + (stats.pendingMentees || 0)} applications waiting
                </p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveTab("all-mentors")}
                className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left hover:bg-blue-500/20 transition-all"
              >
                <FiUsers className="text-2xl text-blue-400 mb-2" />
                <p className="text-white font-semibold">Manage Mentors</p>
                <p className="text-white/60 text-sm">{stats.totalMentors || 0} total mentors</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setActiveTab("all-mentees")}
                className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-left hover:bg-green-500/20 transition-all"
              >
                <FiUsers className="text-2xl text-green-400 mb-2" />
                <p className="text-white font-semibold">Manage Mentees</p>
                <p className="text-white/60 text-sm">{stats.totalMentees || 0} total mentees</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={exportData}
                className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-left hover:bg-purple-500/20 transition-all"
              >
                <FiDownload className="text-2xl text-purple-400 mb-2" />
                <p className="text-white font-semibold">Export Data</p>
                <p className="text-white/60 text-sm">Download user reports</p>
              </motion.button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Mentors"
                value={stats.totalMentors || 0}
                icon={FiUsers}
                color="bg-blue-500/20"
                onClick={() => setActiveTab("all-mentors")}
              />
              <StatCard
                title="Total Mentees"
                value={stats.totalMentees || 0}
                icon={FiUsers}
                color="bg-green-500/20"
                onClick={() => setActiveTab("all-mentees")}
              />
              <StatCard
                title="Pending Mentors"
                value={stats.pendingMentors || 0}
                icon={FiClock}
                color="bg-yellow-500/20"
                onClick={() => setActiveTab("mentors")}
              />
              <StatCard
                title="Pending Mentees"
                value={stats.pendingMentees || 0}
                icon={FiClock}
                color="bg-orange-500/20"
                onClick={() => setActiveTab("mentees")}
              />
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Approved Mentors"
                value={stats.approvedMentors || 0}
                icon={FiUserCheck}
                color="bg-green-500/20"
              />
              <StatCard
                title="Approved Mentees"
                value={stats.approvedMentees || 0}
                icon={FiUserCheck}
                color="bg-green-500/20"
              />
              <StatCard
                title="Rejected Mentors"
                value={stats.rejectedMentors || 0}
                icon={FiUserX}
                color="bg-red-500/20"
              />
              <StatCard
                title="Rejected Mentees"
                value={stats.rejectedMentees || 0}
                icon={FiUserX}
                color="bg-red-500/20"
              />
            </div>

            {/* Recent Activity Summary */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-primary-color" />
                Platform Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {((stats.approvedMentors || 0) / Math.max(1, (stats.totalMentors || 1)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-white/60 text-sm">Mentor Approval Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {((stats.approvedMentees || 0) / Math.max(1, (stats.totalMentees || 1)) * 100).toFixed(1)}%
                  </p>
                  <p className="text-white/60 text-sm">Mentee Approval Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {(stats.totalMentors || 0) + (stats.totalMentees || 0)}
                  </p>
                  <p className="text-white/60 text-sm">Total Platform Users</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending Mentors Tab */}
        {activeTab === "mentors" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white">
                Pending Mentor Approvals ({pendingMentors.length})
              </h2>
                {pendingMentors.length > 0 && (
                  <label className="flex items-center gap-2 text-white/60">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === pendingMentors.length && pendingMentors.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(pendingMentors.map(m => m._id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="w-4 h-4 text-primary-color bg-transparent border-white/20 rounded focus:ring-primary-color"
                    />
                    <span className="text-sm">Select All</span>
                  </label>
                )}
              </div>
            </div>

            {pendingMentors.length === 0 ? (
              <div className="text-center py-12">
                <FiUserCheck className="text-6xl text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">
                  No pending mentor approvals
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingMentors.map((mentor) => (
                  <UserCard
                    key={mentor._id}
                    user={mentor}
                    type="mentor"
                    onApprove={handleApprove}
                    onReject={(id, type) => {
                      setSelectedUser({ id, type });
                      setShowRejectModal(true);
                    }}
                    onView={handleViewUserDetails}
                    isLoading={actionLoading[`mentor_${mentor._id}`]}
                    showCheckbox={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pending Mentees Tab */}
        {activeTab === "mentees" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-white">
                Pending Mentee Approvals ({pendingMentees.length})
              </h2>
                {pendingMentees.length > 0 && (
                  <label className="flex items-center gap-2 text-white/60">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === pendingMentees.length && pendingMentees.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(pendingMentees.map(m => m._id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="w-4 h-4 text-primary-color bg-transparent border-white/20 rounded focus:ring-primary-color"
                    />
                    <span className="text-sm">Select All</span>
                  </label>
                )}
              </div>
            </div>

            {pendingMentees.length === 0 ? (
              <div className="text-center py-12">
                <FiUserCheck className="text-6xl text-white/20 mx-auto mb-4" />
                <p className="text-white/60 text-lg">
                  No pending mentee approvals
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {pendingMentees.map((mentee) => (
                  <UserCard
                    key={mentee._id}
                    user={mentee}
                    type="mentee"
                    onApprove={handleApprove}
                    onReject={(id, type) => {
                      setSelectedUser({ id, type });
                      setShowRejectModal(true);
                    }}
                    onView={handleViewUserDetails}
                    isLoading={actionLoading[`mentee_${mentee._id}`]}
                    showCheckbox={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

                 {/* All Mentors Tab */}
         {activeTab === "all-mentors" && (
           (() => {
             const filteredMentors = filterUsers(allMentors);
             return (
               <div>
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-semibold text-white">
                     All Mentors ({filteredMentors.length} of {allMentors.length})
                   </h2>
                   <div className="flex items-center gap-2">
                     <button
                       onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                       disabled={currentPage === 1}
                       className="p-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <FiChevronLeft size={18} />
                     </button>
                     <span className="text-white/60 text-sm">
                       Page {currentPage} of {totalPages}
                     </span>
                     <button
                       onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                       disabled={currentPage === totalPages}
                       className="p-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <FiChevronRight size={18} />
                     </button>
                   </div>
                 </div>

                 {filteredMentors.length === 0 ? (
                   <div className="text-center py-12">
                     <FiUserCheck className="text-6xl text-white/20 mx-auto mb-4" />
                     <p className="text-white/60 text-lg">
                       {allMentors.length === 0 ? "No mentors found." : "No mentors match your filters."}
                     </p>
                   </div>
                 ) : (
                   <div className="grid gap-4">
                     {filteredMentors.map((mentor) => (
                       <UserCard
                         key={mentor._id}
                         user={mentor}
                         type="mentor"
                         onApprove={handleApprove}
                         onReject={(id, type) => {
                           setSelectedUser({ id, type });
                           setShowRejectModal(true);
                         }}
                         onView={handleViewUserDetails}
                         isLoading={actionLoading[`mentor_${mentor._id}`]}
                       />
                     ))}
                   </div>
                 )}
               </div>
             );
           })()
         )}

                 {/* All Mentees Tab */}
         {activeTab === "all-mentees" && (
           (() => {
             const filteredMentees = filterUsers(allMentees);
             return (
               <div>
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-xl font-semibold text-white">
                     All Mentees ({filteredMentees.length} of {allMentees.length})
                   </h2>
                   <div className="flex items-center gap-2">
                     <button
                       onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                       disabled={currentPage === 1}
                       className="p-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <FiChevronLeft size={18} />
                     </button>
                     <span className="text-white/60 text-sm">
                       Page {currentPage} of {totalPages}
                     </span>
                     <button
                       onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                       disabled={currentPage === totalPages}
                       className="p-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       <FiChevronRight size={18} />
                     </button>
                   </div>
                 </div>

                 {filteredMentees.length === 0 ? (
                   <div className="text-center py-12">
                     <FiUserCheck className="text-6xl text-white/20 mx-auto mb-4" />
                     <p className="text-white/60 text-lg">
                       {allMentees.length === 0 ? "No mentees found." : "No mentees match your filters."}
                     </p>
                   </div>
                 ) : (
                   <div className="grid gap-4">
                     {filteredMentees.map((mentee) => (
                       <UserCard
                         key={mentee._id}
                         user={mentee}
                         type="mentee"
                         onApprove={handleApprove}
                         onReject={(id, type) => {
                           setSelectedUser({ id, type });
                           setShowRejectModal(true);
                         }}
                         onView={handleViewUserDetails}
                         isLoading={actionLoading[`mentee_${mentee._id}`]}
                       />
                     ))}
                   </div>
                 )}
               </div>
             );
           })()
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
      {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowRejectModal(false)}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[#0A1128] border border-white/10 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
          >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">
              Reject {selectedUser?.type === "mentor" ? "Mentor" : "Mentee"}
            </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="p-2 text-white/60 hover:text-white rounded-lg transition-all"
                >
                  <FiX size={20} />
                </button>
              </div>
            <p className="text-white/60 mb-4">
              Please provide a reason for rejection. This will help improve
              future applications.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary-color resize-none h-24"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedUser(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={
                  !rejectReason.trim() ||
                  actionLoading[`${selectedUser?.type}_${selectedUser?.id}`]
                }
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading[`${selectedUser?.type}_${selectedUser?.id}`]
                  ? "Rejecting..."
                  : "Reject"}
              </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      {showUserModal && userDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A1128] border border-white/10 rounded-2xl p-6 max-w-2xl w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                {userDetails.type === "mentor" ? "Mentor Details" : "Mentee Details"}
              </h3>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 text-white/60 hover:text-white rounded-lg transition-all"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-white/60 text-sm">Name:</p>
                <p className="text-white font-semibold">{userDetails.firstName} {userDetails.lastName}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Email:</p>
                <p className="text-white">{userDetails.email}</p>
              </div>
                             <div>
                 <p className="text-white/60 text-sm">Account Status:</p>
                 <p className={`text-white font-semibold ${
                   userDetails.rejected ? 'text-red-400' :
                   userDetails.verified ? 'text-green-400' :
                   'text-yellow-400'
                 }`}>
                   {userDetails.rejected ? 'rejected' : userDetails.verified ? 'approved' : 'pending'}
                 </p>
               </div>
              <div>
                <p className="text-white/60 text-sm">Registration Date:</p>
                <p className="text-white">{new Date(userDetails.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Skills:</p>
                <p className="text-white">{userDetails.profile?.skills?.join(", ") || "N/A"}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Bio:</p>
                <p className="text-white/50 text-sm">{userDetails.profile?.bio || "N/A"}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Contact:</p>
                <p className="text-white/60 text-sm">
                  {userDetails.profile?.phone && <><FiPhone size={14} /> {userDetails.profile.phone}<br /></>}
                  {userDetails.profile?.email && <><FiMail size={14} /> {userDetails.profile.email}<br /></>}
                  {userDetails.profile?.address && <><FiMapPin size={14} /> {userDetails.profile.address}<br /></>}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 bg-white/5 text-white/60 rounded-lg hover:bg-white/10 transition-all"
              >
                Close
              </button>
                             {!userDetails.verified && !userDetails.rejected && (
                <>
                  <button
                    onClick={() => handleApprove(userDetails._id, userDetails.type)}
                    disabled={actionLoading[`${userDetails.type}_${userDetails._id}`]}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading[`${userDetails.type}_${userDetails._id}`] ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser({ id: userDetails._id, type: userDetails.type });
                      setShowRejectModal(true);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
