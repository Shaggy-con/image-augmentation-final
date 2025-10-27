import { useState } from "react";
import API from "../api";
import {useNavigate} from 'react-router-dom';

export default function Auth() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [successMessage, setSuccessMessage] = useState(""); // For showing success messages

  const validatePassword = (password) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < 8) {
      return { valid: false, message: "Password must be at least 8 characters long" };
    }
    if (!hasUppercase) {
      return { valid: false, message: "Password must contain at least one uppercase letter" };
    }
    if (!hasLowercase) {
      return { valid: false, message: "Password must contain at least one lowercase letter" };
    }
    if (!hasNumber) {
      return { valid: false, message: "Password must contain at least one number" };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: "Password must contain at least one special character" };
    }
    return { valid: true, message: "Password is valid" };
  };

  const validateCredentials = () => {
    setError("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format");
      return false;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return false;
    }
    return true;
  };

  const validateOtp = () => {
    setError("");
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("OTP must be a valid 6-digit number");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (step === 'credentials') {
      if (!validateCredentials()) return;

      setIsLoading(true);
      setError("");
      try {
        if (isRegister) {
          const res = await API.post("/register", { email, password });
          setSuccessMessage(res.data.message || "Registration successful! Check your email for OTP.");
          setStep('otp');
          setError(""); // Clear errors
        } else {
          const res = await API.post("/login", { email, password });
          localStorage.setItem("token", res.data.access_token);
          navigate("/dashboard");
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error || "Something went wrong";
        setError(errorMsg);
        if (errorMsg.includes("verify your email")) {
          // Optionally switch to register if trying to login without verification
          setIsRegister(true);
          setStep('otp');
        }
      } finally {
        setIsLoading(false);
      }
    } else if (step === 'otp') {
      if (!validateOtp()) return;

      setIsLoading(true);
      setError("");
      try {
        const res = await API.post("/verify-otp", { email, otp });
        setSuccessMessage(res.data.message || "Email verified successfully!");
        setStep('credentials');
        setIsRegister(false); // Switch back to login mode
        setOtp(""); // Clear OTP
        setPassword(""); // Clear password for login
        setPasswordStrength(null);
        // Optionally auto-attempt login here, but for now, let user enter password again
      } catch (err) {
        setError(err.response?.data?.error || "Invalid or expired OTP. Please request a new one by registering again.");
        setSuccessMessage(""); // Clear success if error
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleResendOTP = async () => {
    if (!validateCredentials()) return;
    setIsLoading(true);
    try {
      await API.post("/register", { email, password }); // Re-trigger registration to resend OTP
      setSuccessMessage("OTP resent successfully! Check your email.");
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setIsRegister(!isRegister);
    setStep('credentials');
    setOtp("");
    setPassword("");
    setPasswordStrength(null);
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-blue-100 text-sm">
            {isRegister ? "Sign up to get started" : "Sign in to continue"}
          </p>
        </div>

        <div className="p-8">
          <div className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fadeIn">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg animate-fadeIn">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                    error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                      ? "border-red-400 focus:ring-red-100"
                      : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  } rounded-xl focus:ring-4 focus:outline-none transition-all duration-200 text-gray-700`}
                />
              </div>
            </div>
            
            {step === 'credentials' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (e.target.value) {
                          setPasswordStrength(validatePassword(e.target.value));
                        } else {
                          setPasswordStrength(null);
                        }
                      }}
                      className={`w-full pl-12 pr-4 py-3.5 border-2 ${
                        error && !validatePassword(password).valid && password.length > 0
                          ? "border-red-400 focus:ring-red-100"
                          : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                      } rounded-xl focus:ring-4 focus:outline-none transition-all duration-200 text-gray-700`}
                    />
                  </div>
                  {passwordStrength && password.length > 0 && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      passwordStrength.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}>
                      <p className={`text-sm font-medium flex items-center gap-2 ${
                        passwordStrength.valid ? "text-green-700" : "text-red-700"
                      }`}>
                        {passwordStrength.valid ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        {passwordStrength.message}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {step === 'otp' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Enter OTP
                </label>
                <p className="text-xs text-gray-500 mb-3">Sent to {email}</p>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className={`w-full px-4 py-3.5 border-2 ${
                    error && otp.length !== 6 ? "border-red-400 focus:ring-red-100" : "border-gray-200 focus:ring-blue-100 focus:border-blue-500"
                  } rounded-xl focus:ring-4 focus:outline-none transition-all duration-200 text-center text-2xl tracking-widest font-bold text-gray-700`}
                />
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive OTP?{" "}
                    <button
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50 transition-colors"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleSubmit}
              disabled={isLoading || (!email && !password && !otp)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none relative overflow-hidden group"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                step === 'otp' ? "Verify OTP" : (isRegister ? "Send OTP" : "Sign In")
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
            </button>
          </div>
          
          <div className="mt-8 text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              {isRegister 
                ? (step === 'otp' 
                    ? "Already have an account? " 
                    : "Already have an account? "
                  ) 
                : "Don't have an account? "
              }{" "}
              <button 
                onClick={handleSwitchMode}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 disabled:opacity-50"
              >
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}