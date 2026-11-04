import React, { useState, useMemo } from "react";
import styles from "./FinancialView.module.css";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

// ============================================
// COMPONENT: Financial View
// ============================================
function FinancialView({
  appointments = [],
  setAppointments,
  moment,
  getAppointmentMoment,
  getDisplayStatus,
  toPersianDigits,
}) {
  const [dateRange, setDateRange] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // صفر = بازه فعلی، منفی = بازه‌های گذشته
  const [periodOffset, setPeriodOffset] = useState(0);

  // ============================================
  // DATE HELPERS
  // ============================================
  // ساخت ابتدای یک ماه شمسی
  const getJalaliMonthStart = (year, month) => {
    const absoluteMonth = year * 12 + (month - 1);

    const targetYear = Math.floor(absoluteMonth / 12);
    const targetMonth = (absoluteMonth % 12) + 1;

    return moment(
      `${targetYear}/${String(targetMonth).padStart(2, "0")}/01`,
      "jYYYY/jMM/jDD",
    ).startOf("day");
  };

  // محاسبه بازه انتخاب‌شده
  const periodBounds = useMemo(() => {
    const now = moment();

    switch (dateRange) {
      case "thisWeek": {
        // شروع هفته: شنبه
        const persianDayOfWeek = now.day() === 6 ? 0 : now.day() + 1;

        const start = now
          .clone()
          .subtract(persianDayOfWeek, "days")
          .startOf("day")
          .add(periodOffset * 7, "days");

        return {
          start,
          end: start.clone().add(7, "days"),
        };
      }

      case "thisMonth": {
        const year = now.jYear();
        const month = now.jMonth() + 1;

        const start = getJalaliMonthStart(year, month + periodOffset);

        return {
          start,
          end: getJalaliMonthStart(year, month + periodOffset + 1),
        };
      }

      case "thisYear": {
        const targetYear = now.jYear() + periodOffset;

        const start = moment(`${targetYear}/01/01`, "jYYYY/jMM/jDD").startOf(
          "day",
        );

        const end = moment(`${targetYear + 1}/01/01`, "jYYYY/jMM/jDD").startOf(
          "day",
        );

        return {
          start,
          end,
        };
      }

      case "all":
      default:
        return null;
    }
  }, [dateRange, periodOffset, moment]);

  // عنوان بازه انتخاب‌شده
  const periodTitle = useMemo(() => {
    if (!periodBounds) return "تمام دوره‌ها";

    if (dateRange === "thisWeek") {
      const lastDay = periodBounds.end.clone().subtract(1, "day");

      return `${periodBounds.start.format("jD jMMMM")} تا ${lastDay.format("jD jMMMM")}`;
    }

    if (dateRange === "thisMonth") {
      return periodBounds.start.format("jMMMM jYYYY");
    }

    if (dateRange === "thisYear") {
      return periodBounds.start.format("jYYYY");
    }

    return "";
  }, [periodBounds, dateRange]);

  // ============================================
  // FILTER APPOINTMENTS BY SELECTED PERIOD
  // ============================================
  const filteredByRange = useMemo(() => {
    if (!periodBounds) return appointments;

    return appointments.filter((appointment) => {
      const appMoment = getAppointmentMoment(appointment);

      if (!appMoment.isValid()) return false;

      return (
        appMoment.isSameOrAfter(periodBounds.start, "day") &&
        appMoment.isBefore(periodBounds.end, "day")
      );
    });
  }, [appointments, periodBounds, getAppointmentMoment]);

  // ============================================
  // COMPLETED APPOINTMENTS
  // ============================================
  const completedAppointments = useMemo(() => {
    return filteredByRange
      .filter((appointment) => getDisplayStatus(appointment) === "completed")
      .sort((a, b) => getAppointmentMoment(a) - getAppointmentMoment(b));
  }, [filteredByRange, getDisplayStatus, getAppointmentMoment]);

  // ============================================
  // MONTHLY / WEEKLY / DAILY REVENUE CHART
  // ============================================
  const monthlyRevenue = useMemo(() => {
    const appointmentsWithDates = completedAppointments
      .map((appointment) => ({
        appointment,
        date: getAppointmentMoment(appointment),
      }))
      .filter(({ date }) => date.isValid());

    // محاسبه درآمد یک بازه
    const calculateRevenue = (start, end) => {
      return appointmentsWithDates.reduce((sum, item) => {
        const isInRange =
          item.date.isSameOrAfter(start, "day") &&
          item.date.isBefore(end, "day");

        if (!isInRange) return sum;

        return sum + (Number(item.appointment.price) || 0);
      }, 0);
    };

    // ===== نمودار روزانه: این هفته =====
    if (dateRange === "thisWeek" && periodBounds) {
      return Array.from({ length: 7 }, (_, index) => {
        const start = periodBounds.start.clone().add(index, "days");

        const end = start.clone().add(1, "day");

        return {
          key: start.format("jYYYY-jMM-jDD"),
          label: start.format("dddd"),
          subLabel: toPersianDigits(start.format("jD")),
          timestamp: start.valueOf(),
          revenue: calculateRevenue(start, end),
        };
      });
    }

    // ===== نمودار هفتگی: این ماه =====
    if (dateRange === "thisMonth" && periodBounds) {
      const totalDays = periodBounds.end.diff(periodBounds.start, "days");

      const weekCount = Math.ceil(totalDays / 7);

      return Array.from({ length: weekCount }, (_, index) => {
        const start = periodBounds.start.clone().add(index * 7, "days");

        const end = moment.min(
          start.clone().add(7, "days"),
          periodBounds.end.clone(),
        );

        return {
          key: `week-${index + 1}`,
          label: `هفته ${toPersianDigits(index + 1)}`,
          subLabel: `${toPersianDigits(start.format("jD"))} تا ${toPersianDigits(
            end.clone().subtract(1, "day").format("jD"),
          )}`,
          timestamp: start.valueOf(),
          revenue: calculateRevenue(start, end),
        };
      });
    }

    // ===== نمودار ماهانه: امسال =====
    if (dateRange === "thisYear" && periodBounds) {
      const year = periodBounds.start.jYear();

      return Array.from({ length: 12 }, (_, index) => {
        const start = getJalaliMonthStart(year, index + 1);

        const end = getJalaliMonthStart(year, index + 2);

        return {
          key: `${year}-${index + 1}`,
          label: start.format("jMMMM"),
          subLabel: "",
          timestamp: start.valueOf(),
          revenue: calculateRevenue(start, end),
        };
      });
    }

    // ===== نمودار ماهانه: از ابتدا =====
    const monthlyData = new Map();

    appointmentsWithDates.forEach(({ appointment, date }) => {
      const year = date.jYear();
      const month = date.jMonth() + 1;
      const key = `${year}-${month}`;

      if (!monthlyData.has(key)) {
        const start = getJalaliMonthStart(year, month);

        monthlyData.set(key, {
          key,
          label: start.format("jMMMM jYYYY"),
          subLabel: "",
          timestamp: start.valueOf(),
          revenue: 0,
        });
      }

      monthlyData.get(key).revenue += Number(appointment.price) || 0;
    });

    return Array.from(monthlyData.values()).sort(
      (a, b) => a.timestamp - b.timestamp,
    );
  }, [
    completedAppointments,
    dateRange,
    periodBounds,
    getAppointmentMoment,
    toPersianDigits,
    moment,
  ]);

  // ============================================
  // CHART DATA & SUMMARY
  // ============================================

  // مقادیر صفر را برای نمودار به null تبدیل می‌کنیم
  const chartData = monthlyRevenue.map((item) => ({
    ...item,
    revenue: item.revenue > 0 ? item.revenue : null,
  }));

  // فقط بازه‌هایی که درآمد دارند
  const positiveRevenueValues = monthlyRevenue
    .map((item) => item.revenue)
    .filter((revenue) => revenue > 0);

  // خلاصه آماری نمودار
  const chartSummary = {
    average:
      positiveRevenueValues.length > 0
        ? Math.round(
            positiveRevenueValues.reduce((sum, revenue) => sum + revenue, 0) /
              positiveRevenueValues.length,
          )
        : null,

    maximum:
      positiveRevenueValues.length > 0
        ? Math.max(...positiveRevenueValues)
        : null,

    minimum:
      positiveRevenueValues.length > 0
        ? Math.min(...positiveRevenueValues)
        : null,
  };

  // عنوان بازه آماری
  const chartPeriodUnit =
    dateRange === "thisWeek"
      ? "روزانه"
      : dateRange === "thisMonth"
        ? "هفتگی"
        : "ماهانه";

  // فرمت محور عمودی
  const formatRevenueAxis = (value) => {
    if (value === 0) return "";

    if (value >= 1000000) {
      return `${toPersianDigits((value / 1000000).toFixed(1))}M`;
    }

    if (value >= 1000) {
      return `${toPersianDigits(Math.round(value / 1000))}K`;
    }

    return toPersianDigits(value.toLocaleString("en-US"));
  };

  // ============================================
  // FINANCIAL STATISTICS
  // ============================================
  const stats = useMemo(() => {
    const completed = filteredByRange.filter(
      (appointment) => getDisplayStatus(appointment) === "completed",
    ).length;

    const noShow = filteredByRange.filter(
      (appointment) => getDisplayStatus(appointment) === "no-show",
    ).length;

    const cancelled = filteredByRange.filter(
      (appointment) => getDisplayStatus(appointment) === "cancelled",
    ).length;

    const pending = filteredByRange.filter((appointment) => {
      const status = getDisplayStatus(appointment);

      return (
        status === "pending" || status === "confirmed" || status === "ongoing"
      );
    }).length;

    const totalRevenue = completedAppointments.reduce(
      (sum, appointment) => sum + (Number(appointment.price) || 0),
      0,
    );

    return {
      completed,
      noShow,
      cancelled,
      pending,
      totalRevenue,
    };
  }, [filteredByRange, completedAppointments, getDisplayStatus]);

  // ============================================
  // TRANSACTIONS: COMPLETED ONLY
  // ============================================

  const transactions = useMemo(() => {
    let filtered = [...completedAppointments];

    if (paymentFilter === "paid") {
      filtered = filtered.filter((appointment) => appointment.isPaid);
    } else if (paymentFilter === "unpaid") {
      filtered = filtered.filter((appointment) => !appointment.isPaid);
    }

    return filtered.sort(
      (a, b) => getAppointmentMoment(b) - getAppointmentMoment(a),
    );
  }, [completedAppointments, paymentFilter, getAppointmentMoment]);

  // ============================================
  // PAYMENT HANDLERS
  // ============================================

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

  const paidCount = completedAppointments.filter(
    (appointment) => appointment.isPaid,
  ).length;

  const unpaidCount = completedAppointments.length - paidCount;

  // ============================================
  // PERIOD NAVIGATION
  // ============================================
  const handleRangeChange = (value) => {
    setDateRange(value);
    setPeriodOffset(0);
    setPaymentFilter("all");
  };

  const handlePreviousPeriod = () => {
    setPeriodOffset((previous) => previous - 1);
  };

  const handleNextPeriod = () => {
    if (periodOffset < 0) {
      setPeriodOffset((previous) => previous + 1);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={styles.pageContent}>
      {/* ===== PAGE HEADER ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>مالی</h2>
          <p>گزارش درآمد و وضعیت پرداخت جلسات</p>
        </div>

        <div className={styles.financialRangeFilter}>
          <select
            className={styles.formSelect}
            value={dateRange}
            onChange={(e) => handleRangeChange(e.target.value)}
          >
            <option value="all">از ابتدا</option>
            <option value="thisYear">امسال</option>
            <option value="thisMonth">این ماه</option>
            <option value="thisWeek">این هفته</option>
          </select>
        </div>
      </div>

      {/* ===== FINANCIAL STATISTICS ===== */}
      <div className={styles.financialStatsGrid}>
        <div
          className={`${styles.financialStatCard} ${styles.finStatCompleted}`}
        >
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.completed)}
            </span>
            <span className={styles.finStatLabel}>برگزار شده</span>
          </div>
        </div>

        <div className={`${styles.financialStatCard} ${styles.finStatNoShow}`}>
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.noShow + stats.cancelled)}
            </span>
            <span className={styles.finStatLabel}>برگزار نشده / لغو شده</span>
          </div>
        </div>

        <div className={`${styles.financialStatCard} ${styles.finStatPending}`}>
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.pending)}
            </span>
            <span className={styles.finStatLabel}>در انتظار برگزاری</span>
          </div>
        </div>

        <div className={`${styles.financialStatCard} ${styles.finStatRevenue}`}>
          <div className={styles.finStatContent}>
            <span className={styles.finStatNumber}>
              {toPersianDigits(stats.totalRevenue.toLocaleString("en-US"))}
            </span>
            <span className={styles.finStatLabel}>درآمد کل (تومان)</span>
          </div>
        </div>
      </div>

      {/* ===== MONTHLY / WEEKLY / DAILY REVENUE CHART ===== */}

      {/* <div className={styles.monthlyRevenueSection}>
        <div className={styles.monthlyRevenueHeader}>
          <div>
            <h3>نمودار درآمد</h3>

            <p>
              {dateRange === "thisWeek"
                ? "درآمد روزانه"
                : dateRange === "thisMonth"
                  ? "درآمد هفتگی"
                  : "درآمد ماهانه"}
            </p>
          </div>

          {dateRange !== "all" && (
            <div className={styles.chartNavigation}>
              <button
                type="button"
                className={styles.chartNavButton}
                onClick={handlePreviousPeriod}
                aria-label="بازه قبلی"
                title="بازه قبلی"
              >
                <span>‹</span>
              </button>

              <span className={styles.chartPeriodLabel}>{periodTitle}</span>

              <button
                type="button"
                className={styles.chartNavButton}
                onClick={handleNextPeriod}
                disabled={periodOffset >= 0}
                aria-label="بازه بعدی"
                title="بازه بعدی"
              >
                <span>›</span>
              </button>
            </div>
          )}
        </div>

        {monthlyRevenue.length > 0 ? (
          <div className={styles.monthlyRevenueChart}>
            {monthlyRevenue.map((item) => {
              const height = (item.revenue / maxMonthlyRevenue) * 100;

              return (
                <div key={item.key} className={styles.monthlyRevenueBarItem}>
                  <div className={styles.monthlyRevenueValue}>
                    {toPersianDigits(item.revenue.toLocaleString("en-US"))}
                  </div>

                  <div className={styles.monthlyRevenueBarWrapper}>
                    <div
                      className={styles.monthlyRevenueBar}
                      style={{
                        height: `${height}%`,
                      }}
                      title={`${item.label}: ${toPersianDigits(
                        item.revenue.toLocaleString("en-US"),
                      )} تومان`}
                    />
                  </div>

                  <span className={styles.monthlyRevenueLabel}>
                    {item.label}
                  </span>

                  {item.subLabel && (
                    <span className={styles.monthlyRevenueSubLabel}>
                      {item.subLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.monthlyRevenueEmpty}>
            <p>در این بازه درآمدی برای نمایش نمودار ثبت نشده است.</p>
          </div>
        )}
      </div> */}

      {/* ===== REVENUE LINE CHART ===== */}

      <div className={styles.monthlyRevenueSection}>
        <div className={styles.monthlyRevenueHeader}>
          <div>
            <h3>درآمد {chartPeriodUnit}</h3>

            <p>روند درآمد حاصل از جلسات برگزارشده</p>
          </div>

          {/* Period Navigation */}
          {dateRange !== "all" && (
            // <div className={styles.chartNavigation}>
            //   <button
            //     type="button"
            //     className={styles.chartNavButton}
            //     onClick={handlePreviousPeriod}
            //     aria-label="بازه قبلی"
            //   >
            //     ‹
            //   </button>

            //   <span className={styles.chartPeriodLabel}>{periodTitle}</span>

            //   <button
            //     type="button"
            //     className={styles.chartNavButton}
            //     onClick={handleNextPeriod}
            //     disabled={periodOffset >= 0}
            //     aria-label="بازه بعدی"
            //   >
            //     ›
            //   </button>
            // </div>
            <div className={styles.chartNavigation}>
              <button
                type="button"
                className={styles.chartNavButton}
                onClick={handlePreviousPeriod}
                aria-label="بازه قبلی"
              >
                ‹
              </button>

              <span className={styles.chartPeriodLabel}>{periodTitle}</span>

              <button
                type="button"
                className={styles.chartNavButton}
                onClick={handleNextPeriod}
                disabled={periodOffset >= 0}
                aria-label="بازه بعدی"
              >
                ›
              </button>

              {periodOffset !== 0 && (
                <button
                  type="button"
                  className={styles.todayButton}
                  onClick={() => setPeriodOffset(0)}
                >
                  <icon name="calendar-days" size="xs" />
                  امروز
                </button>
              )}
            </div>
          )}
        </div>

        {/* Line Chart */}

        {positiveRevenueValues.length > 0 ? (
          <>
            <div className={styles.lineChartContainer}>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 15,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="label"
                    tick={{
                      fontSize: 12,
                      fill: "#64748b",
                    }}
                    tickLine={false}
                    axisLine={{
                      stroke: "#cbd5e1",
                    }}
                    interval="preserveStartEnd"
                    minTickGap={15}
                  />

                  <YAxis
                    tickFormatter={formatRevenueAxis}
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                    tickLine={false}
                    axisLine={false}
                    width={65}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      padding: "12px",
                      direction: "rtl",
                    }}
                    labelStyle={{
                      color: "#1e293b",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                    formatter={(value) => [
                      `${toPersianDigits(
                        Number(value).toLocaleString("en-US"),
                      )} تومان`,
                      "درآمد",
                    ]}
                    labelFormatter={(label) => label}
                    filterNull
                  />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="درآمد"
                    stroke="#2d7d6e"
                    strokeWidth={3}
                    connectNulls={false}
                    dot={{
                      fill: "#2d7d6e",
                      stroke: "#fff",
                      strokeWidth: 2,
                      r: 5,
                    }}
                    activeDot={{
                      fill: "#2d7d6e",
                      stroke: "#fff",
                      strokeWidth: 2,
                      r: 8,
                    }}
                    isAnimationActive
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Chart Summary */}

            <div className={styles.chartSummary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>
                  میانگین درآمد {chartPeriodUnit}:
                </span>

                <span className={styles.summaryValue}>
                  {toPersianDigits(
                    chartSummary.average.toLocaleString("en-US"),
                  )}{" "}
                  تومان
                </span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>بیشترین درآمد:</span>

                <span className={styles.summaryValue}>
                  {toPersianDigits(
                    chartSummary.maximum.toLocaleString("en-US"),
                  )}{" "}
                  تومان
                </span>
              </div>

              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>کمترین درآمد:</span>

                <span className={styles.summaryValue}>
                  {toPersianDigits(
                    chartSummary.minimum.toLocaleString("en-US"),
                  )}{" "}
                  تومان
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className={styles.monthlyRevenueEmpty}>
            <p>در این بازه درآمدی برای نمایش نمودار ثبت نشده است.</p>
          </div>
        )}
      </div>

      {/* ===== FINANCIAL HINT ===== */}
      <div className={styles.financialHint}>
        <p>
          درآمد فقط از جلسات <strong>برگزار شده</strong> محاسبه می‌شود. برای هر
          جلسه، وضعیت پرداخت بیمار را تایید کنید.
        </p>
      </div>

      {/* ===== TRANSACTIONS ===== */}

      <div className={styles.financialTransactionsSection}>
        <div className={styles.financialTransHeader}>
          <div>
            <h3>تراکنش‌ها</h3>

            <p className={styles.financialTransSubtitle}>
              {toPersianDigits(paidCount)} پرداخت شده •{" "}
              {toPersianDigits(unpaidCount)} پرداخت نشده
            </p>
          </div>

          {/* Payment Filters */}

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

        {/* Transaction List */}

        <div className={styles.financialTransList}>
          {transactions.length > 0 ? (
            transactions.map((appointment) => (
              <div
                key={appointment.id}
                className={`${styles.financialTransItem} ${
                  appointment.isPaid ? styles.finTransItemPaid : ""
                }`}
              >
                {/* Date */}

                <div className={styles.finTransDate}>
                  {appointment.date}

                  <span className={styles.finTransTime}>
                    {toPersianDigits(
                      appointment.startTime ||
                        appointment.time?.split(" - ")[0] ||
                        "",
                    )}
                  </span>
                </div>

                {/* Patient */}

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

                {/* Appointment Status */}

                <div className={styles.finTransStatus}>
                  <span className={styles.statusCompletedBadge}>
                    برگزار شده
                  </span>
                </div>

                {/* Amount */}

                <div className={styles.finTransAmount}>
                  {toPersianDigits(
                    (Number(appointment.price) || 0).toLocaleString("en-US"),
                  )}

                  <span className={styles.finTransAmountUnit}>تومان</span>
                </div>

                {/* Payment Status */}

                <div className={styles.finTransPayment}>
                  <button
                    className={`${styles.finTransPayBtn} ${
                      appointment.isPaid
                        ? styles.finTransPayBtnPaid
                        : styles.finTransPayBtnUnpaid
                    }`}
                    onClick={() => handleTogglePaid(appointment)}
                    title={
                      appointment.isPaid ? "لغو تایید پرداخت" : "تایید پرداخت"
                    }
                  >
                    {appointment.isPaid ? "پرداخت شده" : "پرداخت نشده"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <h3>هیچ تراکنشی در این بازه وجود ندارد</h3>
              <p>جلسه برگزارشده‌ای در این بازه ثبت نشده است.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancialView;
