import { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  Send,
  Save,
  Download,
  Inbox,
  Sparkles,
  UserCheck,
  BookOpen,
  Calendar,
  MessageSquare,
  DoorOpen,
  FileCheck2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { AssignmentRow, SubmissionRow } from "@/services/mysqlServerFns";
import { toast } from "sonner";
import { isSameClass } from "@/utils/classNormalization";

interface TugasSiswaModuleProps {
  userProfile?: any;
}

export function TugasSiswaModule({ userProfile }: TugasSiswaModuleProps) {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"semua" | "belum" | "dikumpulkan" | "dinilai">("semua");

  // Live session and today schedule states
  const [liveSession, setLiveSession] = useState<any | null>(null);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [selectedMapelFilter, setSelectedMapelFilter] = useState<string>("SEMUA");

  // Selected assignment for detail & submission modal
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRow | null>(null);
  const [studentNotes, setStudentNotes] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newDiscussionMsg, setNewDiscussionMsg] = useState("");

  useEffect(() => {
    if (!selectedAssignment) {
      setDiscussions([]);
      setNewDiscussionMsg("");
      return;
    }
    MysqlDataService.getLkpdDiscussions(String(selectedAssignment.id)).then((list) => {
      if (list) setDiscussions(list);
      else setDiscussions([]);
    });
  }, [selectedAssignment]);

  const handleSendDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscussionMsg.trim() || !selectedAssignment) return;
    const payload = {
      activity_id: String(selectedAssignment.id),
      user_name: studentName,
      user_role: "siswa",
      message: newDiscussionMsg.trim(),
    };
    const res = await MysqlDataService.postLkpdDiscussion(payload);
    if (res.success) {
      setDiscussions((prev) => [
        ...prev,
        {
          id: res.id || String(Date.now()),
          activity_id: String(selectedAssignment.id),
          user_name: payload.user_name,
          user_role: payload.user_role,
          message: payload.message,
          created_at: "Baru saja",
        },
      ]);
      setNewDiscussionMsg("");
      toast.success("💬 Tanggapan diskusi kelompok terkirim!");
    }
  };
  const [submitting, setSubmitting] = useState(false);

  const studentName = userProfile?.name || "Siswa MTsN 2 Cilacap";
  const studentRombel = userProfile?.rombelName || userProfile?.className || "VIII A";
  const studentEmail = userProfile?.email || "siswa@mtsn2cilacap.sch.id";

  const loadData = async () => {
    setLoading(true);
    try {
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const currentDayName = dayNames[new Date().getDay()];

      const [allAssignments, allSubmissions, dbLkpd, dbActiveSessions, dbJadwal] = await Promise.all([
        MysqlDataService.getAssignments(),
        MysqlDataService.getSubmissions(),
        MysqlDataService.getLkpdActivities(studentRombel, "ALL"),
        MysqlDataService.getActiveKbmSessions(),
        MysqlDataService.getJadwalList(),
      ]);

      const liveSess = (dbActiveSessions || []).find(
        (s: any) => s.status === "SEDANG_BERLANGSUNG" && isSameClass(s.rombel || "", studentRombel)
      );
      setLiveSession(liveSess || null);

      const todaySched = (dbJadwal || []).filter(
        (j: any) =>
          (j.hari || "").toLowerCase().trim() === currentDayName.toLowerCase().trim() &&
          isSameClass(j.rombel || j.class_name || "", studentRombel)
      );
      setTodaySchedules(todaySched || []);

      const mappedLkpdAssignments: AssignmentRow[] = (dbLkpd || [])
        .filter((l: any) => l.type !== "QUIZ")
        .map((l: any) => ({
          id: String(l.id),
          title: l.title,
          mapel: l.mapel || "Mata Pelajaran",
          rombel: l.rombel || studentRombel,
          subject_name: l.mapel || "Mata Pelajaran",
          class_name: l.rombel || studentRombel,
          due_date: l.due_date || "Hari ini",
          max_score: l.max_score || 100,
          instructions: l.instructions || "Kerjakan tugas / LKPD ini sesuai petunjuk guru.",
          type: l.type || "LKPD Digital",
          status: l.status || "AKTIF",
          teacher_name: l.teacher_name || "Guru Pengampu",
        }));

      const combined = [...mappedLkpdAssignments, ...(allAssignments || [])];
      setAssignments(combined);
      setSubmissions(allSubmissions || []);
    } catch (e) {
      console.warn("Gagal memuat data tugas & submisi dari MySQL:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map submissions by assignment_id for current student
  const mySubmissionsMap = new Map<string, SubmissionRow>();
  submissions.forEach((s) => {
    if (s.user_id === studentEmail || s.student_name.toLowerCase() === studentName.toLowerCase()) {
      mySubmissionsMap.set(String(s.assignment_id), s);
    }
  });

  // Calculate Status & Badge for an assignment
  const getTaskStatus = (assignment: AssignmentRow) => {
    const sub = mySubmissionsMap.get(String(assignment.id));
    if (!sub) {
      return { status: "belum", label: "Belum Dikerjakan", color: "bg-red-500/15 text-red-600 border-red-500/30", icon: AlertCircle };
    }
    if (sub.notes?.includes("[DRAFT]")) {
      return { status: "draft", label: "Draft", color: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: Save };
    }
    if (sub.score && sub.score > 0) {
      return { status: "dinilai", label: `Sudah Dinilai: ${sub.score}/100`, color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-bold", icon: CheckCircle2 };
    }
    return { status: "dikumpulkan", label: "Sudah Dikumpulkan", color: "bg-blue-500/15 text-blue-600 border-blue-500/30", icon: Send };
  };

  const uniqueSubjectsSet = new Set<string>();
  (todaySchedules || []).forEach((j: any) => {
    if (j.mapel) uniqueSubjectsSet.add(j.mapel.trim());
  });
  (assignments || []).forEach((a: any) => {
    if (a.mapel) uniqueSubjectsSet.add(a.mapel.trim());
    if ((a as any).subject_name) uniqueSubjectsSet.add((a as any).subject_name.trim());
  });
  const uniqueSubjects = Array.from(uniqueSubjectsSet);

  // Filter Tasks
  const filteredAssignments = assignments.filter((a) => {
    if (selectedMapelFilter !== "SEMUA") {
      const aMapel = (a.mapel || (a as any).subject_name || "").toLowerCase().trim();
      const targetMapel = selectedMapelFilter.toLowerCase().trim();
      if (!aMapel.includes(targetMapel) && !targetMapel.includes(aMapel)) return false;
    }
    const { status } = getTaskStatus(a);
    if (filterTab === "belum") return status === "belum" || status === "draft";
    if (filterTab === "dikumpulkan") return status === "dikumpulkan";
    if (filterTab === "dinilai") return status === "dinilai";
    return true;
  });

  // Metric Counters
  const totalCount = filteredAssignments.length;
  const pendingCount = filteredAssignments.filter((a) => getTaskStatus(a).status === "belum" || getTaskStatus(a).status === "draft").length;
  const submittedCount = filteredAssignments.filter((a) => getTaskStatus(a).status === "dikumpulkan").length;
  const gradedCount = filteredAssignments.filter((a) => getTaskStatus(a).status === "dinilai").length;

  const handleOpenDetail = (assignment: AssignmentRow) => {
    setSelectedAssignment(assignment);
    const existingSub = mySubmissionsMap.get(String(assignment.id));
    if (existingSub) {
      setStudentNotes(existingSub.notes?.replace("[DRAFT] ", "") || "");
      setFileUrl(existingSub.file_url || "");
      setIsDraft(Boolean(existingSub.notes?.includes("[DRAFT]")));
    } else {
      setStudentNotes("");
      setFileUrl("");
      setIsDraft(false);
    }
  };

  const handleSaveSubmission = async (asDraft = false) => {
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      const notesToSave = asDraft ? `[DRAFT] ${studentNotes}` : studentNotes;
      const res = await MysqlDataService.saveSubmission({
        assignment_id: String(selectedAssignment.id),
        user_id: studentEmail,
        student_name: studentName,
        rombel: studentRombel,
        file_url: fileUrl.trim(),
        notes: notesToSave.trim(),
        score: 0,
        feedback: "",
      });

      if (res.success) {
        toast.success(asDraft ? "💾 Draft Jawaban Berhasil Disimpan!" : "🎉 Tugas Berhasil Dikumpulkan Ke Guru!");
        loadData();
        setSelectedAssignment(null);
      } else {
        toast.error("Gagal menyimpan submisi tugas ke MySQL DB.");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat mengunggah tugas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Siswa */}
      <StudentHeaderBanner
        title="Tugas & Submisi LKPD Saya"
        subtitle="Lihat tugas yang diberikan guru pengampu, kerjakan sebelum batas waktu, dan pantau hasil penilaian."
        icon={FileText}
        statusText="Portofolio Tugas Aktif"
        statusVariant="success"
      />

      {/* Papan Informasi Sesi KBM Aktif & Mapel Hari Ini */}
      <Card className={`border-2 transition-all shadow-xs ${
        liveSession
          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20"
          : "border-border bg-card"
      }`}>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`font-extrabold text-xs px-3 py-1 gap-1.5 ${
                  liveSession ? "bg-emerald-600 text-white animate-pulse" : "bg-blue-600 text-white"
                }`}>
                  {liveSession ? (
                    <><Sparkles className="h-3.5 w-3.5" /> KBM LIVE BERLANGSUNG ({liveSession.mapel})</>
                  ) : (
                    <><BookOpen className="h-3.5 w-3.5" /> MATA PELAJARAN KBM HARI INI</>
                  )}
                </Badge>
                <span className="text-xs font-semibold text-muted-foreground font-mono">
                  {studentRombel} · {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>

              {liveSession ? (
                <div>
                  <h3 className="text-base font-black text-foreground flex items-center gap-2 mt-1">
                    <DoorOpen className="h-5 w-5 text-emerald-600" /> {liveSession.mapel}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">
                    Guru Pengampu: <strong className="text-foreground">{liveSession.guru_name || "Guru Kelas"}</strong> · Sesi KBM Tatap Muka Resmi Sedang Dimulai di {studentRombel}
                  </p>
                </div>
              ) : todaySchedules.length > 0 ? (
                <div className="mt-1">
                  <h3 className="text-xs font-bold text-foreground flex flex-wrap items-center gap-1.5">
                    <span>Jadwal Mapel Aktif Hari Ini:</span>
                    {todaySchedules.map((j: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="font-bold text-[11px]">
                        {j.mapel} ({j.jam || j.jam_ke || `Jam ${idx+1}`})
                      </Badge>
                    ))}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {todaySchedules.length} Mata Pelajaran terdaftar untuk kelas {studentRombel} pada sistem akademik madrasah.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1">
                  Tidak ada jadwal KBM resmi terdaftar untuk {studentRombel} pada hari ini.
                </p>
              )}
            </div>

            {/* Filter Mapel Dropdown */}
            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
              <label className="text-xs font-bold text-muted-foreground whitespace-nowrap">Filter Mapel:</label>
              <select
                value={selectedMapelFilter}
                onChange={(e) => setSelectedMapelFilter(e.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-xs font-bold text-primary shadow-2xs"
              >
                <option value="SEMUA">Semua Mapel ({uniqueSubjects.length})</option>
                {uniqueSubjects.map((sub: string) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-sm hover:shadow transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Semua Tugas</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{totalCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Belum Dikerjakan</p>
              <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5">{pendingCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Sudah Dikumpulkan</p>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{submittedCount}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Sudah Dinilai</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{gradedCount}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Task List */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Daftar Tugas & Lembar Kerja (LKPD) Siswa
            </CardTitle>
            <CardDescription className="text-xs">
              Daftar penugasan resmi dari guru pengampu mata pelajaran.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border text-xs w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterTab("semua")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterTab === "semua" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("belum")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterTab === "belum" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Belum Dikerjakan ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("dikumpulkan")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterTab === "dikumpulkan" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sudah Dikumpulkan ({submittedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("dinilai")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterTab === "dinilai" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sudah Dinilai ({gradedCount})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Memuat data tugas...
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-bold text-sm text-foreground">Belum Ada Tugas Terdaftar</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {assignments.length === 0
                  ? "Belum ada penugasan atau LKPD digital yang diberikan oleh guru pengampu untuk kelas Anda."
                  : "Tidak ada tugas yang sesuai dengan filter kategori ini."}
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/70 text-muted-foreground font-bold border-b border-border">
                <tr>
                  <th className="p-3.5">Tugas & Deskripsi</th>
                  <th className="p-3.5">Mata Pelajaran & Guru</th>
                  <th className="p-3.5 text-center">Batas Waktu (Deadline)</th>
                  <th className="p-3.5 text-center">Status Submisi</th>
                  <th className="p-3.5 text-right">Aksi Pengerjaan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAssignments.map((a) => {
                  const taskState = getTaskStatus(a);
                  const sub = mySubmissionsMap.get(String(a.id));
                  return (
                    <tr key={a.id} className="hover:bg-muted/30 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-foreground text-sm flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          {a.title}
                        </div>
                        {a.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {a.description}
                          </p>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-foreground">{a.mapel}</div>
                        <div className="text-[11px] text-muted-foreground">
                          Guru: {a.author_guru || "Guru Pengampu"} • {a.rombel || "Semua Class"}
                        </div>
                      </td>

                      <td className="p-3.5 text-center font-mono">
                        <Badge variant="outline" className="gap-1 border-border font-mono text-[11px]">
                          <Clock className="h-3 w-3 text-amber-500" />
                          {a.due_date || "25 Agustus 2026"}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-center">
                        <Badge variant="outline" className={`gap-1 px-2.5 py-1 ${taskState.color}`}>
                          <taskState.icon className="h-3.5 w-3.5" />
                          {taskState.label}
                        </Badge>
                      </td>

                      <td className="p-3.5 text-right">
                        {taskState.status === "belum" && (
                          <Button size="sm" className="h-8 text-xs font-bold bg-primary text-primary-foreground shadow-xs" onClick={() => handleOpenDetail(a)}>
                            🚀 Kerjakan
                          </Button>
                        )}
                        {taskState.status === "draft" && (
                          <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-amber-500/40 text-amber-600 hover:bg-amber-500/10" onClick={() => handleOpenDetail(a)}>
                            ✏️ Lanjutkan
                          </Button>
                        )}
                        {taskState.status === "dikumpulkan" && (
                          <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-blue-500/40 text-blue-600 hover:bg-blue-500/10" onClick={() => handleOpenDetail(a)}>
                            👀 Lihat Jawaban
                          </Button>
                        )}
                        {taskState.status === "dinilai" && (
                          <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10" onClick={() => handleOpenDetail(a)}>
                            🏆 Lihat Hasil ({sub?.score}/100)
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal Detail & Submisi Tugas */}
      {selectedAssignment && (
        <Dialog open={Boolean(selectedAssignment)} onOpenChange={() => setSelectedAssignment(null)}>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader className="border-b border-border pb-4">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-primary" /> Detail Tugas & Lembar Kerja (LKPD)
              </DialogTitle>
              <DialogDescription className="text-xs">
                Periksa instruksi pengerjaan dari guru, lalu simpan draft atau kumpulkan jawaban Anda.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              {/* Box Informasi Task */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-primary/10 pb-2">
                  <span className="font-bold text-sm text-foreground">{selectedAssignment.title}</span>
                  <Badge variant="outline" className="border-primary/30 text-primary font-bold">
                    {selectedAssignment.mapel}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block">Guru Pengampu:</span>
                    <span className="font-bold text-foreground">{selectedAssignment.author_guru || "Guru Pengampu"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Kelas / Target:</span>
                    <span className="font-bold text-foreground">{selectedAssignment.rombel || studentRombel}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Batas Waktu:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{selectedAssignment.due_date || "25 Agu 2026"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Nilai Maksimal:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">100 Poin</span>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-foreground text-xs block mb-1">📌 Instruksi Guru:</span>
                  <p className="p-3 bg-muted/60 rounded-lg border border-border text-foreground leading-relaxed">
                    {selectedAssignment.description || "Silakan kerjakan soal/tugas pada lembar kerja yang diberikan dan kumpulkan file jawaban sebelum batas waktu pengumpulan."}
                  </p>
                </div>
              </div>

              {/* Status Submisi / Hasil Penilaian Guru */}
              {(() => {
                const sub = mySubmissionsMap.get(String(selectedAssignment.id));
                if (sub && sub.score && sub.score > 0) {
                  return (
                    <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          🏆 Hasil Penilaian Guru Official
                        </span>
                        <Badge className="bg-emerald-600 text-white font-bold text-xs">
                          Nilai: {sub.score} / 100
                        </Badge>
                      </div>
                      {sub.feedback ? (
                        <div className="text-xs text-foreground bg-card/60 p-2.5 rounded-lg border border-emerald-500/20">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">💬 Feedback / Catatan Guru:</span>
                          &quot;{sub.feedback}&quot;
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">Tugas Anda telah selesai diperiksa dan dinilai oleh guru pengampu.</p>
                      )}
                    </div>
                  );
                }

                if (sub && !sub.notes?.includes("[DRAFT]")) {
                  return (
                    <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                      <span className="flex items-center gap-2 font-bold">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" /> Tugas Berhasil Dikumpulkan
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {sub.submitted_at ? `Dikumpulkan: ${new Date(sub.submitted_at).toLocaleDateString("id-ID")}` : "Menunggu penilaian guru"}
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Forum Diskusi Kelompok & Tanya Jawab Interaktif */}
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 space-y-3">
                <h4 className="font-bold text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-blue-600" /> Forum Diskusi Kelompok & Tanya Jawab Interaktif
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono border-blue-400 text-blue-600">
                    {discussions.length} Tanggapan
                  </Badge>
                </h4>

                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {discussions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-2">
                      Belum ada pesan dalam forum diskusi ini. Tulis pertanyaan atau hasil diskusi kelompok Anda di bawah!
                    </p>
                  ) : (
                    discussions.map((d, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-card border border-border text-xs space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-foreground flex items-center gap-1">
                            {d.user_name}
                            <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0">
                              {d.user_role}
                            </Badge>
                          </span>
                          <span className="text-[10px] text-muted-foreground">{d.created_at || "Terkirim"}</span>
                        </div>
                        <p className="text-muted-foreground">{d.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendDiscussion} className="flex gap-2">
                  <Input
                    placeholder="Tulis pesan diskusi kelompok / tanggapan Anda..."
                    value={newDiscussionMsg}
                    onChange={(e) => setNewDiscussionMsg(e.target.value)}
                    className="text-xs"
                  />
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1 shrink-0">
                    <Send className="h-3.5 w-3.5" /> Kirim
                  </Button>
                </form>
              </div>

              {/* Input Jawaban Siswa */}
              <div className="space-y-3 pt-1 border-t border-border">
                <label className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-primary" /> Jawaban / Catatan Siswa
                </label>
                <Textarea
                  placeholder="Tuliskan ringkasan jawaban Anda atau catatan pesan untuk guru pengampu di sini..."
                  rows={4}
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  className="text-xs rounded-xl"
                />

                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-primary" /> Link File Jawaban (PDF / DOCX / Google Drive)
                  </label>
                  <Input
                    placeholder="https://drive.google.com/... atau link dokumen tugas"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Opsional: Lampirkan link file PDF atau dokumen pendukung pengerjaan tugas Anda.
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setSelectedAssignment(null)}>
                  Tutup
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleSaveSubmission(true)}
                    className="text-xs font-bold border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                  >
                    <Save className="h-3.5 w-3.5 mr-1" /> Simpan Draft
                  </Button>

                  <Button
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleSaveSubmission(false)}
                    className="text-xs font-bold bg-primary text-primary-foreground shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5 mr-1" /> Kumpulkan Tugas
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
