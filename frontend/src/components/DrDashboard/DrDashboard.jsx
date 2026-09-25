// components/DoctorDashboard/DoctorDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DrDashboard.module.css";

import {
  FaHome,
  FaCalendarAlt,
  FaVideo,
  FaUsers,
  FaClipboardList,
  FaStickyNote,
  FaCommentDots,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBell,
  FaPlus,
} from "react-icons/fa";

import logo from "../../../public/images/logo/logo2.png";
import doctorAvatar from "../../../public/images/Patient_Panel/usericon.png";

import seedData from "../../../../backend/seed";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: false, dialect: "persian" });

// ============================================
// 📌 توابع کمکی (Global Helpers)
// ============================================

// ===== ترتیب روزهای هفته =====
const WEEK_DAYS_ORDER = {
  شنبه: 0,
  یکشنبه: 1,
  دوشنبه: 2,
  سه‌شنبه: 3,
  چهارشنبه: 4,
  پنجشنبه: 5,
  جمعه: 6,
};

// ===== تبدیل اعداد فارسی به انگلیسی =====
const toEnglishDigits = (str) => {
  if (!str) return str;
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";
  return String(str).replace(
    /[۰-۹]/g,
    (d) => englishDigits[persianDigits.indexOf(d)],
  );
};

// ===== تبدیل اعداد انگلیسی به فارسی =====
const toPersianDigits = (str) => {
  if (str === null || str === undefined) return str;
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";
  return String(str).replace(
    /[0-9]/g,
    (d) => persianDigits[englishDigits.indexOf(d)],
  );
};

// ===== تبدیل روز هفته به تاریخ شمسی =====
const getDateFromWeekDay = (dayName, weekOffset = 0) => {
  const todayJalali = moment().format("jYYYY/jMM/jDD");
  const [todayYear, todayMonth, todayDay] = toEnglishDigits(todayJalali)
    .split("/")
    .map(Number);

  const todayDate = moment(
    `${todayYear}/${todayMonth}/${todayDay}`,
    "jYYYY/jMM/jDD",
  );

  const gregorianDayOfWeek = todayDate.day();
  const persianDayOfWeek =
    gregorianDayOfWeek === 6 ? 0 : gregorianDayOfWeek + 1;

  const saturdayOfThisWeek = todayDate
    .clone()
    .subtract(persianDayOfWeek, "days");

  const saturdayOfTargetWeek = saturdayOfThisWeek
    .clone()
    .add(weekOffset, "weeks");

  const targetDayOfWeek = WEEK_DAYS_ORDER[dayName];
  const targetDate = saturdayOfTargetWeek.clone().add(targetDayOfWeek, "days");

  return targetDate.format("jYYYY/jMM/jDD");
};

// ===== ساخت moment از تاریخ و ساعت نوبت =====
const getAppointmentMoment = (appointment) => {
  const dateParts = toEnglishDigits(appointment.date).split("/");
  const timeStr = appointment.time.split(" - ")[0];
  const timeParts = toEnglishDigits(timeStr).split(":");

  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[2]);
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);

  return moment(
    `${year}/${month}/${day} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    "jYYYY/jMM/jDD HH:mm",
  );
};

// ===== چک کردن اینکه تاریخ نوبت گذشته =====
const isAppointmentPast = (appointment) => {
  const appointmentMoment = getAppointmentMoment(appointment);
  if (!appointmentMoment.isValid()) return false;
  return appointmentMoment.isBefore(moment());
};

// ===== چک کردن اینکه نوبت امروز است =====
const isAppointmentToday = (appointment) => {
  const appointmentMoment = getAppointmentMoment(appointment);
  if (!appointmentMoment.isValid()) return false;
  return appointmentMoment.isSame(moment(), "day");
};

// ===== چک کردن اینکه نوبت فردا است =====
const isAppointmentTomorrow = (appointment) => {
  const appointmentMoment = getAppointmentMoment(appointment);
  if (!appointmentMoment.isValid()) return false;
  return appointmentMoment.isSame(moment().add(1, "day"), "day");
};

// ===== تبدیل روز هفته به برچسب نسبی (امروز/فردا/...) =====
const getRelativeDateLabel = (appointment) => {
  const appointmentMoment = getAppointmentMoment(appointment);
  if (!appointmentMoment.isValid()) return appointment.date;

  const now = moment();

  if (appointmentMoment.isSame(now, "day")) return "امروز";
  if (appointmentMoment.isSame(now.clone().add(1, "day"), "day")) return "فردا";
  if (appointmentMoment.isSame(now.clone().add(2, "day"), "day"))
    return "پس‌فردا";

  // اگه توی همین هفته بود، اسم روز رو نشون بده
  const diffDays = appointmentMoment.diff(now, "days");
  if (diffDays > 0 && diffDays < 7) {
    return appointmentMoment.format("dddd");
  }

  // در غیر این صورت تاریخ کامل
  return appointment.date;
};

// ===== تبدیل نوع جلسه به برچسب فارسی =====
const getTypeLabel = (typeKey) => {
  const map = {
    individual: "فردی",
    couple: "زوج",
    teen: "نوجوان",
    family: "خانواده",
  };
  return map[typeKey] || "فردی";
};

// ===== تبدیل نوع جلسه به آیکون =====
const getTypeIcon = (typeKey) => {
  const map = {
    individual: "🧑‍⚕️",
    couple: "💑",
    teen: "🧒",
    family: "👨‍👩‍👧‍👦",
  };
  return map[typeKey] || "🧑‍⚕️";
};

// ===== تبدیل وضعیت به اطلاعات نمایشی =====
const getStatusInfo = (status) => {
  const map = {
    pending: { label: "در انتظار", className: "statusPending" },
    confirmed: { label: "تأیید شده", className: "statusConfirmed" },
    completed: { label: "برگزار شده", className: "statusCompleted" },
    cancelled: { label: "لغو شده", className: "statusCancelled" },
  };
  return map[status] || map.pending;
};

// const getDisplayStatus = (appointment) => {
//   // اگه لغو شده یا انجام شده، همون
//   if (appointment.status === "cancelled") return "cancelled";
//   if (appointment.status === "completed") return "completed";

//   const startMoment = getAppointmentMoment(appointment);
//   const now = moment();

//   // اگه start گذشته ولی هنوز status confirmed → در حال برگزاری یا گذشته
//   const durationMinutes = (appointment.duration || 1) * 60;
//   const endMoment = startMoment.clone().add(durationMinutes, "minutes");

//   // در حال برگزاری
//   if (now.isAfter(startMoment) && now.isBefore(endMoment)) {
//     return "ongoing";
//   }

//   // زمانش گذشته ولی هنوز completed نشده (پزشک ثبت نکرده)
//   if (now.isAfter(endMoment) && appointment.status === "confirmed") {
//     return "upcoming"; // ← یا هر چیز دیگه‌ای، نظر خودت
//   }

//   // هنوز نرسیده
//   return appointment.status; // confirmed یا pending
// };

// ===== محاسبه وضعیت نمایشی نوبت (پنل دکتر) =====

// const getDisplayStatus = (appointment) => {
//   // اگه لغو یا انجام شده، همون رو برگردون
//   if (appointment.status === "cancelled") return "cancelled";
//   if (appointment.status === "completed") return "completed";

//   const startMoment = getAppointmentMoment(appointment);
//   if (!startMoment.isValid()) return appointment.status;

//   const now = moment();
//   const durationMinutes = (appointment.duration || 1) * 60;
//   const endMoment = startMoment.clone().add(durationMinutes, "minutes");

//   // در حال برگزاری
//   if (now.isAfter(startMoment) && now.isBefore(endMoment)) {
//     return "ongoing";
//   }

//   // زمان گذشته
//   if (now.isAfter(endMoment)) {
//     if (appointment.status === "confirmed") return "no-show";
//     if (appointment.status === "pending") return "expired";
//   }

//   // هنوز نرسیده
//   return appointment.status;
// };

// ===== محاسبه وضعیت نمایشی نوبت (پنل دکتر) =====
// const getDisplayStatus = (appointment) => {
//   // اگه لغو یا انجام شده، همون رو برگردون
//   if (appointment.status === "cancelled") return "cancelled";
//   if (appointment.status === "completed") return "completed";

//   const startMoment = getAppointmentMoment(appointment);
//   if (!startMoment.isValid()) return appointment.status;

//   const now = moment();
//   const durationMinutes = (appointment.duration || 1) * 60;
//   const endMoment = startMoment.clone().add(durationMinutes, "minutes");

//   // در حال برگزاری
//   if (now.isAfter(startMoment) && now.isBefore(endMoment)) {
//     return "ongoing";
//   }

//   // زمان گذشته
//   if (now.isAfter(endMoment)) {
//     // ===== بازه ۴۸ ساعته: منتظر تأیید انجام =====
//     const hoursSinceEnd = now.diff(endMoment, "hours", true);
//     if (hoursSinceEnd < 48) {
//       return "awaiting-confirmation";
//     }

//     // ===== بعد از ۴۸ ساعت =====
//     if (appointment.status === "confirmed") return "no-show";
//     if (appointment.status === "pending") return "expired";
//   }

//   // هنوز نرسیده
//   return appointment.status;
// };

// ===== تبدیل وضعیت نمایشی به اطلاعات نمایشی =====
// const getDisplayStatusInfo = (displayStatus) => {
//   const map = {
//     pending: { label: "در انتظار", className: "statusPending" },
//     confirmed: { label: "تأیید شده", className: "statusConfirmed" },
//     ongoing: { label: "در حال برگزاری", className: "sessionOngoing" },
//     completed: { label: "انجام شده", className: "statusCompleted" },
//     cancelled: { label: "لغو شده", className: "statusCancelled" },
//     "no-show": { label: "انجام نشده", className: "statusNoShow" },
//     expired: { label: "از موعد گذشته", className: "statusExpired" },
//   };
//   return map[displayStatus] || map.pending;
// };

// const getDisplayStatusInfo = (displayStatus) => {
//   const map = {
//     pending: { label: "در انتظار", className: "statusPending" },
//     confirmed: { label: "تأیید شده", className: "statusConfirmed" },
//     ongoing: { label: "در حال برگزاری", className: "sessionOngoing" },
//     completed: { label: "انجام شده", className: "statusCompleted" },
//     cancelled: { label: "لغو شده", className: "statusCancelled" },
//     "no-show": { label: "انجام نشده", className: "statusNoShow" },
//     expired: { label: "از موعد گذشته", className: "statusExpired" },
//     "awaiting-confirmation": {
//       label: "منتظر تأیید انجام",
//       className: "statusAwaitingConfirmation",
//     },
//   };
//   return map[displayStatus] || map.pending;
// };

// ===== محاسبه وضعیت نمایشی نوبت (پنل دکتر) =====
// const getDisplayStatus = (appointment) => {
//   // ===== حالت‌های پایه =====
//   if (appointment.status === "cancelled") return "cancelled";
//   if (appointment.status === "completed") return "completed";
//   if (appointment.status === "no-show") return "no-show";

//   const startMoment = getAppointmentMoment(appointment);
//   if (!startMoment.isValid()) return appointment.status;

//   const now = moment();
//   const durationMinutes = (appointment.duration || 1) * 60;
//   const endMoment = startMoment.clone().add(durationMinutes, "minutes");

//   // ===== در حال برگزاری =====
//   if (now.isAfter(startMoment) && now.isBefore(endMoment)) {
//     return "ongoing";
//   }

//   // ===== آینده =====
//   if (now.isBefore(startMoment)) {
//     return appointment.status; // pending یا confirmed
//   }

//   // ===== گذشته (بعد از end) =====
//   if (now.isAfter(endMoment)) {
//     const hoursSinceEnd = now.diff(endMoment, "hours", true);

//     // بازه ۴۸ ساعته: منتظر تأیید انجام
//     if (hoursSinceEnd < 48) {
//       return "awaiting-confirmation";
//     }

//     // بعد از ۴۸ ساعت: برگزار نشده
//     return "no-show";
//   }

//   return appointment.status;
// };

// ===== محاسبه وضعیت نمایشی نوبت (پنل دکتر) =====
const getDisplayStatus = (appointment) => {
  // ===== حالت‌های پایه =====
  if (appointment.status === "cancelled") return "cancelled";
  if (appointment.status === "completed") return "completed";
  if (appointment.status === "no-show") return "no-show";

  const startMoment = getAppointmentMoment(appointment);
  if (!startMoment.isValid()) return appointment.status;

  const now = moment();
  const durationMinutes = (appointment.duration || 1) * 60;
  const endMoment = startMoment.clone().add(durationMinutes, "minutes");

  // ===== در حال برگزاری =====
  if (now.isAfter(startMoment) && now.isBefore(endMoment)) {
    return "ongoing";
  }

  // ===== آینده =====
  if (now.isBefore(startMoment)) {
    return appointment.status; // pending یا confirmed
  }

  // ===== گذشته (بعد از end) =====
  if (now.isAfter(endMoment)) {
    const hoursSinceEnd = now.diff(endMoment, "hours", true);

    // بازه ۴۸ ساعته: منتظر تأیید انجام
    if (hoursSinceEnd < 48) {
      return "awaiting-confirmation";
    }

    // بعد از ۴۸ ساعت: برگزار نشده
    return "no-show";
  }

  return appointment.status;
};

// ===== تبدیل وضعیت نمایشی به اطلاعات نمایشی =====
const getDisplayStatusInfo = (displayStatus) => {
  const map = {
    pending: { label: "در انتظار", className: "statusPending" },
    confirmed: { label: "تأیید شده", className: "statusConfirmed" },
    ongoing: { label: "در حال برگزاری", className: "sessionOngoing" },
    completed: { label: "برگزار شده", className: "statusCompleted" },
    cancelled: { label: "لغو شده", className: "statusCancelled" },
    "no-show": { label: "برگزار نشده", className: "statusNoShow" },
    "awaiting-confirmation": {
      label: "منتظر تأیید انجام",
      className: "statusAwaitingConfirmation",
    },
  };
  return map[displayStatus] || map.pending;
};

// const getDisplayStatusInfo = (displayStatus) => {
//   const map = {
//     pending: { label: "در انتظار", className: "statusPending" },
//     confirmed: { label: "تأیید شده", className: "statusConfirmed" },
//     ongoing: { label: "در حال برگزاری", className: "sessionOngoing" },
//     completed: { label: "برگزار شده", className: "statusCompleted" },
//     cancelled: { label: "لغو شده", className: "statusCancelled" },
//     "no-show": { label: "برگزار نشده", className: "statusNoShow" },
//     "awaiting-confirmation": {
//       label: "منتظر تأیید انجام",
//       className: "statusAwaitingConfirmation",
//     },
//   };
//   return map[displayStatus] || map.pending;
// };

// ===== چک کردن اینکه جلسه «انجام نشده» است =====
// const isNotCompleted = (appointment) => {
//   const displayStatus = getDisplayStatus(appointment);
//   return (
//     displayStatus === "cancelled" ||
//     displayStatus === "expired" ||
//     displayStatus === "no-show"
//   );
// };

// const isNotCompleted = (appointment) => {
//   const displayStatus = getDisplayStatus(appointment);
//   return displayStatus === "cancelled" || displayStatus === "no-show";
// };

// ===== چک کردن اینکه جلسه «برگزار نشده» است =====
const isNotCompleted = (appointment) => {
  const displayStatus = getDisplayStatus(appointment);
  return displayStatus === "cancelled" || displayStatus === "no-show";
};

// ===== دریافت اطلاعات وضعیت اصلی (badge اول) =====
const getOriginalStatusInfo = (status) => {
  const map = {
    pending: { label: "در انتظار", className: "statusPending" },
    confirmed: { label: "تأیید شده", className: "statusConfirmed" },
    completed: { label: "برگزار شده", className: "statusCompleted" },
    cancelled: { label: "لغو شده", className: "statusCancelled" },
  };
  return map[status] || map.pending;
};

// ============================================
// COMPONENT: DashboardOverview Content
// ============================================
function DashboardOverview({ appointments, setAppointments }) {
  // ===== استیت‌های مودال =====
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ==========================================
  // 📌 مشتق‌ها (Derived State)
  // ==========================================

  // ===== نوبت‌های در انتظار تأیید =====
  const pendingSessions = useMemo(() => {
    return appointments
      .filter((a) => a.status === "pending")
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentA - momentB; // نزدیک‌ترین اول
      });
  }, [appointments]);

  // ===== نوبت‌های تأیید شده (آینده) =====
  const confirmedSessions = useMemo(() => {
    return appointments
      .filter((a) => a.status === "confirmed")
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentA - momentB;
      });
  }, [appointments]);

  // ===== جلسات امروز (از بین تأییدشده‌ها) =====
  const todaySessions = useMemo(() => {
    return confirmedSessions.filter((s) => isAppointmentToday(s));
  }, [confirmedSessions]);

  // ===== آمار =====
  const stats = useMemo(
    () => [
      {
        label: "بیماران فعال",
        value: seedData.doctorDashboardStats.activePatients,
        color: "#4CAF84",
      },
      {
        label: "جلسات امروز",
        value: todaySessions.length,
        color: "#2196F3",
      },
      {
        label: "نوبت‌های در انتظار",
        value: pendingSessions.length,
        color: "#FF9800",
      },
      {
        label: "تمارین ارسال شده",
        value: seedData.doctorDashboardStats.exercisesSent,
        color: "#9C27B0",
      },
    ],
    [todaySessions.length, pendingSessions.length],
  );

  // ==========================================
  // 📌 توابع
  // ==========================================

  // ===== تأیید جلسه =====
  const handleConfirmSession = (session) => {
    setSelectedSession(session);
    setShowConfirmModal(true);
  };

  const confirmAppointment = () => {
    if (!selectedSession) return;

    // آپدیت وضعیت به confirmed
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedSession.id
          ? { ...item, status: "confirmed" }
          : item,
      ),
    );

    setShowConfirmModal(false);
    setSelectedSession(null);
    alert(`جلسه ${selectedSession.patient} با موفقیت تأیید شد.`);
  };

  // ===== رد جلسه =====
  const handleRejectSession = (session) => {
    setSelectedSession(session);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const rejectAppointment = () => {
    if (!selectedSession) return;

    // آپدیت وضعیت به cancelled
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedSession.id
          ? {
              ...item,
              status: "cancelled",
              cancelledBy: "doctor",
              cancelReason: rejectReason.trim() || "بدون دلیل",
            }
          : item,
      ),
    );

    setShowRejectModal(false);
    setSelectedSession(null);
    setRejectReason("");
    alert(`جلسه ${selectedSession.patient} با موفقیت رد شد.`);
  };

  return (
    <div className={styles.dashboardContent}>
      {/* ===== ستون راست ===== */}
      <div className={styles.mainColumn}>
        {/* خوش‌آمدگویی */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeText}>
            <h2>سلام دکتر</h2>
            <p>
              امروز {toPersianDigits(todaySessions.length)} جلسه برنامه‌ریزی شده
              دارید.
            </p>
          </div>
        </div>

        {/* آمار */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: stat.color }}
              ></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {toPersianDigits(stat.value)}
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* جلسات امروز */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>جلسات امروز</h3>
            <span className={styles.sectionCount}>
              {toPersianDigits(todaySessions.length)}
            </span>
          </div>

          <div className={styles.todaySessions}>
            {todaySessions.length > 0 ? (
              todaySessions.map((session) => (
                <div key={session.id} className={styles.sessionRow}>
                  <span className={styles.sessionTime}>
                    {toEnglishDigits(
                      session.startTime || session.time.split(" - ")[0],
                    )}
                  </span>
                  <span className={styles.sessionPatient}>
                    {session.patient}
                  </span>
                  <span
                    className={`${styles.sessionStatus} ${styles[session.status]}`}
                  >
                    {getStatusInfo(session.status).label}
                  </span>
                  <button className={styles.sessionAction}>ورود به جلسه</button>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                هیچ جلسه‌ای برای امروز وجود ندارد.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== ستون چپ: در انتظار تأیید ===== */}
      <div className={styles.pendingColumn}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>در انتظار تأیید</h3>
              <p className={styles.sectionDescription}>درخواست‌های جدید نوبت</p>
            </div>
            <span className={styles.sectionCount}>
              {toPersianDigits(pendingSessions.length)}
            </span>
          </div>

          <div className={styles.pendingSessions}>
            {pendingSessions.length === 0 ? (
              <div className={styles.emptyState}>
                <p>همه جلسات تأیید شده‌اند.</p>
              </div>
            ) : (
              pendingSessions.map((session) => (
                <div key={session.id} className={styles.pendingSessionCard}>
                  <div className={styles.pendingSessionTop}>
                    <span className={styles.sessionPatient}>
                      {session.patient}
                    </span>
                    <span className={styles.sessionType}>
                      {getTypeLabel(session.typeKey)}
                    </span>
                  </div>

                  <div className={styles.pendingSessionBottom}>
                    <div className={styles.sessionDateTime}>
                      <span>{getRelativeDateLabel(session)}</span>
                      <span className={styles.dateDivider}>•</span>
                      <span>
                        {toEnglishDigits(
                          session.startTime || session.time.split(" - ")[0],
                        )}
                      </span>
                    </div>

                    <div className={styles.pendingActions}>
                      <button
                        className={styles.btnConfirm}
                        onClick={() => handleConfirmSession(session)}
                      >
                        تأیید
                      </button>
                      <button
                        className={styles.btnReject}
                        onClick={() => handleRejectSession(session)}
                      >
                        رد
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ===== مودال تأیید ===== */}
      {showConfirmModal && selectedSession && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.modalHeader}>
              <h3>تأیید جلسه</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedSession(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                آیا از تأیید جلسه برای
                <strong> {selectedSession.patient} </strong>
                اطمینان دارید؟
              </p>

              <div className={styles.confirmDetails}>
                <div className={styles.confirmRow}>
                  <span>تاریخ:</span>
                  <span>{getRelativeDateLabel(selectedSession)}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>
                    {toEnglishDigits(
                      selectedSession.startTime ||
                        selectedSession.time.split(" - ")[0],
                    )}
                  </span>
                </div>
                <div className={styles.confirmRow}>
                  <span>نوع جلسه:</span>
                  <span>{getTypeLabel(selectedSession.typeKey)}</span>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedSession(null);
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={confirmAppointment}
              >
                تأیید نهایی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال رد ===== */}
      {showRejectModal && selectedSession && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.modalHeader}>
              <h3>رد جلسه</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedSession(null);
                  setRejectReason("");
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.rejectText}>
                آیا از رد جلسه برای
                <strong> {selectedSession.patient} </strong>
                اطمینان دارید؟
              </p>

              <div className={styles.confirmDetails}>
                <div className={styles.confirmRow}>
                  <span>تاریخ:</span>
                  <span>{getRelativeDateLabel(selectedSession)}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>
                    {toEnglishDigits(
                      selectedSession.startTime ||
                        selectedSession.time.split(" - ")[0],
                    )}
                  </span>
                </div>
                <div className={styles.confirmRow}>
                  <span>نوع جلسه:</span>
                  <span>{getTypeLabel(selectedSession.typeKey)}</span>
                </div>
              </div>

              <div className={styles.rejectReasonContainer}>
                <label className={styles.rejectLabel}>
                  (اختیاری) دلیل رد را وارد کنید:
                </label>
                <textarea
                  className={styles.rejectTextarea}
                  placeholder="دلیل رد (اختیاری)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedSession(null);
                  setRejectReason("");
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnRejectModal}
                onClick={rejectAppointment}
              >
                تأیید رد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENT: DoctorDashboard Content
// ============================================
function DoctorDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState(seedData.doctorAppointments);

  // ===== دریافت اطلاعات کاربر =====
  useEffect(() => {
    const loggedIn = localStorage.getItem("userLoggedIn");
    if (loggedIn) {
      const data = JSON.parse(loggedIn);
      setUserData(data);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // ===== خروج =====
  const handleLogout = () => {
    localStorage.removeItem("userLoggedIn");
    navigate("/");
  };

  // ===== محاسبه تعداد نوبت‌های پیش‌رو (برای badge) =====
  const upcomingAppointmentsCount = useMemo(() => {
    return appointments.filter((app) => {
      const displayStatus = getDisplayStatus(app);
      return displayStatus === "confirmed" || displayStatus === "pending";
    }).length;
  }, [appointments]);

  // ===== تعداد اعلان‌های خوانده نشده (فعلاً ثابت) =====
  const unreadNotificationsCount = 5; // ← بعداً از state اعلانات میاد

  // ===== منوهای سایدبار =====
  // const menuItems = [
  //   {
  //     id: "dashboard",
  //     label: "داشبورد",
  //     icon: <FaHome />,
  //   },
  //   {
  //     id: "appointments",
  //     label: "نوبت‌ها",
  //     icon: <FaCalendarAlt />,
  //     badge: 3,
  //   },
  //   {
  //     id: "sessions",
  //     label: "جلسات آنلاین",
  //     icon: <FaVideo />,
  //   },
  //   {
  //     id: "patients",
  //     label: "بیماران من",
  //     icon: <FaUsers />,
  //     // badge: 12,
  //   },
  //   {
  //     id: "exercises",
  //     label: "تمارین",
  //     icon: <FaClipboardList />,
  //   },
  //   {
  //     id: "notes",
  //     label: "یادداشت‌ها",
  //     icon: <FaStickyNote />,
  //   },
  //   {
  //     id: "messages",
  //     // label: "پیام‌ها",

  //     label: "اعلان‌ها",
  //     icon: <FaCommentDots />,
  //     badge: 5,
  //   },
  // ];

  const menuItems = [
    {
      id: "dashboard",
      label: "داشبورد",
      icon: <FaHome />,
    },
    {
      id: "appointments",
      label: "نوبت‌ها",
      icon: <FaCalendarAlt />,
      badge:
        upcomingAppointmentsCount > 0 ? upcomingAppointmentsCount : undefined,
    },
    {
      id: "sessions",
      label: "جلسات آنلاین",
      icon: <FaVideo />,
    },
    {
      id: "patients",
      label: "بیماران من",
      icon: <FaUsers />,
    },
    {
      id: "exercises",
      label: "تمارین",
      icon: <FaClipboardList />,
    },
    {
      id: "notes",
      label: "یادداشت‌ها",
      icon: <FaStickyNote />,
    },
    {
      id: "messages",
      label: "اعلان‌ها",
      icon: <FaCommentDots />,
      badge:
        unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
  ];

  const bottomMenuItems = [
    {
      id: "profile",
      label: "پروفایل",
      icon: <FaUserCircle />,
    },
    {
      id: "settings",
      label: "تنظیمات",
      icon: <FaCog />,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );
      case "appointments":
        return (
          <AppointmentsManagement
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );
      // case "sessions":
      //   return <SessionsManagement />;
      case "sessions":
        return <SessionsManagement appointments={appointments} />;
      case "patients":
        return <PatientsList />;
      case "exercises":
        return <ExercisesManagement />;
      case "notes":
        return <PatientNotes />;
      case "messages":
        return <DoctorMessages />;
      case "profile":
        return <DoctorProfile userData={userData} />;
      case "settings":
        return <DoctorSettings />;
      default:
        return (
          <DashboardOverview
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* ===== SIDEBAR ===== */}
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logoWrapper}>
            <img src={logo} alt="روان کوک" className={styles.logoImage} />
            {/* {!isCollapsed && (
              <span className={styles.logoText}>
                روان<span>کوک</span>
              </span>
            )} */}
          </div>
          <button
            className={styles.collapseBtn}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          <ul className={styles.navList}>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.navItem} ${
                    activeTab === item.id ? styles.active : ""
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className={styles.navLabel}>{item.label}</span>
                      {item.badge && (
                        <span className={styles.navBadge}>{item.badge}</span>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge && (
                    <span className={styles.navBadgeMini}>{item.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <ul className={styles.navList}>
            {bottomMenuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.navItem} ${
                    activeTab === item.id ? styles.active : ""
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  {!isCollapsed && (
                    <span className={styles.navLabel}>{item.label}</span>
                  )}
                </button>
              </li>
            ))}
            <li>
              <button className={styles.navItem} onClick={handleLogout}>
                <span className={styles.navIcon}>
                  <FaSignOutAlt />
                </span>
                {!isCollapsed && <span className={styles.navLabel}>خروج</span>}
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {menuItems.find((item) => item.id === activeTab)?.label ||
                "داشبورد"}
            </h1>
          </div>

          <div className={styles.headerRight}>
            {/* نوتیفیکیشن */}
            <button className={styles.notificationBtn}>
              <FaBell />
              <span className={styles.notificationDot}></span>
            </button>
          </div>
        </header>

        <div className={styles.contentArea}>{renderContent()}</div>
      </main>
    </div>
  );
}

// ============================================
// COMPONENT: Appointments Management
// ============================================
// function AppointmentsManagement({ appointments, setAppointments }) {
//   const [activeFilter, setActiveFilter] = useState("all");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [showRejectModal, setShowRejectModal] = useState(false);
//   const [selectedAppointment, setSelectedAppointment] = useState(null);
//   const [rejectReason, setRejectReason] = useState("");

//   const [newAppointment, setNewAppointment] = useState({
//     patient: "",
//     date: "",
//     time: "",
//     // type: "فردی",
//     typeKey: "individual",
//     status: "pending",
//   });

//   // ===== تابع تأیید نوبت =====
//   const handleConfirm = (app) => {
//     setSelectedAppointment(app);
//     setShowConfirmModal(true);
//   };

//   const confirmAppointment = () => {
//     if (!selectedAppointment) return;

//     setAppointments((prev) =>
//       prev.map((item) =>
//         item.id === selectedAppointment.id
//           ? { ...item, status: "confirmed" }
//           : item,
//       ),
//     );

//     setShowConfirmModal(false);
//     setSelectedAppointment(null);
//     alert(`نوبت ${selectedAppointment.patient} با موفقیت تأیید شد.`);
//   };

//   // ===== تابع رد نوبت =====
//   const handleReject = (app) => {
//     setSelectedAppointment(app);
//     setRejectReason("");
//     setShowRejectModal(true);
//   };

//   const rejectAppointment = () => {
//     if (!selectedAppointment) return;

//     setAppointments((prev) =>
//       prev.map((item) =>
//         item.id === selectedAppointment.id
//           ? { ...item, status: "cancelled" }
//           : item,
//       ),
//     );

//     setShowRejectModal(false);
//     setSelectedAppointment(null);
//     setRejectReason("");
//     alert(`نوبت ${selectedAppointment.patient} با موفقیت رد شد.`);
//   };

//   // ===== تابع ثبت انجام =====
//   const handleComplete = (app) => {
//     if (window.confirm(`آیا جلسه ${app.patient} انجام شده است؟`)) {
//       setAppointments((prev) =>
//         prev.map((item) =>
//           item.id === app.id ? { ...item, status: "completed" } : item,
//         ),
//       );
//       alert(`جلسه ${app.patient} به عنوان انجام شده ثبت شد.`);
//     }
//   };

//   // ===== تابع افزودن نوبت جدید =====
//   const handleAddAppointment = () => {
//     // اعتبارسنجی
//     if (!newAppointment.patient.trim()) {
//       alert("لطفاً نام بیمار را وارد کنید.");
//       return;
//     }
//     if (!newAppointment.date) {
//       alert("لطفاً تاریخ را انتخاب کنید.");
//       return;
//     }
//     if (!newAppointment.time) {
//       alert("لطفاً ساعت را انتخاب کنید.");
//       return;
//     }

//     const newId = Math.max(...appointments.map((a) => a.id), 0) + 1;

//     setAppointments((prev) => [
//       ...prev,
//       {
//         id: newId,
//         patient: newAppointment.patient,
//         date: newAppointment.date,
//         time: newAppointment.time,
//         typeKey: newAppointment.typeKey,
//         type: newAppointment.type,
//         status: newAppointment.status,
//       },
//     ]);

//     // ریست فرم
//     setNewAppointment({
//       patient: "",
//       date: "",
//       time: "",
//       type: "فردی",
//       status: "pending",
//     });

//     setShowAddModal(false);
//     alert("نوبت جدید با موفقیت اضافه شد.");
//   };

//   // ===== فیلتر کردن =====
//   const getFilteredAppointments = () => {
//     if (activeFilter === "all") return appointments;
//     return appointments.filter((item) => item.status === activeFilter);
//   };

//   const filteredAppointments = getFilteredAppointments();

//   return (
//     <div className={styles.pageContent}>
//       {/* ===== هدر ===== */}
//       <div className={styles.pageHeader}>
//         <div className={styles.headerInfo}>
//           <h2>مدیریت نوبت‌ها</h2>
//           <p>لیست درخواست‌های نوبت و مدیریت آنها</p>
//         </div>
//         <button className={styles.newBtn} onClick={() => setShowAddModal(true)}>
//           <FaPlus /> افزودن نوبت جدید
//         </button>
//       </div>

//       {/* ===== فیلترها ===== */}
//       <div className={styles.filterTabs}>
//         {["all", "pending", "confirmed", "completed", "cancelled"].map(
//           (filter) => (
//             <button
//               key={filter}
//               className={`${styles.filterTab} ${activeFilter === filter ? styles.active : ""}`}
//               onClick={() => setActiveFilter(filter)}
//             >
//               {filter === "all" && "همه"}
//               {filter === "pending" && "در انتظار"}
//               {filter === "confirmed" && "تأیید شده"}
//               {filter === "completed" && "انجام شده"}
//               {filter === "cancelled" && "لغو شده"}
//               <span className={styles.filterCount}>
//                 {
//                   appointments.filter((item) =>
//                     filter === "all" ? true : item.status === filter,
//                   ).length
//                 }
//               </span>
//             </button>
//           ),
//         )}
//       </div>

//       {/* ===== لیست نوبت‌ها ===== */}
//       <div className={styles.appointmentsList}>
//         {filteredAppointments.length > 0 ? (
//           filteredAppointments.map((app) => {
//             const status = getStatusInfo(app.status);
//             return (
//               <div key={app.id} className={styles.appointmentCard}>
//                 <div className={styles.appointmentInfo}>
//                   <h4>{app.patient}</h4>
//                   {/* <p>
//                     {app.type} • {app.date} • {app.time}
//                   </p> */}
//                   <p>
//                     {getTypeLabel(app.typeKey)} • {app.date} • {app.time}
//                   </p>
//                 </div>

//                 {/* ===== نمایش وضعیت ===== */}
//                 {app.status === "completed" ? (
//                   <span className={styles.completedLabel}>انجام شده</span>
//                 ) : app.status === "cancelled" ? (
//                   <span className={styles.cancelledLabel}>لغو شده</span>
//                 ) : (
//                   // <span className={`${styles.statusBadge} ${status.className}`}>
//                   <span className={`${styles.statusBadge} ${styles[status.className]}`}>
//                     {status.label}
//                   </span>
//                 )}

//                 <div className={styles.appointmentActions}>
//                   {app.status === "pending" && (
//                     <>
//                       <button
//                         className={styles.btnApprove}
//                         onClick={() => handleConfirm(app)}
//                       >
//                         تأیید
//                       </button>
//                       <button
//                         className={styles.btnReject}
//                         onClick={() => handleReject(app)}
//                       >
//                         رد
//                       </button>
//                     </>
//                   )}

//                   {app.status === "confirmed" && (
//                     <button
//                       className={styles.btnComplete}
//                       onClick={() => handleComplete(app)}
//                     >
//                       ثبت انجام
//                     </button>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className={styles.emptyState}>
//             <span className={styles.emptyIcon}>📭</span>
//             <h3>هیچ نوبتی در این دسته وجود ندارد</h3>
//             <p>برای افزودن نوبت جدید، روی دکمه "افزودن نوبت جدید" کلیک کنید.</p>
//           </div>
//         )}
//       </div>

//       {/* ===== مودال تأیید ===== */}
//       {showConfirmModal && selectedAppointment && (
//         <div className={styles.modalOverlay}>
//           <div className={styles.confirmModal}>
//             <div className={styles.modalHeader}>
//               <h3>تأیید نوبت</h3>
//               <button
//                 className={styles.modalClose}
//                 onClick={() => {
//                   setShowConfirmModal(false);
//                   setSelectedAppointment(null);
//                 }}
//               >
//                 ✕
//               </button>
//             </div>
//             <div className={styles.modalBody}>
//               <p className={styles.confirmText}>
//                 آیا از تأیید نوبت برای
//                 <strong> {selectedAppointment.patient} </strong>
//                 اطمینان دارید؟
//               </p>
//               <div className={styles.confirmDetails}>
//                 <div className={styles.confirmRow}>
//                   <span>تاریخ:</span>
//                   <span>{selectedAppointment.date}</span>
//                 </div>
//                 <div className={styles.confirmRow}>
//                   <span>ساعت:</span>
//                   <span>{selectedAppointment.time}</span>
//                 </div>
//               </div>
//             </div>
//             <div className={styles.modalFooter}>
//               <button
//                 className={styles.btnCancelModal}
//                 onClick={() => {
//                   setShowConfirmModal(false);
//                   setSelectedAppointment(null);
//                 }}
//               >
//                 انصراف
//               </button>
//               <button
//                 className={styles.btnConfirmModal}
//                 onClick={confirmAppointment}
//               >
//                 تأیید نهایی
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ===== مودال رد ===== */}
//       {showRejectModal && selectedAppointment && (
//         <div className={styles.modalOverlay}>
//           <div className={styles.confirmModal}>
//             <div className={styles.modalHeader}>
//               <h3>رد نوبت</h3>
//               <button
//                 className={styles.modalClose}
//                 onClick={() => {
//                   setShowRejectModal(false);
//                   setSelectedAppointment(null);
//                   setRejectReason("");
//                 }}
//               >
//                 ✕
//               </button>
//             </div>
//             <div className={styles.modalBody}>
//               <p className={styles.rejectText}>
//                 آیا از رد نوبت برای
//                 <strong> {selectedAppointment.patient} </strong>
//                 اطمینان دارید؟
//               </p>
//               <div className={styles.confirmDetails}>
//                 <div className={styles.confirmRow}>
//                   <span>تاریخ:</span>
//                   <span>{selectedAppointment.date}</span>
//                 </div>
//                 <div className={styles.confirmRow}>
//                   <span>ساعت:</span>
//                   <span>{selectedAppointment.time}</span>
//                 </div>
//               </div>
//               <div className={styles.rejectReasonContainer}>
//                 <label className={styles.rejectLabel}>
//                   (اختیاری) دلیل رد را وارد کنید:
//                 </label>
//                 <textarea
//                   className={styles.rejectTextarea}
//                   placeholder="دلیل رد (اختیاری)..."
//                   value={rejectReason}
//                   onChange={(e) => setRejectReason(e.target.value)}
//                   rows="3"
//                 />
//               </div>
//             </div>
//             <div className={styles.modalFooter}>
//               <button
//                 className={styles.btnCancelModal}
//                 onClick={() => {
//                   setShowRejectModal(false);
//                   setSelectedAppointment(null);
//                   setRejectReason("");
//                 }}
//               >
//                 انصراف
//               </button>
//               <button
//                 className={styles.btnRejectModal}
//                 onClick={rejectAppointment}
//               >
//                 تأیید رد
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ===== مودال افزودن نوبت ===== */}
//       {showAddModal && (
//         <div className={styles.modalOverlay}>
//           <div className={styles.addModal}>
//             <div className={styles.modalHeader}>
//               <h3>افزودن نوبت جدید</h3>
//               <button
//                 className={styles.modalClose}
//                 onClick={() => {
//                   setShowAddModal(false);
//                   setNewAppointment({
//                     patient: "",
//                     date: "",
//                     time: "",
//                     type: "فردی",
//                     status: "pending",
//                   });
//                 }}
//               >
//                 ✕
//               </button>
//             </div>

//             <div className={styles.modalBody}>
//               <div className={styles.formGroup}>
//                 <label>نام بیمار</label>
//                 <input
//                   type="text"
//                   className={styles.formInput}
//                   placeholder="نام و نام خانوادگی بیمار"
//                   value={newAppointment.patient}
//                   onChange={(e) =>
//                     setNewAppointment((prev) => ({
//                       ...prev,
//                       patient: e.target.value,
//                     }))
//                   }
//                 />
//               </div>

//               <div className={styles.formRow}>
//                 <div className={styles.formGroup}>
//                   <label>تاریخ</label>
//                   <input
//                     type="text"
//                     className={styles.formInput}
//                     placeholder="۱۴۰۵/۰۶/۰۵"
//                     value={newAppointment.date}
//                     onChange={(e) =>
//                       setNewAppointment((prev) => ({
//                         ...prev,
//                         date: e.target.value,
//                       }))
//                     }
//                   />
//                 </div>
//                 <div className={styles.formGroup}>
//                   <label>ساعت</label>
//                   <input
//                     type="text"
//                     className={styles.formInput}
//                     placeholder="۱۰:۰۰"
//                     value={newAppointment.time}
//                     onChange={(e) =>
//                       setNewAppointment((prev) => ({
//                         ...prev,
//                         time: e.target.value,
//                       }))
//                     }
//                   />
//                 </div>
//               </div>

//               <div className={styles.formRow}>
//                 <div className={styles.formGroup}>
//                   <label>نوع جلسه</label>
//                   <select
//                     className={styles.formSelect}
//                     value={newAppointment.type}
//                     onChange={(e) =>
//                       setNewAppointment((prev) => ({
//                         ...prev,
//                         type: e.target.value,
//                       }))
//                     }
//                   >
//                     <option value="فردی">فردی</option>
//                     <option value="زوج">زوج</option>
//                     <option value="نوجوان">نوجوان</option>
//                     <option value="خانواده">خانواده</option>
//                   </select>
//                 </div>
//                 <div className={styles.formGroup}>
//                   <label>وضعیت</label>
//                   <select
//                     className={styles.formSelect}
//                     value={newAppointment.status}
//                     onChange={(e) =>
//                       setNewAppointment((prev) => ({
//                         ...prev,
//                         status: e.target.value,
//                       }))
//                     }
//                   >
//                     <option value="pending">در انتظار</option>
//                     <option value="confirmed">تأیید شده</option>
//                     <option value="completed">انجام شده</option>
//                     <option value="cancelled">لغو شده</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className={styles.modalFooter}>
//               <button
//                 className={styles.btnCancelModal}
//                 onClick={() => {
//                   setShowAddModal(false);
//                   setNewAppointment({
//                     patient: "",
//                     date: "",
//                     time: "",
//                     type: "فردی",
//                     status: "pending",
//                   });
//                 }}
//               >
//                 انصراف
//               </button>
//               <button
//                 className={styles.btnAddModal}
//                 onClick={handleAddAppointment}
//               >
//                 افزودن نوبت
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// ============================================
// COMPONENT: Appointments Management
// ============================================
function AppointmentsManagement({ appointments, setAppointments }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ===== استیت فرم افزودن نوبت =====
  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    date: "",
    time: "",
    typeKey: "individual",
    status: "pending",
  });

  // ==========================================
  // 📌 مشتق‌ها
  // ==========================================

  // ===== مرتب‌سازی نوبت‌ها (جدیدترین اول) =====
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const momentA = getAppointmentMoment(a);
      const momentB = getAppointmentMoment(b);
      return momentB - momentA; // جدیدترین اول
    });
  }, [appointments]);

  // ==========================================
  // 📌 توابع
  // ==========================================

  // ===== تأیید نوبت =====
  const handleConfirm = (app) => {
    setSelectedAppointment(app);
    setShowConfirmModal(true);
  };

  const confirmAppointment = () => {
    if (!selectedAppointment) return;

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedAppointment.id
          ? { ...item, status: "confirmed" }
          : item,
      ),
    );

    setShowConfirmModal(false);
    setSelectedAppointment(null);
    alert(`نوبت ${selectedAppointment.patient} با موفقیت تأیید شد.`);
  };

  // ===== رد نوبت =====
  const handleReject = (app) => {
    setSelectedAppointment(app);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const rejectAppointment = () => {
    if (!selectedAppointment) return;

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedAppointment.id
          ? {
              ...item,
              status: "cancelled",
              cancelledBy: "doctor",
              cancelReason: rejectReason.trim() || "بدون دلیل",
            }
          : item,
      ),
    );

    setShowRejectModal(false);
    setSelectedAppointment(null);
    setRejectReason("");
    alert(`نوبت ${selectedAppointment.patient} با موفقیت رد شد.`);
  };

  // ===== ثبت انجام =====
  const handleComplete = (app) => {
    if (window.confirm(`آیا جلسه ${app.patient} برگزار شده است؟`)) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === app.id ? { ...item, status: "completed" } : item,
        ),
      );
      alert(`جلسه ${app.patient} به عنوان برگزار شده ثبت شد.`);
    }
  };

  // ===== ثبت برگزار نشده =====
  // const handleMarkNoShow = (app) => {
  //   if (window.confirm(`آیا مطمئنید که جلسه ${app.patient} برگزار نشد؟`)) {
  //     // ===== status رو به no-show تغییر میدیم =====
  //     // (چون no-show در واقع یه status مستقل نیست، از confirmed/pending خارج میشه)
  //     setAppointments((prev) =>
  //       prev.map((item) =>
  //         item.id === app.id
  //           ? {
  //               ...item,
  //               status: "no-show",
  //               markedAsNoShowAt: toPersianDigits(
  //                 moment().format("jYYYY/jMM/jDD"),
  //               ),
  //             }
  //           : item,
  //       ),
  //     );
  //     alert(`جلسه ${app.patient} به عنوان "برگزار نشده" ثبت شد.`);
  //   }
  // };

  // ===== ثبت برگزار نشده =====
  const handleMarkNoShow = (app) => {
    if (window.confirm(`آیا مطمئنید که جلسه ${app.patient} برگزار نشد؟`)) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === app.id
            ? {
                ...item,
                status: "no-show",
                markedAsNoShowAt: toPersianDigits(
                  moment().format("jYYYY/jMM/jDD"),
                ),
              }
            : item,
        ),
      );
      alert(`جلسه ${app.patient} به عنوان "برگزار نشده" ثبت شد.`);
    }
  };

  // ===== افزودن نوبت جدید =====
  const handleAddAppointment = () => {
    // اعتبارسنجی
    if (!newAppointment.patient.trim()) {
      alert("لطفاً نام بیمار را وارد کنید.");
      return;
    }
    if (!newAppointment.date) {
      alert("لطفاً تاریخ را انتخاب کنید.");
      return;
    }
    if (!newAppointment.time) {
      alert("لطفاً ساعت را انتخاب کنید.");
      return;
    }

    const newId = Math.max(...appointments.map((a) => a.id), 0) + 1;

    setAppointments((prev) => [
      ...prev,
      {
        id: newId,
        patient: newAppointment.patient,
        type: getTypeLabel(newAppointment.typeKey),
        typeKey: newAppointment.typeKey,
        date: newAppointment.date,
        time: `${newAppointment.time} - ${newAppointment.time}`,
        startTime: newAppointment.time,
        endTime: newAppointment.time,
        hours: [newAppointment.time],
        status: newAppointment.status,
        isOnline: true,
        createdAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
        duration: 1,
      },
    ]);

    // ریست فرم
    setNewAppointment({
      patient: "",
      date: "",
      time: "",
      typeKey: "individual",
      status: "pending",
    });

    setShowAddModal(false);
    alert("نوبت جدید با موفقیت اضافه شد.");
  };

  // ===== فیلتر کردن =====
  // const getFilteredAppointments = () => {
  //   if (activeFilter === "all") return sortedAppointments;
  //   return sortedAppointments.filter((item) => item.status === activeFilter);
  // };

  const getFilteredAppointments = () => {
    if (activeFilter === "all") return sortedAppointments;
    if (activeFilter === "not-completed") {
      return sortedAppointments.filter((item) => isNotCompleted(item));
    }
    return sortedAppointments.filter(
      (item) => getDisplayStatus(item) === activeFilter,
    );
  };

  const filteredAppointments = getFilteredAppointments();

  // ===== تعریف فیلترها =====
  const filters = [
    { id: "all", label: "همه" },
    { id: "pending", label: "در انتظار" },
    { id: "confirmed", label: "تأیید شده" },
    { id: "completed", label: "برگزار شده" },
    // { id: "cancelled", label: "لغو شده" },
    { id: "not-completed", label: "انجام نشده" },
  ];

  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>مدیریت نوبت‌ها</h2>
          <p>لیست درخواست‌های نوبت و مدیریت آنها</p>
        </div>
        <button className={styles.newBtn} onClick={() => setShowAddModal(true)}>
          <FaPlus /> افزودن نوبت جدید
        </button>
      </div>

      {/* ===== فیلترها ===== */}
      <div className={styles.filterTabs}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            className={`${styles.filterTab} ${
              activeFilter === filter.id ? styles.active : ""
            }`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
            <span className={styles.filterCount}>
              {
                sortedAppointments.filter((item) => {
                  if (filter.id === "all") return true;
                  if (filter.id === "not-completed")
                    return isNotCompleted(item);
                  return getDisplayStatus(item) === filter.id;
                }).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* ===== لیست نوبت‌ها ===== */}
      <div className={styles.appointmentsList}>
        {/* {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => {
            const displayStatus = getDisplayStatus(app);
            const originalStatus = getOriginalStatusInfo(app.status);
            const displayStatusInfo = getDisplayStatusInfo(displayStatus);

            // ===== چک کردن اینکه نوبت گذشته =====
            const isPast = isAppointmentPast(app);

            // ===== وضعیت‌های خاص که نیاز به badge جدا دارن =====
            const hasExtraBadge =
              displayStatus === "expired" || displayStatus === "no-show";

            return (
              <div
                key={app.id}
                className={`${styles.appointmentCard} ${
                  isPast ? styles.pastAppointment : ""
                }`}
              >
                <div className={styles.appointmentStatusBar}>
                  <span
                    className={`${styles.statusBadge} ${styles[originalStatus.className]}`}
                  >
                    {originalStatus.label}
                  </span>

                  {hasExtraBadge && (
                    <span className={styles.cancelBadge}>
                      {displayStatusInfo.label}
                    </span>
                  )}

                  {app.isOnline && (
                    <span className={styles.onlineBadge}>آنلاین</span>
                  )}

                  {app.status === "cancelled" && (
                    <span className={styles.cancelBadge}>
                      {app.cancelledBy === "patient"
                        ? "لغو توسط بیمار"
                        : "لغو توسط پزشک"}
                    </span>
                  )}
                </div>

                <div className={styles.appointmentBody}>
                  <div className={styles.appointmentInfo}>
                    <h4>{app.type}</h4>

                    <div className={styles.appointmentMeta}>
                      <span className={styles.metaItem}>👤 {app.patient}</span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {getRelativeDateLabel(app)}
                      </span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {toEnglishDigits(
                          app.startTime || app.time.split(" - ")[0],
                        )}
                      </span>
                    </div>

                    {app.price && (
                      <div className={styles.appointmentPrice}>
                        {app.price.toLocaleString("fa-IR")} تومان
                      </div>
                    )}

                    {app.status === "cancelled" && app.cancelReason && (
                      <div className={styles.cancelReason}>
                        <span>دلیل لغو:</span>
                        <span>{app.cancelReason}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.appointmentActions}>
                    {displayStatus === "pending" && (
                      <>
                        <button
                          className={styles.btnApprove}
                          onClick={() => handleConfirm(app)}
                        >
                          تأیید
                        </button>
                        <button
                          className={styles.btnReject}
                          onClick={() => handleReject(app)}
                        >
                          رد
                        </button>
                      </>
                    )}

                    {displayStatus === "confirmed" && (
                      <button
                        className={styles.btnComplete}
                        onClick={() => handleComplete(app)}
                      >
                        ثبت انجام
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <h3>هیچ نوبتی در این دسته وجود ندارد</h3>
            <p>برای افزودن نوبت جدید، روی دکمه "افزودن نوبت جدید" کلیک کنید.</p>
          </div>
        )} */}
        {/* {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => {
            const displayStatus = getDisplayStatus(app);
            const originalStatus = getOriginalStatusInfo(app.status);
            const displayStatusInfo = getDisplayStatusInfo(displayStatus);

            // ===== چک کردن اینکه نوبت گذشته =====
            const isPast = isAppointmentPast(app);

            // ===== وضعیت‌های خاص که نیاز به badge جدا دارن =====
            const hasExtraBadge =
              displayStatus === "expired" || displayStatus === "no-show";

            // ===== بازه ۴۸ ساعته =====
            const isAwaitingConfirmation =
              displayStatus === "awaiting-confirmation";

            // ===== محاسبه زمان باقی‌مانده تا پایان ۴۸ ساعت =====
            let remainingHours = 0;
            if (isAwaitingConfirmation) {
              const startMoment = getAppointmentMoment(app);
              const durationMinutes = (app.duration || 1) * 60;
              const endMoment = startMoment
                .clone()
                .add(durationMinutes, "minutes");
              remainingHours = Math.max(
                0,
                Math.ceil(48 - moment().diff(endMoment, "hours", true)),
              );
            }

            return (
              <div
                key={app.id}
                className={`${styles.appointmentCard} ${
                  isPast ? styles.pastAppointment : ""
                }`}
              >
                <div className={styles.appointmentStatusBar}>
                  <span
                    className={`${styles.statusBadge} ${styles[originalStatus.className]}`}
                  >
                    {originalStatus.label}
                  </span>

                  {hasExtraBadge && (
                    <span className={styles.cancelBadge}>
                      {displayStatusInfo.label}
                    </span>
                  )}

                  {app.isOnline && (
                    <span className={styles.onlineBadge}>آنلاین</span>
                  )}

                  {app.status === "cancelled" && (
                    <span className={styles.cancelBadge}>
                      {app.cancelledBy === "patient"
                        ? "لغو توسط بیمار"
                        : "لغو توسط پزشک"}
                    </span>
                  )}
                </div>

                <div className={styles.appointmentBody}>
                  <div className={styles.appointmentInfo}>
                    <h4>{app.type}</h4>

                    <div className={styles.appointmentMeta}>
                      <span className={styles.metaItem}>👤 {app.patient}</span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {getRelativeDateLabel(app)}
                      </span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {toPersianDigits(
                          app.startTime || app.time.split(" - ")[0],
                        )}
                      </span>
                    </div>

                    {app.price && (
                      <div className={styles.appointmentPrice}>
                        {toPersianDigits(
                          app.price.toLocaleString("en-US"),
                        )}{" "}
                        تومان
                      </div>
                    )}

                    {app.status === "cancelled" && app.cancelReason && (
                      <div className={styles.cancelReason}>
                        <span>دلیل لغو:</span>
                        <span>{app.cancelReason}</span>
                      </div>
                    )}

                    {isAwaitingConfirmation && (
                      <div className={styles.awaitingConfirmationBox}>
                        <span className={styles.awaitingIcon}>⏰</span>
                        <div className={styles.awaitingText}>
                          <span className={styles.awaitingTitle}>
                            آیا این جلسه برگزار شده؟
                          </span>
                          <span className={styles.awaitingTime}>
                            ({toPersianDigits(remainingHours)} ساعت فرصت باقی
                            مانده)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={styles.appointmentActions}>
                    {displayStatus === "pending" && (
                      <>
                        <button
                          className={styles.btnApprove}
                          onClick={() => handleConfirm(app)}
                        >
                          تأیید
                        </button>
                        <button
                          className={styles.btnReject}
                          onClick={() => handleReject(app)}
                        >
                          رد
                        </button>
                      </>
                    )}

                    {displayStatus === "confirmed" && (
                      <button
                        className={styles.btnComplete}
                        onClick={() => handleComplete(app)}
                      >
                        ثبت انجام
                      </button>
                    )}

                    {isAwaitingConfirmation && (
                      <>
                        <button
                          className={styles.btnComplete}
                          onClick={() => handleComplete(app)}
                        >
                          ✓ برگزار شد
                        </button>
                        <button
                          className={styles.btnReject}
                          onClick={() => handleReject(app)}
                        >
                          ✗ برگزار نشد
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <h3>هیچ نوبتی در این دسته وجود ندارد</h3>
            <p>برای افزودن نوبت جدید، روی دکمه "افزودن نوبت جدید" کلیک کنید.</p>
          </div>
        )} */}

        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => {
            const displayStatus = getDisplayStatus(app);
            const originalStatus = getOriginalStatusInfo(app.status);
            const displayStatusInfo = getDisplayStatusInfo(displayStatus);

            // ===== چک کردن گذشته =====
            const isPast = isAppointmentPast(app);

            // ===== وضعیت برگزار نشده =====
            const isNoShow = displayStatus === "no-show";

            // ===== بازه ۴۸ ساعته =====
            const isAwaitingConfirmation =
              displayStatus === "awaiting-confirmation";

            // ===== محاسبه زمان باقی‌مانده تا پایان ۴۸ ساعت =====
            let remainingHours = 0;
            if (isAwaitingConfirmation) {
              const startMoment = getAppointmentMoment(app);
              const durationMinutes = (app.duration || 1) * 60;
              const endMoment = startMoment
                .clone()
                .add(durationMinutes, "minutes");
              remainingHours = Math.max(
                0,
                Math.ceil(48 - moment().diff(endMoment, "hours", true)),
              );
            }

            return (
              <div
                key={app.id}
                className={`${styles.appointmentCard} ${
                  isPast ? styles.pastAppointment : ""
                }`}
              >
                {/* ===== نوار وضعیت ===== */}
                <div className={styles.appointmentStatusBar}>
                  {/* Badge وضعیت اصلی */}
                  <span
                    className={`${styles.statusBadge} ${
                      styles[originalStatus.className]
                    }`}
                  >
                    {originalStatus.label}
                  </span>

                  {/* Badge "برگزار نشده" */}
                  {isNoShow && (
                    <span className={styles.noShowBadge}>برگزار نشده</span>
                  )}

                  {/* Badge "منتظر تأیید انجام" */}
                  {isAwaitingConfirmation && (
                    <span className={styles.awaitingBadge}>
                      منتظر تأیید انجام
                    </span>
                  )}

                  {/* Badge آنلاین */}
                  {app.isOnline && (
                    <span className={styles.onlineBadge}>آنلاین</span>
                  )}

                  {/* Badge لغو */}
                  {app.status === "cancelled" && (
                    <span className={styles.cancelBadge}>
                      {app.cancelledBy === "patient"
                        ? "لغو توسط بیمار"
                        : "لغو توسط روانشناس"}
                    </span>
                  )}
                </div>

                {/* ===== محتوای اصلی ===== */}
                <div className={styles.appointmentBody}>
                  <div className={styles.appointmentInfo}>
                    <h4>{app.type}</h4>

                    <div className={styles.appointmentMeta}>
                      <span className={styles.metaItem}>👤 {app.patient}</span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {getRelativeDateLabel(app)}
                      </span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {toPersianDigits(
                          app.startTime || app.time.split(" - ")[0],
                        )}
                      </span>
                    </div>

                    {/* قیمت */}
                    {app.price && (
                      <div className={styles.appointmentPrice}>
                        {toPersianDigits(app.price.toLocaleString("en-US"))}{" "}
                        تومان
                      </div>
                    )}

                    {/* دلیل لغو */}
                    {app.status === "cancelled" && app.cancelReason && (
                      <div className={styles.cancelReason}>
                        <span>دلیل لغو:</span>
                        <span>{app.cancelReason}</span>
                      </div>
                    )}

                    {/* هشدار ۴۸ ساعته */}
                    {isAwaitingConfirmation && (
                      <div className={styles.awaitingConfirmationBox}>
                        <span className={styles.awaitingIcon}>⏰</span>
                        <div className={styles.awaitingText}>
                          <span className={styles.awaitingTitle}>
                            آیا این جلسه برگزار شده؟
                          </span>
                          <span className={styles.awaitingTime}>
                            ({toPersianDigits(remainingHours)} ساعت فرصت
                            باقی‌مانده)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ===== دکمه‌های اکشن ===== */}
                  <div className={styles.appointmentActions}>
                    {/* وضعیت pending + آینده */}
                    {displayStatus === "pending" && (
                      <>
                        <button
                          className={styles.btnApprove}
                          onClick={() => handleConfirm(app)}
                        >
                          تأیید
                        </button>
                        <button
                          className={styles.btnReject}
                          onClick={() => handleReject(app)}
                        >
                          رد
                        </button>
                      </>
                    )}

                    {/* وضعیت confirmed + آینده */}
                    {displayStatus === "confirmed" && (
                      <button
                        className={styles.btnComplete}
                        onClick={() => handleComplete(app)}
                      >
                        ثبت انجام
                      </button>
                    )}

                    {/* بازه ۴۸ ساعته */}
                    {isAwaitingConfirmation && (
                      <>
                        <button
                          className={styles.btnComplete}
                          onClick={() => handleComplete(app)}
                        >
                          ✓ برگزار شد
                        </button>
                        <button
                          className={styles.btnNoShow}
                          onClick={() => handleMarkNoShow(app)}
                        >
                          ✗ برگزار نشد
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📭</span>
            <h3>هیچ نوبتی در این دسته وجود ندارد</h3>
            <p>برای افزودن نوبت جدید، روی دکمه "افزودن نوبت جدید" کلیک کنید.</p>
          </div>
        )}
      </div>

      {/* ===== مودال تأیید ===== */}
      {showConfirmModal && selectedAppointment && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.modalHeader}>
              <h3>تأیید نوبت</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedAppointment(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.confirmText}>
                آیا از تأیید نوبت برای
                <strong> {selectedAppointment.patient} </strong>
                اطمینان دارید؟
              </p>
              <div className={styles.confirmDetails}>
                <div className={styles.confirmRow}>
                  <span>تاریخ:</span>
                  <span>{getRelativeDateLabel(selectedAppointment)}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>
                    {toEnglishDigits(
                      selectedAppointment.startTime ||
                        selectedAppointment.time.split(" - ")[0],
                    )}
                  </span>
                </div>
                <div className={styles.confirmRow}>
                  <span>نوع جلسه:</span>
                  <span>{getTypeLabel(selectedAppointment.typeKey)}</span>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedAppointment(null);
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={confirmAppointment}
              >
                تأیید نهایی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال رد ===== */}
      {showRejectModal && selectedAppointment && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.modalHeader}>
              <h3>رد نوبت</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedAppointment(null);
                  setRejectReason("");
                }}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.rejectText}>
                آیا از رد نوبت برای
                <strong> {selectedAppointment.patient} </strong>
                اطمینان دارید؟
              </p>
              <div className={styles.confirmDetails}>
                <div className={styles.confirmRow}>
                  <span>تاریخ:</span>
                  <span>{getRelativeDateLabel(selectedAppointment)}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>
                    {toEnglishDigits(
                      selectedAppointment.startTime ||
                        selectedAppointment.time.split(" - ")[0],
                    )}
                  </span>
                </div>
                <div className={styles.confirmRow}>
                  <span>نوع جلسه:</span>
                  <span>{getTypeLabel(selectedAppointment.typeKey)}</span>
                </div>
              </div>
              <div className={styles.rejectReasonContainer}>
                <label className={styles.rejectLabel}>
                  (اختیاری) دلیل رد را وارد کنید:
                </label>
                <textarea
                  className={styles.rejectTextarea}
                  placeholder="دلیل رد (اختیاری)..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="3"
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedAppointment(null);
                  setRejectReason("");
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnRejectModal}
                onClick={rejectAppointment}
              >
                تأیید رد
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال افزودن نوبت ===== */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.addModal}>
            <div className={styles.modalHeader}>
              <h3>افزودن نوبت جدید</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowAddModal(false);
                  setNewAppointment({
                    patient: "",
                    date: "",
                    time: "",
                    typeKey: "individual",
                    status: "pending",
                  });
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>نام بیمار</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="نام و نام خانوادگی بیمار"
                  value={newAppointment.patient}
                  onChange={(e) =>
                    setNewAppointment((prev) => ({
                      ...prev,
                      patient: e.target.value,
                    }))
                  }
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>تاریخ</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="۱۴۰۵/۰۶/۰۵"
                    value={newAppointment.date}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>ساعت</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="۱۰:۰۰"
                    value={newAppointment.time}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>نوع جلسه</label>
                  <select
                    className={styles.formSelect}
                    value={newAppointment.typeKey}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        typeKey: e.target.value,
                      }))
                    }
                  >
                    <option value="individual">فردی</option>
                    <option value="couple">زوج</option>
                    <option value="teen">نوجوان</option>
                    <option value="family">خانواده</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>وضعیت</label>
                  <select
                    className={styles.formSelect}
                    value={newAppointment.status}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="pending">در انتظار</option>
                    <option value="confirmed">تأیید شده</option>
                    <option value="completed">برگزار شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowAddModal(false);
                  setNewAppointment({
                    patient: "",
                    date: "",
                    time: "",
                    typeKey: "individual",
                    status: "pending",
                  });
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnAddModal}
                onClick={handleAddAppointment}
              >
                افزودن نوبت
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENT: Sessions Management (Doctor Panel)
// ============================================
// function SessionsManagement() {
//   const [activeTab, setActiveTab] = useState("upcoming");
//   const [selectedSession, setSelectedSession] = useState(null);

//   // ===== داده‌های جلسات =====
//   const sessions = [
//     {
//       id: 1,
//       patient: "محمد کریمی",
//       patientPhone: "۹۱۲۳۴۵۶۷۸۹",
//       title: "جلسه مشاوره فردی",
//       date: "۱۴۰۵/۰۶/۰۷",
//       time: "۱۰:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "upcoming",
//       isOnline: true,
//       meetingLink: "https://meet.google.com/abc-defg-hij",
//       type: "individual",
//       notes: "بررسی اضطراب اجتماعی",
//     },
//     {
//       id: 2,
//       patient: "زهرا احمدی",
//       patientPhone: "۹۱۳۴۵۶۷۸۹۰",
//       title: "جلسه زوج درمانی",
//       date: "۱۴۰۵/۰۶/۰۸",
//       time: "۱۱:۳۰",
//       duration: "۹۰ دقیقه",
//       status: "upcoming",
//       isOnline: true,
//       meetingLink: "https://meet.google.com/klm-nopq-rst",
//       type: "couple",
//       notes: "مشکلات ارتباطی",
//     },
//     {
//       id: 3,
//       patient: "علی رضایی",
//       patientPhone: "۹۱۴۵۶۷۸۹۰۱",
//       title: "جلسه مشاوره فردی",
//       date: "۱۴۰۵/۰۶/۱۰",
//       time: "۱۴:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "upcoming",
//       isOnline: true,
//       meetingLink: "https://meet.google.com/xyz-uvwx-yza",
//       type: "individual",
//       notes: "پیشرفت خوب در مدیریت استرس",
//     },
//     {
//       id: 4,
//       patient: "سارا محمدی",
//       patientPhone: "۹۱۵۶۷۸۹۰۱۲",
//       title: "جلسه مشاوره نوجوان",
//       date: "۱۴۰۵/۰۶/۱۱",
//       time: "۱۶:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "upcoming",
//       isOnline: true,
//       meetingLink: "https://meet.google.com/def-ghij-klm",
//       type: "teen",
//       notes: "مشکلات تحصیلی و اضطراب",
//     },
//     {
//       id: 5,
//       patient: "رضا حسینی",
//       patientPhone: "۹۱۶۷۸۹۰۱۲۳",
//       title: "جلسه مشاوره فردی",
//       date: "۱۴۰۵/۰۶/۰۴",
//       time: "۱۵:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "completed",
//       isOnline: true,
//       meetingLink: "https://meet.google.com/nop-qrst-uvw",
//       type: "individual",
//       notes: "جلسه انجام شده",
//     },
//     {
//       id: 6,
//       patient: "نگار موسوی",
//       patientPhone: "۹۱۷۸۹۰۱۲۳۴",
//       title: "جلسه زوج درمانی",
//       date: "۱۴۰۵/۰۶/۰۲",
//       time: "۱۷:۰۰",
//       duration: "۹۰ دقیقه",
//       status: "cancelled",
//       isOnline: false,
//       meetingLink: null,
//       type: "couple",
//       notes: "لغو توسط بیمار",
//       cancelledBy: "patient",
//       cancelReason: "مشکل شخصی",
//     },
//   ];

//   // ===== تبدیل تاریخ شمسی به میلادی =====
//   // const convertPersianToDate = (persianDate, time) => {
//   //   if (!persianDate || !time) return new Date();

//   //   const parts = persianDate.split("/");
//   //   if (parts.length !== 3) return new Date();

//   //   const year = parseInt(parts[0]);
//   //   const month = parseInt(parts[1]);
//   //   const day = parseInt(parts[2]);

//   //   const timeParts = time.split(":");
//   //   const hours = parseInt(timeParts[0]);
//   //   const minutes = parseInt(timeParts[1]);

//   //   if (
//   //     isNaN(year) ||
//   //     isNaN(month) ||
//   //     isNaN(day) ||
//   //     isNaN(hours) ||
//   //     isNaN(minutes)
//   //   ) {
//   //     return new Date();
//   //   }

//   //   const gregorianYear = year - 621;
//   //   const gregorianMonth = month - 1;
//   //   const gregorianDay = day;

//   //   const result = new Date(
//   //     gregorianYear,
//   //     gregorianMonth,
//   //     gregorianDay,
//   //     hours,
//   //     minutes,
//   //   );

//   //   if (isNaN(result.getTime())) {
//   //     return new Date();
//   //   }

//   //   return result;
//   // };

//   // ===== تبدیل تاریخ و ساعت جلسه به moment =====
//   const getSessionMoment = (session) => {
//     if (!session?.date || !session?.time) return moment();

//     const dateParts = toEnglishDigits(session.date).split("/");
//     const timeParts = toEnglishDigits(session.time).split(":");

//     if (dateParts.length !== 3 || timeParts.length < 2) {
//       return moment();
//     }

//     const year = parseInt(dateParts[0]);
//     const month = parseInt(dateParts[1]);
//     const day = parseInt(dateParts[2]);
//     const hours = parseInt(timeParts[0]);
//     const minutes = parseInt(timeParts[1]);

//     if (
//       isNaN(year) ||
//       isNaN(month) ||
//       isNaN(day) ||
//       isNaN(hours) ||
//       isNaN(minutes)
//     ) {
//       return moment();
//     }

//     return moment(
//       `${year}/${month}/${day} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
//       "jYYYY/jMM/jDD HH:mm",
//     );
//   };

//   // ===== محاسبه زمان پایان جلسه =====
//   const getSessionEndMoment = (session) => {
//     const startMoment = getSessionMoment(session);
//     const durationMinutes = parseInt(toEnglishDigits(session.duration)) || 60;
//     return startMoment.clone().add(durationMinutes, "minutes");
//   };

//   // ===== محاسبه زمان پایان جلسه =====
//   // const getEndTime = (session) => {
//   //   const startDate = convertPersianToDate(session.date, session.time);
//   //   const durationMinutes = parseInt(session.duration);
//   //   if (isNaN(durationMinutes)) return startDate;
//   //   return new Date(startDate.getTime() + durationMinutes * 60 * 1000);
//   // };

//   // ===== تشخیص وضعیت واقعی جلسه =====
//   // const getRealStatus = (session) => {
//   //   // اگر جلسه لغو شده یا انجام شده، همون رو برگردون
//   //   if (session.status === "completed") return "completed";
//   //   if (session.status === "cancelled") return "cancelled";

//   //   const now = new Date();
//   //   const startDate = convertPersianToDate(session.date, session.time);
//   //   const endDate = getEndTime(session);

//   //   const diffStart = startDate - now;
//   //   const diffEnd = endDate - now;

//   //   // اگر زمان شروع جلسه گذشته
//   //   if (diffStart <= 0) {
//   //     // اگر زمان پایان جلسه هنوز نرسیده → در حال برگزاری
//   //     if (diffEnd > 0) {
//   //       return "ongoing";
//   //     }
//   //     // اگر زمان پایان هم گذشته → انجام شده
//   //     return "completed";
//   //   }

//   //   // اگر زمان شروع جلسه در آینده است → در انتظار
//   //   return "upcoming";
//   // };

//   // ===== تشخیص وضعیت واقعی جلسه =====
//   const getRealStatus = (session) => {
//     // اگه status دستی ongoing، cancelled یا completed بود، همون رو برگردون
//     if (session.status === "ongoing") return "ongoing";
//     if (session.status === "cancelled") return "cancelled";
//     if (session.status === "completed") return "completed";

//     // در غیر این صورت، بر اساس زمان محاسبه کن
//     const now = moment();
//     const startMoment = getSessionMoment(session);
//     const endMoment = getSessionEndMoment(session);

//     if (!startMoment.isValid()) return "upcoming";

//     // در حال برگزاری (فقط اگه status دستی ongoing نباشه)
//     if (now.isAfter(startMoment) && now.isBefore(endMoment)) {
//       return "ongoing";
//     }

//     // کامل گذشته → انجام شده
//     if (now.isAfter(endMoment)) {
//       return "completed";
//     }

//     return "upcoming";
//   };

//   // ===== مرتب‌سازی جلسات بر اساس تاریخ و زمان (نزدیک‌ترین اول) =====
//   // const sortedSessions = [...sessions].sort((a, b) => {
//   //   const dateA = convertPersianToDate(a.date, a.time);
//   //   const dateB = convertPersianToDate(b.date, b.time);
//   //   return dateA - dateB;
//   // });

//     const sortedSessions = [...sessions].sort((a, b) => {
//     const momentA = getSessionMoment(a);
//     const momentB = getSessionMoment(b);
//     return momentA - momentB;
//   });

//   // ===== فیلتر کردن جلسات =====
//   const getFilteredSessions = () => {
//     if (activeTab === "upcoming") {
//       return sortedSessions.filter((s) => {
//         const realStatus = getRealStatus(s);
//         return realStatus === "upcoming" || realStatus === "ongoing";
//       });
//     }
//     return sortedSessions.filter((s) => {
//       const realStatus = getRealStatus(s);
//       return realStatus === "completed" || s.status === "cancelled";
//     });
//   };

//   const filteredSessions = getFilteredSessions();

//   // ===== وضعیت‌ها =====
//   // const getStatusInfo = (status) => {
//   //   const statusMap = {
//   //     upcoming: {
//   //       label: "در انتظار",
//   //       className: styles.sessionUpcoming,
//   //     },
//   //     ongoing: {
//   //       label: "در حال برگزاری",
//   //       className: styles.sessionOngoing,
//   //     },
//   //     completed: {
//   //       label: "انجام شده",
//   //       className: styles.sessionCompleted,
//   //     },
//   //     cancelled: {
//   //       label: "لغو شده",
//   //       className: styles.sessionCancelled,
//   //     },
//   //   };
//   //   return statusMap[status] || statusMap.upcoming;
//   // };

//   // ===== پیدا کردن جلسه بعدی (نزدیک‌ترین جلسه آینده یا در حال برگزاری) =====
//   const getNextSession = () => {
//     const upcomingSessions = sortedSessions.filter((s) => {
//       const realStatus = getRealStatus(s);
//       return realStatus === "upcoming" || realStatus === "ongoing";
//     });

//     if (upcomingSessions.length === 0) return null;

//     // const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
//     //   const dateA = convertPersianToDate(a.date, a.time);
//     //   const dateB = convertPersianToDate(b.date, b.time);
//     //   return dateA - dateB;
//     // });

//         const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
//       const momentA = getSessionMoment(a);
//       const momentB = getSessionMoment(b);
//       return momentA - momentB;
//     });

//     return sortedUpcoming[0];
//   };

//   const nextSession = getNextSession();
//   const nextSessionRealStatus = nextSession ? getRealStatus(nextSession) : null;

//   // ===== تایمر شمارش معکوس =====
//   const [timeLeft, setTimeLeft] = useState(null);

//   // useEffect(() => {
//   //   if (!nextSession) return;

//   //   const targetDate = convertPersianToDate(nextSession.date, nextSession.time);
//   //   const now = new Date();
//   //   const diff = targetDate - now;

//   //   // اگر جلسه در حال برگزاری است یا گذشته، تایمر رو خالی کن
//   //   if (diff <= 0) {
//   //     setTimeLeft(null);
//   //     return;
//   //   }

//   //   const interval = setInterval(() => {
//   //     const now = new Date();
//   //     const diff = targetDate - now;

//   //     if (diff <= 0) {
//   //       clearInterval(interval);
//   //       setTimeLeft(null);
//   //     } else {
//   //       const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//   //       const hours = Math.floor(
//   //         (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
//   //       );
//   //       const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//   //       setTimeLeft({ days, hours, minutes });
//   //     }
//   //   }, 1000);

//   //   return () => clearInterval(interval);
//   // }, [nextSession]);

//   // ===== توابع کمکی =====

//     useEffect(() => {
//     if (!nextSession) return;

//     const targetMoment = getSessionMoment(nextSession);
//     if (!targetMoment.isValid()) return;

//     const updateTimer = () => {
//       const now = moment();
//       const diff = targetMoment.diff(now, "seconds");

//       if (diff <= 0) {
//         setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
//         return true;
//       }

//       const days = Math.floor(diff / (60 * 60 * 24));
//       const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
//       const minutes = Math.floor((diff % (60 * 60)) / 60);
//       const seconds = diff % 60;

//       setTimeLeft({ days, hours, minutes, seconds });
//       return true;
//     };

//     updateTimer();
//     const interval = setInterval(() => {
//       updateTimer();
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [nextSession?.id]);

//   const handleStartSession = (session) => {
//     if (window.confirm(`آیا مایل به شروع جلسه ${session.patient} هستید؟`)) {
//       if (session.meetingLink) {
//         window.open(session.meetingLink, "_blank");
//       } else {
//         alert("لینک جلسه موجود نیست.");
//       }
//     }
//   };

//   const handleEndSession = (sessionId) => {
//     if (window.confirm("آیا جلسه به پایان رسیده است؟")) {
//       alert("✅ جلسه با موفقیت به پایان رسید.");
//     }
//   };

//   const getTypeIcon = (type) => {
//     const typeMap = {
//       individual: "🧑‍⚕️",
//       couple: "💑",
//       teen: "🧒",
//       family: "👨‍👩‍👧‍👦",
//     };
//     return typeMap[type] || "🧑‍⚕️";
//   };

//   const getTypeName = (type) => {
//     const typeMap = {
//       individual: "فردی",
//       couple: "زوج",
//       teen: "نوجوان",
//       family: "خانواده",
//     };
//     return typeMap[type] || "فردی";
//   };

//   return (
//     <div className={styles.pageContent}>
//       {/* هدر بخش */}
//       <div className={styles.pageHeader}>
//         <div className={styles.headerInfo}>
//           <h2>🎥 جلسات آنلاین</h2>
//           <p>مدیریت و برگزاری جلسات مجازی</p>
//         </div>
//         <div className={styles.sessionStats}>
//           <span className={styles.statItem}>
//             <span className={styles.statNumber}>
//               {
//                 sortedSessions.filter((s) => {
//                   const realStatus = getRealStatus(s);
//                   return realStatus === "upcoming" || realStatus === "ongoing";
//                 }).length
//               }
//             </span>
//             <span className={styles.statLabel}>جلسه پیش‌رو</span>
//           </span>
//           <span className={styles.statDivider}>|</span>
//           <span className={styles.statItem}>
//             <span className={styles.statNumber}>
//               {
//                 sortedSessions.filter((s) => {
//                   const realStatus = getRealStatus(s);
//                   return realStatus === "completed";
//                 }).length
//               }
//             </span>
//             <span className={styles.statLabel}>جلسه برگزار شده</span>
//           </span>
//         </div>
//       </div>

//       {/* تب‌ها */}
//       <div className={styles.filterTabs}>
//         <button
//           className={`${styles.filterTab} ${activeTab === "upcoming" ? styles.active : ""}`}
//           onClick={() => setActiveTab("upcoming")}
//         >
//           📅 جلسات پیش‌رو
//           <span className={styles.filterCount}>
//             {
//               sortedSessions.filter((s) => {
//                 const realStatus = getRealStatus(s);
//                 return realStatus === "upcoming" || realStatus === "ongoing";
//               }).length
//             }
//           </span>
//         </button>
//         <button
//           className={`${styles.filterTab} ${activeTab === "past" ? styles.active : ""}`}
//           onClick={() => setActiveTab("past")}
//         >
//           📋 تاریخچه جلسات
//           <span className={styles.filterCount}>
//             {
//               sortedSessions.filter((s) => {
//                 const realStatus = getRealStatus(s);
//                 return realStatus === "completed" || s.status === "cancelled";
//               }).length
//             }
//           </span>
//         </button>
//       </div>

//       {/* لیست جلسات */}
//       <div className={styles.sessionsList}>
//         {/* ===== کارت ویژه جلسه بعدی ===== */}
//         {activeTab === "upcoming" && nextSession && (
//           <div className={styles.nextSessionBanner}>
//             <div className={styles.nextSessionContent}>
//               <span className={styles.nextSessionLabel}>
//                 {nextSessionRealStatus === "ongoing"
//                   ? "🔴 در حال برگزاری"
//                   : "⏰ جلسه بعدی شما"}
//               </span>
//               <h3>{nextSession.title}</h3>
//               <p>با {nextSession.patient}</p>
//               <div className={styles.nextSessionTime}>
//                 <span>📅 {nextSession.date}</span>
//                 <span>•</span>
//                 <span>⏰ {nextSession.time}</span>
//                 <span>•</span>
//                 <span>
//                   {getTypeIcon(nextSession.type)}{" "}
//                   {getTypeName(nextSession.type)}
//                 </span>
//               </div>
//               {nextSession.notes && (
//                 <div className={styles.nextSessionNotes}>
//                   📋 {nextSession.notes}
//                 </div>
//               )}
//             </div>

//             <div className={styles.nextSessionActions}>
//               <button
//                 className={styles.btnNextSession}
//                 onClick={() => handleStartSession(nextSession)}
//               >
//                 {nextSessionRealStatus === "ongoing"
//                   ? "🚀 ورود به جلسه"
//                   : "🚀 شروع جلسه"}
//                 <span>→</span>
//               </button>

//               {/* ===== تایمر فقط برای جلسات آینده ===== */}
//               {nextSessionRealStatus === "upcoming" && timeLeft && (
//                 <div className={styles.nextSessionTimer}>
//                   <span className={styles.timerLabel}>زمان تا شروع:</span>
//                   <div className={styles.timerDigits}>
//                     <span className={styles.timerDigit}>
//                       {String(timeLeft.days).padStart(2, "0")}
//                       <span className={styles.timerUnit}>روز</span>
//                     </span>
//                     <span className={styles.timerSeparator}>:</span>
//                     <span className={styles.timerDigit}>
//                       {String(timeLeft.hours).padStart(2, "0")}
//                       <span className={styles.timerUnit}>ساعت</span>
//                     </span>
//                     <span className={styles.timerSeparator}>:</span>
//                     <span className={styles.timerDigit}>
//                       {String(timeLeft.minutes).padStart(2, "0")}
//                       <span className={styles.timerUnit}>دقیقه</span>
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {/* ===== نمایش "در حال برگزاری" برای جلسه جاری ===== */}
//               {nextSessionRealStatus === "ongoing" && (
//                 <div className={styles.ongoingBadge}>
//                   <span className={styles.pulseDot}></span>
//                   جلسه در حال برگزاری است
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ===== لیست بقیه جلسات ===== */}
//         {filteredSessions.length > 0 ? (
//           filteredSessions.map((session) => {
//             if (nextSession && session.id === nextSession.id) return null;

//             const realStatus = getRealStatus(session);
//             const statusInfo = getStatusInfo(realStatus);

//             return (
//               <div key={session.id} className={styles.sessionCard}>
//                 {/* هدر کارت */}
//                 <div className={styles.sessionCardHeader}>
//                   <div className={styles.sessionDoctor}>
//                     <div className={styles.sessionPatientAvatar}>
//                       {getTypeIcon(session.type)}
//                     </div>
//                     <div>
//                       <h4>{session.patient}</h4>
//                       <span className={styles.sessionType}>
//                         {session.title} • {getTypeName(session.type)}
//                       </span>
//                     </div>
//                   </div>
//                   <span
//                     className={`${styles.sessionStatus} ${statusInfo.className}`}
//                   >
//                     <span className={styles.statusDot}></span>
//                     {statusInfo.label}
//                   </span>
//                 </div>

//                 {/* جزئیات جلسه */}
//                 <div className={styles.sessionDetails}>
//                   <div className={styles.sessionMeta}>
//                     <div className={styles.metaGroup}>
//                       <span>📅 {session.date}</span>
//                     </div>
//                     <div className={styles.metaGroup}>
//                       <span>
//                         ⏰ {session.time} - {session.duration}
//                       </span>
//                     </div>
//                     <div className={styles.metaGroup}>
//                       <span>🖥️ جلسه آنلاین</span>
//                     </div>
//                   </div>
//                   {session.notes && (
//                     <div className={styles.sessionNotes}>
//                       📋 {session.notes}
//                     </div>
//                   )}
//                 </div>

//                 {/* دکمه‌های اکشن */}
//                 <div className={styles.sessionActions}>
//                   {realStatus === "upcoming" && (
//                     <>
//                       <button
//                         className={styles.btnJoinSession}
//                         onClick={() => handleStartSession(session)}
//                       >
//                         <span>▶</span>
//                         شروع جلسه
//                       </button>
//                       <button
//                         className={styles.btnCancelSession}
//                         onClick={() => {
//                           if (
//                             window.confirm(
//                               `آیا از لغو جلسه ${session.patient} اطمینان دارید؟`,
//                             )
//                           ) {
//                             alert(`❌ جلسه ${session.patient} لغو شد.`);
//                           }
//                         }}
//                       >
//                         ❌ لغو جلسه
//                       </button>
//                     </>
//                   )}

//                   {realStatus === "ongoing" && (
//                     <>
//                       <button className={styles.btnJoinNow}>
//                         <span className={styles.pulseDot}></span>
//                         در حال برگزاری
//                       </button>
//                       <button
//                         className={styles.btnEndSession}
//                         onClick={() => handleEndSession(session.id)}
//                       >
//                         ⏹ پایان جلسه
//                       </button>
//                     </>
//                   )}

//                   {(realStatus === "completed" ||
//                     session.status === "completed") && (
//                     <>
//                       <button className={styles.btnViewRecord}>
//                         📹 مشاهده ضبط جلسه
//                       </button>
//                       <button className={styles.btnViewNotes}>
//                         📝 مشاهده یادداشت
//                       </button>
//                     </>
//                   )}

//                   {session.status === "cancelled" && (
//                     <span className={styles.cancelledInfo}>
//                       ❌{" "}
//                       {session.cancelledBy === "patient"
//                         ? "لغو توسط بیمار"
//                         : "لغو توسط پزشک"}
//                       {session.cancelReason && (
//                         <span className={styles.cancelReasonText}>
//                           • دلیل: {session.cancelReason}
//                         </span>
//                       )}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className={styles.emptyState}>
//             <span className={styles.emptyIcon}>🎥</span>
//             <h3>هیچ جلسه‌ای در این دسته وجود ندارد</h3>
//             <p>
//               {activeTab === "upcoming"
//                 ? "شما هیچ جلسه پیش‌رویی ندارید."
//                 : "هنوز جلسه برگزار شده‌ای وجود ندارد."}
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// ============================================
// COMPONENT: Sessions Management (Doctor Panel)
// ============================================
function SessionsManagement({ appointments }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [timeLeft, setTimeLeft] = useState(null);

  // ==========================================
  // 📌 مشتق‌ها
  // ==========================================

  // ===== جلسات پیش‌رو: confirmed + آینده (شامل ongoing) =====
  const upcomingSessions = useMemo(() => {
    return appointments
      .filter((app) => {
        const displayStatus = getDisplayStatus(app);
        return displayStatus === "confirmed" || displayStatus === "ongoing";
      })
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentA - momentB; // نزدیک‌ترین اول
      });
  }, [appointments]);

  // ===== تاریخچه جلسات: completed =====
  const pastSessions = useMemo(() => {
    return appointments
      .filter((app) => {
        const displayStatus = getDisplayStatus(app);
        return displayStatus === "completed";
      })
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentB - momentA; // جدیدترین اول
      });
  }, [appointments]);

  // ===== جلسه بعدی =====
  const nextSession = upcomingSessions[0] || null;
  const isNextOngoing = nextSession
    ? getDisplayStatus(nextSession) === "ongoing"
    : false;

  // ==========================================
  // 📌 تایمر شمارش معکوس
  // ==========================================
  useEffect(() => {
    if (!nextSession) return;

    const targetMoment = getAppointmentMoment(nextSession);
    if (!targetMoment.isValid()) return;

    const updateTimer = () => {
      const now = moment();
      const diff = targetMoment.diff(now, "seconds");

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true;
      }

      const days = Math.floor(diff / (60 * 60 * 24));
      const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((diff % (60 * 60)) / 60);
      const seconds = diff % 60;

      setTimeLeft({ days, hours, minutes, seconds });
      return true;
    };

    updateTimer();
    const interval = setInterval(() => {
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [nextSession?.id]);

  // ==========================================
  // 📌 توابع
  // ==========================================

  const handleStartSession = (session) => {
    if (window.confirm(`آیا مایل به شروع جلسه ${session.patient} هستید؟`)) {
      if (session.isOnline) {
        alert("جلسه شروع شد.");
      } else {
        alert("این جلسه به صورت حضوری برگزار می‌شود.");
      }
    }
  };

  const handleEndSession = (sessionId) => {
    if (window.confirm("آیا جلسه به پایان رسیده است؟")) {
      alert("✅ جلسه با موفقیت به پایان رسید.");
    }
  };

  // ==========================================
  // 📌 رندر
  // ==========================================
  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>🎥 جلسات آنلاین</h2>
          <p>مدیریت و برگزاری جلسات مجازی</p>
        </div>
        <div className={styles.sessionStats}>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>
              {toPersianDigits(upcomingSessions.length)}
            </span>
            <span className={styles.statLabel}>جلسه پیش‌رو</span>
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>
              {toPersianDigits(pastSessions.length)}
            </span>
            <span className={styles.statLabel}>جلسه برگزار شده</span>
          </span>
        </div>
      </div>

      {/* تب‌ها */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${
            activeTab === "upcoming" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          📅 جلسات پیش‌رو
          <span className={styles.filterCount}>
            {toPersianDigits(upcomingSessions.length)}
          </span>
        </button>
        <button
          className={`${styles.filterTab} ${
            activeTab === "past" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("past")}
        >
          📋 تاریخچه جلسات
          <span className={styles.filterCount}>
            {toPersianDigits(pastSessions.length)}
          </span>
        </button>
      </div>

      {/* لیست جلسات */}
      <div className={styles.sessionsList}>
        {/* ===== کارت ویژه جلسه بعدی ===== */}
        {activeTab === "upcoming" && nextSession && (
          <div
            className={`${styles.nextSessionBanner} ${
              isNextOngoing ? styles.nextSessionOngoing : ""
            }`}
          >
            <div className={styles.nextSessionContent}>
              <span className={styles.nextSessionLabel}>
                {isNextOngoing ? "🔴 در حال برگزاری" : "⏰ جلسه بعدی شما"}
              </span>
              <h3>{nextSession.type}</h3>
              <p>با {nextSession.patient}</p>
              {/* <div className={styles.nextSessionTime}>
                <span>{nextSession.date}</span>
                <span>•</span>
                <span>{nextSession.time}</span>
                <span>•</span>
                <span>
                  {getTypeIcon(nextSession.typeKey)}{" "}
                  {getTypeLabel(nextSession.typeKey)}
                </span>
              </div> */}
              <div className={styles.nextSessionTime}>
                <span>{nextSession.date}</span>
                <span>•</span>
                <span>
                  {toPersianDigits(
                    nextSession.startTime || nextSession.time.split(" - ")[0],
                  )}
                </span>
                <span>•</span>
                <span>
                  {getTypeIcon(nextSession.typeKey)}{" "}
                  {getTypeLabel(nextSession.typeKey)}
                </span>
              </div>
            </div>

            <div className={styles.nextSessionTimerEnterContainer}>
              <button
                className={
                  isNextOngoing
                    ? styles.btnNextSession
                    : styles.btnNextSessionDisabled
                }
                onClick={() => isNextOngoing && handleStartSession(nextSession)}
                disabled={!isNextOngoing}
              >
                {isNextOngoing ? "ورود به جلسه" : "ورود به جلسه"}
                <span>→</span>
              </button>

              {timeLeft && (
                <div className={styles.nextSessionTimer}>
                  <span className={styles.timerLabel}>
                    {isNextOngoing
                      ? "جلسه در حال برگزاری است."
                      : "زمان تا شروع:"}
                  </span>
                  <div className={styles.timerDigits}>
                    <span className={styles.timerDigit}>
                      {String(timeLeft.seconds).padStart(2, "0")}
                      <span className={styles.timerUnit}>ثانیه</span>
                    </span>
                    <span className={styles.timerSeparator}>:</span>
                    <span className={styles.timerDigit}>
                      {String(timeLeft.minutes).padStart(2, "0")}
                      <span className={styles.timerUnit}>دقیقه</span>
                    </span>
                    <span className={styles.timerSeparator}>:</span>
                    <span className={styles.timerDigit}>
                      {String(timeLeft.hours).padStart(2, "0")}
                      <span className={styles.timerUnit}>ساعت</span>
                    </span>
                    <span className={styles.timerSeparator}>:</span>
                    <span className={styles.timerDigit}>
                      {String(timeLeft.days).padStart(2, "0")}
                      <span className={styles.timerUnit}>روز</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== لیست جلسات ===== */}
        {activeTab === "upcoming" &&
          (upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => {
              // جلسه بعدی رو توی بنر ویژه نشون دادیم، اینجا رد کن
              if (nextSession && session.id === nextSession.id) return null;

              const displayStatus = getDisplayStatus(session);
              const isOngoing = displayStatus === "ongoing";

              return (
                <div key={session.id} className={styles.sessionCard}>
                  {/* هدر کارت */}
                  <div className={styles.sessionCardHeader}>
                    <div className={styles.sessionDoctor}>
                      <div className={styles.sessionPatientAvatar}>
                        {getTypeIcon(session.typeKey)}
                      </div>
                      <div>
                        <h4>{session.patient}</h4>
                        <span className={styles.sessionType}>
                          {session.type} • {getTypeLabel(session.typeKey)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`${styles.sessionStatus} ${
                        isOngoing
                          ? styles.sessionOngoing
                          : styles.sessionUpcoming
                      }`}
                    >
                      <span className={styles.statusDot}></span>
                      {isOngoing ? "در حال برگزاری" : "تأیید شده"}
                    </span>
                  </div>

                  {/* جزئیات */}
                  <div className={styles.sessionDetails}>
                    <div className={styles.sessionMeta}>
                      <div className={styles.metaGroup}>
                        <span>{session.date}</span>
                      </div>
                      <span>•</span>
                      {/* <div className={styles.metaGroup}>
                        <span>{session.time}</span>
                      </div> */}
                      <div className={styles.metaGroup}>
                        <span>
                          {toPersianDigits(
                            session.startTime || session.time.split(" - ")[0],
                          )}
                        </span>
                      </div>
                      <span>•</span>
                      <div className={styles.metaGroup}>
                        <span>
                          {session.isOnline ? "جلسه آنلاین" : "جلسه حضوری"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* دکمه‌های اکشن */}
                  <div className={styles.sessionActions}>
                    {isOngoing ? (
                      <button
                        className={styles.btnJoinSession}
                        onClick={() => handleStartSession(session)}
                      >
                        <span>▶</span>
                        ورود به جلسه
                      </button>
                    ) : (
                      <button
                        className={styles.btnCancelSession}
                        onClick={() => {
                          if (
                            window.confirm(
                              `آیا از لغو جلسه ${session.patient} اطمینان دارید؟`,
                            )
                          ) {
                            alert(`❌ جلسه ${session.patient} لغو شد.`);
                          }
                        }}
                      >
                        ❌ لغو جلسه
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎥</span>
              <h3>هیچ جلسه پیش‌رویی ندارید</h3>
              <p>جلسات تأیید شده آینده شما در اینجا نمایش داده می‌شوند.</p>
            </div>
          ))}

        {/* ===== تاریخچه ===== */}
        {activeTab === "past" &&
          (pastSessions.length > 0 ? (
            pastSessions.map((session) => (
              <div key={session.id} className={styles.sessionCard}>
                {/* هدر کارت */}
                <div className={styles.sessionCardHeader}>
                  <div className={styles.sessionDoctor}>
                    <div className={styles.sessionPatientAvatar}>
                      {getTypeIcon(session.typeKey)}
                    </div>
                    <div>
                      <h4>{session.patient}</h4>
                      <span className={styles.sessionType}>
                        {session.type} • {getTypeLabel(session.typeKey)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`${styles.sessionStatus} ${styles.sessionCompleted}`}
                  >
                    <span className={styles.statusDot}></span>
                    برگزار شده
                  </span>
                </div>

                {/* جزئیات */}
                <div className={styles.sessionDetails}>
                  <div className={styles.sessionMeta}>
                    <div className={styles.metaGroup}>
                      <span>{session.date}</span>
                    </div>
                    <span>•</span>
                    {/* <div className={styles.metaGroup}>
                      <span>{session.time}</span>
                    </div> */}
                    <div className={styles.metaGroup}>
                      <span>
                        {toPersianDigits(
                          session.startTime || session.time.split(" - ")[0],
                        )}
                      </span>
                    </div>
                    <span>•</span>
                    <div className={styles.metaGroup}>
                      <span>
                        {session.isOnline ? "جلسه آنلاین" : "جلسه حضوری"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* دکمه‌های اکشن */}
                <div className={styles.sessionActions}>
                  <button className={styles.btnViewRecord}>
                    📹 مشاهده ضبط جلسه
                  </button>
                  <button className={styles.btnViewNotes}>
                    📝 مشاهده یادداشت
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎥</span>
              <h3>هنوز جلسه برگزار شده‌ای وجود ندارد</h3>
              <p>جلسات برگزار شده شما در اینجا نمایش داده می‌شوند.</p>
            </div>
          ))}
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Patients List
// ============================================
function PatientsList() {
  const patients = [
    {
      id: 1,
      name: "محمد کریمی",
      phone: "۹۱۲۳۴۵۶۷۸۹",
      sessions: 8,
      lastVisit: "۱۴۰۵/۰۶/۰۳",
    },
    {
      id: 2,
      name: "زهرا احمدی",
      phone: "۹۱۳۴۵۶۷۸۹۰",
      sessions: 5,
      lastVisit: "۱۴۰۵/۰۵/۲۸",
    },
    {
      id: 3,
      name: "علی رضایی",
      phone: "۹۱۴۵۶۷۸۹۰۱",
      sessions: 12,
      lastVisit: "۱۴۰۵/۰۶/۰۱",
    },
  ];

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>👤 بیماران من</h2>
          <p>لیست بیماران و پرونده‌های آنها</p>
        </div>
        <button className={styles.newBtn}>
          <FaPlus /> افزودن بیمار
        </button>
      </div>

      <div className={styles.patientsList}>
        {patients.map((patient) => (
          <div key={patient.id} className={styles.patientCard}>
            <div className={styles.patientAvatar}>👤</div>
            <div className={styles.patientInfo}>
              <h4>{patient.name}</h4>
              <p>{patient.phone}</p>
              <div className={styles.patientStats}>
                <span>📅 {patient.sessions} جلسه</span>
                <span>📋 آخرین مراجعه: {patient.lastVisit}</span>
              </div>
            </div>
            <div className={styles.patientActions}>
              <button className={styles.btnView}>مشاهده پرونده</button>
              <button className={styles.btnMessage}>💬</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Exercises Management
// ============================================
function ExercisesManagement() {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>📝 تمارین</h2>
          <p>تعیین و مدیریت تمارین بیماران</p>
        </div>
        <button className={styles.newBtn}>
          <FaPlus /> تمرین جدید
        </button>
      </div>
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>📝</span>
        <h3>هیچ تمرینی تعیین نشده</h3>
        <p>برای بیماران خود تمرین تعیین کنید.</p>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Patient Notes
// ============================================
function PatientNotes() {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>📋 یادداشت‌ها</h2>
          <p>یادداشت‌های مربوط به بیماران</p>
        </div>
        <button className={styles.newBtn}>
          <FaPlus /> یادداشت جدید
        </button>
      </div>
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>📋</span>
        <h3>هیچ یادداشتی ثبت نشده</h3>
        <p>برای بیماران خود یادداشت ثبت کنید.</p>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Doctor Messages
// ============================================
function DoctorMessages() {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>💬 پیام‌ها</h2>
          <p>ارتباط با بیماران</p>
        </div>
      </div>
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>💬</span>
        <h3>هیچ پیامی وجود ندارد</h3>
        <p>پیام‌های بیماران در اینجا نمایش داده می‌شود.</p>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Doctor Profile
// ============================================
function DoctorProfile({ userData }) {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>👤 پروفایل</h2>
          <p>اطلاعات شخصی شما</p>
        </div>
        <button className={styles.editBtn}>✏️ ویرایش</button>
      </div>
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          <img src={doctorAvatar} alt="" />
        </div>
        <div className={styles.profileInfo}>
          <h3>دکتر محمد رضایی</h3>
          <p>روانشناس بالینی</p>
          <p>📱 {userData?.phone || "۹۰۱۲۳۴۵۶۷۸"}</p>
          <p>📧 dr.rezaei@email.com</p>
          <div className={styles.profileStats}>
            <span>۱۲ بیمار فعال</span>
            <span>۴۸ جلسه برگزار شده</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Doctor Settings
// ============================================
function DoctorSettings() {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>⚙️ تنظیمات</h2>
          <p>تنظیمات حساب کاربری</p>
        </div>
      </div>
      <div className={styles.settingsList}>
        <div className={styles.settingItem}>
          <span>🔔 اعلان‌ها</span>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.switchSlider}></span>
          </label>
        </div>
        <div className={styles.settingItem}>
          <span>⏰ زمانبندی جلسات</span>
          <button className={styles.settingBtn}>مدیریت</button>
        </div>
        <div className={styles.settingItem}>
          <span>🌙 حالت شب</span>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.switchSlider}></span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;
