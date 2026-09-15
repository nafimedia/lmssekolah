/**
 * Utility untuk menyinkronkan dan menstandardisasi penulisan nama serta gelar resmi
 * dewan guru MTs Negeri 2 Cilacap pada tampilan sistem tanpa mengubah data mentah database.
 */

export function resolveCanonicalTeacherName(rawName?: string | null): string {
  if (!rawName) return "Belum Ditentukan";
  const trimmed = rawName.trim();
  if (!trimmed || trimmed === "-" || trimmed === "null" || trimmed === "undefined") {
    return "Belum Ditentukan";
  }

  const norm = trimmed.toLowerCase();

  // 1. Hj. SITI MUHSINAH, M.Pd (Bahasa Arab)
  if (norm.includes("siti muhsinah") || (norm.includes("muhsinah") && !norm.includes("ani"))) {
    return "Hj. SITI MUHSINAH, M.Pd";
  }

  // 2. Hj. ANI YULIANI, S.Pd (Matematika - Gelar hajjah perempuan)
  if (norm.includes("ani yuliani")) {
    return "Hj. ANI YULIANI, S.Pd";
  }

  // 3. MITA MUNAWAROH, S.Kom (Guru TIK / Informatika)
  if (norm.includes("mita munawaroh") || (norm.includes("mita") && norm.includes("munawar"))) {
    return "MITA MUNAWAROH, S.Kom";
  }

  // 4. Hj. NANGIMAH, S.Pd. (Bahasa Indonesia)
  if (norm.includes("nangimah")) {
    return "Hj. NANGIMAH, S.Pd.";
  }

  // 5. RINDANG FARIHA IDANA, S.Pd (Bahasa Jawa)
  if (norm.includes("rindang") && (norm.includes("idana") || norm.includes("diana"))) {
    return "RINDANG FARIHA IDANA, S.Pd";
  }

  return trimmed;
}

/**
 * Normalisasi nama untuk pencocokan toleran typo / gelar / honorifik
 */
export function normalizeTeacherKey(name?: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/^(drs\.|dr\.|h\.|hj\.|hjh\.|dra\.)\s+/gi, "")
    .replace(/,\s*(s\.pd|m\.pd|m\.si|m\.ag|s\.ag|m\.pd\.i|s\.p|s\.pd\.i|s\.kom|s)\.?$/gi, "")
    .replace(/[^a-z0-9]/gi, "")
    .replace(/idana/g, "diana") // handle Diana vs Idana
    .trim();
}

/**
 * Memeriksa apakah dua string nama merujuk pada guru yang sama
 */
export function isSameTeacher(rawName1?: string | null, rawName2?: string | null): boolean {
  if (!rawName1 || !rawName2) return false;
  const c1 = resolveCanonicalTeacherName(rawName1);
  const c2 = resolveCanonicalTeacherName(rawName2);
  if (c1 !== "Belum Ditentukan" && c2 !== "Belum Ditentukan" && c1 === c2) {
    return true;
  }
  const k1 = normalizeTeacherKey(rawName1);
  const k2 = normalizeTeacherKey(rawName2);
  if (!k1 || !k2) return false;
  if (k1 === k2) return true;
  if (k1.length >= 5 && k2.includes(k1)) return true;
  if (k2.length >= 5 && k1.includes(k2)) return true;
  return false;
}

