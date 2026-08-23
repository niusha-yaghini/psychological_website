import React, { useState, useEffect, useRef } from "react";
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

import logo from "../../../public/images/logo/logo2.png";
import userAvatar from "../../../public/images/Patient_Panel/usericon.png";

function PatientDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // ===== داده‌های نوتیفیکیشن =====
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "reminder",
      icon: "⏰",
      title: "یادآوری جلسه فردا",
      message:
        "جلسه مشاوره فردی شما با دکتر محمد رضایی فردا ساعت ۱۶:۰۰ برگزار میشود.",
      time: "۵ دقیقه پیش",
      isRead: false,
      date: "۱۴۰۳/۰۹/۲۴",
      link: "/sessions",
      action: "مشاهده جلسه",
    },
    {
      id: 2,
      type: "confirmed",
      icon: "✅",
      title: "تأیید جلسه",
      message: "دکتر سارا احمدی درخواست جلسه زوج درمانی شما را تأیید کرد.",
      time: "۱ ساعت پیش",
      isRead: false,
      date: "۱۴۰۳/۰۹/۲۴",
      link: "/appointments",
      action: "مشاهده نوبت",
    },
    // ... بقیه اعلان‌ها
  ]);

  // ===== توابع =====
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
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
      badge: 3,
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
      badge: 5,
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
            <div className={styles.userProfile}>
              <img
                src={userAvatar}
                alt="پروفایل"
                className={styles.userAvatar}
              />
            </div>
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
                <p>⏰ ۱۶:۰۰ - ۱۷:۰۰</p>
                <p>👤 دکتر محمد رضایی</p>
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
function AppointmentsContent() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorId: 1,
      date: "۱۴۰۳/۰۹/۲۵",
      time: "۱۶:۰۰ - ۱۷:۰۰",
      status: "confirmed", // confirmed | pending | completed | cancelled
      isOnline: true,
      cancelledBy: null, // 'user' | 'doctor' | null
      cancelReason: null,
      createdAt: "۱۴۰۳/۰۹/۲۰",
    },
    {
      id: 2,
      type: "جلسه زوج درمانی",
      doctor: "دکتر سارا احمدی",
      doctorId: 2,
      date: "۱۴۰۳/۰۹/۲۸",
      time: "۱۸:۰۰ - ۱۹:۰۰",
      status: "pending",
      isOnline: false,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۳/۰۹/۲۱",
    },
    {
      id: 3,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorId: 1,
      date: "۱۴۰۳/۰۹/۲۰",
      time: "۱۵:۰۰ - ۱۶:۰۰",
      status: "completed",
      isOnline: true,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۳/۰۹/۱۵",
    },
    {
      id: 4,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر علی کریمی",
      doctorId: 3,
      date: "۱۴۰۳/۰۹/۱۸",
      time: "۱۰:۰۰ - ۱۱:۰۰",
      status: "cancelled",
      isOnline: true,
      cancelledBy: "user",
      cancelReason: "مشکل شخصی",
      createdAt: "۱۴۰۳/۰۹/۱۰",
    },
    {
      id: 5,
      type: "جلسه زوج درمانی",
      doctor: "دکتر سارا احمدی",
      doctorId: 2,
      date: "۱۴۰۳/۰۹/۱۵",
      time: "۱۷:۰۰ - ۱۸:۰۰",
      status: "cancelled",
      isOnline: false,
      cancelledBy: "doctor",
      cancelReason: "هماهنگی با پزشک",
      createdAt: "۱۴۰۳/۰۹/۰۵",
    },
  ]);

  // ===== تابع لغو نوبت =====
  const handleCancelAppointment = (appointmentId) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    // ===== بررسی قانون ۲۴ ساعت =====
    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const diffHours = (appointmentDate - now) / (1000 * 60 * 60);

    if (diffHours < 24) {
      alert("امکان لغو نوبت کمتر از ۲۴ ساعت قبل وجود ندارد.");
      return;
    }

    // ===== نمایش دلیل لغو =====
    const reason = prompt("لطفاً دلیل لغو نوبت را وارد کنید:");
    if (reason === null) return; // کاربر لغو کرد

    // ===== به‌روزرسانی وضعیت =====
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointmentId
          ? {
              ...item,
              status: "cancelled",
              cancelledBy: "user",
              cancelReason: reason,
            }
          : item
      )
    );

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

  // ===== فیلتر کردن =====
  const getFilteredAppointments = () => {
    if (activeFilter === "all") return appointments;
    return appointments.filter((item) => item.status === activeFilter);
  };

  const filteredAppointments = getFilteredAppointments();

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

  // ===== بررسی امکان لغو =====
  const canCancel = (appointment) => {
    if (appointment.status !== "confirmed" && appointment.status !== "pending")
      return false;

    const now = new Date();
    const appointmentDate = new Date(appointment.date);
    const diffHours = (appointmentDate - now) / (1000 * 60 * 60);
    return diffHours >= 24;
  };

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
            <span className={styles.filterCount}>
              {
                appointments.filter((item) =>
                  filter.id === "all" ? true : item.status === filter.id
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
            return (
              <div key={appointment.id} className={styles.appointmentCard}>
                {/* وضعیت */}
                <div className={styles.appointmentStatusBar}>
                  <span
                    className={`${styles.statusBadge} ${statusInfo.className}`}
                  >
                    <span className={styles.statusIcon}>{statusInfo.icon}</span>
                    {statusInfo.label}
                  </span>

                  {appointment.isOnline && (
                    <span className={styles.onlineBadge}>🖥️ آنلاین</span>
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
                        {/* <span className={styles.metaIcon}>👤</span> */}
                        {appointment.doctor}
                      </span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {/* <span className={styles.metaIcon}>📅</span> */}
                        {appointment.date}
                      </span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {/* <span className={styles.metaIcon}>⏰</span> */}
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
                    {appointment.status === "confirmed" && (
                      <>
                        <button className={styles.btnJoin}>
                          <span>▶</span>
                          ورود به جلسه
                        </button>
                        {canCancel(appointment) && (
                          <button
                            className={styles.btnCancel}
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                          >
                            لغو نوبت
                          </button>
                        )}
                      </>
                    )}

                    {appointment.status === "pending" && (
                      <>
                        <button className={styles.btnPending}>
                          در انتظار تأیید
                        </button>
                        {canCancel(appointment) && (
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

                    {appointment.status === "completed" && (
                      <button className={styles.btnReview}>ثبت بازخورد</button>
                    )}

                    {appointment.status === "cancelled" && (
                      <button
                        className={styles.btnReschedule}
                        onClick={() => {
                          // باز کردن مودال برای رزرو مجدد با همان دکتر
                          setShowModal(true);
                        }}
                      >
                        رزرو مجدد
                      </button>
                    )}

                    <button className={styles.btnMore}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle cx="12" cy="6" r="2" fill="currentColor" />
                        <circle cx="12" cy="12" r="2" fill="currentColor" />
                        <circle cx="12" cy="18" r="2" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            {/* <span className={styles.emptyIcon}>📭</span> */}
            <h3>هیچ نوبتی در این دسته وجود ندارد</h3>
            <p>برای شروع، اولین نوبت خود را رزرو کنید.</p>
            <button
              className={styles.emptyBtn}
              onClick={() => setShowModal(true)}
            >
              درخواست نوبت جدید
            </button>
          </div>
        )}
      </div>

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
      date: "۱۴۰۳/۰۹/۲۵",
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
      date: "۱۴۰۳/۰۹/۲۸",
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
      date: "۱۴۰۳/۰۹/۲۰",
      time: "۱۵:۰۰",
      duration: "۶۰ دقیقه",
      status: "completed",
      isOnline: true,
      meetingLink: "https://meet.google.com/xyz-uvwx-yza",
      type: "individual",
    },
    {
      id: 4,
      title: "جلسه مشاوره نوجوان",
      doctor: "دکتر علی کریمی",
      doctorImage: "/images/doctors/doctor3.png",
      date: "۱۴۰۳/۰۹/۱۰",
      time: "۱۰:۰۰",
      duration: "۶۰ دقیقه",
      status: "cancelled",
      isOnline: true,
      meetingLink: null,
      type: "teen",
    },
  ];

  // ===== فیلتر کردن جلسات =====
  const getFilteredSessions = () => {
    if (activeTab === "upcoming") {
      return sessions.filter(
        (s) => s.status === "upcoming" || s.status === "ongoing"
      );
    }
    return sessions.filter(
      (s) => s.status === "completed" || s.status === "cancelled"
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
      cancelled: {
        label: "لغو شده",
        className: styles.sessionCancelled,
      },
    };
    return statusMap[status] || statusMap.upcoming;
  };

  // ===== تایمر شمارش معکوس (برای جلسات آینده) =====
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const intervals = {};
    sessions.forEach((session) => {
      if (session.status === "upcoming") {
        const targetDate = new Date(session.date + " " + session.time);
        intervals[session.id] = setInterval(() => {
          const now = new Date();
          const diff = targetDate - now;
          if (diff <= 0) {
            clearInterval(intervals[session.id]);
          } else {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeLeft((prev) => ({
              ...prev,
              [session.id]: { hours, minutes },
            }));
          }
        }, 1000);
      }
    });
    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval));
    };
  }, []);

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
            <span className={styles.statNumber}>۳</span>
            <span className={styles.statLabel}>جلسه پیش‌رو</span>
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>۱۲</span>
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
        </button>
        <button
          className={`${styles.filterTab} ${
            activeTab === "past" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("past")}
        >
          📋 تاریخچه جلسات
        </button>
      </div>

      {/* لیست جلسات */}
      <div className={styles.sessionsList}>
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => {
            const statusInfo = getStatusInfo(session.status);
            const isUpcoming =
              session.status === "upcoming" || session.status === "ongoing";
            const timeLeftData = timeLeft[session.id];

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
                    </div>
                  </div>
                  <span
                    className={`${styles.sessionStatus} ${statusInfo.className}`}
                  >
                    <span className={styles.statusDot}></span>
                    {statusInfo.label}
                  </span>
                </div>

                {/* جزئیات جلسه */}
                <div className={styles.sessionDetails}>
                  <div className={styles.sessionMeta}>
                    <div className={styles.metaGroup}>
                      {/* <span className={styles.metaIcon}>📅</span> */}
                      <span>{session.date}</span>
                    </div>
                    <div className={styles.metaGroup}>
                      {/* <span className={styles.metaIcon}>⏰</span> */}
                      <span>
                        {session.time} - {session.duration}
                      </span>
                    </div>
                    <div className={styles.metaGroup}>
                      {/* <span className={styles.metaIcon}>🔗</span> */}
                      <span>جلسه آنلاین</span>
                    </div>
                  </div>

                  {/* تایمر شمارش معکوس */}
                  {isUpcoming && timeLeftData && (
                    <div className={styles.sessionTimer}>
                      <span className={styles.timerLabel}>زمان تا شروع:</span>
                      <div className={styles.timerDigits}>
                        <span className={styles.timerDigit}>
                          {String(timeLeftData.hours).padStart(2, "0")}
                          <span className={styles.timerUnit}>ساعت</span>
                        </span>
                        <span className={styles.timerSeparator}>:</span>
                        <span className={styles.timerDigit}>
                          {String(timeLeftData.minutes).padStart(2, "0")}
                          <span className={styles.timerUnit}>دقیقه</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* دکمه‌های اکشن */}
                <div className={styles.sessionActions}>
                  {session.status === "upcoming" && (
                    <>
                      <button className={styles.btnJoinSession}>
                        <span>▶</span>
                        ورود به جلسه
                      </button>
                      <button className={styles.btnRemind}>🔔 یادآوری</button>
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
                      <button className={styles.btnFeedback}>
                        ثبت بازخورد
                      </button>
                    </>
                  )}
                  {session.status === "cancelled" && (
                    <button className={styles.btnRescheduleSession}>
                      رزرو مجدد
                    </button>
                  )}
                  <button className={styles.btnMore}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="6" r="2" fill="currentColor" />
                      <circle cx="12" cy="12" r="2" fill="currentColor" />
                      <circle cx="12" cy="18" r="2" fill="currentColor" />
                    </svg>
                  </button>
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

      {/* جلسه بعدی - کارت ویژه */}
      {activeTab === "upcoming" &&
        sessions.some((s) => s.status === "upcoming") && (
          <div className={styles.nextSessionBanner}>
            <div className={styles.nextSessionContent}>
              <span className={styles.nextSessionLabel}>جلسه بعدی شما</span>
              <h3>{sessions.find((s) => s.status === "upcoming")?.title}</h3>
              <p>با {sessions.find((s) => s.status === "upcoming")?.doctor}</p>
              <div className={styles.nextSessionTime}>
                <span>
                  {sessions.find((s) => s.status === "upcoming")?.date}
                </span>
                <span>
                  {sessions.find((s) => s.status === "upcoming")?.time}
                </span>
              </div>
            </div>
            <button className={styles.btnNextSession}>
              ورود به جلسه
              <span>→</span>
            </button>
          </div>
        )}
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
      icon: "⏰",
      title: "یادآوری جلسه فردا",
      message:
        "جلسه مشاوره فردی شما با دکتر محمد رضایی فردا ساعت ۱۶:۰۰ برگزار میشود.",
      time: "۵ دقیقه پیش",
      isRead: false,
      date: "۱۴۰۳/۰۹/۲۴",
      link: "/sessions",
      action: "مشاهده جلسه",
    },
    {
      id: 2,
      type: "confirmed",
      icon: "✅",
      title: "تأیید جلسه",
      message: "دکتر سارا احمدی درخواست جلسه زوج درمانی شما را تأیید کرد.",
      time: "۱ ساعت پیش",
      isRead: false,
      date: "۱۴۰۳/۰۹/۲۴",
      link: "/appointments",
      action: "مشاهده نوبت",
    },
    {
      id: 3,
      type: "cancelled",
      icon: "❌",
      title: "لغو جلسه توسط روانشناس",
      message: "دکتر علی کریمی جلسه مشاوره نوجوان را به دلیل هماهنگی لغو کرد.",
      time: "۳ ساعت پیش",
      isRead: false,
      date: "۱۴۰۳/۰۹/۲۴",
      link: "/appointments",
      action: "مشاهده جلسات",
    },
    {
      id: 4,
      type: "note",
      icon: "📝",
      title: "یادداشت جدید از روانشناس",
      message: "دکتر محمد رضایی برای جلسه قبلی شما یادداشتی ثبت کرده است.",
      time: "۵ ساعت پیش",
      isRead: true,
      date: "۱۴۰۳/۰۹/۲۳",
      link: "/sessions",
      action: "مشاهده یادداشت",
    },
    {
      id: 5,
      type: "booking",
      icon: "📅",
      title: "رزرو جلسه جدید",
      message:
        "شما جلسه مشاوره فردی را برای تاریخ ۱۴۰۳/۰۹/۲۸ ساعت ۱۷:۰۰ رزرو کردید.",
      time: "۱ روز پیش",
      isRead: true,
      date: "۱۴۰۳/۰۹/۲۳",
      link: "/appointments",
      action: "مشاهده نوبت",
    },
    {
      id: 6,
      type: "weekly",
      icon: "🔄",
      title: "زمان جلسات هفتگی",
      message:
        "زمان جلسات هفتگی شما فرا رسیده است. آیا مایل به رزرو جلسه جدید هستید؟",
      time: "۲ روز پیش",
      isRead: true,
      date: "۱۴۰۳/۰۹/۲۲",
      link: "/appointments",
      action: "رزرو جلسه",
    },
    {
      id: 7,
      type: "reminder",
      icon: "⏰",
      title: "یادآوری جلسه امروز",
      message:
        "جلسه مشاوره فردی شما با دکتر سارا احمدی امروز ساعت ۱۸:۰۰ برگزار میشود.",
      time: "۳ روز پیش",
      isRead: true,
      date: "۱۴۰۳/۰۹/۲۲",
      link: "/sessions",
      action: "ورود به جلسه",
    },
  ]);

  // ===== علامت‌گذاری به عنوان خوانده شده =====
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  // ===== علامت‌گذاری همه به عنوان خوانده شده =====
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
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
          <h2>🔔 اعلانات</h2>
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
          <span className={styles.filterCount}>{notifications.length}</span>
        </button>
        <button
          className={`${styles.filterTab} ${
            filter === "unread" ? styles.active : ""
          }`}
          onClick={() => setFilter("unread")}
        >
          خوانده نشده
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
                <div
                  className={styles.notificationIcon}
                  style={{ background: typeStyle.bg }}
                >
                  <span>{typeStyle.icon}</span>
                </div>

                {/* محتوای اصلی */}
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h4 className={styles.notificationTitle}>
                      {notification.title}
                      {!notification.isRead && (
                        <span className={styles.unreadDot}></span>
                      )}
                    </h4>
                    <span className={styles.notificationTime}>
                      {notification.time}
                    </span>
                  </div>
                  <p className={styles.notificationMessage}>
                    {notification.message}
                  </p>
                  <div className={styles.notificationFooter}>
                    <button
                      className={styles.notificationAction}
                      onClick={(e) => {
                        e.stopPropagation();
                        // هدایت به صفحه مربوطه
                        // navigate(notification.link);
                      }}
                    >
                      {notification.action}
                      <span>→</span>
                    </button>
                    <button
                      className={styles.notificationDelete}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                    >
                      ✕
                    </button>
                  </div>
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
            <span className={styles.emptyIcon}>🔔</span>
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
  const getIcon = (type) => {
    const icons = {
      reminder: "⏰",
      confirmed: "✅",
      cancelled: "❌",
      note: "📝",
      booking: "📅",
      weekly: "🔄",
    };
    return icons[type] || "🔔";
  };

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
            <span className={styles.dropdownTitle}>🔔 اعلان‌ها</span>
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
                  <div
                    className={styles.dropdownIcon}
                    style={{ background: getTypeStyle(notification.type) }}
                  >
                    <span>{getIcon(notification.type)}</span>
                  </div>
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
                <span className={styles.dropdownEmptyIcon}>🎉</span>
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
    (progressData.completedSessions / progressData.totalSessions) * 100
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
          <h2>📈 پیشرفت من</h2>
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
        <button className={styles.btnReport}>📄 دریافت گزارش کامل</button>
        <button className={styles.btnShare}>📤 اشتراک‌گذاری پیشرفت</button>
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
          : ex
      )
    );
  };

  // ===== تابع ثبت پیشرفت =====
  const updateProgress = (id, value) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? { ...ex, progress: Math.min(100, Math.max(0, value)) }
          : ex
      )
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
          <h2>🧠 تمارین من</h2>
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
            <span className={styles.filterCount}>{exercises.length}</span>
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "daily" ? styles.active : ""
            }`}
            onClick={() => setFilter("daily")}
          >
            🌙 روزانه
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
                        selectedExercise === exercise.id ? null : exercise.id
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
    alert("✅ اطلاعات با موفقیت ذخیره شد.");
  };

  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>👤 پروفایل</h2>
          <p>اطلاعات شخصی و تنظیمات حساب کاربری</p>
        </div>
        <button
          className={styles.editProfileBtn}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "✕ لغو" : "✏️ ویرایش پروفایل"}
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
                  <span>📷</span>
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
              <span>📱 {formData.phone}</span>
              <span className={styles.metaDivider}>•</span>
              <span>📧 {formData.email}</span>
              <span className={styles.metaDivider}>•</span>
              <span>📅 عضویت: {userStats.joinDate}</span>
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
            📋 اطلاعات شخصی
          </button>
          <button
            className={`${styles.profileTab} ${
              activeTab === "medical" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("medical")}
          >
            🏥 اطلاعات درمانی
          </button>
          <button
            className={`${styles.profileTab} ${
              activeTab === "settings" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("settings")}
          >
            ⚙️ تنظیمات
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
                <h4>🆘 تماس اضطراری</h4>
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
                    💾 ذخیره تغییرات
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
                  📄 درخواست گزارش درمانی
                </button>
                <button className={styles.btnMedicalSecondary}>
                  📤 اشتراک‌گذاری با پزشک
                </button>
              </div>
            </div>
          )}

          {/* ===== تب تنظیمات ===== */}
          {activeTab === "settings" && (
            <div className={styles.settingsTab}>
              <div className={styles.settingsGroup}>
                <h4>🔔 اعلان‌ها</h4>
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
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
