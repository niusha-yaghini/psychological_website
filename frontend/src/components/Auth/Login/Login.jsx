import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import logo from "../../../../public/images/logo/logo2.png";
// import loginback from "../../../../public/images/login/loginback.png";
import loginback from "../../../../public/images/SignUp_Login/loginback.png";

function Login({ onLoginSuccess }) {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const [isFromSignup, setIsFromSignup] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // ===== بررسی آیا از صفحه ثبت‌نام اومده =====
  useEffect(() => {
    const fromSignup = localStorage.getItem("fromSignup") === "true";

    if (fromSignup) {
      setIsFromSignup(true);

      // ===== پاک کردن همه چیز مربوط به شماره قبلی =====
      localStorage.removeItem("fromSignup");
      localStorage.removeItem("signupPhone");

      // ===== ریست کردن state =====
      setPhone("");
      setError("");
      setShowSignupPrompt(false);

      console.log("🔄 وضعیت ریست شد - آماده برای شماره جدید");

      // ===== فوکوس روی اینپوت شماره =====
      setTimeout(() => {
        const phoneInput = document.querySelector(`.${styles.phoneInput}`);
        if (phoneInput) phoneInput.focus();
      }, 300);
    }
  }, []);

  // ===== تایمر =====
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // ===== تابع لاگین موفق =====
  const handleSuccessfulLogin = (userData) => {
    localStorage.setItem(
      "userLoggedIn",
      JSON.stringify({
        ...userData,
        role: "patient",
      })
    );

    if (onLoginSuccess) {
      onLoginSuccess({
        ...userData,
        role: "patient",
      });
    }

    navigate("/patient-dashboard");
  };

  // ===== شبیه‌سازی دیتابیس =====
  const [registeredUsers] = useState([
    "9123456789",
    "9134567890",
    "9145678901",
  ]);

  // ===== بررسی وجود شماره در سیستم =====
  const checkUserExists = (phoneNumber) => {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    return registeredUsers.includes(cleanPhone);
  };

  // ===== مرحله اول: بررسی شماره =====
  const handleCheckPhone = () => {
    setError("");
    setShowSignupPrompt(false);

    const cleanPhone = phone.replace(/\D/g, "");

    // ===== اعتبارسنجی شماره =====
    if (!cleanPhone) {
      setError("لطفاً شماره تماس را وارد کنید.");
      return;
    }

    if (cleanPhone.length < 10) {
      setError("لطفاً شماره تماس معتبر وارد کنید.");
      return;
    }

    if (cleanPhone[0] !== "9") {
      setError("شماره تماس باید با ۹ شروع شود. (مثال: ۹۱۲۳۴۵۶۷۸۹)");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // ===== اگر از ساین‌آپ اومده =====
      if (isFromSignup) {
        setStep("code");
        setTimer(90);
        console.log("📱 کد ارسال شد: 1234 (ساخت حساب جدید)");
        return;
      }

      // ===== حالت عادی لاگین =====
      if (checkUserExists(cleanPhone)) {
        setStep("code");
        setTimer(90);
        console.log("📱 کد ارسال شد: 1234 (ورود)");
      } else {
        setShowSignupPrompt(true);
      }
    }, 1000);
  };

  // ===== مدیریت کد تأیید =====
  const handleCodeChange = (index, value) => {
    if (value !== "" && !/^[0-9]$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      if (code[index]) {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        const prevIndex = index - 1;
        const newCode = [...code];
        newCode[prevIndex] = "";
        setCode(newCode);
        inputRefs.current[prevIndex]?.focus();
      }
    }

    if (e.key === "ArrowRight" && index < 3) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length >= 4) {
      const newCode = pastedData.slice(0, 4).split("");
      setCode(newCode);
      inputRefs.current[3]?.focus();
    }
  };

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

      const cleanPhone = phone.replace(/\D/g, "");

      // ===== اگر از ثبت‌نام اومده =====
      if (isFromSignup) {
        const answers = JSON.parse(
          localStorage.getItem("userOnboardingAnswers") || "{}"
        );

        const newUserData = {
          phone: cleanPhone,
          answers: answers,
          registerDate: new Date().toISOString(),
          role: "patient",
        };

        // ذخیره در دیتابیس محلی
        const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
        allUsers.push(newUserData);
        localStorage.setItem("allUsers", JSON.stringify(allUsers));

        // پاک کردن فلگ‌ها
        localStorage.removeItem("fromSignup");
        localStorage.removeItem("signupPhone");
        localStorage.removeItem("userOnboardingAnswers");
        localStorage.removeItem("userOnboardingComplete");

        // لاگین موفق
        handleSuccessfulLogin({
          phone: cleanPhone,
          isNewUser: true,
          answers: answers,
        });
      } else {
        // ===== حالت عادی لاگین =====
        handleSuccessfulLogin({
          phone: cleanPhone,
          isNewUser: false,
          loginDate: new Date().toISOString(),
        });
      }
    }, 1500);
  };

  const handleGoToSignup = () => {
    localStorage.setItem("signupPhone", phone.replace(/\D/g, ""));
    localStorage.setItem("fromSignup", "true");
    navigate("/signup");
  };

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
                  <h2 className={styles.formTitle}>
                    {isFromSignup
                      ? "برای ساخت حساب کاربری شماره خود را وارد کنید"
                      : "ورود به حساب کاربری"}
                  </h2>
                  <p className={styles.formSubtitle}>
                    {isFromSignup
                      ? "با وارد کردن شماره، حساب کاربری شما ساخته می‌شود."
                      : "شماره تماس خود را وارد کنید."}
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

                {/* ===== مودال ثبت‌نشده ===== */}
                {showSignupPrompt && (
                  <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                      <button
                        className={styles.modalClose}
                        onClick={() => setShowSignupPrompt(false)}
                      >
                        ✕
                      </button>
                      <div className={styles.modalIcon}>🔍</div>
                      <h3 className={styles.modalTitle}>
                        این شماره در سیستم ثبت نشده است
                      </h3>
                      <p className={styles.modalText}>
                        برای استفاده از خدمات، ابتدا باید ثبت‌نام کنید.
                      </p>
                      <div className={styles.modalActions}>
                        <button
                          onClick={handleGoToSignup}
                          className={styles.modalBtnPrimary}
                        >
                          ثبت‌نام کنید
                          <svg
                            width="18"
                            height="18"
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
                        </button>
                        <button
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
                  </div>
                )}

                {!showSignupPrompt && (
                  <button
                    onClick={handleCheckPhone}
                    className={styles.btnVerification}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className={styles.spinner}></span>
                        در حال بررسی...
                      </>
                    ) : (
                      <>
                        <span>
                          {isFromSignup ? "ساخت حساب کاربری" : "بررسی شماره"}
                        </span>
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
                )}

                <div className={styles.termsText}>
                  اطلاعات شما به صورت امن و محرمانه نگهداری میشود.
                </div>
              </>
            ) : (
              // ===== بخش کد تأیید =====
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
                      onClick={() => {
                        setStep("phone");
                        setTimer(90);
                      }}
                      className={styles.btnResend}
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                  <button
                    className={styles.btnBack}
                    onClick={() => {
                      setStep("phone");
                      setCode(["", "", "", ""]);
                      setShowSignupPrompt(false);
                    }}
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

export default Login;

// import React, { useState, useRef, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import styles from "./Login.module.css";
// import logo from "../../../../public/images/logo/logo2.png";
// import loginback from "../../../../public/images/login/loginback.png";

// // function Login() {
// function Login({ onLoginSuccess }) {
//   // ← اضافه کردن props
//   const [phone, setPhone] = useState("");
//   const [step, setStep] = useState("phone");
//   const [isLoading, setIsLoading] = useState(false);
//   const [timer, setTimer] = useState(0);
//   const [code, setCode] = useState(["", "", "", ""]);
//   const [error, setError] = useState("");
//   const [showSignupPrompt, setShowSignupPrompt] = useState(false);
//   const [isFromSignup, setIsFromSignup] = useState(false);

//   const inputRefs = useRef([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fromSignup = localStorage.getItem("fromSignup") === "true";

//     if (fromSignup) {
//       setIsFromSignup(true);

//       // ===== پاک کردن همه چیز مربوط به شماره قبلی =====
//       localStorage.removeItem("fromSignup");
//       localStorage.removeItem("signupPhone"); // پاک کردن شماره ذخیره‌شده

//       // ===== ریست کردن state =====
//       setPhone("");
//       setError("");
//       setShowSignupPrompt(false);

//       console.log("وضعیت ریست شد - آماده برای شماره جدید");

//       // ===== فوکوس روی اینپوت شماره =====
//       setTimeout(() => {
//         const phoneInput = document.querySelector(`.${styles.phoneInput}`);
//         if (phoneInput) phoneInput.focus();
//       }, 300);
//     }
//   }, []);

//   // ===== تابع لاگین موفق =====
//   const handleSuccessfulLogin = (userData) => {
//     // ذخیره در localStorage
//     localStorage.setItem(
//       "userLoggedIn",
//       JSON.stringify({
//         ...userData,
//         role: "patient", // همیشه مشتری
//       })
//     );

//     // اگر callback وجود داشت، صدا بزن
//     if (onLoginSuccess) {
//       onLoginSuccess({
//         ...userData,
//         role: "patient",
//       });
//     }

//     // هدایت به داشبورد
//     navigate("/dashboard");
//   };

//   // ===== شبیه‌سازی دیتابیس =====
//   const [registeredUsers, setRegisteredUsers] = useState([
//     "9123456789",
//     "9134567890",
//     "9145678901",
//   ]);

//   // ===== بررسی وجود شماره در سیستم =====
//   const checkUserExists = (phoneNumber) => {
//     const cleanPhone = phoneNumber.replace(/\D/g, "");
//     return registeredUsers.includes(cleanPhone);
//   };

//   // ===== مرحله اول: بررسی شماره =====
//   const handleCheckPhone = () => {
//     setError("");
//     setShowSignupPrompt(false);

//     const cleanPhone = phone.replace(/\D/g, "");

//     // ===== اعتبارسنجی شماره =====
//     if (!cleanPhone) {
//       setError("لطفاً شماره تماس را وارد کنید.");
//       return;
//     }

//     if (cleanPhone.length < 10) {
//       setError("لطفاً شماره تماس معتبر وارد کنید.");
//       return;
//     }

//     if (cleanPhone[0] !== "9") {
//       setError("شماره تماس باید با ۹ شروع شود. (مثال: ۹۱۲۳۴۵۶۷۸۹)");
//       return;
//     }

//     setIsLoading(true);

//     setTimeout(() => {
//       setIsLoading(false);

//       // ===== اگر از ساین‌آپ اومده =====
//       if (isFromSignup) {
//         setStep("code");
//         setTimer(90);
//         console.log("📱 کد ارسال شد: 1234 (ساخت حساب جدید)");
//         return;
//       }

//       // ===== حالت عادی لاگین =====
//       if (checkUserExists(cleanPhone)) {
//         setStep("code");
//         setTimer(90);
//         console.log("📱 کد ارسال شد: 1234 (ورود)");
//       } else {
//         setShowSignupPrompt(true);
//       }
//     }, 1000);
//   };

//   // ===== مدیریت کد تأیید =====
//   const handleCodeChange = (index, value) => {
//     if (value !== "" && !/^[0-9]$/.test(value)) return;

//     const newCode = [...code];
//     newCode[index] = value;
//     setCode(newCode);

//     if (value && index < 3) {
//       inputRefs.current[index + 1]?.focus();
//     }
//   };

//   const handleKeyDown = (index, e) => {
//     if (e.key === "Backspace") {
//       e.preventDefault();

//       if (code[index]) {
//         const newCode = [...code];
//         newCode[index] = "";
//         setCode(newCode);
//       } else if (index > 0) {
//         const prevIndex = index - 1;
//         const newCode = [...code];
//         newCode[prevIndex] = "";
//         setCode(newCode);
//         inputRefs.current[prevIndex]?.focus();
//       }
//     }

//     if (e.key === "ArrowRight" && index < 3) {
//       e.preventDefault();
//       inputRefs.current[index + 1]?.focus();
//     }
//     if (e.key === "ArrowLeft" && index > 0) {
//       e.preventDefault();
//       inputRefs.current[index - 1]?.focus();
//     }
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
//     const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
//     if (pastedData.length >= 4) {
//       const newCode = pastedData.slice(0, 4).split("");
//       setCode(newCode);
//       inputRefs.current[3]?.focus();
//     }
//   };

//   const isCodeComplete = code.every((digit) => digit !== "");
//   const codeString = code.join("");

//   const handleVerifyCode = () => {
//     setError("");

//     if (!isCodeComplete) {
//       setError("لطفاً کد ۴ رقمی رو کامل وارد کن");
//       return;
//     }

//     if (codeString !== "1234") {
//       setError("کد وارد شده اشتباه است. دوباره تلاش کن");
//       setCode(["", "", "", ""]);
//       setTimeout(() => {
//         inputRefs.current[0]?.focus();
//       }, 100);
//       return;
//     }

//     setIsLoading(true);

//     setTimeout(() => {
//       setIsLoading(false);

//       const cleanPhone = phone.replace(/\D/g, "");

//       // ===== اگر از ثبت‌نام اومده =====
//       if (isFromSignup) {
//         // ذخیره کاربر جدید
//         // const newUserData = {
//         //   phone: cleanPhone,
//         //   answers: JSON.parse(
//         //     localStorage.getItem("userOnboardingAnswers") || "{}"
//         //   ),
//         //   registerDate: new Date().toISOString(),
//         // };
//         const answers = JSON.parse(
//           localStorage.getItem("userOnboardingAnswers") || "{}"
//         );

//         const newUserData = {
//           phone: cleanPhone,
//           answers: answers,
//           registerDate: new Date().toISOString(),
//           role: "patient",
//         };

//         // ذخیره در دیتابیس محلی
//         const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
//         allUsers.push(newUserData);
//         localStorage.setItem("allUsers", JSON.stringify(allUsers));

//         // ===== اضافه کردن به لیست کاربران ثبت‌شده =====
//         // setRegisteredUsers((prev) => [...prev, cleanPhone]);

//         // پاک کردن فلگ‌ها
//         localStorage.removeItem("fromSignup");
//         localStorage.removeItem("signupPhone");
//         localStorage.removeItem("userOnboardingAnswers");

//         // لاگین موفق
//         handleSuccessfulLogin({
//           phone: cleanPhone,
//           isNewUser: true,
//           answers: answers,
//         });
//       } else {
//         // ===== حالت عادی لاگین =====
//         handleSuccessfulLogin({
//           phone: cleanPhone,
//           isNewUser: false,
//           loginDate: new Date().toISOString(),
//         });
//       }
//     }, 1500);

//     // ذخیره اطلاعات لاگین
//     //   const userData = {
//     //     phone: cleanPhone,
//     //     loginDate: new Date().toISOString(),
//     //     isNewUser: isFromSignup,
//     //   };
//     //   localStorage.setItem("userLoggedIn", JSON.stringify(userData));

//     //   // هدایت به پنل کاربری
//     //   navigate("/dashboard");
//     // }, 1500);
//   };

//   const handleGoToSignup = () => {
//     localStorage.setItem("signupPhone", phone.replace(/\D/g, ""));
//     // فلگ برای اینکه بدونیم از ثبت‌نام برمیگردیم
//     localStorage.setItem("fromSignup", "true");
//     navigate("/signup");
//   };

//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setInterval(() => setTimer(timer - 1), 1000);
//       return () => clearInterval(interval);
//     }
//   }, [timer]);

//   const formatPhoneNumber = (value) => {
//     const cleaned = value.replace(/\D/g, "");
//     if (cleaned.length <= 3) return cleaned;
//     if (cleaned.length <= 6)
//       return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
//     return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
//       6,
//       10
//     )}`;
//   };

//   return (
//     <div className={styles.verificationContainer}>
//       <div className={styles.verificationWrapper}>
//         <div className={styles.verificationCard}>
//           <div className={styles.verificationFormSide}>
//             <div className={styles.verificationLogo}>
//               <Link to="/" className={styles.backToHome}>
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                   <path
//                     d="M3 12H21M3 12L10 5M3 12L10 19"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//                 <span>بازگشت به صفحه اصلی</span>
//               </Link>
//               <img src={logo} alt="لوگو" className={styles.logoImage} />
//             </div>

//             {step === "phone" ? (
//               <>
//                 <div className={styles.formHeader}>
//                   <h2 className={styles.formTitle}>
//                     {isFromSignup
//                       ? "برای ساخت حساب کاربری شماره خود را وارد کنید"
//                       : "ورود به حساب کاربری"}
//                   </h2>
//                   <p className={styles.formSubtitle}>
//                     {isFromSignup
//                       ? "با وارد کردن شماره، حساب کاربری شما ساخته می‌شود."
//                       : "شماره تماس خود را وارد کنید."}
//                   </p>
//                 </div>

//                 <div className={styles.inputGroup}>
//                   <label className={styles.inputLabel}>شماره موبایل</label>
//                   <div
//                     className={`${styles.phoneInputWrapper} ${
//                       error ? styles.error : ""
//                     }`}
//                   >
//                     <span className={styles.phonePrefix}>+۹۸</span>
//                     <input
//                       type="tel"
//                       className={styles.phoneInput}
//                       placeholder="۹۱۲ ۳۴۵ ۶۷۸۹"
//                       value={formatPhoneNumber(phone)}
//                       onChange={(e) =>
//                         setPhone(e.target.value.replace(/\D/g, ""))
//                       }
//                       maxLength="14"
//                       autoFocus
//                     />
//                   </div>
//                   {error && <div className={styles.errorMessage}>{error}</div>}
//                 </div>

//                 {/* // ===== مودال ثبت‌نشده ===== */}
//                 {showSignupPrompt && (
//                   <div className={styles.modalOverlay}>
//                     <div className={styles.modalContent}>
//                       {/* دکمه بستن */}
//                       <button
//                         className={styles.modalClose}
//                         onClick={() => setShowSignupPrompt(false)}
//                       >
//                         ✕
//                       </button>

//                       <div className={styles.modalIcon}>🔍</div>
//                       <h3 className={styles.modalTitle}>
//                         این شماره در سیستم ثبت نشده است
//                       </h3>
//                       <p className={styles.modalText}>
//                         برای استفاده از خدمات، ابتدا باید ثبت‌نام کنید.
//                       </p>

//                       <div className={styles.modalActions}>
//                         <button
//                           onClick={handleGoToSignup}
//                           className={styles.modalBtnPrimary}
//                         >
//                           ثبت‌نام کنید
//                           <svg
//                             width="18"
//                             height="18"
//                             viewBox="0 0 24 24"
//                             fill="none"
//                           >
//                             <path
//                               d="M5 12H19M19 12L12 5M19 12L12 19"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                             />
//                           </svg>
//                         </button>
//                         <button
//                           onClick={() => {
//                             setShowSignupPrompt(false);
//                             setPhone("");
//                           }}
//                           className={styles.modalBtnSecondary}
//                         >
//                           شماره دیگری وارد کنید
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {!showSignupPrompt && (
//                   <button
//                     onClick={handleCheckPhone}
//                     className={styles.btnVerification}
//                     disabled={isLoading}
//                   >
//                     {isLoading ? (
//                       <>
//                         <span className={styles.spinner}></span>
//                         در حال بررسی...
//                       </>
//                     ) : (
//                       <>
//                         <span>بررسی شماره</span>
//                         <svg
//                           width="20"
//                           height="20"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                         >
//                           <path
//                             d="M5 12H19M19 12L12 5M19 12L12 19"
//                             stroke="currentColor"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                         </svg>
//                       </>
//                     )}
//                   </button>
//                 )}
//                 <div className={styles.termsText}>
//                   اطلاعات شما به صورت امن و محرمانه نگهداری میشود.
//                 </div>
//               </>
//             ) : (
//               // ===== بخش کد تأیید =====
//               <>
//                 <div className={styles.formHeader}>
//                   <h2 className={styles.formTitle}>کد تأیید</h2>
//                   <p className={styles.formSubtitle}>
//                     کد ۴ رقمی ارسال شده به
//                     <strong className={styles.phoneHighlight}>0{phone}</strong>
//                     را وارد کنید.
//                   </p>
//                 </div>

//                 <div className={styles.inputGroup}>
//                   <label className={styles.inputLabel}>کد تأیید</label>
//                   <div className={styles.codeContainer}>
//                     <div className={styles.codeInputs}>
//                       {[0, 1, 2, 3].map((index) => (
//                         <input
//                           key={index}
//                           ref={(el) => (inputRefs.current[index] = el)}
//                           type="text"
//                           className={styles.codeBox}
//                           maxLength="1"
//                           value={code[index] || ""}
//                           onChange={(e) =>
//                             handleCodeChange(index, e.target.value)
//                           }
//                           onKeyDown={(e) => handleKeyDown(index, e)}
//                           onPaste={handlePaste}
//                           onFocus={(e) => e.target.select()}
//                           autoFocus={index === 0}
//                         />
//                       ))}
//                     </div>
//                     {error && (
//                       <div className={styles.errorMessage}>
//                         <span className={styles.errorIcon}>⚠️</span>
//                         {error}
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <button
//                   onClick={handleVerifyCode}
//                   className={styles.btnVerification}
//                   disabled={isLoading || !isCodeComplete}
//                 >
//                   {isLoading ? (
//                     <>
//                       <span className={styles.spinner}></span>
//                       در حال تأیید...
//                     </>
//                   ) : (
//                     <>
//                       <span>تأیید و ورود به پنل</span>
//                       <svg
//                         width="20"
//                         height="20"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                       >
//                         <path
//                           d="M5 12H19M19 12L12 5M19 12L12 19"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                         />
//                       </svg>
//                     </>
//                   )}
//                 </button>

//                 <div className={styles.codeActions}>
//                   {timer > 0 ? (
//                     <p className={styles.timerText}>
//                       ارسال مجدد تا <strong>{timer}</strong> ثانیه
//                     </p>
//                   ) : (
//                     <button
//                       onClick={() => {
//                         setStep("phone");
//                         setTimer(90);
//                       }}
//                       className={styles.btnResend}
//                     >
//                       ارسال مجدد کد
//                     </button>
//                   )}
//                   <button
//                     className={styles.btnBack}
//                     onClick={() => {
//                       setStep("phone");
//                       setCode(["", "", "", ""]);
//                       setShowSignupPrompt(false);
//                     }}
//                   >
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                       <path
//                         d="M19 12H5M5 12L12 19M5 12L12 5"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                     تغییر شماره
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>

//           {/* Left Side - Image */}
//           <div className={styles.verificationImageSide}>
//             <div className={styles.imageWrapper}>
//               <img
//                 src={loginback}
//                 alt="ورود به حساب"
//                 className={styles.heroImage}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;
