import { useState } from "react";
import styles from "./Exercises.module.css";

// ============================================
// COMPONENT: Exercise Management
// ============================================

function ExerciseManagement({
  appointments = [],
  exerciseGroups = [],
  setExercises,
}) {
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [showCompleted, setShowCompleted] = useState(true);

  // ==========================================
  // Helper Functions
  // ==========================================

  // تبدیل ارقام فارسی و عربی به انگلیسی برای مرتب‌سازی تاریخ
  const normalizeDigits = (value = "") =>
    String(value)
      .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

  // تبدیل تاریخ به مقدار قابل مرتب‌سازی
  const getDateSortValue = (date = "") => {
    const normalizedDate = normalizeDigits(date);
    const parts = normalizedDate.split("/").map(Number);

    if (parts.length !== 3 || parts.some(Number.isNaN)) {
      return 0;
    }

    const [year, month, day] = parts;

    return year * 10000 + month * 100 + day;
  };

  // ==========================================
  // Completed Appointments
  // ==========================================

  // فقط جلسات انجام‌شده‌ای که حداقل یک تمرین دارند
  // const completedAppointments = appointments
  //   .filter((appointment) => appointment.status === "completed")
  //   .filter((appointment) =>
  //     exercises.some(
  //       (exercise) => String(exercise.appointmentId) === String(appointment.id),
  //     ),
  //   )
  //   .sort((a, b) => getDateSortValue(b.date) - getDateSortValue(a.date));

  const completedAppointments = appointments
    .filter((appointment) => appointment.status === "completed")
    .sort((a, b) => getDateSortValue(b.date) - getDateSortValue(a.date));

  // تعداد تمرین‌های اختصاص‌یافته به هر جلسه
  const getAppointmentExerciseCount = (appointmentId) => {
    const group = exerciseGroups.find(
      (item) => String(item.appointmentId) === String(appointmentId),
    );

    return group?.exercises?.length ?? 0;
  };

  // ساخت متن نمایشی گزینه‌های انتخاب جلسه
  const getAppointmentOptionLabel = (appointment, index) => {
    const sessionName =
      appointment.title ||
      appointment.type ||
      `جلسه ${completedAppointments.length - index}`;

    const exerciseCount = getAppointmentExerciseCount(appointment.id);

    const details = [
      appointment.date,
      appointment.time,
      `${exerciseCount} تمرین`,
    ].filter(Boolean);

    return `${sessionName} · ${details.join(" · ")}`;
  };

  // جلسه انتخاب‌شده
  const selectedAppointment =
    completedAppointments.find(
      (appointment) => String(appointment.id) === String(selectedAppointmentId),
    ) ||
    completedAppointments[0] ||
    null;

  // // جلسه انتخاب‌شده
  // const selectedAppointment =
  //   completedAppointments.find(
  //     (appointment) => String(appointment.id) === String(selectedAppointmentId),
  //   ) ||
  //   completedAppointments[0] ||
  //   null;

  // // تمرین‌های مربوط به جلسه انتخاب‌شده
  // const appointmentExercises = selectedAppointment
  //   ? exercises.filter(
  //       (exercise) =>
  //         String(exercise.appointmentId) === String(selectedAppointment.id),
  //     )
  //   : [];

  // const selectedExerciseGroup = selectedAppointmentId
  //   ? exerciseGroups.find(
  //       (group) =>
  //         String(group.appointmentId) === String(selectedAppointmentId.id),
  //     )
  //   : null;

  // const appointmentExercises = selectedExerciseGroup?.exercises ?? [];

  const selectedExerciseGroup = selectedAppointment
    ? exerciseGroups.find(
        (group) =>
          String(group.appointmentId) === String(selectedAppointment.id),
      )
    : null;

  const appointmentExercises = selectedExerciseGroup?.exercises ?? [];

  // ==========================================
  // Selected Appointment Exercises
  // ==========================================

  // فیلتر تمرین‌ها بر اساس نوع و وضعیت
  const filteredExercises = appointmentExercises.filter((exercise) => {
    const normalizedType =
      exercise.type === "one-time" ? "one_time" : exercise.type;

    if (filter !== "all" && normalizedType !== filter) {
      return false;
    }

    if (!showCompleted && exercise.completed) {
      return false;
    }

    return true;
  });

  // ==========================================
  // Overall Statistics
  // ==========================================

  const allExercises = exerciseGroups.flatMap((group) => group.exercises ?? []);

  const completedCount = allExercises.filter(
    (exercise) => exercise.completed,
  ).length;

  const totalCount = allExercises.length;

  const remainingCount = totalCount - completedCount;

  const overallProgress =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // آمار کلی تمام تمرین‌های بیمار، نه فقط جلسه انتخاب‌شده
  // const completedCount = exercises.filter(
  //   (exercise) => exercise.completed,
  // ).length;

  // const totalCount = exercises.length;
  // const remainingCount = totalCount - completedCount;

  // const overallProgress =
  //   totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // آمار جلسه انتخاب‌شده
  const sessionCompletedCount = appointmentExercises.filter(
    (exercise) => exercise.completed,
  ).length;

  const sessionTotalCount = appointmentExercises.length;

  // ==========================================
  // Toggle Exercise Completion
  // ==========================================

  // const toggleComplete = (exerciseId, appointmentId) => {
  //   if (!setExercises) return;

  //   setExercises((prev) =>
  //     prev.map((exercise) => {
  //       const isTargetExercise =
  //         String(exercise.id) === String(exerciseId) &&
  //         String(exercise.appointmentId) === String(appointmentId);

  //       if (!isTargetExercise) return exercise;

  //       const nextCompleted = !exercise.completed;

  //       return {
  //         ...exercise,
  //         completed: nextCompleted,
  //         progress: nextCompleted ? 100 : 0,
  //       };
  //     }),
  //   );
  // };

  // const toggleComplete = (exerciseId, appointmentId) => {
  //   if (!setExercises) return;

  //   setExercises((prev) =>
  //     prev.map((group) => {
  //       if (String(group.appointmentId) !== String(appointmentId)) {
  //         return group;
  //       }

  //       return {
  //         ...group,

  //         exercises: group.exercises.map((exercise) => {
  //           if (String(exercise.id) !== String(exerciseId)) {
  //             return exercise;
  //           }

  //           const nextCompleted = !exercise.completed;

  //           return {
  //             ...exercise,
  //             completed: nextCompleted,
  //             progress: nextCompleted ? 100 : 0,
  //           };
  //         }),
  //       };
  //     }),
  //   );
  // };

  const toggleComplete = (exerciseId, appointmentId) => {
    if (!setExercises) return;

    setExercises((prev) =>
      prev.map((group) => {
        if (String(group.appointmentId) !== String(appointmentId)) {
          return group;
        }

        return {
          ...group,

          exercises: (group.exercises ?? []).map((exercise) => {
            if (String(exercise.id) !== String(exerciseId)) {
              return exercise;
            }

            const nextCompleted = !exercise.completed;

            return {
              ...exercise,
              completed: nextCompleted,
              progress: nextCompleted ? 100 : 0,
            };
          }),
        };
      }),
    );
  };

  // ==========================================
  // Exercise Type Information
  // ==========================================

  const getTypeInfo = (type) => {
    const types = {
      daily: {
        label: "روزانه",
        className: styles.typeDaily,
      },
      weekly: {
        label: "هفتگی",
        className: styles.typeWeekly,
      },
      one_time: {
        label: "یک‌باره",
        className: styles.typeOneTime,
      },
      "one-time": {
        label: "یک‌باره",
        className: styles.typeOneTime,
      },
    };

    return types[type] || types.one_time;
  };

  // ==========================================
  // Exercise Priority Information
  // ==========================================

  const getPriorityInfo = (priority) => {
    const priorities = {
      high: {
        label: "اولویت بالا",
        className: styles.priorityHigh,
      },
      medium: {
        label: "اولویت متوسط",
        className: styles.priorityMedium,
      },
      low: {
        label: "اولویت کم",
        className: styles.priorityLow,
      },
    };

    return priorities[priority] || priorities.medium;
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className={styles.pageContent}>
      {/* ======================================
          Page Header
      ====================================== */}

      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>تمرین‌های من</h2>
          <p>تمرین‌های تعیین‌شده توسط روانشناس برای شما</p>
        </div>

        {/* <div className={styles.exerciseStats}>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>{completedCount}</span>
            <span className={styles.statLabel}>انجام‌شده</span>
          </span>

          <span className={styles.statDivider}>|</span>

          <span className={styles.statItem}>
            <span className={styles.statNumber}>{remainingCount}</span>
            <span className={styles.statLabel}>انجام‌نشده</span>
          </span>

          <span className={styles.statDivider}>|</span>

          <span className={styles.statItem}>
            <span className={styles.statNumber}>{totalCount}</span>
            <span className={styles.statLabel}>مجموع</span>
          </span>
        </div> */}
      </div>

      {/* ======================================
          Appointment Selector
      ====================================== */}

      {/* <div className={styles.appointmentSelector}>
        <label
          htmlFor="exercise-appointment"
          className={styles.appointmentLabel}
        >
          انتخاب جلسه
        </label>

        {completedAppointments.length > 0 ? (
          <>
            <div className={styles.appointmentSelectWrapper}>
              <select
                id="exercise-appointment"
                className={styles.appointmentSelect}
                value={selectedAppointment?.id ?? ""}
                onChange={(e) => {
                  setSelectedAppointmentId(e.target.value);
                  setSelectedExercise(null);
                  setFilter("all");
                  setShowCompleted(true);
                }}
              >
                {completedAppointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.type || "جلسه مشاوره"} - {appointment.date}
                  </option>
                ))}
              </select>

              <span className={styles.selectArrow}>⌄</span>
            </div>

            {selectedAppointment && (
              <div className={styles.appointmentInfo}>
                <div className={styles.appointmentInfoItem}>
                  <span className={styles.appointmentInfoLabel}>
                    تاریخ جلسه:
                  </span>
                  <span>{selectedAppointment.date}</span>
                </div>

                {selectedAppointment.time && (
                  <div className={styles.appointmentInfoItem}>
                    <span className={styles.appointmentInfoLabel}>ساعت:</span>
                    <span>{selectedAppointment.time}</span>
                  </div>
                )}

                <div className={styles.appointmentInfoItem}>
                  <span className={styles.appointmentInfoLabel}>
                    تعداد تمرین:
                  </span>
                  <span>{sessionTotalCount} تمرین</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noAppointment}>
            <span className={styles.noAppointmentIcon}>📋</span>
            <p>
              هنوز جلسه انجام‌شده‌ای که برای آن تمرین تعیین شده باشد وجود ندارد.
            </p>
          </div>
        )}
      </div> */}

      {/* <div className={styles.appointmentSelector}>
        <label
          htmlFor="exercise-appointment"
          className={styles.appointmentLabel}
        >
          انتخاب جلسه
        </label>

        {completedAppointments.length > 0 ? (
          <>
            <div className={styles.appointmentSelectWrapper}>
              <select
                id="exercise-appointment"
                className={styles.appointmentSelect}
                value={selectedAppointment?.id ?? ""}
                onChange={(e) => {
                  setSelectedAppointmentId(e.target.value);
                  setSelectedExercise(null);
                  setFilter("all");
                  setShowCompleted(true);
                }}
              >
                {completedAppointments.map((appointment, index) => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.title ||
                      appointment.type ||
                      `جلسه ${completedAppointments.length - index}`}
                    {" - "}
                    {appointment.date}
                  </option>
                ))}
              </select>

              <span className={styles.selectArrow}>⌄</span>
            </div>

            {selectedAppointment && (
              <div className={styles.appointmentInfo}>
                <div className={styles.appointmentInfoItem}>
                  <span className={styles.appointmentInfoLabel}>
                    تاریخ جلسه:
                  </span>
                  <span>{selectedAppointment.date}</span>
                </div>

                {selectedAppointment.time && (
                  <div className={styles.appointmentInfoItem}>
                    <span className={styles.appointmentInfoLabel}>ساعت:</span>
                    <span>{selectedAppointment.time}</span>
                  </div>
                )}

                <div className={styles.appointmentInfoItem}>
                  <span className={styles.appointmentInfoLabel}>
                    تعداد تمرین:
                  </span>
                  <span>{appointmentExercises.length} تمرین</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noAppointment}>
            <span className={styles.noAppointmentIcon}>📋</span>
            <p>هنوز جلسه انجام‌شده‌ای برای شما ثبت نشده است.</p>
          </div>
        )}
      </div> */}

      <div className={styles.appointmentSelector}>
        {completedAppointments.length > 0 ? (
          <>
            <label
              htmlFor="exercise-appointment"
              className={styles.appointmentLabel}
            >
              انتخاب جلسه
            </label>

            <div className={styles.appointmentSelectWrapper}>
              <select
                id="exercise-appointment"
                className={styles.appointmentSelect}
                value={selectedAppointment?.id ?? ""}
                onChange={(e) => {
                  setSelectedAppointmentId(e.target.value);
                  setSelectedExercise(null);
                  setFilter("all");
                  setShowCompleted(true);
                }}
              >
                {completedAppointments.map((appointment, index) => (
                  <option key={appointment.id} value={appointment.id}>
                    {getAppointmentOptionLabel(appointment, index)}
                  </option>
                ))}
              </select>

              <span className={styles.selectArrow}>⌄</span>
            </div>
          </>
        ) : (
          <span className={styles.noCompletedAppointments}>
            هنوز جلسه انجام‌شده‌ای برای شما ثبت نشده است.
          </span>
        )}
      </div>

      {/* ======================================
          Exercise Section
      ====================================== */}

      {selectedAppointment && (
        <>
          {/* Session Heading */}

          {/* <div className={styles.sessionHeading}>
            <div>
              <h3>تمرین‌های این جلسه</h3>
              <p>تمرین‌های اختصاص‌یافته به جلسه انتخاب‌شده</p>
            </div>

            <span className={styles.sessionExerciseCount}>
              {sessionCompletedCount} از {sessionTotalCount} انجام‌شده
            </span>
          </div> */}

          {/* ==================================
              Filters
          ================================== */}

          <div className={styles.filterSection}>
            <div className={styles.filterTabs}>
              <button
                className={`${styles.filterTab} ${
                  filter === "all" ? styles.active : ""
                }`}
                onClick={() => setFilter("all")}
              >
                همه
                <span className={styles.filterCount}>
                  {appointmentExercises.length}
                </span>
              </button>

              <button
                className={`${styles.filterTab} ${
                  filter === "daily" ? styles.active : ""
                }`}
                onClick={() => setFilter("daily")}
              >
                روزانه
                <span className={styles.filterCount}>
                  {
                    appointmentExercises.filter((ex) => ex.type === "daily")
                      .length
                  }
                </span>
              </button>

              <button
                className={`${styles.filterTab} ${
                  filter === "weekly" ? styles.active : ""
                }`}
                onClick={() => setFilter("weekly")}
              >
                هفتگی
                <span className={styles.filterCount}>
                  {
                    appointmentExercises.filter((ex) => ex.type === "weekly")
                      .length
                  }
                </span>
              </button>

              <button
                className={`${styles.filterTab} ${
                  filter === "one_time" ? styles.active : ""
                }`}
                onClick={() => setFilter("one_time")}
              >
                یک‌باره
                <span className={styles.filterCount}>
                  {
                    appointmentExercises.filter(
                      (ex) => ex.type === "one_time" || ex.type === "one-time",
                    ).length
                  }
                </span>
              </button>
            </div>

            <label className={styles.showCompletedToggle}>
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
              نمایش انجام‌شده‌ها
            </label>
          </div>

          {/* ==================================
              Exercise List
          ================================== */}

          {/* <div className={styles.exerciseList}>
            {filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => { */}
          <div className={styles.exerciseList}>
            {appointmentExercises.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>📋</span>

                <h3>تمرینی برای این جلسه وجود ندارد</h3>

                <p>برای این جلسه هنوز تمرینی توسط روانشناس تعیین نشده است.</p>
              </div>
            ) : filteredExercises.length > 0 ? (
              filteredExercises.map((exercise) => {
                const typeInfo = getTypeInfo(exercise.type);
                const priorityInfo = getPriorityInfo(exercise.priority);

                const isCompleted = exercise.completed;
                const isExpanded = selectedExercise === exercise.id;

                return (
                  <div
                    key={`${selectedAppointment.id}-${exercise.id}`}
                    className={`${styles.exerciseCard} ${
                      isCompleted ? styles.completed : ""
                    }`}
                  >
                    {/* Completion Button */}
                    <button
                      type="button"
                      className={`${styles.checkCircle} ${
                        isCompleted ? styles.checked : ""
                      }`}
                      onClick={() =>
                        toggleComplete(exercise.id, selectedAppointment.id)
                      }
                      aria-label={
                        isCompleted
                          ? "علامت‌گذاری به‌عنوان انجام‌نشده"
                          : "علامت‌گذاری به‌عنوان انجام‌شده"
                      }
                    >
                      {isCompleted ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M5 12L10 17L20 7"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span className={styles.checkPlaceholder} />
                      )}
                    </button>

                    {/* Exercise Content */}
                    <div className={styles.exerciseContent}>
                      <div className={styles.exerciseHeader}>
                        <div className={styles.exerciseMainInfo}>
                          <div className={styles.exerciseTitleRow}>
                            <h4 className={styles.exerciseTitle}>
                              <span>{exercise.title}</span>
                            </h4>

                            <div className={styles.exerciseMeta}>
                              <span
                                className={`${styles.typeBadge} ${typeInfo.className}`}
                              >
                                {typeInfo.label}
                              </span>

                              <span
                                className={`${styles.priorityBadge} ${priorityInfo.className}`}
                              >
                                {priorityInfo.label}
                              </span>
                            </div>
                          </div>

                          <p className={styles.exerciseDescription}>
                            {exercise.description}
                          </p>
                        </div>
                      </div>

                      {/* Expand Button */}
                      <button
                        type="button"
                        className={styles.expandBtn}
                        onClick={() =>
                          setSelectedExercise(isExpanded ? null : exercise.id)
                        }
                        aria-expanded={isExpanded}
                      >
                        {isExpanded ? "▲" : "▼"}

                        <span className={styles.expandLabel}>
                          {isExpanded ? "بستن دستورالعمل" : "مشاهده دستورالعمل"}
                        </span>
                      </button>

                      {/* Exercise Details */}
                      {isExpanded && (
                        <div className={styles.exerciseDetails}>
                          {exercise.instructions?.length > 0 && (
                            <div className={styles.instructionsSection}>
                              <h5>📋 دستورالعمل:</h5>

                              <ul>
                                {exercise.instructions.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className={styles.exerciseFooter}>
                            <div className={styles.exerciseAssignInfo}>
                              {exercise.assignedBy && (
                                <span>👤 {exercise.assignedBy}</span>
                              )}

                              {exercise.assignedDate && (
                                <span>
                                  📅 تاریخ تعیین: {exercise.assignedDate}
                                </span>
                              )}

                              {exercise.dueDate && (
                                <span>⏳ مهلت: {exercise.dueDate}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>🎯</span>

                <h3>تمرینی موجود نیست</h3>

                <p>
                  {showCompleted
                    ? "برای این فیلتر تمرینی وجود ندارد."
                    : "تمام تمرین‌های این بخش را انجام داده‌اید! 🎉"}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ======================================
          Overall Progress
      ====================================== */}

      <div className={styles.overallProgress}>
        <div className={styles.progressInfo}>
          <span className={styles.progressTitle}>پیشرفت کلی تمرین‌ها</span>

          <span className={styles.progressPercentage}>{overallProgress}%</span>
        </div>

        <div className={styles.overallProgressBar}>
          <div
            className={styles.overallProgressFill}
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        <div className={styles.progressStats}>
          <span>{completedCount} انجام‌شده</span>
          <span>{remainingCount} باقی‌مانده</span>
        </div>
      </div>

      {/* ======================================
          Exercise Actions
      ====================================== */}

      <div className={styles.exerciseActions}>
        <button type="button" className={styles.btnReportProgress}>
          گزارش پیشرفت تمرین‌ها
        </button>

        <button type="button" className={styles.btnShareProgress}>
          اشتراک‌گذاری با روانشناس
        </button>
      </div>
    </div>
  );
}

export default ExerciseManagement;
