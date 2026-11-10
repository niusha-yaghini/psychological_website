import { prisma } from "../config/prisma.js";

function formatDuration(seconds: number | null): string {
  if (seconds === null) return "";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export async function getLandingData() {
  const [doctors, workshops, podcasts, clinics, siteSettings] =
    await Promise.all([
      prisma.doctor.findMany({
        select: {
          id: true,
          fullName: true,
          specialty: true,
          bio: true,
          image: true,
          experienceYears: true,
          pricePerHour: true,
          averageRating: true,
          ratingCount: true,
          approvedReviewCount: true,
        },
        orderBy: {
          id: "asc",
        },
      }),

      prisma.workshop.findMany({
        orderBy: {
          scheduledAt: "asc",
        },
      }),

      prisma.podcast.findMany({
        orderBy: {
          publishedAt: "desc",
        },
      }),

      prisma.clinic.findMany({
        orderBy: {
          id: "asc",
        },
      }),

      prisma.siteSettings.findUnique({
        where: {
          id: 1,
        },
      }),
    ]);

  // Doctor 4 is Dr. Leila in the current initial seed.
  // const featuredDoctor =
  //   doctors.find((doctor) => doctor.id === 4) ?? doctors[0] ?? null;

  return {
    // doctor: featuredDoctor,
    doctors,

    workshops: workshops.map((workshop) => ({
      id: workshop.id,
      title: workshop.title,
      description: workshop.description,
      date: workshop.scheduledAt.toISOString(),
      time: workshop.startTime,
      location: workshop.location,
      price: workshop.price,
      capacity: workshop.capacity,
      registered: workshop.registered,
      image: workshop.image,
      tags: Array.isArray(workshop.tags) ? workshop.tags : [],
      syllabus: workshop.syllabus,
      isUpcoming: workshop.isUpcoming,
    })),

    podcasts: podcasts.map((podcast) => ({
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      date: podcast.publishedAt.toISOString(),
      duration: formatDuration(podcast.durationSeconds),
      // image: podcast.coverImage,
      audioUrl: podcast.audioUrl,
      episodes: podcast.episodeNumber,
      isLatest: podcast.isLatest,
    })),

    clinics,

    socialMedia: {
      instagram: siteSettings?.instagram ?? null,
      telegram: siteSettings?.telegram ?? null,
      whatsapp: siteSettings?.whatsapp ?? null,
      youtube: siteSettings?.youtube ?? null,
      email: siteSettings?.email ?? null,
      phone: siteSettings?.phone ?? null,
      phone2: siteSettings?.phone2 ?? null,
    },
  };
}
