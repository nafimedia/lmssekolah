export interface AcademicYearItem {
  id: string;
  year: string;
  semester: "Ganjil" | "Genap";
  startDate: string;
  endDate: string;
  status: "AKTIF" | "TERJADWAL" | "ARSIP";
  isCurrent: boolean;
  notes?: string;
}

const STORAGE_KEY = "lms_academic_years_v2";

const INITIAL_ACADEMIC_YEARS: AcademicYearItem[] = [
  {
    id: "ta_2026_ganjil",
    year: "2026/2027",
    semester: "Ganjil",
    startDate: "13 Juli 2026",
    endDate: "19 Desember 2026",
    status: "AKTIF",
    isCurrent: true,
    notes: "Tahun Ajaran Aktif Kurikulum Merdeka Kemenag 2026/2027",
  },
  {
    id: "ta_2026_genap",
    year: "2026/2027",
    semester: "Genap",
    startDate: "04 Januari 2027",
    endDate: "19 Juni 2027",
    status: "TERJADWAL",
    isCurrent: false,
    notes: "Semester Genap Terjadwal 2026/2027",
  },
  {
    id: "ta_2025_genap",
    year: "2025/2026",
    semester: "Genap",
    startDate: "05 Januari 2026",
    endDate: "20 Juni 2026",
    status: "ARSIP",
    isCurrent: false,
    notes: "Arsip Semester Genap 2025/2026",
  },
  {
    id: "ta_2025_ganjil",
    year: "2025/2026",
    semester: "Ganjil",
    startDate: "14 Juli 2025",
    endDate: "20 Desember 2025",
    status: "ARSIP",
    isCurrent: false,
    notes: "Arsip Semester Ganjil 2025/2026",
  },
  {
    id: "ta_2024_genap",
    year: "2024/2025",
    semester: "Genap",
    startDate: "06 Januari 2025",
    endDate: "21 Juni 2025",
    status: "ARSIP",
    isCurrent: false,
    notes: "Arsip Semester Genap 2024/2025",
  },
];

export class AcademicYearService {
  static getAcademicYears(): AcademicYearItem[] {
    if (typeof window === "undefined") return INITIAL_ACADEMIC_YEARS;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to load academic years:", e);
    }
    return INITIAL_ACADEMIC_YEARS;
  }

  static getActiveAcademicYear(): AcademicYearItem {
    const list = this.getAcademicYears();
    const active = list.find((item) => item.isCurrent || item.status === "AKTIF");
    return active || list[0] || INITIAL_ACADEMIC_YEARS[0];
  }

  static setActiveAcademicYear(id: string): AcademicYearItem[] {
    const list = this.getAcademicYears();
    const updated = list.map((item) => {
      if (item.id === id) {
        return { ...item, isCurrent: true, status: "AKTIF" as const };
      } else {
        return {
          ...item,
          isCurrent: false,
          status: item.status === "AKTIF" ? ("ARSIP" as const) : item.status,
        };
      }
    });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
    }
    return updated;
  }

  static saveAcademicYear(item: Omit<AcademicYearItem, "id"> & { id?: string }): AcademicYearItem[] {
    const list = this.getAcademicYears();
    const targetId = item.id || `ta_${Date.now()}`;
    let isAlreadyExists = false;

    let updated = list.map((existing) => {
      if (existing.id === targetId) {
        isAlreadyExists = true;
        return { ...existing, ...item, id: targetId };
      }
      return existing;
    });

    if (!isAlreadyExists) {
      const newItem: AcademicYearItem = {
        id: targetId,
        year: item.year,
        semester: item.semester,
        startDate: item.startDate,
        endDate: item.endDate,
        status: item.status || "TERJADWAL",
        isCurrent: !!item.isCurrent,
        notes: item.notes || "",
      };
      updated = [newItem, ...updated];
    }

    if (item.isCurrent || item.status === "AKTIF") {
      updated = updated.map((i) => ({
        ...i,
        isCurrent: i.id === targetId,
        status: i.id === targetId ? ("AKTIF" as const) : i.status === "AKTIF" ? ("ARSIP" as const) : i.status,
      }));
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
    }
    return updated;
  }

  static deleteAcademicYear(id: string): AcademicYearItem[] {
    const list = this.getAcademicYears();
    const filtered = list.filter((i) => i.id !== id);

    // If active item was deleted, activate the first remaining
    if (filtered.length > 0 && !filtered.some((i) => i.isCurrent)) {
      filtered[0].isCurrent = true;
      filtered[0].status = "AKTIF";
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch (e) {}
    }
    return filtered;
  }
}
