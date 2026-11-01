import { useState } from "react";
import styles from "./Exercises.module.css";

// ============================================
// COMPONENT: Exercise Content
// ============================================
// function ExerciseManagement() {
//   const [exercises, setExercises] = useState(seedData.exercises);
function ExerciseManagement({ initialExercises }) {
  const [exercises, setExercises] = useState(initialExercises);

  const [selectedExercise, setSelectedExercise] = useState(null);
  const [filter, setFilter] = useState("all"); // all | daily | weekly | one_time
  const [showCompleted, setShowCompleted] = useState(true);

  // ===== تابع تیک زدن تمرین =====
  const toggleComplete = (id) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id === id
          ? {
              ...ex,
              completed: !ex.completed,
              progress: ex.completed ? 0 : 100,
            }
          : ex,
      ),
    );
  };

  // ===== فیلتر کردن =====
  const getFilteredExercises = () => {
    let filtered = exercises;

    if (filter !== "all") {
      filtered = filtered.filter((ex) => ex.type === filter);
    }

    if (!showCompleted) {
      filtered = filtered.filter((ex) => !ex.completed);
    }

    return filtered;
  };

  const filteredExercises = getFilteredExercises();
  const completedCount = exercises.filter((ex) => ex.completed).length;
  const totalCount = exercises.length;

  // ===== دریافت اطلاعات بر اساس نوع =====
  const getTypeInfo = (type) => {
    const types = {
      daily: { label: "روزانه", className: styles.typeDaily, icon: "🌙" },
      weekly: { label: "هفتگی", className: styles.typeWeekly, icon: "📅" },
      one_time: { label: "یک‌باره", className: styles.typeOneTime, icon: "⭐" },
    };
    return types[type] || types.one_time;
  };

  const getPriorityInfo = (priority) => {
    const priorities = {
      high: { label: "اولویت بالا", className: styles.priorityHigh },
      medium: { label: "اولویت متوسط", className: styles.priorityMedium },
      low: { label: "اولویت کم", className: styles.priorityLow },
    };
    return priorities[priority] || priorities.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      meditation: "🧘",
      writing: "✍️",
      test: "📊",
      activity: "🏃",
    };
    return icons[category] || "📋";
  };

  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>تمارین من</h2>
          <p>تمارین تعیین شده توسط روانشناس برای شما</p>
        </div>
        <div className={styles.exerciseStats}>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>{completedCount}</span>
            <span className={styles.statLabel}>انجام شده</span>
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>
              {totalCount - completedCount}
            </span>
            <span className={styles.statLabel}>انجام نشده</span>
          </span>
          <span className={styles.statDivider}>|</span>
          <span className={styles.statItem}>
            <span className={styles.statNumber}>{totalCount}</span>
            <span className={styles.statLabel}>مجموع</span>
          </span>
        </div>
      </div>

      {/* فیلترها */}
      <div className={styles.filterSection}>
        <div className={styles.filterTabs}>
          <button
            className={`${styles.filterTab} ${
              filter === "all" ? styles.active : ""
            }`}
            onClick={() => setFilter("all")}
          >
            همه &nbsp;
            <span className={styles.filterCount}>{exercises.length}</span>
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "daily" ? styles.active : ""
            }`}
            onClick={() => setFilter("daily")}
          >
            🌙 روزانه &nbsp;
            <span className={styles.filterCount}>
              {exercises.filter((ex) => ex.type === "daily").length}
            </span>
          </button>
          <button
            className={`${styles.filterTab} ${
              filter === "weekly" ? styles.active : ""
            }`}
            onClick={() => setFilter("weekly")}
          >
            📅 هفتگی &nbsp;
            <span className={styles.filterCount}>
              {exercises.filter((ex) => ex.type === "weekly").length}
            </span>
          </button>
          <button
            className={`${styles.filterTab} ${
              // filter === "one-time" ? styles.active : ""
              filter === "one_time" ? styles.active : ""
            }`}
            // onClick={() => setFilter("one-time")}
            onClick={() => setFilter("one_time")}
          >
            ⭐ یک‌باره &nbsp;
            <span className={styles.filterCount}>
              {exercises.filter((ex) => ex.type === "one_time").length}
            </span>
          </button>
        </div>

        <label className={styles.showCompletedToggle}>
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={() => setShowCompleted(!showCompleted)}
          />
          <span className={styles.toggleSlider}></span>
          نمایش انجام شده‌ها
        </label>
      </div>

      {/* لیست تمارین */}
      <div className={styles.exerciseList}>
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => {
            const typeInfo = getTypeInfo(exercise.type);
            const priorityInfo = getPriorityInfo(exercise.priority);
            const isCompleted = exercise.completed;

            return (
              <div
                key={exercise.id}
                className={`${styles.exerciseCard} ${
                  isCompleted ? styles.completed : ""
                }`}
              >
                <button
                  className={`${styles.checkCircle} ${
                    isCompleted ? styles.checked : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComplete(exercise.id);
                  }}
                >
                  {isCompleted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M5 12L10 17L20 7"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span className={styles.checkPlaceholder}></span>
                  )}
                </button>

                {/* محتوای اصلی */}
                <div className={styles.exerciseContent}>
                  <div className={styles.exerciseHeader}>
                    <div className={styles.exerciseMainInfo}>
                      <div className={styles.exerciseTitleRow}>
                        <h4 className={styles.exerciseTitle}>
                          {exercise.icon || getCategoryIcon(exercise.category)}
                          <span>{exercise.title}</span>
                        </h4>
                        <div className={styles.exerciseMeta}>
                          <span
                            className={`${styles.typeBadge} ${typeInfo.className}`}
                          >
                            {typeInfo.icon} {typeInfo.label}
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

                  {/* دکمه گسترش */}
                  <button
                    className={styles.expandBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedExercise(
                        selectedExercise === exercise.id ? null : exercise.id,
                      );
                    }}
                  >
                    {selectedExercise === exercise.id ? "▲" : "▼"}
                    <span className={styles.expandLabel}>
                      {selectedExercise === exercise.id
                        ? "بستن"
                        : "مشاهده دستورالعمل"}
                    </span>
                  </button>

                  {/* جزئیات */}
                  {selectedExercise === exercise.id && (
                    <div className={styles.exerciseDetails}>
                      <div className={styles.instructionsSection}>
                        <h5>📋 دستورالعمل:</h5>
                        <ul>
                          {exercise.instructions.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div className={styles.exerciseFooter}>
                        <div className={styles.exerciseAssignInfo}>
                          <span>👤 {exercise.assignedBy}</span>
                          <span>📅 تاریخ تعیین: {exercise.assignedDate}</span>
                          <span>⏳ مهلت: {exercise.dueDate}</span>
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
            <h3>هیچ تمرینی موجود نیست</h3>
            <p>
              {showCompleted
                ? "هنوز تمرینی برای شما تعیین نشده است."
                : "همه تمرین‌ها را انجام داده‌اید! 🎉"}
            </p>
          </div>
        )}
      </div>

      {/* کارت پیشرفت کلی */}
      <div className={styles.overallProgress}>
        <div className={styles.progressInfo}>
          <span className={styles.progressTitle}>پیشرفت کلی تمارین</span>
          <span className={styles.progressPercentage}>
            {totalCount > 0
              ? Math.round((completedCount / totalCount) * 100)
              : 0}
            %
          </span>
        </div>
        <div className={styles.overallProgressBar}>
          <div
            className={styles.overallProgressFill}
            style={{
              width: `${
                totalCount > 0 ? (completedCount / totalCount) * 100 : 0
              }%`,
            }}
          />
        </div>
        <div className={styles.progressStats}>
          <span>✅ {completedCount} انجام شده</span>
          <span>⏳ {totalCount - completedCount} باقی‌مانده</span>
        </div>
      </div>

      {/* دکمه گزارش */}
      <div className={styles.exerciseActions}>
        <button className={styles.btnReportProgress}>
          📊 گزارش پیشرفت تمارین
        </button>
        <button className={styles.btnShareProgress}>
          📤 اشتراک‌گذاری با روانشناس
        </button>
      </div>
    </div>
  );
}

export default ExerciseManagement;
