// Helper kalkulasi kalender Hijriah (Islami) dan Pasaran Jawa (Pancawara)

export const PASARAN_JAWA = ["Legi", "Pahing", "Pon", "Wage", "Kliwon"] as const;
export type PasaranName = typeof PASARAN_JAWA[number];

// Eastern Arabic digits (۰, ۱, ۲, ۳, ...)
const EASTERN_ARABIC_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export function toEasternArabicNumerals(num: number | string): string {
  return String(num).replace(/[0-9]/g, (digit) => EASTERN_ARABIC_DIGITS[+digit] || digit);
}

/**
 * Menghitung Pasaran Jawa berdasarkan tanggal Masehi secara deterministik.
 * Siklus 5 hari: Legi, Pahing, Pon, Wage, Kliwon.
 */
export function getPasaranJawa(date: Date): PasaranName {
  const utcDays = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  const index = ((utcDays + 3) % 5 + 5) % 5;
  return PASARAN_JAWA[index];
}

const HIJRI_MONTH_MAP: Record<string, string> = {
  muharram: "Muharram",
  safar: "Safar",
  rabiulawal: "Rabiul Awal",
  rabiulakhir: "Rabiul Akhir",
  jumadilawal: "Jumadil Awal",
  jumadilakhir: "Jumadil Akhir",
  rajab: "Rajab",
  syaban: "Sya'ban",
  syakban: "Sya'ban",
  shaban: "Sya'ban",
  ramadan: "Ramadhan",
  ramadhan: "Ramadhan",
  syawal: "Syawal",
  shawwal: "Syawal",
  zulkaidah: "Dzulqa'dah",
  dzulqadah: "Dzulqa'dah",
  zulhijah: "Dzulhijjah",
  dzulhijjah: "Dzulhijjah",
};

export interface HijriDateInfo {
  day: number;
  arabicDay: string;
  monthName: string;
  year: number;
  formattedHijri: string;
}

// Tabel Kalibrasi Awal Bulan Kalender Hijriah Indonesia Resmi Kementerian Agama RI (Ditjen Bimas Islam)
// Berdasarkan kriteria MABIMS yang berlaku di wilayah hukum Republik Indonesia
interface KemenagHijriMonth {
  year: number;
  month: string;
  start: string; // Tanggal awal 1 Hijriah (YYYY-MM-DD)
}

const KEMENAG_HIJRI_MONTHS: KemenagHijriMonth[] = [
  // 1447 H (2025 - 2026)
  { year: 1447, month: "Rajab", start: "2025-12-21" },
  { year: 1447, month: "Sya'ban", start: "2026-01-20" },
  { year: 1447, month: "Ramadhan", start: "2026-02-19" },
  { year: 1447, month: "Syawal", start: "2026-03-21" },
  { year: 1447, month: "Dzulqa'dah", start: "2026-04-19" },
  { year: 1447, month: "Dzulhijjah", start: "2026-05-18" },
  // 1448 H (2026 - 2027)
  { year: 1448, month: "Muharram", start: "2026-06-16" },
  { year: 1448, month: "Safar", start: "2026-07-16" },
  { year: 1448, month: "Rabiul Awal", start: "2026-08-14" },
  { year: 1448, month: "Rabiul Akhir", start: "2026-09-13" },
  { year: 1448, month: "Jumadil Awal", start: "2026-10-13" },
  { year: 1448, month: "Jumadil Akhir", start: "2026-11-12" },
  { year: 1448, month: "Rajab", start: "2026-12-11" },
  { year: 1448, month: "Sya'ban", start: "2027-01-10" },
  { year: 1448, month: "Ramadhan", start: "2027-02-08" },
  { year: 1448, month: "Syawal", start: "2027-03-10" },
  { year: 1448, month: "Dzulqa'dah", start: "2027-04-08" },
  { year: 1448, month: "Dzulhijjah", start: "2027-05-08" },
  // 1449 H (2027 - 2028)
  { year: 1449, month: "Muharram", start: "2027-06-06" },
  { year: 1449, month: "Safar", start: "2027-07-06" },
  { year: 1449, month: "Rabiul Awal", start: "2027-08-04" },
  { year: 1449, month: "Rabiul Akhir", start: "2027-09-03" },
  { year: 1449, month: "Jumadil Awal", start: "2027-10-02" },
  { year: 1449, month: "Jumadil Akhir", start: "2027-11-01" },
  { year: 1449, month: "Rajab", start: "2027-11-30" },
  { year: 1449, month: "Sya'ban", start: "2027-12-30" },
  { year: 1449, month: "Ramadhan", start: "2028-01-28" },
  { year: 1449, month: "Syawal", start: "2028-02-27" },
  { year: 1449, month: "Dzulqa'dah", start: "2028-03-27" },
  { year: 1449, month: "Dzulhijjah", start: "2028-04-26" },
  // 1450 H (2028)
  { year: 1450, month: "Muharram", start: "2028-05-25" },
  { year: 1450, month: "Safar", start: "2028-06-24" },
];

const HIJRI_MONTH_ORDER = [
  "Muharram",
  "Safar",
  "Rabiul Awal",
  "Rabiul Akhir",
  "Jumadil Awal",
  "Jumadil Akhir",
  "Rajab",
  "Sya'ban",
  "Ramadhan",
  "Syawal",
  "Dzulqa'dah",
  "Dzulhijjah",
];

/**
 * Mengambil tanggal Hijriah lengkap dari sebuah tanggal Masehi sesuai Kalender Kemenag RI.
 */
export function getHijriDate(date: Date): HijriDateInfo {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateStr = `${y}-${m}-${d}`;

  // 1. Cek pada tabel resmi kalibrasi Kemenag RI
  for (let i = KEMENAG_HIJRI_MONTHS.length - 1; i >= 0; i--) {
    if (dateStr >= KEMENAG_HIJRI_MONTHS[i].start) {
      const cur = KEMENAG_HIJRI_MONTHS[i];
      const curStart = new Date(cur.start + "T00:00:00Z");
      const curTarget = new Date(dateStr + "T00:00:00Z");
      const diffDays = Math.round((curTarget.getTime() - curStart.getTime()) / 86400000);
      const day = diffDays + 1;
      const arabicDay = toEasternArabicNumerals(day);
      const formattedHijri = `${day} ${cur.month} ${cur.year} H`;

      return {
        day,
        arabicDay,
        monthName: cur.month,
        year: cur.year,
        formattedHijri,
      };
    }
  }

  // 2. Perhitungan matematis siklus bulan sinodis berkelanjutan (untuk tanggal jauh di masa depan)
  const anchor = KEMENAG_HIJRI_MONTHS[KEMENAG_HIJRI_MONTHS.length - 1];
  const anchorTime = new Date(anchor.start + "T00:00:00Z").getTime();
  const targetTime = new Date(dateStr + "T00:00:00Z").getTime();
  const daysSinceAnchor = Math.round((targetTime - anchorTime) / 86400000);

  const meanSynodic = 29.530588;
  const monthsPassed = Math.floor(daysSinceAnchor / meanSynodic);
  const dayInMonth = Math.floor(daysSinceAnchor - monthsPassed * meanSynodic) + 1;

  const anchorMonthIndex = HIJRI_MONTH_ORDER.indexOf(anchor.month);
  const totalMonths = anchor.year * 12 + anchorMonthIndex + monthsPassed;
  const year = Math.floor(totalMonths / 12);
  const monthName = HIJRI_MONTH_ORDER[totalMonths % 12];
  const arabicDay = toEasternArabicNumerals(dayInMonth);
  const formattedHijri = `${dayInMonth} ${monthName} ${year} H`;

  return {
    day: dayInMonth,
    arabicDay,
    monthName,
    year,
    formattedHijri,
  };

  // 2. Fallback jika tanggal di luar rentang tabel kalibrasi
  try {
    const formatter = new Intl.DateTimeFormat("id-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const parts = formatter.formatToParts(date);
    let day = 1;
    let rawMonth = "";
    let year = 1448;

    for (const part of parts) {
      if (part.type === "day") {
        day = parseInt(part.value, 10) || 1;
      } else if (part.type === "month") {
        rawMonth = part.value.toLowerCase().replace(/[^a-z']/g, "");
      } else if (part.type === "year") {
        year = parseInt(part.value, 10) || 1448;
      }
    }

    const cleanKey = Object.keys(HIJRI_MONTH_MAP).find((k) => rawMonth.includes(k) || k.includes(rawMonth)) || "rabiulawal";
    const monthName = HIJRI_MONTH_MAP[cleanKey] || "Hijriah";
    const arabicDay = toEasternArabicNumerals(day);
    const formattedHijri = `${day} ${monthName} ${year} H`;

    return {
      day,
      arabicDay,
      monthName,
      year,
      formattedHijri,
    };
  } catch {
    return {
      day: 1,
      arabicDay: "۱",
      monthName: "Hijriah",
      year: 1448,
      formattedHijri: "1 Hijriah 1448 H",
    };
  }
}

/**
 * Menghasilkan judul rentang bulan Hijriah untuk bulan Masehi yang sedang aktif dilihat.
 * Contoh: "Rabiul Awal - Rabiul Akhir 1448"
 */
export function getHijriMonthRangeTitle(year: number, monthIndex: number): string {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  const startH = getHijriDate(firstDay);
  const endH = getHijriDate(lastDay);

  if (startH.monthName === endH.monthName) {
    return `${startH.monthName} ${startH.year}`;
  }

  if (startH.year === endH.year) {
    return `${startH.monthName} - ${endH.monthName} ${startH.year}`;
  }

  return `${startH.monthName} ${startH.year} - ${endH.monthName} ${endH.year}`;
}
