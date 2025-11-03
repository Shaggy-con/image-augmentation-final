// Import React hooks for state management and lifecycle
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Import augmentation components for different tab content
import BasicAdvancedAugmentation from './BasicAdvancedAugmentation';
import RotationAugmentation from './RotationAugmentation';
import RandomAugmentation from './RandomAugmentation';

// Constants for tab identification
const TAB_BASIC_ADVANCED = 'basic-advanced';
const TAB_ROTATION = 'rotation';
const TAB_RANDOM = 'random';

/**
 * Dashboard component - Main application interface with tabbed augmentation options
 * Handles authentication and provides navigation between different augmentation types
 * @returns {JSX.Element} The dashboard interface
 */
function Dashboard() {
  const navigate = useNavigate();
  // State management for UI control
  const [activeTab, setActiveTab] = useState(TAB_BASIC_ADVANCED); // Currently active tab
  const [token, setToken] = useState(localStorage.getItem('token')); // Authentication token

  // Effect to check authentication status and redirect if not authenticated
  useEffect(() => {
    if (!token) {
      navigate('/auth');
    }
  }, [token, navigate]);

  /**
   * Handles user logout by clearing token and redirecting to auth page
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/auth');
  };

  return (
    // Main container with full screen height and centered content
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card with title and logout button */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 backdrop-blur-sm bg-opacity-95">
          <div className="flex justify-between items-center">
            <div>
              {/* Dashboard title with gradient effect */}
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Augmentation Dashboard
              </h2>
            </div>
            {/* Logout button with gradient and hover effects */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content Card with tabbed interface */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden backdrop-blur-sm bg-opacity-95">
          {/* Enhanced Tabs with gradient background */}
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 pt-6">
            <div className="flex gap-2 border-b border-gray-200">
              {/* Basic/Advanced Tab */}
              <button
                type="button"
                onClick={() => setActiveTab(TAB_BASIC_ADVANCED)}
                className={`relative px-6 py-3 font-medium rounded-t-xl transition-all duration-200 ${
                  activeTab === TAB_BASIC_ADVANCED
                    ? 'bg-white text-blue-600 shadow-sm -mb-px border-t-2 border-x border-blue-500'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                <span className="relative z-10">Basic / Advanced</span>
                {/* Active tab indicator */}
                {activeTab === TAB_BASIC_ADVANCED && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                )}
              </button>
              
              {/* Rotation Tab */}
              <button
                type="button"
                onClick={() => setActiveTab(TAB_ROTATION)}
                className={`relative px-6 py-3 font-medium rounded-t-xl transition-all duration-200 ${
                  activeTab === TAB_ROTATION
                    ? 'bg-white text-blue-600 shadow-sm -mb-px border-t-2 border-x border-blue-500'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                <span className="relative z-10">Rotation</span>
                {/* Active tab indicator */}
                {activeTab === TAB_ROTATION && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                )}
              </button>
              
              {/* Random Tab */}
              <button
                type="button"
                onClick={() => setActiveTab(TAB_RANDOM)}
                className={`relative px-6 py-3 font-medium rounded-t-xl transition-all duration-200 ${
                  activeTab === TAB_RANDOM
                    ? 'bg-white text-blue-600 shadow-sm -mb-px border-t-2 border-x border-blue-500'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                }`}
              >
                <span className="relative z-10">Random</span>
                {/* Active tab indicator */}
                {activeTab === TAB_RANDOM && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content with smooth transition and gradient background */}
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white min-h-96">
            <div className="animate-fadeIn">
              {/* Render appropriate component based on active tab */}
              {activeTab === TAB_BASIC_ADVANCED && <BasicAdvancedAugmentation />}
              {activeTab === TAB_ROTATION && <RotationAugmentation />}
              {activeTab === TAB_RANDOM && <RandomAugmentation />}
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

export default Dashboard;