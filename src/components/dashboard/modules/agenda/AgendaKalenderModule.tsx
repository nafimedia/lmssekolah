import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CalendarClock, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeCalendar } from "@/hooks/useRealtimeCalendar";
import { MysqlDataService } from "@/services/mysqlDataService";
import { AddAgendaDialog } from "./components/AddAgendaDialog";

const NATIONAL_ISLAMIC_HOLIDAYS = [
  { id: "nat-1", title: "Hari Kemerdekaan Republik Indonesia (HUT RI)", category: "libur", date: "17 Agustus 2026", rawDate: "2026-08-17", desc: "Upacara Bendera Peringatan Kemerdekaan RI & Libur Resmi Nasional.", badge: "🔴 Libur Nasional" },
  { id: "nat-2", title: "Hari Santri Nasional (HSN)", category: "libur", date: "22 Oktober 2026", rawDate: "2026-10-22", desc: "Apel Hari Santri & Kegiatan Keagamaan Madrasah.", badge: "🔴 Hari Besar Islam" },
  { id: "nat-3", title: "Hari Guru Nasional (HGN)", category: "libur", date: "25 November 2026", rawDate: "2026-11-25", desc: "Penghargaan Guru & Tenaga Kependidikan Madrasah.", badge: "🔴 Hari Peringatan" },
  { id: "nat-4", title: "Hari Amal Bhakti (HAB) Kemenag RI", category: "libur", date: "03 Januari 2027", rawDate: "2027-01-03", desc: "Upacara Peringatan HAB Kementerian Agama Republik Indonesia.", badge: "🔴 Hari Besar Kemenag" },
  { id: "nat-5", title: "Tahun Baru Islam (1 Muharram 1448 H)", category: "libur", date: "16 Juni 2026", rawDate: "2026-06-16", desc: "Pawai Ta'aruf & Doa Bersama Tahun Baru Hijriah.", badge: "🔴 Hari Besar Islam" },
  { id: "nat-6", title: "Maulid Nabi Muhammad SAW (12 Rabiul Awal)", category: "libur", date: "25 Agustus 2026", rawDate: "2026-08-25", desc: "Peringatan Maulid Nabi Muhammad SAW.", badge: "🔴 Hari Besar Islam" },
  { id: "nat-7", title: "Isra Mi'raj Nabi Muhammad SAW (27 Rajab)", category: "libur", date: "05 Februari 2027", rawDate: "2027-02-05", desc: "Pengajian & Peringatan Isra Mi'raj Nabi Muhammad SAW.", badge: "🔴 Hari Besar Islam" },
  { id: "nat-8", title: "Hari Raya Idul Fitri 1448 H", category: "libur", date: "20 Maret 2027", rawDate: "2027-03-20", desc: "Hari Raya Idul Fitri & Libur Resmi Kemenag.", badge: "🔴 Hari Besar Islam" },
  { id: "nat-9", title: "Hari Raya Idul Adha 1448 H", category: "libur", date: "27 Mei 2027", rawDate: "2027-03-27", desc: "Penyembelihan Hewan Kurban & Sholat Idul Adha.", badge: "🔴 Hari Besar Islam" },
  { id: "nat-10", title: "Tahun Baru Masehi 2027", category: "libur", date: "01 Januari 2027", rawDate: "2027-01-01", desc: "Libur Nasional Tahun Baru Masehi.", badge: "🔴 Libur Nasional" },
  { id: "nat-11", title: "Hari Lahir Pancasila", category: "libur", date: "01 Juni 2026", rawDate: "2026-06-01", desc: "Upacara Peringatan Hari Lahir Pancasila.", badge: "🔴 Libur Nasional" },
  { id: "nat-12", title: "Hari Buruh Internasional", category: "libur", date: "01 Mei 2026", rawDate: "2026-05-01", desc: "Libur Nasional Hari Buruh.", badge: "🔴 Libur Nasional" },
];

export function AgendaKalenderModule({ activeRole }: { activeRole?: string }) {
  const {
    currentMonthName,
    currentYear,
    formattedTime,
    currentDayName,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    getCalendarDays,
  } = useRealtimeCalendar();

  const [filterCategory, setFilterCategory] = useState("semua");
  const [isAddAgendaOpen, setIsAddAgendaOpen] = useState(false);
  const [schoolAgendas, setSchoolAgendas] = useState<any[]>([]);

  useEffect(() => {
    MysqlDataService.getAgendas().then((dbAgendas) => {
      if (dbAgendas) {
        const mapped = dbAgendas.map((item) => {
          const cat = item.category || "kbm";
          const badge = cat === "cbt" ? "🔴 Ujian CBT" : cat === "rapat" ? "🟣 Rapat Dinas" : cat === "kokurikuler" ? "🟡 Kokurikuler P5" : cat === "libur" ? "🔴 Libur Resmi" : "🔵 KBM Efektif";
          return {
            id: String(item.id || Date.now()),
            title: item.title,
            category: cat,
            date: item.date_str,
            rawDate: item.date_str,
            desc: item.description || "",
            badge,
            isSchoolAgenda: true,
          };
        });
        setSchoolAgendas(mapped);
      }
    });
  }, []);

  const agendaList = [...schoolAgendas, ...NATIONAL_ISLAMIC_HOLIDAYS];

  const calendarDays = getCalendarDays();

  const handleAddAgenda = (data: { title: string; category: string; selectedDate: string; desc: string }) => {
    const dateObj = new Date(data.selectedDate);
    const dateFormatted = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const badge = data.category === "cbt" ? "🔴 Ujian CBT" : data.category === "rapat" ? "🟣 Rapat Dinas" : data.category === "kokurikuler" ? "🟡 Kokurikuler P5" : data.category === "libur" ? "🔴 Libur Resmi" : "🔵 KBM Efektif";

    const newEntry = {
      id: String(Date.now()),
      title: data.title,
      category: data.category,
      date: dateFormatted,
      rawDate: data.selectedDate,
      desc: data.desc,
      badge,
      isSchoolAgenda: true,
    };

    MysqlDataService.saveAgenda({
      title: data.title,
      description: data.desc,
      category: data.category,
      date_str: dateFormatted,
    }).catch((err) => console.warn("saveAgenda DB failed:", err));

    setSchoolAgendas([newEntry, ...schoolAgendas]);
    toast.success("Agenda kegiatan madrasah berhasil ditambahkan!");
  };

  const handleDeleteAgenda = (id: string) => {
    if (Number(id)) {
      MysqlDataService.deleteAgenda(Number(id)).catch((err) => console.warn("deleteAgenda DB failed:", err));
    }
    setSchoolAgendas(schoolAgendas.filter((a) => a.id !== id));
    toast.success("Agenda kegiatan berhasil dihapus!");
  };

  const filteredAgenda = agendaList.filter((item) => filterCategory === "semua" || item.category === filterCategory);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agenda & Kalender Akademik Resmi</h1>
          <p className="text-sm text-muted-foreground mt-1">Jadwal kegiatan akademik, ujian, dan kalender kegiatan madrasah.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsAddAgendaOpen(true)}>
            <Plus className="h-4 w-4" /> Tambah Agenda Baru
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border shadow-xs bg-card">
          <CardHeader className="bg-muted/40 border-b border-border p-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> {currentMonthName} {currentYear}
              </CardTitle>
              <CardDescription className="text-xs">
                Hari ini: {currentDayName}, Waktu Server: {formattedTime}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToPrevMonth} title="Bulan Sebelumnya">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" className="h-8 text-xs font-semibold px-2.5" onClick={goToToday}>
                Hari Ini
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={goToNextMonth} title="Bulan Berikutnya">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs mb-2">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d, idx) => (
                <div key={d} className={`py-1.5 ${idx === 0 ? "text-red-600 dark:text-red-400 font-black" : "text-muted-foreground"}`}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                const dayEvents = agendaList.filter(
                  (ag) => day.isCurrentMonth && (ag.rawDate === day.dateString || ag.rawDate?.startsWith(day.dateString))
                );

                const hasLiburEvent = dayEvents.some((ev) => ev.category === "libur" || ev.badge?.includes("Libur"));
                const isRedHoliday = day.isCurrentMonth && (day.isSunday || hasLiburEvent);

                return (
                  <div
                    key={idx}
                    className={`min-h-[70px] p-1.5 rounded-lg border text-left transition flex flex-col justify-between ${
                      day.isCurrentMonth
                        ? day.isToday
                          ? "bg-emerald-500/20 border-2 border-emerald-600 font-bold shadow-xs"
                          : isRedHoliday
                          ? "bg-red-500/10 border-red-500/30 dark:bg-red-950/40 dark:border-red-900/50"
                          : "bg-background border-border hover:border-primary/40"
                        : "bg-muted/30 border-transparent opacity-40"
                    }`}
                  >
                    <span className={`text-xs ${
                      day.isToday
                        ? "text-emerald-700 dark:text-emerald-300 font-black"
                        : isRedHoliday
                        ? "text-red-600 dark:text-red-400 font-bold"
                        : "text-foreground font-medium"
                    }`}>
                      {day.dayNumber}
                    </span>

                    <div className="space-y-1 mt-1 overflow-hidden">
                      {day.isCurrentMonth && day.isSunday && dayEvents.length === 0 && (
                        <Badge className="text-[9px] px-1 py-0 border-none font-bold bg-red-500/20 text-red-600 dark:text-red-400 truncate w-full block">
                          🔴 Libur Minggu
                        </Badge>
                      )}
                      {dayEvents.map((ev) => (
                        <Badge
                          key={ev.id}
                          className={`text-[9px] px-1 py-0 border-none font-bold truncate w-full block ${
                            ev.category === "libur" || ev.badge?.includes("Libur")
                              ? "bg-red-600 text-white shadow-2xs"
                              : ev.category === "cbt"
                              ? "bg-red-500/15 text-red-600 dark:text-red-400"
                              : ev.category === "rapat"
                              ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                              : ev.category === "kokurikuler"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          }`}
                          title={ev.title}
                        >
                          {ev.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" /> Daftar Agenda Kegiatan
                </CardTitle>
                <select
                  className="h-7 rounded border border-input bg-background px-2 text-[11px] font-semibold"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="semua">Semua Kategori</option>
                  <option value="cbt">Ujian CBT</option>
                  <option value="rapat">Rapat Dinas</option>
                  <option value="kokurikuler">Kokurikuler P5</option>
                  <option value="libur">Libur Resmi</option>
                  <option value="kbm">KBM Efektif</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2.5 max-h-[500px] overflow-y-auto">
              {filteredAgenda.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Belum ada agenda kegiatan dalam kategori ini.
                </div>
              ) : (
                filteredAgenda.map((ag) => (
                  <div key={ag.id} className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-foreground leading-snug">{ag.title}</span>
                      {ag.isSchoolAgenda && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => handleDeleteAgenda(ag.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold">
                        {ag.badge}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">{ag.date}</span>
                    </div>
                    {ag.desc && <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{ag.desc}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddAgendaDialog
        isOpen={isAddAgendaOpen}
        onOpenChange={setIsAddAgendaOpen}
        onAddAgenda={handleAddAgenda}
      />
    </>
  );
}
