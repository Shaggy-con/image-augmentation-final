import { useEffect, useState } from "react";
import API from "../api.js";

export default function Profile() {
  const [profile, setProfile] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    API.get("/profile")
      .then((res) => {
        setProfile(res.data.logged_in_as);
        setIsLoading(false);
      })
      .catch(() => {
        setProfile("Not authorized");
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setProfile("Not authorized");
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded-lg shadow-xl border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Profile Information</h2>
        {profile !== "Not authorized" && profile !== "" && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
          >
            Logout
          </button>
        )}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {profile !== "Not authorized" ? profile.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-800">
                {profile !== "Not authorized" ? profile : "Guest User"}
              </p>
              <p className={`text-sm ${profile !== "Not authorized" ? "text-green-600" : "text-red-600"}`}>
                {profile !== "Not authorized" ? "Authenticated" : "Not authenticated"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}