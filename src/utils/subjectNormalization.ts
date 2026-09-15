/**
 * Utility for normalizing and matching madrasah subject names across
 * assignments, LKPD, CBT exams, submissions, and schedule records.
 */

export function normalizeSubjectName(raw: string): string {
  if (!raw) return "";
  const s = raw.toLowerCase().replace(/['"`\-_]/g, " ").trim();
  if (s.includes("quran") || s.includes("hadis") || s.includes("hadits") || s === "qh") return "Al Qur'an Hadis";
  if (s.includes("akidah") || s.includes("aqidah") || s.includes("akhlak")) return "Akidah Akhlak";
  if (s.includes("fikih") || s.includes("fiqih")) return "Fikih";
  if (s.includes("kebudayaan islam") || s.includes("sejarah kebudayaan") || s === "ski") return "Sejarah Kebudayaan Islam";
  if (s.includes("arab")) return "Bahasa Arab";
  if (s.includes("indonesia") || s === "bi" || s.includes("b indo")) return "Bahasa Indonesia";
  if (s.includes("inggris") || s.includes("english") || s.includes("b ing")) return "Bahasa Inggris";
  if (s.includes("matematika") || s.includes("mtk") || s.includes("math")) return "Matematika";
  if (s.includes("alam") || s === "ipa" || s.includes("sains")) return "Ilmu Pendidikan Alam";
  if (s.includes("sosial") || s === "ips") return "Ilmu Pendidikan Sosial";
  if (s.includes("pancasila") || s.includes("kewarganegaraan") || s.includes("ppkn") || s.includes("pkn")) return "Pendidikan Kewarganegaraan";
  if (s.includes("jasmani") || s.includes("pjok") || s.includes("penjas") || s.includes("olahraga")) return "Pendidikan Jasmani, Olahraga dan Kesehatan";
  if (s.includes("seni") || s.includes("prakarya") || s.includes("sbk")) return "Prakarya dan Seni Budaya";
  if (!s.includes("matematika") && (s.includes("teknologi informasi") || s.includes("tik") || s.includes("komputer") || s.includes("informatika"))) return "TIK (Teknologi Informasi dan Komunikasi)";
  if (s.includes("jawa")) return "Bahasa Jawa";
  if (s.includes("konseling") || s.includes("bk")) return "Bimbingan dan Konseling";
  return raw.trim();
}

export function isSameSubject(subA: string, subB: string): boolean {
  if (!subA || !subB) return false;
  const normA = normalizeSubjectName(subA);
  const normB = normalizeSubjectName(subB);
  if (normA && normB) {
    return normA.toLowerCase() === normB.toLowerCase();
  }

  const a = subA.toLowerCase().trim();
  const b = subB.toLowerCase().trim();
  if (a === b) return true;

  // Isolasi ketat TIK vs Matematika agar kata "matematika" tidak menabrak substring "tik"
  const isAMtk = a.includes("matematika") || a === "mtk";
  const isBMtk = b.includes("matematika") || b === "mtk";

  const isATik = !isAMtk && (a === "tik" || a.includes("informatika") || /(^|[^a-z0-9])tik([^a-z0-9]|$)/i.test(subA));
  const isBTik = !isBMtk && (b === "tik" || b.includes("informatika") || /(^|[^a-z0-9])tik([^a-z0-9]|$)/i.test(subB));

  if (isATik || isBTik) return isATik && isBTik;
  if (isAMtk || isBMtk) return isAMtk && isBMtk;

  if (a.length >= 4 && b.length >= 4) {
    return a.includes(b) || b.includes(a);
  }
  return false;
}
