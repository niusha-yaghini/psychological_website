import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./PatientDashboard.module.css";

import {
  FaHome,
  FaCalendarAlt,
  FaCommentDots,
  FaFileAlt,
  FaChartLine,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaSearch,
  FaVideo,
  FaBookOpen,
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

// import logo from "../../../../public/images/logo/logo2.png";
import logo from "../../../public/images/logo/logo2.png";
// import userAvatar from "../../../public/images/PatientDashboard/usericon.png";
import userAvatar from "../../../public/images/Patient_Panel/usericon.png";
// import userAvatar from "../../../public/images/avatar/"

function PatientDashboard() {
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
      id: "resources",
      label: "منابع آموزشی",
      icon: <FaBookOpen />,
      path: "/resources",
    },
    {
      id: "journal",
      label: "یادداشت‌ها",
      icon: <FaFileAlt />,
      path: "/journal",
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
      // case "dashboard2":
      // return <DashboardContent2 userData={userData} />;
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
      case "resources":
        return <ResourcesContent />;
      case "journal":
        return <JournalContent />;
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
        {/* لوگو و دکمه جمع کردن */}
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
            {/* جستجو */}
            {/* <div className={styles.searchWrapper}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="جستجو..."
              />
            </div> */}

            {/* نوتیفیکیشن */}
            <button className={styles.notificationBtn}>
              <FaBell />
              <span className={styles.notificationDot}></span>
            </button>

            {/* کاربر */}
            <div className={styles.userProfile}>
              <img
                src={userAvatar}
                alt="پروفایل"
                className={styles.userAvatar}
              />
              {/* {!isCollapsed && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {userData?.phone || "کاربر"}
                  </span>
                  <span className={styles.userRole}>مشتری</span>
                </div>
              )} */}
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
// function DashboardContent({ userData }) {
//   const stats = [
//     { label: "جلسات برگزار شده", value: 8, icon: "📅", color: "#4CAF84" },
//     { label: "جلسات پیش‌رو", value: 3, icon: "⏰", color: "#FF9800" },
//     { label: "پیشرفت کلی", value: "۶۵٪", icon: "📈", color: "#2196F3" },
//     { label: "یادداشت‌ها", value: 12, icon: "📝", color: "#9C27B0" },
//   ];

//   return (
//     <div className={styles.dashboardContent}>
//       <div className={styles.welcomeBanner}>
//         <div className={styles.welcomeText}>
//           <h2>سلام 👋</h2>
//           <p>خوش برگشتی! امروز چطور می‌تونی بهت کمک کنیم؟</p>
//         </div>
//         <div className={styles.welcomeImage}>🌱</div>
//       </div>

//       <div className={styles.statsGrid}>
//         {stats.map((stat, index) => (
//           <div key={index} className={styles.statCard}>
//             <div className={styles.statIcon} style={{ background: stat.color }}>
//               {stat.icon}
//             </div>
//             <div className={styles.statInfo}>
//               <span className={styles.statValue}>{stat.value}</span>
//               <span className={styles.statLabel}>{stat.label}</span>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className={styles.dashboardSections}>
//         <div className={styles.sectionCard}>
//           <h3>جلسه بعدی شما</h3>
//           <div className={styles.nextSession}>
//             <div className={styles.sessionDate}>
//               <span className={styles.dateDay}>جمعه</span>
//               <span className={styles.dateNumber}>۲۵</span>
//               <span className={styles.dateMonth}>آذر</span>
//             </div>
//             <div className={styles.sessionInfo}>
//               <h4>جلسه مشاوره فردی</h4>
//               <p>⏰ ۱۶:۰۰ - ۱۷:۰۰</p>
//               <p>👤 دکتر محمد رضایی</p>
//             </div>
//             <button className={styles.sessionBtn}>ورود به جلسه</button>
//           </div>
//         </div>

//         <div className={styles.sectionCard}>
//           <h3>فعالیت‌های اخیر</h3>
//           <div className={styles.activityList}>
//             <div className={styles.activityItem}>
//               <span className={styles.activityIcon}>📝</span>
//               <div className={styles.activityInfo}>
//                 <p>یادداشت جدید ثبت شد</p>
//                 <span>۲ ساعت پیش</span>
//               </div>
//             </div>
//             <div className={styles.activityItem}>
//               <span className={styles.activityIcon}>📅</span>
//               <div className={styles.activityInfo}>
//                 <p>جلسه با دکتر رضایی</p>
//                 <span>۳ روز پیش</span>
//               </div>
//             </div>
//             <div className={styles.activityItem}>
//               <span className={styles.activityIcon}>📚</span>
//               <div className={styles.activityInfo}>
//                 <p>مطالعه مقاله "مدیریت استرس"</p>
//                 <span>۵ روز پیش</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// ============================================
// COMPONENT: Dashboard Content
// ============================================
function DashboardContent({ userData }) {
  // آمارهای نمایشی
  // const stats = [
  //   { label: "جلسات برگزار شده", value: 8, icon: "📅", color: "#4CAF84" },
  //   { label: "جلسات پیش‌رو", value: 3, icon: "⏰", color: "#FF9800" },
  //   { label: "پیشرفت کلی", value: "۶۵٪", icon: "📈", color: "#2196F3" },
  //   { label: "یادداشت‌ها", value: 12, icon: "📝", color: "#9C27B0" },
  // ];

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
        {/* خوش‌آمدگویی */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeText}>
            <h2>سلام</h2>
            <p>خوش برگشتی! امروز چطور می‌تونیم بهت کمک کنیم؟</p>
          </div>
          {/* <div className={styles.welcomeImage}>🌱</div> */}
        </div>

        {/* آمار */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              {/* <div
                className={styles.statIcon}
                style={{ background: stat.color }}
              >
                {stat.icon}
              </div> */}
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* فعالیت‌های اخیر */}
        {/* <div className={styles.sectionCard}>
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
        </div> */}

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
      {/* <div className={styles.sideColumn}>
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
      </div> */}
    </div>
  );

  // return (
  //   <div className={styles.dashboardContent}>
  //     {/* خوش‌آمدگویی */}
  //     <div className={styles.welcomeBanner}>
  //       <div className={styles.welcomeText}>
  //         <h2>سلام 👋</h2>
  //         <p>خوش برگشتی! امروز چطور می‌تونی بهت کمک کنیم؟</p>
  //       </div>
  //       <div className={styles.welcomeImage}>🌱</div>
  //     </div>

  //     {/* آمار */}
  //     <div className={styles.statsGrid}>
  //       {stats.map((stat, index) => (
  //         <div key={index} className={styles.statCard}>
  //           <div className={styles.statIcon} style={{ background: stat.color }}>
  //             {stat.icon}
  //           </div>
  //           <div className={styles.statInfo}>
  //             <span className={styles.statValue}>{stat.value}</span>
  //             <span className={styles.statLabel}>{stat.label}</span>
  //           </div>
  //         </div>
  //       ))}
  //     </div>

  //     {/* بخش‌های دیگر */}
  //     <div className={styles.dashboardSections}>
  //       {/* جلسه بعدی */}
  //       <div className={styles.sectionCard}>
  //         <h3>جلسه بعدی شما</h3>
  //         <div className={styles.nextSession}>
  //           <div className={styles.sessionDate}>
  //             <span className={styles.dateDay}>جمعه</span>
  //             <span className={styles.dateNumber}>۲۵</span>
  //             <span className={styles.dateMonth}>آذر</span>
  //           </div>
  //           <div className={styles.sessionInfo}>
  //             <h4>جلسه مشاوره فردی</h4>
  //             <p>⏰ ۱۶:۰۰ - ۱۷:۰۰</p>
  //             <p>👤 دکتر محمد رضایی</p>
  //           </div>
  //           <button className={styles.sessionBtn}>ورود به جلسه</button>
  //         </div>
  //       </div>

  //       {/* فعالیت‌های اخیر */}
  //       <div className={styles.sectionCard}>
  //         <h3>فعالیت‌های اخیر</h3>
  //         <div className={styles.activityList}>
  //           <div className={styles.activityItem}>
  //             <span className={styles.activityIcon}>📝</span>
  //             <div className={styles.activityInfo}>
  //               <p>یادداشت جدید ثبت شد</p>
  //               <span>۲ ساعت پیش</span>
  //             </div>
  //           </div>
  //           <div className={styles.activityItem}>
  //             <span className={styles.activityIcon}>📅</span>
  //             <div className={styles.activityInfo}>
  //               <p>جلسه با دکتر رضایی</p>
  //               <span>۳ روز پیش</span>
  //             </div>
  //           </div>
  //           <div className={styles.activityItem}>
  //             <span className={styles.activityIcon}>📚</span>
  //             <div className={styles.activityInfo}>
  //               <p>مطالعه مقاله "مدیریت استرس"</p>
  //               <span>۵ روز پیش</span>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
}

// ============================================
// COMPONENT: Appointments Content
// ============================================
// function AppointmentsContent() {
//   return (
//     <div className={styles.pageContent}>
//       <h2>نوبت‌های من</h2>
//       <p>لیست نوبت‌های رزرو شده و درخواست‌های جدید</p>
//       <div className={styles.appointmentsList}>
//         <div className={styles.appointmentCard}>
//           <div className={styles.appointmentStatus}>تأیید شده</div>
//           <h4>جلسه مشاوره فردی</h4>
//           <p>📅 ۲۵ آذر ۱۴۰۳ - ۱۶:۰۰</p>
//           <p>👤 دکتر محمد رضایی</p>
//         </div>
//         <div className={styles.appointmentCard}>
//           <div className={styles.appointmentStatus}>در انتظار</div>
//           <h4>جلسه زوج درمانی</h4>
//           <p>📅 ۲۸ آذر ۱۴۰۳ - ۱۸:۰۰</p>
//           <p>👤 دکتر سارا احمدی</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// ============================================
// COMPONENT: Appointments Content
// ============================================
function AppointmentsContent() {
  const [activeFilter, setActiveFilter] = useState("all");

  const allAppointments = [
    {
      id: 1,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      date: "۲۵ آذر ۱۴۰۳",
      time: "۱۶:۰۰ - ۱۷:۰۰",
      status: "confirmed", // confirmed | pending | completed | cancelled
      isOnline: true,
    },
    {
      id: 2,
      type: "جلسه زوج درمانی",
      doctor: "دکتر سارا احمدی",
      date: "۲۸ آذر ۱۴۰۳",
      time: "۱۸:۰۰ - ۱۹:۰۰",
      status: "pending",
      isOnline: false,
    },
    {
      id: 3,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      date: "۲۰ آذر ۱۴۰۳",
      time: "۱۵:۰۰ - ۱۶:۰۰",
      status: "completed",
      isOnline: true,
    },
  ];

  // ===== فیلتر کردن =====
  const getFilteredAppointments = () => {
    if (activeFilter === "all") return allAppointments;
    return allAppointments.filter((item) => item.status === activeFilter);
  };

  const filteredAppointments = getFilteredAppointments();

  // ===== وضعیت‌ها =====
  const filters = [
    { id: "all", label: "همه" },
    { id: "confirmed", label: "تأیید شده" },
    { id: "pending", label: "در انتظار" },
    { id: "completed", label: "انجام شده" },
  ];

  const getStatusInfo = (status) => {
    const statusMap = {
      confirmed: {
        label: "تأیید شده",
        className: styles.statusConfirmed,
        // icon: "✅",
      },
      pending: {
        label: "در انتظار تأیید",
        className: styles.statusPending,
        // icon: "⏳",
      },
      completed: {
        label: "انجام شده",
        className: styles.statusCompleted,
        // icon: "✔️",
      },
      cancelled: {
        label: "لغو شده",
        className: styles.statusCancelled,
        // icon: "❌",
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>نوبت‌های من</h2>
          <p>لیست نوبت‌های رزرو شده و درخواست‌های جدید</p>
        </div>
        <button className={styles.newAppointmentBtn}>
          <span>+</span>
          درخواست نوبت جدید
        </button>
      </div>

      {/* فیلترها */}
      {/* <div className={styles.filterTabs}>
        <button className={`${styles.filterTab} ${styles.active}`}>همه</button>
        <button className={styles.filterTab}>تأیید شده</button>
        <button className={styles.filterTab}>در انتظار</button>
        <button className={styles.filterTab}>انجام شده</button>
      </div> */}

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
            {filter.id !== "all" && (
              <span className={styles.filterCount}>
                {
                  allAppointments.filter((item) => item.status === filter.id)
                    .length
                }
              </span>
            )}
          </button>
        ))}
      </div>

      {/* لیست نوبت‌ها */}
      <div className={styles.appointmentsList}>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => {
            // {filteredAppointments.map((appointment) => {
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
                </div>

                {/* محتوای اصلی */}
                <div className={styles.appointmentBody}>
                  <div className={styles.appointmentInfo}>
                    <h4>{appointment.type}</h4>
                    <div className={styles.appointmentMeta}>
                      <span className={styles.metaItem}>
                        <span className={styles.metaIcon}>👤</span>
                        {appointment.doctor}
                      </span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        <span className={styles.metaIcon}>📅</span>
                        {appointment.date}
                      </span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        <span className={styles.metaIcon}>⏰</span>
                        {appointment.time}
                      </span>
                    </div>
                  </div>

                  {/* دکمه‌های اکشن */}
                  <div className={styles.appointmentActions}>
                    {appointment.status === "confirmed" && (
                      <button className={styles.btnJoin}>
                        <span>▶</span>
                        ورود به جلسه
                      </button>
                    )}
                    {appointment.status === "pending" && (
                      <button className={styles.btnCancel}>لغو درخواست</button>
                    )}
                    {appointment.status === "completed" && (
                      <button className={styles.btnReview}>
                        📝 ثبت بازخورد
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
            <span className={styles.emptyIcon}>📭</span>
            <h3>هیچ نوبتی در این دسته وجود ندارد</h3>
            <p>برای شروع، اولین نوبت خود را رزرو کنید.</p>
          </div>
        )}
      </div>

      {/* کارت خالی (در صورت نبود نوبت) */}
      {allAppointments.length === 0 && (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📭</span>
          <h3>هیچ نوبتی ثبت نشده</h3>
          <p>برای شروع، اولین نوبت خود را رزرو کنید.</p>
          <button className={styles.emptyBtn}>درخواست نوبت جدید</button>
        </div>
      )}
    </div>
  );
}

// ============================================
// COMPONENT: Sessions Content
// ============================================
function SessionsContent() {
  return (
    <div className={styles.pageContent}>
      <h2>جلسات آنلاین</h2>
      <p>جلسات آینده و برگزار شده</p>
      <div className={styles.sessionsGrid}>
        <div className={styles.sessionCard}>
          <div className={styles.sessionTime}>۱۶:۰۰</div>
          <h4>جلسه فردی</h4>
          <p>با دکتر رضایی</p>
          <button className={styles.joinBtn}>اتصال</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Messages Content
// ============================================
function MessagesContent() {
  return (
    <div className={styles.pageContent}>
      <h2>پیام‌ها</h2>
      <p>پیام‌های شما با دکترها</p>
      <div className={styles.messagesList}>
        <div className={styles.messageCard}>
          <img src={userAvatar} alt="" className={styles.messageAvatar} />
          <div className={styles.messageInfo}>
            <h4>دکتر محمد رضایی</h4>
            <p>سلام! جلسه فردا ساعت ۱۶ هست...</p>
            <span>۱۰ دقیقه پیش</span>
          </div>
          <span className={styles.messageBadge}>۲</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Progress Content
// ============================================
function ProgressContent() {
  return (
    <div className={styles.pageContent}>
      <h2>پیشرفت من</h2>
      <p>مسیر درمانی و پیشرفت شما</p>
      <div className={styles.progressStats}>
        <div className={styles.progressCircle}>
          <svg viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#e8e0d8"
              strokeWidth="12"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#4CAF84"
              strokeWidth="12"
              strokeDasharray={339.292}
              strokeDashoffset={118.752}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <span className={styles.progressPercent}>۶۵٪</span>
        </div>
        <div className={styles.progressDetails}>
          <div className={styles.progressItem}>
            <span>جلسات انجام شده</span>
            <span>۸ از ۱۲</span>
          </div>
          <div className={styles.progressItem}>
            <span>وضعیت</span>
            <span>در مسیر</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Resources Content
// ============================================
function ResourcesContent() {
  return (
    <div className={styles.pageContent}>
      <h2>منابع آموزشی</h2>
      <p>مقالات، ویدئوها و تمرین‌های مفید</p>
      <div className={styles.resourcesGrid}>
        <div className={styles.resourceCard}>
          <span className={styles.resourceIcon}>📚</span>
          <h4>مدیریت استرس</h4>
          <p>۵ تمرین عملی</p>
        </div>
        <div className={styles.resourceCard}>
          <span className={styles.resourceIcon}>🧘</span>
          <h4>مدیتیشن ذهن‌آگاهی</h4>
          <p>۳ جلسه صوتی</p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Journal Content
// ============================================
function JournalContent() {
  return (
    <div className={styles.pageContent}>
      <h2>یادداشت‌ها</h2>
      <p>یادداشت‌های روزانه و تمرینات</p>
      <button className={styles.newJournalBtn}>+ یادداشت جدید</button>
      <div className={styles.journalList}>
        <div className={styles.journalCard}>
          <h4>احساسات امروز</h4>
          <p>امروز احساس بهتری داشتم...</p>
          <span>۲ روز پیش</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Profile Content
// ============================================
function ProfileContent({ userData }) {
  return (
    <div className={styles.pageContent}>
      <h2>پروفایل</h2>
      <p>اطلاعات شخصی شما</p>
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          <img src={userAvatar} alt="" />
        </div>
        <div className={styles.profileInfo}>
          <h3>{userData?.phone || "کاربر"}</h3>
          <p>شماره: ۰{userData?.phone || "۹۱۲۳۴۵۶۷۸۹"}</p>
          <p>تاریخ عضویت: آذر ۱۴۰۳</p>
          <button className={styles.editBtn}>ویرایش پروفایل</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Settings Content
// ============================================
function SettingsContent() {
  return (
    <div className={styles.pageContent}>
      <h2>تنظیمات</h2>
      <p>تنظیمات حساب کاربری و اعلان‌ها</p>
      <div className={styles.settingsList}>
        <div className={styles.settingItem}>
          <span>🔔 اعلان‌ها</span>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.switchSlider}></span>
          </label>
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

export default PatientDashboard;

// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import styles from "./PatientDashboard.module.css";

// const mockSessions = [
//   {
//     id: 1,
//     date: "۱۴۰۵/۰۴/۲۰",
//     time: "۱۰:۰۰",
//     status: "completed",
//     doctorNote: "جلسه خوبی بود. تمرینات تنفسی برای مدیریت استرس تجویز شد.",
//   },
//   {
//     id: 2,
//     date: "۱۴۰۵/۰۵/۰۵",
//     time: "۱۱:۳۰",
//     status: "scheduled",
//     doctorNote: "جلسه بعدی - ادامه درمان",
//   },
//   {
//     id: 3,
//     date: "۱۴۰۵/۰۵/۲۰",
//     time: "۱۴:۰۰",
//     status: "pending",
//     doctorNote: "در انتظار تایید",
//   },
// ];

// const availableTimes = ["۹:۰۰", "۱۰:۰۰", "۱۱:۰۰", "۱۴:۰۰", "۱۵:۰۰", "۱۶:۰۰"];

// function PatientPanel({ user, onLogout }) {
//   const [activeTab, setActiveTab] = useState("history"); // 'history' | 'book'
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     onLogout();
//     navigate("/");
//   };

//   const handleBookSession = () => {
//     if (!selectedDate || !selectedTime) {
//       alert("لطفاً تاریخ و ساعت را انتخاب کنید");
//       return;
//     }
//     alert(`جلسه برای تاریخ ${selectedDate} ساعت ${selectedTime} رزرو شد!`);
//     setSelectedDate("");
//     setSelectedTime("");
//   };

//   return (
//     <div className={styles.panelContainer}>
//       {/* ===== HEADER ===== */}
//       <header className={styles.panelHeader}>
//         <div className={styles.headerContent}>
//           <div className={styles.userInfo}>
//             <span className={styles.userAvatar}>👤</span>
//             <div>
//               <h2>{user?.name || "کاربر"}</h2>
//               <p>📱 {user?.phone}</p>
//             </div>
//           </div>
//           <div className={styles.headerActions}>
//             <button className={styles.notifBtn}>
//               🔔 <span className={styles.notifBadge}>۳</span>
//             </button>
//             <button className={styles.logoutBtn} onClick={handleLogout}>
//               خروج
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* ===== TABS ===== */}
//       <div className={styles.tabsContainer}>
//         <button
//           className={`${styles.tabBtn} ${
//             activeTab === "history" ? styles.active : ""
//           }`}
//           onClick={() => setActiveTab("history")}
//         >
//           📋 تاریخچه جلسات
//         </button>
//         <button
//           className={`${styles.tabBtn} ${
//             activeTab === "book" ? styles.active : ""
//           }`}
//           onClick={() => setActiveTab("book")}
//         >
//           📅 رزرو جلسه جدید
//         </button>
//       </div>

//       {/* ===== CONTENT ===== */}
//       <div className={styles.panelContent}>
//         {activeTab === "history" ? (
//           <div className={styles.historySection}>
//             <h3>تاریخچه جلسات</h3>
//             <div className={styles.sessionsList}>
//               {mockSessions.map((session) => (
//                 <div key={session.id} className={styles.sessionCard}>
//                   <div className={styles.sessionHeader}>
//                     <div className={styles.sessionDate}>
//                       <span>📅 {session.date}</span>
//                       <span>⏰ {session.time}</span>
//                     </div>
//                     <span
//                       className={`${styles.sessionStatus} ${
//                         styles[session.status]
//                       }`}
//                     >
//                       {session.status === "completed" && "✅ برگزار شده"}
//                       {session.status === "scheduled" && "⏳ برنامه‌ریزی شده"}
//                       {session.status === "pending" && "⌛ در انتظار تایید"}
//                     </span>
//                   </div>
//                   {session.doctorNote && (
//                     <div className={styles.doctorNote}>
//                       <span>👩‍⚕️ یادداشت دکتر:</span>
//                       <p>{session.doctorNote}</p>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className={styles.bookSection}>
//             <h3>رزرو جلسه جدید</h3>
//             <div className={styles.bookForm}>
//               <div className={styles.formGroup}>
//                 <label>📅 تاریخ جلسه</label>
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className={styles.input}
//                   min={new Date().toISOString().split("T")[0]}
//                 />
//               </div>

//               <div className={styles.formGroup}>
//                 <label>⏰ ساعت جلسه</label>
//                 <div className={styles.timeGrid}>
//                   {availableTimes.map((time) => (
//                     <button
//                       key={time}
//                       className={`${styles.timeBtn} ${
//                         selectedTime === time ? styles.selected : ""
//                       }`}
//                       onClick={() => setSelectedTime(time)}
//                     >
//                       {time}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <button className={styles.bookBtn} onClick={handleBookSession}>
//                 📅 رزرو جلسه
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ===== REMINDER ===== */}
//       <div className={styles.reminder}>
//         <div className={styles.reminderIcon}>🔔</div>
//         <div className={styles.reminderText}>
//           <h4>یادآوری</h4>
//           <p>جلسه بعدی شما در تاریخ ۱۴۰۵/۰۵/۰۵ ساعت ۱۱:۳۰ است</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default PatientPanel;
