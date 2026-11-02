import { useState } from "react";
import styles from "./Notifications.module.css";

// ============================================
// COMPONENT: Messages Content (Notification Center)
// ============================================
function PatientNotifications({
  notifications,
  setNotifications,
  formatNotificationTime,
}) {
  const [filter, setFilter] = useState("all"); // all | unread | read

  // ===== علامت‌گذاری به عنوان خوانده شده =====
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  // ===== علامت‌گذاری همه به عنوان خوانده شده =====
  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true })),
    );
  };

  // ===== حذف اعلان =====
  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // ===== فیلتر کردن =====
  const getFilteredNotifications = () => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    if (filter === "read") {
      return notifications.filter((n) => n.isRead);
    }
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // ===== دریافت استایل بر اساس نوع =====
  const getTypeStyle = (type) => {
    const styles = {
      reminder: { bg: "#e3f2fd", border: "#0d47a1", icon: "⏰" },
      confirmed: { bg: "#e8f5e9", border: "#2e7d32", icon: "✅" },
      cancelled: { bg: "#fbe9e7", border: "#c62828", icon: "❌" },
      note: { bg: "#fff3e0", border: "#e65100", icon: "📝" },
      booking: { bg: "#e8eaf6", border: "#283593", icon: "📅" },
      weekly: { bg: "#f3e5f5", border: "#6a1b9a", icon: "🔄" },
    };
    return styles[type] || styles.reminder;
  };

  // ===== دریافت متن زمان =====
  // const getTimeAgo = (time) => {
  //   return time;
  // };

  return (
    <div className={styles.pageContent}>
      {/* هدر بخش */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInfo}>
          <h2>اعلانات</h2>
          <p>رویدادها و یادآوری‌های مهم شما</p>
        </div>
        <div className={styles.notificationActions}>
          {unreadCount > 0 && (
            <span className={styles.unreadBadge}>{unreadCount} جدید</span>
          )}
          <button className={styles.markAllBtn} onClick={markAllAsRead}>
            ✓ همه پیام ها خوانده شدند
          </button>
        </div>
      </div>

      {/* فیلترها */}
      <div className={styles.filterTabs}>
        <button
          className={`${styles.filterTab} ${
            filter === "all" ? styles.active : ""
          }`}
          onClick={() => setFilter("all")}
        >
          همه &nbsp;
          <span className={styles.filterCount}>{notifications.length}</span>
        </button>
        <button
          className={`${styles.filterTab} ${
            filter === "unread" ? styles.active : ""
          }`}
          onClick={() => setFilter("unread")}
        >
          خوانده نشده &nbsp;
          {unreadCount > 0 && (
            <span className={styles.filterCount}>{unreadCount}</span>
          )}
        </button>
        <button
          className={`${styles.filterTab} ${
            filter === "read" ? styles.active : ""
          }`}
          onClick={() => setFilter("read")}
        >
          خوانده شده &nbsp;
          <span className={styles.filterCount}>
            {notifications.filter((n) => n.isRead).length}
          </span>
        </button>
      </div>

      {/* لیست اعلانات */}
      <div className={styles.notificationsList}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const typeStyle = getTypeStyle(notification.type);
            return (
              <div
                key={notification.id}
                className={`${styles.notificationCard} ${
                  !notification.isRead ? styles.unread : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                {/* محتوای اصلی */}
                <div className={styles.notificationContent}>
                  <div className={styles.notificationHeader}>
                    <h4 className={styles.notificationTitle}>
                      {!notification.isRead && (
                        <span className={styles.unreadDot}></span>
                      )}
                      {notification.title}
                    </h4>
                    <span className={styles.notificationTime}>
                      {formatNotificationTime(notification)}
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
            <h3>هیچ اعلانی وجود ندارد</h3>
            <p>
              {filter === "unread"
                ? "همه اعلان‌ها را خوانده‌اید. "
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

export default PatientNotifications;
