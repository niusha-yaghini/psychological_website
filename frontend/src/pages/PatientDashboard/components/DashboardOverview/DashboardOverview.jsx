import React from "react";
import styles from "./DashboardOverview.module.css";

// ============================================
// COMPONENT: Dashboard Overview
// ============================================
function DashboardOverview({ appointments, getDisplayStatus }) {
  // ===== آمار بر اساس داده‌های واقعی =====
  const stats = [
    {
      label: "جلسات برگزار شده",
      value: appointments.filter((a) => a.status === "completed").length,
    },
    {
      label: "جلسات پیش‌رو",
      value: appointments.filter((a) => {
        const displayStatus = getDisplayStatus(a);
        return displayStatus === "confirmed" || displayStatus === "pending";
      }).length,
    },
    { label: "پیشرفت کلی", value: "۶۵٪" },
    { label: "یادداشت‌ها", value: 12 },
  ];

  return (
    <div className={styles.dashboardContent}>
      {/* ===== ستون راست ===== */}
      <div className={styles.mainColumn}>
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeText}>
            <h2>سلام</h2>
            <p>خوش برگشتی! امروز چطور می‌تونیم بهت کمک کنیم؟</p>
          </div>
        </div>

        {/* آمار */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* جلسه بعدی */}
        <div className={styles.sideColumn}>
          <div className={styles.sectionCard}>
            <h3>جلسه بعدی شما</h3>
            <div className={styles.nextSession}>
              <div className={styles.sessionDate}>
                <span className={styles.dateDay}>جمعه</span>
                <span className={styles.dateNumber}>۲۵</span>
                <span className={styles.dateMonth}>آذر</span>
              </div>

              <div className={styles.sessionInfo}>
                <h4>جلسه مشاوره فردی</h4>
                <p>۱۶:۰۰ - ۱۷:۰۰</p>
                <p>دکتر محمد رضایی</p>
              </div>

              <button className={styles.sessionBtn}>ورود به جلسه</button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ستون چپ ===== */}
      <div className={styles.sectionCard}>
        <h3>فعالیت‌های اخیر</h3>

        <div className={styles.activityList}>
          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>📝</span>
            <div className={styles.activityInfo}>
              <p>یادداشت جدید ثبت شد</p>
              <span>۲ ساعت پیش</span>
            </div>
          </div>

          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>📅</span>
            <div className={styles.activityInfo}>
              <p>جلسه با دکتر رضایی</p>
              <span>۳ روز پیش</span>
            </div>
          </div>

          <div className={styles.activityItem}>
            <span className={styles.activityIcon}>📚</span>
            <div className={styles.activityInfo}>
              <p>مطالعه مقاله "مدیریت استرس"</p>
              <span>۵ روز پیش</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
