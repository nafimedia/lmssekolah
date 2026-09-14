import { useState, useEffect, useMemo } from "react";
import {
  CalendarCheck,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  MessageSquare,
  ArrowUpDown,
  BookOpen,
  Users,
  Inbox,
  UserCheck,
  ShieldCheck,
} from "lucide-react";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MysqlDataService } from "@/services/mysqlDataService";
import { normalizeRombelName, isSameClass, resolveWaliKelasRombel } from "@/utils/classNormalization";
import { exportToExcelXml } from "@/utils/excelExporter";
import { toast } from "sonner";

export interface AttendanceStudentRow {
  id: string;
  nisn: string;
  name: string;
  class: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  pct: number;
  parentWa: string;
  status: string;
  today: string;
  sessionStatus: string;
  note: string;
}

import { MysqlAuthService } from "@/services/mysqlAuthService";

export function KehadiranModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any } = {}) {
  const me = MysqlAuthService.getActiveUser();
  const initialClass = useMemo(() => {
    return resolveWaliKelasRombel(me || userProfile, null, "kelas");
  }, [userProfile, me]);

  const [selectedRombelFilter, setSelectedRombelFilter] = useState(initialClass);

  useEffect(() => {
    if (initialClass) {
      setSelectedRombelFilter(initialClass);
    }
  }, [initialClass]);

  const [searchQuery, setSearchQuery] = useState("");
  const [isWaLogModalOpen, setIsWaLogModalOpen] = useState(false);
  const [waLogMessage, setWaLogMessage] = useState("");
  const [selectedStudentForWa, setSelectedStudentForWa] = useState<AttendanceStudentRow | null>(null);

  const [dailyStudents, setDailyStudents] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceStudentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDaily, setIsSavingDaily] = useState(false);
  const [activeTab, setActiveTab] = useState<"harian_wali" | "rekap_rekomendasi">("harian_wali");

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      MysqlDataService.getUsers(),
      MysqlDataService.getDailyPresensiRombel(selectedRombelFilter, todayStr),
      MysqlDataService.getKbmPresensi(selectedRombelFilter, "ALL", todayStr),
      MysqlDataService.getAttendances().catch(() => []),
    ])
      .then(([users, dailyRows, kbmRows, allAttendances]) => {
        if (!isMounted) return;
        const siswaList = (users || []).filter((u: any) => u.role === "siswa");
        const matched = siswaList.filter((u: any) =>
          selectedRombelFilter === "Semua Rombel" ? true : isSameClass(u.class_name || u.class, selectedRombelFilter)
        );

        if (matched.length > 0) {
          const list = matched.map((s: any, idx: number) => {
            const nis = s.nis_nip || s.nis || "-";
            const sName = s.full_name || s.name;
            const studentClass = normalizeRombelName(s.class_name || s.class);

            const savedDaily = dailyRows?.find(
              (d: any) => d.student_nis === nis || d.student_name?.toLowerCase() === sName.toLowerCase()
            );

            const kbmMatch = kbmRows?.find(
              (k: any) => k.student_nis === nis || k.student_name?.toLowerCase() === sName.toLowerCase()
            );

            const isRecordedToday = !!(savedDaily || kbmMatch);
            const status = savedDaily?.status || kbmMatch?.status || "HADIR";
            const notes = savedDaily?.notes || kbmMatch?.notes || "";

            return {
              id: s.id || `ds_${idx}`,
              nisn: nis,
              name: sName,
              class: studentClass,
              status: status,
              isRecordedToday: isRecordedToday,
              notes: notes,
              parentWa: s.phone || "-",
            };
          });

          setDailyStudents(list);

          const formatted: AttendanceStudentRow[] = list.map((s) => {
            const isRecorded = s.isRecordedToday;

            // Cumulative semester attendance from database table attendances
            const studentHistory = (allAttendances || []).filter((a: any) =>
              (a.student_name && a.student_name.toLowerCase() === s.name.toLowerCase()) ||
              (a.user_id && a.user_id === s.nisn) ||
              (a.student_id && a.student_id === s.id)
            );

            let totalHadir = studentHistory.filter((a: any) => (a.status || "").toUpperCase() === "HADIR").length;
            let totalIzin = studentHistory.filter((a: any) => (a.status || "").toUpperCase() === "IZIN").length;
            let totalSakit = studentHistory.filter((a: any) => (a.status || "").toUpperCase() === "SAKIT").length;
            let totalAlpa = studentHistory.filter((a: any) => (a.status || "").toUpperCase() === "ALPA").length;

            if (isRecorded) {
              if (s.status === "HADIR") totalHadir++;
              else if (s.status === "IZIN") totalIzin++;
              else if (s.status === "SAKIT") totalSakit++;
              else if (s.status === "ALPA") totalAlpa++;
            }

            const totalSessions = totalHadir + totalIzin + totalSakit + totalAlpa;
            const pct = totalSessions > 0 ? Math.round((totalHadir / totalSessions) * 100) : (isRecorded && s.status === "HADIR" ? 100 : 0);

            return {
              id: s.id,
              nisn: s.nisn,
              name: s.name,
              class: s.class,
              hadir: totalHadir,
              izin: totalIzin,
              sakit: totalSakit,
              alpa: totalAlpa,
              pct: pct,
              parentWa: s.parentWa,
              status: isRecorded ? `Hari ini: ${s.status}` : "Belum Presensi",
              today: isRecorded ? s.status : "belum",
              sessionStatus: isRecorded ? s.status : "belum",
              note: s.notes,
            };
          });
          setAttendanceData(formatted);
        } else {
          setDailyStudents([]);
          setAttendanceData([]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setDailyStudents([]);
          setAttendanceData([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedRombelFilter, todayStr]);

  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSetDailyStatus = (id: string, status: "HADIR" | "SAKIT" | "IZIN" | "ALPA") => {
    setDailyStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status, isRecordedToday: true } : s)));
  };

  const handleSetDailyNotes = (id: string, notes: string) => {
    setDailyStudents((prev) => prev.map((s) => (s.id === id ? { ...s, notes } : s)));
  };

  const handleSetAllDailyHadir = () => {
    if (dailyStudents.length === 0) return;
    setDailyStudents((prev) => prev.map((s) => ({ ...s, status: "HADIR", isRecordedToday: true })));
    toast.success(`✨ Seluruh siswa ${selectedRombelFilter} diset HADIR! Silakan klik "Simpan Presensi Harian".`);
  };

  const handleSaveDailyPresensi = async () => {
    if (dailyStudents.length === 0) {
      toast.error("Tidak ada siswa pada rombel ini untuk disimpan presensi harinya.");
      return;
    }

    setIsSavingDaily(true);
    const toastId = toast.loading(`⏳ Menyimpan Presensi Harian Rombel ${selectedRombelFilter}...`);

    try {
      const waliName = me?.full_name || userProfile?.name || "Wali Kelas";
      const records = dailyStudents.map((s) => ({
        rombel: selectedRombelFilter,
        wali_kelas: waliName,
        student_nis: s.nisn,
        student_name: s.name,
        status: s.status,
        notes: s.notes || "",
        date_str: todayStr,
      }));

      const success = await MysqlDataService.saveDailyPresensiRombelBatch(
        selectedRombelFilter,
        waliName,
        todayStr,
        records
      );

      if (success) {
        setDailyStudents((prev) => prev.map((s) => ({ ...s, isRecordedToday: true })));
        setAttendanceData((prev) =>
          prev.map((a) => {
            const match = dailyStudents.find((ds) => ds.id === a.id || ds.nisn === a.nisn);
            const st = match ? match.status : "HADIR";
            return {
              ...a,
              hadir: st === "HADIR" ? 1 : 0,
              izin: st === "IZIN" ? 1 : 0,
              sakit: st === "SAKIT" ? 1 : 0,
              alpa: st === "ALPA" ? 1 : 0,
              pct: st === "HADIR" ? 100 : 0,
              status: `Hari ini: ${st}`,
            };
          })
        );

        const hCount = dailyStudents.filter((s) => s.status === "HADIR").length;
        const iCount = dailyStudents.filter((s) => s.status === "IZIN").length;
        const sCount = dailyStudents.filter((s) => s.status === "SAKIT").length;
        const aCount = dailyStudents.filter((s) => s.status === "ALPA").length;

        toast.success(`✅ Presensi Harian ${selectedRombelFilter} berhasil disimpan!`, {
          id: toastId,
          description: `Total: ${dailyStudents.length} Siswa (Hadir: ${hCount}, Sakit: ${sCount}, Izin: ${iCount}, Alpa: ${aCount})`,
        });
      } else {
        toast.error(`❌ Gagal menyimpan presensi harian.`, { id: toastId });
      }
    } catch (e: any) {
      toast.error(`❌ Gagal menyimpan presensi harian: ${e?.message || e}`, { id: toastId });
    } finally {
      setIsSavingDaily(false);
    }
  };

  const handleSendWaAlert = async (student: any) => {
    try {
      const targetPhone = (student.parentWa || "").trim();
      if (!targetPhone) {
        toast.error("Nomor WhatsApp orang tua belum terdaftar pada akun siswa ini.", {
          description: "Silakan lengkapi data nomor telepon di Manajemen User.",
        });
        return;
      }

      const cleanPhone = targetPhone.replace(/[^0-9]/g, "").replace(/^0/, "62");
      const msg = `[NOTIFIKASI PRESENSI HARIAN MTsN 2 CILACAP]\n\nYth. Orang Tua / Wali dari Siswa:\nNama: *${student.name}*\nNISN/NIS: ${student.nisn}\nKelas: ${student.class}\nStatus Kehadiran (${todayStr}): *${student.status}*\nKeterangan: ${student.notes || "-"}\n\nMohon perhatian dan konfirmasinya. Terima kasih.\n\nHormat kami,\nWali Kelas ${selectedRombelFilter}\nMTs Negeri 2 Cilacap`;

      toast.loading(`Menyiapkan pengiriman WA ke orang tua ${student.name}...`, { id: "wa_alert" });

      let sentViaApi = false;
      try {
        const res = await (MysqlDataService as any).sendTestWaMessage?.(cleanPhone, msg);
        if (res && res.success) {
          sentViaApi = true;
          toast.success(`Notifikasi WA Berhasil Dikirim ke Orang Tua ${student.name}!`, { id: "wa_alert" });
        }
      } catch {
        // Fallback to direct WA Web link below
      }

      if (!sentViaApi) {
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, "_blank");
        toast.success(`Membuka WhatsApp untuk mengirim pesan ke Orang Tua ${student.name}`, { id: "wa_alert" });
      }
    } catch {
      toast.error("Gagal memproses pengiriman WA", { id: "wa_alert" });
    }
  };

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(colKey);
      setSortDir("asc");
    }
  };

  const filteredData = useMemo(() => {
    let list = [...attendanceData];
    if (selectedRombelFilter !== "Semua Rombel") {
      list = list.filter((item) => isSameClass(item.class, selectedRombelFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) => item.name.toLowerCase().includes(q) || item.nisn.includes(q)
      );
    }

    list.sort((a: any, b: any) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = (valB || "").toLowerCase();
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [attendanceData, selectedRombelFilter, searchQuery, sortColumn, sortDir]);

  const filteredDailyStudents = useMemo(() => {
    if (!searchQuery.trim()) return dailyStudents;
    const q = searchQuery.toLowerCase();
    return dailyStudents.filter(
      (s) => s.name.toLowerCase().includes(q) || s.nisn.includes(q)
    );
  }, [dailyStudents, searchQuery]);

  const countDailyHadir = dailyStudents.filter((s) => s.isRecordedToday && s.status === "HADIR").length;
  const countDailySakit = dailyStudents.filter((s) => s.isRecordedToday && s.status === "SAKIT").length;
  const countDailyIzin = dailyStudents.filter((s) => s.isRecordedToday && s.status === "IZIN").length;
  const countDailyAlpa = dailyStudents.filter((s) => s.isRecordedToday && s.status === "ALPA").length;

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.error("Tidak ada data presensi untuk di-export.");
      return;
    }
    const headers = ["No", "NISN", "Nama Siswa", "Rombel", "Total Hadir", "Izin", "Sakit", "Alpa", "% Kehadiran", "Status Presensi"];
    const rows = filteredData.map((s, idx) => [
      idx + 1,
      s.nisn,
      s.name,
      s.class,
      s.hadir,
      s.izin,
      s.sakit,
      s.alpa,
      `${s.pct}%`,
      s.status,
    ]);
    exportToExcelXml("Rekap_Presensi_Siswa_MTsN2Cilacap", "Presensi_Siswa", headers, rows);
    toast.success("File Excel Rekap Presensi Siswa Berhasil Diunduh!");
  };

  const isSiswa = activeRole === "siswa";

  if (isSiswa) {
    const studentUser = me;
    const studentName = studentUser?.full_name || userProfile?.name || "Peserta Didik";
    const studentNis = studentUser?.nis_nip || userProfile?.nipNis || "-";
    const studentClass = studentUser?.class_name || userProfile?.className || "-";

    const myDaily = dailyStudents.find(
      (s) => s.nisn === studentNis || s.name?.toLowerCase() === studentName.toLowerCase()
    );
    const myAttendance = attendanceData.find(
      (a) => a.nisn === studentNis || a.name?.toLowerCase() === studentName.toLowerCase()
    );

    const totalHadir = myAttendance?.hadir || (myDaily?.status === "HADIR" ? 1 : 0);
    const totalIzin = myAttendance?.izin || (myDaily?.status === "IZIN" ? 1 : 0);
    const totalSakit = myAttendance?.sakit || (myDaily?.status === "SAKIT" ? 1 : 0);
    const totalAlpa = myAttendance?.alpa || (myDaily?.status === "ALPA" ? 1 : 0);
    const totalSessions = totalHadir + totalIzin + totalSakit + totalAlpa;
    const pct = totalSessions > 0 ? ((totalHadir / totalSessions) * 100).toFixed(1) : "100.0";
    const todayStatus = myDaily?.status || "HADIR";

    return (
      <div className="space-y-4">
        <StudentHeaderBanner
          title="Kehadiran & Rekapitulasi Presensi"
          icon={UserCheck}
          studentClass={studentClass}
          studentNisn={studentNis}
        />

        {/* Read-Only Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-border pb-3 bg-card p-3 rounded-xl shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold tabular-nums">
              🎓 {studentClass} • NISN: {studentNis}
            </Badge>
            <Badge className="bg-emerald-600 text-white font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" /> PRESENSI HARI INI: {todayStatus}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 bg-muted/40 px-2.5 py-1 rounded-lg border border-border">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Presensi Terintegrasi E-Rapor
          </div>
        </div>

        {/* Horizontal Compact Metric Strip (~42px) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Hadir</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{totalHadir} Hari ({pct}%)</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Izin</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{totalIzin} Hari</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Sakit</p>
              <p className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-tight mt-0.5">{totalSakit} Hari</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <UserCheck className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Tanpa Keterangan</p>
              <p className="text-sm font-bold leading-tight mt-0.5">{totalAlpa === 0 ? "0 Hari (Disiplin)" : `${totalAlpa} Hari`}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" /> Presensi & Kehadiran Siswa
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs font-semibold border-border px-3 text-muted-foreground hover:text-foreground"
            onClick={handleExportExcel}
            disabled={filteredData.length === 0}
          >
            <Download className="h-3.5 w-3.5" /> Export Excel (.xls)
          </Button>
        </div>
      </div>

      {/* Segmented Pill Tabs Navigation */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/70 h-9 w-fit">
        <Button
          size="sm"
          variant={activeTab === "harian_wali" ? "default" : "ghost"}
          className={`gap-1.5 text-xs font-bold h-7 px-3 rounded-lg ${activeTab === "harian_wali" ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("harian_wali")}
        >
          <CalendarCheck className="h-3.5 w-3.5" /> 1. Form Presensi Harian Kelas
        </Button>

        <Button
          size="sm"
          variant={activeTab === "rekap_rekomendasi" ? "default" : "ghost"}
          className={`gap-1.5 text-xs font-bold h-7 px-3 rounded-lg ${activeTab === "rekap_rekomendasi" ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("rekap_rekomendasi")}
        >
          <BookOpen className="h-3.5 w-3.5" /> 2. Rekapitulasi & Laporan
        </Button>
      </div>

      {/* Horizontal Compact Metric Strip (~42px) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Siswa Terdata</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{dailyStudents.length} Siswa</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Hadir Hari Ini</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{countDailyHadir} Siswa</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Sakit / Izin</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-tight mt-0.5">{countDailySakit + countDailyIzin} Siswa</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${countDailyAlpa > 0 ? "bg-rose-500/15 text-rose-600" : "bg-muted text-muted-foreground"}`}>
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Alpa Hari Ini</p>
            <p className={`text-sm font-bold leading-tight mt-0.5 ${countDailyAlpa > 0 ? "text-rose-600" : "text-foreground"}`}>{countDailyAlpa} Siswa</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-2.5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Pilih Kelas:</span>
          <select
            className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground cursor-pointer hover:border-primary/50 transition min-w-[180px]"
            value={selectedRombelFilter}
            onChange={(e) => setSelectedRombelFilter(e.target.value)}
          >
            <option value="Semua Rombel">Semua Kelas</option>
            <option value="Kelas 7A">Kelas 7A</option>
            <option value="Kelas 7B">Kelas 7B</option>
            <option value="Kelas 8A">Kelas 8A</option>
            <option value="Kelas 8B">Kelas 8B</option>
            <option value="Kelas 9A">Kelas 9A</option>
            <option value="Kelas 9B">Kelas 9B</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau NISN..."
            className="pl-8 h-8 text-xs rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {activeTab === "harian_wali" ? (
        /* TAB 1: FORM PRESENSI HARIAN WALI KELAS */
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-3.5 pb-2 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Presensi Harian Kelas ({selectedRombelFilter})
              </CardTitle>
              <CardDescription className="text-xs">
                Tanggal: {todayStr} · Wali Kelas: {me?.full_name || userProfile?.name || "Wali Kelas"} · Tandai siswa yang Sakit, Izin, atau Alpa hari ini.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
                onClick={handleSetAllDailyHadir}
                disabled={dailyStudents.length === 0 || isSavingDaily}
              >
                <UserCheck className="h-3.5 w-3.5" /> Set Semua Hadir
              </Button>

              <Button
                size="sm"
                className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-70"
                onClick={handleSaveDailyPresensi}
                disabled={dailyStudents.length === 0 || isSavingDaily}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> {isSavingDaily ? "Menyimpan..." : "Simpan Presensi Harian"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* Stat Pills Counter */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-xs text-muted-foreground font-semibold block">HADIR</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{countDailyHadir}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <span className="text-xs text-muted-foreground font-semibold block">SAKIT</span>
                <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{countDailySakit}</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                <span className="text-xs text-muted-foreground font-semibold block">IZIN</span>
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{countDailyIzin}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                <span className="text-xs text-muted-foreground font-semibold block">ALPA</span>
                <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{countDailyAlpa}</span>
              </div>
            </div>

            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Memuat daftar siswa rombel binaan...</div>
            ) : filteredDailyStudents.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground text-sm">Tidak Ada Siswa Terdaftar pada {selectedRombelFilter}</div>
                <p>Database saat ini tidak memiliki akun siswa untuk rombel ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4">NISN / NIS</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-4">Rombel</th>
                      <th className="py-3 px-4 text-center w-64">Status Kehadiran Hari Ini</th>
                      <th className="py-3 px-4">Catatan / Keterangan</th>
                      <th className="py-3 px-4 text-center w-36">Lapor Ortu WA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredDailyStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-4 text-center font-medium text-muted-foreground tabular-nums">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-muted-foreground tabular-nums">{s.nisn}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{s.name}</td>
                        <td className="py-3 px-4 font-semibold text-muted-foreground">{s.class}</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSetDailyStatus(s.id, "HADIR")}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                                s.status === "HADIR"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-muted text-muted-foreground hover:bg-emerald-500/20"
                              }`}
                            >
                              HADIR
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetDailyStatus(s.id, "SAKIT")}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                                s.status === "SAKIT"
                                  ? "bg-amber-600 text-white shadow-xs"
                                  : "bg-muted text-muted-foreground hover:bg-amber-500/20"
                              }`}
                            >
                              SAKIT
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetDailyStatus(s.id, "IZIN")}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                                s.status === "IZIN"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "bg-muted text-muted-foreground hover:bg-blue-500/20"
                              }`}
                            >
                              IZIN
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSetDailyStatus(s.id, "ALPA")}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                                s.status === "ALPA"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : "bg-muted text-muted-foreground hover:bg-rose-500/20"
                              }`}
                            >
                              ALPA
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Input
                            placeholder="Tulis alasan/catatan (misal: Demam/Surat)"
                            className="h-8 text-xs bg-background"
                            value={s.notes || ""}
                            onChange={(e) => handleSetDailyNotes(s.id, e.target.value)}
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          {s.status !== "HADIR" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-[10px] font-bold gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                              onClick={() => handleSendWaAlert(s)}
                            >
                              <Send className="h-3 w-3" /> WA Ortu
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-medium">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* TAB 2: REKAPITULASI KEHADIRAN SISWA */
        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Memuat data presensi dari database...</div>
            ) : filteredData.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 m-4">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground text-sm">Belum Ada Data Siswa Terdaftar pada {selectedRombelFilter}</div>
                <p>Database saat ini tidak memiliki akun siswa terdaftar untuk filter ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                      <th className="py-3 px-4 w-12 text-center">No</th>
                      <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("nisn")}>
                        <div className="flex items-center gap-1">NISN <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort("name")}>
                        <div className="flex items-center gap-1">Nama Siswa <ArrowUpDown className="h-3 w-3" /></div>
                      </th>
                      <th className="py-3 px-4">Rombel</th>
                      <th className="py-3 px-4 text-center">Hadir</th>
                      <th className="py-3 px-4 text-center">Izin</th>
                      <th className="py-3 px-4 text-center">Sakit</th>
                      <th className="py-3 px-4 text-center">Alpa</th>
                      <th className="py-3 px-4 text-center">% Kehadiran</th>
                      <th className="py-3 px-4 text-center">Status Presensi</th>
                      <th className="py-3 px-4 text-center">Aksi WA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredData.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-4 text-center font-medium text-muted-foreground tabular-nums">{idx + 1}</td>
                        <td className="py-3 px-4 font-medium text-muted-foreground tabular-nums">{row.nisn}</td>
                        <td className="py-3 px-4 font-bold text-foreground">{row.name}</td>
                        <td className="py-3 px-4 font-semibold text-muted-foreground">{row.class}</td>
                        <td className="py-3 px-4 text-center text-emerald-600 font-bold tabular-nums">{row.hadir}</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-bold tabular-nums">{row.izin}</td>
                        <td className="py-3 px-4 text-center text-amber-600 font-bold tabular-nums">{row.sakit}</td>
                        <td className="py-3 px-4 text-center text-rose-600 font-bold tabular-nums">{row.alpa}</td>
                        <td className="py-3 px-4 text-center font-extrabold text-foreground tabular-nums">{row.pct}%</td>
                        <td className="py-3 px-4 text-center">
                          {row.pct > 0 ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold text-[10px]">
                              {row.status}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-muted/30 text-muted-foreground border-border font-medium text-[10px]">
                              {row.status}
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {row.alpa > 0 || row.sakit > 0 || row.izin > 0 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[10px] font-bold gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                              onClick={() =>
                                handleSendWaAlert({
                                  name: row.name,
                                  nisn: row.nisn,
                                  class: row.class,
                                  status: row.alpa > 0 ? `Alpa ${row.alpa}x` : row.sakit > 0 ? `Sakit ${row.sakit}x` : `Izin ${row.izin}x`,
                                  parentWa: row.parentWa,
                                  notes: `Rekap semester: Hadir ${row.hadir}x, Izin ${row.izin}x, Sakit ${row.sakit}x, Alpa ${row.alpa}x (${row.pct}%)`,
                                })
                              }
                            >
                              <Send className="h-3 w-3" /> WA Ortu
                            </Button>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
