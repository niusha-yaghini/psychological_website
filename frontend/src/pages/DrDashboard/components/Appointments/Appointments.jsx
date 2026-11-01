import React, { useState, useMemo } from "react";
import { FaPlus } from "react-icons/fa";
import moment from "moment-jalaali";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import styles from "./Appointments.module.css";

// ============================================
// COMPONENT: Appointments Management
// ============================================
// function AppointmentsManagement({ appointments, setAppointments }) {
function AppointmentsManagement({
  appointments,
  setAppointments,
  getAppointmentMoment,
  getDisplayStatus,
  isNotCompleted,
  getOriginalStatusInfo,
  getDisplayStatusInfo,
  isFinalizedStatus,
  getRelativeDateLabel,
  toPersianDigits,
  toEnglishDigits,
  getTypeLabel,
  isMoreThan24HoursAway,
  isLessThan24HoursAway,
  pricePerHour,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ===== استیت فرم افزودن نوبت =====
  // const [newAppointment, setNewAppointment] = useState({
  //   patient: "",
  //   date: "",
  //   time: "",
  //   typeKey: "individual",
  //   status: "pending",
  // });
  // ===== استیت فرم افزودن نوبت =====
  const [newAppointment, setNewAppointment] = useState({
    patient: "",
    date: null, // ← حالا یه DateObject هست، نه string
    startTime: "",
    endTime: "",
    typeKey: "individual",
    status: "pending",
  });

  // ==========================================
  // مشتق‌ها
  // ==========================================

  // ===== مرتب‌سازی نوبت‌ها (جدیدترین اول) =====
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const momentA = getAppointmentMoment(a);
      const momentB = getAppointmentMoment(b);
      return momentB - momentA; // جدیدترین اول
    });
  }, [appointments]);

  // ==========================================
  // توابع
  // ==========================================

  // ===== تأیید نوبت =====
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

  // ===== رد نوبت =====
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
    setSelectedAppointment(null);
    setRejectReason("");
    alert(`نوبت ${selectedAppointment.patient} با موفقیت رد شد.`);
  };

  // ===== ثبت انجام =====
  const handleComplete = (app) => {
    if (window.confirm(`آیا جلسه ${app.patient} برگزار شده است؟`)) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === app.id ? { ...item, status: "completed" } : item,
        ),
      );
      alert(`جلسه ${app.patient} به عنوان برگزار شده ثبت شد.`);
    }
  };

  // ===== ثبت برگزار نشده =====
  const handleMarkNoShow = (app) => {
    if (window.confirm(`آیا مطمئنید که جلسه ${app.patient} برگزار نشد؟`)) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === app.id
            ? {
                ...item,
                status: "no-show",
                markedAsNoShowAt: toPersianDigits(
                  moment().format("jYYYY/jMM/jDD"),
                ),
              }
            : item,
        ),
      );
      alert(`جلسه ${app.patient} به عنوان "برگزار نشده" ثبت شد.`);
    }
  };

  // ===== لغو نوبت توسط روانشناس =====
  const handleDoctorCancel = (app) => {
    if (
      window.confirm(
        `آیا از لغو جلسه ${app.patient} اطمینان دارید؟ این عمل قابل بازگشت نیست.`,
      )
    ) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === app.id
            ? {
                ...item,
                status: "cancelled",
                cancelledBy: "doctor",
                cancelReason: "لغو توسط روانشناس",
              }
            : item,
        ),
      );
      alert(`جلسه ${app.patient} با موفقیت لغو شد.`);
    }
  };

  // ===== محاسبه دقیقه از ساعت =====
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const clean = toEnglishDigits(timeStr.trim());
    const parts = clean.split(":");
    if (parts.length !== 2) return -1;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return -1;
    if (h < 0 || h > 23 || m < 0 || m > 59) return -1;
    return h * 60 + m;
  };

  // ===== افزودن نوبت جدید =====
  const handleAddAppointment = () => {
    // ===== اعتبارسنجی =====
    if (!newAppointment.patient.trim()) {
      alert("لطفاً نام بیمار را وارد کنید.");
      return;
    }
    if (!newAppointment.date) {
      alert("لطفاً تاریخ را انتخاب کنید.");
      return;
    }
    if (!newAppointment.startTime.trim()) {
      alert("لطفاً ساعت شروع را وارد کنید.");
      return;
    }
    if (!newAppointment.endTime.trim()) {
      alert("لطفاً ساعت پایان را وارد کنید.");
      return;
    }

    // ===== اعتبارسنجی ساعت‌ها =====
    const startMinutes = timeToMinutes(newAppointment.startTime);
    const endMinutes = timeToMinutes(newAppointment.endTime);

    if (startMinutes === -1) {
      alert("ساعت شروع نامعتبر است. فرمت صحیح: مثلاً ۱۰:۰۰");
      return;
    }
    if (endMinutes === -1) {
      alert("ساعت پایان نامعتبر است. فرمت صحیح: مثلاً ۱۱:۰۰");
      return;
    }

    const diffMinutes = endMinutes - startMinutes;
    if (diffMinutes < 60) {
      alert("ساعت پایان باید حداقل ۱ ساعت بعد از ساعت شروع باشد.");
      return;
    }

    // ===== ساخت hours array =====
    const hours = [];
    for (let m = startMinutes; m < endMinutes; m += 60) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      hours.push(
        `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
      );
    }

    // ===== ساخت time string =====
    const timeString = `${newAppointment.startTime.trim()} - ${newAppointment.endTime.trim()}`;

    // ===== محاسبه duration (به ساعت) =====
    const durationHours = diffMinutes / 60;

    // ===== تاریخ شمسی به string =====
    const persianDate = newAppointment.date.format("YYYY/MM/DD");

    // ===== ساخت آبجکت نهایی =====
    const newId = Math.max(...appointments.map((a) => a.id), 0) + 1;

    // ===== محاسبه قیمت بر اساس pricePerHour =====
    // const pricePerHour = seedData.doctorProfile.pricePerHour || 0;
    // const finalPrice = pricePerHour * durationHours;
    const finalPrice = pricePerHour * durationHours;

    setAppointments((prev) => [
      ...prev,
      {
        id: newId,
        patientId: null, // ← جدید: هنوز patientId نداریم
        patient: newAppointment.patient,
        patientPhone: "",
        type: getTypeLabel(newAppointment.typeKey),
        typeKey: newAppointment.typeKey,
        date: toPersianDigits(persianDate),
        time: toPersianDigits(timeString),
        hours: hours.map(toPersianDigits),
        startTime: toPersianDigits(newAppointment.startTime.trim()),
        endTime: toPersianDigits(newAppointment.endTime.trim()),
        status: newAppointment.status,
        isOnline: true,
        createdAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
        price: finalPrice, // ← اصلاح شد
        duration: durationHours,
        meetingLink: null,
      },
    ]);

    // ===== ریست فرم =====
    setNewAppointment({
      patient: "",
      date: null,
      startTime: "",
      endTime: "",
      typeKey: "individual",
      status: "pending",
    });

    setShowAddModal(false);
    alert("نوبت جدید با موفقیت اضافه شد.");
  };

  // ===== فیلتر کردن =====
  const getFilteredAppointments = () => {
    if (activeFilter === "all") return sortedAppointments;
    if (activeFilter === "not-completed") {
      return sortedAppointments.filter((item) => isNotCompleted(item));
    }
    return sortedAppointments.filter(
      (item) => getDisplayStatus(item) === activeFilter,
    );
  };

  const filteredAppointments = getFilteredAppointments();

  // ===== تعریف فیلترها =====
  const filters = [
    { id: "all", label: "همه" },
    { id: "pending", label: "در انتظار" },
    { id: "confirmed", label: "تأیید شده" },
    { id: "completed", label: "برگزار شده" },
    // { id: "cancelled", label: "لغو شده" },
    { id: "not-completed", label: "برگزار نشده" },
  ];

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

      {/* ===== لیست نوبت‌ها ===== */}
      <div className={styles.appointmentsList}>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((app) => {
            const displayStatus = getDisplayStatus(app);
            const originalStatus = getOriginalStatusInfo(app.status);
            const displayStatusInfo = getDisplayStatusInfo(displayStatus);

            // ===== چک کردن گذشته =====
            const isPast = isFinalizedStatus(displayStatus);

            // ===== وضعیت برگزار نشده =====
            const isNoShow = displayStatus === "no-show";

            // ===== بازه ۴۸ ساعته =====
            const isAwaitingConfirmation =
              displayStatus === "awaiting-confirmation";

            // ===== محاسبه زمان باقی‌مانده تا پایان ۴۸ ساعت =====
            let remainingHours = 0;
            if (isAwaitingConfirmation) {
              const startMoment = getAppointmentMoment(app);
              const durationMinutes = (app.duration || 1) * 60;
              const endMoment = startMoment
                .clone()
                .add(durationMinutes, "minutes");
              remainingHours = Math.max(
                0,
                Math.ceil(48 - moment().diff(endMoment, "hours", true)),
              );
            }

            return (
              <div
                key={app.id}
                className={`${styles.appointmentCard} ${
                  isPast ? styles.pastAppointment : ""
                }`}
              >
                {/* ===== نوار وضعیت ===== */}
                <div className={styles.appointmentStatusBar}>
                  {/* Badge وضعیت اصلی */}
                  <span
                    className={`${styles.statusBadge} ${
                      styles[originalStatus.className]
                    }`}
                  >
                    {originalStatus.label}
                  </span>

                  {/* Badge "برگزار نشده" */}
                  {isNoShow && (
                    <span className={styles.noShowBadge}>برگزار نشده</span>
                  )}

                  {/* Badge "منتظر تأیید انجام" */}
                  {isAwaitingConfirmation && (
                    <span className={styles.awaitingBadge}>
                      منتظر تأیید انجام
                    </span>
                  )}

                  {/* Badge آنلاین */}
                  {app.isOnline && (
                    <span className={styles.onlineBadge}>آنلاین</span>
                  )}

                  {/* Badge لغو */}
                  {app.status === "cancelled" && (
                    <span className={styles.cancelBadge}>
                      {app.cancelledBy === "patient"
                        ? "لغو توسط بیمار"
                        : "لغو توسط روانشناس"}
                    </span>
                  )}
                </div>

                {/* ===== محتوای اصلی ===== */}
                <div className={styles.appointmentBody}>
                  <div className={styles.appointmentInfo}>
                    <h4>{app.type}</h4>

                    <div className={styles.appointmentMeta}>
                      <span className={styles.metaItem}>👤 {app.patient}</span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {getRelativeDateLabel(app)}
                      </span>
                      <span className={styles.metaDivider}>•</span>
                      <span className={styles.metaItem}>
                        {toPersianDigits(
                          app.startTime || app.time.split(" - ")[0],
                        )}
                      </span>
                    </div>

                    {app.price && (
                      <div className={styles.appointmentPrice}>
                        {toPersianDigits(app.price.toLocaleString("en-US"))}{" "}
                        تومان
                      </div>
                    )}

                    {app.status === "cancelled" && app.cancelReason && (
                      <div className={styles.cancelReason}>
                        <span>دلیل لغو:</span>
                        <span>{app.cancelReason}</span>
                      </div>
                    )}
                  </div>

                  {/* ===== دکمه‌های اکشن ===== */}
                  <div className={styles.appointmentActions}>
                    {displayStatus === "pending" && (
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

                    {displayStatus === "confirmed" && (
                      <>
                        {isMoreThan24HoursAway(app) && (
                          <button
                            className={styles.btnDoctorCancel}
                            onClick={() => handleDoctorCancel(app)}
                          >
                            لغو نوبت{" "}
                          </button>
                        )}

                        {isLessThan24HoursAway(app) && (
                          <button
                            className={styles.btnCancelDisabled}
                            disabled
                            title="کمتر از ۲۴ ساعت تا شروع جلسه باقی مانده"
                          >
                            لغو غیرفعال (کمتر از ۲۴ ساعت)
                          </button>
                        )}
                      </>
                    )}

                    {displayStatus === "ongoing" && (
                      <button
                        className={styles.btnComplete}
                        onClick={() => handleComplete(app)}
                      >
                        ثبت انجام
                      </button>
                    )}

                    {isAwaitingConfirmation && (
                      <>
                        <button
                          className={styles.btnComplete}
                          onClick={() => handleComplete(app)}
                        >
                          ✓ برگزار شد
                        </button>
                        <button
                          className={styles.btnNoShow}
                          onClick={() => handleMarkNoShow(app)}
                        >
                          ✗ برگزار نشد
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* ===== هشدار ۴۸ ساعته — تمام عرض زیر کارت ===== */}
                {isAwaitingConfirmation && (
                  <div className={styles.awaitingConfirmationBox}>
                    <div className={styles.awaitingText}>
                      <span className={styles.awaitingTitle}>
                        آیا این جلسه برگزار شده؟
                      </span>
                      <span className={styles.awaitingTime}>
                        ({toPersianDigits(remainingHours)} ساعت فرصت باقی‌مانده)
                      </span>
                    </div>
                  </div>
                )}
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
                  <span>{getRelativeDateLabel(selectedAppointment)}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>
                    {toPersianDigits(
                      selectedAppointment.startTime ||
                        selectedAppointment.time.split(" - ")[0],
                    )}
                  </span>
                </div>
                <div className={styles.confirmRow}>
                  <span>نوع جلسه:</span>
                  <span>{getTypeLabel(selectedAppointment.typeKey)}</span>
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
                  <span>{getRelativeDateLabel(selectedAppointment)}</span>
                </div>
                <div className={styles.confirmRow}>
                  <span>ساعت:</span>
                  <span>
                    {toPersianDigits(
                      selectedAppointment.startTime ||
                        selectedAppointment.time.split(" - ")[0],
                    )}
                  </span>
                </div>
                <div className={styles.confirmRow}>
                  <span>نوع جلسه:</span>
                  <span>{getTypeLabel(selectedAppointment.typeKey)}</span>
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
                    date: null,
                    startTime: "",
                    endTime: "",
                    typeKey: "individual",
                    status: "pending",
                  });
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* نام بیمار */}
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

              {/* تاریخ */}
              <div className={styles.formGroup}>
                <label>تاریخ</label>
                <DatePicker
                  value={newAppointment.date}
                  onChange={(date) =>
                    setNewAppointment((prev) => ({ ...prev, date }))
                  }
                  calendar={persian}
                  locale={persian_fa}
                  calendarPosition="bottom-right"
                  inputClass={styles.formInput}
                  placeholder="انتخاب تاریخ"
                  format="YYYY/MM/DD"
                  editable={false}
                />
              </div>

              {/* ساعت شروع و پایان */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>ساعت شروع</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="۱۰:۰۰"
                    value={newAppointment.startTime}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    dir="ltr"
                    style={{ textAlign: "center" }}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>ساعت پایان</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="۱۱:۰۰"
                    value={newAppointment.endTime}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    dir="ltr"
                    style={{ textAlign: "center" }}
                  />
                </div>
              </div>

              <p className={styles.formHint}>
                ⏱ ساعت پایان باید حداقل ۱ ساعت بعد از ساعت شروع باشد.
              </p>

              {/* نوع جلسه و وضعیت */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>نوع جلسه</label>
                  <select
                    className={styles.formSelect}
                    value={newAppointment.typeKey}
                    onChange={(e) =>
                      setNewAppointment((prev) => ({
                        ...prev,
                        typeKey: e.target.value,
                      }))
                    }
                  >
                    <option value="individual">فردی</option>
                    <option value="couple">زوج</option>
                    <option value="teen">نوجوان</option>
                    <option value="family">خانواده</option>
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
                    <option value="completed">برگزار شده</option>
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
                    date: null,
                    startTime: "",
                    endTime: "",
                    typeKey: "individual",
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

export default AppointmentsManagement;
