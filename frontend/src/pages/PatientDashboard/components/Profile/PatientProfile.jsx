import React, { useState } from "react";
import styles from "./PatientProfile.module.css";

// ============================================
// COMPONENT: Patient Profile
// ============================================

function PatientProfile({ profileData, userAvatar }) {
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(profileData.formData);

  const [activeTab, setActiveTab] = useState("info");

  const userStats = profileData.userStats;
  const medicalInfo = profileData.medicalInfo;
  // ===== تغییرات فرم =====
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ===== ذخیره تغییرات =====
  const handleSave = () => {
    // ذخیره اطلاعات
    console.log("اطلاعات ذخیره شد:", formData);
    setIsEditing(false);
    alert("اطلاعات با موفقیت ذخیره شد.");
  };

  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>پروفایل</h2>
          <p>اطلاعات شخصی و تنظیمات حساب کاربری</p>
        </div>
        <button
          className={styles.editProfileBtn}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "✕ لغو" : "ویرایش پروفایل"}
        </button>
      </div>

      {/* کارت اصلی پروفایل */}
      <div className={styles.profileMainCard}>
        {/* آواتار و اطلاعات اصلی */}
        <div className={styles.profileHeader}>
          <div className={styles.profileAvatarSection}>
            <div className={styles.profileAvatar}>
              <img src={userAvatar} alt="پروفایل" />
              {isEditing && (
                <button className={styles.changeAvatarBtn}>
                  {/* <span>📷</span> */}
                </button>
              )}
            </div>
            <div className={styles.profileBadge}>
              <span className={styles.badgeDot}></span>
              فعال
            </div>
          </div>

          <div className={styles.profileMainInfo}>
            <h2>
              {isEditing ? (
                <div className={styles.editNameRow}>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="نام"
                    className={styles.editInput}
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="نام خانوادگی"
                    className={styles.editInput}
                  />
                </div>
              ) : (
                `${formData.firstName} ${formData.lastName}`
              )}
            </h2>
            <div className={styles.profileMeta}>
              <span>{formData.phone}</span>
              <span className={styles.metaDivider}>•</span>
              <span>{formData.email}</span>
              <span className={styles.metaDivider}>•</span>
              <span>عضویت: {userStats.joinDate}</span>
            </div>
            <div className={styles.profileQuickStats}>
              <div className={styles.quickStat}>
                <span className={styles.quickStatNumber}>
                  {userStats.totalSessions}
                </span>
                <span className={styles.quickStatLabel}>جلسات</span>
              </div>
              <div className={styles.quickStatDivider}></div>
              <div className={styles.quickStat}>
                <span className={styles.quickStatNumber}>
                  {userStats.completedExercises}/{userStats.totalExercises}
                </span>
                <span className={styles.quickStatLabel}>تمارین</span>
              </div>
              <div className={styles.quickStatDivider}></div>
              <div className={styles.quickStat}>
                <span className={styles.quickStatNumber}>
                  {userStats.upcomingAppointment}
                </span>
                <span className={styles.quickStatLabel}>نوبت بعدی</span>
              </div>
            </div>
          </div>
        </div>

        {/* تب‌ها */}
        <div className={styles.profileTabs}>
          <button
            className={`${styles.profileTab} ${
              activeTab === "info" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("info")}
          >
            اطلاعات شخصی
          </button>
          <button
            className={`${styles.profileTab} ${
              activeTab === "medical" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("medical")}
          >
            اطلاعات درمانی
          </button>
        </div>

        {/* محتوای تب‌ها */}
        <div className={styles.profileTabContent}>
          {/* ===== تب اطلاعات شخصی ===== */}
          {activeTab === "info" && (
            <div className={styles.infoTab}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>نام</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{formData.firstName}</p>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <label>نام خانوادگی</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{formData.lastName}</p>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <label>شماره موبایل</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{formData.phone}</p>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <label>ایمیل</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{formData.email}</p>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <label>جنسیت</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={styles.editSelect}
                    >
                      <option value="male">آقا</option>
                      <option value="female">خانم</option>
                    </select>
                  ) : (
                    <p>{formData.gender === "male" ? "آقا" : "خانم"}</p>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <label>تاریخ تولد</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className={styles.editInput}
                      placeholder="۱۳۷۵/۰۳/۱۵"
                    />
                  ) : (
                    <p>{formData.birthDate}</p>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <label>شغل</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{formData.occupation}</p>
                  )}
                </div>
                <div className={styles.infoItem}>
                  <label>تحصیلات</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className={styles.editInput}
                    />
                  ) : (
                    <p>{formData.education}</p>
                  )}
                </div>
                <div className={styles.infoItemFull}>
                  <label>آدرس</label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={styles.editTextarea}
                      rows="2"
                    />
                  ) : (
                    <p>{formData.address}</p>
                  )}
                </div>
              </div>

              {/* اطلاعات اضطراری */}
              <div className={styles.emergencySection}>
                <h4>تماس اضطراری</h4>
                <div className={styles.emergencyGrid}>
                  <div className={styles.infoItem}>
                    <label>شماره تماس</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleInputChange}
                        className={styles.editInput}
                      />
                    ) : (
                      <p>{formData.emergencyContact}</p>
                    )}
                  </div>
                  <div className={styles.infoItem}>
                    <label>نسبت</label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="emergencyRelation"
                        value={formData.emergencyRelation}
                        onChange={handleInputChange}
                        className={styles.editInput}
                      />
                    ) : (
                      <p>{formData.emergencyRelation}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className={styles.editActions}>
                  <button className={styles.saveBtn} onClick={handleSave}>
                    ذخیره تغییرات
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setIsEditing(false)}
                  >
                    ✕ انصراف
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===== تب اطلاعات درمانی ===== */}
          {activeTab === "medical" && (
            <div className={styles.medicalTab}>
              <div className={styles.medicalCard}>
                <div className={styles.medicalItem}>
                  <span className={styles.medicalLabel}>روانشناس معالج</span>
                  <span className={styles.medicalValue}>
                    {medicalInfo.therapist}
                  </span>
                </div>
                <div className={styles.medicalItem}>
                  <span className={styles.medicalLabel}>تشخیص</span>
                  <span className={styles.medicalValue}>
                    {medicalInfo.diagnosis}
                  </span>
                </div>
                <div className={styles.medicalItem}>
                  <span className={styles.medicalLabel}>روش درمانی</span>
                  <span className={styles.medicalValue}>
                    {medicalInfo.treatmentPlan}
                  </span>
                </div>
                <div className={styles.medicalItem}>
                  <span className={styles.medicalLabel}>داروها</span>
                  <span className={styles.medicalValue}>
                    {medicalInfo.medications}
                  </span>
                </div>
                <div className={styles.medicalItem}>
                  <span className={styles.medicalLabel}>حساسیت‌ها</span>
                  <span className={styles.medicalValue}>
                    {medicalInfo.allergies}
                  </span>
                </div>
                <div className={styles.medicalItem}>
                  <span className={styles.medicalLabel}>یادداشت‌های ویژه</span>
                  <span className={styles.medicalValue}>
                    {medicalInfo.specialNotes}
                  </span>
                </div>
              </div>

              <div className={styles.medicalActions}>
                <button className={styles.btnMedical}>
                  درخواست گزارش درمانی
                </button>
                <button className={styles.btnMedicalSecondary}>
                  اشتراک‌گذاری با پزشک
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientProfile;
