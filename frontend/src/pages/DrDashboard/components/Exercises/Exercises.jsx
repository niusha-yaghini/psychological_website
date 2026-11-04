import React, { useState, useMemo } from "react";

import styles from "./Exercises.module.css";

import { FaPlus } from "react-icons/fa";

// ============================================
// COMPONENT: Exercises Management (Doctor Panel)
// ============================================
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

  // همه‌ی گروه‌ها در ابتدا باز هستند؛ با کلیک هر سطح می‌توان آن را بست.
  const [collapsedPatients, setCollapsedPatients] = useState(() => new Set());
  const [collapsedAppointments, setCollapsedAppointments] = useState(
    () => new Set(),
  );
  const [collapsedExercises, setCollapsedExercises] = useState(() => new Set());

  // ==========================================
  // مشتق‌ها
  // ==========================================

  // ===== استخراج تمرین‌ها از جلسات doctorAppointments =====
  // هر تمرین همراه با اطلاعات بیمار و جلسه‌ی مربوط به خودش نگهداری می‌شود.
  const allExercises = useMemo(() => {
    return (appointments || []).flatMap((appointment) => {
      if (!Array.isArray(appointment.exercises)) return [];

      return appointment.exercises.map((exercise) => ({
        ...exercise,
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patient,
        appointmentDate: appointment.date,
        appointmentType: appointment.type,
        appointmentTypeKey: appointment.typeKey,
      }));
    });
  }, [appointments]);

  // ===== گروه‌بندی سلسله‌مراتبی: بیمار ← جلسه ← تمرین =====
  const patientsWithExercises = useMemo(() => {
    const patientMap = new Map();

    allExercises.forEach((exercise) => {
      if (!patientMap.has(exercise.patientId)) {
        patientMap.set(exercise.patientId, {
          patientId: exercise.patientId,
          patientName: exercise.patientName,
          appointments: new Map(),
        });
      }

      const patientGroup = patientMap.get(exercise.patientId);
      if (!patientGroup.appointments.has(exercise.appointmentId)) {
        patientGroup.appointments.set(exercise.appointmentId, {
          appointmentId: exercise.appointmentId,
          appointmentDate: exercise.appointmentDate,
          appointmentType: exercise.appointmentType,
          exercises: [],
        });
      }

      patientGroup.appointments
        .get(exercise.appointmentId)
        .exercises.push(exercise);
    });

    return Array.from(patientMap.values()).map((patient) => ({
      ...patient,
      appointments: Array.from(patient.appointments.values()).sort((a, b) => {
        const appointmentA = (appointments || []).find(
          (item) => item.id === a.appointmentId,
        );
        const appointmentB = (appointments || []).find(
          (item) => item.id === b.appointmentId,
        );
        return (
          getAppointmentMoment(appointmentB) -
          getAppointmentMoment(appointmentA)
        );
      }),
    }));
  }, [allExercises, appointments, getAppointmentMoment]);

  // ===== اعمال فیلترها در سطح تمرین، سپس حفظ ساختار بیمار و جلسه =====
  const filteredPatientGroups = useMemo(() => {
    return patientsWithExercises
      .filter(
        (group) =>
          filterPatientId === "all" ||
          String(group.patientId) === String(filterPatientId),
      )
      .map((group) => {
        const filteredAppointments = group.appointments
          .map((appointment) => ({
            ...appointment,
            exercises: appointment.exercises.filter((exercise) => {
              if (filterStatus === "pending" && exercise.completed)
                return false;
              if (filterStatus === "completed" && !exercise.completed)
                return false;

              if (filterStatus === "overdue") {
                if (exercise.completed || !exercise.dueDate) return false;
                const dueMoment = moment(
                  toEnglishDigits(exercise.dueDate),
                  "jYYYY/jMM/jDD",
                );
                if (
                  !dueMoment.isValid() ||
                  !dueMoment.isBefore(moment(), "day")
                )
                  return false;
              }

              if (filterType !== "all" && exercise.type !== filterType)
                return false;
              return true;
            }),
          }))
          .filter((appointment) => appointment.exercises.length > 0);

        return {
          ...group,
          appointments: filteredAppointments,
          exerciseCount: filteredAppointments.reduce(
            (total, appointment) => total + appointment.exercises.length,
            0,
          ),
        };
      })
      .filter((group) => group.appointments.length > 0);
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
        <p>
          تمرین‌ها همیشه به یک <strong>جلسه‌ی برگزار شده</strong> متصل هستند.
          برای طراحی تمرین، ابتدا بیمار و جلسه را انتخاب کنید. بیمار می‌تواند
          تیک انجام تمرین را در پنل خود بزند.
        </p>
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

      {/* ===== لیست تمرین‌ها با ساختار بیمار ← جلسه ← تمرین ===== */}
      <div className={styles.exercisesList}>
        {filteredPatientGroups.length > 0 ? (
          filteredPatientGroups.map((group) => {
            const patientIsCollapsed = collapsedPatients.has(group.patientId);

            return (
              <section
                key={group.patientId}
                className={styles.patientExercisesGroup}
              >
                {/* باکس بیمار */}
                <button
                  type="button"
                  className={styles.patientExercisesHeader}
                  aria-expanded={!patientIsCollapsed}
                  onClick={() =>
                    setCollapsedPatients((previous) => {
                      const next = new Set(previous);
                      if (next.has(group.patientId))
                        next.delete(group.patientId);
                      else next.add(group.patientId);
                      return next;
                    })
                  }
                >
                  <span className={styles.patientExercisesAvatar}>👤</span>
                  <span className={styles.patientExercisesName}>
                    {group.patientName}
                  </span>
                  <span className={styles.patientExercisesCount}>
                    {toPersianDigits(group.exerciseCount)} تمرین در{" "}
                    {toPersianDigits(group.appointments.length)} جلسه
                  </span>
                  <span className={styles.expandIcon}>
                    {patientIsCollapsed ? "▼" : "▲"}
                  </span>
                </button>

                {!patientIsCollapsed && (
                  <div className={styles.patientAppointmentsList}>
                    {group.appointments.map((appointment) => {
                      const appointmentKey = `${group.patientId}-${appointment.appointmentId}`;
                      const appointmentIsCollapsed =
                        collapsedAppointments.has(appointmentKey);

                      return (
                        <section
                          key={appointmentKey}
                          className={styles.patientAppointmentGroup}
                        >
                          {/* باکس جلسه */}
                          <button
                            type="button"
                            className={styles.patientAppointmentHeader}
                            aria-expanded={!appointmentIsCollapsed}
                            onClick={() =>
                              setCollapsedAppointments((previous) => {
                                const next = new Set(previous);
                                if (next.has(appointmentKey))
                                  next.delete(appointmentKey);
                                else next.add(appointmentKey);
                                return next;
                              })
                            }
                          >
                            <span className={styles.appointmentHeaderInfo}>
                              <strong>
                                جلسه {appointment.appointmentDate}
                              </strong>
                              <span>{appointment.appointmentType}</span>
                            </span>
                            <span className={styles.appointmentExerciseCount}>
                              {toPersianDigits(appointment.exercises.length)}{" "}
                              تمرین
                            </span>
                            <span className={styles.expandIcon}>
                              {appointmentIsCollapsed ? "▼" : "▲"}
                            </span>
                          </button>

                          {!appointmentIsCollapsed && (
                            <div className={styles.patientExercisesItems}>
                              {appointment.exercises.map((exercise) => {
                                const exerciseKey = `${appointmentKey}-${exercise.id}`;
                                const exerciseIsCollapsed =
                                  collapsedExercises.has(exerciseKey);
                                const dueMoment = exercise.dueDate
                                  ? moment(
                                      toEnglishDigits(exercise.dueDate),
                                      "jYYYY/jMM/jDD",
                                    )
                                  : null;
                                const isOverdue = Boolean(
                                  !exercise.completed &&
                                  dueMoment?.isValid() &&
                                  dueMoment.isBefore(moment(), "day"),
                                );

                                return (
                                  <article
                                    key={exerciseKey}
                                    className={`${styles.exerciseItem} ${exercise.completed ? styles.exerciseItemDone : ""}`}
                                  >
                                    <div
                                      className={styles.exerciseAccordionHeader}
                                    >
                                      <button
                                        type="button"
                                        className={
                                          styles.exerciseAccordionToggle
                                        }
                                        aria-expanded={!exerciseIsCollapsed}
                                        onClick={() =>
                                          setCollapsedExercises((previous) => {
                                            const next = new Set(previous);
                                            if (next.has(exerciseKey))
                                              next.delete(exerciseKey);
                                            else next.add(exerciseKey);
                                            return next;
                                          })
                                        }
                                      >
                                        <span
                                          className={styles.exerciseItemIcon}
                                        >
                                          {exercise.icon || "📋"}
                                        </span>
                                        <span
                                          className={styles.exerciseItemTitle}
                                        >
                                          {exercise.title}
                                        </span>
                                        <span
                                          className={styles.exerciseItemBadges}
                                        >
                                          <span
                                            className={styles.exerciseTypeBadge}
                                          >
                                            {exercise.type === "daily"
                                              ? "روزانه"
                                              : exercise.type === "weekly"
                                                ? "هفتگی"
                                                : exercise.type === "one-time"
                                                  ? "یک‌باره"
                                                  : ""}
                                          </span>
                                          {isOverdue && (
                                            <span
                                              className={
                                                styles.exerciseBadgeOverdue
                                              }
                                            >
                                              مهلت گذشته
                                            </span>
                                          )}
                                        </span>
                                        <span className={styles.expandIcon}>
                                          {exerciseIsCollapsed ? "▼" : "▲"}
                                        </span>
                                      </button>

                                      <div
                                        className={styles.exerciseItemActions}
                                      >
                                        <button
                                          type="button"
                                          className={styles.exerciseBtnEdit}
                                          onClick={() =>
                                            handleOpenEditModal(exercise)
                                          }
                                          title="ویرایش"
                                          aria-label="ویرایش تمرین"
                                        >
                                          ✏️
                                        </button>
                                        <button
                                          type="button"
                                          className={styles.exerciseBtnDelete}
                                          onClick={() =>
                                            handleDeleteExercise(exercise)
                                          }
                                          title="حذف"
                                          aria-label="حذف تمرین"
                                        >
                                          🗑️
                                        </button>
                                      </div>
                                    </div>

                                    {!exerciseIsCollapsed && (
                                      <div
                                        className={
                                          styles.exerciseAccordionContent
                                        }
                                      >
                                        {exercise.description && (
                                          <p
                                            className={styles.exerciseItemDesc}
                                          >
                                            {exercise.description}
                                          </p>
                                        )}
                                        {Array.isArray(exercise.instructions) &&
                                          exercise.instructions.length > 0 && (
                                            <ul
                                              className={
                                                styles.exerciseInstructionsPreview
                                              }
                                            >
                                              {exercise.instructions.map(
                                                (instruction, index) => (
                                                  <li
                                                    key={`${exerciseKey}-instruction-${index}`}
                                                  >
                                                    {instruction}
                                                  </li>
                                                ),
                                              )}
                                            </ul>
                                          )}
                                        <div
                                          className={styles.exerciseItemMeta}
                                        >
                                          {exercise.dueDate && (
                                            <span>
                                              مهلت انجام: {exercise.dueDate}
                                            </span>
                                          )}
                                          {exercise.priority && (
                                            <span>
                                              اولویت:{" "}
                                              {exercise.priority === "high"
                                                ? "بالا"
                                                : exercise.priority === "medium"
                                                  ? "متوسط"
                                                  : "کم"}
                                            </span>
                                          )}
                                          {exercise.assignedBy && (
                                            <span>
                                              تعیین‌کننده: {exercise.assignedBy}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </article>
                                );
                              })}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        ) : (
          <div className={styles.emptyState}>
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
                                {app.date}
                              </span>
                              <span className={styles.appointmentSelectTime}>
                                {" "}
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
    dueDate: existingExercise?.dueDate || "",
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
    // if (!form.description.trim()) {
    //   alert("لطفاً توضیحات تمرین را وارد کنید.");
    //   return;
    // }
    // if (!form.dueDate) {
    //   alert("لطفاً مهلت انجام را انتخاب کنید.");
    //   return;
    // }

    const cleanInstructions = form.instructions
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    // if (cleanInstructions.length === 0) {
    //   alert("لطفاً حداقل یک مرحله دستورالعمل وارد کنید.");
    //   return;
    // }

    const dueDateStr = form.dueDate || existingExercise?.dueDate || "";

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
          <h3>{mode === "edit" ? " ویرایش تمرین" : "طراحی تمرین جدید"}</h3>
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
              {appointmentInfo.appointmentDate} •{" "}
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
            <label>توضیحات</label>
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
                <option value="daily">روزانه</option>
                <option value="weekly">هفتگی</option>
                <option value="one-time">یک‌باره</option>
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
          {/* <div className={styles.formGroup}>
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
          </div> */}

          {/* ===== دستورالعمل‌ها ===== */}
          <div className={styles.formGroup}>
            <label>دستورالعمل‌ها</label>
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
