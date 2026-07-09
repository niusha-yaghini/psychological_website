import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate اضافه شد
import styles from "./PatientPanel.module.css";

const mockSessions = [
  {
    id: 1,
    date: "۱۴۰۵/۰۴/۲۰",
    time: "۱۰:۰۰",
    status: "completed",
    doctorNote: "جلسه خوبی بود. تمرینات تنفسی برای مدیریت استرس تجویز شد.",
  },
  {
    id: 2,
    date: "۱۴۰۵/۰۵/۰۵",
    time: "۱۱:۳۰",
    status: "scheduled",
    doctorNote: "جلسه بعدی - ادامه درمان",
  },
  {
    id: 3,
    date: "۱۴۰۵/۰۵/۲۰",
    time: "۱۴:۰۰",
    status: "pending",
    doctorNote: "در انتظار تایید",
  },
];

const availableTimes = ["۹:۰۰", "۱۰:۰۰", "۱۱:۰۰", "۱۴:۰۰", "۱۵:۰۰", "۱۶:۰۰"];

function PatientPanel({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("history"); // 'history' | 'book'
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const navigate = useNavigate(); // ✅ اینجا استفاده شده

  const handleLogout = () => {
    onLogout();
    navigate("/"); // ✅ بعد از خروج به صفحه اصلی می‌رود
  };

  const handleBookSession = () => {
    if (!selectedDate || !selectedTime) {
      alert("لطفاً تاریخ و ساعت را انتخاب کنید");
      return;
    }
    alert(`✅ جلسه برای تاریخ ${selectedDate} ساعت ${selectedTime} رزرو شد!`);
    setSelectedDate("");
    setSelectedTime("");
  };

  return (
    <div className={styles.panelContainer}>
      {/* ===== HEADER ===== */}
      <header className={styles.panelHeader}>
        <div className={styles.headerContent}>
          <div className={styles.userInfo}>
            <span className={styles.userAvatar}>👤</span>
            <div>
              <h2>{user?.name || "کاربر"}</h2>
              <p>📱 {user?.phone}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.notifBtn}>
              🔔 <span className={styles.notifBadge}>۳</span>
            </button>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* ===== TABS ===== */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabBtn} ${
            activeTab === "history" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("history")}
        >
          📋 تاریخچه جلسات
        </button>
        <button
          className={`${styles.tabBtn} ${
            activeTab === "book" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("book")}
        >
          📅 رزرو جلسه جدید
        </button>
      </div>

      {/* ===== CONTENT ===== */}
      <div className={styles.panelContent}>
        {activeTab === "history" ? (
          <div className={styles.historySection}>
            <h3>تاریخچه جلسات</h3>
            <div className={styles.sessionsList}>
              {mockSessions.map((session) => (
                <div key={session.id} className={styles.sessionCard}>
                  <div className={styles.sessionHeader}>
                    <div className={styles.sessionDate}>
                      <span>📅 {session.date}</span>
                      <span>⏰ {session.time}</span>
                    </div>
                    <span
                      className={`${styles.sessionStatus} ${
                        styles[session.status]
                      }`}
                    >
                      {session.status === "completed" && "✅ برگزار شده"}
                      {session.status === "scheduled" && "⏳ برنامه‌ریزی شده"}
                      {session.status === "pending" && "⌛ در انتظار تایید"}
                    </span>
                  </div>
                  {session.doctorNote && (
                    <div className={styles.doctorNote}>
                      <span>👩‍⚕️ یادداشت دکتر:</span>
                      <p>{session.doctorNote}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.bookSection}>
            <h3>رزرو جلسه جدید</h3>
            <div className={styles.bookForm}>
              <div className={styles.formGroup}>
                <label>📅 تاریخ جلسه</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={styles.input}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className={styles.formGroup}>
                <label>⏰ ساعت جلسه</label>
                <div className={styles.timeGrid}>
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      className={`${styles.timeBtn} ${
                        selectedTime === time ? styles.selected : ""
                      }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <button className={styles.bookBtn} onClick={handleBookSession}>
                📅 رزرو جلسه
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== REMINDER ===== */}
      <div className={styles.reminder}>
        <div className={styles.reminderIcon}>🔔</div>
        <div className={styles.reminderText}>
          <h4>یادآوری</h4>
          <p>جلسه بعدی شما در تاریخ ۱۴۰۵/۰۵/۰۵ ساعت ۱۱:۳۰ است</p>
        </div>
      </div>
    </div>
  );
}

export default PatientPanel;
