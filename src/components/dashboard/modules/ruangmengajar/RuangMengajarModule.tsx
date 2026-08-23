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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";
import { filterSubjectsForUser, getTeacherAssignedSubjects } from "@/services/teacherSubjectAccess";

import { JurnalMengajarTab } from "./components/JurnalMengajarTab";
import { TambahJurnalDialog } from "./components/TambahJurnalDialog";

export function RuangMengajarModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const [activeTab, setActiveTab] = useState<"jurnal" | "media" | "lkpd">("jurnal");
  const me = MysqlAuthService.getActiveUser();
  const currentTeacherName = me?.full_name || userProfile?.name || "SOBIYATI, S.Pd";

  const allowedMapelNames = filterSubjectsForUser(INITIAL_MASTER_MAPEL.map((m) => m.name));
  const assignedSubjects = getTeacherAssignedSubjects();

  const [activeRombel, setActiveRombel] = useState("Kelas VIII A");
  const [activeMapel, setActiveMapel] = useState(assignedSubjects?.[0] || allowedMapelNames[0] || "Al Qur'an Hadis");

  const [journalList, setJournalList] = useState<any[]>([
    { id: "j1", title: "Hukum Bacaan Mad Silah & Mad Badal", topic: "Hukum Bacaan Mad Silah & Mad Badal", meeting: "Pertemuan 16", date: "23 Agustus 2026", notes: "Siswa membaca dengan tajwid presisi." },
    { id: "j2", title: "Penerapan Tajwid Mad Far'i", topic: "Penerapan Tajwid Mad Far'i", meeting: "Pertemuan 15", date: "16 Agustus 2026", notes: "Praktik membaca bergiliran." },
  ]);

  const [isAddJurnalOpen, setIsAddJurnalOpen] = useState(false);

  useEffect(() => {
    MysqlDataService.getJournals().then((items) => {
      if (items && items.length > 0) {
        setJournalList(items);
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

  const handleDeleteJurnal = (id: string, title: string) => {
    setJournalList((prev) => prev.filter((j) => j.id !== id));
    toast.success(`Jurnal "${title}" berhasil dihapus.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <DoorOpen className="h-6 w-6 text-primary" /> Ruang Mengajar & Jurnal KBM Digital
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola jurnal mengajar, materi pembelajaran, dan presensi KBM.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-xs font-bold text-primary"
            value={activeRombel}
            onChange={(e) => setActiveRombel(e.target.value)}
          >
            <option value="Kelas VII A">Kelas VII A</option>
            <option value="Kelas VII B">Kelas VII B</option>
            <option value="Kelas VIII A">Kelas VIII A (Bimbingan)</option>
            <option value="Kelas VIII B">Kelas VIII B</option>
            <option value="Kelas IX A">Kelas IX A</option>
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

      <div className="flex items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80 w-fit">
        {[
          { id: "jurnal", label: "Jurnal KBM Harian", icon: BookOpen },
          { id: "media", label: "Media Pembelajaran Digital", icon: Video },
          { id: "lkpd", label: "LKPD Digital & Tugas", icon: FileText },
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

      {activeTab === "jurnal" && (
        <JurnalMengajarTab
          journalList={journalList}
          onOpenAddModal={() => setIsAddJurnalOpen(true)}
          onDeleteJurnal={handleDeleteJurnal}
          activeRombel={activeRombel}
          activeMapel={activeMapel}
        />
      )}

      {activeTab === "media" && (
        <Card className="border-border shadow-sm bg-card p-6 text-center space-y-3">
          <Video className="h-12 w-12 text-primary mx-auto opacity-80" />
          <h3 className="font-bold text-base">Media Pembelajaran Digital ({activeMapel})</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Kumpulan slide presentasi PPT, video interaktif, dan modul suplemen digital untuk {activeRombel}.
          </p>
          <div className="pt-2 flex justify-center">
            <Button size="sm" className="bg-primary text-primary-foreground font-bold text-xs" onClick={() => toast.success("Media baru siap diunggah!")}>
              + Unggah Media Pembelajaran
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "lkpd" && (
        <Card className="border-border shadow-sm bg-card p-6 text-center space-y-3">
          <FileText className="h-12 w-12 text-emerald-600 mx-auto opacity-80" />
          <h3 className="font-bold text-base">LKPD Digital & Asesmen Formatif ({activeMapel})</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Bank Lembar Kerja Peserta Didik interaktif & penugasan mandiri siswa MTsN 2 Cilacap.
          </p>
          <div className="pt-2 flex justify-center">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs" onClick={() => toast.success("LKPD baru siap diterbitkan!")}>
              + Buat LKPD Digital Baru
            </Button>
          </div>
        </Card>
      )}

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
