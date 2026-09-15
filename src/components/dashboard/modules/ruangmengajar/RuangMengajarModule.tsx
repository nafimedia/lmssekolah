import { useState, useEffect, useMemo } from "react";
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
  History,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { RiwayatKbmSection } from "./components/RiwayatKbmSection";
import { TambahJurnalDialog } from "./components/TambahJurnalDialog";

import { isSameClass } from "@/utils/classNormalization";
import { isSameTeacher } from "@/utils/teacherNameResolver";

export function RuangMengajarModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isKamad = activeRole === "kamad";
  const [activeTab, setActiveTab] = useState<"jurnal" | "presensi" | "materi" | "aktivitas" | "riwayat">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("subtab") as any;
      if (sub === "catatan_siswa") return "jurnal";
      if (sub && ["jurnal", "presensi", "materi", "aktivitas", "riwayat"].includes(sub)) {
        return sub;
      }
    }
    return "jurnal";
  });
  const me = MysqlAuthService.getActiveUser();
  const currentTeacherName = me?.full_name || userProfile?.name || "Guru Pengampu";

  const [dbSubjects, setDbSubjects] = useState<string[]>([]);
  useEffect(() => {
    MysqlDataService.getSubjects().then((subs) => {
      if (subs && subs.length > 0) {
        setDbSubjects(subs.map((s: any) => s.name));
      }
    }).catch(console.error);
  }, []);

  const allMapelPool = dbSubjects.length > 0 ? dbSubjects : INITIAL_MASTER_MAPEL.map((m) => m.name);
  const allowedMapelNames = filterSubjectsForUser(allMapelPool);
  const assignedSubjects = getTeacherAssignedSubjects();
  const allowedClasses = getTeacherAssignedClasses();

  const [activeRombel, setActiveRombel] = useState(allowedClasses[0] || "Kelas VII A");
  const [activeMapel, setActiveMapel] = useState(assignedSubjects?.[0] || allowedMapelNames[0] || "Bahasa Indonesia");

  const [journalList, setJournalList] = useState<any[]>([]);

  const [isAddJurnalOpen, setIsAddJurnalOpen] = useState(false);
  const [customJurnalNotes, setCustomJurnalNotes] = useState<string>("");
  const [kbmProgress, setKbmProgress] = useState({ isPresensiDone: false, isJurnalDone: false, presensiCountStr: "" });

  useEffect(() => {
    let isMounted = true;

    const cleanName = (name: string) =>
      name
        .toLowerCase()
        .replace(/\b(s\.pd|m\.pd|s\.ag|m\.pd\.i|s\.p|h\.|hj\.|s\.pd\.i|m\.si|drs|dra|st|kom)\b/gi, "")
        .replace(/[^a-z0-9\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

    const myCleanName = cleanName(currentTeacherName);
    const myNip = (me?.nis_nip || "").trim();

    const isTeacherMatch = (targetGuruRaw: string) => {
      const raw = (targetGuruRaw || "").trim();
      if (!raw) return false;
      if (myNip && raw.includes(myNip)) return true;
      if (isSameTeacher(raw, currentTeacherName)) return true;

      const cleanTarget = cleanName(raw);
      if (!cleanTarget || !myCleanName) return false;

      if (cleanTarget === myCleanName) return true;
      if (myCleanName.length >= 5 && cleanTarget.includes(myCleanName)) return true;
      if (cleanTarget.length >= 5 && myCleanName.includes(cleanTarget)) return true;

      return false;
    };

    Promise.all([
      MysqlDataService.getJournals(),
      MysqlDataService.getActiveKbmSessions(),
      MysqlDataService.getJadwalPelajaran(),
    ]).then(([items, activeSessions, scheduleList]) => {
      if (!isMounted) return;

      if (items) {
        setJournalList(items);
      } else {
        setJournalList([]);
      }

      // Priority 1: Check live active session started by current teacher
      const myLiveSession = (activeSessions || []).find(
        (s: any) =>
          s.status === "SEDANG_BERLANGSUNG" && isTeacherMatch(s.guru_name || "")
      );

      if (myLiveSession) {
        if (myLiveSession.rombel) {
          const matchedCls = allowedClasses.find((cls) => isSameClass(cls, myLiveSession.rombel)) || myLiveSession.rombel;
          setActiveRombel(matchedCls);
        }
        if (myLiveSession.mapel) setActiveMapel(myLiveSession.mapel);
        return;
      }

      // Priority 2: Check today's schedule for current teacher
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const activeDay = dayNames[new Date().getDay()] || "Kamis";
      const myScheduleToday = (scheduleList || []).find(
        (j: any) =>
          (j.hari || "").toLowerCase().trim() === activeDay.toLowerCase().trim() &&
          isTeacherMatch(j.guru || j.teacher_name || "")
      );

      if (myScheduleToday) {
        const rawRombel = myScheduleToday.rombel || myScheduleToday.kelas;
        if (rawRombel) {
          const matchedCls = allowedClasses.find((cls) => isSameClass(cls, rawRombel)) || rawRombel;
          setActiveRombel(matchedCls);
        }
        if (myScheduleToday.mapel) {
          setActiveMapel(myScheduleToday.mapel);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentTeacherName, me?.nis_nip]);

  const handleAddJurnal = (newEntry: { title: string; rombel: string; mapel: string; meeting: string; notes: string }) => {
    if (isKamad) {
      toast.error("🔒 Akses dibatasi: Kepala Madrasah berada dalam mode supervisi.");
      return;
    }
    const item = {
      id: "j_" + Date.now(),
      title: newEntry.title,
      topic: newEntry.title,
      meeting: newEntry.meeting,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      notes: newEntry.notes,
      rombel: newEntry.rombel,
      mapel: newEntry.mapel,
    };
    setJournalList((prev) => [item, ...prev]);
    if (isSameClass(newEntry.rombel, activeRombel) && newEntry.mapel.toLowerCase().trim() === activeMapel.toLowerCase().trim()) {
      setKbmProgress((prev) => ({ ...prev, isJurnalDone: true }));
    }
    MysqlDataService.saveJournal({
      guru_name: currentTeacherName,
      rombel: newEntry.rombel,
      mapel: newEntry.mapel,
      materi: newEntry.title,
      catatan: newEntry.notes,
      tanggal: item.date,
      jam_ke: "07:30",
    }).catch(() => { });
    toast.success(`Jurnal KBM "${newEntry.title}" berhasil disimpan!`);
  };

  const handleDeleteJurnal = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus jurnal "${title}"?`)) {
      setJournalList((prev) => {
        const nextList = prev.filter((j) => j.id !== id);
        const hasOtherJournalToday = nextList.some((j) => {
          const rombelVal = j.rombel || j.kelas || "";
          const matchRombel = isSameClass(rombelVal, activeRombel);
          const matchMapel = j.mapel && j.mapel.toLowerCase().trim() === activeMapel.toLowerCase().trim();
          return matchRombel && matchMapel;
        });
        setKbmProgress((prevKbm) => ({ ...prevKbm, isJurnalDone: hasOtherJournalToday }));
        return nextList;
      });
      await MysqlDataService.deleteJournal(id);
      toast.success(`🗑️ Jurnal "${title}" berhasil dihapus dari Database!`);
    }
  };

  const matchedAllowedClass = allowedClasses.find((cls: string) => isSameClass(cls, activeRombel));
  const resolvedSelectRombel = matchedAllowedClass || activeRombel;
  const displayClasses = useMemo(() => {
    if (matchedAllowedClass || !activeRombel) return allowedClasses;
    return [activeRombel, ...allowedClasses];
  }, [allowedClasses, activeRombel, matchedAllowedClass]);

  return (
    <div className="space-y-6">
      {/* Module Title & Rombel/Mapel Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <DoorOpen className="h-6 w-6 text-primary" /> Ruang Mengajar Guru (Live)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-xs font-semibold text-primary"
            value={resolvedSelectRombel}
            onChange={(e) => setActiveRombel(e.target.value)}
          >
            {displayClasses.map((cls: string) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border border-border bg-background px-3 text-xs font-semibold"
            value={activeMapel}
            onChange={(e) => setActiveMapel(e.target.value)}
          >
            {allowedMapelNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {isKamad && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 flex items-center justify-between text-xs font-semibold mb-4">
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-600 shrink-0" />
            <span>🏛️ <strong>Mode Monitoring Eksekutif Kepala Madrasah</strong> — Tampilan Supervisi KBM. Memantau pelaksanaan KBM, jurnal mengajar, dan aktivitas siswa tanpa melakukan pengisian data.</span>
          </span>
          <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400 font-mono text-[10px]">SUPERVISI</Badge>
        </div>
      )}

      {/* KBM Hari Ini Live Session Banner Card */}
      <KbmHeaderBanner
        activeRombel={activeRombel}
        activeMapel={activeMapel}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onProgressChange={setKbmProgress}
      />

      {/* Navigation Work Tabs with Integrated Progress Badges */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80">
        {[
          {
            id: "presensi",
            label: "Presensi",
            icon: UserCheck,
            badge: kbmProgress.isPresensiDone ? "✓ Terisi" : null,
          },
          {
            id: "jurnal",
            label: "Jurnal Mengajar",
            icon: BookOpen,
            badge: kbmProgress.isJurnalDone ? "✓ Terisi" : null,
          },
          { id: "materi", label: "Materi", icon: Video },
          { id: "aktivitas", label: "Tugas & LKPD", icon: FileText },
          { id: "riwayat", label: "Riwayat", icon: History },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${activeTab === t.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
            {t.badge && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-all ${activeTab === t.id
                  ? "bg-white/20 text-white"
                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Tab Contents */}
      {activeTab === "jurnal" && (
        <JurnalMengajarTab
          journalList={journalList.filter((j) => {
            const rombelVal = j.rombel || j.kelas || "";
            const matchRombel = !rombelVal || isSameClass(rombelVal, activeRombel);
            const matchMapel =
              !j.mapel ||
              j.mapel === activeMapel ||
              (j.mapel && j.mapel.toLowerCase().trim() === activeMapel.toLowerCase().trim());
            return matchRombel && matchMapel;
          })}
          onOpenAddModal={() => setIsAddJurnalOpen(true)}
          onDeleteJurnal={handleDeleteJurnal}
          activeRombel={activeRombel}
          activeMapel={activeMapel}
          onNavigateToAktivitas={() => setActiveTab("aktivitas")}
        />
      )}

      {activeTab === "presensi" && (
        <PresensiTab
          activeRombel={activeRombel}
          activeMapel={activeMapel}
          onProceedToJurnal={(summary) => {
            setCustomJurnalNotes(summary);
            setActiveTab("jurnal");
            setIsAddJurnalOpen(true);
          }}
        />
      )}

      {activeTab === "materi" && (
        <MateriTab activeRombel={activeRombel} activeMapel={activeMapel} activeRole={activeRole} />
      )}

      {activeTab === "aktivitas" && (
        <AktivitasTab activeRombel={activeRombel} activeMapel={activeMapel} />
      )}

      {activeTab === "riwayat" && (
        <RiwayatKbmSection />
      )}

      {/* Modal Dialog Tambah Jurnal dengan Ringkasan Presensi Otomatis */}
      <TambahJurnalDialog
        isOpen={isAddJurnalOpen}
        onOpenChange={(open) => {
          setIsAddJurnalOpen(open);
          if (!open) setCustomJurnalNotes("");
        }}
        onAddJurnal={(data) => {
          handleAddJurnal(data);
          setCustomJurnalNotes("");
        }}
        activeRombel={activeRombel}
        activeMapel={activeMapel}
        defaultNotes={
          customJurnalNotes ||
          (kbmProgress.presensiCountStr
            ? `Kehadiran KBM: ${kbmProgress.presensiCountStr}. Pembelajaran tatap muka terlaksana dengan baik dan tertib.`
            : "Pembelajaran tatap muka terlaksana dengan baik dan tertib.")
        }
      />
    </div>
  );
}
