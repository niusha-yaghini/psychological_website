import React, { useState, useEffect } from "react";
import styles from "./Appointments.module.css";

import moment from "moment-jalaali";
moment.loadPersian({
  usePersianDigits: false,
  dialect: "persian",
});

import confirmIcon from "../../../../../public/images/Patient_Panel/confirm_icon.png";

// ============================================
// COMPONENT: Appointments Content
// ============================================
function AppointmentsManagement({
  appointments,
  setAppointments,
  doctors,
  helpers,
}) {
  const {
    toPersianDigits,
    getDisplayStatus,
    canCancel,
    isCancelDisabled,
    isAppointmentPast,
    isNotCompleted,
    timeToMinutes,
    areTimesConsecutive,
    canAddTime,
    getDateFromWeekDay,
    getDayOfMonthFromWeekDay,
    isDayPast,
    isTimeSelectable,
    isTimeAlreadyBooked,
    formatPrice,
    WEEK_DAYS_ORDER,
    // toPersianDigits,
    // getDisplayStatus,
    toEnglishDigits,
  } = helpers;

  const [activeFilter, setActiveFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

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
  // const getTimeValue = (timeString) => {
  //   try {
  //     const [start] = timeString.split(" - ");
  //     const [hours, minutes] = start.split(":");
  //     return parseInt(hours) * 60 + parseInt(minutes);
  //   } catch {
  //     return 0;
  //   }
  // };

  const getTimeValue = (timeString) => {
    if (!timeString) return 0;

    const [start] = timeString.split(" - ");
    const [hours, minutes] = toEnglishDigits(start).split(":");

    return Number(hours) * 60 + Number(minutes);
  };

  // ===== دریافت اطلاعات وضعیت اصلی (Badge اول) =====
  const getOriginalStatusInfo = (status) => {
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

  const getFilteredAppointments = () => {
    if (activeFilter === "all") return sortedAppointments;

    if (activeFilter === "not-completed") {
      return sortedAppointments.filter((item) => isNotCompleted(item));
    }

    return sortedAppointments.filter((item) => {
      const displayStatus = getDisplayStatus(item);
      return displayStatus === activeFilter;
    });
  };

  const filteredAppointments = getFilteredAppointments();

  const handleCancelAppointment = (appointmentId) => {
    const appointment = appointments.find((a) => a.id === appointmentId);
    if (!appointment) return;

    const displayStatus = getDisplayStatus(appointment);

    // ===== اگه منقضی شده یا انجام نشده، نمیشه لغو کرد =====
    if (displayStatus !== "confirmed" && displayStatus !== "pending") {
      alert("امکان لغو این نوبت وجود ندارد.");
      return;
    }

    // ===== چک کردن قانون ۲۴ ساعت =====
    if (!canCancel(appointment)) {
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
        createdAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
      },
      ...prev,
    ]);
    setShowModal(false);
    alert("درخواست نوبت با موفقیت ثبت شد.");
  };

  // ===== وضعیت‌ها =====
  // اگر تایید شده باشه ولی انجام نشه => انجام نشده
  // اگر رزرو شده اما تایید نشه و از موعدش بگذره => منقضی شده
  const filters = [
    { id: "all", label: "همه" },
    { id: "confirmed", label: "تأیید شده" },
    { id: "pending", label: "در انتظار" },
    { id: "completed", label: "انجام شده" },
    { id: "not-completed", label: "انجام نشده" },
  ];

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

      {/* لیست نوبت‌ها */}
      <div className={styles.appointmentsList}>
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => {
            // const statusInfo = getStatusInfo(appointment);
            const isCancellable = canCancel(appointment);
            const isPast = isAppointmentPast(appointment);

            return (
              <div
                key={appointment.id}
                className={`${styles.appointmentCard} ${
                  isPast ? styles.pastAppointment : ""
                }`}
              >
                {/* وضعیت */}
                <div className={styles.appointmentStatusBar}>
                  <span
                    className={`${styles.statusBadge} ${
                      getOriginalStatusInfo(appointment.status).className
                    }`}
                  >
                    {getOriginalStatusInfo(appointment.status).label}
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

                  {/* اگر منقضی شده (گذشتن از موعد تأیید) */}
                  {getDisplayStatus(appointment) === "expired" && (
                    <span className={styles.cancelBadge}>
                      گذشتن از موعد تأیید
                    </span>
                  )}

                  {/* اگر انجام نشده (no-show) */}
                  {getDisplayStatus(appointment) === "no-show" && (
                    <span className={styles.cancelBadge}>انجام نشده</span>
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

                    {/* ===== قیمت (اگه وجود داشت) ===== */}
                    {appointment.price && (
                      <div className={styles.appointmentPrice}>
                        {formatPrice(appointment.price)} تومان
                      </div>
                    )}

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
                    {/* ===== وضعیت تأیید شده (فقط اگه آینده باشه) ===== */}
                    {appointment.status === "confirmed" && !isPast && (
                      <>
                        {isCancellable && (
                          <button
                            className={styles.btnCancel}
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                          >
                            لغو نوبت
                          </button>
                        )}
                        {isCancelDisabled(appointment) && (
                          <button className={styles.btnCancelDisabled} disabled>
                            لغو غیرفعال (کمتر از ۲۴ ساعت)
                          </button>
                        )}
                      </>
                    )}

                    {/* ===== وضعیت در انتظار (فقط اگه آینده باشه) ===== */}
                    {appointment.status === "pending" && !isPast && (
                      <>
                        <button className={styles.btnPending}>
                          در انتظار تأیید
                        </button>
                        {isCancellable && (
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
        appointments={appointments}
        doctors={doctors}
        helpers={helpers}
      />
    </div>
  );
}

// ============================================
// COMPONENT: New Appointment Modal
// ============================================
function NewAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
  appointments,
  doctors,
  helpers,
}) {
  const {
    formatPrice,
    WEEK_DAYS_ORDER,
    areTimesConsecutive,
    canAddTime,
    timeToMinutes,
    toPersianDigits,
    isDayPast,
    getDayOfMonthFromWeekDay,
    isTimeSelectable,
    isTimeAlreadyBooked,
    getDateFromWeekDay,
    toEnglishDigits,
  } = helpers;

  const [step, setStep] = useState(1); // 1: انتخاب روانشناس | 2: انتخاب زمان | 3: تأیید
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [appointmentType, setAppointmentType] = useState("individual"); // individual | couple | teen
  const [weekOffset, setWeekOffset] = useState(0); // ← جدید (0 = این هفته، 1 = هفته بعد، ...)

  // const doctors = doctors;

  const sortedAvailableDays = [...(selectedDoctor?.availableDays || [])].sort(
    (a, b) => WEEK_DAYS_ORDER[a] - WEEK_DAYS_ORDER[b],
  );

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSelectedDoctor(null);
      setSelectedDate(null);
      setSelectedTimes([]); // ← آرایه خالی
      setAppointmentType("individual");
      setWeekOffset(0); // ← ریست
    }
  }, [isOpen]);

  // ===== مدیریت کلیک روی ساعت =====
  const handleTimeClick = (time) => {
    const isSelected = selectedTimes.includes(time);

    if (isSelected) {
      // ===== حذف ساعت =====
      const newTimes = selectedTimes.filter((t) => t !== time);

      if (areTimesConsecutive(newTimes)) {
        setSelectedTimes(newTimes);
      } else {
        alert("با حذف این ساعت، ساعت‌های باقی‌مانده پشت سر هم نیستند.");
      }
    } else {
      // ===== اضافه کردن ساعت =====
      if (
        canAddTime(time, selectedTimes, selectedDoctor?.availableTimes || [])
      ) {
        // مرتب‌سازی بر اساس دقیقه
        const newTimes = [...selectedTimes, time].sort(
          (a, b) => timeToMinutes(a) - timeToMinutes(b),
        );
        setSelectedTimes(newTimes);
      } else {
        if (selectedTimes.length >= 3) {
          alert("حداکثر تا ۳ ساعت پشت سر هم را میتواند انتخاب کنید.");
        } else {
          alert("ساعت‌ها باید پشت سر هم (با فاصله ۱ ساعت) باشند.");
        }
      }
    }
  };

  // ===== محاسبه ساعت شروع و پایان =====
  const getFinalTimeRange = () => {
    if (selectedTimes.length === 0) return null;

    // ===== مرتب‌سازی بر اساس دقیقه =====
    const sortedTimes = [...selectedTimes].sort(
      (a, b) => timeToMinutes(a) - timeToMinutes(b),
    );

    const startTime = sortedTimes[0];
    const lastTime = sortedTimes[sortedTimes.length - 1];

    // ===== محاسبه ساعت پایان (۱ ساعت بعد از آخرین ساعت) =====
    const lastMinutes = timeToMinutes(lastTime);
    const endMinutes = lastMinutes + 60;
    const endHours = Math.floor(endMinutes / 60) % 24;
    const endTime = `${String(endHours).padStart(2, "0")}:۰۰`;

    return {
      start: startTime,
      end: toPersianDigits(endTime),
      count: selectedTimes.length,
    };
  };

  // ===== محاسبه قیمت نهایی =====
  const getFinalPrice = () => {
    if (!selectedDoctor?.pricePerHour) return 0;
    return selectedDoctor.pricePerHour * selectedTimes.length;
  };

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
              {/* {doctors.map((doctor) => ( */}
              {(doctors || []).map((doctor) => (
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
                      <span>{doctor.experience}</span>
                      <span>{doctor.rating}</span>
                    </div>
                    {/* ===== قیمت ===== */}
                    <div className={styles.doctorPrice}>
                      {formatPrice(doctor.pricePerHour)} تومان / ساعت
                    </div>
                    <div className={styles.doctorDays}>
                      {/* {doctor.availableDays.map((day) => ( */}
                      {(doctor.availableDays || []).map((day) => (
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

            {/* ===== انتخاب هفته ===== */}
            <div className={styles.weekSelector}>
              <button
                className={styles.weekNavBtn}
                onClick={() => setWeekOffset(weekOffset - 1)}
                disabled={weekOffset === 0}
                title="هفته قبل"
              >
                →
              </button>

              <span className={styles.weekLabel}>
                {weekOffset === 0 && "هفته جاری"}
                {weekOffset === 1 && "هفته آینده"}
                {weekOffset === 2 && "۲ هفته آینده"}
                {weekOffset === 3 && "۳ هفته آینده"}
                {weekOffset > 3 && `${toPersianDigits(weekOffset)} هفته آینده`}
              </span>

              <button
                className={styles.weekNavBtn}
                onClick={() => setWeekOffset(weekOffset + 1)}
                disabled={weekOffset >= 4}
                title="هفته بعد"
              >
                ←
              </button>
            </div>

            <div className={styles.dateTimeSection}>
              {/* ===== انتخاب روز ===== */}
              <div className={styles.dateGrid}>
                {sortedAvailableDays.map((day) => {
                  const isDisabled = isDayPast(day, weekOffset);
                  return (
                    <button
                      key={day}
                      className={`${styles.dateBtn} ${
                        selectedDate === day ? styles.selected : ""
                      } ${isDisabled ? styles.disabled : ""}`}
                      onClick={() => {
                        if (!isDisabled) {
                          if (selectedDate !== day) {
                            setSelectedTimes([]);
                          }
                          setSelectedDate(day);
                        }
                      }}
                      disabled={isDisabled}
                    >
                      <span className={styles.dateDay}>{day}</span>
                      <span className={styles.dateNum}>
                        {getDayOfMonthFromWeekDay(day, weekOffset)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ===== انتخاب ساعت ===== */}
              {selectedDate && (
                <div className={styles.timeGrid}>
                  {selectedDoctor?.availableTimes?.map((time) => {
                    const isPast = !isTimeSelectable(
                      time,
                      selectedDate,
                      weekOffset,
                    );
                    const isBooked = isTimeAlreadyBooked(
                      appointments,
                      selectedDate,
                      time,
                      weekOffset,
                    );
                    const isSelected = selectedTimes.includes(time);
                    const isDisabled = isPast || isBooked;

                    return (
                      <button
                        key={time}
                        className={`${styles.timeBtn} ${
                          isSelected ? styles.selected : ""
                        } ${isDisabled ? styles.disabled : ""}`}
                        onClick={() => !isDisabled && handleTimeClick(time)}
                        disabled={isDisabled}
                        title={isBooked ? "این ساعت قبلاً رزرو شده است" : ""}
                      >
                        {time}
                        {isBooked && (
                          <span className={styles.bookedLabel}>رزرو شده</span>
                        )}
                      </button>
                    );
                  })}

                  <div className={styles.timeHint}>
                    حداکثر ۳ ساعت <strong>پشت سر هم</strong> را میتوانید انتخاب
                    کنید.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== مرحله ۳: تأیید نهایی ===== */}
        {step === 3 && (
          <div className={styles.modalStep}>
            <div className={styles.confirmBox}>
              <div className={styles.confirmIcon}>
                <img src={confirmIcon} alt="تأیید" />
              </div>
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
                  <span className={styles.confirmLabel}>نوع جلسه:</span>
                  <span className={styles.confirmValue}>
                    {appointmentType === "individual" && "جلسه مشاوره فردی"}
                    {appointmentType === "couple" && "جلسه زوج درمانی"}
                    {appointmentType === "teen" && "جلسه مشاوره نوجوان"}
                  </span>
                </div>
                <div className={styles.confirmItem}>
                  <span className={styles.confirmLabel}>تاریخ:</span>
                  <span className={styles.confirmValue}>
                    {selectedDate} -{" "}
                    {toPersianDigits(
                      getDateFromWeekDay(selectedDate, weekOffset),
                    )}{" "}
                    {/* ← weekOffset اضافه شد */}
                  </span>
                </div>

                {/* ===== ساعت شروع تا پایان ===== */}
                <div className={styles.confirmItem}>
                  <span className={styles.confirmLabel}>ساعت:</span>
                  <span className={styles.confirmValue}>
                    {(() => {
                      const range = getFinalTimeRange();
                      if (!range) return "—";
                      if (range.count === 1) {
                        // اگه ۱ ساعت بود، همون فرمت قبلی
                        return `${range.start} - ${range.end}`;
                      }
                      // اگه چند ساعت بود
                      return `${range.start} تا ${range.end} (${toPersianDigits(range.count)} ساعت)`;
                    })()}
                  </span>
                </div>

                {/* ===== قیمت ===== */}
                <div className={styles.confirmItem}>
                  <span className={styles.confirmLabel}>هزینه جلسه:</span>
                  <span className={styles.confirmValuePrice}>
                    {formatPrice(getFinalPrice())} تومان
                  </span>
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
                  alert("لطفاً یک روانشناس انتخاب کنید.");
                  return;
                }
                if (
                  step === 2 &&
                  (!selectedDate || selectedTimes.length === 0)
                ) {
                  alert("لطفاً تاریخ و حداقل یک ساعت را انتخاب کنید.");
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
                const persianDate = getDateFromWeekDay(
                  selectedDate,
                  weekOffset,
                );
                const range = getFinalTimeRange();
                const fullTime = `${range.start} - ${range.end}`;
                const finalPrice = getFinalPrice();

                const typeNames = {
                  individual: "جلسه مشاوره فردی",
                  couple: "جلسه زوج درمانی",
                  teen: "جلسه مشاوره نوجوان",
                };

                // ===== مرتب‌سازی ساعت‌ها =====
                const sortedHours = [...selectedTimes].sort(
                  (a, b) => timeToMinutes(a) - timeToMinutes(b),
                );

                const newAppointment = {
                  id: Date.now(),
                  type: typeNames[appointmentType] || "جلسه مشاوره فردی",
                  doctor: selectedDoctor?.name,
                  doctorId: selectedDoctor?.id,
                  date: toPersianDigits(persianDate),
                  time: toPersianDigits(fullTime),
                  hours: sortedHours.map(toPersianDigits), // ← آرایه ساعت‌ها
                  // startTime: sortedHours[0],
                  // endTime: toPersianDigits(range.end),
                  startTime: toPersianDigits(sortedHours[0]),
                  endTime: toPersianDigits(range.end),
                  status: "pending",
                  isOnline: true,
                  cancelledBy: null,
                  cancelReason: null,
                  createdAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
                  price: finalPrice,
                  duration: selectedTimes.length,
                };

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

export default AppointmentsManagement;
