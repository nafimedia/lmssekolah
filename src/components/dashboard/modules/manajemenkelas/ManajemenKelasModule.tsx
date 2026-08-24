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

import { isSameClass, normalizeRombelName } from "@/utils/classNormalization";

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

const ROMBEL_MASTER_LIST = [
  { id: "r7a", name: "Rombel 7A", grade: "Kelas VII", wali: "MISBAH AHMAD DANI, S.Pd", count: 32, hadirPct: 96.8, statusKbm: "🟢 Live KBM", progressRapor: 88 },
  { id: "r7b", name: "Rombel 7B", grade: "Kelas VII", wali: "ENDAH KURNIAWATI, S.Pd", count: 31, hadirPct: 94.5, statusKbm: "🟢 Live KBM", progressRapor: 82 },
  { id: "r8a", name: "Rombel 8A", grade: "Kelas VIII", wali: "SITI RAHMAH, S.Pd", count: 32, hadirPct: 98.2, statusKbm: "🟢 Live KBM", progressRapor: 95 },
  { id: "r8b", name: "Rombel 8B", grade: "Kelas VIII", wali: "ACHMAD MAKMUN, S.Pd.I", count: 32, hadirPct: 97.1, statusKbm: "🔵 Tuntas", progressRapor: 90 },
  { id: "r9a", name: "Rombel 9A", grade: "Kelas IX", wali: "SOBIYATI, S.Pd", count: 32, hadirPct: 95.0, statusKbm: "🔵 Tuntas", progressRapor: 100 },
  { id: "r9b", name: "Rombel 9B", grade: "Kelas IX", wali: "SAYONO, S.Pd.I", count: 30, hadirPct: 96.2, statusKbm: "🔵 Tuntas", progressRapor: 92 },
];

export function ManajemenKelasModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const [activeTab, setActiveTab] = useState<"siswa" | "pengumuman" | "rekap_rombel">("siswa");

  const me = MysqlAuthService.getActiveUser();
  const waliKelasName = me?.full_name || userProfile?.name || "SOBIYATI, S.Pd";
  const isKamad = activeRole === "kamad";

  const resolvedWaliClass = useMemo(() => {
    if (isKamad) return "Semua";
    const cleanName = (waliKelasName || "").toLowerCase();
    const cleanNip = (me?.nis_nip || "").trim();

    if (cleanName.includes("achmad makmun") || cleanNip.includes("272005011001")) return "Rombel 8B";
    if (cleanName.includes("misbah")) return "Rombel 7A";
    if (cleanName.includes("endah")) return "Rombel 7B";
    if (cleanName.includes("siti rahmah")) return "Rombel 8A";
    if (cleanName.includes("sobiyati")) return "Rombel 9A";
    if (cleanName.includes("sayono")) return "Rombel 9B";

    if (userProfile?.assignedClass) return normalizeRombelName(userProfile.assignedClass);
    return "Rombel 8A";
  }, [waliKelasName, userProfile, me, isKamad]);

  const [selectedClass, setSelectedClass] = useState(resolvedWaliClass);

  useEffect(() => {
    setSelectedClass(resolvedWaliClass);
  }, [resolvedWaliClass]);

  const [students, setStudents] = useState<StudentItem[]>([
    { id: "s1", nisn: "12123301000288", name: "ALIYA QIARA ABDULLAH", class: "Rombel 8A", gender: "P", parentName: "Orang Tua Aliya", parentWa: "081234567890", hadirPct: 95.2, statusPresensi: "HADIR" },
    { id: "s2", nisn: "0081928371", name: "ABIGAIL HASAN YUSUF PRAYOGA", class: "Rombel 8A", gender: "L", parentName: "Orang Tua Abigail", parentWa: "081234567894", hadirPct: 100.0, statusPresensi: "HADIR" },
    { id: "s3", nisn: "0081928372", name: "ADITA AZ ZAHRA", class: "Rombel 8A", gender: "P", parentName: "Orang Tua Adita", parentWa: "081234567895", hadirPct: 95.2, statusPresensi: "HADIR" },
  ]);

  const [announcements, setAnnouncements] = useState<PengumumanItem[]>([
    { id: "a1", title: "Rapat Koordinasi Wali Murid & Pembagian Rapor Formatif", content: "Disampaikan kepada seluruh orang tua/wali siswa kelas bimbingan untuk hadir pada rapat koordinasi Sabtu mendatang pukul 08:30 WIB di Aula MTsN 2 Cilacap.", date: "23 Agustus 2026", author: waliKelasName },
  ]);

  const [selectedStudentForSurat, setSelectedStudentForSurat] = useState<StudentItem | null>(null);
  const [isSuratOpen, setIsSuratOpen] = useState(false);
  const [isPrintDataKelasOpen, setIsPrintDataKelasOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    MysqlDataService.getUsers().then((users) => {
      if (!isMounted || !users || users.length === 0) return;
      const siswaList = users.filter((u: any) => u.role === "siswa");
      if (siswaList.length > 0) {
        const formatted = siswaList.map((s: any, idx: number) => {
          const studentClass = normalizeRombelName(s.class_name || s.class);
          return {
            id: s.id || `s_${idx}`,
            nisn: s.nis_nip || s.nis || `008192${1000 + idx}`,
            name: s.full_name || s.name,
            class: studentClass,
            gender: idx % 2 === 0 ? "L" : "P",
            parentName: `Bpk/Ibu ${s.full_name.split(" ")[0]}`,
            parentWa: s.phone || "081234567890",
            hadirPct: Math.round(((20 + (idx % 2)) / 22) * 1000) / 10,
            statusPresensi: "HADIR",
          };
        });
        setStudents(formatted);
      }
    }).catch(() => {});

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

  const handleUpdateStudentParentData = (studentId: string, parentName: string, parentWa: string) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.id === studentId ? { ...item, parentName, parentWa } : item
      )
    );
    const targetStudent = students.find((s) => s.id === studentId);
    MysqlDataService.updateUserProfile({
      id: studentId,
      fullName: targetStudent?.name || "",
      email: `${studentId}@mail.com`,
      phone: parentWa,
    }).catch(() => {});
  };

  const handleAddAnnouncement = (item: { title: string; content: string }) => {
    const newAnn: PengumumanItem = {
      id: "a_" + Date.now(),
      title: item.title,
      content: item.content,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      author: waliKelasName,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    toast.success(`Pengumuman kelas "${item.title}" berhasil diterbitkan!`);
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

  return (
    <div className="space-y-6">
      {isKamad ? (
        <>
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-extrabold text-sm text-foreground">
                  🏛️ Mode Executive Monitoring Kepala Madrasah (Read-Only)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Supervisi terpadu 27 Rombel MTsN 2 Cilacap: Kehadiran siswa, kelengkapan Wali Kelas, & progres rapor.
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
                  <div className="text-xl font-extrabold text-foreground">27 Rombel</div>
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
                    <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">96.8%</div>
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
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">27 / 27 Rombel</div>
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
                  <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">91.2% Tuntas</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
            <div className="flex items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80 w-fit">
              {[
                { id: "rekap_rombel", label: "Matriks 27 Rombel Terpadu", icon: CheckCircle2 },
                { id: "siswa", label: `Detail Roster (${selectedClass})`, icon: Users },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === t.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Filter Rombel:</span>
              <select
                className="h-9 rounded-md border border-border bg-background px-3 text-xs font-bold"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="Semua">Semua 27 Rombel</option>
                <option value="Rombel 7A">Rombel 7A</option>
                <option value="Rombel 7B">Rombel 7B</option>
                <option value="Rombel 8A">Rombel 8A</option>
                <option value="Rombel 8B">Rombel 8B</option>
                <option value="Rombel 9A">Rombel 9A</option>
                <option value="Rombel 9B">Rombel 9B</option>
              </select>
            </div>
          </div>

          {(activeTab === "rekap_rombel" || activeTab === "siswa") && (
            <Card className="border-border">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border">
                    <tr>
                      <th className="p-3">Nama Rombel</th>
                      <th className="p-3">Tingkat Kelas</th>
                      <th className="p-3">Wali Kelas Penanggung Jawab</th>
                      <th className="p-3 text-center">Jumlah Siswa</th>
                      <th className="p-3 text-center">% Presensi Hari Ini</th>
                      <th className="p-3 text-center">Status KBM Live</th>
                      <th className="p-3 text-center">Progres Rapor</th>
                      <th className="p-3 text-right">Supervisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {ROMBEL_MASTER_LIST.map((rombel) => (
                      <tr key={rombel.id} className="hover:bg-muted/30 transition">
                        <td className="p-3 font-bold text-foreground">{rombel.name}</td>
                        <td className="p-3 font-medium text-muted-foreground">{rombel.grade}</td>
                        <td className="p-3 font-semibold text-emerald-600 dark:text-emerald-400">{rombel.wali}</td>
                        <td className="p-3 text-center font-mono font-bold">{rombel.count} Siswa</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-500">{rombel.hadirPct}%</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                            {rombel.statusKbm}
                          </span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-blue-500">{rombel.progressRapor}% Terinput</td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-primary font-bold hover:bg-primary/10"
                            onClick={() => {
                              setSelectedClass(rombel.name);
                              setActiveTab("siswa");
                              toast.info(`Memantau Detail Data Rombel: ${rombel.name}`);
                            }}
                          >
                            👁️ Pantau Rombel →
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {activeTab === "siswa" && selectedClass !== "Semua" && (
            <DaftarSiswaKelasTab
              classNameTitle={selectedClass}
              students={classStudents}
              onSendWa={(s) => toast.info("🔒 Mode Monitoring Kamad: Fitur Kirim WA terbatas untuk Wali Kelas.")}
              onOpenCetakSurat={handleOpenCetakSurat}
              onUpdateStudent={handleUpdateStudentParentData}
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
                  <div className="text-xs text-muted-foreground font-medium">Total Siswa Bimbingan</div>
                  <div className="text-xl font-extrabold text-foreground">{classStudents.length} Siswa</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Siswa Disiplin (≥ 90%)</div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalHadir} Siswa</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
                  <Megaphone className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Pengumuman Kelas</div>
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{announcements.length} Berkas</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0 font-bold">
                  <ShieldCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Status Wali Kelas</div>
                  <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">Aktif Resmi</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80 w-fit">
              {[
                { id: "siswa", label: "Anggota Siswa Kelas", icon: Users },
                { id: "pengumuman", label: "Papan Pengumuman Kelas", icon: Megaphone },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === t.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <t.icon className="h-4 w-4" />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Pilih Kelas Bimbingan:</span>
              <select
                className="h-9 rounded-md border border-border bg-background px-3 text-xs font-bold"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="Rombel 8A">Rombel 8A</option>
                <option value="Rombel 8B">Rombel 8B</option>
                <option value="Rombel 7A">Rombel 7A</option>
                <option value="Rombel 7B">Rombel 7B</option>
                <option value="Rombel 9A">Rombel 9A</option>
                <option value="Rombel 9B">Rombel 9B</option>
                <option value="Semua">Semua Siswa</option>
              </select>

              <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold" onClick={() => setIsPrintDataKelasOpen(true)}>
                <Printer className="h-3.5 w-3.5" /> Cetak Data Kelas PDF
              </Button>
            </div>
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
        waliKelasName={waliKelasName}
        onPrint={() => {
          window.print();
          toast.success("Dokumen Surat Keterangan Wali Kelas berhasil dicetak!");
        }}
      />

      <PrintDataKelasDialog
        isOpen={isPrintDataKelasOpen}
        onOpenChange={setIsPrintDataKelasOpen}
        selectedClass={selectedClass}
        waliKelasName={waliKelasName}
        students={classStudents}
        onPrint={() => {
          window.print();
          toast.success(`Dokumen Laporan Siswa ${selectedClass} berhasil dicetak!`);
        }}
      />
    </div>
  );
}
