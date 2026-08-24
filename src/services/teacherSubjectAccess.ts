import { MysqlAuthService, UserSession } from "./mysqlAuthService";
import fallbackUsersCatalog from "./fallbackUsersCatalog.json";

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

  if (roles.length === 1 && roles[0] === "admin" && activeUser.email.toLowerCase() === "admin@mail.com") {
    return ALL_SCHOOL_CLASSES;
  }

  const catalogUser = fallbackUsersCatalog.find(
    (u) =>
      u.email.toLowerCase() === activeUser.email.toLowerCase() ||
      (activeUser.nis_nip && u.nis_nip === activeUser.nis_nip) ||
      u.full_name.toLowerCase() === activeUser.full_name.toLowerCase()
  );

  const rawClass = activeUser.class_name || catalogUser?.class_name || "";
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

// Dictionary of Guru -> Assigned Subject(s) built from data_guru.md & catalog
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

  // Super Administrator murni yang bukan guru memiliki akses penuh ke semua Mapel
  if (roles.length === 1 && roles[0] === "admin" && activeUser.email.toLowerCase() === "admin@mail.com") {
    return null; // Semua Mapel
  }

  // Jika bukan guru (misal siswa), return null (sesuai view siswa)
  const isGuru = roles.some((r) => ["guru", "guru_mapel", "walikelas", "admin_akademik", "kamad", "waka"].includes(r));
  if (!isGuru) return null;

  const assigned: Set<string> = new Set();

  // 1. Cek dari field user.subject_specialty
  if (activeUser.subject_specialty && activeUser.subject_specialty.trim()) {
    activeUser.subject_specialty.split(",").forEach((s) => {
      const clean = s.trim();
      if (clean) assigned.add(clean);
    });
  }

  // 2. Cek dari NIP / Email di GURU_SUBJECT_MAP
  const nip = activeUser.nis_nip || "";
  if (nip && GURU_SUBJECT_MAP[nip]) {
    GURU_SUBJECT_MAP[nip].forEach((s) => assigned.add(s));
  }

  // 3. Cek dari catalog berdasarkan nama / email
  const catalogUser = fallbackUsersCatalog.find(
    (u) =>
      u.email.toLowerCase() === activeUser.email.toLowerCase() ||
      (nip && u.nis_nip === nip) ||
      u.full_name.toLowerCase() === activeUser.full_name.toLowerCase()
  );

  if (catalogUser && catalogUser.subject_specialty) {
    catalogUser.subject_specialty.split(",").forEach((s) => {
      const clean = s.trim();
      if (clean) assigned.add(clean);
    });
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

  const cleanTarget = subjectName.toLowerCase().trim();
  return assigned.some(
    (s) => s.toLowerCase().trim() === cleanTarget || cleanTarget.includes(s.toLowerCase().trim()) || s.toLowerCase().trim().includes(cleanTarget)
  );
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
