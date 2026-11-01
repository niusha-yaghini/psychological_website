// ============================================
// COMPONENT: Sessions Content
// ============================================
function SessionsManagement({ appointments, setAppointments }) {
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

export default SessionsManagement;

