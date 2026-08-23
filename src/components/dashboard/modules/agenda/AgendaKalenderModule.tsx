import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CalendarClock, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRealtimeCalendar } from "@/hooks/useRealtimeCalendar";
import { MysqlDataService } from "@/services/mysqlDataService";
import { AddAgendaDialog } from "./components/AddAgendaDialog";

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

  const [agendaList, setAgendaList] = useState([
    { id: "1", title: "CBT Ujian Tengah Semester (PTS) Ganjil", category: "cbt", date: "15 Agustus 2026", rawDate: "2026-08-15", desc: "Evaluasi Komputer Pertemuan 1-9 untuk seluruh rombel.", badge: "🔴 Ujian CBT" },
    { id: "2", title: "Rapat Pleno Evaluasi KBM & Kurikulum", category: "rapat", date: "18 Agustus 2026", rawDate: "2026-08-18", desc: "Rapat koordinasi Kepala Madrasah, Waka, dan Guru Pengampu.", badge: "🟣 Rapat Dinas" },
    { id: "3", title: "Gelar Karya Projek Kokurikuler P5 (Batik Cilacap)", category: "kokurikuler", date: "25 Agustus 2026", rawDate: "2026-08-25", desc: "Pameran karya seni batik dan produk wirausaha siswa.", badge: "🟡 Kokurikuler P5" },
    { id: "4", title: "Hari Libur Nasional & Peringatan HUT RI", category: "libur", date: "17 Agustus 2026", rawDate: "2026-08-17", desc: "Upacara bendera & Kegiatan peringatan kemerdekaan.", badge: "🟢 Libur Resmi" },
    { id: "5", title: "Bimbingan Sertifikasi Tahfidz Juz 30", category: "kbm", date: "01 September 2026", rawDate: "2026-09-01", desc: "Murojaah massal & ujian kelayakan tajwid siswa.", badge: "🔵 KBM Efektif" },
  ]);

  useEffect(() => {
    MysqlDataService.getAgendas().then((dbAgendas) => {
      if (dbAgendas && dbAgendas.length > 0) {
        const mapped = dbAgendas.map((item) => {
          const cat = item.category || "kbm";
          const badge = cat === "cbt" ? "🔴 Ujian CBT" : cat === "rapat" ? "🟣 Rapat Dinas" : cat === "kokurikuler" ? "🟡 Kokurikuler P5" : cat === "libur" ? "🟢 Libur Resmi" : "🔵 KBM Efektif";
          return {
            id: String(item.id || Date.now()),
            title: item.title,
            category: cat,
            date: item.date_str,
            rawDate: item.date_str,
            desc: item.description || "",
            badge,
          };
        });
        setAgendaList(mapped);
      }
    });
  }, []);

  const calendarDays = getCalendarDays();

  const handleAddAgenda = (data: { title: string; category: string; selectedDate: string; desc: string }) => {
    const dateObj = new Date(data.selectedDate);
    const dateFormatted = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const badge = data.category === "cbt" ? "🔴 Ujian CBT" : data.category === "rapat" ? "🟣 Rapat Dinas" : data.category === "kokurikuler" ? "🟡 Kokurikuler P5" : data.category === "libur" ? "🟢 Libur Resmi" : "🔵 KBM Efektif";

    const newEntry = {
      id: String(Date.now()),
      title: data.title,
      category: data.category,
      date: dateFormatted,
      rawDate: data.selectedDate,
      desc: data.desc,
      badge,
    };

    MysqlDataService.saveAgenda({
      title: data.title,
      description: data.desc,
      category: data.category,
      date_str: dateFormatted,
    }).catch((err) => console.warn("saveAgenda DB failed:", err));

    setAgendaList([newEntry, ...agendaList]);
    toast.success("Agenda kegiatan madrasah berhasil ditambahkan!");
  };

  const handleDeleteAgenda = (id: string) => {
    if (Number(id)) {
      MysqlDataService.deleteAgenda(Number(id)).catch((err) => console.warn("deleteAgenda DB failed:", err));
    }
    setAgendaList(agendaList.filter((a) => a.id !== id));
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
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-muted-foreground mb-2">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
                <div key={d} className="py-1.5">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`min-h-[70px] p-1.5 rounded-lg border text-left transition flex flex-col justify-between ${
                    day.isCurrentMonth
                      ? day.isToday
                        ? "bg-primary/10 border-primary font-bold shadow-xs"
                        : "bg-background border-border hover:border-primary/40"
                      : "bg-muted/30 border-transparent opacity-40"
                  }`}
                >
                  <span className={`text-xs ${day.isToday ? "text-primary font-extrabold" : "text-foreground"}`}>
                    {day.dayNumber}
                  </span>

                  {day.isCurrentMonth && idx % 6 === 0 && (
                    <Badge className="text-[9px] px-1 py-0 bg-red-500/15 text-red-600 dark:text-red-400 border-none font-semibold truncate">
                      PTS CBT
                    </Badge>
                  )}
                  {day.isCurrentMonth && idx % 9 === 0 && (
                    <Badge className="text-[9px] px-1 py-0 bg-purple-500/15 text-purple-600 dark:text-purple-400 border-none font-semibold truncate">
                      Rapat Dinas
                    </Badge>
                  )}
                </div>
              ))}
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
              {filteredAgenda.map((ag) => (
                <div key={ag.id} className="p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-foreground leading-snug">{ag.title}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0" onClick={() => handleDeleteAgenda(ag.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold">
                      {ag.badge}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">{ag.date}</span>
                  </div>
                  {ag.desc && <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{ag.desc}</p>}
                </div>
              ))}
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
