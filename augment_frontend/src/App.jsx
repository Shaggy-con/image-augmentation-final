import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <Router>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ">
      

      
      <div className="space-y-6">
        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />


          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      
      
    </div>
    </Router>
  );
}

export default App;