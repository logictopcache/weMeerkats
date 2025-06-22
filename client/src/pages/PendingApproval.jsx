import { motion } from "framer-motion";
import { FiClock, FiMail, FiShield, FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const PendingApproval = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  const handleBackToSignin = () => {
    localStorage.clear();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-[#0A1128] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center"
      >
        {/* Header */}
        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-all"
          >
            <FiLogOut size={14} />
            Logout
          </motion.button>
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.4 }}
          className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FiClock className="text-4xl text-yellow-400" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-4"
        >
          Account Pending Approval
        </motion.h1>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-8"
        >
          <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <FiMail className="text-green-400 text-xl" />
            <div className="text-left">
              <p className="text-green-400 font-medium text-sm">
                Email Verified
              </p>
              <p className="text-white/60 text-xs">{userEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
            <FiShield className="text-yellow-400 text-xl" />
            <div className="text-left">
              <p className="text-yellow-400 font-medium text-sm">
                Admin Approval Pending
              </p>
              <p className="text-white/60 text-xs">
                Your {userRole} account is being reviewed
              </p>
            </div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 rounded-lg p-4 mb-6"
        >
          <p className="text-white/80 text-sm leading-relaxed">
            Thank you for verifying your email! Your {userRole} account is
            currently under review by our admin team. You'll be able to access
            the platform once your account is approved.
          </p>
        </motion.div>

        {/* Status Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-3 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <span className="text-green-400 text-sm">
              Email verification completed
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <FiClock className="text-white text-xs" />
            </div>
            <span className="text-yellow-400 text-sm">
              Admin approval in progress
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white/40 text-xs">3</span>
            </div>
            <span className="text-white/40 text-sm">Access granted</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="space-y-3"
        >
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary-color hover:bg-primary-color/80 text-white font-medium rounded-lg transition-all"
          >
            Check Status
          </button>

          <button
            onClick={handleBackToSignin}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white/60 font-medium rounded-lg transition-all"
          >
            Back to Sign In
          </button>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-white/40 text-xs mt-6"
        >
          This process usually takes 24-48 hours. You'll receive an email
          notification once approved.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PendingApproval;
