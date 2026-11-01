import React, { useState, useMemo } from "react";
import styles from "./CalendarView.module.css";

// ============================================
// COMPONENT: Calendar View (Weekly)
// ============================================
// function CalendarView({ appointments }) {
function CalendarView({
  appointments,
  moment,
  toEnglishDigits,
  toPersianDigits,
  getDisplayStatus,
  getDisplayStatusInfo,
}) {
  // ===== State ها =====
  const [weekOffset, setWeekOffset] = useState(0); // 0 = این هفته
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // ===== ساعت‌های تقویم (۸:۰۰ تا ۲۱:۳۰) =====
  const CALENDAR_HOURS = useMemo(() => {
    const hours = [];
    for (let h = 8; h <= 21; h++) {
      hours.push(`${String(h).padStart(2, "0")}:۰۰`);
      hours.push(`${String(h).padStart(2, "0")}:۳۰`);
    }
    return hours;
  }, []);

  // ===== روزهای هفته =====
  // const weekDays = useMemo(() => {
  //   const todayJalali = moment().format("jYYYY/jMM/jDD");
  //   const [y, m, d] = toEnglishDigits(todayJalali).split("/").map(Number);

  //   const todayDate = moment(`${y}/${m}/${d}`, "jYYYY/jMM/jDD");

  //   // ===== تبدیل روز هفته میلادی به ترتیب ایرانی =====
  //   const gregorianDayOfWeek = todayDate.day();
  //   const persianDayOfWeek =
  //     gregorianDayOfWeek === 6 ? 0 : gregorianDayOfWeek + 1;

  //   // ===== پیدا کردن شنبه این هفته =====
  //   const saturday = todayDate.clone().subtract(persianDayOfWeek, "days");

  //   // ===== اعمال weekOffset =====
  //   const targetSaturday = saturday.clone().add(weekOffset, "weeks");

  //   // ===== ساخت ۷ روز =====
  //   const days = [];
  //   const dayNames = [
  //     "شنبه",
  //     "یکشنبه",
  //     "دوشنبه",
  //     "سه‌شنبه",
  //     "چهارشنبه",
  //     "پنجشنبه",
  //     "جمعه",
  //   ];

  //   for (let i = 0; i < 7; i++) {
  //     const date = targetSaturday.clone().add(i, "days");
  //     days.push({
  //       dayName: dayNames[i],
  //       date: date.format("jYYYY/jMM/jDD"),
  //       dayOfMonth: toPersianDigits(date.format("jDD")),
  //       month: toPersianDigits(date.format("jMM")),
  //       dateObject: date,
  //       isToday: date.isSame(todayDate, "day"),
  //     });
  //   }

  //   return days;
  // }, [weekOffset]);

  // ===== روزهای هفته =====
  const weekDays = useMemo(() => {
    const todayJalali = moment().format("jYYYY/jMM/jDD");
    const [y, m, d] = toEnglishDigits(todayJalali).split("/").map(Number);

    const todayDate = moment(`${y}/${m}/${d}`, "jYYYY/jMM/jDD");

    // ===== تبدیل روز هفته میلادی به ترتیب ایرانی =====
    const gregorianDayOfWeek = todayDate.day();
    const persianDayOfWeek =
      gregorianDayOfWeek === 6 ? 0 : gregorianDayOfWeek + 1;

    // ===== پیدا کردن شنبه این هفته =====
    const saturday = todayDate.clone().subtract(persianDayOfWeek, "days");

    // ===== اعمال weekOffset =====
    const targetSaturday = saturday.clone().add(weekOffset, "weeks");

    // ===== ساخت ۷ روز =====
    const days = [];
    const dayNames = [
      "شنبه",
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنجشنبه",
      "جمعه",
    ];

    for (let i = 0; i < 7; i++) {
      const date = targetSaturday.clone().add(i, "days");
      days.push({
        dayName: dayNames[i],
        date: date.format("jYYYY/jMM/jDD"), // ← انگلیسی
        datePersian: toPersianDigits(date.format("jYYYY/jMM/jDD")), // ← جدید: فارسی
        dayOfMonth: toPersianDigits(date.format("jDD")),
        month: toPersianDigits(date.format("jMM")),
        dateObject: date,
        isToday: date.isSame(todayDate, "day"),
      });
    }

    return days;
  }, [weekOffset]);

  // ===== بازه‌ی نمایش هفته =====
  // const weekRangeLabel = useMemo(() => {
  //   if (weekDays.length === 0) return "";
  //   const first = weekDays[0];
  //   const last = weekDays[6];
  //   return `${first.dayOfMonth} ${moment(first.date, "jYYYY/jMM/jDD").format("jMMMM")} تا ${last.dayOfMonth} ${moment(last.date, "jYYYY/jMM/jDD").format("jMMMM")} ${moment(first.date, "jYYYY/jMM/jDD").format("jYYYY")}`;
  // }, [weekDays]);

  // ===== بازه‌ی نمایش هفته =====
  const weekRangeLabel = useMemo(() => {
    if (weekDays.length === 0) return "";
    const first = weekDays[0];
    const last = weekDays[6];
    return `${first.dayOfMonth} ${first.dateObject.format("jMMMM")} تا ${last.dayOfMonth} ${last.dateObject.format("jMMMM")} ${first.dateObject.format("jYYYY")}`;
  }, [weekDays]);

  // ===== جلسات به تفکیک روز =====
  // const appointmentsByDay = useMemo(() => {
  //   const map = {};

  //   weekDays.forEach((day) => {
  //     map[day.date] = appointments.filter((a) => a.date === day.date);
  //   });

  //   return map;
  // }, [appointments, weekDays]);

  // ===== جلسات به تفکیک روز =====
  // const appointmentsByDay = useMemo(() => {
  //   const map = {};

  //   weekDays.forEach((day) => {
  //     // ← از datePersian استفاده کن (چون appointments با اعداد فارسی ذخیره شدن)
  //     map[day.datePersian] = appointments.filter(
  //       (a) => toPersianDigits(a.date) === day.datePersian,
  //     );
  //   });

  //   return map;
  // }, [appointments, weekDays]);

  const appointmentsByDay = useMemo(() => {
    const map = {};

    weekDays.forEach((day) => {
      map[day.datePersian] = appointments.filter(
        (a) => toPersianDigits(a.date) === day.datePersian,
      );
    });

    return map;
  }, [appointments, weekDays]);

  // ===== گرفتن رنگ بر اساس وضعیت =====
  const getStatusColorClass = (appointment) => {
    const displayStatus = getDisplayStatus(appointment);

    if (displayStatus === "cancelled" || displayStatus === "no-show") {
      return styles.calendarCellCancelled;
    }
    if (displayStatus === "completed") {
      return styles.calendarCellCompleted;
    }
    if (displayStatus === "pending") {
      return styles.calendarCellPending;
    }
    // confirmed یا ongoing یا awaiting-confirmation
    return styles.calendarCellConfirmed;
  };

  // ===== گرفتن جلسه‌ی یه سلول خاص =====
  // const getCellAppointment = (date, hour) => {
  //   const dayAppointments = appointmentsByDay[date] || [];

  //   // ===== تبدیل hour به دقیقه =====
  //   const [h, m] = toEnglishDigits(hour).split(":").map(Number);
  //   const cellMinutes = h * 60 + m;

  //   return dayAppointments.find((app) => {
  //     const startTime = toEnglishDigits(
  //       app.startTime || app.time.split(" - ")[0],
  //     );
  //     const endTime = toEnglishDigits(app.endTime || app.time.split(" - ")[1]);

  //     const [startH, startM] = startTime.split(":").map(Number);
  //     const [endH, endM] = endTime.split(":").map(Number);

  //     const startMinutes = startH * 60 + startM;
  //     const endMinutes = endH * 60 + endM;

  //     return cellMinutes >= startMinutes && cellMinutes < endMinutes;
  //   });
  // };

  // ===== چک کردن اینکه این سلول شروع یه جلسه‌ست =====
  // const isCellStart = (appointment, hour) => {
  //   if (!appointment) return false;
  //   const startTime = toEnglishDigits(
  //     appointment.startTime || appointment.time.split(" - ")[0],
  //   );
  //   const [h, m] = toEnglishDigits(hour).split(":").map(Number);
  //   const cellMinutes = h * 60 + m;
  //   const [startH, startM] = startTime.split(":").map(Number);
  //   const startMinutes = startH * 60 + startM;
  //   return cellMinutes === startMinutes;
  // };

  // ===== چک کردن اینکه جلسه چند سلول طول می‌کشه =====
  // const getAppointmentSpan = (appointment) => {
  //   if (!appointment) return 1;

  //   const startTime = toEnglishDigits(
  //     appointment.startTime || appointment.time.split(" - ")[0],
  //   );
  //   const endTime = toEnglishDigits(
  //     appointment.endTime || appointment.time.split(" - ")[1],
  //   );

  //   const [startH, startM] = startTime.split(":").map(Number);
  //   const [endH, endM] = endTime.split(":").map(Number);

  //   const startMinutes = startH * 60 + startM;
  //   const endMinutes = endH * 60 + endM;

  //   return (endMinutes - startMinutes) / 30; // هر سلول ۳۰ دقیقه
  // };

  // ===== محاسبه‌ی position جلسه در ستون روز =====
  const getEventPosition = (appointment) => {
    const CALENDAR_START_HOUR = 8; // ۸:۰۰ صبح
    const SLOT_HEIGHT = 30; // هر ۳۰ دقیقه = 30px

    // ===== گرفتن ساعت شروع و پایان =====
    const startTime = toEnglishDigits(
      appointment.startTime || appointment.time.split(" - ")[0],
    );
    const endTime = toEnglishDigits(
      appointment.endTime || appointment.time.split(" - ")[1],
    );

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    if (isNaN(startH) || isNaN(endH)) return { top: null, height: 0 };

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const calendarStartMinutes = CALENDAR_START_HOUR * 60; // ۴۸۰

    // ===== اگه جلسه قبل از ۸ صبح باشه، از ۸ شروع کن =====
    const effectiveStart = Math.max(startMinutes, calendarStartMinutes);

    // ===== محاسبه‌ی top (نسبت به ۸:۰۰) =====
    const minutesFromStart = effectiveStart - calendarStartMinutes;
    const top = (minutesFromStart / 30) * SLOT_HEIGHT;

    // ===== محاسبه‌ی ارتفاع =====
    const durationMinutes = endMinutes - effectiveStart;
    const height = (durationMinutes / 30) * SLOT_HEIGHT - 2; // ← منهای ۲ برای gap

    return { top, height };
  };

  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>📅 تقویم من</h2>
          <p>نمای کلی جلسات هفتگی</p>
        </div>

        {/* ناوبری هفته */}
        <div className={styles.calendarNav}>
          <button
            className={styles.calendarNavBtn}
            onClick={() => setWeekOffset(weekOffset - 1)}
            title="هفته قبل"
          >
            ›
          </button>

          <span className={styles.calendarWeekLabel}>{weekRangeLabel}</span>

          <button
            className={styles.calendarNavBtn}
            onClick={() => setWeekOffset(weekOffset + 1)}
            title="هفته بعد"
          >
            ‹
          </button>

          {weekOffset !== 0 && (
            <button
              className={styles.calendarTodayBtn}
              onClick={() => setWeekOffset(0)}
            >
              امروز
            </button>
          )}
        </div>
      </div>

      {/* ===== راهنما ===== */}
      <div className={styles.calendarHint}>
        <span className={styles.calendarHintIcon}>💡</span>
        <p>
          برای مدیریت نوبت‌ها (تأیید، لغو، افزودن) به بخش{" "}
          <strong>«نوبت‌ها»</strong> بروید.
        </p>
      </div>

      {/* ===== راهنمای رنگ‌ها ===== */}
      <div className={styles.calendarLegend}>
        <span className={styles.calendarLegendItem}>
          <span
            className={`${styles.legendDot} ${styles.legendConfirmed}`}
          ></span>
          تأیید شده
        </span>
        <span className={styles.calendarLegendItem}>
          <span
            className={`${styles.legendDot} ${styles.legendPending}`}
          ></span>
          در انتظار
        </span>
        <span className={styles.calendarLegendItem}>
          <span
            className={`${styles.legendDot} ${styles.legendCompleted}`}
          ></span>
          برگزار شده
        </span>
        <span className={styles.calendarLegendItem}>
          <span
            className={`${styles.legendDot} ${styles.legendCancelled}`}
          ></span>
          لغو شده / برگزار نشده
        </span>
      </div>

      {/* ===== گرید تقویم ===== */}
      {/* <div className={styles.calendarWrapper}>
        <div className={styles.calendarGrid}>
          <div className={styles.calendarHeaderRow}>
            <div className={styles.calendarTimeHeader}></div>

            {weekDays.map((day) => (
              <div
                key={day.date}
                className={`${styles.calendarDayHeader} ${
                  day.isToday ? styles.calendarDayHeaderToday : ""
                }`}
              >
                <span className={styles.calendarDayName}>{day.dayName}</span>
                <span className={styles.calendarDayDate}>{day.dayOfMonth}</span>
              </div>
            ))}
          </div>

          <div className={styles.calendarBody}>
            <div className={styles.calendarTimeColumn}>
              {CALENDAR_HOURS.map((hour) => (
                <div key={hour} className={styles.calendarTimeCell}>
                  {hour.endsWith(":۰۰") ? hour : ""}
                </div>
              ))}
            </div>

            <div className={styles.calendarDaysColumns}>
              {weekDays.map((day) => (
                <div key={day.date} className={styles.calendarDayColumn}>
                  {CALENDAR_HOURS.map((hour, hourIndex) => {
                    const appointment = getCellAppointment(day.date, hour);
                    const isStart = isCellStart(appointment, hour);
                    const span = getAppointmentSpan(appointment);
                    const colorClass = appointment
                      ? getStatusColorClass(appointment)
                      : "";

                    if (appointment && !isStart) {
                      const prevHour =
                        hourIndex > 0 ? CALENDAR_HOURS[hourIndex - 1] : null;
                      const prevAppointment = prevHour
                        ? getCellAppointment(day.date, prevHour)
                        : null;

                      if (prevAppointment?.id === appointment.id) {
                        return null; // این سلول جزئی از جلسه‌ی بالاییه
                      }
                    }

                    return (
                      <div
                        key={hour}
                        className={`${styles.calendarCell} ${
                          appointment ? colorClass : styles.calendarCellEmpty
                        }`}
                        style={
                          appointment && isStart
                            ? { gridRow: `span ${span}` }
                            : {}
                        }
                        onClick={() =>
                          appointment && setSelectedAppointment(appointment)
                        }
                      >
                        {appointment && isStart && (
                          <div className={styles.calendarCellContent}>
                            <span className={styles.calendarCellPatient}>
                              {appointment.patient}
                            </span>
                            <span className={styles.calendarCellTime}>
                              {toPersianDigits(
                                appointment.startTime ||
                                  appointment.time.split(" - ")[0],
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div> */}

      {/* ===== گرید تقویم ===== */}
      <div className={styles.calendarWrapper}>
        <div className={styles.calendarGrid}>
          {/* ===== ردیف هدر (روزها) ===== */}
          <div className={styles.calendarHeaderRow}>
            <div className={styles.calendarTimeHeader}></div>
            {weekDays.map((day) => (
              <div
                key={day.date}
                className={`${styles.calendarDayHeader} ${
                  day.isToday ? styles.calendarDayHeaderToday : ""
                }`}
              >
                <span className={styles.calendarDayName}>{day.dayName}</span>
                <span className={styles.calendarDayDate}>{day.dayOfMonth}</span>
              </div>
            ))}
          </div>

          {/* ===== بدنه‌ی تقویم ===== */}
          <div className={styles.calendarBody}>
            {/* ستون ساعت‌ها */}
            <div className={styles.calendarTimeColumn}>
              {CALENDAR_HOURS.map((hour) => (
                <div key={hour} className={styles.calendarTimeCell}>
                  {hour.endsWith(":۰۰") ? hour : ""}
                </div>
              ))}
            </div>

            {/* ستون‌های روزها */}
            <div className={styles.calendarDaysColumns}>
              {weekDays.map((day) => (
                <div key={day.date} className={styles.calendarDayColumn}>
                  {/* لایه‌ی پس‌زمینه (۲۸ سلول خالی) */}
                  <div className={styles.calendarDayBg}>
                    {CALENDAR_HOURS.map((hour) => (
                      <div key={hour} className={styles.calendarBgCell} />
                    ))}
                  </div>

                  {/* لایه‌ی جلسات */}
                  {/* <div className={styles.calendarDayEvents}> */}
                  {/* {(appointmentsByDay[day.date] || []).map((appointment) => {
                      const { top, height } = getEventPosition(appointment);
                      if (top === null) return null;

                      const colorClass = getStatusColorClass(appointment);

                      return (
                        <div
                          key={appointment.id}
                          className={`${styles.calendarEvent} ${colorClass}`}
                          style={{ top: `${top}px`, height: `${height}px` }}
                          onClick={() => setSelectedAppointment(appointment)}
                        >
                          <span className={styles.calendarEventPatient}>
                            {appointment.patient}
                          </span>
                          <span className={styles.calendarEventTime}>
                            {toPersianDigits(
                              appointment.startTime ||
                                appointment.time.split(" - ")[0],
                            )}
                          </span>
                        </div>
                      );
                    })} */}
                  {/* لایه‌ی جلسات */}
                  <div className={styles.calendarDayEvents}>
                    {(appointmentsByDay[day.datePersian] || []).map(
                      (appointment) => {
                        const { top, height } = getEventPosition(appointment);
                        if (top === null) return null;

                        const colorClass = getStatusColorClass(appointment);

                        return (
                          <div
                            key={appointment.id}
                            className={`${styles.calendarEvent} ${colorClass}`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <span className={styles.calendarEventPatient}>
                              {appointment.patient}
                            </span>
                            <span className={styles.calendarEventTime}>
                              {toPersianDigits(
                                appointment.startTime ||
                                  appointment.time.split(" - ")[0],
                              )}
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
                // </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== مودال جزئیات جلسه ===== */}
      {/* {selectedAppointment && (
        <CalendarAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )} */}
      {selectedAppointment && (
        <CalendarAppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          toPersianDigits={toPersianDigits}
          getDisplayStatus={getDisplayStatus}
          getDisplayStatusInfo={getDisplayStatusInfo}
        />
      )}
    </div>
  );
}

// ============================================
// COMPONENT: Calendar Appointment Modal
// ============================================
// function CalendarAppointmentModal({ appointment, onClose }) {
function CalendarAppointmentModal({
  appointment,
  onClose,
  toPersianDigits,
  getDisplayStatus,
  getDisplayStatusInfo,
}) {
  const displayStatus = getDisplayStatus(appointment);
  const statusInfo = getDisplayStatusInfo(displayStatus);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.calendarAppointmentModal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>جزئیات جلسه</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.calendarModalRow}>
            <span className={styles.calendarModalLabel}>بیمار:</span>
            <span className={styles.calendarModalValue}>
              {appointment.patient}
            </span>
          </div>

          <div className={styles.calendarModalRow}>
            <span className={styles.calendarModalLabel}>نوع جلسه:</span>
            <span className={styles.calendarModalValue}>
              {appointment.type}
            </span>
          </div>

          <div className={styles.calendarModalRow}>
            <span className={styles.calendarModalLabel}>تاریخ:</span>
            <span className={styles.calendarModalValue}>
              {appointment.date}
            </span>
          </div>

          <div className={styles.calendarModalRow}>
            <span className={styles.calendarModalLabel}>ساعت:</span>
            <span className={styles.calendarModalValue}>
              {toPersianDigits(
                appointment.startTime || appointment.time.split(" - ")[0],
              )}{" "}
              -{" "}
              {toPersianDigits(
                appointment.endTime || appointment.time.split(" - ")[1],
              )}
            </span>
          </div>

          <div className={styles.calendarModalRow}>
            <span className={styles.calendarModalLabel}>وضعیت:</span>
            <span
              className={`${styles.calendarModalStatus} ${
                displayStatus === "confirmed"
                  ? styles.statusConfirmed
                  : displayStatus === "pending"
                    ? styles.statusPending
                    : displayStatus === "completed"
                      ? styles.statusCompleted
                      : styles.statusCancelled
              }`}
            >
              {statusInfo.label}
            </span>
          </div>

          {appointment.isOnline && (
            <div className={styles.calendarModalRow}>
              <span className={styles.calendarModalLabel}>نوع برگزاری:</span>
              <span className={styles.calendarModalValue}>جلسه آنلاین</span>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancelModal} onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}

export default CalendarView;
