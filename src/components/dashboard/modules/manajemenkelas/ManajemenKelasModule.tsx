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
  const [activeTab, setActiveTab] = useState<"siswa" | "pengumuman" | "rekap_rombel">("siswa");

  const me = MysqlAuthService.getActiveUser();
  const waliKelasName = me?.full_name || userProfile?.name || "";
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin" || activeRole === "admin_akademik";

  const resolvedWaliClass = useMemo(() => {
    if (isExecutive) return "Semua";
    return resolveWaliKelasRombel(me || userProfile, null, "rombel");
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

  useEffect(() => {
    let isMounted = true;
    setIsLoadingRombels(true);

    Promise.all([
      MysqlDataService.getMasterRombels().catch(() => []),
      MysqlDataService.getUsers().catch(() => []),
      MysqlDataService.getAnnouncements().catch(() => []),
    ]).then(([rombelRows, users, anns]) => {
      if (!isMounted) return;

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
          return {
            id: r.code || r.id || r.name,
            name: r.name,
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
    }).catch(() => {});

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
      }).catch(() => {});
    });
    toast.success(`⚡ Broadcast WA Group ${selectedClass} Berhasil Dikirim ke ${classStudents.length} Orang Tua Siswa!`);
  };

  const totalHadir = classStudents.filter((s) => s.hadirPct >= 90).length;

  const totalRombelAktif = dbRombels.length;
  const waliTerisiCount = dbRombels.filter((r) => r.wali && r.wali !== "Belum Ditentukan" && r.wali !== "-").length;
  const avgHadirPct = dbRombels.length > 0 ? (dbRombels.reduce((acc, r) => acc + r.hadirPct, 0) / dbRombels.length).toFixed(1) : "0.0";
  const avgRaporPct = dbRombels.length > 0 ? (dbRombels.reduce((acc, r) => acc + r.progressRapor, 0) / dbRombels.length).toFixed(1) : "0.0";

  const executiveRoleLabel = activeRole === "waka" ? "Waka" : activeRole === "admin" || activeRole === "admin_akademik" ? "Administrator" : "Kepala Madrasah";

  return (
    <div className="space-y-6">
      {isExecutive ? (
        <>
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm text-foreground">
                  🏛️ Supervisi Eksekutif {executiveRoleLabel}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Supervisi terpadu {totalRombelAktif} Rombel MTsN 2 Cilacap: Kehadiran siswa, kelengkapan Wali Kelas, & progres rapor.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-background hover:bg-emerald-500/10"
              onClick={() => setIsPrintDataKelasOpen(true)}
            >
              <Printer className="h-3.5 w-3.5" /> Cetak Rekapitulasi Rombel PDF
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Total Rombel Aktif</div>
                  <div className="text-xl font-extrabold text-foreground">{totalRombelAktif} Rombel</div>
                </div>
              </CardContent>
            </Card>

            <CardContent className="p-0 col-span-1">
              <Card className="border-border bg-card shadow-2xs h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">Rata-rata Presensi</div>
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{avgHadirPct}%</div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
                  <Megaphone className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Kelengkapan Wali Kelas</div>
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{waliTerisiCount} / {totalRombelAktif} Rombel</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0 font-bold">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Progres Rapor Terinput</div>
                  <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{avgRaporPct}% Tuntas</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={activeTab === "rekap_rombel" ? "default" : "outline"}
                className="font-bold text-xs gap-1.5"
                onClick={() => {
                  setActiveTab("rekap_rombel");
                  setSelectedClass("Semua");
                }}
              >
                <ShieldCheck className="h-4 w-4" /> Matriks 6 Rombel Terpadu
              </Button>
              {selectedClass !== "Semua" && (
                <Button
                  size="sm"
                  variant={activeTab === "siswa" ? "default" : "outline"}
                  className="font-bold text-xs gap-1.5"
                  onClick={() => setActiveTab("siswa")}
                >
                  <Users className="h-4 w-4" /> Detail Roster ({selectedClass})
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">Filter Rombel:</span>
              <select
                className="h-9 rounded-md border border-input bg-background px-3 text-xs font-bold shadow-2xs cursor-pointer"
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
                <option value="Semua">✨ Semua Rombel (Matriks Terpadu)</option>
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
                    Memuat data rombel...
                  </div>
                ) : dbRombels.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    Belum ada rombel terdaftar.
                  </div>
                ) : (
                  <table className="w-full text-xs text-left">
                    <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border">
                      <tr>
                        <th className="p-3">Nama Rombel</th>
                        <th className="p-3">Tingkat Kelas</th>
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
            />
          )}
        </>
      ) : (
        <>
          <SectionHeader
            title={`Manajemen Kelas ${selectedClass}`}
            sub="Portal bimbingan siswa, presensi kelas, dan pengumuman internal."
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block">Total Anggota Kelas</span>
                  <span className="text-lg font-black text-foreground">{classStudents.length} Siswa</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block">Presensi Hari Ini</span>
                  <span className="text-lg font-black text-foreground">0% Hadir</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
                  <Megaphone className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block">Pengumuman Aktif</span>
                  <span className="text-lg font-black text-foreground">{announcements.length} Berita</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0 font-bold">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-semibold block">Wali Kelas Pengampu</span>
                  <span className="text-xs font-bold text-foreground truncate block max-w-[120px]" title={activeWaliKelasName}>
                    {activeWaliKelasName}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

            <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={activeTab === "siswa" ? "default" : "ghost"}
                className="font-bold text-xs gap-1.5"
                onClick={() => setActiveTab("siswa")}
              >
                <Users className="h-4 w-4" /> Daftar Siswa ({classStudents.length})
              </Button>
              <Button
                size="sm"
                variant={activeTab === "pengumuman" ? "default" : "ghost"}
                className="font-bold text-xs gap-1.5"
                onClick={() => setActiveTab("pengumuman")}
              >
                <Megaphone className="h-4 w-4" /> Pengumuman Internal
              </Button>
            </div>

            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold" onClick={() => setIsPrintDataKelasOpen(true)}>
              <Printer className="h-3.5 w-3.5" /> Cetak Data Kelas PDF
            </Button>
          </div>

          {activeTab === "siswa" && (
            <DaftarSiswaKelasTab
              classNameTitle={selectedClass}
              students={classStudents}
              onSendWa={handleSendWaAlert}
              onOpenCetakSurat={handleOpenCetakSurat}
              onUpdateStudent={handleUpdateStudentParentData}
            />
          )}

          {activeTab === "pengumuman" && (
            <PengumumanKelasTab
              classNameTitle={selectedClass}
              announcements={announcements}
              onAddAnnouncement={handleAddAnnouncement}
              onBroadcastWaGroup={handleBroadcastWaGroup}
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
