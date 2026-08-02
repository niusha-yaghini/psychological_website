import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import logo from "../../../../public/images/logo/logo2.png";

import loginback from "../../../../public/images/login/loginback.png";

function Login({ answers, navigate }) {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [code, setCode] = useState(["", "", "", ""]); // ← تغییر به آرایه
  const [error, setError] = useState("");
  const inputRefs = useRef([]);

  const handleSendCode = () => {
    setError("");

    const cleanPhone = phone.replace(/\D/g, "");

    // بررسی خالی بودن
    if (!cleanPhone) {
      setError("لطفاً شماره تماس را وارد کنید.");
      return;
    }

    if (phone.length < 10) {
      setError("لطفاً شماره تماس معتبر وارد کنید.");
      return;
    }

    // بررسی شروع با ۹
    if (cleanPhone[0] !== "9") {
      setError("شماره تماس باید با ۹ شروع شود. (مثال: ۹۱۲۳۴۵۶۷۸۹)");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("code");
      setTimer(90);
      console.log("📱 کد ارسال شد: 1234");
    }, 1500);
  };

  // ===== مدیریت تغییر هر جایگاه به صورت مستقل =====
  const handleCodeChange = (index, value) => {
    // فقط عدد یا خالی قبول کن
    if (value !== "" && !/^[0-9]$/.test(value)) return;

    // ایجاد کپی از آرایه
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // اگر عدد وارد شد و باکس بعدی وجود داشت، برو به باکس بعدی
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ===== مدیریت کلیدها =====
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      if (code[index]) {
        // اگر باکس عدد داشت، فقط همون باکس رو پاک کن
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        // اگر باکس خالی بود، برو به قبلی و اون رو پاک کن
        const prevIndex = index - 1;
        const newCode = [...code];
        newCode[prevIndex] = "";
        setCode(newCode);
        inputRefs.current[prevIndex]?.focus();
      }
    }

    // حرکت با فلش چپ و راست
    if (e.key === "ArrowRight" && index < 3) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ===== چسباندن کد از کلیپ‌بورد =====
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length >= 4) {
      const newCode = pastedData.slice(0, 4).split("");
      setCode(newCode);
      inputRefs.current[3]?.focus();
    }
  };

  // ===== بررسی کامل بودن کد =====
  const isCodeComplete = code.every((digit) => digit !== "");
  const codeString = code.join("");

  const handleVerifyCode = () => {
    setError("");

    if (!isCodeComplete) {
      setError("لطفاً کد ۴ رقمی رو کامل وارد کن");
      return;
    }

    if (codeString !== "1234") {
      setError("کد وارد شده اشتباه است. دوباره تلاش کن");
      setCode(["", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const userData = {
        phone,
        answers,
        onboardingDate: new Date().toISOString(),
      };
      localStorage.setItem("userOnboardingData", JSON.stringify(userData));
      navigate("/dashboard");
    }, 1500);
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      10
    )}`;
  };

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationWrapper}>
        <div className={styles.verificationCard}>
          <div className={styles.verificationFormSide}>
            <div className={styles.verificationLogo}>
              <Link to="/" className={styles.backToHome}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 12H21M3 12L10 5M3 12L10 19"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>بازگشت به صفحه اصلی</span>
              </Link>

              <img src={logo} alt="لوگو" className={styles.logoImage} />
            </div>
            {step === "phone" ? (
              <>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>آخرین قدم</h2>
                  <p className={styles.formSubtitle}>
                    برای ورود شماره تماس خود را وارد کنید تا کد تأیید برایتان
                    ارسال شود.
                  </p>
                </div>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>شماره موبایل</label>
                  <div
                    className={`${styles.phoneInputWrapper} ${
                      error ? styles.error : ""
                    }`}
                  >
                    <span className={styles.phonePrefix}>+۹۸</span>
                    <input
                      type="tel"
                      className={styles.phoneInput}
                      placeholder="۹۱۲ ۳۴۵ ۶۷۸۹"
                      value={formatPhoneNumber(phone)}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      maxLength="14"
                      autoFocus
                    />
                  </div>
                  {error && <div className={styles.errorMessage}>{error}</div>}
                </div>
                <button
                  onClick={handleSendCode}
                  className={styles.btnVerification}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className={styles.spinner}></span>
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <span>ارسال کد تأیید</span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
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

                <div className={styles.termsText}>
                  اطلاعات شما به صورت امن و محرمانه نگهداری میشود.
                </div>
              </>
            ) : (
              <>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>کد تأیید</h2>
                  <p className={styles.formSubtitle}>
                    کد ۴ رقمی ارسال شده به
                    <strong className={styles.phoneHighlight}>0{phone}</strong>
                    را وارد کنید.
                  </p>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>کد تأیید</label>
                  <div className={styles.codeContainer}>
                    <div className={styles.codeInputs}>
                      {[0, 1, 2, 3].map((index) => (
                        <input
                          key={index}
                          ref={(el) => (inputRefs.current[index] = el)}
                          type="text"
                          className={styles.codeBox}
                          maxLength="1"
                          value={code[index] || ""}
                          onChange={(e) =>
                            handleCodeChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={handlePaste}
                          onFocus={(e) => e.target.select()}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    {error && (
                      <div className={styles.errorMessage}>
                        <span className={styles.errorIcon}>⚠️</span>
                        {error}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleVerifyCode}
                  className={styles.btnVerification}
                  disabled={isLoading || !isCodeComplete}
                >
                  {isLoading ? (
                    <>
                      <span className={styles.spinner}></span>
                      در حال تأیید...
                    </>
                  ) : (
                    <>
                      <span>تأیید و ورود به پنل</span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
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

                <div className={styles.codeActions}>
                  {timer > 0 ? (
                    <p className={styles.timerText}>
                      ارسال مجدد تا <strong>{timer}</strong> ثانیه
                    </p>
                  ) : (
                    <button
                      onClick={handleSendCode}
                      className={styles.btnResend}
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                  <button
                    className={styles.btnBack}
                    onClick={() => setStep("phone")}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M19 12H5M5 12L12 19M5 12L12 5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    تغییر شماره
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Left Side - Image */}
          <div className={styles.verificationImageSide}>
            <div className={styles.imageWrapper}>
              <img
                src={loginback}
                alt="تأیید شماره"
                className={styles.heroImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
