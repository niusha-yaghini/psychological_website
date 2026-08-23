import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "./components/Landing/Landing";
import Login from "./components/Auth/Login/Login";
import Signup from "./components/Auth/Signup/Signup";
import PatientDashboard from "./components/PatientDashboard/PatientDashboard";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== بررسی وضعیت لاگین =====
  useEffect(() => {
    const loggedIn = localStorage.getItem("userLoggedIn");
    if (loggedIn) {
      try {
        const userData = JSON.parse(loggedIn);
        setUser({
          ...userData,
          role: userData.role || "patient", // پیش‌فرض: مشتری
        });
      } catch (error) {
        console.error("خطا در خواندن اطلاعات کاربر:", error);
      }
    }
    setLoading(false);
  }, []);

  // ===== خروج از حساب =====
  const handleLogout = () => {
    localStorage.removeItem("userLoggedIn");
    setUser(null);
  };

  // ===== لاگین موفق =====
  const handleLoginSuccess = (userData) => {
    setUser({
      ...userData,
      role: userData.role || "patient",
    });
  };

  // ===== نمایش لودینگ =====
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

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
        <Route path="/signup" element={<Signup />} />

        {/* ===== پنل مشتری ===== */}
        <Route
          path="/patient-dashboard"
          element={
            user ? (
              <PatientDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ===== پنل روانشناس (برای آینده) ===== */}
        {/* <Route
          path="/doctor-panel"
          element={
            user && user.role === "doctor" ? (
              <DoctorDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        /> */}

        {/* اگر مسیر اشتباه بود */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
