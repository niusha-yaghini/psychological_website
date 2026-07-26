import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import logo from "../../../../public/images/logo1.png";

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // اعتبارسنجی ساده
    if (phone.length < 10) {
      setError("لطفاً شماره موبایل معتبر وارد کن");
      return;
    }

    if (password.length < 4) {
      setError("رمز عبور باید حداقل ۴ کاراکتر باشه");
      return;
    }

    setIsLoading(true);

    // شبیه‌سازی درخواست لاگین
    setTimeout(() => {
      setIsLoading(false);
      // در حالت واقعی اینجا چک کردن اعتبار با backend
      // فعلاً فرض میکنیم موفق بوده
      navigate("/dashboard");
    }, 1500);
  };

  const handleQuickLogin = () => {
    // برای تست سریع
    setPhone("09123456789");
    setPassword("1234");
  };

  return (
    <div className={styles.loginContainer}>
      {/* Decorative Background Elements */}
      <div className={styles.decorativeCircle1} />
      <div className={styles.decorativeCircle2} />
      <div className={styles.decorativeCircle3} />

      <div className={styles.loginWrapper}>
        {/* Logo & Brand */}
        <div className={styles.brandSection}>
          <Link to="/" className={styles.logoLink}>
            <img src={logo} alt="لوگو" className={styles.logoImage} />
            <span className={styles.brandName}>
              کلینیک <span>روانشناسی</span>
            </span>
          </Link>
          <p className={styles.brandSlogan}>به مسیر آرامش و رشد خوش آمدی</p>
        </div>

        {/* Login Card */}
        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>ورود به حساب کاربری</h2>
            <p className={styles.cardSubtitle}>
              خوشحالیم که دوباره می‌بینیمت! 👋
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.loginForm}>
            {/* Phone Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <span className={styles.labelIcon}>📱</span>
                شماره موبایل
              </label>
              <div className={styles.inputWrapper}>
                <span className={styles.inputPrefix}>+۹۸</span>
                <input
                  type="tel"
                  className={styles.formInput}
                  placeholder="۹۱۲۳۴۵۶۷۸۹"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength="10"
                  autoFocus
                />
                {phone.length > 0 && (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={() => setPhone("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Password Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                <span className={styles.labelIcon}>🔒</span>
                رمز عبور
              </label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  className={styles.formInput}
                  placeholder="رمز عبور خود را وارد کن"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Options Row */}
            <div className={styles.optionsRow}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className={styles.checkmark}></span>
                مرا به خاطر بسپار
              </label>
              <Link to="/forgot-password" className={styles.forgotLink}>
                رمز عبور را فراموش کردی؟
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                <span className={styles.errorIcon}>⚠️</span>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.btnLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  در حال ورود...
                </>
              ) : (
                <>
                  <span>ورود به پنل</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className={styles.divider}>
              <span className={styles.dividerLine}></span>
              <span className={styles.dividerText}>یا</span>
              <span className={styles.dividerLine}></span>
            </div>

            {/* Quick Login (برای تست) */}
            <button
              type="button"
              onClick={handleQuickLogin}
              className={styles.btnQuickLogin}
            >
              🚀 ورود سریع (تست)
            </button>

            {/* Social Login */}
            <div className={styles.socialLogin}>
              <p className={styles.socialText}>ورود با حساب‌های دیگر</p>
              <div className={styles.socialButtons}>
                <button type="button" className={styles.socialBtn}>
                  <span className={styles.socialIcon}>📱</span>
                  گوگل
                </button>
                <button type="button" className={styles.socialBtn}>
                  <span className={styles.socialIcon}>💬</span>
                  پیامک
                </button>
              </div>
            </div>

            {/* Signup Link */}
            <div className={styles.signupPrompt}>
              <span>حساب کاربری نداری؟</span>
              <Link to="/signup" className={styles.signupLink}>
                ثبت‌نام کن
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 5L16 12L9 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className={styles.loginFooter}>
          <p>
            ورود شما به معنای پذیرش
            <Link to="/terms"> قوانین و مقررات </Link>و
            <Link to="/privacy"> حریم خصوصی </Link>
            است
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
