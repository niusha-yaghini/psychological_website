import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./PhoneVerification.module.css";

function PhoneVerification({ onVerify }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === "code" && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    if (timer === 0) {
      setCanResend(true);
    }
  }, [step, timer]);

  const handleSendCode = () => {
    if (phone.length < 11) {
      setError("شماره تماس معتبر وارد کنید");
      return;
    }
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setStep("code");
      setTimer(60);
      setCanResend(false);
      console.log("📱 کد تایید:", "1234");
    }, 1000);
  };

  const handleVerify = () => {
    if (code.length !== 4) {
      setError("کد تایید ۴ رقمی را وارد کنید");
      return;
    }
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (code === "1234") {
        onVerify(phone);
        navigate("/patient-panel");
      } else {
        setError("کد تایید اشتباه است");
      }
    }, 1000);
  };

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    console.log("📱 کد جدید:", "1234");
  };

  return (
    <div className={styles.verificationContainer}>
      <div className={styles.verificationCard}>
        <div className={styles.header}>
          <span className={styles.icon}>📱</span>
          <h2>تایید شماره تماس</h2>
          <p>برای ادامه، شماره تماس خود را تایید کنید</p>
        </div>

        {step === "phone" ? (
          <div className={styles.phoneStep}>
            <div className={styles.formGroup}>
              <label>شماره تماس</label>
              <input
                type="tel"
                placeholder="مثال: ۰۹۱۲۳۴۵۶۷۸۹"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.input}
                dir="ltr"
              />
              <p className={styles.hint}>
                کد تایید به این شماره ارسال خواهد شد
              </p>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button
              className={styles.sendBtn}
              onClick={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? "⏳ در حال ارسال..." : "📤 ارسال کد تایید"}
            </button>
          </div>
        ) : (
          <div className={styles.codeStep}>
            <div className={styles.codeInfo}>
              <p>
                کد تایید به شماره <strong>{phone}</strong> ارسال شد
              </p>
            </div>

            <div className={styles.formGroup}>
              <label>کد تایید</label>
              <input
                type="text"
                placeholder="کد ۴ رقمی را وارد کنید"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className={styles.codeInput}
                maxLength={4}
                dir="ltr"
                autoFocus
              />
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button
              className={styles.verifyBtn}
              onClick={handleVerify}
              disabled={isLoading}
            >
              {isLoading ? "⏳ در حال تایید ..." : "تایید و ادامه"}
            </button>

            <div className={styles.resendSection}>
              {canResend ? (
                <button className={styles.resendBtn} onClick={handleResend}>
                  ارسال مجدد کد
                </button>
              ) : (
                <p className={styles.timer}>⏳ {timer} ثانیه تا ارسال مجدد</p>
              )}
            </div>

            <button className={styles.backBtn} onClick={() => setStep("phone")}>
              ↺ ویرایش شماره
            </button>
          </div>
        )}

        <Link to="/" className={styles.backHome}>
          ← بازگشت به صفحه اصلی
        </Link>
      </div>
    </div>
  );
}

export default PhoneVerification;
