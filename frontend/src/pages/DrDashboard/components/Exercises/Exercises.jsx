import React, { useState, useMemo } from "react";

import styles from "./Exercises.module.css";

import { FaPlus } from "react-icons/fa";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// ============================================
// COMPONENT: Exercises Management (Doctor Panel)
// ============================================
// function ExercisesManagement({ patients, appointments, setAppointments }) {
// function ExercisesManagement({
//   patients,
//   appointments,
//   setAppointments,
//   moment,
//   toEnglishDigits,
//   toPersianDigits,
//   getDisplayStatus,
//   getAppointmentMoment,
//   doctorName,
// }) {
function ExercisesManagement({
  appointments,
  setAppointments,
  moment,
  toEnglishDigits,
  toPersianDigits,
  getDisplayStatus,
  getAppointmentMoment,
  doctorName,
}) {
  // ===== State های فیلتر =====
  const [filterPatientId, setFilterPatientId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all"); // all | pending | completed | overdue
  const [filterType, setFilterType] = useState("all"); // all | daily | weekly | one-time

  // ===== State های مودال =====
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create | edit
  const [editingExercise, setEditingExercise] = useState(null); // { appointmentId, exercise }
  const [showPatientSelectModal, setShowPatientSelectModal] = useState(false);

  // ==========================================
  // مشتق‌ها
  // ==========================================

  // ===== همه‌ی تمارین (از همه‌ی appointments) =====
  const allExercises = useMemo(() => {
    const result = [];

    appointments.forEach((appointment) => {
      if (
        appointment.exercises &&
        Array.isArray(appointment.exercises) &&
        appointment.exercises.length > 0
      ) {
        appointment.exercises.forEach((exercise) => {
          result.push({
            ...exercise,
            // ===== اطلاعات اضافه از appointment =====
            appointmentId: appointment.id,
            patientId: appointment.patientId,
            patientName: appointment.patient,
            appointmentDate: appointment.date,
            appointmentType: appointment.type,
            appointmentTypeKey: appointment.typeKey,
          });
        });
      }
    });

    return result;
  }, [appointments]);

  // ===== آمار =====
  const stats = useMemo(() => {
    const now = moment();
    let pending = 0;
    let completed = 0;
    let overdue = 0;

    allExercises.forEach((ex) => {
      if (ex.completed) {
        completed++;
      } else {
        pending++;
        // ===== چک کردن مهلت گذشته =====
        if (ex.dueDate) {
          const dueMoment = moment(
            toEnglishDigits(ex.dueDate),
            "jYYYY/jMM/jDD",
          );
          if (dueMoment.isValid() && dueMoment.isBefore(now, "day")) {
            overdue++;
          }
        }
      }
    });

    return {
      total: allExercises.length,
      pending,
      completed,
      overdue,
    };
    // }, [allExercises]);
  }, [allExercises, moment, toEnglishDigits]);

  // ===== لیست بیمارانی که تمرین دارن =====
  const patientsWithExercises = useMemo(() => {
    const patientMap = new Map();

    allExercises.forEach((ex) => {
      if (!patientMap.has(ex.patientId)) {
        patientMap.set(ex.patientId, {
          patientId: ex.patientId,
          patientName: ex.patientName,
          exercises: [],
        });
      }
      patientMap.get(ex.patientId).exercises.push(ex);
    });

    return Array.from(patientMap.values());
  }, [allExercises]);

  // ===== فیلتر شده =====
  const filteredPatientGroups = useMemo(() => {
    return patientsWithExercises
      .filter((group) => {
        if (filterPatientId !== "all" && group.patientId !== filterPatientId) {
          return false;
        }
        return true;
      })
      .map((group) => {
        const filteredExercises = group.exercises.filter((ex) => {
          // ===== فیلتر وضعیت =====
          if (filterStatus === "pending" && ex.completed) return false;
          if (filterStatus === "completed" && !ex.completed) return false;
          if (filterStatus === "overdue") {
            if (ex.completed) return false;
            const dueMoment = moment(
              toEnglishDigits(ex.dueDate),
              "jYYYY/jMM/jDD",
            );
            if (!dueMoment.isValid() || !dueMoment.isBefore(moment(), "day"))
              return false;
          }

          // ===== فیلتر نوع =====
          if (filterType !== "all" && ex.type !== filterType) return false;

          return true;
        });

        return {
          ...group,
          exercises: filteredExercises,
        };
      })
      .filter((group) => group.exercises.length > 0);
    // }, [patientsWithExercises, filterPatientId, filterStatus, filterType]);
  }, [
    patientsWithExercises,
    filterPatientId,
    filterStatus,
    filterType,
    moment,
    toEnglishDigits,
  ]);

  // ===== لیست بیماران برای dropdown =====
  const patientsForFilter = useMemo(() => {
    return Array.from(
      new Map(
        patientsWithExercises.map((g) => [
          g.patientId,
          { id: g.patientId, name: g.patientName },
        ]),
      ).values(),
    );
  }, [patientsWithExercises]);

  // ==========================================
  // توابع
  // ==========================================

  // ===== باز کردن مودال برای طراحی تمرین جدید =====
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setEditingExercise(null);
    setShowPatientSelectModal(true);
  };

  // ===== انتخاب بیمار و جلسه (از مودال) =====
  const handleSelectAppointment = (appointment) => {
    setShowPatientSelectModal(false);
    setEditingExercise({
      appointmentId: appointment.id,
      exercise: null,
      appointmentInfo: {
        patientName: appointment.patient,
        appointmentDate: appointment.date,
        appointmentType: appointment.type,
      },
    });
    setShowExerciseModal(true);
  };

  // ===== باز کردن مودال ویرایش =====
  const handleOpenEditModal = (exercise) => {
    setModalMode("edit");
    setEditingExercise({
      appointmentId: exercise.appointmentId,
      exercise: exercise,
      appointmentInfo: {
        patientName: exercise.patientName,
        appointmentDate: exercise.appointmentDate,
        appointmentType: exercise.appointmentType,
      },
    });
    setShowExerciseModal(true);
  };

  // ===== حذف تمرین =====
  const handleDeleteExercise = (exercise) => {
    if (
      !window.confirm(`آیا از حذف تمرین "${exercise.title}" اطمینان دارید؟`)
    ) {
      return;
    }

    setAppointments((prev) =>
      prev.map((app) => {
        if (app.id !== exercise.appointmentId) return app;

        return {
          ...app,
          exercises: (app.exercises || []).filter(
            (ex) => ex.id !== exercise.id,
          ),
        };
      }),
    );
  };

  // ==========================================
  // رندر
  // ==========================================
  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>تمارین بیماران</h2>
          <p>برای جلسات برگزار شده می‌توانید برای بیمار تمرین طراحی کنید.</p>
        </div>
        <button className={styles.newBtn} onClick={handleOpenCreateModal}>
          <FaPlus /> طراحی تمرین جدید
        </button>
      </div>

      {/* ===== راهنمای بالا ===== */}
      <div className={styles.exercisesHint}>
        <span className={styles.exercisesHintIcon}>💡</span>
        <p>
          تمرین‌ها همیشه به یک <strong>جلسه‌ی برگزار شده</strong> متصل هستند.
          برای طراحی تمرین، ابتدا بیمار و جلسه را انتخاب کنید. بیمار می‌تواند
          تیک انجام تمرین را در پنل خود بزند.
        </p>
      </div>

      {/* ===== آمار ===== */}
      <div className={styles.exercisesStatsGrid}>
        <div className={styles.exerciseStatBox}>
          <span className={styles.exerciseStatIcon}>📊</span>
          <span className={styles.exerciseStatNumber}>
            {toPersianDigits(stats.total)}
          </span>
          <span className={styles.exerciseStatLabel}>کل تمارین</span>
        </div>
        <div className={`${styles.exerciseStatBox} ${styles.statPending}`}>
          <span className={styles.exerciseStatIcon}>⏳</span>
          <span className={styles.exerciseStatNumber}>
            {toPersianDigits(stats.pending)}
          </span>
          <span className={styles.exerciseStatLabel}>در انتظار</span>
        </div>
        <div className={`${styles.exerciseStatBox} ${styles.statCompleted}`}>
          <span className={styles.exerciseStatIcon}>✅</span>
          <span className={styles.exerciseStatNumber}>
            {toPersianDigits(stats.completed)}
          </span>
          <span className={styles.exerciseStatLabel}>انجام شده</span>
        </div>
        <div className={`${styles.exerciseStatBox} ${styles.statOverdue}`}>
          <span className={styles.exerciseStatIcon}>⚠️</span>
          <span className={styles.exerciseStatNumber}>
            {toPersianDigits(stats.overdue)}
          </span>
          <span className={styles.exerciseStatLabel}>مهلت گذشته</span>
        </div>
      </div>

      {/* ===== فیلترها ===== */}
      <div className={styles.exercisesFilters}>
        <div className={styles.exerciseFilterGroup}>
          <label>بیمار:</label>
          <select
            className={styles.formSelect}
            value={filterPatientId}
            onChange={(e) => setFilterPatientId(e.target.value)}
          >
            <option value="all">همه بیماران</option>
            {patientsForFilter.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.exerciseFilterGroup}>
          <label>وضعیت:</label>
          <select
            className={styles.formSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">همه</option>
            <option value="pending">در انتظار</option>
            <option value="completed">انجام شده</option>
            <option value="overdue">مهلت گذشته</option>
          </select>
        </div>

        <div className={styles.exerciseFilterGroup}>
          <label>نوع:</label>
          <select
            className={styles.formSelect}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">همه</option>
            <option value="daily">روزانه</option>
            <option value="weekly">هفتگی</option>
            <option value="one-time">یک‌باره</option>
          </select>
        </div>
      </div>

      {/* ===== لیست تمارین ===== */}
      <div className={styles.exercisesList}>
        {filteredPatientGroups.length > 0 ? (
          filteredPatientGroups.map((group) => (
            <div key={group.patientId} className={styles.patientExercisesGroup}>
              {/* هدر بیمار */}
              <div className={styles.patientExercisesHeader}>
                <div className={styles.patientExercisesAvatar}>👤</div>
                <span className={styles.patientExercisesName}>
                  {group.patientName}
                </span>
                <span className={styles.patientExercisesCount}>
                  {toPersianDigits(group.exercises.length)} تمرین
                </span>
              </div>

              {/* لیست تمارین */}
              <div className={styles.patientExercisesItems}>
                {group.exercises.map((exercise) => {
                  const isOverdue =
                    !exercise.completed &&
                    exercise.dueDate &&
                    moment(
                      toEnglishDigits(exercise.dueDate),
                      "jYYYY/jMM/jDD",
                    ).isBefore(moment(), "day");

                  return (
                    <div
                      key={`${exercise.appointmentId}-${exercise.id}`}
                      className={`${styles.exerciseItem} ${
                        exercise.completed ? styles.exerciseItemDone : ""
                      }`}
                    >
                      {/* آیکون و محتوا */}
                      <div className={styles.exerciseItemIcon}>
                        {exercise.icon || "📋"}
                      </div>

                      <div className={styles.exerciseItemContent}>
                        <div className={styles.exerciseItemHeader}>
                          <span className={styles.exerciseItemTitle}>
                            {exercise.title}
                          </span>

                          {/* بج‌ها */}
                          <div className={styles.exerciseItemBadges}>
                            <span className={styles.exerciseTypeBadge}>
                              {exercise.type === "daily" && "🌙 روزانه"}
                              {exercise.type === "weekly" && "📅 هفتگی"}
                              {exercise.type === "one-time" && "⭐ یک‌باره"}
                            </span>

                            {exercise.completed ? (
                              <span className={styles.exerciseBadgeDone}>
                                ✅ انجام شده
                              </span>
                            ) : isOverdue ? (
                              <span className={styles.exerciseBadgeOverdue}>
                                ⚠️ مهلت گذشته
                              </span>
                            ) : (
                              <span className={styles.exerciseBadgePending}>
                                ⏳ در انتظار
                              </span>
                            )}
                          </div>
                        </div>

                        <p className={styles.exerciseItemDesc}>
                          {exercise.description}
                        </p>

                        {/* اطلاعات متا */}
                        <div className={styles.exerciseItemMeta}>
                          <span>📅 جلسه: {exercise.appointmentDate}</span>
                          <span>•</span>
                          <span>⏰ مهلت: {exercise.dueDate}</span>
                          <span>•</span>
                          <span>{exercise.appointmentType}</span>
                        </div>
                      </div>

                      {/* دکمه‌های اکشن */}
                      <div className={styles.exerciseItemActions}>
                        <button
                          className={styles.exerciseBtnEdit}
                          onClick={() => handleOpenEditModal(exercise)}
                          title="ویرایش"
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.exerciseBtnDelete}
                          onClick={() => handleDeleteExercise(exercise)}
                          title="حذف"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎯</span>
            <h3>هیچ تمرینی ثبت نشده</h3>
            <p>برای طراحی تمرین، روی دکمه «طراحی تمرین جدید» کلیک کنید.</p>
            <button className={styles.emptyBtn} onClick={handleOpenCreateModal}>
              + طراحی اولین تمرین
            </button>
          </div>
        )}
      </div>

      {/* ===== مودال انتخاب بیمار و جلسه ===== */}
      {showPatientSelectModal && (
        // <PatientAppointmentSelectModal
        //   patients={patients}
        //   appointments={appointments}
        //   onClose={() => setShowPatientSelectModal(false)}
        //   onSelect={handleSelectAppointment}
        // />
        <PatientAppointmentSelectModal
          appointments={appointments}
          onClose={() => setShowPatientSelectModal(false)}
          onSelect={handleSelectAppointment}
          getDisplayStatus={getDisplayStatus}
          getAppointmentMoment={getAppointmentMoment}
          toPersianDigits={toPersianDigits}
        />
      )}

      {/* ===== مودال طراحی تمرین ===== */}
      {showExerciseModal && editingExercise && (
        <ExerciseDesignModal
          mode={modalMode}
          appointmentInfo={editingExercise.appointmentInfo}
          existingExercise={editingExercise.exercise}
          appointmentId={editingExercise.appointmentId}
          appointments={appointments}
          setAppointments={setAppointments}
          onClose={() => {
            setShowExerciseModal(false);
            setEditingExercise(null);
          }}
          doctorName={doctorName}
          moment={moment}
          toPersianDigits={toPersianDigits}
        />
      )}
    </div>
  );
}

// ============================================
// COMPONENT: Patient Appointment Select Modal
// ============================================
// function PatientAppointmentSelectModal({
//   patients,
//   appointments,
//   onClose,
//   onSelect,
// }) {
function PatientAppointmentSelectModal({
  patients,
  appointments,
  onClose,
  onSelect,
  getDisplayStatus,
  getAppointmentMoment,
  toPersianDigits,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedPatientId, setExpandedPatientId] = useState(null);

  // ===== فقط جلسات برگزار شده =====
  const completedAppointments = useMemo(() => {
    return appointments
      .filter((a) => getDisplayStatus(a) === "completed")
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentB - momentA; // جدیدترین اول
      });
    // }, [appointments]);
  }, [appointments, getDisplayStatus, getAppointmentMoment]);

  // ===== گروه‌بندی بر اساس بیمار =====
  const groupedByPatient = useMemo(() => {
    const map = new Map();

    completedAppointments.forEach((app) => {
      if (!map.has(app.patientId)) {
        map.set(app.patientId, {
          patientId: app.patientId,
          patientName: app.patient,
          appointments: [],
        });
      }
      map.get(app.patientId).appointments.push(app);
    });

    return Array.from(map.values());
  }, [completedAppointments]);

  // ===== فیلتر بر اساس search =====
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return groupedByPatient;

    return groupedByPatient.filter((g) =>
      g.patientName.toLowerCase().includes(query),
    );
  }, [groupedByPatient, searchQuery]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.patientSelectModal}>
        <div className={styles.modalHeader}>
          <h3>انتخاب بیمار و جلسه</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <p className={styles.patientSelectHint}>
            جلسه‌ی برگزار شده‌ای که می‌خواهید برای آن تمرین طراحی کنید را انتخاب
            کنید.
          </p>

          {/* جستجو */}
          <div className={styles.patientSearchBox}>
            <span className={styles.patientSearchIcon}>🔍</span>
            <input
              type="text"
              className={styles.patientSearchInput}
              placeholder="جستجوی بیمار..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* لیست */}
          <div className={styles.patientSelectList}>
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => {
                const isExpanded = expandedPatientId === group.patientId;

                return (
                  <div
                    key={group.patientId}
                    className={styles.patientSelectGroup}
                  >
                    {/* هدر بیمار */}
                    <button
                      className={styles.patientSelectGroupHeader}
                      onClick={() =>
                        setExpandedPatientId(
                          isExpanded ? null : group.patientId,
                        )
                      }
                    >
                      <div className={styles.patientSelectAvatar}>👤</div>
                      <span className={styles.patientSelectName}>
                        {group.patientName}
                      </span>
                      <span className={styles.patientSelectCount}>
                        {toPersianDigits(group.appointments.length)} جلسه
                      </span>
                      <span className={styles.expandIcon}>
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </button>

                    {/* لیست جلسات */}
                    {isExpanded && (
                      <div className={styles.patientSelectAppointments}>
                        {group.appointments.map((app) => (
                          <button
                            key={app.id}
                            className={styles.patientSelectAppointment}
                            onClick={() => onSelect(app)}
                          >
                            <div className={styles.appointmentSelectInfo}>
                              <span className={styles.appointmentSelectDate}>
                                📅 {app.date}
                              </span>
                              <span className={styles.appointmentSelectTime}>
                                ⏰{" "}
                                {toPersianDigits(
                                  app.startTime || app.time.split(" - ")[0],
                                )}
                              </span>
                            </div>
                            <span className={styles.appointmentSelectType}>
                              {app.type}
                            </span>
                            <span className={styles.appointmentSelectArrow}>
                              →
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <p>هیچ جلسه‌ی برگزار شده‌ای یافت نشد.</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancelModal} onClick={onClose}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT: Exercise Design Modal
// ============================================
// function ExerciseDesignModal({
//   mode,
//   appointmentInfo,
//   existingExercise,
//   appointmentId,
//   appointments,
//   setAppointments,
//   onClose,
//   doctorName,
// }) {
function ExerciseDesignModal({
  mode,
  appointmentInfo,
  existingExercise,
  appointmentId,
  appointments,
  setAppointments,
  onClose,
  doctorName,
  moment,
  toPersianDigits,
}) {
  // ===== State های فرم =====
  const [form, setForm] = useState({
    title: existingExercise?.title || "",
    description: existingExercise?.description || "",
    type: existingExercise?.type || "daily",
    icon: existingExercise?.icon || "🧘",
    priority: existingExercise?.priority || "medium",
    dueDate: null, // DatePicker value
    instructions: existingExercise?.instructions || [""],
  });

  // ===== آیکون‌های پیشنهادی =====
  const iconOptions = [
    "🧘",
    "✍️",
    "📊",
    "🏃",
    "🙏",
    "📋",
    "🎨",
    "🎵",
    "📚",
    "💭",
  ];

  // ===== آپدیت فیلد =====
  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ===== دستورالعمل‌ها =====
  const updateInstruction = (index, value) => {
    setForm((prev) => {
      const newInstructions = [...prev.instructions];
      newInstructions[index] = value;
      return { ...prev, instructions: newInstructions };
    });
  };

  const addInstruction = () => {
    setForm((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index) => {
    setForm((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  // ===== ذخیره =====
  const handleSave = () => {
    // ===== اعتبارسنجی =====
    if (!form.title.trim()) {
      alert("لطفاً عنوان تمرین را وارد کنید.");
      return;
    }
    if (!form.description.trim()) {
      alert("لطفاً توضیحات تمرین را وارد کنید.");
      return;
    }
    if (!form.dueDate) {
      alert("لطفاً مهلت انجام را انتخاب کنید.");
      return;
    }

    const cleanInstructions = form.instructions
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    if (cleanInstructions.length === 0) {
      alert("لطفاً حداقل یک مرحله دستورالعمل وارد کنید.");
      return;
    }

    const dueDateStr = toPersianDigits(form.dueDate.format("YYYY/MM/DD"));

    // ===== ساخت آبجکت تمرین =====
    const exerciseData = {
      id: existingExercise?.id || null, // اگه edit بود، همون id
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      category: "activity", // پیش‌فرض
      icon: form.icon,
      dueDate: dueDateStr,
      priority: form.priority,
      progress: existingExercise?.progress || 0,
      completed: existingExercise?.completed || false,
      instructions: cleanInstructions,
      assignedBy: doctorName,
      assignedDate: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
    };

    // ===== آپدیت appointment =====
    setAppointments((prev) =>
      prev.map((app) => {
        if (app.id !== appointmentId) return app;

        const currentExercises = app.exercises || [];

        if (mode === "edit" && existingExercise) {
          // ویرایش
          return {
            ...app,
            exercises: currentExercises.map((ex) =>
              ex.id === existingExercise.id
                ? { ...exerciseData, id: ex.id }
                : ex,
            ),
          };
        } else {
          // ایجاد جدید
          const newId =
            currentExercises.length > 0
              ? Math.max(...currentExercises.map((e) => e.id)) + 1
              : 1;

          return {
            ...app,
            exercises: [...currentExercises, { ...exerciseData, id: newId }],
          };
        }
      }),
    );

    alert(
      mode === "edit"
        ? "تمرین با موفقیت ویرایش شد."
        : "تمرین با موفقیت طراحی شد.",
    );
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.exerciseDesignModal}>
        <div className={styles.modalHeader}>
          <h3>{mode === "edit" ? "✏️ ویرایش تمرین" : "🎯 طراحی تمرین جدید"}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* ===== اطلاعات جلسه ===== */}
          <div className={styles.exerciseSessionInfo}>
            <p>
              <strong>{appointmentInfo.patientName}</strong>
            </p>
            <span className={styles.exerciseSessionDate}>
              📅 {appointmentInfo.appointmentDate} •{" "}
              {appointmentInfo.appointmentType}
            </span>
          </div>

          {/* ===== عنوان ===== */}
          <div className={styles.formGroup}>
            <label>عنوان تمرین *</label>
            <input
              type="text"
              className={styles.formInput}
              placeholder="مثلاً: تمرین تنفس عمیق"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>

          {/* ===== توضیحات ===== */}
          <div className={styles.formGroup}>
            <label>توضیحات *</label>
            <textarea
              className={styles.formInput}
              placeholder="توضیح کوتاهی از تمرین..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows="3"
            />
          </div>

          {/* ===== نوع و اولویت ===== */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>نوع تمرین *</label>
              <select
                className={styles.formSelect}
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
              >
                <option value="daily">🌙 روزانه</option>
                <option value="weekly">📅 هفتگی</option>
                <option value="one-time">⭐ یک‌باره</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>اولویت</label>
              <select
                className={styles.formSelect}
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
              >
                <option value="high">🔴 بالا</option>
                <option value="medium">🟡 متوسط</option>
                <option value="low">🟢 کم</option>
              </select>
            </div>
          </div>

          {/* ===== آیکون ===== */}
          <div className={styles.formGroup}>
            <label>آیکون</label>
            <div className={styles.iconPicker}>
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  className={`${styles.iconOption} ${
                    form.icon === icon ? styles.iconOptionActive : ""
                  }`}
                  onClick={() => updateField("icon", icon)}
                  type="button"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* ===== مهلت انجام ===== */}
          <div className={styles.formGroup}>
            <label>مهلت انجام *</label>
            <DatePicker
              value={form.dueDate}
              onChange={(date) => updateField("dueDate", date)}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              inputClass={styles.formInput}
              placeholder="انتخاب تاریخ"
              format="YYYY/MM/DD"
              editable={false}
            />
          </div>

          {/* ===== دستورالعمل‌ها ===== */}
          <div className={styles.formGroup}>
            <label>دستورالعمل‌ها *</label>
            <div className={styles.instructionsList}>
              {form.instructions.map((instruction, index) => (
                <div key={index} className={styles.instructionRow}>
                  <span className={styles.instructionNumber}>
                    {toPersianDigits(index + 1)}
                  </span>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder={`مرحله ${toPersianDigits(index + 1)}`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                  />
                  {form.instructions.length > 1 && (
                    <button
                      className={styles.btnRemoveInstruction}
                      onClick={() => removeInstruction(index)}
                      type="button"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              className={styles.btnAddInstruction}
              onClick={addInstruction}
              type="button"
            >
              + افزودن مرحله
            </button>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnCancelModal} onClick={onClose}>
            انصراف
          </button>
          <button className={styles.btnConfirmModal} onClick={handleSave}>
            {mode === "edit" ? "ذخیره تغییرات" : "طراحی تمرین"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExercisesManagement;
