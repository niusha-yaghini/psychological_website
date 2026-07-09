// src/components/Landing/Landing.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";
import seedData from "../../../../backend/seed";
import backImage from "../../../public/images/back12.png";

const formatPersianDate = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("/");
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

function Landing() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [imageErrors, setImageErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    setData(seedData);
  }, []);

  if (!data) {
    return <div className={styles.loading}>در حال بارگذاری...</div>;
  }

  const { doctor, workshops, podcasts, clinics, socialMedia } = data;
  const upcomingWorkshops = workshops.filter((w) => w.isUpcoming);
  const pastWorkshops = workshops.filter((w) => !w.isUpcoming);
  const latestPodcast = podcasts.find((p) => p.isLatest);
  const otherPodcasts = podcasts.filter((p) => !p.isLatest);

  const handleImageError = (workshopId) => {
    setImageErrors((prev) => ({ ...prev, [workshopId]: true }));
  };

  return (
    <div className={styles.landing}>
      {/* ======== HEADER ======== */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.logo}>
            <div>
              <span className={styles.logoText}>کلینیک روانشناسی</span>
              <span className={styles.logoSubtext}>{doctor.name}</span>
            </div>
          </div>
          <nav className={styles.nav}>
            <a href="#workshops">کارگاه‌ها</a>
            <a href="#podcasts">پادکست‌ها</a>
            <a href="#about">درباره من</a>
            <a href="#clinics">مطب‌ها</a>
            {/* ✅ استفاده از Link برای ورود */}
            <Link to="/login" className={styles.btnPatient}>
              <span>👤</span> ورود
            </Link>
          </nav>
          <button className={styles.menuToggle}>☰</button>
        </div>
      </header>

      {/* ======== HERO ======== */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              {doctor.name}
              <span className={styles.heroSubtitle}>{doctor.specialty}</span>
            </h1>
            <p className={styles.heroDescription}>{doctor.bio}</p>
            <div className={styles.heroStats}>
              <div>
                <span className={styles.statNumber}>
                  {doctor.yearsOfExperience}+
                </span>
                <span>سال تجربه</span>
              </div>
              <div>
                <span className={styles.statNumber}>
                  {doctor.patientsCount}+
                </span>
                <span>مراجع</span>
              </div>
              <div>
                <span className={styles.statNumber}>
                  {doctor.workshopsCount}+
                </span>
                <span>کارگاه</span>
              </div>
            </div>
            <div className={styles.heroButtons}>
              {/* ✅ استفاده از Link برای ورود و ثبت‌نام */}
              <Link to="/login" className={styles.btnPrimary}>
                <span>👤</span> ورود به پنل بیماران
              </Link>
              <Link to="/signup" className={styles.btnSecondary}>
                <span>📝</span> ثبت‌نام جدید
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.imageWrapper}>
              <div className={styles.heroPlaceholder}>
                <img src={backImage} alt="لوگو" className={styles.logoImage} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.waveDivider}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0 C300,100 600,100 1200,0 L1200,120 L0,120 Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* ======== WORKSHOPS ======== */}
      <section id="workshops" className={styles.workshops}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionTag}>📚 آموزش</span>
              <h2>کارگاه‌های آموزشی</h2>
            </div>
            <div className={styles.tabs}>
              <button
                className={`${styles.tabBtn} ${
                  activeTab === "upcoming" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("upcoming")}
              >
                کارگاه‌های پیش‌رو
              </button>
              <button
                className={`${styles.tabBtn} ${
                  activeTab === "past" ? styles.active : ""
                }`}
                onClick={() => setActiveTab("past")}
              >
                کارگاه‌های گذشته
              </button>
            </div>
          </div>
          <div className={styles.workshopGrid}>
            {(activeTab === "upcoming" ? upcomingWorkshops : pastWorkshops).map(
              (workshop) => (
                <div key={workshop.id} className={styles.workshopCard}>
                  <div className={styles.workshopImage}>
                    {!imageErrors[workshop.id] ? (
                      <img
                        src={workshop.image}
                        alt={workshop.title}
                        className={styles.workshopImageCustom}
                        onError={() => handleImageError(workshop.id)}
                      />
                    ) : (
                      <div className={styles.imagePlaceholder}>📘</div>
                    )}
                    {workshop.isUpcoming && (
                      <div className={styles.workshopBadge}>پیش‌رو</div>
                    )}
                  </div>
                  <div className={styles.workshopContent}>
                    <h3>{workshop.title}</h3>
                    <div className={styles.workshopMeta}>
                      <span>📅 {formatPersianDate(workshop.date)}</span>
                    </div>
                    <p className={styles.workshopDescription}>
                      {workshop.description}
                    </p>
                    <div className={styles.workshopTags}>
                      {workshop.tags.map((tag, i) => (
                        <span key={i} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className={styles.workshopFooter}>
                      <div>
                        <span className={styles.workshopPrice}>
                          {workshop.price}
                        </span>
                      </div>
                      <button className={styles.btnWorkshop}>
                        {workshop.isUpcoming ? "ثبت‌نام ✨" : "مشاهده سرفصل‌ها"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ======== PODCASTS ======== */}
      <section id="podcasts" className={styles.podcasts}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionTag}>🎙️ رسانه</span>
              <h2>پادکست‌های روانشناسی</h2>
            </div>
            <Link to="/podcasts" className={styles.viewAll}>
              مشاهده همه ←
            </Link>
          </div>
          {latestPodcast && (
            <div className={styles.podcastFeatured}>
              <div className={styles.podcastImage}>
                <div className={styles.podcastPlaceholder}>🎙️</div>
                <div className={styles.playButton}>▶</div>
              </div>
              <div className={styles.podcastInfo}>
                <div className={styles.podcastBadge}>🔥 جدیدترین</div>
                <h3>{latestPodcast.title}</h3>
                <div className={styles.podcastMeta}>
                  <span>📅 {formatPersianDate(latestPodcast.date)}</span>
                  <span>⏱️ {latestPodcast.duration}</span>
                  <span>📊 {latestPodcast.episodes} قسمت</span>
                </div>
                <p className={styles.podcastDescription}>
                  {latestPodcast.description}
                </p>
                <button className={styles.btnPodcast}>
                  <span>▶</span> گوش دادن به پادکست
                </button>
              </div>
            </div>
          )}
          <div className={styles.podcastList}>
            {otherPodcasts.map((podcast) => (
              <div key={podcast.id} className={styles.podcastItem}>
                <div className={styles.podcastItemIcon}>🎙️</div>
                <div className={styles.podcastItemInfo}>
                  <h4>{podcast.title}</h4>
                  <p>
                    {formatPersianDate(podcast.date)} • {podcast.duration} •{" "}
                    {podcast.episodes} قسمت
                  </p>
                </div>
                <button className={styles.btnListen}>▶ گوش دادن</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== ABOUT ======== */}
      <section id="about" className={styles.about}>
        <div className={styles.container}>
          <div className={styles.aboutGrid}>
            <div className={styles.aboutText}>
              <span className={styles.sectionTag}>👩‍⚕️ درباره من</span>
              <h2>دکتر {doctor.name}</h2>
              <p className={styles.aboutBio}>{doctor.bio}</p>
              <div className={styles.aboutSpecialties}>
                <div className={styles.specialtyItem}>
                  <span>🧠</span>
                  <div>
                    <h4>رواندرمانی تحلیلی</h4>
                    <p>درمان عمیق و ریشه‌ای مشکلات</p>
                  </div>
                </div>
                <div className={styles.specialtyItem}>
                  <span>💭</span>
                  <div>
                    <h4>درمان شناختی-رفتاری</h4>
                    <p>تغییر الگوهای فکری و رفتاری</p>
                  </div>
                </div>
                <div className={styles.specialtyItem}>
                  <span>❤️</span>
                  <div>
                    <h4>مشاوره خانواده</h4>
                    <p>بهبود روابط خانوادگی</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.aboutStats}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>👥</span>
                <span className={styles.statNumber}>
                  {doctor.patientsCount}+
                </span>
                <span>مراجع راضی</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>📚</span>
                <span className={styles.statNumber}>
                  {doctor.workshopsCount}+
                </span>
                <span>کارگاه برگزار شده</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>⭐</span>
                <span className={styles.statNumber}>{doctor.rating}</span>
                <span>امتیاز از ۵</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== CLINICS ======== */}
      <section id="clinics" className={styles.clinics}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionTag}>📍 آدرس</span>
              <h2>مطب‌های دکتر {doctor.name}</h2>
            </div>
          </div>
          <div className={styles.clinicsGrid}>
            {clinics.map((clinic) => (
              <div key={clinic.id} className={styles.clinicCard}>
                <div className={styles.clinicIcon}>🏥</div>
                <h3>{clinic.name}</h3>
                <p className={styles.clinicAddress}>{clinic.address}</p>
                <div className={styles.clinicContact}>
                  <p>📞 {clinic.phone}</p>
                  <p>📞 {clinic.phone2}</p>
                  <p>🕐 {clinic.hours}</p>
                  <p>🕐 {clinic.hoursFriday}</p>
                </div>
                <button className={styles.btnClinic}>📍 مشاهده در نقشه</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== SOCIAL & CONTACT ======== */}
      <section className={styles.contact}>
        <div className={styles.container}>
          <div className={styles.contactWrapper}>
            <div className={styles.contactContent}>
              <span className={styles.sectionTag}>📱 ارتباط با ما</span>
              <h2>در شبکه‌های اجتماعی با ما همراه باشید</h2>
              <p>
                برای دریافت آخرین مطالب، کارگاه‌ها و پادکست‌ها، ما را دنبال
                کنید.
              </p>
              <div className={styles.socialLinks}>
                <a
                  href={socialMedia.instagram}
                  className={styles.socialLink}
                  style={{ "--social-color": "#E4405F" }}
                >
                  <span>📸</span> اینستاگرام
                </a>
                <a
                  href={socialMedia.telegram}
                  className={styles.socialLink}
                  style={{ "--social-color": "#26A5E4" }}
                >
                  <span>✈️</span> تلگرام
                </a>
                <a
                  href={socialMedia.whatsapp}
                  className={styles.socialLink}
                  style={{ "--social-color": "#25D366" }}
                >
                  <span>💬</span> واتس‌اپ
                </a>
                <a
                  href={socialMedia.youtube}
                  className={styles.socialLink}
                  style={{ "--social-color": "#FF0000" }}
                >
                  <span>▶️</span> یوتیوب
                </a>
              </div>
            </div>
            <div className={styles.contactInfo}>
              <h3>اطلاعات تماس</h3>
              <p>📞 {socialMedia.phone}</p>
              <p>📱 {socialMedia.phone2}</p>
              <p>✉️ {socialMedia.email}</p>
              <div className={styles.contactHours}>
                <h4>ساعات پاسخگویی</h4>
                <p>شنبه تا چهارشنبه: ۹:۰۰ - ۱۸:۰۰</p>
                <p>پنجشنبه: ۱۴:۰۰ - ۲۰:۰۰</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <span>🧠</span>
              <h3>کلینیک روانشناسی</h3>
              <p>دکتر {doctor.name}</p>
            </div>
            <div className={styles.footerLinks}>
              <a href="#workshops">کارگاه‌ها</a>
              <a href="#podcasts">پادکست‌ها</a>
              <a href="#about">درباره من</a>
              <a href="#clinics">مطب‌ها</a>
            </div>
            <div className={styles.footerSocial}>
              <a href={socialMedia.instagram}>📸</a>
              <a href={socialMedia.telegram}>✈️</a>
              <a href={socialMedia.youtube}>▶️</a>
              <a href={`mailto:${socialMedia.email}`}>✉️</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} تمامی حقوق محفوظ است.</p>
            <p>طراحی و توسعه با ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
