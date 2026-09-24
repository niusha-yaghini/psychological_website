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
  FaBookOpen,
  FaFileAlt,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBell,
} from "react-icons/fa";

import seedData from "../../../../backend/seed";

import moment from "moment-jalaali";
moment.loadPersian({ usePersianDigits: false, dialect: "persian" });

import logo from "../../../public/images/logo/logo2.png";
import userAvatar from "../../../public/images/Patient_Panel/usericon.png";
import confirmIcon from "../../../public/images/Patient_Panel/confirm_icon.png";

// ============================================
// 📌 ثابت‌های گلوبال (Global Constants)
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
// 📌 توابع کمکی گلوبال (Global Helper Functions)
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
// const toPersianDigits = (str) => {
//   if (!str) return str;
//   const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
//   const englishDigits = "0123456789";
//   return String(str).replace(
//     /[0-9]/g,
//     (d) => persianDigits[englishDigits.indexOf(d)],
//   );
// };

// ===== تبدیل اعداد انگلیسی به فارسی =====
const toPersianDigits = (str) => {
  if (str === null || str === undefined) return str; // ← اصلاح شد
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
const getEndTime = (startTime) => {
  const timeStart = toEnglishDigits(startTime);
  const [hours] = timeStart.split(":").map(Number);
  const endHour = (hours + 1) % 24;
  return `${String(hours).padStart(2, "0")}:۰۰ - ${String(endHour).padStart(2, "0")}:۰۰`;
};

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
// const getDisplayStatus = (appointment) => {
//   if (appointment.status === "completed") return "completed";
//   if (appointment.status === "cancelled") return "cancelled";

//   const appointmentMoment = getAppointmentMoment(appointment);
//   if (!appointmentMoment.isValid()) return appointment.status;

//   const isPast = appointmentMoment.isBefore(moment());

//   if (isPast && appointment.status === "pending") return "expired";
//   if (isPast && appointment.status === "confirmed") return "no-show";

//   return appointment.status;
// };

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

// ============================================
// 📌 کامپوننت‌ها (Components)
// ============================================

function PatientDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // ==========================================
  // 📌 STATE های اصلی از seed.js
  // ==========================================

  // ===== داده‌های نوبت‌ها =====
  const [appointments, setAppointments] = useState(seedData.appointments);

  // ===== داده‌های نوتیفیکیشن =====
  const [notifications, setNotifications] = useState(seedData.notifications);

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
    {
      id: "progress",
      label: "پیشرفت من",
      icon: <FaChartLine />,
      path: "/progress",
    },
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
          <DashboardContent userData={userData} appointments={appointments} />
        );
      case "appointments":
        return (
          <AppointmentsContent
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );
      // case "sessions":
      //   return <SessionsContent />;
      case "sessions":
        return (
          <SessionsContent
            appointments={appointments}
            setAppointments={setAppointments}
          />
        );
      case "messages":
        return (
          <MessagesContent
            notifications={notifications}
            setNotifications={setNotifications}
          />
        );
      case "progress":
        return <ProgressContent />;
      case "exercise":
        return <ExerciseContent />;
      case "profile":
        return <ProfileContent userData={userData} />;
      case "settings":
        return <SettingsContent />;
      default:
        return (
          <DashboardContent userData={userData} appointments={appointments} />
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

        {/* منوهای اصلی */}
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

        {/* منوهای پایینی */}
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
            />
          </div>
        </header>

        {/* محتوای اصلی */}
        <div className={styles.contentArea}>{renderContent()}</div>
      </main>
    </div>
  );
}

// ============================================
// COMPONENT: Dashboard Content
// ============================================
function DashboardContent({ userData, appointments }) {
  // ===== آمار بر اساس داده‌های واقعی =====
  const stats = [
    {
      label: "جلسات برگزار شده",
      value: appointments.filter((a) => a.status === "completed").length,
    },
    // {
    //   label: "جلسات پیش‌رو",
    //   value: appointments.filter(
    //     (a) => a.status === "confirmed" || a.status === "pending",
    //   ).length,
    // },
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

        {/* فعالیت‌های اخیر */}
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

// ============================================
// COMPONENT: Appointments Content
// ============================================

function AppointmentsContent({ appointments, setAppointments }) {
  // =============================================
  // ۱. STATE‌ها
  // =============================================
  const [activeFilter, setActiveFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // =============================================
  // ۲. توابع تبدیل و کمکی
  // =============================================
  const convertPersianToNumber = (persianDate) => {
    if (!persianDate) return 0;

    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const englishDigits = "0123456789";

    const normalized = persianDate.replace(
      /[۰-۹]/g,
      (d) => englishDigits[persianDigits.indexOf(d)],
    );

    const parts = normalized.split("/");

    if (parts.length !== 3) return 0;

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    return year * 10000 + month * 100 + day;
  };

  // ===== تابع تبدیل زمان به عدد برای مقایسه =====
  const getTimeValue = (timeString) => {
    try {
      const [start] = timeString.split(" - ");
      const [hours, minutes] = start.split(":");
      return parseInt(hours) * 60 + parseInt(minutes);
    } catch {
      return 0;
    }
  };

  // ===== دریافت اطلاعات وضعیت اصلی (Badge اول) =====
  const getOriginalStatusInfo = (status) => {
    const statusMap = {
      confirmed: {
        label: "تأیید شده",
        className: styles.statusConfirmed,
      },
      pending: {
        label: "در انتظار تأیید",
        className: styles.statusPending,
      },
      completed: {
        label: "انجام شده",
        className: styles.statusCompleted,
      },
      cancelled: {
        label: "لغو شده",
        className: styles.statusCancelled,
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  // =============================================
  // ۳. متغیرهای مشتق شده (از stateها)
  // =============================================

  // ===== مرتب‌سازی نوبت‌ها بر اساس تاریخ (جدیدترین اول) =====
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = convertPersianToNumber(a.date);
    const dateB = convertPersianToNumber(b.date);

    // مقایسه تاریخ‌ها (جدیدترین اول)
    if (dateA !== dateB) {
      return dateB - dateA; // عدد بزرگتر = تاریخ جدیدتر
    }

    // اگر تاریخ برابر بود، بر اساس زمان
    const timeA = getTimeValue(a.time);
    const timeB = getTimeValue(b.time);
    return timeA - timeB;
  });

  // =============================================
  // ۴. توابعی که از متغیرهای مشتق شده استفاده میکنن
  // =============================================
  const getFilteredAppointments = () => {
    if (activeFilter === "all") return sortedAppointments;

    if (activeFilter === "not-completed") {
      return sortedAppointments.filter((item) => isNotCompleted(item));
    }

    return sortedAppointments.filter((item) => {
      const displayStatus = getDisplayStatus(item);
      return displayStatus === activeFilter;
    });
  };

  const filteredAppointments = getFilteredAppointments();

  const handleCancelAppointment = (appointmentId) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    const displayStatus = getDisplayStatus(appointment);

    // ===== اگه منقضی شده یا انجام نشده، نمیشه لغو کرد =====
    if (displayStatus !== "confirmed" && displayStatus !== "pending") {
      alert("امکان لغو این نوبت وجود ندارد.");
      return;
    }

    // ===== چک کردن قانون ۲۴ ساعت =====
    if (!canCancel(appointment)) {
      alert("امکان لغو نوبت کمتر از ۲۴ ساعت قبل وجود ندارد.");
      return;
    }

    setSelectedAppointmentId(appointmentId);
    setCancelReason("");
    setShowCancelModal(true);
  };

  // ===== تأیید لغو نوبت =====
  const confirmCancelAppointment = () => {
    if (!selectedAppointmentId) return;

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedAppointmentId
          ? {
              ...item,
              status: "cancelled",
              cancelledBy: "user",
              cancelReason: cancelReason.trim() || "بدون دلیل",
            }
          : item,
      ),
    );

    setShowCancelModal(false);
    setSelectedAppointmentId(null);
    setCancelReason("");
    alert("نوبت با موفقیت لغو شد.");
  };

  // ===== تابع رزرو نوبت جدید =====
  const handleNewAppointment = (newAppointment) => {
    setAppointments((prev) => [
      {
        ...newAppointment,
        id: Date.now(),
        status: "pending",
        cancelledBy: null,
        cancelReason: null,
        createdAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
      },
      ...prev,
    ]);
    setShowModal(false);
    alert("درخواست نوبت با موفقیت ثبت شد.");
  };

  // ===== وضعیت‌ها =====
  // اگر تایید شده باشه ولی انجام نشه => انجام نشده
  // اگر رزرو شده اما تایید نشه و از موعدش بگذره => منقضی شده
  const filters = [
    { id: "all", label: "همه" },
    { id: "confirmed", label: "تأیید شده" },
    { id: "pending", label: "در انتظار" },
    { id: "completed", label: "انجام شده" },
    // { id: "cancelled", label: "لغو شده" },
    // { id: "expired", label: "منقضی شده" },
    { id: "not-completed", label: "انجام نشده" },
  ];

  // =============================================
  // ۵. رندر
  // =============================================

  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>نوبت‌های من</h2>
          <p>لیست نوبت‌های رزرو شده و درخواست‌های جدید</p>
        </div>
        <button
          className={styles.newAppointmentBtn}
          onClick={() => setShowModal(true)}
        >
          <span>+</span>
          درخواست نوبت جدید
        </button>
      </div>

      {/* فیلترها */}
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
            &nbsp;
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

      {/* لیست نوبت‌ها */}
      <div className={styles.appointmentsList}>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => {
            const statusInfo = getStatusInfo(appointment);
            const isCancellable = canCancel(appointment);
            const isPast = isAppointmentPast(appointment);

            return (
              <div
                key={appointment.id}
                className={`${styles.appointmentCard} ${
                  isPast ? styles.pastAppointment : ""
                }`}
              >
                {/* وضعیت */}
                <div className={styles.appointmentStatusBar}>
                  {/* <span
                    className={`${styles.statusBadge} ${statusInfo.className}`}
                  >
                    {statusInfo.label}
                  </span>

                  {appointment.isOnline && (
                    <span className={styles.onlineBadge}>آنلاین</span>
                  )} */}

                  <span
                    className={`${styles.statusBadge} ${
                      getOriginalStatusInfo(appointment.status).className
                    }`}
                  >
                    {getOriginalStatusInfo(appointment.status).label}
                  </span>

                  {appointment.isOnline && (
                    <span className={styles.onlineBadge}>آنلاین</span>
                  )}
                  {appointment.status === "cancelled" && (
                    <span className={styles.cancelBadge}>
                      {appointment.cancelledBy === "user"
                        ? "لغو توسط شما"
                        : "لغو توسط روانشناس"}
                    </span>
                  )}

                  {/* اگر منقضی شده (گذشتن از موعد تأیید) */}
                  {getDisplayStatus(appointment) === "expired" && (
                    <span className={styles.cancelBadge}>
                      گذشتن از موعد تأیید
                    </span>
                  )}

                  {/* اگر انجام نشده (no-show) */}
                  {getDisplayStatus(appointment) === "no-show" && (
                    <span className={styles.cancelBadge}>انجام نشده</span>
                  )}
                </div>

                {/* محتوای اصلی */}
                <div className={styles.appointmentBody}>
                  <div className={styles.appointmentInfo}>
                    <h4>{appointment.type}</h4>
                    <div className={styles.appointmentMeta}>
                      <span className={styles.metaItem}>
                        {appointment.doctor}
                      </span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {appointment.date}
                      </span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {appointment.time}
                      </span>
                    </div>

                    {/* ===== قیمت (اگه وجود داشت) ===== */}
                    {appointment.price && (
                      <div className={styles.appointmentPrice}>
                        {formatPrice(appointment.price)} تومان
                      </div>
                    )}

                    {/* نمایش دلیل لغو */}
                    {appointment.status === "cancelled" &&
                      appointment.cancelReason && (
                        <div className={styles.cancelReason}>
                          <span>دلیل لغو:</span>
                          <span>{appointment.cancelReason}</span>
                        </div>
                      )}
                  </div>

                  {/* دکمه‌های اکشن */}
                  {/* دکمه‌های اکشن */}
                  <div className={styles.appointmentActions}>
                    {/* ===== وضعیت تأیید شده (فقط اگه آینده باشه) ===== */}
                    {appointment.status === "confirmed" && !isPast && (
                      <>
                        {isCancellable && (
                          <button
                            className={styles.btnCancel}
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                          >
                            لغو نوبت
                          </button>
                        )}
                        {isCancelDisabled(appointment) && (
                          <button className={styles.btnCancelDisabled} disabled>
                            لغو غیرفعال (کمتر از ۲۴ ساعت)
                          </button>
                        )}
                      </>
                    )}

                    {/* ===== وضعیت در انتظار (فقط اگه آینده باشه) ===== */}
                    {appointment.status === "pending" && !isPast && (
                      <>
                        <button className={styles.btnPending}>
                          در انتظار تأیید
                        </button>
                        {isCancellable && (
                          <button
                            className={styles.btnCancel}
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                          >
                            لغو درخواست
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <h3>هیچ نوبتی در این دسته وجود ندارد</h3>
            <p>برای شروع، اولین نوبت خود را رزرو کنید.</p>
            <button
              className={styles.emptyBtn}
              onClick={() => setShowModal(true)}
            >
              + درخواست نوبت جدید
            </button>
          </div>
        )}
      </div>

      {/* ===== مودال لغو نوبت ===== */}
      {showCancelModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.cancelModal}>
            <div className={styles.modalHeader}>
              <h3>لغو نوبت</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowCancelModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.cancelModalBody}>
              <p className={styles.cancelWarning}>
                ⚠️ آیا از لغو این نوبت اطمینان دارید؟
              </p>
              <p className={styles.cancelHint}>
                (اختیاری) در صورت تمایل، دلیل لغو را وارد کنید:
              </p>
              <textarea
                className={styles.cancelTextarea}
                placeholder="دلیل لغو (اختیاری)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows="3"
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModalSecondary}
                onClick={() => setShowCancelModal(false)}
              >
                انصراف
              </button>
              <button
                className={styles.btnCancelModalPrimary}
                onClick={confirmCancelAppointment}
              >
                تأیید لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال رزرو نوبت */}
      <NewAppointmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleNewAppointment}
        appointments={appointments}
      />
    </div>
  );
}

// ============================================
// COMPONENT: New Appointment Modal
// ============================================

function NewAppointmentModal({ isOpen, onClose, onSuccess, appointments }) {
  const [step, setStep] = useState(1); // 1: انتخاب روانشناس | 2: انتخاب زمان | 3: تأیید
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [appointmentType, setAppointmentType] = useState("individual"); // individual | couple | teen
  const [weekOffset, setWeekOffset] = useState(0); // ← جدید (0 = این هفته، 1 = هفته بعد، ...)

  const doctors = seedData.doctors;

  const sortedAvailableDays = [...(selectedDoctor?.availableDays || [])].sort(
    (a, b) => WEEK_DAYS_ORDER[a] - WEEK_DAYS_ORDER[b],
  );

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTimes([]); // ← آرایه خالی
      setAppointmentType("individual");
      setWeekOffset(0); // ← ریست
    }
  }, [isOpen]);

  // ===== مدیریت کلیک روی ساعت =====
  const handleTimeClick = (time) => {
    const isSelected = selectedTimes.includes(time);

    if (isSelected) {
      // ===== حذف ساعت =====
      const newTimes = selectedTimes.filter((t) => t !== time);

      if (areTimesConsecutive(newTimes)) {
        setSelectedTimes(newTimes);
      } else {
        alert("با حذف این ساعت، ساعت‌های باقی‌مانده پشت سر هم نیستند.");
      }
    } else {
      // ===== اضافه کردن ساعت =====
      if (
        canAddTime(time, selectedTimes, selectedDoctor?.availableTimes || [])
      ) {
        // مرتب‌سازی بر اساس دقیقه
        const newTimes = [...selectedTimes, time].sort(
          (a, b) => timeToMinutes(a) - timeToMinutes(b),
        );
        setSelectedTimes(newTimes);
      } else {
        if (selectedTimes.length >= 3) {
          alert("حداکثر تا ۳ ساعت پشت سر هم را میتواند انتخاب کنید.");
        } else {
          alert("ساعت‌ها باید پشت سر هم (با فاصله ۱ ساعت) باشند.");
        }
      }
    }
  };

  // ===== محاسبه ساعت شروع و پایان =====
  const getFinalTimeRange = () => {
    if (selectedTimes.length === 0) return null;

    // ===== مرتب‌سازی بر اساس دقیقه =====
    const sortedTimes = [...selectedTimes].sort(
      (a, b) => timeToMinutes(a) - timeToMinutes(b),
    );

    const startTime = sortedTimes[0];
    const lastTime = sortedTimes[sortedTimes.length - 1];

    // ===== محاسبه ساعت پایان (۱ ساعت بعد از آخرین ساعت) =====
    const lastMinutes = timeToMinutes(lastTime);
    const endMinutes = lastMinutes + 60;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endTime = `${String(endHours).padStart(2, "0")}:۰۰`;

    return {
      start: startTime,
      end: toPersianDigits(endTime),
      count: selectedTimes.length,
    };
  };

  // ===== محاسبه قیمت نهایی =====
  const getFinalPrice = () => {
    if (!selectedDoctor?.pricePerHour) return 0;
    return selectedDoctor.pricePerHour * selectedTimes.length;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        {/* هدر مودال */}
        <div className={styles.modalHeader}>
          <h2>درخواست نوبت جدید</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Progress Steps */}
        <div className={styles.modalSteps}>
          <div
            className={`${styles.stepItem} ${step >= 1 ? styles.active : ""}`}
          >
            <span className={styles.stepNumber}>۱</span>
            <span className={styles.stepLabel}>انتخاب روانشناس</span>
          </div>
          <div className={styles.stepLine} />
          <div
            className={`${styles.stepItem} ${step >= 2 ? styles.active : ""}`}
          >
            <span className={styles.stepNumber}>۲</span>
            <span className={styles.stepLabel}>انتخاب زمان</span>
          </div>
          <div className={styles.stepLine} />
          <div
            className={`${styles.stepItem} ${step >= 3 ? styles.active : ""}`}
          >
            <span className={styles.stepNumber}>۳</span>
            <span className={styles.stepLabel}>تأیید نهایی</span>
          </div>
        </div>

        {/* ===== مرحله ۱: انتخاب روانشناس ===== */}
        {step === 1 && (
          <div className={styles.modalStep}>
            <p className={styles.stepDescription}>
              لطفاً روانشناس مورد نظر خود را انتخاب کنید:
            </p>
            <div className={styles.doctorsGrid}>
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`${styles.doctorCard} ${
                    selectedDoctor?.id === doctor.id ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className={styles.doctorImage}>
                    <img src={doctor.image} alt={doctor.name} />
                  </div>
                  <div className={styles.doctorInfo}>
                    <h4>{doctor.name}</h4>
                    <span className={styles.doctorSpecialty}>
                      {doctor.specialty}
                    </span>
                    <div className={styles.doctorMeta}>
                      <span>{doctor.experience}</span>
                      <span>{doctor.rating}</span>
                    </div>
                    {/* ===== قیمت ===== */}
                    <div className={styles.doctorPrice}>
                      {formatPrice(doctor.pricePerHour)} تومان / ساعت
                    </div>
                    <div className={styles.doctorDays}>
                      {doctor.availableDays.map((day) => (
                        <span key={day} className={styles.dayTag}>
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                  {selectedDoctor?.id === doctor.id && (
                    <span className={styles.selectedCheck}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== مرحله ۲: انتخاب زمان ===== */}
        {step === 2 && (
          <div className={styles.modalStep}>
            <p className={styles.stepDescription}>
              {selectedDoctor?.name} - روز و ساعت مورد نظر را انتخاب کنید:
            </p>

            {/* ===== انتخاب هفته ===== */}
            <div className={styles.weekSelector}>
              <button
                className={styles.weekNavBtn}
                onClick={() => setWeekOffset(weekOffset - 1)}
                disabled={weekOffset === 0}
                title="هفته قبل"
              >
                →
              </button>

              <span className={styles.weekLabel}>
                {weekOffset === 0 && "هفته جاری"}
                {weekOffset === 1 && "هفته آینده"}
                {weekOffset === 2 && "۲ هفته آینده"}
                {weekOffset === 3 && "۳ هفته آینده"}
                {weekOffset > 3 && `${toPersianDigits(weekOffset)} هفته آینده`}
              </span>

              <button
                className={styles.weekNavBtn}
                onClick={() => setWeekOffset(weekOffset + 1)}
                disabled={weekOffset >= 4}
                title="هفته بعد"
              >
                ←
              </button>
            </div>

            <div className={styles.dateTimeSection}>
              {/* ===== انتخاب روز ===== */}
              <div className={styles.dateGrid}>
                {sortedAvailableDays.map((day) => {
                  const isDisabled = isDayPast(day, weekOffset);
                  return (
                    <button
                      key={day}
                      className={`${styles.dateBtn} ${
                        selectedDate === day ? styles.selected : ""
                      } ${isDisabled ? styles.disabled : ""}`}
                      onClick={() => {
                        if (!isDisabled) {
                          if (selectedDate !== day) {
                            setSelectedTimes([]);
                          }
                          setSelectedDate(day);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      <span className={styles.dateDay}>{day}</span>
                      <span className={styles.dateNum}>
                        {getDayOfMonthFromWeekDay(day, weekOffset)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ===== انتخاب ساعت ===== */}
              {selectedDate && (
                <div className={styles.timeGrid}>
                  {selectedDoctor?.availableTimes?.map((time) => {
                    const isPast = !isTimeSelectable(
                      time,
                      selectedDate,
                      weekOffset,
                    );
                    const isBooked = isTimeAlreadyBooked(
                      appointments,
                      selectedDate,
                      time,
                      weekOffset,
                    );
                    const isSelected = selectedTimes.includes(time);
                    const isDisabled = isPast || isBooked;

                    return (
                      <button
                        key={time}
                        className={`${styles.timeBtn} ${
                          isSelected ? styles.selected : ""
                        } ${isDisabled ? styles.disabled : ""}`}
                        onClick={() => !isDisabled && handleTimeClick(time)}
                        disabled={isDisabled}
                        title={isBooked ? "این ساعت قبلاً رزرو شده است" : ""}
                      >
                        {time}
                        {isBooked && (
                          <span className={styles.bookedLabel}>رزرو شده</span>
                        )}
                      </button>
                    );
                  })}

                  <div className={styles.timeHint}>
                    حداکثر ۳ ساعت <strong>پشت سر هم</strong> را میتوانید انتخاب
                    کنید.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== مرحله ۳: تأیید نهایی ===== */}
        {step === 3 && (
          <div className={styles.modalStep}>
            <div className={styles.confirmBox}>
              <div className={styles.confirmIcon}>
                <img src={confirmIcon} alt="تأیید" />
              </div>
              <h3>اطلاعات نوبت شما</h3>
              <div className={styles.confirmDetails}>
                <div className={styles.confirmItem}>
                  <span className={styles.confirmLabel}>روانشناس:</span>
                  <span className={styles.confirmValue}>
                    {selectedDoctor?.name}
                  </span>
                </div>
                <div className={styles.confirmItem}>
                  <span className={styles.confirmLabel}>تخصص:</span>
                  <span className={styles.confirmValue}>
                    {selectedDoctor?.specialty}
                  </span>
                </div>
                <div className={styles.confirmItem}>
                  <span className={styles.confirmLabel}>نوع جلسه:</span>
                  <span className={styles.confirmValue}>
                    {appointmentType === "individual" && "جلسه مشاوره فردی"}
                    {appointmentType === "couple" && "جلسه زوج درمانی"}
                    {appointmentType === "teen" && "جلسه مشاوره نوجوان"}
                  </span>
                </div>
                <div className={styles.confirmItem}>
                  <span className={styles.confirmLabel}>تاریخ:</span>
                  <span className={styles.confirmValue}>
                    {selectedDate} -{" "}
                    {toPersianDigits(
                      getDateFromWeekDay(selectedDate, weekOffset),
                    )}{" "}
                    {/* ← weekOffset اضافه شد */}
                  </span>
                </div>

                {/* ===== ساعت شروع تا پایان ===== */}
                <div className={styles.confirmItem}>
                  <span className={styles.confirmLabel}>ساعت:</span>
                  <span className={styles.confirmValue}>
                    {(() => {
                      const range = getFinalTimeRange();
                      if (!range) return "—";
                      if (range.count === 1) {
                        // اگه ۱ ساعت بود، همون فرمت قبلی
                        return `${range.start} - ${range.end}`;
                      }
                      // اگه چند ساعت بود
                      return `${range.start} تا ${range.end} (${toPersianDigits(range.count)} ساعت)`;
                    })()}
                  </span>
                </div>

                {/* ===== قیمت ===== */}
                <div className={styles.confirmItem}>
                  <span className={styles.confirmLabel}>هزینه جلسه:</span>
                  <span className={styles.confirmValuePrice}>
                    {formatPrice(getFinalPrice())} تومان
                  </span>
                </div>
              </div>
              <p className={styles.confirmNote}>
                پس از تأیید، پیامک تأیید نوبت برای شما ارسال خواهد شد.
              </p>
            </div>
          </div>
        )}

        {/* دکمه‌های ناوبری */}
        <div className={styles.modalFooter}>
          {step > 1 && (
            <button
              className={styles.btnPrev}
              onClick={() => setStep(step - 1)}
            >
              قبلی
            </button>
          )}
          {step < 3 ? (
            <button
              className={styles.btnNext}
              onClick={() => {
                if (step === 1 && !selectedDoctor) {
                  alert("لطفاً یک روانشناس انتخاب کنید.");
                  return;
                }
                if (
                  step === 2 &&
                  (!selectedDate || selectedTimes.length === 0)
                ) {
                  alert("لطفاً تاریخ و حداقل یک ساعت را انتخاب کنید.");
                  return;
                }
                setStep(step + 1);
              }}
            >
              {step === 1 ? "انتخاب زمان" : "مرحله بعد"}
            </button>
          ) : (
            <button
              className={styles.btnConfirm}
              onClick={() => {
                const persianDate = getDateFromWeekDay(
                  selectedDate,
                  weekOffset,
                );
                const range = getFinalTimeRange();
                const fullTime = `${range.start} - ${range.end}`;
                const finalPrice = getFinalPrice();

                const typeNames = {
                  individual: "جلسه مشاوره فردی",
                  couple: "جلسه زوج درمانی",
                  teen: "جلسه مشاوره نوجوان",
                };

                // ===== مرتب‌سازی ساعت‌ها =====
                const sortedHours = [...selectedTimes].sort(
                  (a, b) => timeToMinutes(a) - timeToMinutes(b),
                );

                const newAppointment = {
                  id: Date.now(),
                  type: typeNames[appointmentType] || "جلسه مشاوره فردی",
                  doctor: selectedDoctor?.name,
                  doctorId: selectedDoctor?.id,
                  date: toPersianDigits(persianDate),
                  time: toPersianDigits(fullTime),
                  hours: sortedHours.map(toPersianDigits), // ← آرایه ساعت‌ها
                  // startTime: sortedHours[0],
                  // endTime: toPersianDigits(range.end),
                  startTime: toPersianDigits(sortedHours[0]),
                  endTime: toPersianDigits(range.end),
                  status: "pending",
                  isOnline: true,
                  cancelledBy: null,
                  cancelReason: null,
                  createdAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
                  price: finalPrice,
                  duration: selectedTimes.length,
                };

                onSuccess?.(newAppointment);
                onClose();
              }}
            >
              تأیید و ثبت نوبت
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Sessions Content
// ============================================
function SessionsContent({ appointments, setAppointments }) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // ===== Stateهای مودال نظر =====
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===== باز کردن مودال نظر =====
  const handleOpenReviewModal = (session) => {
    setSelectedSession(session);
    setRating(0);
    setHoverRating(0);
    setComment("");
    setShowReviewModal(true);
  };

  // ===== بستن مودال نظر =====
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedSession(null);
    setRating(0);
    setHoverRating(0);
    setComment("");
  };

  // ===== ثبت نظر =====
  // const handleSubmitReview = () => {
  //   if (!rating) {
  //     alert("لطفاً امتیاز خود را انتخاب کنید.");
  //     return;
  //   }

  //   if (!comment.trim()) {
  //     alert("لطفاً نظر خود را وارد کنید.");
  //     return;
  //   }

  //   setIsSubmitting(true);

  //   // ===== شبیه‌سازی ارسال به سرور =====
  //   setTimeout(() => {
  //     // ===== ذخیره در appointments (اضافه کردن فیلد hasReview) =====
  //     setAppointments((prev) =>
  //       prev.map((item) =>
  //         item.id === selectedSession.id
  //           ? {
  //               ...item,
  //               hasReview: true,
  //               review: {
  //                 id: Date.now(),
  //                 rating: rating,
  //                 comment: comment.trim(),
  //                 date: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
  //                 doctorId: item.doctorId,
  //                 doctorName: item.doctor,
  //                 isApproved: false, // بعداً توسط روانشناس تأیید میشه
  //               },
  //             }
  //           : item,
  //       ),
  //     );

  //     setIsSubmitting(false);
  //     alert("✅ نظر شما با موفقیت ثبت شد و پس از تأیید نمایش داده می‌شود.");
  //     handleCloseReviewModal();
  //   }, 1500);
  // };

  // ===== ثبت نظر =====
  const handleSubmitReview = () => {
    if (!rating) {
      alert("لطفاً امتیاز خود را انتخاب کنید.");
      return;
    }

    setIsSubmitting(true);

    // ===== شبیه‌سازی ارسال به سرور =====
    setTimeout(() => {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === selectedSession.id
            ? {
                ...item,
                hasReview: true,
                review: {
                  id: Date.now(),
                  rating: rating,
                  comment: comment.trim() || "", // ← خالی قبول میشه
                  date: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
                  doctorId: item.doctorId,
                  doctorName: item.doctor,
                  isApproved: false,
                },
              }
            : item,
        ),
      );

      setIsSubmitting(false);
      alert("نظر شما با موفقیت ثبت شد و پس از تأیید نمایش داده می‌شود.");
      handleCloseReviewModal();
    }, 1500);
  };

  // ============================================
  // فیلتر کردن جلسات
  // ============================================

  // ===== جلسات پیش‌رو (confirmed + آینده) =====
  // const upcomingSessions = appointments
  //   .filter((app) => {
  //     const displayStatus = getDisplayStatus(app);
  //     return displayStatus === "confirmed";
  //   })
  //   .sort((a, b) => {
  //     const momentA = getAppointmentMoment(a);
  //     const momentB = getAppointmentMoment(b);
  //     return momentA - momentB; // نزدیک‌ترین اول
  //   });

  // ===== جلسات پیش‌رو (شامل در حال برگزاری) =====
  const upcomingSessions = appointments
    .filter((app) => {
      const displayStatus = getDisplayStatus(app);

      // جلساتی که تأیید شده و هنوز تموم نشدن
      if (displayStatus !== "confirmed") return false;

      const startMoment = getAppointmentMoment(app);
      if (!startMoment.isValid()) return false;

      const now = moment();
      const durationMinutes = (app.duration || 1) * 60;
      const endMoment = startMoment.clone().add(durationMinutes, "minutes");

      // اگه هنوز تموم نشده (چه شروع نشده، چه در حال برگزاری)
      return now.isBefore(endMoment);
    })
    .sort((a, b) => {
      const momentA = getAppointmentMoment(a);
      const momentB = getAppointmentMoment(b);
      return momentA - momentB; // نزدیک‌ترین اول
    });

  // ===== تاریخچه (completed) =====
  const pastSessions = appointments
    .filter((app) => app.status === "completed")
    .sort((a, b) => {
      const momentA = getAppointmentMoment(a);
      const momentB = getAppointmentMoment(b);
      return momentB - momentA; // جدیدترین اول
    });

  // ===== جلسه بعدی =====
  // const nextSession = upcomingSessions[0] || null;
  const nextSession = upcomingSessions[0] || null;
  const isNextOngoing = nextSession ? isSessionOngoing(nextSession) : false;

  // ============================================
  // تایمر شمارش معکوس
  // ============================================
  const [timeLeft, setTimeLeft] = useState(null);

  // useEffect(() => {
  //   if (!nextSession) return;

  //   const targetMoment = getAppointmentMoment(nextSession);
  //   if (!targetMoment.isValid()) return;

  //   const updateTimer = () => {
  //     const now = moment();
  //     const diff = targetMoment.diff(now, "seconds");

  //     if (diff <= 0) {
  //       setTimeLeft(null);
  //       return false;
  //     }

  //     const days = Math.floor(diff / (60 * 60 * 24));
  //     const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
  //     const minutes = Math.floor((diff % (60 * 60)) / 60);
  //     const seconds = diff % 60;

  //     setTimeLeft({ days, hours, minutes, seconds });
  //     return true;
  //   };

  //   updateTimer();
  //   const interval = setInterval(() => {
  //     if (!updateTimer()) {
  //       clearInterval(interval);
  //     }
  //   }, 1000);

  //   return () => clearInterval(interval);
  //   // }, [nextSession]);
  // }, [nextSession?.id]);

  useEffect(() => {
    if (!nextSession) return;

    const targetMoment = getAppointmentMoment(nextSession);
    if (!targetMoment.isValid()) return;

    const updateTimer = () => {
      const now = moment();
      const diff = targetMoment.diff(now, "seconds");

      // ===== اگه جلسه شروع شده یا در حال برگزاریه =====
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true; // ← همچنان تایمر رو آپدیت کن (برای تشخیص پایان جلسه)
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
      if (!updateTimer()) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextSession?.id]);

  // ============================================
  // توابع کمکی
  // ============================================

  // ===== بررسی امکان لغو =====
  const canCancelSession = (appointment) => {
    const displayStatus = getDisplayStatus(appointment);
    if (displayStatus !== "confirmed") return false;

    const appointmentMoment = getAppointmentMoment(appointment);
    if (!appointmentMoment.isValid()) return false;

    const diffHours = appointmentMoment.diff(moment(), "hours", true);
    return diffHours >= 24;
  };

  // ===== بررسی "لغو غیرفعال" =====
  const isCancelDisabledSession = (appointment) => {
    const displayStatus = getDisplayStatus(appointment);
    if (displayStatus !== "confirmed") return false;

    const appointmentMoment = getAppointmentMoment(appointment);
    if (!appointmentMoment.isValid()) return false;

    const diffHours = appointmentMoment.diff(moment(), "hours", true);
    return diffHours < 24 && diffHours > 0;
  };

  // ===== باز کردن مودال لغو =====
  const handleCancelSession = (appointment) => {
    setSelectedAppointmentId(appointment.id);
    setCancelReason("");
    setShowCancelModal(true);
  };

  // ===== تأیید لغو =====
  const confirmCancelSession = () => {
    if (!selectedAppointmentId) return;

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedAppointmentId
          ? {
              ...item,
              status: "cancelled",
              cancelledBy: "user",
              cancelReason: cancelReason.trim() || "بدون دلیل",
            }
          : item,
      ),
    );

    setShowCancelModal(false);
    setSelectedAppointmentId(null);
    setCancelReason("");
    alert("جلسه با موفقیت لغو شد.");
  };

  // ============================================
  // رندر
  // ============================================
  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>🎥 جلسات آنلاین</h2>
          <p>مدیریت و شرکت در جلسات مجازی</p>
        </div>
        <div className={styles.sessionStats}>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>{upcomingSessions.length}</span>
            <span className={styles.statLabel}>جلسه پیش‌رو</span>
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>{pastSessions.length}</span>
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
          جلسات پیش‌رو &nbsp;
          <span className={styles.filterCount}>{upcomingSessions.length}</span>
        </button>
        <button
          className={`${styles.filterTab} ${
            activeTab === "past" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("past")}
        >
          تاریخچه جلسات &nbsp;
          <span className={styles.filterCount}>{pastSessions.length}</span>
        </button>
      </div>

      {/* لیست جلسات */}
      <div className={styles.sessionsList}>
        {/* ===== جلسه بعدی - کارت ویژه ===== */}
        {activeTab === "upcoming" && nextSession && (
          <div
            className={`${styles.nextSessionBanner} ${
              isNextOngoing ? styles.nextSessionOngoing : ""
            }`}
          >
            <div className={styles.nextSessionContent}>
              <span className={styles.nextSessionLabel}>
                {isNextOngoing ? "در حال برگزاری" : "جلسه بعدی شما"}
              </span>
              <h3>{nextSession.type}</h3>
              <p>با {nextSession.doctor}</p>
              <div className={styles.nextSessionTime}>
                <span>{nextSession.date}</span>
                <span>•</span>
                <span>{nextSession.time}</span>
              </div>
            </div>

            <div className={styles.nextSessionTimerEnterContainer}>
              {/* <a
                href="https://meet.google.com/cnt-rxmj-hoh"
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.btnNextSession} ${
                  isNextOngoing ? styles.btnNextSessionOngoing : ""
                }`}
              >
                {isNextOngoing ? "🚀 ورود به جلسه" : "ورود به جلسه"}
                <span>→</span>
              </a> */}
              {isNextOngoing ? (
                <a
                  href="https://meet.google.com/cnt-rxmj-hoh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.btnNextSession} ${styles.btnNextSessionOngoing}`}
                >
                  ورود به جلسه
                  <span>→</span>
                </a>
              ) : (
                <button
                  className={styles.btnNextSessionDisabled}
                  disabled
                  title="در زمان برگزاری جلسه فعال می‌شود"
                >
                  ورود به جلسه
                  <span>→</span>
                </button>
              )}

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

        {/* ===== لیست جلسات پیش‌رو ===== */}
        {activeTab === "upcoming" &&
          (upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => {
              // جلسه بعدی رو توی کارت ویژه نشون دادیم، اینجا رد کن
              if (nextSession && session.id === nextSession.id) return null;

              const canCancel = canCancelSession(session);
              const isDisabled = isCancelDisabledSession(session);

              return (
                <div key={session.id} className={styles.sessionCard}>
                  {/* هدر کارت */}
                  <div className={styles.sessionCardHeader}>
                    <div className={styles.sessionDoctor}>
                      <div>
                        <h4>{session.doctor}</h4>
                        <span className={styles.sessionType}>
                          {session.type}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`${styles.sessionStatus} ${styles.sessionUpcoming}`}
                    >
                      <span className={styles.statusDot}></span>
                      تأیید شده
                    </span>
                  </div>

                  {/* جزئیات */}
                  <div className={styles.sessionDetails}>
                    <div className={styles.sessionMeta}>
                      <div className={styles.metaGroup}>
                        <span>{session.date}</span>
                      </div>
                      <span>•</span>
                      <div className={styles.metaGroup}>
                        <span>{session.time}</span>
                      </div>
                      <span>•</span>
                      <div className={styles.metaGroup}>
                        <span>جلسه آنلاین</span>
                      </div>
                    </div>
                  </div>

                  {/* دکمه‌های اکشن */}
                  <div className={styles.sessionActions}>
                    {canCancel ? (
                      <button
                        className={styles.btnCancelSession}
                        onClick={() => handleCancelSession(session)}
                      >
                        لغو نوبت
                      </button>
                    ) : isDisabled ? (
                      <button className={styles.btnCancelDisabled} disabled>
                        لغو غیرفعال (کمتر از ۲۴ ساعت)
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎥</span>
              <h3>هیچ جلسه پیش‌رویی ندارید</h3>
              <p>برای رزرو جلسه، به بخش "نوبت‌های من" بروید.</p>
            </div>
          ))}

        {/* ===== لیست تاریخچه جلسات ===== */}
        {activeTab === "past" &&
          (pastSessions.length > 0 ? (
            pastSessions.map((session) => (
              <div key={session.id} className={styles.sessionCard}>
                {/* هدر کارت */}
                <div className={styles.sessionCardHeader}>
                  <div className={styles.sessionDoctor}>
                    <div>
                      <h4>{session.doctor}</h4>
                      <span className={styles.sessionType}>{session.type}</span>
                    </div>
                  </div>
                  <span
                    className={`${styles.sessionStatus} ${styles.sessionCompleted}`}
                  >
                    <span className={styles.statusDot}></span>
                    انجام شده
                  </span>
                </div>

                {/* جزئیات */}
                <div className={styles.sessionDetails}>
                  <div className={styles.sessionMeta}>
                    <div className={styles.metaGroup}>
                      <span>{session.date}</span>
                    </div>
                    <span>•</span>
                    <div className={styles.metaGroup}>
                      <span>{session.time}</span>
                    </div>
                    <span>•</span>
                    <div className={styles.metaGroup}>
                      <span>جلسه آنلاین</span>
                    </div>
                  </div>
                </div>

                {/* دکمه‌های اکشن */}
                <div className={styles.sessionActions}>
                  <button className={styles.btnViewRecord}>
                    📹 مشاهده ضبط جلسه
                  </button>

                  {/* ===== دکمه ثبت نظر ===== */}
                  {session.hasReview ? (
                    <span className={styles.reviewSubmitted}>
                      نظر شما ثبت شد.
                    </span>
                  ) : (
                    <button
                      className={styles.btnReview}
                      onClick={() => handleOpenReviewModal(session)}
                    >
                      ثبت نظر
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎥</span>
              <h3>هنوز جلسه برگزار شده‌ای وجود ندارد</h3>
              <p>جلسات انجام شده شما در اینجا نمایش داده می‌شوند.</p>
            </div>
          ))}
      </div>

      {/* ===== مودال لغو ===== */}
      {showCancelModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.cancelModal}>
            <div className={styles.modalHeader}>
              <h3>لغو نوبت</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowCancelModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.cancelModalBody}>
              <p className={styles.cancelWarning}>
                ⚠️ آیا از لغو این جلسه اطمینان دارید؟
              </p>
              <p className={styles.cancelHint}>
                (اختیاری) در صورت تمایل، دلیل لغو را وارد کنید:
              </p>
              <textarea
                className={styles.cancelTextarea}
                placeholder="دلیل لغو (اختیاری)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows="3"
              />
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModalSecondary}
                onClick={() => setShowCancelModal(false)}
              >
                انصراف
              </button>
              <button
                className={styles.btnCancelModalPrimary}
                onClick={confirmCancelSession}
              >
                تأیید لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال ثبت نظر ===== */}
      {showReviewModal && selectedSession && (
        <div className={styles.modalOverlay}>
          <div className={styles.reviewModal}>
            {/* هدر */}
            <div className={styles.modalHeader}>
              <h3>ثبت نظر</h3>
              <button
                className={styles.modalClose}
                onClick={handleCloseReviewModal}
              >
                ✕
              </button>
            </div>

            {/* محتوا */}
            <div className={styles.reviewModalBody}>
              {/* اطلاعات جلسه */}
              <div className={styles.reviewSessionInfo}>
                <span className={styles.reviewSessionIcon}>🧑‍⚕️</span>
                <div>
                  <h4>{selectedSession.doctor}</h4>
                  {/* <p>{selectedSession.type}</p> */}
                  <p className={styles.reviewSessionDate}>
                    {selectedSession.date}
                  </p>
                </div>
              </div>

              {/* سوال */}
              <p className={styles.reviewQuestion}>
                تجربه‌ات از این جلسه چطور بود؟
              </p>

              {/* ستاره‌ها */}
              <div className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.starBtn} ${
                      star <= (hoverRating || rating) ? styles.starActive : ""
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    aria-label={`${star} ستاره`}
                  >
                    ★
                  </button>
                ))}
                {/* {rating > 0 && (
                  <span className={styles.ratingText}>
                    {rating === 1 && "خیلی ضعیف"}
                    {rating === 2 && "ضعیف"}
                    {rating === 3 && "متوسط"}
                    {rating === 4 && "خوب"}
                    {rating === 5 && "عالی"}
                  </span>
                )} */}
              </div>

              {/* کامنت */}
              <div className={styles.reviewInputGroup}>
                <label className={styles.reviewLabel}>
                  نظرت رو بنویس{" "}
                  <span className={styles.optionalTag}>(اختیاری)</span>
                </label>
                <textarea
                  className={styles.reviewTextarea}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows="4"
                  maxLength="500"
                />
                <span className={styles.charCount}>
                  {toPersianDigits(comment.length)} / ۵۰۰
                </span>
              </div>

              {/* یادداشت */}
              <p className={styles.reviewNote}>
                نظر شما پس از تأیید در صفحه اصلی سایت نمایش داده می‌شود.
              </p>
            </div>

            {/* دکمه‌ها */}
            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModalSecondary}
                onClick={handleCloseReviewModal}
                disabled={isSubmitting}
              >
                انصراف
              </button>
              <button
                className={styles.btnSubmitReview}
                onClick={handleSubmitReview}
                disabled={isSubmitting || !rating}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    در حال ارسال...
                  </>
                ) : (
                  <>
                    <span>ثبت نظر</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENT: Messages Content (Notification Center)
// ============================================
function MessagesContent({ notifications, setNotifications }) {
  const [filter, setFilter] = useState("all"); // all | unread | read

  // ===== علامت‌گذاری به عنوان خوانده شده =====
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  // ===== علامت‌گذاری همه به عنوان خوانده شده =====
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true })),
    );
  };

  // ===== حذف اعلان =====
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // ===== فیلتر کردن =====
  const getFilteredNotifications = () => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    if (filter === "read") {
      return notifications.filter((n) => n.isRead);
    }
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ===== دریافت استایل بر اساس نوع =====
  const getTypeStyle = (type) => {
    const styles = {
      reminder: { bg: "#e3f2fd", border: "#0d47a1", icon: "⏰" },
      confirmed: { bg: "#e8f5e9", border: "#2e7d32", icon: "✅" },
      cancelled: { bg: "#fbe9e7", border: "#c62828", icon: "❌" },
      note: { bg: "#fff3e0", border: "#e65100", icon: "📝" },
      booking: { bg: "#e8eaf6", border: "#283593", icon: "📅" },
      weekly: { bg: "#f3e5f5", border: "#6a1b9a", icon: "🔄" },
    };
    return styles[type] || styles.reminder;
  };

  // ===== دریافت متن زمان =====
  const getTimeAgo = (time) => {
    return time;
  };

  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>اعلانات</h2>
          <p>رویدادها و یادآوری‌های مهم شما</p>
        </div>
        <div className={styles.notificationActions}>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} جدید</span>
          )}
          <button className={styles.markAllBtn} onClick={markAllAsRead}>
            ✓ همه پیام ها خوانده شدند
          </button>
        </div>
      </div>

      {/* فیلترها */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${
            filter === "all" ? styles.active : ""
          }`}
          onClick={() => setFilter("all")}
        >
          همه &nbsp;
          <span className={styles.filterCount}>{notifications.length}</span>
        </button>
        <button
          className={`${styles.filterTab} ${
            filter === "unread" ? styles.active : ""
          }`}
          onClick={() => setFilter("unread")}
        >
          خوانده نشده &nbsp;
          {unreadCount > 0 && (
            <span className={styles.filterCount}>{unreadCount}</span>
          )}
        </button>
        <button
          className={`${styles.filterTab} ${
            filter === "read" ? styles.active : ""
          }`}
          onClick={() => setFilter("read")}
        >
          خوانده شده &nbsp;
          <span className={styles.filterCount}>
            {notifications.filter((n) => n.isRead).length}
          </span>
        </button>
      </div>

      {/* لیست اعلانات */}
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
                onClick={() => markAsRead(notification.id)}
              >
                {/* محتوای اصلی */}
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

                {/* وضعیت خوانده/نخوانده */}
                {!notification.isRead && (
                  <div className={styles.unreadIndicator}></div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <h3>هیچ اعلانی وجود ندارد</h3>
            <p>
              {filter === "unread"
                ? "همه اعلان‌ها را خوانده‌اید. "
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
// COMPONENT: Notification Dropdown
// ============================================
function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ===== بستن دراپ‌داون با کلیک خارج =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== گرفتن آخرین ۵ اعلان نخوانده =====
  const unreadNotifications = notifications
    .filter((n) => !n.isRead)
    .slice(0, 5);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      {/* ===== دکمه زنگوله ===== */}
      <button
        className={styles.notificationBtn}
        onClick={() => setIsOpen(!isOpen)}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className={styles.notificationDot}>{unreadCount}</span>
        )}
      </button>

      {/* ===== دراپ‌داون ===== */}

      {isOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>اعلان‌ها</span>
            {unreadCount > 0 && (
              <button
                className={styles.dropdownMarkAll}
                onClick={() => {
                  onMarkAllAsRead();
                }}
              >
                همه پیام ها خوانده شدند.
              </button>
            )}
          </div>

          <div className={styles.dropdownList}>
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={styles.dropdownItem}
                  onClick={() => {
                    onMarkAsRead(notification.id);
                  }}
                >
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownText}>
                      <span className={styles.dropdownTitleText}>
                        {notification.title}
                      </span>
                      <span className={styles.dropdownTime}>
                        {notification.time}
                      </span>
                    </div>
                    <p className={styles.dropdownMessage}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.dropdownEmpty}>
                <p>همه اعلان‌ها را خوانده‌اید!</p>
                <span className={styles.dropdownEmptySub}>
                  هیچ اعلان جدیدی وجود ندارد
                </span>
              </div>
            )}
          </div>

          {unreadCount > 5 && (
            <div className={styles.dropdownFooter}>
              <button
                className={styles.dropdownViewAll}
                onClick={() => {
                  setIsOpen(false);
                  // ← setActiveTab حذف شد
                }}
              >
                مشاهده همه اعلان‌ها ({unreadCount})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENT: Progress Content
// ============================================
function ProgressContent() {
  const progressData = seedData.progress;

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

// ============================================
// COMPONENT: Exercise Content
// ============================================
function ExerciseContent() {
  const [exercises, setExercises] = useState(seedData.exercises);

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [filter, setFilter] = useState("all"); // all | daily | weekly | one-time
  const [showCompleted, setShowCompleted] = useState(true);

  // ===== تابع تیک زدن تمرین =====
  const toggleComplete = (id) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? {
              ...ex,
              completed: !ex.completed,
              progress: ex.completed ? 0 : 100,
            }
          : ex,
      ),
    );
  };

  // ===== فیلتر کردن =====
  const getFilteredExercises = () => {
    let filtered = exercises;

    if (filter !== "all") {
      filtered = filtered.filter((ex) => ex.type === filter);
    }

    if (!showCompleted) {
      filtered = filtered.filter((ex) => !ex.completed);
    }

    return filtered;
  };

  const filteredExercises = getFilteredExercises();
  const completedCount = exercises.filter((ex) => ex.completed).length;
  const totalCount = exercises.length;

  // ===== دریافت اطلاعات بر اساس نوع =====
  const getTypeInfo = (type) => {
    const types = {
      daily: { label: "روزانه", className: styles.typeDaily, icon: "🌙" },
      weekly: { label: "هفتگی", className: styles.typeWeekly, icon: "📅" },
      one_time: { label: "یک‌باره", className: styles.typeOneTime, icon: "⭐" },
    };
    return types[type] || types.one_time;
  };

  const getPriorityInfo = (priority) => {
    const priorities = {
      high: { label: "اولویت بالا", className: styles.priorityHigh },
      medium: { label: "اولویت متوسط", className: styles.priorityMedium },
      low: { label: "اولویت کم", className: styles.priorityLow },
    };
    return priorities[priority] || priorities.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      meditation: "🧘",
      writing: "✍️",
      test: "📊",
      activity: "🏃",
    };
    return icons[category] || "📋";
  };

  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>تمارین من</h2>
          <p>تمارین تعیین شده توسط روانشناس برای شما</p>
        </div>
        <div className={styles.exerciseStats}>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>{completedCount}</span>
            <span className={styles.statLabel}>انجام شده</span>
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>
              {totalCount - completedCount}
            </span>
            <span className={styles.statLabel}>انجام نشده</span>
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>{totalCount}</span>
            <span className={styles.statLabel}>مجموع</span>
          </span>
        </div>
      </div>

      {/* فیلترها */}
      <div className={styles.filterSection}>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${
              filter === "all" ? styles.active : ""
            }`}
            onClick={() => setFilter("all")}
          >
            همه &nbsp;
            <span className={styles.filterCount}>{exercises.length}</span>
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "daily" ? styles.active : ""
            }`}
            onClick={() => setFilter("daily")}
          >
            🌙 روزانه &nbsp;
            <span className={styles.filterCount}>
              {exercises.filter((ex) => ex.type === "daily").length}
            </span>
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "weekly" ? styles.active : ""
            }`}
            onClick={() => setFilter("weekly")}
          >
            📅 هفتگی &nbsp;
            <span className={styles.filterCount}>
              {exercises.filter((ex) => ex.type === "weekly").length}
            </span>
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "one-time" ? styles.active : ""
            }`}
            onClick={() => setFilter("one-time")}
          >
            ⭐ یک‌باره &nbsp;
            <span className={styles.filterCount}>
              {exercises.filter((ex) => ex.type === "one-time").length}
            </span>
          </button>
        </div>

        <label className={styles.showCompletedToggle}>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
          />
          <span className={styles.toggleSlider}></span>
          نمایش انجام شده‌ها
        </label>
      </div>

      {/* لیست تمارین */}
      <div className={styles.exerciseList}>
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => {
            const typeInfo = getTypeInfo(exercise.type);
            const priorityInfo = getPriorityInfo(exercise.priority);
            const isCompleted = exercise.completed;

            return (
              <div
                key={exercise.id}
                className={`${styles.exerciseCard} ${
                  isCompleted ? styles.completed : ""
                }`}
              >
                <button
                  className={`${styles.checkCircle} ${
                    isCompleted ? styles.checked : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(exercise.id);
                  }}
                >
                  {isCompleted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12L10 17L20 7"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span className={styles.checkPlaceholder}></span>
                  )}
                </button>

                {/* محتوای اصلی */}
                <div className={styles.exerciseContent}>
                  <div className={styles.exerciseHeader}>
                    <div className={styles.exerciseMainInfo}>
                      <div className={styles.exerciseTitleRow}>
                        <h4 className={styles.exerciseTitle}>
                          {exercise.icon || getCategoryIcon(exercise.category)}
                          <span>{exercise.title}</span>
                        </h4>
                        <div className={styles.exerciseMeta}>
                          <span
                            className={`${styles.typeBadge} ${typeInfo.className}`}
                          >
                            {typeInfo.icon} {typeInfo.label}
                          </span>
                          <span
                            className={`${styles.priorityBadge} ${priorityInfo.className}`}
                          >
                            {priorityInfo.label}
                          </span>
                        </div>
                      </div>
                      <p className={styles.exerciseDescription}>
                        {exercise.description}
                      </p>
                    </div>
                  </div>

                  {/* دکمه گسترش */}
                  <button
                    className={styles.expandBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExercise(
                        selectedExercise === exercise.id ? null : exercise.id,
                      );
                    }}
                  >
                    {selectedExercise === exercise.id ? "▲" : "▼"}
                    <span className={styles.expandLabel}>
                      {selectedExercise === exercise.id
                        ? "بستن"
                        : "مشاهده دستورالعمل"}
                    </span>
                  </button>

                  {/* جزئیات */}
                  {selectedExercise === exercise.id && (
                    <div className={styles.exerciseDetails}>
                      <div className={styles.instructionsSection}>
                        <h5>📋 دستورالعمل:</h5>
                        <ul>
                          {exercise.instructions.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.exerciseFooter}>
                        <div className={styles.exerciseAssignInfo}>
                          <span>👤 {exercise.assignedBy}</span>
                          <span>📅 تاریخ تعیین: {exercise.assignedDate}</span>
                          <span>⏳ مهلت: {exercise.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎯</span>
            <h3>هیچ تمرینی موجود نیست</h3>
            <p>
              {showCompleted
                ? "هنوز تمرینی برای شما تعیین نشده است."
                : "همه تمرین‌ها را انجام داده‌اید! 🎉"}
            </p>
          </div>
        )}
      </div>

      {/* کارت پیشرفت کلی */}
      <div className={styles.overallProgress}>
        <div className={styles.progressInfo}>
          <span className={styles.progressTitle}>پیشرفت کلی تمارین</span>
          <span className={styles.progressPercentage}>
            {totalCount > 0
              ? Math.round((completedCount / totalCount) * 100)
              : 0}
            %
          </span>
        </div>
        <div className={styles.overallProgressBar}>
          <div
            className={styles.overallProgressFill}
            style={{
              width: `${
                totalCount > 0 ? (completedCount / totalCount) * 100 : 0
              }%`,
            }}
          />
        </div>
        <div className={styles.progressStats}>
          <span>✅ {completedCount} انجام شده</span>
          <span>⏳ {totalCount - completedCount} باقی‌مانده</span>
        </div>
      </div>

      {/* دکمه گزارش */}
      <div className={styles.exerciseActions}>
        <button className={styles.btnReportProgress}>
          📊 گزارش پیشرفت تمارین
        </button>
        <button className={styles.btnShareProgress}>
          📤 اشتراک‌گذاری با روانشناس
        </button>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Profile Content
// ============================================
function ProfileContent({ userData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(seedData.profile.formData);
  const [activeTab, setActiveTab] = useState("info");

  const userStats = seedData.profile.userStats;
  const medicalInfo = seedData.profile.medicalInfo;

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

// ============================================
// COMPONENT: Setting Content
// ============================================
function SettingsContent() {
  const [notificationSettings, setNotificationSettings] = useState(
    seedData.settings.notificationSettings,
  );
  const [displaySettings, setDisplaySettings] = useState(
    seedData.settings.displaySettings,
  );

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
        <h4>⚠️ هشدار</h4>
        <p>
          با حذف حساب کاربری، تمام اطلاعات شما به صورت دائمی پاک خواهد شد و قابل
          بازیابی نیست.
        </p>
        <button className={styles.deleteAccountBtn}>🗑️ حذف حساب کاربری</button>
      </div>
    </div>
  );
}

export default PatientDashboard;
