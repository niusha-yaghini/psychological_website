import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "../Login/Login.module.css";

// import styles from "./PhoneVerification.module.css";
import logo from "../../../../public/images/logo/logo2.png";
import loginback from "../../../../public/images/SignUp_Login/loginback.png";

/**
 * Shared phone verification flow for both Login and Signup.
 * OTP is intentionally mocked for development: 1234.
 */
function PhoneVerification({
  mode = "login",
  initialPhone = "",
  onRequestCode,
  onVerified,
  onGoToSignup,
}) {
  const isSignup = mode === "signup";
  const [phone, setPhone] = useState(initialPhone.replace(/\D/g, ""));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [step, setStep] = useState("phone");
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const intervalId = window.setInterval(() => {
      setTimer((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [timer]);

  useEffect(() => {
    setPhone(initialPhone.replace(/\D/g, ""));
  }, [initialPhone]);

  const cleanPhone = phone.replace(/\D/g, "");
  const isCodeComplete = code.every(Boolean);

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 10);
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6)
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  };

  const validatePhone = () => {
    if (cleanPhone.length !== 10 || cleanPhone[0] !== "9") {
      setError("شماره موبایل معتبر وارد کنید. (مثال: ۹۱۲۳۴۵۶۷۸۹)");
      return false;
    }
    if (isSignup && !firstName.trim()) {
      setError("لطفاً نام خود را وارد کنید.");
      return false;
    }
    if (isSignup && !lastName.trim()) {
      setError("لطفاً نام خانوادگی خود را وارد کنید.");
      return false;
    }
    return true;
  };

  const requestCode = async () => {
    setError("");
    setShowSignupPrompt(false);
    if (!validatePhone()) return;

    setIsLoading(true);
    try {
      const result = await onRequestCode(cleanPhone);
      if (result === false || result?.exists === false) {
        setShowSignupPrompt(true);
        setError("");
        return;
      }
      setStep("code");
      setCode(["", "", "", ""]);
      setTimer(90);
      console.log("📱 کد تأیید آزمایشی:", "1234");
      window.setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } catch (requestError) {
      setError(
        requestError?.message || "در حال حاضر امکان ارسال کد وجود ندارد.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (index, value) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setCode((current) =>
        current.map((digit, i) => (i === index ? "" : digit)),
      );
      return;
    }

    if (digits.length > 1) {
      const pasted = digits.slice(0, 4).split("");
      setCode((current) => current.map((digit, i) => pasted[i] ?? digit));
      inputRefs.current[Math.min(pasted.length - 1, 3)]?.focus();
      return;
    }

    setCode((current) =>
      current.map((digit, i) => (i === index ? digits : digit)),
    );
    if (index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index < 3) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    if (event.key === "ArrowRight" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (!pasted) return;
    setCode(pasted.split("").concat(["", "", "", ""]).slice(0, 4));
    inputRefs.current[Math.min(pasted.length - 1, 3)]?.focus();
  };

  const verifyCode = async () => {
    setError("");
    if (!isCodeComplete) {
      setError("لطفاً کد ۴ رقمی را کامل وارد کنید.");
      return;
    }
    if (code.join("") !== "1234") {
      setError("کد وارد شده اشتباه است. دوباره تلاش کنید.");
      setCode(["", "", "", ""]);
      inputRefs.current[0]?.focus();
      return;
    }

    setIsLoading(true);
    try {
      await onVerified({
        phone: cleanPhone,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
    } catch (verificationError) {
      setError(verificationError?.message || "تأیید شماره با خطا مواجه شد.");
      setIsLoading(false);
    }
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
                  <h2 className={styles.formTitle}>
                    {isSignup ? "ساخت حساب کاربری" : "ورود به حساب کاربری"}
                  </h2>
                  <p className={styles.formSubtitle}>
                    {isSignup
                      ? "برای ساخت حساب، اطلاعات زیر را وارد کنید."
                      : "شماره موبایل خود را وارد کنید."}
                  </p>
                </div>

                {isSignup && (
                  // <div className={styles.inputGroup}>
                  //   <label
                  //     className={styles.inputLabel}
                  //     htmlFor="signup-first-name"
                  //   >
                  //     نام
                  //   </label>
                  //   <div className={styles.phoneInputWrapper}>
                  //     <input
                  //       id="signup-first-name"
                  //       type="text"
                  //       className={styles.phoneInput}
                  //       placeholder="نام"
                  //       value={firstName}
                  //       onChange={(event) => setFirstName(event.target.value)}
                  //       autoComplete="given-name"
                  //     />
                  //   </div>
                  //   <label
                  //     className={styles.inputLabel}
                  //     htmlFor="signup-last-name"
                  //   >
                  //     نام خانوادگی
                  //   </label>
                  //   <div className={styles.phoneInputWrapper}>
                  //     <input
                  //       id="signup-last-name"
                  //       type="text"
                  //       className={styles.phoneInput}
                  //       placeholder="نام خانوادگی"
                  //       value={lastName}
                  //       onChange={(event) => setLastName(event.target.value)}
                  //       autoComplete="family-name"
                  //     />
                  //   </div>
                  // </div>
                  <div className={styles.nameFieldsRow}>
                    <div className={styles.nameField}>
                      <label>نام</label>
                      <input
                        type="text"
                        placeholder="نام"
                        dir="rtl"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>

                    <div className={styles.nameField}>
                      <label>نام خانوادگی</label>
                      <input
                        type="text"
                        placeholder="نام خانوادگی"
                        dir="rtl"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="auth-phone">
                    شماره موبایل
                  </label>
                  <div
                    className={`${styles.phoneInputWrapper} ${error ? styles.error : ""}`}
                  >
                    <span className={styles.phonePrefix}>+۹۸</span>
                    <input
                      id="auth-phone"
                      type="tel"
                      className={styles.phoneInput}
                      placeholder="۹۱۲ ۳۴۵ ۶۷۸۹"
                      value={formatPhoneNumber(phone)}
                      onChange={(event) =>
                        setPhone(
                          event.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      maxLength={12}
                      autoComplete="tel-national"
                      dir="ltr"
                    />
                  </div>
                  {error && <div className={styles.errorMessage}>{error}</div>}
                </div>

                {showSignupPrompt && (
                  <div className={styles.modalContent}>
                    <div className={styles.modalIcon}>🔍</div>
                    <h3 className={styles.modalTitle}>
                      این شماره در سیستم ثبت نشده است
                    </h3>
                    <p className={styles.modalText}>
                      برای استفاده از خدمات، ابتدا باید ثبت‌نام کنید.
                    </p>
                    <div className={styles.modalActions}>
                      <button
                        type="button"
                        onClick={() => onGoToSignup(cleanPhone)}
                        className={styles.modalBtnPrimary}
                      >
                        ثبت‌نام کنید
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSignupPrompt(false);
                          setPhone("");
                        }}
                        className={styles.modalBtnSecondary}
                      >
                        شماره دیگری وارد کنید
                      </button>
                    </div>
                  </div>
                )}

                {!showSignupPrompt && (
                  <button
                    type="button"
                    onClick={requestCode}
                    className={styles.btnVerification}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className={styles.spinner} /> در حال بررسی...
                      </>
                    ) : (
                      <>
                        <span>
                          {isSignup ? "ادامه و تأیید شماره" : "بررسی شماره"}
                        </span>
                        <span aria-hidden="true">←</span>
                      </>
                    )}
                  </button>
                )}
                <div className={styles.termsText}>
                  اطلاعات شما به صورت امن و محرمانه نگهداری می‌شود.
                </div>
              </>
            ) : (
              <>
                <div className={styles.formHeader}>
                  <h2 className={styles.formTitle}>کد تأیید</h2>
                  <p className={styles.formSubtitle}>
                    کد ۴ رقمی ارسال‌شده به{" "}
                    <strong className={styles.phoneHighlight}>
                      ۰{cleanPhone}
                    </strong>{" "}
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
                          ref={(element) =>
                            (inputRefs.current[index] = element)
                          }
                          type="text"
                          inputMode="numeric"
                          autoComplete={index === 0 ? "one-time-code" : "off"}
                          className={styles.codeBox}
                          maxLength={1}
                          value={code[index]}
                          onChange={(event) =>
                            handleCodeChange(index, event.target.value)
                          }
                          onKeyDown={(event) => handleKeyDown(index, event)}
                          onPaste={handlePaste}
                          onFocus={(event) => event.target.select()}
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
                  type="button"
                  onClick={verifyCode}
                  className={styles.btnVerification}
                  disabled={isLoading || !isCodeComplete}
                >
                  {isLoading ? (
                    <>
                      <span className={styles.spinner} /> در حال تأیید...
                    </>
                  ) : (
                    <>
                      <span>
                        {isSignup ? "تأیید و ساخت حساب" : "تأیید و ورود به پنل"}
                      </span>
                      <span aria-hidden="true">←</span>
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
                      type="button"
                      onClick={requestCode}
                      className={styles.btnResend}
                      disabled={isLoading}
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.btnBack}
                    onClick={() => {
                      setStep("phone");
                      setCode(["", "", "", ""]);
                      setError("");
                    }}
                  >
                    تغییر شماره
                  </button>
                </div>
              </>
            )}
          </div>

          <div className={styles.verificationImageSide}>
            <div className={styles.imageWrapper}>
              <img
                src={loginback}
                alt="ورود به حساب"
                className={styles.heroImage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneVerification;
