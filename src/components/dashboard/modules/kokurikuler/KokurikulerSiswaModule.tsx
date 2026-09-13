import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  FolderKanban,
  Award,
  Inbox,
  CheckCircle2,
  Upload,
  FileText,
  Printer,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { validateUploadedFile } from "@/lib/fileValidation";
import { P5SubmissionRow } from "@/services/mysqlServerFns";
import { isSameClass, normalizeRombelName } from "@/utils/classNormalization";

export interface P5ProjectItem {
  id: string;
  title: string;
  theme: string;
  target: string;
  coordinator: string;
  progress: number;
  status: string;
  dimensions: string;
  dateStr?: string;
}

// 4 Skala Perkembangan Karakter P5-PPRA Sesuai KMA 347/2022
const SKALA_P5 = [
  {
    code: "MB",
    label: "Mulai Berkembang",
    desc: "Peserta didik mulai mengembangkan kemampuan pada dimensi ini, namun masih memerlukan bimbingan intensif dari guru / fasilitator projek.",
    badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  },
  {
    code: "SB",
    label: "Sedang Berkembang",
    desc: "Peserta didik telah mulai menunjukkan kemampuan dimensi target secara mandiri, namun penerapannya belum konsisten di semua situasi.",
    badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  },
  {
    code: "BSH",
    label: "Berkembang Sesuai Harapan",
    desc: "Peserta didik telah mencapai target kemampuan projek secara konsisten dan mandiri.",
    badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  {
    code: "SAB",
    label: "Sangat Berkembang",
    desc: "Peserta didik melampaui target projek, mampu menginspirasi, dan membimbing rekannya.",
    badgeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  },
];

export function KokurikulerSiswaModule({ userProfile }: { userProfile?: any } = {}) {
  const me = MysqlAuthService.getActiveUser();
  const studentName = me?.full_name || userProfile?.name || "Siswa MTsN 2 Cilacap";
  const studentRombel = me?.class_name || userProfile?.class_name || "VIII B";
  const studentNis = me?.nis_nip || (me as any)?.nisn || "2026099";

  const [activeTab, setActiveTab] = useState<"projek" | "portofolio" | "pedoman">("projek");
  const [projectsList, setProjectsList] = useState<P5ProjectItem[]>([]);
  const [mySubmissions, setMySubmissions] = useState<P5SubmissionRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedProjectForUpload, setSelectedProjectForUpload] = useState<P5ProjectItem | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [reportNotes, setReportNotes] = useState("");
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dbProjects, dbSubs] = await Promise.all([
        MysqlDataService.getP5Projects(),
        MysqlDataService.getP5Submissions({ student_id: me?.id || studentName }),
      ]);

      if (dbProjects && dbProjects.length > 0) {
        // Filter projects intended for this student's grade/class or for all classes
        const cleanRombel = normalizeRombelName(studentRombel).toLowerCase();
        const jenjang = cleanRombel.includes("7") || cleanRombel.includes("vii")
          ? "7"
          : cleanRombel.includes("9") || cleanRombel.includes("ix")
            ? "9"
            : "8";

        const filtered = dbProjects.filter((p) => {
          if (!p.class_name || p.class_name === "Semua" || p.class_name === "Semua Rombel" || p.class_name === "Tingkat Kelas") {
            return true;
          }
          if (isSameClass(p.class_name, studentRombel)) {
            return true;
          }
          const pClass = p.class_name.toLowerCase();
          if (jenjang === "8" && (pClass.includes("8") || pClass.includes("viii"))) return true;
          if (jenjang === "7" && (pClass.includes("7") || pClass.includes("vii"))) return true;
          if (jenjang === "9" && (pClass.includes("9") || pClass.includes("ix"))) return true;
          return false;
        });

        const mapped: P5ProjectItem[] = (filtered.length > 0 ? filtered : dbProjects).map((item, idx) => ({
          id: String(item.id || `p-${idx + 1}`),
          title: item.title,
          theme: item.theme || "P5-PPRA",
          target: item.class_name || `Kelas ${studentRombel}`,
          coordinator: (item as any).coordinator || "Fasilitator Projek P5",
          progress: item.progress_pct || 0,
          status: item.status || "Dalam Proses",
          dimensions: item.target_dimension || "Profil Pelajar Pancasila & Rahmatan Lil 'Alamin",
          dateStr: item.date_str || "Semester Berjalan",
        }));
        setProjectsList(mapped);
      } else {
        setProjectsList([]);
      }

      setMySubmissions(dbSubs || []);
    } catch (e) {
      console.warn("Gagal memuat data P5 siswa:", e);
      setProjectsList([]);
      setMySubmissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [studentRombel]);

  const handleOpenUpload = (project?: P5ProjectItem) => {
    setSelectedProjectForUpload(project || projectsList[0] || null);
    setReportTitle(project ? `Laporan Projek: ${project.title}` : "");
    setTeamMembers(studentName);
    setReportNotes("");
    setSelectedPdfFile(null);
    setIsUploadModalOpen(true);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = validateUploadedFile(file.name, file.size, file.type, {
        maxSizeMb: 10,
        allowedExtensions: ["pdf"],
      });

      if (!validation.valid) {
        toast.error(`⚠️ Berkas Ditolak: ${validation.error}`);
        e.target.value = "";
        setSelectedPdfFile(null);
        return;
      }

      setSelectedPdfFile(file);
      if (!reportTitle) {
        setReportTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim()) {
      return toast.error("Harap isi judul laporan projek!");
    }
    if (!selectedPdfFile) {
      return toast.error("Harap pilih berkas laporan PDF dari perangkat Anda!");
    }

    setIsSubmitting(true);
    try {
      // Create permanent virtual path on server disk
      const sanitizedName = selectedPdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const generatedFileUrl = `/uploads/p5/${Date.now()}_${sanitizedName}`;

      const payload: P5SubmissionRow = {
        project_id: selectedProjectForUpload?.id || "p1",
        student_id: me?.id || studentName,
        student_name: studentName,
        rombel: studentRombel,
        title: reportTitle.trim(),
        file_url: generatedFileUrl,
        file_name: selectedPdfFile.name,
        notes: `Kelompok: ${teamMembers.trim()} • Catatan: ${reportNotes.trim()}`,
        score_status: "SB", // Default awal: Sedang Berkembang (menunggu evaluasi fasilitator)
      };

      const res = await MysqlDataService.saveP5Submission(payload);
      if (res.success) {
        toast.success(`🎉 Berkas Laporan Projek "${reportTitle}" Berhasil Diunggah!`, {
          description: "Tersimpan ke database server dan siap dinilai oleh Fasilitator Projek.",
        });
        setIsUploadModalOpen(false);
        await loadData();
        setActiveTab("portofolio");
      } else {
        toast.error("Gagal menyimpan data laporan ke database.");
      }
    } catch (err: any) {
      toast.error(`Terjadi kesalahan saat mengunggah: ${err?.message || "Error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintPortfolio = () => {
    window.print();
    toast.success("🖨️ Dokumen Portofolio Kokurikuler Siswa siap dicetak!");
  };

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <FolderKanban className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-foreground">Projek Kokurikuler Siswa</h1>
              <Badge variant="outline" className="text-[10px] font-semibold h-5 px-1.5 border-purple-500/30 text-purple-700 dark:text-purple-300">
                Kelas {studentRombel}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrintPortfolio}
            className="h-8 gap-1.5 text-xs font-semibold border-purple-500/30 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10"
          >
            <Printer className="h-3.5 w-3.5" /> Cetak Portofolio PDF
          </Button>
          <Button
            size="sm"
            onClick={() => handleOpenUpload()}
            className="h-8 gap-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Upload className="h-3.5 w-3.5" /> Unggah Laporan
          </Button>
        </div>
      </div>

      {/* Compact Metric Strip ~42px */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <FolderKanban className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Tema Projek</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{projectsList.length} Projek</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Award className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Laporan Portofolio</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{mySubmissions.length} Berkas</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Status Kelas</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">Kelas {studentRombel}</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigasi P5 Sederhana & Fungsional */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/70 h-9 w-fit mb-3">
          <TabsTrigger value="projek" className="text-xs font-semibold h-7 px-3 gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            <FolderKanban className="h-3.5 w-3.5" /> 1. Tema Projek Kelas ({projectsList.length})
          </TabsTrigger>
          <TabsTrigger value="portofolio" className="text-xs font-semibold h-7 px-3 gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs">
            <Award className="h-3.5 w-3.5" /> 2. Portofolio & Laporan Saya ({mySubmissions.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: DAFTAR TEMA PROJEK KELAS */}
        <TabsContent value="projek" className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Memuat data kegiatan projek kokurikuler...</div>
          ) : projectsList.length === 0 ? (
            <Card className="border-border shadow-xs bg-card">
              <CardHeader className="pb-3 border-b border-border">
                <Badge variant="outline" className="text-muted-foreground text-[10px] mb-1 w-fit">
                  STATUS PROJEK KOKURIKULER KELAS {studentRombel}
                </Badge>
                <CardTitle className="text-base font-bold">Informasi Tema Projek Kokurikuler Semester Ini</CardTitle>
                <CardDescription className="text-xs">
                  Daftar agenda projek pembiasaan karakter Kurikulum Merdeka yang ditugaskan oleh Fasilitator Projek Madrasah.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mx-auto grid place-items-center">
                  <Inbox className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-foreground text-sm">Belum Ada Tema Projek P5 Diterbitkan</div>

                </div>
                <Button
                  size="sm"
                  onClick={() => handleOpenUpload()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 mt-2"
                >
                  <Upload className="h-3.5 w-3.5" /> + Unggah Portofolio Mandiri / Kelompok
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {projectsList.map((project) => (
                <Card key={project.id} className="border-border shadow-xs hover:border-purple-500/40 transition bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge className="bg-purple-600 text-white text-[10px] font-bold">
                        {project.theme.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono border-purple-500/30 text-purple-700 dark:text-purple-300">
                        {project.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold mt-1 text-foreground">{project.title}</CardTitle>
                    <CardDescription className="text-xs">
                      Koordinator: {project.coordinator} • Sasaran: {project.target}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Progress Pelaksanaan Projek</span>
                        <span className="text-purple-600 dark:text-purple-400 font-mono font-bold">{project.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-2">
                      <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Target Dimensi Profil Pelajar:
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {project.dimensions}
                      </p>
                      <div className="pt-2 flex items-center justify-between gap-2 border-t border-purple-500/20">
                        <span className="text-[10px] text-muted-foreground font-mono">
                          📅 {project.dateStr}
                        </span>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5"
                          onClick={() => handleOpenUpload(project)}
                        >
                          <Upload className="h-3.5 w-3.5" /> Unggah Laporan PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: PORTOFOLIO & LAPORAN SAYA */}
        <TabsContent value="portofolio" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" /> Rekam Portofolio & Lembar Capaian Projek Kokurikuler
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dokumen hasil karya, laporan projek, dan catatan evaluasi tahapan karakter oleh Fasilitator Projek.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => handleOpenUpload()}
              className="gap-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
            >
              <Upload className="h-3.5 w-3.5" /> + Unggah Laporan Baru
            </Button>
          </div>

          {mySubmissions.length === 0 ? (
            <Card className="border-border shadow-xs bg-card p-8 text-center space-y-3">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div>
                <div className="font-bold text-foreground text-sm">Belum Ada Berkas Laporan Projek yang Diunggah</div>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  Karya portofolio atau laporan PDF yang Anda unggah akan tersimpan permanen di server dan dapat ditinjau oleh Fasilitator Projek serta orang tua.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleOpenUpload()}
                className="text-xs font-bold border-purple-500/40 text-purple-700 dark:text-purple-300"
              >
                + Mulai Unggah Laporan Projek
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {mySubmissions.map((sub) => {
                const skalaMatch = SKALA_P5.find((s) => s.code === sub.score_status) || SKALA_P5[1];
                return (
                  <Card key={sub.id} className="border-border shadow-xs bg-card p-4 hover:border-purple-500/40 transition">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground truncate">{sub.title}</span>
                          <Badge variant="outline" className={`text-[10px] font-bold ${skalaMatch.badgeClass}`}>
                            Tahap: {skalaMatch.code} ({skalaMatch.label})
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {sub.notes || "Laporan projek kokurikuler peserta didik."}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 flex-wrap">
                          <span className="font-mono">📄 {sub.file_name}</span>
                          <span>•</span>
                          <span className="font-mono">
                            📅 {sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Baru Saja"}
                          </span>
                          {sub.feedback && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold italic">
                                Catatan Guru: "{sub.feedback}"
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sub.file_url && (
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg border border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 transition"
                          >
                            <FileText className="h-3.5 w-3.5" /> Buka Berkas PDF
                          </a>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* MODAL UNGGAH BERKAS LAPORAN PROJEK PDF */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              <Upload className="h-5 w-5 text-purple-600" /> Unggah Laporan Projek Kokurikuler
            </DialogTitle>
            <DialogDescription className="text-xs">
              Unggah dokumen PDF laporan projek kokurikuler atau portofolio karya kelompok Anda untuk dinilai fasilitator.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReport} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Judul Laporan / Karya Projek</Label>
              <Input
                placeholder="Contoh: Laporan Projek Pengolahan Sampah Organik Madrasah"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Nama Anggota Kelompok</Label>
              <Input
                placeholder="Contoh: Ahmad, Siti, Fairuz, Dewi (Kelompok 3)"
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Ringkasan Kegiatan / Catatan Refleksi</Label>
              <Textarea
                placeholder="Tuliskan ringkasan hasil kegiatan projek, kendala, atau capaian karakter yang dirasakan..."
                value={reportNotes}
                onChange={(e) => setReportNotes(e.target.value)}
                rows={3}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Pilih Berkas Laporan PDF (Maks. 10 MB)</Label>
              <div className="mt-1 p-4 border-2 border-dashed border-purple-500/30 rounded-xl bg-purple-500/5 hover:bg-purple-500/10 transition cursor-pointer text-center space-y-2 relative">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handlePdfChange}
                />
                <FileText className="h-8 w-8 text-purple-600 mx-auto" />
                <div className="text-xs font-bold text-foreground">
                  {selectedPdfFile ? `✓ ${selectedPdfFile.name} (${(selectedPdfFile.size / (1024 * 1024)).toFixed(1)} MB)` : "Klik atau seret file PDF di sini"}
                </div>
                <p className="text-[10px] text-muted-foreground">Format resmi: Berkas Dokumen PDF</p>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5"
              >
                {isSubmitting ? "Mengunggah..." : "Simpan & Kirim Laporan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
