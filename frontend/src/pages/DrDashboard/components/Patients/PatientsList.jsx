import React, { useState, useMemo, useEffect } from "react";

import { FaPlus } from "react-icons/fa";
import styles from "./PatientsList.module.css";

import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// ============================================
// COMPONENT: Patients List (Split View)
// ============================================
function PatientsList({
  patients,
  setPatients,
  appointments,
  setAppointments,
  moment,
  toPersianDigits,
  getAppointmentMoment,
  getDisplayStatus,
  getDisplayStatusInfo,
  doctorName,
}) {
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // info | sessions | notes | general

  // ===== State های مودال یادداشت =====
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState("");
  const [selectedAppointmentForNote, setSelectedAppointmentForNote] =
    useState(null);

  // const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);

  const [expandedAppointmentId, setExpandedAppointmentId] = useState(null);

  const [generalNotesInput, setGeneralNotesInput] = useState("");

  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [medicationForm, setMedicationForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    startDate: null,
    endDate: null,
    prescribedBy: "",
    notes: "",
    status: "active",
  });

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [patientForm, setPatientForm] = useState({
    name: "",
    phone: "",
    email: "",
    gender: "male",
    birthDate: "",
    address: "",
    emergencyContact: "",
    emergencyRelation: "",
  });

  // ==========================================
  // مشتق‌ها
  // ==========================================

  // ===== لیست بیماران فیلترشده =====
  const filteredPatients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return patients.filter((p) => {
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.phone.includes(query) ||
        p.email?.toLowerCase().includes(query)
      );
    });
  }, [patients, searchQuery]);

  // ===== بیمار انتخاب‌شده =====
  const selectedPatient = useMemo(() => {
    if (!selectedPatientId) return null;
    return patients.find((p) => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);

  // ===== نوبت‌های بیمار انتخاب‌شده =====
  const patientAppointments = useMemo(() => {
    if (!selectedPatient) return [];
    return appointments
      .filter((a) => a.patientId === selectedPatient.id)
      .sort((a, b) => {
        const momentA = getAppointmentMoment(a);
        const momentB = getAppointmentMoment(b);
        return momentB - momentA; // جدیدترین اول
      });
  }, [appointments, selectedPatient, getAppointmentMoment]);

  // ===== آمار بیمار =====
  const patientStats = useMemo(() => {
    if (!selectedPatient) {
      return { total: 0, completed: 0, cancelled: 0, noShow: 0 };
    }

    const completed = patientAppointments.filter(
      (a) => getDisplayStatus(a) === "completed",
    ).length;

    const cancelled = patientAppointments.filter(
      (a) => getDisplayStatus(a) === "cancelled",
    ).length;

    const noShow = patientAppointments.filter(
      (a) => getDisplayStatus(a) === "no-show",
    ).length;

    return {
      total: patientAppointments.length,
      completed,
      cancelled,
      noShow,
    };
    // }, [patientAppointments]);
  }, [patientAppointments, getDisplayStatus]);

  // ===== یادداشت‌های بیمار (از جلسات) =====
  const patientSessionNotes = useMemo(() => {
    return patientAppointments.filter((a) => a.sessionNotes?.summary);
  }, [patientAppointments]);

  // ==========================================
  // توابع
  // ==========================================
  const handleSelectPatient = (patientId) => {
    setSelectedPatientId(patientId);
    setActiveTab("info");
    setExpandedAppointmentId(null);
  };

  // ===== بستن پرونده (موبایل) =====
  const handleCloseRecord = () => {
    setSelectedPatientId(null);
  };

  // ===== باز کردن مودال یادداشت =====
  const handleOpenNoteModal = (appointment) => {
    setSelectedAppointmentForNote(appointment);
    setNoteInput(appointment.sessionNotes?.summary || "");
    setShowNoteModal(true);
  };

  // ===== ذخیره یادداشت =====
  const handleSaveNote = () => {
    if (!noteInput.trim()) {
      alert("لطفاً متن یادداشت را وارد کنید.");
      return;
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.id === selectedAppointmentForNote.id
          ? {
              ...item,
              sessionNotes: {
                summary: noteInput.trim(),
                createdAt:
                  item.sessionNotes?.createdAt ||
                  toPersianDigits(moment().format("jYYYY/jMM/jDD")),
                updatedAt: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
              },
            }
          : item,
      ),
    );

    setShowNoteModal(false);
    setNoteInput("");
    setSelectedAppointmentForNote(null);
    alert("یادداشت با موفقیت ذخیره شد.");
  };

  // ===== ذخیره توضیحات کلی =====
  const handleSaveGeneralNotes = () => {
    if (!selectedPatient) return;

    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              doctorNotes: generalNotesInput.trim(),
              doctorNotesUpdatedAt: toPersianDigits(
                moment().format("jYYYY/jMM/jDD"),
              ),
            }
          : p,
      ),
    );

    alert("توضیحات با موفقیت ذخیره شد.");
  };

  // ===== وقتی بیمار عوض میشه، مقدار textarea رو ست کن =====
  useEffect(() => {
    if (selectedPatient) {
      setGeneralNotesInput(selectedPatient.doctorNotes || "");
    } else {
      setGeneralNotesInput("");
    }
  }, [selectedPatient]);

  const handleOpenMedicationModal = () => {
    setMedicationForm({
      name: "",
      dosage: "",
      frequency: "",
      startDate: null,
      endDate: null,
      prescribedBy: doctorName || "",
      notes: "",
      status: "active",
    });

    setShowMedicationModal(true);
  };

  const handleSaveMedication = () => {
    if (!selectedPatient) return;

    // اعتبارسنجی
    if (!medicationForm.name.trim()) {
      alert("لطفاً نام دارو را وارد کنید.");
      return;
    }
    if (!medicationForm.dosage.trim()) {
      alert("لطفاً دوز دارو را وارد کنید.");
      return;
    }
    if (!medicationForm.frequency.trim()) {
      alert("لطفاً نحوه‌ی مصرف را وارد کنید.");
      return;
    }
    if (!medicationForm.startDate) {
      alert("لطفاً تاریخ شروع را انتخاب کنید.");
      return;
    }
    if (!medicationForm.prescribedBy.trim()) {
      alert("لطفاً نام تجویزکننده را وارد کنید.");
      return;
    }

    // ===== ساخت آبجکت دارو =====
    const currentMeds = selectedPatient.medications || [];
    const newId =
      currentMeds.length > 0
        ? Math.max(...currentMeds.map((m) => m.id)) + 1
        : 1;

    const newMedication = {
      id: newId,
      name: medicationForm.name.trim(),
      dosage: medicationForm.dosage.trim(),
      frequency: medicationForm.frequency.trim(),
      startDate: toPersianDigits(medicationForm.startDate.format("YYYY/MM/DD")),
      endDate: medicationForm.endDate
        ? toPersianDigits(medicationForm.endDate.format("YYYY/MM/DD"))
        : null,
      prescribedBy: medicationForm.prescribedBy.trim(),
      notes: medicationForm.notes.trim(),
      status: medicationForm.status,
    };

    // ===== آپدیت patient =====
    setPatients((prev) =>
      prev.map((p) =>
        p.id === selectedPatient.id
          ? {
              ...p,
              medications: [...(p.medications || []), newMedication],
            }
          : p,
      ),
    );

    setShowMedicationModal(false);
    alert("دارو با موفقیت اضافه شد.");
  };

  const handleOpenPatientModal = () => {
    setPatientForm({
      name: "",
      phone: "",
      email: "",
      gender: "male",
      birthDate: "",
      address: "",
      emergencyContact: "",
      emergencyRelation: "",
    });
    setShowPatientModal(true);
  };

  const handleSavePatient = () => {
    // اعتبارسنجی
    if (!patientForm.name.trim()) {
      alert("لطفاً نام بیمار را وارد کنید.");
      return;
    }
    if (!patientForm.phone.trim()) {
      alert("لطفاً شماره تماس را وارد کنید.");
      return;
    }

    // ===== id جدید =====
    const maxId =
      patients.length > 0 ? Math.max(...patients.map((p) => p.id)) : 100;
    const newId = maxId + 1;

    const newPatient = {
      id: newId,
      name: patientForm.name.trim(),
      phone: patientForm.phone.trim(),
      email: patientForm.email.trim(),
      gender: patientForm.gender,
      birthDate: patientForm.birthDate.trim(),
      joinDate: toPersianDigits(moment().format("jYYYY/jMM/jDD")),
      status: "active",
      emergencyContact: patientForm.emergencyContact.trim(),
      emergencyRelation: patientForm.emergencyRelation.trim(),
      address: patientForm.address.trim(),
      doctorNotes: "",
      doctorNotesUpdatedAt: null,
      medications: [],
    };

    setPatients((prev) => [...prev, newPatient]);
    setShowPatientModal(false);
    alert(`بیمار ${newPatient.name} با موفقیت اضافه شد.`);
  };

  // ==========================================
  // رندر تب‌ها
  // ==========================================
  const tabs = [
    { id: "info", label: "اطلاعات فردی", icon: "📋" },
    { id: "medications", label: "تاریخچه دارویی", icon: "💊" }, // ← جدید
    { id: "sessions", label: "تاریخچه جلسات", icon: "📅" },
    { id: "notes", label: "یادداشت‌ها و تمارین", icon: "📝" },
    { id: "general", label: "توضیحات کلی", icon: "📌" },
  ];

  // ==========================================
  // رندر
  // ==========================================
  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>👤 بیماران من</h2>
          <p>لیست بیماران و پرونده‌های آنها</p>
        </div>
        {/* <button className={styles.newBtn}>
          <FaPlus /> افزودن بیمار
        </button> */}
        <button className={styles.newBtn} onClick={handleOpenPatientModal}>
          <FaPlus /> افزودن بیمار
        </button>
      </div>

      {/* ===== Split Layout ===== */}
      <div className={styles.patientsLayout}>
        {/* ===== Sidebar - لیست بیماران ===== */}
        <div
          className={`${styles.patientSidebar} ${
            selectedPatientId ? styles.sidebarHiddenMobile : ""
          }`}
        >
          {/* جستجو */}
          <div className={styles.patientSearchBox}>
            {/* <span className={styles.patientSearchIcon}>🔍</span> */}
            <input
              type="text"
              className={styles.patientSearchInput}
              placeholder="جستجو در بیماران..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.patientSearchClear}
                onClick={() => setSearchQuery("")}
                title="پاک کردن"
              >
                ✕
              </button>
            )}
          </div>

          {/* تعداد بیماران */}
          <div className={styles.patientCount}>
            {toPersianDigits(filteredPatients.length)} بیمار
          </div>

          {/* لیست بیماران */}
          <div className={styles.patientList}>
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => {
                const isSelected = selectedPatientId === patient.id;

                // ===== تعداد جلسات این بیمار =====
                const patientSessionsCount = appointments.filter(
                  (a) => a.patientId === patient.id,
                ).length;

                return (
                  <button
                    key={patient.id}
                    className={`${styles.patientListItem} ${
                      isSelected ? styles.patientListItemActive : ""
                    }`}
                    onClick={() => handleSelectPatient(patient.id)}
                  >
                    <div className={styles.patientListAvatar}>👤</div>
                    <div className={styles.patientListInfo}>
                      <span className={styles.patientListName}>
                        {patient.name}
                      </span>
                      <span className={styles.patientListMeta}>
                        {toPersianDigits(patientSessionsCount)} جلسه
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className={styles.patientListEmpty}>
                <p>بیماری یافت نشد</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== Patient Record - پنل راست ===== */}
        {selectedPatient ? (
          <div className={styles.patientRecordPanel}>
            {/* هدر پرونده */}
            <div className={styles.patientRecordHeader}>
              {/* دکمه بستن (فقط موبایل) */}
              <button
                className={styles.patientRecordCloseBtn}
                onClick={handleCloseRecord}
                title="بازگشت به لیست"
              >
                ←
              </button>

              <div className={styles.patientRecordAvatar}>👤</div>

              <div className={styles.patientRecordHeaderInfo}>
                <h3>{selectedPatient.name}</h3>
                <div className={styles.patientRecordMeta}>
                  <span>شماره تماس: {selectedPatient.phone}</span>
                  <span>•</span>
                  <span>{toPersianDigits(patientStats.total)} جلسه</span>
                </div>
              </div>
            </div>

            {/* تب‌ها */}
            <div className={styles.patientRecordTabs}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`${styles.patientRecordTab} ${
                    activeTab === tab.id ? styles.patientRecordTabActive : ""
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={styles.patientRecordTabIcon}>
                    {tab.icon}
                  </span>
                  <span className={styles.patientRecordTabLabel}>
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* محتوای تب */}
            <div className={styles.patientRecordContent}>
              {/* ===== تب 1: اطلاعات فردی ===== */}
              {activeTab === "info" && (
                <div className={styles.patientInfoTab}>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <label>نام کامل</label>
                      <p>{selectedPatient.name}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>جنسیت</label>
                      <p>
                        {selectedPatient.gender === "male" ? "آقا" : "خانم"}
                      </p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>شماره تماس</label>
                      <p>{selectedPatient.phone}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>ایمیل</label>
                      <p>{selectedPatient.email || "—"}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>تاریخ تولد</label>
                      <p>{selectedPatient.birthDate || "—"}</p>
                    </div>
                    <div className={styles.infoItem}>
                      <label>تاریخ عضویت</label>
                      <p>{selectedPatient.joinDate}</p>
                    </div>
                    <div className={styles.infoItemFull}>
                      <label>آدرس</label>
                      <p>{selectedPatient.address || "—"}</p>
                    </div>
                  </div>

                  {/* تماس اضطراری */}
                  <div className={styles.emergencySection}>
                    <h4>تماس اضطراری</h4>
                    <div className={styles.emergencyGrid}>
                      <div className={styles.infoItem}>
                        <label>شماره تماس</label>
                        <p>{selectedPatient.emergencyContact || "—"}</p>
                      </div>
                      <div className={styles.infoItem}>
                        <label>نسبت</label>
                        <p>{selectedPatient.emergencyRelation || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== تب 2: تاریخچه دارویی ===== */}
              {activeTab === "medications" && (
                <div className={styles.patientMedicationsTab}>
                  {selectedPatient.medications &&
                  selectedPatient.medications.length > 0 ? (
                    <>
                      {/* آمار */}
                      <div className={styles.medicationsStats}>
                        <div className={styles.medStatBox}>
                          <span className={styles.medStatNumber}>
                            {toPersianDigits(
                              selectedPatient.medications.length,
                            )}
                          </span>
                          <span className={styles.medStatLabel}>کل داروها</span>
                        </div>
                        <div
                          className={`${styles.medStatBox} ${styles.medStatActive}`}
                        >
                          <span className={styles.medStatNumber}>
                            {toPersianDigits(
                              selectedPatient.medications.filter(
                                (m) => m.status === "active",
                              ).length,
                            )}
                          </span>
                          <span className={styles.medStatLabel}>
                            در حال مصرف
                          </span>
                        </div>
                        <div
                          className={`${styles.medStatBox} ${styles.medStatStopped}`}
                        >
                          <span className={styles.medStatNumber}>
                            {toPersianDigits(
                              selectedPatient.medications.filter(
                                (m) => m.status === "stopped",
                              ).length,
                            )}
                          </span>
                          <span className={styles.medStatLabel}>قطع شده</span>
                        </div>
                      </div>

                      {/* دکمه افزودن دارو */}
                      <button
                        className={styles.btnAddMedication}
                        onClick={handleOpenMedicationModal}
                      >
                        + افزودن دارو
                      </button>

                      {/* لیست داروها */}
                      <div className={styles.medicationsList}>
                        {selectedPatient.medications.map((med) => (
                          <div
                            key={med.id}
                            className={`${styles.medicationCard} ${
                              med.status === "active"
                                ? styles.medicationActive
                                : med.status === "stopped"
                                  ? styles.medicationStopped
                                  : styles.medicationCompleted
                            }`}
                          >
                            <div className={styles.medicationHeader}>
                              <div className={styles.medicationName}>
                                {med.name}
                              </div>
                              <span
                                className={`${styles.medicationStatusBadge} ${
                                  med.status === "active"
                                    ? styles.statusMedActive
                                    : med.status === "stopped"
                                      ? styles.statusMedStopped
                                      : styles.statusMedCompleted
                                }`}
                              >
                                {med.status === "active" && "در حال مصرف"}
                                {med.status === "stopped" && "قطع شده"}
                                {med.status === "completed" && "تمام شده"}
                              </span>
                            </div>

                            <div className={styles.medicationGrid}>
                              <div className={styles.medicationItem}>
                                <label>دوز</label>
                                <p>{med.dosage}</p>
                              </div>
                              <div className={styles.medicationItem}>
                                <label>نحوه‌ی مصرف</label>
                                <p>{med.frequency}</p>
                              </div>
                              <div className={styles.medicationItem}>
                                <label>شروع</label>
                                <p>{med.startDate}</p>
                              </div>
                              <div className={styles.medicationItem}>
                                <label>پایان</label>
                                <p>{med.endDate || "در حال مصرف"}</p>
                              </div>
                              <div className={styles.medicationItemFull}>
                                <label>تجویزکننده</label>
                                <p>{med.prescribedBy}</p>
                              </div>
                              {med.notes && (
                                <div className={styles.medicationItemFull}>
                                  <label>توضیحات</label>
                                  <p>{med.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className={styles.emptyState}>
                      {/* <span className={styles.emptyIcon}>💊</span> */}
                      <h3>هیچ دارویی ثبت نشده</h3>
                      <p>برای این بیمار هیچ دارویی در پرونده ثبت نشده است.</p>
                      <button
                        className={styles.btnAddMedication}
                        onClick={handleOpenMedicationModal}
                      >
                        + افزودن اولین دارو
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ===== تب 3: تاریخچه جلسات ===== */}
              {activeTab === "sessions" && (
                <div className={styles.patientSessionsTab}>
                  {/* آمار */}
                  <div className={styles.patientStatsGrid}>
                    <div className={styles.patientStatBox}>
                      <span className={styles.patientStatNumber}>
                        {toPersianDigits(patientStats.total)}
                      </span>
                      <span className={styles.patientStatLabel}>کل جلسات</span>
                    </div>
                    <div
                      className={`${styles.patientStatBox} ${styles.patientStatSuccess}`}
                    >
                      <span className={styles.patientStatNumber}>
                        {toPersianDigits(patientStats.completed)}
                      </span>
                      <span className={styles.patientStatLabel}>
                        برگزار شده
                      </span>
                    </div>
                    <div
                      className={`${styles.patientStatBox} ${styles.patientStatDanger}`}
                    >
                      <span className={styles.patientStatNumber}>
                        {toPersianDigits(patientStats.cancelled)}
                      </span>
                      <span className={styles.patientStatLabel}>کنسل شده</span>
                    </div>
                    <div
                      className={`${styles.patientStatBox} ${styles.patientStatWarning}`}
                    >
                      <span className={styles.patientStatNumber}>
                        {toPersianDigits(patientStats.noShow)}
                      </span>
                      <span className={styles.patientStatLabel}>
                        برگزار نشده
                      </span>
                    </div>
                  </div>

                  {/* لیست جلسات */}
                  <div className={styles.patientSessionsList}>
                    {patientAppointments.length > 0 ? (
                      patientAppointments.map((appointment) => {
                        const displayStatus = getDisplayStatus(appointment);
                        const isCompleted = displayStatus === "completed";
                        const isCancelled = displayStatus === "cancelled";
                        const isNoShow = displayStatus === "no-show";

                        return (
                          <div
                            key={appointment.id}
                            className={styles.patientSessionItem}
                          >
                            {/* هدر */}
                            <div className={styles.patientSessionHeader}>
                              <div className={styles.patientSessionDateBox}>
                                <span className={styles.patientSessionDate}>
                                  {appointment.date}
                                </span>
                                <span className={styles.patientSessionTime}>
                                  {toPersianDigits(
                                    appointment.startTime ||
                                      appointment.time.split(" - ")[0],
                                  )}
                                </span>
                              </div>

                              <span
                                className={`${styles.patientSessionStatus} ${
                                  isCompleted
                                    ? styles.statusSuccess
                                    : isCancelled
                                      ? styles.statusDanger
                                      : isNoShow
                                        ? styles.statusWarning
                                        : styles.statusInfo
                                }`}
                              >
                                {isCompleted && "برگزار شده"}
                                {isCancelled && "کنسل شده"}
                                {isNoShow && "برگزار نشده"}
                                {!isCompleted &&
                                  !isCancelled &&
                                  !isNoShow &&
                                  getDisplayStatusInfo(displayStatus).label}
                              </span>
                            </div>

                            {/* جزئیات */}
                            <div className={styles.patientSessionMeta}>
                              <span>{appointment.type}</span>
                              <span>•</span>
                              <span>
                                {toPersianDigits(appointment.duration)} ساعت
                              </span>
                              {isCancelled && appointment.cancelReason && (
                                <>
                                  <span>•</span>
                                  <span className={styles.cancelReasonText}>
                                    دلیل: {appointment.cancelReason}
                                  </span>
                                </>
                              )}
                            </div>

                            {/* یادداشت */}
                            {isCompleted &&
                              appointment.sessionNotes?.summary && (
                                <div className={styles.patientSessionNote}>
                                  <div
                                    className={styles.patientSessionNoteHeader}
                                  >
                                    <span>خلاصه جلسه</span>
                                    <span
                                      className={styles.patientSessionNoteDate}
                                    >
                                      {appointment.sessionNotes.updatedAt ||
                                        appointment.sessionNotes.createdAt}
                                    </span>
                                  </div>
                                  <p>{appointment.sessionNotes.summary}</p>
                                </div>
                              )}

                            {/* دکمه ثبت یادداشت */}
                            {isCompleted && (
                              <button
                                className={styles.patientSessionNoteBtn}
                                onClick={() => handleOpenNoteModal(appointment)}
                              >
                                {appointment.sessionNotes?.summary
                                  ? "ویرایش یادداشت"
                                  : "ثبت یادداشت"}
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className={styles.emptyState}>
                        <p>هیچ جلسه‌ای برای این بیمار ثبت نشده است.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ===== تب ۳: یادداشت‌ها و تمارین ===== */}
              {activeTab === "notes" && (
                <div className={styles.patientNotesTab}>
                  {patientSessionNotes.length > 0 ? (
                    patientSessionNotes.map((appointment) => {
                      const isExpanded =
                        expandedAppointmentId === appointment.id;

                      return (
                        <div
                          key={appointment.id}
                          className={`${styles.patientNoteCard} ${
                            isExpanded ? styles.patientNoteCardExpanded : ""
                          }`}
                        >
                          {/* هدر (کلیک‌پذیر) */}
                          <button
                            className={styles.patientNoteHeaderBtn}
                            onClick={() =>
                              setExpandedAppointmentId(
                                isExpanded ? null : appointment.id,
                              )
                            }
                          >
                            <div className={styles.patientNoteHeaderInfo}>
                              <span className={styles.patientNoteDate}>
                                {appointment.date}
                              </span>
                              <span className={styles.patientNoteSessionType}>
                                {appointment.type}
                              </span>
                            </div>

                            <div className={styles.patientNoteHeaderRight}>
                              {appointment.exercises?.length > 0 && (
                                <span
                                  className={styles.patientNoteExercisesCount}
                                >
                                  {/* 🎯{" "} */}
                                  {toPersianDigits(
                                    appointment.exercises.length,
                                  )}{" "}
                                  تمرین
                                </span>
                              )}
                              <span className={styles.expandIcon}>
                                {isExpanded ? "▲" : "▼"}
                              </span>
                            </div>
                          </button>

                          {/* محتوای گسترده */}
                          {isExpanded && (
                            <div className={styles.patientNoteExpandedContent}>
                              {/* ===== بخش یادداشت ===== */}
                              {appointment.sessionNotes?.summary && (
                                <div className={styles.patientNoteSection}>
                                  <div
                                    className={styles.patientNoteSectionTitle}
                                  >
                                    <span>خلاصه جلسه</span>
                                    <button
                                      className={styles.patientNoteEditBtn}
                                      onClick={() =>
                                        handleOpenNoteModal(appointment)
                                      }
                                    >
                                      ویرایش
                                    </button>
                                  </div>
                                  <p className={styles.patientNoteFullText}>
                                    {appointment.sessionNotes.summary}
                                  </p>
                                </div>
                              )}

                              {/* ===== بخش تمارین ===== */}
                              {appointment.exercises?.length > 0 && (
                                <div className={styles.patientNoteSection}>
                                  <div
                                    className={styles.patientNoteSectionTitle}
                                  >
                                    <span>🎯 تمارین تعیین‌شده</span>
                                  </div>
                                  <div className={styles.patientExercisesList}>
                                    {appointment.exercises.map((exercise) => (
                                      <div
                                        key={exercise.id}
                                        className={styles.patientExerciseItem}
                                      >
                                        <div
                                          className={styles.patientExerciseIcon}
                                        >
                                          {exercise.icon || "📋"}
                                        </div>
                                        <div
                                          className={
                                            styles.patientExerciseContent
                                          }
                                        >
                                          <span
                                            className={
                                              styles.patientExerciseTitle
                                            }
                                          >
                                            {exercise.title}
                                          </span>
                                          <span
                                            className={
                                              styles.patientExerciseDesc
                                            }
                                          >
                                            {exercise.description}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* اگه هیچی نبود */}
                              {!appointment.sessionNotes?.summary &&
                                (!appointment.exercises ||
                                  appointment.exercises.length === 0) && (
                                  <div className={styles.patientNoteEmpty}>
                                    یادداشت و تمرینی برای این جلسه ثبت نشده است.
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>📝</span>
                      <p>هنوز یادداشت یا تمرینی برای این بیمار ثبت نشده است.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ===== تب ۵: توضیحات کلی ===== */}
              {activeTab === "general" && (
                <div className={styles.patientGeneralTab}>
                  <p className={styles.generalTabHint}>
                    این توضیحات فقط برای شما قابل مشاهده است و در پرونده‌ی بیمار
                    ذخیره می‌شود.
                  </p>

                  <div className={styles.formGroup}>
                    <textarea
                      className={styles.generalNotesTextarea}
                      value={generalNotesInput}
                      onChange={(e) => setGeneralNotesInput(e.target.value)}
                      placeholder="توضیحات کلی درباره‌ی این بیمار..."
                      rows="10"
                      maxLength="3000"
                    />
                  </div>

                  <div className={styles.generalTabFooter}>
                    <span className={styles.generalTabDate}>
                      {selectedPatient.doctorNotesUpdatedAt
                        ? `آخرین به‌روزرسانی: ${selectedPatient.doctorNotesUpdatedAt}`
                        : "هنوز ذخیره نشده"}
                    </span>
                    <button
                      className={styles.btnSaveGeneral}
                      onClick={handleSaveGeneralNotes}
                    >
                      ذخیره توضیحات
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.patientRecordEmpty}>
            {/* <span className={styles.patientRecordEmptyIcon}>👈</span> */}
            <h3>یک بیمار را انتخاب کنید</h3>
            <p>برای مشاهده‌ی پرونده، روی نام بیمار کلیک کنید.</p>
          </div>
        )}
      </div>

      {/* ===== مودال یادداشت جلسه ===== */}
      {showNoteModal && selectedAppointmentForNote && (
        <div className={styles.modalOverlay}>
          <div className={styles.noteModal}>
            <div className={styles.modalHeader}>
              <h3>📝 یادداشت جلسه</h3>
              <button
                className={styles.modalClose}
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteInput("");
                  setSelectedAppointmentForNote(null);
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.noteSessionInfo}>
                <p>
                  جلسه با <strong>{selectedAppointmentForNote.patient}</strong>
                </p>
                <span className={styles.noteSessionDate}>
                  {selectedAppointmentForNote.date} •{" "}
                  {toPersianDigits(
                    selectedAppointmentForNote.startTime ||
                      selectedAppointmentForNote.time.split(" - ")[0],
                  )}
                </span>
              </div>

              <div className={styles.formGroup}>
                <label>خلاصه جلسه:</label>
                <textarea
                  className={styles.noteTextarea}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="خلاصه‌ای از مباحث مطرح شده، وضعیت بیمار، پیشرفت‌ها و توصیه‌های جلسه..."
                  rows="8"
                  maxLength="2000"
                  autoFocus
                />
                <span className={styles.noteCharCount}>
                  {toPersianDigits(noteInput.length)} / ۲۰۰۰
                </span>
              </div>

              <p className={styles.noteHint}>
                این یادداشت در پرونده‌ی بیمار ذخیره خواهد شد و فقط برای شما قابل
                مشاهده است.
              </p>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteInput("");
                  setSelectedAppointmentForNote(null);
                }}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={handleSaveNote}
              >
                ذخیره یادداشت
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== مودال افزودن دارو ===== */}
      {showMedicationModal && selectedPatient && (
        <div className={styles.modalOverlay}>
          <div className={styles.addModal}>
            <div className={styles.modalHeader}>
              <h3>💊 افزودن دارو</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowMedicationModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* نام دارو */}
              <div className={styles.formGroup}>
                <label>نام دارو *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="مثلاً: سرترالین"
                  value={medicationForm.name}
                  onChange={(e) =>
                    setMedicationForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>

              {/* دوز و نحوه مصرف */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>دوز *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="مثلاً: ۵۰ میلی‌گرم"
                    value={medicationForm.dosage}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        dosage: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>نحوه‌ی مصرف *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="مثلاً: روزانه یک‌بار - صبح"
                    value={medicationForm.frequency}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* تاریخ شروع و پایان */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>تاریخ شروع *</label>
                  <DatePicker
                    value={medicationForm.startDate}
                    onChange={(date) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        startDate: date,
                      }))
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
                <div className={styles.formGroup}>
                  <label>تاریخ پایان (اختیاری)</label>
                  <DatePicker
                    value={medicationForm.endDate}
                    onChange={(date) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        endDate: date,
                      }))
                    }
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass={styles.formInput}
                    placeholder="در حال مصرف (خالی بگذارید)"
                    format="YYYY/MM/DD"
                    editable={false}
                  />
                </div>
              </div>

              {/* تجویزکننده و وضعیت */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>تجویزکننده *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="نام پزشک"
                    value={medicationForm.prescribedBy}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        prescribedBy: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>وضعیت</label>
                  <select
                    className={styles.formSelect}
                    value={medicationForm.status}
                    onChange={(e) =>
                      setMedicationForm((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                  >
                    <option value="active">در حال مصرف</option>
                    <option value="stopped">قطع شده</option>
                    <option value="completed">تمام شده</option>
                  </select>
                </div>
              </div>

              {/* توضیحات */}
              <div className={styles.formGroup}>
                <label>توضیحات (اختیاری)</label>
                <textarea
                  className={styles.formInput}
                  placeholder="توضیحات اضافه درباره‌ی دارو..."
                  value={medicationForm.notes}
                  onChange={(e) =>
                    setMedicationForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows="3"
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => setShowMedicationModal(false)}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={handleSaveMedication}
              >
                افزودن دارو
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== مودال افزودن بیمار ===== */}
      {showPatientModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.addModal}>
            <div className={styles.modalHeader}>
              <h3>👤 افزودن بیمار جدید</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowPatientModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* نام و جنسیت */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>نام و نام خانوادگی *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="مثلاً: احمد محمدی"
                    value={patientForm.name}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>جنسیت</label>
                  <select
                    className={styles.formSelect}
                    value={patientForm.gender}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                  >
                    <option value="male">آقا</option>
                    <option value="female">خانم</option>
                  </select>
                </div>
              </div>

              {/* تماس و ایمیل */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>شماره تماس *</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={patientForm.phone}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    dir="ltr"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>ایمیل (اختیاری)</label>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="example@email.com"
                    value={patientForm.email}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    dir="ltr"
                  />
                </div>
              </div>

              {/* تاریخ تولد */}
              <div className={styles.formGroup}>
                <label>تاریخ تولد (اختیاری)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="۱۳۷۵/۰۳/۱۵"
                  value={patientForm.birthDate}
                  onChange={(e) =>
                    setPatientForm((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
                  }
                />
              </div>

              {/* آدرس */}
              <div className={styles.formGroup}>
                <label>آدرس (اختیاری)</label>
                <textarea
                  className={styles.formInput}
                  placeholder="آدرس محل سکونت"
                  value={patientForm.address}
                  onChange={(e) =>
                    setPatientForm((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  rows="2"
                />
              </div>

              {/* تماس اضطراری */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>تماس اضطراری (اختیاری)</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    value={patientForm.emergencyContact}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        emergencyContact: e.target.value,
                      }))
                    }
                    dir="ltr"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>نسبت</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="مثلاً: همسر"
                    value={patientForm.emergencyRelation}
                    onChange={(e) =>
                      setPatientForm((prev) => ({
                        ...prev,
                        emergencyRelation: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.btnCancelModal}
                onClick={() => setShowPatientModal(false)}
              >
                انصراف
              </button>
              <button
                className={styles.btnConfirmModal}
                onClick={handleSavePatient}
              >
                افزودن بیمار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientsList;
