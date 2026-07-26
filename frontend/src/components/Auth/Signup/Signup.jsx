import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

import face_emoji_1 from "../../../../public/images/face_emojies/face_emoji_1.png";
import face_emoji_2 from "../../../../public/images/face_emojies/face_emoji_2.png";
import face_emoji_3 from "../../../../public/images/face_emojies/face_emoji_3.png";
import face_emoji_4 from "../../../../public/images/face_emojies/face_emoji_4.png";
import face_emoji_5 from "../../../../public/images/face_emojies/face_emoji_5.png";

import logo from "../../../../public/images/logo2.png";
import loginback from "../../../../public/images/loginback.png";

const QUESTIONS = [
  {
    id: 1,
    title: "به خاطر چی اینجایی؟",
    subtitle: "چه چیزی باعث شد امروز به فکر شروع درمان بیوفتی؟",
    type: "single",
    options: [
      { id: "anxiety", label: "اضطراب و نگرانی بیش از حد" },
      { id: "depression", label: "احساس غم و افسردگی" },
      { id: "relationship", label: "مشکلات ارتباطی با دیگران" },
      { id: "stress", label: "استرس شغلی یا تحصیلی" },
      { id: "growth", label: "فقط میخوام خودم رو بهتر بشناسم" },
      { id: "other", label: "مورد دیگه" },
    ],
  },
  // {
  //   id: 2,
  //   title: "چقدر روی زندگی‌ات تأثیر گذاشته؟",
  //   subtitle:
  //     "از ۱ تا ۱۰، این مشکل چقدر کار، تحصیل یا روابطت رو تحت تأثیر قرار داده؟",
  //   type: "slider",
  //   min: 1,
  //   max: 6,
  //   emojis: ["😊", "🙂", "😐", "😟", "😢", "😭"],
  // },
  {
    id: 2,
    title: "چقدر روی زندگی‌ات تأثیر گذاشته؟",
    subtitle:
      "از ۱ تا 5، این مشکل چقدر کار، تحصیل یا روابطت رو تحت تأثیر قرار داده؟",
    type: "slider",
    min: 1,
    max: 5,
    images: [
      { src: face_emoji_1, label: "خیلی کم" },
      { src: face_emoji_2, label: "کم" },
      { src: face_emoji_3, label: "متوسط" },
      { src: face_emoji_4, label: "زیاد" },
      { src: face_emoji_5, label: "خیلی زیاد" },
    ],
  },
  {
    id: 3,
    title: "تجربه قبلی داری؟",
    subtitle: "آیا قبلاً تجربه مشاوره یا درمان روانشناسی داشتی؟",
    type: "single",
    options: [
      { id: "never", label: "نه، اولین بارمه" },
      { id: "short", label: "بله، یک بار کوتاه مدت" },
      { id: "medium", label: "بله، چند جلسه" },
      { id: "long", label: "بله، درمان بلندمدت" },
    ],
  },
  {
    id: 4,
    title: "چند نفر رو در کنار خودت داری؟",
    subtitle: "چند نفر رو میشناسی که میتونی راحت باهاشون درد و دل کنی؟",
    type: "single",
    options: [
      { id: "none", label: "هیچکس" },
      { id: "one", label: "یک نفر" },
      { id: "two_three", label: "دو یا سه نفر" },
      { id: "many", label: "گروه حمایتی بزرگ" },
    ],
  },
  {
    id: 5,
    title: "اولویت در جلسه اول؟",
    subtitle: "انتظار داری دکتر در اولین جلسه بیشتر روی چه چیزی تمرکز کنه؟",
    type: "multi",
    options: [
      { id: "listening", label: "گوش دادن و درک عمیق" },
      { id: "solution", label: "ارائه راهکار و تکنیک" },
      { id: "diagnosis", label: "تشخیص دقیق مشکل" },
      { id: "safety", label: "ایجاد احساس امنیت و اعتماد" },
    ],
  },
];

function Signup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedMulti, setSelectedMulti] = useState([]);
  const [sliderValue, setSliderValue] = useState(5);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = QUESTIONS[currentStep];
  const isLast = currentStep === QUESTIONS.length - 1;

  const handleNext = () => {
    // ذخیره پاسخ فعلی
    const questionId = currentQuestion.id;
    let answer = null;

    if (currentQuestion.type === "single") {
      answer = selectedOption;
    } else if (currentQuestion.type === "multi") {
      answer = selectedMulti;
    } else if (currentQuestion.type === "slider") {
      answer = sliderValue;
    }

    if (answer === null || (Array.isArray(answer) && answer.length === 0)) {
      // می‌تونی یک toast یا alert بزاری
      alert("لطفاً یک گزینه رو انتخاب کن");
      return;
    }

    setAnswers({ ...answers, [questionId]: answer });

    if (isLast) {
      setIsComplete(true);
    } else {
      setCurrentStep(currentStep + 1);
      // ریست کردن انتخاب‌ها برای سوال بعدی
      setSelectedOption(null);
      setSelectedMulti([]);
      setSliderValue(5);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // بارگذاری پاسخ قبلی
      const prevAnswer = answers[QUESTIONS[currentStep - 1].id];
      const prevQuestion = QUESTIONS[currentStep - 1];
      if (prevQuestion.type === "single") {
        setSelectedOption(prevAnswer || null);
      } else if (prevQuestion.type === "multi") {
        setSelectedMulti(prevAnswer || []);
      } else if (prevQuestion.type === "slider") {
        setSliderValue(prevAnswer || 5);
      }
    }
  };

  // اگر سوالات تموم شده، صفحه دریافت شماره و کد رو نشون بده
  if (isComplete) {
    return <PhoneVerification answers={answers} navigate={navigate} />;
  }

  return (
    <div className={styles.onboardingContainer}>
      {/* Progress Bar */}
      <div className={styles.progressWrapper}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${((currentStep + 1) / QUESTIONS.length) * 100}%`,
            }}
          />
        </div>
        <span className={styles.progressText}>
          {currentStep + 1} از {QUESTIONS.length}
        </span>
      </div>

      {/* Question Card */}
      <div className={styles.questionCard}>
        <div className={styles.questionHeader}>
          <h2 className={styles.questionTitle}>{currentQuestion.title}</h2>
          <p className={styles.questionSubtitle}>{currentQuestion.subtitle}</p>
        </div>

        <div className={styles.optionsContainer}>
          {/* Single Select */}
          {currentQuestion.type === "single" && (
            <div className={styles.optionsGrid}>
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.id}
                  className={`${styles.optionCard} ${
                    selectedOption === opt.id ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedOption(opt.id)}
                >
                  <span className={styles.optionEmoji}>{opt.emoji}</span>
                  <span className={styles.optionLabel}>{opt.label}</span>
                  {selectedOption === opt.id && (
                    <span className={styles.optionCheck}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Multi Select */}
          {currentQuestion.type === "multi" && (
            <div className={styles.optionsGrid}>
              {currentQuestion.options.map((opt) => (
                <button
                  key={opt.id}
                  className={`${styles.optionCard} ${
                    selectedMulti.includes(opt.id) ? styles.selected : ""
                  }`}
                  onClick={() => {
                    if (selectedMulti.includes(opt.id)) {
                      setSelectedMulti(
                        selectedMulti.filter((id) => id !== opt.id)
                      );
                    } else {
                      setSelectedMulti([...selectedMulti, opt.id]);
                    }
                  }}
                >
                  <span className={styles.optionEmoji}>{opt.emoji}</span>
                  <span className={styles.optionLabel}>{opt.label}</span>
                  {selectedMulti.includes(opt.id) && (
                    <span className={styles.optionCheck}>✓</span>
                  )}
                </button>
              ))}
              <p className={styles.multiHint}>
                * می‌تونی چند گزینه رو انتخاب کنی
              </p>
            </div>
          )}

          {/* Slider */}
          {/* {currentQuestion.type === "slider" && (
            <div className={styles.sliderContainer}>
              <div className={styles.sliderEmojis}>
                {currentQuestion.emojis.map((emoji, i) => {
                  const value = i + 1;
                  return (
                    <div
                      key={i}
                      className={`${styles.sliderEmojiWrapper} ${
                        sliderValue >= value ? styles.active : ""
                      }`}
                      onClick={() => setSliderValue(value)}
                    >
                      <span className={styles.sliderEmoji}>{emoji}</span>
                      <span className={styles.sliderEmojiLabel}>{value}</span>
                    </div>
                  );
                })}
              </div>

              <div className={styles.sliderTrackWrapper}>
                <input
                  type="range"
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(parseInt(e.target.value))}
                  className={styles.sliderInput}
                  style={{
                    background: `linear-gradient(to right, #e8e0d8 0%, #e8e0d8 ${
                      100 -
                      ((sliderValue - 1) / (currentQuestion.max - 1)) * 100
                    }%, #2d7d6e ${
                      100 -
                      ((sliderValue - 1) / (currentQuestion.max - 1)) * 100
                    }%, #2d7d6e 100%)`,
                  }}
                />
              </div>

              <div className={styles.sliderLabels}>
                <span>کمترین تأثیر</span>
                <span className={styles.sliderValue}>{sliderValue}</span>
                <span>بیشترین تأثیر</span>
              </div>
            </div>
          )} */}

          {/* Slider با تصاویر */}
          {currentQuestion.type === "slider" && (
            <div className={styles.sliderContainer}>
              {/* تصاویر */}
              <div className={styles.sliderEmojis}>
                {currentQuestion.images.map((img, i) => {
                  const value = i + 1;
                  return (
                    <div
                      key={i}
                      className={`${styles.sliderEmojiWrapper} ${
                        sliderValue >= value ? styles.active : ""
                      }`}
                      onClick={() => setSliderValue(value)}
                    >
                      <img
                        src={img.src}
                        alt={img.label}
                        className={styles.sliderImage}
                      />
                      <span className={styles.sliderEmojiLabel}>
                        {img.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* اسلایدر */}
              <div className={styles.sliderTrackWrapper}>
                <input
                  type="range"
                  min={currentQuestion.min}
                  max={currentQuestion.max}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(parseInt(e.target.value))}
                  className={styles.sliderInput}
                  style={{
                    background: `linear-gradient(to right, #e8e0d8 0%, #e8e0d8 ${
                      100 -
                      ((sliderValue - 1) / (currentQuestion.max - 1)) * 100
                    }%, #2d7d6e ${
                      100 -
                      ((sliderValue - 1) / (currentQuestion.max - 1)) * 100
                    }%, #2d7d6e 100%)`,
                  }}
                />
              </div>

              {/* لیبل‌ها */}
              <div className={styles.sliderLabels}>
                <span>کمترین تأثیر</span>
                {/* <span className={styles.sliderValue}>{sliderValue}</span> */}
                <span>بیشترین تأثیر</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className={styles.navigationButtons}>
          <button
            onClick={handlePrev}
            className={`${styles.btnNav} ${styles.btnPrev}`}
            disabled={currentStep === 0}
          >
            {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 19L8 12L15 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg> */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 5L16 12L9 19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            قبلی
          </button>
          <button
            onClick={handleNext}
            className={`${styles.btnNav} ${styles.btnNext}`}
          >
            {isLast ? "مشاهده نتیجه" : "بعدی"}
            {!isLast && (
              // <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              //   <path
              //     d="M9 5L16 12L9 19"
              //     stroke="currentColor"
              //     strokeWidth="2"
              //     strokeLinecap="round"
              //     strokeLinejoin="round"
              //   />
              // </svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 19L8 12L15 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className={styles.decorativeCircle1} />
      <div className={styles.decorativeCircle2} />
      <div className={styles.decorativeCircle3} />
    </div>
  );
}

// ============================================
// COMPONENT: Phone Verification
// ============================================
// function PhoneVerification({ answers, navigate }) {
//   const [phone, setPhone] = useState("");
//   const [code, setCode] = useState("");
//   const [step, setStep] = useState("phone"); // "phone" | "code"
//   const [isLoading, setIsLoading] = useState(false);
//   const [timer, setTimer] = useState(0);

//   const handleSendCode = () => {
//     if (phone.length < 10) {
//       alert("لطفاً شماره موبایل معتبر وارد کن");
//       return;
//     }
//     setIsLoading(true);
//     // شبیه‌سازی ارسال کد
//     setTimeout(() => {
//       setIsLoading(false);
//       setStep("code");
//       setTimer(30);
//       console.log("📱 کد ارسال شد: 123456 (برای تست)");
//     }, 1500);
//   };

//   const handleVerifyCode = () => {
//     if (code.length < 6) {
//       alert("لطفاً کد ۶ رقمی رو وارد کن");
//       return;
//     }
//     setIsLoading(true);
//     // شبیه‌سازی تأیید کد
//     setTimeout(() => {
//       setIsLoading(false);
//       // ذخیره اطلاعات کاربر
//       const userData = {
//         phone,
//         answers,
//         onboardingDate: new Date().toISOString(),
//       };
//       localStorage.setItem("userOnboardingData", JSON.stringify(userData));
//       // هدایت به پنل شخصی
//       navigate("/dashboard");
//     }, 1500);
//   };

//   // تایمر برای ارسال مجدد
//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setInterval(() => setTimer(timer - 1), 1000);
//       return () => clearInterval(interval);
//     }
//   }, [timer]);

//   return (
//     <div className={styles.verificationContainer}>
//       <div className={styles.verificationCard}>
//         {step === "phone" ? (
//           <>
//             <div className={styles.verificationIcon}>📱</div>
//             <h2 className={styles.verificationTitle}>آخرین قدم</h2>
//             <p className={styles.verificationSubtitle}>
//               شماره موبایل خودت رو وارد کن تا کد تأیید برات ارسال بشه
//             </p>
//             <div className={styles.inputGroup}>
//               <label className={styles.inputLabel}>شماره موبایل</label>
//               <div className={styles.phoneInputWrapper}>
//                 <span className={styles.phonePrefix}>+۹۸</span>
//                 <input
//                   type="tel"
//                   className={styles.phoneInput}
//                   placeholder="۹۱۲۳۴۵۶۷۸۹"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
//                   maxLength="10"
//                 />
//               </div>
//             </div>
//             <button
//               onClick={handleSendCode}
//               className={styles.btnVerification}
//               disabled={isLoading}
//             >
//               {isLoading ? "در حال ارسال..." : "ارسال کد تأیید"}
//             </button>
//           </>
//         ) : (
//           <>
//             <div className={styles.verificationIcon}>🔐</div>
//             <h2 className={styles.verificationTitle}>کد تأیید</h2>
//             <p className={styles.verificationSubtitle}>
//               کد ۶ رقمی ارسال شده به {phone} رو وارد کن
//             </p>
//             <div className={styles.inputGroup}>
//               <label className={styles.inputLabel}>کد تأیید</label>
//               <input
//                 type="text"
//                 className={styles.codeInput}
//                 placeholder="کد ۶ رقمی"
//                 value={code}
//                 onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
//                 maxLength="6"
//               />
//             </div>
//             <button
//               onClick={handleVerifyCode}
//               className={styles.btnVerification}
//               disabled={isLoading}
//             >
//               {isLoading ? "در حال تأیید..." : "تأیید و ورود به پنل"}
//             </button>
//             {timer > 0 ? (
//               <p className={styles.timerText}>ارسال مجدد تا {timer} ثانیه</p>
//             ) : (
//               <button onClick={handleSendCode} className={styles.btnResend}>
//                 ارسال مجدد کد
//               </button>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// ============================================
// COMPONENT: Phone Verification (نسخه جدید)
// ============================================
// import logo from "../../../public/images/logo1.png";
// import verificationImage from "../../../public/images/verification-hero.png"; // تصویر سمت چپ

function PhoneVerification({ answers, navigate }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState("");

  const handleSendCode = () => {
    setError("");
    if (phone.length < 10) {
      setError("لطفاً شماره موبایل معتبر وارد کن");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("code");
      setTimer(30);
      console.log("📱 کد ارسال شد: 123456");
    }, 1500);
  };

  const handleVerifyCode = () => {
    setError("");
    if (code.length < 6) {
      setError("لطفاً کد ۶ رقمی رو وارد کن");
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
      {/* Decorative Elements */}
      {/* <div className={styles.decorativeCircle1} />
      <div className={styles.decorativeCircle2} />
      <div className={styles.decorativeCircle3} /> */}

      <div className={styles.verificationWrapper}>
        {/* Logo */}

        {/* Main Card */}
        <div className={styles.verificationCard}>
          {/* Right Side - Form */}
          <div className={styles.verificationFormSide}>
            <div className={styles.verificationLogo}>
              <img src={logo} alt="لوگو" className={styles.logoImage} />
              {/* <span className={styles.logoText}>
              کلینیک <span>روانشناسی</span>
              </span> */}
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
                  {error && (
                    <div className={styles.errorMessage}>
                      <span>⚠️</span> {error}
                    </div>
                  )}
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

                {/* <div className={styles.divider}>
                  <span className={styles.dividerLine}></span>
                  <span className={styles.dividerText}>یا</span>
                  <span className={styles.dividerLine}></span>
                </div>

                <button className={styles.btnWhatsApp}>
                  <span>💬</span>
                  دریافت کد از واتس‌اپ
                </button> */}
              </>
            ) : (
              <>
                <div className={styles.formHeader}>
                  <div className={styles.codeIcon}>🔐</div>
                  <h2 className={styles.formTitle}>کد تأیید</h2>
                  <p className={styles.formSubtitle}>
                    کد ۶ رقمی ارسال شده به
                    <strong className={styles.phoneHighlight}>
                      {formatPhoneNumber(phone)}
                    </strong>
                    رو وارد کن
                  </p>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>کد تأیید</label>
                  <div
                    className={`${styles.codeInputWrapper} ${
                      error ? styles.error : ""
                    }`}
                  >
                    <input
                      type="text"
                      className={styles.codeInput}
                      placeholder="_ _ _ _ _ _"
                      value={code}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 6) setCode(val);
                      }}
                      maxLength="6"
                      autoFocus
                    />
                    <div className={styles.codeDots}>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          className={`${styles.codeDot} ${
                            code.length > i ? styles.filled : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {error && (
                    <div className={styles.errorMessage}>
                      <span>⚠️</span> {error}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleVerifyCode}
                  className={styles.btnVerification}
                  disabled={isLoading || code.length < 6}
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
                      <span>🔄</span> ارسال مجدد کد
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
              {/* <div className={styles.floatingBadge}>
                <span className={styles.badgeIcon}>💚</span>
                <span>قدم آخر تا شروع</span>
              </div> */}
              {/* <div className={styles.floatingBadge2}>
                <span className={styles.badgeIcon}>✨</span>
                <span>رایگان و بدون تعهد</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
