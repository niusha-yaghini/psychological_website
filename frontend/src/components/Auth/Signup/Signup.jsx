// pages/Onboarding/OnboardingFlow.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

const QUESTIONS = [
  {
    id: 1,
    title: "به خاطر چی اینجایی؟",
    subtitle: "چه چیزی باعث شد امروز به فکر شروع درمان بیوفتی؟",
    type: "single",
    options: [
      { id: "anxiety", label: "اضطراب و نگرانی بیش از حد"},
      { id: "depression", label: "احساس غم و افسردگی"},
      { id: "relationship", label: "مشکلات ارتباطی با دیگران"},
      { id: "stress", label: "استرس شغلی یا تحصیلی"},
      { id: "growth", label: "فقط میخوام خودم رو بهتر بشناسم"},
      { id: "other", label: "مورد دیگه"},
    ],
  },
  {
    id: 2,
    title: "چقدر روی زندگی‌ات تأثیر گذاشته؟",
    subtitle:
      "از ۱ تا ۱۰، این مشکل چقدر کار، تحصیل یا روابطت رو تحت تأثیر قرار داده؟",
    type: "slider",
    min: 1,
    max: 6,
    emojis: ["😊", "🙂", "😐", "😟", "😢", "😭"],
  },
  {
    id: 3,
    title: "تجربه قبلی داری؟",
    subtitle: "آیا قبلاً تجربه مشاوره یا درمان روانشناسی داشتی؟",
    type: "single",
    options: [
      { id: "never", label: "نه، اولین بارمه"},
      { id: "short", label: "بله، یک بار کوتاه مدت"},
      { id: "medium", label: "بله، چند جلسه"},
      { id: "long", label: "بله، درمان بلندمدت"},
    ],
  },
  {
    id: 4,
    title: "چند نفر رو در کنار خودت داری؟",
    subtitle: "چند نفر رو میشناسی که میتونی راحت باهاشون درد و دل کنی؟",
    type: "single",
    options: [
      { id: "none", label: "هیچکس"},
      { id: "one", label: "یک نفر"},
      { id: "two_three", label: "دو یا سه نفر"},
      { id: "many", label: "گروه حمایتی بزرگ"},
    ],
  },
  {
    id: 5,
    title: "اولویت در جلسه اول؟",
    subtitle: "انتظار داری دکتر در اولین جلسه بیشتر روی چه چیزی تمرکز کنه؟",
    type: "multi",
    options: [
      { id: "listening", label: "گوش دادن و درک عمیق"},
      { id: "solution", label: "ارائه راهکار و تکنیک"},
      { id: "diagnosis", label: "تشخیص دقیق مشکل"},
      { id: "safety", label: "ایجاد احساس امنیت و اعتماد"},
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
          {/* <div className={styles.stepIndicator}>
            <span className={styles.stepNumber}>{currentStep + 1}</span>
            <span className={styles.stepLine}></span>
          </div> */}
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
          {currentQuestion.type === "slider" && (
            <div className={styles.sliderContainer}>
              <div className={styles.sliderEmojis}>
                {currentQuestion.emojis.map((emoji, i) => (
                  <span
                    key={i}
                    className={`${styles.sliderEmoji} ${
                      sliderValue >= i + 1 ? styles.active : ""
                    }`}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
              <input
                type="range"
                min={currentQuestion.min}
                max={currentQuestion.max}
                value={sliderValue}
                onChange={(e) => setSliderValue(parseInt(e.target.value))}
                className={styles.sliderInput}
                dir="ltr" 
                style={{
                  background: `linear-gradient(to right, #2d7d6e ${
                    (sliderValue / currentQuestion.max) * 100
                  }%, #e8e0d8 ${(sliderValue / currentQuestion.max) * 100}%)`,
                }}
              />
              <div className={styles.sliderLabels}>
                <span>کمترین تأثیر</span>
                <span className={styles.sliderValue}>{sliderValue}</span>
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
function PhoneVerification({ answers, navigate }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone"); // "phone" | "code"
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  const handleSendCode = () => {
    if (phone.length < 10) {
      alert("لطفاً شماره موبایل معتبر وارد کن");
      return;
    }
    setIsLoading(true);
    // شبیه‌سازی ارسال کد
    setTimeout(() => {
      setIsLoading(false);
      setStep("code");
      setTimer(30);
      console.log("📱 کد ارسال شد: 123456 (برای تست)");
    }, 1500);
  };

  const handleVerifyCode = () => {
    if (code.length < 6) {
      alert("لطفاً کد ۶ رقمی رو وارد کن");
      return;
    }
    setIsLoading(true);
    // شبیه‌سازی تأیید کد
    setTimeout(() => {
      setIsLoading(false);
      // ذخیره اطلاعات کاربر
      const userData = {
        phone,
        answers,
        onboardingDate: new Date().toISOString(),
      };
      localStorage.setItem("userOnboardingData", JSON.stringify(userData));
      // هدایت به پنل شخصی
      navigate("/dashboard");
    }, 1500);
  };

  // تایمر برای ارسال مجدد
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationCard}>
        {step === "phone" ? (
          <>
            <div className={styles.verificationIcon}>📱</div>
            <h2 className={styles.verificationTitle}>آخرین قدم</h2>
            <p className={styles.verificationSubtitle}>
              شماره موبایل خودت رو وارد کن تا کد تأیید برات ارسال بشه
            </p>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>شماره موبایل</label>
              <div className={styles.phoneInputWrapper}>
                <span className={styles.phonePrefix}>+۹۸</span>
                <input
                  type="tel"
                  className={styles.phoneInput}
                  placeholder="۹۱۲۳۴۵۶۷۸۹"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength="10"
                />
              </div>
            </div>
            <button
              onClick={handleSendCode}
              className={styles.btnVerification}
              disabled={isLoading}
            >
              {isLoading ? "در حال ارسال..." : "ارسال کد تأیید"}
            </button>
          </>
        ) : (
          <>
            <div className={styles.verificationIcon}>🔐</div>
            <h2 className={styles.verificationTitle}>کد تأیید</h2>
            <p className={styles.verificationSubtitle}>
              کد ۶ رقمی ارسال شده به {phone} رو وارد کن
            </p>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>کد تأیید</label>
              <input
                type="text"
                className={styles.codeInput}
                placeholder="کد ۶ رقمی"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                maxLength="6"
              />
            </div>
            <button
              onClick={handleVerifyCode}
              className={styles.btnVerification}
              disabled={isLoading}
            >
              {isLoading ? "در حال تأیید..." : "تأیید و ورود به پنل"}
            </button>
            {timer > 0 ? (
              <p className={styles.timerText}>ارسال مجدد تا {timer} ثانیه</p>
            ) : (
              <button onClick={handleSendCode} className={styles.btnResend}>
                ارسال مجدد کد
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Signup;
