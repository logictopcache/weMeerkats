import { motion } from "framer-motion";
import { FiX, FiMail, FiLogOut, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AccountRejected = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const userEmail = localStorage.getItem("userEmail");
  const rejectionReason = localStorage.getItem("rejectionReason");

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/signin");
  };

  const handleBackToSignin = () => {
    localStorage.clear();
    navigate("/signin");
  };

  const handleReapply = () => {
    localStorage.clear();
    navigate("/signup");
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
          className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FiX className="text-4xl text-red-400" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-white mb-4"
        >
          Account Application Rejected
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

          <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <FiX className="text-red-400 text-xl" />
            <div className="text-left">
              <p className="text-red-400 font-medium text-sm">
                Application Rejected
              </p>
              <p className="text-white/60 text-xs">
                Your {userRole} application was not approved
              </p>
            </div>
          </div>
        </motion.div>

        {/* Rejection Reason */}
        {rejectionReason && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-6"
          >
            <h3 className="text-red-400 font-medium text-sm mb-2">
              Reason for Rejection:
            </h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {rejectionReason}
            </p>
          </motion.div>
        )}

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 rounded-lg p-4 mb-6"
        >
          <p className="text-white/80 text-sm leading-relaxed">
            Unfortunately, your {userRole} application has been rejected by our
            admin team. You can review the feedback above and consider
            reapplying with improvements.
          </p>
        </motion.div>

        {/* Status Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
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
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <FiX className="text-white text-xs" />
            </div>
            <span className="text-red-400 text-sm">Application rejected</span>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="space-y-3"
        >
          <button
            onClick={handleReapply}
            className="w-full py-3 bg-primary-color hover:bg-primary-color/80 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <FiRefreshCw size={16} />
            Apply Again
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
          transition={{ delay: 0.9 }}
          className="text-white/40 text-xs mt-6"
        >
          Please review the feedback carefully before reapplying. Contact
          support if you need clarification.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AccountRejected;
