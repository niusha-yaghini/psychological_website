// components/DoctorDashboard/DoctorDashboard.jsx
import React, { useState, useEffect } from "react";
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

// ===== کامپوننت‌های بخش‌ها =====
function DashboardOverview() {
  const [pendingSessions, setPendingSessions] = useState([
    {
      id: 1,
      patient: "محمد کریمی",
      date: "امروز",
      time: "۱۰:۰۰",
      status: "pending",
      type: "individual",
    },
    {
      id: 2,
      patient: "زهرا احمدی",
      date: "امروز",
      time: "۱۱:۳۰",
      status: "pending",
      type: "couple",
    },
    {
      id: 3,
      patient: "علی رضایی",
      date: "امروز",
      time: "۱۴:۰۰",
      status: "pending",
      type: "individual",
    },
    {
      id: 4,
      patient: "سارا محمدی",
      date: "امروز",
      time: "۱۶:۰۰",
      status: "pending",
      type: "teen",
    },
    {
      id: 5,
      patient: "رضا حسینی",
      date: "فردا",
      time: "۱۰:۳۰",
      status: "pending",
      type: "individual",
    },
    {
      id: 6,
      patient: "نگار موسوی",
      date: "پس‌فردا",
      time: "۱۲:۰۰",
      status: "pending",
      type: "couple",
    },
  ]);

  const [confirmedSessions, setConfirmedSessions] = useState([
    {
      id: 7,
      patient: "زهرا احمدی",
      date: "امروز",
      time: "۱۱:۳۰",
      status: "confirmed",
      type: "couple",
    },
  ]);

  // ===== استیت‌های مودال =====
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ===== تابع تأیید جلسه =====
  const handleConfirmSession = (session) => {
    setSelectedSession(session);
    setShowConfirmModal(true);
  };

  // ===== تأیید نهایی =====
  const confirmAppointment = () => {
    if (!selectedSession) return;

    setPendingSessions((prev) =>
      prev.filter((s) => s.id !== selectedSession.id),
    );

    setConfirmedSessions((prev) => [
      ...prev,
      {
        ...selectedSession,
        status: "confirmed",
      },
    ]);

    setShowConfirmModal(false);
    setSelectedSession(null);
    alert(`جلسه ${selectedSession.patient} با موفقیت تأیید شد.`);
  };

  // ===== تابع رد جلسه =====
  const handleRejectSession = (session) => {
    setSelectedSession(session);
    setRejectReason("");
    setShowRejectModal(true);
  };

  // ===== رد نهایی =====
  const rejectAppointment = () => {
    if (!selectedSession) return;

    // حذف از لیست در انتظار
    setPendingSessions((prev) =>
      prev.filter((s) => s.id !== selectedSession.id),
    );

    // ذخیره دلیل رد (برای لاگ یا اطلاع‌رسانی)
    console.log(
      `جلسه ${selectedSession.patient} رد شد. دلیل: ${rejectReason || "بدون دلیل"}`,
    );

    setShowRejectModal(false);
    setSelectedSession(null);
    setRejectReason("");
    alert(`جلسه ${selectedSession.patient} با موفقیت رد شد.`);
  };

  const stats = [
    { label: "بیماران فعال", value: 12, color: "#4CAF84" },
    { label: "جلسات امروز", value: 4, color: "#2196F3" },
    {
      label: "نوبت‌های در انتظار",
      value: pendingSessions.length,
      color: "#FF9800",
    },
    { label: "تمارین ارسال شده", value: 18, color: "#9C27B0" },
  ];

  const todaySessions = confirmedSessions.filter(
    (session) => session.date === "امروز",
  );

  return (
    <div className={styles.dashboardContent}>
      {/* ===== ستون راست ===== */}
      <div className={styles.mainColumn}>
        {/* خوش‌آمدگویی */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeText}>
            <h2>سلام دکتر </h2>
            <p>امروز {todaySessions.length} جلسه برنامه‌ریزی شده دارید.</p>
          </div>
          {/* <div className={styles.welcomeImage}>🩺</div> */}
        </div>

        {/* آمار */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: stat.color }}
              >
                {/* {stat.icon} */}
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* جلسات امروز (تأیید شده) */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>جلسات امروز</h3>
            <span className={styles.sectionCount}>{todaySessions.length}</span>
          </div>

          <div className={styles.todaySessions}>
            {todaySessions.length > 0 ? (
              todaySessions.map((session) => (
                <div key={session.id} className={styles.sessionRow}>
                  <span className={styles.sessionTime}>{session.time}</span>
                  <span className={styles.sessionPatient}>
                    {session.patient}
                  </span>
                  <span
                    className={`${styles.sessionStatus} ${styles[session.status]}`}
                  >
                    {session.status === "confirmed" && "تأیید شده"}
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

      {/* ===== ستون چپ: جلسات در انتظار تأیید ===== */}
      <div className={styles.pendingColumn}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>در انتظار تأیید</h3>
              <p className={styles.sectionDescription}>درخواست‌های جدید نوبت</p>
            </div>
            <span className={styles.sectionCount}>
              {pendingSessions.length}
            </span>
          </div>

          <div className={styles.pendingSessions}>
            {pendingSessions.length === 0 ? (
              <div className={styles.emptyState}>
                {/* <span className={styles.emptyIcon}>✅</span> */}
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
                      {session.type === "individual" && "فردی"}
                      {session.type === "couple" && "زوج"}
                      {session.type === "teen" && "نوجوان"}
                    </span>
                  </div>

                  <div className={styles.pendingSessionBottom}>
                    <div className={styles.sessionDateTime}>
                      <span>{session.date}</span>
                      <span className={styles.dateDivider}>•</span>
                      <span>{session.time}</span>
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
                  <span>{selectedSession.date}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>{selectedSession.time}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>نوع جلسه:</span>
                  <span>
                    {selectedSession.type === "individual" && "فردی"}
                    {selectedSession.type === "couple" && "زوج"}
                    {selectedSession.type === "teen" && "نوجوان"}
                  </span>
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
                  <span>{selectedSession.date}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>{selectedSession.time}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>نوع جلسه:</span>
                  <span>
                    {selectedSession.type === "individual" && "فردی"}
                    {selectedSession.type === "couple" && "زوج"}
                    {selectedSession.type === "teen" && "نوجوان"}
                  </span>
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

function DoctorDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

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

  // ===== منوهای سایدبار =====
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
      badge: 3,
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
      // badge: 12,
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
      // label: "پیام‌ها",
      
      label: "اعلان‌ها",
      icon: <FaCommentDots />,
      badge: 5,
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

  // ===== رندر محتوا =====
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "appointments":
        return <AppointmentsManagement />;
      case "sessions":
        return <SessionsManagement />;
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
        return <DashboardOverview />;
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
function AppointmentsManagement() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patient: "محمد کریمی",
      date: "۱۴۰۵/۰۶/۰۵",
      time: "۱۰:۰۰",
      status: "pending",
      type: "فردی",
    },
    {
      id: 2,
      patient: "زهرا احمدی",
      date: "۱۴۰۵/۰۶/۰۵",
      time: "۱۱:۳۰",
      status: "confirmed",
      type: "زوج",
    },
    {
      id: 3,
      patient: "علی رضایی",
      date: "۱۴۰۵/۰۶/۰۴",
      time: "۱۴:۰۰",
      status: "completed",
      type: "فردی",
    },
  ]);

  // ===== استیت‌های فرم افزودن نوبت =====
  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    date: "",
    time: "",
    type: "فردی",
    status: "pending",
  });

  // ===== تابع تأیید نوبت =====
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

  // ===== تابع رد نوبت =====
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
          ? { ...item, status: "cancelled" }
          : item,
      ),
    );

    setShowRejectModal(false);
    setSelectedAppointment(null);
    setRejectReason("");
    alert(`نوبت ${selectedAppointment.patient} با موفقیت رد شد.`);
  };

  // ===== تابع ثبت انجام =====
  const handleComplete = (app) => {
    if (window.confirm(`آیا جلسه ${app.patient} انجام شده است؟`)) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === app.id ? { ...item, status: "completed" } : item,
        ),
      );
      alert(`جلسه ${app.patient} به عنوان انجام شده ثبت شد.`);
    }
  };

  // ===== تابع افزودن نوبت جدید =====
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
        date: newAppointment.date,
        time: newAppointment.time,
        type: newAppointment.type,
        status: newAppointment.status,
      },
    ]);

    // ریست فرم
    setNewAppointment({
      patient: "",
      date: "",
      time: "",
      type: "فردی",
      status: "pending",
    });

    setShowAddModal(false);
    alert("نوبت جدید با موفقیت اضافه شد.");
  };

  // ===== فیلتر کردن =====
  const getFilteredAppointments = () => {
    if (activeFilter === "all") return appointments;
    return appointments.filter((item) => item.status === activeFilter);
  };

  const filteredAppointments = getFilteredAppointments();

  // ===== وضعیت‌ها =====
  const getStatusInfo = (status) => {
    const map = {
      pending: { label: "در انتظار", className: styles.statusPending },
      confirmed: { label: "تأیید شده", className: styles.statusConfirmed },
      completed: { label: "انجام شده", className: styles.statusCompleted },
      cancelled: { label: "لغو شده", className: styles.statusCancelled },
    };
    return map[status] || map.pending;
  };

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
        {["all", "pending", "confirmed", "completed", "cancelled"].map(
          (filter) => (
            <button
              key={filter}
              className={`${styles.filterTab} ${activeFilter === filter ? styles.active : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === "all" && "همه"}
              {filter === "pending" && "در انتظار"}
              {filter === "confirmed" && "تأیید شده"}
              {filter === "completed" && "انجام شده"}
              {filter === "cancelled" && "لغو شده"}
              <span className={styles.filterCount}>
                {
                  appointments.filter((item) =>
                    filter === "all" ? true : item.status === filter,
                  ).length
                }
              </span>
            </button>
          ),
        )}
      </div>

      {/* ===== لیست نوبت‌ها ===== */}
      <div className={styles.appointmentsList}>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => {
            const status = getStatusInfo(app.status);
            return (
              <div key={app.id} className={styles.appointmentCard}>
                <div className={styles.appointmentInfo}>
                  <h4>{app.patient}</h4>
                  <p>
                    {app.type} • {app.date} • {app.time}
                  </p>
                </div>

                {/* ===== نمایش وضعیت ===== */}
                {app.status === "completed" ? (
                  <span className={styles.completedLabel}>انجام شده</span>
                ) : app.status === "cancelled" ? (
                  <span className={styles.cancelledLabel}>لغو شده</span>
                ) : (
                  <span className={`${styles.statusBadge} ${status.className}`}>
                    {status.label}
                  </span>
                )}

                <div className={styles.appointmentActions}>
                  {app.status === "pending" && (
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

                  {app.status === "confirmed" && (
                    <button
                      className={styles.btnComplete}
                      onClick={() => handleComplete(app)}
                    >
                      ثبت انجام
                    </button>
                  )}
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
                  <span>{selectedAppointment.date}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>{selectedAppointment.time}</span>
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
                  <span>{selectedAppointment.date}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>{selectedAppointment.time}</span>
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
                    type: "فردی",
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
                    value={newAppointment.type}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                  >
                    <option value="فردی">فردی</option>
                    <option value="زوج">زوج</option>
                    <option value="نوجوان">نوجوان</option>
                    <option value="خانواده">خانواده</option>
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
                    <option value="completed">انجام شده</option>
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
                    type: "فردی",
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
// COMPONENT: Sessions Management
// ============================================
// function SessionsManagement() {
//   return (
//     <div className={styles.pageContent}>
//       <div className={styles.pageHeader}>
//         <div className={styles.headerInfo}>
//           <h2>جلسات آنلاین</h2>
//           <p>مدیریت جلسات مجازی</p>
//         </div>
//       </div>
//       <div className={styles.emptyState}>
//         <span className={styles.emptyIcon}>🎥</span>
//         <h3>هیچ جلسه آنلاینی در حال برگزاری نیست</h3>
//         <p>جلسات امروز شما در بخش نوبت‌ها قابل مشاهده است.</p>
//       </div>
//     </div>
//   );
// }

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
//       date: "۱۴۰۵/۰۶/۰۵",
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
//       date: "۱۴۰۵/۰۶/۰۵",
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
//       date: "۱۴۰۵/۰۶/۰۴",
//       time: "۱۴:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "completed",
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
//       date: "۱۴۰۵/۰۶/۰۶",
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
//       date: "۱۴۰۵/۰۶/۰۳",
//       time: "۱۵:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "ongoing",
//       isOnline: true,
//       meetingLink: "https://meet.google.com/nop-qrst-uvw",
//       type: "individual",
//       notes: "در حال برگزاری",
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

//   // ===== فیلتر کردن جلسات =====
//   const getFilteredSessions = () => {
//     if (activeTab === "upcoming") {
//       return sessions.filter(
//         (s) => s.status === "upcoming" || s.status === "ongoing",
//       );
//     }
//     return sessions.filter(
//       (s) => s.status === "completed" || s.status === "cancelled",
//     );
//   };

//   const filteredSessions = getFilteredSessions();

//   // ===== وضعیت‌ها =====
//   const getStatusInfo = (status) => {
//     const statusMap = {
//       upcoming: {
//         label: "در انتظار",
//         className: styles.sessionUpcoming,
//       },
//       ongoing: {
//         label: "در حال برگزاری",
//         className: styles.sessionOngoing,
//       },
//       completed: {
//         label: "انجام شده",
//         className: styles.sessionCompleted,
//       },
//       cancelled: {
//         label: "لغو شده",
//         className: styles.sessionCancelled,
//       },
//     };
//     return statusMap[status] || statusMap.upcoming;
//   };

//   // ===== پیدا کردن جلسه بعدی =====
//   const getNextSession = () => {
//     const upcomingSessions = sessions.filter(
//       (s) => s.status === "upcoming" || s.status === "ongoing",
//     );

//     if (upcomingSessions.length === 0) return null;

//     return upcomingSessions.sort((a, b) => {
//       const dateA = new Date(
//         a.date.split("/").reverse().join("/") + " " + a.time,
//       );
//       const dateB = new Date(
//         b.date.split("/").reverse().join("/") + " " + b.time,
//       );
//       return dateA - dateB;
//     })[0];
//   };

//   const nextSession = getNextSession();

//   // ===== تایمر شمارش معکوس (فقط برای جلسه بعدی) =====
//   const [timeLeft, setTimeLeft] = useState(null);

//   useEffect(() => {
//     if (!nextSession) return;

//     const [year, month, day] = nextSession.date.split("/");
//     const [hours, minutes] = nextSession.time.split(":");
//     const targetDate = new Date(
//       `${year}-${month}-${day}T${hours}:${minutes}:00`,
//     );

//     const interval = setInterval(() => {
//       const now = new Date();
//       const diff = targetDate - now;

//       if (diff <= 0) {
//         clearInterval(interval);
//         setTimeLeft(null);
//       } else {
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//         const hours = Math.floor(
//           (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
//         );
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         setTimeLeft({ days, hours, minutes });
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [nextSession]);

//   // ===== تابع شروع جلسه =====
//   const handleStartSession = (session) => {
//     if (window.confirm(`آیا مایل به شروع جلسه ${session.patient} هستید؟`)) {
//       // هدایت به لینک جلسه
//       if (session.meetingLink) {
//         window.open(session.meetingLink, "_blank");
//       } else {
//         alert("لینک جلسه موجود نیست.");
//       }
//     }
//   };

//   // ===== تابع پایان جلسه =====
//   const handleEndSession = (sessionId) => {
//     if (window.confirm("آیا جلسه به پایان رسیده است؟")) {
//       // به‌روزرسانی وضعیت
//       alert("✅ جلسه با موفقیت به پایان رسید.");
//     }
//   };

//   // ===== دریافت آیکون نوع جلسه =====
//   const getTypeIcon = (type) => {
//     const typeMap = {
//       individual: "🧑‍⚕️",
//       couple: "💑",
//       teen: "🧒",
//       family: "👨‍👩‍👧‍👦",
//     };
//     return typeMap[type] || "🧑‍⚕️";
//   };

//   // ===== دریافت نام نوع جلسه =====
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
//                 sessions.filter(
//                   (s) => s.status === "upcoming" || s.status === "ongoing",
//                 ).length
//               }
//             </span>
//             <span className={styles.statLabel}>جلسه پیش‌رو</span>
//           </span>
//           <span className={styles.statDivider}>|</span>
//           <span className={styles.statItem}>
//             <span className={styles.statNumber}>
//               {sessions.filter((s) => s.status === "completed").length}
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
//               sessions.filter(
//                 (s) => s.status === "upcoming" || s.status === "ongoing",
//               ).length
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
//               sessions.filter(
//                 (s) => s.status === "completed" || s.status === "cancelled",
//               ).length
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
//               <span className={styles.nextSessionLabel}>⏰ جلسه بعدی شما</span>
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
//                 🚀 شروع جلسه
//                 <span>→</span>
//               </button>

//               {timeLeft && (
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
//             </div>
//           </div>
//         )}

//         {/* ===== لیست بقیه جلسات ===== */}
//         {filteredSessions.length > 0 ? (
//           filteredSessions.map((session) => {
//             // اگر این جلسه جلسه بعدی هست، از رندر کردنش صرف‌نظر کن
//             if (nextSession && session.id === nextSession.id) return null;

//             const statusInfo = getStatusInfo(session.status);
//             const isUpcoming =
//               session.status === "upcoming" || session.status === "ongoing";

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
//                   {session.status === "upcoming" && (
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

//                   {session.status === "ongoing" && (
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

//                   {session.status === "completed" && (
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
//       date: "۱۴۰۵/۰۶/۰۵",
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
//       date: "۱۴۰۵/۰۶/۰۵",
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
//       date: "۱۴۰۵/۰۶/۰۴",
//       time: "۱۴:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "completed",
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
//       date: "۱۴۰۵/۰۶/۰۶",
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
//       date: "۱۴۰۵/۰۶/۰۳",
//       time: "۱۵:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "ongoing",
//       isOnline: true,
//       meetingLink: "https://meet.google.com/nop-qrst-uvw",
//       type: "individual",
//       notes: "در حال برگزاری",
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

//   // ===== فیلتر کردن جلسات =====
//   const getFilteredSessions = () => {
//     if (activeTab === "upcoming") {
//       return sessions.filter(
//         (s) => s.status === "upcoming" || s.status === "ongoing",
//       );
//     }
//     return sessions.filter(
//       (s) => s.status === "completed" || s.status === "cancelled",
//     );
//   };

//   const filteredSessions = getFilteredSessions();

//   // ===== وضعیت‌ها =====
//   const getStatusInfo = (status) => {
//     const statusMap = {
//       upcoming: {
//         label: "در انتظار",
//         className: styles.sessionUpcoming,
//       },
//       ongoing: {
//         label: "در حال برگزاری",
//         className: styles.sessionOngoing,
//       },
//       completed: {
//         label: "انجام شده",
//         className: styles.sessionCompleted,
//       },
//       cancelled: {
//         label: "لغو شده",
//         className: styles.sessionCancelled,
//       },
//     };
//     return statusMap[status] || statusMap.upcoming;
//   };

//   // ===== پیدا کردن جلسه بعدی =====
//   const getNextSession = () => {
//     const upcomingSessions = sessions.filter(
//       (s) => s.status === "upcoming" || s.status === "ongoing",
//     );

//     if (upcomingSessions.length === 0) return null;

//     return upcomingSessions.sort((a, b) => {
//       const dateA = new Date(
//         a.date.split("/").reverse().join("/") + " " + a.time,
//       );
//       const dateB = new Date(
//         b.date.split("/").reverse().join("/") + " " + b.time,
//       );
//       return dateA - dateB;
//     })[0];
//   };

//   const nextSession = getNextSession();

//   // ===== تایمر شمارش معکوس (فقط برای جلسه بعدی) =====
//   const [timeLeft, setTimeLeft] = useState(null);

//   useEffect(() => {
//     if (!nextSession) return;

//     const [year, month, day] = nextSession.date.split("/");
//     const [hours, minutes] = nextSession.time.split(":");
//     const targetDate = new Date(
//       `${year}-${month}-${day}T${hours}:${minutes}:00`,
//     );

//     const interval = setInterval(() => {
//       const now = new Date();
//       const diff = targetDate - now;

//       if (diff <= 0) {
//         clearInterval(interval);
//         setTimeLeft(null);
//         // می‌تونی وضعیت جلسه رو به "ongoing" تغییر بدی
//       } else {
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//         const hours = Math.floor(
//           (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
//         );
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         setTimeLeft({ days, hours, minutes });
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [nextSession]);

//   // ===== تابع شروع جلسه =====
//   const handleStartSession = (session) => {
//     if (window.confirm(`آیا مایل به شروع جلسه ${session.patient} هستید؟`)) {
//       if (session.meetingLink) {
//         window.open(session.meetingLink, "_blank");
//       } else {
//         alert("لینک جلسه موجود نیست.");
//       }
//     }
//   };

//   // ===== تابع پایان جلسه =====
//   const handleEndSession = (sessionId) => {
//     if (window.confirm("آیا جلسه به پایان رسیده است؟")) {
//       alert("✅ جلسه با موفقیت به پایان رسید.");
//     }
//   };

//   // ===== دریافت آیکون نوع جلسه =====
//   const getTypeIcon = (type) => {
//     const typeMap = {
//       individual: "🧑‍⚕️",
//       couple: "💑",
//       teen: "🧒",
//       family: "👨‍👩‍👧‍👦",
//     };
//     return typeMap[type] || "🧑‍⚕️";
//   };

//   // ===== دریافت نام نوع جلسه =====
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
//                 sessions.filter(
//                   (s) => s.status === "upcoming" || s.status === "ongoing",
//                 ).length
//               }
//             </span>
//             <span className={styles.statLabel}>جلسه پیش‌رو</span>
//           </span>
//           <span className={styles.statDivider}>|</span>
//           <span className={styles.statItem}>
//             <span className={styles.statNumber}>
//               {sessions.filter((s) => s.status === "completed").length}
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
//               sessions.filter(
//                 (s) => s.status === "upcoming" || s.status === "ongoing",
//               ).length
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
//               sessions.filter(
//                 (s) => s.status === "completed" || s.status === "cancelled",
//               ).length
//             }
//           </span>
//         </button>
//       </div>

//       {/* لیست جلسات */}
//       <div className={styles.sessionsList}>
//         {/* ===== کارت ویژه جلسه بعدی با تایمر ===== */}
//         {activeTab === "upcoming" && nextSession && (
//           <div className={styles.nextSessionBanner}>
//             <div className={styles.nextSessionContent}>
//               <span className={styles.nextSessionLabel}>⏰ جلسه بعدی شما</span>
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
//                 🚀 شروع جلسه
//                 <span>→</span>
//               </button>

//               {/* ===== تایمر فقط اینجا ===== */}
//               {timeLeft && (
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
//             </div>
//           </div>
//         )}

//         {/* ===== لیست بقیه جلسات (بدون تایمر) ===== */}
//         {filteredSessions.length > 0 ? (
//           filteredSessions.map((session) => {
//             // اگر این جلسه جلسه بعدی هست، از رندر کردنش صرف‌نظر کن
//             if (nextSession && session.id === nextSession.id) return null;

//             const statusInfo = getStatusInfo(session.status);

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

//                 {/* جزئیات جلسه (بدون تایمر) */}
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
//                   {session.status === "upcoming" && (
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

//                   {session.status === "ongoing" && (
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

//                   {session.status === "completed" && (
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
//       date: "۱۴۰۵/۰۶/۰۵",
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
//       date: "۱۴۰۵/۰۶/۰۶",
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
//       date: "۱۴۰۵/۰۶/۰۴",
//       time: "۱۴:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "completed",
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
//       date: "۱۴۰۵/۰۶/۰۷",
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
//       date: "۱۴۰۵/۰۶/۰۳",
//       time: "۱۵:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "ongoing",
//       isOnline: true,
//       meetingLink: "https://meet.google.com/nop-qrst-uvw",
//       type: "individual",
//       notes: "در حال برگزاری",
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
//   const convertPersianToDate = (persianDate, time) => {
//     const [year, month, day] = persianDate.split("/");
//     const [hours, minutes] = time.split(":");
//     // سال شمسی به میلادی (تقریباً - ۶۲۱ سال)
//     const gregorianYear = parseInt(year) - 621;
//     const gregorianMonth = parseInt(month) - 1;
//     const gregorianDay = parseInt(day);
//     return new Date(
//       gregorianYear,
//       gregorianMonth,
//       gregorianDay,
//       parseInt(hours),
//       parseInt(minutes),
//     );
//   };

//   // ===== مرتب‌سازی جلسات بر اساس تاریخ و زمان (نزدیک‌ترین اول) =====
//   const sortedSessions = [...sessions].sort((a, b) => {
//     const dateA = convertPersianToDate(a.date, a.time);
//     const dateB = convertPersianToDate(b.date, b.time);
//     return dateA - dateB; // نزدیک‌ترین اول
//   });

//   // ===== فیلتر کردن جلسات =====
//   const getFilteredSessions = () => {
//     if (activeTab === "upcoming") {
//       return sortedSessions.filter(
//         (s) => s.status === "upcoming" || s.status === "ongoing",
//       );
//     }
//     return sortedSessions.filter(
//       (s) => s.status === "completed" || s.status === "cancelled",
//     );
//   };

//   const filteredSessions = getFilteredSessions();

//   // ===== وضعیت‌ها =====
//   const getStatusInfo = (status) => {
//     const statusMap = {
//       upcoming: {
//         label: "در انتظار",
//         className: styles.sessionUpcoming,
//       },
//       ongoing: {
//         label: "در حال برگزاری",
//         className: styles.sessionOngoing,
//       },
//       completed: {
//         label: "انجام شده",
//         className: styles.sessionCompleted,
//       },
//       cancelled: {
//         label: "لغو شده",
//         className: styles.sessionCancelled,
//       },
//     };
//     return statusMap[status] || statusMap.upcoming;
//   };

//   // ===== پیدا کردن جلسه بعدی (نزدیک‌ترین جلسه آینده) =====
//   const getNextSession = () => {
//     const upcomingSessions = sortedSessions.filter(
//       (s) => s.status === "upcoming" || s.status === "ongoing",
//     );

//     if (upcomingSessions.length === 0) return null;

//     // مرتب‌سازی بر اساس تاریخ (نزدیک‌ترین اول)
//     const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
//       const dateA = convertPersianToDate(a.date, a.time);
//       const dateB = convertPersianToDate(b.date, b.time);
//       return dateA - dateB;
//     });

//     return sortedUpcoming[0];
//   };

//   const nextSession = getNextSession();

//   // ===== تایمر شمارش معکوس (فقط برای جلسه بعدی) =====
//   const [timeLeft, setTimeLeft] = useState(null);

//   useEffect(() => {
//     if (!nextSession) return;

//     const targetDate = convertPersianToDate(nextSession.date, nextSession.time);

//     const interval = setInterval(() => {
//       const now = new Date();
//       const diff = targetDate - now;

//       if (diff <= 0) {
//         clearInterval(interval);
//         setTimeLeft(null);
//       } else {
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//         const hours = Math.floor(
//           (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
//         );
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         setTimeLeft({ days, hours, minutes });
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [nextSession]);

//   // ===== تابع شروع جلسه =====
//   const handleStartSession = (session) => {
//     if (window.confirm(`آیا مایل به شروع جلسه ${session.patient} هستید؟`)) {
//       if (session.meetingLink) {
//         window.open(session.meetingLink, "_blank");
//       } else {
//         alert("لینک جلسه موجود نیست.");
//       }
//     }
//   };

//   // ===== تابع پایان جلسه =====
//   const handleEndSession = (sessionId) => {
//     if (window.confirm("آیا جلسه به پایان رسیده است؟")) {
//       alert("✅ جلسه با موفقیت به پایان رسید.");
//     }
//   };

//   // ===== دریافت آیکون نوع جلسه =====
//   const getTypeIcon = (type) => {
//     const typeMap = {
//       individual: "🧑‍⚕️",
//       couple: "💑",
//       teen: "🧒",
//       family: "👨‍👩‍👧‍👦",
//     };
//     return typeMap[type] || "🧑‍⚕️";
//   };

//   // ===== دریافت نام نوع جلسه =====
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
//                 sortedSessions.filter(
//                   (s) => s.status === "upcoming" || s.status === "ongoing",
//                 ).length
//               }
//             </span>
//             <span className={styles.statLabel}>جلسه پیش‌رو</span>
//           </span>
//           <span className={styles.statDivider}>|</span>
//           <span className={styles.statItem}>
//             <span className={styles.statNumber}>
//               {sortedSessions.filter((s) => s.status === "completed").length}
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
//               sortedSessions.filter(
//                 (s) => s.status === "upcoming" || s.status === "ongoing",
//               ).length
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
//               sortedSessions.filter(
//                 (s) => s.status === "completed" || s.status === "cancelled",
//               ).length
//             }
//           </span>
//         </button>
//       </div>

//       {/* لیست جلسات */}
//       <div className={styles.sessionsList}>
//         {/* ===== کارت ویژه جلسه بعدی با تایمر ===== */}
//         {activeTab === "upcoming" && nextSession && (
//           <div className={styles.nextSessionBanner}>
//             <div className={styles.nextSessionContent}>
//               <span className={styles.nextSessionLabel}>⏰ جلسه بعدی شما</span>
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
//                 🚀 شروع جلسه
//                 <span>→</span>
//               </button>

//               {/* ===== تایمر فقط اینجا ===== */}
//               {timeLeft && (
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
//             </div>
//           </div>
//         )}

//         {/* ===== لیست بقیه جلسات (بدون تایمر) ===== */}
//         {filteredSessions.length > 0 ? (
//           filteredSessions.map((session) => {
//             // اگر این جلسه جلسه بعدی هست، از رندر کردنش صرف‌نظر کن
//             if (nextSession && session.id === nextSession.id) return null;

//             const statusInfo = getStatusInfo(session.status);

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

//                 {/* جزئیات جلسه (بدون تایمر) */}
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
//                   {session.status === "upcoming" && (
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

//                   {session.status === "ongoing" && (
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

//                   {session.status === "completed" && (
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

// function SessionsManagement() {
//   const [activeTab, setActiveTab] = useState("upcoming");
//   const [selectedSession, setSelectedSession] = useState(null);

//   // ===== داده‌های جلسات با تاریخ‌های جدید =====
//   const sessions = [
//     {
//       id: 1,
//       patient: "محمد کریمی",
//       patientPhone: "۹۱۲۳۴۵۶۷۸۹",
//       title: "جلسه مشاوره فردی",
//       date: "۱۴۰۵/۰۶/۰۷",
//       time: "۱۰:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "ongoing", // در حال برگزاری
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
//   const convertPersianToDate = (persianDate, time) => {
//     const [year, month, day] = persianDate.split("/");
//     const [hours, minutes] = time.split(":");
//     const gregorianYear = parseInt(year) - 621;
//     const gregorianMonth = parseInt(month) - 1;
//     const gregorianDay = parseInt(day);
//     return new Date(
//       gregorianYear,
//       gregorianMonth,
//       gregorianDay,
//       parseInt(hours),
//       parseInt(minutes),
//     );
//   };

//   // ===== مرتب‌سازی جلسات بر اساس تاریخ و زمان (نزدیک‌ترین اول) =====
//   const sortedSessions = [...sessions].sort((a, b) => {
//     const dateA = convertPersianToDate(a.date, a.time);
//     const dateB = convertPersianToDate(b.date, b.time);
//     return dateA - dateB;
//   });

//   // ===== فیلتر کردن جلسات =====
//   const getFilteredSessions = () => {
//     if (activeTab === "upcoming") {
//       return sortedSessions.filter(
//         (s) => s.status === "upcoming" || s.status === "ongoing",
//       );
//     }
//     return sortedSessions.filter(
//       (s) => s.status === "completed" || s.status === "cancelled",
//     );
//   };

//   const filteredSessions = getFilteredSessions();

//   // ===== وضعیت‌ها =====
//   const getStatusInfo = (status) => {
//     const statusMap = {
//       upcoming: {
//         label: "در انتظار",
//         className: styles.sessionUpcoming,
//       },
//       ongoing: {
//         label: "در حال برگزاری",
//         className: styles.sessionOngoing,
//       },
//       completed: {
//         label: "انجام شده",
//         className: styles.sessionCompleted,
//       },
//       cancelled: {
//         label: "لغو شده",
//         className: styles.sessionCancelled,
//       },
//     };
//     return statusMap[status] || statusMap.upcoming;
//   };

//   // ===== پیدا کردن جلسه بعدی (نزدیک‌ترین جلسه آینده یا در حال برگزاری) =====
//   const getNextSession = () => {
//     const upcomingSessions = sortedSessions.filter(
//       (s) => s.status === "upcoming" || s.status === "ongoing",
//     );

//     if (upcomingSessions.length === 0) return null;

//     // مرتب‌سازی بر اساس تاریخ (نزدیک‌ترین اول)
//     const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
//       const dateA = convertPersianToDate(a.date, a.time);
//       const dateB = convertPersianToDate(b.date, b.time);
//       return dateA - dateB;
//     });

//     return sortedUpcoming[0];
//   };

//   const nextSession = getNextSession();

//   // ===== تایمر شمارش معکوس (فقط برای جلسه بعدی) =====
//   const [timeLeft, setTimeLeft] = useState(null);

//   useEffect(() => {
//     if (!nextSession) return;

//     const targetDate = convertPersianToDate(nextSession.date, nextSession.time);

//     const interval = setInterval(() => {
//       const now = new Date();
//       const diff = targetDate - now;

//       if (diff <= 0) {
//         clearInterval(interval);
//         setTimeLeft(null);
//       } else {
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//         const hours = Math.floor(
//           (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
//         );
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         setTimeLeft({ days, hours, minutes });
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [nextSession]);

//   // ===== تابع شروع جلسه =====
//   const handleStartSession = (session) => {
//     if (window.confirm(`آیا مایل به شروع جلسه ${session.patient} هستید؟`)) {
//       if (session.meetingLink) {
//         window.open(session.meetingLink, "_blank");
//       } else {
//         alert("لینک جلسه موجود نیست.");
//       }
//     }
//   };

//   // ===== تابع پایان جلسه =====
//   const handleEndSession = (sessionId) => {
//     if (window.confirm("آیا جلسه به پایان رسیده است؟")) {
//       alert("✅ جلسه با موفقیت به پایان رسید.");
//     }
//   };

//   // ===== دریافت آیکون نوع جلسه =====
//   const getTypeIcon = (type) => {
//     const typeMap = {
//       individual: "🧑‍⚕️",
//       couple: "💑",
//       teen: "🧒",
//       family: "👨‍👩‍👧‍👦",
//     };
//     return typeMap[type] || "🧑‍⚕️";
//   };

//   // ===== دریافت نام نوع جلسه =====
//   const getTypeName = (type) => {
//     const typeMap = {
//       individual: "فردی",
//       couple: "زوج",
//       teen: "نوجوان",
//       family: "خانواده",
//     };
//     return typeMap[type] || "فردی";
//   };

//   // ===== بررسی اینکه آیا جلسه در حال برگزاری است =====
//   const isOngoing = (session) => {
//     return session.status === "ongoing";
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
//                 sortedSessions.filter(
//                   (s) => s.status === "upcoming" || s.status === "ongoing",
//                 ).length
//               }
//             </span>
//             <span className={styles.statLabel}>جلسه پیش‌رو</span>
//           </span>
//           <span className={styles.statDivider}>|</span>
//           <span className={styles.statItem}>
//             <span className={styles.statNumber}>
//               {sortedSessions.filter((s) => s.status === "completed").length}
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
//               sortedSessions.filter(
//                 (s) => s.status === "upcoming" || s.status === "ongoing",
//               ).length
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
//               sortedSessions.filter(
//                 (s) => s.status === "completed" || s.status === "cancelled",
//               ).length
//             }
//           </span>
//         </button>
//       </div>

//       {/* لیست جلسات */}
//       <div className={styles.sessionsList}>
//         {/* ===== کارت ویژه جلسه بعدی با تایمر ===== */}
//         {activeTab === "upcoming" && nextSession && (
//           <div className={styles.nextSessionBanner}>
//             <div className={styles.nextSessionContent}>
//               <span className={styles.nextSessionLabel}>
//                 {isOngoing(nextSession)
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
//                 {isOngoing(nextSession) ? "🚀 ورود به جلسه" : "🚀 شروع جلسه"}
//                 <span>→</span>
//               </button>

//               {/* ===== تایمر فقط برای جلسات آینده (نه در حال برگزاری) ===== */}
//               {!isOngoing(nextSession) && timeLeft && (
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
//               {isOngoing(nextSession) && (
//                 <div className={styles.ongoingBadge}>
//                   <span className={styles.pulseDot}></span>
//                   جلسه در حال برگزاری است
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* ===== لیست بقیه جلسات (بدون تایمر) ===== */}
//         {filteredSessions.length > 0 ? (
//           filteredSessions.map((session) => {
//             // اگر این جلسه جلسه بعدی هست، از رندر کردنش صرف‌نظر کن
//             if (nextSession && session.id === nextSession.id) return null;

//             const statusInfo = getStatusInfo(session.status);

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

//                 {/* جزئیات جلسه (بدون تایمر) */}
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
//                   {session.status === "upcoming" && (
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

//                   {session.status === "ongoing" && (
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

//                   {session.status === "completed" && (
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
// function SessionsManagement() {
//   const [activeTab, setActiveTab] = useState("upcoming");
//   const [selectedSession, setSelectedSession] = useState(null);

//   // ===== داده‌های جلسات (بدون status: ongoing) =====
//   const sessions = [
//     {
//       id: 1,
//       patient: "محمد کریمی",
//       patientPhone: "۹۱۲۳۴۵۶۷۸۹",
//       title: "جلسه مشاوره فردی",
//       date: "۱۴۰۵/۰۶/۰۷",
//       time: "۱۶:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "upcoming", // فقط upcoming یا completed یا cancelled
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
//   const convertPersianToDate = (persianDate, time) => {
//     const [year, month, day] = persianDate.split("/");
//     const [hours, minutes] = time.split(":");
//     const gregorianYear = parseInt(year) - 621;
//     const gregorianMonth = parseInt(month) - 1;
//     const gregorianDay = parseInt(day);
//     return new Date(
//       gregorianYear,
//       gregorianMonth,
//       gregorianDay,
//       parseInt(hours),
//       parseInt(minutes),
//     );
//   };

//   // ===== تشخیص وضعیت واقعی جلسه بر اساس زمان فعلی =====
//   const getRealStatus = (session) => {
//     if (session.status === "completed") return "completed";
//     if (session.status === "cancelled") return "cancelled";

//     const now = new Date();
//     const sessionDate = convertPersianToDate(session.date, session.time);
//     const diffMs = sessionDate - now;
//     const diffMinutes = diffMs / (1000 * 60);

//     // اگر جلسه گذشته (بیش از 60 دقیقه از شروعش گذشته)
//     if (diffMinutes < -60) return "completed";

//     // اگر در حال برگزاری (تا 60 دقیقه بعد از شروع)
//     if (diffMinutes <= 0 && diffMinutes >= -60) return "ongoing";

//     // اگر آینده است
//     return "upcoming";
//   };

//   // ===== مرتب‌سازی جلسات بر اساس تاریخ و زمان (نزدیک‌ترین اول) =====
//   const sortedSessions = [...sessions].sort((a, b) => {
//     const dateA = convertPersianToDate(a.date, a.time);
//     const dateB = convertPersianToDate(b.date, b.time);
//     return dateA - dateB;
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
//   const getStatusInfo = (status) => {
//     const statusMap = {
//       upcoming: {
//         label: "در انتظار",
//         className: styles.sessionUpcoming,
//       },
//       ongoing: {
//         label: "در حال برگزاری",
//         className: styles.sessionOngoing,
//       },
//       completed: {
//         label: "انجام شده",
//         className: styles.sessionCompleted,
//       },
//       cancelled: {
//         label: "لغو شده",
//         className: styles.sessionCancelled,
//       },
//     };
//     return statusMap[status] || statusMap.upcoming;
//   };

//   // ===== پیدا کردن جلسه بعدی (نزدیک‌ترین جلسه آینده یا در حال برگزاری) =====
//   const getNextSession = () => {
//     const upcomingSessions = sortedSessions.filter((s) => {
//       const realStatus = getRealStatus(s);
//       return realStatus === "upcoming" || realStatus === "ongoing";
//     });

//     if (upcomingSessions.length === 0) return null;

//     // مرتب‌سازی بر اساس تاریخ (نزدیک‌ترین اول)
//     const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
//       const dateA = convertPersianToDate(a.date, a.time);
//       const dateB = convertPersianToDate(b.date, b.time);
//       return dateA - dateB;
//     });

//     return sortedUpcoming[0];
//   };

//   const nextSession = getNextSession();
//   const nextSessionRealStatus = nextSession ? getRealStatus(nextSession) : null;

//   // ===== تایمر شمارش معکوس (فقط برای جلسات آینده) =====
//   const [timeLeft, setTimeLeft] = useState(null);

//   useEffect(() => {
//     if (!nextSession) return;

//     const now = new Date();
//     const targetDate = convertPersianToDate(nextSession.date, nextSession.time);
//     const diff = targetDate - now;

//     // اگر جلسه در حال برگزاری است یا گذشته، تایمر رو خالی کن
//     if (diff <= 0) {
//       setTimeLeft(null);
//       return;
//     }

//     const interval = setInterval(() => {
//       const now = new Date();
//       const diff = targetDate - now;

//       if (diff <= 0) {
//         clearInterval(interval);
//         setTimeLeft(null);
//       } else {
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//         const hours = Math.floor(
//           (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
//         );
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         setTimeLeft({ days, hours, minutes });
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [nextSession]);

//   // ===== تابع شروع جلسه =====
//   const handleStartSession = (session) => {
//     if (window.confirm(`آیا مایل به شروع جلسه ${session.patient} هستید؟`)) {
//       if (session.meetingLink) {
//         window.open(session.meetingLink, "_blank");
//       } else {
//         alert("لینک جلسه موجود نیست.");
//       }
//     }
//   };

//   // ===== تابع پایان جلسه =====
//   const handleEndSession = (sessionId) => {
//     if (window.confirm("آیا جلسه به پایان رسیده است؟")) {
//       alert("✅ جلسه با موفقیت به پایان رسید.");
//     }
//   };

//   // ===== دریافت آیکون نوع جلسه =====
//   const getTypeIcon = (type) => {
//     const typeMap = {
//       individual: "🧑‍⚕️",
//       couple: "💑",
//       teen: "🧒",
//       family: "👨‍👩‍👧‍👦",
//     };
//     return typeMap[type] || "🧑‍⚕️";
//   };

//   // ===== دریافت نام نوع جلسه =====
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

//               {/* ===== تایمر فقط برای جلسات آینده (نه در حال برگزاری) ===== */}
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
//             // اگر این جلسه جلسه بعدی هست، از رندر کردنش صرف‌نظر کن
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
// function SessionsManagement() {
//   const [activeTab, setActiveTab] = useState("upcoming");
//   const [selectedSession, setSelectedSession] = useState(null);

//   // ===== داده‌های جلسات (بدون status: ongoing) =====
//   const sessions = [
//     {
//       id: 1,
//       patient: "محمد کریمی",
//       patientPhone: "۹۱۲۳۴۵۶۷۸۹",
//       title: "جلسه مشاوره فردی",
//       date: "۱۴۰۵/۰۶/۰۷",
//       time: "۱۶:۰۰",
//       duration: "۶۰ دقیقه",
//       status: "upcoming", // فقط upcoming یا completed یا cancelled
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
//   //   const [year, month, day] = persianDate.split('/');
//   //   const [hours, minutes] = time.split(':');
//   //   const gregorianYear = parseInt(year) - 621;
//   //   const gregorianMonth = parseInt(month) - 1;
//   //   const gregorianDay = parseInt(day);
//   //   return new Date(gregorianYear, gregorianMonth, gregorianDay, parseInt(hours), parseInt(minutes));
//   // };

//   // ===== تبدیل تاریخ شمسی به میلادی =====
//   const convertPersianToDate = (persianDate, time) => {
//     if (!persianDate || !time) return new Date();

//     const parts = persianDate.split("/");
//     if (parts.length !== 3) return new Date();

//     const year = parseInt(parts[0]);
//     const month = parseInt(parts[1]);
//     const day = parseInt(parts[2]);

//     const timeParts = time.split(":");
//     const hours = parseInt(timeParts[0]);
//     const minutes = parseInt(timeParts[1]);

//     // بررسی معتبر بودن اعداد
//     if (
//       isNaN(year) ||
//       isNaN(month) ||
//       isNaN(day) ||
//       isNaN(hours) ||
//       isNaN(minutes)
//     ) {
//       return new Date();
//     }

//     // تبدیل سال شمسی به میلادی (تقریباً - ۶۲۱ سال)
//     const gregorianYear = year - 621;
//     const gregorianMonth = month - 1; // ماه در جاوااسکریپت از ۰ شروع میشه
//     const gregorianDay = day;

//     return new Date(
//       gregorianYear,
//       gregorianMonth,
//       gregorianDay,
//       hours,
//       minutes,
//     );
//   };

//   // ===== تشخیص وضعیت واقعی جلسه بر اساس زمان فعلی =====
//   const getRealStatus = (session) => {
//     if (session.status === "completed") return "completed";
//     if (session.status === "cancelled") return "cancelled";

//     const now = new Date();
//     const sessionDate = convertPersianToDate(session.date, session.time);
//     const diffMs = sessionDate - now;
//     const diffMinutes = diffMs / (1000 * 60);

//     // اگر جلسه گذشته (بیش از 60 دقیقه از شروعش گذشته)
//     if (diffMinutes < -60) return "completed";

//     // اگر در حال برگزاری (تا 60 دقیقه بعد از شروع)
//     if (diffMinutes <= 0 && diffMinutes >= -60) return "ongoing";

//     // اگر آینده است
//     return "upcoming";
//   };

//   // ===== مرتب‌سازی جلسات بر اساس تاریخ و زمان (نزدیک‌ترین اول) =====
//   const sortedSessions = [...sessions].sort((a, b) => {
//     const dateA = convertPersianToDate(a.date, a.time);
//     const dateB = convertPersianToDate(b.date, b.time);
//     return dateA - dateB;
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
//   const getStatusInfo = (status) => {
//     const statusMap = {
//       upcoming: {
//         label: "در انتظار",
//         className: styles.sessionUpcoming,
//       },
//       ongoing: {
//         label: "در حال برگزاری",
//         className: styles.sessionOngoing,
//       },
//       completed: {
//         label: "انجام شده",
//         className: styles.sessionCompleted,
//       },
//       cancelled: {
//         label: "لغو شده",
//         className: styles.sessionCancelled,
//       },
//     };
//     return statusMap[status] || statusMap.upcoming;
//   };

//   // ===== پیدا کردن جلسه بعدی (نزدیک‌ترین جلسه آینده یا در حال برگزاری) =====
//   const getNextSession = () => {
//     const upcomingSessions = sortedSessions.filter((s) => {
//       const realStatus = getRealStatus(s);
//       return realStatus === "upcoming" || realStatus === "ongoing";
//     });

//     if (upcomingSessions.length === 0) return null;

//     // مرتب‌سازی بر اساس تاریخ (نزدیک‌ترین اول)
//     const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
//       const dateA = convertPersianToDate(a.date, a.time);
//       const dateB = convertPersianToDate(b.date, b.time);
//       return dateA - dateB;
//     });

//     return sortedUpcoming[0];
//   };

//   const nextSession = getNextSession();
//   const nextSessionRealStatus = nextSession ? getRealStatus(nextSession) : null;

//   // ===== تایمر شمارش معکوس (فقط برای جلسات آینده) =====
//   const [timeLeft, setTimeLeft] = useState(null);

//   useEffect(() => {
//     if (!nextSession) return;

//     const now = new Date();
//     const targetDate = convertPersianToDate(nextSession.date, nextSession.time);
//     const diff = targetDate - now;

//     // اگر جلسه در حال برگزاری است یا گذشته، تایمر رو خالی کن
//     if (diff <= 0) {
//       setTimeLeft(null);
//       return;
//     }

//     const interval = setInterval(() => {
//       const now = new Date();
//       const diff = targetDate - now;

//       if (diff <= 0) {
//         clearInterval(interval);
//         setTimeLeft(null);
//       } else {
//         const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//         const hours = Math.floor(
//           (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
//         );
//         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
//         setTimeLeft({ days, hours, minutes });
//       }
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [nextSession]);

//   // ===== تابع شروع جلسه =====
//   const handleStartSession = (session) => {
//     if (window.confirm(`آیا مایل به شروع جلسه ${session.patient} هستید؟`)) {
//       if (session.meetingLink) {
//         window.open(session.meetingLink, "_blank");
//       } else {
//         alert("لینک جلسه موجود نیست.");
//       }
//     }
//   };

//   // ===== تابع پایان جلسه =====
//   const handleEndSession = (sessionId) => {
//     if (window.confirm("آیا جلسه به پایان رسیده است؟")) {
//       alert("✅ جلسه با موفقیت به پایان رسید.");
//     }
//   };

//   // ===== دریافت آیکون نوع جلسه =====
//   const getTypeIcon = (type) => {
//     const typeMap = {
//       individual: "🧑‍⚕️",
//       couple: "💑",
//       teen: "🧒",
//       family: "👨‍👩‍👧‍👦",
//     };
//     return typeMap[type] || "🧑‍⚕️";
//   };

//   // ===== دریافت نام نوع جلسه =====
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

//               {/* ===== تایمر فقط برای جلسات آینده (نه در حال برگزاری) ===== */}
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
//             // اگر این جلسه جلسه بعدی هست، از رندر کردنش صرف‌نظر کن
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
function SessionsManagement() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedSession, setSelectedSession] = useState(null);

  // ===== داده‌های جلسات =====
  const sessions = [
    {
      id: 1,
      patient: "محمد کریمی",
      patientPhone: "۹۱۲۳۴۵۶۷۸۹",
      title: "جلسه مشاوره فردی",
      date: "۱۴۰۵/۰۶/۰۷",
      time: "۱۰:۰۰",
      duration: "۶۰ دقیقه",
      status: "upcoming",
      isOnline: true,
      meetingLink: "https://meet.google.com/abc-defg-hij",
      type: "individual",
      notes: "بررسی اضطراب اجتماعی",
    },
    {
      id: 2,
      patient: "زهرا احمدی",
      patientPhone: "۹۱۳۴۵۶۷۸۹۰",
      title: "جلسه زوج درمانی",
      date: "۱۴۰۵/۰۶/۰۸",
      time: "۱۱:۳۰",
      duration: "۹۰ دقیقه",
      status: "upcoming",
      isOnline: true,
      meetingLink: "https://meet.google.com/klm-nopq-rst",
      type: "couple",
      notes: "مشکلات ارتباطی",
    },
    {
      id: 3,
      patient: "علی رضایی",
      patientPhone: "۹۱۴۵۶۷۸۹۰۱",
      title: "جلسه مشاوره فردی",
      date: "۱۴۰۵/۰۶/۱۰",
      time: "۱۴:۰۰",
      duration: "۶۰ دقیقه",
      status: "upcoming",
      isOnline: true,
      meetingLink: "https://meet.google.com/xyz-uvwx-yza",
      type: "individual",
      notes: "پیشرفت خوب در مدیریت استرس",
    },
    {
      id: 4,
      patient: "سارا محمدی",
      patientPhone: "۹۱۵۶۷۸۹۰۱۲",
      title: "جلسه مشاوره نوجوان",
      date: "۱۴۰۵/۰۶/۱۱",
      time: "۱۶:۰۰",
      duration: "۶۰ دقیقه",
      status: "upcoming",
      isOnline: true,
      meetingLink: "https://meet.google.com/def-ghij-klm",
      type: "teen",
      notes: "مشکلات تحصیلی و اضطراب",
    },
    {
      id: 5,
      patient: "رضا حسینی",
      patientPhone: "۹۱۶۷۸۹۰۱۲۳",
      title: "جلسه مشاوره فردی",
      date: "۱۴۰۵/۰۶/۰۴",
      time: "۱۵:۰۰",
      duration: "۶۰ دقیقه",
      status: "completed",
      isOnline: true,
      meetingLink: "https://meet.google.com/nop-qrst-uvw",
      type: "individual",
      notes: "جلسه انجام شده",
    },
    {
      id: 6,
      patient: "نگار موسوی",
      patientPhone: "۹۱۷۸۹۰۱۲۳۴",
      title: "جلسه زوج درمانی",
      date: "۱۴۰۵/۰۶/۰۲",
      time: "۱۷:۰۰",
      duration: "۹۰ دقیقه",
      status: "cancelled",
      isOnline: false,
      meetingLink: null,
      type: "couple",
      notes: "لغو توسط بیمار",
      cancelledBy: "patient",
      cancelReason: "مشکل شخصی",
    },
  ];

  // ===== تبدیل تاریخ شمسی به میلادی =====
  const convertPersianToDate = (persianDate, time) => {
    if (!persianDate || !time) return new Date();
    
    const parts = persianDate.split('/');
    if (parts.length !== 3) return new Date();
    
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const day = parseInt(parts[2]);
    
    const timeParts = time.split(':');
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
      return new Date();
    }
    
    const gregorianYear = year - 621;
    const gregorianMonth = month - 1;
    const gregorianDay = day;
    
    const result = new Date(gregorianYear, gregorianMonth, gregorianDay, hours, minutes);
    
    if (isNaN(result.getTime())) {
      return new Date();
    }
    
    return result;
  };

  // ===== محاسبه زمان پایان جلسه =====
  const getEndTime = (session) => {
    const startDate = convertPersianToDate(session.date, session.time);
    const durationMinutes = parseInt(session.duration);
    if (isNaN(durationMinutes)) return startDate;
    return new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  };

  // ===== تشخیص وضعیت واقعی جلسه =====
  const getRealStatus = (session) => {
    // اگر جلسه لغو شده یا انجام شده، همون رو برگردون
    if (session.status === "completed") return "completed";
    if (session.status === "cancelled") return "cancelled";
    
    const now = new Date();
    const startDate = convertPersianToDate(session.date, session.time);
    const endDate = getEndTime(session);
    
    const diffStart = startDate - now;
    const diffEnd = endDate - now;
    
    // اگر زمان شروع جلسه گذشته
    if (diffStart <= 0) {
      // اگر زمان پایان جلسه هنوز نرسیده → در حال برگزاری
      if (diffEnd > 0) {
        return "ongoing";
      }
      // اگر زمان پایان هم گذشته → انجام شده
      return "completed";
    }
    
    // اگر زمان شروع جلسه در آینده است → در انتظار
    return "upcoming";
  };

  // ===== مرتب‌سازی جلسات بر اساس تاریخ و زمان (نزدیک‌ترین اول) =====
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = convertPersianToDate(a.date, a.time);
    const dateB = convertPersianToDate(b.date, b.time);
    return dateA - dateB;
  });

  // ===== فیلتر کردن جلسات =====
  const getFilteredSessions = () => {
    if (activeTab === "upcoming") {
      return sortedSessions.filter((s) => {
        const realStatus = getRealStatus(s);
        return realStatus === "upcoming" || realStatus === "ongoing";
      });
    }
    return sortedSessions.filter((s) => {
      const realStatus = getRealStatus(s);
      return realStatus === "completed" || s.status === "cancelled";
    });
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

  // ===== پیدا کردن جلسه بعدی (نزدیک‌ترین جلسه آینده یا در حال برگزاری) =====
  const getNextSession = () => {
    const upcomingSessions = sortedSessions.filter((s) => {
      const realStatus = getRealStatus(s);
      return realStatus === "upcoming" || realStatus === "ongoing";
    });

    if (upcomingSessions.length === 0) return null;

    const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
      const dateA = convertPersianToDate(a.date, a.time);
      const dateB = convertPersianToDate(b.date, b.time);
      return dateA - dateB;
    });

    return sortedUpcoming[0];
  };

  const nextSession = getNextSession();
  const nextSessionRealStatus = nextSession ? getRealStatus(nextSession) : null;

  // ===== تایمر شمارش معکوس =====
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!nextSession) return;

    const targetDate = convertPersianToDate(nextSession.date, nextSession.time);
    const now = new Date();
    const diff = targetDate - now;

    // اگر جلسه در حال برگزاری است یا گذشته، تایمر رو خالی کن
    if (diff <= 0) {
      setTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        clearInterval(interval);
        setTimeLeft(null);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft({ days, hours, minutes });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextSession]);

  // ===== توابع کمکی =====
  const handleStartSession = (session) => {
    if (window.confirm(`آیا مایل به شروع جلسه ${session.patient} هستید؟`)) {
      if (session.meetingLink) {
        window.open(session.meetingLink, "_blank");
      } else {
        alert("لینک جلسه موجود نیست.");
      }
    }
  };

  const handleEndSession = (sessionId) => {
    if (window.confirm("آیا جلسه به پایان رسیده است؟")) {
      alert("✅ جلسه با موفقیت به پایان رسید.");
    }
  };

  const getTypeIcon = (type) => {
    const typeMap = {
      individual: "🧑‍⚕️",
      couple: "💑",
      teen: "🧒",
      family: "👨‍👩‍👧‍👦",
    };
    return typeMap[type] || "🧑‍⚕️";
  };

  const getTypeName = (type) => {
    const typeMap = {
      individual: "فردی",
      couple: "زوج",
      teen: "نوجوان",
      family: "خانواده",
    };
    return typeMap[type] || "فردی";
  };

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
              {sortedSessions.filter((s) => {
                const realStatus = getRealStatus(s);
                return realStatus === "upcoming" || realStatus === "ongoing";
              }).length}
            </span>
            <span className={styles.statLabel}>جلسه پیش‌رو</span>
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>
              {sortedSessions.filter((s) => {
                const realStatus = getRealStatus(s);
                return realStatus === "completed";
              }).length}
            </span>
            <span className={styles.statLabel}>جلسه برگزار شده</span>
          </span>
        </div>
      </div>

      {/* تب‌ها */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${activeTab === "upcoming" ? styles.active : ""}`}
          onClick={() => setActiveTab("upcoming")}
        >
          📅 جلسات پیش‌رو
          <span className={styles.filterCount}>
            {sortedSessions.filter((s) => {
              const realStatus = getRealStatus(s);
              return realStatus === "upcoming" || realStatus === "ongoing";
            }).length}
          </span>
        </button>
        <button
          className={`${styles.filterTab} ${activeTab === "past" ? styles.active : ""}`}
          onClick={() => setActiveTab("past")}
        >
          📋 تاریخچه جلسات
          <span className={styles.filterCount}>
            {sortedSessions.filter((s) => {
              const realStatus = getRealStatus(s);
              return realStatus === "completed" || s.status === "cancelled";
            }).length}
          </span>
        </button>
      </div>

      {/* لیست جلسات */}
      <div className={styles.sessionsList}>
        {/* ===== کارت ویژه جلسه بعدی ===== */}
        {activeTab === "upcoming" && nextSession && (
          <div className={styles.nextSessionBanner}>
            <div className={styles.nextSessionContent}>
              <span className={styles.nextSessionLabel}>
                {nextSessionRealStatus === "ongoing" ? "🔴 در حال برگزاری" : "⏰ جلسه بعدی شما"}
              </span>
              <h3>{nextSession.title}</h3>
              <p>با {nextSession.patient}</p>
              <div className={styles.nextSessionTime}>
                <span>📅 {nextSession.date}</span>
                <span>•</span>
                <span>⏰ {nextSession.time}</span>
                <span>•</span>
                <span>
                  {getTypeIcon(nextSession.type)}{" "}
                  {getTypeName(nextSession.type)}
                </span>
              </div>
              {nextSession.notes && (
                <div className={styles.nextSessionNotes}>
                  📋 {nextSession.notes}
                </div>
              )}
            </div>

            <div className={styles.nextSessionActions}>
              <button
                className={styles.btnNextSession}
                onClick={() => handleStartSession(nextSession)}
              >
                {nextSessionRealStatus === "ongoing" ? "🚀 ورود به جلسه" : "🚀 شروع جلسه"}
                <span>→</span>
              </button>

              {/* ===== تایمر فقط برای جلسات آینده ===== */}
              {nextSessionRealStatus === "upcoming" && timeLeft && (
                <div className={styles.nextSessionTimer}>
                  <span className={styles.timerLabel}>زمان تا شروع:</span>
                  <div className={styles.timerDigits}>
                    <span className={styles.timerDigit}>
                      {String(timeLeft.days).padStart(2, "0")}
                      <span className={styles.timerUnit}>روز</span>
                    </span>
                    <span className={styles.timerSeparator}>:</span>
                    <span className={styles.timerDigit}>
                      {String(timeLeft.hours).padStart(2, "0")}
                      <span className={styles.timerUnit}>ساعت</span>
                    </span>
                    <span className={styles.timerSeparator}>:</span>
                    <span className={styles.timerDigit}>
                      {String(timeLeft.minutes).padStart(2, "0")}
                      <span className={styles.timerUnit}>دقیقه</span>
                    </span>
                  </div>
                </div>
              )}

              {/* ===== نمایش "در حال برگزاری" برای جلسه جاری ===== */}
              {nextSessionRealStatus === "ongoing" && (
                <div className={styles.ongoingBadge}>
                  <span className={styles.pulseDot}></span>
                  جلسه در حال برگزاری است
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== لیست بقیه جلسات ===== */}
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session) => {
            if (nextSession && session.id === nextSession.id) return null;

            const realStatus = getRealStatus(session);
            const statusInfo = getStatusInfo(realStatus);

            return (
              <div key={session.id} className={styles.sessionCard}>
                {/* هدر کارت */}
                <div className={styles.sessionCardHeader}>
                  <div className={styles.sessionDoctor}>
                    <div className={styles.sessionPatientAvatar}>
                      {getTypeIcon(session.type)}
                    </div>
                    <div>
                      <h4>{session.patient}</h4>
                      <span className={styles.sessionType}>
                        {session.title} • {getTypeName(session.type)}
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

                {/* جزئیات جلسه */}
                <div className={styles.sessionDetails}>
                  <div className={styles.sessionMeta}>
                    <div className={styles.metaGroup}>
                      <span>📅 {session.date}</span>
                    </div>
                    <div className={styles.metaGroup}>
                      <span>
                        ⏰ {session.time} - {session.duration}
                      </span>
                    </div>
                    <div className={styles.metaGroup}>
                      <span>🖥️ جلسه آنلاین</span>
                    </div>
                  </div>
                  {session.notes && (
                    <div className={styles.sessionNotes}>
                      📋 {session.notes}
                    </div>
                  )}
                </div>

                {/* دکمه‌های اکشن */}
                <div className={styles.sessionActions}>
                  {realStatus === "upcoming" && (
                    <>
                      <button
                        className={styles.btnJoinSession}
                        onClick={() => handleStartSession(session)}
                      >
                        <span>▶</span>
                        شروع جلسه
                      </button>
                      <button
                        className={styles.btnCancelSession}
                        onClick={() => {
                          if (
                            window.confirm(
                              `آیا از لغو جلسه ${session.patient} اطمینان دارید؟`
                            )
                          ) {
                            alert(`❌ جلسه ${session.patient} لغو شد.`);
                          }
                        }}
                      >
                        ❌ لغو جلسه
                      </button>
                    </>
                  )}

                  {realStatus === "ongoing" && (
                    <>
                      <button className={styles.btnJoinNow}>
                        <span className={styles.pulseDot}></span>
                        در حال برگزاری
                      </button>
                      <button
                        className={styles.btnEndSession}
                        onClick={() => handleEndSession(session.id)}
                      >
                        ⏹ پایان جلسه
                      </button>
                    </>
                  )}

                  {(realStatus === "completed" || session.status === "completed") && (
                    <>
                      <button className={styles.btnViewRecord}>
                        📹 مشاهده ضبط جلسه
                      </button>
                      <button className={styles.btnViewNotes}>
                        📝 مشاهده یادداشت
                      </button>
                    </>
                  )}

                  {session.status === "cancelled" && (
                    <span className={styles.cancelledInfo}>
                      ❌{" "}
                      {session.cancelledBy === "patient"
                        ? "لغو توسط بیمار"
                        : "لغو توسط پزشک"}
                      {session.cancelReason && (
                        <span className={styles.cancelReasonText}>
                          • دلیل: {session.cancelReason}
                        </span>
                      )}
                    </span>
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
