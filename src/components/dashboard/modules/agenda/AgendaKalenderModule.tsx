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
} from "lucide-react";
import { toast } from "sonner";
import { useRealtimeCalendar, type CalendarDayCell } from "@/hooks/useRealtimeCalendar";
import { MysqlDataService } from "@/services/mysqlDataService";
import { AddAgendaDialog } from "./components/AddAgendaDialog";
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
}

// Daftar Hari Besar Nasional, Peringatan Islam, & Kalender Khusus Kemenag/Madrasah 2026-2027
const NATIONAL_ISLAMIC_HOLIDAYS: AgendaItem[] = [
  // 2026
  {
    id: "nat-1",
    title: "Tahun Baru Masehi 2026",
    category: "libur",
    date: "01 Januari 2026",
    rawDate: "2026-01-01",
    desc: "Libur Nasional Tahun Baru Masehi.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-2",
    title: "Hari Amal Bhakti (HAB) Kemenag RI ke-80",
    category: "libur",
    date: "03 Januari 2026",
    rawDate: "2026-01-03",
    desc: "Upacara Peringatan Hari Amal Bhakti Kementerian Agama Republik Indonesia.",
    badge: "🔴 Hari Besar Kemenag",
  },
  {
    id: "nat-3",
    title: "Isra Mi'raj Nabi Muhammad SAW 1447 H",
    category: "libur",
    date: "16 Januari 2026",
    rawDate: "2026-01-16",
    desc: "Peringatan Isra Mi'raj Nabi Muhammad SAW & Libur Resmi Keagamaan.",
    badge: "🔴 Hari Besar Islam",
  },
  {
    id: "nat-4",
    title: "Hari Raya Idul Fitri 1447 H",
    category: "libur",
    date: "20 Maret 2026",
    rawDate: "2026-03-20",
    desc: "Hari Raya Idul Fitri 1 Syawal 1447 H dan Libur Bersama Kemenag.",
    badge: "🔴 Hari Besar Islam",
  },
  {
    id: "nat-5",
    title: "Hari Buruh Internasional",
    category: "libur",
    date: "01 Mei 2026",
    rawDate: "2026-05-01",
    desc: "Libur Resmi Hari Buruh Internasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-6",
    title: "Hari Raya Idul Adha 1447 H",
    category: "libur",
    date: "27 Mei 2026",
    rawDate: "2026-05-27",
    desc: "Penyembelihan Hewan Kurban & Sholat Idul Adha 10 Dzulhijjah.",
    badge: "🔴 Hari Besar Islam",
  },
  {
    id: "nat-7",
    title: "Hari Lahir Pancasila",
    category: "libur",
    date: "01 Juni 2026",
    rawDate: "2026-06-01",
    desc: "Upacara Peringatan Hari Lahir Pancasila.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-8",
    title: "Tahun Baru Islam (1 Muharram 1448 H)",
    category: "libur",
    date: "16 Juni 2026",
    rawDate: "2026-06-16",
    desc: "Pawai Ta'aruf & Doa Bersama Tahun Baru Hijriah di Madrasah.",
    badge: "🔴 Hari Besar Islam",
  },
  {
    id: "nat-9",
    title: "Hari Kemerdekaan Republik Indonesia (HUT RI ke-81)",
    category: "libur",
    date: "17 Agustus 2026",
    rawDate: "2026-08-17",
    desc: "Upacara Bendera Peringatan Kemerdekaan RI di MTsN 2 Cilacap & Libur Resmi Nasional.",
    badge: "🔴 Libur Nasional",
  },
  {
    id: "nat-10",
    title: "Maulid Nabi Muhammad SAW (12 Rabiul Awal 1448 H)",
    category: "libur",
    date: "25 Agustus 2026",
    rawDate: "2026-08-25",
    desc: "Peringatan Maulid Nabi Muhammad SAW di Masjid/Aula Madrasah.",
    badge: "🔴 Hari Besar Islam",
  },
  {
    id: "nat-11",
    title: "Hari Lahir Lembaga Pendidikan Ma'arif NU",
    category: "kokurikuler",
    date: "19 September 2026",
    rawDate: "2026-09-19",
    desc: "Peringatan Hari Lahir Lembaga Pendidikan Ma'arif NU & Apel Penguatan Karakter Aswaja Siswa.",
    badge: "🟡 Hari Peringatan Keagamaan",
  },
  {
    id: "nat-12",
    title: "Hari Lahir Sarikat Buruh Muslimin Indonesia (Sarbumusi) NU",
    category: "kokurikuler",
    date: "27 September 2026",
    rawDate: "2026-09-27",
    desc: "Peringatan Harlah Sarbumusi NU.",
    badge: "🟡 Hari Peringatan",
  },
  {
    id: "nat-13",
    title: "Hari Santri Nasional (HSN 2026)",
    category: "kokurikuler",
    date: "22 Oktober 2026",
    rawDate: "2026-10-22",
    desc: "Apel Akbar Hari Santri Nasional memakai sarung & baju koko, serta istighotsah bersama.",
    badge: "🟡 Hari Besar Santri",
  },
  {
    id: "nat-14",
    title: "Hari Guru Nasional (HGN) & HUT PGRI",
    category: "kokurikuler",
    date: "25 November 2026",
    rawDate: "2026-11-25",
    desc: "Upacara Penghormatan Guru & Tenaga Kependidikan MTsN 2 Cilacap.",
    badge: "🟡 Hari Peringatan",
  },
  {
    id: "nat-15",
    title: "Hari Amal Bhakti (HAB) Kemenag RI ke-81",
    category: "libur",
    date: "03 Januari 2027",
    rawDate: "2027-01-03",
    desc: "Peringatan Hari Amal Bhakti Kementerian Agama Republik Indonesia.",
    badge: "🔴 Hari Besar Kemenag",
  },
];

export function AgendaKalenderModule({ activeRole }: { activeRole?: string }) {
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
  } = useRealtimeCalendar();

  const [filterCategory, setFilterCategory] = useState<string>("semua");
  const [selectedDateString, setSelectedDateString] = useState<string>("");
  const [isAddAgendaOpen, setIsAddAgendaOpen] = useState<boolean>(false);
  const [schoolAgendas, setSchoolAgendas] = useState<AgendaItem[]>([]);
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(true);
  const [activeInfoAgenda, setActiveInfoAgenda] = useState<AgendaItem | null>(null);

  // Muat data riil dari basis data MySQL tabel agendas
  const fetchAgendas = async () => {
    try {
      const dbAgendas = await MysqlDataService.getAgendas();
      if (dbAgendas) {
        const mapped: AgendaItem[] = dbAgendas.map((item) => {
          const cat = item.category || "kbm";
          const badge =
            cat === "cbt"
              ? "🔴 Ujian CBT"
              : cat === "rapat"
              ? "🟣 Rapat Dinas"
              : cat === "kokurikuler"
              ? "🟡 Kokurikuler P5"
              : cat === "libur"
              ? "🔴 Libur Resmi"
              : "🔵 KBM Efektif";

          // Coba cari tanggal ISO dari date_str jika tersimpan format tertentu
          let rawDate = item.date_str || "";
          let hijriStr = "";
          const parsedDate = new Date(rawDate);
          if (!isNaN(parsedDate.getTime())) {
            const h = getHijriDate(parsedDate);
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
  }, []);

  // Gabungkan agenda database MySQL dengan referensi kalender resmi Kemenag
  const allAgendas: AgendaItem[] = useMemo(() => {
    // Tambahkan kalkulasi tanggal Hijriah otomatis jika belum ada
    const hydratedNational = NATIONAL_ISLAMIC_HOLIDAYS.map((item) => {
      if (!item.hijriDateStr && item.rawDate) {
        const d = new Date(item.rawDate);
        if (!isNaN(d.getTime())) {
          const h = getHijriDate(d);
          return {
            ...item,
            hijriDateStr: `${h.day} ${h.monthName} ${h.year} H`,
          };
        }
      }
      return item;
    });

    return [...schoolAgendas, ...hydratedNational];
  }, [schoolAgendas]);

  const calendarDays = getCalendarDays();

  const handleAddAgenda = async (data: {
    title: string;
    category: string;
    selectedDate: string;
    desc: string;
  }) => {
    const dateObj = new Date(data.selectedDate);
    const dateFormatted = dateObj.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    try {
      await MysqlDataService.saveAgenda({
        title: data.title,
        description: data.desc,
        category: data.category,
        date_str: data.selectedDate, // Simpan format ISO YYYY-MM-DD
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
      (m) => m.category === "libur" || m.badge?.includes("Libur")
    );
    const hasCbt = matches.some((m) => m.category === "cbt");
    const hasKokurikuler = matches.some(
      (m) => m.category === "kokurikuler" || m.category === "rapat"
    );
    const hasKbm = matches.some((m) => m.category === "kbm");

    if (hasHoliday) dots.push({ color: "bg-red-500", title: "Libur" });
    if (hasCbt) dots.push({ color: "bg-blue-500", title: "Ujian CBT" });
    if (hasKokurikuler) dots.push({ color: "bg-amber-400", title: "Kegiatan / Rapat" });
    if (hasKbm && dots.length < 3) dots.push({ color: "bg-emerald-500", title: "KBM" });

    return dots;
  };

  return (
    <>
      {/* Header Halaman */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <CalendarDays className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Kalender Akademik & Hari Besar
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sistem penanggalan terpadu Masehi, Hijriah (Kemenag), dan Pasaran Jawa MTsN 2 Cilacap.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            onClick={() => setIsAddAgendaOpen(true)}
          >
            <Plus className="h-4 w-4" /> Tambah Agenda Baru
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* KARTU UTAMA KALENDER (Desain 3-in-1 Masehi + Hijriah + Pasaran Jawa) */}
        <Card className="border-border shadow-xs bg-card overflow-hidden">
          {/* Header Kalender */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-border bg-muted/20">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full"
              onClick={goToPrevMonth}
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="text-center">
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {currentMonthName} {currentYear}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
                {hijriMonthRangeTitle}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex h-8 text-xs font-semibold px-2.5 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                onClick={goToToday}
              >
                Hari Ini
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-full"
                onClick={goToNextMonth}
                title="Bulan Berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <CardContent className="p-3 sm:p-5">
            {/* Header Nama Hari: Ahad, Senin, Selasa, Rabu, Kamis, Jumat, Sabtu */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold mb-2">
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
                  className={`py-2 text-xs font-semibold ${
                    dayItem.isSunday
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

            {/* Grid Sel Kalender */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {calendarDays.map((day, idx) => {
                const dots = getDayDots(day);
                const isSelected = selectedDateString === day.dateString;

                // Tentukan warna angka tanggal Masehi
                let gregorianColor = "text-foreground";
                if (day.isSunday) {
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
                    className={`relative min-h-[72px] sm:min-h-[82px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between text-left transition-all ${cellStyle}`}
                  >
                    {/* Baris Atas: Angka Hijriah (Arab) & Angka Masehi */}
                    <div className="flex items-start justify-between w-full">
                      <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground/80 font-mono">
                        {day.hijriArabicDay}
                      </span>
                      <span className={`text-sm sm:text-base font-bold ${gregorianColor}`}>
                        {day.dayNumber}
                      </span>
                    </div>

                    {/* Baris Tengah: Pasaran Jawa (Pancawara) */}
                    <div className="text-center w-full my-auto">
                      <span className="text-[9px] sm:text-[11px] font-medium text-muted-foreground tracking-tight block">
                        {day.pasaran}
                      </span>
                    </div>

                    {/* Baris Bawah: Dot Indikator Kegiatan / Agenda */}
                    <div className="flex items-center justify-center gap-1 min-h-[7px] w-full mt-0.5">
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

            {/* Info Legenda Titik Indikator */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-3 border-t border-border text-[11px] text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-foreground">Indikator Kegiatan:</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Libur Resmi
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Ujian CBT
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Peringatan / Agenda
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> KBM Efektif
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>Waktu Server: <span className="font-mono font-bold text-foreground">{formattedTime}</span></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION BAWAH: HARI BESAR & AGENDA KEGIATAN MADRASAH */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 sm:p-5 border-b border-border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div
                className="flex items-center gap-2.5 cursor-pointer select-none"
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              >
                <span className="w-1.5 h-5 rounded-full bg-emerald-600 dark:bg-emerald-500" />
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  Hari Besar & Libur Nasional / Agenda Madrasah
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                  {isAccordionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>

              {/* Filter & Reset Pilihan Tanggal */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedDateString && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-semibold gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                    onClick={() => setSelectedDateString("")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Tampilkan Semua Bulan Ini
                  </Button>
                )}

                <div className="flex items-center gap-1.5 ml-auto">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <select
                    className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="semua">Semua Kategori</option>
                    <option value="libur">🔴 Libur Resmi</option>
                    <option value="cbt">🔵 Ujian CBT</option>
                    <option value="kokurikuler">🟡 Peringatan & Kokurikuler</option>
                    <option value="rapat">🟣 Rapat Dinas</option>
                    <option value="kbm">🟢 KBM Efektif</option>
                  </select>
                </div>
              </div>
            </div>

            {selectedDateString && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                Menampilkan agenda khusus pada tanggal: <span className="font-bold underline">{selectedDateString}</span>
              </p>
            )}
          </CardHeader>

          {isAccordionOpen && (
            <CardContent className="p-4 sm:p-5">
              {displayAgendas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground space-y-2">
                  <CalendarClock className="h-8 w-8 mx-auto text-muted-foreground/60" />
                  <p className="text-xs sm:text-sm">Tidak ada agenda atau hari besar pada periode ini.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-bold mt-2"
                    onClick={() => setIsAddAgendaOpen(true)}
                  >
                    + Tambah Agenda untuk Tanggal Ini
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {displayAgendas.map((item) => {
                    // Ekstrak bulan dan tanggal untuk badge kotak (seperti pada screenshot: Sep 19)
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
                        className="py-4 first:pt-0 last:pb-0 flex items-start justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Badge Tanggal Kotak (Sep 19) */}
                          <div className="w-12 h-13 sm:w-14 sm:h-14 rounded-xl border border-border/80 bg-muted/30 flex flex-col items-center justify-center shrink-0 shadow-2xs">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                              {monthShort}
                            </span>
                            <span
                              className={`text-base sm:text-lg font-black leading-tight ${
                                isLibur ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              {dayNum}
                            </span>
                          </div>

                          {/* Informasi Agenda */}
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                                {item.title}
                              </h3>
                              <Badge
                                variant="secondary"
                                className={`text-[10px] px-1.5 py-0 font-bold border-none ${
                                  isLibur
                                    ? "bg-red-500/15 text-red-600 dark:text-red-400"
                                    : item.category === "cbt"
                                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                                }`}
                              >
                                {item.badge}
                              </Badge>
                            </div>

                            {/* Format Tanggal Ganda: Masehi / Hijriah */}
                            <p className="text-xs text-muted-foreground font-medium flex flex-wrap items-center gap-1.5">
                              <span>{item.date || item.rawDate}</span>
                              {item.hijriDateStr && (
                                <>
                                  <span className="text-border">•</span>
                                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                                    {item.hijriDateStr}
                                  </span>
                                </>
                              )}
                            </p>

                            {item.desc && (
                              <p className="text-xs text-muted-foreground/90 mt-1 leading-relaxed max-w-2xl">
                                {item.desc}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Tombol Aksi Kanan */}
                        <div className="flex items-center gap-1 shrink-0">
                          {item.desc && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => setActiveInfoAgenda(item)}
                              title="Lihat Detail Informasi"
                            >
                              <Info className="h-4 w-4" />
                            </Button>
                          )}

                          {item.isSchoolAgenda && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDeleteAgenda(item.id)}
                              title="Hapus Agenda"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>

      {/* Dialog Tambah Agenda Baru ke Database MySQL */}
      <AddAgendaDialog
        isOpen={isAddAgendaOpen}
        onOpenChange={setIsAddAgendaOpen}
        onAddAgenda={handleAddAgenda}
      />
    </>
  );
}
