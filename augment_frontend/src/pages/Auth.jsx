import { useState } from "react";
import API from "../api";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error,seterror] = useState("");
  const [passwordStrength,setPasswordStrength] = useState(null);

  const validatePassword= (password)=>{
    const hasUppercase= /[A-Z]/.test(password);
    const hasLowercase= /[a-z]/.test(password);
    const hasNumber= /[0-9]/.test(password);
    const hasSpecialChar= /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if(password.length < 8){
      return {valid:false, message:"Password must be at least 8 characters long"};
    }
    if(!hasUppercase){
      return {valid:false, message:"Password must contain at least one uppercase letter"};
    }
    if(!hasLowercase){
      return {valid:false, message:"Password must contain at least one lowercase letter"};
    }
    if(!hasNumber){
      return {valid:false, message:"Password must contain at least one number"};
    }
    if(!hasSpecialChar){
      return {valid:false, message:"Password must contain at least one special character"};
    }
    return {valid:true,message:"password is valid"};

  }

  const validateInput =()=>{
    seterror("");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
      seterror("Invalid email format");
      return false;
    }
    const passwordValidation  = validatePassword(password);
    if(!passwordValidation.valid){
      seterror(passwordValidation.message);
      return false;
    }
    return true;

  }

  const handleSubmit = async () => {
    if(!validateInput()) return;

    setIsLoading(true);
    try {
      if (isRegister) {
        await API.post("/register", { email, password });
        alert("Registration successful! You can now log in.");
        setIsRegister(false);
      } else {
        const res = await API.post("/login", { email, password });
        localStorage.setItem("token", res.data.access_token);
        alert("Login successful!");
        window.location.href="/dashboard";
      }
    } catch (err) {
      alert(err.response?.data?.error || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-xl border border-gray-100 ">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        {isRegister ? "Create Account" : "Welcome Back"}
      </h2>
      
      <div className="space-y-4">

        {error && (
          <div className="text-red-600 text-sm font-semibold bg-red-50 p-2 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 border ${
              error && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                ? "border-red-400"
                : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
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
            className={`w-full px-4 py-2 border ${
              error && !validatePassword(password).valid
                ? "border-red-400"
                : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
          />
          {passwordStrength && password.length > 0 && (
            <p className={`mt-2 text-sm font-semibold ${
              passwordStrength.valid ? "text-green-600" : "text-red-600"
            }`}>
              {passwordStrength.message}
            </p>
          )}
        </div>
        
        <button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            isRegister ? "Create Account" : "Sign In"
          )}
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-gray-600">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button 
            onClick={() => setIsRegister(!isRegister)}
            className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
          >
            {isRegister ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}