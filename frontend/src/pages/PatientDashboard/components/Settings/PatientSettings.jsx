import React from "react";
import styles from "./PatientSettings.module.css";

// ============================================
// COMPONENT: Patient Settings
// ============================================

function PatientSettings({
  notificationSettings,
  setNotificationSettings,
  displaySettings,
  setDisplaySettings,
}) {

  // ===== تابع تغییر تنظیمات =====
  const toggleSetting = (category, key, subKey = null) => {
    if (subKey) {
      setNotificationSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [subKey]: !prev[category][subKey],
        },
      }));
    } else {
      setNotificationSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: !prev[category][key],
        },
      }));
    }
  };

  // ===== تابع تغییر روش =====
  const changeMethod = (category, method) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        method: method,
      },
    }));
  };

  // ===== تابع تغییر زمان یادآوری =====
  const changeTiming = (category, hours) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        timing: hours,
      },
    }));
  };

  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>تنظیمات</h2>
          <p>مدیریت تنظیمات حساب کاربری و اعلان‌ها</p>
        </div>
      </div>

      {/* ===== بخش اعلان‌ها ===== */}
      <div className={styles.settingsSection}>
        <h3>اعلان‌ها و یادآوری‌ها</h3>
        <p className={styles.sectionDescription}>
          تنظیمات مربوط به یادآوری جلسات، تمارین و پیام‌ها
        </p>

        {/* یادآوری جلسات */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              <div>
                <h4>یادآوری جلسات</h4>
                <p>ارسال پیامک یادآوری قبل از جلسات</p>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notificationSettings.sessionReminder.enabled}
                onChange={() => toggleSetting("sessionReminder", "enabled")}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>

          {notificationSettings.sessionReminder.enabled && (
            <div className={styles.settingOptions}>
              <div className={styles.optionGroup}>
                <span className={styles.optionLabel}>روش ارسال:</span>
                <div className={styles.methodButtons}>
                  <button
                    className={`${styles.methodBtn} ${
                      notificationSettings.sessionReminder.method === "sms"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => changeMethod("sessionReminder", "sms")}
                  >
                    پیامک
                  </button>
                </div>
              </div>

              <div className={styles.optionGroup}>
                <span className={styles.optionLabel}>زمان یادآوری:</span>
                <div className={styles.timingButtons}>
                  {[1, 2, 4, 12, 24].map((hours) => (
                    <button
                      key={hours}
                      className={`${styles.timingBtn} ${
                        notificationSettings.sessionReminder.timing === hours
                          ? styles.active
                          : ""
                      }`}
                      onClick={() => changeTiming("sessionReminder", hours)}
                    >
                      {hours} ساعت قبل
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* یادآوری تمارین */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              <div>
                <h4>یادآوری تمارین</h4>
                <p>یادآوری برای انجام تمارین روزانه</p>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notificationSettings.exerciseReminder.enabled}
                onChange={() => toggleSetting("exerciseReminder", "enabled")}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>

          {notificationSettings.exerciseReminder.enabled && (
            <div className={styles.settingOptions}>
              <div className={styles.optionGroup}>
                <span className={styles.optionLabel}>روش ارسال:</span>
                <div className={styles.methodButtons}>
                  <button
                    className={`${styles.methodBtn} ${
                      notificationSettings.exerciseReminder.method === "sms"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => changeMethod("exerciseReminder", "sms")}
                  >
                    پیامک
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* پیام‌های روانشناس */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              {/* <span className={styles.settingIcon}>💬</span> */}
              <div>
                <h4>پیام‌های روانشناس</h4>
                <p>دریافت پیام‌های جدید از روانشناس</p>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notificationSettings.therapistMessages.enabled}
                onChange={() => toggleSetting("therapistMessages", "enabled")}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>

          {notificationSettings.therapistMessages.enabled && (
            <div className={styles.settingOptions}>
              <div className={styles.optionGroup}>
                <span className={styles.optionLabel}>روش ارسال:</span>
                <div className={styles.methodButtons}>
                  <button
                    className={`${styles.methodBtn} ${
                      notificationSettings.therapistMessages.method === "sms"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => changeMethod("therapistMessages", "sms")}
                  >
                    پیامک
                  </button>
                  <button
                    className={`${styles.methodBtn} ${
                      notificationSettings.therapistMessages.method === "email"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => changeMethod("therapistMessages", "email")}
                  >
                    ایمیل
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* گزارش هفتگی */}
        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              <div>
                <h4>گزارش هفتگی</h4>
                <p>دریافت گزارش پیشرفت هفتگی</p>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notificationSettings.weeklyReport.enabled}
                onChange={() => toggleSetting("weeklyReport", "enabled")}
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>

          {notificationSettings.weeklyReport.enabled && (
            <div className={styles.settingOptions}>
              <div className={styles.optionGroup}>
                <span className={styles.optionLabel}>روش ارسال:</span>
                <div className={styles.methodButtons}>
                  <button
                    className={`${styles.methodBtn} ${
                      notificationSettings.weeklyReport.method === "email"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => changeMethod("weeklyReport", "email")}
                  >
                    ایمیل
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== بخش نمایش ===== */}
      <div className={styles.settingsSection}>
        <h3>نمایش</h3>
        <p className={styles.sectionDescription}>
          تنظیمات ظاهری و نمایشی برنامه
        </p>

        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              <span className={styles.settingIcon}>🌓</span>
              <div>
                <h4>حالت شب</h4>
                <p>تغییر تم برنامه به حالت تاریک</p>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={displaySettings.darkMode}
                onChange={() =>
                  setDisplaySettings((prev) => ({
                    ...prev,
                    darkMode: !prev.darkMode,
                  }))
                }
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
        </div>

        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              <div>
                <h4>زبان برنامه</h4>
                <p>انتخاب زبان نمایشی</p>
              </div>
            </div>
            <div className={styles.languageButtons}>
              <button
                className={`${styles.langBtn} ${
                  displaySettings.language === "fa" ? styles.active : ""
                }`}
                onClick={() =>
                  setDisplaySettings((prev) => ({ ...prev, language: "fa" }))
                }
              >
                فارسی
              </button>
              <button
                className={`${styles.langBtn} ${
                  displaySettings.language === "en" ? styles.active : ""
                }`}
                onClick={() =>
                  setDisplaySettings((prev) => ({ ...prev, language: "en" }))
                }
              >
                English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== بخش امنیت ===== */}
      <div className={styles.settingsSection}>
        <h3>امنیت</h3>
        <p className={styles.sectionDescription}>مدیریت رمز عبور و دسترسی‌ها</p>

        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              <div>
                <h4>تغییر شماره موبایل</h4>
                <p>شماره موبایل خود را تغییر دهید</p>
              </div>
            </div>
            <button className={styles.actionBtn}>تغییر</button>
          </div>
        </div>
      </div>

      {/* ===== بخش خطرناک ===== */}
      <div className={styles.dangerSection}>
        <h4>هشدار</h4>
        <p>
          با حذف حساب کاربری، تمام اطلاعات شما به صورت دائمی پاک خواهد شد و قابل
          بازیابی نیست.
        </p>
        <button className={styles.deleteAccountBtn}>🗑️ حذف حساب کاربری</button>
      </div>
    </div>
  );
}

export default PatientSettings;
