import React from "react";
import styles from "./Sidebar.module.css";

import { FaChevronLeft, FaChevronRight, FaSignOutAlt } from "react-icons/fa";

function Sidebar({
  logo,
  isCollapsed,
  onToggle,
  activeTab,
  setActiveTab,
  menuItems,
  bottomMenuItems,
  onLogout,
}) {
  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      {/* ===== SIDEBAR HEADER ===== */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logoWrapper}>
          <img src={logo} alt="روان کوک" className={styles.logoImage} />
        </div>

        <button className={styles.collapseBtn} onClick={onToggle}>
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* ===== MAIN MENU ===== */}
      <nav className={styles.sidebarNav}>
        <ul className={styles.navList}>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`${styles.navItem} ${
                  activeTab === item.id ? styles.active : ""
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>

                {!isCollapsed && (
                  <>
                    <span className={styles.navLabel}>{item.label}</span>

                    {item.badge && (
                      <span className={styles.navBadge}>{item.badge}</span>
                    )}
                  </>
                )}

                {isCollapsed && item.badge && (
                  <span className={styles.navBadgeMini}>{item.badge}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ===== BOTTOM MENU ===== */}
      <div className={styles.sidebarFooter}>
        <ul className={styles.navList}>
          {bottomMenuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`${styles.navItem} ${
                  activeTab === item.id ? styles.active : ""
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>

                {!isCollapsed && (
                  <span className={styles.navLabel}>{item.label}</span>
                )}
              </button>
            </li>
          ))}

          {/* ===== LOGOUT ===== */}
          <li>
            <button className={styles.navItem} onClick={onLogout}>
              <span className={styles.navIcon}>
                <FaSignOutAlt />
              </span>

              {!isCollapsed && <span className={styles.navLabel}>خروج</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
