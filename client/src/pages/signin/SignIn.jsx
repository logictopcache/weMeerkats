import { Link, useLocation, useNavigate } from "react-router-dom";
import Account from "../../components/account/Account";
import email from "/signup/email.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster } from 'react-hot-toast';
import "react-toastify/dist/ReactToastify.css";
import { signIn } from "../../services/api/authService";
import toast from "react-hot-toast";

const Form = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("mentee");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? "Email is required" : "",
        password: !formData.password ? "Password is required" : "",
      });
      toast.error("Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const response = await signIn(formData, role);
      const dashboardPath = role === "mentor" ? "/mentor/home" : "/mentee/home";
      navigate(dashboardPath);
    } catch (error) {
      console.error("Login Error:", error);
      
      // Handle API error responses
      if (error.message === "Learner Not Found") {
        setErrors({ email: "Email not found" });
        toast.error("Account not found. Please check your email address.");
      } else if (error.message === "Invalid Credentials") {
        setErrors({ 
          email: "Invalid credentials",
          password: "Invalid credentials"
        });
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error.message || "Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Toaster position="top-center" />
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Role Selection */}
        <div className="mb-8">
          <div className="flex p-1 bg-white/5 rounded-xl backdrop-blur-sm">
            <motion.button
              type="button"
              onClick={() => setRole("mentee")}
              className={`flex-1 relative py-3 px-6 rounded-lg transition-all duration-300 ${
                role === "mentee" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {role === "mentee" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary-color rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative">Mentee</span>
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setRole("mentor")}
              className={`flex-1 relative py-3 px-6 rounded-lg transition-all duration-300 ${
                role === "mentor" ? "text-white" : "text-gray-400 hover:text-white"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {role === "mentor" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary-color rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative">Mentor</span>
            </motion.button>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-5 py-4 bg-white/[0.03] border ${
                  errors.email 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-white/10 focus:border-primary-color'
                } rounded-lg focus:outline-none text-white placeholder-gray-400 transition-all`}
                placeholder="Email"
                required
              />
              <img
                src={email}
                alt="email"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-30 group-hover:opacity-60 transition-opacity"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-5 py-4 bg-white/[0.03] border ${
                  errors.password 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-white/10 focus:border-primary-color'
                } rounded-lg focus:outline-none text-white placeholder-gray-400 transition-all`}
                placeholder="Password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </motion.div>
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <button
            type="submit"
            disabled={loading}
            className="w-full relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-color to-blue-600 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="relative px-8 py-4 bg-primary-color bg-opacity-40 rounded-lg group-hover:bg-opacity-0 transition-all">
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="ml-2 text-white font-medium">Signing in...</span>
                </div>
              ) : (
                <span className="text-white font-medium">Sign In</span>
              )}
            </div>
          </button>
        </motion.div>
      </form>
    </motion.div>
  );
};

const SignIn = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.state?.showSuccessToast) {
      toast.success(
        location.state.message ||
          "Account created successfully! Please sign in to continue.",
        {
          autoClose: 5000,
          position: "top-center",
        }
      );
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <Account
      greet="Welcome Back!"
      greet_text="Sign in to continue your journey of growth and connection. Your next breakthrough awaits."
      btn={<Link to="/signup">Create Account</Link>}
      acc_heading="Sign in to WeMeerkats"
      acc_subheading="Access your personalized mentorship experience"
      form={<Form />}
    />
  );
};

export default SignIn;
