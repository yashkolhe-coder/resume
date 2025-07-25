import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserDashboard from "./pages/UserDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/company/dashboard" element={<CompanyDashboard />} />
      </Routes>
    </Router>
  );
}

export default App; 