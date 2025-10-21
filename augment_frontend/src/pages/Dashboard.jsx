import { useState, useEffect } from "react";
import BasicAdvancedAugmentation from "./BasicAdvancedAugmentation";
import RotationAugmentation from "./RotationAugmentation";
import RandomAugmentation from "./RandomAugmentation";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("basic-advanced");
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (!token) {
      window.location.href = "/auth";
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    window.location.reload();
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <ul className="flex border-b border-gray-200">
          <li className="mr-1">
            <button
              onClick={() => setActiveTab("basic-advanced")}
              className={`inline-block py-2 px-4 ${
                activeTab === "basic-advanced"
                  ? "bg-white border-l border-t border-r rounded-t text-blue-700 font-semibold"
                  : "text-blue-500 hover:text-blue-800"
              }`}
            >
              Basic / Advanced
            </button>
          </li>
          <li className="mr-1">
            <button
              onClick={() => setActiveTab("rotation")}
              className={`inline-block py-2 px-4 ${
                activeTab === "rotation"
                  ? "bg-white border-l border-t border-r rounded-t text-blue-700 font-semibold"
                  : "text-blue-500 hover:text-blue-800"
              }`}
            >
              Rotation
            </button>
          </li>
          <li className="mr-1">
            <button
              onClick={() => setActiveTab("random")}
              className={`inline-block py-2 px-4 ${
                activeTab === "random"
                  ? "bg-white border-l border-t border-r rounded-t text-blue-700 font-semibold"
                  : "text-blue-500 hover:text-blue-800"
              }`}
            >
              Random
            </button>
          </li>
        </ul>
      </div>

      {/* Tab Content */}
      <div className="p-4 bg-gray-50 rounded-b-lg">
        {activeTab === "basic-advanced" && <BasicAdvancedAugmentation />}
        {activeTab === "rotation" && <RotationAugmentation />}
        {activeTab === "random" && <RandomAugmentation />}
      </div>
    </div>
  );
}