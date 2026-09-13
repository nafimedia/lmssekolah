import { useState, useEffect, useRef, useMemo } from "react";
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
  ArrowLeft,
  ExternalLink,
  Trash2,
  Paperclip,
  Eye,
  Link2,
  File,
  Library,
  Video,
  Star,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { MysqlDataService, PeerAssessmentRow } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { AssignmentRow, SubmissionRow } from "@/services/mysqlServerFns";
import { validateUploadedFile } from "@/lib/fileValidation";
import { toast } from "sonner";
import { isSameClass } from "@/utils/classNormalization";
import { normalizeSubjectName, isSameSubject } from "@/utils/subjectNormalization";

interface TugasSiswaModuleProps {
  userProfile?: any;
}

export function TugasSiswaModule({ userProfile }: TugasSiswaModuleProps) {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"semua" | "belum" | "dikumpulkan" | "dinilai">("semua");

  // Live session and class schedule states
  const [liveSession, setLiveSession] = useState<any | null>(null);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [classSchedules, setClassSchedules] = useState<any[]>([]);
  const [selectedMapelFilter, setSelectedMapelFilter] = useState<string>("SEMUA");

  // Selected assignment for detail & submission modal
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRow | null>(null);
  const [studentNotes, setStudentNotes] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadFileSize, setUploadFileSize] = useState("");
  const [uploadMode, setUploadMode] = useState<"FILE" | "URL">("FILE");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraft, setIsDraft] = useState(false);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newDiscussionMsg, setNewDiscussionMsg] = useState("");

  // Peer Assessment States
  const [classmates, setClassmates] = useState<any[]>([]);
  const [peerAssessments, setPeerAssessments] = useState<PeerAssessmentRow[]>([]);
  const [isPeerModalOpen, setIsPeerModalOpen] = useState(false);
  const [targetPeerNisn, setTargetPeerNisn] = useState("");
  const [targetPeerName, setTargetPeerName] = useState("");
  const [starKeaktifan, setStarKeaktifan] = useState(4);
  const [starKerjasama, setStarKerjasama] = useState(4);
  const [starTanggungJawab, setStarTanggungJawab] = useState(4);
  const [starSikap, setStarSikap] = useState(4);
  const [peerFeedback, setPeerFeedback] = useState("");
  const [isSavingPeer, setIsSavingPeer] = useState(false);

  useEffect(() => {
    if (!selectedAssignment) {
      setDiscussions([]);
      setNewDiscussionMsg("");
      setPeerAssessments([]);
      return;
    }
    MysqlDataService.getLkpdDiscussions(String(selectedAssignment.id)).then((list) => {
      if (list) setDiscussions(list);
      else setDiscussions([]);
    });
    MysqlDataService.getPeerAssessments(String(selectedAssignment.id)).then((list) => {
      if (list) setPeerAssessments(list);
      else setPeerAssessments([]);
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

  const me = MysqlAuthService.getActiveUser();
  const studentName = me?.full_name || userProfile?.name || "Siswa MTsN 2 Cilacap";
  const studentRombel = me?.class_name || userProfile?.class_name || userProfile?.rombelName || userProfile?.className || "VIII B";
  const studentEmail = me?.email || userProfile?.email || "siswa@mtsn2cilacap.sch.id";
  const studentNisn = me?.nis_nip || (me as any)?.nis || userProfile?.nis_nip || userProfile?.nis || "";

  const loadData = async () => {
    setLoading(true);
    try {
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const currentDayName = dayNames[new Date().getDay()];

      const [allAssignments, allSubmissions, dbLkpd, dbActiveSessions, dbJadwal, dbPengampu, allUsers] = await Promise.all([
        MysqlDataService.getAssignments(),
        MysqlDataService.getSubmissions(),
        MysqlDataService.getLkpdActivities(studentRombel, "ALL"),
        MysqlDataService.getActiveKbmSessions(),
        MysqlDataService.getJadwalList(),
        MysqlDataService.getPengampuList(),
        MysqlDataService.getUsers().catch(() => []),
      ]);

      const peers = (allUsers || []).filter(
        (u: any) =>
          u.role === "siswa" &&
          isSameClass(u.class_name || u.class || "", studentRombel) &&
          (u.nis_nip || u.nis || "") !== studentNisn &&
          (u.full_name || u.name || "").toLowerCase() !== studentName.toLowerCase()
      );
      setClassmates(peers);

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

      const allClassSched = (dbJadwal || []).filter((j: any) =>
        isSameClass(j.rombel || j.class_name || "", studentRombel)
      );
      setClassSchedules(allClassSched || []);

      const resolveTeacher = (teacherRaw: string | undefined, mapelName: string, rombelName: string) => {
        if (teacherRaw && teacherRaw.trim() !== "" && teacherRaw.trim() !== "Guru Pengampu") {
          return teacherRaw.trim();
        }
        const cleanTargetMapel = (mapelName || "").toLowerCase().trim();
        const found = (dbPengampu || []).find((p: any) => {
          const pMapel = (p.mapel || "").toLowerCase().trim();
          const matchMapel = cleanTargetMapel.includes(pMapel) || pMapel.includes(cleanTargetMapel);
          const matchRombel = isSameClass(p.rombel || "", rombelName);
          return matchMapel && matchRombel;
        }) || (dbPengampu || []).find((p: any) => {
          const pMapel = (p.mapel || "").toLowerCase().trim();
          return cleanTargetMapel.includes(pMapel) || pMapel.includes(cleanTargetMapel);
        });

        if (found && found.guru) return found.guru;
        return teacherRaw || "Guru Pengampu";
      };

      const mappedLkpdAssignments: AssignmentRow[] = (dbLkpd || [])
        .filter((l: any) => (l.status || "").toUpperCase() !== "DRAF")
        .map((l: any) => ({
        id: String(l.id),
        title: l.title,
        mapel: l.mapel || "Mata Pelajaran",
        rombel: l.rombel || studentRombel,
        subject_name: l.mapel || "Mata Pelajaran",
        class_name: l.rombel || studentRombel,
        due_date: l.due_date || "Hari ini",
        max_score: l.max_score || 100,
        description: l.instructions || "Kerjakan tugas / LKPD ini sesuai petunjuk guru.",
        type: l.type || "LKPD Digital",
        status: l.status || "AKTIF",
        author_guru: resolveTeacher(l.teacher_name, l.mapel || "", l.rombel || studentRombel),
        attachment_url: l.attachment_url,
        questions_data: l.questions_data,
        quiz_data: l.quiz_data,
      }));

      const lkpdIds = new Set(mappedLkpdAssignments.map((a) => a.id));
      const filteredAllAssignments = (allAssignments || [])
        .filter(
          (a) => !lkpdIds.has(String(a.id)) && isSameClass(a.rombel || (a as any).class_name || "", studentRombel)
        )
        .map((a) => ({
          ...a,
          author_guru: resolveTeacher(a.author_guru || (a as any).teacher_name, a.mapel || (a as any).subject_name || "", a.rombel || (a as any).class_name || studentRombel),
        }));
      const combined = [...mappedLkpdAssignments, ...filteredAllAssignments];
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

  const uniqueSubjects = useMemo(() => {
    const set = new Set<string>();
    const isExcluded = (m: string) => {
      const lower = (m || "").toLowerCase().trim();
      return lower.includes("bimbingan") || lower.includes("konseling") || lower === "bk";
    };

    (classSchedules || []).forEach((j: any) => {
      if (j.mapel && !isExcluded(j.mapel)) {
        set.add(normalizeSubjectName(j.mapel.trim()));
      }
    });

    (assignments || []).forEach((a: any) => {
      const name = a.mapel || (a as any).subject_name;
      if (name && !isExcluded(name)) {
        set.add(normalizeSubjectName(name.trim()));
      }
    });

    return Array.from(set).sort();
  }, [classSchedules, assignments]);

  // Filter Tasks
  const filteredAssignments = assignments.filter((a) => {
    if (selectedMapelFilter !== "SEMUA") {
      const aMapel = normalizeSubjectName(a.mapel || (a as any).subject_name || "");
      const targetMapel = normalizeSubjectName(selectedMapelFilter);
      if (!isSameSubject(aMapel, targetMapel)) return false;
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
      const existingFile = existingSub.file_url || "";
      setFileUrl(existingFile);
      if (existingFile.startsWith("http")) {
        setUploadMode("URL");
        setUploadFileName(existingFile);
        setUploadFileSize("");
      } else if (existingFile) {
        setUploadMode("FILE");
        const cleanName = existingFile.split("/").pop()?.replace(/^\d+_/, "") || "Berkas_Tugas_Siswa.pdf";
        setUploadFileName(cleanName);
        setUploadFileSize("Tersimpan di Server");
      } else {
        setUploadMode("FILE");
        setUploadFileName("");
        setUploadFileSize("");
      }
      setIsDraft(Boolean(existingSub.notes?.includes("[DRAFT]")));
    } else {
      setStudentNotes("");
      setFileUrl("");
      setUploadFileName("");
      setUploadFileSize("");
      setUploadMode("FILE");
      setIsDraft(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadedFile(file.name, file.size, file.type, {
      maxSizeMb: 10,
      allowedExtensions: ["pdf", "doc", "docx", "jpg", "jpeg", "png"],
    });

    if (!validation.valid) {
      toast.error(`⚠️ Berkas Ditolak: ${validation.error}`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    setUploadFileName(file.name);
    setUploadFileSize(formattedSize);

    const reader = new FileReader();
    reader.onload = () => {
      setFileUrl(reader.result as string);
      toast.success(`📎 Berkas "${file.name}" siap dikumpulkan!`);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteFile = async () => {
    if (!selectedAssignment) return;
    if (fileUrl && fileUrl.startsWith("/uploads/submissions/")) {
      await MysqlDataService.deleteSubmissionFile({
        assignment_id: String(selectedAssignment.id),
        user_id: studentEmail,
        student_name: studentName,
      });
    }
    setFileUrl("");
    setUploadFileName("");
    setUploadFileSize("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("🗑️ Berkas lampiran berhasil dihapus. Anda dapat memilih berkas baru.");
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
        toast.error("Gagal menyimpan pengumpulan tugas.");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat mengunggah tugas.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPeerModal = () => (
    <Dialog open={isPeerModalOpen} onOpenChange={setIsPeerModalOpen}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
            <Star className="h-5 w-5 text-amber-500 fill-amber-400" />
            Penilaian Antarteman (Peer Assessment)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Berikan apresiasi dan nilai kontribusi rekan kelompok Anda secara jujur, adil, dan objektif. Penilaian ini bersifat rahasia antar-siswa.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4 text-xs">
          {/* Pilih Nama Rekan yang Dinilai */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Pilih Teman yang Dinilai:
            </label>
            <Select
              value={targetPeerNisn}
              onValueChange={(val) => {
                setTargetPeerNisn(val);
                const found = classmates.find((c) => (c.nis_nip || c.nis || "") === val);
                if (found) {
                  setTargetPeerName(found.full_name || found.name || "");
                  const prev = peerAssessments.find(
                    (p) =>
                      p.evaluatee_nisn === val &&
                      (p.evaluator_nisn === studentNisn || (p.evaluator_name && p.evaluator_name.toLowerCase() === studentName.toLowerCase()))
                  );
                  if (prev) {
                    setStarKeaktifan(prev.score_keaktifan || 4);
                    setStarKerjasama(prev.score_kerjasama || 4);
                    setStarTanggungJawab(prev.score_tanggung_jawab || 4);
                    setStarSikap(prev.score_sikap || 4);
                    setPeerFeedback(prev.feedback || "");
                  }
                }
              }}
            >
              <SelectTrigger className="w-full text-xs rounded-xl">
                <SelectValue placeholder="-- Pilih nama rekan satu kelas / kelompok --" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {classmates.map((c) => {
                  const nisn = c.nis_nip || c.nis || "";
                  const name = c.full_name || c.name || "Siswa";
                  return (
                    <SelectItem key={nisn || name} value={nisn} className="text-xs">
                      {name} {nisn ? `(${nisn})` : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* 4 Pilar Kriteria Asesmen Format Bintang */}
          <div className="space-y-2.5 pt-1">
            <div className="p-3 rounded-xl border border-border bg-card space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">1. Keaktifan & Inisiatif Ide</span>
                <span className="font-bold text-amber-600 font-mono text-[11px]">{starKeaktifan} / 4 ★</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Aktif memberi usulan ide dan berdiskusi bersama tim.</p>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStarKeaktifan(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      starKeaktifan >= s
                        ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                        : "bg-background text-muted-foreground border-border hover:border-amber-300"
                    }`}
                  >
                    <Star className={`h-3 w-3 ${starKeaktifan >= s ? "fill-white" : ""}`} />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">2. Kerjasama & Kontribusi Tim</span>
                <span className="font-bold text-blue-600 font-mono text-[11px]">{starKerjasama} / 4 ★</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Kompak, tidak egois, dan saling membantu menyelesaikan tugas.</p>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStarKerjasama(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      starKerjasama >= s
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-background text-muted-foreground border-border hover:border-blue-300"
                    }`}
                  >
                    <Star className={`h-3 w-3 ${starKerjasama >= s ? "fill-white" : ""}`} />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">3. Tanggung Jawab Tugas</span>
                <span className="font-bold text-emerald-600 font-mono text-[11px]">{starTanggungJawab} / 4 ★</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Menyelesaikan bagian tugasnya tepat waktu dan sungguh-sungguh.</p>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStarTanggungJawab(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      starTanggungJawab >= s
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-background text-muted-foreground border-border hover:border-emerald-300"
                    }`}
                  >
                    <Star className={`h-3 w-3 ${starTanggungJawab >= s ? "fill-white" : ""}`} />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-card space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">4. Sikap & Menghargai Pendapat</span>
                <span className="font-bold text-purple-600 font-mono text-[11px]">{starSikap} / 4 ★</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Sopan, menghormati saran teman, dan tidak memaksakan kehendak.</p>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStarSikap(s)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      starSikap >= s
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-background text-muted-foreground border-border hover:border-purple-300"
                    }`}
                  >
                    <Star className={`h-3 w-3 ${starSikap >= s ? "fill-white" : ""}`} />
                    <span>{s}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pesan / Masukan Konstruktif */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground block">
              Pesan Umpan Balik Konstruktif (Opsional):
            </label>
            <Input
              placeholder="Tuliskan ucapan terima kasih atau masukan membangun..."
              value={peerFeedback}
              onChange={(e) => setPeerFeedback(e.target.value)}
              className="text-xs rounded-xl"
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPeerModalOpen(false)}
            className="text-xs rounded-xl"
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={isSavingPeer}
            onClick={async () => {
              const currAct: any = selectedAssignment;
              if (!currAct) return;
              if (!targetPeerNisn || !targetPeerName) {
                return toast.error("Silakan pilih teman yang ingin dinilai!");
              }

              setIsSavingPeer(true);
              const avg = Number(((starKeaktifan + starKerjasama + starTanggungJawab + starSikap) / 4).toFixed(2));
              const payload: PeerAssessmentRow = {
                activity_id: String(currAct.id),
                rombel: currAct.rombel || studentRombel,
                mapel: currAct.mapel || currAct.subject_name || "Mata Pelajaran",
                evaluator_nisn: studentNisn || "0123456789",
                evaluator_name: studentName,
                evaluatee_nisn: targetPeerNisn,
                evaluatee_name: targetPeerName,
                score_keaktifan: starKeaktifan,
                score_kerjasama: starKerjasama,
                score_tanggung_jawab: starTanggungJawab,
                score_sikap: starSikap,
                average_score: avg,
                feedback: peerFeedback.trim(),
              };

              const res = await MysqlDataService.savePeerAssessment(payload);
              setIsSavingPeer(false);

              if (res.success) {
                toast.success(`✅ Penilaian untuk ${targetPeerName} berhasil dikirim!`);
                setIsPeerModalOpen(false);
                const updatedList = await MysqlDataService.getPeerAssessments(String(currAct.id));
                if (updatedList) setPeerAssessments(updatedList);
              } else {
                toast.error("Gagal menyimpan penilaian antarteman.");
              }
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 rounded-xl shadow-xs"
          >
            <Star className="h-3.5 w-3.5 fill-white" />
            {isSavingPeer ? "Mengirim Penilaian..." : "Kirim Penilaian Antarteman"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Jika siswa membuka/mengerjakan tugas, tampilkan Halaman Workspace Penuh (bukan popup dialog)
  if (selectedAssignment) {
    const taskState = getTaskStatus(selectedAssignment);
    const existingSub = mySubmissionsMap.get(String(selectedAssignment.id));

    let parsedQuestions: any[] = [];
    if (selectedAssignment.questions_data) {
      try {
        parsedQuestions = JSON.parse(selectedAssignment.questions_data);
        if (!Array.isArray(parsedQuestions)) parsedQuestions = [];
      } catch (e) {
        parsedQuestions = [];
      }
    }

    return (
      <div className="space-y-6">
        {/* Workspace Top Toolbar */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAssignment(null)}
              className="gap-1.5 font-bold text-xs rounded-xl shadow-2xs hover:bg-muted shrink-0"
            >
              <ArrowLeft className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">Kembali ke </span>Daftar Tugas
            </Button>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary">
                  {selectedAssignment.mapel}
                </Badge>
                <span className="text-xs text-muted-foreground">• Kelas {selectedAssignment.rombel || studentRombel}</span>
                <span className="text-xs text-muted-foreground hidden md:inline">• Guru: {selectedAssignment.author_guru || "Guru Pengampu"}</span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight line-clamp-1 mt-0.5">
                {selectedAssignment.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Badge variant="outline" className={`gap-1.5 px-3 py-1 text-xs font-bold ${taskState.color}`}>
              <taskState.icon className="h-3.5 w-3.5" />
              {taskState.label}
            </Badge>
          </div>
        </div>

        {/* 2-Column Split Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri: Panduan Tugas, Butir Soal, & Forum Diskusi */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card Panduan & Instruksi Guru */}
            <Card className="border-border shadow-xs">
              <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" /> Petunjuk & Bahan Rujukan Guru
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    Deadline: <span className="font-bold text-foreground">{selectedAssignment.due_date || "Hari ini"}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Guru Pengampu</span>
                    <span className="font-bold text-foreground">{selectedAssignment.author_guru || "Guru Pengampu"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Target Kelas</span>
                    <span className="font-bold text-foreground">{selectedAssignment.rombel || studentRombel}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase block">Nilai Maksimal</span>
                    <span className="font-bold text-emerald-600">{selectedAssignment.max_score || 100} Poin</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase">Instruksi Pengerjaan:</span>
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap p-3 rounded-xl bg-muted/30 border border-border">
                    {selectedAssignment.description || "Silakan baca petunjuk pengerjaan dan kumpulkan tugas sebelum batas waktu berakhir."}
                  </p>
                </div>

                {selectedAssignment.attachment_url && (
                  <div className="pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      {selectedAssignment.attachment_url.includes("elibrary") ? (
                        <>
                          <Library className="h-4 w-4 text-purple-600 shrink-0" />
                          <span>Referensi modul resmi ditautkan dari Perpustakaan Digital:</span>
                        </>
                      ) : selectedAssignment.attachment_url.includes("youtube") || selectedAssignment.attachment_url.endsWith(".mp4") ? (
                        <>
                          <Video className="h-4 w-4 text-blue-600 shrink-0" />
                          <span>Media video tutorial pembelajaran dilampirkan oleh guru:</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Berkas lembar kerja resmi telah dilampirkan oleh guru pengampu:</span>
                        </>
                      )}
                    </div>
                    <a
                      href={selectedAssignment.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition shrink-0 ${
                        selectedAssignment.attachment_url.includes("elibrary")
                          ? "bg-purple-600 hover:bg-purple-700"
                          : selectedAssignment.attachment_url.includes("youtube") || selectedAssignment.attachment_url.endsWith(".mp4")
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {selectedAssignment.attachment_url.includes("elibrary") ? (
                        <>
                          <BookOpen className="h-4 w-4" /> Buka Referensi E-Library
                        </>
                      ) : selectedAssignment.attachment_url.includes("youtube") || selectedAssignment.attachment_url.endsWith(".mp4") ? (
                        <>
                          <Video className="h-4 w-4" /> Tonton Video Pembelajaran
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" /> Buka / Unduh Berkas PDF
                        </>
                      )}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lembar Butir Pertanyaan / Soal LKPD (jika ada) */}
            {parsedQuestions.length > 0 && (
              <Card className="border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs">
                <CardHeader className="p-4 pb-3 border-b border-emerald-200 dark:border-emerald-900 bg-emerald-100/40 dark:bg-emerald-950/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" /> Lembar Butir Soal Terstruktur LKPD ({parsedQuestions.length} Butir)
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-bold border-emerald-400 text-emerald-700 dark:text-emerald-300">
                      Total {parsedQuestions.reduce((acc: number, q: any) => acc + (Number(q.points) || 0), 0)} Poin
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {parsedQuestions.map((q: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-card text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">Pertanyaan #{idx + 1}</span>
                        <Badge className="bg-emerald-600 text-white font-mono text-[10px]">Bobot: {q.points || 0} Poin</Badge>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap leading-relaxed">{q.question}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Forum Diskusi Kelompok & Tanya Jawab Interaktif */}
            <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 shadow-xs">
              <CardHeader className="p-4 pb-3 border-b border-blue-200 dark:border-blue-900 bg-blue-100/40 dark:bg-blue-950/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" /> Forum Diskusi Kelompok & Tanya Jawab Interaktif
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-mono border-blue-400 text-blue-600">
                    {discussions.length} Tanggapan
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {discussions.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-4">
                      Belum ada pesan dalam forum diskusi ini. Tulis pertanyaan atau hasil musyawarah kelompok Anda di bawah!
                    </p>
                  ) : (
                    discussions.map((d, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-card border border-border text-xs space-y-1 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-foreground flex items-center gap-1.5">
                            {d.user_name}
                            <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0">
                              {d.user_role}
                            </Badge>
                          </span>
                          <span className="text-[10px] text-muted-foreground">{d.created_at || "Terkirim"}</span>
                        </div>
                        <p className="text-foreground leading-relaxed">{d.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendDiscussion} className="flex gap-2 pt-2 border-t border-blue-200 dark:border-blue-900">
                  <Input
                    placeholder="Tulis pesan diskusi kelompok / tanggapan Anda..."
                    value={newDiscussionMsg}
                    onChange={(e) => setNewDiscussionMsg(e.target.value)}
                    className="text-xs rounded-xl"
                  />
                  <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 rounded-xl shrink-0 shadow-xs">
                    <Send className="h-3.5 w-3.5" /> Kirim
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Kartu Penilaian Antarteman (Peer Assessment) */}
            {(selectedAssignment.type === "TUGAS_KELOMPOK" || selectedAssignment.type === "PROYEK_P5" || (selectedAssignment as any).peer_assessment_enabled || selectedAssignment.title.toLowerCase().includes("kelompok") || String((selectedAssignment as any).type || "").toLowerCase().includes("kelompok")) && (
              <Card className="border-amber-300 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs">
                <CardHeader className="p-4 pb-3 border-b border-amber-200 dark:border-amber-900 bg-amber-100/40 dark:bg-amber-950/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          Penilaian Antarteman (Peer Assessment)
                        </CardTitle>
                        <CardDescription className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                          Nilai kontribusi & kerjasama rekan satu kelompok Anda secara rahasia.
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-xs shrink-0 cursor-pointer"
                      onClick={() => {
                        setTargetPeerNisn("");
                        setTargetPeerName("");
                        setStarKeaktifan(4);
                        setStarKerjasama(4);
                        setStarTanggungJawab(4);
                        setStarSikap(4);
                        setPeerFeedback("");
                        setIsPeerModalOpen(true);
                      }}
                    >
                      <Star className="h-3.5 w-3.5 fill-amber-200" /> Nilai Teman Kelompok
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {(() => {
                    const myEvaluations = peerAssessments.filter(
                      (p) =>
                        p.evaluator_nisn === studentNisn ||
                        (p.evaluator_name && p.evaluator_name.toLowerCase() === studentName.toLowerCase())
                    );
                    if (myEvaluations.length === 0) {
                      return (
                        <p className="text-xs text-muted-foreground italic text-center py-2">
                          Anda belum menilai teman satu kelompok. Klik tombol "Nilai Teman Kelompok" di atas untuk menilai rekan Anda.
                        </p>
                      );
                    }
                    return (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-foreground block">
                          Teman yang sudah Anda nilai ({myEvaluations.length} Siswa):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {myEvaluations.map((p, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl border border-border bg-card text-xs flex items-center justify-between shadow-2xs">
                              <div>
                                <span className="font-bold text-foreground block">{p.evaluatee_name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono">NISN: {p.evaluatee_nisn}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 dark:text-amber-400 font-bold gap-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> {p.average_score} ★
                                </Badge>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[11px] text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                  onClick={() => {
                                    setTargetPeerNisn(p.evaluatee_nisn);
                                    setTargetPeerName(p.evaluatee_name);
                                    setStarKeaktifan(p.score_keaktifan || 4);
                                    setStarKerjasama(p.score_kerjasama || 4);
                                    setStarTanggungJawab(p.score_tanggung_jawab || 4);
                                    setStarSikap(p.score_sikap || 4);
                                    setPeerFeedback(p.feedback || "");
                                    setIsPeerModalOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Kolom Kanan: Lembar Jawaban & Pengumpulan Siswa (Sticky) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
            {/* Status Penilaian Guru Official */}
            {existingSub && existingSub.score && existingSub.score > 0 ? (
              <Card className="border-emerald-500/40 bg-emerald-500/10 shadow-xs">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      🏆 Hasil Penilaian Guru Official
                    </span>
                    <Badge className="bg-emerald-600 text-white font-bold text-sm px-2.5 py-0.5">
                      {existingSub.score} / 100
                    </Badge>
                  </div>
                  {existingSub.feedback ? (
                    <div className="text-xs text-foreground bg-card/80 p-3 rounded-xl border border-emerald-500/20 space-y-1">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 block text-[11px]">
                        💬 Catatan / Feedback Guru:
                      </span>
                      <p className="italic leading-relaxed">&quot;{existingSub.feedback}&quot;</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Tugas telah diperiksa dan dinilai oleh guru pengampu.</p>
                  )}
                </CardContent>
              </Card>
            ) : existingSub && !existingSub.notes?.includes("[DRAFT]") ? (
              <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                <span className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-blue-500" /> Tugas Berhasil Dikumpulkan
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {existingSub.submitted_at ? `Dikumpulkan: ${new Date(existingSub.submitted_at).toLocaleDateString("id-ID")}` : "Menunggu penilaian"}
                </span>
              </div>
            ) : null}

            {/* Form Pengerjaan & Pengumpulan Jawaban */}
            <Card className="border-border shadow-md">
              <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
                <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-primary" /> Lembar Jawaban & Submisi Siswa
                </CardTitle>
                <CardDescription className="text-[11px]">
                  Ketikkan jawaban tugas Anda di bawah, atau lampirkan berkas dokumen jawaban.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Textarea Esai Jawaban */}
                <div className="space-y-1.5">
                  <label className="font-bold text-xs text-foreground flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-primary" /> Jawaban / Catatan Siswa
                    </span>
                    <span className="text-[10px] text-muted-foreground font-normal">Ketik langsung di sini</span>
                  </label>
                  <Textarea
                    placeholder="Tuliskan jawaban Anda, uraian analisis, atau ringkasan pengerjaan tugas di sini..."
                    rows={8}
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    className="text-xs rounded-xl font-sans leading-relaxed border-border focus-visible:ring-primary"
                  />
                </div>

                {/* Input Berkas / File Upload Siswa */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <Paperclip className="h-3.5 w-3.5 text-primary" /> Lampiran Berkas Tugas Siswa
                    </label>
                    <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => setUploadMode("FILE")}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                          uploadMode === "FILE"
                            ? "bg-background text-primary shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        📁 Unggah File
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode("URL")}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${
                          uploadMode === "URL"
                            ? "bg-background text-primary shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        🔗 Link Drive
                      </button>
                    </div>
                  </div>

                  {uploadMode === "FILE" ? (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileSelect}
                        className="hidden"
                      />

                      {fileUrl ? (
                        <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2.5 shadow-2xs">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-8 w-8 rounded-lg bg-emerald-600/15 text-emerald-600 flex items-center justify-center shrink-0">
                                <FileCheck2 className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs text-foreground truncate">
                                  {uploadFileName || "Berkas_Tugas_Siswa.pdf"}
                                </div>
                                <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                                  <span>{uploadFileSize || "Berkas Siap"}</span>
                                  <span>•</span>
                                  <span className="text-emerald-600 font-bold">Siap Disimpan</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {fileUrl && !fileUrl.startsWith("data:") && (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-7 px-2.5 rounded-lg border border-border bg-background hover:bg-muted text-[11px] font-bold inline-flex items-center gap-1 text-foreground"
                                >
                                  <Eye className="h-3 w-3 text-primary" /> Lihat
                                </a>
                              )}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleDeleteFile}
                                className="h-7 px-2.5 text-[11px] font-bold border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg gap-1"
                              >
                                <Trash2 className="h-3 w-3" /> Hapus
                              </Button>
                            </div>
                          </div>
                          <div className="text-[10px] text-muted-foreground italic flex items-center gap-1 border-t border-emerald-200 dark:border-emerald-900/40 pt-1.5">
                            <span>💡 Ingin mengganti berkas? Klik <strong>Hapus</strong> lalu pilih file baru.</span>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="p-4 border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-primary/5 rounded-xl cursor-pointer text-center space-y-1.5 transition group"
                        >
                          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto group-hover:scale-105 transition">
                            <Upload className="h-4 w-4" />
                          </div>
                          <div className="font-bold text-xs text-foreground">
                            Klik untuk memilih berkas dari HP / Komputer
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            Format PDF, Word (DOC/DOCX), atau Gambar (Maksimal 10 MB)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="https://drive.google.com/... atau tautan berkas tugas"
                          value={fileUrl}
                          onChange={(e) => {
                            setFileUrl(e.target.value);
                            setUploadFileName(e.target.value);
                          }}
                          className="text-xs rounded-xl"
                        />
                        {fileUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFileUrl("");
                              setUploadFileName("");
                            }}
                            className="h-9 px-2.5 text-xs text-red-600 border-red-200 hover:bg-red-50 rounded-xl shrink-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Sematkan tautan Google Drive / Cloud Storage jika berkas berukuran sangat besar (misal video).
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleSaveSubmission(true)}
                    className="w-full sm:w-auto text-xs font-bold border-amber-500/40 text-amber-600 hover:bg-amber-500/10 rounded-xl"
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" /> Simpan Draft
                  </Button>

                  <Button
                    size="sm"
                    disabled={submitting}
                    onClick={() => handleSaveSubmission(false)}
                    className="w-full sm:w-auto text-xs font-bold bg-primary text-primary-foreground shadow-sm rounded-xl px-4"
                  >
                    <Send className="h-3.5 w-3.5 mr-1.5" /> {existingSub && !existingSub.notes?.includes("[DRAFT]") ? "Perbarui Jawaban" : "Kumpulkan Tugas"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        {renderPeerModal()}
      </div>
    );
  }

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

      {/* Sesi KBM Live Alert Banner (Only shown if teacher is currently teaching) */}
      {liveSession && (
        <div className="p-3.5 px-4 rounded-xl border border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
              SESI KBM LIVE AKTIF: <strong>{liveSession.guru_name || "Guru Pengampu"}</strong> sedang mengajar <strong>{liveSession.mapel}</strong> di kelas Anda ({studentRombel}).
            </span>
          </div>
          <Badge className="bg-emerald-600 text-white font-extrabold text-[10px]">
            SEDANG BERLANGSUNG
          </Badge>
        </div>
      )}

      {/* Filter Tabs & Task List */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="p-3 sm:p-4 pb-3 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-muted/70 rounded-xl border border-border text-xs w-full sm:w-auto overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterTab("belum")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "belum"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>⏳ Perlu Dikerjakan</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${filterTab === "belum" ? "bg-white/20 text-white" : "bg-amber-500/15 text-amber-700 dark:text-amber-300"}`}>
                {pendingCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("dikumpulkan")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "dikumpulkan"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>📤 Dikumpulkan</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${filterTab === "dikumpulkan" ? "bg-white/20 text-white" : "bg-blue-500/15 text-blue-700 dark:text-blue-300"}`}>
                {submittedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("dinilai")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "dinilai"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>✅ Dinilai</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${filterTab === "dinilai" ? "bg-white/20 text-white" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"}`}>
                {gradedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("semua")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === "semua"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Semua</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${filterTab === "semua" ? "bg-white/20 text-white" : "bg-muted-foreground/15 text-foreground"}`}>
                {totalCount}
              </span>
            </button>
          </div>

          {/* Filter Mapel Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">Mapel:</span>
            <select
              value={selectedMapelFilter}
              onChange={(e) => setSelectedMapelFilter(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-bold text-primary shadow-2xs cursor-pointer"
            >
              <option value="SEMUA">Semua Mapel ({uniqueSubjects.length})</option>
              {uniqueSubjects.map((sub: string) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
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
            <>
              {/* Tampilan Kartu Mobile-First (Tampil di Layar HP) */}
              <div className="md:hidden divide-y divide-border">
                {filteredAssignments.map((a) => {
                  const taskState = getTaskStatus(a);
                  const sub = mySubmissionsMap.get(String(a.id));
                  return (
                    <div key={a.id} className="p-3.5 space-y-2.5 hover:bg-muted/20 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary py-0 px-1.5">
                              {a.mapel}
                            </Badge>
                            {a.rombel && (
                              <span className="text-[10px] text-muted-foreground">{a.rombel}</span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug">
                            {a.title}
                          </h4>
                        </div>
                        <Badge variant="outline" className={`gap-1 px-2 py-0.5 text-[10px] shrink-0 font-bold ${taskState.color}`}>
                          <taskState.icon className="h-3 w-3" />
                          {taskState.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
                          <Clock className="h-3 w-3 text-amber-500" />
                          <span>{a.due_date || "Hari ini"}</span>
                        </div>
                        <div>
                          {taskState.status === "belum" && (
                            <Button size="sm" className="h-7 text-xs font-bold bg-primary text-primary-foreground shadow-xs px-3" onClick={() => handleOpenDetail(a)}>
                              🚀 Kerjakan
                            </Button>
                          )}
                          {taskState.status === "draft" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs font-bold border-amber-500/40 text-amber-600 hover:bg-amber-500/10 px-3" onClick={() => handleOpenDetail(a)}>
                              ✏️ Lanjut
                            </Button>
                          )}
                          {taskState.status === "dikumpulkan" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs font-bold border-blue-500/40 text-blue-600 hover:bg-blue-500/10 px-3" onClick={() => handleOpenDetail(a)}>
                              👀 Jawaban
                            </Button>
                          )}
                          {taskState.status === "dinilai" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs font-bold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 px-3" onClick={() => handleOpenDetail(a)}>
                              🏆 Nilai: {sub?.score}/100
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabel Lengkap Desktop */}
              <table className="hidden md:table w-full text-xs text-left">
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
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog Modal Penilaian Antarteman (Peer Assessment) */}
      {renderPeerModal()}
    </div>
  );
}
