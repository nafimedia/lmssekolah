import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
  Filter,
  CheckCircle2,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { useRealtimeCalendar, type CalendarDayCell } from "@/hooks/useRealtimeCalendar";
import { MysqlDataService } from "@/services/mysqlDataService";
import { AddAgendaDialog } from "./components/AddAgendaDialog";
import { DetailAgendaDialog } from "./components/DetailAgendaDialog";
import { CalendarSettingsDialog } from "./components/CalendarSettingsDialog";
import { getHijriDate } from "@/utils/hijriJawaHelper";

export interface AgendaItem {
  id: string;
  title: string;
  category: "libur" | "cbt" | "rapat" | "kokurikuler" | "kbm" | string;
  date: string; // Tampilan Masehi: "19 September 2026"
  rawDate: string; // Format ISO: "2026-09-19"
  hijriDateStr?: string; // Tampilan Hijriah: "7 Rabiul Akhir 1448"
  desc: string;
  badge: string;
  isSchoolAgenda?: boolean;
  isRedDate?: boolean;
}

// Daftar Resmi Hari Libur Nasional & Cuti Bersama SKB 3 Menteri RI Tahun 2026 serta Peringatan Kemenag/Madrasah
const NATIONAL_ISLAMIC_HOLIDAYS: AgendaItem[] = [
  // JANUARI 2026
  {
    id: "nat-2026-01-01",
    title: "Tahun Baru 2026 Masehi",
    category: "libur",
    date: "01 Januari 2026",
    rawDate: "2026-01-01",
    desc: "Libur Nasional Tahun Baru Masehi.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2026-01-03",
    title: "Hari Amal Bhakti (HAB) Kemenag RI ke-80",
    category: "libur",
    date: "03 Januari 2026",
    rawDate: "2026-01-03",
    desc: "Peringatan Hari Amal Bhakti Kementerian Agama Republik Indonesia.",
    badge: "🔴 Hari Besar Kemenag",
  },
  {
    id: "nat-2026-01-16",
    title: "Isra Mikraj Nabi Muhammad SAW 1447 H",
    category: "libur",
    date: "16 Januari 2026",
    rawDate: "2026-01-16",
    desc: "Peringatan Isra Mikraj Nabi Muhammad SAW 27 Rajab 1447 H & Libur Nasional.",
    badge: "🔴 Libur Nasional",
  },

  // FEBRUARI 2026
  {
    id: "nat-2026-02-16",
    title: "Cuti Bersama Tahun Baru Imlek 2577",
    category: "cuti",
    date: "16 Februari 2026",
    rawDate: "2026-02-16",
    desc: "Cuti Bersama Tahun Baru Imlek 2577 Kongzili.",
    badge: "🟡 Cuti Bersama",
  },
  {
    id: "nat-2026-02-17",
    title: "Tahun Baru Imlek 2577 Kongzili",
    category: "libur",
    date: "17 Februari 2026",
    rawDate: "2026-02-17",
    desc: "Libur Nasional Tahun Baru Imlek 2577 Kongzili.",
    badge: "🔴 Libur Nasional",
  },

  // MARET 2026
  {
    id: "nat-2026-03-18",
    title: "Cuti Bersama Hari Suci Nyepi",
    category: "cuti",
    date: "18 Maret 2026",
    rawDate: "2026-03-18",
    desc: "Cuti Bersama Hari Suci Nyepi Tahun Baru Saka 1948.",
    badge: "🟡 Cuti Bersama",
  },
  {
    id: "nat-2026-03-19",
    title: "Hari Suci Nyepi Tahun Baru Saka 1948",
    category: "libur",
    date: "19 Maret 2026",
    rawDate: "2026-03-19",
    desc: "Libur Nasional Hari Suci Nyepi Tahun Baru Saka 1948.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2026-03-20",
    title: "Cuti Bersama Hari Raya Idul Fitri 1447 H",
    category: "cuti",
    date: "20 Maret 2026",
    rawDate: "2026-03-20",
    desc: "Cuti Bersama Hari Raya Idul Fitri 1447 H.",
    badge: "🟡 Cuti Bersama",
  },
  {
    id: "nat-2026-03-21",
    title: "Hari Raya Idul Fitri 1447 H (Hari Pertama)",
    category: "libur",
    date: "21 Maret 2026",
    rawDate: "2026-03-21",
    desc: "Libur Nasional Hari Raya Idul Fitri 1 Syawal 1447 H.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2026-03-22",
    title: "Hari Raya Idul Fitri 1447 H (Hari Kedua)",
    category: "libur",
    date: "22 Maret 2026",
    rawDate: "2026-03-22",
    desc: "Libur Nasional Hari Raya Idul Fitri 2 Syawal 1447 H.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2026-03-23",
    title: "Cuti Bersama Hari Raya Idul Fitri 1447 H",
    category: "cuti",
    date: "23 Maret 2026",
    rawDate: "2026-03-23",
    desc: "Cuti Bersama Hari Raya Idul Fitri 1447 H.",
    badge: "🟡 Cuti Bersama",
  },
  {
    id: "nat-2026-03-24",
    title: "Cuti Bersama Hari Raya Idul Fitri 1447 H",
    category: "cuti",
    date: "24 Maret 2026",
    rawDate: "2026-03-24",
    desc: "Cuti Bersama Hari Raya Idul Fitri 1447 H.",
    badge: "🟡 Cuti Bersama",
  },

  // APRIL 2026
  {
    id: "nat-2026-04-03",
    title: "Wafat Yesus Kristus (Jumat Agung)",
    category: "libur",
    date: "03 April 2026",
    rawDate: "2026-04-03",
    desc: "Libur Nasional Wafat Yesus Kristus.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2026-04-05",
    title: "Kebangkitan Yesus Kristus (Paskah)",
    category: "libur",
    date: "05 April 2026",
    rawDate: "2026-04-05",
    desc: "Hari Peringatan Kebangkitan Yesus Kristus.",
    badge: "🔴 Libur Nasional",
  },

  // MEI 2026
  {
    id: "nat-2026-05-01",
    title: "Hari Buruh Internasional",
    category: "libur",
    date: "01 Mei 2026",
    rawDate: "2026-05-01",
    desc: "Libur Resmi Hari Buruh Internasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2026-05-14",
    title: "Kenaikan Yesus Kristus",
    category: "libur",
    date: "14 Mei 2026",
    rawDate: "2026-05-14",
    desc: "Libur Nasional Kenaikan Yesus Kristus.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2026-05-15",
    title: "Cuti Bersama Kenaikan Yesus Kristus",
    category: "cuti",
    date: "15 Mei 2026",
    rawDate: "2026-05-15",
    desc: "Cuti Bersama Kenaikan Yesus Kristus.",
    badge: "🟡 Cuti Bersama",
  },
  {
    id: "nat-2026-05-27",
    title: "Hari Raya Idul Adha 1447 H",
    category: "libur",
    date: "27 Mei 2026",
    rawDate: "2026-05-27",
    desc: "Penyembelihan Hewan Kurban & Sholat Idul Adha 10 Dzulhijjah 1447 H.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2026-05-28",
    title: "Cuti Bersama Hari Raya Idul Adha 1447 H",
    category: "cuti",
    date: "28 Mei 2026",
    rawDate: "2026-05-28",
    desc: "Cuti Bersama Hari Raya Idul Adha 1447 H.",
    badge: "🟡 Cuti Bersama",
  },
  {
    id: "nat-2026-05-31",
    title: "Hari Raya Waisak 2570 BE",
    category: "libur",
    date: "31 Mei 2026",
    rawDate: "2026-05-31",
    desc: "Libur Nasional Hari Raya Waisak 2570 BE.",
    badge: "🔴 Libur Nasional",
  },

  // JUNI 2026
  {
    id: "nat-2026-06-01",
    title: "Hari Lahir Pancasila",
    category: "libur",
    date: "01 Juni 2026",
    rawDate: "2026-06-01",
    desc: "Upacara Peringatan Hari Lahir Pancasila & Libur Nasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2026-06-16",
    title: "Tahun Baru Islam (1 Muharram 1448 H)",
    category: "libur",
    date: "16 Juni 2026",
    rawDate: "2026-06-16",
    desc: "Tahun Baru Islam 1448 Hijriah & Libur Nasional.",
    badge: "🔴 Libur Nasional",
  },

  // AGUSTUS 2026
  {
    id: "nat-2026-08-17",
    title: "Hari Kemerdekaan Republik Indonesia (HUT RI ke-81)",
    category: "libur",
    date: "17 Agustus 2026",
    rawDate: "2026-08-17",
    desc: "Upacara Bendera Peringatan Kemerdekaan RI di MTsN 2 Cilacap & Libur Resmi Nasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2026-08-25",
    title: "Maulid Nabi Muhammad SAW 1448 H",
    category: "libur",
    date: "25 Agustus 2026",
    rawDate: "2026-08-25",
    desc: "Peringatan Maulid Nabi Muhammad SAW 12 Rabiul Awal 1448 H & Libur Nasional.",
    badge: "🔴 Libur Nasional",
  },

  // OKTOBER 2026
  {
    id: "nat-2026-10-22",
    title: "Hari Santri Nasional (HSN 2026)",
    category: "kokurikuler",
    date: "22 Oktober 2026",
    rawDate: "2026-10-22",
    desc: "Apel Akbar Hari Santri Nasional memakai sarung & baju koko, serta istighotsah bersama.",
    badge: "🟡 Hari Besar Santri",
  },

  // NOVEMBER 2026
  {
    id: "nat-2026-11-25",
    title: "Hari Guru Nasional (HGN) & HUT PGRI",
    category: "kokurikuler",
    date: "25 November 2026",
    rawDate: "2026-11-25",
    desc: "Upacara Penghormatan Guru & Tenaga Kependidikan MTsN 2 Cilacap.",
    badge: "🟡 Hari Peringatan",
  },

  // DESEMBER 2026
  {
    id: "nat-2026-12-25",
    title: "Hari Raya Natal",
    category: "libur",
    date: "25 Desember 2026",
    rawDate: "2026-12-25",
    desc: "Libur Nasional Hari Raya Natal.",
    badge: "🔴 Libur Nasional",
  },

  // TAHUN 2027 (Berdasarkan Kalender Nasional Resmi RI & Ditjen Bimas Islam Kemenag RI)
  {
    id: "nat-2027-01-01",
    title: "Tahun Baru 2027 Masehi",
    category: "libur",
    date: "01 Januari 2027",
    rawDate: "2027-01-01",
    desc: "Libur Nasional Tahun Baru 2027 Masehi.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-01-03",
    title: "Hari Amal Bhakti (HAB) Kemenag RI ke-81",
    category: "libur",
    date: "03 Januari 2027",
    rawDate: "2027-01-03",
    desc: "Peringatan Hari Amal Bhakti Kementerian Agama Republik Indonesia.",
    badge: "🔴 Hari Besar Kemenag",
  },
  {
    id: "nat-2027-01-06",
    title: "Isra Mikraj Nabi Muhammad SAW 1448 H",
    category: "libur",
    date: "06 Januari 2027",
    rawDate: "2027-01-06",
    desc: "Peringatan Isra Mikraj Nabi Muhammad SAW 27 Rajab 1448 H & Libur Nasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-02-06",
    title: "Tahun Baru Imlek 2578 Kongzili",
    category: "libur",
    date: "06 Februari 2027",
    rawDate: "2027-02-06",
    desc: "Libur Nasional Tahun Baru Imlek 2578 Kongzili.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-03-09",
    title: "Hari Suci Nyepi Tahun Baru Saka 1949",
    category: "libur",
    date: "09 Maret 2027",
    rawDate: "2027-03-09",
    desc: "Libur Nasional Hari Suci Nyepi Tahun Baru Saka 1949.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-03-10",
    title: "Hari Raya Idul Fitri 1448 H (Hari Pertama)",
    category: "libur",
    date: "10 Maret 2027",
    rawDate: "2027-03-10",
    desc: "Libur Nasional Hari Raya Idul Fitri 1 Syawal 1448 H.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-03-11",
    title: "Hari Raya Idul Fitri 1448 H (Hari Kedua)",
    category: "libur",
    date: "11 Maret 2027",
    rawDate: "2027-03-11",
    desc: "Libur Nasional Hari Raya Idul Fitri 2 Syawal 1448 H.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-03-26",
    title: "Wafat Yesus Kristus (Jumat Agung)",
    category: "libur",
    date: "26 Maret 2027",
    rawDate: "2027-03-26",
    desc: "Libur Nasional Wafat Yesus Kristus.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-03-28",
    title: "Kebangkitan Yesus Kristus (Paskah)",
    category: "libur",
    date: "28 Maret 2027",
    rawDate: "2027-03-28",
    desc: "Hari Peringatan Kebangkitan Yesus Kristus.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-05-01",
    title: "Hari Buruh Internasional",
    category: "libur",
    date: "01 Mei 2027",
    rawDate: "2027-05-01",
    desc: "Libur Resmi Hari Buruh Internasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-05-06",
    title: "Kenaikan Yesus Kristus",
    category: "libur",
    date: "06 Mei 2027",
    rawDate: "2027-05-06",
    desc: "Libur Nasional Kenaikan Yesus Kristus.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-05-17",
    title: "Hari Raya Idul Adha 1448 H",
    category: "libur",
    date: "17 Mei 2027",
    rawDate: "2027-05-17",
    desc: "Penyembelihan Hewan Kurban & Sholat Idul Adha 10 Dzulhijjah 1448 H & Libur Nasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-05-20",
    title: "Hari Raya Waisak 2571 BE",
    category: "libur",
    date: "20 Mei 2027",
    rawDate: "2027-05-20",
    desc: "Libur Nasional Hari Raya Waisak 2571 BE.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-06-01",
    title: "Hari Lahir Pancasila",
    category: "libur",
    date: "01 Juni 2027",
    rawDate: "2027-06-01",
    desc: "Upacara Peringatan Hari Lahir Pancasila & Libur Nasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-06-06",
    title: "Tahun Baru Islam (1 Muharram 1449 H)",
    category: "libur",
    date: "06 Juni 2027",
    rawDate: "2027-06-06",
    desc: "Tahun Baru Islam 1 Muharram 1449 Hijriah & Libur Nasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-08-15",
    title: "Maulid Nabi Muhammad SAW 1449 H",
    category: "libur",
    date: "15 Agustus 2027",
    rawDate: "2027-08-15",
    desc: "Peringatan Maulid Nabi Muhammad SAW 12 Rabiul Awal 1449 H & Libur Nasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-08-17",
    title: "Hari Kemerdekaan Republik Indonesia (HUT RI ke-82)",
    category: "libur",
    date: "17 Agustus 2027",
    rawDate: "2027-08-17",
    desc: "Upacara Bendera Peringatan Kemerdekaan RI di MTsN 2 Cilacap & Libur Resmi Nasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-10-22",
    title: "Hari Santri Nasional (HSN 2027)",
    category: "kokurikuler",
    date: "22 Oktober 2027",
    rawDate: "2027-10-22",
    desc: "Apel Akbar Hari Santri Nasional memakai sarung & baju koko, serta istighotsah bersama.",
    badge: "🟡 Hari Besar Santri",
  },
  {
    id: "nat-2027-11-25",
    title: "Hari Guru Nasional (HGN) & HUT PGRI",
    category: "kokurikuler",
    date: "25 November 2027",
    rawDate: "2027-11-25",
    desc: "Upacara Penghormatan Guru & Tenaga Kependidikan MTsN 2 Cilacap.",
    badge: "🟡 Hari Peringatan",
  },
  {
    id: "nat-2027-12-25",
    title: "Hari Raya Natal",
    category: "libur",
    date: "25 Desember 2027",
    rawDate: "2027-12-25",
    desc: "Libur Nasional Hari Raya Natal.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2027-12-26",
    title: "Isra Mikraj Nabi Muhammad SAW 1449 H",
    category: "libur",
    date: "26 Desember 2027",
    rawDate: "2027-12-26",
    desc: "Peringatan Isra Mikraj Nabi Muhammad SAW 27 Rajab 1449 H & Libur Nasional.",
    badge: "🔴 Libur Nasional",
  },
];

export function AgendaKalenderModule({ activeRole }: { activeRole?: string }) {
  const [hijriOffsetDays, setHijriOffsetDays] = useState<number>(0);
  const [isCalendarSettingsOpen, setIsCalendarSettingsOpen] = useState<boolean>(false);

  const {
    currentMonthName,
    currentYear,
    currentMonth,
    formattedTime,
    currentDayName,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    getCalendarDays,
    hijriMonthRangeTitle,
  } = useRealtimeCalendar(hijriOffsetDays);

  const [filterCategory, setFilterCategory] = useState<string>("semua");
  const [selectedDateString, setSelectedDateString] = useState<string>("");
  const [isAddAgendaOpen, setIsAddAgendaOpen] = useState<boolean>(false);
  const [schoolAgendas, setSchoolAgendas] = useState<AgendaItem[]>([]);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(true);
  const [activeInfoAgenda, setActiveInfoAgenda] = useState<AgendaItem | null>(null);

  // Ambil konfigurasi kalender (offset Hijriah) dari database MySQL
  const fetchCalendarSettings = async () => {
    try {
      const settings = await MysqlDataService.getCalendarSettings();
      if (settings && settings.hijri_offset_days !== undefined) {
        const parsed = parseInt(settings.hijri_offset_days, 10);
        if (!isNaN(parsed)) {
          setHijriOffsetDays(parsed);
        }
      }
    } catch (err) {
      console.warn("fetchCalendarSettings failed:", err);
    }
  };

  // Muat data riil dari basis data MySQL tabel agendas
  const fetchAgendas = async () => {
    try {
      const dbAgendas = await MysqlDataService.getAgendas();
      if (dbAgendas) {
        const mapped: AgendaItem[] = dbAgendas.map((item) => {
          const cat = item.category || "kbm";
          const isRed = Boolean(item.is_red_date);
          const badge =
            item.badge ||
            (isRed
              ? "🔴 Libur Resmi"
              : cat === "cbt"
                ? "🔵 Ujian CBT"
                : cat === "rapat"
                  ? "🟣 Rapat Dinas"
                  : cat === "kokurikuler"
                    ? "🟡 Projek Kokurikuler"
                    : cat === "libur"
                      ? "🔴 Libur Resmi"
                      : "🟢 KBM Efektif");

          // Coba cari tanggal ISO dari date_str jika tersimpan format tertentu
          let rawDate = item.date_str || "";
          let hijriStr = "";
          const parsedDate = new Date(rawDate);
          if (!isNaN(parsedDate.getTime())) {
            const h = getHijriDate(parsedDate, hijriOffsetDays);
            hijriStr = `${h.day} ${h.monthName} ${h.year} H`;
          }

          return {
            id: String(item.id || Date.now()),
            title: item.title,
            category: cat,
            date: item.date_str,
            rawDate: rawDate,
            hijriDateStr: hijriStr,
            desc: item.description || "",
            badge,
            isSchoolAgenda: true,
            isRedDate: isRed || cat === "libur",
          };
        });
        setSchoolAgendas(mapped);
      }
    } catch (err) {
      console.warn("fetchAgendas failed:", err);
    }
  };

  useEffect(() => {
    fetchAgendas();
    fetchCalendarSettings();
  }, [hijriOffsetDays]);

  // Simpan penyesuaian koreksi hari Hijriah hasil Sidang Isbat
  const handleSaveHijriOffset = async (offset: number) => {
    await MysqlDataService.saveCalendarSetting("hijri_offset_days", String(offset));
    setHijriOffsetDays(offset);
    await fetchAgendas();
  };

  // Gabungkan agenda database MySQL dengan referensi kalender resmi Kemenag
  const allAgendas: AgendaItem[] = useMemo(() => {
    // Tambahkan kalkulasi tanggal Hijriah otomatis jika belum ada
    const hydratedNational = NATIONAL_ISLAMIC_HOLIDAYS.map((item) => {
      if (item.rawDate) {
        const d = new Date(item.rawDate);
        if (!isNaN(d.getTime())) {
          const h = getHijriDate(d, hijriOffsetDays);
          return {
            ...item,
            hijriDateStr: `${h.day} ${h.monthName} ${h.year} H`,
          };
        }
      }
      return item;
    });

    return [...schoolAgendas, ...hydratedNational];
  }, [schoolAgendas, hijriOffsetDays]);

  const calendarDays = getCalendarDays();

  const handleAddAgenda = async (data: {
    title: string;
    category: string;
    selectedDate: string;
    desc: string;
    isRedDate?: boolean;
    badge?: string;
  }) => {
    try {
      await MysqlDataService.saveAgenda({
        title: data.title,
        description: data.desc,
        category: data.category,
        date_str: data.selectedDate, // Simpan format ISO YYYY-MM-DD
        is_red_date: data.isRedDate ? 1 : 0,
        badge: data.badge,
      });
      await fetchAgendas();
      toast.success("Agenda kegiatan madrasah berhasil disimpan ke basis data!");
    } catch (err) {
      console.error("Gagal menyimpan agenda ke MySQL:", err);
      toast.error("Gagal menyimpan agenda ke database!");
    }
  };

  const handleDeleteAgenda = async (id: string) => {
    const numId = Number(id);
    if (numId) {
      try {
        await MysqlDataService.deleteAgenda(numId);
        toast.success("Agenda kegiatan berhasil dihapus!");
        await fetchAgendas();
      } catch (err) {
        console.error("Gagal menghapus agenda dari MySQL:", err);
        toast.error("Gagal menghapus agenda!");
      }
    } else {
      setSchoolAgendas((prev) => prev.filter((a) => a.id !== id));
      toast.success("Agenda kegiatan dihapus!");
    }
  };

  // Filter agenda untuk bulan yang sedang dilihat di kalender
  const currentMonthAgendas = useMemo(() => {
    return allAgendas.filter((item) => {
      if (!item.rawDate) return true;
      const d = new Date(item.rawDate);
      if (isNaN(d.getTime())) return true;
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
  }, [allAgendas, currentYear, currentMonth]);

  // Agenda yang ditampilkan pada daftar di bawah
  const displayAgendas = useMemo(() => {
    let list = currentMonthAgendas;

    // Filter berdasarkan kategori
    if (filterCategory !== "semua") {
      list = list.filter((item) => item.category === filterCategory);
    }

    // Jika user mengklik tanggal tertentu di kalender
    if (selectedDateString) {
      list = list.filter(
        (item) => item.rawDate === selectedDateString || item.date === selectedDateString
      );
    }

    // Urutkan berdasarkan tanggal asc
    return [...list].sort((a, b) => (a.rawDate || "").localeCompare(b.rawDate || ""));
  }, [currentMonthAgendas, filterCategory, selectedDateString]);

  // Dapatkan event dots untuk sebuah cell tanggal
  const getDayDots = (day: CalendarDayCell) => {
    if (!day.isCurrentMonth) return [];

    const matches = allAgendas.filter((item) => {
      if (!item.rawDate) return false;
      return item.rawDate === day.dateString || item.rawDate.startsWith(day.dateString);
    });

    const dots: { color: string; title: string }[] = [];
    const hasHoliday = matches.some(
      (m) =>
        m.isRedDate ||
        ((m.category === "libur" || m.badge?.includes("Libur Nasional") || m.badge?.includes("Hari Besar") || m.badge?.includes("Libur Resmi")) &&
          !m.badge?.includes("Cuti Bersama") &&
          m.category !== "cuti")
    );
    const hasCbt = matches.some((m) => m.category === "cbt");
    const hasKokurikuler = matches.some(
      (m) =>
        m.category === "kokurikuler" ||
        m.category === "rapat" ||
        m.category === "cuti" ||
        m.badge?.includes("Cuti Bersama")
    );
    const hasKbm = matches.some((m) => m.category === "kbm");

    if (hasHoliday) dots.push({ color: "bg-red-500", title: "Libur / Tanggal Merah" });
    if (hasCbt) dots.push({ color: "bg-blue-500", title: "Ujian CBT" });
    if (hasKokurikuler) dots.push({ color: "bg-amber-400", title: "Agenda / Cuti" });
    if (hasKbm && dots.length < 3) dots.push({ color: "bg-emerald-500", title: "KBM" });

    return dots;
  };

  return (
    <div className="space-y-4">
      {/* Header Halaman Compact Single-Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground">Kalender Akademik & Hari Besar</h1>
              <Badge variant="outline" className="text-[10px] font-semibold h-5 px-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                {currentMonthAgendas.length} Agenda
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Tombol Khusus Superadmin: Penyesuaian Kalender Hijriah Hasil Sidang Isbat */}
          {(!activeRole || activeRole.toUpperCase().includes("ADMIN")) && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 shadow-xs"
              onClick={() => setIsCalendarSettingsOpen(true)}
              title="Penyesuaian Koreksi Kalender Hijriah Hasil Sidang Isbat Kemenag RI"
            >
              <Settings2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Penyesuaian Kalender</span>
              {hijriOffsetDays !== 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[9px] rounded-full bg-amber-500 text-white font-black">
                  {hijriOffsetDays > 0 ? `+${hijriOffsetDays}` : hijriOffsetDays}H
                </span>
              )}
            </Button>
          )}

          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            onClick={() => setIsAddAgendaOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Agenda
          </Button>
        </div>
      </div>

      {/* Metric Strip Compact ~42px */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CalendarDays className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Bulan Ini</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{currentMonthAgendas.length} Agenda</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-red-500/15 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <CalendarClock className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Libur Nasional</p>
            <p className="text-sm font-bold text-red-600 dark:text-red-400 leading-tight mt-0.5">
              {currentMonthAgendas.filter((x) => x.isRedDate || x.category === "libur").length} Hari
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Ujian CBT</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
              {currentMonthAgendas.filter((x) => x.category === "cbt").length} Jadwal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Info className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">KBM & Kegiatan</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
              {currentMonthAgendas.filter((x) => x.category === "kbm" || x.category === "kokurikuler").length} Agenda
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* KOLOM KIRI: KALENDER 3-IN-1 (Lebih Ringkas & Proporsional) */}
        <Card className="xl:col-span-7 border-border shadow-xs bg-card overflow-hidden">
          {/* Header Kalender */}
          <div className="p-3 sm:p-4 flex items-center justify-between border-b border-border bg-muted/20">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full"
              onClick={goToPrevMonth}
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-center">
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {currentMonthName} {currentYear}
              </h2>
              <p className="text-xs font-medium text-muted-foreground">
                {hijriMonthRangeTitle}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs font-semibold px-2 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                onClick={goToToday}
              >
                Hari Ini
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full"
                onClick={goToNextMonth}
                title="Bulan Berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <CardContent className="p-2.5 sm:p-4">
            {/* Header Nama Hari */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-xs font-semibold mb-1.5">
              {[
                { name: "Ahad", isSunday: true, isFriday: false },
                { name: "Senin", isSunday: false, isFriday: false },
                { name: "Selasa", isSunday: false, isFriday: false },
                { name: "Rabu", isSunday: false, isFriday: false },
                { name: "Kamis", isSunday: false, isFriday: false },
                { name: "Jumat", isSunday: false, isFriday: true },
                { name: "Sabtu", isSunday: false, isFriday: false },
              ].map((dayItem) => (
                <div
                  key={dayItem.name}
                  className={`py-1 text-xs font-semibold ${dayItem.isSunday
                      ? "text-red-500 dark:text-red-400 font-bold"
                      : dayItem.isFriday
                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                        : "text-muted-foreground"
                    }`}
                >
                  {dayItem.name}
                </div>
              ))}
            </div>

            {/* Grid Sel Kalender (Compact & Angka Masehi Lebih Besar) */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {calendarDays.map((day, idx) => {
                const dots = getDayDots(day);
                const isSelected = selectedDateString === day.dateString;

                // Periksa apakah hari ini adalah Hari Libur Resmi / Tanggal Merah (BUKAN Cuti Bersama)
                const dayEvents = allAgendas.filter(
                  (item) => item.rawDate === day.dateString || item.rawDate?.startsWith(day.dateString)
                );
                const isHoliday = dayEvents.some(
                  (ev) =>
                    ev.isRedDate ||
                    ((ev.category === "libur" || ev.badge?.includes("Libur Nasional") || ev.badge?.includes("Hari Besar") || ev.badge?.includes("Libur Resmi")) &&
                      !ev.badge?.includes("Cuti Bersama") &&
                      ev.category !== "cuti")
                );
                const isRedDate = day.isSunday || isHoliday;

                // Tentukan warna angka tanggal Masehi
                let gregorianColor = "text-foreground";
                if (isRedDate) {
                  gregorianColor = "text-red-600 dark:text-red-400";
                } else if (day.isFriday) {
                  gregorianColor = "text-emerald-600 dark:text-emerald-400";
                }

                // Warna background dan border cell
                let cellStyle =
                  "border-border/60 bg-card hover:bg-muted/30 hover:border-emerald-500/40";
                if (!day.isCurrentMonth) {
                  cellStyle = "border-transparent bg-muted/10 opacity-30 pointer-events-none";
                } else if (day.isToday) {
                  cellStyle =
                    "border-2 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs";
                } else if (isSelected) {
                  cellStyle =
                    "border-2 border-emerald-600/80 bg-emerald-500/10 dark:bg-emerald-500/20";
                } else if (isHoliday) {
                  cellStyle =
                    "border-red-200/80 dark:border-red-900/50 bg-red-50/40 dark:bg-red-950/20 hover:bg-red-50/70";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!day.isCurrentMonth}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDateString("");
                      } else {
                        setSelectedDateString(day.dateString);
                      }
                    }}
                    className={`relative min-h-[50px] sm:min-h-[56px] p-1 sm:p-1.5 rounded-lg border flex flex-col justify-between text-left transition-all ${cellStyle}`}
                  >
                    {/* Baris Atas: Angka Arab Hijriah di Kiri & Angka Masehi BESAR di Kanan */}
                    <div className="flex items-start justify-between w-full">
                      <span className="text-[10px] font-semibold text-muted-foreground/80 font-mono leading-none">
                        {day.hijriArabicDay}
                      </span>
                      <span className={`text-base sm:text-lg lg:text-xl font-black leading-none ${gregorianColor}`}>
                        {day.dayNumber}
                      </span>
                    </div>

                    {/* Baris Tengah: Pasaran Jawa */}
                    <div className="text-center w-full my-auto">
                      <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground tracking-tight block leading-none">
                        {day.pasaran}
                      </span>
                    </div>

                    {/* Baris Bawah: Titik Indikator Agenda */}
                    <div className="flex items-center justify-center gap-1 min-h-[5px] w-full mt-0.5">
                      {dots.map((dot, dIdx) => (
                        <span
                          key={dIdx}
                          className={`w-1.5 h-1.5 rounded-full ${dot.color} inline-block`}
                          title={dot.title}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legenda Titik Indikator */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-3 border-t border-border text-[11px] text-muted-foreground">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-semibold text-foreground">Indikator:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Libur
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Ujian CBT
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Peringatan
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> KBM
                </span>
              </div>
              <div className="text-[10px] sm:text-xs">
                Server: <span className="font-mono font-bold text-foreground">{formattedTime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KOLOM KANAN: HARI BESAR & AGENDA KEGIATAN MADRASAH */}
        <Card className="xl:col-span-5 border-border shadow-xs bg-card flex flex-col">
          <CardHeader className="p-3.5 sm:p-4 border-b border-border space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-4 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Hari Besar & Agenda Madrasah
                </CardTitle>
              </div>

              {/* Filter Kategori */}
              <div className="flex items-center gap-1.5">
                <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <select
                  className="h-7 rounded-md border border-input bg-background px-2 text-[11px] font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="semua">Semua</option>
                  <option value="libur">🔴 Libur Nasional</option>
                  <option value="cuti">🟡 Cuti Bersama</option>
                  <option value="cbt">🔵 CBT</option>
                  <option value="kokurikuler">🟡 Peringatan</option>
                  <option value="rapat">🟣 Rapat</option>
                  <option value="kbm">🟢 KBM</option>
                </select>
              </div>
            </div>

            {selectedDateString && (
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                  Filter: <strong className="underline">{selectedDateString}</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold"
                  onClick={() => setSelectedDateString("")}
                >
                  Tampilkan Semua
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-3 sm:p-4 max-h-[500px] overflow-y-auto space-y-3">
            {displayAgendas.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground space-y-2">
                <CalendarClock className="h-7 w-7 mx-auto text-muted-foreground/60" />
                <p className="text-xs">Tidak ada agenda atau hari besar pada periode ini.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold mt-1"
                  onClick={() => setIsAddAgendaOpen(true)}
                >
                  + Tambah Agenda
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {displayAgendas.map((item) => {
                  let monthShort = "TGL";
                  let dayNum = "•";

                  if (item.rawDate) {
                    const d = new Date(item.rawDate);
                    if (!isNaN(d.getTime())) {
                      monthShort = d.toLocaleDateString("id-ID", { month: "short" });
                      dayNum = String(d.getDate());
                    }
                  }

                  const isLibur = item.category === "libur" || item.badge?.includes("Libur");

                  return (
                    <div
                      key={item.id}
                      className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-2.5"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        {/* Badge Tanggal Kotak (Sep 19) */}
                        <div className="w-11 h-11 rounded-lg border border-border/80 bg-muted/30 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                          <span className="text-[9px] font-bold uppercase text-muted-foreground leading-none">
                            {monthShort}
                          </span>
                          <span
                            className={`text-sm sm:text-base font-black leading-tight ${isLibur ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                              }`}
                          >
                            {dayNum}
                          </span>
                        </div>

                        {/* Informasi Agenda */}
                        <div className="space-y-0.5 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug truncate">
                            {item.title}
                          </h4>

                          {/* Format Tanggal Ganda: Masehi / Hijriah */}
                          <p className="text-[11px] text-muted-foreground font-medium flex flex-wrap items-center gap-1">
                            <span>{item.date || item.rawDate}</span>
                            {item.hijriDateStr && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                  {item.hijriDateStr}
                                </span>
                              </>
                            )}
                          </p>

                          <div className="flex items-center gap-1.5 pt-0.5">
                            <Badge
                              variant="secondary"
                              className={`text-[9px] px-1 py-0 font-semibold border-none ${isLibur
                                  ? "bg-red-500/15 text-red-600 dark:text-red-400"
                                  : item.category === "cbt"
                                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                }`}
                            >
                              {item.badge}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Tombol Aksi Kanan */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-full"
                          onClick={() => setActiveInfoAgenda(item)}
                          title="Detail Informasi"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </Button>

                        {item.isSchoolAgenda && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => handleDeleteAgenda(item.id)}
                            title="Hapus Agenda"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Detail Informasi Agenda & Hari Libur Nasional */}
      <DetailAgendaDialog
        agenda={activeInfoAgenda}
        isOpen={Boolean(activeInfoAgenda)}
        onOpenChange={(open) => {
          if (!open) setActiveInfoAgenda(null);
        }}
      />

      {/* Dialog Tambah Agenda & Tanggal Merah Baru ke Database MySQL */}
      <AddAgendaDialog
        isOpen={isAddAgendaOpen}
        onOpenChange={setIsAddAgendaOpen}
        onAddAgenda={handleAddAgenda}
      />

      {/* Dialog Khusus Superadmin: Penyesuaian Koreksi Kalender Hijriah Hasil Sidang Isbat */}
      <CalendarSettingsDialog
        isOpen={isCalendarSettingsOpen}
        onOpenChange={setIsCalendarSettingsOpen}
        currentHijriOffset={hijriOffsetDays}
        onSaveHijriOffset={handleSaveHijriOffset}
      />
    </div>
  );
}
