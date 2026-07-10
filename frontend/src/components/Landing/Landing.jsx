import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";
import seedData from "../../../../backend/seed";
import backImage from "../../../public/images/back12.png";

import logo from "../../../public/images/logo1.png";

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
            <img src={logo} alt="لوگو" className={styles.logoImage} />
          </div>
          <nav className={styles.nav}>
            <a href="#">خانه</a>
            <a href="#howItWorks">مسیر درمان</a>
            <a href="#theapyArea">خدمات</a>
            <a href="#workshops">کارگاه‌ها</a>
            <a href="#podcasts">پادکست‌ها</a>
            <a href="#about">درباره من</a>
            <a href="#clinics">آدرس</a>
          </nav>
          <div className={styles.auth}>
            <Link to="/login" className={styles.btnlogin}>
              ورود
            </Link>
            <Link to="/signup" className={styles.btnsignup}>
              ثبت‌نام
            </Link>
          </div>
          <button className={styles.menuToggle}>☰</button>
        </div>
      </header>
      {/* ======== HERO ======== */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{doctor.name}</h1>
            <span className={styles.heroSubtitle}>{doctor.specialty}</span>

            <p className={styles.heroDescription}>{doctor.bio}</p>
            <div className={styles.heroButtons}>
              <Link to="/login" className={styles.btnPrimary}>
                چطوری اولین قدم رو بردارم؟
              </Link>
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

      {/* ======== HOW IT WORKS - مراحل درمان ======== */}
      {/* <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionTag}>🌱 مسیر درمان</span>
              <h2>
                مراحل <span>درمان</span> در کلینیک
              </h2>
              <p className={styles.sectionDescription}>
                با ما همراه باشید تا گام‌به‌گام در مسیر بهبودی و آرامش قدم
                بردارید
              </p>
            </div>
          </div>

          <div className={styles.stepsContainer}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>۰۱</div>
              <div className={styles.stepIcon}>📋</div>
              <h3>ارزیابی اولیه</h3>
              <p>
                در این مرحله، فرم‌های ارزیابی را تکمیل می‌کنید و اطلاعات اولیه
                درباره وضعیت خود را در اختیار دکتر قرار می‌دهید.
              </p>
              <div className={styles.stepDetail}>
                <span>⏱️ زمان: ۳۰ دقیقه</span>
                <span>📍 روش: آنلاین / حضوری</span>
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>۰۲</div>
              <div className={styles.stepIcon}>🧠</div>
              <h3>جلسات مشاوره</h3>
              <p>
                جلسات درمانی با توجه به نیاز شما برنامه‌ریزی می‌شود. هر جلسه با
                هدف مشخص و بر اساس طرح درمان پیش می‌رود.
              </p>
              <div className={styles.stepDetail}>
                <span>⏱️ هر جلسه: ۶۰-۹۰ دقیقه</span>
                <span>📅 هفتگی / دو هفته‌ای</span>
              </div>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>۰۳</div>
              <div className={styles.stepIcon}>🌿</div>
              <h3>پیگیری و تداوم</h3>
              <p>
                پس از پایان جلسات، برنامه‌های پیگیری و تمرینات عملی برای تثبیت
                تغییرات مثبت در زندگی روزمره ارائه می‌شود.
              </p>
              <div className={styles.stepDetail}>
                <span>📊 ارزیابی پیشرفت</span>
                <span>💪 تمرینات عملی</span>
              </div>
            </div>
          </div>

          <div className={styles.stepsCTA}>
            <p>آماده شروع مسیر بهبودی هستید؟</p>
            <Link to="/signup" className={styles.btnPrimary}>
              شروع کنید
              <span>→</span>
            </Link>
          </div>
        </div>
      </section> */}

      {/* version 2 */}
      {/* ======== HOW IT WORKS - مراحل درمان ======== */}
      {/* <section className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionTag}>🌱 مسیر درمان</span>
              <h2>
                مراحل <span>درمان</span> در کلینیک
              </h2>
              <p className={styles.sectionDescription}>
                با ما همراه باشید تا گام‌به‌گام در مسیر بهبودی و آرامش قدم
                بردارید
              </p>
            </div>
          </div>

          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={styles.timelineConnector}>
                <div className={styles.timelineDot}>
                  <span className={styles.dotNumber}>۱</span>
                </div>
                <div className={styles.timelineLine}></div>
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineCard}>
                  <div className={styles.timelineIcon}>📋</div>
                  <div className={styles.timelineText}>
                    <h3>ارزیابی اولیه</h3>
                    <p>
                      در این مرحله، فرم‌های ارزیابی را تکمیل می‌کنید و اطلاعات
                      اولیه درباره وضعیت خود را در اختیار دکتر قرار می‌دهید.
                    </p>
                    <div className={styles.timelineDetails}>
                      <span>⏱️ زمان: ۳۰ دقیقه</span>
                      <span>📍 روش: آنلاین / حضوری</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineConnector}>
                <div className={styles.timelineDot}>
                  <span className={styles.dotNumber}>۲</span>
                </div>
                <div className={styles.timelineLine}></div>
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineCard}>
                  <div className={styles.timelineIcon}>🧠</div>
                  <div className={styles.timelineText}>
                    <h3>جلسات مشاوره</h3>
                    <p>
                      جلسات درمانی با توجه به نیاز شما برنامه‌ریزی می‌شود. هر
                      جلسه با هدف مشخص و بر اساس طرح درمان پیش می‌رود.
                    </p>
                    <div className={styles.timelineDetails}>
                      <span>⏱️ هر جلسه: ۶۰-۹۰ دقیقه</span>
                      <span>📅 هفتگی / دو هفته‌ای</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineConnector}>
                <div className={styles.timelineDot}>
                  <span className={styles.dotNumber}>۳</span>
                </div>
                <div className={styles.timelineLine}></div>
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineCard}>
                  <div className={styles.timelineIcon}>🌿</div>
                  <div className={styles.timelineText}>
                    <h3>پیگیری و تداوم</h3>
                    <p>
                      پس از پایان جلسات، برنامه‌های پیگیری و تمرینات عملی برای
                      تثبیت تغییرات مثبت در زندگی روزمره ارائه می‌شود.
                    </p>
                    <div className={styles.timelineDetails}>
                      <span>📊 ارزیابی پیشرفت</span>
                      <span>💪 تمرینات عملی</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.timelineItem}>
              <div className={styles.timelineConnector}>
                <div
                  className={`${styles.timelineDot} ${styles.timelineDotEnd}`}
                >
                  <span className={styles.dotNumber}>🎯</span>
                </div>
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineEnd}>
                  <h4>رسیدن به آرامش و تعادل</h4>
                  <p>شما در این مسیر تنها نیستید، ما در کنار شما هستیم</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.stepsCTA}>
            <p>آماده شروع مسیر بهبودی هستید؟</p>
            <Link to="/signup" className={styles.btnPrimary}>
              شروع کنید
              <span>→</span>
            </Link>
          </div>
        </div>
      </section> */}

      {/* ======== HOW IT WORKS - مراحل درمان ======== */}
      <section id="howItWorks" className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>مسیر درمان</h2>
              <p className={styles.sectionDescription}>
                با ما همراه باشید تا گام‌به‌گام در مسیر بهبودی و آرامش قدم
                بردارید.
              </p>
            </div>
          </div>

          <div className={styles.stepsContainer}>
            {/* ===== گام اول ===== */}
            <div className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>۰۱</div>
                {/* <div className={styles.stepIcon}>📋</div> */}
                <h3>ارزیابی اولیه</h3>
                <p>
                  تکمیل فرم‌های ارزیابی و ارائه اطلاعات اولیه درباره وضعیت خود
                  به دکتر
                </p>
                <div className={styles.stepDetail}>
                  <span>⏱️ ۳۰ دقیقه</span>
                  <span>📍 آنلاین / حضوری</span>
                </div>
              </div>
            </div>

            {/* ===== گام دوم ===== */}
            <div className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>۰۲</div>
                {/* <div className={styles.stepIcon}>🧠</div> */}
                <h3>جلسات مشاوره</h3>
                <p>
                  جلسات درمانی با توجه به نیاز شما و بر اساس طرح درمان تخصصی پیش
                  می‌رود
                </p>
                <div className={styles.stepDetail}>
                  <span>⏱️ ۶۰-۹۰ دقیقه</span>
                  <span>📅 هفتگی / دو هفته‌ای</span>
                </div>
              </div>
            </div>

            {/* ===== گام سوم ===== */}
            <div className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>۰۳</div>
                {/* <div className={styles.stepIcon}>🌿</div> */}
                <h3>پیگیری و تداوم</h3>
                <p>
                  برنامه‌های پیگیری و تمرینات عملی برای تثبیت تغییرات مثبت در
                  زندگی روزمره
                </p>
                <div className={styles.stepDetail}>
                  <span>📊 ارزیابی پیشرفت</span>
                  <span>💪 تمرینات عملی</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== CTA ===== */}
          <div className={styles.stepsCTA}>
            <p>آماده شروع مسیر بهبودی هستید؟</p>
            <Link to="/signup" className={styles.btnPrimary}>
              شروع کنید
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ======== THERAPY AREAS - حوزه‌های تخصصی ======== */}
      <section id="theapyArea" className={styles.therapyAreas}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>حوزه‌های تخصصی</h2>
              <p className={styles.sectionDescription}>
                با بهره‌گیری از روش‌های علمی و تخصصی، در کنار شما هستیم
              </p>
            </div>
          </div>

          <div className={styles.areasGrid}>
            {/* ===== درمان فردی ===== */}
            <div className={styles.areaCard}>
              <div className={styles.areaIcon}>🧘</div>
              <div className={styles.areaContent}>
                <h3>درمان فردی</h3>
                <p>
                  جلسات یک‌به‌یک با دکتر برای بررسی عمیق مسائل فردی، شناسایی
                  ریشه‌های مشکلات و ارائه راهکارهای تخصصی.
                </p>
                <div className={styles.areaTags}>
                  <span>اضطراب</span>
                  <span>افسردگی</span>
                  <span>استرس</span>
                  <span>اعتماد به نفس</span>
                </div>
                <button className={styles.areaBtn}>بیشتر بدانید</button>
              </div>
            </div>

            {/* ===== زوج درمانی ===== */}
            <div className={styles.areaCard}>
              <div className={styles.areaIcon}>💑</div>
              <div className={styles.areaContent}>
                <h3>زوج درمانی</h3>
                <p>
                  بهبود روابط زوجین، حل تعارضات، تقویت ارتباط عاطفی و ایجاد درک
                  متقابل برای زندگی مشترک سالم‌تر.
                </p>
                <div className={styles.areaTags}>
                  <span>ارتباط مؤثر</span>
                  <span>حل تعارض</span>
                  <span>صمیمیت</span>
                  <span>اعتماد</span>
                </div>
                <button className={styles.areaBtn}>بیشتر بدانید</button>
              </div>
            </div>

            {/* ===== درمان نوجوان ===== */}
            <div className={styles.areaCard}>
              <div className={styles.areaIcon}>🧑‍🎓</div>
              <div className={styles.areaContent}>
                <h3>درمان نوجوانان</h3>
                <p>
                  مشاوره تخصصی برای نوجوانان با رویکردی متناسب با سن، کمک به
                  مدیریت چالش‌های دوران بلوغ و رشد سالم.
                </p>
                <div className={styles.areaTags}>
                  <span>مدیریت خشم</span>
                  <span>اعتماد به نفس</span>
                  <span>مشکلات تحصیلی</span>
                  <span>هویت‌یابی</span>
                </div>
                <button className={styles.areaBtn}>بیشتر بدانید</button>
              </div>
            </div>
          </div>

          {/* ===== چرا تراپی؟ ===== */}
          <div className={styles.whyTherapy}>
            <div className={styles.whyTherapyContent}>
              <div className={styles.whyIcon}>💚</div>
              <h3>چرا درمان روانشناسی؟</h3>
              <p>
                درمان روانشناسی به شما کمک می‌کند تا با شناخت بهتر خود، الگوهای
                فکری و رفتاری ناسالم را شناسایی و تغییر دهید. این مسیر به شما
                امکان می‌دهد تا زندگی متعادل‌تر، آرام‌تر و رضایت‌بخش‌تری داشته
                باشید.
              </p>
              <div className={styles.whyStats}>
                <div>
                  <span>۱۰۰۰+</span>
                  <span>مراجع موفق</span>
                </div>
                <div>
                  <span>۹۵٪</span>
                  <span>رضایت مراجعین</span>
                </div>
                <div>
                  <span>۱۲+</span>
                  <span>سال تجربه</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== WORKSHOPS ======== */}
      <section id="workshops" className={styles.workshops}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>کارگاه‌های آموزشی</h2>
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
            <h2>پادکست‌های روانشناسی</h2>
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
              <h2>درباره من</h2>
              {/* <h2>{doctor.name}</h2> */}
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
            <h2>مطب‌های {doctor.name}</h2>
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
              {/* <a href="#workshops">کارگاه‌ها</a>
              <a href="#podcasts">پادکست‌ها</a>
              <a href="#about">درباره من</a>
              <a href="#clinics">مطب‌ها</a> */}
              <a href="#">خانه</a>
              <a href="#howItWorks">مسیر درمان</a>
              <a href="#theapyArea">خدمات</a>
              <a href="#workshops">کارگاه‌ها</a>
              <a href="#podcasts">پادکست‌ها</a>
              <a href="#about">درباره من</a>
              <a href="#clinics">آدرس</a>
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
