import React, { useState, useMemo } from "react";
import styles from "./FinancialView.module.css";

// ============================================
// COMPONENT: Financial View
// ============================================
// function FinancialView({ appointments, setAppointments }) {
function FinancialView({
  appointments,
  setAppointments,
  moment,
  getAppointmentMoment,
  getDisplayStatus,
  toPersianDigits,
}) {
  // ===== State =====
  const [dateRange, setDateRange] = useState("all"); // all | thisYear | thisMonth | thisWeek
  const [paymentFilter, setPaymentFilter] = useState("all"); // all | paid | unpaid
  // const [selectedAppointment, setSelectedAppointment] = useState(null);

  // ===== محاسبه‌ی بازه =====
  const getRangeStartDate = () => {
    const now = moment();

    switch (dateRange) {
      case "thisWeek": {
        // شنبه‌ی این هفته
        const persianDayOfWeek = now.day() === 6 ? 0 : now.day() + 1;
        return now.clone().subtract(persianDayOfWeek, "days").startOf("day");
      }
      case "thisMonth": {
        // ۱ ماه جاری
        const jMonth = now.jMonth() + 1;
        const jYear = now.jYear();
        return moment(
          `${jYear}/${String(jMonth).padStart(2, "0")}/01`,
          "jYYYY/jMM/jDD",
        ).startOf("day");
      }
      case "thisYear": {
        // ۱ فروردین امسال
        const jYear = now.jYear();
        return moment(`${jYear}/01/01`, "jYYYY/jMM/jDD").startOf("day");
      }
      case "all":
      default:
        return null; // بدون محدودیت
    }
  };

  // ===== فیلتر appointments بر اساس بازه =====
  const filteredByRange = useMemo(() => {
    const startDate = getRangeStartDate();

    if (!startDate) return appointments;

    return appointments.filter((app) => {
      const appMoment = getAppointmentMoment(app);
      if (!appMoment.isValid()) return false;
      return appMoment.isSameOrAfter(startDate, "day");
    });
    // }, [appointments, dateRange]);
  }, [appointments, dateRange, getAppointmentMoment, moment]);

  // ===== جلسات برگزار شده =====
  const completedAppointments = useMemo(() => {
    return filteredByRange.filter((a) => getDisplayStatus(a) === "completed");
    // }, [filteredByRange]);
  }, [filteredByRange, getDisplayStatus]);

  // ===== آمار =====
  const stats = useMemo(() => {
    const completed = filteredByRange.filter(
      (a) => getDisplayStatus(a) === "completed",
    ).length;

    const noShow = filteredByRange.filter(
      (a) => getDisplayStatus(a) === "no-show",
    ).length;

    const cancelled = filteredByRange.filter(
      (a) => getDisplayStatus(a) === "cancelled",
    ).length;

    const pending = filteredByRange.filter((a) => {
      const ds = getDisplayStatus(a);
      return ds === "pending" || ds === "confirmed" || ds === "ongoing";
    }).length;

    // ===== درآمد کل =====
    const totalRevenue = filteredByRange
      .filter((a) => getDisplayStatus(a) === "completed")
      .reduce((sum, a) => sum + (a.price || 0), 0);

    return {
      completed,
      noShow,
      cancelled,
      pending,
      totalRevenue,
    };
    // }, [filteredByRange]);
  }, [filteredByRange, getDisplayStatus]);

  // ===== لیست تراکنش‌ها (فقط completed + no-show) =====
  const transactions = useMemo(() => {
    let filtered = filteredByRange.filter((a) => {
      const ds = getDisplayStatus(a);
      return ds === "completed" || ds === "no-show";
    });

    // ===== فیلتر پرداخت =====
    if (paymentFilter === "paid") {
      filtered = filtered.filter((a) => a.isPaid);
    } else if (paymentFilter === "unpaid") {
      filtered = filtered.filter((a) => !a.isPaid);
    }

    // ===== مرتب‌سازی (جدیدترین اول) =====
    return [...filtered].sort((a, b) => {
      const momentA = getAppointmentMoment(a);
      const momentB = getAppointmentMoment(b);
      return momentB - momentA;
    });
    // }, [filteredByRange, paymentFilter]);
  }, [filteredByRange, paymentFilter, getDisplayStatus, getAppointmentMoment]);

  // ===== تغییر وضعیت پرداخت =====
  const handleTogglePaid = (appointment) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointment.id
          ? {
              ...item,
              isPaid: !item.isPaid,
              paidAt: !item.isPaid
                ? toPersianDigits(moment().format("jYYYY/jMM/jDD"))
                : null,
            }
          : item,
      ),
    );
  };

  // ===== شمارنده پرداخت‌ها =====
  const paidCount = completedAppointments.filter((a) => a.isPaid).length;
  const unpaidCount = completedAppointments.filter((a) => !a.isPaid).length;

  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>مالی</h2>
          <p>گزارش درآمد و وضعیت پرداخت جلسات</p>
        </div>

        {/* فیلتر بازه */}
        <div className={styles.financialRangeFilter}>
          <select
            className={styles.formSelect}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">از ابتدا</option>
            <option value="thisYear">امسال</option>
            <option value="thisMonth">این ماه</option>
            <option value="thisWeek">این هفته</option>
          </select>
        </div>
      </div>

      {/* ===== آمار ===== */}
      <div className={styles.financialStatsGrid}>
        {/* برگزار شده */}
        <div
          className={`${styles.financialStatCard} ${styles.finStatCompleted}`}
        >
          {/* <div className={styles.finStatIcon}>✅</div> */}
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.completed)}
            </span>
            <span className={styles.finStatLabel}>برگزار شده</span>
          </div>
        </div>

        {/* برگزار نشده */}
        <div className={`${styles.financialStatCard} ${styles.finStatNoShow}`}>
          {/* <div className={styles.finStatIcon}>⚠️</div> */}
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.noShow + stats.cancelled)}
            </span>
            <span className={styles.finStatLabel}>برگزار نشده / لغو شده</span>
          </div>
        </div>

        {/* در انتظار */}
        <div className={`${styles.financialStatCard} ${styles.finStatPending}`}>
          {/* <div className={styles.finStatIcon}>⏳</div> */}
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.pending)}
            </span>
            <span className={styles.finStatLabel}>در انتظار برگزاری</span>
          </div>
        </div>

        {/* درآمد کل */}
        <div className={`${styles.financialStatCard} ${styles.finStatRevenue}`}>
          {/* <div className={styles.finStatIcon}>💰</div> */}
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.totalRevenue.toLocaleString("en-US"))}
            </span>
            <span className={styles.finStatLabel}>درآمد کل (تومان)</span>
          </div>
        </div>
      </div>

      {/* ===== راهنمای مالی ===== */}
      <div className={styles.financialHint}>
        {/* <span className={styles.financialHintIcon}>💡</span> */}
        <p>
          درآمد فقط از جلسات <strong>برگزار شده</strong> محاسبه می‌شود. برای هر
          جلسه، وضعیت پرداخت بیمار را تایید کنید.
        </p>
      </div>

      {/* ===== بخش تراکنش‌ها ===== */}
      <div className={styles.financialTransactionsSection}>
        <div className={styles.financialTransHeader}>
          <div>
            <h3>تراکنش‌ها</h3>
            <p className={styles.financialTransSubtitle}>
              {toPersianDigits(paidCount)} پرداخت شده •{" "}
              {toPersianDigits(unpaidCount)} پرداخت نشده
            </p>
          </div>

          {/* فیلتر پرداخت */}
          <div className={styles.financialFilterTabs}>
            <button
              className={`${styles.financialFilterTab} ${
                paymentFilter === "all" ? styles.financialFilterTabActive : ""
              }`}
              onClick={() => setPaymentFilter("all")}
            >
              همه ({toPersianDigits(transactions.length)})
            </button>
            <button
              className={`${styles.financialFilterTab} ${
                paymentFilter === "paid" ? styles.financialFilterTabActive : ""
              }`}
              onClick={() => setPaymentFilter("paid")}
            >
              پرداخت شده ({toPersianDigits(paidCount)})
            </button>
            <button
              className={`${styles.financialFilterTab} ${
                paymentFilter === "unpaid"
                  ? styles.financialFilterTabActive
                  : ""
              }`}
              onClick={() => setPaymentFilter("unpaid")}
            >
              پرداخت نشده ({toPersianDigits(unpaidCount)})
            </button>
          </div>
        </div>

        {/* ===== لیست تراکنش‌ها ===== */}
        <div className={styles.financialTransList}>
          {transactions.length > 0 ? (
            transactions.map((appointment) => {
              const displayStatus = getDisplayStatus(appointment);
              const isCompleted = displayStatus === "completed";
              const isNoShow = displayStatus === "no-show";

              return (
                <div
                  key={appointment.id}
                  className={`${styles.financialTransItem} ${
                    appointment.isPaid ? styles.finTransItemPaid : ""
                  }`}
                >
                  {/* تاریخ */}
                  <div className={styles.finTransDate}>
                    {appointment.date}
                    <span className={styles.finTransTime}>
                      {toPersianDigits(
                        appointment.startTime ||
                          appointment.time.split(" - ")[0],
                      )}
                    </span>
                  </div>

                  {/* بیمار */}
                  <div className={styles.finTransPatient}>
                    <span className={styles.finTransAvatar}>👤</span>
                    <div>
                      <span className={styles.finTransName}>
                        {appointment.patient}
                      </span>
                      <span className={styles.finTransType}>
                        {appointment.type}
                      </span>
                    </div>
                  </div>

                  {/* وضعیت جلسه */}
                  <div className={styles.finTransStatus}>
                    {isCompleted && (
                      <span className={styles.statusCompletedBadge}>
                        برگزار شده
                      </span>
                    )}
                    {isNoShow && (
                      <span className={styles.statusNoShowBadge}>
                        برگزار نشده
                      </span>
                    )}
                  </div>

                  {/* مبلغ */}
                  <div className={styles.finTransAmount}>
                    {toPersianDigits(
                      (appointment.price || 0).toLocaleString("en-US"),
                    )}{" "}
                    <span className={styles.finTransAmountUnit}>تومان</span>
                  </div>

                  {/* وضعیت پرداخت */}
                  <div className={styles.finTransPayment}>
                    {isCompleted ? (
                      <button
                        className={`${styles.finTransPayBtn} ${
                          appointment.isPaid
                            ? styles.finTransPayBtnPaid
                            : styles.finTransPayBtnUnpaid
                        }`}
                        onClick={() => handleTogglePaid(appointment)}
                        title={
                          appointment.isPaid
                            ? "لغو تایید پرداخت"
                            : "تایید پرداخت"
                        }
                      >
                        {appointment.isPaid ? "پرداخت شده" : "پرداخت نشده"}
                      </button>
                    ) : (
                      <span className={styles.finTransNoPayment}>—</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              {/* <span className={styles.emptyIcon}>💰</span> */}
              <h3>هیچ تراکنشی در این بازه وجود ندارد</h3>
              <p>جلسات برگزار شده یا برگزار نشده در این بازه ثبت نشده است.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancialView;
