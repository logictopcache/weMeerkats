import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { verifyOTP, resendOTP, signIn } from '../../services/api/authService';
import { API_ENDPOINTS } from '../../services/api/config';
import { motion } from 'framer-motion';
import Account from '../../components/account/Account';

const Form = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Get role from localStorage
  const role = localStorage.getItem('userRole');
  const email = localStorage.getItem('userEmail');

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start the timer
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      const email = localStorage.getItem('userEmail');
      await resendOTP(userId, email, role);
      
      // Reset timer and OTP input
      setTimeLeft(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      
      toast.success('New verification code has been sent to your email');
    } catch (error) {
      toast.error(error.message || 'Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index, value) => {
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((value, index) => {
      if (index < 6 && /^[0-9]$/.test(value)) {
        newOtp[index] = value;
      }
    });
    setOtp(newOtp);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    const email = localStorage.getItem('userEmail');
    const password = localStorage.getItem('tempPassword');
    const role = localStorage.getItem('userRole');

    if (!userId || !email || !password || !role) {
      toast.error('Missing required information for verification');
      return;
    }

    if (timeLeft === 0) {
      toast.error('OTP has expired. Please request a new one.');
      return;
    }

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter a complete 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      // First verify OTP
      await verifyOTP(userId, otpString, role);
      
      // Then automatically sign in with proper credentials format
      const signInData = {
        email,
        password,
      };
      
      const signInResponse = await signIn(signInData, role);
      
      // Clear sensitive data
      localStorage.removeItem('tempPassword');
      
      // Store new auth data if needed
      if (signInResponse.token) {
        localStorage.setItem('authToken', signInResponse.token);
      }
      
      // Get the redirect path from location state
      const redirectPath = location.state?.redirectTo || '/signin';
      
      // Navigate to dashboard
      navigate(redirectPath, { 
        state: { 
          showSuccessToast: true,
          message: 'Email verified successfully! Welcome to your dashboard.'
        } 
      });
    } catch (error) {
      console.error('Verification Error:', error);
      toast.error(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <form onSubmit={handleVerify} className="space-y-8">
        <div className="flex justify-center space-x-3 mb-6">
          {otp.map((digit, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-blue-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <input
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-semibold bg-white/[0.03] border border-white/10 rounded-lg focus:outline-none focus:border-primary-color text-white placeholder-gray-400 transition-all"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-gray-400 mb-2">
            Time remaining: <span className={`font-medium ${timeLeft < 60 ? 'text-red-400' : 'text-primary-color'}`}>
              {formatTime(timeLeft)}
            </span>
          </p>
          {timeLeft === 0 && (
            <p className="text-sm text-red-400">Code expired. Please request a new one.</p>
          )}
        </div>

        <motion.button
          type="submit"
          disabled={loading || timeLeft === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full relative group ${loading || timeLeft === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-color to-blue-600 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="relative px-8 py-4 bg-primary-color bg-opacity-40 rounded-lg group-hover:bg-opacity-0 transition-all">
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span className="ml-2 text-white font-medium">Verifying...</span>
              </div>
            ) : (
              <span className="text-white font-medium">Verify Email</span>
            )}
          </div>
        </motion.button>

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={loading || !canResend}
            className={`text-sm transition-colors ${
              loading || !canResend 
                ? 'text-gray-500 cursor-not-allowed' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Resend verification code
          </button>
        </div>
      </form>
    </motion.div>
  );
};

const VerifyOTP = () => {
  return (
    <Account
      greet="Verify Your Account"
      greet_text="You're almost there! Please verify your email to complete your registration."
      btn={<Link to="/signin">Back to Sign In</Link>}
      acc_heading="Email Verification"
      acc_subheading="Enter the 6-digit code sent to your email"
      form={<Form />}
    />
  );
};

export default VerifyOTP; 