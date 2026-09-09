/**
 * Central Utility for Class & Rombel Normalization at MTsN 2 Cilacap
 * Handles any class format string (e.g. "8A", "VIII-A", "Kelas VIII A", "Rombel 8A", "8-A", "IX A")
 * and converts them to standardized representations.
 */

export function getClassCode(raw?: string | null): string {
  if (!raw || raw.trim() === "" || raw === "-") return "";
  const upper = raw.trim().toUpperCase();
  if (upper === "SEMUA" || upper === "ALL" || upper === "ADMIN") return "";

  const cleaned = raw.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");

  // Check Grade IX / 9
  if (cleaned.includes("IXA") || cleaned.includes("9A")) return "9A";
  if (cleaned.includes("IXB") || cleaned.includes("9B")) return "9B";
  if (cleaned.includes("IXC") || cleaned.includes("9C")) return "9C";

  // Check Grade VIII / 8
  if (cleaned.includes("VIIIA") || cleaned.includes("8A")) return "8A";
  if (cleaned.includes("VIIIB") || cleaned.includes("8B")) return "8B";
  if (cleaned.includes("VIIIC") || cleaned.includes("8C")) return "8C";

  // Check Grade VII / 7
  if (cleaned.includes("VIIA") || cleaned.includes("7A")) return "7A";
  if (cleaned.includes("VIIB") || cleaned.includes("7B")) return "7B";
  if (cleaned.includes("VIIC") || cleaned.includes("7C")) return "7C";

  // Generic fallback: strip prefixes like KELAS or ROMBEL
  const stripped = cleaned.replace("KELAS", "").replace("ROMBEL", "").trim();
  if (stripped === "SEMUA" || stripped === "ALL") return "";
  return stripped || raw.trim();
}

/**
 * Check if two class string representations refer to the exact same class/rombel.
 */
export function isSameClass(classA?: string | null, classB?: string | null): boolean {
  if (!classA || !classB) return false;
  if (classA === "Semua" || classB === "Semua" || classA === "ALL" || classB === "ALL") return true;

  const codeA = getClassCode(classA);
  const codeB = getClassCode(classB);

  if (codeA && codeB && codeA === codeB) return true;

  const cleanA = classA.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cleanB = classB.toLowerCase().replace(/[^a-z0-9]/g, "");

  return cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA);
}

/**
 * Format class string into standard display format:
 * - "kelas": "Kelas 8A" (Standar bahasa pengguna di madrasah)
 * - "short": "8A"
 */
export function formatClassForDisplay(
  raw?: string | null,
  format: "rombel" | "kelas" | "short" = "kelas"
): string {
  const code = getClassCode(raw);
  if (!code) return raw || "-";

  const gradeNum = code.substring(0, code.length - 1); // e.g. "8"
  const section = code.substring(code.length - 1);    // e.g. "A"

  if (format === "short") return `${gradeNum}${section}`;
  return `Kelas ${gradeNum}${section}`;
}

export function normalizeRombelName(rawClass?: string | null): string {
  return formatClassForDisplay(rawClass, "kelas");
}

/**
 * Resolves the assigned Class for a Wali Kelas based on real database tables / user attributes.
 */
export function resolveWaliKelasRombel(
  user?: { full_name?: string; name?: string; nis_nip?: string; class_name?: string } | null,
  masterRombels?: { code?: string; name?: string; wali_kelas?: string }[] | null,
  format: "rombel" | "kelas" = "kelas"
): string {
  if (!user) return "Kelas 8A";

  // 1. If user has explicit class_name in their profile/account
  if (user.class_name && user.class_name !== "-" && user.class_name.trim() !== "") {
    return formatClassForDisplay(user.class_name, format);
  }

  const rawName = (user.full_name || user.name || "").toLowerCase().trim();
  const cleanTarget = rawName
    .replace(/\b(s\.pd|m\.pd|s\.ag|m\.pd\.i|s\.p|h\.|hj\.|m\.si|drs|dra)\b/gi, "")
    .replace(/[^a-z0-9]/gi, "");

  // 2. Check against master_rombels if available
  if (masterRombels && masterRombels.length > 0) {
    const match = masterRombels.find((r) => {
      const wali = (r.wali_kelas || "").toLowerCase().trim();
      if (!wali) return false;
      const cleanWali = wali
        .replace(/\b(s\.pd|m\.pd|s\.ag|m\.pd\.i|s\.p|h\.|hj\.|m\.si|drs|dra)\b/gi, "")
        .replace(/[^a-z0-9]/gi, "");
      return (
        cleanWali === cleanTarget ||
        (cleanTarget.length >= 4 && cleanWali.includes(cleanTarget)) ||
        (cleanWali.length >= 4 && cleanTarget.includes(cleanWali))
      );
    });
    if (match) {
      return formatClassForDisplay(match.code || match.name, format);
    }
  }

  // 3. Fallback based on official assignment if master_rombels is loading
  if (cleanTarget.includes("achmadmakmun")) return formatClassForDisplay("8B", format);
  if (cleanTarget.includes("sobiyati")) return formatClassForDisplay("8A", format);
  if (cleanTarget.includes("maulidia")) return formatClassForDisplay("7A", format);
  if (cleanTarget.includes("rindang")) return formatClassForDisplay("7B", format);
  if (cleanTarget.includes("novantya")) return formatClassForDisplay("9A", format);
  if (cleanTarget.includes("indah")) return formatClassForDisplay("9B", format);

  return "Kelas 8A";
}
