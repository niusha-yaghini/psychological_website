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

// import logo from "../../../public/images/logo/logo2.png";
import logo from "../../../public/images/logo/logo2.png";
import doctorAvatar from "../../../public/images/Patient_Panel/usericon.png";

// ===== کامپوننت‌های بخش‌ها =====
// function DashboardOverview() {
//   const [pendingSessions, setPendingSessions] = useState([
//     {
//       id: 1,
//       patient: "محمد کریمی",
//       date: "امروز",
//       time: "۱۰:۰۰",
//       status: "pending",
//       type: "individual",
//     },
//     {
//       id: 2,
//       patient: "زهرا احمدی",
//       date: "امروز",
//       time: "۱۱:۳۰",
//       status: "pending",
//       type: "couple",
//     },
//     {
//       id: 3,
//       patient: "علی رضایی",
//       date: "امروز",
//       time: "۱۴:۰۰",
//       status: "pending",
//       type: "individual",
//     },
//     {
//       id: 4,
//       patient: "سارا محمدی",
//       date: "امروز",
//       time: "۱۶:۰۰",
//       status: "pending",
//       type: "teen",
//     },
//     {
//       id: 5,
//       patient: "رضا حسینی",
//       date: "فردا",
//       time: "۱۰:۳۰",
//       status: "pending",
//       type: "individual",
//     },
//     {
//       id: 6,
//       patient: "نگار موسوی",
//       date: "پس‌فردا",
//       time: "۱۲:۰۰",
//       status: "pending",
//       type: "couple",
//     },
//   ]);

//   // ===== جلسات تأیید شده (برای نمایش در بخش دیگه) =====
//   const [confirmedSessions, setConfirmedSessions] = useState([
//     {
//       id: 7,
//       patient: "زهرا احمدی",
//       date: "امروز",
//       time: "۱۱:۳۰",
//       status: "confirmed",
//       type: "couple",
//     },
//   ]);

//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [selectedSession, setSelectedSession] = useState(null);

//   // ===== تابع تأیید جلسه =====
//   const handleConfirmSession = (session) => {
//     setSelectedSession(session);
//     setShowConfirmModal(true);
//   };

//   // ===== تأیید نهایی =====
//   const confirmAppointment = () => {
//     if (!selectedSession) return;

//     // حذف از لیست در انتظار
//     setPendingSessions((prev) =>
//       prev.filter((s) => s.id !== selectedSession.id),
//     );

//     // اضافه به لیست تأیید شده‌ها
//     setConfirmedSessions((prev) => [
//       ...prev,
//       {
//         ...selectedSession,
//         status: "confirmed",
//       },
//     ]);

//     setShowConfirmModal(false);
//     setSelectedSession(null);
//     alert(`✅ جلسه ${selectedSession.patient} با موفقیت تأیید شد.`);
//   };

//   // ===== رد جلسه =====
//   const handleRejectSession = (session) => {
//     if (window.confirm(`❌ آیا از رد جلسه ${session.patient} اطمینان دارید؟`)) {
//       setPendingSessions((prev) => prev.filter((s) => s.id !== session.id));
//       alert(`❌ جلسه ${session.patient} رد شد.`);
//     }
//   };

//   const stats = [
//     { label: "بیماران فعال", value: 12, icon: "👤", color: "#4CAF84" },
//     { label: "جلسات امروز", value: 4, icon: "📅", color: "#2196F3" },
//     {
//       label: "نوبت‌های در انتظار",
//       value: pendingSessions.length,
//       icon: "⏳",
//       color: "#FF9800",
//     },
//     { label: "تمارین ارسال شده", value: 18, icon: "📝", color: "#9C27B0" },
//   ];

//   // جلسات امروز (تأیید شده)
//   const todaySessions = confirmedSessions.filter(
//     (session) => session.date === "امروز",
//   );

//   return (
//     <div className={styles.dashboardContent}>
//       {/* ===== ستون راست ===== */}
//       <div className={styles.mainColumn}>
//         {/* خوش‌آمدگویی */}
//         <div className={styles.welcomeBanner}>
//           <div className={styles.welcomeText}>
//             <h2>سلام دکتر 👋</h2>
//             <p>امروز {todaySessions.length} جلسه برنامه‌ریزی شده دارید.</p>
//           </div>
//           <div className={styles.welcomeImage}>🩺</div>
//         </div>

//         {/* آمار */}
//         <div className={styles.statsGrid}>
//           {stats.map((stat, index) => (
//             <div key={index} className={styles.statCard}>
//               <div
//                 className={styles.statIcon}
//                 style={{ background: stat.color }}
//               >
//                 {stat.icon}
//               </div>
//               <div className={styles.statInfo}>
//                 <span className={styles.statValue}>{stat.value}</span>
//                 <span className={styles.statLabel}>{stat.label}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* جلسات امروز (تأیید شده) */}
//         <div className={styles.sectionCard}>
//           <div className={styles.sectionHeader}>
//             <h3>📋 جلسات امروز</h3>
//             <span className={styles.sectionCount}>{todaySessions.length}</span>
//           </div>

//           <div className={styles.todaySessions}>
//             {todaySessions.length > 0 ? (
//               todaySessions.map((session) => (
//                 <div key={session.id} className={styles.sessionRow}>
//                   <span className={styles.sessionTime}>{session.time}</span>
//                   <span className={styles.sessionPatient}>
//                     {session.patient}
//                   </span>
//                   <span
//                     className={`${styles.sessionStatus} ${styles[session.status]}`}
//                   >
//                     {session.status === "confirmed" && "✅ تأیید شده"}
//                   </span>
//                   <button className={styles.sessionAction}>ورود به جلسه</button>
//                 </div>
//               ))
//             ) : (
//               <div className={styles.emptyState}>
//                 هیچ جلسه‌ای برای امروز وجود ندارد.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ===== ستون چپ: جلسات در انتظار تأیید ===== */}
//       <div className={styles.pendingColumn}>
//         <div className={styles.sectionCard}>
//           <div className={styles.sectionHeader}>
//             <div>
//               <h3>⏳ در انتظار تأیید</h3>
//               <p className={styles.sectionDescription}>درخواست‌های جدید نوبت</p>
//             </div>
//             <span className={styles.sectionCount}>
//               {pendingSessions.length}
//             </span>
//           </div>

//           <div className={styles.pendingSessions}>
//             {pendingSessions.length === 0 ? (
//               <div className={styles.emptyState}>
//                 <span className={styles.emptyIcon}>✅</span>
//                 <p>همه جلسات تأیید شده‌اند.</p>
//               </div>
//             ) : (
//               pendingSessions.map((session) => (
//                 <div key={session.id} className={styles.pendingSessionCard}>
//                   <div className={styles.pendingSessionTop}>
//                     <span className={styles.sessionPatient}>
//                       {session.patient}
//                     </span>
//                     <span className={styles.sessionType}>
//                       {session.type === "individual" && "🧑‍⚕️ فردی"}
//                       {session.type === "couple" && "💑 زوج"}
//                       {session.type === "teen" && "🧒 نوجوان"}
//                     </span>
//                   </div>

//                   <div className={styles.pendingSessionBottom}>
//                     <div className={styles.sessionDateTime}>
//                       <span>📅 {session.date}</span>
//                       <span className={styles.dateDivider}>•</span>
//                       <span>⏰ {session.time}</span>
//                     </div>

//                     <div className={styles.pendingActions}>
//                       <button
//                         className={styles.btnConfirm}
//                         onClick={() => handleConfirmSession(session)}
//                       >
//                         ✅ تأیید
//                       </button>
//                       <button
//                         className={styles.btnReject}
//                         onClick={() => handleRejectSession(session)}
//                       >
//                         ❌ رد
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ===== مودال تأیید ===== */}
//       {showConfirmModal && selectedSession && (
//         <div className={styles.modalOverlay}>
//           <div className={styles.confirmModal}>
//             <div className={styles.modalHeader}>
//               <h3>✅ تأیید جلسه</h3>
//               <button
//                 className={styles.modalClose}
//                 onClick={() => {
//                   setShowConfirmModal(false);
//                   setSelectedSession(null);
//                 }}
//               >
//                 ✕
//               </button>
//             </div>

//             <div className={styles.modalBody}>
//               <p className={styles.confirmText}>
//                 آیا از تأیید جلسه برای
//                 <strong> {selectedSession.patient} </strong>
//                 اطمینان دارید؟
//               </p>

//               <div className={styles.confirmDetails}>
//                 <div className={styles.confirmRow}>
//                   <span>📅 تاریخ:</span>
//                   <span>{selectedSession.date}</span>
//                 </div>
//                 <div className={styles.confirmRow}>
//                   <span>⏰ ساعت:</span>
//                   <span>{selectedSession.time}</span>
//                 </div>
//                 <div className={styles.confirmRow}>
//                   <span>🧑‍⚕️ نوع جلسه:</span>
//                   <span>
//                     {selectedSession.type === "individual" && "فردی"}
//                     {selectedSession.type === "couple" && "زوج"}
//                     {selectedSession.type === "teen" && "نوجوان"}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className={styles.modalFooter}>
//               <button
//                 className={styles.btnCancelModal}
//                 onClick={() => {
//                   setShowConfirmModal(false);
//                   setSelectedSession(null);
//                 }}
//               >
//                 انصراف
//               </button>
//               <button
//                 className={styles.btnConfirmModal}
//                 onClick={confirmAppointment}
//               >
//                 ✅ تأیید نهایی
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

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
    { label: "بیماران فعال", value: 12, icon: "👤", color: "#4CAF84" },
    { label: "جلسات امروز", value: 4, icon: "📅", color: "#2196F3" },
    {
      label: "نوبت‌های در انتظار",
      value: pendingSessions.length,
      icon: "⏳",
      color: "#FF9800",
    },
    { label: "تمارین ارسال شده", value: 18, icon: "📝", color: "#9C27B0" },
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

// function DashboardOverview() {
//   const stats = [
//     { label: "بیماران فعال", value: 12, icon: "👤", color: "#4CAF84" },
//     { label: "جلسات امروز", value: 4, icon: "📅", color: "#2196F3" },
//     { label: "نوبت‌های در انتظار", value: 3, icon: "⏳", color: "#FF9800" },
//     { label: "تمارین ارسال شده", value: 18, icon: "📝", color: "#9C27B0" },
//   ];

//   // کل جلسات
//   const sessions = [
//     {
//       id: 1,
//       patient: "محمد کریمی",
//       date: "امروز",
//       time: "۱۰:۰۰",
//       status: "pending",
//       type: "individual",
//     },
//     {
//       id: 2,
//       patient: "زهرا احمدی",
//       date: "امروز",
//       time: "۱۱:۳۰",
//       status: "confirmed",
//       type: "couple",
//     },
//     {
//       id: 3,
//       patient: "علی رضایی",
//       date: "امروز",
//       time: "۱۴:۰۰",
//       status: "completed",
//       type: "individual",
//     },
//     {
//       id: 4,
//       patient: "سارا محمدی",
//       date: "امروز",
//       time: "۱۶:۰۰",
//       status: "pending",
//       type: "teen",
//     },
//     {
//       id: 5,
//       patient: "رضا حسینی",
//       date: "فردا",
//       time: "۱۰:۳۰",
//       status: "pending",
//       type: "individual",
//     },
//     {
//       id: 6,
//       patient: "نگار موسوی",
//       date: "پس‌فردا",
//       time: "۱۲:۰۰",
//       status: "pending",
//       type: "couple",
//     },
//   ];

//   // جلسات امروز
//   const todaySessions = sessions.filter((session) => session.date === "امروز");

//   // تمام جلسات در انتظار
//   // هم امروز و هم روزهای آینده
//   const pendingSessions = sessions.filter(
//     (session) => session.status === "pending",
//   );

//   return (
//     <div className={styles.dashboardContent}>
//       {/* لایه اصلی دو ستونه */}
//       {/* <div className={styles.dashboardGrid}> */}

//       {/* =================================
//             ستون راست: داشبورد اصلی
//         ================================= */}
//       <div className={styles.mainColumn}>
//         {/* خوش‌آمدگویی */}
//         <div className={styles.welcomeBanner}>
//           <div className={styles.welcomeText}>
//             <h2>سلام دکتر</h2>
//             <p>امروز {todaySessions.length} جلسه برنامه‌ریزی شده دارید.</p>
//           </div>
//         </div>

//         {/* آمار */}
//         <div className={styles.statsGrid}>
//           {stats.map((stat, index) => (
//             <div key={index} className={styles.statCard}>
//               <div
//                 className={styles.statIcon}
//                 style={{
//                   background: stat.color,
//                 }}
//               >
//                 {stat.icon}
//               </div>

//               <div className={styles.statInfo}>
//                 <span className={styles.statValue}>{stat.value}</span>
//                 <span className={styles.statLabel}>{stat.label}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* جلسات امروز */}
//         <div className={styles.sectionCard}>
//           <div className={styles.sectionHeader}>
//             <h3>جلسات امروز</h3>

//             <span className={styles.sectionCount}>{todaySessions.length}</span>
//           </div>

//           <div className={styles.todaySessions}>
//             {todaySessions.map((session) => (
//               <div key={session.id} className={styles.sessionRow}>
//                 <span className={styles.sessionTime}>{session.time}</span>

//                 <span className={styles.sessionPatient}>{session.patient}</span>

//                 <span
//                   className={`${styles.sessionStatus} ${
//                     styles[session.status]
//                   }`}
//                 >
//                   {session.status === "pending" && "در انتظار"}
//                   {session.status === "confirmed" && "تأیید شده"}
//                   {session.status === "completed" && "انجام شده"}
//                 </span>

//                 <button className={styles.sessionAction}>
//                   {session.status === "pending" && "شروع جلسه"}
//                   {session.status === "confirmed" && "آماده"}
//                   {session.status === "completed" && "مشاهده"}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* =================================
//             ستون چپ: جلسات در انتظار
//         ================================= */}
//       <div className={styles.pendingColumn}>
//         <div className={styles.sectionCard}>
//           <div className={styles.sectionHeader}>
//             <div>
//               <h3>جلسات در انتظار</h3>
//               <p className={styles.sectionDescription}>جلسات امروز و آینده</p>
//             </div>

//             <span className={styles.sectionCount}>
//               {pendingSessions.length}
//             </span>
//           </div>

//           <div className={styles.pendingSessions}>
//             {pendingSessions.length === 0 ? (
//               <div className={styles.emptyState}>جلسه‌ای در انتظار نیست.</div>
//             ) : (
//               pendingSessions.map((session) => (
//                 <div key={session.id} className={styles.pendingSessionCard}>
//                   <div className={styles.pendingSessionTop}>
//                     <span className={styles.sessionPatient}>
//                       {session.patient}
//                     </span>

//                     <span className={styles.sessionType}>
//                       {session.type === "individual" && "فردی"}
//                       {session.type === "couple" && "زوج"}
//                       {session.type === "teen" && "نوجوان"}
//                     </span>
//                   </div>

//                   <div className={styles.pendingSessionBottom}>
//                     <div className={styles.sessionDateTime}>
//                       <span>{session.date}</span>
//                       <span>•</span>
//                       <span>{session.time}</span>
//                     </div>

//                     <button className={styles.sessionAction}>
//                       {session.date === "امروز" ? "شروع جلسه" : "مشاهده"}
//                     </button>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//       {/* </div> */}
//     </div>
//   );
// }

// ===== کامپوننت اصلی =====

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
      badge: 12,
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
      label: "پیام‌ها",
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

            {/* پروفایل کاربر */}
            {/* <div className={styles.userProfile}>
              <img
                src={doctorAvatar}
                alt="پروفایل"
                className={styles.userAvatar}
              />
              {!isCollapsed && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {userData?.phone || "دکتر"}
                  </span>
                  <span className={styles.userRole}>روانشناس</span>
                </div>
              )}
            </div> */}
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

  const appointments = [
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
  ];

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
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>📋 مدیریت نوبت‌ها</h2>
          <p>لیست درخواست‌های نوبت و مدیریت آنها</p>
        </div>
        <button className={styles.newBtn}>
          <FaPlus /> تنظیم زمان‌بندی
        </button>
      </div>

      <div className={styles.filterTabs}>
        {["all", "pending", "confirmed", "completed"].map((filter) => (
          <button
            key={filter}
            className={`${styles.filterTab} ${activeFilter === filter ? styles.active : ""}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter === "all" && "همه"}
            {filter === "pending" && "در انتظار"}
            {filter === "confirmed" && "تأیید شده"}
            {filter === "completed" && "انجام شده"}
          </button>
        ))}
      </div>

      <div className={styles.appointmentsList}>
        {appointments.map((app) => {
          const status = getStatusInfo(app.status);
          return (
            <div key={app.id} className={styles.appointmentCard}>
              <div className={styles.appointmentInfo}>
                <h4>{app.patient}</h4>
                <p>
                  {app.type} • {app.date} • {app.time}
                </p>
              </div>
              <span className={`${styles.statusBadge} ${status.className}`}>
                {status.label}
              </span>
              <div className={styles.appointmentActions}>
                {app.status === "pending" && (
                  <>
                    <button className={styles.btnApprove}>تأیید</button>
                    <button className={styles.btnReject}>رد</button>
                  </>
                )}
                {app.status === "confirmed" && (
                  <button className={styles.btnComplete}>ثبت انجام</button>
                )}
                <button className={styles.btnMore}>•••</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Sessions Management
// ============================================
function SessionsManagement() {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>🎥 جلسات آنلاین</h2>
          <p>مدیریت جلسات مجازی</p>
        </div>
      </div>
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>🎥</span>
        <h3>هیچ جلسه آنلاینی در حال برگزاری نیست</h3>
        <p>جلسات امروز شما در بخش نوبت‌ها قابل مشاهده است.</p>
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
