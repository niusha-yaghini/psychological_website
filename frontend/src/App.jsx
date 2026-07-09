// src/App.jsx
import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./components/Landing/Landing";
import Login from "./components/Auth/Login/Login";
import Signup from "./components/Auth/Signup/Signup";
import PhoneVerification from "./components/Auth/PhoneVerification/PhoneVerification";
import PatientPanel from "./components/PatientPanel/PatientPanel";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignupComplete = (data) => {
    setRegistrationData(data);
  };

  const handleVerifyComplete = (phone) => {
    console.log("✅ ثبت‌نام کامل شد:", { ...registrationData, phone });
    setUser({
      id: Date.now(),
      phone: phone,
      role: "patient",
      ...registrationData,
    });
    setRegistrationData(null);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="app">
      <Routes>
        {/* صفحه اصلی */}
        <Route path="/" element={<Landing />} />

        {/* صفحات احراز هویت */}
        <Route
          path="/login"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/signup"
          element={<Signup onComplete={handleSignupComplete} />}
        />
        <Route
          path="/verify"
          element={<PhoneVerification onVerify={handleVerifyComplete} />}
        />

        {/* پنل بیمار */}
        <Route
          path="/patient-panel"
          element={
            user ? (
              <PatientPanel user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* اگر مسیر اشتباه بود */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
