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

interface TugasSiswaModuleProps {
  userProfile?: any;
}

export function TugasSiswaModule({ userProfile }: TugasSiswaModuleProps) {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"semua" | "belum" | "dikumpulkan" | "dinilai">("semua");

  // Selected assignment for detail & submission modal
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRow | null>(null);
  const [studentNotes, setStudentNotes] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isDraft, setIsDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const studentName = userProfile?.name || "Siswa MTsN 2 Cilacap";
  const studentRombel = userProfile?.rombelName || userProfile?.className || "VIII A";
  const studentEmail = userProfile?.email || "siswa@mtsn2cilacap.sch.id";

  const loadData = async () => {
    setLoading(true);
    try {
      const [allAssignments, allSubmissions] = await Promise.all([
        MysqlDataService.getAssignments(),
        MysqlDataService.getSubmissions(),
      ]);
      setAssignments(allAssignments || []);
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

  // Filter Tasks
  const filteredAssignments = assignments.filter((a) => {
    const { status } = getTaskStatus(a);
    if (filterTab === "belum") return status === "belum" || status === "draft";
    if (filterTab === "dikumpulkan") return status === "dikumpulkan";
    if (filterTab === "dinilai") return status === "dinilai";
    return true;
  });

  // Metric Counters
  const totalCount = assignments.length;
  const pendingCount = assignments.filter((a) => getTaskStatus(a).status === "belum" || getTaskStatus(a).status === "draft").length;
  const submittedCount = assignments.filter((a) => getTaskStatus(a).status === "dikumpulkan").length;
  const gradedCount = assignments.filter((a) => getTaskStatus(a).status === "dinilai").length;

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

  const handleSaveSubmission = async (asDraft: boolean) => {
    if (!selectedAssignment) return;
    if (!asDraft && !studentNotes.trim() && !fileUrl.trim()) {
      return toast.error("Harap isi komentar/jawaban atau unggah file tugas Anda!");
    }

    setSubmitting(true);
    try {
      const notesContent = asDraft ? `[DRAFT] ${studentNotes.trim()}` : studentNotes.trim();
      const res = await MysqlDataService.saveSubmission({
        assignment_id: String(selectedAssignment.id),
        user_id: studentEmail,
        student_name: studentName,
        rombel: studentRombel,
        file_url: fileUrl.trim(),
        notes: notesContent,
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
              Daftar penugasan resmi dari guru pengampu mata pelajaran yang terhubung ke database.
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
              Memuat data tugas dari server database MySQL...
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-bold text-sm text-foreground">Belum Ada Tugas Terdaftar</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {assignments.length === 0
                  ? "Database MySQL belum mencatat tugas atau LKPD terdaftar untuk kelas Anda. Tampilan dikosongkan secara jujur."
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
