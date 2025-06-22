import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Account from "../../components/account/Account";
import { useSignUpForm } from "../../hooks/useSignUpForm";
import name from "/signup/user.png";
import email from "/signup/email.png";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { validateForm } from "../../utils/validation";
import { motion } from "framer-motion";

const Form = () => {
  const navigate = useNavigate();
  const { formData, loading, error, handleInputChange, handleSubmit } =
    useSignUpForm();
  const [role, setRole] = useState("mentee");
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const validationRules = {
    firstName: {
      required: true,
      message: "Please fill out all fields before submitting",
    },
    lastName: {
      required: true,
      message: "Please fill out all fields before submitting",
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please provide a valid email address",
    },
    password: {
      required: true,
      minLength: 6,
      message: "Password must be at least 6 characters long",
    },
  };

  const nextStep = () => {
    let hasErrors = false;
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
        hasErrors = true;
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
        hasErrors = true;
      }
    } else if (currentStep === 2) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
        hasErrors = true;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
        hasErrors = true;
      }
      if (!formData.password) {
        newErrors.password = "Password is required";
        hasErrors = true;
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
        hasErrors = true;
      }
    }

    setErrors(newErrors);

    if (!hasErrors) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    // Only proceed with signup if we're on the final step and a role is selected
    if (currentStep !== 3) {
      nextStep();
      return;
    }

    if (!role) {
      toast.error("Please select a role to continue");
      return;
    }

    try {
      // Only make the API call on the final step
      if (currentStep === 3) {
        const response = await handleSubmit(role);

        // Store necessary user data
        if (response.data) {
          localStorage.setItem("userId", response.data.id);
          localStorage.setItem("userEmail", response.data.email);
          localStorage.setItem("userRole", role);
          // Store password temporarily for sign-in after OTP verification
          localStorage.setItem("tempPassword", formData.password);
        }

        // Navigate to verification page with success message
        navigate("/verify-otp", {
          state: {
            showSuccessToast: true,
            message:
              "Account created successfully! Please verify your email to continue.",
            redirectTo: role === "mentor" ? "/mentor" : "/mentee",
          },
        });
      }
    } catch (error) {
      console.error("Signup Error:", error);
      toast.error(error.message || "Failed to create account");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <form onSubmit={handleSignUp} className="space-y-8">
        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 justify-between items-center">
            <motion.div
              initial={{ width: "33%" }}
              animate={{ width: currentStep === 1 ? "33%" : "100%" }}
              transition={{ duration: 0.5 }}
              className="h-1 bg-primary-color rounded-full"
            />
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-gray-400">Personal Info</span>
            <span className="text-xs text-gray-400">Account Details</span>
            <span className="text-xs text-gray-400">Role Selection</span>
          </div>
        </div>

        {/* Step 1: Personal Information */}
        <motion.div
          initial={false}
          animate={{
            opacity: currentStep === 1 ? 1 : 0,
            x: currentStep === 1 ? 0 : -20,
          }}
          className={`space-y-4 ${currentStep !== 1 ? "hidden" : ""}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <input
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-primary-color text-white placeholder-gray-400 transition-all"
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                <img
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-30 group-hover:opacity-60 transition-opacity"
                  src={name}
                  alt=""
                />
              </div>
              {errors.firstName && (
                <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
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
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-primary-color text-white placeholder-gray-400 transition-all"
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                <img
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-30 group-hover:opacity-60 transition-opacity"
                  src={name}
                  alt=""
                />
              </div>
              {errors.lastName && (
                <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Step 2: Account Details */}
        <motion.div
          initial={false}
          animate={{
            opacity: currentStep === 2 ? 1 : 0,
            x: currentStep === 2 ? 0 : 20,
          }}
          className={`space-y-6 ${currentStep !== 2 ? "hidden" : ""}`}
        >
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <label className="block text-gray-400 text-sm mb-2">
                  Email Address
                </label>
                <input
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-primary-color text-white placeholder-gray-400 transition-all"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                <img
                  className="absolute right-4 top-[55%] transform -translate-y-1/2 w-5 h-5 opacity-30 group-hover:opacity-60 transition-opacity"
                  src={email}
                  alt=""
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email}</p>
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
                <label className="block text-gray-400 text-sm mb-2">
                  Password
                </label>
                <input
                  className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-primary-color text-white placeholder-gray-400 transition-all"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[66%] transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1">{errors.password}</p>
              )}
              <p className="text-gray-500 text-xs mt-2">
                Password must be at least 6 characters long
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Step 3: Role Selection */}
        <motion.div
          initial={false}
          animate={{
            opacity: currentStep === 3 ? 1 : 0,
            x: currentStep === 3 ? 0 : 20,
          }}
          className={`space-y-6 ${currentStep !== 3 ? "hidden" : ""}`}
        >
          <div className="text-center">
            <h3 className="text-2xl text-white font-bold mb-4">
              Choose Your Role
            </h3>
            <p className="text-gray-400 mb-8">
              Select how you want to participate in our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 rounded-xl cursor-pointer transition-all ${
                role === "mentee"
                  ? "bg-primary-color bg-opacity-20 border-2 border-primary-color"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              onClick={() => {
                setRole("mentee");
              }}
            >
              <h4 className="text-xl font-semibold text-white mb-2">Mentee</h4>
              <p className="text-gray-400 text-sm">
                Join as a learner and connect with experienced mentors
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-6 rounded-xl cursor-pointer transition-all ${
                role === "mentor"
                  ? "bg-primary-color bg-opacity-20 border-2 border-primary-color"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
              onClick={() => {
                setRole("mentor");
              }}
            >
              <h4 className="text-xl font-semibold text-white mb-2">Mentor</h4>
              <p className="text-gray-400 text-sm">
                Share your expertise and guide aspiring professionals
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <motion.button
              type="button"
              onClick={prevStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 text-white bg-white/10 rounded-lg hover:bg-white/20 transition-all"
            >
              Back
            </motion.button>
          )}

          {currentStep < 3 ? (
            <motion.button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                nextStep();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 text-white bg-primary-color rounded-lg hover:bg-primary-color/90 transition-all ml-auto"
            >
              Next
            </motion.button>
          ) : (
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group px-8 py-3 ml-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-color to-blue-600 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="relative px-6 py-3 bg-primary-color bg-opacity-40 rounded-lg group-hover:bg-opacity-0 transition-all">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="ml-2 text-white font-medium">
                      Creating Account...
                    </span>
                  </div>
                ) : (
                  <span className="text-white font-medium">Create Account</span>
                )}
              </div>
            </motion.button>
          )}
        </div>
      </form>
    </motion.div>
  );
};

const SignUp = () => {
  return (
    <Account
      greet="Join Our Community"
      greet_text="Begin your journey of growth and learning. Connect with mentors and peers who share your passion."
      btn={<Link to="/signin">Sign In</Link>}
      acc_heading="Create Your Account"
      acc_subheading="Take the first step towards your goals"
      form={<Form />}
    />
  );
};

export default SignUp;
