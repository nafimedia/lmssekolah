import { useState, useEffect } from "react";
import {
  BookOpen,
  Target,
  CalendarCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  Building2,
  FileText,
  Brain,
  MessageSquareHeart,
  Send,
  Eye,
  Download,
  AlertCircle,
  HelpCircle,
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Smile,
  Meh,
  Frown,
  Flame,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { isSameClass } from "@/utils/classNormalization";
import { isSameSubject, normalizeSubjectName } from "@/utils/subjectNormalization";
import { mergeConsecutiveSchedules } from "@/utils/scheduleHelper";
import { AssignmentRow, SubmissionRow } from "@/services/mysqlServerFns";

interface SesiRuangBelajarViewProps {
  userProfile?: any;
  studentName: string;
  studentRombel: string;
  studentNisn: string;
  activeMapel: string;
  materialsList: any[];
  assignmentsList: AssignmentRow[];
  submissionsMap: Map<string, SubmissionRow>;
  onOpenMaterial: (m: any) => void;
  onOpenAssignment: (a: AssignmentRow) => void;
  onBackToAll?: () => void;
}

export function SesiRuangBelajarView({
  userProfile,
  studentName,
  studentRombel,
  studentNisn,
  activeMapel,
  materialsList,
  assignmentsList,
  submissionsMap,
  onOpenMaterial,
  onOpenAssignment,
  onBackToAll,
}: SesiRuangBelajarViewProps) {
  const [loading, setLoading] = useState(true);
  const [sessionJournal, setSessionJournal] = useState<any | null>(null);
  const [teacherName, setTeacherName] = useState<string>("Guru Pengampu");
  const [sessionJam, setSessionJam] = useState<string>("Jam KBM Terjadwal");
  const [myKbmPresensi, setMyKbmPresensi] = useState<any | null>(null);
  const [isSubmittingPresensi, setIsSubmittingPresensi] = useState(false);
  const [learningTopics, setLearningTopics] = useState<any[]>([]);

  // Refleksi state
  const [myReflection, setMyReflection] = useState<any | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>("PAHAM_BAIK");
  const [reflectionKeyLearning, setReflectionKeyLearning] = useState("");
  const [reflectionQuestion, setReflectionQuestion] = useState("");
  const [isSubmittingReflection, setIsSubmittingReflection] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const loadSessionData = async () => {
    try {
      setLoading(true);
      const [allJournals, allPresensi, allSchedules, allNotes, allTopics] = await Promise.all([
        MysqlDataService.getJournals().catch(() => []),
        MysqlDataService.getKbmPresensi(studentRombel, activeMapel, todayStr).catch(() => []),
        MysqlDataService.getJadwalList().catch(() => []),
        MysqlDataService.getStudentKbmNotes(studentRombel, activeMapel).catch(() => []),
        MysqlDataService.getLearningTopics({ subject_name: activeMapel, class_name: studentRombel }).catch(() => []),
      ]);
      setLearningTopics(allTopics || []);

      // 1. Cari Jurnal Pembelajaran Guru Hari Ini atau Jurnal Terakhir untuk Mapel + Rombel ini
      const matchedJournals = (allJournals || []).filter((j: any) => {
        const matchMapel = isSameSubject(j.mapel || "", activeMapel);
        const matchRombel = isSameClass(j.rombel || "", studentRombel);
        return matchMapel && matchRombel;
      });

      // Prioritas: jurnal tanggal hari ini, jika belum ada ambil jurnal terupdate
      const todayJournal = matchedJournals.find((j: any) => (j.tanggal || "").includes(todayStr));
      const activeJournal = todayJournal || matchedJournals[0] || null;
      setSessionJournal(activeJournal);

      // 2. Guru Pengampu dari Jurnal atau Jadwal Pelajaran
      const todayDayName = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(new Date());
      const matchedSchedules = (allSchedules || []).filter((s: any) => {
        const matchDay = (s.hari || "").toLowerCase().trim() === todayDayName.toLowerCase().trim();
        return matchDay && isSameSubject(s.mapel || "", activeMapel) && isSameClass(s.rombel || "", studentRombel);
      });
      const mergedSchedules = mergeConsecutiveSchedules(matchedSchedules);

      if (activeJournal?.guru_name) {
        setTeacherName(activeJournal.guru_name);
      } else if (mergedSchedules.length > 0 && mergedSchedules[0].guru && mergedSchedules[0].guru.trim() !== "-") {
        setTeacherName(mergedSchedules[0].guru);
      } else {
        const fallbackSched = (allSchedules || []).find((s: any) => {
          return isSameSubject(s.mapel || "", activeMapel) && isSameClass(s.rombel || "", studentRombel);
        });
        if (fallbackSched?.guru && fallbackSched.guru.trim() !== "-") {
          setTeacherName(fallbackSched.guru);
        }
      }

      if (activeJournal?.jam_ke) {
        setSessionJam(activeJournal.jam_ke);
      } else if (mergedSchedules.length > 0) {
        setSessionJam(mergedSchedules[0].jamLabel);
      } else {
        const fallbackSched = (allSchedules || []).find((s: any) => {
          return isSameSubject(s.mapel || "", activeMapel) && isSameClass(s.rombel || "", studentRombel);
        });
        if (fallbackSched?.jam) {
          setSessionJam(fallbackSched.jam);
        }
      }

      // 3. Status Presensi Siswa
      const myPres = (allPresensi || []).find((p: any) => {
        const matchNis = studentNisn && p.student_nis === studentNisn;
        const matchName = p.student_name && p.student_name.toLowerCase().trim() === studentName.toLowerCase().trim();
        return matchNis || matchName;
      });
      setMyKbmPresensi(myPres || null);

      // 4. Refleksi Siswa yang sudah dikirim
      const myRefl = (allNotes || []).find((n: any) => {
        const isRefl = n.type === "REFLEKSI";
        const matchName = n.student_name && n.student_name.toLowerCase().trim() === studentName.toLowerCase().trim();
        const matchDate = (n.date_str || "").includes(todayStr);
        return isRefl && matchName && matchDate;
      });
      setMyReflection(myRefl || null);
    } catch (err) {
      console.warn("loadSessionData error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionData();
  }, [studentRombel, activeMapel, studentName]);

  // Handler Konfirmasi Presensi Mandiri Siswa
  const handleConfirmPresensi = async () => {
    try {
      setIsSubmittingPresensi(true);
      const ok = await MysqlDataService.submitStudentSelfPresensi({
        rombel: studentRombel,
        mapel: activeMapel,
        date_str: todayStr,
        student_nis: studentNisn,
        student_name: studentName,
        guru_name: teacherName,
      });

      if (ok) {
        toast.success(`✅ Kehadiran KBM ${activeMapel} berhasil dicatat sebagai HADIR!`);
        setMyKbmPresensi({
          status: "HADIR",
          notes: "Presensi Mandiri Siswa via Ruang Belajar",
          date_str: todayStr,
        });
      } else {
        toast.error("Gagal mencatat presensi mandiri.");
      }
    } catch (e) {
      toast.error("Terjadi kendala saat mengirim presensi.");
    } finally {
      setIsSubmittingPresensi(false);
    }
  };

  // Handler Kirim Refleksi Belajar Siswa
  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionKeyLearning.trim()) {
      toast.error("Silakan tuliskan hal yang kamu pelajari hari ini!");
      return;
    }

    try {
      setIsSubmittingReflection(true);
      const moodText =
        selectedMood === "SANGAT_PAHAM"
          ? "🤩 Sangat Paham & Bersemangat"
          : selectedMood === "PAHAM_BAIK"
          ? "😊 Paham dengan Baik"
          : selectedMood === "CUKUP_PAHAM"
          ? "🤔 Cukup Paham, Perlu Latihan"
          : "🙁 Masih Bingung / Butuh Diskusi";

      const formattedNote = JSON.stringify({
        mood: moodText,
        key_learning: reflectionKeyLearning.trim(),
        questions: reflectionQuestion.trim() || "-",
      });

      const res = await MysqlDataService.saveStudentKbmNote({
        rombel: studentRombel,
        mapel: activeMapel,
        teacher_name: teacherName,
        student_name: studentName,
        type: "REFLEKSI",
        note: formattedNote,
        date_str: todayStr,
      });

      if (res.success) {
        toast.success("✨ Refleksi belajar berhasil dikirim ke catatan guru pengampu!");
        setMyReflection({
          note: formattedNote,
          date_str: todayStr,
        });
      } else {
        toast.error("Gagal menyimpan refleksi belajar.");
      }
    } catch (err) {
      toast.error("Terjadi kendala saat mengirim refleksi.");
    } finally {
      setIsSubmittingReflection(false);
    }
  };

  // 4. Filter Materi KBM yang aktif / Show oleh guru (termasuk Bab Hide seperti di Moodle)
  const lockedTopicIds = new Set(
    learningTopics
      .filter((t: any) => (t.status || "Aktif").toLowerCase() === "terkunci")
      .map((t: any) => String(t.id))
  );

  const activeMaterials = materialsList.filter((m: any) => {
    if (!isSameSubject(m.subject_name || "", activeMapel)) return false;
    // Jika Bab induk disembunyikan (Hide di Moodle), sembunyikan semua materi di Bab ini
    if (m.topic_id && lockedTopicIds.has(String(m.topic_id))) return false;
    const rawStatus = (m.status || "Aktif").toLowerCase().trim();
    return rawStatus !== "terkunci" && rawStatus !== "sembunyi" && rawStatus !== "draf";
  });

  // 5. Filter Tugas & LKPD yang aktif / Show oleh guru
  const activeAssignments = assignmentsList.filter((a: any) => {
    const aMapel = a.mapel || (a as any).subject_name || "";
    if (!isSameSubject(aMapel, activeMapel)) return false;
    const rawStatus = (a.status || "AKTIF").toUpperCase().trim();
    return rawStatus !== "DRAF" && rawStatus !== "DRAFT" && rawStatus !== "TERKUNCI";
  });

  // Pisahkan Tugas/LKPD biasa vs Kuis Formatif (Step 5 vs Step 6)
  const lkpdAndTasks = activeAssignments.filter((a: any) => {
    const rawType = (a.type || a.submission_type || "").toUpperCase();
    return !rawType.includes("QUIZ") && !rawType.includes("KUIS");
  });

  const quizActivities = activeAssignments.filter((a: any) => {
    const rawType = (a.type || a.submission_type || "").toUpperCase();
    return rawType.includes("QUIZ") || rawType.includes("KUIS");
  });

  const parsedReflection = myReflection?.note
    ? (() => {
        try {
          return JSON.parse(myReflection.note);
        } catch {
          return { key_learning: myReflection.note, mood: "Tercatat", questions: "-" };
        }
      })()
    : null;

  return (
    <div className="space-y-4 font-sans text-slate-800 dark:text-slate-200">
      {/* Top Breadcrumb / Return Nav */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-2">
          {onBackToAll && (
            <Button
              size="sm"
              variant="outline"
              onClick={onBackToAll}
              className="h-8 gap-1.5 text-xs font-bold border-border bg-card shadow-2xs hover:bg-muted rounded-xl"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Semua Mapel
            </Button>
          )}
          <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-0.5 shadow-2xs">
            {activeMapel}
          </Badge>
          <Badge variant="outline" className="text-xs font-bold text-muted-foreground border-border bg-card">
            {studentRombel}
          </Badge>
        </div>

        <div className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-emerald-600" />
          <span>{sessionJam}</span>
        </div>
      </div>

      {/* Hero Session Card */}
      <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-background shadow-xs overflow-hidden rounded-2xl">
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="space-y-1">
              <Badge className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 mb-1 gap-1">
                <Sparkles className="h-3 w-3" /> ALUR KELAS BELAJAR DIGITAL KBM
              </Badge>
              <h1 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                {activeMapel} — {studentRombel}
              </h1>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Pendidik / Guru Pengampu: <strong className="text-foreground">{teacherName}</strong></span>
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-card border border-border/80 text-right shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status Kelas</div>
              <div className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {myKbmPresensi?.status === "HADIR" ? "● Siap Belajar (Hadir)" : "● Kelas Dibuka"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* 7 URUTAN PEMBELAJARAN SESUAI PERMINTAAN KLIEN */}
      {/* ========================================================================= */}

      <div className="space-y-4">
        {/* TAHAP 1: JUDUL PEMBELAJARAN */}
        <Card className="border-border shadow-xs bg-card overflow-hidden">
          <CardHeader className="p-3.5 sm:p-4 bg-muted/20 border-b border-border flex flex-row items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold text-xs shadow-2xs">
              1
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-bold text-foreground">
                Judul & Topik Pembelajaran
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Pokok bahasan KBM yang diajarkan pada pertemuan ini
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
              <div className="text-base sm:text-lg font-bold text-foreground leading-snug">
                {sessionJournal?.materi || sessionJournal?.topic || `Pembelajaran Tematik & Penguasaan Kompetensi ${activeMapel}`}
              </div>
              {sessionJournal?.catatan && (
                <div className="text-xs text-muted-foreground border-t border-emerald-500/20 pt-2 leading-relaxed">
                  <strong className="text-foreground">Apersepsi / Pengantar Guru:</strong> {sessionJournal.catatan}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TAHAP 2: TUJUAN PEMBELAJARAN */}
        <Card className="border-border shadow-xs bg-card overflow-hidden">
          <CardHeader className="p-3.5 sm:p-4 bg-muted/20 border-b border-border flex flex-row items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold text-xs shadow-2xs">
              2
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-bold text-foreground">
                Tujuan Pembelajaran (TP)
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Target kompetensi yang wajib dikuasai siswa setelah menyelesaikan kelas ini
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2.5 shadow-2xs">
              <div className="flex items-start gap-2.5">
                <Target className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">
                  {sessionJournal?.tujuan_pembelajaran ||
                    `Siswa mampu memahami konsep dasar, menganalisis materi ajar, serta menerapkan pemahaman pada penugasan LKPD ${activeMapel} secara mandiri dan kritis.`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* TAHAP 3: PRESENSI KBM */}
        <Card className="border-border shadow-xs bg-card overflow-hidden">
          <CardHeader className="p-3.5 sm:p-4 bg-muted/20 border-b border-border flex flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold text-xs shadow-2xs">
                3
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold text-foreground">
                  Presensi Kehadiran Kelas
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Pencatatan kehadiran siswa dalam jam pelajaran {activeMapel}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {myKbmPresensi ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white grid place-items-center shrink-0 shadow-2xs">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-muted-foreground">Status Kehadiran Anda:</div>
                    <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                      {myKbmPresensi.status === "HADIR" ? "✅ HADIR DALAM PEMBELAJARAN" : `ℹ️ ${myKbmPresensi.status}`}
                    </div>
                    {myKbmPresensi.notes && (
                      <p className="text-[11px] text-muted-foreground mt-0.5">{myKbmPresensi.notes}</p>
                    )}
                  </div>
                </div>

                <Badge className="bg-emerald-600 text-white font-bold text-[11px] px-3 py-1 shadow-2xs">
                  Tercatat Resmi
                </Badge>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span>Kehadiran Anda Belum Dikonfirmasi</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Silakan klik tombol konfirmasi di bawah ini untuk mencatatkan kehadiran Anda dalam jam pelajaran {activeMapel}.
                  </p>
                </div>

                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shrink-0 rounded-xl h-8.5 px-4 shadow-2xs"
                  onClick={handleConfirmPresensi}
                  disabled={isSubmittingPresensi}
                >
                  <CalendarCheck className="h-4 w-4" />
                  {isSubmittingPresensi ? "Mencatat Presensi..." : "Konfirmasi Hadir KBM"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* TAHAP 4: KEGIATAN PEMBELAJARAN (MATERI 1, 2, 3...) */}
        <Card className="border-border shadow-xs bg-card overflow-hidden">
          <CardHeader className="p-3.5 sm:p-4 bg-muted/20 border-b border-border flex flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold text-xs shadow-2xs">
                4
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold text-foreground">
                  Kegiatan Pembelajaran (Bahan Ajar)
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Materi ajar bertahap (Materi 1, 2, 3...) yang diterbitkan oleh guru pengampu
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] font-bold text-emerald-600 border-emerald-500/30">
              {activeMaterials.length} Materi Aktif
            </Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {activeMaterials.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border rounded-xl bg-muted/10 space-y-2">
                <BookOpen className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <div className="font-bold text-xs text-foreground">Belum Ada Materi Aktif yang Ditampilkan</div>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  Guru pengampu belum mengaktifkan bahan ajar untuk pertemuan ini. Silakan ikuti instruksi tatap muka guru di kelas.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeMaterials.map((m, idx) => {
                  const rawType = (m.type || "").toUpperCase();
                  const isVideo = rawType.includes("VIDEO");
                  const isPpt = rawType.includes("PPT");
                  const isAudio = rawType.includes("AUDIO");

                  return (
                    <Card key={m.id || idx} className="border-border hover:border-emerald-500/50 bg-card shadow-xs flex flex-col justify-between transition-all">
                      <CardHeader className="p-3.5 pb-2 space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
                          <Badge className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2">
                            Langkah #{idx + 1}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                            {isVideo ? "🎥 Video" : isPpt ? "📊 Slide PPT" : isAudio ? "🎧 Audio" : "📄 Modul Ajar"}
                          </Badge>
                        </div>

                        {m.chapter && (
                          <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            {m.chapter}
                          </div>
                        )}

                        <CardTitle className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-snug">
                          {m.title}
                        </CardTitle>

                        <CardDescription className="text-[11px] text-muted-foreground truncate">
                          Oleh: {m.uploaded_by || teacherName}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="p-3.5 pt-0">
                        <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                          <Button
                            size="sm"
                            className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl h-7.5 shadow-2xs"
                            onClick={() => onOpenMaterial(m)}
                          >
                            <Eye className="h-3.5 w-3.5" /> Buka & Pelajari
                          </Button>

                          {m.file_url && (
                            <a
                              href={m.file_url}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition inline-flex items-center justify-center shrink-0"
                              title="Unduh Berkas Materi"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* TAHAP 5: TUGAS DAN LKPD (SHOW/HIDE OLEH GURU) */}
        <Card className="border-border shadow-xs bg-card overflow-hidden">
          <CardHeader className="p-3.5 sm:p-4 bg-muted/20 border-b border-border flex flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold text-xs shadow-2xs">
                5
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold text-foreground">
                  Tugas dan LKPD
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Lembar kerja penugasan terstruktur yang diterbitkan guru untuk kelas ini
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] font-bold text-blue-600 border-blue-500/30">
              {lkpdAndTasks.length} Tugas / LKPD Aktif
            </Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {lkpdAndTasks.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-border rounded-xl bg-muted/10 space-y-2">
                <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <div className="font-bold text-xs text-foreground">Tidak Ada Tugas atau LKPD Baru</div>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  Pertemuan ini difokuskan pada penguasaan materi ajar dan diskusi di kelas.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lkpdAndTasks.map((task) => {
                  const sub = submissionsMap.get(String(task.id));
                  const isSubmitted = Boolean(sub && (sub.file_url || sub.notes || (sub as any).status === "SUBMITTED"));
                  const isGraded = Boolean(sub && sub.score !== null && sub.score !== undefined);

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-border bg-card hover:border-emerald-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-blue-600 text-white text-[9px] font-bold px-2 py-0.2">
                            {task.type || "LKPD"}
                          </Badge>
                          <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                            {task.title}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span>Batas Waktu: <strong className="text-foreground">{task.due_date || (task as any).dueDate || "Hari ini"}</strong></span>
                          <span>•</span>
                          <span>
                            Status Submisi:{" "}
                            {isGraded ? (
                              <strong className="text-emerald-600 font-bold">🏆 Dinilai ({sub?.score}/100)</strong>
                            ) : isSubmitted ? (
                              <strong className="text-blue-600 font-bold">📤 Sudah Dikumpulkan</strong>
                            ) : (
                              <strong className="text-amber-600 font-bold">⏳ Perlu Dikerjakan</strong>
                            )}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        className={`text-xs font-bold gap-1.5 rounded-xl h-8 px-3.5 shadow-2xs shrink-0 ${
                          isGraded || isSubmitted
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                        onClick={() => onOpenAssignment(task)}
                      >
                        {isGraded ? "👀 Lihat Nilai & Jawaban" : isSubmitted ? "👀 Buka Jawaban" : "🚀 Kerjakan LKPD"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* TAHAP 6: KUIS FORMATIF */}
        <Card className="border-border shadow-xs bg-card overflow-hidden">
          <CardHeader className="p-3.5 sm:p-4 bg-muted/20 border-b border-border flex flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold text-xs shadow-2xs">
                6
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold text-foreground">
                  Kuis Formatif
                </CardTitle>
                <CardDescription className="text-[11px] text-muted-foreground">
                  Uji pemahaman kilat untuk memantau penguasaan materi pembelajaran hari ini
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] font-bold text-purple-600 border-purple-500/30">
              {quizActivities.length} Kuis Formatif
            </Badge>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {quizActivities.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-border rounded-xl bg-muted/10 space-y-1.5">
                <Brain className="h-7 w-7 text-muted-foreground/40 mx-auto" />
                <div className="font-bold text-xs text-foreground">Tidak Ada Kuis Formatif Wajib Hari Ini</div>
                <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                  Guru tidak menetapkan kuis formatif pada pertemuan ini. Anda dapat lanjut ke tahap Refleksi Belajar.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {quizActivities.map((quiz) => {
                  const sub = submissionsMap.get(String(quiz.id));
                  const isDone = Boolean(sub);

                  return (
                    <div
                      key={quiz.id}
                      className="p-3.5 rounded-xl border border-border bg-card hover:border-purple-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-purple-600 text-white text-[9px] font-bold px-2 py-0.2">
                            KUIS FORMATIF
                          </Badge>
                          <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                            {quiz.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Asesmen cepat untuk menguji pemahaman materi {activeMapel}.
                        </p>
                      </div>

                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 rounded-xl h-8 px-3.5 shadow-2xs shrink-0"
                        onClick={() => onOpenAssignment(quiz)}
                      >
                        <Brain className="h-3.5 w-3.5" />
                        {isDone ? "👀 Lihat Hasil Kuis" : "Mulai Kerjakan Kuis"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* TAHAP 7: REFLEKSI PEMBELAJARAN (TANPA NILAI, RESPON PENGALAMAN BELAJAR) */}
        <Card className="border-border shadow-xs bg-card overflow-hidden">
          <CardHeader className="p-3.5 sm:p-4 bg-muted/20 border-b border-border flex flex-row items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white grid place-items-center font-bold text-xs shadow-2xs">
              7
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm font-bold text-foreground">
                Refleksi Pembelajaran Hari Ini
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Ungkapkan pengalaman belajarmu hari ini tanpa dinilai (hanya evaluasi pemahaman untuk guru)
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            {myReflection ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-emerald-500/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span className="font-bold text-xs text-foreground">
                      Refleksi Belajar Anda Telah Dikirim
                    </span>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                    {parsedReflection?.mood || "Tercatat"}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-muted-foreground">1. Hal penting yang dipelajari:</span>
                    <p className="text-foreground mt-0.5 p-2 rounded-lg bg-background/80 border border-border/60">
                      {parsedReflection?.key_learning || myReflection.note}
                    </p>
                  </div>

                  {parsedReflection?.questions && parsedReflection.questions !== "-" && (
                    <div>
                      <span className="font-bold text-muted-foreground">2. Hal yang ingin ditanyakan / didiskusikan:</span>
                      <p className="text-foreground mt-0.5 p-2 rounded-lg bg-background/80 border border-border/60">
                        {parsedReflection.questions}
                      </p>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground italic pt-1">
                  💡 Catatan refleksi Anda sudah tersimpan dan dapat dibaca oleh {teacherName} di jurnal mengajar.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReflection} className="space-y-4">
                {/* 1. Emotikon Pemahaman */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground">
                    1. Bagaimana perasaan & tingkat pemahamanmu terhadap materi hari ini?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: "SANGAT_PAHAM", label: "Sangat Paham", icon: "🤩", desc: "Materi sangat jelas" },
                      { key: "PAHAM_BAIK", label: "Paham Baik", icon: "😊", desc: "Bisa mengikuti KBM" },
                      { key: "CUKUP_PAHAM", label: "Cukup Paham", icon: "🤔", desc: "Perlu latihan lagi" },
                      { key: "BINGUNG", label: "Masih Bingung", icon: "🙁", desc: "Butuh penjelasan guru" },
                    ].map((m) => (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => setSelectedMood(m.key)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col items-center text-center gap-1 ${
                          selectedMood === m.key
                            ? "border-emerald-500 bg-emerald-500/15 ring-2 ring-emerald-500/30 font-bold"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <span className="text-2xl">{m.icon}</span>
                        <span className="text-xs font-bold text-foreground">{m.label}</span>
                        <span className="text-[10px] text-muted-foreground">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Kesimpulan / Pengetahuan Baru */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    2. Apa hal paling menarik atau pengetahuan baru yang kamu pelajari hari ini? <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    placeholder="Contoh: Saya memahami cara kerja sistem gerak dan bagaimana menjaga kesehatan sendi saat berolahraga..."
                    value={reflectionKeyLearning}
                    onChange={(e) => setReflectionKeyLearning(e.target.value)}
                    required
                    className="text-xs min-h-[70px] rounded-xl"
                  />
                </div>

                {/* 3. Pertanyaan / Masukan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    3. Bagian mana yang menurutmu paling menantang atau masih ingin kamu tanyakan ke guru? (Opsional)
                  </label>
                  <Textarea
                    placeholder="Contoh: Mohon dijelaskan kembali bagian penerapan rumus pada contoh soal nomor 3..."
                    value={reflectionQuestion}
                    onChange={(e) => setReflectionQuestion(e.target.value)}
                    className="text-xs min-h-[60px] rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmittingReflection}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl h-8.5 px-4 shadow-2xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isSubmittingReflection ? "Mengirim Refleksi..." : "Kirim Refleksi Pembelajaran"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
