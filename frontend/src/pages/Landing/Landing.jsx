import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Landing.module.css";
import seedData from "../../../../backend/seed";
import logo from "../../../public/images/logo/logo2.png";

import individual_therapy from "../../../public/images/avatar/Individual_Therapy.png";
import couple_therapy from "../../../public/images/avatar/Couple_Therapy.png";
import teenage_therapy from "../../../public/images/avatar/Teenage_Therapy.png";

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
          </nav>
          <div className={styles.auth}>
            <Link to="/login" className={styles.btnlogin}>
              ورود
            </Link>
            {/* <Link to="/signup" className={styles.btnsignup}>
              ثبت‌نام
            </Link> */}
          </div>
          <button className={styles.menuToggle}>☰</button>
        </div>
      </header>

      {/* ======== HERO ======== */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>کلینیک آنلاین روان کوک</h1>
            {/* <span className={styles.heroSubtitle}>{doctor.specialty}</span> */}
            <h2 className={styles.herosubTitle}>روان کوک همراه شما در مسیر خودشناسی و رشد فردی</h2>
            
            <p className={styles.heroDescription}>{doctor.bio}</p>
            <div className={styles.heroButtons}>
              <Link to="/signup" className={styles.herobtnPrimary}>
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
      <section id="howItWorks" className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                مسیر <span>درمان</span>
              </h2>
              <p className={styles.sectionDescription}>
                روان کوک چگونه به شما کمک می کند؟
              </p>
            </div>
          </div>

          <div className={styles.stepsContainer}>
            {/* ===== گام اول ===== */}
            <div className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>۱</div>
                <h3>ارزیابی اولیه</h3>
                <p>
                  تکمیل فرم‌ ارزیابی و ارائه اطلاعات اولیه درباره وضعیت خود به
                  دکتر.
                </p>
                {/* <div className={styles.stepDetail}>
                  <span>⏱️ ۳۰ دقیقه</span>
                  <span>📍 آنلاین / حضوری</span>
                </div> */}
              </div>
            </div>

            {/* ===== گام دوم ===== */}
            <div className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>۲</div>
                <h3>جلسات مشاوره</h3>
                <p>
                  {/* جلسات درمانی با توجه به نیاز شما و بر اساس طرح درمان تخصصی پیش
                  می‌رود. در صورت نیاز پرسشنامه های مخصوص شما داده شده و تحلیل می گردند. */}
                  {/* جلسات درمانی متناسب با نیاز شما و بر اساس طرح درمان تخصصی پیش
                  می‌رود. */}
                  طرح درمان تخصصی برای جلسات متناسب با نیاز شما
                </p>
                {/* <div className={styles.stepDetail}>
                  <span>⏱️ ۶۰-۹۰ دقیقه</span>
                  <span>📅 هفتگی / دو هفته‌ای</span>
                </div> */}
              </div>
            </div>

            {/* ===== گام سوم ===== */}
            <div className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>۳</div>
                <h3>پرسشنامه</h3>
                <p>
                  {/* جلسات درمانی با توجه به نیاز شما و بر اساس طرح درمان تخصصی پیش
                  می‌رود. در صورت نیاز پرسشنامه های مخصوص شما داده شده و تحلیل می گردند. */}
             {/* در طول مسیر، با توجه به نیاز شما پرسشنامه‌های تخصصی برای بررسی دقیق‌تر شرایط داده شده و  تحلیل می گردند.   */}
                در صورت نیاز، دادن پرسشنامه‌های تخصصی و تحلیل آنها
                </p>
                {/* <div className={styles.stepDetail}>
                  <span>⏱️ ۶۰-۹۰ دقیقه</span>
                  <span>📅 هفتگی / دو هفته‌ای</span>
                </div> */}
              </div>
            </div>

            {/* ===== گام چهارم ===== */}
            <div className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>۴</div>
                <h3>پیگیری و تداوم</h3>
                <p>
                  برنامه‌های پیگیری و تمرینات عملی برای تثبیت تغییرات 
                </p>
                {/* <div className={styles.stepDetail}>
                  <span>📊 ارزیابی پیشرفت</span>
                  <span>💪 تمرینات عملی</span>
                </div> */}
              </div>
            </div>
          </div>

          {/* ===== CTA ===== */}
          <div className={styles.stepsCTA}>
            <p>آماده شروع مسیر بهبودی هستید؟</p>
            <Link to="/signup" className={styles.btnPrimary}>
              شروع کنید
            </Link>
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS - مراحل درمان ======== */}
      {/* <section id="howItWorks" className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                مسیر <span>درمان</span>
              </h2>
              <p className={styles.sectionDescription}>
                با ما همراه باشید تا گام‌به‌گام در مسیر بهبودی و آرامش قدم
                بردارید.
              </p>
            </div>
          </div>

          <div className={styles.stepsContainer}>
            <div className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>۱</div>
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

            <div className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>۲</div>
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

            <div className={styles.stepWrapper}>
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>۳</div>
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

          <div className={styles.stepsCTA}>
            <p>آماده شروع مسیر بهبودی هستید؟</p>
            <Link to="/signup" className={styles.btnPrimary}>
              شروع کنید
            </Link>
          </div>
        </div>
      </section> */}

      {/* ======== THERAPY AREAS - حوزه‌های تخصصی ======== */}
      <section id="theapyArea" className={styles.therapyAreas}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>
                حوزه‌های <span>تخصصی</span>
              </h2>
              <p className={styles.sectionDescription}>
                با بهره‌گیری از روش‌های علمی و تخصصی، در کنار شما هستیم.
              </p>
            </div>
          </div>

          <div className={styles.areasGrid}>
            {/* ===== درمان فردی ===== */}
            <div className={styles.areaCard}>
              <div className={styles.cardGlow}></div>
              <div className={styles.areaCardHeader}>
                <div className={styles.areaIconWrapper}>
                  <div className={styles.areaIcon}>
                    <img
                      src={individual_therapy}
                      alt="درمان فردی"
                      className={styles.areaIconImage}
                    />
                  </div>
                  <div className={styles.iconRing}></div>
                </div>
                <h3>درمان فردی</h3>
              </div>

              <div className={styles.areaContent}>
                <p>
                  جلسات اختصاصی و عمیق برای کشف ریشه‌های چالش‌های زندگی، شکوفایی
                  استعدادها و دستیابی به آرامش درونی.
                </p>
                <div className={styles.areaTags}>
                  {/* <span>🌱 اضطراب</span>
                  <span>💭 افسردگی</span>
                  <span>🌀 استرس</span>
                  <span>✨ اعتماد به نفس</span> */}
                  <span>اضطراب</span>
                  <span>افسردگی</span>
                  <span>استرس</span>
                  <span>اعتماد به نفس</span>
                </div>
              </div>
            </div>

            {/* ===== زوج درمانی ===== */}
            <div className={styles.areaCard}>
              <div className={styles.cardGlow}></div>
              <div className={styles.areaCardHeader}>
                <div className={styles.areaIconWrapper}>
                  <div className={styles.areaIcon}>
                    <img
                      src={couple_therapy}
                      alt="زوج درمان"
                      className={styles.areaIconImage}
                    />
                  </div>
                  <div className={styles.iconRing}></div>
                </div>
                <h3>زوج درمانی</h3>
              </div>

              <div className={styles.areaContent}>
                <p>
                  بازسازی اعتماد، بهبود ارتباط و افزایش صمیمیت برای ساختن
                  رابطه‌ای مستحکم‌تر و پایدارتر در کنار هم.
                </p>
                <div className={styles.areaTags}>
                  {/* <span>💬 ارتباط مؤثر</span>
                  <span>🤝 حل تعارض</span>
                  <span>❤️ صمیمیت</span>
                  <span>🔐 اعتماد</span> */}
                  <span>ارتباط مؤثر</span>
                  <span>حل تعارض</span>
                  <span>صمیمیت</span>
                  <span>اعتماد</span>
                </div>
              </div>
            </div>

            {/* ===== درمان نوجوان ===== */}
            <div className={styles.areaCard}>
              <div className={styles.cardGlow}></div>
              <div className={styles.areaCardHeader}>
                <div className={styles.areaIconWrapper}>
                  <div className={styles.areaIcon}>
                    <img
                      src={teenage_therapy}
                      alt="درمان نوجوان"
                      className={styles.areaIconImage}
                    />
                  </div>
                  <div className={styles.iconRing}></div>
                </div>
                <h3>درمان نوجوانان</h3>
              </div>

              <div className={styles.areaContent}>
                <p>
                  همراهی تخصصی در مسیر رشد نوجوانان، مدیریت چالش‌های دوران حساس
                  بلوغ و کشف هویت واقعی‌شان.
                </p>
                <div className={styles.areaTags}>
                  {/* <span>🔥 مدیریت خشم</span>
                  <span>⭐ اعتماد به نفس</span>
                  <span>📚 مشکلات تحصیلی</span>
                  <span>🔍 هویت‌یابی</span> */}
                  {/* <span>مدیریت خشم</span> */}
                  <span>اعتماد به نفس</span>
                  <span>مشکلات تحصیلی</span>
                  <span>هویت‌یابی</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== چرا تراپی؟ ===== */}
          <div className={styles.whyTherapy}>
            <div className={styles.whyTherapyContent}>
              <div className={styles.whyIcon}>💚</div>
              <h3>
                چرا مسیر <span>درمان</span> را انتخاب کنیم؟
              </h3>
              <p>
                اگر دوست دارید که خودتان را بیشتر دوست داشته باشید. یا برای
                عزیزانتان فرد بهتری باشید این مسیری ست که میتوانید از آن کمک
                بگیرید. خیلی وقتها ما فکر میکنیم که میتوانیم به تنهایی از پس
                مشکلات بر بیاییم، اما وقتی داخل مشکل هستیم و مهارت های لازم را
                نداریم اینکار تقریبا غیر ممکن بنظر میره. درمان روانشناسی، سفری
                است برای کشف خود واقعی‌تان. این مسیر به شما کمک می‌کند تا از
                الگوهای تکراری و ناسالم رها شوید، مهارت‌های جدید بیاموزید و
                زندگی‌ای سرشار از آرامش، معنا و رضایت را تجربه کنید.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ======== WORKSHOPS ======== */}
      <section id="workshops" className={styles.workshops}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              کارگاه‌های <span>تخصصی</span>
            </h2>
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
              (workshop, index) => (
                <div key={workshop.id} className={styles.workshopCard}>
                  <div className={styles.workshopImageWrapper}>
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
                    </div>
                    {workshop.isUpcoming && (
                      <div className={styles.workshopBadge}>
                        <span className={styles.badgeDot}></span>
                        پیش‌رو
                      </div>
                    )}
                  </div>

                  <div className={styles.workshopContent}>
                    <div className={styles.workshopHeader}>
                      <h3>{workshop.title}</h3>
                    </div>

                    <div className={styles.workshopMeta}>
                      <span>📅 {formatPersianDate(workshop.date)}</span>
                      <span className={styles.metaDivider}>•</span>
                      <span>⏰ {workshop.time || "۱۰:۰۰ - ۱۳:۰۰"}</span>
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
                      <button className={styles.btnWorkshop}>
                        {workshop.isUpcoming ? (
                          <>
                            <span>ثبت‌نام</span>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 12H19M19 12L12 5M19 12L12 19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>مشاهده سرفصل‌ها</span>
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <path
                                d="M5 12H19M19 12L12 5M19 12L12 19"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                      <div className={styles.priceSection}>
                        <span className={styles.workshopPrice}>
                          {workshop.price}
                        </span>
                        {workshop.capacity && (
                          <span className={styles.workshopCapacity}>
                            ظرفیت: {workshop.capacity} نفر
                          </span>
                        )}
                      </div>
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
            <h2 className={styles.sectionTitle}>
              پادکست‌های <span>روانشناسی</span>
            </h2>
          </div>

          <div className={styles.podcastBelowHeader}>
            <p className={styles.podcastDescription}>
              با گوش دادن به پادکست‌های روانشناسی، گام‌های مؤثری در مسیر رشد
              فردی و سلامت روان بردارید.
            </p>
            <Link to="/podcasts" className={styles.viewAll}>
              مشاهده همه ←
            </Link>
          </div>

          {latestPodcast && (
            <div className={styles.podcastFeatured}>
              <div className={styles.podcastImageWrapper}>
                <div className={styles.podcastImage}>
                  {!imageErrors[latestPodcast.id] ? (
                    <img
                      src={latestPodcast.image}
                      alt={latestPodcast.title}
                      className={styles.podcastImageCustom}
                      onError={() => handleImageError(latestPodcast.id)}
                    />
                  ) : (
                    <div className={styles.podcastPlaceholder}>🎙️</div>
                  )}
                  <div className={styles.playButton}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={styles.podcastInfo}>
                <div>
                  <div className={styles.podcastHeader}>
                    <h3>{latestPodcast.title}</h3>
                    <div className={styles.podcastActions}>
                      <button className={styles.btnPodcast}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                        </svg>
                      </button>
                      <button className={styles.btnShare}>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="18"
                            cy="5"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <circle
                            cx="6"
                            cy="12"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <circle
                            cx="18"
                            cy="19"
                            r="3"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className={styles.podcastMeta}>
                    <span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M3 9H21M7 3V5M17 3V5M6 12H8M11 12H13M16 12H18M6 16H8M11 16H13M16 16H18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <rect
                          x="3"
                          y="6"
                          width="18"
                          height="15"
                          rx="2"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      {formatPersianDate(latestPodcast.date)}
                    </span>
                    <span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M12 6V12L16 14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      {latestPodcast.duration}
                    </span>
                    <span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M20 12H4M12 4V20"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                      {latestPodcast.episodes} قسمت
                    </span>
                  </div>
                </div>
                <p className={styles.podcastDescription}>
                  {latestPodcast.description}
                </p>
              </div>
            </div>
          )}

          <div className={styles.podcastList}>
            {otherPodcasts.map((podcast, index) => (
              <div key={podcast.id} className={styles.podcastItem}>
                <div className={styles.podcastItemNumber}>
                  #{String(index + 1).padStart(2, "0")}
                </div>
                <div className={styles.podcastItemIcon}>
                  {!imageErrors[podcast.id] ? (
                    <img
                      src={podcast.image}
                      alt={podcast.title}
                      className={styles.podcastItemImage}
                      onError={() => handleImageError(podcast.id)}
                    />
                  ) : (
                    <span>🎙️</span>
                  )}
                </div>
                <div className={styles.podcastItemInfo}>
                  <h4>{podcast.title}</h4>
                  <div className={styles.podcastItemMeta}>
                    <span>{formatPersianDate(podcast.date)}</span>
                    <span className={styles.metaDot}>•</span>
                    <span>{podcast.duration}</span>
                    <span className={styles.metaDot}>•</span>
                    <span>{podcast.episodes} قسمت</span>
                  </div>
                </div>
                <button className={styles.btnListen}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.socialHeader}>
            <span className={styles.socialTitle}>ما را دنبال کنید</span>
            <p className={styles.socialDesc}>
              برای دریافت آخرین مطالب، کارگاه‌ها و پادکست‌ها
            </p>
          </div>

          {/* ===== بخش میانی فوتر: لینک‌ها ===== */}
          <div className={styles.footerMiddle}>
            <div className={styles.footerSocial}>
              <div className={styles.socialLinks}>
                <a
                  href={socialMedia.instagram}
                  className={styles.socialLink}
                  style={{ "--social-color": "#E4405F" }}
                >
                  <span className={styles.socialIcon}>📷</span>
                  اینستاگرام
                </a>
                <a
                  href={socialMedia.telegram}
                  className={styles.socialLink}
                  style={{ "--social-color": "#26A5E4" }}
                >
                  <span className={styles.socialIcon}>✈️</span>
                  تلگرام
                </a>
                <a
                  href={socialMedia.whatsapp}
                  className={styles.socialLink}
                  style={{ "--social-color": "#25D366" }}
                >
                  <span className={styles.socialIcon}>💬</span>
                  واتس‌اپ
                </a>
                <a
                  href={socialMedia.youtube}
                  className={styles.socialLink}
                  style={{ "--social-color": "#FF0000" }}
                >
                  <span className={styles.socialIcon}>▶️</span>
                  بله
                </a>
              </div>
            </div>

            <div className={styles.footerLinks}>
              <div className={styles.linkGroup}>
                <h4>دسترسی سریع</h4>
                <a href="#">خانه</a>
                <a href="#howItWorks">مسیر درمان</a>
                <a href="#theapyArea">خدمات تخصصی</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>آموزشی</h4>
                <a href="#workshops">کارگاه‌ها</a>
                <a href="#podcasts">پادکست‌ها</a>
                <a href="#">مقالات</a>
              </div>
              <div className={styles.linkGroup}>
                <h4>ارتباط</h4>
                <a href="#">تماس با ما</a>
                <a href="#">درباره ما</a>
                <a href="#">سوالات متداول</a>
              </div>
            </div>
          </div>

          {/* ===== بخش پایینی فوتر: کپی‌رایت ===== */}
          <div className={styles.footerBottom}>
            <div className={styles.bottomContent}>
              <p>
                © {new Date().getFullYear()} کلینیک روانشناسی. تمامی حقوق محفوظ
                است.
              </p>
              <p className={styles.developer}>
                طراحی و توسعه با <span>❤️</span> توسط تیم حرفه‌ای
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
