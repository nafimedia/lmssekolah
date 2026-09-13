/**
 * Utility Helper untuk Parsing & Menilai Status Deadline / Batas Waktu Tugas & LKPD
 * Mencegah kesalahan fallback "Hari ini" dan mendeteksi apakah batas waktu sudah terlewat (overdue).
 */

const INDO_MONTH_MAP: Record<string, number> = {
  jan: 0, januari: 0,
  feb: 1, februari: 1,
  mar: 2, maret: 2,
  apr: 3, april: 3,
  mei: 4,
  jun: 5, juni: 5,
  jul: 6, juli: 6,
  agu: 7, agustus: 7,
  sep: 8, september: 8,
  okt: 9, oktober: 9,
  nov: 10, november: 10,
  des: 11, desember: 11,
};

export interface DeadlineStatus {
  displayText: string;
  isOverdue: boolean;
  isToday: boolean;
  isUrgent: boolean;
  label: string;
  textColor: string;
  badgeClass: string;
}

export function parseDueDate(dueDateStr?: string | null, createdAtStr?: string | null): Date | null {
  if (!dueDateStr || typeof dueDateStr !== "string") return null;
  const raw = dueDateStr.trim();
  if (!raw || raw.toLowerCase().includes("jadwal kbm")) return null;

  // Case 1: Teks relatif lama "Hari ini, 15:00 WIB" yang dibuat di tanggal lampau
  if (raw.toLowerCase().includes("hari ini")) {
    const timeMatch = raw.match(/(\d{1,2}):(\d{2})/);
    const hours = timeMatch ? parseInt(timeMatch[1], 10) : 23;
    const mins = timeMatch ? parseInt(timeMatch[2], 10) : 59;

    // Jika ada createdAt dan createdAt bukan hari ini, gunakan tanggal createdAt
    if (createdAtStr) {
      const createdDate = new Date(createdAtStr);
      if (!isNaN(createdDate.getTime())) {
        const d = new Date(createdDate);
        d.setHours(hours, mins, 0, 0);
        return d;
      }
    }

    const today = new Date();
    today.setHours(hours, mins, 0, 0);
    return today;
  }

  // Case 2: Format Indonesia "23 Agu 2026, 15:00 WIB" atau "31 Agustus 2026"
  const indoMatch = raw.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})(?:,\s*(\d{1,2}):(\d{2}))?/);
  if (indoMatch) {
    const day = parseInt(indoMatch[1], 10);
    const monthKey = indoMatch[2].toLowerCase();
    const year = parseInt(indoMatch[3], 10);
    const hours = indoMatch[4] ? parseInt(indoMatch[4], 10) : 23;
    const mins = indoMatch[5] ? parseInt(indoMatch[5], 10) : 59;

    const monthIndex = INDO_MONTH_MAP[monthKey];
    if (monthIndex !== undefined) {
      return new Date(year, monthIndex, day, hours, mins, 0, 0);
    }
  }

  // Case 3: ISO Date "2026-08-23" atau "2026-08-23 15:00:00"
  const isoDate = new Date(raw.replace(" WIB", ""));
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  return null;
}

export function getDeadlineStatus(
  dueDateStr?: string | null,
  createdAtStr?: string | null,
  now: Date = new Date()
): DeadlineStatus {
  if (!dueDateStr || !dueDateStr.trim() || dueDateStr.toLowerCase().includes("jadwal kbm")) {
    return {
      displayText: "Sesuai Jadwal KBM",
      isOverdue: false,
      isToday: false,
      isUrgent: false,
      label: "Jadwal KBM",
      textColor: "text-muted-foreground",
      badgeClass: "bg-muted text-muted-foreground border-border",
    };
  }

  const parsedDate = parseDueDate(dueDateStr, createdAtStr);
  const cleanRaw = dueDateStr.trim();

  if (!parsedDate) {
    return {
      displayText: cleanRaw,
      isOverdue: false,
      isToday: false,
      isUrgent: false,
      label: "Batas Waktu",
      textColor: "text-foreground",
      badgeClass: "bg-muted text-foreground border-border",
    };
  }

  const isOverdue = parsedDate.getTime() < now.getTime();
  const isSameDay =
    parsedDate.getDate() === now.getDate() &&
    parsedDate.getMonth() === now.getMonth() &&
    parsedDate.getFullYear() === now.getFullYear();

  const diffHours = (parsedDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isUrgent = !isOverdue && diffHours > 0 && diffHours <= 24;

  if (isOverdue) {
    return {
      displayText: cleanRaw.replace(/hari ini/i, "Batas Waktu Terlewat"),
      isOverdue: true,
      isToday: isSameDay,
      isUrgent: false,
      label: "Terlewat",
      textColor: "text-rose-600 dark:text-rose-400 font-semibold",
      badgeClass: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300 dark:border-rose-900/60 font-semibold",
    };
  }

  if (isSameDay) {
    return {
      displayText: cleanRaw,
      isOverdue: false,
      isToday: true,
      isUrgent: true,
      label: "Hari Ini",
      textColor: "text-amber-600 dark:text-amber-400 font-semibold",
      badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-900/60 font-semibold",
    };
  }

  if (isUrgent) {
    return {
      displayText: cleanRaw,
      isOverdue: false,
      isToday: false,
      isUrgent: true,
      label: "Segera Berakhir",
      textColor: "text-amber-600 dark:text-amber-400 font-medium",
      badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-900/60",
    };
  }

  return {
    displayText: cleanRaw,
    isOverdue: false,
    isToday: false,
    isUrgent: false,
    label: "Aktif",
    textColor: "text-foreground font-medium",
    badgeClass: "bg-muted text-foreground border-border",
  };
}
