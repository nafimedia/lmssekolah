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

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function normalizeRombelName(rawClass?: string | null): string {
  if (!rawClass) return "Rombel 8A";
  const upper = rawClass.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
  if (upper.includes("VIIIA") || upper.includes("8A")) return "Rombel 8A";
  if (upper.includes("VIIIB") || upper.includes("8B")) return "Rombel 8B";
  if (upper.includes("VIIIC") || upper.includes("8C")) return "Rombel 8C";
  if (upper.includes("VIIA") || upper.includes("7A")) return "Rombel 7A";
  if (upper.includes("VIIB") || upper.includes("7B")) return "Rombel 7B";
  if (upper.includes("VIIC") || upper.includes("7C")) return "Rombel 7C";
  if (upper.includes("IXA") || upper.includes("9A")) return "Rombel 9A";
  if (upper.includes("IXB") || upper.includes("9B")) return "Rombel 9B";
  if (upper.includes("IXC") || upper.includes("9C")) return "Rombel 9C";
  return rawClass.startsWith("Rombel") ? rawClass : `Rombel ${rawClass}`;
}

export function ManajemenKelasModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const [activeTab, setActiveTab] = useState<"siswa" | "pengumuman">("siswa");

  const me = MysqlAuthService.getActiveUser();
  const waliKelasName = me?.full_name || userProfile?.name || "SOBIYATI, S.Pd";

  const resolvedWaliClass = useMemo(() => {
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
  }, [waliKelasName, userProfile, me]);

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
    return students.filter((s) => selectedClass === "Semua" || s.class === selectedClass);
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
      <SectionHeader
        title={`Manajemen Kelas ${selectedClass}`}
        sub={`Portal pendampingan bimbingan siswa ${selectedClass}, pemantauan presensi/EWS, pengumuman internal kelas, & layanan komunikasi ortu oleh Wali Kelas (${waliKelasName})`}
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
