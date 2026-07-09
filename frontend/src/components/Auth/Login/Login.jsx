import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

function Login({ onLoginSuccess }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      if (phone === "09123456789" && password === "1234") {
        onLoginSuccess({
          id: 1,
          name: "مریم احمدی",
          phone: phone,
          role: "patient",
        });
        navigate("/patient-panel");
      } else {
        setError("شماره تماس یا رمز عبور اشتباه است");
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <span className={styles.loginIcon}>🔐</span>
          <h2>ورود به حساب کاربری</h2>
          <p>برای دسترسی به پنل بیماران، وارد شوید</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label>📱 شماره تماس</label>
            <input
              type="tel"
              placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>🔑 رمز عبور</label>
            <input
              type="password"
              placeholder="رمز عبور خود را وارد کنید"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={isLoading}
          >
            {isLoading ? "⏳ در حال ورود..." : "🚀 ورود"}
          </button>

          <div className={styles.signupLink}>
            <span>حساب کاربری ندارید؟</span>
            <Link to="/signup" className={styles.switchBtn}>
              ثبت‌نام کنید
            </Link>
          </div>
        </form>

        <div className={styles.demoInfo}>
          <p>📌 برای تست از این اطلاعات استفاده کنید:</p>
          <p>شماره: ۰۹۱۲۳۴۵۶۷۸۹</p>
          <p>رمز: ۱۲۳۴</p>
        </div>

        <Link to="/" className={styles.backHome}>
          ← بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

export default Login;
