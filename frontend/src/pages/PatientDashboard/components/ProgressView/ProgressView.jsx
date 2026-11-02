import { useState } from "react";
import styles from "./ProgressView.module.css";

// ============================================
// COMPONENT: Progress Content
// ============================================
function ProgressView({ progressData }) {
  const [activeMilestone, setActiveMilestone] = useState(null);

  // ===== محاسبه درصد =====
  const percentage = Math.round(
    (progressData.completedSessions / progressData.totalSessions) * 100,
  );

  // ===== محاسبه محیط دایره =====
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>پیشرفت من</h2>
          <p>مسیر درمانی و پیشرفت شما</p>
        </div>
        <div className={styles.progressPeriod}>
          <span>از {progressData.startDate}</span>
          <span className={styles.periodDivider}>|</span>
          <span>تا {progressData.estimatedEndDate}</span>
        </div>
      </div>

      {/* آمار کلی */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#4CAF84" }}>
            📅
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {progressData.completedSessions}
            </span>
            <span className={styles.statLabel}>جلسات انجام شده</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#FF9800" }}>
            ⏳
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {progressData.upcomingSessions}
            </span>
            <span className={styles.statLabel}>جلسات پیش‌رو</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#E91E63" }}>
            ❌
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {progressData.cancelledSessions}
            </span>
            <span className={styles.statLabel}>لغو شده</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#2196F3" }}>
            🎯
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {progressData.totalSessions}
            </span>
            <span className={styles.statLabel}>کل جلسات برنامه</span>
          </div>
        </div>
      </div>

      {/* بخش اصلی: دایره و جزئیات */}
      <div className={styles.progressMainSection}>
        {/* دایره پیشرفت */}
        <div className={styles.progressCircleWrapper}>
          <div className={styles.progressCircle}>
            <svg viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="#e8e0d8"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <defs>
                <linearGradient
                  id="progressGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#2d7d6e" />
                  <stop offset="100%" stopColor="#4caf84" />
                </linearGradient>
              </defs>
            </svg>
            <div className={styles.progressCenter}>
              <span className={styles.progressPercent}>{percentage}%</span>
              <span className={styles.progressLabel}>پیشرفت کلی</span>
            </div>
          </div>

          <div className={styles.progressStatus}>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot}></span>
              {progressData.status}
            </div>
            <p className={styles.statusDescription}>
              {percentage < 30 &&
                "شما در ابتدای مسیر درمانی هستید. قدم‌های اولیه را محکم بردارید."}
              {percentage >= 30 &&
                percentage < 60 &&
                "پیشرفت خوبی دارید! نیمه راه را پشت سر گذاشته‌اید."}
              {percentage >= 60 &&
                percentage < 85 &&
                "پیشرفت عالی! به اهداف خود نزدیک می‌شوید."}
              {percentage >= 85 &&
                "تقریباً به پایان مسیر رسیده‌اید! تبریک می‌گوییم."}
            </p>
          </div>
        </div>

        {/* جزئیات جلسات */}
        <div className={styles.progressDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>جلسات انجام شده</span>
            <div className={styles.detailBar}>
              <div
                className={styles.detailBarFill}
                style={{
                  width: `${
                    (progressData.completedSessions /
                      progressData.totalSessions) *
                    100
                  }%`,
                  background: "#4CAF84",
                }}
              />
            </div>
            <span className={styles.detailValue}>
              {progressData.completedSessions} / {progressData.totalSessions}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>جلسات باقی‌مانده</span>
            <div className={styles.detailBar}>
              <div
                className={styles.detailBarFill}
                style={{
                  width: `${
                    ((progressData.totalSessions -
                      progressData.completedSessions) /
                      progressData.totalSessions) *
                    100
                  }%`,
                  background: "#FF9800",
                }}
              />
            </div>
            <span className={styles.detailValue}>
              {progressData.totalSessions - progressData.completedSessions} جلسه
            </span>
          </div>
        </div>
      </div>

      {/* نمودار ماهانه */}
      <div className={styles.monthlyChart}>
        <h3>📊 پیشرفت ماهانه</h3>
        <div className={styles.chartBars}>
          {progressData.monthlyProgress.map((item, index) => (
            <div key={index} className={styles.chartBarWrapper}>
              <div
                className={styles.chartBar}
                style={{
                  height: `${(item.sessions / 4) * 100}%`,
                }}
              >
                <span className={styles.chartBarValue}>{item.sessions}</span>
              </div>
              <span className={styles.chartBarLabel}>{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* حوزه‌های بهبود */}
      <div className={styles.improvementSection}>
        <h3>🎯 حوزه‌های بهبود</h3>
        <div className={styles.improvementGrid}>
          {progressData.improvementAreas.map((area, index) => (
            <div key={index} className={styles.improvementCard}>
              <div className={styles.improvementHeader}>
                <span className={styles.improvementLabel}>{area.label}</span>
                <span className={styles.improvementScore}>{area.score}%</span>
              </div>
              <div className={styles.improvementBar}>
                <div
                  className={styles.improvementBarFill}
                  style={{
                    width: `${area.score}%`,
                    background: area.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* نقاط عطف */}
      <div className={styles.milestoneSection}>
        <h3>🏆 نقاط عطف درمانی</h3>
        <div className={styles.milestoneList}>
          {progressData.milestones.map((milestone) => (
            <div
              key={milestone.id}
              className={`${styles.milestoneItem} ${
                milestone.completed ? styles.completed : ""
              }`}
              onMouseEnter={() => setActiveMilestone(milestone.id)}
              onMouseLeave={() => setActiveMilestone(null)}
            >
              <div className={styles.milestoneIcon}>
                {milestone.completed ? "✅" : "⏳"}
              </div>
              <div className={styles.milestoneContent}>
                <div className={styles.milestoneHeader}>
                  <span className={styles.milestoneTitle}>
                    {milestone.title}
                  </span>
                  <span className={styles.milestoneDate}>{milestone.date}</span>
                </div>
                <p className={styles.milestoneDescription}>
                  {milestone.description}
                </p>
                {activeMilestone === milestone.id && !milestone.completed && (
                  <button className={styles.milestoneAction}>
                    مشاهده جزئیات
                  </button>
                )}
              </div>
              <div className={styles.milestoneLine} />
            </div>
          ))}
        </div>
      </div>

      {/* دکمه‌های اقدام */}
      <div className={styles.progressActions}>
        <button className={styles.btnReport}>دریافت گزارش کامل</button>
        <button className={styles.btnShare}>اشتراک‌گذاری پیشرفت</button>
      </div>
    </div>
  );
}

export default ProgressView;
