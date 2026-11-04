import React, { useState, useMemo } from "react";
import styles from "./Notifications.module.css";

// ============================================
// COMPONENT: Doctor Messages (Notifications)
// ============================================
function DoctorNotifications({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  toPersianDigits,
}) {
  const [filter, setFilter] = useState("all"); // all | unread | read

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ===== فیلتر =====
  const filteredNotifications = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    if (filter === "read") return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, filter]);

  return (
    <div className={styles.pageContent}>
      {/* ===== هدر ===== */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>اعلان‌ها</h2>
          <p>رویدادها و یادآوری‌های مهم شما</p>
        </div>
        <div className={styles.notificationActions}>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>
              {toPersianDigits(unreadCount)} جدید
            </span>
          )}
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={onMarkAllAsRead}>
              ✓ همه خوانده شدند
            </button>
          )}
        </div>
      </div>

      {/* ===== فیلترها ===== */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${
            filter === "all" ? styles.active : ""
          }`}
          onClick={() => setFilter("all")}
        >
          همه
          <span className={styles.filterCount}>
            {toPersianDigits(notifications.length)}
          </span>
        </button>
        <button
          className={`${styles.filterTab} ${
            filter === "unread" ? styles.active : ""
          }`}
          onClick={() => setFilter("unread")}
        >
          خوانده نشده
          {unreadCount > 0 && (
            <span className={styles.filterCount}>
              {toPersianDigits(unreadCount)}
            </span>
          )}
        </button>
        <button
          className={`${styles.filterTab} ${
            filter === "read" ? styles.active : ""
          }`}
          onClick={() => setFilter("read")}
        >
          خوانده شده
          <span className={styles.filterCount}>
            {toPersianDigits(notifications.filter((n) => n.isRead).length)}
          </span>
        </button>
      </div>

      {/* ===== لیست اعلان‌ها ===== */}
      <div className={styles.notificationsList}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            // const typeStyle = getTypeStyle(notification.type);
            return (
              <div
                key={notification.id}
                className={`${styles.notificationCard} ${
                  !notification.isRead ? styles.unread : ""
                }`}
                onClick={() => onMarkAsRead(notification.id)}
              >
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h4 className={styles.notificationTitle}>
                      {!notification.isRead && (
                        <span className={styles.unreadDot}></span>
                      )}
                      {notification.title}
                    </h4>
                    <span className={styles.notificationTime}>
                      {notification.time}
                    </span>
                  </div>
                  <p className={styles.notificationMessage}>
                    {notification.message}
                  </p>
                </div>

                {!notification.isRead && (
                  <div className={styles.unreadIndicator}></div>
                )}
              </div>
            );
          })
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🔔</span>
            <h3>هیچ اعلانی وجود ندارد</h3>
            <p>
              {filter === "unread"
                ? "همه اعلان‌ها را خوانده‌اید."
                : filter === "read"
                  ? "هنوز اعلان خوانده شده‌ای وجود ندارد."
                  : "هنوز اعلانی دریافت نکرده‌اید."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorNotifications;
