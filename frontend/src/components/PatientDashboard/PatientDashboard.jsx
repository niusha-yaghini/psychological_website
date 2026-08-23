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
// function AppointmentsContent() {
//   const [activeFilter, setActiveFilter] = useState("all");

//   const allAppointments = [
//     {
//       id: 1,
//       type: "جلسه مشاوره فردی",
//       doctor: "دکتر محمد رضایی",
//       date: "۲۵ آذر ۱۴۰۳",
//       time: "۱۶:۰۰ - ۱۷:۰۰",
//       status: "confirmed", // confirmed | pending | completed | cancelled
//       isOnline: true,
//     },
//     {
//       id: 2,
//       type: "جلسه زوج درمانی",
//       doctor: "دکتر سارا احمدی",
//       date: "۲۸ آذر ۱۴۰۳",
//       time: "۱۸:۰۰ - ۱۹:۰۰",
//       status: "pending",
//       isOnline: false,
//     },
//     {
//       id: 3,
//       type: "جلسه مشاوره فردی",
//       doctor: "دکتر محمد رضایی",
//       date: "۲۰ آذر ۱۴۰۳",
//       time: "۱۵:۰۰ - ۱۶:۰۰",
//       status: "completed",
//       isOnline: true,
//     },
//   ];

//   // ===== فیلتر کردن =====
//   const getFilteredAppointments = () => {
//     if (activeFilter === "all") return allAppointments;
//     return allAppointments.filter((item) => item.status === activeFilter);
//   };

//   const filteredAppointments = getFilteredAppointments();

//   // ===== وضعیت‌ها =====
//   const filters = [
//     { id: "all", label: "همه" },
//     { id: "confirmed", label: "تأیید شده" },
//     { id: "pending", label: "در انتظار" },
//     { id: "completed", label: "انجام شده" },
//   ];

//   const getStatusInfo = (status) => {
//     const statusMap = {
//       confirmed: {
//         label: "تأیید شده",
//         className: styles.statusConfirmed,
//         // icon: "✅",
//       },
//       pending: {
//         label: "در انتظار تأیید",
//         className: styles.statusPending,
//         // icon: "⏳",
//       },
//       completed: {
//         label: "انجام شده",
//         className: styles.statusCompleted,
//         // icon: "✔️",
//       },
//       cancelled: {
//         label: "لغو شده",
//         className: styles.statusCancelled,
//         // icon: "❌",
//       },
//     };
//     return statusMap[status] || statusMap.pending;
//   };

//   return (
//     <div className={styles.pageContent}>
//       {/* هدر بخش */}
//       <div className={styles.pageHeader}>
//         <div className={styles.headerInfo}>
//           <h2>نوبت‌های من</h2>
//           <p>لیست نوبت‌های رزرو شده و درخواست‌های جدید</p>
//         </div>
//         <button className={styles.newAppointmentBtn}>
//           <span>+</span>
//           درخواست نوبت جدید
//         </button>
//       </div>

//       {/* فیلترها */}
//       {/* <div className={styles.filterTabs}>
//         <button className={`${styles.filterTab} ${styles.active}`}>همه</button>
//         <button className={styles.filterTab}>تأیید شده</button>
//         <button className={styles.filterTab}>در انتظار</button>
//         <button className={styles.filterTab}>انجام شده</button>
//       </div> */}

//       {/* فیلترها */}
//       <div className={styles.filterTabs}>
//         {filters.map((filter) => (
//           <button
//             key={filter.id}
//             className={`${styles.filterTab} ${
//               activeFilter === filter.id ? styles.active : ""
//             }`}
//             onClick={() => setActiveFilter(filter.id)}
//           >
//             {filter.label}
//             {filter.id !== "all" && (
//               <span className={styles.filterCount}>
//                 {
//                   allAppointments.filter((item) => item.status === filter.id)
//                     .length
//                 }
//               </span>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* لیست نوبت‌ها */}
//       <div className={styles.appointmentsList}>
//         {filteredAppointments.length > 0 ? (
//           filteredAppointments.map((appointment) => {
//             // {filteredAppointments.map((appointment) => {
//             const statusInfo = getStatusInfo(appointment.status);
//             return (
//               <div key={appointment.id} className={styles.appointmentCard}>
//                 {/* وضعیت */}
//                 <div className={styles.appointmentStatusBar}>
//                   <span
//                     className={`${styles.statusBadge} ${statusInfo.className}`}
//                   >
//                     <span className={styles.statusIcon}>{statusInfo.icon}</span>
//                     {statusInfo.label}
//                   </span>
//                   {appointment.isOnline && (
//                     <span className={styles.onlineBadge}>🖥️ آنلاین</span>
//                   )}
//                 </div>

//                 {/* محتوای اصلی */}
//                 <div className={styles.appointmentBody}>
//                   <div className={styles.appointmentInfo}>
//                     <h4>{appointment.type}</h4>
//                     <div className={styles.appointmentMeta}>
//                       <span className={styles.metaItem}>
//                         <span className={styles.metaIcon}>👤</span>
//                         {appointment.doctor}
//                       </span>
//                       <span className={styles.metaDivider}>•</span>
//                       <span className={styles.metaItem}>
//                         <span className={styles.metaIcon}>📅</span>
//                         {appointment.date}
//                       </span>
//                       <span className={styles.metaDivider}>•</span>
//                       <span className={styles.metaItem}>
//                         <span className={styles.metaIcon}>⏰</span>
//                         {appointment.time}
//                       </span>
//                     </div>
//                   </div>

//                   {/* دکمه‌های اکشن */}
//                   <div className={styles.appointmentActions}>
//                     {appointment.status === "confirmed" && (
//                       <button className={styles.btnJoin}>
//                         <span>▶</span>
//                         ورود به جلسه
//                       </button>
//                     )}
//                     {appointment.status === "pending" && (
//                       <button className={styles.btnCancel}>لغو درخواست</button>
//                     )}
//                     {appointment.status === "completed" && (
//                       <button className={styles.btnReview}>
//                         📝 ثبت بازخورد
//                       </button>
//                     )}
//                     <button className={styles.btnMore}>
//                       <svg
//                         width="20"
//                         height="20"
//                         viewBox="0 0 24 24"
//                         fill="none"
//                       >
//                         <circle cx="12" cy="6" r="2" fill="currentColor" />
//                         <circle cx="12" cy="12" r="2" fill="currentColor" />
//                         <circle cx="12" cy="18" r="2" fill="currentColor" />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className={styles.emptyState}>
//             <span className={styles.emptyIcon}>📭</span>
//             <h3>هیچ نوبتی در این دسته وجود ندارد</h3>
//             <p>برای شروع، اولین نوبت خود را رزرو کنید.</p>
//           </div>
//         )}
//       </div>

//       {/* کارت خالی (در صورت نبود نوبت) */}
//       {allAppointments.length === 0 && (
//         <div className={styles.emptyState}>
//           <span className={styles.emptyIcon}>📭</span>
//           <h3>هیچ نوبتی ثبت نشده</h3>
//           <p>برای شروع، اولین نوبت خود را رزرو کنید.</p>
//           <button className={styles.emptyBtn}>درخواست نوبت جدید</button>
//         </div>
//       )}
//     </div>
//   );
// }

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
      alert("❌ امکان لغو نوبت کمتر از ۲۴ ساعت قبل وجود ندارد.");
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

    alert("✅ نوبت با موفقیت لغو شد.");
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
    alert("✅ درخواست نوبت با موفقیت ثبت شد.");
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
        icon: "✅",
      },
      pending: {
        label: "در انتظار تأیید",
        className: styles.statusPending,
        icon: "⏳",
      },
      completed: {
        label: "انجام شده",
        className: styles.statusCompleted,
        icon: "✔️",
      },
      cancelled: {
        label: "لغو شده",
        className: styles.statusCancelled,
        icon: "❌",
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
          <h2>📅 نوبت‌های من</h2>
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

                    {/* نمایش دلیل لغو */}
                    {appointment.status === "cancelled" &&
                      appointment.cancelReason && (
                        <div className={styles.cancelReason}>
                          <span>📌 دلیل لغو:</span>
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
                          ⏳ در انتظار تأیید
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
                      <button className={styles.btnReview}>
                        📝 ثبت بازخورد
                      </button>
                    )}

                    {appointment.status === "cancelled" && (
                      <button
                        className={styles.btnReschedule}
                        onClick={() => {
                          // باز کردن مودال برای رزرو مجدد با همان دکتر
                          setShowModal(true);
                        }}
                      >
                        🔄 رزرو مجدد
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
// function SessionsContent() {
//   return (
//     <div className={styles.pageContent}>
//       <h2>جلسات آنلاین</h2>
//       <p>جلسات آینده و برگزار شده</p>
//       <div className={styles.sessionsGrid}>
//         <div className={styles.sessionCard}>
//           <div className={styles.sessionTime}>۱۶:۰۰</div>
//           <h4>جلسه فردی</h4>
//           <p>با دکتر رضایی</p>
//           <button className={styles.joinBtn}>اتصال</button>
//         </div>
//       </div>
//     </div>
//   );
// }

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
        icon: "⏳",
      },
      ongoing: {
        label: "در حال برگزاری",
        className: styles.sessionOngoing,
        icon: "🔴",
      },
      completed: {
        label: "انجام شده",
        className: styles.sessionCompleted,
        icon: "✅",
      },
      cancelled: {
        label: "لغو شده",
        className: styles.sessionCancelled,
        icon: "❌",
      },
    };
    return statusMap[status] || statusMap.upcoming;
  };

  // ===== دریافت آیکون نوع جلسه =====
  const getTypeIcon = (type) => {
    const typeMap = {
      individual: "🧑‍⚕️",
      couple: "💑",
      teen: "🧒",
      family: "👨‍👩‍👧‍👦",
    };
    return typeMap[type] || "🧑‍⚕️";
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
            // به‌روزرسانی وضعیت به ongoing
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
                      <span className={styles.sessionType}>
                        {getTypeIcon(session.type)} {session.title}
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
                      <span className={styles.metaIcon}>📅</span>
                      <span>{session.date}</span>
                    </div>
                    <div className={styles.metaGroup}>
                      <span className={styles.metaIcon}>⏰</span>
                      <span>
                        {session.time} - {session.duration}
                      </span>
                    </div>
                    <div className={styles.metaGroup}>
                      <span className={styles.metaIcon}>🔗</span>
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
                        📹 مشاهده ضبط جلسه
                      </button>
                      <button className={styles.btnFeedback}>
                        📝 ثبت بازخورد
                      </button>
                    </>
                  )}
                  {session.status === "cancelled" && (
                    <button className={styles.btnRescheduleSession}>
                      🔄 رزرو مجدد
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
              <span className={styles.nextSessionLabel}>⏰ جلسه بعدی شما</span>
              <h3>{sessions.find((s) => s.status === "upcoming")?.title}</h3>
              <p>با {sessions.find((s) => s.status === "upcoming")?.doctor}</p>
              <div className={styles.nextSessionTime}>
                <span>
                  📅 {sessions.find((s) => s.status === "upcoming")?.date}
                </span>
                <span>
                  ⏰ {sessions.find((s) => s.status === "upcoming")?.time}
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
