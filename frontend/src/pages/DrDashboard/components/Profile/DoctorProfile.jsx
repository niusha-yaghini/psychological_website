import React, { useMemo } from "react";
import styles from "./DoctorProfile.module.css";
import doctorAvatar from "../../../../../public/images/Patient_Panel/usericon.png";

// ============================================
// COMPONENT: Doctor Profile
// ============================================
// function DoctorProfile({ userData }) {
// function DoctorProfile({ userData, toPersianDigits }) {
function DoctorProfile({ profile, patients, appointments, toPersianDigits }) {
  // const profile = seedData.doctorProfile;

  // ===== محاسبه‌ی آمار =====
  // const stats = useMemo(() => {
  //   const activePatients = seedData.doctorPatients.filter(
  //     (p) => p.status === "active",
  //   ).length;

  //   const completedSessions = seedData.doctorAppointments.filter(
  //     (a) => a.status === "completed",
  //   ).length;

  //   return {
  //     activePatients,
  //     completedSessions,
  //   };
  // }, []);

  const stats = useMemo(() => {
    const activePatients = patients.filter((p) => p.status === "active").length;

    const completedSessions = appointments.filter(
      (a) => a.status === "completed",
    ).length;

    return {
      activePatients,
      completedSessions,
    };
  }, [patients, appointments]);

  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>👤 پروفایل</h2>
          <p>اطلاعات شخصی شما</p>
        </div>
        <button className={styles.editBtn}>ویرایش</button>
      </div>
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          <img src={doctorAvatar} alt="" />
        </div>
        <div className={styles.profileInfo}>
          <h3>{profile.name}</h3>
          <p>{profile.specialty}</p>
          <p>📱 {profile.phone}</p>
          <p>📧 {profile.email}</p>
          <div className={styles.profileStats}>
            <span>{toPersianDigits(stats.activePatients)} بیمار فعال</span>
            <span>
              {toPersianDigits(stats.completedSessions)} جلسه برگزار شده
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorProfile;
