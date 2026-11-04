// import "dotenv/config";
// import { PrismaClient } from "../src/generated/prisma/client";

import { prisma } from "../src/config/prisma.js";
import { Prisma } from "../src/generated/prisma/client.js";

// const prisma = new PrismaClient();

/**
 * Psychological Clinic - initial database data
 *
 * Important design decisions:
 * - Doctors and patients are stored once in their own collections.
 * - All appointments are stored in ONE collection and each appointment
 *   references exactly one doctor and one patient.
 * - Exercises and optional session notes belong to an appointment.
 * - Medication records are independent of appointments.
 * - A Review is NOT created by default. It is created only after a patient
 *   submits a rating or a comment through the application.
 * - Notifications are event-driven and are therefore not seeded here.
 * - Questionnaire questions mirror the current Signup.jsx form. No fake
 *   patient answers are created because no reliable answers exist in seed data.
 *
 * Demo phone numbers below are intentionally non-routable placeholders.
 * Replace them with verified numbers before using real SMS authentication.
 */

// -----------------------------------------------------------------------------
// Types and helpers
// -----------------------------------------------------------------------------

type JalaliDate = string | null | undefined;
type EnumValue<T extends string> = T;

type ExerciseSeed = {
  title: string;
  description?: string | null;
  type: string;
  category?: string | null;
  icon?: string | null;
  dueDate?: string | null;
  assignedDate: string;
  completed: boolean;
  completedAt?: string | null;
  priority: string;
  progress: number;
  instructions?: string[] | null;
};

type AppointmentSeed = {
  id: number;
  patientId: number;
  doctorId: number;
  type: string;
  typeKey: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  isOnline: boolean;
  price: number;
  isPaid?: boolean;
  cancelledBy?: string | null;
  cancelReason?: string | null;
  sessionNote?: string | null;
  exercises?: ExerciseSeed[];
};

function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

/** Convert YYYY/MM/DD Jalali date to a UTC Date. */
function jalaliToGregorianDate(value: JalaliDate, time = "00:00"): Date | null {
  if (!value) return null;

  const normalized = toEnglishDigits(value);
  const match = normalized.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!match) return null;

  let jy = Number(match[1]);
  const jm = Number(match[2]);
  const jd = Number(match[3]);

  if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;

  jy += 1595;
  let days =
    -355668 +
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    jd;

  days += jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186;

  let gy = 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let gd = days + 1;
  const leap = gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0);
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  let gm = 0;
  while (gm < 12 && gd > monthDays[gm]) {
    gd -= monthDays[gm];
    gm++;
  }

  const [hourText = "0", minuteText = "0"] = toEnglishDigits(time).split(":");
  return new Date(Date.UTC(gy, gm, gd, Number(hourText), Number(minuteText), 0, 0));
}

function dateOnly(value: JalaliDate): Date {
  const converted = jalaliToGregorianDate(value);
  if (!converted) throw new Error(`Invalid required Jalali date: ${String(value)}`);
  return converted;
}

function dateTime(date: string, time: string): Date {
  const converted = jalaliToGregorianDate(date, time);
  if (!converted) throw new Error(`Invalid Jalali date/time: ${date} ${time}`);
  return converted;
}

function parseDurationSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const parts = toEnglishDigits(value).split(":").map(Number);
  if (parts.some((part) => Number.isNaN(part))) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

function normalizeStatus(value: string): EnumValue<
  "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"
> {
  const statuses: Record<string, EnumValue<"PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW">> = {
    pending: "PENDING",
    confirmed: "CONFIRMED",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
    canceled: "CANCELLED",
    "no-show": "NO_SHOW",
    no_show: "NO_SHOW",
  };
  const result = statuses[value.toLowerCase()];
  if (!result) throw new Error(`Unsupported appointment status: ${value}`);
  return result;
}

function normalizeExerciseType(value: string): "DAILY" | "WEEKLY" | "ONE_TIME" {
  const types: Record<string, "DAILY" | "WEEKLY" | "ONE_TIME"> = {
    daily: "DAILY",
    weekly: "WEEKLY",
    "one-time": "ONE_TIME",
    one_time: "ONE_TIME",
  };
  return types[value.toLowerCase()] ?? "ONE_TIME";
}

function normalizePriority(value: string): "HIGH" | "MEDIUM" | "LOW" {
  const priorities: Record<string, "HIGH" | "MEDIUM" | "LOW"> = {
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
  };
  return priorities[value.toLowerCase()] ?? "MEDIUM";
}

function normalizePatientStatus(value: string): "ACTIVE" | "INACTIVE" | "ARCHIVED" {
  const statuses: Record<string, "ACTIVE" | "INACTIVE" | "ARCHIVED"> = {
    active: "ACTIVE",
    inactive: "INACTIVE",
    archived: "ARCHIVED",
  };
  return statuses[value.toLowerCase()] ?? "ACTIVE";
}

// -----------------------------------------------------------------------------
// Canonical seed data
// -----------------------------------------------------------------------------

const seedData = {
  doctors: [
    {
      id: 1,
      phone: "0000000001",
      fullName: "دکتر محمد رضایی",
      specialty: "روانشناس بالینی",
      bio: "روانشناس بالینی با تخصص در درمان اضطراب و افسردگی",
      image: "/images/doctors/doctor1.png",
      experienceYears: 12,
      pricePerHour: 2_800_000,
      averageRating: 4.8,
      ratingCount: 125,
      approvedReviewCount: 0,
      availableDays: ["شنبه", "یکشنبه", "سه‌شنبه"],
      availableTimes: ["۱۰:۰۰", "۱۱:۰۰", "۱۲:۰۰", "۱۴:۰۰", "۱۵:۰۰", "۱۶:۰۰"],
    },
    {
      id: 2,
      phone: "0000000002",
      fullName: "دکتر سارا احمدی",
      specialty: "روانشناس خانواده و زوج",
      bio: "متخصص مشاوره خانواده و زوج‌درمانی",
      image: "/images/doctors/doctor2.png",
      experienceYears: 8,
      pricePerHour: 3_200_000,
      averageRating: 4.9,
      ratingCount: 55,
      approvedReviewCount: 0,
      availableDays: ["شنبه", "دوشنبه", "چهارشنبه"],
      availableTimes: ["۰۹:۰۰", "۱۰:۰۰", "۱۱:۰۰", "۱۶:۰۰", "۱۷:۰۰", "۱۸:۰۰"],
    },
    {
      id: 3,
      phone: "0000000003",
      fullName: "دکتر علی کریمی",
      specialty: "روانشناس کودک و نوجوان",
      bio: "متخصص حوزه کودک و نوجوان",
      image: "/images/doctors/doctor3.png",
      experienceYears: 10,
      pricePerHour: 2_500_000,
      averageRating: 4.7,
      ratingCount: 105,
      approvedReviewCount: 0,
      availableDays: ["یکشنبه", "سه‌شنبه", "پنجشنبه"],
      availableTimes: ["۱۴:۰۰", "۱۵:۰۰", "۱۶:۰۰", "۱۷:۰۰"],
    },
    {
      id: 4,
      phone: "0000000004",
      fullName: "دکتر لیلا سامع کریمی",
      specialty: "روانشناس بالینی و مشاور خانواده",
      bio: "دکتر لیلا سامع کریمی، روانشناس بالینی با بیش از ۱۲ سال تجربه در زمینه روان‌درمانی و مشاوره خانواده. ایشان فارغ‌التحصیل دکتری تخصصی روانشناسی از دانشگاه تهران بوده و دوره‌های تخصصی متعددی را در زمینه درمان‌های شناختی-رفتاری، طرح‌واره‌درمانی و درمان مبتنی بر پذیرش و تعهد (ACT) گذرانده‌اند.",
      image: "/images/doctor.jpg",
      experienceYears: 12,
      pricePerHour: 0,
      averageRating: 0,
      ratingCount: 0,
      approvedReviewCount: 0,
      availableDays: [],
      availableTimes: [],
    },
  ],

  // The six old patient identifiers (101-106) are normalized to 1-6.
  patients: [
    {
      id: 1,
      phone: "0000000101",
      fullName: "محمد کریمی",
      email: "mohammad.karimi@email.com",
      gender: "male",
      birthDate: "۱۳۷۵/۰۳/۱۵",
      joinDate: "۱۴۰۵/۰۱/۱۰",
      status: "active",
      emergencyContact: "0000000201",
      emergencyRelation: "همسر",
      address: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
      medications: [
        { name: "سرترالین", prescribedBy: "دکتر محمد رضایی", dosage: "۵۰ میلی‌گرم", frequency: "روزانه یک‌بار - صبح", startDate: "۱۴۰۵/۰۳/۱۰", endDate: null, notes: "برای اضطراب تجویز شده. بعد از غذا میل شود.", status: "active" },
        { name: "کلونازپام", prescribedBy: "دکتر محمد رضایی", dosage: "۰.۵ میلی‌گرم", frequency: "در صورت نیاز - حداکثر ۲ بار در روز", startDate: "۱۴۰۵/۰۲/۱۵", endDate: "۱۴۰۵/۰۵/۱۵", notes: "به دلیل بهبود وضعیت، قطع شد.", status: "stopped" },
      ],
    },
    {
      id: 2,
      phone: "0000000102",
      fullName: "زهرا احمدی",
      email: "zahra.ahmadi@email.com",
      gender: "female",
      birthDate: "۱۳۷۸/۰۸/۲۲",
      joinDate: "۱۴۰۵/۰۲/۱۵",
      status: "active",
      emergencyContact: "0000000202",
      emergencyRelation: "مادر",
      address: "تهران، خیابان فرشته، پلاک ۴۵",
      medications: [
        { name: "فلوکستین", prescribedBy: "دکتر محمد رضایی", dosage: "۲۰ میلی‌گرم", frequency: "روزانه یک‌بار - شب", startDate: "۱۴۰۵/۰۴/۰۵", endDate: null, notes: "برای افسردگی خفیف. نیاز به پیگیری ماهانه.", status: "active" },
        { name: "ویتامین D", prescribedBy: "دکتر عمومی", dosage: "۵۰,۰۰۰ واحد", frequency: "هفتگی یک‌بار", startDate: "۱۴۰۵/۰۳/۱۵", endDate: null, notes: "در اطلاعات اولیه به‌عنوان داروی تجویزشده توسط پزشک عمومی ثبت شده بود.", status: "active" },
      ],
    },
    {
      id: 3,
      phone: "0000000103",
      fullName: "علی رضایی",
      email: "ali.rezaei@email.com",
      gender: "male",
      birthDate: "۱۳۷۰/۰۵/۱۰",
      joinDate: "۱۴۰۴/۱۲/۰۱",
      status: "active",
      emergencyContact: "0000000203",
      emergencyRelation: "پدر",
      address: "تهران، خیابان مطهری، پلاک ۸۹",
      medications: [],
    },
    {
      id: 4,
      phone: "0000000104",
      fullName: "رضا حسینی",
      email: "reza.hosseini@email.com",
      gender: "male",
      birthDate: "۱۳۶۸/۱۱/۰۳",
      joinDate: "۱۴۰۵/۰۳/۲۰",
      status: "active",
      emergencyContact: "0000000204",
      emergencyRelation: "همسر",
      address: "تهران، خیابان نیاوران، پلاک ۱۲",
      medications: [
        { name: "آلپرازولام", prescribedBy: "دکتر محمد رضایی", dosage: "۰.۲۵ میلی‌گرم", frequency: "در صورت نیاز", startDate: "۱۴۰۵/۰۲/۱۰", endDate: "۱۴۰۵/۰۴/۱۰", notes: "دوره کوتاه‌مدت؛ طبق اطلاعات نمونه قطع شده است.", status: "stopped" },
      ],
    },
    {
      id: 5,
      phone: "0000000105",
      fullName: "سارا محمدی",
      email: "sara.mohammadi@email.com",
      gender: "female",
      birthDate: "۱۳۸۵/۰۲/۱۸",
      joinDate: "۱۴۰۵/۰۴/۱۰",
      status: "active",
      emergencyContact: "0000000205",
      emergencyRelation: "مادر",
      address: "تهران، خیابان ونک، پلاک ۳۴",
      medications: [],
    },
    {
      id: 6,
      phone: "0000000106",
      fullName: "نگار موسوی",
      email: "negar.mousavi@email.com",
      gender: "female",
      birthDate: "۱۳۸۰/۰۷/۲۵",
      joinDate: "۱۴۰۵/۰۵/۰۱",
      status: "active",
      emergencyContact: "0000000206",
      emergencyRelation: "خواهر",
      address: "تهران، خیابان سعادت‌آباد، پلاک ۷۸",
      medications: [
        { name: "ملاکورت", prescribedBy: "دکتر محمد رضایی", dosage: "۱۰ میلی‌گرم", frequency: "روزانه", startDate: "۱۴۰۵/۰۵/۰۱", endDate: null, notes: "همراه با جلسات زوج‌درمانی.", status: "active" },
      ],
    },
  ],

  /**
   * One canonical appointments list for BOTH dashboards.
   * Old patientAppointments and doctorAppointments were reconciled here.
   * Legacy duplicate: patient 1 / doctor 1 / 1405-05-20 15:00-16:00 appeared
   * in both arrays, so it is represented only once (appointment id 10).
   */
  appointments: [
    // Patient 1's bookings from the patient panel.
    { id: 1, patientId: 1, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual", date: "۱۴۰۵/۰۶/۰۴", startTime: "۱۰:۰۰", endTime: "۱۱:۰۰", status: "confirmed", isOnline: true, price: 2_800_000 },
    { id: 2, patientId: 1, doctorId: 2, type: "جلسه زوج درمانی", typeKey: "couple", date: "۱۴۰۵/۰۶/۰۶", startTime: "۱۸:۰۰", endTime: "۱۹:۰۰", status: "pending", isOnline: false, price: 3_200_000 },
    // id 3 from the old patient list duplicated old doctor appointment 10.
    { id: 3, patientId: 1, doctorId: 3, type: "جلسه مشاوره فردی", typeKey: "individual", date: "۱۴۰۵/۰۵/۱۸", startTime: "۱۰:۰۰", endTime: "۱۱:۰۰", status: "cancelled", isOnline: true, price: 2_500_000, cancelledBy: "PATIENT", cancelReason: "مشکل شخصی" },
    { id: 4, patientId: 1, doctorId: 2, type: "جلسه زوج درمانی", typeKey: "couple", date: "۱۴۰۵/۰۵/۱۵", startTime: "۱۷:۰۰", endTime: "۱۸:۰۰", status: "cancelled", isOnline: false, price: 3_200_000, cancelledBy: "DOCTOR", cancelReason: "هماهنگی با پزشک" },
    { id: 5, patientId: 1, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual", date: "۱۴۰۵/۰۷/۲۸", startTime: "۱۲:۰۰", endTime: "۱۴:۰۰", status: "confirmed", isOnline: true, price: 5_600_000 },
    { id: 6, patientId: 1, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual", date: "۱۴۰۵/۰۷/۲۹", startTime: "۱۴:۰۰", endTime: "۱۵:۰۰", status: "pending", isOnline: true, price: 2_800_000 },
    {
      id: 7, patientId: 1, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual",
      date: "۱۴۰۵/۰۷/۳۰", startTime: "۱۴:۰۰", endTime: "۱۵:۰۰", status: "confirmed",
      isOnline: true, price: 2_800_000,
      exercises: [
        { title: "تمرین شناسایی محرک‌های استرس", description: "موقعیت‌هایی را که باعث افزایش استرس شما می‌شوند شناسایی کنید.", type: "weekly", category: "writing", icon: "📝", dueDate: "۱۴۰۵/۰۷/۱۰", completed: false, priority: "high", progress: 0, instructions: ["موقعیت‌های استرس‌زا را یادداشت کنید", "احساس خود را در هر موقعیت ثبت کنید", "الگوهای تکرارشونده را مشخص کنید"], assignedDate: "۱۴۰۵/۰۶/۲۰" },
      ],
    },
    { id: 8, patientId: 1, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual", date: "۱۴۰۵/۰۶/۲۳", startTime: "۱۴:۰۰", endTime: "۱۵:۰۰", status: "completed", isOnline: true, price: 2_800_000 },

    // Doctor 1's patient list and appointments.
    { id: 9, patientId: 1, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual", date: "۱۴۰۵/۰۸/۱۵", startTime: "۱۰:۰۰", endTime: "۱۱:۰۰", status: "pending", isOnline: true, price: 2_800_000 },
    { id: 10, patientId: 2, doctorId: 1, type: "جلسه زوج درمانی", typeKey: "couple", date: "۱۴۰۵/۰۷/۰۲", startTime: "۱۱:۳۰", endTime: "۱۲:۳۰", status: "pending", isOnline: true, price: 3_200_000 },
    { id: 11, patientId: 4, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual", date: "۱۴۰۵/۰۶/۰۶", startTime: "۱۰:۳۰", endTime: "۱۱:۳۰", status: "pending", isOnline: true, price: 2_800_000 },
    { id: 12, patientId: 6, doctorId: 1, type: "جلسه زوج درمانی", typeKey: "couple", date: "۱۴۰۵/۰۶/۰۷", startTime: "۱۲:۰۰", endTime: "۱۳:۰۰", status: "pending", isOnline: true, price: 3_200_000 },
    { id: 13, patientId: 2, doctorId: 1, type: "جلسه زوج درمانی", typeKey: "couple", date: "۱۴۰۵/۰۷/۰۴", startTime: "۱۱:۳۰", endTime: "۱۲:۳۰", status: "confirmed", isOnline: true, price: 3_200_000 },
    { id: 14, patientId: 3, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual", date: "۱۴۰۵/۰۶/۱۰", startTime: "۱۴:۰۰", endTime: "۱۵:۰۰", status: "confirmed", isOnline: true, price: 2_800_000 },
    { id: 15, patientId: 5, doctorId: 1, type: "جلسه مشاوره نوجوان", typeKey: "teen", date: "۱۴۰۵/۰۷/۱۱", startTime: "۱۶:۰۰", endTime: "۱۷:۰۰", status: "confirmed", isOnline: true, price: 2_500_000 },
    {
      id: 16, patientId: 4, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual",
      date: "۱۴۰۵/۰۶/۰۴", startTime: "۱۵:۰۰", endTime: "۱۶:۰۰", status: "completed",
      isOnline: true, price: 2_800_000, isPaid: true,
      sessionNote: "پیشرفت خوبی در مدیریت استرس داشته. تکنیک‌های تنفس عمیق را تمرین کرده.",
      exercises: [
        { title: "تمرین تنفس عمیق", description: "هر شب قبل از خواب، ۱۰ دقیقه تنفس عمیق انجام دهید.", type: "daily", category: "meditation", icon: "🧘", dueDate: "۱۴۰۵/۰۷/۱۰", completed: false, priority: "high", progress: 0, instructions: ["در جای آرام بنشینید", "چشم‌ها را ببندید", "روی تنفس خود تمرکز کنید"], assignedDate: "۱۴۰۵/۰۶/۰۴" },
      ],
    },
    { id: 17, patientId: 3, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual", date: "۱۴۰۵/۰۶/۰۴", startTime: "۱۴:۰۰", endTime: "۱۵:۰۰", status: "completed", isOnline: true, price: 2_800_000, isPaid: false },
    {
      id: 18, patientId: 1, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual",
      date: "۱۴۰۵/۰۵/۲۰", startTime: "۱۵:۰۰", endTime: "۱۶:۰۰", status: "completed",
      isOnline: true, price: 2_800_000, isPaid: true,
      sessionNote: "اولین جلسه بود. بررسی تاریخچه و تعیین اهداف درمانی. بیمار انگیزه خوبی برای شروع دارد.",
      exercises: [
        { title: "تمرین تنفس عمیق", description: "هر شب قبل از خواب، ۱۰ دقیقه تنفس عمیق انجام دهید.", type: "daily", category: "meditation", icon: "🧘", dueDate: "۱۴۰۵/۰۶/۳۰", completed: false, priority: "high", progress: 0, instructions: ["در جای آرام بنشینید", "چشم‌ها را ببندید", "روی تنفس خود تمرکز کنید"], assignedDate: "۱۴۰۵/۰۵/۲۰" },
        { title: "ثبت افکار روزانه", description: "افکار و احساسات خود را در طول روز یادداشت کنید.", type: "daily", category: "writing", icon: "✍️", dueDate: "۱۴۰۵/۰۶/۳۰", completed: false, priority: "medium", progress: 0, instructions: ["یک دفترچه مشخص انتخاب کنید", "افکار خود را بدون قضاوت بنویسید", "احساسات خود را ثبت کنید"], assignedDate: "۱۴۰۵/۰۵/۲۰" },
      ],
    },
    { id: 19, patientId: 1, doctorId: 1, type: "جلسه مشاوره فردی", typeKey: "individual", date: "۱۴۰۵/۰۵/۲۵", startTime: "۱۴:۰۰", endTime: "۱۵:۰۰", status: "no-show", isOnline: true, price: 2_800_000 },
    { id: 20, patientId: 6, doctorId: 1, type: "جلسه زوج درمانی", typeKey: "couple", date: "۱۴۰۵/۰۶/۰۲", startTime: "۱۷:۰۰", endTime: "۱۸:۳۰", status: "cancelled", isOnline: false, price: 3_200_000, cancelledBy: "PATIENT", cancelReason: "مشکل شخصی" },
    { id: 21, patientId: 2, doctorId: 1, type: "جلسه زوج درمانی", typeKey: "couple", date: "۱۴۰۵/۰۵/۲۸", startTime: "۱۱:۳۰", endTime: "۱۲:۳۰", status: "cancelled", isOnline: true, price: 3_200_000, cancelledBy: "DOCTOR", cancelReason: "هماهنگی با پزشک" },
    { id: 22, patientId: 5, doctorId: 1, type: "جلسه مشاوره نوجوان", typeKey: "teen", date: "۱۴۰۵/۰۵/۲۲", startTime: "۱۶:۰۰", endTime: "۱۷:۰۰", status: "cancelled", isOnline: true, price: 2_500_000, cancelledBy: "PATIENT", cancelReason: "عدم امکان حضور" },
  ] as AppointmentSeed[],

  workshops: [
    { title: "کارگاه جامع مدیریت اضطراب و استرس", date: "۱۴۰۵/۰۴/۲۰", time: "۱۰:۰۰ - ۱۴:۰۰", location: "تهران، خیابان ولیعصر، نبش خیابان شهید مطهری، پلاک ۱۲۳", price: 350_000, capacity: 25, registered: 18, isUpcoming: true, description: "در این کارگاه ۴ ساعته، تکنیک‌های عملی و علمی برای شناسایی ریشه‌های اضطراب، مدیریت حملات پانیک و کاهش استرس روزمره آموزش داده می‌شود.", image: "/images/workshop1.jpg", tags: ["اضطراب", "استرس", "مدیریت هیجان"], syllabus: ["مبانی اضطراب و استرس", "شناسایی محرک‌های اضطراب‌زا", "تکنیک‌های تنفس عمیق و آرام‌سازی", "بازسازی شناختی", "مدیریت افکار منفی", "تمرینات عملی"] },
    { title: "کارگاه افزایش اعتماد به نفس و خودباوری", date: "۱۴۰۵/۰۵/۱۰", time: "۱۶:۰۰ - ۲۰:۰۰", location: "تهران، خیابان فرشته، خیابان گلستان، پلاک ۴۵", price: 420_000, capacity: 20, registered: 14, isUpcoming: true, description: "کارگاه تخصصی ۴ ساعته برای افرادی که با کمبود اعتماد به نفس دست و پنجه نرم می‌کنند. در این جلسه به ریشه‌یابی و تقویت خودباوری می‌پردازیم.", image: "/images/workshop2.jpg", tags: ["اعتماد به نفس", "خودباوری", "ارزش‌های فردی"], syllabus: ["شناخت خود و ارزش‌های فردی", "شناسایی افکار محدودکننده", "تمرینات تقویت عزت نفس", "مواجهه با ترس‌ها", "ارتباط مؤثر با دیگران"] },
    { title: "کارگاه مهارت‌های ارتباطی و حل تعارض", date: "۱۴۰۵/۰۶/۰۵", time: "۰۹:۰۰ - ۱۳:۰۰", location: "تهران، خیابان ولیعصر، نبش خیابان شهید مطهری، پلاک ۱۲۳", price: 390_000, capacity: 30, registered: 22, isUpcoming: true, description: "در این کارگاه ۴ ساعته، مهارت‌های ارتباط مؤثر، گوش دادن فعال، ابراز وجود و حل تعارض در روابط فردی و حرفه‌ای آموزش داده می‌شود.", image: "/images/workshop3.jpg", tags: ["ارتباط مؤثر", "تعارض", "مهارت‌های زندگی"], syllabus: ["مبانی ارتباط مؤثر", "گوش دادن فعال", "ابراز وجود و جرأت‌ورزی", "شناخت سبک‌های ارتباطی", "حل تعارض در روابط"] },
    { title: "کارگاه خودشناسی/خودآگاهی", date: "۱۴۰۵/۰۲/۱۵", time: null, location: null, price: 450_000, capacity: null, registered: 0, isUpcoming: false, description: "کارگاه خودشناسی اولین قدم در راه درمان و پذیرش خود است.", image: "/images/avatar/kargah_khodshenasi.png", tags: ["خودآگاهی", "پذیرش", "رواندرمانی"], syllabus: ["مبانی نظری ACT", "انعطاف‌پذیری روانی", "پذیرش و گسلش شناختی", "ارزش‌ها و عمل متعهدانه", "تمرینات بالینی"] },
    { title: "کارگاه مهارت های زندگی", date: "۱۴۰۵/۰۱/۲۰", time: null, location: null, price: 320_000, capacity: null, registered: 0, isUpcoming: false, description: "کارگاه یادگیری مهارت های زندگی اعم از مهارت ارتباط موثر، مهارت های ارتباط اجتماعی، کنترل خشم و ...", image: "/images/avatar/kargah_maharathayezendegi.png", tags: ["فرسودگی شغلی", "خودمراقبتی", "تعادل زندگی"], syllabus: ["شناخت فرسودگی شغلی", "عوامل خطر و محافظ", "تکنیک‌های خودمراقبتی", "ایجاد تعادل کار و زندگی", "تمرینات عملی"] },
  ],

  podcasts: [
    { title: "چگونه با استرس روزمره مقابله کنیم؟", date: "۱۴۰۵/۰۳/۱۵", duration: "۳۲:۴۵", description: "در این قسمت از پادکست، به بررسی تکنیک‌های عملی و علمی برای مدیریت استرس روزمره می‌پردازیم. از تنفس عمیق تا بازسازی شناختی، همه را با هم مرور می‌کنیم.", audioUrl: "/podcasts/ep1.mp3", coverImage: "/images/podcast1.jpg", isLatest: true, episodeNumber: 12 },
    { title: "رازهای خواب آرام و تأثیر آن بر سلامت روان", date: "۱۴۰۵/۰۳/۰۱", duration: "۲۸:۲۰", description: "آیا می‌دانید کیفیت خواب شما چقدر بر سلامت روانتان تأثیر دارد؟ در این قسمت به بررسی ارتباط خواب و سلامت روان می‌پردازیم.", audioUrl: "/podcasts/ep2.mp3", coverImage: "/images/podcast2.jpg", isLatest: false, episodeNumber: 11 },
    { title: "راه‌های افزایش انگیزه و بهره‌وری", date: "۱۴۰۵/۰۲/۲۰", duration: "۲۵:۱۰", description: "چگونه می‌توانیم انگیزه خود را در کار و زندگی افزایش دهیم و بهره‌وری بیشتری داشته باشیم؟ در این قسمت به این سؤال پاسخ می‌دهیم.", audioUrl: "/podcasts/ep3.mp3", coverImage: "/images/podcast3.jpg", isLatest: false, episodeNumber: 10 },
  ],

  clinics: [
    { name: "مطب مرکزی", address: "تهران، خیابان ولیعصر، نبش خیابان شهید مطهری، پلاک ۱۲۳، طبقه ۳، واحد ۵", phone: "۰۲۱-۸۸۸۸-۱۲۳۴", phone2: "۰۲۱-۸۸۸۸-۱۲۳۵", workingHours: "شنبه تا چهارشنبه: ۹:۰۰ تا ۱۸:۰۰", additionalHours: "پنجشنبه: ۱۴:۰۰ تا ۲۰:۰۰", mapLink: "https://maps.google.com/..." },
    { name: "مطب فرشته", address: "تهران، خیابان فرشته، خیابان گلستان، پلاک ۴۵، طبقه ۱", phone: "۰۲۱-۸۸۷۷-۴۳۲۱", phone2: "۰۲۱-۸۸۷۷-۴۳۲۲", workingHours: "یکشنبه و سه‌شنبه: ۱۴:۰۰ تا ۲۰:۰۰", additionalHours: "پنجشنبه: ۹:۰۰ تا ۱۴:۰۰", mapLink: "https://maps.google.com/..." },
  ],

  siteSettings: {
    instagram: "https://instagram.com/dr.sara.mohammadi",
    telegram: "https://t.me/drsaramohammadi",
    whatsapp: "https://wa.me/989123456789",
    youtube: "https://youtube.com/@drsaramohammadi",
    email: "info@drsaramohammadi.com",
    phone: "۰۲۱-۸۸۸۸-۱۲۳۴",
    phone2: "۰۹۱۲-۳۴۵-۶۷۸۹",
  },

  patientSettings: {
    notificationsEnabled: true,
    darkMode: false,
    sessionReminders: true,
    privacySettings: { shareMedicalInfo: true, shareProgress: true },
    displaySettings: { darkMode: false, showReadNotifications: true, language: "fa" },
  },

  doctorSettings: {
    notificationsEnabled: true,
    darkMode: false,
    sessionReminders: true,
    displaySettings: { darkMode: false, language: "fa" },
  },
};

// -----------------------------------------------------------------------------
// Database seed
// -----------------------------------------------------------------------------

async function getOrCreateUser(phone: string, role: "PATIENT" | "DOCTOR") {
  return prisma.user.upsert({
    where: { phone },
    update: { role, isVerified: true, isActive: true },
    create: { phone, role, isVerified: true, isActive: true },
  });
}

async function seedUsersAndProfiles() {
  const doctorIds = new Map<number, number>();
  const patientIds = new Map<number, number>();
  const doctorUsers = new Map<number, number>();
  const patientUsers = new Map<number, number>();

  for (const doctor of seedData.doctors) {
    const user = await getOrCreateUser(doctor.phone, "DOCTOR");
    const record = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        fullName: doctor.fullName,
        specialty: doctor.specialty,
        bio: doctor.bio,
        image: doctor.image,
        experienceYears: doctor.experienceYears,
        pricePerHour: doctor.pricePerHour,
        availableDays: doctor.availableDays,
        availableTimes: doctor.availableTimes,
        averageRating: doctor.averageRating,
        ratingCount: doctor.ratingCount,
        approvedReviewCount: doctor.approvedReviewCount,
      },
      create: {
        id: doctor.id,
        userId: user.id,
        fullName: doctor.fullName,
        specialty: doctor.specialty,
        bio: doctor.bio,
        image: doctor.image,
        experienceYears: doctor.experienceYears,
        pricePerHour: doctor.pricePerHour,
        availableDays: doctor.availableDays,
        availableTimes: doctor.availableTimes,
        averageRating: doctor.averageRating,
        ratingCount: doctor.ratingCount,
        approvedReviewCount: doctor.approvedReviewCount,
      },
    });

    doctorIds.set(doctor.id, record.id);
    doctorUsers.set(doctor.id, user.id);

    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        notificationsEnabled: seedData.doctorSettings.notificationsEnabled,
        darkMode: seedData.doctorSettings.darkMode,
        sessionReminders: seedData.doctorSettings.sessionReminders,
        displaySettings: seedData.doctorSettings.displaySettings,
      },
      create: {
        userId: user.id,
        notificationsEnabled: seedData.doctorSettings.notificationsEnabled,
        darkMode: seedData.doctorSettings.darkMode,
        sessionReminders: seedData.doctorSettings.sessionReminders,
        displaySettings: seedData.doctorSettings.displaySettings,
      },
    });
  }

  for (const patient of seedData.patients) {
    const user = await getOrCreateUser(patient.phone, "PATIENT");
    const record = await prisma.patient.upsert({
      where: { userId: user.id },
      update: {
        fullName: patient.fullName,
        email: patient.email,
        gender: patient.gender,
        birthDate: dateOnly(patient.birthDate),
        joinDate: dateOnly(patient.joinDate),
        status: normalizePatientStatus(patient.status),
        emergencyContact: patient.emergencyContact,
        emergencyRelation: patient.emergencyRelation,
        address: patient.address,
      },
      create: {
        id: patient.id,
        userId: user.id,
        fullName: patient.fullName,
        email: patient.email,
        gender: patient.gender,
        birthDate: dateOnly(patient.birthDate),
        joinDate: dateOnly(patient.joinDate),
        status: normalizePatientStatus(patient.status),
        emergencyContact: patient.emergencyContact,
        emergencyRelation: patient.emergencyRelation,
        address: patient.address,
      },
    });

    patientIds.set(patient.id, record.id);
    patientUsers.set(patient.id, user.id);

    const settings = seedData.patientSettings;
    await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        notificationsEnabled: settings.notificationsEnabled,
        darkMode: settings.darkMode,
        sessionReminders: settings.sessionReminders,
        privacySettings: settings.privacySettings,
        displaySettings: settings.displaySettings,
      },
      create: {
        userId: user.id,
        notificationsEnabled: settings.notificationsEnabled,
        darkMode: settings.darkMode,
        sessionReminders: settings.sessionReminders,
        privacySettings: settings.privacySettings,
        displaySettings: settings.displaySettings,
      },
    });
  }

  return { doctorIds, patientIds, doctorUsers, patientUsers };
}

async function seedAppointments(
  doctorIds: Map<number, number>,
  patientIds: Map<number, number>,
) {
  for (const item of seedData.appointments) {
    const doctorId = doctorIds.get(item.doctorId);
    const patientId = patientIds.get(item.patientId);
    if (!doctorId || !patientId) {
      throw new Error(`Appointment ${item.id} references an unknown doctor or patient.`);
    }

    const startAt = dateTime(item.date, item.startTime);
    const endAt = dateTime(item.date, item.endTime);
    if (endAt <= startAt) {
      throw new Error(`Appointment ${item.id} has endAt before or equal to startAt.`);
    }

    const durationMinutes = Math.round((endAt.getTime() - startAt.getTime()) / 60_000);
    const status = normalizeStatus(item.status);

    // There is no unique natural key in the current Prisma schema. Find the
    // same real-world booking first so repeated seed runs do not duplicate it.
    let appointment = await prisma.appointment.findFirst({
      where: { doctorId, patientId, startAt, endAt },
    });

    const appointmentData = {
      type: item.type,
      typeKey: item.typeKey,
      startAt,
      endAt,
      durationMinutes,
      status,
      isOnline: item.isOnline,
      price: item.price,
      cancelledBy: item.cancelledBy ?? null,
      cancelReason: item.cancelReason ?? null,
      cancelledAt: status === "CANCELLED" ? startAt : null,
    };

    if (appointment) {
      appointment = await prisma.appointment.update({
        where: { id: appointment.id },
        data: appointmentData,
      });
    } else {
      appointment = await prisma.appointment.create({
        data: { doctorId, patientId, ...appointmentData },
      });
    }

    // Optional note: no SessionNote row is created when the source has no note.
    if (item.sessionNote) {
      await prisma.sessionNote.upsert({
        where: { appointmentId: appointment.id },
        update: { doctorId, content: item.sessionNote },
        create: { appointmentId: appointment.id, doctorId, content: item.sessionNote },
      });
    }

    // Exercises are nested under their appointment in the canonical seed data.
    for (const exercise of item.exercises ?? []) {
      const existing = await prisma.exercise.findFirst({
        where: {
          appointmentId: appointment.id,
          assignedById: doctorId,
          title: exercise.title,
        },
      });

      const exerciseData = {
        description: exercise.description ?? null,
        type: normalizeExerciseType(exercise.type),
        category: exercise.category ?? null,
        icon: exercise.icon ?? null,
        dueDate: jalaliToGregorianDate(exercise.dueDate),
        assignedDate: dateOnly(exercise.assignedDate),
        completed: exercise.completed,
        completedAt: exercise.completed && exercise.completedAt ? dateOnly(exercise.completedAt) : null,
        progress: exercise.progress,
        priority: normalizePriority(exercise.priority),
        // instructions: exercise.instructions,
        instructions: exercise.instructions ?? Prisma.DbNull,
      };

      if (existing) {
        await prisma.exercise.update({ where: { id: existing.id }, data: exerciseData });
      } else {
        await prisma.exercise.create({
          data: {
            appointmentId: appointment.id,
            assignedById: doctorId,
            title: exercise.title,
            ...exerciseData,
          },
        });
      }
    }

    // Transactions are optional. They are created only when payment state is
    // explicitly included in the appointment seed record.
    if (typeof item.isPaid === "boolean") {
      const existingTransaction = await prisma.transaction.findFirst({
        where: { appointmentId: appointment.id },
      });
      const transactionData = {
        amount: item.price,
        status: item.isPaid ? ("PAID" as const) : ("PENDING" as const),
        method: "OTHER" as const,
        paidAt: item.isPaid ? startAt : null,
      };

      if (existingTransaction) {
        await prisma.transaction.update({
          where: { id: existingTransaction.id },
          data: transactionData,
        });
      } else {
        await prisma.transaction.create({
          data: { appointmentId: appointment.id, ...transactionData },
        });
      }
    }
  }
}

async function seedMedications(patientIds: Map<number, number>, doctorIds: Map<number, number>) {
  const recordingDoctorId = doctorIds.get(1);
  if (!recordingDoctorId) throw new Error("Default recording doctor was not seeded.");

  for (const patient of seedData.patients) {
    const patientId = patientIds.get(patient.id);
    if (!patientId) continue;

    for (const medication of patient.medications) {
      if (medication.prescribedBy !== "دکتر محمد رضایی") {
        console.warn(
          `Skipping medication "${medication.name}" for ${patient.fullName}: ` +
          `the source attributes it to ${medication.prescribedBy}, which is not a doctor profile in this clinic seed.`,
        );
        continue;
      }

      const startDate = dateOnly(medication.startDate);
      const endDate = jalaliToGregorianDate(medication.endDate);
      const existing = await prisma.medication.findFirst({
        where: { patientId, doctorId: recordingDoctorId, name: medication.name, startDate },
      });
      const medicationData = {
        dosage: medication.dosage,
        frequency: medication.frequency,
        endDate,
        notes: medication.notes,
        isActive: medication.status === "active",
      };

      if (existing) {
        await prisma.medication.update({ where: { id: existing.id }, data: medicationData });
      } else {
        await prisma.medication.create({
          data: {
            patientId,
            doctorId: recordingDoctorId,
            name: medication.name,
            startDate,
            ...medicationData,
          },
        });
      }
    }
  }
}

async function seedQuestionnaire() {
  const questionnaire = await prisma.questionnaire.upsert({
    where: { id: 1 },
    update: {
      title: "پرسشنامه اولیه ثبت‌نام",
      description: "پرسشنامه‌ای که بیمار یک‌بار در زمان ثبت‌نام تکمیل می‌کند.",
      isActive: true,
      version: 1,
    },
    create: {
      id: 1,
      title: "پرسشنامه اولیه ثبت‌نام",
      description: "پرسشنامه‌ای که بیمار یک‌بار در زمان ثبت‌نام تکمیل می‌کند.",
      isActive: true,
      version: 1,
    },
  });

  const questions = [
    {
      order: 1,
      title: "به خاطر چی اینجایی؟",
      subtitle: "چه چیزی باعث شد امروز به فکر شروع درمان بیوفتی؟",
      type: "SINGLE" as const,
      options: [
        { id: "anxiety", label: "اضطراب و نگرانی بیش از حد" },
        { id: "depression", label: "احساس غم و افسردگی" },
        { id: "relationship", label: "مشکلات ارتباطی با دیگران" },
        { id: "stress", label: "استرس شغلی یا تحصیلی" },
        { id: "growth", label: "فقط میخوام خودم رو بهتر بشناسم" },
        { id: "other", label: "مورد دیگه" },
      ],
      minValue: null,
      maxValue: null,
    },
    {
      order: 2,
      title: "چقدر روی زندگی‌ات تأثیر گذاشته؟",
      subtitle: "از ۱ تا ۵، این مشکل چقدر کار، تحصیل یا روابطت رو تحت تأثیر قرار داده؟",
      type: "SCALE" as const,
      options: [
        { value: 1, label: "خیلی کم" },
        { value: 2, label: "کم" },
        { value: 3, label: "متوسط" },
        { value: 4, label: "زیاد" },
        { value: 5, label: "خیلی زیاد" },
      ],
      minValue: 1,
      maxValue: 5,
    },
    {
      order: 3,
      title: "تجربه قبلی داری؟",
      subtitle: "آیا قبلاً تجربه مشاوره یا درمان روانشناسی داشتی؟",
      type: "SINGLE" as const,
      options: [
        { id: "never", label: "نه، اولین بارمه" },
        { id: "short", label: "بله، یک بار کوتاه مدت" },
        { id: "medium", label: "بله، چند جلسه" },
        { id: "long", label: "بله، درمان بلندمدت" },
      ],
      minValue: null,
      maxValue: null,
    },
    {
      order: 4,
      title: "چند نفر رو در کنار خودت داری؟",
      subtitle: "چند نفر رو میشناسی که میتونی راحت باهاشون درد و دل کنی؟",
      type: "SINGLE" as const,
      options: [
        { id: "none", label: "هیچکس" },
        { id: "one", label: "یک نفر" },
        { id: "two_three", label: "دو یا سه نفر" },
        { id: "many", label: "گروه حمایتی بزرگ" },
      ],
      minValue: null,
      maxValue: null,
    },
    {
      order: 5,
      title: "اولویت در جلسه اول؟",
      subtitle: "انتظار داری دکتر در اولین جلسه بیشتر روی چه چیزی تمرکز کنه؟",
      type: "MULTIPLE" as const,
      options: [
        { id: "listening", label: "گوش دادن و درک عمیق" },
        { id: "solution", label: "ارائه راهکار و تکنیک" },
        { id: "diagnosis", label: "تشخیص دقیق مشکل" },
        { id: "safety", label: "ایجاد احساس امنیت و اعتماد" },
      ],
      minValue: null,
      maxValue: null,
    },
  ];

  for (const question of questions) {
    await prisma.question.upsert({
      where: { questionnaireId_order: { questionnaireId: questionnaire.id, order: question.order } },
      update: {
        title: question.title,
        subtitle: question.subtitle,
        type: question.type,
        options: question.options,
        minValue: question.minValue,
        maxValue: question.maxValue,
        isRequired: true,
      },
      create: {
        questionnaireId: questionnaire.id,
        title: question.title,
        subtitle: question.subtitle,
        type: question.type,
        order: question.order,
        options: question.options,
        minValue: question.minValue,
        maxValue: question.maxValue,
        isRequired: true,
      },
    });
  }
}

async function seedWebsiteContent() {
  for (const workshop of seedData.workshops) {
    const scheduledAt = dateOnly(workshop.date);
    const existing = await prisma.workshop.findFirst({
      where: { title: workshop.title, scheduledAt },
    });
    const data = {
      description: workshop.description,
      startTime: workshop.time,
      location: workshop.location,
      price: workshop.price,
      capacity: workshop.capacity,
      registered: workshop.registered,
      image: workshop.image,
      tags: workshop.tags,
      syllabus: workshop.syllabus,
      isUpcoming: workshop.isUpcoming,
    };
    if (existing) {
      await prisma.workshop.update({ where: { id: existing.id }, data });
    } else {
      await prisma.workshop.create({ data: { title: workshop.title, scheduledAt, ...data } });
    }
  }

  for (const podcast of seedData.podcasts) {
    const publishedAt = dateOnly(podcast.date);
    const existing = await prisma.podcast.findFirst({
      where: { title: podcast.title, publishedAt },
    });
    const data = {
      description: podcast.description,
      durationSeconds: parseDurationSeconds(podcast.duration),
      audioUrl: podcast.audioUrl,
      coverImage: podcast.coverImage,
      isLatest: podcast.isLatest,
      episodeNumber: podcast.episodeNumber,
    };
    if (existing) {
      await prisma.podcast.update({ where: { id: existing.id }, data });
    } else {
      await prisma.podcast.create({ data: { title: podcast.title, publishedAt, ...data } });
    }
  }

  for (const clinic of seedData.clinics) {
    const existing = await prisma.clinic.findFirst({
      where: { name: clinic.name, address: clinic.address },
    });
    const data = {
      phone: clinic.phone,
      phone2: clinic.phone2,
      workingHours: clinic.workingHours,
      additionalHours: clinic.additionalHours,
      mapLink: clinic.mapLink,
    };
    if (existing) {
      await prisma.clinic.update({ where: { id: existing.id }, data });
    } else {
      await prisma.clinic.create({ data: { name: clinic.name, address: clinic.address, ...data } });
    }
  }

  await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: seedData.siteSettings,
    create: { id: 1, ...seedData.siteSettings },
  });
}

async function main() {
  console.info("Starting psychological clinic database seed...");

  const { doctorIds, patientIds } = await seedUsersAndProfiles();
  await seedMedications(patientIds, doctorIds);
  await seedAppointments(doctorIds, patientIds);
  await seedQuestionnaire();
  await seedWebsiteContent();

  // No Review rows are created here. Reviews are created only after a patient
  // submits a rating and/or comment for a completed appointment.
  // No Notification rows are created here. Notifications are generated by
  // backend business events such as booking, confirmation and cancellation.
  // No QuestionnaireResponse/QuestionAnswer rows are fabricated: the old
  // seed did not contain real answers for the six sample patients.

  console.info("Database seed completed successfully.");
  console.info(`Doctors: ${seedData.doctors.length}`);
  console.info(`Patients: ${seedData.patients.length}`);
  console.info(`Appointments: ${seedData.appointments.length}`);
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
