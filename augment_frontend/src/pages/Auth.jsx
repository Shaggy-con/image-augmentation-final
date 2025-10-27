import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UPPERCASE_REGEX = /[A-Z]/;
const LOWERCASE_REGEX = /[a-z]/;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*(),.?":{}|<>]/;
const DIGIT_REGEX = /^\d{6}$/;

const MIN_PASSWORD_LENGTH = 8;
const OTP_LENGTH = 6;

const STEP_CREDENTIALS = 'credentials';
const STEP_OTP = 'otp';

function Auth() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState(STEP_CREDENTIALS);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const validatePassword = (passwordValue) => {
    const hasUppercase = UPPERCASE_REGEX.test(passwordValue);
    const hasLowercase = LOWERCASE_REGEX.test(passwordValue);
    const hasNumber = NUMBER_REGEX.test(passwordValue);
    const hasSpecialChar = SPECIAL_CHAR_REGEX.test(passwordValue);

    if (passwordValue.length < MIN_PASSWORD_LENGTH) {
      return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!hasUppercase) {
      return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!hasLowercase) {
      return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!hasNumber) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
    if (!hasSpecialChar) {
      return { valid: false, message: 'Password must contain at least one special character' };
    }
    return { valid: true, message: 'Password is valid' };
  };

  const validateCredentials = () => {
    setError('');
    if (!EMAIL_REGEX.test(email)) {
      setError('Invalid email format');
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
    setError('');
    if (!otp || otp.length !== OTP_LENGTH || !DIGIT_REGEX.test(otp)) {
      setError('OTP must be a valid 6-digit number');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (step === STEP_CREDENTIALS) {
      if (!validateCredentials()) return;

      setIsLoading(true);
      setError('');
      try {
        if (isRegister) {
          const res = await API.post('/register', { email, password });
          setSuccessMessage(res.data.message || 'Registration successful! Check your email for OTP.');
          setStep(STEP_OTP);
          setError('');
        } else {
          const res = await API.post('/login', { email, password });
          localStorage.setItem('token', res.data.access_token);
          navigate('/dashboard');
        }
      } catch (err) {
        const errorMsg = err.response?.data?.error || 'Something went wrong';
        setError(errorMsg);
        if (errorMsg.includes('verify your email')) {
          setIsRegister(true);
          setStep(STEP_OTP);
        }
      } finally {
        setIsLoading(false);
      }
    } else if (step === STEP_OTP) {
      if (!validateOtp()) return;

      setIsLoading(true);
      setError('');
      try {
        const res = await API.post('/verify-otp', { email, otp });
        setSuccessMessage(res.data.message || 'Email verified successfully!');
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

  const handleResendOTP = async () => {
    if (!validateCredentials()) return;
    setIsLoading(true);
    try {
      await API.post('/register', { email, password });
      setSuccessMessage('OTP resent successfully! Check your email.');
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMode = () => {
    setIsRegister(!isRegister);
    setStep(STEP_CREDENTIALS);
    setOtp('');
    setPassword('');
    setPasswordStrength(null);
    setError('');
    setSuccessMessage('');
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (newPassword) {
      setPasswordStrength(validatePassword(newPassword));
    } else {
      setPasswordStrength(null);
    }
  };

  const handleOtpChange = (e) => {
    const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH);
    setOtp(sanitizedValue);
  };

  const getButtonText = () => {
    if (isLoading) return 'Processing...';
    if (step === STEP_OTP) return 'Verify OTP';
    return isRegister ? 'Send OTP' : 'Sign In';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-200">
        <div className="bg-blue-600 p-6 text-center rounded-t-xl">
          <h2 className="text-2xl font-bold text-white">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            {isRegister ? 'Sign up to get started' : 'Sign in to continue'}
          </p>
        </div>

        <div className="p-8">
          <div className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-300 p-3 rounded">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-300 p-3 rounded">
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            )}

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
                {passwordStrength && password.length > 0 && (
                  <div className={`mt-2 p-2 rounded text-sm ${
                    passwordStrength.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {passwordStrength.message}
                  </div>
                )}
              </div>
            )}

            {step === STEP_OTP && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <p className="text-xs text-gray-500 mb-2">Sent to {email}</p>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={OTP_LENGTH}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-center text-lg"
                />
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
            
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || (!email && !password && !otp)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded font-semibold hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getButtonText()}
            </button>
          </div>
          
          <div className="mt-6 text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              {isRegister ? 'Already have an account? ' : 'Don\'t have an account? '}
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