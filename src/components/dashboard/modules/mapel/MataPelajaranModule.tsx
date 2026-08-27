import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  ExternalLink,
  Upload,
  Inbox,
  Clock,
  AlertTriangle,
  FileCheck,
  UserCheck,
  Check,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";

export function MataPelajaranModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const isWakaOrKamad = activeRole === "waka" || activeRole === "kamad" || activeRole === "admin" || activeRole === "admin_akademik";
  const isWaka = activeRole === "waka";
  const isKamad = activeRole === "kamad";
  const me = MysqlAuthService.getActiveUser();
  const currentTeacherName = me?.full_name || userProfile?.name || "Guru Pengampu";

  const rawClass = userProfile?.class_name || "VIII-A";
  const getStudentGradeKey = (cName: string): "VII" | "VIII" | "IX" => {
    if (cName.includes("7") || cName.toUpperCase().includes("VII")) return "VII";
    if (cName.includes("9") || cName.toUpperCase().includes("IX")) return "IX";
    return "VIII";
  };

  const [kelas, setKelas] = useState<"VII" | "VIII" | "IX">(isSiswa ? getStudentGradeKey(rawClass) : "VIII");
  const [selectedMapel, setSelectedMapel] = useState<string | null>(null);

  // Dynamic Teacher & Subject State from MySQL
  const [mapelsStateList, setMapelsStateList] = useState<any[]>([]);
  const [isLoadingMapel, setIsLoadingMapel] = useState(true);

  // Real Database Perangkat Materials State
  const [realMaterials, setRealMaterials] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [previewModal, setPreviewModal] = useState<any | null>(null);

  // Filter States
  const [jenisFilter, setJenisFilter] = useState<string>("semua");
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  // Load Master Subjects and Dynamic Teacher Assignments from MySQL
  const fetchMapelsAndTeachers = async () => {
    setIsLoadingMapel(true);
    try {
      const [subjects, schedules, users] = await Promise.all([
        MysqlDataService.getSubjects(),
        MysqlDataService.getJadwalPelajaran(),
        MysqlDataService.getUsers(),
      ]);

      const baseList = (subjects && subjects.length >= 5) ? subjects : INITIAL_MASTER_MAPEL;

      const formatted = baseList.map((r: any) => {
        const subjectName = r.subject_name || r.name || "Mata Pelajaran";
        const masterMatch = INITIAL_MASTER_MAPEL.find(
          (m) => m.name.toLowerCase() === subjectName.toLowerCase()
        );

        // Find all assigned teachers dynamically from Schedule or User specialty in MySQL
        const matchingFromSchedule = (schedules || [])
          .filter(
            (s: any) =>
              s.mapel?.toLowerCase().trim() === subjectName.toLowerCase().trim() &&
              s.guru &&
              s.guru.trim() !== "-" &&
              s.guru.trim() !== "Belum Ditentukan"
          )
          .map((s: any) => s.guru.trim());

        const matchingFromUsers = (users || [])
          .filter(
            (u: any) =>
              u.role !== "siswa" &&
              ((u.subject_specialty && u.subject_specialty.toLowerCase().includes(subjectName.toLowerCase())) ||
                (u.assignedSubject && u.assignedSubject.toLowerCase().includes(subjectName.toLowerCase())))
          )
          .map((u: any) => (u.full_name || u.name).trim());

        const allTeachers = Array.from(new Set([...matchingFromSchedule, ...matchingFromUsers]));

        const assignedTeacher =
          allTeachers.length > 0
            ? allTeachers.join(", ")
            : r.teacher || masterMatch?.teacher || "Tim Guru Pengampu";

        return {
          code: r.code || masterMatch?.code || `MP-${r.id || Math.random()}`,
          name: subjectName,
          category: r.category || masterMatch?.category || "Umum",
          teacher: assignedTeacher,
          icon: masterMatch?.icon || "📖",
          jp: r.jp_per_week || (masterMatch ? parseInt(masterMatch.jp) : 2),
        };
      });

      setMapelsStateList(formatted);
    } catch (err) {
      console.warn("Fetch mapel error:", err);
    } finally {
      setIsLoadingMapel(false);
    }
  };

  // Fetch Perangkat Pembelajaran Materials for Selected Subject
  const fetchPerangkatMaterials = async () => {
    if (!selectedMapel) return;
    setIsLoadingMaterials(true);
    try {
      const items = await MysqlDataService.getMaterials();
      if (items && items.length > 0) {
        const filtered = items.filter((m: any) => {
          const subjectName = (m.subject_name || "").toLowerCase();
          const targetMapel = selectedMapel.toLowerCase();
          return subjectName.includes(targetMapel) || targetMapel.includes(subjectName);
        });
        setRealMaterials(filtered);
      } else {
        setRealMaterials([]);
      }
    } catch (e) {
      setRealMaterials([]);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  useEffect(() => {
    fetchMapelsAndTeachers();
  }, [kelas]);

  useEffect(() => {
    if (selectedMapel) {
      fetchPerangkatMaterials();
    }
  }, [selectedMapel, kelas]);

  // Update Status Pengesahan Waka/Kamad
  const handleUpdateStatus = async (materialId: string, title: string, nextStatus: string) => {
    try {
      const target = realMaterials.find((m) => String(m.id) === String(materialId));
      if (target) {
        await MysqlDataService.saveMaterial({
          ...target,
          status: nextStatus,
        });
        toast.success(`✅ Status pengesahan "${title}" diperbarui menjadi "${nextStatus}"`);
        await fetchPerangkatMaterials();
      }
    } catch (err) {
      toast.error("Gagal memperbarui status pengesahan.");
    }
  };

  const selectedMapelTeacher = useMemo(() => {
    if (!selectedMapel) return "Belum Ada Guru Pengampu";
    const found = mapelsStateList.find((m) => m.name.toLowerCase() === selectedMapel.toLowerCase());
    return found?.teacher || "Belum Ada Guru Pengampu";
  }, [selectedMapel, mapelsStateList]);

  // Filtered Perangkat Materials
  const filteredMaterials = useMemo(() => {
    return realMaterials.filter((m) => {
      const matchJenis = jenisFilter === "semua" || (m.type || "").toLowerCase().includes(jenisFilter.toLowerCase());
      const matchStatus =
        statusFilter === "semua" ||
        (statusFilter === "verified" && m.status === "Terverifikasi Waka") ||
        (statusFilter === "pending" && m.status !== "Terverifikasi Waka" && m.status !== "Perlu Revisi") ||
        (statusFilter === "revisi" && m.status === "Perlu Revisi");
      return matchJenis && matchStatus;
    });
  }, [realMaterials, jenisFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Perangkat Pembelajaran & Modul Ajar Resmi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pengelolaan & Pengesahan Dokumen Administrasi KBM Resmi Guru (Modul Ajar, RPP, CP/TP, Silabus, Prota, Promes).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["VII", "VIII", "IX"] as const).map((g) => (
            <Button
              key={g}
              size="sm"
              variant={kelas === g ? "default" : "outline"}
              className={`text-xs font-bold ${kelas === g ? "bg-emerald-600 text-white" : ""}`}
              onClick={() => {
                setKelas(g);
                setSelectedMapel(null);
              }}
            >
              Tingkat {g}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content: Subject Selection Grid OR Subject Document Table */}
      {!selectedMapel ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Daftar Mata Pelajaran Tingkat {kelas} (Data Guru Real-time MySQL):
            </div>
            <Badge variant="outline" className="text-xs font-mono text-emerald-600 border-emerald-500/30 font-bold">
              {mapelsStateList.length} Mata Pelajaran
            </Badge>
          </div>

          {isLoadingMapel ? (
            <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
              Memuat data mata pelajaran & guru pengampu dari database MySQL...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mapelsStateList.map((m) => (
                <Card
                  key={m.code}
                  className="border-border hover:border-emerald-500/50 transition shadow-xs cursor-pointer bg-card group"
                  onClick={() => setSelectedMapel(m.name)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600">
                        {m.category}
                      </Badge>
                      <span className="text-xl group-hover:scale-110 transition-transform">{m.icon}</span>
                    </div>
                    <CardTitle className="text-base font-bold mt-2 text-foreground group-hover:text-emerald-600 transition">
                      {m.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                      👨‍🏫 <span>{m.teacher}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border mt-3">
                    <span>Target: Kelas {kelas}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{m.jp} JP / Minggu</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Subject Header */}
          <div className="p-5 bg-card rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <Button size="sm" variant="outline" className="h-9 text-xs font-bold gap-1 shrink-0" onClick={() => setSelectedMapel(null)}>
                ← Kembali
              </Button>
              <div>
                <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                  <span>📖 {selectedMapel}</span>
                  <Badge className="bg-emerald-600 text-white font-bold text-xs">Tingkat {kelas}</Badge>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  👨‍🏫 <strong>Guru Pengampu:</strong> <span className="text-foreground font-semibold">{selectedMapelTeacher}</span>
                </p>
              </div>
            </div>

            {isWakaOrKamad && (
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs font-bold border-amber-500/40 text-amber-600 bg-amber-500/10">
                  🏛️ Mode Pengesahan Kurikulum (Waka / Kamad)
                </Badge>
              </div>
            )}
          </div>

          {/* Official Perangkat Pembelajaran Documents Table */}
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="p-5 pb-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                  Berkas Perangkat Pembelajaran & Modul Ajar Resmi ({selectedMapel})
                </CardTitle>
                <CardDescription className="text-xs">
                  Modul Ajar, RPP, CP/TP, Silabus, Prota, dan Promes resmi yang membutuhkan status pengesahan Waka Kurikulum.
                </CardDescription>
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  size="sm"
                  variant={statusFilter === "semua" ? "default" : "outline"}
                  className={`h-7 text-[11px] font-bold ${statusFilter === "semua" ? "bg-emerald-600 text-white" : ""}`}
                  onClick={() => setStatusFilter("semua")}
                >
                  Semua ({realMaterials.length})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  className={`h-7 text-[11px] font-bold ${statusFilter === "pending" ? "bg-amber-600 text-white" : ""}`}
                  onClick={() => setStatusFilter("pending")}
                >
                  ⏳ Menunggu ({realMaterials.filter((m) => m.status !== "Terverifikasi Waka" && m.status !== "Perlu Revisi").length})
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === "verified" ? "default" : "outline"}
                  className={`h-7 text-[11px] font-bold ${statusFilter === "verified" ? "bg-emerald-600 text-white" : ""}`}
                  onClick={() => setStatusFilter("verified")}
                >
                  ✅ Disetujui ({realMaterials.filter((m) => m.status === "Terverifikasi Waka").length})
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {isLoadingMaterials ? (
                <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
                  Memuat berkas perangkat pembelajaran dari database MySQL...
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border rounded-xl bg-muted/10 space-y-2">
                  <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <h4 className="font-bold text-xs text-foreground">Belum Ada Dokumen Perangkat Pembelajaran</h4>
                  <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                    Belum ada berkas Modul Ajar / RPP / Administrasi KBM tersimpan di database untuk mata pelajaran <strong>{selectedMapel} (Tingkat {kelas})</strong>.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMaterials.map((mat: any) => {
                    const isVerified = mat.status === "Terverifikasi Waka";
                    const isRevisi = mat.status === "Perlu Revisi";

                    return (
                      <div
                        key={mat.id}
                        className="p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600">
                              {mat.type || "Modul Ajar / RPP"}
                            </Badge>
                            {isVerified ? (
                              <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Disahkan Waka Kurikulum
                              </Badge>
                            ) : isRevisi ? (
                              <Badge variant="destructive" className="font-bold text-[10px] gap-1">
                                <AlertTriangle className="h-3 w-3" /> Perlu Revisi
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold text-[10px] gap-1">
                                <Clock className="h-3 w-3" /> Menunggu Verifikasi Waka
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-foreground">{mat.title}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>👨‍🏫 Pengunggah: <strong>{mat.uploaded_by || mat.teacher_name || selectedMapelTeacher}</strong></span>
                            <span>• Ukuran: {mat.size || "3.5 MB"}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs font-bold gap-1"
                            onClick={() =>
                              setPreviewModal({
                                title: mat.title,
                                type: mat.type || "Modul Ajar PDF",
                                size: mat.size || "3.5 MB",
                                file_url: mat.file_url,
                                status: mat.status,
                                uploaded_by: mat.uploaded_by || mat.teacher_name || selectedMapelTeacher,
                              })
                            }
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Buka Dokumen
                          </Button>

                          {/* Approval Actions for Waka / Kamad */}
                          {isWakaOrKamad && (
                            <>
                              {!isVerified && (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                                  onClick={() => handleUpdateStatus(String(mat.id), mat.title, "Terverifikasi Waka")}
                                >
                                  <Check className="h-3.5 w-3.5" /> Sahkan
                                </Button>
                              )}
                              {isVerified && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-amber-500/40 text-amber-600 text-xs font-bold gap-1"
                                  onClick={() => handleUpdateStatus(String(mat.id), mat.title, "Menunggu Verifikasi Waka")}
                                >
                                  <RotateCcw className="h-3.5 w-3.5" /> Batalkan Pengesahan
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewModal && (
        <Dialog open={!!previewModal} onOpenChange={() => setPreviewModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" /> Preview Perangkat Pembelajaran
              </DialogTitle>
              <DialogDescription className="text-xs">
                Detail dokumen administrasi KBM {previewModal.title}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <div className="font-bold text-foreground">{previewModal.title}</div>
                <div className="text-muted-foreground">Pengunggah: {previewModal.uploaded_by}</div>
                <div className="text-muted-foreground">Ukuran: {previewModal.size}</div>
                <div className="text-emerald-600 font-bold mt-1">Status: {previewModal.status || "Menunggu Verifikasi Waka"}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => setPreviewModal(null)}>
                Tutup
              </Button>
              {previewModal.file_url && (
                <a href={previewModal.file_url} target="_blank" rel="noreferrer">
                  <Button size="sm" className="bg-emerald-600 text-white font-bold gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> Download / Buka Berkas
                  </Button>
                </a>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
