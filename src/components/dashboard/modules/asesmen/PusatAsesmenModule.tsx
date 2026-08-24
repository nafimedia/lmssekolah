import { useState, useEffect } from "react";
import { ClipboardCheck, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { isSubjectAllowedForUser } from "@/services/teacherSubjectAccess";
import { toast } from "sonner";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";

export function PusatAsesmenModule({ activeRole, initialTab = "formatif" }: { activeRole?: string; initialTab?: string }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleCreateQuiz = () => {
    const newQuiz = {
      id: String(Date.now()),
      title: "Kuis Baru Pembelajaran",
      soalCount: 10,
      status: "Live",
    };
    setQuizzes((prev) => [newQuiz, ...prev]);
    toast.success("✅ Kuis Interaktif Baru berhasil dibuat!");
  };

  return (
    <>
      {activeRole === "siswa" ? (
        <StudentHeaderBanner
          title={
            activeTab === "kuis"
              ? "Kuis Interaktif Live Saya"
              : activeTab === "individu"
              ? "Tugas & Submisi LKPD Saya"
              : "Pusat Asesmen & Penilaian Saya"
          }
          subtitle="Portal pengerjaan kuis kilat interaktif, tugas mandiri LKPD digital, dan asesmen Kurikulum Merdeka"
          icon={ClipboardCheck}
          studentClass="Kelas VIII A"
          statusText="Portofolio Asesmen Aktif"
          statusVariant="success"
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-primary" /> Pusat Asesmen & Penilaian Pembelajaran
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Reorganisasi modul asesmen Kurikulum Merdeka Kemenag: Formatif, Sumatif, Kuis Interaktif, Tugas Individu, Kelompok, & Tidak Terstruktur.
            </p>
          </div>
        </div>
      )}

      {/* 6 Tabs Submenu Asesmen */}
      <Tabs defaultValue="formatif" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 h-auto p-1 bg-muted/60 rounded-xl mb-6 gap-1">
          <TabsTrigger value="formatif" className="text-[11px] sm:text-xs font-bold py-2 px-1">📝 Formatif</TabsTrigger>
          <TabsTrigger value="sumatif" className="text-[11px] sm:text-xs font-bold py-2 px-1">🎯 Sumatif</TabsTrigger>
          <TabsTrigger value="kuis" className="text-[11px] sm:text-xs font-bold py-2 px-1">⚡ Kuis</TabsTrigger>
          <TabsTrigger value="individu" className="text-[11px] sm:text-xs font-bold py-2 px-1">👤 Individu</TabsTrigger>
          <TabsTrigger value="kelompok" className="text-[11px] sm:text-xs font-bold py-2 px-1">👥 Kelompok</TabsTrigger>
          <TabsTrigger value="terstruktur" className="text-[11px] sm:text-xs font-bold py-2 px-1">🌐 Non Terstruktur</TabsTrigger>
        </TabsList>

        <TabsContent value="formatif">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold">Asesmen Formatif (Formatif 1, 2, 3)</CardTitle>
                  <CardDescription className="text-xs">Observasi harian, diskusi kelompok, & asesmen proses pembelajaran siswa.</CardDescription>
                </div>
                <Button size="sm" className="text-xs font-bold bg-primary text-primary-foreground" onClick={() => toast.success("Form Input Asesmen Formatif Baru dibuat!")}>
                  + Buat Formatif Baru
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3">Nama Asesmen Formatif</th>
                    <th className="p-3">Mata Pelajaran & Kelas</th>
                    <th className="p-3 text-center">Tanggal Asesmen</th>
                    <th className="p-3 text-center">Siswa Dinilai</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30 transition">
                    <td className="p-3 font-bold text-foreground">Formatif 1: Observasi Praktik Tajwid Mad Silah</td>
                    <td className="p-3 font-medium">{"Al-Quran Hadits (Kelas VIII A)"}</td>
                    <td className="p-3 text-center font-mono">15 Juli 2026</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-500">32/32 Siswa (100%)</td>
                    <td className="p-3 text-right"><Badge className="bg-emerald-600 text-white">TUNTAS</Badge></td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition">
                    <td className="p-3 font-bold text-foreground">Formatif 2: Diskusi Kelompok Syarat Sembelihan</td>
                    <td className="p-3 font-medium">Fiqih (Kelas IX C)</td>
                    <td className="p-3 text-center font-mono">20 Juli 2026</td>
                    <td className="p-3 text-center font-mono font-bold text-blue-500">28/32 Siswa (87%)</td>
                    <td className="p-3 text-right"><Badge variant="outline" className="text-blue-500 border-blue-500/30">BERLANGSUNG</Badge></td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sumatif">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold">Asesmen Sumatif (Sumatif 1 PTS, Sumatif 2 Unit, Sumatif 3 PAS)</CardTitle>
                  <CardDescription className="text-xs">Ujian terstruktur penentu pencapaian ketuntasan Kurikulum Merdeka.</CardDescription>
                </div>
                <Button size="sm" className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white" onClick={() => toast.success("Jadwal Ujian Sumatif Baru ditambahkan!")}>
                  + Buat Sumatif Baru
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3">Nama Asesmen Sumatif</th>
                    <th className="p-3">Mata Pelajaran & Rombel</th>
                    <th className="p-3 text-center">Batas Pengerjaan</th>
                    <th className="p-3 text-center">Rata-rata Nilai</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30 transition">
                    <td className="p-3 font-bold text-foreground">Sumatif 1 (PTS): CBT Tajwid & Hadits Ganjil</td>
                    <td className="p-3 font-medium">{"Al-Quran Hadits (Kelas VIII A)"}</td>
                    <td className="p-3 text-center font-mono">15 Agustus 2026</td>
                    <td className="p-3 text-center font-mono font-bold text-primary text-sm">91.4</td>
                    <td className="p-3 text-right">
                      {isSubjectAllowedForUser("Al-Quran Hadits") ? (
                        <Button size="sm" variant="ghost" className="text-xs text-primary font-bold">Input Skor →</Button>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">🔒 Read-Only</Badge>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kuis">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold">Kuis Interaktif Online</CardTitle>
                  <CardDescription className="text-xs">Platform kuis kilat Pilihan Ganda & Isian singkat interaktif.</CardDescription>
                </div>
                {activeRole !== "siswa" && (
                  <Button size="sm" className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black" onClick={handleCreateQuiz}>
                    + Buat Kuis Baru
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {quizzes.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/20 space-y-2">
                  <div className="font-bold text-xs text-foreground">Belum Ada Kuis Interaktif Live</div>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {activeRole === "siswa"
                      ? "Belum ada kuis interaktif yang dibuka oleh guru pengampu saat ini."
                      : "Belum ada kuis yang dibuat. Klik '+ Buat Kuis Baru' di atas untuk membuat sesi kuis baru."}
                  </p>
                </div>
              ) : (
                quizzes.map((q) => (
                  <div key={q.id} className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex justify-between items-center mb-3">
                    <div>
                      <Badge className="bg-amber-500 text-black text-[10px] font-bold mb-1">⚡ KUIS INTERAKTIF LIVE</Badge>
                      <div className="font-bold text-base text-foreground">{q.title}</div>
                      <div className="text-xs text-muted-foreground">{q.soalCount} Soal Pilihan Ganda</div>
                    </div>
                    <Button size="sm" className="bg-amber-500 text-black font-bold text-xs" onClick={() => toast.success("Sesi Kuis Interaktif dimulai!")}>
                      Mulai Kuis Live ▶
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individu">
          <Card className="border-border p-5 text-xs text-muted-foreground">
            Daftar Penugasan Mandiri Siswa (Tugas Individu LKPD Pertemuan 1-18).
          </Card>
        </TabsContent>

        <TabsContent value="kelompok">
          <Card className="border-border p-5 text-xs text-muted-foreground">
            Daftar Penugasan Kelompok & Ruang Diskusi Kolaboratif Siswa.
          </Card>
        </TabsContent>

        <TabsContent value="terstruktur">
          <Card className="border-border p-5 text-xs text-muted-foreground">
            Penugasan Tidak Terstruktur (Portofolio Mandiri / Projek Bebas Siswa).
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
