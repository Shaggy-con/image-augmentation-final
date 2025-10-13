import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";

function App() {
  return (
    <Router>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-lg mx-auto text-center mb-8">
        <p className="text-gray-600">Secure authentication with React and JWT</p>
      </div>

      
      <div className="space-y-6">
        <Routes>
          {/* Landing or Auth route */}
          <Route path="/" element={<Auth />} />
          
          {/* Dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      
      
    </div>
    </Router>
  );
}

export default App;