import { useState, useEffect, useMemo } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";
import { Users, Megaphone, CheckCircle2, ShieldCheck, Printer, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { DaftarSiswaKelasTab, StudentItem } from "./components/DaftarSiswaKelasTab";
import { PengumumanKelasTab, PengumumanItem } from "./components/PengumumanKelasTab";
import { CetakSuratDialog } from "./components/CetakSuratDialog";
import { PrintDataKelasDialog } from "./components/PrintDataKelasDialog";

import { isSameClass, normalizeRombelName, resolveWaliKelasRombel } from "@/utils/classNormalization";

function SectionHeader({ title }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
    </div>
  );
}

export interface RombelExecutiveItem {
  id: string;
  name: string;
  grade: string;
  wali: string;
  count: number;
  hadirPct: number;
  statusKbm: string;
  progressRapor: number;
}

export function ManajemenKelasModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const me = MysqlAuthService.getActiveUser();
  const waliKelasName = me?.full_name || userProfile?.name || "";
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin" || activeRole === "admin_akademik";

  const [activeTab, setActiveTab] = useState<"siswa" | "pengumuman" | "rekap_rombel">(
    isExecutive ? "rekap_rombel" : "siswa"
  );

  const resolvedWaliClass = useMemo(() => {
    if (isExecutive) return "Semua";
    return resolveWaliKelasRombel(me || userProfile, null, "kelas");
  }, [userProfile, me, isExecutive]);

  const [selectedClass, setSelectedClass] = useState(resolvedWaliClass);
  const [dbRombels, setDbRombels] = useState<RombelExecutiveItem[]>([]);
  const [isLoadingRombels, setIsLoadingRombels] = useState(true);

  const activeWaliKelasName = useMemo(() => {
    if (selectedClass && selectedClass !== "Semua") {
      const matched = dbRombels.find((r) => isSameClass(r.name, selectedClass));
      if (matched && matched.wali) return matched.wali;
    }
    return waliKelasName;
  }, [selectedClass, dbRombels, waliKelasName]);

  useEffect(() => {
    setSelectedClass(resolvedWaliClass);
  }, [resolvedWaliClass]);

  const [students, setStudents] = useState<StudentItem[]>([]);

  const [announcements, setAnnouncements] = useState<PengumumanItem[]>([]);

  const [selectedStudentForSurat, setSelectedStudentForSurat] = useState<StudentItem | null>(null);
  const [isSuratOpen, setIsSuratOpen] = useState(false);
  const [isPrintDataKelasOpen, setIsPrintDataKelasOpen] = useState(false);
  const [isWaActive, setIsWaActive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingRombels(true);

    Promise.all([
      MysqlDataService.getMasterRombels().catch(() => []),
      MysqlDataService.getUsers().catch(() => []),
      MysqlDataService.getAnnouncements().catch(() => []),
      MysqlDataService.getWaGatewayConfig().catch(() => null),
    ]).then(([rombelRows, users, anns, waCfg]) => {
      if (!isMounted) return;

      setIsWaActive(Boolean(waCfg?.is_enabled));

      if (anns && anns.length > 0) {
        setAnnouncements(
          anns.map((a: any) => ({
            id: a.id || `ann_${Date.now()}`,
            title: a.title,
            content: a.content,
            date: a.date_str || (a.created_at ? new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "-"),
            author: a.author || waliKelasName || "Wali Kelas",
          }))
        );
      } else {
        setAnnouncements([]);
      }

      const siswaList = (users || []).filter((u: any) => u.role === "siswa");
      if (siswaList.length > 0) {
        const formatted = siswaList.map((s: any, idx: number) => {
          const studentClass = normalizeRombelName(s.class_name || s.class);
          return {
            id: s.id || `s_${idx}`,
            nisn: s.nis_nip || s.nis || "-",
            name: s.full_name || s.name || "-",
            class: studentClass || "-",
            gender: s.gender || "-",
            parentName: s.parent_name || "-",
            parentWa: s.phone || "",
            hadirPct: 0,
            statusPresensi: "BELUM PRESENSI",
          };
        });
        setStudents(formatted);
      }

      if (rombelRows && rombelRows.length > 0) {
        const mapped = rombelRows.map((r: any) => {
          const studentInClass = siswaList.filter((s: any) => isSameClass(s.class_name || s.class, r.name));
          const realCount = studentInClass.length > 0 ? studentInClass.length : (r.siswa_count || 0);
          const classNameFormatted = normalizeRombelName(r.name);
          return {
            id: r.code || r.id || r.name,
            name: classNameFormatted,
            grade: r.grade || (r.name.includes("7") ? "Kelas VII" : r.name.includes("9") ? "Kelas IX" : "Kelas VIII"),
            wali: r.wali_kelas || "Belum Ditentukan",
            count: realCount,
            hadirPct: 0,
            statusKbm: "⚪ Belum Ada KBM",
            progressRapor: 0,
          };
        });
        setDbRombels(mapped);
      } else if (siswaList.length > 0) {
        const uniqueClasses = Array.from(new Set(siswaList.map((s: any) => normalizeRombelName(s.class_name || s.class)))).filter(Boolean);
        const mapped = uniqueClasses.map((cName: any, idx: number) => {
          const studentInClass = siswaList.filter((s: any) => isSameClass(s.class_name || s.class, cName));
          return {
            id: `r_fallback_${idx}`,
            name: cName,
            grade: cName.includes("7") ? "Kelas VII" : cName.includes("9") ? "Kelas IX" : "Kelas VIII",
            wali: "Belum Ditentukan",
            count: studentInClass.length,
            hadirPct: 0,
            statusKbm: "⚪ Belum Ada KBM",
            progressRapor: 0,
          };
        });
        setDbRombels(mapped);
      } else {
        setDbRombels([]);
      }
    }).catch(() => {
      if (isMounted) setDbRombels([]);
    }).finally(() => {
      if (isMounted) setIsLoadingRombels(false);
    });

    return () => { isMounted = false; };
  }, []);

  const classStudents = useMemo(() => {
    return students.filter((s) => selectedClass === "Semua" || isSameClass(s.class, selectedClass));
  }, [students, selectedClass]);

  const handleSendWaAlert = (student: StudentItem) => {
    MysqlDataService.saveWaLog({
      parent_name: student.parentName,
      phone: student.parentWa,
      student_name: student.name,
      category: "ALERT MANAJEMEN KELAS",
      message: `[NOTIFIKASI WALI KELAS MTsN 2 CILACAP]: Bpk/Ibu ${student.parentName}, disampaikan bahwa ananda ${student.name} (${student.class}) saat ini memiliki rekapitulasi kehadiran ${student.hadirPct}%. Salam hangat dari Wali Kelas ${waliKelasName}.`,
      status: "TERKIRIM",
    }).catch(() => { });

    toast.success(`📱 WA Alert Berhasil Dikirim ke Orang Tua ${student.name} (${student.parentWa})!`);
  };

  const handleOpenCetakSurat = (student: StudentItem) => {
    setSelectedStudentForSurat(student);
    setIsSuratOpen(true);
  };

  const handleUpdateStudentParentData = async (studentId: string, parentName: string, parentWa: string) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.id === studentId ? { ...item, parentName, parentWa } : item
      )
    );
    try {
      const res = await MysqlDataService.updateStudentParentContact({
        studentId,
        parentName,
        parentWa,
      });
      if (res) {
        toast.success("Kontak orang tua siswa berhasil disimpan ke database!");
      }
    } catch (err: any) {
      toast.error("Gagal menyimpan kontak orang tua: " + (err?.message || ""));
    }
  };

  const handleAddAnnouncement = async (item: { title: string; content: string }) => {
    const formattedDate = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    try {
      await MysqlDataService.saveAnnouncement({
        title: item.title,
        content: item.content,
        tag: selectedClass !== "Semua" ? selectedClass : "Kelas",
        date_str: formattedDate,
      });

      const newAnn: PengumumanItem = {
        id: "a_" + Date.now(),
        title: item.title,
        content: item.content,
        date: formattedDate,
        author: waliKelasName || "Wali Kelas",
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      toast.success(`Pengumuman kelas "${item.title}" berhasil diterbitkan ke database!`);
    } catch (err: any) {
      toast.error("Gagal menyimpan pengumuman: " + (err?.message || ""));
    }
  };

  const handleBroadcastWaGroup = (title: string, content: string) => {
    classStudents.forEach((s) => {
      MysqlDataService.saveWaLog({
        parent_name: s.parentName,
        phone: s.parentWa,
        student_name: s.name,
        category: "BROADCAST WALI KELAS",
        message: `[PENGUMUMAN WALI KELAS ${selectedClass}]: *${title}*\n\n${content}\n\nHormat kami,\nWali Kelas ${selectedClass}\n${waliKelasName}`,
        status: "TERKIRIM",
      }).catch(() => { });
    });
    toast.success(`⚡ Broadcast WA Group ${selectedClass} Berhasil Dikirim ke ${classStudents.length} Orang Tua Siswa!`);
  };

  const totalHadir = classStudents.filter((s) => s.hadirPct >= 90).length;

  const totalClassesCount = dbRombels.length;
  const waliTerisiCount = dbRombels.filter((r) => r.wali && r.wali !== "Belum Ditentukan" && r.wali !== "-").length;
  const avgHadirPct = dbRombels.length > 0 ? (dbRombels.reduce((acc, r) => acc + r.hadirPct, 0) / dbRombels.length).toFixed(1) : "0.0";
  const avgRaporPct = dbRombels.length > 0 ? (dbRombels.reduce((acc, r) => acc + r.progressRapor, 0) / dbRombels.length).toFixed(1) : "0.0";

  const executiveRoleLabel = activeRole === "waka" ? "Waka" : activeRole === "admin" || activeRole === "admin_akademik" ? "Administrator" : "Kepala Madrasah";

  return (
    <div className="space-y-4">
      {isExecutive ? (
        <>
          {/* 1. Header Ringkas & Lega */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Supervisi Manajemen Kelas
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-muted shadow-2xs"
                onClick={() => setIsPrintDataKelasOpen(true)}
              >
                <Printer className="h-3.5 w-3.5 text-emerald-600" /> Cetak Rekapitulasi Kelas (PDF)
              </Button>
            </div>
          </div>

          {/* 2. Compact Metric Strip (~42px high) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
            <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
              <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Kelas Aktif</p>
                <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{totalClassesCount} Kelas</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
              <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Rata-rata Presensi</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{avgHadirPct}%</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
              <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                <Megaphone className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Kelengkapan Wali Kelas</p>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-tight mt-0.5">{waliTerisiCount} / {totalClassesCount} Kelas</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
              <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Progres Rapor</p>
                <p className="text-sm font-bold text-purple-600 dark:text-purple-400 leading-tight mt-0.5">{avgRaporPct}% Tuntas</p>
              </div>
            </div>
          </div>

          {/* 3. Segmented Tab Switcher & Filter Kelas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
            <div className="inline-flex items-center bg-muted/60 p-1 rounded-xl border border-border/80 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("rekap_rombel");
                  setSelectedClass("Semua");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "rekap_rombel"
                    ? "bg-background text-foreground font-bold shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  }`}
              >
                <ShieldCheck className={`h-3.5 w-3.5 ${activeTab === "rekap_rombel" ? "text-emerald-600" : "opacity-60"}`} />
                <span>Matriks {totalClassesCount} Kelas Terpadu</span>
              </button>

              {selectedClass !== "Semua" && (
                <button
                  type="button"
                  onClick={() => setActiveTab("siswa")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "siswa"
                      ? "bg-background text-foreground font-bold shadow-xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                    }`}
                >
                  <Users className={`h-3.5 w-3.5 ${activeTab === "siswa" ? "text-blue-600" : "opacity-60"}`} />
                  <span>Detail Siswa ({selectedClass})</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Filter Kelas:</span>
              <select
                className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold shadow-2xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={selectedClass}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedClass(val);
                  if (val === "Semua") {
                    setActiveTab("rekap_rombel");
                  } else {
                    setActiveTab("siswa");
                  }
                }}
              >
                <option value="Semua">Semua Kelas (Matriks Terpadu)</option>
                {dbRombels.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name} ({r.wali})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === "rekap_rombel" && (
            <Card className="border-border bg-card shadow-xs">
              <CardContent className="p-0">
                {isLoadingRombels ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Memuat data kelas...
                  </div>
                ) : dbRombels.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Belum ada kelas terdaftar.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border">
                        <tr>
                          <th className="p-3">Nama Kelas</th>
                          <th className="p-3">Tingkat</th>
                          <th className="p-3">Wali Kelas Penanggung Jawab</th>
                          <th className="p-3 text-center">Jumlah Siswa</th>
                          <th className="p-3 text-center">% Presensi Hari Ini</th>
                          <th className="p-3 text-center">Progres Rapor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {dbRombels.map((rombel) => (
                          <tr key={rombel.id} className="hover:bg-muted/30 transition">
                            <td className="p-3 font-bold text-foreground">{rombel.name}</td>
                            <td className="p-3 font-medium text-muted-foreground">{rombel.grade}</td>
                            <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{rombel.wali}</td>
                            <td className="p-3 text-center font-mono font-bold">{rombel.count} Siswa</td>
                            <td className="p-3 text-center font-mono font-bold text-emerald-500">{rombel.hadirPct}%</td>
                            <td className="p-3 text-center font-mono font-bold text-blue-500">{rombel.progressRapor}% Terinput</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "siswa" && selectedClass !== "Semua" && (
            <DaftarSiswaKelasTab
              classNameTitle={selectedClass}
              students={classStudents}
              onSendWa={(s) => toast.info(`🔒 Mode Monitoring ${executiveRoleLabel}: Fitur Kirim WA terbatas untuk Wali Kelas.`)}
              onOpenCetakSurat={handleOpenCetakSurat}
              onUpdateStudent={handleUpdateStudentParentData}
              isReadOnly={true}
              isWaActive={isWaActive}
            />
          )}
        </>
      ) : (
        <>
          {/* Header untuk Wali Kelas */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Manajemen {selectedClass}
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-muted shadow-2xs"
                onClick={() => setIsPrintDataKelasOpen(true)}
              >
                <Printer className="h-3.5 w-3.5 text-emerald-600" /> Cetak Data Kelas (PDF)
              </Button>
            </div>
          </div>

          {/* Compact Metric Strip untuk Wali Kelas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
            <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
              <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                <Users className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Anggota Kelas</p>
                <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{classStudents.length} Siswa</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
              <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Presensi Hari Ini</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">0% Hadir</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
              <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                <Megaphone className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Pengumuman Aktif</p>
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400 leading-tight mt-0.5">{announcements.length} Berita</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
              <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Wali Kelas</p>
                <p className="text-xs font-bold text-foreground truncate leading-tight mt-0.5" title={activeWaliKelasName}>
                  {activeWaliKelasName || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Segmented Control untuk Wali Kelas */}
          <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
            <div className="inline-flex items-center bg-muted/60 p-1 rounded-xl border border-border/80 text-xs shadow-2xs">
              <button
                type="button"
                onClick={() => setActiveTab("siswa")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "siswa"
                    ? "bg-background text-foreground font-bold shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  }`}
              >
                <Users className={`h-3.5 w-3.5 ${activeTab === "siswa" ? "text-emerald-600" : "opacity-60"}`} />
                <span>Daftar Siswa ({classStudents.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("pengumuman")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${activeTab === "pengumuman"
                    ? "bg-background text-foreground font-bold shadow-xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  }`}
              >
                <Megaphone className={`h-3.5 w-3.5 ${activeTab === "pengumuman" ? "text-amber-600" : "opacity-60"}`} />
                <span>Pengumuman Internal ({announcements.length})</span>
              </button>
            </div>
          </div>

          {activeTab === "siswa" && (
            <DaftarSiswaKelasTab
              classNameTitle={selectedClass}
              students={classStudents}
              onSendWa={handleSendWaAlert}
              onOpenCetakSurat={handleOpenCetakSurat}
              onUpdateStudent={handleUpdateStudentParentData}
              isWaActive={isWaActive}
            />
          )}

          {activeTab === "pengumuman" && (
            <PengumumanKelasTab
              classNameTitle={selectedClass}
              announcements={announcements}
              onAddAnnouncement={handleAddAnnouncement}
              onBroadcastWaGroup={handleBroadcastWaGroup}
              isWaActive={isWaActive}
            />
          )}
        </>
      )}
      <CetakSuratDialog
        isOpen={isSuratOpen}
        onOpenChange={setIsSuratOpen}
        student={selectedStudentForSurat}
        classNameTitle={selectedClass}
        waliKelasName={activeWaliKelasName}
        onPrint={() => {
          window.print();
          toast.success("Dokumen Surat Keterangan Wali Kelas berhasil dicetak!");
        }}
      />

      <PrintDataKelasDialog
        isOpen={isPrintDataKelasOpen}
        onOpenChange={setIsPrintDataKelasOpen}
        selectedClass={selectedClass}
        waliKelasName={activeWaliKelasName}
        students={classStudents}
        onPrint={() => {
          window.print();
          toast.success(`Dokumen Laporan Siswa ${selectedClass} berhasil dicetak!`);
        }}
      />
    </div>
  );
}
