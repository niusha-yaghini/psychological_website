// src/components/Auth/Signup/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate اضافه شد
import styles from "./Signup.module.css";

const questions = [
  {
    id: 1,
    question: "به چه دلیلی به مشاوره نیاز دارید؟",
    options: [
      "اضطراب و استرس",
      "افسردگی",
      "مشکلات خانوادگی",
      "مشکلات شغلی",
      "سایر",
    ],
    type: "single",
  },
  {
    id: 2,
    question: "آیا قبلاً سابقه مشاوره داشته‌اید؟",
    options: ["بله", "خیر"],
    type: "single",
  },
  {
    id: 3,
    question: "چه انتظاری از جلسات مشاوره دارید؟",
    options: [
      "درمان کوتاه‌مدت",
      "درمان بلندمدت",
      "شناسایی مشکل اصلی",
      "یادگیری مهارت‌های زندگی",
    ],
    type: "single",
  },
  {
    id: 4,
    question: "آیا مشکل خاصی در زندگی روزمره دارید؟",
    type: "text",
    placeholder: "مشکل خود را توضیح دهید...",
  },
  {
    id: 5,
    question: "چه زمانی برای جلسات مشاوره مناسب هستید؟",
    options: ["صبح‌ها", "عصرها", "شب‌ها", "آخر هفته", "انعطاف‌پذیر"],
    type: "multi",
  },
];

function Signup({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const navigate = useNavigate(); // ✅ اینجا استفاده شده

  const handleSingleSelect = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleMultiSelect = (questionId, option) => {
    const current = selectedOptions[questionId] || [];
    if (current.includes(option)) {
      setSelectedOptions((prev) => ({
        ...prev,
        [questionId]: current.filter((item) => item !== option),
      }));
    } else {
      setSelectedOptions((prev) => ({
        ...prev,
        [questionId]: [...current, option],
      }));
    }
  };

  const handleTextChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isCurrentStepComplete = () => {
    const question = questions[currentStep];
    if (question.type === "text") {
      return answers[question.id] && answers[question.id].trim().length > 0;
    }
    if (question.type === "multi") {
      return (
        selectedOptions[question.id] && selectedOptions[question.id].length > 0
      );
    }
    return answers[question.id] !== undefined;
  };

  const handleNext = () => {
    if (currentStep === questions.length - 1) {
      onComplete({
        ...answers,
        ...selectedOptions,
      });
      navigate("/verify"); // ✅ به صفحه تایید شماره می‌رود
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.stepIndicator}>
          سوال {currentStep + 1} از {questions.length}
        </div>

        <div className={styles.questionContainer}>
          <h3 className={styles.question}>{questions[currentStep].question}</h3>

          <div className={styles.optionsContainer}>
            {questions[currentStep].type === "single" && (
              <div className={styles.singleOptions}>
                {questions[currentStep].options.map((option, index) => (
                  <button
                    key={index}
                    className={`${styles.optionBtn} ${
                      answers[questions[currentStep].id] === option
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() =>
                      handleSingleSelect(questions[currentStep].id, option)
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {questions[currentStep].type === "multi" && (
              <div className={styles.multiOptions}>
                {questions[currentStep].options.map((option, index) => {
                  const isSelected = (
                    selectedOptions[questions[currentStep].id] || []
                  ).includes(option);
                  return (
                    <button
                      key={index}
                      className={`${styles.optionBtn} ${
                        isSelected ? styles.selected : ""
                      }`}
                      onClick={() =>
                        handleMultiSelect(questions[currentStep].id, option)
                      }
                    >
                      {isSelected && (
                        <span className={styles.checkmark}>✓</span>
                      )}
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {questions[currentStep].type === "text" && (
              <textarea
                className={styles.textArea}
                placeholder={questions[currentStep].placeholder}
                value={answers[questions[currentStep].id] || ""}
                onChange={(e) =>
                  handleTextChange(questions[currentStep].id, e.target.value)
                }
                rows={4}
              />
            )}
          </div>
        </div>

        <div className={styles.navigation}>
          <button
            className={`${styles.navBtn} ${styles.prevBtn}`}
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            ← قبلی
          </button>
          <button
            className={`${styles.navBtn} ${styles.nextBtn}`}
            onClick={handleNext}
            disabled={!isCurrentStepComplete()}
          >
            {currentStep === questions.length - 1 ? "✅ ثبت‌نام" : "بعدی →"}
          </button>
        </div>

        <Link to="/login" className={styles.switchBtn}>
          قبلاً ثبت‌نام کردید؟ وارد شوید
        </Link>

        <Link to="/" className={styles.backHome}>
          ← بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

export default Signup;
