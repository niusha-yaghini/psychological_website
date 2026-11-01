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
  // FaBell,
  // FaPlus,
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

  // ===== وضعیت موقت خوانده شدن اعلان‌ها =====
  const [readNotificationIds, setReadNotificationIds] = useState([]);

  // // ===== وضعیت Dropdown اعلان‌ها =====
  // const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] =
  //   useState(false);

  // const notificationDropdownRef = useRef(null);

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
  // const markNotificationAsRead = (id) => {
  //   setNotifications((prev) =>
  //     prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
  //   );
  // };

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

  // ===== علامت‌گذاری همه =====
  // const markAllNotificationsAsRead = () => {
  //   setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  // };

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
          time: "الان",
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
        time: "الان",
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
        time: "الان",
        isRead: false,
      });
    }

    //   return result;
    // }, [appointments, notifications, currentTime]);
    return result.map((notification) =>
      readNotificationIds.includes(notification.id)
        ? { ...notification, isRead: true }
        : notification,
    );
  }, [appointments, notifications, currentTime, readNotificationIds]);

  // ===== ریست وضعیت موقت اعلان‌های Dynamic با تغییر داده‌های مبنا =====
  // useEffect(() => {
  //   setReadNotificationIds([]);
  // }, [appointments, currentTime]);

  // ===== بستن Dropdown با کلیک خارج از آن =====
  // useEffect(() => {
  //   if (!isNotificationDropdownOpen) return;

  //   const handleClickOutside = (event) => {
  //     if (
  //       notificationDropdownRef.current &&
  //       !notificationDropdownRef.current.contains(event.target)
  //     ) {
  //       setIsNotificationDropdownOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [isNotificationDropdownOpen]);

  // ===== تعداد اعلان‌های خوانده نشده =====
  const unreadNotificationsCount = useMemo(() => {
    return derivedNotifications.filter((n) => !n.isRead).length;
  }, [derivedNotifications]);

  // ===== آخرین ۵ اعلان خوانده‌نشده =====
  // const unreadNotifications = useMemo(() => {
  //   return derivedNotifications
  //     .filter((notification) => !notification.isRead)
  //     .slice(0, 5);
  // }, [derivedNotifications]);

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
      // case "messages":
      //   return (
      //     <DoctorMessages
      //       notifications={derivedNotifications}
      //       onMarkAsRead={markNotificationAsRead}
      //       onMarkAllAsRead={markAllNotificationsAsRead}
      //     />
      //   );
      // case "messages":
      //   return (
      //     <DoctorMessages
      //       notifications={derivedNotifications}
      //       onMarkAsRead={markNotificationAsRead}
      //       onMarkAllAsRead={markAllNotificationsAsRead}
      //       toPersianDigits={toPersianDigits}
      //     />
      //   );
      // case "messages":
      //   return (
      //     <DoctorMessages
      //       notifications={derivedNotifications}
      //       onMarkAsRead={markNotificationAsRead}
      //       onMarkAllAsRead={markAllNotificationsAsRead}
      //       toPersianDigits2={toPersianDigits2}
      //     />
      //   );
      case "messages":
  return (
    <DoctorMessages
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

          {/* <div className={styles.headerRight}>
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
          </div> */}

          {/* <div className={styles.headerRight}>
            <div
              className={styles.notificationDropdownWrapper}
              ref={notificationDropdownRef}
            >
              <button
                type="button"
                className={styles.notificationBtn}
                onClick={() => setIsNotificationDropdownOpen((prev) => !prev)}
                title="مشاهده اعلان‌ها"
                aria-label="مشاهده اعلان‌ها"
                aria-expanded={isNotificationDropdownOpen}
              >
                <FaBell />

                {unreadNotificationsCount > 0 && (
                  <span className={styles.notificationDot}>
                    {toPersianDigits(unreadNotificationsCount)}
                  </span>
                )}
              </button>

              {isNotificationDropdownOpen && (
                <div className={styles.notificationDropdown}>
                  <div className={styles.notificationDropdownHeader}>
                    <span className={styles.notificationDropdownTitle}>
                      اعلان‌ها
                    </span>

                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        className={styles.notificationDropdownMarkAll}
                        onClick={markAllNotificationsAsRead}
                      >
                        همه خوانده شدند
                      </button>
                    )}
                  </div>

                  <div className={styles.notificationDropdownList}>
                    {unreadNotifications.length > 0 ? (
                      unreadNotifications.map((notification) => (
                        <button
                          type="button"
                          key={notification.id}
                          className={styles.notificationDropdownItem}
                          onClick={() =>
                            markNotificationAsRead(notification.id)
                          }
                        >
                          <div
                            className={styles.notificationDropdownItemHeader}
                          >
                            <span
                              className={styles.notificationDropdownItemTitle}
                            >
                              {notification.title}
                            </span>

                            <span className={styles.notificationDropdownTime}>
                              {notification.time}
                            </span>
                          </div>

                          <p className={styles.notificationDropdownMessage}>
                            {notification.message}
                          </p>
                        </button>
                      ))
                    ) : (
                      <div className={styles.notificationDropdownEmpty}>
                        <p>همه اعلان‌ها را خوانده‌اید!</p>
                        <span>هیچ اعلان جدیدی وجود ندارد.</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.notificationDropdownFooter}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationDropdownOpen(false);
                        setActiveTab("messages");
                      }}
                    >
                      مشاهده همه اعلان‌ها
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div> */}

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

// ============================================
// COMPONENT: Doctor Messages (Notifications)
// ============================================
// function DoctorMessages({ notifications, onMarkAsRead, onMarkAllAsRead }) {
// function DoctorMessages({
//   notifications,
//   onMarkAsRead,
//   onMarkAllAsRead,
//   toPersianDigits,
// }) {
// function DoctorMessages({
//   notifications,
//   onMarkAsRead,
//   onMarkAllAsRead,
//   toPersianDigits2,
// }) {
function DoctorMessages({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  toPersianDigits,
}) {
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
          <h2>مالی</h2>
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
          {/* <div className={styles.finStatIcon}>✅</div> */}
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.completed)}
            </span>
            <span className={styles.finStatLabel}>برگزار شده</span>
          </div>
        </div>

        {/* برگزار نشده */}
        <div className={`${styles.financialStatCard} ${styles.finStatNoShow}`}>
          {/* <div className={styles.finStatIcon}>⚠️</div> */}
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.noShow + stats.cancelled)}
            </span>
            <span className={styles.finStatLabel}>برگزار نشده / لغو شده</span>
          </div>
        </div>

        {/* در انتظار */}
        <div className={`${styles.financialStatCard} ${styles.finStatPending}`}>
          {/* <div className={styles.finStatIcon}>⏳</div> */}
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.pending)}
            </span>
            <span className={styles.finStatLabel}>در انتظار برگزاری</span>
          </div>
        </div>

        {/* درآمد کل */}
        <div className={`${styles.financialStatCard} ${styles.finStatRevenue}`}>
          {/* <div className={styles.finStatIcon}>💰</div> */}
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
        {/* <span className={styles.financialHintIcon}>💡</span> */}
        <p>
          درآمد فقط از جلسات <strong>برگزار شده</strong> محاسبه می‌شود. برای هر
          جلسه، وضعیت پرداخت بیمار را تایید کنید.
        </p>
      </div>

      {/* ===== بخش تراکنش‌ها ===== */}
      <div className={styles.financialTransactionsSection}>
        <div className={styles.financialTransHeader}>
          <div>
            <h3>تراکنش‌ها</h3>
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
              پرداخت شده ({toPersianDigits(paidCount)})
            </button>
            <button
              className={`${styles.financialFilterTab} ${
                paymentFilter === "unpaid"
                  ? styles.financialFilterTabActive
                  : ""
              }`}
              onClick={() => setPaymentFilter("unpaid")}
            >
              پرداخت نشده ({toPersianDigits(unpaidCount)})
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
                        برگزار شده
                      </span>
                    )}
                    {isNoShow && (
                      <span className={styles.statusNoShowBadge}>
                        برگزار نشده
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
                        {appointment.isPaid ? "پرداخت شده" : "پرداخت نشده"}
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
              {/* <span className={styles.emptyIcon}>💰</span> */}
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
