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
  GraduationCap,
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
  Search,
  Brain,
  Zap,
  ArrowRight,
  GitCompare,
  ToggleLeft,
  CaseSensitive,
  AlignLeft,
  Hash,
  TextCursorInput,
} from "lucide-react";
import { QuizQuestionType, QUIZ_QUESTION_TYPE_CONFIG } from "@/types/quiz";
import { isArabicText } from "@/utils/arabicHelper";

export interface PeerRatingEntry {
  evaluatee_nisn: string;
  evaluatee_name: string;
  score_keaktifan: number;
  score_kerjasama: number;
  score_tanggung_jawab: number;
  score_sikap: number;
  feedback: string;
  isSaved?: boolean;
}
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
import { getDeadlineStatus } from "@/utils/deadlineHelper";
import { MergedClassSchedule, mergeConsecutiveSchedules } from "@/utils/scheduleHelper";
import { ViewMaterialDialog, MaterialDetail } from "../ruangmengajar/components/ViewMaterialDialog";
import { SesiRuangBelajarView } from "./components/SesiRuangBelajarView";

interface TugasSiswaModuleProps {
  userProfile?: any;
}

export function TugasSiswaModule({ userProfile }: TugasSiswaModuleProps) {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"semua" | "belum" | "dikumpulkan" | "dinilai">("semua");

  // Ruang Belajar: Main Section Tab ("sesi" vs "materi" vs "tugas")
  const [learningSection, setLearningSection] = useState<"sesi" | "materi" | "tugas">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get("sub");
      if (sub === "tugas") return "tugas";
      if (sub === "materi") return "materi";
      if (sub === "sesi") return "sesi";
      const qMapel = params.get("mapel");
      if (qMapel && qMapel.trim()) return "sesi";
    }
    return "sesi";
  });

  // Materials states for student
  const [materialsList, setMaterialsList] = useState<any[]>([]);
  const [selectedMaterialForView, setSelectedMaterialForView] = useState<MaterialDetail | null>(null);
  const [isViewMaterialOpen, setIsViewMaterialOpen] = useState(false);
  const [selectedMateriMapel, setSelectedMateriMapel] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qMapel = params.get("mapel");
      if (qMapel && qMapel.trim()) return qMapel.trim();
    }
    return "SEMUA";
  });
  const [searchMateriQuery, setSearchMateriQuery] = useState<string>("");

  // Live session and class schedule states
  const [liveSession, setLiveSession] = useState<any | null>(null);
  const [activeSessionsList, setActiveSessionsList] = useState<any[]>([]);
  const [todaySchedules, setTodaySchedules] = useState<any[]>([]);
  const [classSchedules, setClassSchedules] = useState<any[]>([]);

  const mergedTodayClasses = useMemo(() => {
    return mergeConsecutiveSchedules(todaySchedules);
  }, [todaySchedules]);
  const [selectedMapelFilter, setSelectedMapelFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const qMapel = params.get("mapel");
      if (qMapel && qMapel.trim()) return qMapel.trim();
    }
    return "SEMUA";
  });

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

  // Peer Assessment Batch / Table States
  const [classmates, setClassmates] = useState<any[]>([]);
  const [peerAssessments, setPeerAssessments] = useState<PeerAssessmentRow[]>([]);
  const [peerRatingsMap, setPeerRatingsMap] = useState<Record<string, PeerRatingEntry>>({});
  const [peerSearchQuery, setPeerSearchQuery] = useState("");
  const [isSavingBulkPeer, setIsSavingBulkPeer] = useState(false);
  const [savingRowNisn, setSavingRowNisn] = useState<string | null>(null);

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
  const [studentQuizAnswers, setStudentQuizAnswers] = useState<Record<number, any>>({});
  const [forceArabicQuizMode, setForceArabicQuizMode] = useState(false);

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

      const [allAssignments, allSubmissions, dbLkpd, dbActiveSessions, dbJadwal, dbPengampu, allUsers, allMaterials] = await Promise.all([
        MysqlDataService.getAssignments(),
        MysqlDataService.getSubmissions(),
        MysqlDataService.getLkpdActivities(studentRombel, "ALL", true),
        MysqlDataService.getActiveKbmSessions(),
        MysqlDataService.getJadwalList(),
        MysqlDataService.getPengampuList(),
        MysqlDataService.getUsers().catch(() => []),
        MysqlDataService.getMaterials().catch(() => []),
      ]);

      // Filter materials relevant to student class / level
      const studentGrade = studentRombel.match(/\d+/)?.[0] || "";
      const matchedMaterials = (allMaterials || []).filter((m: any) => {
        if (!m.class_name || m.class_name === "ALL" || m.class_name === "Semua") return true;
        if (isSameClass(m.class_name, studentRombel)) return true;
        if (
          studentGrade &&
          (m.class_name.includes(studentGrade) ||
            (studentGrade === "7" && m.class_name.includes("VII")) ||
            (studentGrade === "8" && m.class_name.includes("VIII")) ||
            (studentGrade === "9" && m.class_name.includes("IX")))
        ) {
          return true;
        }
        return false;
      });
      setMaterialsList(matchedMaterials);

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
      setActiveSessionsList(dbActiveSessions || []);

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
        .filter((l: any) => !l.rombel || l.rombel === "ALL" || isSameClass(l.rombel, studentRombel))
        .map((l: any) => ({
          id: String(l.id),
          title: l.title,
          mapel: l.mapel || "Mata Pelajaran",
          rombel: l.rombel || studentRombel,
          subject_name: l.mapel || "Mata Pelajaran",
          class_name: l.rombel || studentRombel,
          due_date: l.due_date || "Sesuai Jadwal KBM",
          max_score: l.max_score || 100,
          description: l.instructions || "Kerjakan tugas / LKPD ini sesuai petunjuk guru.",
          type: l.type || "LKPD Digital",
          status: l.status || "AKTIF",
          author_guru: resolveTeacher(l.teacher_name, l.mapel || "", l.rombel || studentRombel),
          attachment_url: l.attachment_url,
          questions_data: l.questions_data,
          quiz_data: l.quiz_data,
          created_at: l.created_at,
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

  // Autosave jawaban kuis ke localStorage perangkat siswa secara realtime
  useEffect(() => {
    if (!selectedAssignment) return;
    const existingSub = mySubmissionsMap.get(String(selectedAssignment.id));
    // Jangan timpa jika kuis sudah berstatus dikumpulkan / final
    if (existingSub && existingSub.notes?.includes("[QUIZ]")) return;

    if (Object.keys(studentQuizAnswers).length > 0) {
      try {
        const cacheKey = `lkpd_quiz_${selectedAssignment.id}_${studentEmail}`;
        localStorage.setItem(cacheKey, JSON.stringify(studentQuizAnswers));
      } catch (err) {
        console.warn("[Autosave Quiz Error]:", err);
      }
    }
  }, [studentQuizAnswers, selectedAssignment, studentEmail, mySubmissionsMap]);

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

  // Open Material Dialog Handler
  const handleOpenMaterial = (m: any) => {
    setSelectedMaterialForView({
      id: String(m.id),
      title: m.title || "Materi Pembelajaran",
      type: m.type || "MODUL_AJAR",
      chapter: m.subject_name || `Pertemuan #${m.sequence_order || 1}`,
      source: m.source || "Unggahan Guru",
      content: m.content_text || "",
      content_text: m.content_text || "",
      url: m.file_url || "",
      file_url: m.file_url || "",
      uploaded_by: m.uploaded_by || "Guru Pengampu",
      sequence_order: m.sequence_order || 1,
      access_mode: m.access_mode || "SISWA_MANDIRI",
    });
    setIsViewMaterialOpen(true);
  };

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return materialsList.filter((m: any) => {
      if (selectedMateriMapel !== "SEMUA") {
        const mMapel = normalizeSubjectName(m.subject_name || "");
        const targetMapel = normalizeSubjectName(selectedMateriMapel);
        if (!isSameSubject(mMapel, targetMapel)) return false;
      }
      if (searchMateriQuery.trim() !== "") {
        const q = searchMateriQuery.toLowerCase();
        const matchTitle = (m.title || "").toLowerCase().includes(q);
        const matchSubject = (m.subject_name || "").toLowerCase().includes(q);
        const matchAuthor = (m.uploaded_by || "").toLowerCase().includes(q);
        if (!matchTitle && !matchSubject && !matchAuthor) return false;
      }
      return true;
    });
  }, [materialsList, selectedMateriMapel, searchMateriQuery]);

  // Available subjects for materials
  const materiSubjects = useMemo(() => {
    const set = new Set<string>();
    materialsList.forEach((m: any) => {
      if (m.subject_name && m.subject_name.trim()) {
        set.add(normalizeSubjectName(m.subject_name.trim()));
      }
    });
    uniqueSubjects.forEach((s) => set.add(s));
    return Array.from(set).sort();
  }, [materialsList, uniqueSubjects]);

  // Synchronize filter when navigating with URL query (?mapel=...)
  useEffect(() => {
    const syncMapelFromUrl = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const qMapel = params.get("mapel");
        if (qMapel && qMapel.trim()) {
          const rawTarget = qMapel.trim();
          const matchedMateri =
            materiSubjects.find((s) => isSameSubject(s, rawTarget)) ||
            normalizeSubjectName(rawTarget) ||
            rawTarget;
          setSelectedMateriMapel(matchedMateri);

          const matchedTugas =
            uniqueSubjects.find((s) => isSameSubject(s, rawTarget)) ||
            normalizeSubjectName(rawTarget) ||
            rawTarget;
          setSelectedMapelFilter(matchedTugas);

          // Otomatis aktifkan Sesi Pembelajaran Terstruktur (7 Tahap)
          setLearningSection("sesi");
        }
      }
    };

    syncMapelFromUrl();
    window.addEventListener("popstate", syncMapelFromUrl);
    return () => window.removeEventListener("popstate", syncMapelFromUrl);
  }, [materiSubjects, uniqueSubjects]);

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

      // Parse existing quiz answers if any
      if (existingSub.notes?.includes("[QUIZ]")) {
        try {
          const rawJson = existingSub.notes.substring(existingSub.notes.indexOf("{"));
          const parsed = JSON.parse(rawJson);
          if (parsed.answers) {
            setStudentQuizAnswers(parsed.answers);
          } else {
            setStudentQuizAnswers({});
          }
        } catch (e) {
          setStudentQuizAnswers({});
        }
      } else {
        setStudentQuizAnswers({});
      }
    } else {
      setStudentNotes("");
      setFileUrl("");
      setUploadFileName("");
      setUploadFileSize("");
      setUploadMode("FILE");
      setIsDraft(false);

      // Pulihkan autosave jawaban kuis dari localStorage jika ada
      try {
        const cacheKey = `lkpd_quiz_${assignment.id}_${studentEmail}`;
        const savedOffline = localStorage.getItem(cacheKey);
        if (savedOffline) {
          const parsed = JSON.parse(savedOffline);
          if (parsed && Object.keys(parsed).length > 0) {
            setStudentQuizAnswers(parsed);
            toast.info("💡 Draf jawaban kuis sebelumnya dipulihkan dari memori perangkat.");
          } else {
            setStudentQuizAnswers({});
          }
        } else {
          setStudentQuizAnswers({});
        }
      } catch {
        setStudentQuizAnswers({});
      }
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

  const handleSubmitQuiz = async () => {
    if (!selectedAssignment) return;
    let questions: any[] = [];
    if (selectedAssignment.quiz_data) {
      try {
        questions = JSON.parse(selectedAssignment.quiz_data);
      } catch (e) { }
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return toast.error("Data butir soal kuis tidak ditemukan.");
    }

    const answeredCount = Object.keys(studentQuizAnswers).filter((k) => {
      const val = studentQuizAnswers[Number(k)];
      if (val === undefined || val === null) return false;
      if (typeof val === "string") return val.trim().length > 0;
      if (typeof val === "object") return Object.keys(val).length > 0;
      return true;
    }).length;

    if (answeredCount < questions.length) {
      if (!confirm(`Anda baru menjawab ${answeredCount} dari ${questions.length} butir soal. Apakah Anda yakin ingin mengumpulkan kuis ini sekarang?`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      let totalMaxPoints = 0;
      let totalEarnedPoints = 0;
      let correctCount = 0;
      let hasEssay = false;

      questions.forEach((q: any, idx: number) => {
        const qPoints = Number(q.points) || 10;
        totalMaxPoints += qPoints;
        const qType: QuizQuestionType = q.type || "PG";
        const studentAns = studentQuizAnswers[idx];

        if (qType === "PG") {
          const studentChoice = (studentAns || "").toString().trim().toUpperCase();
          const correctChoice = (q.keyAnswer || "A").toString().trim().toUpperCase();
          if (studentChoice && studentChoice === correctChoice) {
            totalEarnedPoints += qPoints;
            correctCount++;
          }
        } else if (qType === "BENAR_SALAH") {
          const studentChoice = (studentAns || "").toString().trim().toUpperCase();
          const correctChoice = (q.keyAnswer || "BENAR").toString().trim().toUpperCase();
          if (studentChoice && studentChoice === correctChoice) {
            totalEarnedPoints += qPoints;
            correctCount++;
          }
        } else if (qType === "ISIAN_SINGKAT") {
          const studentText = (studentAns || "").toString().trim().toLowerCase();
          const targetText = (q.keyAnswer || "").toString().trim().toLowerCase();
          if (studentText && targetText && studentText === targetText) {
            totalEarnedPoints += qPoints;
            correctCount++;
          }
        } else if (qType === "MELENGKAPI") {
          const studentText = (studentAns || "").toString().trim().toLowerCase();
          const targetText = (q.clozeAnswer || q.keyAnswer || "").toString().trim().toLowerCase();
          if (studentText && targetText && studentText === targetText) {
            totalEarnedPoints += qPoints;
            correctCount++;
          }
        } else if (qType === "NUMERIK") {
          const studentNum = parseFloat(String(studentAns || "").replace(",", "."));
          const targetNum = parseFloat(String(q.keyAnswer || "0").replace(",", "."));
          const tolerance = parseFloat(String(q.tolerance || "0")) || 0;
          if (!isNaN(studentNum) && !isNaN(targetNum)) {
            if (Math.abs(studentNum - targetNum) <= tolerance) {
              totalEarnedPoints += qPoints;
              correctCount++;
            }
          }
        } else if (qType === "MENJODOHKAN") {
          const pairs: Array<{ left: string; right: string }> = q.pairs || [];
          if (pairs.length > 0 && typeof studentAns === "object" && studentAns !== null) {
            let matchingCorrect = 0;
            pairs.forEach((pair, pIdx) => {
              const studentPairVal = (studentAns[pIdx] || "").toString().trim().toLowerCase();
              const correctPairVal = pair.right.trim().toLowerCase();
              if (studentPairVal && studentPairVal === correctPairVal) {
                matchingCorrect++;
              }
            });
            const pairEarned = (matchingCorrect / pairs.length) * qPoints;
            totalEarnedPoints += pairEarned;
            if (matchingCorrect === pairs.length) {
              correctCount++;
            }
          }
        } else if (qType === "ESAI") {
          hasEssay = true;
          // Jawaban esai disimpan untuk dievaluasi oleh guru
        }
      });

      const calculatedScore = totalMaxPoints > 0
        ? Math.min(100, Math.round((totalEarnedPoints / totalMaxPoints) * 100))
        : 100;

      const notesPayload = `[QUIZ] ${JSON.stringify({
        score: calculatedScore,
        earnedPoints: Math.round(totalEarnedPoints),
        totalPoints: totalMaxPoints,
        correctCount,
        totalQuestions: questions.length,
        hasEssay,
        answers: studentQuizAnswers,
        completedAt: new Date().toISOString(),
      })}`;

      const feedbackText = hasEssay
        ? `Kuis formatif otomatis dinilai: ${Math.round(totalEarnedPoints)}/${totalMaxPoints} poin tercatat. Butir esai menunggu evaluasi guru.`
        : `Kuis formatif otomatis dinilai: ${correctCount}/${questions.length} butir benar (${calculatedScore} Poin).`;

      const res = await MysqlDataService.saveSubmission({
        assignment_id: String(selectedAssignment.id),
        user_id: studentEmail,
        student_name: studentName,
        rombel: studentRombel,
        file_url: "",
        notes: notesPayload,
        score: calculatedScore,
        feedback: feedbackText,
      });

      if (res.success) {
        // Hapus autosave offline setelah kuis berhasil terkirim
        try {
          const cacheKey = `lkpd_quiz_${selectedAssignment.id}_${studentEmail}`;
          localStorage.removeItem(cacheKey);
        } catch {}

        // Sinkronisasi otomatis ke lkpd_grades agar guru langsung melihat skor kuis di Ruang Mengajar
        try {
          await MysqlDataService.saveLkpdGradesBatch(String(selectedAssignment.id), [
            {
              activity_id: String(selectedAssignment.id),
              student_id: studentEmail,
              student_nisn: studentNisn || studentEmail,
              student_name: studentName,
              status: "SUDAH_DINILAI",
              score: String(calculatedScore),
              feedback: feedbackText,
            }
          ]);
        } catch (syncErr) {
          console.warn("[saveLkpdGradesBatch sync warning]:", syncErr);
        }

        toast.success(`🎉 Kuis Selesai! Skor Anda: ${calculatedScore} / 100 (${correctCount}/${questions.length} Benar)`);
        await loadData();
        setSelectedAssignment(null);
      } else {
        toast.error("Gagal mengumpulkan jawaban kuis.");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat memproses kuis.");
    } finally {
      setSubmitting(false);
    }
  };

  // Sinkronisasi data teman sekelas dan nilai evaluasi yang sudah tersimpan di database
  useEffect(() => {
    if (!classmates || classmates.length === 0) return;
    setPeerRatingsMap((prev) => {
      const next = { ...prev };
      for (const c of classmates) {
        const nisn = c.nis_nip || c.nis || "";
        const name = c.full_name || c.name || "Siswa";
        if (!nisn) continue;

        const prevEval = peerAssessments.find(
          (p) =>
            p.evaluatee_nisn === nisn &&
            (p.evaluator_nisn === studentNisn || (p.evaluator_name && p.evaluator_name.toLowerCase() === studentName.toLowerCase()))
        );

        if (prevEval) {
          next[nisn] = {
            evaluatee_nisn: nisn,
            evaluatee_name: name,
            score_keaktifan: prevEval.score_keaktifan || 4,
            score_kerjasama: prevEval.score_kerjasama || 4,
            score_tanggung_jawab: prevEval.score_tanggung_jawab || 4,
            score_sikap: prevEval.score_sikap || 4,
            feedback: prevEval.feedback || "",
            isSaved: true,
          };
        } else if (!next[nisn]) {
          next[nisn] = {
            evaluatee_nisn: nisn,
            evaluatee_name: name,
            score_keaktifan: 4,
            score_kerjasama: 4,
            score_tanggung_jawab: 4,
            score_sikap: 4,
            feedback: "",
            isSaved: false,
          };
        }
      }
      return next;
    });
  }, [classmates, peerAssessments, studentNisn, studentName]);

  const handleUpdatePeerRating = (nisn: string, field: keyof PeerRatingEntry, value: any) => {
    setPeerRatingsMap((prev) => {
      const current = prev[nisn] || {
        evaluatee_nisn: nisn,
        evaluatee_name: "",
        score_keaktifan: 4,
        score_kerjasama: 4,
        score_tanggung_jawab: 4,
        score_sikap: 4,
        feedback: "",
      };
      return {
        ...prev,
        [nisn]: {
          ...current,
          [field]: value,
          isSaved: false,
        },
      };
    });
  };

  const handleSaveSinglePeer = async (nisn: string) => {
    const item = peerRatingsMap[nisn];
    if (!item || !selectedAssignment) return;
    setSavingRowNisn(nisn);
    const avg = Number(((item.score_keaktifan + item.score_kerjasama + item.score_tanggung_jawab + item.score_sikap) / 4).toFixed(2));
    const payload: PeerAssessmentRow = {
      activity_id: String(selectedAssignment.id),
      rombel: selectedAssignment.rombel || studentRombel,
      mapel: selectedAssignment.mapel || (selectedAssignment as any).subject_name || "Mata Pelajaran",
      evaluator_nisn: studentNisn || "0123456789",
      evaluator_name: studentName,
      evaluatee_nisn: item.evaluatee_nisn,
      evaluatee_name: item.evaluatee_name,
      score_keaktifan: item.score_keaktifan,
      score_kerjasama: item.score_kerjasama,
      score_tanggung_jawab: item.score_tanggung_jawab,
      score_sikap: item.score_sikap,
      average_score: avg,
      feedback: item.feedback.trim(),
    };
    const res = await MysqlDataService.savePeerAssessment(payload);
    setSavingRowNisn(null);
    if (res.success) {
      toast.success(`✅ Penilaian untuk "${item.evaluatee_name}" berhasil disimpan!`);
      setPeerRatingsMap((prev) => ({
        ...prev,
        [nisn]: { ...prev[nisn], isSaved: true },
      }));
      const updatedList = await MysqlDataService.getPeerAssessments(String(selectedAssignment.id));
      if (updatedList) setPeerAssessments(updatedList);
    } else {
      toast.error(`Gagal menyimpan penilaian untuk "${item.evaluatee_name}".`);
    }
  };

  const handleSaveAllPeers = async () => {
    if (!selectedAssignment) return;
    const entries = Object.values(peerRatingsMap);
    if (entries.length === 0) {
      return toast.error("Tidak ada data rekan untuk dinilai.");
    }
    setIsSavingBulkPeer(true);
    const payloads: PeerAssessmentRow[] = entries.map((item) => {
      const avg = Number(((item.score_keaktifan + item.score_kerjasama + item.score_tanggung_jawab + item.score_sikap) / 4).toFixed(2));
      return {
        activity_id: String(selectedAssignment.id),
        rombel: selectedAssignment.rombel || studentRombel,
        mapel: selectedAssignment.mapel || (selectedAssignment as any).subject_name || "Mata Pelajaran",
        evaluator_nisn: studentNisn || "0123456789",
        evaluator_name: studentName,
        evaluatee_nisn: item.evaluatee_nisn,
        evaluatee_name: item.evaluatee_name,
        score_keaktifan: item.score_keaktifan,
        score_kerjasama: item.score_kerjasama,
        score_tanggung_jawab: item.score_tanggung_jawab,
        score_sikap: item.score_sikap,
        average_score: avg,
        feedback: item.feedback.trim(),
      };
    });

    const res = await MysqlDataService.saveBulkPeerAssessments(payloads);
    setIsSavingBulkPeer(false);
    if (res.success) {
      toast.success(`🎉 Berhasil menyimpan seluruh penilaian untuk ${res.count} rekan!`);
      setPeerRatingsMap((prev) => {
        const next = { ...prev };
        for (const k of Object.keys(next)) {
          next[k] = { ...next[k], isSaved: true };
        }
        return next;
      });
      const updatedList = await MysqlDataService.getPeerAssessments(String(selectedAssignment.id));
      if (updatedList) setPeerAssessments(updatedList);
    } else {
      toast.error("Gagal menyimpan beberapa penilaian antarteman.");
    }
  };

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

    let parsedQuizQuestions: any[] = [];
    if (selectedAssignment.quiz_data) {
      try {
        parsedQuizQuestions = JSON.parse(selectedAssignment.quiz_data);
        if (!Array.isArray(parsedQuizQuestions)) parsedQuizQuestions = [];
      } catch (e) {
        parsedQuizQuestions = [];
      }
    }

    const isQuiz = selectedAssignment.type === "QUIZ" || parsedQuizQuestions.length > 0;
    const isGroupTask =
      selectedAssignment.type === "TUGAS_KELOMPOK" ||
      selectedAssignment.type === "PROYEK_P5" ||
      Boolean((selectedAssignment as any).peer_assessment_enabled) ||
      selectedAssignment.title.toLowerCase().includes("kelompok") ||
      String((selectedAssignment as any).type || "").toLowerCase().includes("kelompok");

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
                  {(() => {
                    const dl = getDeadlineStatus(selectedAssignment.due_date, (selectedAssignment as any).created_at);
                    return (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono">
                        <Clock className={`h-3.5 w-3.5 ${dl.isOverdue ? "text-rose-500" : dl.isToday ? "text-amber-500" : "text-muted-foreground"}`} />
                        <span className="text-muted-foreground">Deadline:</span>
                        <span className={dl.textColor}>
                          {dl.isOverdue ? `Terlewat (${dl.displayText})` : dl.displayText}
                        </span>
                      </div>
                    );
                  })()}
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
                    <span className="font-bold text-emerald-600">
                      {typeof selectedAssignment.max_score === "string" && isNaN(Number(selectedAssignment.max_score))
                        ? `Predikat ${selectedAssignment.max_score}`
                        : `${selectedAssignment.max_score || 100} Poin`}
                    </span>
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
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-white font-bold text-xs shadow-xs transition shrink-0 ${selectedAssignment.attachment_url.includes("elibrary")
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

            {/* Lembar Butir Pertanyaan / Soal LKPD (hanya jika bukan kuis pilihan ganda) */}
            {!isQuiz && parsedQuestions.length > 0 && (
              <Card className="border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs">
                <CardHeader className="p-4 pb-3 border-b border-emerald-200 dark:border-emerald-900 bg-emerald-100/40 dark:bg-emerald-950/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      {selectedAssignment.type === "PRAKTIKUM"
                        ? `Lembar Langkah & Pengamatan Praktikum (${parsedQuestions.length} Butir)`
                        : selectedAssignment.type === "HAFALAN"
                          ? `Target Ayat & Butir Setoran Hafalan (${parsedQuestions.length} Butir)`
                          : selectedAssignment.type === "PROYEK_P5"
                            ? `Tahapan & Lembar Kegiatan Kokurikuler (${parsedQuestions.length} Butir)`
                            : `Lembar Butir Soal Terstruktur (${parsedQuestions.length} Butir)`}
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

            {/* Forum Diskusi Kelompok & Tanya Jawab Interaktif (HANYA untuk Tugas Kelompok) */}
            {isGroupTask && (
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
            )}

            {/* Kartu Penilaian Antarteman (Peer Assessment) - Model Praktis Seluruh Rekan Sekelas (HANYA untuk Tugas Kelompok) */}
            {isGroupTask && (() => {
              const filteredClassmates = classmates.filter((c) => {
                const name = (c.full_name || c.name || "").toLowerCase();
                const nisn = (c.nis_nip || c.nis || "").toLowerCase();
                const q = peerSearchQuery.toLowerCase().trim();
                if (!q) return true;
                return name.includes(q) || nisn.includes(q);
              });
              const evaluatedCount = Object.values(peerRatingsMap).filter((p) => p.isSaved).length;

              return (
                <Card className="border-amber-300 dark:border-amber-900 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs">
                  <CardHeader className="p-4 pb-3 border-b border-amber-200 dark:border-amber-900 bg-amber-100/40 dark:bg-amber-950/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-sm font-bold text-amber-950 dark:text-amber-200">
                              Penilaian Antarteman (Peer Assessment)
                            </CardTitle>
                            <Badge variant="outline" className="text-[10px] font-mono border-amber-300 text-amber-800 dark:text-amber-300 bg-amber-50/60 dark:bg-amber-950/40">
                              {classmates.length} Teman Sekelas
                            </Badge>
                            <Badge className="bg-emerald-600 text-white text-[10px] font-mono font-bold">
                              {evaluatedCount}/{classmates.length} Sudah Dinilai
                            </Badge>
                          </div>
                          <CardDescription className="text-[11px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                            Nilai kontribusi & kerjasama rekan sekelompok Anda secara langsung di bawah ini. Penilaian tersimpan rahasia.
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <div className="relative w-full sm:w-48">
                          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                          <Input
                            placeholder="Cari teman..."
                            value={peerSearchQuery}
                            onChange={(e) => setPeerSearchQuery(e.target.value)}
                            className="h-8 pl-8 text-xs rounded-lg bg-background"
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          disabled={isSavingBulkPeer || classmates.length === 0}
                          onClick={handleSaveAllPeers}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer h-8 rounded-lg"
                        >
                          <Save className="h-3.5 w-3.5" />
                          {isSavingBulkPeer ? "Menyimpan..." : "Simpan Semua Penilaian"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3 sm:p-4 space-y-3">
                    {classmates.length === 0 ? (
                      <div className="p-6 rounded-xl border border-dashed border-amber-300/70 text-center space-y-1 bg-background/50">
                        <Users className="h-6 w-6 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground font-medium">
                          Tidak ditemukan rekan siswa lain di kelas {studentRombel}.
                        </p>
                      </div>
                    ) : filteredClassmates.length === 0 ? (
                      <div className="p-6 rounded-xl border border-dashed border-amber-300/70 text-center space-y-1 bg-background/50">
                        <Search className="h-6 w-6 text-muted-foreground mx-auto" />
                        <p className="text-xs text-muted-foreground font-medium">
                          Tidak ditemukan teman sekelas dengan kata kunci &quot;{peerSearchQuery}&quot;.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* Tabel Desktop (Tampil di layar md ke atas) */}
                        <div className="hidden md:block overflow-x-auto rounded-xl border border-border bg-card">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="border-b border-border bg-muted/50 text-[11px] font-bold text-muted-foreground">
                                <th className="p-2.5 pl-3">No & Rekan Siswa</th>
                                <th className="p-2.5 w-32">1. Keaktifan</th>
                                <th className="p-2.5 w-32">2. Kerjasama</th>
                                <th className="p-2.5 w-32">3. Tanggung Jawab</th>
                                <th className="p-2.5 w-32">4. Sikap & Adab</th>
                                <th className="p-2.5 min-w-[180px]">Pesan Umpan Balik (Sejajar Nama)</th>
                                <th className="p-2.5 pr-3 text-center w-28">Status / Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                              {filteredClassmates.map((c, idx) => {
                                const nisn = c.nis_nip || c.nis || "";
                                const name = c.full_name || c.name || "Siswa";
                                const entry = peerRatingsMap[nisn] || {
                                  evaluatee_nisn: nisn,
                                  evaluatee_name: name,
                                  score_keaktifan: 4,
                                  score_kerjasama: 4,
                                  score_tanggung_jawab: 4,
                                  score_sikap: 4,
                                  feedback: "",
                                  isSaved: false,
                                };

                                return (
                                  <tr key={nisn || idx} className="hover:bg-muted/30 transition-colors">
                                    <td className="p-2.5 pl-3">
                                      <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 border border-amber-300/40">
                                          {idx + 1}
                                        </div>
                                        <div className="truncate max-w-[160px]">
                                          <span className="font-bold text-foreground block truncate" title={name}>
                                            {name}
                                          </span>
                                          <span className="text-[10px] text-muted-foreground font-mono">
                                            {nisn ? `NISN: ${nisn}` : "Siswa"}
                                          </span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-2.5">
                                      <select
                                        value={entry.score_keaktifan}
                                        onChange={(e) => handleUpdatePeerRating(nisn, "score_keaktifan", Number(e.target.value))}
                                        className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-amber-700 dark:text-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                                      >
                                        <option value={4}>4 ★ (Sangat Aktif)</option>
                                        <option value={3}>3 ★ (Aktif)</option>
                                        <option value={2}>2 ★ (Cukup)</option>
                                        <option value={1}>1 ★ (Kurang Aktif)</option>
                                      </select>
                                    </td>
                                    <td className="p-2.5">
                                      <select
                                        value={entry.score_kerjasama}
                                        onChange={(e) => handleUpdatePeerRating(nisn, "score_kerjasama", Number(e.target.value))}
                                        className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-blue-700 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                      >
                                        <option value={4}>4 ★ (Sangat Kompak)</option>
                                        <option value={3}>3 ★ (Kompak)</option>
                                        <option value={2}>2 ★ (Cukup)</option>
                                        <option value={1}>1 ★ (Kurang Kompak)</option>
                                      </select>
                                    </td>
                                    <td className="p-2.5">
                                      <select
                                        value={entry.score_tanggung_jawab}
                                        onChange={(e) => handleUpdatePeerRating(nisn, "score_tanggung_jawab", Number(e.target.value))}
                                        className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                                      >
                                        <option value={4}>4 ★ (Tepat Waktu)</option>
                                        <option value={3}>3 ★ (Baik)</option>
                                        <option value={2}>2 ★ (Cukup)</option>
                                        <option value={1}>1 ★ (Terlambat)</option>
                                      </select>
                                    </td>
                                    <td className="p-2.5">
                                      <select
                                        value={entry.score_sikap}
                                        onChange={(e) => handleUpdatePeerRating(nisn, "score_sikap", Number(e.target.value))}
                                        className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-purple-700 dark:text-purple-400 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
                                      >
                                        <option value={4}>4 ★ (Sangat Sopan)</option>
                                        <option value={3}>3 ★ (Sopan)</option>
                                        <option value={2}>2 ★ (Cukup)</option>
                                        <option value={1}>1 ★ (Kurang Sopan)</option>
                                      </select>
                                    </td>
                                    <td className="p-2.5">
                                      <Input
                                        placeholder="Pesan umpan balik / terima kasih..."
                                        value={entry.feedback}
                                        onChange={(e) => handleUpdatePeerRating(nisn, "feedback", e.target.value)}
                                        className="h-8 text-xs rounded-lg"
                                      />
                                    </td>
                                    <td className="p-2.5 pr-3 text-center">
                                      <div className="flex items-center justify-center gap-1.5">
                                        {entry.isSaved && (
                                          <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-400 font-bold px-1.5 py-0.5 gap-1">
                                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                            {Number(((entry.score_keaktifan + entry.score_kerjasama + entry.score_tanggung_jawab + entry.score_sikap) / 4).toFixed(1))}★
                                          </Badge>
                                        )}
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant={entry.isSaved ? "outline" : "default"}
                                          disabled={savingRowNisn === nisn}
                                          onClick={() => handleSaveSinglePeer(nisn)}
                                          className={`h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer ${entry.isSaved
                                            ? "border-emerald-300 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                                            : "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
                                            }`}
                                        >
                                          {savingRowNisn === nisn ? "..." : entry.isSaved ? "Update" : "Simpan"}
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Tampilan Kartu Responsif Mobile (Layar kecil < md) */}
                        <div className="block md:hidden space-y-2.5">
                          {filteredClassmates.map((c, idx) => {
                            const nisn = c.nis_nip || c.nis || "";
                            const name = c.full_name || c.name || "Siswa";
                            const entry = peerRatingsMap[nisn] || {
                              evaluatee_nisn: nisn,
                              evaluatee_name: name,
                              score_keaktifan: 4,
                              score_kerjasama: 4,
                              score_tanggung_jawab: 4,
                              score_sikap: 4,
                              feedback: "",
                              isSaved: false,
                            };

                            return (
                              <div key={nisn || idx} className="p-3 rounded-xl border border-border bg-card space-y-2.5 shadow-2xs">
                                <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-amber-500/15 text-amber-700 font-bold text-[10px] flex items-center justify-center">
                                      {idx + 1}
                                    </div>
                                    <div>
                                      <span className="font-bold text-xs text-foreground block">{name}</span>
                                      <span className="text-[10px] text-muted-foreground font-mono">{nisn ? `NISN: ${nisn}` : "Siswa"}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {entry.isSaved && (
                                      <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-400 font-bold px-1.5 py-0.5 gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        {Number(((entry.score_keaktifan + entry.score_kerjasama + entry.score_tanggung_jawab + entry.score_sikap) / 4).toFixed(1))}★
                                      </Badge>
                                    )}
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant={entry.isSaved ? "outline" : "default"}
                                      disabled={savingRowNisn === nisn}
                                      onClick={() => handleSaveSinglePeer(nisn)}
                                      className={`h-7 px-2.5 text-xs font-bold rounded-lg ${entry.isSaved
                                        ? "border-emerald-300 text-emerald-700"
                                        : "bg-amber-600 text-white"
                                        }`}
                                    >
                                      {savingRowNisn === nisn ? "..." : entry.isSaved ? "Update" : "Simpan"}
                                    </Button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-muted-foreground">1. Keaktifan</label>
                                    <select
                                      value={entry.score_keaktifan}
                                      onChange={(e) => handleUpdatePeerRating(nisn, "score_keaktifan", Number(e.target.value))}
                                      className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-amber-700"
                                    >
                                      <option value={4}>4 ★ (Sangat Aktif)</option>
                                      <option value={3}>3 ★ (Aktif)</option>
                                      <option value={2}>2 ★ (Cukup)</option>
                                      <option value={1}>1 ★ (Kurang)</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-muted-foreground">2. Kerjasama</label>
                                    <select
                                      value={entry.score_kerjasama}
                                      onChange={(e) => handleUpdatePeerRating(nisn, "score_kerjasama", Number(e.target.value))}
                                      className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-blue-700"
                                    >
                                      <option value={4}>4 ★ (Sangat Kompak)</option>
                                      <option value={3}>3 ★ (Kompak)</option>
                                      <option value={2}>2 ★ (Cukup)</option>
                                      <option value={1}>1 ★ (Kurang)</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-muted-foreground">3. Tanggung Jawab</label>
                                    <select
                                      value={entry.score_tanggung_jawab}
                                      onChange={(e) => handleUpdatePeerRating(nisn, "score_tanggung_jawab", Number(e.target.value))}
                                      className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-emerald-700"
                                    >
                                      <option value={4}>4 ★ (Tepat Waktu)</option>
                                      <option value={3}>3 ★ (Baik)</option>
                                      <option value={2}>2 ★ (Cukup)</option>
                                      <option value={1}>1 ★ (Terlambat)</option>
                                    </select>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-semibold text-muted-foreground">4. Sikap & Adab</label>
                                    <select
                                      value={entry.score_sikap}
                                      onChange={(e) => handleUpdatePeerRating(nisn, "score_sikap", Number(e.target.value))}
                                      className="h-8 w-full rounded-lg border border-border bg-background px-2 text-xs font-semibold text-purple-700"
                                    >
                                      <option value={4}>4 ★ (Sangat Sopan)</option>
                                      <option value={3}>3 ★ (Sopan)</option>
                                      <option value={2}>2 ★ (Cukup)</option>
                                      <option value={1}>1 ★ (Kurang)</option>
                                    </select>
                                  </div>
                                </div>

                                <div className="space-y-1 pt-1">
                                  <label className="text-[10px] font-semibold text-muted-foreground">Pesan Umpan Balik (Sejajar Nama):</label>
                                  <Input
                                    placeholder="Ucapan terima kasih atau masukan..."
                                    value={entry.feedback}
                                    onChange={(e) => handleUpdatePeerRating(nisn, "feedback", e.target.value)}
                                    className="h-8 text-xs rounded-lg"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Bar Bawah: Status & Tombol Simpan Semua */}
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Star className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0" />
                            <span>Penilaian bersifat rahasia antar-siswa dan diakumulasi otomatis untuk Guru Pengampu.</span>
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isSavingBulkPeer || classmates.length === 0}
                            onClick={handleSaveAllPeers}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer h-8 shrink-0"
                          >
                            <Save className="h-3.5 w-3.5" />
                            {isSavingBulkPeer ? "Menyimpan Semua..." : `Simpan Semua Penilaian (${classmates.length} Siswa)`}
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })()}
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

            {isQuiz ? (
              <Card className="border-purple-300 dark:border-purple-900 shadow-md bg-card">
                <CardHeader className="p-4 pb-3 border-b border-purple-200 dark:border-purple-900 bg-purple-100/30 dark:bg-purple-950/30">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" /> Lembar Pengerjaan Kuis Formatif
                    </CardTitle>
                    {(() => {
                      const answeredQuizCount = Object.keys(studentQuizAnswers).filter((k) => {
                        const val = studentQuizAnswers[Number(k)];
                        if (val === undefined || val === null) return false;
                        if (typeof val === "string") return val.trim().length > 0;
                        if (typeof val === "object") return Object.keys(val).length > 0;
                        return true;
                      }).length;
                      return (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Button
                            type="button"
                            size="sm"
                            variant={forceArabicQuizMode ? "default" : "outline"}
                            onClick={() => setForceArabicQuizMode(!forceArabicQuizMode)}
                            className={`text-[10px] font-semibold gap-1 h-6 px-2 ${
                              forceArabicQuizMode
                                ? "bg-amber-600 hover:bg-amber-700 text-white"
                                : "border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
                            }`}
                            title="Aktifkan Mode Khat Naskh Bahasa Arab"
                          >
                            🇸🇦 {forceArabicQuizMode ? "Mode Arab Aktif" : "Mode Arab (Khat Naskh)"}
                          </Button>
                          <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium gap-1">
                            <Save className="h-3 w-3 text-emerald-600" /> Auto-Save
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono border-purple-400 text-purple-700 dark:text-purple-300 font-bold">
                            {answeredQuizCount}/{parsedQuizQuestions.length} Terjawab
                          </Badge>
                        </div>
                      );
                    })()}
                  </div>
                  <CardDescription className="text-[11px]">
                    Kerjakan butir soal di bawah ini dengan teliti. Anda dapat mengubah jawaban sebelum menekan tombol kumpulkan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {existingSub && existingSub.score !== undefined && existingSub.score > 0 && (
                    <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-purple-800 dark:text-purple-300 block">
                          🎉 Nilai Kuis Anda: {existingSub.score} / 100
                        </span>
                        <span className="text-[11px] text-muted-foreground">{existingSub.feedback || "Kuis telah dikerjakan."}</span>
                      </div>
                      <Badge className="bg-purple-600 text-white font-bold text-xs px-2.5 py-1">
                        SELESAI
                      </Badge>
                    </div>
                  )}

                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                    {parsedQuizQuestions.map((q: any, qIdx: number) => {
                      const qType: QuizQuestionType = q.type || "PG";
                      const cfg = QUIZ_QUESTION_TYPE_CONFIG[qType] || QUIZ_QUESTION_TYPE_CONFIG.PG;
                      const selectedAns = studentQuizAnswers[qIdx];
                      const isQArabic = forceArabicQuizMode || isArabicText(q.question);
                      const isAnswered =
                        selectedAns !== undefined &&
                        selectedAns !== null &&
                        (typeof selectedAns === "string"
                          ? selectedAns.trim().length > 0
                          : typeof selectedAns === "object"
                          ? Object.keys(selectedAns).length > 0
                          : true);

                      return (
                        <div
                          key={qIdx}
                          className="p-3.5 rounded-xl border border-border bg-muted/15 space-y-2.5 text-xs shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary font-mono text-[11px]">
                                Soal #{qIdx + 1}
                              </span>
                              <Badge variant="outline" className={`text-[9px] font-semibold ${cfg.badgeColor}`}>
                                {cfg.shortLabel}
                              </Badge>
                              {isQArabic && (
                                <Badge variant="outline" className="text-[9px] font-semibold border-amber-500/40 text-amber-700 dark:text-amber-400 bg-amber-500/10 font-arabic">
                                  الخط العربي
                                </Badge>
                              )}
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ({q.points || 10} Poin)
                              </span>
                            </div>

                            {isAnswered && (
                              <Badge className="bg-emerald-600 text-white font-mono text-[9px] px-1.5 py-0 gap-1">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Terisi
                              </Badge>
                            )}
                          </div>

                          <p
                            dir={isQArabic ? "rtl" : "ltr"}
                            className={`whitespace-pre-wrap ${
                              isQArabic
                                ? "font-arabic text-lg sm:text-xl leading-loose font-bold text-right text-foreground"
                                : "font-semibold text-foreground leading-relaxed"
                            }`}
                          >
                            {q.question}
                          </p>

                          {/* 1. PILIHAN GANDA (A-D) */}
                          {qType === "PG" && (() => {
                            const options = [
                              { key: "A", text: q.optionA },
                              { key: "B", text: q.optionB },
                              { key: "C", text: q.optionC },
                              { key: "D", text: q.optionD },
                            ].filter((opt) => Boolean(opt.text));

                            return (
                              <div className="grid grid-cols-1 gap-1.5 pt-1" dir={isQArabic ? "rtl" : "ltr"}>
                                {options.map((opt) => {
                                  const isSelected = selectedAns === opt.key;
                                  const isOptAr = forceArabicQuizMode || isArabicText(opt.text);
                                  return (
                                    <button
                                      key={opt.key}
                                      type="button"
                                      onClick={() =>
                                        setStudentQuizAnswers((prev) => ({
                                          ...prev,
                                          [qIdx]: opt.key,
                                        }))
                                      }
                                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition cursor-pointer text-xs ${
                                        isSelected
                                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 font-bold shadow-2xs ring-1 ring-purple-500"
                                          : "border-border/80 bg-card hover:bg-muted/40 text-foreground"
                                      }`}
                                    >
                                      <span
                                        className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                          isSelected
                                            ? "bg-purple-600 text-white"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        {opt.key}
                                      </span>
                                      <span
                                        dir={isOptAr ? "rtl" : "ltr"}
                                        className={`flex-1 ${
                                          isOptAr
                                            ? "font-arabic text-sm sm:text-base text-right leading-loose"
                                            : "leading-snug"
                                        }`}
                                      >
                                        {opt.text}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            );
                          })()}

                          {/* 2. MENJODOHKAN */}
                          {qType === "MENJODOHKAN" && Array.isArray(q.pairs) && (() => {
                            const currentPairAnswers = (typeof selectedAns === "object" && selectedAns !== null) ? selectedAns : {};
                            const rightOptions = Array.from(new Set(q.pairs.map((p: any) => p.right).filter(Boolean))).sort();

                            return (
                              <div className="space-y-2 pt-1">
                                <span className="text-[11px] font-medium text-muted-foreground block">
                                  Pilih pasangan respon yang tepat untuk setiap premis di kolom kiri:
                                </span>
                                <div className="space-y-2">
                                  {q.pairs.map((pair: any, pIdx: number) => {
                                    const selectedRight = currentPairAnswers[pIdx] || "";
                                    return (
                                      <div
                                        key={pIdx}
                                        className="p-2.5 rounded-lg bg-card border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                                      >
                                        <div className="font-semibold text-foreground flex items-center gap-1.5 flex-1">
                                          <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                                            {pIdx + 1}
                                          </span>
                                          <span>{pair.left}</span>
                                        </div>

                                        <div className="flex items-center gap-1.5 flex-1 sm:max-w-xs">
                                          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:block" />
                                          <select
                                            value={selectedRight}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setStudentQuizAnswers((prev) => ({
                                                ...prev,
                                                [qIdx]: {
                                                  ...(typeof prev[qIdx] === "object" && prev[qIdx] !== null ? prev[qIdx] : {}),
                                                  [pIdx]: val,
                                                },
                                              }));
                                            }}
                                            className={`h-8 w-full px-2.5 rounded-md border text-xs font-medium bg-background cursor-pointer ${
                                              selectedRight
                                                ? "border-emerald-500 text-emerald-800 dark:text-emerald-300 bg-emerald-50/20"
                                                : "border-border text-foreground"
                                            }`}
                                          >
                                            <option value="">-- Pilih Pasangan --</option>
                                            {rightOptions.map((opt: any, optIdx: number) => (
                                              <option key={optIdx} value={opt}>
                                                {opt}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 3. BENAR / SALAH */}
                          {qType === "BENAR_SALAH" && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[11px] font-medium text-muted-foreground block">
                                Tentukan kebenaran pernyataan di atas:
                              </span>
                              <div className="grid grid-cols-2 gap-3 max-w-sm">
                                <button
                                  type="button"
                                  onClick={() => setStudentQuizAnswers((prev) => ({ ...prev, [qIdx]: "BENAR" }))}
                                  className={`p-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                                    selectedAns === "BENAR"
                                      ? "border-emerald-600 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500 shadow-2xs"
                                      : "border-border bg-card hover:bg-muted text-foreground"
                                  }`}
                                >
                                  ✓ BENAR
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setStudentQuizAnswers((prev) => ({ ...prev, [qIdx]: "SALAH" }))}
                                  className={`p-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                                    selectedAns === "SALAH"
                                      ? "border-rose-600 bg-rose-500/20 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500 shadow-2xs"
                                      : "border-border bg-card hover:bg-muted text-foreground"
                                  }`}
                                >
                                  ✗ SALAH
                                </button>
                              </div>
                            </div>
                          )}

                          {/* 4. TEKS SINGKAT (ISIAN) */}
                          {qType === "ISIAN_SINGKAT" && (() => {
                            const isAnsAr = forceArabicQuizMode || isArabicText(typeof selectedAns === "string" ? selectedAns : "");
                            return (
                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-medium text-muted-foreground block">
                                    Tuliskan jawaban singkat Anda:
                                  </span>
                                  {isAnsAr && (
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold font-arabic">
                                      الخط العربي (Khat Naskh)
                                    </span>
                                  )}
                                </div>
                                <Input
                                  dir={isAnsAr ? "rtl" : "ltr"}
                                  placeholder={isAnsAr ? "اكتب الإجابة القصيرة هنا..." : "Ketik jawaban singkat di sini..."}
                                  value={typeof selectedAns === "string" ? selectedAns : ""}
                                  onChange={(e) => setStudentQuizAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))}
                                  className={`text-xs font-medium ${isAnsAr ? "font-arabic text-sm text-right leading-loose" : ""}`}
                                />
                              </div>
                            );
                          })()}

                          {/* 5. ESAI / PARAGRAF */}
                          {qType === "ESAI" && (() => {
                            const isAnsAr = forceArabicQuizMode || isArabicText(typeof selectedAns === "string" ? selectedAns : "");
                            return (
                              <div className="space-y-1 pt-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-medium text-muted-foreground block">
                                    Tuliskan uraian atau penjelasan lengkap jawaban Anda:
                                  </span>
                                  {isAnsAr && (
                                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold font-arabic">
                                      الخط العربي (Khat Naskh) • Rata Kanan
                                    </span>
                                  )}
                                </div>
                                <Textarea
                                  dir={isAnsAr ? "rtl" : "ltr"}
                                  placeholder={isAnsAr ? "اكتب الإجابة المقالية بالتفصيل هنا..." : "Tuliskan jawaban esai Anda secara lengkap di sini..."}
                                  value={typeof selectedAns === "string" ? selectedAns : ""}
                                  onChange={(e) => setStudentQuizAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))}
                                  className={`text-xs min-h-[90px] leading-relaxed ${isAnsAr ? "font-arabic text-base text-right leading-loose" : ""}`}
                                />
                              </div>
                            );
                          })()}

                          {/* 6. NUMERIK */}
                          {qType === "NUMERIK" && (
                            <div className="space-y-1 pt-1">
                              <span className="text-[11px] font-medium text-muted-foreground block">
                                Masukkan angka hasil perhitungan:
                              </span>
                              <Input
                                type="text"
                                placeholder="Contoh: 100 atau 3.14"
                                value={selectedAns !== undefined && selectedAns !== null ? String(selectedAns) : ""}
                                onChange={(e) => setStudentQuizAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))}
                                className="text-xs font-mono font-medium max-w-xs"
                              />
                            </div>
                          )}

                          {/* 7. MELENGKAPI KALIMAT */}
                          {qType === "MELENGKAPI" && (() => {
                            const isAnsAr = forceArabicQuizMode || isArabicText(typeof selectedAns === "string" ? selectedAns : "");
                            return (
                              <div className="space-y-1 pt-1">
                                <span className="text-[11px] font-medium text-muted-foreground block">
                                  Ketik kata / frasa untuk melengkapi bagian rumpang [...]:
                                </span>
                                <Input
                                  dir={isAnsAr ? "rtl" : "ltr"}
                                  placeholder={isAnsAr ? "اكتب الكلمة المناسبة هنا..." : "Ketik kata / frasa pelengkap di sini..."}
                                  value={typeof selectedAns === "string" ? selectedAns : ""}
                                  onChange={(e) => setStudentQuizAnswers((prev) => ({ ...prev, [qIdx]: e.target.value }))}
                                  className={`text-xs font-medium ${isAnsAr ? "font-arabic text-sm text-right leading-loose" : ""}`}
                                />
                              </div>
                            );
                          })()}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <div className="text-[11px] text-muted-foreground">
                      Jawaban tersimpan otomatis saat Anda mengisi.
                    </div>
                    <Button
                      size="sm"
                      disabled={submitting || parsedQuizQuestions.length === 0}
                      onClick={handleSubmitQuiz}
                      className="w-full sm:w-auto text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs rounded-xl px-5 cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5 mr-1.5" />
                      {existingSub ? "Kirim Ulang Jawaban Kuis" : "Kumpulkan Jawaban Kuis"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Form Pengerjaan & Pengumpulan Jawaban */
              <Card className="border-border shadow-md">
                <CardHeader className="p-4 pb-3 border-b border-border bg-muted/20">
                  <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-primary" />
                    {selectedAssignment.type === "HAFALAN"
                      ? "Lembar Konfirmasi & Setoran Hafalan"
                      : selectedAssignment.type === "PRAKTIKUM"
                        ? "Lembar Laporan Praktikum & Dokumen Uji"
                        : selectedAssignment.type === "PROYEK_P5"
                          ? "Lembar Laporan & Bukti Kegiatan Kokurikuler"
                          : "Lembar Jawaban & Submisi Siswa"}
                  </CardTitle>
                  <CardDescription className="text-[11px]">
                    {selectedAssignment.type === "HAFALAN"
                      ? "Tuliskan catatan setoran ayat dan lampirkan rekaman audio/video hafalan atau tautan Drive."
                      : selectedAssignment.type === "PRAKTIKUM"
                        ? "Ketikkan hasil pengamatan/analisis praktikum atau unggah berkas laporan praktikum."
                        : selectedAssignment.type === "PROYEK_P5"
                          ? "Ketikkan ringkasan kemajuan kegiatan kokurikuler atau lampirkan berkas dokumentasi/artefak hasil kegiatan."
                          : "Ketikkan jawaban tugas Anda di bawah, atau lampirkan berkas dokumen jawaban."}
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
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${uploadMode === "FILE"
                            ? "bg-background text-primary shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          📁 Unggah File
                        </button>
                        <button
                          type="button"
                          onClick={() => setUploadMode("URL")}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition ${uploadMode === "URL"
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
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner Siswa */}
      <StudentHeaderBanner
        title="Ruang Belajar Siswa"
        subtitle=""
        icon={BookOpen}
        studentClass={studentRombel}
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

      {/* Navigasi Utama Ruang Belajar: Sesi Belajar vs Materi vs Tugas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-2.5">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <Button
            type="button"
            size="sm"
            variant={learningSection === "sesi" ? "default" : "outline"}
            onClick={() => setLearningSection("sesi")}
            className={`gap-1.5 font-bold text-xs h-9 rounded-xl transition shadow-2xs shrink-0 ${learningSection === "sesi"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
          >
            <GraduationCap className="h-4 w-4" /> 1. Kelas Hari Ini
          </Button>
          <Button
            type="button"
            size="sm"
            variant={learningSection === "materi" ? "default" : "outline"}
            onClick={() => setLearningSection("materi")}
            className={`gap-1.5 font-bold text-xs h-9 rounded-xl transition shadow-2xs shrink-0 ${learningSection === "materi"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
          >
            <BookOpen className="h-4 w-4" /> 2. Bahan Ajar Digital ({filteredMaterials.length})
          </Button>
          <Button
            type="button"
            size="sm"
            variant={learningSection === "tugas" ? "default" : "outline"}
            onClick={() => setLearningSection("tugas")}
            className={`gap-1.5 font-bold text-xs h-9 rounded-xl transition shadow-2xs shrink-0 ${learningSection === "tugas"
              ? "bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
          >
            <FileText className="h-4 w-4" /> 3. Tugas & LKPD ({totalCount})
          </Button>
        </div>

        {selectedMateriMapel !== "SEMUA" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Mapel Aktif:</span>
            <Badge className="bg-emerald-600 text-white text-[11px] font-bold">
              {selectedMateriMapel}
            </Badge>
          </div>
        )}
      </div>

      {learningSection === "sesi" ? (
        selectedMateriMapel !== "SEMUA" ? (
          <SesiRuangBelajarView
            userProfile={userProfile}
            studentName={studentName}
            studentRombel={studentRombel}
            studentNisn={studentNisn}
            activeMapel={selectedMateriMapel}
            materialsList={materialsList}
            assignmentsList={assignments}
            submissionsMap={mySubmissionsMap}
            onOpenMaterial={handleOpenMaterial}
            onOpenAssignment={handleOpenDetail}
            onBackToAll={() => {
              setSelectedMateriMapel("SEMUA");
              setSelectedMapelFilter("SEMUA");
              if (typeof window !== "undefined") {
                const url = new URL(window.location.href);
                url.searchParams.delete("mapel");
                window.history.pushState({}, "", url.toString());
              }
            }}
          />
        ) : (
          <div className="space-y-4">
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="p-4 sm:p-5 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white grid place-items-center shadow-2xs shrink-0">
                    <GraduationCap className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                      Jadwal & Kelas Hari Ini
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">

                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-3">
                {mergedTodayClasses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mergedTodayClasses.map((cls, idx) => {
                      const isClassLive = (activeSessionsList || []).some(
                        (s: any) =>
                          s.status === "SEDANG_BERLANGSUNG" &&
                          isSameSubject(s.mapel || "", cls.mapel) &&
                          isSameClass(s.rombel || "", studentRombel)
                      );
                      const isClassFinished =
                        !isClassLive &&
                        (activeSessionsList || []).some(
                          (s: any) =>
                            s.status === "SELESAI" &&
                            isSameSubject(s.mapel || "", cls.mapel) &&
                            isSameClass(s.rombel || "", studentRombel)
                        );

                      return (
                        <div
                          key={cls.id || idx}
                          onClick={() => {
                            setSelectedMateriMapel(cls.mapel);
                            setSelectedMapelFilter(cls.mapel);
                            if (typeof window !== "undefined") {
                              const url = new URL(window.location.href);
                              url.searchParams.set("mapel", cls.mapel);
                              window.history.pushState({}, "", url.toString());
                            }
                          }}
                          className={`p-3.5 rounded-xl border bg-muted/15 cursor-pointer transition-all shadow-2xs space-y-2.5 group flex flex-col justify-between ${isClassLive
                            ? "border-emerald-500/80 bg-emerald-50/15 dark:bg-emerald-950/15 shadow-emerald-500/10"
                            : "border-border hover:border-emerald-500/80 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20"
                            }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                                ⏰ {cls.jamLabel}
                              </span>
                              <div className="flex items-center gap-1">
                                {isClassLive && (
                                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold animate-pulse px-1.5 py-0.5">
                                    ● LIVE
                                  </Badge>
                                )}
                                {isClassFinished && (
                                  <Badge variant="outline" className="text-[10px] font-bold text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 px-1.5 py-0.5">
                                    ● SELESAI
                                  </Badge>
                                )}
                                <Badge variant="secondary" className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50">
                                  {cls.jpCount} JP
                                </Badge>
                                <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground">
                                  {cls.rombel || studentRombel}
                                </Badge>
                              </div>
                            </div>
                            <div className="font-bold text-sm text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                              {cls.mapel}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              👨‍🏫 {cls.guru || "Guru Pengampu"}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 rounded-xl h-8 mt-1 shadow-2xs"
                          >
                            <DoorOpen className="h-3.5 w-3.5" /> Masuk Kelas →
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Pilih dari daftar mata pelajaran terdaftar untuk {studentRombel}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {materiSubjects.map((sub) => (
                        <Button
                          key={sub}
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs font-bold border-border bg-card hover:border-emerald-500 hover:bg-emerald-50/20 gap-1.5 rounded-xl"
                          onClick={() => {
                            setSelectedMateriMapel(sub);
                            setSelectedMapelFilter(sub);
                            if (typeof window !== "undefined") {
                              const url = new URL(window.location.href);
                              url.searchParams.set("mapel", sub);
                              window.history.pushState({}, "", url.toString());
                            }
                          }}
                        >
                          <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                          {sub}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      ) : learningSection === "materi" ? (
        <div className="space-y-4">
          {/* Filter Bar Materi */}
          <div className="p-3 bg-card rounded-2xl border border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari materi, judul, atau guru pengampu..."
                  value={searchMateriQuery}
                  onChange={(e) => setSearchMateriQuery(e.target.value)}
                  className="h-8.5 pl-8 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">Filter Mapel:</span>
              <select
                value={selectedMateriMapel}
                onChange={(e) => setSelectedMateriMapel(e.target.value)}
                className="h-8.5 rounded-xl border border-border bg-background px-3 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs cursor-pointer min-w-[160px]"
              >
                <option value="SEMUA">Semua Mapel ({materiSubjects.length})</option>
                {selectedMateriMapel !== "SEMUA" && !materiSubjects.includes(selectedMateriMapel) && (
                  <option value={selectedMateriMapel}>{selectedMateriMapel}</option>
                )}
                {materiSubjects.map((sub: string) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              {selectedMateriMapel !== "SEMUA" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11px] font-bold text-muted-foreground hover:text-foreground px-2 rounded-xl"
                  onClick={() => {
                    setSelectedMateriMapel("SEMUA");
                    if (typeof window !== "undefined") {
                      const url = new URL(window.location.href);
                      url.searchParams.delete("mapel");
                      window.history.pushState({}, "", url.toString());
                    }
                  }}
                >
                  ✕ Reset Filter
                </Button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredMaterials.length === 0 ? (
            <Card className="border-border bg-card shadow-xs">
              <CardContent className="p-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto grid place-items-center">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="font-bold text-foreground text-sm">
                  {searchMateriQuery || selectedMateriMapel !== "SEMUA"
                    ? "Tidak Ada Materi Sesuai Filter"
                    : "Belum Ada Bahan Ajar Diterbitkan"}
                </div>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchMateriQuery || selectedMateriMapel !== "SEMUA"
                    ? "Coba sesuaikan kata kunci pencarian atau pilih mapel lain."
                    : `Bahan ajar, modul digital, dan video yang dibagikan guru pengampu untuk ${studentRombel} akan otomatis muncul di sini.`}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredMaterials.map((m: any) => {
                const rawType = (m.type || "").toUpperCase();
                const isVideo = rawType.includes("VIDEO");
                const isPpt = rawType.includes("PPT");
                const isAudio = rawType.includes("AUDIO");

                return (
                  <Card key={m.id} className="border-border hover:border-emerald-500/40 transition-all bg-card shadow-xs flex flex-col justify-between">
                    <CardHeader className="p-4 pb-2.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 shadow-2xs">
                          {m.subject_name || "Mata Pelajaran"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                          {isVideo ? "🎥 Video" : isPpt ? "📊 Slide PPT" : isAudio ? "🎧 Audio" : "📄 Modul Ajar"}
                        </Badge>
                      </div>

                      <CardTitle className="text-sm font-bold text-foreground line-clamp-2 leading-snug">
                        {m.title}
                      </CardTitle>

                      <CardDescription className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                        <span className="font-semibold text-foreground/80 truncate">
                          Oleh: {m.uploaded_by || "Guru Pengampu"}
                        </span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="p-4 pt-0 space-y-3">
                      {m.size && (
                        <div className="text-[10px] text-muted-foreground font-mono">
                          Ukuran Berkas: {m.size}
                        </div>
                      )}

                      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          className="flex-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl h-8 shadow-2xs"
                          onClick={() => handleOpenMaterial(m)}
                        >
                          <Eye className="h-3.5 w-3.5" /> Buka Materi
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
        </div>
      ) : (
        /* Filter Tabs & Task List */
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-3 sm:p-4 pb-3 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-muted/70 rounded-xl border border-border text-xs w-full sm:w-auto overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setFilterTab("belum")}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${filterTab === "belum"
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
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${filterTab === "dikumpulkan"
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
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${filterTab === "dinilai"
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
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1.5 ${filterTab === "semua"
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
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto shrink-0 flex-wrap">
              <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">Filter Mapel:</span>
              <select
                value={selectedMapelFilter}
                onChange={(e) => setSelectedMapelFilter(e.target.value)}
                className="h-8 flex-1 sm:flex-initial sm:min-w-[180px] rounded-lg border border-border bg-background px-2.5 text-xs font-bold text-primary shadow-2xs cursor-pointer"
              >
                <option value="SEMUA">Semua Mapel ({uniqueSubjects.length})</option>
                {selectedMapelFilter !== "SEMUA" && !uniqueSubjects.includes(selectedMapelFilter) && (
                  <option value={selectedMapelFilter}>{selectedMapelFilter}</option>
                )}
                {uniqueSubjects.map((sub: string) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
              {selectedMapelFilter !== "SEMUA" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[11px] font-bold text-muted-foreground hover:text-foreground px-2 rounded-lg"
                  onClick={() => {
                    setSelectedMapelFilter("SEMUA");
                    if (typeof window !== "undefined") {
                      const url = new URL(window.location.href);
                      url.searchParams.delete("mapel");
                      window.history.pushState({}, "", url.toString());
                    }
                  }}
                >
                  ✕ Reset Filter
                </Button>
              )}
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
                <div className="md:hidden p-3 space-y-2.5">
                  {filteredAssignments.map((a) => {
                    const taskState = getTaskStatus(a);
                    const sub = mySubmissionsMap.get(String(a.id));
                    return (
                      <div key={a.id} className="p-3.5 rounded-xl border border-border bg-muted/20 hover:border-primary/50 transition shadow-2xs space-y-2.5">
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

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/60">
                          {(() => {
                            const dl = getDeadlineStatus(a.due_date, (a as any).created_at);
                            return (
                              <div className="flex items-center gap-1 text-[11px] font-mono">
                                <Clock className={`h-3 w-3 ${dl.isOverdue ? "text-rose-500" : dl.isToday ? "text-amber-500" : "text-muted-foreground"}`} />
                                <span className={dl.textColor}>
                                  {dl.isOverdue ? `Terlewat: ${dl.displayText}` : dl.displayText}
                                </span>
                              </div>
                            );
                          })()}
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
                            {(() => {
                              const dl = getDeadlineStatus(a.due_date, (a as any).created_at);
                              return (
                                <Badge variant="outline" className={`gap-1 font-mono text-[11px] ${dl.badgeClass}`}>
                                  <Clock className={`h-3 w-3 ${dl.isOverdue ? "text-rose-500" : dl.isToday ? "text-amber-500" : "text-muted-foreground"}`} />
                                  {dl.isOverdue ? `Terlewat: ${dl.displayText}` : dl.displayText}
                                </Badge>
                              );
                            })()}
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
      )}

      {/* Dialog Baca / Pelajari Materi untuk Siswa */}
      <ViewMaterialDialog
        isOpen={isViewMaterialOpen}
        onOpenChange={setIsViewMaterialOpen}
        material={selectedMaterialForView}
        activeRombel={studentRombel}
        activeMapel={selectedMaterialForView?.chapter || "Mata Pelajaran"}
      />
    </div>
  );
}
