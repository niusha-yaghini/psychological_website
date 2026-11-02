// PatientDashboard.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./PatientDashboard.module.css";
import {
  FaHome,
  FaCalendarAlt,
  FaVideo,
  FaCommentDots,
  FaChartLine,
  FaFileAlt,
  FaUserCircle,
  FaCog,
  FaBell,
} from "react-icons/fa";

import seedData from "../../../../backend/seed";

import moment from "moment-jalaali";

moment.loadPersian({
  usePersianDigits: false,
  dialect: "persian",
});

import logo from "../../../public/images/logo/logo2.png";
import userAvatar from "../../../public/images/Patient_Panel/usericon.png";
import confirmIcon from "../../../public/images/Patient_Panel/confirm_icon.png";

import Sidebar from "./components/Sidebar/Sidebar";
import DashboardOverview from "./components/DashboardOverview/DashboardOverview";
import AppointmentsManagement from "./components/Appointments/Appointments";
import SessionsManagement from "./components/Sessions/Sessions";
import PatientNotifications from "./components/Notifications/Notifications";
import NotificationDropdown from "./components/NotificationDropdown/NotificationDropdown";
// import ProgressView from "./components/ProgressView/ProgressView";
import ExerciseManagement from "./components/Exercises/Exercises";
import PatientProfile from "./components/Profile/PatientProfile";
import PatientSettings from "./components/Settings/PatientSettings";

// ============================================
// ثابت‌های گلوبال (Global Constants)
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

// ============================================
// توابع کمکی گلوبال (Global Helper Functions)
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

// ===== تبدیل ساعت به دقیقه (برای مقایسه) =====
const timeToMinutes = (time) => {
  const englishTime = toEnglishDigits(time);
  const [hours, minutes] = englishTime.split(":").map(Number);
  return hours * 60 + minutes;
};

// ===== تبدیل روز هفته به تاریخ شمسی (با پشتیبانی از هفته) =====
const getDateFromWeekDay = (dayName, weekOffset = 0) => {
  const todayJalali = moment().format("jYYYY/jMM/jDD");
  const [todayYear, todayMonth, todayDay] = toEnglishDigits(todayJalali)
    .split("/")
    .map(Number);

  const todayDate = moment(
    `${todayYear}/${todayMonth}/${todayDay}`,
    "jYYYY/jMM/jDD",
  );

  // ===== تبدیل روز هفته میلادی به ترتیب ایرانی =====
  const gregorianDayOfWeek = todayDate.day();
  const persianDayOfWeek =
    gregorianDayOfWeek === 6 ? 0 : gregorianDayOfWeek + 1;

  // ===== پیدا کردن شنبه این هفته =====
  const saturdayOfThisWeek = todayDate
    .clone()
    .subtract(persianDayOfWeek, "days");

  // ===== اضافه کردن هفته =====
  const saturdayOfTargetWeek = saturdayOfThisWeek
    .clone()
    .add(weekOffset, "weeks");

  // ===== محاسبه تاریخ روز مورد نظر =====
  const targetDayOfWeek = WEEK_DAYS_ORDER[dayName];
  const targetDate = saturdayOfTargetWeek.clone().add(targetDayOfWeek, "days");

  return targetDate.format("jYYYY/jMM/jDD");
};

// ===== تبدیل روز هفته به تاریخ شمسی (بر اساس هفته جاری) =====
// ===== گرفتن روز ماه از تاریخ شمسی =====
const getDayOfMonthFromWeekDay = (dayName, weekOffset = 0) => {
  const fullDate = getDateFromWeekDay(dayName, weekOffset);
  const parts = toEnglishDigits(fullDate).split("/");
  return toPersianDigits(parts[2]);
};

// ===== چک کردن آیا روز گذشته است =====
const isDayPast = (dayName, weekOffset = 0) => {
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

  const targetDayOfWeek = WEEK_DAYS_ORDER[dayName];

  // ===== اگه هفته آینده یا بعدتر بود، غیرفعال نمیشه =====
  if (weekOffset > 0) return false;

  // ===== هفته فعلی: فقط روزهای قبل غیرفعال =====
  return targetDayOfWeek < persianDayOfWeek;
};

// ===== چک کردن آیا یک ساعت قابل انتخاب است (حداقل ۱ ساعت فاصله) =====
const isTimeSelectable = (timeString, dayName, weekOffset = 0) => {
  const timeStart = toEnglishDigits(timeString);
  const [hours, minutes] = timeStart.split(":").map(Number);

  const now = moment();
  const targetDate = getDateFromWeekDay(dayName, weekOffset);

  const [targetYear, targetMonth, targetDay] = toEnglishDigits(targetDate)
    .split("/")
    .map(Number);

  const appointmentDateTime = moment(
    `${targetYear}/${targetMonth}/${targetDay} ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
    "jYYYY/jMM/jDD HH:mm",
  );

  const diffMinutes = appointmentDateTime.diff(now, "minutes");
  return diffMinutes >= 60;
};

// ===== چک کردن آیا ساعت قبلاً رزرو شده =====
const isTimeAlreadyBooked = (
  appointments,
  dayName,
  timeString,
  weekOffset = 0,
) => {
  const targetDate = getDateFromWeekDay(dayName, weekOffset);
  const targetTime = toPersianDigits(timeString);

  return appointments.some((appointment) => {
    if (
      appointment.status !== "confirmed" &&
      appointment.status !== "pending"
    ) {
      return false;
    }

    if (appointment.date !== targetDate) return false;

    if (appointment.hours && Array.isArray(appointment.hours)) {
      return appointment.hours.includes(targetTime);
    }

    const [start, end] = appointment.time
      .split(" - ")
      .map((t) => toPersianDigits(t));

    return targetTime >= start && targetTime < end;
  });
};

// ===== محاسبه ساعت پایان =====
// const getEndTime = (startTime) => {
//   const timeStart = toEnglishDigits(startTime);
//   const [hours] = timeStart.split(":").map(Number);
//   const endHour = (hours + 1) % 24;
//   return `${String(hours).padStart(2, "0")}:۰۰ - ${String(endHour).padStart(2, "0")}:۰۰`;
// };

// ===== تبدیل اعداد به فرمت با کاما =====
const formatPrice = (price) => {
  if (!price && price !== 0) return "۰";
  return price.toLocaleString("fa-IR");
};

// ===== ساخت moment از تاریخ و ساعت نوبت =====
const getAppointmentMoment = (appointment) => {
  const dateParts = toEnglishDigits(appointment.date).split("/");
  const timeParts = toEnglishDigits(appointment.time.split(" - ")[0]).split(
    ":",
  );

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

// ===== تعیین وضعیت نمایشی نوبت =====
const getDisplayStatus = (appointment) => {
  if (appointment.status === "completed") return "completed";
  if (appointment.status === "cancelled") return "cancelled";

  const appointmentMoment = getAppointmentMoment(appointment);
  if (!appointmentMoment.isValid()) return appointment.status;

  const now = moment();
  const durationMinutes = (appointment.duration || 1) * 60;
  const endMoment = appointmentMoment.clone().add(durationMinutes, "minutes");

  const isPast = appointmentMoment.isBefore(now);
  const isEnded = endMoment.isBefore(now);

  // ===== اگه جلسه در حال برگزاریه =====
  if (isPast && !isEnded && appointment.status === "confirmed") {
    return "confirmed"; // ← هنوز confirmed بمونه (ongoing جدا مدیریت میشه)
  }

  // ===== اگه جلسه کامل تموم شده =====
  if (isEnded) {
    if (appointment.status === "pending") return "expired";
    if (appointment.status === "confirmed") return "no-show";
  }

  return appointment.status;
};

const canCancel = (appointment) => {
  const displayStatus = getDisplayStatus(appointment);
  if (displayStatus !== "confirmed" && displayStatus !== "pending")
    return false;

  const appointmentMoment = getAppointmentMoment(appointment);
  if (!appointmentMoment.isValid()) return false;

  const diffHours = appointmentMoment.diff(moment(), "hours", true);

  if (appointment.status === "pending") return true;
  if (appointment.status === "confirmed") return diffHours >= 24;

  return false;
};

const isCancelDisabled = (appointment) => {
  const displayStatus = getDisplayStatus(appointment);
  if (displayStatus !== "confirmed") return false;

  const appointmentMoment = getAppointmentMoment(appointment);
  if (!appointmentMoment.isValid()) return false;

  const diffHours = appointmentMoment.diff(moment(), "hours", true);
  return diffHours < 24 && diffHours > 0;
};

const isAppointmentPast = (appointment) => {
  const appointmentMoment = getAppointmentMoment(appointment);
  if (!appointmentMoment.isValid()) return false;
  return appointmentMoment.isBefore(moment());
};

// ===== چک کردن اینکه ساعت‌ها پشت سر هم هستن =====
const areTimesConsecutive = (times) => {
  if (times.length <= 1) return true;

  // ===== مرتب‌سازی بر اساس دقیقه =====
  const sortedMinutes = times
    .map((t) => timeToMinutes(t))
    .sort((a, b) => a - b);

  const ONE_HOUR = 60;

  // ===== چک کردن اختلاف ۶۰ دقیقه بین هر دو تا =====
  for (let i = 1; i < sortedMinutes.length; i++) {
    const diff = sortedMinutes[i] - sortedMinutes[i - 1];
    if (diff !== ONE_HOUR) {
      return false;
    }
  }
  return true;
};

// ===== چک کردن اینکه ساعت جدید با ساعت‌های انتخاب‌شده پشت سر هم است =====
const canAddTime = (newTime, selectedTimes, availableTimes) => {
  // اگه به سقف ۳ ساعت رسیده باشه
  if (selectedTimes.length >= 3) return false;

  // اگه ساعت قبلاً انتخاب شده باشه
  if (selectedTimes.includes(newTime)) return false;

  // اگه هنوز چیزی انتخاب نشده، میتونه اضافه کنه
  if (selectedTimes.length === 0) return true;

  // ===== چک کردن پشت سر هم بودن با اختلاف ۶۰ دقیقه =====
  const newTimeMinutes = timeToMinutes(newTime);
  const ONE_HOUR = 60;

  return selectedTimes.some((existingTime) => {
    const existingMinutes = timeToMinutes(existingTime);
    const diff = Math.abs(newTimeMinutes - existingMinutes);

    // اختلاف باید دقیقاً ۶۰ دقیقه باشه
    return diff === ONE_HOUR;
  });
};

// ===== چک کردن آیا نوبت "انجام نشده" است =====
const isNotCompleted = (appointment) => {
  const displayStatus = getDisplayStatus(appointment);
  return (
    displayStatus === "cancelled" ||
    displayStatus === "expired" ||
    displayStatus === "no-show"
  );
};

// ===== چک کردن آیا جلسه در حال برگزاری است =====
const isSessionOngoing = (appointment) => {
  const startMoment = getAppointmentMoment(appointment);
  if (!startMoment.isValid()) return false;

  const now = moment();
  const diffMinutes = startMoment.diff(now, "minutes");

  // اگه زمان شروع رسیده و هنوز تموم نشده
  // duration به دقیقه: appointment.duration * 60
  const durationMinutes = (appointment.duration || 1) * 60;
  const endMoment = startMoment.clone().add(durationMinutes, "minutes");

  return now.isAfter(startMoment) && now.isBefore(endMoment);
};

// ===== تبدیل وضعیت به اطلاعات نمایشی =====
// const getStatusInfo = (status) => {
//   const map = {
//     pending: { label: "در انتظار", className: "statusPending" },
//     confirmed: { label: "تأیید شده", className: "statusConfirmed" },
//     completed: { label: "انجام شده", className: "statusCompleted" },
//     cancelled: { label: "لغو شده", className: "statusCancelled" },
//   };
//   return map[status] || map.pending;
// };

const appointmentsHelpers = {
  toPersianDigits,
  getDisplayStatus,
  canCancel,
  isCancelDisabled,
  isAppointmentPast,
  isNotCompleted,
  timeToMinutes,
  areTimesConsecutive,
  canAddTime,
  getDateFromWeekDay,
  getDayOfMonthFromWeekDay,
  isDayPast,
  isTimeSelectable,
  isTimeAlreadyBooked,
  formatPrice,
  WEEK_DAYS_ORDER,
  toEnglishDigits,
};

// ============================================
// کامپوننت‌ها (Components)
// ============================================

function PatientDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // ==========================================
  // STATE های اصلی از seed.js
  // ==========================================

  // ===== داده‌های نوبت‌ها =====
  const [appointments, setAppointments] = useState(seedData.appointments);

  // ===== داده‌های نوتیفیکیشن =====
  const [notifications, setNotifications] = useState(seedData.notifications);

  // ===== زمان ثابت ایجاد هر اعلان =====
  const [notificationCreatedAt, setNotificationCreatedAt] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("patientNotificationCreatedAt") || "{}",
      );
    } catch {
      return {};
    }
  });

  // ===== فرمت تاریخ و ساعت ایجاد اعلان =====
  const formatNotificationTime = (notification) => {
    const createdAt = notificationCreatedAt[notification.id];

    if (!createdAt) return "";

    return toPersianDigits(moment(createdAt).format("jYYYY/jMM/jDD - HH:mm"));
  };

  // ===== Settings State =====
  const [notificationSettings, setNotificationSettings] = useState(
    seedData.settings.notificationSettings,
  );

  const [displaySettings, setDisplaySettings] = useState(
    seedData.settings.displaySettings,
  );

  // ===== محاسبه تعداد جلسات پیش‌رو =====
  const upcomingAppointmentsCount = useMemo(() => {
    return appointments.filter((app) => {
      const displayStatus = getDisplayStatus(app);
      return displayStatus === "confirmed" || displayStatus === "pending";
    }).length;
  }, [appointments]);

  // ===== محاسبه تعداد پیام‌های خوانده نشده =====
  const unreadMessagesCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // ===== توابع =====
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true })),
    );
  };

  // ===== ثبت زمان ایجاد اعلان‌های جدید =====
  useEffect(() => {
    const missingNotifications = notifications.filter(
      (notification) => !notificationCreatedAt[notification.id],
    );

    if (missingNotifications.length === 0) return;

    const now = Date.now();
    const updatedTimestamps = { ...notificationCreatedAt };

    missingNotifications.forEach((notification) => {
      updatedTimestamps[notification.id] = now;
    });

    localStorage.setItem(
      "patientNotificationCreatedAt",
      JSON.stringify(updatedTimestamps),
    );

    setNotificationCreatedAt(updatedTimestamps);
  }, [notifications, notificationCreatedAt]);

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

  // ===== خروج از حساب =====
  const handleLogout = () => {
    localStorage.removeItem("userLoggedIn");
    navigate("/");
  };

  // ===== منوهای سایدبار =====
  const menuItems = [
    {
      id: "dashboard",
      label: "داشبورد",
      icon: <FaHome />,
      path: "/dashboard",
    },
    {
      id: "appointments",
      label: "نوبت‌های من",
      icon: <FaCalendarAlt />,
      path: "/appointments",
      badge:
        upcomingAppointmentsCount > 0 ? upcomingAppointmentsCount : undefined,
    },
    {
      id: "sessions",
      label: "جلسات آنلاین",
      icon: <FaVideo />,
      path: "/sessions",
    },
    {
      id: "messages",
      label: "پیام‌ها",
      icon: <FaCommentDots />,
      path: "/messages",
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined,
    },
    // {
    //   id: "progress",
    //   label: "پیشرفت من",
    //   icon: <FaChartLine />,
    //   path: "/progress",
    // },
    {
      id: "exercise",
      label: "تمارین",
      icon: <FaFileAlt />,
      path: "/exercise",
    },
  ];

  const bottomMenuItems = [
    {
      id: "profile",
      label: "پروفایل",
      icon: <FaUserCircle />,
      path: "/profile",
    },
    {
      id: "settings",
      label: "تنظیمات",
      icon: <FaCog />,
      path: "/settings",
    },
  ];

  // ===== رندر محتوای هر بخش =====
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview
            appointments={appointments}
            getDisplayStatus={getDisplayStatus}
          />
        );
      case "appointments":
        return (
          <AppointmentsManagement
            appointments={appointments}
            setAppointments={setAppointments}
            doctors={seedData.doctors}
            helpers={appointmentsHelpers}
            confirmIcon={confirmIcon}
          />
        );
      case "sessions":
        return (
          <SessionsManagement
            appointments={appointments}
            setAppointments={setAppointments}
            getDisplayStatus={getDisplayStatus}
            getAppointmentMoment={getAppointmentMoment}
            isSessionOngoing={isSessionOngoing}
            toPersianDigits={toPersianDigits}
          />
        );
      case "messages":
        return (
          <PatientNotifications
            notifications={notifications}
            setNotifications={setNotifications}
            formatNotificationTime={formatNotificationTime}
          />
        );
      // case "progress":
      //   return <ProgressView progressData={seedData.progress} />;
      case "exercise":
        return <ExerciseManagement initialExercises={seedData.exercises} />;
      case "profile":
        return (
          <PatientProfile
            profileData={seedData.profile}
            userAvatar={userAvatar}
          />
        );
      case "settings":
        return (
          <PatientSettings
            notificationSettings={notificationSettings}
            setNotificationSettings={setNotificationSettings}
            displaySettings={displaySettings}
            setDisplaySettings={setDisplaySettings}
          />
        );
      default:
        return (
          <DashboardOverview
            appointments={appointments}
            getDisplayStatus={getDisplayStatus}
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
        {/* هدر */}
        <header className={styles.mainHeader}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {menuItems.find((item) => item.id === activeTab)?.label ||
                "داشبورد"}
            </h1>
          </div>

          <div className={styles.headerRight}>
            <NotificationDropdown
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              formatNotificationTime={formatNotificationTime}
            />
          </div>
        </header>

        {/* محتوای اصلی */}
        <div className={styles.contentArea}>{renderContent()}</div>
      </main>
    </div>
  );
}

export default PatientDashboard;
