// ============================================
// COMPONENT: Doctor Settings
// ============================================
function DoctorSettings() {
  return (
    <div className={styles.pageContent}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>⚙️ تنظیمات</h2>
          <p>تنظیمات حساب کاربری</p>
        </div>
      </div>
      <div className={styles.settingsList}>
        <div className={styles.settingItem}>
          <span>🔔 اعلان‌ها</span>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.switchSlider}></span>
          </label>
        </div>
        <div className={styles.settingItem}>
          <span>⏰ زمانبندی جلسات</span>
          <button className={styles.settingBtn}>مدیریت</button>
        </div>
        <div className={styles.settingItem}>
          <span>🌙 حالت شب</span>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.switchSlider}></span>
          </label>
        </div>
      </div>
    </div>
  );
}

export default DoctorSettings;
