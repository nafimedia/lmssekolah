import { useState, useEffect, useMemo } from "react";
import {
  FolderKanban,
  Download,
  Award,
  Plus,
  Edit,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Sprout,
  GraduationCap,
  Palette,
  FileSpreadsheet,
  Printer,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MysqlDataService } from "@/services/mysqlDataService";
import { exportToExcelXml } from "@/utils/excelExporter";
import { toast } from "sonner";

export interface P5ProjectItem {
  id: string;
  title: string;
  target: string;
  coordinator: string;
  progress: number;
  studentsCount: number;
  status: string;
  outcomes: string[];
  dimensions?: string;
}

export function KokurikulerModule({ activeRole }: { activeRole?: string }) {
  const isExecutive = activeRole === "kamad" || activeRole === "admin" || activeRole === "waka";

  // Initialize with empty array - strictly no hardcoded dummy data
  const [projectsList, setProjectsList] = useState<P5ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    let persisted: P5ProjectItem[] = [];
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lms_p5_projects_v2");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            persisted = parsed;
          }
        }
      } catch (e) { }
    }

    MysqlDataService.getP5Projects()
      .then((dbList) => {
        if (!isMounted) return;
        if (dbList && dbList.length > 0) {
          const mapped: P5ProjectItem[] = dbList.map((item, idx) => ({
            id: String(item.id || `p-${idx + 1}`),
            title: item.title,
            target: item.class_name || `Tingkat Kelas`,
            coordinator: (item as any).coordinator || "Koordinator P5-PPRA",
            progress: item.progress_pct || 0,
            studentsCount: (item as any).students_count || 0,
            status: item.status || "Dalam Proses",
            outcomes: item.target_dimension ? [item.target_dimension] : [],
            dimensions: item.target_dimension || "Profil Pelajar Pancasila",
          }));
          setProjectsList(mapped);
        } else if (persisted.length > 0) {
          setProjectsList(persisted);
        } else {
          // If no data exists in DB or localStorage, keep empty array
          setProjectsList([]);
        }
      })
      .catch(() => {
        if (isMounted) setProjectsList(persisted);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [isPrintP5ModalOpen, setIsPrintP5ModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    if (projectsList.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projectsList[0].id);
    }
  }, [projectsList, selectedProjectId]);

  const activeProject = useMemo(() => {
    return projectsList.find((p) => p.id === selectedProjectId) || projectsList[0] || null;
  }, [projectsList, selectedProjectId]);

  const handlePrintP5 = () => {
    if (!activeProject) {
      toast.error("Belum ada data projek untuk dicetak.");
      return;
    }
    window.print();
    toast.success(`Laporan Portofolio P5 (${activeProject.title}) berhasil dicetak!`);
  };

  const handleExportExcelP5 = () => {
    if (projectsList.length === 0) {
      toast.error("Belum ada data projek P5 untuk di-export.");
      return;
    }
    const headers = ["No", "Judul Tema Projek P5", "Sasaran Tingkat", "Koordinator Utama", "Total Siswa", "Capaian Progress", "Status Evaluasi", "Hasil Produk Karya"];
    const rows = projectsList.map((p, idx) => [
      idx + 1,
      String(p.title || ""),
      String(p.target || ""),
      String(p.coordinator || ""),
      Number(p.studentsCount || 0),
      `${p.progress || 0}%`,
      String(p.status || ""),
      (p.outcomes || []).join(", "),
    ]);
    exportToExcelXml("Rekap_Laporan_P5_PPA_RA_MTsN2Cilacap", "Laporan_P5", headers, rows);
    toast.success("File Rekap Excel Laporan P5 & PPA-RA Berhasil Diunduh!");
  };

  const totalStudentsInvolved = useMemo(() => {
    return projectsList.reduce((acc, curr) => acc + (curr.studentsCount || 0), 0);
  }, [projectsList]);

  const totalOutcomesCount = useMemo(() => {
    return projectsList.reduce((acc, curr) => acc + (curr.outcomes?.length || 0), 0);
  }, [projectsList]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Laporan Eksekutif Kokurikuler (P5 & PPA-RA)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rekapitulasi Eksekutif Kepala Madrasah atas Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin MTsN 2 Cilacap.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
            onClick={handleExportExcelP5}
            disabled={projectsList.length === 0}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" /> Export Excel (.xls)
          </Button>
          <Button
            size="sm"
            className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            onClick={() => {
              if (projectsList.length === 0) {
                toast.error("Belum ada data projek P5 untuk dicetak.");
                return;
              }
              setIsPrintP5ModalOpen(true);
            }}
            disabled={projectsList.length === 0}
          >
            <Printer className="h-3.5 w-3.5" /> Cetak Portofolio P5 PDF
          </Button>
        </div>
      </div>

      {/* Real Stat Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/5 via-card to-card border-emerald-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center font-bold shrink-0">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Projek Kokurikuler</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{projectsList.length} Tema Aktif</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500/5 via-card to-card border-teal-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 grid place-items-center font-bold shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Siswa Terlibat</div>
              <div className="text-2xl font-extrabold font-mono text-teal-600 dark:text-teal-400">{totalStudentsInvolved} Siswa</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/5 via-card to-card border-amber-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center font-bold shrink-0">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Gelar Karya & Produk Siswa</div>
              <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">{totalOutcomesCount} Produk Karya</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Memuat Laporan P5 & PPA-RA dari Database...</div>
      ) : projectsList.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2">
          <FolderKanban className="h-8 w-8 text-muted-foreground/50 mx-auto" />
          <div className="font-semibold text-foreground text-sm">Belum Ada Data Projek P5 & PPA-RA Terdaftar</div>
          <p>Database saat ini tidak memiliki rekam data projek kokurikuler.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projectsList.map((p) => (
            <Card key={p.id} className="border-border hover:border-emerald-500/40 transition shadow-xs">
              <CardHeader className="p-5 pb-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <Badge className="bg-emerald-600 text-white text-[10px] mb-1">{p.target}</Badge>
                    <CardTitle className="text-lg font-bold">{p.title}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Koordinator Projek: <strong>{p.coordinator}</strong> • {p.studentsCount} Siswa Terlibat
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 gap-1 hover:bg-emerald-500/10"
                      onClick={() => {
                        setSelectedProjectId(p.id);
                        setIsPrintP5ModalOpen(true);
                      }}
                    >
                      <Printer className="h-3 w-3" /> Pratinjau Portofolio
                    </Button>
                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold text-xs shrink-0 bg-emerald-500/10">
                      {p.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-5 pb-5 pt-0 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Capaian Implementasi Projek</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{p.progress}% Tuntas</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                {p.outcomes && p.outcomes.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <div className="text-xs font-bold text-muted-foreground">Hasil Produk & Gelar Karya Siswa:</div>
                    <div className="flex flex-wrap gap-2">
                      {p.outcomes.map((out, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs font-medium gap-1"
                        >
                          <Sparkles className="h-3 w-3 text-emerald-500" /> {out}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog Pratinjau & Cetak PDF Portfolio P5 */}
      {activeProject && (
        <Dialog open={isPrintP5ModalOpen} onOpenChange={setIsPrintP5ModalOpen}>
          <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-emerald-600" /> Pratinjau Portofolio P5 & PPA-RA
                </div>
                <Badge className="bg-emerald-600 text-white text-xs">{activeProject.target}</Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Format Laporan Portofolio Capaian Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil Alamin MTsN 2 Cilacap.
              </DialogDescription>
            </DialogHeader>

            <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs">
              <Label className="text-[11px] font-semibold text-muted-foreground">Pilih Tema Projek P5</Label>
              <select
                className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs mt-1 font-bold"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.target})
                  </option>
                ))}
              </select>
            </div>

            <div className="p-6 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-md font-sans space-y-4">
              <div className="border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-4 mb-2">
                  <img src="/logomts.png" alt="Logo MTsN 2 Cilacap" className="h-14 w-14 object-contain shrink-0" />
                  <div className="text-center flex-1 pr-14">
                    <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                    <div className="text-base font-black tracking-wide text-slate-900 uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</div>
                    <div className="text-[10px] text-slate-600">Jl. Raya Sindangbarang KM.4 Karangpucung Kode Pos 53255</div>
                  </div>
                </div>
                <div className="mt-2 py-1 bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs text-center">
                  PORTOFOLIO CAPAIAN PROJEK P5 & PPA-RA
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-xs space-y-1 text-slate-800 font-medium">
                <div>Nama Projek: <strong className="text-emerald-900 font-bold">{activeProject.title}</strong></div>
                <div>Sasaran Tingkat: <strong>{activeProject.target}</strong></div>
                <div>Koordinator Projek: <strong>{activeProject.coordinator}</strong> • Total Siswa: <strong>{activeProject.studentsCount} Siswa</strong></div>
                <div>Status Pencapaian: <strong className="text-emerald-700 font-bold">{activeProject.status} ({activeProject.progress}% Tuntas)</strong></div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tabel Rubrik Penilaian Dimensi Pelajar Pancasila:</div>
                <table className="w-full text-[11px] border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                      <th className="border border-slate-300 p-2 text-left">Dimensi / Elemen Profil</th>
                      <th className="border border-slate-300 p-2 text-center">Tingkat Capaian</th>
                      <th className="border border-slate-300 p-2 text-left">Deskripsi Hasil Observasi Projek</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 font-bold">Beriman, Bertakwa & Berakhlak Mulia</td>
                      <td className="border border-slate-300 p-2 text-center text-emerald-700 font-bold">Sangat Berkembang</td>
                      <td className="border border-slate-300 p-2 text-slate-700">Siswa konsisten menerapkan akhlak lingkungan & kepedulian sosial.</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="border border-slate-300 p-2 font-bold">Gotong Royong & Kolaborasi</td>
                      <td className="border border-slate-300 p-2 text-center text-emerald-700 font-bold">Sangat Berkembang</td>
                      <td className="border border-slate-300 p-2 text-slate-700">Aktif bekerja sama dalam tim pembuatan produk & gelar karya.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {activeProject.outcomes && activeProject.outcomes.length > 0 && (
                <div className="pt-1">
                  <div className="text-xs font-bold text-slate-900 mb-1">Produk Hasil Gelar Karya Siswa:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeProject.outcomes.map((out, idx) => (
                      <span key={idx} className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-xs text-[11px] font-semibold">
                        {out}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-slate-800 border-t border-slate-200">
                <div className="text-center space-y-8">
                  <div>Koordinator Projek P5</div>
                  <div className="font-bold underline text-slate-950">{activeProject.coordinator}</div>
                </div>
                <div className="text-center space-y-8">
                  <div>Cilacap, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />Kepala MTsN 2 Cilacap</div>
                  <div className="font-bold underline text-slate-950">H. SOLIHUN, S.Pd., M.Si</div>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPrintP5ModalOpen(false)}>
                Tutup
              </Button>
              <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5" onClick={handlePrintP5}>
                <Printer className="h-4 w-4" /> Cetak Portofolio P5 PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function KokurikulerSiswaModule() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Kegiatan Kokurikuler & Projek P5-PPRA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin: Kehadiran projek & Laporan Gelar Karya Siswa.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <Badge className="bg-emerald-600 text-white text-[10px] mb-1 w-fit">PROJEK P5 AKTIF</Badge>
            <CardTitle className="text-base font-bold font-mono">Status Projek P5 Saya</CardTitle>
            <CardDescription className="text-xs">Informasi projek & kehadiran kegiatan kokurikuler siswa.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border border-dashed border-border rounded-xl text-center text-xs text-muted-foreground">
              Belum ada projek aktif yang ditugaskan untuk rombel Anda pada database.
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> Penilaian Karakter Profil Pelajar Pancasila
            </CardTitle>
            <CardDescription className="text-xs">Evaluasi pembiasaan karakter & dimensi Rahmatan Lil 'Alamin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 border border-dashed border-border rounded-xl text-center text-xs text-muted-foreground">
              Belum ada evaluasi nilai dimensi P5 yang diinput oleh Koordinator Projek.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
