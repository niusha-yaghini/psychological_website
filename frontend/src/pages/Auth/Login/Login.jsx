import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PhoneVerification from "../PhoneVerification/PhoneVerification";

function Login({ onLoginSuccess }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isSignupFlow = useMemo(
    () =>
      Boolean(
        location.state?.fromSignup ||
        localStorage.getItem("fromSignup") === "true",
      ),
    [location.state],
  );

  const patients = ["9123456789", "9134567890", "9145678901"];
  const doctors = ["9012345678", "9023456789", "9034567890"];

  const initialPhone = isSignupFlow
    ? localStorage.getItem("signupPhone") || ""
    : "";

  const handleRequestCode = async (phone) => {
    if (isSignupFlow) return { exists: true };

    const exists = patients.includes(phone) || doctors.includes(phone);
    if (!exists) return { exists: false };

    const role = doctors.includes(phone) ? "doctor" : "patient";
    localStorage.setItem("userRole", role);
    return { exists: true };
  };

  const handleSuccessfulLogin = (userData) => {
    const normalizedUser = { ...userData, role: userData.role || "patient" };
    localStorage.setItem("userLoggedIn", JSON.stringify(normalizedUser));
    onLoginSuccess?.(normalizedUser);

    navigate(
      normalizedUser.role === "doctor"
        ? "/doctor-dashboard"
        : "/patient-dashboard",
      {
        replace: true,
      },
    );
  };

  const handleVerified = async ({ phone, firstName, lastName }) => {
    if (isSignupFlow) {
      const answers = JSON.parse(
        localStorage.getItem("userOnboardingAnswers") || "{}",
      );
      const newUserData = {
        phone,
        firstName,
        lastName,
        answers,
        registerDate: new Date().toISOString(),
        role: "patient",
      };

      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      allUsers.push(newUserData);
      localStorage.setItem("allUsers", JSON.stringify(allUsers));

      [
        "fromSignup",
        "signupPhone",
        "userOnboardingAnswers",
        "userOnboardingComplete",
        "userPhone",
        "userRole",
      ].forEach((key) => localStorage.removeItem(key));

      sessionStorage.removeItem("tempUserData");
      handleSuccessfulLogin({ ...newUserData, isNewUser: true });
      return;
    }

    const role = localStorage.getItem("userRole") || "patient";
    localStorage.removeItem("userRole");

    handleSuccessfulLogin({
      phone,
      isNewUser: false,
      loginDate: new Date().toISOString(),
      role,
    });
  };

  const handleGoToSignup = (phone) => {
    localStorage.setItem("signupPhone", phone);
    navigate("/signup", { state: { phone } });
  };

  return (
    <PhoneVerification
      mode={isSignupFlow ? "signup" : "login"}
      initialPhone={initialPhone}
      onRequestCode={handleRequestCode}
      onVerified={handleVerified}
      onGoToSignup={handleGoToSignup}
    />
  );
}

export default Login;
