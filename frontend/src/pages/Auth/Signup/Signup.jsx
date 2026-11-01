import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

import face_emoji_1 from "../../../../public/images/SignUp_Login/face_emojies/face_emoji_1.png";
import face_emoji_2 from "../../../../public/images/SignUp_Login/face_emojies/face_emoji_2.png";
import face_emoji_3 from "../../../../public/images/SignUp_Login/face_emojies/face_emoji_3.png";
import face_emoji_4 from "../../../../public/images/SignUp_Login/face_emojies/face_emoji_4.png";
import face_emoji_5 from "../../../../public/images/SignUp_Login/face_emojies/face_emoji_5.png";

import welcome_background from "../../../../public/images/SignUp_Login/welcome_background3.png";
import before_questions from "../../../../public/images/SignUp_Login/before_questions2.png";

import clock from "../../../../public/images/SignUp_Login/clock.png";
import lock from "../../../../public/images/SignUp_Login/lock.png";
import purpose from "../../../../public/images/SignUp_Login/purpose.png";

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
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedMulti, setSelectedMulti] = useState([]);
  const [sliderValue, setSliderValue] = useState(5);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const currentQuestion = QUESTIONS[currentStep];
  const isLast = currentStep === QUESTIONS.length - 1;

  // ===== صفحه خوش‌آمدگویی =====
  if (currentStep === -1) {
    return (
      <div className={styles.page}>
        <img src={welcome_background} className={styles.leftImage} alt="" />

        <header className={styles.header}>
          <div className={styles.logo}>روان کوک</div>
        </header>

        <main className={styles.container}>
          <div className={styles.containerTitle}>
            <img
              src={before_questions}
              className={styles.beforeQuestions}
              alt=""
            />

            <h1>قبل از شروع، چند کلمه با شما</h1>
          </div>
          <p>
            برای اینکه بتوانیم تجربه‌ای دقیق‌تر و شخصی‌سازی‌شده‌تر برای شما
            ایجاد کنیم، چند سوال کوتاه از شما می‌پرسیم. پاسخ‌های شما کمک می‌کند
            مسیر مناسب‌تری برای شما پیشنهاد دهیم. نگران نباشید هر زمان که
            بخواهید می‌توانید به سوالات پاسخ دهید.
          </p>

          <div className={styles.features}>
            <div className={styles.feature}>
              <div>
                <img src={purpose} className={styles.featureimg} alt="" />
                <strong>چند سوال ساده</strong>
                <small>برای شناخت بهتر شما</small>
              </div>
            </div>

            <div className={styles.feature}>
              <div>
                <img src={lock} className={styles.featureimg} alt="" />
                <strong>کاملاً محرمانه</strong>
                <small>اطلاعات شما محفوظ است</small>
              </div>
            </div>

            <div className={styles.feature}>
              <div>
                <img src={clock} className={styles.featureimg} alt="" />
                <strong>۳ تا ۵ دقیقه</strong>
                <small>زمان مورد نیاز</small>
              </div>
            </div>
          </div>
          <button className={styles.button} onClick={() => setCurrentStep(0)}>
            شروع پاسخ به سوالات
          </button>
        </main>
      </div>
    );
  }

  const handleNext = () => {
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
      alert("لطفاً یک گزینه رو انتخاب کن");
      return;
    }

    const updatedAnswers = { ...answers, [questionId]: answer };
    setAnswers(updatedAnswers);

    if (isLast) {
      // ===== ذخیره اطلاعات =====
      const userPhone = localStorage.getItem("signupPhone") || "";

      // ذخیره در sessionStorage (موقت)
      sessionStorage.setItem(
        "tempUserData",
        JSON.stringify({
          phone: userPhone,
          answers: updatedAnswers,
          timestamp: Date.now(),
          completedAt: new Date().toISOString(),
        })
      );

      // ذخیره در localStorage (دائمی)
      localStorage.setItem(
        "userOnboardingAnswers",
        JSON.stringify(updatedAnswers)
      );
      localStorage.setItem("userOnboardingComplete", "true");
      localStorage.setItem("userPhone", userPhone);

      // ===== مهم: فلگ برای لاگین =====
      localStorage.setItem("fromSignup", "true");

      // اگر شماره وجود داشت، برای لاگین ذخیره کن
      if (userPhone) {
        localStorage.setItem("signupPhone", userPhone);
      }

      console.log("✅ اطلاعات کاربر ذخیره شد:", {
        phone: userPhone,
        answers: updatedAnswers,
      });

      // هدایت به صفحه لاگین
      navigate("/login", { state: { fromSignup: true } });
    } else {
      setCurrentStep(currentStep + 1);
      setSelectedOption(null);
      setSelectedMulti([]);
      setSliderValue(5);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
          {currentQuestion.type === "slider" && (
            <div className={styles.sliderContainer}>
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

export default Signup;
