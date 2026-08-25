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

import moment from "moment-jalaali";

import logo from "../../../public/images/logo/logo2.png";
import userAvatar from "../../../public/images/Patient_Panel/usericon.png";

function PatientDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // ==========================================
  // 📌 STATE های اصلی اینجا تعریف میشن
  // ==========================================
  // ===== داده‌های نوبت‌ها =====
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorId: 1,
      date: "۱۴۰۵/۰۶/۰۴",
      time: "۱۶:۰۰ - ۱۷:۰۰",
      status: "confirmed",
      isOnline: true,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۵/۳۰",
    },
    {
      id: 2,
      type: "جلسه زوج درمانی",
      doctor: "دکتر سارا احمدی",
      doctorId: 2,
      date: "۱۴۰۵/۰۶/۰۶",
      time: "۱۸:۰۰ - ۱۹:۰۰",
      status: "pending",
      isOnline: false,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۵/۳۰",
    },
    {
      id: 3,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorId: 1,
      date: "۱۴۰۵/۰۵/۲۰",
      time: "۱۵:۰۰ - ۱۶:۰۰",
      status: "completed",
      isOnline: true,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۵/۱۵",
    },
    {
      id: 4,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر علی کریمی",
      doctorId: 3,
      date: "۱۴۰۵/۰۵/۱۸",
      time: "۱۰:۰۰ - ۱۱:۰۰",
      status: "cancelled",
      isOnline: true,
      cancelledBy: "user",
      cancelReason: "مشکل شخصی",
      createdAt: "۱۴۰۵/۰۶/۱۰",
    },
  ]);

  // ===== داده‌های نوتیفیکیشن =====
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "reminder",
      // icon: "⏰",
      title: "یادآوری جلسه فردا",
      message:
        "جلسه مشاوره فردی شما با دکتر محمد رضایی فردا ساعت ۱۶:۰۰ برگزار میشود.",
      time: "۵ دقیقه پیش",
      isRead: false,
      date: "۱۴۰۵/۰۵/۲۴",
      link: "/sessions",
      action: "مشاهده جلسه",
    },
    {
      id: 2,
      type: "confirmed",
      // icon: "✅",
      title: "تأیید جلسه",
      message: "دکتر سارا احمدی درخواست جلسه زوج درمانی شما را تأیید کرد.",
      time: "۱ ساعت پیش",
      isRead: false,
      date: "۱۴۰۵/۰۵/۲۴",
      link: "/appointments",
      action: "مشاهده نوبت",
    },
    // ... بقیه اعلان‌ها
  ]);

  // ===== محاسبه تعداد جلسات پیش‌رو =====
  const upcomingAppointmentsCount = useMemo(() => {
    return appointments.filter(
      (app) => app.status === "confirmed" || app.status === "pending",
    ).length;
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
      // badge: 3,
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
      // badge: 5,
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
        return <DashboardContent userData={userData} />;
      case "appointments":
        return <AppointmentsContent />;
      case "sessions":
        return <SessionsContent />;
      case "messages":
        return <MessagesContent />;
      case "progress":
        return <ProgressContent />;
      case "exercise":
        return <ExerciseContent />;
      case "profile":
        return <ProfileContent userData={userData} />;
      case "settings":
        return <SettingsContent />;
      default:
        return <DashboardContent userData={userData} />;
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

            {/* کاربر */}
            {/* <div className={styles.userProfile}>
              <img
                src={userAvatar}
                alt="پروفایل"
                className={styles.userAvatar}
              />
            </div> */}
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
function DashboardContent({ userData }) {
  const stats = [
    { label: "جلسات برگزار شده", value: 8 },
    { label: "جلسات پیش‌رو", value: 3 },
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
// moment.loadPersian();
// import moment from "moment-jalaali";

moment.loadPersian({ usePersianDigits: false });

function AppointmentsContent() {
  // =============================================
  // ۱. STATE‌ها
  // =============================================
  const [activeFilter, setActiveFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorId: 1,
      date: "۱۴۰۵/۰۶/۰۴",
      time: "۱۰:۰۰ - ۱۱:۰۰",
      status: "confirmed", // confirmed | pending | completed | cancelled
      isOnline: true,
      cancelledBy: null, // 'user' | 'doctor' | null
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۶/۳",
    },
    {
      id: 2,
      type: "جلسه زوج درمانی",
      doctor: "دکتر سارا احمدی",
      doctorId: 2,
      date: "۱۴۰۵/۰۶/۰۶",
      time: "۱۸:۰۰ - ۱۹:۰۰",
      status: "pending",
      isOnline: false,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۶/۵",
    },
    {
      id: 3,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorId: 1,
      date: "۱۴۰۵/۰۵/۲۰",
      time: "۱۵:۰۰ - ۱۶:۰۰",
      status: "completed",
      isOnline: true,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۵/۱۰",
    },
    {
      id: 4,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر علی کریمی",
      doctorId: 3,
      date: "۱۴۰۵/۰۵/۱۸",
      time: "۱۰:۰۰ - ۱۱:۰۰",
      status: "cancelled",
      isOnline: true,
      cancelledBy: "user",
      cancelReason: "مشکل شخصی",
      createdAt: "۱۴۰۵/۰۶/۰۱",
    },
    {
      id: 5,
      type: "جلسه زوج درمانی",
      doctor: "دکتر سارا احمدی",
      doctorId: 2,
      date: "۱۴۰۵/۰۵/۱۵",
      time: "۱۷:۰۰ - ۱۸:۰۰",
      status: "cancelled",
      isOnline: false,
      cancelledBy: "doctor",
      cancelReason: "هماهنگی با پزشک",
      createdAt: "۱۴۰۵/۰۵/۳۰",
    },
    {
      id: 6, // جدید - قابل لغو
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorId: 1,
      date: "۱۴۰۵/۰۶/۱۰", // ۱۴ روز بعد - قابل لغو
      time: "۱۴:۰۰ - ۱۵:۰۰",
      status: "confirmed",
      isOnline: true,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۶/۰۵",
    },
  ]);

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

  const convertJalaliToDate = (date, time) => {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const englishDigits = "0123456789";

    const normalize = (str) =>
      str.replace(/[۰-۹]/g, (d) => englishDigits[persianDigits.indexOf(d)]);

    const normalizedDate = normalize(date);
    const normalizedTime = normalize(time);

    const [y, m, d] = normalizedDate.split("/");
    const [hour, minute] = normalizedTime.split(":");

    const result = moment(
      `${y}/${m}/${d} ${hour}:${minute}`,
      "jYYYY/jMM/jDD HH:mm",
    );

    console.log("converted:", result.format(), result.isValid());

    return result.toDate();
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
  const normalizeTime = (time) => {
    const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
    const englishDigits = "0123456789";

    const normalized = time.replace(
      /[۰-۹]/g,
      (d) => englishDigits[persianDigits.indexOf(d)],
    );

    let [hour, minute] = normalized.split(":").map(Number);

    const extraDays = Math.floor(hour / 24);

    hour = hour % 24;

    return {
      hour,
      minute,
      extraDays,
    };
  };

  // ===== بررسی قانون ۲۴ ساعت =====
  const canCancel = (appointment) => {
    if (
      appointment.status !== "confirmed" &&
      appointment.status !== "pending"
    ) {
      return false;
    }

    const [rawStartTime] = appointment.time.split(" - ");

    const normalizedTime = normalizeTime(rawStartTime);

    const appointmentDate = convertJalaliToDate(
      appointment.date,
      `${normalizedTime.hour}:${String(normalizedTime.minute).padStart(2, "0")}`,
    );

    appointmentDate.setDate(
      appointmentDate.getDate() + normalizedTime.extraDays,
    );

    const now = new Date();

    const diffMilliseconds = appointmentDate.getTime() - now.getTime();

    const diffHours = diffMilliseconds / (1000 * 60 * 60);

    console.log(
      appointment.date,
      appointment.time,
      "remaining hours:",
      diffHours,
    );

    return diffHours >= 24;
  };

  // ===== فیلتر کردن (با استفاده از sortedAppointments) =====
  const getFilteredAppointments = () => {
    if (activeFilter === "all") return sortedAppointments;
    return sortedAppointments.filter((item) => item.status === activeFilter);
  };

  const filteredAppointments = getFilteredAppointments();

  // ===== تابع لغو نوبت =====
  const handleCancelAppointment = (appointmentId) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    const now = new Date();
    const [rawStartTime] = appointment.time.split(" - ");
    const normalizedTime = normalizeTime(rawStartTime);

    const appointmentDate = convertJalaliToDate(
      appointment.date,
      `${normalizedTime.hour}:${normalizedTime.minute}`,
    );

    appointmentDate.setDate(
      appointmentDate.getDate() + normalizedTime.extraDays,
    );

    const diffHours = (appointmentDate - now) / (1000 * 60 * 60);

    if (diffHours < 24) {
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
        createdAt: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    setShowModal(false);
    alert("درخواست نوبت با موفقیت ثبت شد.");
  };

  // ===== وضعیت‌ها =====
  const filters = [
    { id: "all", label: "همه" },
    { id: "confirmed", label: "تأیید شده" },
    { id: "pending", label: "در انتظار" },
    { id: "completed", label: "انجام شده" },
    { id: "cancelled", label: "لغو شده" },
  ];

  // ===== دریافت اطلاعات وضعیت =====
  const getStatusInfo = (status) => {
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
                // appointments.filter((item) =>
                sortedAppointments.filter((item) =>
                  filter.id === "all" ? true : item.status === filter.id,
                ).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* لیست نوبت‌ها */}
      <div className={styles.appointmentsList}>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => {
            const statusInfo = getStatusInfo(appointment.status);
            const isCancellable = canCancel(appointment);

            return (
              <div key={appointment.id} className={styles.appointmentCard}>
                {/* وضعیت */}
                <div className={styles.appointmentStatusBar}>
                  <span
                    className={`${styles.statusBadge} ${statusInfo.className}`}
                  >
                    {statusInfo.label}
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
                  <div className={styles.appointmentActions}>
                    {/* ===== وضعیت تأیید شده ===== */}
                    {appointment.status === "confirmed" && (
                      <>
                        {isCancellable ? (
                          <button
                            className={styles.btnCancel}
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                          >
                            لغو نوبت
                          </button>
                        ) : (
                          <button className={styles.btnCancelDisabled} disabled>
                            لغو غیرفعال (کمتر از ۲۴ ساعت)
                          </button>
                        )}
                      </>
                    )}

                    {/* ===== وضعیت در انتظار ===== */}
                    {appointment.status === "pending" && (
                      <>
                        <button className={styles.btnPending}>
                          در انتظار تأیید
                        </button>
                        {isCancellable ? (
                          <button
                            className={styles.btnCancel}
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                          >
                            لغو درخواست
                          </button>
                        ) : (
                          <button className={styles.btnCancelDisabled} disabled>
                            لغو غیرفعال (کمتر از ۲۴ ساعت)
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
      />
    </div>
  );
}

// ============================================
// COMPONENT: New Appointment Modal
// ============================================
function NewAppointmentModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: انتخاب روانشناس | 2: انتخاب زمان | 3: تأیید
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointmentType, setAppointmentType] = useState("individual"); // individual | couple | teen

  // لیست روانشناسان نمونه
  const doctors = [
    {
      id: 1,
      name: "دکتر محمد رضایی",
      specialty: "روانشناس بالینی",
      experience: "۱۲ سال",
      rating: 4.8,
      image: "/images/doctors/doctor1.png",
      availableDays: ["شنبه", "یکشنبه", "سه‌شنبه"],
    },
    {
      id: 2,
      name: "دکتر سارا احمدی",
      specialty: "روانشناس خانواده و زوج",
      experience: "۸ سال",
      rating: 4.9,
      image: "/images/doctors/doctor2.png",
      availableDays: ["شنبه", "دوشنبه", "چهارشنبه"],
    },
    {
      id: 3,
      name: "دکتر علی کریمی",
      specialty: "روانشناس کودک و نوجوان",
      experience: "۱۰ سال",
      rating: 4.7,
      image: "/images/doctors/doctor3.png",
      availableDays: ["یکشنبه", "سه‌شنبه", "پنجشنبه"],
    },
  ];

  // ساعت‌های قابل انتخاب
  const timeSlots = [
    "۱۰:۰۰",
    "۱۱:۰۰",
    "۱۲:۰۰",
    "۱۴:۰۰",
    "۱۵:۰۰",
    "۱۶:۰۰",
    "۱۷:۰۰",
  ];

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
                      <span>📅 {doctor.experience}</span>
                      <span>⭐ {doctor.rating}</span>
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
            <div className={styles.dateTimeSection}>
              <div className={styles.dateGrid}>
                {[
                  "شنبه",
                  "یکشنبه",
                  "دوشنبه",
                  "سه‌شنبه",
                  "چهارشنبه",
                  "پنجشنبه",
                ].map((day) => (
                  <button
                    key={day}
                    className={`${styles.dateBtn} ${
                      selectedDate === day ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className={styles.dateDay}>{day}</span>
                    <span className={styles.dateNum}>۲۵</span>
                  </button>
                ))}
              </div>

              <div className={styles.timeGrid}>
                {timeSlots.map((time) => (
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
          </div>
        )}

        {/* ===== مرحله ۳: تأیید نهایی ===== */}
        {step === 3 && (
          <div className={styles.modalStep}>
            <div className={styles.confirmBox}>
              <div className={styles.confirmIcon}>✅</div>
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
                  <span className={styles.confirmLabel}>تاریخ:</span>
                  <span className={styles.confirmValue}>{selectedDate}</span>
                </div>
                <div className={styles.confirmItem}>
                  <span className={styles.confirmLabel}>ساعت:</span>
                  <span className={styles.confirmValue}>{selectedTime}</span>
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
                  alert("لطفاً یک روانشناس انتخاب کنید");
                  return;
                }
                if (step === 2 && (!selectedDate || !selectedTime)) {
                  alert("لطفاً تاریخ و ساعت را انتخاب کنید");
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
                // ذخیره نوبت
                const newAppointment = {
                  id: Date.now(),
                  doctor: selectedDoctor?.name,
                  doctorId: selectedDoctor?.id,
                  date: selectedDate,
                  time: selectedTime,
                  status: "pending",
                };
                // اضافه کردن به لیست نوبت‌ها
                // ...
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
function SessionsContent() {
  const [activeTab, setActiveTab] = useState("upcoming"); // upcoming | past
  const [selectedSession, setSelectedSession] = useState(null);

  // داده‌های نمونه
  const sessions = [
    {
      id: 1,
      title: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorImage: "/images/doctors/doctor1.png",
      date: "۱۴۰۵/۰۶/۰۳",
      time: "۱۶:۰۰",
      duration: "۶۰ دقیقه",
      status: "upcoming", // upcoming | ongoing | completed | cancelled
      isOnline: true,
      meetingLink: "https://meet.google.com/abc-defg-hij",
      type: "individual",
    },
    {
      id: 2,
      title: "جلسه زوج درمانی",
      doctor: "دکتر سارا احمدی",
      doctorImage: "/images/doctors/doctor2.png",
      date: "۱۴۰۵/۰۶/۰۶",
      time: "۱۸:۰۰",
      duration: "۹۰ دقیقه",
      status: "upcoming",
      isOnline: true,
      meetingLink: "https://meet.google.com/klm-nopq-rst",
      type: "couple",
    },
    {
      id: 3,
      title: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorImage: "/images/doctors/doctor1.png",
      date: "۱۴۰۵/۰۵/۲۰",
      time: "۱۵:۰۰",
      duration: "۶۰ دقیقه",
      status: "completed",
      isOnline: true,
      meetingLink: "https://meet.google.com/xyz-uvwx-yza",
      type: "individual",
    },
    // {
    //   id: 4,
    //   title: "جلسه مشاوره نوجوان",
    //   doctor: "دکتر علی کریمی",
    //   doctorImage: "/images/doctors/doctor3.png",
    //   date: "۱۴۰۳/۰۹/۱۰",
    //   time: "۱۰:۰۰",
    //   duration: "۶۰ دقیقه",
    //   status: "cancelled",
    //   isOnline: true,
    //   meetingLink: null,
    //   type: "teen",
    // },
  ];

  // ===== فیلتر کردن جلسات =====
  const getFilteredSessions = () => {
    if (activeTab === "upcoming") {
      return sessions.filter(
        (s) => s.status === "upcoming" || s.status === "ongoing",
      );
    }
    return sessions.filter(
      // (s) => s.status === "completed" || s.status === "cancelled",

      (s) => s.status === "completed" || s.status === "cancelled",
    );
  };

  const filteredSessions = getFilteredSessions();

  // ===== وضعیت‌ها =====
  const getStatusInfo = (status) => {
    const statusMap = {
      upcoming: {
        label: "در انتظار",
        className: styles.sessionUpcoming,
      },
      ongoing: {
        label: "در حال برگزاری",
        className: styles.sessionOngoing,
      },
      completed: {
        label: "انجام شده",
        className: styles.sessionCompleted,
      },
      // cancelled: {
      //   label: "لغو شده",
      //   className: styles.sessionCancelled,
      // },
    };
    return statusMap[status] || statusMap.upcoming;
  };

  const normalizePersian = (str) => {
    const persian = "۰۱۲۳۴۵۶۷۸۹";
    const english = "0123456789";

    return str.replace(/[۰-۹]/g, (d) => english[persian.indexOf(d)]);
  };

  const convertJalaliToDate = (date, time) => {
    const normalizedDate = normalizePersian(date);
    const normalizedTime = normalizePersian(time);

    const [y, m, d] = normalizedDate.split("/");
    const [hour, minute] = normalizedTime.split(":");

    return moment(
      `${y}/${m}/${d} ${hour}:${minute}`,
      "jYYYY/jMM/jDD HH:mm",
    ).toDate();
  };

  // ===== پیدا کردن جلسه بعدی (نزدیک‌ترین جلسه) =====
  const getNextSession = () => {
    const upcomingSessions = sessions.filter(
      (s) => s.status === "upcoming" || s.status === "ongoing",
    );

    if (upcomingSessions.length === 0) return null;

    return upcomingSessions.sort((a, b) => {
      const dateA = convertJalaliToDate(a.date, a.time);
      const dateB = convertJalaliToDate(b.date, b.time);

      return dateA - dateB;
    })[0];

    // مرتب‌سازی بر اساس تاریخ و زمان
    // return upcomingSessions.sort((a, b) => {
    //   const dateA = new Date(a.date + " " + a.time);
    //   const dateB = new Date(b.date + " " + b.time);
    //   return dateA - dateB;
    // })[0];
  };

  const nextSession = getNextSession();

  // ===== تایمر شمارش معکوس (فقط برای جلسه بعدی) =====
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!nextSession) return;

    // const targetDate = new Date(nextSession.date + " " + nextSession.time);
    const targetDate = convertJalaliToDate(nextSession.date, nextSession.time);

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(null);
        // می‌تونی وضعیت جلسه رو به "ongoing" تغییر بدی
      } else {
        // const hours = Math.floor(diff / (1000 * 60 * 60));
        // const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        // setTimeLeft({ hours, minutes });

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );

        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft({
          days,
          hours,
          minutes,
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextSession]);

  // ===== تابع لغو جلسه =====
  const handleCancelSession = (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    // ===== اگر قبلاً لغو شده =====
    if (session.status === "cancelled") {
      alert("این جلسه قبلاً لغو شده است.");
      return;
    }

    // ===== بررسی قانون ۲۴ ساعت =====
    const now = new Date();
    const sessionDate = new Date(session.date + " " + session.time);
    const diffHours = (sessionDate - now) / (1000 * 60 * 60);

    if (diffHours < 24) {
      alert("امکان لغو جلسه کمتر از ۲۴ ساعت قبل وجود ندارد.");
      return;
    }

    const reason = prompt("لطفاً دلیل لغو جلسه را وارد کنید:");
    if (reason === null) return;

    // ===== به‌روزرسانی وضعیت =====
    setSessions((prev) =>
      prev.map((item) =>
        item.id === sessionId
          ? {
              ...item,
              status: "cancelled",
              cancelledBy: "user",
              cancelReason: reason,
            }
          : item,
      ),
    );

    alert("جلسه با موفقیت لغو شد.");
  };

  // ===== بررسی امکان لغو =====
  const canCancelSession = (session) => {
    if (session.status !== "upcoming") return false;

    const now = new Date();
    const sessionDate = new Date(session.date + " " + session.time);
    const diffHours = (sessionDate - now) / (1000 * 60 * 60);
    return diffHours >= 24;
  };

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
            {/* <span className={styles.statNumber}>۳</span> */}
            <span className={styles.statNumber}>
              {
                sessions.filter(
                  (s) => s.status === "upcoming" || s.status === "ongoing",
                ).length
              }
            </span>
            <span className={styles.statLabel}>جلسه پیش‌رو</span>
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>
            {/* <span className={styles.statNumber}>۱۲</span> */}
            <span className={styles.statNumber}>
              {sessions.filter((s) => s.status === "completed").length}
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
        </button>
        <button
          className={`${styles.filterTab} ${
            activeTab === "past" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("past")}
        >
          تاریخچه جلسات
        </button>
      </div>

      {/* لیست جلسات */}
      <div className={styles.sessionsList}>
        {/* جلسه بعدی - کارت ویژه */}
        {activeTab === "upcoming" && nextSession && (
          <div className={styles.nextSessionBanner}>
            <div className={styles.nextSessionContent}>
              <span className={styles.nextSessionLabel}>جلسه بعدی شما</span>
              <h3>{nextSession.title}</h3>
              <p>با {nextSession.doctor}</p>
              <div className={styles.nextSessionTime}>
                <span>{nextSession.date}</span>
                <span>-</span>
                <span>{nextSession.time}</span>
              </div>
            </div>

            <div className={styles.nextSessionTimerEnterContainer}>
              <button className={styles.btnNextSession}>
                ورود به جلسه
                <span>→</span>
              </button>

              {/* ===== تایمر فقط اینجا ===== */}
              {timeLeft && (
                <div className={styles.nextSessionTimer}>
                  <span className={styles.timerLabel}>زمان تا شروع:</span>
                  <div className={styles.timerDigits}>
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

        {/* ===== لیست بقیه جلسات (بدون تایمر) ===== */}
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => {
            // اگر این جلسه، جلسه بعدی هست، از رندر کردنش صرف‌نظر کن
            if (nextSession && session.id === nextSession.id) return null;

            const statusInfo = getStatusInfo(session.status);
            const isUpcoming =
              session.status === "upcoming" || session.status === "ongoing";

            return (
              <div key={session.id} className={styles.sessionCard}>
                {/* هدر کارت */}
                <div className={styles.sessionCardHeader}>
                  <div className={styles.sessionDoctor}>
                    <img
                      src={session.doctorImage}
                      alt={session.doctor}
                      className={styles.sessionDoctorAvatar}
                    />
                    <div>
                      <h4>{session.doctor}</h4>
                      <span className={styles.sessionType}>
                        {session.title}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`${styles.sessionStatus} ${statusInfo.className}`}
                  >
                    <span className={styles.statusDot}></span>
                    {statusInfo.label}
                  </span>
                </div>

                {/* جزئیات جلسه (بدون تایمر) */}
                <div className={styles.sessionDetails}>
                  <div className={styles.sessionMeta}>
                    <div className={styles.metaGroup}>
                      <span>{session.date}</span>
                    </div>
                    <div className={styles.metaGroup}>
                      <span>
                        {session.time} - {session.duration}
                      </span>
                    </div>
                    <div className={styles.metaGroup}>
                      <span>جلسه آنلاین</span>
                    </div>
                  </div>
                </div>

                {/* دکمه‌های اکشن */}
                <div className={styles.sessionActions}>
                  {session.status === "upcoming" && (
                    <>
                      {/* ===== اگر جلسه بعدی است ===== */}
                      {nextSession && session.id === nextSession.id ? (
                        <button className={styles.btnJoinSession}>
                          <span>▶</span>
                          ورود به جلسه
                        </button>
                      ) : (
                        /* ===== اگر جلسه آتی است ===== */
                        <>
                          {canCancelSession(session) ? (
                            <button
                              className={styles.btnCancelSession}
                              onClick={() => handleCancelSession(session.id)}
                            >
                              لغو جلسه
                            </button>
                          ) : (
                            <button
                              className={styles.btnCancelDisabled}
                              disabled
                            >
                              لغو غیرفعال (کمتر از ۲۴ ساعت)
                            </button>
                          )}
                          {/* <button className={styles.btnRemind}>
                            🔔 یادآوری
                          </button> */}
                        </>
                      )}
                    </>
                  )}

                  {session.status === "ongoing" && (
                    <button className={styles.btnJoinNow}>
                      <span className={styles.pulseDot}></span>
                      ورود به جلسه (در حال برگزاری)
                    </button>
                  )}

                  {session.status === "completed" && (
                    <>
                      <button className={styles.btnViewRecord}>
                        مشاهده ضبط جلسه
                      </button>
                      {/* <button className={styles.btnFeedback}>
                        ثبت بازخورد
                      </button> */}
                    </>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎥</span>
            <h3>هیچ جلسه‌ای در این دسته وجود ندارد</h3>
            <p>
              {activeTab === "upcoming"
                ? "شما هیچ جلسه پیش‌رویی ندارید."
                : "هنوز جلسه برگزار شده‌ای وجود ندارد."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Messages Content (Notification Center)
// ============================================
function MessagesContent() {
  const [filter, setFilter] = useState("all"); // all | unread | read
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "reminder",
      title: "یادآوری جلسه فردا",
      message:
        "جلسه مشاوره فردی شما با دکتر محمد رضایی فردا ساعت ۱۶:۰۰ برگزار میشود.",
      time: "۵ دقیقه پیش",
      isRead: false,
      date: "۱۴۰۵/۰۵/۲۴",
      link: "/sessions",
      action: "مشاهده جلسه",
    },
    {
      id: 2,
      type: "confirmed",
      title: "تأیید جلسه",
      message: "دکتر سارا احمدی درخواست جلسه زوج درمانی شما را تأیید کرد.",
      time: "۱ ساعت پیش",
      isRead: false,
      date: "۱۴۰۵/۰۵/۲۴",
      link: "/appointments",
      action: "مشاهده نوبت",
    },
    {
      id: 3,
      type: "cancelled",
      title: "لغو جلسه توسط روانشناس",
      message: "دکتر علی کریمی جلسه مشاوره نوجوان را به دلیل هماهنگی لغو کرد.",
      time: "۳ ساعت پیش",
      isRead: false,
      date: "۱۴۰۵/۰۵/۲۴",
      link: "/appointments",
      action: "مشاهده جلسات",
    },
    {
      id: 4,
      type: "note",
      title: "یادداشت جدید از روانشناس",
      message: "دکتر محمد رضایی برای جلسه قبلی شما یادداشتی ثبت کرده است.",
      time: "۵ ساعت پیش",
      isRead: true,
      date: "۱۴۰۵/۰۵/۲۳",
      link: "/sessions",
      action: "مشاهده یادداشت",
    },
    {
      id: 5,
      type: "booking",
      title: "رزرو جلسه جدید",
      message:
        "شما جلسه مشاوره فردی را برای تاریخ ۱۴۰۵/۰۵/۲۸ ساعت ۱۷:۰۰ رزرو کردید.",
      time: "۱ روز پیش",
      isRead: true,
      date: "۱۴۰۵/۰۵/۲۳",
      link: "/appointments",
      action: "مشاهده نوبت",
    },
    {
      id: 6,
      type: "weekly",
      title: "زمان جلسات هفتگی",
      message:
        "زمان جلسات هفتگی شما فرا رسیده است. آیا مایل به رزرو جلسه جدید هستید؟",
      time: "۲ روز پیش",
      isRead: true,
      date: "۱۴۰۵/۰۵/۲۲",
      link: "/appointments",
      action: "رزرو جلسه",
    },
    {
      id: 7,
      type: "reminder",
      title: "یادآوری جلسه امروز",
      message:
        "جلسه مشاوره فردی شما با دکتر سارا احمدی امروز ساعت ۱۸:۰۰ برگزار میشود.",
      time: "۳ روز پیش",
      isRead: true,
      date: "۱۴۰۵/۰۵/۲۲",
      link: "/sessions",
      action: "ورود به جلسه",
    },
  ]);

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
            ✓ همه را خوانده شد
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
          همه
           &nbsp;
          <span className={styles.filterCount}>{notifications.length}</span>
        </button>
        <button
          className={`${styles.filterTab} ${
            filter === "unread" ? styles.active : ""
          }`}
          onClick={() => setFilter("unread")}
        >
          خوانده نشده
           &nbsp;
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
          خوانده شده
           &nbsp;
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
                {/* آیکون */}
                {/* <div
                  className={styles.notificationIcon}
                  style={{ background: typeStyle.bg }}
                >
                  <span>{typeStyle.icon}</span>
                </div> */}

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
                  {/* <div className={styles.notificationFooter}> */}
                    {/* <button
                      className={styles.notificationAction}
                      onClick={(e) => {
                        e.stopPropagation();
                        // هدایت به صفحه مربوطه
                        // navigate(notification.link);
                      }}
                    >
                      {notification.action}
                      <span>→</span>
                    </button> */}
                    {/* <button
                      className={styles.notificationDelete}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      ✕
                    </button> */}
                  {/* </div> */}
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
            {/* <span className={styles.emptyIcon}>🔔</span> */}
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
  const navigate = useNavigate();

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

  // ===== دریافت آیکون بر اساس نوع =====
  // const getIcon = (type) => {
  //   const icons = {
  //     reminder: "⏰",
  //     confirmed: "✅",
  //     cancelled: "❌",
  //     note: "📝",
  //     booking: "📅",
  //     weekly: "🔄",
  //   };
  //   return icons[type] || "🔔";
  // };

  // ===== دریافت استایل بر اساس نوع =====
  const getTypeStyle = (type) => {
    const styles = {
      reminder: "#e3f2fd",
      confirmed: "#e8f5e9",
      cancelled: "#fbe9e7",
      note: "#fff3e0",
      booking: "#e8eaf6",
      weekly: "#f3e5f5",
    };
    return styles[type] || "#f5f5f5";
  };

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
                  setIsOpen(false);
                }}
              >
                همه را خوانده شد
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
                    setIsOpen(false);
                    // هدایت به صفحه مربوطه
                    if (notification.link) {
                      navigate(notification.link);
                    }
                  }}
                >
                  {/* <div
                    className={styles.dropdownIcon}
                    style={{ background: getTypeStyle(notification.type) }}
                  >
                    <span>{getIcon(notification.type)}</span>
                  </div> */}
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
                      {notification.message.length > 50
                        ? notification.message.slice(0, 50) + "..."
                        : notification.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.dropdownEmpty}>
                {/* <span className={styles.dropdownEmptyIcon}>🎉</span> */}
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
                  setActiveTab("messages"); // هدایت به بخش پیام‌ها
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
  // ===== داده‌های نمونه =====
  const progressData = {
    totalSessions: 12,
    completedSessions: 8,
    cancelledSessions: 1,
    upcomingSessions: 3,
    percentage: 65,
    status: "در مسیر",
    startDate: "۱۴۰۳/۰۶/۱۵",
    estimatedEndDate: "۱۴۰۳/۱۲/۱۵",

    // داده‌های نمودار ماهانه
    monthlyProgress: [
      { month: "مهر", sessions: 2 },
      { month: "آبان", sessions: 3 },
      { month: "آذر", sessions: 3 },
      { month: "دی", sessions: 0 },
    ],

    // نقاط عطف
    milestones: [
      {
        id: 1,
        title: "شروع درمان",
        date: "۱۴۰۳/۰۶/۱۵",
        completed: true,
        description: "اولین جلسه مشاوره",
      },
      {
        id: 2,
        title: "ارزیابی اولیه",
        date: "۱۴۰۳/۰۷/۰۵",
        completed: true,
        description: "تکمیل پرسشنامه‌ها",
      },
      {
        id: 3,
        title: "تثبیت پیشرفت",
        date: "۱۴۰۳/۰۹/۱۵",
        completed: false,
        description: "هدف: کاهش ۵۰٪ علائم",
      },
      {
        id: 4,
        title: "پایان درمان",
        date: "۱۴۰۳/۱۲/۱۵",
        completed: false,
        description: "ارزیابی نهایی",
      },
    ],

    // حوزه‌های بهبود
    improvementAreas: [
      { label: "مدیریت استرس", score: 75, color: "#4CAF84" },
      { label: "کیفیت خواب", score: 60, color: "#FF9800" },
      { label: "اعتماد به نفس", score: 80, color: "#2196F3" },
      { label: "روابط اجتماعی", score: 55, color: "#9C27B0" },
      { label: "مدیریت خشم", score: 70, color: "#E91E63" },
    ],
  };

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
  const [exercises, setExercises] = useState([
    {
      id: 1,
      title: "تمرین تنفس عمیق",
      description:
        "هر شب قبل از خواب، ۱۰ دقیقه تنفس عمیق انجام دهید. ۴ ثانیه دم، ۷ ثانیه نگه‌داری، ۸ ثانیه بازدم.",
      type: "daily", // daily | weekly | one-time
      category: "meditation", // meditation | writing | test | activity
      icon: "🧘",
      dueDate: "۱۴۰۳/۰۹/۳۰",
      completed: false,
      priority: "high", // high | medium | low
      progress: 0, // 0-100
      instructions: [
        "در جای آرام بنشینید",
        "چشم‌ها را ببندید",
        "روی تنفس خود تمرکز کنید",
        "۴ ثانیه دم، ۷ ثانیه نگه‌داری، ۸ ثانیه بازدم",
      ],
      assignedBy: "دکتر محمد رضایی",
      assignedDate: "۱۴۰۳/۰۹/۲۰",
    },
    {
      id: 2,
      title: "نوشتن نامه به خود",
      description:
        "نامه‌ای به خودتان بنویسید و احساسات و افکارتان را بیان کنید.",
      type: "one-time",
      category: "writing",
      icon: "✍️",
      dueDate: "۱۴۰۳/۱۰/۰۵",
      completed: false,
      priority: "medium",
      progress: 0,
      instructions: [
        "یک مکان آرام پیدا کنید",
        "نامه را با 'خود عزیزم' شروع کنید",
        "احساسات واقعی خود را بنویسید",
        "نامه را برای خودتان بخوانید",
      ],
      assignedBy: "دکتر محمد رضایی",
      assignedDate: "۱۴۰۳/۰۹/۲۲",
    },
    {
      id: 3,
      title: "تست ارزیابی استرس",
      description:
        "پرسشنامه ارزیابی سطح استرس را تکمیل کنید و نتیجه را ثبت کنید.",
      type: "weekly",
      category: "test",
      icon: "📊",
      dueDate: "۱۴۰۳/۱۰/۰۱",
      completed: false,
      priority: "high",
      progress: 0,
      instructions: [
        "به سوالات با دقت پاسخ دهید",
        "پاسخ‌ها را صادقانه بدهید",
        "نتیجه را یادداشت کنید",
        "در جلسه بعد با دکتر خود به اشتراک بگذارید",
      ],
      assignedBy: "دکتر محمد رضایی",
      assignedDate: "۱۴۰۳/۰۹/۲۳",
    },
    {
      id: 4,
      title: "تمرین شکرگزاری روزانه",
      description: "هر روز ۳ مورد که بابت آنها شکرگزار هستید را بنویسید.",
      type: "daily",
      category: "activity",
      icon: "🙏",
      dueDate: "۱۴۰۳/۰۹/۳۰",
      completed: true,
      priority: "low",
      progress: 100,
      instructions: [
        "هر شب قبل از خواب انجام دهید",
        "۳ مورد را یادداشت کنید",
        "می‌توانید کوچک یا بزرگ باشند",
        "احساس خود را هنگام نوشتن ثبت کنید",
      ],
      assignedBy: "دکتر محمد رضایی",
      assignedDate: "۱۴۰۳/۰۹/۱۸",
    },
  ]);

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

  // ===== تابع ثبت پیشرفت =====
  const updateProgress = (id, value) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? { ...ex, progress: Math.min(100, Math.max(0, value)) }
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
            همه
             &nbsp;
            <span className={styles.filterCount}>{exercises.length}</span>
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "daily" ? styles.active : ""
            }`}
            onClick={() => setFilter("daily")}
          >
            🌙 روزانه
             &nbsp;
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
            📅 هفتگی
             &nbsp;
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
            ⭐ یک‌باره
             &nbsp;
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
  const [formData, setFormData] = useState({
    firstName: "محمد",
    lastName: "کریمی",
    phone: userData?.phone || "۹۱۲۳۴۵۶۷۸۹",
    email: "mohammad.karimi@email.com",
    gender: "male", // male | female
    birthDate: "۱۳۷۵/۰۳/۱۵",
    occupation: "برنامه‌نویس",
    education: "کارشناسی ارشد",
    address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
    emergencyContact: "۰۹۱۲۳۴۵۶۷۸۹",
    emergencyRelation: "همسر",
  });

  const [activeTab, setActiveTab] = useState("info"); // info | medical | settings

  // ===== آمار کاربر =====
  const userStats = {
    totalSessions: 8,
    completedExercises: 12,
    totalExercises: 18,
    joinDate: "۱۴۰۳/۰۶/۱۵",
    lastVisit: "۱۴۰۳/۰۹/۲۴",
    upcomingAppointment: "۱۴۰۳/۰۹/۲۸",
  };

  // ===== اطلاعات پزشکی (نمونه) =====
  const medicalInfo = {
    therapist: "دکتر محمد رضایی",
    diagnosis: "اضطراب فراگیر",
    treatmentPlan: "درمان شناختی-رفتاری (CBT)",
    medications: "ندارد",
    allergies: "ندارد",
    specialNotes: "جلسات به صورت هفتگی برگزار می‌شود.",
  };

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
          {/* <button
            className={`${styles.profileTab} ${
              activeTab === "settings" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            تنظیمات
          </button> */}
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

          {/* ===== تب تنظیمات ===== */}
          {/* {activeTab === "settings" && (
            <div className={styles.settingsTab}>
              <div className={styles.settingsGroup}>
                <h4>اعلان‌ها</h4>
                <div className={styles.settingItem}>
                  <span>یادآوری جلسات</span>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.switchSlider}></span>
                  </label>
                </div>
                <div className={styles.settingItem}>
                  <span>یادآوری تمارین</span>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.switchSlider}></span>
                  </label>
                </div>
                <div className={styles.settingItem}>
                  <span>پیام‌های روانشناس</span>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.switchSlider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.settingsGroup}>
                <h4>🌙 نمایش</h4>
                <div className={styles.settingItem}>
                  <span>حالت شب</span>
                  <label className={styles.switch}>
                    <input type="checkbox" />
                    <span className={styles.switchSlider}></span>
                  </label>
                </div>
                <div className={styles.settingItem}>
                  <span>نمایش اعلان‌های خوانده شده</span>
                  <label className={styles.switch}>
                    <input type="checkbox" defaultChecked />
                    <span className={styles.switchSlider}></span>
                  </label>
                </div>
              </div>

              <div className={styles.settingsGroup}>
                <h4>حریم خصوصی</h4>
                <div className={styles.settingItem}>
                  <span>تغییر رمز عبور</span>
                  <button className={styles.changePasswordBtn}>تغییر</button>
                </div>
                <div className={styles.settingItem}>
                  <span>دسترسی به اطلاعات پزشکی</span>
                  <button className={styles.changePasswordBtn}>مدیریت</button>
                </div>
              </div>

              <div className={styles.settingsDanger}>
                <h4>⚠️ خطرناک</h4>
                <button className={styles.deleteAccountBtn}>
                  🗑️ حذف حساب کاربری
                </button>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Setting Content
// ============================================

function SettingsContent() {
  // ===== تنظیمات اعلان‌ها =====
  const [notificationSettings, setNotificationSettings] = useState({
    // ===== یادآوری جلسات =====
    sessionReminder: {
      enabled: true,
      method: "sms", // sms | email | both
      timing: 2, // چند ساعت قبل
    },
    // ===== یادآوری تمارین =====
    exerciseReminder: {
      enabled: true,
      method: "sms",
    },
    // ===== پیام‌های روانشناس =====
    therapistMessages: {
      enabled: true,
      method: "sms",
    },
    // ===== گزارش هفتگی =====
    weeklyReport: {
      enabled: false,
      method: "email",
    },
  });

  // ===== تنظیمات نمایش =====
  const [displaySettings, setDisplaySettings] = useState({
    darkMode: false,
    showReadNotifications: true,
    language: "fa", // fa | en
  });

  // ===== تنظیمات حریم خصوصی =====
  const [privacySettings, setPrivacySettings] = useState({
    shareMedicalInfo: true,
    shareProgress: true,
  });

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
              {/* <span className={styles.settingIcon}>📅</span> */}
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
                  {/* <button
                    className={`${styles.methodBtn} ${
                      notificationSettings.sessionReminder.method === "email"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => changeMethod("sessionReminder", "email")}
                  >
                    ایمیل
                  </button> */}
                  {/* <button
                    className={`${styles.methodBtn} ${
                      notificationSettings.sessionReminder.method === "both"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => changeMethod("sessionReminder", "both")}
                  >
                    📱✉️ هر دو
                  </button> */}
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
              {/* <span className={styles.settingIcon}>🧠</span> */}
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
                  {/* <button
                    className={`${styles.methodBtn} ${
                      notificationSettings.exerciseReminder.method === "email"
                        ? styles.active
                        : ""
                    }`}
                    onClick={() => changeMethod("exerciseReminder", "email")}
                  >
                    ایمیل
                  </button> */}
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
              {/* <span className={styles.settingIcon}>📊</span> */}
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

        {/* <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              <span className={styles.settingIcon}>👁️</span>
              <div>
                <h4>نمایش اعلان‌های خوانده شده</h4>
                <p>نمایش اعلان‌های قدیمی در لیست</p>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={displaySettings.showReadNotifications}
                onChange={() =>
                  setDisplaySettings((prev) => ({
                    ...prev,
                    showReadNotifications: !prev.showReadNotifications,
                  }))
                }
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
        </div> */}

        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              {/* <span className={styles.settingIcon}>🌐</span> */}
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

      {/* ===== بخش حریم خصوصی ===== */}
      {/* <div className={styles.settingsSection}>
        <h3>🔒 حریم خصوصی</h3>
        <p className={styles.sectionDescription}>
          مدیریت دسترسی و اشتراک‌گذاری اطلاعات
        </p>

        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              <span className={styles.settingIcon}>🏥</span>
              <div>
                <h4>اشتراک اطلاعات پزشکی</h4>
                <p>اجازه دسترسی روانشناس به اطلاعات پزشکی</p>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={privacySettings.shareMedicalInfo}
                onChange={() =>
                  setPrivacySettings((prev) => ({
                    ...prev,
                    shareMedicalInfo: !prev.shareMedicalInfo,
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
              <span className={styles.settingIcon}>📈</span>
              <div>
                <h4>اشتراک پیشرفت درمانی</h4>
                <p>به اشتراک‌گذاری پیشرفت با روانشناس</p>
              </div>
            </div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={privacySettings.shareProgress}
                onChange={() =>
                  setPrivacySettings((prev) => ({
                    ...prev,
                    shareProgress: !prev.shareProgress,
                  }))
                }
              />
              <span className={styles.switchSlider}></span>
            </label>
          </div>
        </div>
      </div> */}

      {/* ===== بخش امنیت ===== */}
      <div className={styles.settingsSection}>
        <h3>امنیت</h3>
        <p className={styles.sectionDescription}>مدیریت رمز عبور و دسترسی‌ها</p>

        {/* <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              <span className={styles.settingIcon}>🔑</span>
              <div>
                <h4>تغییر رمز عبور</h4>
                <p>رمز عبور خود را به‌روزرسانی کنید</p>
              </div>
            </div>
            <button className={styles.actionBtn}>تغییر</button>
          </div>
        </div> */}

        <div className={styles.settingCard}>
          <div className={styles.settingHeader}>
            <div className={styles.settingInfo}>
              {/* <span className={styles.settingIcon}>📱</span> */}
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
