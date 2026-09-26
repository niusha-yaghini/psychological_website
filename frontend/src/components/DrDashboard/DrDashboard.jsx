// components/DoctorDashboard/DoctorDashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DrDashboard.module.css";

import {
  FaHome,
  FaCalendarAlt,
  FaCalendarWeek,
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
  FaMoneyBillWave,
} from "react-icons/fa";

import logo from "../../../public/images/logo/logo2.png";
import doctorAvatar from "../../../public/images/Patient_Panel/usericon.png";

import seedData from "../../../../backend/seed";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: false, dialect: "persian" });

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// ============================================
// توابع کمکی (Global Helpers)
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

// ===== چک کردن اینکه نوبت بیشتر از ۲۴ ساعت تا شروع فاصله داره =====
const isMoreThan24HoursAway = (appointment) => {
  const startMoment = getAppointmentMoment(appointment);
  if (!startMoment.isValid()) return false;
  const diffHours = startMoment.diff(moment(), "hours", true);
  return diffHours >= 24;
};

// ===== چک کردن اینکه نوبت کمتر از ۲۴ ساعت تا شروع فاصله داره =====
const isLessThan24HoursAway = (appointment) => {
  const startMoment = getAppointmentMoment(appointment);
  if (!startMoment.isValid()) return false;
  const diffHours = startMoment.diff(moment(), "hours", true);
  return diffHours > 0 && diffHours < 24;
};

// ===== نمایش تاریخ نوبت (همیشه تاریخ کامل) =====
const getRelativeDateLabel = (appointment) => {
  if (!appointment?.date) return "";
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
// const getTypeIcon = (typeKey) => {
//   const map = {
//     individual: "🧑‍⚕️",
//     couple: "💑",
//     teen: "🧒",
//     family: "👨‍👩‍👧‍👦",
//   };
//   return map[typeKey] || "🧑‍⚕️";
// };

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

// ===== چک کردن اینکه نوبت به وضعیت نهایی رسیده (برای کمرنگ شدن) =====
const isFinalizedStatus = (displayStatus) => {
  return (
    displayStatus === "completed" ||
    displayStatus === "cancelled" ||
    displayStatus === "no-show"
  );
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
  // مشتق‌ها (Derived State)
  // ==========================================

  // ===== نوبت‌های در انتظار تأیید =====
  // const pendingSessions = useMemo(() => {
  //   return appointments
  //     .filter((a) => a.status === "pending")
  //     .sort((a, b) => {
  //       const momentA = getAppointmentMoment(a);
  //       const momentB = getAppointmentMoment(b);
  //       return momentA - momentB; // نزدیک‌ترین اول
  //     });
  // }, [appointments]);

  // ===== نوبت‌های در انتظار تأیید (فقط pending با تاریخ آینده) =====
  const pendingSessions = useMemo(() => {
    return appointments
      .filter((a) => getDisplayStatus(a) === "pending")
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
  // const stats = useMemo(
  //   () => [
  //     {
  //       label: "بیماران فعال",
  //       value: seedData.doctorDashboardStats.activePatients,
  //       color: "#4CAF84",
  //     },
  //     {
  //       label: "جلسات امروز",
  //       value: todaySessions.length,
  //       color: "#2196F3",
  //     },
  //     {
  //       label: "نوبت‌های در انتظار",
  //       value: pendingSessions.length,
  //       color: "#FF9800",
  //     },
  //     {
  //       label: "تمارین ارسال شده",
  //       value: seedData.doctorDashboardStats.exercisesSent,
  //       color: "#9C27B0",
  //     },
  //   ],
  //   [todaySessions.length, pendingSessions.length],
  // );

  // ===== آمار (محاسبه‌ی dynamic از داده‌ها) =====
  const stats = useMemo(() => {
    // ===== بیماران فعال =====
    const activePatientsCount = seedData.doctorPatients.filter(
      (p) => p.status === "active",
    ).length;

    // ===== تمارین ارسال شده =====
    // فعلاً از seedData.exercises می‌گیریم (که ماله پنل بیماره، ولی برای mock کافیه)
    // بعداً که تمارین پنل دکتر ساخته شد، از اون میاد
    const exercisesSentCount = seedData.exercises?.length || 0;

    return [
      {
        label: "بیماران فعال",
        value: activePatientsCount,
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
        value: exercisesSentCount,
        color: "#9C27B0",
      },
    ];
  }, [todaySessions.length, pendingSessions.length]);

  // ==========================================
  // توابع
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
                    {toPersianDigits(
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
                        {toPersianDigits(
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
                    {toPersianDigits(
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
                    {toPersianDigits(
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

  // ===== state بیماران =====
  const [patients, setPatients] = useState(seedData.doctorPatients);

  // ===== state نوتیفیکیشن‌ها (از seed اولیه میاد، بعداً از بک‌اند) =====
  const [notifications, setNotifications] = useState(
    seedData.doctorNotifications || [],
  );

  // ===== زمان فعلی (برای محاسبه‌ی نوتیفیکیشن‌های dynamic) =====
  const [currentTime, setCurrentTime] = useState(moment());

  // ===== تیک هر ۱ دقیقه برای آپدیت نوتیفیکیشن‌های زمان‌محور =====
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(moment());
    }, 60000); // هر ۶۰ ثانیه

    return () => clearInterval(interval);
  }, []);

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

  // ===== علامت‌گذاری به عنوان خوانده شده =====
  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
  };

  // ===== علامت‌گذاری همه =====
  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  // ===== محاسبه تعداد نوبت‌های پیش‌رو (برای badge) =====
  const upcomingAppointmentsCount = useMemo(() => {
    return appointments.filter((app) => {
      const displayStatus = getDisplayStatus(app);
      return displayStatus === "confirmed" || displayStatus === "pending";
    }).length;
  }, [appointments]);

  // ===== نوتیفیکیشن‌های dynamic (مشتق از state) =====
  const derivedNotifications = useMemo(() => {
    const result = [...notifications]; // نوتیفیکیشن‌های stored (از seed یا بک‌اند)

    // ==========================================
    // نوتیفیکیشن ۱: لینک جلسه تنظیم نشده
    // ==========================================
    // جلسه بعدی رو پیدا کن
    const nextSession = appointments
      .filter((a) => {
        const displayStatus = getDisplayStatus(a);
        return displayStatus === "confirmed" || displayStatus === "ongoing";
      })
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentA - momentB;
      })[0];

    if (nextSession && !nextSession.meetingLink) {
      const startMoment = getAppointmentMoment(nextSession);
      const diffMinutes = startMoment.diff(currentTime, "minutes");

      // اگه بین ۰ تا ۶۰ دقیقه مونده و لینک نداره
      if (diffMinutes > 0 && diffMinutes < 60) {
        result.push({
          id: `link-reminder-${nextSession.id}`,
          type: "reminder",
          title: "لینک جلسه تنظیم نشده",
          message: `جلسه با ${nextSession.patient} کمتر از ${toPersianDigits(Math.ceil(diffMinutes))} دقیقه دیگر شروع می‌شود. لطفاً لینک را وارد کنید.`,
          time: "الان",
          isRead: false,
        });
      }
    }

    // ==========================================
    // 📌 نوتیفیکیشن ۲: جلسات در انتظار تأیید (بیش از ۲۴ ساعت)
    // ==========================================
    const stalePending = appointments.filter((a) => {
      if (a.status !== "pending") return false;
      const createdAtMoment = getAppointmentMoment(a);
      const hoursPassed = currentTime.diff(createdAtMoment, "hours", true);
      return hoursPassed > 24;
    });

    if (stalePending.length > 0) {
      result.push({
        id: `stale-pending-${stalePending.length}`,
        type: "warning",
        title: `${toPersianDigits(stalePending.length)} نوبت در انتظار تأیید`,
        message: `${toPersianDigits(stalePending.length)} نوبت بیش از ۲۴ ساعت است که در انتظار تأیید شما هستند.`,
        time: "الان",
        isRead: false,
      });
    }

    // ==========================================
    // 📌 نوتیفیکیشن ۳: جلسات گذشته که نیاز به ثبت وضعیت دارند
    // ==========================================
    const awaitingConfirm = appointments.filter(
      (a) => getDisplayStatus(a) === "awaiting-confirmation",
    );

    if (awaitingConfirm.length > 0) {
      result.push({
        id: `awaiting-confirm-${awaitingConfirm.length}`,
        type: "reminder",
        title: `${toPersianDigits(awaitingConfirm.length)} جلسه در انتظار ثبت وضعیت`,
        message: `لطفاً وضعیت ${toPersianDigits(awaitingConfirm.length)} جلسه‌ی گذشته را مشخص کنید (برگزار شد / برگزار نشد).`,
        time: "الان",
        isRead: false,
      });
    }

    return result;
  }, [appointments, notifications, currentTime]);

  // ===== تعداد اعلان‌های خوانده نشده (فعلاً ثابت) =====
  // const unreadNotificationsCount = 5; // ← بعداً از state اعلانات میاد

  // ===== تعداد اعلان‌های خوانده نشده =====
  const unreadNotificationsCount = useMemo(() => {
    return derivedNotifications.filter((n) => !n.isRead).length;
  }, [derivedNotifications]);

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
      id: "calendar", // ← جدید
      label: "تقویم",
      icon: <FaCalendarWeek />,
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
    // {
    //   id: "notes",
    //   label: "یادداشت‌ها",
    //   icon: <FaStickyNote />,
    // },
    {
      id: "messages",
      label: "اعلان‌ها",
      icon: <FaCommentDots />,
      badge:
        unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    {
      id: "financial", // ← جدید
      label: "مالی",
      icon: <FaMoneyBillWave />,
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
      case "sessions":
        return (
          <SessionsManagement
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );
      // case "patients":
      //   return <PatientsList />;
      // case "patients":
      //   return (
      //     <PatientsList
      //       appointments={appointments}
      //       setAppointments={setAppointments}
      //     />
      //   );
      case "calendar":
        return <CalendarView appointments={appointments} />;
      case "patients":
        return (
          <PatientsList
            patients={patients}
            setPatients={setPatients}
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );
      // case "exercises":
      //   return <ExercisesManagement />;
      case "exercises":
        return (
          <ExercisesManagement
            patients={patients}
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );
      // case "notes":
      //   return <PatientNotes />;
      case "messages":
        return (
          <DoctorMessages
            notifications={derivedNotifications}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
          />
        );
      case "financial":
        return (
          <FinancialView
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );
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

          {/* <div className={styles.headerRight}>
            <button className={styles.notificationBtn}>
              <FaBell />
              <span className={styles.notificationDot}></span>
            </button>
          </div> */}
          <div className={styles.headerRight}>
            <button
              className={styles.notificationBtn}
              onClick={() => setActiveTab("messages")}
              title="مشاهده اعلان‌ها"
            >
              <FaBell />
              {unreadNotificationsCount > 0 && (
                <span className={styles.notificationDot}>
                  {toPersianDigits(unreadNotificationsCount)}
                </span>
              )}
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
function AppointmentsManagement({ appointments, setAppointments }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ===== استیت فرم افزودن نوبت =====
  // const [newAppointment, setNewAppointment] = useState({
  //   patient: "",
  //   date: "",
  //   time: "",
  //   typeKey: "individual",
  //   status: "pending",
  // });
  // ===== استیت فرم افزودن نوبت =====
  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    date: null, // ← حالا یه DateObject هست، نه string
    startTime: "",
    endTime: "",
    typeKey: "individual",
    status: "pending",
  });

  // ==========================================
  // مشتق‌ها
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
  // توابع
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

  // ===== لغو نوبت توسط روانشناس =====
  const handleDoctorCancel = (app) => {
    if (
      window.confirm(
        `آیا از لغو جلسه ${app.patient} اطمینان دارید؟ این عمل قابل بازگشت نیست.`,
      )
    ) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === app.id
            ? {
                ...item,
                status: "cancelled",
                cancelledBy: "doctor",
                cancelReason: "لغو توسط روانشناس",
              }
            : item,
        ),
      );
      alert(`جلسه ${app.patient} با موفقیت لغو شد.`);
    }
  };

  // ===== محاسبه دقیقه از ساعت =====
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const clean = toEnglishDigits(timeStr.trim());
    const parts = clean.split(":");
    if (parts.length !== 2) return -1;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return -1;
    if (h < 0 || h > 23 || m < 0 || m > 59) return -1;
    return h * 60 + m;
  };

  // ===== افزودن نوبت جدید =====
  const handleAddAppointment = () => {
    // ===== اعتبارسنجی =====
    if (!newAppointment.patient.trim()) {
      alert("لطفاً نام بیمار را وارد کنید.");
      return;
    }
    if (!newAppointment.date) {
      alert("لطفاً تاریخ را انتخاب کنید.");
      return;
    }
    if (!newAppointment.startTime.trim()) {
      alert("لطفاً ساعت شروع را وارد کنید.");
      return;
    }
    if (!newAppointment.endTime.trim()) {
      alert("لطفاً ساعت پایان را وارد کنید.");
      return;
    }

    // ===== اعتبارسنجی ساعت‌ها =====
    const startMinutes = timeToMinutes(newAppointment.startTime);
    const endMinutes = timeToMinutes(newAppointment.endTime);

    if (startMinutes === -1) {
      alert("ساعت شروع نامعتبر است. فرمت صحیح: مثلاً ۱۰:۰۰");
      return;
    }
    if (endMinutes === -1) {
      alert("ساعت پایان نامعتبر است. فرمت صحیح: مثلاً ۱۱:۰۰");
      return;
    }

    const diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 60) {
      alert("ساعت پایان باید حداقل ۱ ساعت بعد از ساعت شروع باشد.");
      return;
    }

    // ===== ساخت hours array =====
    const hours = [];
    for (let m = startMinutes; m < endMinutes; m += 60) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      hours.push(
        `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      );
    }

    // ===== ساخت time string =====
    const timeString = `${newAppointment.startTime.trim()} - ${newAppointment.endTime.trim()}`;

    // ===== محاسبه duration (به ساعت) =====
    const durationHours = diffMinutes / 60;

    // ===== تاریخ شمسی به string =====
    const persianDate = newAppointment.date.format("YYYY/MM/DD");

    // ===== ساخت آبجکت نهایی =====
    const newId = Math.max(...appointments.map((a) => a.id), 0) + 1;

    // ===== محاسبه قیمت بر اساس pricePerHour =====
    const pricePerHour = seedData.doctorProfile.pricePerHour || 0;
    const finalPrice = pricePerHour * durationHours;

    setAppointments((prev) => [
      ...prev,
      {
        id: newId,
        patientId: null, // ← جدید: هنوز patientId نداریم
        patient: newAppointment.patient,
        patientPhone: "",
        type: getTypeLabel(newAppointment.typeKey),
        typeKey: newAppointment.typeKey,
        date: toPersianDigits(persianDate),
        time: toPersianDigits(timeString),
        hours: hours.map(toPersianDigits),
        startTime: toPersianDigits(newAppointment.startTime.trim()),
        endTime: toPersianDigits(newAppointment.endTime.trim()),
        status: newAppointment.status,
        isOnline: true,
        createdAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
        price: finalPrice, // ← اصلاح شد
        duration: durationHours,
        meetingLink: null,
      },
    ]);

    // setAppointments((prev) => [
    //   ...prev,
    //   {
    //     id: newId,
    //     patient: newAppointment.patient,
    //     patientPhone: "",
    //     type: getTypeLabel(newAppointment.typeKey),
    //     typeKey: newAppointment.typeKey,
    //     date: toPersianDigits(persianDate),
    //     time: toPersianDigits(timeString),
    //     hours: hours.map(toPersianDigits),
    //     startTime: toPersianDigits(newAppointment.startTime.trim()),
    //     endTime: toPersianDigits(newAppointment.endTime.trim()),
    //     status: newAppointment.status,
    //     isOnline: true,
    //     createdAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
    //     price: 0,
    //     duration: durationHours,
    //     meetingLink: null,
    //   },
    // ]);

    // ===== ریست فرم =====
    setNewAppointment({
      patient: "",
      date: null,
      startTime: "",
      endTime: "",
      typeKey: "individual",
      status: "pending",
    });

    setShowAddModal(false);
    alert("نوبت جدید با موفقیت اضافه شد.");
  };

  // ===== فیلتر کردن =====
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
    { id: "not-completed", label: "برگزار نشده" },
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
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => {
            const displayStatus = getDisplayStatus(app);
            const originalStatus = getOriginalStatusInfo(app.status);
            const displayStatusInfo = getDisplayStatusInfo(displayStatus);

            // ===== چک کردن گذشته =====
            const isPast = isFinalizedStatus(displayStatus);

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

                    {app.price && (
                      <div className={styles.appointmentPrice}>
                        {toPersianDigits(app.price.toLocaleString("en-US"))}{" "}
                        تومان
                      </div>
                    )}

                    {app.status === "cancelled" && app.cancelReason && (
                      <div className={styles.cancelReason}>
                        <span>دلیل لغو:</span>
                        <span>{app.cancelReason}</span>
                      </div>
                    )}
                  </div>

                  {/* ===== دکمه‌های اکشن ===== */}
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
                      <>
                        {isMoreThan24HoursAway(app) && (
                          <button
                            className={styles.btnDoctorCancel}
                            onClick={() => handleDoctorCancel(app)}
                          >
                            لغو نوبت{" "}
                          </button>
                        )}

                        {isLessThan24HoursAway(app) && (
                          <button
                            className={styles.btnCancelDisabled}
                            disabled
                            title="کمتر از ۲۴ ساعت تا شروع جلسه باقی مانده"
                          >
                            لغو غیرفعال (کمتر از ۲۴ ساعت)
                          </button>
                        )}
                      </>
                    )}

                    {displayStatus === "ongoing" && (
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
                          className={styles.btnNoShow}
                          onClick={() => handleMarkNoShow(app)}
                        >
                          ✗ برگزار نشد
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ===== هشدار ۴۸ ساعته — تمام عرض زیر کارت ===== */}
                {isAwaitingConfirmation && (
                  <div className={styles.awaitingConfirmationBox}>
                    <div className={styles.awaitingText}>
                      <span className={styles.awaitingTitle}>
                        آیا این جلسه برگزار شده؟
                      </span>
                      <span className={styles.awaitingTime}>
                        ({toPersianDigits(remainingHours)} ساعت فرصت باقی‌مانده)
                      </span>
                    </div>
                  </div>
                )}
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
                    {toPersianDigits(
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
                    {toPersianDigits(
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
                    date: null,
                    startTime: "",
                    endTime: "",
                    typeKey: "individual",
                    status: "pending",
                  });
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* نام بیمار */}
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

              {/* تاریخ */}
              <div className={styles.formGroup}>
                <label>تاریخ</label>
                <DatePicker
                  value={newAppointment.date}
                  onChange={(date) =>
                    setNewAppointment((prev) => ({ ...prev, date }))
                  }
                  calendar={persian}
                  locale={persian_fa}
                  calendarPosition="bottom-right"
                  inputClass={styles.formInput}
                  placeholder="انتخاب تاریخ"
                  format="YYYY/MM/DD"
                  editable={false}
                />
              </div>

              {/* ساعت شروع و پایان */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>ساعت شروع</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="۱۰:۰۰"
                    value={newAppointment.startTime}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    dir="ltr"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>ساعت پایان</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="۱۱:۰۰"
                    value={newAppointment.endTime}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    dir="ltr"
                    style={{ textAlign: "center" }}
                  />
                </div>
              </div>

              <p className={styles.formHint}>
                ⏱ ساعت پایان باید حداقل ۱ ساعت بعد از ساعت شروع باشد.
              </p>

              {/* نوع جلسه و وضعیت */}
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
                    date: null,
                    startTime: "",
                    endTime: "",
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
function SessionsManagement({ appointments, setAppointments }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [timeLeft, setTimeLeft] = useState(null);

  // const [showLinkModal, setShowLinkModal] = useState(false);
  // const [linkInput, setLinkInput] = useState("");
  // const [selectedSessionForLink, setSelectedSessionForLink] = useState(null);

  // ===== State های لینک inline =====
  const [linkInput, setLinkInput] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [selectedSessionForNote, setSelectedSessionForNote] = useState(null);

  // ==========================================
  // مشتق‌ها
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
  // تایمر شمارش معکوس
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
  // توابع
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
      alert("جلسه با موفقیت به پایان رسید.");
    }
  };

  // ===== ذخیره لینک جلسه =====
  const handleSaveMeetingLink = (session) => {
    if (!linkInput.trim()) {
      alert("لطفاً لینک جلسه را وارد کنید.");
      return;
    }

    if (!linkInput.startsWith("http")) {
      alert("لطفاً لینک معتبر وارد کنید (با http یا https).");
      return;
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === session.id
          ? { ...item, meetingLink: linkInput.trim() }
          : item,
      ),
    );

    setLinkInput("");
    setIsEditingLink(false);
    alert("لینک جلسه با موفقیت ذخیره شد.");
  };

  // ===== باز کردن مودال یادداشت =====
  const handleOpenNoteModal = (session) => {
    setSelectedSessionForNote(session);
    setNoteInput(session.sessionNotes?.summary || "");
    setShowNoteModal(true);
  };

  // ===== ذخیره یادداشت =====
  const handleSaveNote = () => {
    if (!noteInput.trim()) {
      alert("لطفاً متن یادداشت را وارد کنید.");
      return;
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedSessionForNote.id
          ? {
              ...item,
              sessionNotes: {
                summary: noteInput.trim(),
                createdAt:
                  item.sessionNotes?.createdAt ||
                  toPersianDigits(moment().format("jYYYY/jMM/jDD")),
                updatedAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
              },
            }
          : item,
      ),
    );

    setShowNoteModal(false);
    setNoteInput("");
    setSelectedSessionForNote(null);
    alert("یادداشت با موفقیت ذخیره شد.");
  };

  // ==========================================
  // رندر
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
          جلسات پیش‌رو
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
          تاریخچه جلسات
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
                {isNextOngoing ? "🔴 در حال برگزاری" : "جلسه بعدی شما"}
              </span>
              <h3>{nextSession.type}</h3>
              <p>با {nextSession.patient}</p>
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
                  {/* {getTypeIcon(nextSession.typeKey)}{" "} */}
                  {getTypeLabel(nextSession.typeKey)}
                </span>
              </div>
            </div>

            <div className={styles.nextSessionActions}>
              {/* ===== بخش لینک ===== */}
              {isEditingLink ? (
                /* حالت ویرایش/افزودن */
                <div className={styles.inlineLinkForm}>
                  <input
                    type="text"
                    className={styles.inlineLinkInput}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    dir="ltr"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveMeetingLink(nextSession);
                      } else if (e.key === "Escape") {
                        setLinkInput("");
                        setIsEditingLink(false);
                      }
                    }}
                  />
                  <button
                    className={styles.btnSaveLink}
                    onClick={() => handleSaveMeetingLink(nextSession)}
                    title="ذخیره"
                  >
                    ✓
                  </button>
                  <button
                    className={styles.btnCancelLink}
                    onClick={() => {
                      setLinkInput("");
                      setIsEditingLink(false);
                    }}
                    title="انصراف"
                  >
                    ✕
                  </button>
                </div>
              ) : nextSession.meetingLink ? (
                /* حالت نمایش لینک ذخیره‌شده */
                <>
                  <div className={styles.meetingLinkDisplay}>
                    <span className={styles.meetingLinkIcon}>🔗</span>
                    <span className={styles.meetingLinkText}>
                      {nextSession.meetingLink.length > 32
                        ? nextSession.meetingLink.slice(0, 32) + "..."
                        : nextSession.meetingLink}
                    </span>
                    <button
                      className={styles.btnEditLink}
                      onClick={() => {
                        setLinkInput(nextSession.meetingLink);
                        setIsEditingLink(true);
                      }}
                      title="ویرایش لینک"
                    >
                      ✏️
                    </button>
                  </div>
                </>
              ) : (
                /* حالت بدون لینک */
                <>
                  <div className={styles.noLinkWarning}>
                    <span>⚠️</span>
                    <span>لینک جلسه تنظیم نشده</span>
                  </div>

                  <button
                    className={styles.btnAddLink}
                    onClick={() => {
                      setLinkInput("");
                      setIsEditingLink(true);
                    }}
                  >
                    + افزودن لینک جلسه
                  </button>
                </>
              )}

              {/* تایمر */}
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
                      {/* <div className={styles.sessionPatientAvatar}>
                        {getTypeIcon(session.typeKey)}
                      </div> */}
                      <div>
                        <h4>{session.patient}</h4>
                        <span className={styles.sessionType}>
                          {session.type}
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

                  {/* ===== ردیف جزئیات + دکمه‌های اکشن ===== */}
                  <div className={styles.sessionFooter}>
                    {/* جزئیات */}
                    <div className={styles.sessionDetails}>
                      <div className={styles.sessionMeta}>
                        <div className={styles.metaGroup}>
                          <span>{session.date}</span>
                        </div>
                        <span>•</span>
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
                          لغو جلسه
                        </button>
                      )}
                    </div>
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
                    {/* <div className={styles.sessionPatientAvatar}>
                      {getTypeIcon(session.typeKey)}
                    </div> */}
                    <div>
                      <h4>{session.patient}</h4>
                      <span className={styles.sessionType}>{session.type}</span>
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
                {/* ===== نمایش یادداشت (اگه وجود داشته باشه) ===== */}
                {session.sessionNotes?.summary && (
                  <div className={styles.sessionNoteDisplay}>
                    <div className={styles.sessionNoteHeader}>
                      <span className={styles.sessionNoteLabel}>
                        خلاصه جلسه
                      </span>
                      <span className={styles.sessionNoteDate}>
                        {session.sessionNotes.updatedAt ||
                          session.sessionNotes.createdAt}
                      </span>
                    </div>
                    <p className={styles.sessionNoteText}>
                      {session.sessionNotes.summary}
                    </p>
                  </div>
                )}

                {/* ===== دکمه‌های اکشن ===== */}
                <div className={styles.sessionActions}>
                  <button className={styles.btnViewRecord}>
                    مشاهده ضبط جلسه
                  </button>
                  <button
                    className={styles.btnNote}
                    onClick={() => handleOpenNoteModal(session)}
                  >
                    {session.sessionNotes?.summary
                      ? "ویرایش یادداشت"
                      : "ثبت یادداشت"}
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

      {/* ===== مودال یادداشت جلسه ===== */}
      {showNoteModal && selectedSessionForNote && (
        <div className={styles.modalOverlay}>
          <div className={styles.noteModal}>
            <div className={styles.modalHeader}>
              <h3>📝 یادداشت جلسه</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteInput("");
                  setSelectedSessionForNote(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.noteSessionInfo}>
                <p>
                  جلسه با <strong>{selectedSessionForNote.patient}</strong>
                </p>
                <span className={styles.noteSessionDate}>
                  {selectedSessionForNote.date} •{" "}
                  {selectedSessionForNote.startTime}
                </span>
              </div>

              <div className={styles.formGroup}>
                <label>خلاصه جلسه:</label>
                <textarea
                  className={styles.noteTextarea}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="خلاصه‌ای از مباحث مطرح شده، وضعیت بیمار، پیشرفت‌ها و توصیه‌های جلسه..."
                  rows="8"
                  maxLength="2000"
                />
                <span className={styles.noteCharCount}>
                  {toPersianDigits(noteInput.length)} / ۲۰۰۰
                </span>
              </div>

              <p className={styles.noteHint}>
                این یادداشت در پرونده‌ی بیمار ذخیره خواهد شد و فقط برای شما قابل
                مشاهده است.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteInput("");
                  setSelectedSessionForNote(null);
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={handleSaveNote}
              >
                ذخیره یادداشت
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== مودال تنظیم لینک جلسه ===== */}
      {/* {showLinkModal && selectedSessionForLink && (
        <div className={styles.modalOverlay}>
          <div className={styles.linkModal}>
            <div className={styles.modalHeader}>
              <h3>تنظیم لینک جلسه</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkInput("");
                  setSelectedSessionForLink(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.linkModalInfo}>
                جلسه با <strong>{selectedSessionForLink.patient}</strong>
              </p>

              <div className={styles.formGroup}>
                <label>لینک جلسه (Google Meet، Zoom، ...)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  dir="ltr"
                  autoFocus
                />
              </div>

              <p className={styles.linkModalHint}>
                💡 این لینک فقط در زمان برگزاری جلسه برای بیمار فعال می‌شود.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkInput("");
                  setSelectedSessionForLink(null);
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={handleSaveMeetingLink}
              >
                ذخیره لینک
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

// ============================================
// COMPONENT: Patients List
// ============================================
// function PatientsList() {
//   const patients = [
//     {
//       id: 1,
//       name: "محمد کریمی",
//       phone: "۹۱۲۳۴۵۶۷۸۹",
//       sessions: 8,
//       lastVisit: "۱۴۰۵/۰۶/۰۳",
//     },
//     {
//       id: 2,
//       name: "زهرا احمدی",
//       phone: "۹۱۳۴۵۶۷۸۹۰",
//       sessions: 5,
//       lastVisit: "۱۴۰۵/۰۵/۲۸",
//     },
//     {
//       id: 3,
//       name: "علی رضایی",
//       phone: "۹۱۴۵۶۷۸۹۰۱",
//       sessions: 12,
//       lastVisit: "۱۴۰۵/۰۶/۰۱",
//     },
//   ];

//   return (
//     <div className={styles.pageContent}>
//       <div className={styles.pageHeader}>
//         <div className={styles.headerInfo}>
//           <h2>👤 بیماران من</h2>
//           <p>لیست بیماران و پرونده‌های آنها</p>
//         </div>
//         <button className={styles.newBtn}>
//           <FaPlus /> افزودن بیمار
//         </button>
//       </div>

//       <div className={styles.patientsList}>
//         {patients.map((patient) => (
//           <div key={patient.id} className={styles.patientCard}>
//             <div className={styles.patientAvatar}>👤</div>
//             <div className={styles.patientInfo}>
//               <h4>{patient.name}</h4>
//               <p>{patient.phone}</p>
//               <div className={styles.patientStats}>
//                 <span>📅 {patient.sessions} جلسه</span>
//                 <span>📋 آخرین مراجعه: {patient.lastVisit}</span>
//               </div>
//             </div>
//             <div className={styles.patientActions}>
//               <button className={styles.btnView}>مشاهده پرونده</button>
//               <button className={styles.btnMessage}>💬</button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// ============================================
// COMPONENT: Calendar View (Weekly)
// ============================================
function CalendarView({ appointments }) {
  // ===== State ها =====
  const [weekOffset, setWeekOffset] = useState(0); // 0 = این هفته
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // ===== ساعت‌های تقویم (۸:۰۰ تا ۲۱:۳۰) =====
  const CALENDAR_HOURS = useMemo(() => {
    const hours = [];
    for (let h = 8; h <= 21; h++) {
      hours.push(`${String(h).padStart(2, "0")}:۰۰`);
      hours.push(`${String(h).padStart(2, "0")}:۳۰`);
    }
    return hours;
  }, []);

  // ===== روزهای هفته =====
  // const weekDays = useMemo(() => {
  //   const todayJalali = moment().format("jYYYY/jMM/jDD");
  //   const [y, m, d] = toEnglishDigits(todayJalali).split("/").map(Number);

  //   const todayDate = moment(`${y}/${m}/${d}`, "jYYYY/jMM/jDD");

  //   // ===== تبدیل روز هفته میلادی به ترتیب ایرانی =====
  //   const gregorianDayOfWeek = todayDate.day();
  //   const persianDayOfWeek =
  //     gregorianDayOfWeek === 6 ? 0 : gregorianDayOfWeek + 1;

  //   // ===== پیدا کردن شنبه این هفته =====
  //   const saturday = todayDate.clone().subtract(persianDayOfWeek, "days");

  //   // ===== اعمال weekOffset =====
  //   const targetSaturday = saturday.clone().add(weekOffset, "weeks");

  //   // ===== ساخت ۷ روز =====
  //   const days = [];
  //   const dayNames = [
  //     "شنبه",
  //     "یکشنبه",
  //     "دوشنبه",
  //     "سه‌شنبه",
  //     "چهارشنبه",
  //     "پنجشنبه",
  //     "جمعه",
  //   ];

  //   for (let i = 0; i < 7; i++) {
  //     const date = targetSaturday.clone().add(i, "days");
  //     days.push({
  //       dayName: dayNames[i],
  //       date: date.format("jYYYY/jMM/jDD"),
  //       dayOfMonth: toPersianDigits(date.format("jDD")),
  //       month: toPersianDigits(date.format("jMM")),
  //       dateObject: date,
  //       isToday: date.isSame(todayDate, "day"),
  //     });
  //   }

  //   return days;
  // }, [weekOffset]);

  // ===== روزهای هفته =====
  const weekDays = useMemo(() => {
    const todayJalali = moment().format("jYYYY/jMM/jDD");
    const [y, m, d] = toEnglishDigits(todayJalali).split("/").map(Number);

    const todayDate = moment(`${y}/${m}/${d}`, "jYYYY/jMM/jDD");

    // ===== تبدیل روز هفته میلادی به ترتیب ایرانی =====
    const gregorianDayOfWeek = todayDate.day();
    const persianDayOfWeek =
      gregorianDayOfWeek === 6 ? 0 : gregorianDayOfWeek + 1;

    // ===== پیدا کردن شنبه این هفته =====
    const saturday = todayDate.clone().subtract(persianDayOfWeek, "days");

    // ===== اعمال weekOffset =====
    const targetSaturday = saturday.clone().add(weekOffset, "weeks");

    // ===== ساخت ۷ روز =====
    const days = [];
    const dayNames = [
      "شنبه",
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنجشنبه",
      "جمعه",
    ];

    for (let i = 0; i < 7; i++) {
      const date = targetSaturday.clone().add(i, "days");
      days.push({
        dayName: dayNames[i],
        date: date.format("jYYYY/jMM/jDD"), // ← انگلیسی
        datePersian: toPersianDigits(date.format("jYYYY/jMM/jDD")), // ← جدید: فارسی
        dayOfMonth: toPersianDigits(date.format("jDD")),
        month: toPersianDigits(date.format("jMM")),
        dateObject: date,
        isToday: date.isSame(todayDate, "day"),
      });
    }

    return days;
  }, [weekOffset]);

  // ===== بازه‌ی نمایش هفته =====
  // const weekRangeLabel = useMemo(() => {
  //   if (weekDays.length === 0) return "";
  //   const first = weekDays[0];
  //   const last = weekDays[6];
  //   return `${first.dayOfMonth} ${moment(first.date, "jYYYY/jMM/jDD").format("jMMMM")} تا ${last.dayOfMonth} ${moment(last.date, "jYYYY/jMM/jDD").format("jMMMM")} ${moment(first.date, "jYYYY/jMM/jDD").format("jYYYY")}`;
  // }, [weekDays]);

  // ===== بازه‌ی نمایش هفته =====
  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return "";
    const first = weekDays[0];
    const last = weekDays[6];
    return `${first.dayOfMonth} ${first.dateObject.format("jMMMM")} تا ${last.dayOfMonth} ${last.dateObject.format("jMMMM")} ${first.dateObject.format("jYYYY")}`;
  }, [weekDays]);

  // ===== جلسات به تفکیک روز =====
  // const appointmentsByDay = useMemo(() => {
  //   const map = {};

  //   weekDays.forEach((day) => {
  //     map[day.date] = appointments.filter((a) => a.date === day.date);
  //   });

  //   return map;
  // }, [appointments, weekDays]);

  // ===== جلسات به تفکیک روز =====
  const appointmentsByDay = useMemo(() => {
    const map = {};

    weekDays.forEach((day) => {
      // ← از datePersian استفاده کن (چون appointments با اعداد فارسی ذخیره شدن)
      map[day.datePersian] = appointments.filter(
        (a) => toPersianDigits(a.date) === day.datePersian,
      );
    });

    return map;
  }, [appointments, weekDays]);

  // ===== گرفتن رنگ بر اساس وضعیت =====
  const getStatusColorClass = (appointment) => {
    const displayStatus = getDisplayStatus(appointment);

    if (displayStatus === "cancelled" || displayStatus === "no-show") {
      return styles.calendarCellCancelled;
    }
    if (displayStatus === "completed") {
      return styles.calendarCellCompleted;
    }
    if (displayStatus === "pending") {
      return styles.calendarCellPending;
    }
    // confirmed یا ongoing یا awaiting-confirmation
    return styles.calendarCellConfirmed;
  };

  // ===== گرفتن جلسه‌ی یه سلول خاص =====
  // const getCellAppointment = (date, hour) => {
  //   const dayAppointments = appointmentsByDay[date] || [];

  //   // ===== تبدیل hour به دقیقه =====
  //   const [h, m] = toEnglishDigits(hour).split(":").map(Number);
  //   const cellMinutes = h * 60 + m;

  //   return dayAppointments.find((app) => {
  //     const startTime = toEnglishDigits(
  //       app.startTime || app.time.split(" - ")[0],
  //     );
  //     const endTime = toEnglishDigits(app.endTime || app.time.split(" - ")[1]);

  //     const [startH, startM] = startTime.split(":").map(Number);
  //     const [endH, endM] = endTime.split(":").map(Number);

  //     const startMinutes = startH * 60 + startM;
  //     const endMinutes = endH * 60 + endM;

  //     return cellMinutes >= startMinutes && cellMinutes < endMinutes;
  //   });
  // };

  // ===== چک کردن اینکه این سلول شروع یه جلسه‌ست =====
  // const isCellStart = (appointment, hour) => {
  //   if (!appointment) return false;
  //   const startTime = toEnglishDigits(
  //     appointment.startTime || appointment.time.split(" - ")[0],
  //   );
  //   const [h, m] = toEnglishDigits(hour).split(":").map(Number);
  //   const cellMinutes = h * 60 + m;
  //   const [startH, startM] = startTime.split(":").map(Number);
  //   const startMinutes = startH * 60 + startM;
  //   return cellMinutes === startMinutes;
  // };

  // ===== چک کردن اینکه جلسه چند سلول طول می‌کشه =====
  // const getAppointmentSpan = (appointment) => {
  //   if (!appointment) return 1;

  //   const startTime = toEnglishDigits(
  //     appointment.startTime || appointment.time.split(" - ")[0],
  //   );
  //   const endTime = toEnglishDigits(
  //     appointment.endTime || appointment.time.split(" - ")[1],
  //   );

  //   const [startH, startM] = startTime.split(":").map(Number);
  //   const [endH, endM] = endTime.split(":").map(Number);

  //   const startMinutes = startH * 60 + startM;
  //   const endMinutes = endH * 60 + endM;

  //   return (endMinutes - startMinutes) / 30; // هر سلول ۳۰ دقیقه
  // };

  // ===== محاسبه‌ی position جلسه در ستون روز =====
  const getEventPosition = (appointment) => {
    const CALENDAR_START_HOUR = 8; // ۸:۰۰ صبح
    const SLOT_HEIGHT = 30; // هر ۳۰ دقیقه = 30px

    // ===== گرفتن ساعت شروع و پایان =====
    const startTime = toEnglishDigits(
      appointment.startTime || appointment.time.split(" - ")[0],
    );
    const endTime = toEnglishDigits(
      appointment.endTime || appointment.time.split(" - ")[1],
    );

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    if (isNaN(startH) || isNaN(endH)) return { top: null, height: 0 };

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const calendarStartMinutes = CALENDAR_START_HOUR * 60; // ۴۸۰

    // ===== اگه جلسه قبل از ۸ صبح باشه، از ۸ شروع کن =====
    const effectiveStart = Math.max(startMinutes, calendarStartMinutes);

    // ===== محاسبه‌ی top (نسبت به ۸:۰۰) =====
    const minutesFromStart = effectiveStart - calendarStartMinutes;
    const top = (minutesFromStart / 30) * SLOT_HEIGHT;

    // ===== محاسبه‌ی ارتفاع =====
    const durationMinutes = endMinutes - effectiveStart;
    const height = (durationMinutes / 30) * SLOT_HEIGHT - 2; // ← منهای ۲ برای gap

    return { top, height };
  };

  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>📅 تقویم من</h2>
          <p>نمای کلی جلسات هفتگی</p>
        </div>

        {/* ناوبری هفته */}
        <div className={styles.calendarNav}>
          <button
            className={styles.calendarNavBtn}
            onClick={() => setWeekOffset(weekOffset - 1)}
            title="هفته قبل"
          >
            ›
          </button>

          <span className={styles.calendarWeekLabel}>{weekRangeLabel}</span>

          <button
            className={styles.calendarNavBtn}
            onClick={() => setWeekOffset(weekOffset + 1)}
            title="هفته بعد"
          >
            ‹
          </button>

          {weekOffset !== 0 && (
            <button
              className={styles.calendarTodayBtn}
              onClick={() => setWeekOffset(0)}
            >
              امروز
            </button>
          )}
        </div>
      </div>

      {/* ===== راهنما ===== */}
      <div className={styles.calendarHint}>
        <span className={styles.calendarHintIcon}>💡</span>
        <p>
          برای مدیریت نوبت‌ها (تأیید، لغو، افزودن) به بخش{" "}
          <strong>«نوبت‌ها»</strong> بروید.
        </p>
      </div>

      {/* ===== راهنمای رنگ‌ها ===== */}
      <div className={styles.calendarLegend}>
        <span className={styles.calendarLegendItem}>
          <span
            className={`${styles.legendDot} ${styles.legendConfirmed}`}
          ></span>
          تأیید شده
        </span>
        <span className={styles.calendarLegendItem}>
          <span
            className={`${styles.legendDot} ${styles.legendPending}`}
          ></span>
          در انتظار
        </span>
        <span className={styles.calendarLegendItem}>
          <span
            className={`${styles.legendDot} ${styles.legendCompleted}`}
          ></span>
          برگزار شده
        </span>
        <span className={styles.calendarLegendItem}>
          <span
            className={`${styles.legendDot} ${styles.legendCancelled}`}
          ></span>
          لغو شده / برگزار نشده
        </span>
      </div>

      {/* ===== گرید تقویم ===== */}
      {/* <div className={styles.calendarWrapper}>
        <div className={styles.calendarGrid}>
          <div className={styles.calendarHeaderRow}>
            <div className={styles.calendarTimeHeader}></div>

            {weekDays.map((day) => (
              <div
                key={day.date}
                className={`${styles.calendarDayHeader} ${
                  day.isToday ? styles.calendarDayHeaderToday : ""
                }`}
              >
                <span className={styles.calendarDayName}>{day.dayName}</span>
                <span className={styles.calendarDayDate}>{day.dayOfMonth}</span>
              </div>
            ))}
          </div>

          <div className={styles.calendarBody}>
            <div className={styles.calendarTimeColumn}>
              {CALENDAR_HOURS.map((hour) => (
                <div key={hour} className={styles.calendarTimeCell}>
                  {hour.endsWith(":۰۰") ? hour : ""}
                </div>
              ))}
            </div>

            <div className={styles.calendarDaysColumns}>
              {weekDays.map((day) => (
                <div key={day.date} className={styles.calendarDayColumn}>
                  {CALENDAR_HOURS.map((hour, hourIndex) => {
                    const appointment = getCellAppointment(day.date, hour);
                    const isStart = isCellStart(appointment, hour);
                    const span = getAppointmentSpan(appointment);
                    const colorClass = appointment
                      ? getStatusColorClass(appointment)
                      : "";

                    if (appointment && !isStart) {
                      const prevHour =
                        hourIndex > 0 ? CALENDAR_HOURS[hourIndex - 1] : null;
                      const prevAppointment = prevHour
                        ? getCellAppointment(day.date, prevHour)
                        : null;

                      if (prevAppointment?.id === appointment.id) {
                        return null; // این سلول جزئی از جلسه‌ی بالاییه
                      }
                    }

                    return (
                      <div
                        key={hour}
                        className={`${styles.calendarCell} ${
                          appointment ? colorClass : styles.calendarCellEmpty
                        }`}
                        style={
                          appointment && isStart
                            ? { gridRow: `span ${span}` }
                            : {}
                        }
                        onClick={() =>
                          appointment && setSelectedAppointment(appointment)
                        }
                      >
                        {appointment && isStart && (
                          <div className={styles.calendarCellContent}>
                            <span className={styles.calendarCellPatient}>
                              {appointment.patient}
                            </span>
                            <span className={styles.calendarCellTime}>
                              {toPersianDigits(
                                appointment.startTime ||
                                  appointment.time.split(" - ")[0],
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> */}

      {/* ===== گرید تقویم ===== */}
      <div className={styles.calendarWrapper}>
        <div className={styles.calendarGrid}>
          {/* ===== ردیف هدر (روزها) ===== */}
          <div className={styles.calendarHeaderRow}>
            <div className={styles.calendarTimeHeader}></div>
            {weekDays.map((day) => (
              <div
                key={day.date}
                className={`${styles.calendarDayHeader} ${
                  day.isToday ? styles.calendarDayHeaderToday : ""
                }`}
              >
                <span className={styles.calendarDayName}>{day.dayName}</span>
                <span className={styles.calendarDayDate}>{day.dayOfMonth}</span>
              </div>
            ))}
          </div>

          {/* ===== بدنه‌ی تقویم ===== */}
          <div className={styles.calendarBody}>
            {/* ستون ساعت‌ها */}
            <div className={styles.calendarTimeColumn}>
              {CALENDAR_HOURS.map((hour) => (
                <div key={hour} className={styles.calendarTimeCell}>
                  {hour.endsWith(":۰۰") ? hour : ""}
                </div>
              ))}
            </div>

            {/* ستون‌های روزها */}
            <div className={styles.calendarDaysColumns}>
              {weekDays.map((day) => (
                <div key={day.date} className={styles.calendarDayColumn}>
                  {/* لایه‌ی پس‌زمینه (۲۸ سلول خالی) */}
                  <div className={styles.calendarDayBg}>
                    {CALENDAR_HOURS.map((hour) => (
                      <div key={hour} className={styles.calendarBgCell} />
                    ))}
                  </div>

                  {/* لایه‌ی جلسات */}
                  {/* <div className={styles.calendarDayEvents}> */}
                    {/* {(appointmentsByDay[day.date] || []).map((appointment) => {
                      const { top, height } = getEventPosition(appointment);
                      if (top === null) return null;

                      const colorClass = getStatusColorClass(appointment);

                      return (
                        <div
                          key={appointment.id}
                          className={`${styles.calendarEvent} ${colorClass}`}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          onClick={() => setSelectedAppointment(appointment)}
                        >
                          <span className={styles.calendarEventPatient}>
                            {appointment.patient}
                          </span>
                          <span className={styles.calendarEventTime}>
                            {toPersianDigits(
                              appointment.startTime ||
                                appointment.time.split(" - ")[0],
                            )}
                          </span>
                        </div>
                      );
                    })} */}
                    {/* لایه‌ی جلسات */}
                    <div className={styles.calendarDayEvents}>
                      {(appointmentsByDay[day.datePersian] || []).map(
                        (appointment) => {
                          const { top, height } = getEventPosition(appointment);
                          if (top === null) return null;

                          const colorClass = getStatusColorClass(appointment);

                          return (
                            <div
                              key={appointment.id}
                              className={`${styles.calendarEvent} ${colorClass}`}
                              style={{ top: `${top}px`, height: `${height}px` }}
                              onClick={() =>
                                setSelectedAppointment(appointment)
                              }
                            >
                              <span className={styles.calendarEventPatient}>
                                {appointment.patient}
                              </span>
                              <span className={styles.calendarEventTime}>
                                {toPersianDigits(
                                  appointment.startTime ||
                                    appointment.time.split(" - ")[0],
                                )}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                // </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== مودال جزئیات جلسه ===== */}
      {selectedAppointment && (
        <CalendarAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}

// ============================================
// COMPONENT: Calendar Appointment Modal
// ============================================
function CalendarAppointmentModal({ appointment, onClose }) {
  const displayStatus = getDisplayStatus(appointment);
  const statusInfo = getDisplayStatusInfo(displayStatus);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.calendarAppointmentModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>جزئیات جلسه</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.calendarModalRow}>
            <span className={styles.calendarModalLabel}>بیمار:</span>
            <span className={styles.calendarModalValue}>
              {appointment.patient}
            </span>
          </div>

          <div className={styles.calendarModalRow}>
            <span className={styles.calendarModalLabel}>نوع جلسه:</span>
            <span className={styles.calendarModalValue}>
              {appointment.type}
            </span>
          </div>

          <div className={styles.calendarModalRow}>
            <span className={styles.calendarModalLabel}>تاریخ:</span>
            <span className={styles.calendarModalValue}>
              {appointment.date}
            </span>
          </div>

          <div className={styles.calendarModalRow}>
            <span className={styles.calendarModalLabel}>ساعت:</span>
            <span className={styles.calendarModalValue}>
              {toPersianDigits(
                appointment.startTime || appointment.time.split(" - ")[0],
              )}{" "}
              -{" "}
              {toPersianDigits(
                appointment.endTime || appointment.time.split(" - ")[1],
              )}
            </span>
          </div>

          <div className={styles.calendarModalRow}>
            <span className={styles.calendarModalLabel}>وضعیت:</span>
            <span
              className={`${styles.calendarModalStatus} ${
                displayStatus === "confirmed"
                  ? styles.statusConfirmed
                  : displayStatus === "pending"
                    ? styles.statusPending
                    : displayStatus === "completed"
                      ? styles.statusCompleted
                      : styles.statusCancelled
              }`}
            >
              {statusInfo.label}
            </span>
          </div>

          {appointment.isOnline && (
            <div className={styles.calendarModalRow}>
              <span className={styles.calendarModalLabel}>نوع برگزاری:</span>
              <span className={styles.calendarModalValue}>جلسه آنلاین</span>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancelModal} onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Patients List (Split View)
// ============================================
// function PatientsList({ appointments, setAppointments }) {
function PatientsList({
  patients,
  setPatients,
  appointments,
  setAppointments,
}) {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // info | sessions | notes | general

  // ===== State های مودال یادداشت =====
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [selectedAppointmentForNote, setSelectedAppointmentForNote] =
    useState(null);

  // const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);

  const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);

  const [generalNotesInput, setGeneralNotesInput] = useState("");

  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: null,
    endDate: null,
    prescribedBy: "",
    notes: "",
    status: "active",
  });

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientForm, setPatientForm] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "male",
    birthDate: "",
    address: "",
    emergencyContact: "",
    emergencyRelation: "",
  });

  // ==========================================
  // مشتق‌ها
  // ==========================================

  // ===== لیست بیماران فیلترشده =====
  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // return seedData.doctorPatients.filter((p) => {
    return patients.filter((p) => {
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.phone.includes(query) ||
        p.email?.toLowerCase().includes(query)
      );
    });
  }, [patients, searchQuery]);

  // ===== بیمار انتخاب‌شده =====
  // const selectedPatient = useMemo(() => {
  //   if (!selectedPatientId) return null;
  //   return seedData.doctorPatients.find((p) => p.id === selectedPatientId);
  // }, [selectedPatientId]);

  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  // ===== نوبت‌های بیمار انتخاب‌شده =====
  const patientAppointments = useMemo(() => {
    if (!selectedPatient) return [];
    return appointments
      .filter((a) => a.patientId === selectedPatient.id)
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentB - momentA; // جدیدترین اول
      });
  }, [appointments, selectedPatient]);

  // ===== آمار بیمار =====
  const patientStats = useMemo(() => {
    if (!selectedPatient) {
      return { total: 0, completed: 0, cancelled: 0, noShow: 0 };
    }

    const completed = patientAppointments.filter(
      (a) => getDisplayStatus(a) === "completed",
    ).length;

    const cancelled = patientAppointments.filter(
      (a) => getDisplayStatus(a) === "cancelled",
    ).length;

    const noShow = patientAppointments.filter(
      (a) => getDisplayStatus(a) === "no-show",
    ).length;

    return {
      total: patientAppointments.length,
      completed,
      cancelled,
      noShow,
    };
  }, [patientAppointments]);

  // ===== یادداشت‌های بیمار (از جلسات) =====
  const patientSessionNotes = useMemo(() => {
    return patientAppointments.filter((a) => a.sessionNotes?.summary);
  }, [patientAppointments]);

  // ==========================================
  // توابع
  // ==========================================

  // ===== انتخاب بیمار =====
  // const handleSelectPatient = (patientId) => {
  //   setSelectedPatientId(patientId);
  //   setActiveTab("info");
  // };

  // const handleSelectPatient = (patientId) => {
  //   setSelectedPatientId(patientId);
  //   setActiveTab("info");
  //   setExpandedAppointmentId(null); // ← جدید
  // };

  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setActiveTab("info");
    setExpandedAppointmentId(null);
  };

  // ===== بستن پرونده (موبایل) =====
  const handleCloseRecord = () => {
    setSelectedPatientId(null);
  };

  // ===== باز کردن مودال یادداشت =====
  const handleOpenNoteModal = (appointment) => {
    setSelectedAppointmentForNote(appointment);
    setNoteInput(appointment.sessionNotes?.summary || "");
    setShowNoteModal(true);
  };

  // ===== ذخیره یادداشت =====
  const handleSaveNote = () => {
    if (!noteInput.trim()) {
      alert("لطفاً متن یادداشت را وارد کنید.");
      return;
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedAppointmentForNote.id
          ? {
              ...item,
              sessionNotes: {
                summary: noteInput.trim(),
                createdAt:
                  item.sessionNotes?.createdAt ||
                  toPersianDigits(moment().format("jYYYY/jMM/jDD")),
                updatedAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
              },
            }
          : item,
      ),
    );

    setShowNoteModal(false);
    setNoteInput("");
    setSelectedAppointmentForNote(null);
    alert("یادداشت با موفقیت ذخیره شد.");
  };

  // ===== ذخیره توضیحات کلی =====
  const handleSaveGeneralNotes = () => {
    if (!selectedPatient) return;

    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              doctorNotes: generalNotesInput.trim(),
              doctorNotesUpdatedAt: toPersianDigits(
                moment().format("jYYYY/jMM/jDD"),
              ),
            }
          : p,
      ),
    );

    alert("توضیحات با موفقیت ذخیره شد.");
  };

  // ===== وقتی بیمار عوض میشه، مقدار textarea رو ست کن =====
  useEffect(() => {
    if (selectedPatient) {
      setGeneralNotesInput(selectedPatient.doctorNotes || "");
    } else {
      setGeneralNotesInput("");
    }
  }, [selectedPatient]);

  const handleOpenMedicationModal = () => {
    setMedicationForm({
      name: "",
      dosage: "",
      frequency: "",
      startDate: null,
      endDate: null,
      prescribedBy: seedData.doctorProfile.name, // ← پیش‌فرض
      notes: "",
      status: "active",
    });
    setShowMedicationModal(true);
  };

  const handleSaveMedication = () => {
    if (!selectedPatient) return;

    // اعتبارسنجی
    if (!medicationForm.name.trim()) {
      alert("لطفاً نام دارو را وارد کنید.");
      return;
    }
    if (!medicationForm.dosage.trim()) {
      alert("لطفاً دوز دارو را وارد کنید.");
      return;
    }
    if (!medicationForm.frequency.trim()) {
      alert("لطفاً نحوه‌ی مصرف را وارد کنید.");
      return;
    }
    if (!medicationForm.startDate) {
      alert("لطفاً تاریخ شروع را انتخاب کنید.");
      return;
    }
    if (!medicationForm.prescribedBy.trim()) {
      alert("لطفاً نام تجویزکننده را وارد کنید.");
      return;
    }

    // ===== ساخت آبجکت دارو =====
    const currentMeds = selectedPatient.medications || [];
    const newId =
      currentMeds.length > 0
        ? Math.max(...currentMeds.map((m) => m.id)) + 1
        : 1;

    const newMedication = {
      id: newId,
      name: medicationForm.name.trim(),
      dosage: medicationForm.dosage.trim(),
      frequency: medicationForm.frequency.trim(),
      startDate: toPersianDigits(medicationForm.startDate.format("YYYY/MM/DD")),
      endDate: medicationForm.endDate
        ? toPersianDigits(medicationForm.endDate.format("YYYY/MM/DD"))
        : null,
      prescribedBy: medicationForm.prescribedBy.trim(),
      notes: medicationForm.notes.trim(),
      status: medicationForm.status,
    };

    // ===== آپدیت patient =====
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              medications: [...(p.medications || []), newMedication],
            }
          : p,
      ),
    );

    setShowMedicationModal(false);
    alert("دارو با موفقیت اضافه شد.");
  };

  const handleOpenPatientModal = () => {
    setPatientForm({
      name: "",
      phone: "",
      email: "",
      gender: "male",
      birthDate: "",
      address: "",
      emergencyContact: "",
      emergencyRelation: "",
    });
    setShowPatientModal(true);
  };

  const handleSavePatient = () => {
    // اعتبارسنجی
    if (!patientForm.name.trim()) {
      alert("لطفاً نام بیمار را وارد کنید.");
      return;
    }
    if (!patientForm.phone.trim()) {
      alert("لطفاً شماره تماس را وارد کنید.");
      return;
    }

    // ===== id جدید =====
    const maxId =
      patients.length > 0 ? Math.max(...patients.map((p) => p.id)) : 100;
    const newId = maxId + 1;

    const newPatient = {
      id: newId,
      name: patientForm.name.trim(),
      phone: patientForm.phone.trim(),
      email: patientForm.email.trim(),
      gender: patientForm.gender,
      birthDate: patientForm.birthDate.trim(),
      joinDate: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
      status: "active",
      emergencyContact: patientForm.emergencyContact.trim(),
      emergencyRelation: patientForm.emergencyRelation.trim(),
      address: patientForm.address.trim(),
      doctorNotes: "",
      doctorNotesUpdatedAt: null,
      medications: [],
    };

    setPatients((prev) => [...prev, newPatient]);
    setShowPatientModal(false);
    alert(`بیمار ${newPatient.name} با موفقیت اضافه شد.`);
  };

  // ==========================================
  // رندر تب‌ها
  // ==========================================

  // const tabs = [
  //   { id: "info", label: "اطلاعات فردی", icon: "📋" },
  //   { id: "sessions", label: "تاریخچه جلسات", icon: "📅" },
  //   { id: "notes", label: "یادداشت‌ها", icon: "📝" },
  //   { id: "general", label: "توضیحات کلی", icon: "📌" },
  // ];

  const tabs = [
    { id: "info", label: "اطلاعات فردی", icon: "📋" },
    { id: "medications", label: "تاریخچه دارویی", icon: "💊" }, // ← جدید
    { id: "sessions", label: "تاریخچه جلسات", icon: "📅" },
    { id: "notes", label: "یادداشت‌ها و تمارین", icon: "📝" },
    { id: "general", label: "توضیحات کلی", icon: "📌" },
  ];

  // ==========================================
  // رندر
  // ==========================================
  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>👤 بیماران من</h2>
          <p>لیست بیماران و پرونده‌های آنها</p>
        </div>
        {/* <button className={styles.newBtn}>
          <FaPlus /> افزودن بیمار
        </button> */}
        <button className={styles.newBtn} onClick={handleOpenPatientModal}>
          <FaPlus /> افزودن بیمار
        </button>
      </div>

      {/* ===== Split Layout ===== */}
      <div className={styles.patientsLayout}>
        {/* ===== Sidebar - لیست بیماران ===== */}
        <div
          className={`${styles.patientSidebar} ${
            selectedPatientId ? styles.sidebarHiddenMobile : ""
          }`}
        >
          {/* جستجو */}
          <div className={styles.patientSearchBox}>
            {/* <span className={styles.patientSearchIcon}>🔍</span> */}
            <input
              type="text"
              className={styles.patientSearchInput}
              placeholder="جستجو در بیماران..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.patientSearchClear}
                onClick={() => setSearchQuery("")}
                title="پاک کردن"
              >
                ✕
              </button>
            )}
          </div>

          {/* تعداد بیماران */}
          <div className={styles.patientCount}>
            {toPersianDigits(filteredPatients.length)} بیمار
          </div>

          {/* لیست بیماران */}
          <div className={styles.patientList}>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => {
                const isSelected = selectedPatientId === patient.id;

                // ===== تعداد جلسات این بیمار =====
                const patientSessionsCount = appointments.filter(
                  (a) => a.patientId === patient.id,
                ).length;

                return (
                  <button
                    key={patient.id}
                    className={`${styles.patientListItem} ${
                      isSelected ? styles.patientListItemActive : ""
                    }`}
                    onClick={() => handleSelectPatient(patient.id)}
                  >
                    <div className={styles.patientListAvatar}>👤</div>
                    <div className={styles.patientListInfo}>
                      <span className={styles.patientListName}>
                        {patient.name}
                      </span>
                      <span className={styles.patientListMeta}>
                        {toPersianDigits(patientSessionsCount)} جلسه
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className={styles.patientListEmpty}>
                <p>بیماری یافت نشد</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== Patient Record - پنل راست ===== */}
        {selectedPatient ? (
          <div className={styles.patientRecordPanel}>
            {/* هدر پرونده */}
            <div className={styles.patientRecordHeader}>
              {/* دکمه بستن (فقط موبایل) */}
              <button
                className={styles.patientRecordCloseBtn}
                onClick={handleCloseRecord}
                title="بازگشت به لیست"
              >
                ←
              </button>

              <div className={styles.patientRecordAvatar}>👤</div>

              <div className={styles.patientRecordHeaderInfo}>
                <h3>{selectedPatient.name}</h3>
                <div className={styles.patientRecordMeta}>
                  <span>شماره تماس: {selectedPatient.phone}</span>
                  <span>•</span>
                  <span>{toPersianDigits(patientStats.total)} جلسه</span>
                </div>
              </div>
            </div>

            {/* تب‌ها */}
            <div className={styles.patientRecordTabs}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.patientRecordTab} ${
                    activeTab === tab.id ? styles.patientRecordTabActive : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={styles.patientRecordTabIcon}>
                    {tab.icon}
                  </span>
                  <span className={styles.patientRecordTabLabel}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* محتوای تب */}
            <div className={styles.patientRecordContent}>
              {/* ===== تب 1: اطلاعات فردی ===== */}
              {activeTab === "info" && (
                <div className={styles.patientInfoTab}>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <label>نام کامل</label>
                      <p>{selectedPatient.name}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>جنسیت</label>
                      <p>
                        {selectedPatient.gender === "male" ? "آقا" : "خانم"}
                      </p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>شماره تماس</label>
                      <p>{selectedPatient.phone}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>ایمیل</label>
                      <p>{selectedPatient.email || "—"}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>تاریخ تولد</label>
                      <p>{selectedPatient.birthDate || "—"}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>تاریخ عضویت</label>
                      <p>{selectedPatient.joinDate}</p>
                    </div>
                    <div className={styles.infoItemFull}>
                      <label>آدرس</label>
                      <p>{selectedPatient.address || "—"}</p>
                    </div>
                  </div>

                  {/* تماس اضطراری */}
                  <div className={styles.emergencySection}>
                    <h4>تماس اضطراری</h4>
                    <div className={styles.emergencyGrid}>
                      <div className={styles.infoItem}>
                        <label>شماره تماس</label>
                        <p>{selectedPatient.emergencyContact || "—"}</p>
                      </div>
                      <div className={styles.infoItem}>
                        <label>نسبت</label>
                        <p>{selectedPatient.emergencyRelation || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== تب 2: تاریخچه دارویی ===== */}
              {activeTab === "medications" && (
                <div className={styles.patientMedicationsTab}>
                  {selectedPatient.medications &&
                  selectedPatient.medications.length > 0 ? (
                    <>
                      {/* آمار */}
                      <div className={styles.medicationsStats}>
                        <div className={styles.medStatBox}>
                          <span className={styles.medStatNumber}>
                            {toPersianDigits(
                              selectedPatient.medications.length,
                            )}
                          </span>
                          <span className={styles.medStatLabel}>کل داروها</span>
                        </div>
                        <div
                          className={`${styles.medStatBox} ${styles.medStatActive}`}
                        >
                          <span className={styles.medStatNumber}>
                            {toPersianDigits(
                              selectedPatient.medications.filter(
                                (m) => m.status === "active",
                              ).length,
                            )}
                          </span>
                          <span className={styles.medStatLabel}>
                            در حال مصرف
                          </span>
                        </div>
                        <div
                          className={`${styles.medStatBox} ${styles.medStatStopped}`}
                        >
                          <span className={styles.medStatNumber}>
                            {toPersianDigits(
                              selectedPatient.medications.filter(
                                (m) => m.status === "stopped",
                              ).length,
                            )}
                          </span>
                          <span className={styles.medStatLabel}>قطع شده</span>
                        </div>
                      </div>

                      {/* دکمه افزودن دارو */}
                      <button
                        className={styles.btnAddMedication}
                        onClick={handleOpenMedicationModal}
                      >
                        + افزودن دارو
                      </button>

                      {/* لیست داروها */}
                      <div className={styles.medicationsList}>
                        {selectedPatient.medications.map((med) => (
                          <div
                            key={med.id}
                            className={`${styles.medicationCard} ${
                              med.status === "active"
                                ? styles.medicationActive
                                : med.status === "stopped"
                                  ? styles.medicationStopped
                                  : styles.medicationCompleted
                            }`}
                          >
                            <div className={styles.medicationHeader}>
                              <div className={styles.medicationName}>
                                {med.name}
                              </div>
                              <span
                                className={`${styles.medicationStatusBadge} ${
                                  med.status === "active"
                                    ? styles.statusMedActive
                                    : med.status === "stopped"
                                      ? styles.statusMedStopped
                                      : styles.statusMedCompleted
                                }`}
                              >
                                {med.status === "active" && "در حال مصرف"}
                                {med.status === "stopped" && "قطع شده"}
                                {med.status === "completed" && "تمام شده"}
                              </span>
                            </div>

                            <div className={styles.medicationGrid}>
                              <div className={styles.medicationItem}>
                                <label>دوز</label>
                                <p>{med.dosage}</p>
                              </div>
                              <div className={styles.medicationItem}>
                                <label>نحوه‌ی مصرف</label>
                                <p>{med.frequency}</p>
                              </div>
                              <div className={styles.medicationItem}>
                                <label>شروع</label>
                                <p>{med.startDate}</p>
                              </div>
                              <div className={styles.medicationItem}>
                                <label>پایان</label>
                                <p>{med.endDate || "در حال مصرف"}</p>
                              </div>
                              <div className={styles.medicationItemFull}>
                                <label>تجویزکننده</label>
                                <p>{med.prescribedBy}</p>
                              </div>
                              {med.notes && (
                                <div className={styles.medicationItemFull}>
                                  <label>توضیحات</label>
                                  <p>{med.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyState}>
                      {/* <span className={styles.emptyIcon}>💊</span> */}
                      <h3>هیچ دارویی ثبت نشده</h3>
                      <p>برای این بیمار هیچ دارویی در پرونده ثبت نشده است.</p>
                      <button
                        className={styles.btnAddMedication}
                        onClick={handleOpenMedicationModal}
                      >
                        + افزودن اولین دارو
                      </button>
                    </div>
                  )}
                  {/* // ) : (
                  //   <div className={styles.emptyState}>
                  //     <span className={styles.emptyIcon}>💊</span>
                  //     <h3>هیچ دارویی ثبت نشده</h3>
                  //     <p>برای این بیمار هیچ دارویی در پرونده ثبت نشده است.</p>
                  //   </div>
                  // )} */}
                </div>
              )}

              {/* ===== تب 3: تاریخچه جلسات ===== */}
              {activeTab === "sessions" && (
                <div className={styles.patientSessionsTab}>
                  {/* آمار */}
                  <div className={styles.patientStatsGrid}>
                    <div className={styles.patientStatBox}>
                      <span className={styles.patientStatNumber}>
                        {toPersianDigits(patientStats.total)}
                      </span>
                      <span className={styles.patientStatLabel}>کل جلسات</span>
                    </div>
                    <div
                      className={`${styles.patientStatBox} ${styles.patientStatSuccess}`}
                    >
                      <span className={styles.patientStatNumber}>
                        {toPersianDigits(patientStats.completed)}
                      </span>
                      <span className={styles.patientStatLabel}>
                        برگزار شده
                      </span>
                    </div>
                    <div
                      className={`${styles.patientStatBox} ${styles.patientStatDanger}`}
                    >
                      <span className={styles.patientStatNumber}>
                        {toPersianDigits(patientStats.cancelled)}
                      </span>
                      <span className={styles.patientStatLabel}>کنسل شده</span>
                    </div>
                    <div
                      className={`${styles.patientStatBox} ${styles.patientStatWarning}`}
                    >
                      <span className={styles.patientStatNumber}>
                        {toPersianDigits(patientStats.noShow)}
                      </span>
                      <span className={styles.patientStatLabel}>
                        برگزار نشده
                      </span>
                    </div>
                  </div>

                  {/* لیست جلسات */}
                  <div className={styles.patientSessionsList}>
                    {patientAppointments.length > 0 ? (
                      patientAppointments.map((appointment) => {
                        const displayStatus = getDisplayStatus(appointment);
                        const isCompleted = displayStatus === "completed";
                        const isCancelled = displayStatus === "cancelled";
                        const isNoShow = displayStatus === "no-show";

                        return (
                          <div
                            key={appointment.id}
                            className={styles.patientSessionItem}
                          >
                            {/* هدر */}
                            <div className={styles.patientSessionHeader}>
                              <div className={styles.patientSessionDateBox}>
                                <span className={styles.patientSessionDate}>
                                  {appointment.date}
                                </span>
                                <span className={styles.patientSessionTime}>
                                  {toPersianDigits(
                                    appointment.startTime ||
                                      appointment.time.split(" - ")[0],
                                  )}
                                </span>
                              </div>

                              <span
                                className={`${styles.patientSessionStatus} ${
                                  isCompleted
                                    ? styles.statusSuccess
                                    : isCancelled
                                      ? styles.statusDanger
                                      : isNoShow
                                        ? styles.statusWarning
                                        : styles.statusInfo
                                }`}
                              >
                                {isCompleted && "برگزار شده"}
                                {isCancelled && "کنسل شده"}
                                {isNoShow && "برگزار نشده"}
                                {!isCompleted &&
                                  !isCancelled &&
                                  !isNoShow &&
                                  getDisplayStatusInfo(displayStatus).label}
                              </span>
                            </div>

                            {/* جزئیات */}
                            <div className={styles.patientSessionMeta}>
                              <span>{appointment.type}</span>
                              <span>•</span>
                              <span>
                                {toPersianDigits(appointment.duration)} ساعت
                              </span>
                              {isCancelled && appointment.cancelReason && (
                                <>
                                  <span>•</span>
                                  <span className={styles.cancelReasonText}>
                                    دلیل: {appointment.cancelReason}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* یادداشت */}
                            {isCompleted &&
                              appointment.sessionNotes?.summary && (
                                <div className={styles.patientSessionNote}>
                                  <div
                                    className={styles.patientSessionNoteHeader}
                                  >
                                    <span>خلاصه جلسه</span>
                                    <span
                                      className={styles.patientSessionNoteDate}
                                    >
                                      {appointment.sessionNotes.updatedAt ||
                                        appointment.sessionNotes.createdAt}
                                    </span>
                                  </div>
                                  <p>{appointment.sessionNotes.summary}</p>
                                </div>
                              )}

                            {/* دکمه ثبت یادداشت */}
                            {isCompleted && (
                              <button
                                className={styles.patientSessionNoteBtn}
                                onClick={() => handleOpenNoteModal(appointment)}
                              >
                                {appointment.sessionNotes?.summary
                                  ? "ویرایش یادداشت"
                                  : "ثبت یادداشت"}
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.emptyState}>
                        <p>هیچ جلسه‌ای برای این بیمار ثبت نشده است.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== تب 4: یادداشت‌ها و تمارین ===== */}
              {/* {activeTab === "notes" && (
                <div className={styles.patientNotesTab}>
                  {patientSessionNotes.length > 0 ? (
                    patientSessionNotes.map((appointment) => {
                      const isExpanded =
                        expandedAppointmentId === appointment.id;

                      return (
                        <div
                          key={appointment.id}
                          className={`${styles.patientNoteCard} ${
                            isExpanded ? styles.patientNoteCardExpanded : ""
                          }`}
                        >
                          <button
                            className={styles.patientNoteHeaderBtn}
                            onClick={() =>
                              setExpandedAppointmentId(
                                isExpanded ? null : appointment.id,
                              )
                            }
                          >
                            <div className={styles.patientNoteHeaderInfo}>
                              <span className={styles.patientNoteDate}>
                                📅 {appointment.date}
                              </span>
                              <span className={styles.patientNoteSessionType}>
                                {appointment.type}
                              </span>
                            </div>

                            <div className={styles.patientNoteHeaderRight}>
                              {appointment.exercises?.length > 0 && (
                                <span
                                  className={styles.patientNoteExercisesCount}
                                >
                                  🎯{" "}
                                  {toPersianDigits(
                                    appointment.exercises.length,
                                  )}{" "}
                                  تمرین
                                </span>
                              )}
                              <span className={styles.expandIcon}>
                                {isExpanded ? "▲" : "▼"}
                              </span>
                            </div>
                          </button>

                          {isExpanded && (
                            <div className={styles.patientNoteExpandedContent}>
                              {appointment.sessionNotes?.summary && (
                                <div className={styles.patientNoteSection}>
                                  <div
                                    className={styles.patientNoteSectionTitle}
                                  >
                                    <span>📝 خلاصه جلسه</span>
                                    <button
                                      className={styles.patientNoteEditBtn}
                                      onClick={() =>
                                        handleOpenNoteModal(appointment)
                                      }
                                    >
                                      ✏️ ویرایش
                                    </button>
                                  </div>
                                  <p className={styles.patientNoteFullText}>
                                    {appointment.sessionNotes.summary}
                                  </p>
                                </div>
                              )}

                              {appointment.exercises?.length > 0 && (
                                <div className={styles.patientNoteSection}>
                                  <div
                                    className={styles.patientNoteSectionTitle}
                                  >
                                    <span>🎯 تمارین تعیین‌شده</span>
                                  </div>
                                  <div className={styles.patientExercisesList}>
                                    {appointment.exercises.map((exercise) => (
                                      <div
                                        key={exercise.id}
                                        className={`${styles.patientExerciseItem} ${
                                          exercise.completed
                                            ? styles.patientExerciseDone
                                            : ""
                                        }`}
                                      >
                                        <div
                                          className={styles.patientExerciseIcon}
                                        >
                                          {exercise.icon || "📋"}
                                        </div>
                                        <div
                                          className={
                                            styles.patientExerciseContent
                                          }
                                        >
                                          <span
                                            className={
                                              styles.patientExerciseTitle
                                            }
                                          >
                                            {exercise.title}
                                          </span>
                                          <span
                                            className={
                                              styles.patientExerciseDesc
                                            }
                                          >
                                            {exercise.description}
                                          </span>
                                        </div>
                                        <span
                                          className={`${styles.patientExerciseStatus} ${
                                            exercise.completed
                                              ? styles.exerciseStatusDone
                                              : styles.exerciseStatusPending
                                          }`}
                                        >
                                          {exercise.completed
                                            ? "✓ انجام شده"
                                            : "در انتظار"}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {!appointment.sessionNotes?.summary &&
                                (!appointment.exercises ||
                                  appointment.exercises.length === 0) && (
                                  <div className={styles.patientNoteEmpty}>
                                    یادداشت و تمرینی برای این جلسه ثبت نشده است.
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>📝</span>
                      <p>هنوز یادداشت یا تمرینی برای این بیمار ثبت نشده است.</p>
                    </div>
                  )}
                </div>
              )} */}

              {/* ===== تب ۳: یادداشت‌ها و تمارین ===== */}
              {activeTab === "notes" && (
                <div className={styles.patientNotesTab}>
                  {patientSessionNotes.length > 0 ? (
                    patientSessionNotes.map((appointment) => {
                      const isExpanded =
                        expandedAppointmentId === appointment.id;

                      return (
                        <div
                          key={appointment.id}
                          className={`${styles.patientNoteCard} ${
                            isExpanded ? styles.patientNoteCardExpanded : ""
                          }`}
                        >
                          {/* هدر (کلیک‌پذیر) */}
                          <button
                            className={styles.patientNoteHeaderBtn}
                            onClick={() =>
                              setExpandedAppointmentId(
                                isExpanded ? null : appointment.id,
                              )
                            }
                          >
                            <div className={styles.patientNoteHeaderInfo}>
                              <span className={styles.patientNoteDate}>
                                {appointment.date}
                              </span>
                              <span className={styles.patientNoteSessionType}>
                                {appointment.type}
                              </span>
                            </div>

                            <div className={styles.patientNoteHeaderRight}>
                              {appointment.exercises?.length > 0 && (
                                <span
                                  className={styles.patientNoteExercisesCount}
                                >
                                  {/* 🎯{" "} */}
                                  {toPersianDigits(
                                    appointment.exercises.length,
                                  )}{" "}
                                  تمرین
                                </span>
                              )}
                              <span className={styles.expandIcon}>
                                {isExpanded ? "▲" : "▼"}
                              </span>
                            </div>
                          </button>

                          {/* محتوای گسترده */}
                          {isExpanded && (
                            <div className={styles.patientNoteExpandedContent}>
                              {/* ===== بخش یادداشت ===== */}
                              {appointment.sessionNotes?.summary && (
                                <div className={styles.patientNoteSection}>
                                  <div
                                    className={styles.patientNoteSectionTitle}
                                  >
                                    <span>خلاصه جلسه</span>
                                    <button
                                      className={styles.patientNoteEditBtn}
                                      onClick={() =>
                                        handleOpenNoteModal(appointment)
                                      }
                                    >
                                      ویرایش
                                    </button>
                                  </div>
                                  <p className={styles.patientNoteFullText}>
                                    {appointment.sessionNotes.summary}
                                  </p>
                                </div>
                              )}

                              {/* ===== بخش تمارین ===== */}
                              {appointment.exercises?.length > 0 && (
                                <div className={styles.patientNoteSection}>
                                  <div
                                    className={styles.patientNoteSectionTitle}
                                  >
                                    <span>🎯 تمارین تعیین‌شده</span>
                                  </div>
                                  <div className={styles.patientExercisesList}>
                                    {appointment.exercises.map((exercise) => (
                                      <div
                                        key={exercise.id}
                                        className={styles.patientExerciseItem}
                                      >
                                        <div
                                          className={styles.patientExerciseIcon}
                                        >
                                          {exercise.icon || "📋"}
                                        </div>
                                        <div
                                          className={
                                            styles.patientExerciseContent
                                          }
                                        >
                                          <span
                                            className={
                                              styles.patientExerciseTitle
                                            }
                                          >
                                            {exercise.title}
                                          </span>
                                          <span
                                            className={
                                              styles.patientExerciseDesc
                                            }
                                          >
                                            {exercise.description}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* اگه هیچی نبود */}
                              {!appointment.sessionNotes?.summary &&
                                (!appointment.exercises ||
                                  appointment.exercises.length === 0) && (
                                  <div className={styles.patientNoteEmpty}>
                                    یادداشت و تمرینی برای این جلسه ثبت نشده است.
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>📝</span>
                      <p>هنوز یادداشت یا تمرینی برای این بیمار ثبت نشده است.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== تب 5: توضیحات کلی ===== */}
              {/* {activeTab === "general" && (
                <div className={styles.patientGeneralTab}>
                  <p className={styles.generalTabHint}>
                    این توضیحات فقط برای شما قابل مشاهده است و در پرونده‌ی بیمار
                    ذخیره می‌شود.
                  </p>

                  <div className={styles.formGroup}>
                    <textarea
                      className={styles.generalNotesTextarea}
                      defaultValue={selectedPatient.doctorNotes || ""}
                      placeholder="توضیحات کلی درباره‌ی این بیمار..."
                      rows="10"
                      maxLength="3000"
                    />
                  </div>

                  <div className={styles.generalTabFooter}>
                    <span className={styles.generalTabDate}>
                      {selectedPatient.doctorNotesUpdatedAt
                        ? `آخرین به‌روزرسانی: ${selectedPatient.doctorNotesUpdatedAt}`
                        : "هنوز ذخیره نشده"}
                    </span>
                    <button className={styles.btnSaveGeneral}>
                      ذخیره توضیحات
                    </button>
                  </div>
                </div>
              )} */}
              {/* ===== تب ۵: توضیحات کلی ===== */}
              {activeTab === "general" && (
                <div className={styles.patientGeneralTab}>
                  <p className={styles.generalTabHint}>
                    این توضیحات فقط برای شما قابل مشاهده است و در پرونده‌ی بیمار
                    ذخیره می‌شود.
                  </p>

                  <div className={styles.formGroup}>
                    <textarea
                      className={styles.generalNotesTextarea}
                      value={generalNotesInput}
                      onChange={(e) => setGeneralNotesInput(e.target.value)}
                      placeholder="توضیحات کلی درباره‌ی این بیمار..."
                      rows="10"
                      maxLength="3000"
                    />
                  </div>

                  <div className={styles.generalTabFooter}>
                    <span className={styles.generalTabDate}>
                      {selectedPatient.doctorNotesUpdatedAt
                        ? `آخرین به‌روزرسانی: ${selectedPatient.doctorNotesUpdatedAt}`
                        : "هنوز ذخیره نشده"}
                    </span>
                    <button
                      className={styles.btnSaveGeneral}
                      onClick={handleSaveGeneralNotes}
                    >
                      ذخیره توضیحات
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.patientRecordEmpty}>
            {/* <span className={styles.patientRecordEmptyIcon}>👈</span> */}
            <h3>یک بیمار را انتخاب کنید</h3>
            <p>برای مشاهده‌ی پرونده، روی نام بیمار کلیک کنید.</p>
          </div>
        )}
      </div>

      {/* ===== مودال یادداشت جلسه ===== */}
      {showNoteModal && selectedAppointmentForNote && (
        <div className={styles.modalOverlay}>
          <div className={styles.noteModal}>
            <div className={styles.modalHeader}>
              <h3>📝 یادداشت جلسه</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteInput("");
                  setSelectedAppointmentForNote(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.noteSessionInfo}>
                <p>
                  جلسه با <strong>{selectedAppointmentForNote.patient}</strong>
                </p>
                <span className={styles.noteSessionDate}>
                  {selectedAppointmentForNote.date} •{" "}
                  {toPersianDigits(
                    selectedAppointmentForNote.startTime ||
                      selectedAppointmentForNote.time.split(" - ")[0],
                  )}
                </span>
              </div>

              <div className={styles.formGroup}>
                <label>خلاصه جلسه:</label>
                <textarea
                  className={styles.noteTextarea}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="خلاصه‌ای از مباحث مطرح شده، وضعیت بیمار، پیشرفت‌ها و توصیه‌های جلسه..."
                  rows="8"
                  maxLength="2000"
                  autoFocus
                />
                <span className={styles.noteCharCount}>
                  {toPersianDigits(noteInput.length)} / ۲۰۰۰
                </span>
              </div>

              <p className={styles.noteHint}>
                این یادداشت در پرونده‌ی بیمار ذخیره خواهد شد و فقط برای شما قابل
                مشاهده است.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteInput("");
                  setSelectedAppointmentForNote(null);
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={handleSaveNote}
              >
                ذخیره یادداشت
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== مودال افزودن دارو ===== */}
      {showMedicationModal && selectedPatient && (
        <div className={styles.modalOverlay}>
          <div className={styles.addModal}>
            <div className={styles.modalHeader}>
              <h3>💊 افزودن دارو</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowMedicationModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* نام دارو */}
              <div className={styles.formGroup}>
                <label>نام دارو *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="مثلاً: سرترالین"
                  value={medicationForm.name}
                  onChange={(e) =>
                    setMedicationForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              {/* دوز و نحوه مصرف */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>دوز *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="مثلاً: ۵۰ میلی‌گرم"
                    value={medicationForm.dosage}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        dosage: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>نحوه‌ی مصرف *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="مثلاً: روزانه یک‌بار - صبح"
                    value={medicationForm.frequency}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* تاریخ شروع و پایان */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>تاریخ شروع *</label>
                  <DatePicker
                    value={medicationForm.startDate}
                    onChange={(date) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        startDate: date,
                      }))
                    }
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass={styles.formInput}
                    placeholder="انتخاب تاریخ"
                    format="YYYY/MM/DD"
                    editable={false}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>تاریخ پایان (اختیاری)</label>
                  <DatePicker
                    value={medicationForm.endDate}
                    onChange={(date) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        endDate: date,
                      }))
                    }
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass={styles.formInput}
                    placeholder="در حال مصرف (خالی بگذارید)"
                    format="YYYY/MM/DD"
                    editable={false}
                  />
                </div>
              </div>

              {/* تجویزکننده و وضعیت */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>تجویزکننده *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="نام پزشک"
                    value={medicationForm.prescribedBy}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        prescribedBy: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>وضعیت</label>
                  <select
                    className={styles.formSelect}
                    value={medicationForm.status}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="active">در حال مصرف</option>
                    <option value="stopped">قطع شده</option>
                    <option value="completed">تمام شده</option>
                  </select>
                </div>
              </div>

              {/* توضیحات */}
              <div className={styles.formGroup}>
                <label>توضیحات (اختیاری)</label>
                <textarea
                  className={styles.formInput}
                  placeholder="توضیحات اضافه درباره‌ی دارو..."
                  value={medicationForm.notes}
                  onChange={(e) =>
                    setMedicationForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows="3"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => setShowMedicationModal(false)}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={handleSaveMedication}
              >
                افزودن دارو
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال افزودن بیمار ===== */}
      {showPatientModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.addModal}>
            <div className={styles.modalHeader}>
              <h3>👤 افزودن بیمار جدید</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowPatientModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* نام و جنسیت */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="مثلاً: احمد محمدی"
                    value={patientForm.name}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>جنسیت</label>
                  <select
                    className={styles.formSelect}
                    value={patientForm.gender}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  >
                    <option value="male">آقا</option>
                    <option value="female">خانم</option>
                  </select>
                </div>
              </div>

              {/* تماس و ایمیل */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>شماره تماس *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={patientForm.phone}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    dir="ltr"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>ایمیل (اختیاری)</label>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="example@email.com"
                    value={patientForm.email}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    dir="ltr"
                  />
                </div>
              </div>

              {/* تاریخ تولد */}
              <div className={styles.formGroup}>
                <label>تاریخ تولد (اختیاری)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="۱۳۷۵/۰۳/۱۵"
                  value={patientForm.birthDate}
                  onChange={(e) =>
                    setPatientForm((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
                  }
                />
              </div>

              {/* آدرس */}
              <div className={styles.formGroup}>
                <label>آدرس (اختیاری)</label>
                <textarea
                  className={styles.formInput}
                  placeholder="آدرس محل سکونت"
                  value={patientForm.address}
                  onChange={(e) =>
                    setPatientForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows="2"
                />
              </div>

              {/* تماس اضطراری */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>تماس اضطراری (اختیاری)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={patientForm.emergencyContact}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        emergencyContact: e.target.value,
                      }))
                    }
                    dir="ltr"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>نسبت</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="مثلاً: همسر"
                    value={patientForm.emergencyRelation}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        emergencyRelation: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => setShowPatientModal(false)}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={handleSavePatient}
              >
                افزودن بیمار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENT: Exercises Management
// ============================================
// function ExercisesManagement() {
//   return (
//     <div className={styles.pageContent}>
//       <div className={styles.pageHeader}>
//         <div className={styles.headerInfo}>
//           <h2>📝 تمارین</h2>
//           <p>تعیین و مدیریت تمارین بیماران</p>
//         </div>
//         <button className={styles.newBtn}>
//           <FaPlus /> تمرین جدید
//         </button>
//       </div>
//       <div className={styles.emptyState}>
//         <h3>هیچ تمرینی تعیین نشده</h3>
//         <p>برای بیماران خود تمرین تعیین کنید.</p>
//       </div>
//     </div>
//   );
// }

// ============================================
// COMPONENT: Exercises Management (Doctor Panel)
// ============================================
function ExercisesManagement({ patients, appointments, setAppointments }) {
  // ===== State های فیلتر =====
  const [filterPatientId, setFilterPatientId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // all | pending | completed | overdue
  const [filterType, setFilterType] = useState("all"); // all | daily | weekly | one-time

  // ===== State های مودال =====
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [editingExercise, setEditingExercise] = useState(null); // { appointmentId, exercise }
  const [showPatientSelectModal, setShowPatientSelectModal] = useState(false);

  // ==========================================
  // مشتق‌ها
  // ==========================================

  // ===== همه‌ی تمارین (از همه‌ی appointments) =====
  const allExercises = useMemo(() => {
    const result = [];

    appointments.forEach((appointment) => {
      if (
        appointment.exercises &&
        Array.isArray(appointment.exercises) &&
        appointment.exercises.length > 0
      ) {
        appointment.exercises.forEach((exercise) => {
          result.push({
            ...exercise,
            // ===== اطلاعات اضافه از appointment =====
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            patientName: appointment.patient,
            appointmentDate: appointment.date,
            appointmentType: appointment.type,
            appointmentTypeKey: appointment.typeKey,
          });
        });
      }
    });

    return result;
  }, [appointments]);

  // ===== آمار =====
  const stats = useMemo(() => {
    const now = moment();
    let pending = 0;
    let completed = 0;
    let overdue = 0;

    allExercises.forEach((ex) => {
      if (ex.completed) {
        completed++;
      } else {
        pending++;
        // ===== چک کردن مهلت گذشته =====
        if (ex.dueDate) {
          const dueMoment = moment(
            toEnglishDigits(ex.dueDate),
            "jYYYY/jMM/jDD",
          );
          if (dueMoment.isValid() && dueMoment.isBefore(now, "day")) {
            overdue++;
          }
        }
      }
    });

    return {
      total: allExercises.length,
      pending,
      completed,
      overdue,
    };
  }, [allExercises]);

  // ===== لیست بیمارانی که تمرین دارن =====
  const patientsWithExercises = useMemo(() => {
    const patientMap = new Map();

    allExercises.forEach((ex) => {
      if (!patientMap.has(ex.patientId)) {
        patientMap.set(ex.patientId, {
          patientId: ex.patientId,
          patientName: ex.patientName,
          exercises: [],
        });
      }
      patientMap.get(ex.patientId).exercises.push(ex);
    });

    return Array.from(patientMap.values());
  }, [allExercises]);

  // ===== فیلتر شده =====
  const filteredPatientGroups = useMemo(() => {
    return patientsWithExercises
      .filter((group) => {
        if (filterPatientId !== "all" && group.patientId !== filterPatientId) {
          return false;
        }
        return true;
      })
      .map((group) => {
        const filteredExercises = group.exercises.filter((ex) => {
          // ===== فیلتر وضعیت =====
          if (filterStatus === "pending" && ex.completed) return false;
          if (filterStatus === "completed" && !ex.completed) return false;
          if (filterStatus === "overdue") {
            if (ex.completed) return false;
            const dueMoment = moment(
              toEnglishDigits(ex.dueDate),
              "jYYYY/jMM/jDD",
            );
            if (!dueMoment.isValid() || !dueMoment.isBefore(moment(), "day"))
              return false;
          }

          // ===== فیلتر نوع =====
          if (filterType !== "all" && ex.type !== filterType) return false;

          return true;
        });

        return {
          ...group,
          exercises: filteredExercises,
        };
      })
      .filter((group) => group.exercises.length > 0);
  }, [patientsWithExercises, filterPatientId, filterStatus, filterType]);

  // ===== لیست بیماران برای dropdown =====
  const patientsForFilter = useMemo(() => {
    return Array.from(
      new Map(
        patientsWithExercises.map((g) => [
          g.patientId,
          { id: g.patientId, name: g.patientName },
        ]),
      ).values(),
    );
  }, [patientsWithExercises]);

  // ==========================================
  // توابع
  // ==========================================

  // ===== باز کردن مودال برای طراحی تمرین جدید =====
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingExercise(null);
    setShowPatientSelectModal(true);
  };

  // ===== انتخاب بیمار و جلسه (از مودال) =====
  const handleSelectAppointment = (appointment) => {
    setShowPatientSelectModal(false);
    setEditingExercise({
      appointmentId: appointment.id,
      exercise: null,
      appointmentInfo: {
        patientName: appointment.patient,
        appointmentDate: appointment.date,
        appointmentType: appointment.type,
      },
    });
    setShowExerciseModal(true);
  };

  // ===== باز کردن مودال ویرایش =====
  const handleOpenEditModal = (exercise) => {
    setModalMode("edit");
    setEditingExercise({
      appointmentId: exercise.appointmentId,
      exercise: exercise,
      appointmentInfo: {
        patientName: exercise.patientName,
        appointmentDate: exercise.appointmentDate,
        appointmentType: exercise.appointmentType,
      },
    });
    setShowExerciseModal(true);
  };

  // ===== حذف تمرین =====
  const handleDeleteExercise = (exercise) => {
    if (
      !window.confirm(`آیا از حذف تمرین "${exercise.title}" اطمینان دارید؟`)
    ) {
      return;
    }

    setAppointments((prev) =>
      prev.map((app) => {
        if (app.id !== exercise.appointmentId) return app;

        return {
          ...app,
          exercises: (app.exercises || []).filter(
            (ex) => ex.id !== exercise.id,
          ),
        };
      }),
    );
  };

  // ==========================================
  // رندر
  // ==========================================
  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>تمارین بیماران</h2>
          <p>برای جلسات برگزار شده می‌توانید برای بیمار تمرین طراحی کنید.</p>
        </div>
        <button className={styles.newBtn} onClick={handleOpenCreateModal}>
          <FaPlus /> طراحی تمرین جدید
        </button>
      </div>

      {/* ===== راهنمای بالا ===== */}
      <div className={styles.exercisesHint}>
        <span className={styles.exercisesHintIcon}>💡</span>
        <p>
          تمرین‌ها همیشه به یک <strong>جلسه‌ی برگزار شده</strong> متصل هستند.
          برای طراحی تمرین، ابتدا بیمار و جلسه را انتخاب کنید. بیمار می‌تواند
          تیک انجام تمرین را در پنل خود بزند.
        </p>
      </div>

      {/* ===== آمار ===== */}
      <div className={styles.exercisesStatsGrid}>
        <div className={styles.exerciseStatBox}>
          <span className={styles.exerciseStatIcon}>📊</span>
          <span className={styles.exerciseStatNumber}>
            {toPersianDigits(stats.total)}
          </span>
          <span className={styles.exerciseStatLabel}>کل تمارین</span>
        </div>
        <div className={`${styles.exerciseStatBox} ${styles.statPending}`}>
          <span className={styles.exerciseStatIcon}>⏳</span>
          <span className={styles.exerciseStatNumber}>
            {toPersianDigits(stats.pending)}
          </span>
          <span className={styles.exerciseStatLabel}>در انتظار</span>
        </div>
        <div className={`${styles.exerciseStatBox} ${styles.statCompleted}`}>
          <span className={styles.exerciseStatIcon}>✅</span>
          <span className={styles.exerciseStatNumber}>
            {toPersianDigits(stats.completed)}
          </span>
          <span className={styles.exerciseStatLabel}>انجام شده</span>
        </div>
        <div className={`${styles.exerciseStatBox} ${styles.statOverdue}`}>
          <span className={styles.exerciseStatIcon}>⚠️</span>
          <span className={styles.exerciseStatNumber}>
            {toPersianDigits(stats.overdue)}
          </span>
          <span className={styles.exerciseStatLabel}>مهلت گذشته</span>
        </div>
      </div>

      {/* ===== فیلترها ===== */}
      <div className={styles.exercisesFilters}>
        <div className={styles.exerciseFilterGroup}>
          <label>بیمار:</label>
          <select
            className={styles.formSelect}
            value={filterPatientId}
            onChange={(e) => setFilterPatientId(e.target.value)}
          >
            <option value="all">همه بیماران</option>
            {patientsForFilter.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.exerciseFilterGroup}>
          <label>وضعیت:</label>
          <select
            className={styles.formSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">همه</option>
            <option value="pending">در انتظار</option>
            <option value="completed">انجام شده</option>
            <option value="overdue">مهلت گذشته</option>
          </select>
        </div>

        <div className={styles.exerciseFilterGroup}>
          <label>نوع:</label>
          <select
            className={styles.formSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">همه</option>
            <option value="daily">روزانه</option>
            <option value="weekly">هفتگی</option>
            <option value="one-time">یک‌باره</option>
          </select>
        </div>
      </div>

      {/* ===== لیست تمارین ===== */}
      <div className={styles.exercisesList}>
        {filteredPatientGroups.length > 0 ? (
          filteredPatientGroups.map((group) => (
            <div key={group.patientId} className={styles.patientExercisesGroup}>
              {/* هدر بیمار */}
              <div className={styles.patientExercisesHeader}>
                <div className={styles.patientExercisesAvatar}>👤</div>
                <span className={styles.patientExercisesName}>
                  {group.patientName}
                </span>
                <span className={styles.patientExercisesCount}>
                  {toPersianDigits(group.exercises.length)} تمرین
                </span>
              </div>

              {/* لیست تمارین */}
              <div className={styles.patientExercisesItems}>
                {group.exercises.map((exercise) => {
                  const isOverdue =
                    !exercise.completed &&
                    exercise.dueDate &&
                    moment(
                      toEnglishDigits(exercise.dueDate),
                      "jYYYY/jMM/jDD",
                    ).isBefore(moment(), "day");

                  return (
                    <div
                      key={`${exercise.appointmentId}-${exercise.id}`}
                      className={`${styles.exerciseItem} ${
                        exercise.completed ? styles.exerciseItemDone : ""
                      }`}
                    >
                      {/* آیکون و محتوا */}
                      <div className={styles.exerciseItemIcon}>
                        {exercise.icon || "📋"}
                      </div>

                      <div className={styles.exerciseItemContent}>
                        <div className={styles.exerciseItemHeader}>
                          <span className={styles.exerciseItemTitle}>
                            {exercise.title}
                          </span>

                          {/* بج‌ها */}
                          <div className={styles.exerciseItemBadges}>
                            <span className={styles.exerciseTypeBadge}>
                              {exercise.type === "daily" && "🌙 روزانه"}
                              {exercise.type === "weekly" && "📅 هفتگی"}
                              {exercise.type === "one-time" && "⭐ یک‌باره"}
                            </span>

                            {exercise.completed ? (
                              <span className={styles.exerciseBadgeDone}>
                                ✅ انجام شده
                              </span>
                            ) : isOverdue ? (
                              <span className={styles.exerciseBadgeOverdue}>
                                ⚠️ مهلت گذشته
                              </span>
                            ) : (
                              <span className={styles.exerciseBadgePending}>
                                ⏳ در انتظار
                              </span>
                            )}
                          </div>
                        </div>

                        <p className={styles.exerciseItemDesc}>
                          {exercise.description}
                        </p>

                        {/* اطلاعات متا */}
                        <div className={styles.exerciseItemMeta}>
                          <span>📅 جلسه: {exercise.appointmentDate}</span>
                          <span>•</span>
                          <span>⏰ مهلت: {exercise.dueDate}</span>
                          <span>•</span>
                          <span>{exercise.appointmentType}</span>
                        </div>
                      </div>

                      {/* دکمه‌های اکشن */}
                      <div className={styles.exerciseItemActions}>
                        <button
                          className={styles.exerciseBtnEdit}
                          onClick={() => handleOpenEditModal(exercise)}
                          title="ویرایش"
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.exerciseBtnDelete}
                          onClick={() => handleDeleteExercise(exercise)}
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎯</span>
            <h3>هیچ تمرینی ثبت نشده</h3>
            <p>برای طراحی تمرین، روی دکمه «طراحی تمرین جدید» کلیک کنید.</p>
            <button className={styles.emptyBtn} onClick={handleOpenCreateModal}>
              + طراحی اولین تمرین
            </button>
          </div>
        )}
      </div>

      {/* ===== مودال انتخاب بیمار و جلسه ===== */}
      {showPatientSelectModal && (
        <PatientAppointmentSelectModal
          patients={patients}
          appointments={appointments}
          onClose={() => setShowPatientSelectModal(false)}
          onSelect={handleSelectAppointment}
        />
      )}

      {/* ===== مودال طراحی تمرین ===== */}
      {showExerciseModal && editingExercise && (
        <ExerciseDesignModal
          mode={modalMode}
          appointmentInfo={editingExercise.appointmentInfo}
          existingExercise={editingExercise.exercise}
          appointmentId={editingExercise.appointmentId}
          appointments={appointments}
          setAppointments={setAppointments}
          onClose={() => {
            setShowExerciseModal(false);
            setEditingExercise(null);
          }}
          doctorName={seedData.doctorProfile.name}
        />
      )}
    </div>
  );
}

// ============================================
// COMPONENT: Patient Appointment Select Modal
// ============================================
function PatientAppointmentSelectModal({
  patients,
  appointments,
  onClose,
  onSelect,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPatientId, setExpandedPatientId] = useState(null);

  // ===== فقط جلسات برگزار شده =====
  const completedAppointments = useMemo(() => {
    return appointments
      .filter((a) => getDisplayStatus(a) === "completed")
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentB - momentA; // جدیدترین اول
      });
  }, [appointments]);

  // ===== گروه‌بندی بر اساس بیمار =====
  const groupedByPatient = useMemo(() => {
    const map = new Map();

    completedAppointments.forEach((app) => {
      if (!map.has(app.patientId)) {
        map.set(app.patientId, {
          patientId: app.patientId,
          patientName: app.patient,
          appointments: [],
        });
      }
      map.get(app.patientId).appointments.push(app);
    });

    return Array.from(map.values());
  }, [completedAppointments]);

  // ===== فیلتر بر اساس search =====
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return groupedByPatient;

    return groupedByPatient.filter((g) =>
      g.patientName.toLowerCase().includes(query),
    );
  }, [groupedByPatient, searchQuery]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.patientSelectModal}>
        <div className={styles.modalHeader}>
          <h3>انتخاب بیمار و جلسه</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.patientSelectHint}>
            جلسه‌ی برگزار شده‌ای که می‌خواهید برای آن تمرین طراحی کنید را انتخاب
            کنید.
          </p>

          {/* جستجو */}
          <div className={styles.patientSearchBox}>
            <span className={styles.patientSearchIcon}>🔍</span>
            <input
              type="text"
              className={styles.patientSearchInput}
              placeholder="جستجوی بیمار..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* لیست */}
          <div className={styles.patientSelectList}>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                const isExpanded = expandedPatientId === group.patientId;

                return (
                  <div
                    key={group.patientId}
                    className={styles.patientSelectGroup}
                  >
                    {/* هدر بیمار */}
                    <button
                      className={styles.patientSelectGroupHeader}
                      onClick={() =>
                        setExpandedPatientId(
                          isExpanded ? null : group.patientId,
                        )
                      }
                    >
                      <div className={styles.patientSelectAvatar}>👤</div>
                      <span className={styles.patientSelectName}>
                        {group.patientName}
                      </span>
                      <span className={styles.patientSelectCount}>
                        {toPersianDigits(group.appointments.length)} جلسه
                      </span>
                      <span className={styles.expandIcon}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </button>

                    {/* لیست جلسات */}
                    {isExpanded && (
                      <div className={styles.patientSelectAppointments}>
                        {group.appointments.map((app) => (
                          <button
                            key={app.id}
                            className={styles.patientSelectAppointment}
                            onClick={() => onSelect(app)}
                          >
                            <div className={styles.appointmentSelectInfo}>
                              <span className={styles.appointmentSelectDate}>
                                📅 {app.date}
                              </span>
                              <span className={styles.appointmentSelectTime}>
                                ⏰{" "}
                                {toPersianDigits(
                                  app.startTime || app.time.split(" - ")[0],
                                )}
                              </span>
                            </div>
                            <span className={styles.appointmentSelectType}>
                              {app.type}
                            </span>
                            <span className={styles.appointmentSelectArrow}>
                              →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <p>هیچ جلسه‌ی برگزار شده‌ای یافت نشد.</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancelModal} onClick={onClose}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Exercise Design Modal
// ============================================
function ExerciseDesignModal({
  mode,
  appointmentInfo,
  existingExercise,
  appointmentId,
  appointments,
  setAppointments,
  onClose,
  doctorName,
}) {
  // ===== State های فرم =====
  const [form, setForm] = useState({
    title: existingExercise?.title || "",
    description: existingExercise?.description || "",
    type: existingExercise?.type || "daily",
    icon: existingExercise?.icon || "🧘",
    priority: existingExercise?.priority || "medium",
    dueDate: null, // DatePicker value
    instructions: existingExercise?.instructions || [""],
  });

  // ===== آیکون‌های پیشنهادی =====
  const iconOptions = [
    "🧘",
    "✍️",
    "📊",
    "🏃",
    "🙏",
    "📋",
    "🎨",
    "🎵",
    "📚",
    "💭",
  ];

  // ===== آپدیت فیلد =====
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ===== دستورالعمل‌ها =====
  const updateInstruction = (index, value) => {
    setForm((prev) => {
      const newInstructions = [...prev.instructions];
      newInstructions[index] = value;
      return { ...prev, instructions: newInstructions };
    });
  };

  const addInstruction = () => {
    setForm((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index) => {
    setForm((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  // ===== ذخیره =====
  const handleSave = () => {
    // ===== اعتبارسنجی =====
    if (!form.title.trim()) {
      alert("لطفاً عنوان تمرین را وارد کنید.");
      return;
    }
    if (!form.description.trim()) {
      alert("لطفاً توضیحات تمرین را وارد کنید.");
      return;
    }
    if (!form.dueDate) {
      alert("لطفاً مهلت انجام را انتخاب کنید.");
      return;
    }

    const cleanInstructions = form.instructions
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (cleanInstructions.length === 0) {
      alert("لطفاً حداقل یک مرحله دستورالعمل وارد کنید.");
      return;
    }

    const dueDateStr = toPersianDigits(form.dueDate.format("YYYY/MM/DD"));

    // ===== ساخت آبجکت تمرین =====
    const exerciseData = {
      id: existingExercise?.id || null, // اگه edit بود، همون id
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      category: "activity", // پیش‌فرض
      icon: form.icon,
      dueDate: dueDateStr,
      priority: form.priority,
      progress: existingExercise?.progress || 0,
      completed: existingExercise?.completed || false,
      instructions: cleanInstructions,
      assignedBy: doctorName,
      assignedDate: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
    };

    // ===== آپدیت appointment =====
    setAppointments((prev) =>
      prev.map((app) => {
        if (app.id !== appointmentId) return app;

        const currentExercises = app.exercises || [];

        if (mode === "edit" && existingExercise) {
          // ویرایش
          return {
            ...app,
            exercises: currentExercises.map((ex) =>
              ex.id === existingExercise.id
                ? { ...exerciseData, id: ex.id }
                : ex,
            ),
          };
        } else {
          // ایجاد جدید
          const newId =
            currentExercises.length > 0
              ? Math.max(...currentExercises.map((e) => e.id)) + 1
              : 1;

          return {
            ...app,
            exercises: [...currentExercises, { ...exerciseData, id: newId }],
          };
        }
      }),
    );

    alert(
      mode === "edit"
        ? "تمرین با موفقیت ویرایش شد."
        : "تمرین با موفقیت طراحی شد.",
    );
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.exerciseDesignModal}>
        <div className={styles.modalHeader}>
          <h3>{mode === "edit" ? "✏️ ویرایش تمرین" : "🎯 طراحی تمرین جدید"}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* ===== اطلاعات جلسه ===== */}
          <div className={styles.exerciseSessionInfo}>
            <p>
              <strong>{appointmentInfo.patientName}</strong>
            </p>
            <span className={styles.exerciseSessionDate}>
              📅 {appointmentInfo.appointmentDate} •{" "}
              {appointmentInfo.appointmentType}
            </span>
          </div>

          {/* ===== عنوان ===== */}
          <div className={styles.formGroup}>
            <label>عنوان تمرین *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="مثلاً: تمرین تنفس عمیق"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          {/* ===== توضیحات ===== */}
          <div className={styles.formGroup}>
            <label>توضیحات *</label>
            <textarea
              className={styles.formInput}
              placeholder="توضیح کوتاهی از تمرین..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows="3"
            />
          </div>

          {/* ===== نوع و اولویت ===== */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>نوع تمرین *</label>
              <select
                className={styles.formSelect}
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
              >
                <option value="daily">🌙 روزانه</option>
                <option value="weekly">📅 هفتگی</option>
                <option value="one-time">⭐ یک‌باره</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>اولویت</label>
              <select
                className={styles.formSelect}
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
              >
                <option value="high">🔴 بالا</option>
                <option value="medium">🟡 متوسط</option>
                <option value="low">🟢 کم</option>
              </select>
            </div>
          </div>

          {/* ===== آیکون ===== */}
          <div className={styles.formGroup}>
            <label>آیکون</label>
            <div className={styles.iconPicker}>
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  className={`${styles.iconOption} ${
                    form.icon === icon ? styles.iconOptionActive : ""
                  }`}
                  onClick={() => updateField("icon", icon)}
                  type="button"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* ===== مهلت انجام ===== */}
          <div className={styles.formGroup}>
            <label>مهلت انجام *</label>
            <DatePicker
              value={form.dueDate}
              onChange={(date) => updateField("dueDate", date)}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              inputClass={styles.formInput}
              placeholder="انتخاب تاریخ"
              format="YYYY/MM/DD"
              editable={false}
            />
          </div>

          {/* ===== دستورالعمل‌ها ===== */}
          <div className={styles.formGroup}>
            <label>دستورالعمل‌ها *</label>
            <div className={styles.instructionsList}>
              {form.instructions.map((instruction, index) => (
                <div key={index} className={styles.instructionRow}>
                  <span className={styles.instructionNumber}>
                    {toPersianDigits(index + 1)}
                  </span>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={`مرحله ${toPersianDigits(index + 1)}`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                  />
                  {form.instructions.length > 1 && (
                    <button
                      className={styles.btnRemoveInstruction}
                      onClick={() => removeInstruction(index)}
                      type="button"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              className={styles.btnAddInstruction}
              onClick={addInstruction}
              type="button"
            >
              + افزودن مرحله
            </button>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancelModal} onClick={onClose}>
            انصراف
          </button>
          <button className={styles.btnConfirmModal} onClick={handleSave}>
            {mode === "edit" ? "ذخیره تغییرات" : "طراحی تمرین"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Patient Notes
// ============================================
// function PatientNotes() {
//   return (
//     <div className={styles.pageContent}>
//       <div className={styles.pageHeader}>
//         <div className={styles.headerInfo}>
//           <h2>📋 یادداشت‌ها</h2>
//           <p>یادداشت‌های مربوط به بیماران</p>
//         </div>
//         <button className={styles.newBtn}>
//           <FaPlus /> یادداشت جدید
//         </button>
//       </div>
//       <div className={styles.emptyState}>
//         <span className={styles.emptyIcon}>📋</span>
//         <h3>هیچ یادداشتی ثبت نشده</h3>
//         <p>برای بیماران خود یادداشت ثبت کنید.</p>
//       </div>
//     </div>
//   );
// }

// ============================================
// COMPONENT: Doctor Messages (Notifications)
// ============================================
function DoctorMessages({ notifications, onMarkAsRead, onMarkAllAsRead }) {
  const [filter, setFilter] = useState("all"); // all | unread | read

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ===== فیلتر =====
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    if (filter === "read") return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, filter]);

  // ===== استایل بر اساس نوع =====
  const getTypeStyle = (type) => {
    const map = {
      reminder: { bg: "#e3f2fd", color: "#0d47a1", icon: "⏰" },
      warning: { bg: "#fff3e0", color: "#e65100", icon: "⚠️" },
      confirmed: { bg: "#e8f5e9", color: "#2e7d32", icon: "✅" },
      cancelled: { bg: "#fbe9e7", color: "#c62828", icon: "❌" },
      note: { bg: "#f3e5f5", color: "#6a1b9a", icon: "📝" },
    };
    return map[type] || map.reminder;
  };

  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>🔔 اعلان‌ها</h2>
          <p>رویدادها و یادآوری‌های مهم شما</p>
        </div>
        <div className={styles.notificationActions}>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>
              {toPersianDigits(unreadCount)} جدید
            </span>
          )}
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={onMarkAllAsRead}>
              ✓ همه خوانده شدند
            </button>
          )}
        </div>
      </div>

      {/* ===== فیلترها ===== */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${
            filter === "all" ? styles.active : ""
          }`}
          onClick={() => setFilter("all")}
        >
          همه
          <span className={styles.filterCount}>
            {toPersianDigits(notifications.length)}
          </span>
        </button>
        <button
          className={`${styles.filterTab} ${
            filter === "unread" ? styles.active : ""
          }`}
          onClick={() => setFilter("unread")}
        >
          خوانده نشده
          {unreadCount > 0 && (
            <span className={styles.filterCount}>
              {toPersianDigits(unreadCount)}
            </span>
          )}
        </button>
        <button
          className={`${styles.filterTab} ${
            filter === "read" ? styles.active : ""
          }`}
          onClick={() => setFilter("read")}
        >
          خوانده شده
          <span className={styles.filterCount}>
            {toPersianDigits(notifications.filter((n) => n.isRead).length)}
          </span>
        </button>
      </div>

      {/* ===== لیست اعلان‌ها ===== */}
      <div className={styles.notificationsList}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const typeStyle = getTypeStyle(notification.type);
            return (
              <div
                key={notification.id}
                className={`${styles.notificationCard} ${
                  !notification.isRead ? styles.unread : ""
                }`}
                onClick={() => onMarkAsRead(notification.id)}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h4 className={styles.notificationTitle}>
                      {!notification.isRead && (
                        <span className={styles.unreadDot}></span>
                      )}
                      {notification.title}
                    </h4>
                    <span className={styles.notificationTime}>
                      {notification.time}
                    </span>
                  </div>
                  <p className={styles.notificationMessage}>
                    {notification.message}
                  </p>
                </div>

                {!notification.isRead && (
                  <div className={styles.unreadIndicator}></div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔔</span>
            <h3>هیچ اعلانی وجود ندارد</h3>
            <p>
              {filter === "unread"
                ? "همه اعلان‌ها را خوانده‌اید."
                : filter === "read"
                  ? "هنوز اعلان خوانده شده‌ای وجود ندارد."
                  : "هنوز اعلانی دریافت نکرده‌اید."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Financial View
// ============================================
function FinancialView({ appointments, setAppointments }) {
  // ===== State =====
  const [dateRange, setDateRange] = useState("all"); // all | thisYear | thisMonth | thisWeek
  const [paymentFilter, setPaymentFilter] = useState("all"); // all | paid | unpaid
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // ===== محاسبه‌ی بازه =====
  const getRangeStartDate = () => {
    const now = moment();

    switch (dateRange) {
      case "thisWeek": {
        // شنبه‌ی این هفته
        const persianDayOfWeek = now.day() === 6 ? 0 : now.day() + 1;
        return now.clone().subtract(persianDayOfWeek, "days").startOf("day");
      }
      case "thisMonth": {
        // ۱ ماه جاری
        const jMonth = now.jMonth() + 1;
        const jYear = now.jYear();
        return moment(
          `${jYear}/${String(jMonth).padStart(2, "0")}/01`,
          "jYYYY/jMM/jDD",
        ).startOf("day");
      }
      case "thisYear": {
        // ۱ فروردین امسال
        const jYear = now.jYear();
        return moment(`${jYear}/01/01`, "jYYYY/jMM/jDD").startOf("day");
      }
      case "all":
      default:
        return null; // بدون محدودیت
    }
  };

  // ===== فیلتر appointments بر اساس بازه =====
  const filteredByRange = useMemo(() => {
    const startDate = getRangeStartDate();

    if (!startDate) return appointments;

    return appointments.filter((app) => {
      const appMoment = getAppointmentMoment(app);
      if (!appMoment.isValid()) return false;
      return appMoment.isSameOrAfter(startDate, "day");
    });
  }, [appointments, dateRange]);

  // ===== جلسات برگزار شده =====
  const completedAppointments = useMemo(() => {
    return filteredByRange.filter((a) => getDisplayStatus(a) === "completed");
  }, [filteredByRange]);

  // ===== آمار =====
  const stats = useMemo(() => {
    const completed = filteredByRange.filter(
      (a) => getDisplayStatus(a) === "completed",
    ).length;

    const noShow = filteredByRange.filter(
      (a) => getDisplayStatus(a) === "no-show",
    ).length;

    const cancelled = filteredByRange.filter(
      (a) => getDisplayStatus(a) === "cancelled",
    ).length;

    const pending = filteredByRange.filter((a) => {
      const ds = getDisplayStatus(a);
      return ds === "pending" || ds === "confirmed" || ds === "ongoing";
    }).length;

    // ===== درآمد کل =====
    const totalRevenue = filteredByRange
      .filter((a) => getDisplayStatus(a) === "completed")
      .reduce((sum, a) => sum + (a.price || 0), 0);

    return {
      completed,
      noShow,
      cancelled,
      pending,
      totalRevenue,
    };
  }, [filteredByRange]);

  // ===== لیست تراکنش‌ها (فقط completed + no-show) =====
  const transactions = useMemo(() => {
    let filtered = filteredByRange.filter((a) => {
      const ds = getDisplayStatus(a);
      return ds === "completed" || ds === "no-show";
    });

    // ===== فیلتر پرداخت =====
    if (paymentFilter === "paid") {
      filtered = filtered.filter((a) => a.isPaid);
    } else if (paymentFilter === "unpaid") {
      filtered = filtered.filter((a) => !a.isPaid);
    }

    // ===== مرتب‌سازی (جدیدترین اول) =====
    return [...filtered].sort((a, b) => {
      const momentA = getAppointmentMoment(a);
      const momentB = getAppointmentMoment(b);
      return momentB - momentA;
    });
  }, [filteredByRange, paymentFilter]);

  // ===== تغییر وضعیت پرداخت =====
  const handleTogglePaid = (appointment) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointment.id
          ? {
              ...item,
              isPaid: !item.isPaid,
              paidAt: !item.isPaid
                ? toPersianDigits(moment().format("jYYYY/jMM/jDD"))
                : null,
            }
          : item,
      ),
    );
  };

  // ===== شمارنده پرداخت‌ها =====
  const paidCount = completedAppointments.filter((a) => a.isPaid).length;
  const unpaidCount = completedAppointments.filter((a) => !a.isPaid).length;

  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>💰 مالی</h2>
          <p>گزارش درآمد و وضعیت پرداخت جلسات</p>
        </div>

        {/* فیلتر بازه */}
        <div className={styles.financialRangeFilter}>
          <select
            className={styles.formSelect}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">از ابتدا</option>
            <option value="thisYear">امسال</option>
            <option value="thisMonth">این ماه</option>
            <option value="thisWeek">این هفته</option>
          </select>
        </div>
      </div>

      {/* ===== آمار ===== */}
      <div className={styles.financialStatsGrid}>
        {/* برگزار شده */}
        <div
          className={`${styles.financialStatCard} ${styles.finStatCompleted}`}
        >
          <div className={styles.finStatIcon}>✅</div>
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.completed)}
            </span>
            <span className={styles.finStatLabel}>برگزار شده</span>
          </div>
        </div>

        {/* برگزار نشده */}
        <div className={`${styles.financialStatCard} ${styles.finStatNoShow}`}>
          <div className={styles.finStatIcon}>⚠️</div>
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.noShow + stats.cancelled)}
            </span>
            <span className={styles.finStatLabel}>برگزار نشده / لغو شده</span>
          </div>
        </div>

        {/* در انتظار */}
        <div className={`${styles.financialStatCard} ${styles.finStatPending}`}>
          <div className={styles.finStatIcon}>⏳</div>
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.pending)}
            </span>
            <span className={styles.finStatLabel}>در انتظار برگزاری</span>
          </div>
        </div>

        {/* درآمد کل */}
        <div className={`${styles.financialStatCard} ${styles.finStatRevenue}`}>
          <div className={styles.finStatIcon}>💰</div>
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.totalRevenue.toLocaleString("en-US"))}
            </span>
            <span className={styles.finStatLabel}>درآمد کل (تومان)</span>
          </div>
        </div>
      </div>

      {/* ===== راهنمای مالی ===== */}
      <div className={styles.financialHint}>
        <span className={styles.financialHintIcon}>💡</span>
        <p>
          درآمد فقط از جلسات <strong>برگزار شده</strong> محاسبه می‌شود. برای هر
          جلسه، وضعیت پرداخت بیمار را تایید کنید.
        </p>
      </div>

      {/* ===== بخش تراکنش‌ها ===== */}
      <div className={styles.financialTransactionsSection}>
        <div className={styles.financialTransHeader}>
          <div>
            <h3>📋 تراکنش‌ها</h3>
            <p className={styles.financialTransSubtitle}>
              {toPersianDigits(paidCount)} پرداخت شده •{" "}
              {toPersianDigits(unpaidCount)} پرداخت نشده
            </p>
          </div>

          {/* فیلتر پرداخت */}
          <div className={styles.financialFilterTabs}>
            <button
              className={`${styles.financialFilterTab} ${
                paymentFilter === "all" ? styles.financialFilterTabActive : ""
              }`}
              onClick={() => setPaymentFilter("all")}
            >
              همه ({toPersianDigits(transactions.length)})
            </button>
            <button
              className={`${styles.financialFilterTab} ${
                paymentFilter === "paid" ? styles.financialFilterTabActive : ""
              }`}
              onClick={() => setPaymentFilter("paid")}
            >
              ✅ پرداخت شده ({toPersianDigits(paidCount)})
            </button>
            <button
              className={`${styles.financialFilterTab} ${
                paymentFilter === "unpaid"
                  ? styles.financialFilterTabActive
                  : ""
              }`}
              onClick={() => setPaymentFilter("unpaid")}
            >
              ⏳ پرداخت نشده ({toPersianDigits(unpaidCount)})
            </button>
          </div>
        </div>

        {/* ===== لیست تراکنش‌ها ===== */}
        <div className={styles.financialTransList}>
          {transactions.length > 0 ? (
            transactions.map((appointment) => {
              const displayStatus = getDisplayStatus(appointment);
              const isCompleted = displayStatus === "completed";
              const isNoShow = displayStatus === "no-show";

              return (
                <div
                  key={appointment.id}
                  className={`${styles.financialTransItem} ${
                    appointment.isPaid ? styles.finTransItemPaid : ""
                  }`}
                >
                  {/* تاریخ */}
                  <div className={styles.finTransDate}>
                    {appointment.date}
                    <span className={styles.finTransTime}>
                      {toPersianDigits(
                        appointment.startTime ||
                          appointment.time.split(" - ")[0],
                      )}
                    </span>
                  </div>

                  {/* بیمار */}
                  <div className={styles.finTransPatient}>
                    <span className={styles.finTransAvatar}>👤</span>
                    <div>
                      <span className={styles.finTransName}>
                        {appointment.patient}
                      </span>
                      <span className={styles.finTransType}>
                        {appointment.type}
                      </span>
                    </div>
                  </div>

                  {/* وضعیت جلسه */}
                  <div className={styles.finTransStatus}>
                    {isCompleted && (
                      <span className={styles.statusCompletedBadge}>
                        ✅ برگزار شده
                      </span>
                    )}
                    {isNoShow && (
                      <span className={styles.statusNoShowBadge}>
                        ⚠️ برگزار نشده
                      </span>
                    )}
                  </div>

                  {/* مبلغ */}
                  <div className={styles.finTransAmount}>
                    {toPersianDigits(
                      (appointment.price || 0).toLocaleString("en-US"),
                    )}{" "}
                    <span className={styles.finTransAmountUnit}>تومان</span>
                  </div>

                  {/* وضعیت پرداخت */}
                  <div className={styles.finTransPayment}>
                    {isCompleted ? (
                      <button
                        className={`${styles.finTransPayBtn} ${
                          appointment.isPaid
                            ? styles.finTransPayBtnPaid
                            : styles.finTransPayBtnUnpaid
                        }`}
                        onClick={() => handleTogglePaid(appointment)}
                        title={
                          appointment.isPaid
                            ? "لغو تایید پرداخت"
                            : "تایید پرداخت"
                        }
                      >
                        {appointment.isPaid
                          ? "✅ پرداخت شده"
                          : "⏳ پرداخت نشده"}
                      </button>
                    ) : (
                      <span className={styles.finTransNoPayment}>—</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>💰</span>
              <h3>هیچ تراکنشی در این بازه وجود ندارد</h3>
              <p>جلسات برگزار شده یا برگزار نشده در این بازه ثبت نشده است.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Doctor Profile
// ============================================
// function DoctorProfile({ userData }) {
//   return (
//     <div className={styles.pageContent}>
//       <div className={styles.pageHeader}>
//         <div className={styles.headerInfo}>
//           <h2>👤 پروفایل</h2>
//           <p>اطلاعات شخصی شما</p>
//         </div>
//         <button className={styles.editBtn}>✏️ ویرایش</button>
//       </div>
//       <div className={styles.profileCard}>
//         <div className={styles.profileAvatar}>
//           <img src={doctorAvatar} alt="" />
//         </div>
//         <div className={styles.profileInfo}>
//           <h3>دکتر محمد رضایی</h3>
//           <p>روانشناس بالینی</p>
//           <p>📱 {userData?.phone || "۹۰۱۲۳۴۵۶۷۸"}</p>
//           <p>📧 dr.rezaei@email.com</p>
//           <div className={styles.profileStats}>
//             <span>۱۲ بیمار فعال</span>
//             <span>۴۸ جلسه برگزار شده</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

function DoctorProfile({ userData }) {
  const profile = seedData.doctorProfile;

  // ===== محاسبه‌ی آمار =====
  const stats = useMemo(() => {
    const activePatients = seedData.doctorPatients.filter(
      (p) => p.status === "active",
    ).length;

    const completedSessions = seedData.doctorAppointments.filter(
      (a) => a.status === "completed",
    ).length;

    return {
      activePatients,
      completedSessions,
    };
  }, []);

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
          <h3>{profile.name}</h3>
          <p>{profile.specialty}</p>
          <p>📱 {profile.phone}</p>
          <p>📧 {profile.email}</p>
          <div className={styles.profileStats}>
            <span>{toPersianDigits(stats.activePatients)} بیمار فعال</span>
            <span>
              {toPersianDigits(stats.completedSessions)} جلسه برگزار شده
            </span>
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
