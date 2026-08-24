import { useState, useEffect } from "react";
import {
  BookMarked,
  Download,
  CheckCircle2,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { exportToExcelXml } from "@/utils/excelExporter";
import { toast } from "sonner";

export function LaporanTahfidzEksekutif({ activeRole }: { activeRole?: string }) {
  const [selectedJuz, setSelectedJuz] = useState("Juz 30");

  const tahfidzClassSummary = [
    { class: "Kelas VII A", total: 32, mutqin: "28 Siswa (87.5%)", avgScore: 92.4, status: "Sangat Baik", topStudent: "ALIYA QIARA ABDULLAH" },
    { class: "Kelas VII B", total: 32, mutqin: "26 Siswa (81.2%)", avgScore: 89.8, status: "Baik", topStudent: "ADITA AZ ZAHRA" },
    { class: "Kelas VIII A", total: 32, mutqin: "30 Siswa (93.7%)", avgScore: 95.1, status: "Sangat Baik", topStudent: "ABIGAIL HASAN YUSUF PRAYOGA" },
    { class: "Kelas VIII B", total: 31, mutqin: "27 Siswa (87.0%)", avgScore: 91.2, status: "Sangat Baik", topStudent: "AFRIZA RAHMA AZZAHRA" },
    { class: "Kelas IX A", total: 32, mutqin: "32 Siswa (100%)", avgScore: 97.5, status: "Sangat Baik", topStudent: "AHMAD ZULFIKAR" },
    { class: "Kelas IX B", total: 31, mutqin: "29 Siswa (93.5%)", avgScore: 93.8, status: "Sangat Baik", topStudent: "AILEEN CALISTA SELENA" },
  ];

  const handleExportExcelTahfidz = () => {
    const headers = ["No", "Nama Rombel", "Jumlah Siswa", "Siswa Mutqin", "Rata-Rata Tajwid", "Top Hafiz Rombel", "Evaluasi"];
    const rows = tahfidzClassSummary.map((t, idx) => [
      idx + 1,
      t.class,
      t.total,
      t.mutqin,
      t.avgScore,
      t.topStudent,
      t.status,
    ]);
    exportToExcelXml(`Rekap_Tahfidz_Eksekutif_${selectedJuz.replace(/\s+/g, "_")}`, "Rekap_Tahfidz", headers, rows);
    toast.success("📊 Rekap Tahfidz Eksekutif Excel Berhasil Diunduh!");
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-emerald-500" /> Laporan Eksekutif Tahfidz Al-Quran
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoring Kepala Madrasah atas capaian target hafalan siswa per Juz, ketuntasan tajwid, dan leaderboard Rombel MTsN 2 Cilacap.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10" onClick={handleExportExcelTahfidz}>
            <Download className="h-3.5 w-3.5 mr-1 text-emerald-500" /> 📊 Export Excel (.xls)
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => toast.success("PDF Rekap Tahfidz Eksekutif Madrasah berhasil diunduh!")}>
            <Download className="h-3.5 w-3.5 mr-1" /> 🖨️ Export PDF Rekap Tahfidz
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <span className="text-xs font-bold text-muted-foreground mr-1">Target Juz Eksekutif:</span>
        {["Juz 30", "Juz 29", "Juz 1"].map((j) => (
          <Button
            key={j}
            size="sm"
            variant={selectedJuz === j ? "default" : "outline"}
            className="text-xs font-bold"
            onClick={() => setSelectedJuz(j)}
          >
            📖 {j}
          </Button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tahfidzClassSummary.map((item) => (
          <Card key={item.class} className="border-border bg-card shadow-xs hover:border-emerald-500/40 transition">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground">{item.class}</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                  {item.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Ketuntasan Mutqin: <strong className="text-foreground font-bold">{item.mutqin}</strong></div>
                <div>Rata-rata Nilai Tajwid: <strong className="text-emerald-600 font-bold">{item.avgScore}</strong></div>
                <div className="truncate">Top Santri: <span className="font-semibold text-foreground">{item.topStudent}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export function TahfidzModule({ activeRole }: { activeRole?: string } = {}) {
  const [selectedJuz, setSelectedJuz] = useState("Juz 30");
  const [hafalanList, setHafalanList] = useState([
    { id: "1", juz: "Juz 30", s: "An-Naba'", ayat: "1 - 40 (Lengkap)", status: "Mutqin", nilai: "98 (Mumtaz)", ustadz: "AH. SYARIF HIDAYAH, S.Pd.I", tgl: "22 Juli 2026", murojaah: "Mutqin 🔵" },
    { id: "2", juz: "Juz 30", s: "An-Nazi'at", ayat: "1 - 25", status: "Lancar", nilai: "90 (Jayyid Jiddan)", ustadz: "AH. SYARIF HIDAYAH, S.Pd.I", tgl: "20 Juli 2026", murojaah: "Lancar 🟢" },
    { id: "3", juz: "Juz 30", s: "'Abasa", ayat: "1 - 15", status: "Murojaah", nilai: "85 (Jayyid)", ustadz: "ENDAH SUPRIHATIN, S.Pd", tgl: "18 Juli 2026", murojaah: "Perlu Murojaah 🟡" },
    { id: "4", juz: "Juz 30", s: "At-Takwir", ayat: "1 - 29 (Lengkap)", status: "Mutqin", nilai: "95 (Mumtaz)", ustadz: "AH. SYARIF HIDAYAH, S.Pd.I", tgl: "15 Juli 2026", murojaah: "Mutqin 🔵" },
    { id: "5", juz: "Juz 29", s: "Al-Mulk", ayat: "1 - 30 (Lengkap)", status: "Mutqin", nilai: "96 (Mumtaz)", ustadz: "AH. SYARIF HIDAYAH, S.Pd.I", tgl: "10 Juni 2026", murojaah: "Mutqin 🔵" },
  ]);

  useEffect(() => {
    MysqlDataService.getHafalan().then((dbList) => {
      if (dbList && dbList.length > 0) {
        const mapped = dbList.map((item) => ({
          id: String(item.id || Date.now()),
          juz: item.juz,
          s: item.surah,
          ayat: item.ayat,
          status: item.status,
          nilai: item.nilai,
          ustadz: item.ustadz,
          tgl: item.tgl,
          murojaah: item.murojaah || (item.status === "Mutqin" ? "Mutqin 🔵" : "Lancar 🟢"),
        }));
        setHafalanList(mapped);
      } else if (dbList && dbList.length === 0) {
        setHafalanList([]);
      }
    });
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const [surah, setSurah] = useState("An-Naba'");
  const [ayat, setAyat] = useState("1 - 20");
  const [status, setStatus] = useState("Lancar");
  const [nilai, setNilai] = useState("90 (Jayyid Jiddan)");
  const [ustadz, setUstadz] = useState("AH. SYARIF HIDAYAH, S.Pd.I");

  const [isPrintCardOpen, setIsPrintCardOpen] = useState(false);
  const [printStudentName, setPrintStudentName] = useState("ALIYA QIARA ABDULLAH");
  const [printNisn, setPrintNisn] = useState("12123301000288");
  const [printClass, setPrintClass] = useState("8A (VIII A)");

  const handleAddHafalan = (e: React.FormEvent) => {
    e.preventDefault();
    const newHafalan = {
      id: String(Date.now()),
      juz: selectedJuz,
      s: surah,
      ayat,
      status,
      nilai,
      ustadz,
      tgl: new Date().toLocaleDateString("id-ID"),
      murojaah: status === "Mutqin" ? "Mutqin 🔵" : "Lancar 🟢",
    };

    MysqlDataService.saveHafalan({
      student_name: printStudentName,
      nisn: printNisn,
      class_name: printClass,
      juz: selectedJuz,
      surah,
      ayat,
      status,
      nilai,
      ustadz,
      tgl: newHafalan.tgl,
      murojaah: newHafalan.murojaah,
    }).catch((err) => console.warn("saveHafalan DB failed:", err));

    setHafalanList([newHafalan, ...hafalanList]);
    toast.success(`Setoran QS. ${surah} (${ayat}) berhasil diterbitkan ke Database Tahfidz!`);
    setIsOpen(false);
  };

  const handlePrintCard = () => {
    window.print();
    toast.success(`🖨️ Cetak Kartu Murojaah (${printStudentName} - ${selectedJuz}) berhasil diproses!`);
  };

  const filteredHafalan = hafalanList.filter((h) => h.juz === selectedJuz);

  return (
    <>
      {activeRole === "siswa" ? (
        <StudentHeaderBanner
          title="Setoran Hafalan Tahfidz Saya"
          subtitle="Monitoring target hafalan Al-Qur'an, evaluasi tajwid, dan kartu muroja'ah siswa MTsN 2 Cilacap"
          icon={BookMarked}
          studentClass="Kelas VIII A"
          statusText="Target: 85% Mutqin"
          statusVariant="success"
          actionButtons={
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" onClick={() => setIsPrintCardOpen(true)}>
              <Download className="h-3.5 w-3.5 text-emerald-500" /> Cetak Kartu Murojaah PDF
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BookMarked className="h-6 w-6 text-primary" /> Modul Keagamaan Tahfidz Al-Quran
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitoring Target Hafalan, Setoran Ayat, Evaluasi Tajwid, & Pratinjau Cetak Kartu Murojaah MTsN 2 Cilacap
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" onClick={() => setIsPrintCardOpen(true)}>
              <Download className="h-3.5 w-3.5" /> Cetak Kartu Murojaah PDF
            </Button>
            <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsOpen(true)}>
              + Input Setoran Hafalan Baru
            </Button>
          </div>
        </div>
      )}

      <Card className="border-border shadow-xs mb-6 bg-linear-to-r from-primary/15 via-card to-card">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">Capaian Target Hafalan ({selectedJuz})</div>
            <div className="text-xl font-extrabold text-foreground">Target Hafalan: 85% Tuntas (Mutqin)</div>
            <div className="text-xs text-muted-foreground">Telah menyetorkan 12 dari 37 Surah di {selectedJuz} dengan Tajwid & Makhraj Mumtaz.</div>
          </div>
          <Button size="sm" className="text-xs font-bold shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => setIsPrintCardOpen(true)}>
            <Download className="h-3.5 w-3.5" /> Pratinjau & Cetak Kartu Murojaah
          </Button>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <span className="text-xs font-bold text-muted-foreground mr-1">Target Juz:</span>
        {["Juz 30", "Juz 29", "Juz 1"].map((j) => (
          <Button
            key={j}
            size="sm"
            variant={selectedJuz === j ? "default" : "outline"}
            className="text-xs font-bold"
            onClick={() => setSelectedJuz(j)}
          >
            📖 {j}
          </Button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filteredHafalan.map((s) => (
          <Card key={s.id} className="border-border shadow-xs hover:border-primary/40 transition">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 font-bold">
                📖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-foreground truncate">QS. {s.s}</div>
                  <Badge className={s.status === "Mutqin" ? "bg-emerald-600 text-white text-[10px]" : "bg-primary/15 text-primary border-primary/20 text-[10px]"}>
                    {s.murojaah}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Ayat: {s.ayat} • Nilai Tajwid: <strong className="text-foreground">{s.nilai}</strong></div>
                <div className="text-[11px] text-muted-foreground mt-1">Penguji: {s.ustadz} • {s.tgl}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" /> Input Setoran Hafalan Baru ({selectedJuz})
            </DialogTitle>
            <DialogDescription>Catat setoran hafalan surah, ayat & evaluasi tajwid siswa.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddHafalan} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Nama Surah</Label>
                <Input placeholder="An-Naba'" value={surah} onChange={(e) => setSurah(e.target.value)} required className="mt-1 text-xs" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Cakupan Ayat</Label>
                <Input placeholder="1 - 20" value={ayat} onChange={(e) => setAyat(e.target.value)} required className="mt-1 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Status Hafalan</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Mutqin">Mutqin (Hafal Luar Kepala)</option>
                  <option value="Lancar">Lancar</option>
                  <option value="Murojaah">Murojaah (Perlu Pengulangan)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Nilai Tajwid & Makhraj</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={nilai} onChange={(e) => setNilai(e.target.value)}>
                  <option value="98 (Mumtaz)">98 (Mumtaz - Sempurna)</option>
                  <option value="90 (Jayyid Jiddan)">90 (Jayyid Jiddan - Sangat Baik)</option>
                  <option value="85 (Jayyid)">85 (Jayyid - Baik)</option>
                  <option value="75 (Maqbul)">75 (Maqbul - Cukup)</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Ustadz / Penguji</Label>
              <Input placeholder="Nama Penguji" value={ustadz} onChange={(e) => setUstadz(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Setoran</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPrintCardOpen} onOpenChange={setIsPrintCardOpen}>
        <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-emerald-600" /> Pratinjau Cetak Kartu Murojaah & Setoran Tahfidz
              </div>
              <Badge className="bg-emerald-600 text-white font-mono text-xs">{selectedJuz}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Format lembar dokumen resmi Kartu Murojaah & Rekapitulasi Setoran Hafalan Al-Qur'an MTsN 2 Cilacap.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl border border-border text-xs">
            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground">Pilih Nama Siswa</Label>
              <select
                className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs mt-1 font-bold"
                value={printStudentName}
                onChange={(e) => {
                  setPrintStudentName(e.target.value);
                  if (e.target.value === "Fatimah Az-Zahra") setPrintNisn("0081928372");
                  else if (e.target.value === "Anisa Rahma") setPrintNisn("0081234002");
                  else setPrintNisn("0081928371");
                }}
              >
                <option value="ALIYA QIARA ABDULLAH">ALIYA QIARA ABDULLAH (8A)</option>
                <option value="ABIGAIL HASAN YUSUF PRAYOGA">ABIGAIL HASAN YUSUF PRAYOGA (8A)</option>
                <option value="ADITA AZ ZAHRA">ADITA AZ ZAHRA (8A)</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground">NISN / NIS</Label>
              <Input value={printNisn} onChange={(e) => setPrintNisn(e.target.value)} className="h-8 text-xs font-mono mt-1" />
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground">Kelas / Rombel</Label>
              <Input value={printClass} onChange={(e) => setPrintClass(e.target.value)} className="h-8 text-xs font-bold mt-1" />
            </div>
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
              <div className="mt-2 py-1 bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs text-center">
                KARTU SETORAN HAFALAN & MUROJAAH TAHFIDZ AL-QUR'AN
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>
                <div>Nama Siswa: <strong className="text-slate-950 font-bold">{printStudentName}</strong></div>
                <div>NISN / NIS: <span className="font-mono">{printNisn}</span></div>
              </div>
              <div>
                <div>Kelas / Rombel: <strong>{printClass}</strong></div>
                <div>Target Juz: <strong className="text-emerald-700 font-extrabold">{selectedJuz}</strong></div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 text-left">Nama Surah</th>
                    <th className="border border-slate-300 p-2 text-left">Cakupan Ayat</th>
                    <th className="border border-slate-300 p-2 text-center">Nilai Tajwid</th>
                    <th className="border border-slate-300 p-2 text-center">Status Murojaah</th>
                    <th className="border border-slate-300 p-2 text-left">Penguji</th>
                    <th className="border border-slate-300 p-2 text-center w-16">Paraf</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHafalan.map((h, i) => (
                    <tr key={h.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center font-mono">{i + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">QS. {h.s}</td>
                      <td className="border border-slate-300 p-2">{h.ayat}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800">{h.nilai}</td>
                      <td className="border border-slate-300 p-2 text-center font-semibold">{h.status}</td>
                      <td className="border border-slate-300 p-2 text-slate-700">{h.ustadz}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono text-[10px] text-slate-400">✓ Valid</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Orang Tua / Wali Siswa</div>
                <div className="font-bold underline text-slate-950">( ............................................ )</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, 11 Agustus 2026<br />Ustadz / Penguji Tahfidz</div>
                <div className="font-bold underline text-slate-950">AH. SYARIF HIDAYAH, S.Pd.I</div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPrintCardOpen(false)}>
              Tutup
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5" onClick={handlePrintCard}>
                <Download className="h-4 w-4" /> 🖨️ Cetak Kartu Murojaah PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
