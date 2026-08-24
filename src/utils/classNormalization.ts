/**
 * Central Utility for Class & Rombel Normalization at MTsN 2 Cilacap
 * Handles any class format string (e.g. "8A", "VIII-A", "Kelas VIII A", "Rombel 8A", "8-A", "IX A")
 * and converts them to standardized representations.
 */

export function getClassCode(raw?: string | null): string {
  if (!raw || raw.trim() === "" || raw === "-") return "";
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
 * - "rombel": "Rombel 8A"
 * - "kelas": "Kelas VIII A"
 * - "short": "8A"
 */
export function formatClassForDisplay(
  raw?: string | null,
  format: "rombel" | "kelas" | "short" = "rombel"
): string {
  const code = getClassCode(raw);
  if (!code) return raw || "-";

  const gradeNum = code.substring(0, code.length - 1); // e.g. "8"
  const section = code.substring(code.length - 1);    // e.g. "A"

  const romanMap: Record<string, string> = {
    "7": "VII",
    "8": "VIII",
    "9": "IX",
  };

  const roman = romanMap[gradeNum] || gradeNum;

  if (format === "short") return `${gradeNum}${section}`;
  if (format === "kelas") return `Kelas ${roman} ${section}`;
  return `Rombel ${gradeNum}${section}`;
}

export function normalizeRombelName(rawClass?: string | null): string {
  return formatClassForDisplay(rawClass, "rombel");
}
