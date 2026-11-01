import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DrDashboard.module.css";

import Sidebar from "./components/Sidebar/Sidebar";
import DashboardOverview from "./components/DashboardOverview/DashboardOverview";
import AppointmentsManagement from "./components/Appointments/Appointments";
import SessionsManagement from "./components/Sessions/Sessions";
import CalendarView from "./components/CalendarView/CalendarView";
import PatientsList from "./components/Patients/PatientsList";
import ExercisesManagement from "./components/Exercises/Exercises";
import NotificationDropdown from "./components/NotificationDropdown/NotificationDropdown";
import Notifications from "./components/Notifications/Notifications";
import FinancialView from "./components/FinancialView/FinancialView";
import DoctorProfile from "./components/Profile/DoctorProfile";
import DoctorSettings from "./components/Settings/DoctorSettings";

import {
  FaHome,
  FaCalendarAlt,
  FaCalendarWeek,
  FaVideo,
  FaUsers,
  FaClipboardList,
  FaCommentDots,
  FaUserCircle,
  FaCog,
  FaMoneyBillWave,
} from "react-icons/fa";

import logo from "../../../public/images/logo/logo2.png";
import doctorAvatar from "../../../public/images/Patient_Panel/usericon.png";

import seedData from "../../../../backend/seed";
import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: false, dialect: "persian" });

// ============================================
// توابع کمکی (Global Helpers)
// ============================================

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

// ===== چک کردن اینکه نوبت امروز است =====
const isAppointmentToday = (appointment) => {
  const appointmentMoment = getAppointmentMoment(appointment);
  if (!appointmentMoment.isValid()) return false;
  return appointmentMoment.isSame(moment(), "day");
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

  const [notificationCreatedAt, setNotificationCreatedAt] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("doctorNotificationCreatedAt") || "{}",
      );
    } catch {
      return {};
    }
  });

  // ===== وضعیت موقت خوانده شدن اعلان‌ها =====
  const [readNotificationIds, setReadNotificationIds] = useState([]);

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

  // ===== علامت‌گذاری اعلان به عنوان خوانده شده =====
  const markNotificationAsRead = (id) => {
    // اعلان‌های ذخیره‌شده
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification,
      ),
    );

    // اعلان‌های Dynamic و وضعیت نمایشی مشترک
    setReadNotificationIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  };

  // ===== علامت‌گذاری همه اعلان‌ها به عنوان خوانده شده =====
  const markAllNotificationsAsRead = () => {
    // اعلان‌های ذخیره‌شده
    setNotifications((prev) =>
      prev.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    );

    // تمام اعلان‌های فعلی، شامل Dynamic
    setReadNotificationIds(derivedNotifications.map((n) => n.id));
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
          // time: "الان",
          time: currentTime.format("jYYYY/jMM/jDD - HH:mm"),
          isRead: false,
        });
      }
    }

    // ==========================================
    // نوتیفیکیشن ۲: جلسات در انتظار تأیید (بیش از ۲۴ ساعت)
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
        // time: "الان",
        time: currentTime.format("jYYYY/jMM/jDD - HH:mm"),
        isRead: false,
      });
    }

    // ==========================================
    // نوتیفیکیشن ۳: جلسات گذشته که نیاز به ثبت وضعیت دارند
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
        // time: "الان",
        time: currentTime.format("jYYYY/jMM/jDD - HH:mm"),
        isRead: false,
      });
    }

    return result.map((notification) => {
      const createdAt = notificationCreatedAt[notification.id];

      return {
        ...notification,
        time: createdAt
          ? toPersianDigits(moment(createdAt).format("jYYYY/jMM/jDD - HH:mm"))
          : toPersianDigits(currentTime.format("jYYYY/jMM/jDD - HH:mm")),

        isRead:
          notification.isRead || readNotificationIds.includes(notification.id),
      };
    });
  }, [
    appointments,
    notifications,
    currentTime,
    readNotificationIds,
    notificationCreatedAt,
  ]);

  // ===== ثبت زمان ایجاد اعلان‌های جدید =====
  useEffect(() => {
    const missingNotifications = derivedNotifications.filter(
      (notification) => !notificationCreatedAt[notification.id],
    );

    if (missingNotifications.length === 0) return;

    const now = Date.now();
    const updatedTimestamps = { ...notificationCreatedAt };

    missingNotifications.forEach((notification) => {
      updatedTimestamps[notification.id] = now;
    });

    localStorage.setItem(
      "doctorNotificationCreatedAt",
      JSON.stringify(updatedTimestamps),
    );

    setNotificationCreatedAt(updatedTimestamps);
  }, [derivedNotifications, notificationCreatedAt]);

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
      id: "calendar",
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
    {
      id: "messages",
      label: "اعلان‌ها",
      icon: <FaCommentDots />,
      badge:
        unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    {
      id: "financial",
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
            toPersianDigits={toPersianDigits}
            getDisplayStatus={getDisplayStatus}
            getAppointmentMoment={getAppointmentMoment}
            isAppointmentToday={isAppointmentToday}
            getStatusInfo={getStatusInfo}
            getTypeLabel={getTypeLabel}
            getRelativeDateLabel={getRelativeDateLabel}
            activePatientsCount={
              seedData.doctorPatients.filter((p) => p.status === "active")
                .length
            }
            exercisesSentCount={seedData.exercises?.length || 0}
          />
        );
      case "appointments":
        return (
          <AppointmentsManagement
            appointments={appointments}
            setAppointments={setAppointments}
            getAppointmentMoment={getAppointmentMoment}
            getDisplayStatus={getDisplayStatus}
            isNotCompleted={isNotCompleted}
            getOriginalStatusInfo={getOriginalStatusInfo}
            getDisplayStatusInfo={getDisplayStatusInfo}
            isFinalizedStatus={isFinalizedStatus}
            getRelativeDateLabel={getRelativeDateLabel}
            toPersianDigits={toPersianDigits}
            toEnglishDigits={toEnglishDigits}
            getTypeLabel={getTypeLabel}
            isMoreThan24HoursAway={isMoreThan24HoursAway}
            isLessThan24HoursAway={isLessThan24HoursAway}
            pricePerHour={seedData.doctorProfile.pricePerHour || 0}
            moment={moment}
          />
        );
      case "sessions":
        return (
          <SessionsManagement
            appointments={appointments}
            setAppointments={setAppointments}
            getDisplayStatus={getDisplayStatus}
            getAppointmentMoment={getAppointmentMoment}
            toPersianDigits={toPersianDigits}
            getTypeLabel={getTypeLabel}
            moment={moment}
          />
        );
      case "calendar":
        return (
          <CalendarView
            appointments={appointments}
            moment={moment}
            toEnglishDigits={toEnglishDigits}
            toPersianDigits={toPersianDigits}
            getDisplayStatus={getDisplayStatus}
            getDisplayStatusInfo={getDisplayStatusInfo}
          />
        );
      case "patients":
        return (
          <PatientsList
            patients={patients}
            setPatients={setPatients}
            appointments={appointments}
            setAppointments={setAppointments}
            moment={moment}
            toPersianDigits={toPersianDigits}
            getAppointmentMoment={getAppointmentMoment}
            getDisplayStatus={getDisplayStatus}
            getDisplayStatusInfo={getDisplayStatusInfo}
            doctorName={seedData.doctorProfile.name}
          />
        );
      case "exercises":
        return (
          <ExercisesManagement
            patients={patients}
            appointments={appointments}
            setAppointments={setAppointments}
            moment={moment}
            toEnglishDigits={toEnglishDigits}
            toPersianDigits={toPersianDigits}
            getDisplayStatus={getDisplayStatus}
            getAppointmentMoment={getAppointmentMoment}
            doctorName={seedData.doctorProfile.name}
          />
        );
      case "messages":
        return (
          <Notifications
            notifications={derivedNotifications}
            onMarkAsRead={markNotificationAsRead}
            onMarkAllAsRead={markAllNotificationsAsRead}
            toPersianDigits={toPersianDigits}
          />
        );
      case "financial":
        return (
          <FinancialView
            appointments={appointments}
            setAppointments={setAppointments}
            moment={moment}
            getAppointmentMoment={getAppointmentMoment}
            getDisplayStatus={getDisplayStatus}
            toPersianDigits={toPersianDigits}
          />
        );
      case "profile":
        return (
          <DoctorProfile
            profile={seedData.doctorProfile}
            patients={patients}
            appointments={appointments}
            toPersianDigits={toPersianDigits}
          />
        );
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
      <Sidebar
        logo={logo}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        menuItems={menuItems}
        bottomMenuItems={bottomMenuItems}
        onLogout={handleLogout}
      />

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
            <NotificationDropdown
              notifications={derivedNotifications}
              onMarkAsRead={markNotificationAsRead}
              onMarkAllAsRead={markAllNotificationsAsRead}
              onViewAll={() => setActiveTab("messages")}
              toPersianDigits={toPersianDigits}
            />
          </div>
        </header>

        <div className={styles.contentArea}>{renderContent()}</div>
      </main>
    </div>
  );
}

// // ============================================
// // COMPONENT: Doctor Profile
// // ============================================
// function DoctorProfile({ userData }) {
//   const profile = seedData.doctorProfile;

//   // ===== محاسبه‌ی آمار =====
//   const stats = useMemo(() => {
//     const activePatients = seedData.doctorPatients.filter(
//       (p) => p.status === "active",
//     ).length;

//     const completedSessions = seedData.doctorAppointments.filter(
//       (a) => a.status === "completed",
//     ).length;

//     return {
//       activePatients,
//       completedSessions,
//     };
//   }, []);

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
//           <h3>{profile.name}</h3>
//           <p>{profile.specialty}</p>
//           <p>📱 {profile.phone}</p>
//           <p>📧 {profile.email}</p>
//           <div className={styles.profileStats}>
//             <span>{toPersianDigits(stats.activePatients)} بیمار فعال</span>
//             <span>
//               {toPersianDigits(stats.completedSessions)} جلسه برگزار شده
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // COMPONENT: Doctor Settings
// // ============================================
// function DoctorSettings() {
//   return (
//     <div className={styles.pageContent}>
//       <div className={styles.pageHeader}>
//         <div className={styles.headerInfo}>
//           <h2>⚙️ تنظیمات</h2>
//           <p>تنظیمات حساب کاربری</p>
//         </div>
//       </div>
//       <div className={styles.settingsList}>
//         <div className={styles.settingItem}>
//           <span>🔔 اعلان‌ها</span>
//           <label className={styles.switch}>
//             <input type="checkbox" defaultChecked />
//             <span className={styles.switchSlider}></span>
//           </label>
//         </div>
//         <div className={styles.settingItem}>
//           <span>⏰ زمانبندی جلسات</span>
//           <button className={styles.settingBtn}>مدیریت</button>
//         </div>
//         <div className={styles.settingItem}>
//           <span>🌙 حالت شب</span>
//           <label className={styles.switch}>
//             <input type="checkbox" />
//             <span className={styles.switchSlider}></span>
//           </label>
//         </div>
//       </div>
//     </div>
//   );
// }

export default DoctorDashboard;
