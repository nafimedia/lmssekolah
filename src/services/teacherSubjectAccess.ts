import { MysqlAuthService, UserSession } from "./mysqlAuthService";

// Authoritative Master List of All School Subjects (Mapel) at MTsN 2 Cilacap
export const ALL_SCHOOL_SUBJECTS = [
  "Al Qur'an Hadis",
  "Akidah Akhlak",
  "Fikih",
  "Sejarah Kebudayaan Islam",
  "Bahasa Arab",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "Matematika",
  "Ilmu Pengetahuan Alam",
  "Ilmu Pendidikan Sosial",
  "Pendidikan Kewarganegaraan",
  "Pendidikan Jasmani, Olahraga dan Kesehatan",
  "Seni Budaya",
  "Informatika",
  "Bahasa Jawa",
  "Bimbingan dan Konseling",
];

export const ALL_SCHOOL_CLASSES = [
  "Kelas VII A",
  "Kelas VII B",
  "Kelas VIII A",
  "Kelas VIII B",
  "Kelas IX A",
  "Kelas IX B",
];

export function getTeacherAssignedClasses(user?: UserSession | null): string[] {
  const activeUser = user || MysqlAuthService.getActiveUser();
  if (!activeUser) return ALL_SCHOOL_CLASSES;

  const roleStr = (activeUser.role || "").toLowerCase();
  const roles = roleStr.split(",").map((r) => r.trim());

  if (roles.includes("admin") || roles.includes("kamad") || roles.includes("admin_akademik") || roles.includes("waka")) {
    return ALL_SCHOOL_CLASSES;
  }

  // Pure 100% MySQL Database class_name resolution
  const rawClass = activeUser.class_name?.trim() || "";

  if (!rawClass || rawClass === "-") {
    return ALL_SCHOOL_CLASSES;
  }

  const grades = rawClass.toUpperCase().split(",").map((g) => g.trim());
  const matchedClasses = ALL_SCHOOL_CLASSES.filter((c) => {
    if (grades.includes("VII") || grades.includes("7")) if (c.includes("VII")) return true;
    if (grades.includes("VIII") || grades.includes("8")) if (c.includes("VIII")) return true;
    if (grades.includes("IX") || grades.includes("9")) if (c.includes("IX")) return true;
    return false;
  });

  return matchedClasses.length > 0 ? matchedClasses : ALL_SCHOOL_CLASSES;
}

// Dictionary of Guru -> Assigned Subject(s) built from official data_guru.md
const GURU_SUBJECT_MAP: Record<string, string[]> = {
  "199204042025051002": ["Al Qur'an Hadis"],
  "196909081998032001": ["Bahasa Indonesia"],
  "197002272005011001": ["Bahasa Inggris"],
  "197004082007012025": ["Akidah Akhlak"],
  "197109302007012011": ["Bahasa Arab"],
  "197311232005011004": ["Sejarah Kebudayaan Islam"],
  "197311252007102001": ["Matematika"],
  "197312112007101021": ["Pendidikan Jasmani, Olahraga dan Kesehatan"],
  "197405022007101003": ["Fikih"],
  "197509192009012008": ["Ilmu Pendidikan Sosial"],
  "197602012007101019": ["Akidah Akhlak"],
  "197705132007101002": ["Matematika"],
  "197710212007101001": ["Bahasa Arab"],
  "197906142007102002": ["Bahasa Indonesia"],
  "198302142023211010": ["Bahasa Inggris"],
  "199711302025052006": ["Pendidikan Kewarganegaraan"],
  "198409142023211019": ["Bimbingan dan Konseling"],
};

/**
 * Mendapatkan daftar Mata Pelajaran (Mapel) yang diampu oleh Guru yang sedang login.
 * Jika pengguna adalah Admin Super / Waka Kurikulum murni, mengembalikan null (Akses Semua Mapel).
 * Jika pengguna adalah Guru, mengembalikan daftar Mapel khusus yang diampunya saja.
 */
export function getTeacherAssignedSubjects(user?: UserSession | null): string[] | null {
  const activeUser = user || MysqlAuthService.getActiveUser();
  if (!activeUser) return null;

  const roleStr = (activeUser.role || "").toLowerCase();
  const roles = roleStr.split(",").map((r) => r.trim());
  const nip = activeUser.nis_nip || "";

  // Super Administrator, Kamad, Waka, atau Admin Akademik memiliki akses penuh ke semua Mapel
  if (roles.includes("admin") || roles.includes("kamad") || roles.includes("waka") || roles.includes("admin_akademik")) {
    return null; // Semua Mapel (Akses Penuh)
  }

  // Jika bukan guru (misal siswa), return null (sesuai view siswa)
  const isGuru = roles.some((r) => ["guru", "guru_mapel", "walikelas"].includes(r));
  if (!isGuru) return null;

  const assigned: Set<string> = new Set();

  // 1. Pure 100% MySQL Database subject_specialty or assignedSubject field
  if (activeUser.subject_specialty && activeUser.subject_specialty.trim()) {
    activeUser.subject_specialty.split(",").forEach((s) => {
      const clean = s.trim();
      if (clean) assigned.add(clean);
    });
  }
  if ((activeUser as any).assignedSubject && (activeUser as any).assignedSubject.trim()) {
    (activeUser as any).assignedSubject.split(",").forEach((s: string) => {
      const clean = s.trim();
      if (clean) assigned.add(clean);
    });
  }

  // 2. Check NIP from official GURU_SUBJECT_MAP dictionary
  if (nip && GURU_SUBJECT_MAP[nip]) {
    GURU_SUBJECT_MAP[nip].forEach((s) => assigned.add(s));
  }

  // Jika guru belum terdaftar spesifik, kembalikan Mapel default bawaannya atau Al Qur'an Hadis
  if (assigned.size === 0) {
    if (activeUser.subject_specialty) {
      assigned.add(activeUser.subject_specialty);
    } else {
      assigned.add("Al Qur'an Hadis");
    }
  }

  return Array.from(assigned);
}

/**
 * Memeriksa apakah Mapel tertentu diizinkan untuk diakses/diedit oleh pengguna yang sedang login.
 */
export function isSubjectAllowedForUser(subjectName: string, user?: UserSession | null): boolean {
  const assigned = getTeacherAssignedSubjects(user);
  if (assigned === null) return true; // Akses penuh (Admin/Semua Mapel)

  const s2 = subjectName.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  if (!s2) return false;

  return assigned.some((rawS) => {
    const s1 = rawS.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
    if (!s1) return false;
    if (s1 === s2) return true;

    // Isolasi ketat TIK vs Matematika agar kata "matematika" tidak mencocokkan "tik"
    const isS1Mtk = s1.includes("matematika") || s1 === "mtk";
    const isS2Mtk = s2.includes("matematika") || s2 === "mtk";

    const isS1Tik = !isS1Mtk && (s1 === "tik" || s1.includes("informatika") || s1.includes("komputer") || /(^|[^a-z0-9])tik([^a-z0-9]|$)/i.test(rawS));
    const isS2Tik = !isS2Mtk && (s2 === "tik" || s2.includes("informatika") || s2.includes("komputer") || /(^|[^a-z0-9])tik([^a-z0-9]|$)/i.test(subjectName));

    if (isS1Tik || isS2Tik) {
      return isS1Tik && isS2Tik;
    }
    if (isS1Mtk || isS2Mtk) {
      return isS1Mtk && isS2Mtk;
    }

    if (s1.length >= 4 && s2.length >= 4) {
      return s1.includes(s2) || s2.includes(s1);
    }
    return false;
  });
}

/**
 * Filter daftar Mapel agar hanya menampilkan Mapel yang diampu oleh Guru.
 */
export function filterSubjectsForUser<T extends string | { name: string }>(allSubjects: T[], user?: UserSession | null): T[] {
  const assigned = getTeacherAssignedSubjects(user);
  if (assigned === null) return allSubjects; // Tidak dibatasi (Admin)

  const filtered = allSubjects.filter((item) => {
    const subjectName = typeof item === "string" ? item : item.name;
    return isSubjectAllowedForUser(subjectName, user);
  });
  return filtered.length > 0 ? filtered : allSubjects;
}
