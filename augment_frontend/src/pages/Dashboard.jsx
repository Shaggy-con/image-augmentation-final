import { useState, useEffect } from "react";
import BasicAdvancedAugmentation from "./BasicAdvancedAugmentation";
import RotationAugmentation from "./RotationAugmentation";
import RandomAugmentation from "./RandomAugmentation";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("basic-advanced");
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      navigate("/auth");
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard
              </h2>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm bg-opacity-95">
          {/* Enhanced Tabs */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 pt-6">
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("basic-advanced")}
                className={`relative px-6 py-3 font-medium rounded-t-xl transition-all duration-200 ${
                  activeTab === "basic-advanced"
                    ? "bg-white text-blue-600 shadow-sm -mb-px border-t-2 border-x border-blue-500"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
                }`}
              >
                <span className="relative z-10">Basic / Advanced</span>
                {activeTab === "basic-advanced" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab("rotation")}
                className={`relative px-6 py-3 font-medium rounded-t-xl transition-all duration-200 ${
                  activeTab === "rotation"
                    ? "bg-white text-blue-600 shadow-sm -mb-px border-t-2 border-x border-blue-500"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
                }`}
              >
                <span className="relative z-10">Rotation</span>
                {activeTab === "rotation" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab("random")}
                className={`relative px-6 py-3 font-medium rounded-t-xl transition-all duration-200 ${
                  activeTab === "random"
                    ? "bg-white text-blue-600 shadow-sm -mb-px border-t-2 border-x border-blue-500"
                    : "text-gray-600 hover:text-blue-600 hover:bg-white/50"
                }`}
              >
                <span className="relative z-10">Random</span>
                {activeTab === "random" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content with smooth transition */}
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-96">
            <div className="animate-fadeIn">
              {activeTab === "basic-advanced" && <BasicAdvancedAugmentation />}
              {activeTab === "rotation" && <RotationAugmentation />}
              {activeTab === "random" && <RandomAugmentation />}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Powered by Advanced Augmentation System</p>
        </div>
      </div>
    </div>
  );
}