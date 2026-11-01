import React, { useState, useMemo } from "react";
import styles from "./DashboardOverview.module.css";

// ============================================
// COMPONENT: DashboardOverview Content
// ============================================
// function DashboardOverview({ appointments, setAppointments }) {
function DashboardOverview({
  appointments,
  setAppointments,
  toPersianDigits,
  getDisplayStatus,
  getAppointmentMoment,
  isAppointmentToday,
  getStatusInfo,
  getTypeLabel,
  getRelativeDateLabel,
  activePatientsCount,
  exercisesSentCount,
}) {
  // ===== استیت‌های مودال =====
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ==========================================
  // مشتق‌ها (Derived State)
  // ==========================================

  // ===== نوبت‌های در انتظار تأیید (فقط pending با تاریخ آینده) =====
  const pendingSessions = useMemo(() => {
    return appointments
      .filter((a) => getDisplayStatus(a) === "pending")
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentA - momentB; // نزدیک‌ترین اول
      });
  }, [appointments]);

  // ===== نوبت‌های تأیید شده (آینده) =====
  const confirmedSessions = useMemo(() => {
    return appointments
      .filter((a) => a.status === "confirmed")
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentA - momentB;
      });
  }, [appointments]);

  // ===== جلسات امروز (از بین تأییدشده‌ها) =====
  const todaySessions = useMemo(() => {
    return confirmedSessions.filter((s) => isAppointmentToday(s));
  }, [confirmedSessions]);

  // ===== آمار (محاسبه‌ی dynamic از داده‌ها) =====
  // const stats = useMemo(() => {

  //   const exercisesSentCount = exercisesSentCount;

  //   return [
  //     {
  //       label: "بیماران فعال",
  //       value: activePatientsCount,
  //       color: "#4CAF84",
  //     },
  //     {
  //       label: "جلسات امروز",
  //       value: todaySessions.length,
  //       color: "#2196F3",
  //     },
  //     {
  //       label: "نوبت‌های در انتظار",
  //       value: pendingSessions.length,
  //       color: "#FF9800",
  //     },
  //     {
  //       label: "تمارین ارسال شده",
  //       value: exercisesSentCount,
  //       color: "#9C27B0",
  //     },
  //   ];
  // }, [todaySessions.length, pendingSessions.length]);

  const stats = useMemo(() => {
    return [
      {
        label: "بیماران فعال",
        value: activePatientsCount,
        color: "#4CAF84",
      },
      {
        label: "جلسات امروز",
        value: todaySessions.length,
        color: "#2196F3",
      },
      {
        label: "نوبت‌های در انتظار",
        value: pendingSessions.length,
        color: "#FF9800",
      },
      {
        label: "تمارین ارسال شده",
        value: exercisesSentCount,
        color: "#9C27B0",
      },
    ];
  }, [
    activePatientsCount,
    exercisesSentCount,
    todaySessions.length,
    pendingSessions.length,
  ]);

  // ==========================================
  // توابع
  // ==========================================

  // ===== تأیید جلسه =====
  const handleConfirmSession = (session) => {
    setSelectedSession(session);
    setShowConfirmModal(true);
  };

  const confirmAppointment = () => {
    if (!selectedSession) return;

    // آپدیت وضعیت به confirmed
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedSession.id
          ? { ...item, status: "confirmed" }
          : item,
      ),
    );

    setShowConfirmModal(false);
    setSelectedSession(null);
    alert(`جلسه ${selectedSession.patient} با موفقیت تأیید شد.`);
  };

  // ===== رد جلسه =====
  const handleRejectSession = (session) => {
    setSelectedSession(session);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const rejectAppointment = () => {
    if (!selectedSession) return;

    // آپدیت وضعیت به cancelled
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedSession.id
          ? {
              ...item,
              status: "cancelled",
              cancelledBy: "doctor",
              cancelReason: rejectReason.trim() || "بدون دلیل",
            }
          : item,
      ),
    );

    setShowRejectModal(false);
    setSelectedSession(null);
    setRejectReason("");
    alert(`جلسه ${selectedSession.patient} با موفقیت رد شد.`);
  };

  return (
    <div className={styles.dashboardContent}>
      {/* ===== ستون راست ===== */}
      <div className={styles.mainColumn}>
        {/* خوش‌آمدگویی */}
        <div className={styles.welcomeBanner}>
          <div className={styles.welcomeText}>
            <h2>سلام دکتر</h2>
            <p>
              امروز {toPersianDigits(todaySessions.length)} جلسه برنامه‌ریزی شده
              دارید.
            </p>
          </div>
        </div>

        {/* آمار */}
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: stat.color }}
              ></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>
                  {toPersianDigits(stat.value)}
                </span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* جلسات امروز */}
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <h3>جلسات امروز</h3>
            <span className={styles.sectionCount}>
              {toPersianDigits(todaySessions.length)}
            </span>
          </div>

          <div className={styles.todaySessions}>
            {todaySessions.length > 0 ? (
              todaySessions.map((session) => (
                <div key={session.id} className={styles.sessionRow}>
                  <span className={styles.sessionTime}>
                    {toPersianDigits(
                      session.startTime || session.time.split(" - ")[0],
                    )}
                  </span>
                  <span className={styles.sessionPatient}>
                    {session.patient}
                  </span>
                  <span
                    className={`${styles.sessionStatus} ${styles[session.status]}`}
                  >
                    {getStatusInfo(session.status).label}
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

      {/* ===== ستون چپ: در انتظار تأیید ===== */}
      <div className={styles.pendingColumn}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeader}>
            <div>
              <h3>در انتظار تأیید</h3>
              <p className={styles.sectionDescription}>درخواست‌های جدید نوبت</p>
            </div>
            <span className={styles.sectionCount}>
              {toPersianDigits(pendingSessions.length)}
            </span>
          </div>

          <div className={styles.pendingSessions}>
            {pendingSessions.length === 0 ? (
              <div className={styles.emptyState}>
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
                      {getTypeLabel(session.typeKey)}
                    </span>
                  </div>

                  <div className={styles.pendingSessionBottom}>
                    <div className={styles.sessionDateTime}>
                      <span>{getRelativeDateLabel(session)}</span>
                      <span className={styles.dateDivider}>•</span>
                      <span>
                        {toPersianDigits(
                          session.startTime || session.time.split(" - ")[0],
                        )}
                      </span>
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
                  <span>{getRelativeDateLabel(selectedSession)}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>
                    {toPersianDigits(
                      selectedSession.startTime ||
                        selectedSession.time.split(" - ")[0],
                    )}
                  </span>
                </div>
                <div className={styles.confirmRow}>
                  <span>نوع جلسه:</span>
                  <span>{getTypeLabel(selectedSession.typeKey)}</span>
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
                  <span>{getRelativeDateLabel(selectedSession)}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>
                    {toPersianDigits(
                      selectedSession.startTime ||
                        selectedSession.time.split(" - ")[0],
                    )}
                  </span>
                </div>
                <div className={styles.confirmRow}>
                  <span>نوع جلسه:</span>
                  <span>{getTypeLabel(selectedSession.typeKey)}</span>
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

export default DashboardOverview;
