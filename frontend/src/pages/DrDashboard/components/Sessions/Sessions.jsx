
import React, { useState, useEffect, useMemo } from "react";
import styles from "./Sessions.module.css";

// ============================================
// COMPONENT: Sessions Management
// ============================================
// function SessionsManagement({ appointments, setAppointments }) {
function SessionsManagement({
  appointments,
  setAppointments,
  getDisplayStatus,
  getAppointmentMoment,
  toPersianDigits,
  getTypeLabel,
  moment,
}) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [timeLeft, setTimeLeft] = useState(null);

  // const [showLinkModal, setShowLinkModal] = useState(false);
  // const [linkInput, setLinkInput] = useState("");
  // const [selectedSessionForLink, setSelectedSessionForLink] = useState(null);

  // ===== State های لینک inline =====
  const [linkInput, setLinkInput] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [selectedSessionForNote, setSelectedSessionForNote] = useState(null);

  // ==========================================
  // مشتق‌ها
  // ==========================================
  // ===== جلسات پیش‌رو: confirmed + آینده (شامل ongoing) =====
  const upcomingSessions = useMemo(() => {
    return appointments
      .filter((app) => {
        const displayStatus = getDisplayStatus(app);
        return displayStatus === "confirmed" || displayStatus === "ongoing";
      })
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentA - momentB; // نزدیک‌ترین اول
      });
  }, [appointments]);

  // ===== تاریخچه جلسات: completed =====
  const pastSessions = useMemo(() => {
    return appointments
      .filter((app) => {
        const displayStatus = getDisplayStatus(app);
        return displayStatus === "completed";
      })
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentB - momentA; // جدیدترین اول
      });
  }, [appointments]);

  // ===== جلسه بعدی =====
  const nextSession = upcomingSessions[0] || null;
  const isNextOngoing = nextSession
    ? getDisplayStatus(nextSession) === "ongoing"
    : false;

  // ==========================================
  // تایمر شمارش معکوس
  // ==========================================
  useEffect(() => {
    if (!nextSession) return;

    const targetMoment = getAppointmentMoment(nextSession);
    if (!targetMoment.isValid()) return;

    const updateTimer = () => {
      const now = moment();
      const diff = targetMoment.diff(now, "seconds");

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return true;
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
      updateTimer();
    }, 1000);

    return () => clearInterval(interval);
  }, [nextSession?.id]);

  // ==========================================
  // توابع
  // ==========================================

  const handleStartSession = (session) => {
    if (window.confirm(`آیا مایل به شروع جلسه ${session.patient} هستید؟`)) {
      if (session.isOnline) {
        alert("جلسه شروع شد.");
      } else {
        alert("این جلسه به صورت حضوری برگزار می‌شود.");
      }
    }
  };

  const handleEndSession = (sessionId) => {
    if (window.confirm("آیا جلسه به پایان رسیده است؟")) {
      alert("جلسه با موفقیت به پایان رسید.");
    }
  };

  // ===== ذخیره لینک جلسه =====
  const handleSaveMeetingLink = (session) => {
    if (!linkInput.trim()) {
      alert("لطفاً لینک جلسه را وارد کنید.");
      return;
    }

    if (!linkInput.startsWith("http")) {
      alert("لطفاً لینک معتبر وارد کنید (با http یا https).");
      return;
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === session.id
          ? { ...item, meetingLink: linkInput.trim() }
          : item,
      ),
    );

    setLinkInput("");
    setIsEditingLink(false);
    alert("لینک جلسه با موفقیت ذخیره شد.");
  };

  // ===== باز کردن مودال یادداشت =====
  const handleOpenNoteModal = (session) => {
    setSelectedSessionForNote(session);
    setNoteInput(session.sessionNotes?.summary || "");
    setShowNoteModal(true);
  };

  // ===== ذخیره یادداشت =====
  const handleSaveNote = () => {
    if (!noteInput.trim()) {
      alert("لطفاً متن یادداشت را وارد کنید.");
      return;
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedSessionForNote.id
          ? {
              ...item,
              sessionNotes: {
                summary: noteInput.trim(),
                createdAt:
                  item.sessionNotes?.createdAt ||
                  toPersianDigits(moment().format("jYYYY/jMM/jDD")),
                updatedAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
              },
            }
          : item,
      ),
    );

    setShowNoteModal(false);
    setNoteInput("");
    setSelectedSessionForNote(null);
    alert("یادداشت با موفقیت ذخیره شد.");
  };

  // ==========================================
  // رندر
  // ==========================================
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
              {toPersianDigits(upcomingSessions.length)}
            </span>
            <span className={styles.statLabel}>جلسه پیش‌رو</span>
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>
              {toPersianDigits(pastSessions.length)}
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
          <span className={styles.filterCount}>
            {toPersianDigits(upcomingSessions.length)}
          </span>
        </button>
        <button
          className={`${styles.filterTab} ${
            activeTab === "past" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("past")}
        >
          تاریخچه جلسات
          <span className={styles.filterCount}>
            {toPersianDigits(pastSessions.length)}
          </span>
        </button>
      </div>

      {/* لیست جلسات */}
      <div className={styles.sessionsList}>
        {/* ===== کارت ویژه جلسه بعدی ===== */}
        {activeTab === "upcoming" && nextSession && (
          <div
            className={`${styles.nextSessionBanner} ${
              isNextOngoing ? styles.nextSessionOngoing : ""
            }`}
          >
            <div className={styles.nextSessionContent}>
              <span className={styles.nextSessionLabel}>
                {isNextOngoing ? "🔴 در حال برگزاری" : "جلسه بعدی شما"}
              </span>
              <h3>{nextSession.type}</h3>
              <p>با {nextSession.patient}</p>
              <div className={styles.nextSessionTime}>
                <span>{nextSession.date}</span>
                <span>•</span>
                <span>
                  {toPersianDigits(
                    nextSession.startTime || nextSession.time.split(" - ")[0],
                  )}
                </span>
                <span>•</span>
                <span>
                  {/* {getTypeIcon(nextSession.typeKey)}{" "} */}
                  {getTypeLabel(nextSession.typeKey)}
                </span>
              </div>
            </div>

            <div className={styles.nextSessionActions}>
              {/* ===== بخش لینک ===== */}
              {isEditingLink ? (
                /* حالت ویرایش/افزودن */
                <div className={styles.inlineLinkForm}>
                  <input
                    type="text"
                    className={styles.inlineLinkInput}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    dir="ltr"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveMeetingLink(nextSession);
                      } else if (e.key === "Escape") {
                        setLinkInput("");
                        setIsEditingLink(false);
                      }
                    }}
                  />
                  <button
                    className={styles.btnSaveLink}
                    onClick={() => handleSaveMeetingLink(nextSession)}
                    title="ذخیره"
                  >
                    ✓
                  </button>
                  <button
                    className={styles.btnCancelLink}
                    onClick={() => {
                      setLinkInput("");
                      setIsEditingLink(false);
                    }}
                    title="انصراف"
                  >
                    ✕
                  </button>
                </div>
              ) : nextSession.meetingLink ? (
                /* حالت نمایش لینک ذخیره‌شده */
                <>
                  <div className={styles.meetingLinkDisplay}>
                    <span className={styles.meetingLinkIcon}>🔗</span>
                    <span className={styles.meetingLinkText}>
                      {nextSession.meetingLink.length > 32
                        ? nextSession.meetingLink.slice(0, 32) + "..."
                        : nextSession.meetingLink}
                    </span>
                    <button
                      className={styles.btnEditLink}
                      onClick={() => {
                        setLinkInput(nextSession.meetingLink);
                        setIsEditingLink(true);
                      }}
                      title="ویرایش لینک"
                    >
                      ✏️
                    </button>
                  </div>
                </>
              ) : (
                /* حالت بدون لینک */
                <>
                  <div className={styles.noLinkWarning}>
                    <span>⚠️</span>
                    <span>لینک جلسه تنظیم نشده</span>
                  </div>

                  <button
                    className={styles.btnAddLink}
                    onClick={() => {
                      setLinkInput("");
                      setIsEditingLink(true);
                    }}
                  >
                    + افزودن لینک جلسه
                  </button>
                </>
              )}

              {/* تایمر */}
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

        {/* ===== لیست جلسات ===== */}
        {activeTab === "upcoming" &&
          (upcomingSessions.length > 0 ? (
            upcomingSessions.map((session) => {
              // جلسه بعدی رو توی بنر ویژه نشون دادیم، اینجا رد کن
              if (nextSession && session.id === nextSession.id) return null;

              const displayStatus = getDisplayStatus(session);
              const isOngoing = displayStatus === "ongoing";

              return (
                <div key={session.id} className={styles.sessionCard}>
                  {/* هدر کارت */}
                  <div className={styles.sessionCardHeader}>
                    <div className={styles.sessionDoctor}>
                      {/* <div className={styles.sessionPatientAvatar}>
                        {getTypeIcon(session.typeKey)}
                      </div> */}
                      <div>
                        <h4>{session.patient}</h4>
                        <span className={styles.sessionType}>
                          {session.type}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`${styles.sessionStatus} ${
                        isOngoing
                          ? styles.sessionOngoing
                          : styles.sessionUpcoming
                      }`}
                    >
                      <span className={styles.statusDot}></span>
                      {isOngoing ? "در حال برگزاری" : "تأیید شده"}
                    </span>
                  </div>

                  {/* ===== ردیف جزئیات + دکمه‌های اکشن ===== */}
                  <div className={styles.sessionFooter}>
                    {/* جزئیات */}
                    <div className={styles.sessionDetails}>
                      <div className={styles.sessionMeta}>
                        <div className={styles.metaGroup}>
                          <span>{session.date}</span>
                        </div>
                        <span>•</span>
                        <div className={styles.metaGroup}>
                          <span>
                            {toPersianDigits(
                              session.startTime || session.time.split(" - ")[0],
                            )}
                          </span>
                        </div>
                        <span>•</span>
                        <div className={styles.metaGroup}>
                          <span>
                            {session.isOnline ? "جلسه آنلاین" : "جلسه حضوری"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* دکمه‌های اکشن */}
                    <div className={styles.sessionActions}>
                      {isOngoing ? (
                        <button
                          className={styles.btnJoinSession}
                          onClick={() => handleStartSession(session)}
                        >
                          <span>▶</span>
                          ورود به جلسه
                        </button>
                      ) : (
                        <button
                          className={styles.btnCancelSession}
                          onClick={() => {
                            if (
                              window.confirm(
                                `آیا از لغو جلسه ${session.patient} اطمینان دارید؟`,
                              )
                            ) {
                              alert(`❌ جلسه ${session.patient} لغو شد.`);
                            }
                          }}
                        >
                          لغو جلسه
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎥</span>
              <h3>هیچ جلسه پیش‌رویی ندارید</h3>
              <p>جلسات تأیید شده آینده شما در اینجا نمایش داده می‌شوند.</p>
            </div>
          ))}

        {/* ===== تاریخچه ===== */}
        {activeTab === "past" &&
          (pastSessions.length > 0 ? (
            pastSessions.map((session) => (
              <div key={session.id} className={styles.sessionCard}>
                {/* هدر کارت */}
                <div className={styles.sessionCardHeader}>
                  <div className={styles.sessionDoctor}>
                    {/* <div className={styles.sessionPatientAvatar}>
                      {getTypeIcon(session.typeKey)}
                    </div> */}
                    <div>
                      <h4>{session.patient}</h4>
                      <span className={styles.sessionType}>{session.type}</span>
                    </div>
                  </div>
                  <span
                    className={`${styles.sessionStatus} ${styles.sessionCompleted}`}
                  >
                    <span className={styles.statusDot}></span>
                    برگزار شده
                  </span>
                </div>

                {/* جزئیات */}
                <div className={styles.sessionDetails}>
                  <div className={styles.sessionMeta}>
                    <div className={styles.metaGroup}>
                      <span>{session.date}</span>
                    </div>
                    <span>•</span>
                    {/* <div className={styles.metaGroup}>
                      <span>{session.time}</span>
                    </div> */}
                    <div className={styles.metaGroup}>
                      <span>
                        {toPersianDigits(
                          session.startTime || session.time.split(" - ")[0],
                        )}
                      </span>
                    </div>
                    <span>•</span>
                    <div className={styles.metaGroup}>
                      <span>
                        {session.isOnline ? "جلسه آنلاین" : "جلسه حضوری"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* دکمه‌های اکشن */}
                {/* ===== نمایش یادداشت (اگه وجود داشته باشه) ===== */}
                {session.sessionNotes?.summary && (
                  <div className={styles.sessionNoteDisplay}>
                    <div className={styles.sessionNoteHeader}>
                      <span className={styles.sessionNoteLabel}>
                        خلاصه جلسه
                      </span>
                      <span className={styles.sessionNoteDate}>
                        {session.sessionNotes.updatedAt ||
                          session.sessionNotes.createdAt}
                      </span>
                    </div>
                    <p className={styles.sessionNoteText}>
                      {session.sessionNotes.summary}
                    </p>
                  </div>
                )}

                {/* ===== دکمه‌های اکشن ===== */}
                <div className={styles.sessionActions}>
                  <button className={styles.btnViewRecord}>
                    مشاهده ضبط جلسه
                  </button>
                  <button
                    className={styles.btnNote}
                    onClick={() => handleOpenNoteModal(session)}
                  >
                    {session.sessionNotes?.summary
                      ? "ویرایش یادداشت"
                      : "ثبت یادداشت"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎥</span>
              <h3>هنوز جلسه برگزار شده‌ای وجود ندارد</h3>
              <p>جلسات برگزار شده شما در اینجا نمایش داده می‌شوند.</p>
            </div>
          ))}
      </div>

      {/* ===== مودال یادداشت جلسه ===== */}
      {showNoteModal && selectedSessionForNote && (
        <div className={styles.modalOverlay}>
          <div className={styles.noteModal}>
            <div className={styles.modalHeader}>
              <h3>📝 یادداشت جلسه</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteInput("");
                  setSelectedSessionForNote(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.noteSessionInfo}>
                <p>
                  جلسه با <strong>{selectedSessionForNote.patient}</strong>
                </p>
                <span className={styles.noteSessionDate}>
                  {selectedSessionForNote.date} •{" "}
                  {selectedSessionForNote.startTime}
                </span>
              </div>

              <div className={styles.formGroup}>
                <label>خلاصه جلسه:</label>
                <textarea
                  className={styles.noteTextarea}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="خلاصه‌ای از مباحث مطرح شده، وضعیت بیمار، پیشرفت‌ها و توصیه‌های جلسه..."
                  rows="8"
                  maxLength="2000"
                />
                <span className={styles.noteCharCount}>
                  {toPersianDigits(noteInput.length)} / ۲۰۰۰
                </span>
              </div>

              <p className={styles.noteHint}>
                این یادداشت در پرونده‌ی بیمار ذخیره خواهد شد و فقط برای شما قابل
                مشاهده است.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteInput("");
                  setSelectedSessionForNote(null);
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={handleSaveNote}
              >
                ذخیره یادداشت
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== مودال تنظیم لینک جلسه ===== */}
      {/* {showLinkModal && selectedSessionForLink && (
        <div className={styles.modalOverlay}>
          <div className={styles.linkModal}>
            <div className={styles.modalHeader}>
              <h3>تنظیم لینک جلسه</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkInput("");
                  setSelectedSessionForLink(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.linkModalInfo}>
                جلسه با <strong>{selectedSessionForLink.patient}</strong>
              </p>

              <div className={styles.formGroup}>
                <label>لینک جلسه (Google Meet، Zoom، ...)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  dir="ltr"
                  autoFocus
                />
              </div>

              <p className={styles.linkModalHint}>
                💡 این لینک فقط در زمان برگزاری جلسه برای بیمار فعال می‌شود.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkInput("");
                  setSelectedSessionForLink(null);
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={handleSaveMeetingLink}
              >
                ذخیره لینک
              </button>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default SessionsManagement;

