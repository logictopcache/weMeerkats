import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "react-icons/fi";
import {
  getDashboardStats,
  getPendingMentors,
  getPendingMentees,
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
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

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

  const handleApprove = async (id, type) => {
    try {
      setActionLoading({ ...actionLoading, [`${type}_${id}`]: true });

      if (type === "mentor") {
        await approveMentor(id);
        setPendingMentors((prev) => prev.filter((m) => m._id !== id));
        toast.success("Mentor approved successfully!");
      } else {
        await approveMentee(id);
        setPendingMentees((prev) => prev.filter((m) => m._id !== id));
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
        toast.success("Mentor rejected successfully!");
      } else {
        await rejectMentee(selectedUser.id, rejectReason);
        setPendingMentees((prev) =>
          prev.filter((m) => m._id !== selectedUser.id)
        );
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

  const handleLogout = () => {
    adminLogout();
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300"
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

  const UserCard = ({ user, type, onApprove, onReject, isLoading }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-300"
    >
      <div className="flex items-start gap-4">
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
          {user.profile?.fullName && (
            <p className="text-white/40 text-xs mt-1">
              {user.profile.fullName}
            </p>
          )}

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
        </div>
      </div>
    </motion.div>
  );

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
        <div className="flex gap-4 mb-8">
          {[
            { id: "overview", label: "Overview", icon: FiUsers },
            { id: "mentors", label: "Pending Mentors", icon: FiUserCheck },
            { id: "mentees", label: "Pending Mentees", icon: FiUserX },
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(id)}
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

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Mentors"
                value={stats.totalMentors || 0}
                icon={FiUsers}
                color="bg-blue-500/20"
              />
              <StatCard
                title="Total Mentees"
                value={stats.totalMentees || 0}
                icon={FiUsers}
                color="bg-green-500/20"
              />
              <StatCard
                title="Pending Mentors"
                value={stats.pendingMentors || 0}
                icon={FiClock}
                color="bg-yellow-500/20"
              />
              <StatCard
                title="Pending Mentees"
                value={stats.pendingMentees || 0}
                icon={FiClock}
                color="bg-orange-500/20"
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
          </div>
        )}

        {/* Pending Mentors Tab */}
        {activeTab === "mentors" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Pending Mentor Approvals ({pendingMentors.length})
              </h2>
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
                    isLoading={actionLoading[`mentor_${mentor._id}`]}
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
              <h2 className="text-xl font-semibold text-white">
                Pending Mentee Approvals ({pendingMentees.length})
              </h2>
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
                    isLoading={actionLoading[`mentee_${mentee._id}`]}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0A1128] border border-white/10 rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Reject {selectedUser?.type === "mentor" ? "Mentor" : "Mentee"}
            </h3>
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
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
