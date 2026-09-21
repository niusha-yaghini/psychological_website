// seed.js
const seedData = {
  // ============================================
  // 👨‍⚕️ اطلاعات دکتر (برای Landing)
  // ============================================
  doctor: {
    name: "دکتر لیلا سامع کریمی",
    specialty: "روانشناس بالینی و مشاور خانواده",
    bio: "دکتر لیلا سامع کریمی، روانشناس بالینی با بیش از ۱۲ سال تجربه در زمینه رواندرمانی و مشاوره خانواده. ایشان فارغ‌التحصیل دکتری تخصصی روانشناسی از دانشگاه تهران بوده و دوره‌های تخصصی متعددی را در زمینه درمان‌های شناختی-رفتاری، طرح‌واره درمانی و درمان مبتنی بر پذیرش و تعهد (ACT) گذرانده‌اند. درمان با روش شناختی-رفتاری و تغییر الگوهای فکری",
    image: "/images/doctor.jpg",
    yearsOfExperience: 12,
    patientsCount: 1250,
    workshopsCount: 68,
    rating: 4.9,
  },

  // ============================================
  // 🎓 کارگاه‌ها
  // ============================================
  workshops: [
    {
      id: 1,
      title: "کارگاه جامع مدیریت اضطراب و استرس",
      date: "۱۴۰۵/۰۴/۲۰",
      time: "۱۰:۰۰ - ۱۴:۰۰",
      location: "تهران، خیابان ولیعصر، نبش خیابان شهید مطهری، پلاک ۱۲۳",
      price: "۳۵۰,۰۰۰ تومان",
      capacity: 25,
      registered: 18,
      isUpcoming: true,
      description:
        "در این کارگاه ۴ ساعته، تکنیک‌های عملی و علمی برای شناسایی ریشه‌های اضطراب، مدیریت حملات پانیک و کاهش استرس روزمره آموزش داده می‌شود.",
      image: "/images/workshop1.jpg",
      tags: ["اضطراب", "استرس", "مدیریت هیجان"],
      syllabus: [
        "مبانی اضطراب و استرس",
        "شناسایی محرک‌های اضطراب‌زا",
        "تکنیک‌های تنفس عمیق و آرام‌سازی",
        "بازسازی شناختی",
        "مدیریت افکار منفی",
        "تمرینات عملی",
      ],
    },
    {
      id: 2,
      title: "کارگاه افزایش اعتماد به نفس و خودباوری",
      date: "۱۴۰۵/۰۵/۱۰",
      time: "۱۶:۰۰ - ۲۰:۰۰",
      location: "تهران، خیابان فرشته، خیابان گلستان، پلاک ۴۵",
      price: "۴۲۰,۰۰۰ تومان",
      capacity: 20,
      registered: 14,
      isUpcoming: true,
      description:
        "کارگاه تخصصی ۴ ساعته برای افرادی که با کمبود اعتماد به نفس دست و پنجه نرم می‌کنند. در این جلسه به ریشه‌یابی و تقویت خودباوری می‌پردازیم.",
      image: "/images/workshop2.jpg",
      tags: ["اعتماد به نفس", "خودباوری", "ارزش‌های فردی"],
      syllabus: [
        "شناخت خود و ارزش‌های فردی",
        "شناسایی افکار محدودکننده",
        "تمرینات تقویت عزت نفس",
        "مواجهه با ترس‌ها",
        "ارتباط مؤثر با دیگران",
      ],
    },
    {
      id: 3,
      title: "کارگاه مهارت‌های ارتباطی و حل تعارض",
      date: "۱۴۰۵/۰۶/۰۵",
      time: "۰۹:۰۰ - ۱۳:۰۰",
      location: "تهران، خیابان ولیعصر، نبش خیابان شهید مطهری، پلاک ۱۲۳",
      price: "۳۹۰,۰۰۰ تومان",
      capacity: 30,
      registered: 22,
      isUpcoming: true,
      description:
        "در این کارگاه ۴ ساعته، مهارت‌های ارتباط مؤثر، گوش دادن فعال، ابراز وجود و حل تعارض در روابط فردی و حرفه‌ای آموزش داده می‌شود.",
      image: "/images/workshop3.jpg",
      tags: ["ارتباط مؤثر", "تعارض", "مهارت‌های زندگی"],
      syllabus: [
        "مبانی ارتباط مؤثر",
        "گوش دادن فعال",
        "ابراز وجود و جرأت‌ورزی",
        "شناخت سبک‌های ارتباطی",
        "حل تعارض در روابط",
      ],
    },
    {
      id: 4,
      title: "کارگاه خودشناسی/خودآگاهی",
      date: "۱۴۰۵/۰۲/۱۵",
      price: "۴۵۰,۰۰۰ تومان",
      isUpcoming: false,
      description: "کارگاه خودشناسی اولین قدم در راه درمان و پذیرش خود است.",
      image: "/images/avatar/kargah_khodshenasi.png",
      tags: ["خودآگاهی", "پذیرش", "رواندرمانی"],
      syllabus: [
        "مبانی نظری ACT",
        "انعطاف‌پذیری روانی",
        "پذیرش و گسلش شناختی",
        "ارزش‌ها و عمل متعهدانه",
        "تمرینات بالینی",
      ],
    },
    {
      id: 5,
      title: "کارگاه مهارت های زندگی",
      date: "۱۴۰۵/۰۱/۲۰",
      price: "۳۲۰,۰۰۰ تومان",
      isUpcoming: false,
      description:
        "کارگاه یادگیری مهارت های زندگی اعم از مهارت ارتباط ماثر، مهارت های ارتباط اجتماعی، کنترل خشم، ...",
      image: "/images/avatar/kargah_maharathayezendegi.png",
      tags: ["فرسودگی شغلی", "خودمراقبتی", "تعادل زندگی"],
      syllabus: [
        "شناخت فرسودگی شغلی",
        "عوامل خطر و محافظ",
        "تکنیک‌های خودمراقبتی",
        "ایجاد تعادل کار و زندگی",
        "تمرینات عملی",
      ],
    },
  ],

  // ============================================
  // 🎙️ پادکست‌ها
  // ============================================
  podcasts: [
    {
      id: 1,
      title: "چگونه با استرس روزمره مقابله کنیم؟",
      date: "۱۴۰۵/۰۳/۱۵",
      duration: "۳۲:۴۵",
      description:
        "در این قسمت از پادکست، به بررسی تکنیک‌های عملی و علمی برای مدیریت استرس روزمره می‌پردازیم. از تنفس عمیق تا بازسازی شناختی، همه را با هم مرور می‌کنیم.",
      audioUrl: "/podcasts/ep1.mp3",
      coverImage: "/images/podcast1.jpg",
      isLatest: true,
      episodes: 12,
    },
    {
      id: 2,
      title: "رازهای خواب آرام و تأثیر آن بر سلامت روان",
      date: "۱۴۰۵/۰۳/۰۱",
      duration: "۲۸:۲۰",
      description:
        "آیا می‌دانید کیفیت خواب شما چقدر بر سلامت روانتان تأثیر دارد؟ در این قسمت به بررسی ارتباط خواب و سلامت روان می‌پردازیم.",
      audioUrl: "/podcasts/ep2.mp3",
      coverImage: "/images/podcast2.jpg",
      isLatest: false,
      episodes: 11,
    },
    {
      id: 3,
      title: "راه‌های افزایش انگیزه و بهره‌وری",
      date: "۱۴۰۵/۰۲/۲۰",
      duration: "۲۵:۱۰",
      description:
        "چگونه می‌توانیم انگیزه خود را در کار و زندگی افزایش دهیم و بهره‌وری بیشتری داشته باشیم؟ در این قسمت به این سوال پاسخ می‌دهیم.",
      audioUrl: "/podcasts/ep3.mp3",
      coverImage: "/images/podcast3.jpg",
      isLatest: false,
      episodes: 10,
    },
  ],

  // ============================================
  // 🏥 کلینیک‌ها
  // ============================================
  clinics: [
    {
      id: 1,
      name: "مطب مرکزی",
      address:
        "تهران، خیابان ولیعصر، نبش خیابان شهید مطهری، پلاک ۱۲۳، طبقه ۳، واحد ۵",
      phone: "۰۲۱-۸۸۸۸-۱۲۳۴",
      phone2: "۰۲۱-۸۸۸۸-۱۲۳۵",
      hours: "شنبه تا چهارشنبه: ۹:۰۰ تا ۱۸:۰۰",
      hoursFriday: "پنجشنبه: ۱۴:۰۰ تا ۲۰:۰۰",
      mapLink: "https://maps.google.com/...",
    },
    {
      id: 2,
      name: "مطب فرشته",
      address: "تهران، خیابان فرشته، خیابان گلستان، پلاک ۴۵، طبقه ۱",
      phone: "۰۲۱-۸۸۷۷-۴۳۲۱",
      phone2: "۰۲۱-۸۸۷۷-۴۳۲۲",
      hours: "یکشنبه و سه‌شنبه: ۱۴:۰۰ تا ۲۰:۰۰",
      hoursFriday: "پنجشنبه: ۹:۰۰ تا ۱۴:۰۰",
      mapLink: "https://maps.google.com/...",
    },
  ],

  // ============================================
  // 📱 شبکه‌های اجتماعی
  // ============================================
  socialMedia: {
    instagram: "https://instagram.com/dr.sara.mohammadi",
    telegram: "https://t.me/drsaramohammadi",
    whatsapp: "https://wa.me/989123456789",
    youtube: "https://youtube.com/@drsaramohammadi",
    email: "info@drsaramohammadi.com",
    phone: "۰۲۱-۸۸۸۸-۱۲۳۴",
    phone2: "۰۹۱۲-۳۴۵-۶۷۸۹",
  },

  // ============================================
  // 👥 لیست روانشناسان (برای Patient Panel)
  // ============================================
  doctors: [
    {
      id: 1,
      name: "دکتر محمد رضایی",
      specialty: "روانشناس بالینی",
      experience: "۱۲ سال",
      rating: 4.8,
      image: "/images/doctors/doctor1.png",
      availableDays: ["شنبه", "یکشنبه", "سه‌شنبه"],
    },
    {
      id: 2,
      name: "دکتر سارا احمدی",
      specialty: "روانشناس خانواده و زوج",
      experience: "۸ سال",
      rating: 4.9,
      image: "/images/doctors/doctor2.png",
      availableDays: ["شنبه", "دوشنبه", "چهارشنبه"],
    },
    {
      id: 3,
      name: "دکتر علی کریمی",
      specialty: "روانشناس کودک و نوجوان",
      experience: "۱۰ سال",
      rating: 4.7,
      image: "/images/doctors/doctor3.png",
      availableDays: ["یکشنبه", "سه‌شنبه", "پنجشنبه"],
    },
  ],

  // ============================================
  // 📅 نوبت‌های بیمار (Appointments)
  // ============================================
  appointments: [
    {
      id: 1,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorId: 1,
      date: "۱۴۰۵/۰۶/۰۴",
      time: "۱۰:۰۰ - ۱۱:۰۰",
      status: "confirmed",
      isOnline: true,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۶/۰۳",
    },
    {
      id: 2,
      type: "جلسه زوج درمانی",
      doctor: "دکتر سارا احمدی",
      doctorId: 2,
      date: "۱۴۰۵/۰۶/۰۶",
      time: "۱۸:۰۰ - ۱۹:۰۰",
      status: "pending",
      isOnline: false,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۶/۰۵",
    },
    {
      id: 3,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorId: 1,
      date: "۱۴۰۵/۰۵/۲۰",
      time: "۱۵:۰۰ - ۱۶:۰۰",
      status: "completed",
      isOnline: true,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۵/۱۰",
    },
    {
      id: 4,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر علی کریمی",
      doctorId: 3,
      date: "۱۴۰۵/۰۵/۱۸",
      time: "۱۰:۰۰ - ۱۱:۰۰",
      status: "cancelled",
      isOnline: true,
      cancelledBy: "user",
      cancelReason: "مشکل شخصی",
      createdAt: "۱۴۰۵/۰۶/۰۱",
    },
    {
      id: 5,
      type: "جلسه زوج درمانی",
      doctor: "دکتر سارا احمدی",
      doctorId: 2,
      date: "۱۴۰۵/۰۵/۱۵",
      time: "۱۷:۰۰ - ۱۸:۰۰",
      status: "cancelled",
      isOnline: false,
      cancelledBy: "doctor",
      cancelReason: "هماهنگی با پزشک",
      createdAt: "۱۴۰۵/۰۵/۳۰",
    },
    {
      id: 6,
      type: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorId: 1,
      date: "۱۴۰۵/۰۶/۱۰",
      time: "۱۴:۰۰ - ۱۵:۰۰",
      status: "confirmed",
      isOnline: true,
      cancelledBy: null,
      cancelReason: null,
      createdAt: "۱۴۰۵/۰۶/۰۵",
    },
  ],

  // ============================================
  // 🔔 اعلان‌ها (Notifications)
  // ============================================
  notifications: [
    {
      id: 1,
      type: "reminder",
      title: "یادآوری جلسه فردا",
      message:
        "جلسه مشاوره فردی شما با دکتر محمد رضایی فردا ساعت ۱۶:۰۰ برگزار می‌شود.",
      time: "۵ دقیقه پیش",
      isRead: false,
      date: "۱۴۰۵/۰۵/۲۴",
      link: "/sessions",
      action: "مشاهده جلسه",
    },
    {
      id: 2,
      type: "confirmed",
      title: "تأیید جلسه",
      message: "دکتر سارا احمدی درخواست جلسه زوج درمانی شما را تأیید کرد.",
      time: "۱ ساعت پیش",
      isRead: false,
      date: "۱۴۰۵/۰۵/۲۴",
      link: "/appointments",
      action: "مشاهده نوبت",
    },
    {
      id: 3,
      type: "cancelled",
      title: "لغو جلسه توسط روانشناس",
      message: "دکتر علی کریمی جلسه مشاوره نوجوان را به دلیل هماهنگی لغو کرد.",
      time: "۳ ساعت پیش",
      isRead: false,
      date: "۱۴۰۵/۰۵/۲۴",
      link: "/appointments",
      action: "مشاهده جلسات",
    },
    {
      id: 4,
      type: "note",
      title: "یادداشت جدید از روانشناس",
      message: "دکتر محمد رضایی برای جلسه قبلی شما یادداشتی ثبت کرده است.",
      time: "۵ ساعت پیش",
      isRead: true,
      date: "۱۴۰۵/۰۵/۲۳",
      link: "/sessions",
      action: "مشاهده یادداشت",
    },
    {
      id: 5,
      type: "booking",
      title: "رزرو جلسه جدید",
      message:
        "شما جلسه مشاوره فردی را برای تاریخ ۱۴۰۵/۰۵/۲۸ ساعت ۱۷:۰۰ رزرو کردید.",
      time: "۱ روز پیش",
      isRead: true,
      date: "۱۴۰۵/۰۵/۲۳",
      link: "/appointments",
      action: "مشاهده نوبت",
    },
    {
      id: 6,
      type: "weekly",
      title: "زمان جلسات هفتگی",
      message:
        "زمان جلسات هفتگی شما فرا رسیده است. آیا مایل به رزرو جلسه جدید هستید؟",
      time: "۲ روز پیش",
      isRead: true,
      date: "۱۴۰۵/۰۵/۲۲",
      link: "/appointments",
      action: "رزرو جلسه",
    },
    {
      id: 7,
      type: "reminder",
      title: "یادآوری جلسه امروز",
      message:
        "جلسه مشاوره فردی شما با دکتر سارا احمدی امروز ساعت ۱۸:۰۰ برگزار می‌شود.",
      time: "۳ روز پیش",
      isRead: true,
      date: "۱۴۰۵/۰۵/۲۲",
      link: "/sessions",
      action: "ورود به جلسه",
    },
  ],

  // ============================================
  // 📊 اطلاعات پیشرفت (Progress)
  // ============================================
  progress: {
    totalSessions: 12,
    completedSessions: 8,
    cancelledSessions: 1,
    upcomingSessions: 3,
    percentage: 65,
    status: "در مسیر",
    startDate: "۱۴۰۳/۰۶/۱۵",
    estimatedEndDate: "۱۴۰۳/۱۲/۱۵",

    monthlyProgress: [
      { month: "مهر", sessions: 2 },
      { month: "آبان", sessions: 3 },
      { month: "آذر", sessions: 3 },
      { month: "دی", sessions: 0 },
    ],

    milestones: [
      {
        id: 1,
        title: "شروع درمان",
        date: "۱۴۰۳/۰۶/۱۵",
        completed: true,
        description: "اولین جلسه مشاوره",
      },
      {
        id: 2,
        title: "ارزیابی اولیه",
        date: "۱۴۰۳/۰۷/۰۵",
        completed: true,
        description: "تکمیل پرسشنامه‌ها",
      },
      {
        id: 3,
        title: "تثبیت پیشرفت",
        date: "۱۴۰۳/۰۹/۱۵",
        completed: false,
        description: "هدف: کاهش ۵۰٪ علائم",
      },
      {
        id: 4,
        title: "پایان درمان",
        date: "۱۴۰۳/۱۲/۱۵",
        completed: false,
        description: "ارزیابی نهایی",
      },
    ],

    improvementAreas: [
      { label: "مدیریت استرس", score: 75, color: "#4CAF84" },
      { label: "کیفیت خواب", score: 60, color: "#FF9800" },
      { label: "اعتماد به نفس", score: 80, color: "#2196F3" },
      { label: "روابط اجتماعی", score: 55, color: "#9C27B0" },
      { label: "مدیریت خشم", score: 70, color: "#E91E63" },
    ],
  },

  // ============================================
  // 🧠 تمارین (Exercises)
  // ============================================
  exercises: [
    {
      id: 1,
      title: "تمرین تنفس عمیق",
      description:
        "هر شب قبل از خواب، ۱۰ دقیقه تنفس عمیق انجام دهید. ۴ ثانیه دم، ۷ ثانیه نگه‌داری، ۸ ثانیه بازدم.",
      type: "daily",
      category: "meditation",
      icon: "🧘",
      dueDate: "۱۴۰۳/۰۹/۳۰",
      completed: false,
      priority: "high",
      progress: 0,
      instructions: [
        "در جای آرام بنشینید",
        "چشم‌ها را ببندید",
        "روی تنفس خود تمرکز کنید",
        "۴ ثانیه دم، ۷ ثانیه نگه‌داری، ۸ ثانیه بازدم",
      ],
      assignedBy: "دکتر محمد رضایی",
      assignedDate: "۱۴۰۳/۰۹/۲۰",
    },
    {
      id: 2,
      title: "نوشتن نامه به خود",
      description:
        "نامه‌ای به خودتان بنویسید و احساسات و افکارتان را بیان کنید.",
      type: "one-time",
      category: "writing",
      icon: "✍️",
      dueDate: "۱۴۰۳/۱۰/۰۵",
      completed: false,
      priority: "medium",
      progress: 0,
      instructions: [
        "یک مکان آرام پیدا کنید",
        "نامه را با 'خود عزیزم' شروع کنید",
        "احساسات واقعی خود را بنویسید",
        "نامه را برای خودتان بخوانید",
      ],
      assignedBy: "دکتر محمد رضایی",
      assignedDate: "۱۴۰۳/۰۹/۲۲",
    },
    {
      id: 3,
      title: "تست ارزیابی استرس",
      description:
        "پرسشنامه ارزیابی سطح استرس را تکمیل کنید و نتیجه را ثبت کنید.",
      type: "weekly",
      category: "test",
      icon: "📊",
      dueDate: "۱۴۰۳/۱۰/۰۱",
      completed: false,
      priority: "high",
      progress: 0,
      instructions: [
        "به سوالات با دقت پاسخ دهید",
        "پاسخ‌ها را صادقانه بدهید",
        "نتیجه را یادداشت کنید",
        "در جلسه بعد با دکتر خود به اشتراک بگذارید",
      ],
      assignedBy: "دکتر محمد رضایی",
      assignedDate: "۱۴۰۳/۰۹/۲۳",
    },
    {
      id: 4,
      title: "تمرین شکرگزاری روزانه",
      description: "هر روز ۳ مورد که بابت آنها شکرگزار هستید را بنویسید.",
      type: "daily",
      category: "activity",
      icon: "🙏",
      dueDate: "۱۴۰۳/۰۹/۳۰",
      completed: true,
      priority: "low",
      progress: 100,
      instructions: [
        "هر شب قبل از خواب انجام دهید",
        "۳ مورد را یادداشت کنید",
        "می‌توانید کوچک یا بزرگ باشند",
        "احساس خود را هنگام نوشتن ثبت کنید",
      ],
      assignedBy: "دکتر محمد رضایی",
      assignedDate: "۱۴۰۳/۰۹/۱۸",
    },
  ],

  // ============================================
  // 👤 اطلاعات پروفایل (Profile)
  // ============================================
  profile: {
    formData: {
      firstName: "محمد",
      lastName: "کریمی",
      phone: "۹۱۲۳۴۵۶۷۸۹",
      email: "mohammad.karimi@email.com",
      gender: "male",
      birthDate: "۱۳۷۵/۰۳/۱۵",
      occupation: "برنامه‌نویس",
      education: "کارشناسی ارشد",
      address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
      emergencyContact: "۰۹۱۲۳۴۵۶۷۸۹",
      emergencyRelation: "همسر",
    },
    userStats: {
      totalSessions: 8,
      completedExercises: 12,
      totalExercises: 18,
      joinDate: "۱۴۰۳/۰۶/۱۵",
      lastVisit: "۱۴۰۳/۰۹/۲۴",
      upcomingAppointment: "۱۴۰۳/۰۹/۲۸",
    },
    medicalInfo: {
      therapist: "دکتر محمد رضایی",
      diagnosis: "اضطراب فراگیر",
      treatmentPlan: "درمان شناختی-رفتاری (CBT)",
      medications: "ندارد",
      allergies: "ندارد",
      specialNotes: "جلسات به صورت هفتگی برگزار می‌شود.",
    },
  },

  // ============================================
  // 🎥 جلسات آنلاین (Sessions)
  // ============================================
  sessions: [
    {
      id: 1,
      title: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorImage: "/images/doctors/doctor1.png",
      date: "۱۴۰۵/۰۶/۰۳",
      time: "۱۶:۰۰",
      duration: "۶۰ دقیقه",
      status: "upcoming",
      isOnline: true,
      meetingLink: "https://meet.google.com/abc-defg-hij",
      type: "individual",
    },
    {
      id: 2,
      title: "جلسه زوج درمانی",
      doctor: "دکتر سارا احمدی",
      doctorImage: "/images/doctors/doctor2.png",
      date: "۱۴۰۵/۰۶/۰۶",
      time: "۱۸:۰۰",
      duration: "۹۰ دقیقه",
      status: "upcoming",
      isOnline: true,
      meetingLink: "https://meet.google.com/klm-nopq-rst",
      type: "couple",
    },
    {
      id: 3,
      title: "جلسه مشاوره فردی",
      doctor: "دکتر محمد رضایی",
      doctorImage: "/images/doctors/doctor1.png",
      date: "۱۴۰۵/۰۵/۲۰",
      time: "۱۵:۰۰",
      duration: "۶۰ دقیقه",
      status: "completed",
      isOnline: true,
      meetingLink: "https://meet.google.com/xyz-uvwx-yza",
      type: "individual",
    },
  ],

  // ============================================
  // ⚙️ تنظیمات پیش‌فرض (Settings)
  // ============================================
  settings: {
    notificationSettings: {
      sessionReminder: {
        enabled: true,
        method: "sms",
        timing: 2,
      },
      exerciseReminder: {
        enabled: true,
        method: "sms",
      },
      therapistMessages: {
        enabled: true,
        method: "sms",
      },
      weeklyReport: {
        enabled: false,
        method: "email",
      },
    },
    displaySettings: {
      darkMode: false,
      showReadNotifications: true,
      language: "fa",
    },
    privacySettings: {
      shareMedicalInfo: true,
      shareProgress: true,
    },
  },
};

export default seedData;
