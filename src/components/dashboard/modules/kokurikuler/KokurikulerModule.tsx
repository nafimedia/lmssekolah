import { useState, useEffect } from "react";
import { FolderKanban, Download, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";

export function KokurikulerModule({ activeRole }: { activeRole?: string }) {
  const [projectsList, setProjectsList] = useState([
    {
      id: "p1",
      title: "Gaya Hidup Berkelanjutan: Pengolahan Sampah Organik & Bank Sampah Madrasah",
      target: "Tingkat VII (Kelas VII A - VII D)",
      coordinator: "Ibu Ratna Dewi, M.Pd",
      progress: 85,
      studentsCount: 312,
      status: "Sangat Berkembang",
      outcomes: ["Kompos Organik Super", "Kerajinan Daur Ulang", "Bank Sampah Digital"],
    },
    {
      id: "p2",
      title: "Kearifan Lokal: Pelestarian Batik & Seni Daerah Cilacap",
      target: "Tingkat VIII (Kelas VIII A - VIII D)",
      coordinator: "Dra. Hj. Siti Rahmah, M.Pd",
      progress: 90,
      studentsCount: 318,
      status: "Sangat Berkembang",
      outcomes: ["Kain Batik Tulis Motif Cilacap", "Pameran Seni Daerah", "Katalog Digital Motif Batik"],
    },
    {
      id: "p3",
      title: "Kewirausahaan: Pasar Digital & Business Day Siswa Madrasah",
      target: "Tingkat IX (Kelas IX A - IX D)",
      coordinator: "H. Ahmad Syukri, S.Kom",
      progress: 95,
      studentsCount: 318,
      status: "Sangat Berkembang",
      outcomes: ["Stand Wirausaha Digital", "Produk Kuliner Halal", "Laporan Keuangan Wirausaha"],
    },
  ]);

  useEffect(() => {
    MysqlDataService.getP5Projects().then((dbList) => {
      if (dbList && dbList.length > 0) {
        const mapped = dbList.map((item) => ({
          id: String(item.id || Date.now()),
          title: item.title,
          target: item.class_name,
          coordinator: "Koordinator P5",
          progress: item.progress_pct || 80,
          studentsCount: 300,
          status: item.status || "Sangat Berkembang",
          outcomes: [item.target_dimension, "Karya P5 Digital", "Laporan Projek"],
        }));
        setProjectsList(mapped);
      } else if (dbList && dbList.length === 0) {
        setProjectsList([]);
      }
    });
  }, []);

  const [isPrintP5ModalOpen, setIsPrintP5ModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("p1");

  const activeProject = projectsList.find((p) => p.id === selectedProjectId) || projectsList[0];

  const handlePrintP5 = () => {
    window.print();
    toast.success(`🖨️ Laporan Portofolio P5 (${activeProject.title}) berhasil dicetak!`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-purple-500" /> Laporan Kegiatan Kokurikuler (P5 & PPA-RA)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rekap Eksekutif Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil Alamin (P5/PPA-RA) MTsN 2 Cilacap.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setIsPrintP5ModalOpen(true)}>
          <Download className="h-3.5 w-3.5 mr-1" /> 🖨️ Cetak Portfolio P5 PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-500/10 via-card to-card border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-purple-500/20 text-purple-500 grid place-items-center font-bold text-xl">
              🌿
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Projek Kokurikuler</div>
              <div className="text-2xl font-extrabold font-mono text-purple-500">3 Tema Aktif</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/20 text-emerald-500 grid place-items-center font-bold text-xl">
              🎓
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Siswa Terlibat</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-500">948 Siswa (100%)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/20 text-amber-500 grid place-items-center font-bold text-xl">
              🎨
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Gelar Karya & Produk</div>
              <div className="text-2xl font-extrabold font-mono text-amber-500">9 Produk Karya</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {projectsList.map((p) => (
          <Card key={p.id} className="border-border hover:border-purple-500/40 transition shadow-xs">
            <CardHeader className="p-5 pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <Badge className="bg-purple-600 text-white text-[10px] mb-1">{p.target}</Badge>
                  <CardTitle className="text-lg font-bold">{p.title}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Koordinator Projek: <strong>{p.coordinator}</strong> • {p.studentsCount} Siswa</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs font-bold border-purple-500/40 text-purple-600 dark:text-purple-300" onClick={() => { setSelectedProjectId(p.id); setIsPrintP5ModalOpen(true); }}>
                    🖨️ Pratinjau Portfolio
                  </Button>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 font-bold text-xs shrink-0">
                    {p.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-5 pb-5 pt-0 space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Capaian Implementasi Projek</span>
                  <span className="text-purple-500 font-mono font-bold">{p.progress}% Tuntas</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="text-xs font-bold text-muted-foreground">Hasil Produk & Gelar Karya Siswa:</div>
                <div className="flex flex-wrap gap-2">
                  {p.outcomes.map((out, i) => (
                    <Badge key={i} variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs font-medium">
                      ✨ {out}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isPrintP5ModalOpen} onOpenChange={setIsPrintP5ModalOpen}>
        <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-purple-600" /> Pratinjau Portofolio P5 & PPA-RA
              </div>
              <Badge className="bg-purple-600 text-white text-xs">{activeProject.target}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Format Laporan Portofolio Capaian Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil Alamin.
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
              <div className="mt-2 py-1 bg-purple-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs text-center">
                PORTOFOLIO CAPAIAN PROJEK P5 & PPA-RA
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-xs space-y-1 text-slate-800 font-medium">
              <div>Nama Projek: <strong className="text-purple-900 font-bold">{activeProject.title}</strong></div>
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
                  <tr className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 font-bold">Kreativitas & Inovasi Produk</td>
                    <td className="border border-slate-300 p-2 text-center text-purple-700 font-bold">Berkembang Sesuai Harapan</td>
                    <td className="border border-slate-300 p-2 text-slate-700">Mampu menghasilkan karya inovatif yang memiliki nilai ekonomi.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-1">
              <div className="text-xs font-bold text-slate-900 mb-1">Produk Hasil Gelar Karya Siswa:</div>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.outcomes.map((out, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-xs text-[11px] font-semibold">
                    ✨ {out}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Koordinator Projek P5</div>
                <div className="font-bold underline text-slate-950">{activeProject.coordinator}</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, 11 Agustus 2026<br />Kepala MTsN 2 Cilacap</div>
                <div className="font-bold underline text-slate-950">Solihun, S.Pd, M.Si.</div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPrintP5ModalOpen(false)}>
              Tutup
            </Button>
            <Button type="button" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5" onClick={handlePrintP5}>
              <Download className="h-4 w-4" /> 🖨️ Cetak Portofolio P5 PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function KokurikulerSiswaModule() {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-purple-500" /> Kegiatan Kokurikuler & Projek P5-PPRA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin: Kehadiran projek & Laporan Gelar Karya Siswa.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <Badge className="bg-purple-600 text-white text-[10px] mb-1 w-fit">PROJEK P5 AKTIF</Badge>
            <CardTitle className="text-base font-bold">Kerajinan Batik Cilacap & Wirausaha Muda</CardTitle>
            <CardDescription className="text-xs">Koordinator Projek: Dra. Hj. Siti Rahmah • Target Gelar Karya: 25 Agustus 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>Kehadiran Sesi Projek Saya</span>
                <span className="text-emerald-500 font-mono font-bold">100% Hadir (8/8 Sesi)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-2">
              <div className="font-bold text-xs text-foreground">Laporan & Dokumentasi Karya Projek:</div>
              <div className="text-xs text-muted-foreground">
                • Produk Batik Motif Wijayakusuma Cilacap buatan kelompok 8A tuntas diproduksi.<br />
                • Laporan analisis wirausaha & pemasaran siap dipresentasikan pada Gelar Karya.
              </div>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs mt-2" onClick={() => toast.success("Laporan Projek P5 berhasil diunggah!")}>
                + Unggah Berkas Laporan Projek PDF
              </Button>
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
            {[
              { dim: "Beriman, Bertakwa, & Berakhlaq Mulia", score: "Sangat Baik (SB)", icon: "✨" },
              { dim: "Gotong Royong & Kolaborasi Kelompok", score: "Sangat Baik (SB)", icon: "👥" },
              { dim: "Kreativitas & Inovasi Produk Batik", score: "Berkembang Sesuai Harapan (BSH)", icon: "🎨" },
              { dim: "Kemandirian & Wirausaha", score: "Sangat Baik (SB)", icon: "💼" },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <span>{item.icon}</span>
                  <span>{item.dim}</span>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-500/30 font-bold text-[10px]">
                  {item.score}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
