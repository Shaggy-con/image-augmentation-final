// Import React hooks for state management and navigation
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

// Regular expression patterns for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;
const DIGIT_REGEX = /^\d{6}$/;

// Constants for validation rules
const MIN_PASSWORD_LENGTH = 8;
const OTP_LENGTH = 6;

// Constants for authentication flow steps
const STEP_CREDENTIALS = 'credentials';
const STEP_OTP = 'otp';

/**
 * Auth component - Handles user authentication including registration, login, and OTP verification
 * @returns {JSX.Element} The authentication form component
 */
function Auth() {
  const navigate = useNavigate();
  
  // State management for authentication flow
  const [isRegister, setIsRegister] = useState(false); // Toggle between register/login mode
  const [step, setStep] = useState(STEP_CREDENTIALS); // Current step in auth flow
  const [email, setEmail] = useState(''); // User email input
  const [password, setPassword] = useState(''); // User password input
  const [otp, setOtp] = useState(''); // OTP input for email verification
  const [isLoading, setIsLoading] = useState(false); // Loading state for async operations
  const [error, setError] = useState(''); // Error message state
  const [passwordStrength, setPasswordStrength] = useState(null); // Password validation result
  const [successMessage, setSuccessMessage] = useState(''); // Success message state

  /**
   * Validates password against security requirements
   * @param {string} passwordValue - The password to validate
   * @returns {Object} Validation result with valid flag and message
   */
  const validatePassword = (passwordValue) => {
    // Check each password requirement
    const hasUppercase = UPPERCASE_REGEX.test(passwordValue);
    const hasLowercase = LOWERCASE_REGEX.test(passwordValue);
    const hasNumber = NUMBER_REGEX.test(passwordValue);
    const hasSpecialChar = SPECIAL_CHAR_REGEX.test(passwordValue);

    // Validate password length
    if (passwordValue.length < MIN_PASSWORD_LENGTH) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    // Validate uppercase letter requirement
    if (!hasUppercase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    // Validate lowercase letter requirement
    if (!hasLowercase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    // Validate number requirement
    if (!hasNumber) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    // Validate special character requirement
    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
    // All validations passed
    return { valid: true, message: 'Password is valid' };
  };

  /**
   * Validates email and password before API calls
   * @returns {boolean} True if credentials are valid, false otherwise
   */
  const validateCredentials = () => {
    setError('');
    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      setError('Invalid email format');
      return false;
    }
    // Validate password requirements
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return false;
    }
    // All validations passed
    return true;
  };

  /**
   * Validates OTP input format
   * @returns {boolean} True if OTP is valid, false otherwise
   */
  const validateOtp = () => {
    setError('');
    // Check OTP length and format
    if (!otp || otp.length !== OTP_LENGTH || !DIGIT_REGEX.test(otp)) {
      setError('OTP must be a valid 6-digit number');
      return false;
    }
    // OTP is valid
    return true;
  };

  /**
   * Handles form submission for both credential and OTP steps
   * Manages registration, login, and OTP verification API calls
   */
  const handleSubmit = async () => {
    // Handle credentials step (registration or login)
    if (step === STEP_CREDENTIALS) {
      if (!validateCredentials()) return;

      setIsLoading(true);
      setError('');
      try {
        // Registration flow
        if (isRegister) {
          const res = await API.post('/register', { email, password });
          setSuccessMessage(res.data.message || 'Registration successful! Check your email for OTP.');
          setStep(STEP_OTP);
          setError('');
        } 
        // Login flow
        else {
          const res = await API.post('/login', { email, password });
          // Store JWT token and navigate to dashboard
          localStorage.setItem('token', res.data.access_token);
          navigate('/dashboard');
        }
      } catch (err) {
        // Handle API errors
        const errorMsg = err.response?.data?.error || 'Something went wrong';
        setError(errorMsg);
        // If email needs verification, switch to OTP step
        if (errorMsg.includes('verify your email')) {
          setIsRegister(true);
          setStep(STEP_OTP);
        }
      } finally {
        setIsLoading(false);
      }
    } 
    // Handle OTP verification step
    else if (step === STEP_OTP) {
      if (!validateOtp()) return;

      setIsLoading(true);
      setError('');
      try {
        const res = await API.post('/verify-otp', { email, otp });
        setSuccessMessage(res.data.message || 'Email verified successfully!');
        // Reset form and switch to login mode
        setStep(STEP_CREDENTIALS);
        setIsRegister(false);
        setOtp('');
        setPassword('');
        setPasswordStrength(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Invalid or expired OTP. Please request a new one by registering again.');
        setSuccessMessage('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  /**
   * Handles OTP resend functionality
   * Validates credentials and sends new OTP
   */
  const handleResendOTP = async () => {
    if (!validateCredentials()) return;
    setIsLoading(true);
    try {
      // Resend OTP by calling register endpoint again
      await API.post('/register', { email, password });
      setSuccessMessage('OTP resent successfully! Check your email.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Switches between register and login mode
   * Resets all form state when switching
   */
  const handleSwitchMode = () => {
    setIsRegister(!isRegister);
    setStep(STEP_CREDENTIALS);
    // Reset form fields and messages
    setOtp('');
    setPassword('');
    setPasswordStrength(null);
    setError('');
    setSuccessMessage('');
  };

  /**
   * Handles password input change with real-time validation
   * @param {Event} e - The input change event
   */
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    // Update password strength in real-time if password is not empty
    if (newPassword) {
      setPasswordStrength(validatePassword(newPassword));
    } else {
      setPasswordStrength(null);
    }
  };

  /**
   * Handles OTP input change with sanitization
   * Only allows numeric input and limits to OTP_LENGTH
   * @param {Event} e - The input change event
   */
  const handleOtpChange = (e) => {
    // Remove non-digit characters and limit to OTP_LENGTH
    const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(sanitizedValue);
  };

  /**
   * Returns appropriate button text based on current state
   * @returns {string} The button text to display
   */
  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if (step === STEP_OTP) return 'Verify OTP';
    return isRegister ? 'Send OTP' : 'Sign In';
  };

  return (
    // Main container with centered layout
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center">
      {/* Auth card container */}
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-200">
        {/* Header section with dynamic title and subtitle */}
        <div className="bg-blue-600 p-6 text-center rounded-t-xl">
          <h2 className="text-2xl font-bold text-white">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {isRegister ? 'Sign up to get started' : 'Sign in to continue'}
          </p>
        </div>

        {/* Form content section */}
        <div className="p-8">
          <div className="space-y-5">
            {/* Error message display */}
            {error && (
              <div className="bg-red-50 border border-red-300 p-3 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Success message display */}
            {successMessage && (
              <div className="bg-green-50 border border-green-300 p-3 rounded">
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Email input field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            
            {/* Password input field - shown only in credentials step */}
            {step === STEP_CREDENTIALS && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
                {/* Password strength indicator */}
                {passwordStrength && password.length > 0 && (
                  <div className={`mt-2 p-2 rounded text-sm ${
                    passwordStrength.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {passwordStrength.message}
                  </div>
                )}
              </div>
            )}

            {/* OTP input section - shown only in OTP step */}
            {step === STEP_OTP && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                {/* Email address hint */}
                <p className="text-xs text-gray-500 mb-2">Sent to {email}</p>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={OTP_LENGTH}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-center text-lg"
                />
                {/* Resend OTP link */}
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600">
                    Didn't receive OTP?{' '}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="text-blue-600 hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </p>
                </div>
              </div>
            )}
            
            {/* Main submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (!email && !password && !otp)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded font-semibold hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getButtonText()}
            </button>
          </div>
          
          {/* Mode switcher section */}
          <div className="mt-6 text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              {isRegister ? 'Already have an account? ' : 'Don\'t have an account? '}
              {/* Switch between register/login modes */}
              <button
                type="button"
                onClick={handleSwitchMode}
                disabled={isLoading}
                className="text-blue-600 hover:underline font-semibold focus:outline-none disabled:opacity-50"
              >
                {isRegister ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;