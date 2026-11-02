import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaBell } from "react-icons/fa";
import styles from "./NotificationDropdown.module.css";

// ============================================
// COMPONENT: Notification Dropdown
// ============================================
function NotificationDropdown({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
  toPersianDigits,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ===== بستن Dropdown با کلیک خارج =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ===== آخرین ۵ اعلان خوانده‌نشده =====
  const unreadNotifications = useMemo(() => {
    return notifications
      .filter((notification) => !notification.isRead)
      .slice(0, 5);
  }, [notifications]);

  // ===== تعداد اعلان‌های خوانده‌نشده =====
  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.isRead).length;
  }, [notifications]);

  return (
    <div className={styles.dropdownWrapper} ref={dropdownRef}>
      {/* ===== دکمه زنگوله ===== */}
      <button
        type="button"
        className={styles.notificationBtn}
        onClick={() => setIsOpen((prev) => !prev)}
        title="مشاهده اعلان‌ها"
        aria-label="مشاهده اعلان‌ها"
        aria-expanded={isOpen}
      >
        <FaBell />

        {unreadCount > 0 && (
          <span className={styles.notificationDot}>
            {toPersianDigits(unreadCount)}
          </span>
        )}
      </button>

      {/* ===== Dropdown ===== */}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {/* Header */}
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>اعلان‌ها</span>

            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.dropdownMarkAll}
                onClick={onMarkAllAsRead}
              >
                همه پیام‌ها خوانده شدند.
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className={styles.dropdownList}>
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={styles.dropdownItem}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <div className={styles.dropdownContent}>
                    <div className={styles.dropdownText}>
                      <span className={styles.dropdownTitleText}>
                        {notification.title}
                      </span>

                      <span className={styles.dropdownTime}>
                        {notification.time}
                      </span>
                    </div>

                    <p className={styles.dropdownMessage}>
                      {notification.message}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className={styles.dropdownEmpty}>
                <p>همه اعلان‌ها را خوانده‌اید!</p>

                <span className={styles.dropdownEmptySub}>
                  هیچ اعلان جدیدی وجود ندارد
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          {unreadCount > 5 && (
            <div className={styles.dropdownFooter}>
              <button
                type="button"
                className={styles.dropdownViewAll}
                onClick={() => {
                  setIsOpen(false);
                  onViewAll();
                }}
              >
                مشاهده همه اعلان‌ها ({toPersianDigits(unreadCount)})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
