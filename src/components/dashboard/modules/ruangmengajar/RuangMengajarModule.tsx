import { useState, useEffect } from "react";
import { MysqlDataService, JournalRow } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import {
  BookOpen,
  Users,
  Video,
  FileText,
  DoorOpen,
  Building2,
  CheckCircle2,
  UserCheck,
  ClipboardList,
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";
import { filterSubjectsForUser, getTeacherAssignedSubjects, getTeacherAssignedClasses } from "@/services/teacherSubjectAccess";

import { KbmHeaderBanner } from "./components/KbmHeaderBanner";
import { JurnalMengajarTab } from "./components/JurnalMengajarTab";
import { PresensiTab } from "./components/PresensiTab";
import { MateriTab } from "./components/MateriTab";
import { AktivitasTab } from "./components/AktivitasTab";
import { CatatanSiswaTab } from "./components/CatatanSiswaTab";
import { RiwayatKbmSection } from "./components/RiwayatKbmSection";
import { TambahJurnalDialog } from "./components/TambahJurnalDialog";

export function RuangMengajarModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const [activeTab, setActiveTab] = useState<"jurnal" | "presensi" | "materi" | "aktivitas" | "catatan_siswa" | "riwayat">("jurnal");
  const me = MysqlAuthService.getActiveUser();
  const currentTeacherName = me?.full_name || userProfile?.name || "SOBIYATI, S.Pd";

  const allowedMapelNames = filterSubjectsForUser(INITIAL_MASTER_MAPEL.map((m) => m.name));
  const assignedSubjects = getTeacherAssignedSubjects();
  const allowedClasses = getTeacherAssignedClasses();

  const [activeRombel, setActiveRombel] = useState(allowedClasses[0] || "Kelas VII A");
  const [activeMapel, setActiveMapel] = useState(assignedSubjects?.[0] || allowedMapelNames[0] || "Pendidikan Kewarganegaraan");

  const [journalList, setJournalList] = useState<any[]>([]);

  const [isAddJurnalOpen, setIsAddJurnalOpen] = useState(false);

  useEffect(() => {
    MysqlDataService.getJournals().then((items) => {
      if (items) {
        setJournalList(items);
      } else {
        setJournalList([]);
      }
    });
  }, []);

  const handleAddJurnal = (newEntry: { title: string; rombel: string; mapel: string; meeting: string; notes: string }) => {
    const item = {
      id: "j_" + Date.now(),
      title: newEntry.title,
      topic: newEntry.title,
      meeting: newEntry.meeting,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      notes: newEntry.notes,
    };
    setJournalList((prev) => [item, ...prev]);
    MysqlDataService.saveJournal({
      guru_name: currentTeacherName,
      rombel: newEntry.rombel,
      mapel: newEntry.mapel,
      materi: newEntry.title,
      catatan: newEntry.notes,
      tanggal: item.date,
      jam_ke: "07:30",
    }).catch(() => {});
    toast.success(`Jurnal KBM "${newEntry.title}" berhasil disimpan!`);
  };

  const handleDeleteJurnal = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus jurnal "${title}"?`)) {
      setJournalList((prev) => prev.filter((j) => j.id !== id));
      await MysqlDataService.deleteJournal(id);
      toast.success(`🗑️ Jurnal "${title}" berhasil dihapus dari Database!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title & Rombel/Mapel Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DoorOpen className="h-6 w-6 text-primary" /> Ruang Kerja Mengajar Guru (KBM Live)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pusat kendali sesi mengajar real-time — presensi, jurnal, materi, aktivitas, dan catatan observasi siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-xs font-bold text-primary"
            value={activeRombel}
            onChange={(e) => setActiveRombel(e.target.value)}
          >
            {allowedClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-xs font-bold"
            value={activeMapel}
            onChange={(e) => setActiveMapel(e.target.value)}
          >
            {allowedMapelNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KBM Hari Ini Live Session Banner Card & Guided 3-Step Flow */}
      <KbmHeaderBanner activeRombel={activeRombel} activeMapel={activeMapel} activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Navigation Work Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80">
        {[
          { id: "presensi", label: "Presensi Siswa", icon: UserCheck },
          { id: "jurnal", label: "Jurnal KBM", icon: BookOpen },
          { id: "materi", label: "Materi Pembelajaran", icon: Video },
          { id: "aktivitas", label: "Aktivitas & LKPD", icon: FileText },
          { id: "catatan_siswa", label: "Catatan Siswa", icon: ClipboardList },
          { id: "riwayat", label: "Riwayat & Laporan KBM", icon: History },
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

      {/* Active Tab Contents */}
      {activeTab === "jurnal" && (
        <JurnalMengajarTab
          journalList={journalList}
          onOpenAddModal={() => setIsAddJurnalOpen(true)}
          onDeleteJurnal={handleDeleteJurnal}
          activeRombel={activeRombel}
          activeMapel={activeMapel}
        />
      )}

      {activeTab === "presensi" && (
        <PresensiTab activeRombel={activeRombel} activeMapel={activeMapel} />
      )}

      {activeTab === "materi" && (
        <MateriTab activeRombel={activeRombel} activeMapel={activeMapel} />
      )}

      {activeTab === "aktivitas" && (
        <AktivitasTab activeRombel={activeRombel} activeMapel={activeMapel} />
      )}

      {activeTab === "catatan_siswa" && (
        <CatatanSiswaTab activeRombel={activeRombel} activeMapel={activeMapel} />
      )}

      {activeTab === "riwayat" && (
        <RiwayatKbmSection />
      )}

      {/* Modal Dialog Tambah Jurnal */}
      <TambahJurnalDialog
        isOpen={isAddJurnalOpen}
        onOpenChange={setIsAddJurnalOpen}
        onAddJurnal={handleAddJurnal}
        activeRombel={activeRombel}
        activeMapel={activeMapel}
      />
    </div>
  );
}
