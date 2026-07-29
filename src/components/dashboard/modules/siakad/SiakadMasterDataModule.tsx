import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Plus,
  CalendarClock,
  Building2,
  BarChart3,
  KeyRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { toast } from "sonner";

export function SiakadMasterDataModule() {
  const [activeTab, setActiveTab] = useState<string>("pengampu");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedRombelJadwal, setSelectedRombelJadwal] = useState<string | null>(null);

  // Stepper Header Config (6 Kategori Master Data LMS MTsN 2 Cilacap)
  const steps = [
    { key: "ta", title: "Tahun Ajaran & Periode" },
    { key: "mapel", title: "Katalog Mapel" },
    { key: "kelas_rombel", title: "Kelas & Rombel" },
    { key: "pengampu", title: "Matriks Pengampu" },
    { key: "sarana", title: "Sarana & Ruang" },
    { key: "penilaian_config", title: "KKTP & Skema Nilai" },
  ] as const;

  // Dynamic States for SIAKAD
  const [tahunAjaran, setTahunAjaran] = useState([
    { id: "1", code: "2026/2027 Ganjil", sem: "Ganjil", status: "Aktif", totalSiswa: 948, totalRombel: 27 },
    { id: "2", code: "2025/2026 Genap", sem: "Genap", status: "Arsip", totalSiswa: 920, totalRombel: 27 },
    { id: "3", code: "2025/2026 Ganjil", sem: "Ganjil", status: "Arsip", totalSiswa: 920, totalRombel: 27 },
  ]);

  // Modal State Form Tambah Tahun Ajaran Baru
  const [isAddTaOpen, setIsAddTaOpen] = useState(false);
  const [newTaYear, setNewTaYear] = useState("2027/2028");
  const [newTaSem, setNewTaSem] = useState<"Ganjil" | "Genap">("Ganjil");
  const [newTaStatus, setNewTaStatus] = useState<"Aktif" | "Arsip">("Aktif");

  const handleCreateTa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaYear.trim()) return toast.error("Harap isi tahun ajaran!");
    const code = `${newTaYear.trim()} ${newTaSem}`;
    const isAktif = newTaStatus === "Aktif";

    const newItem = {
      id: String(Date.now()),
      code,
      sem: newTaSem,
      status: isAktif ? "Aktif" : "Arsip",
      totalSiswa: 948,
      totalRombel: 27,
    };

    if (isAktif) {
      setTahunAjaran((prev) => [newItem, ...prev.map((x) => ({ ...x, status: "Arsip" }))]);
    } else {
      setTahunAjaran((prev) => [newItem, ...prev]);
    }

    toast.success(`✅ Tahun Ajaran ${code} berhasil ditambahkan & diterbitkan!`);
    setIsAddTaOpen(false);
  };

  // State Master Ruang & Sarana
  const [ruangList, setRuangList] = useState([
    { name: "Ruang A.01", type: "Ruang Teori (Kelas VII A)", cap: "36 Siswa", fas: "Proyektor, AC, Papan Tulis", icon: "🏫" },
    { name: "Ruang A.02", type: "Ruang Teori (Kelas VIII A)", cap: "36 Siswa", fas: "Proyektor, AC, Sound System", icon: "🏫" },
    { name: "Lab IPA Terpadu", type: "Laboratorium Praktikum", cap: "40 Siswa", fas: "Mikroskop, Alat Bedah, Proyektor", icon: "🔬" },
    { name: "Lab Komputer CBT", type: "Laboratorium Komputer", cap: "40 Komputer", fas: "LAN, Server CBT, AC, UPS 10kVA", icon: "💻" },
    { name: "Perpustakaan Digital", type: "E-Library & Ruang Baca", cap: "60 Siswa", fas: "Tablet E-Library, Wi-Fi 100Mbps", icon: "📚" },
    { name: "Lapangan Olahraga Utama", type: "Fasilitas Outdoor", cap: "500 Siswa", fas: "Garis Futsal, Basket, Voli", icon: "⚽" },
  ]);

  const [isAddRuangOpen, setIsAddRuangOpen] = useState(false);
  const [newRuangName, setNewRuangName] = useState("");
  const [newRuangType, setNewRuangType] = useState("Ruang Teori");
  const [newRuangCap, setNewRuangCap] = useState("36 Siswa");
  const [newRuangFas, setNewRuangFas] = useState("Proyektor, AC");

  const handleCreateRuang = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuangName.trim()) return toast.error("Harap isi nama ruang!");
    const icon = newRuangType.includes("Lab") ? "💻" : newRuangType.includes("Perpus") ? "📚" : "🏫";
    setRuangList((prev) => [
      { name: newRuangName, type: newRuangType, cap: newRuangCap, fas: newRuangFas, icon },
      ...prev,
    ]);
    toast.success(`✅ Ruang Pembelajaran ${newRuangName} berhasil ditambahkan!`);
    setIsAddRuangOpen(false);
    setNewRuangName("");
  };

  // Master Mapel (Persistent, Dibuat 1x)
  const [masterMapel] = useState([
    { code: "AGM-01", name: "Al-Quran Hadits", category: "Keagamaan" },
    { code: "AGM-02", name: "Akidah Akhlak", category: "Keagamaan" },
    { code: "AGM-03", name: "Fiqih", category: "Keagamaan" },
    { code: "AGM-04", name: "Sejarah Kebudayaan Islam", category: "Keagamaan" },
    { code: "AGM-05", name: "Bahasa Arab", category: "Keagamaan" },
    { code: "UMM-01", name: "Matematika", category: "Umum" },
    { code: "UMM-02", name: "Ilmu Pengetahuan Alam (IPA)", category: "Umum" },
    { code: "UMM-03", name: "Bahasa Indonesia", category: "Umum" },
    { code: "UMM-04", name: "Bahasa Inggris", category: "Umum" },
    { code: "UMM-06", name: "Informatika & Coding", category: "Umum" },
  ]);

  // Hierarki Kelas (Tingkat) -> Rombel -> Jadwal Pelajaran
  const [kelasTingkat] = useState([
    {
      tingkat: "Tingkat VII (Kelas 7)",
      rombels: [
        { id: "1", name: "VII A", wali: "Ustadzah Nurul Hidayah, S.Pd.I", siswaCount: 34 },
        { id: "2", name: "VII B", wali: "Bpk. Slamet Riyadi, M.Pd", siswaCount: 35 },
      ],
    },
    {
      tingkat: "Tingkat VIII (Kelas 8)",
      rombels: [
        { id: "3", name: "VIII A", wali: "Dra. Hj. Siti Rahmah, M.Pd", siswaCount: 32 },
        { id: "4", name: "VIII B", wali: "Ibu Maryati, S.Pd", siswaCount: 33 },
      ],
    },
    {
      tingkat: "Tingkat IX (Kelas 9)",
      rombels: [
        { id: "5", name: "IX A", wali: "Bpk. Hendra Wijaya, M.Sc", siswaCount: 35 },
      ],
    },
  ]);

  // Sample Data Jadwal di Dalam Rombel
  const rombelJadwalMap: Record<string, { hari: string; jam: string; mapel: string; guru: string }[]> = {
    "VII A": [
      { hari: "Senin", jam: "07.30 - 09.00", mapel: "Bahasa Arab", guru: "Ustadzah Nurul Hidayah, S.Pd.I" },
      { hari: "Senin", jam: "09.15 - 10.45", mapel: "Informatika & Coding", guru: "H. Ahmad Syukri, S.Kom" },
      { hari: "Selasa", jam: "07.30 - 09.00", mapel: "Bahasa Indonesia", guru: "Bpk. Slamet Riyadi, M.Pd" },
    ],
    "VIII A": [
      { hari: "Senin", jam: "07.30 - 09.00", mapel: "Matematika", guru: "Bpk. Hendra Wijaya, M.Sc" },
      { hari: "Senin", jam: "09.15 - 10.45", mapel: "Fiqih", guru: "Dra. Hj. Siti Rahmah, M.Pd" },
      { hari: "Selasa", jam: "07.30 - 09.00", mapel: "IPA Terpadu", guru: "Ibu Ratna Dewi, M.Pd" },
    ],
    "IX A": [
      { hari: "Rabu", jam: "07.30 - 09.00", mapel: "Al-Quran Hadits", guru: "Dra. Hj. Siti Rahmah, M.Pd" },
    ],
  };

  // TABEL PALING PENTING: Pengampu Mata Pelajaran (Guru + Mapel + Rombel)
  const [pengampuList, setPengampuList] = useState([
    { id: "1", guru: "Bpk. Hendra Wijaya, M.Sc", mapel: "Matematika", rombel: "VIII A", jam: "4 JP / mgg" },
    { id: "2", guru: "Dra. Hj. Siti Rahmah, M.Pd", mapel: "Fiqih", rombel: "VIII A", jam: "2 JP / mgg" },
    { id: "3", guru: "Dra. Hj. Siti Rahmah, M.Pd", mapel: "Al-Quran Hadits", rombel: "IX A", jam: "2 JP / mgg" },
    { id: "4", guru: "Ustadzah Nurul Hidayah, S.Pd.I", mapel: "Bahasa Arab", rombel: "VII A", jam: "3 JP / mgg" },
    { id: "5", guru: "Ibu Ratna Dewi, M.Pd", mapel: "Ilmu Pengetahuan Alam (IPA)", rombel: "VIII A", jam: "4 JP / mgg" },
    { id: "6", guru: "H. Ahmad Syukri, S.Kom", mapel: "Informatika & Coding", rombel: "VII A", jam: "2 JP / mgg" },
  ]);

  const [isAddPengampuOpen, setIsAddPengampuOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState("Bpk. Hendra Wijaya, M.Sc");
  const [selectedMapel, setSelectedMapel] = useState("Matematika");
  const [selectedRombel, setSelectedRombel] = useState("VIII A");

  const handleAddPengampu = (e: React.FormEvent) => {
    e.preventDefault();
    setPengampuList([
      {
        id: String(Date.now()),
        guru: selectedGuru,
        mapel: selectedMapel,
        rombel: selectedRombel,
        jam: "3 JP / mgg",
      },
      ...pengampuList,
    ]);
    toast.success(`Pengampu ${selectedGuru} -> ${selectedMapel} (${selectedRombel}) berhasil ditambahkan!`);
    setIsAddPengampuOpen(false);
  };

  const handleRunWizard = () => {
    toast.success("SIAKAD Workflow: Kenaikan Kelas Massal & Plotting Tahun Ajaran 2027/2028 Berhasil!");
    setIsWizardOpen(false);
    setWizardStep(1);
  };

  return (
    <>
      {/* Banner Utama SIAKAD */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/25 mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-bold text-xs">SIAKAD ENGINE</Badge>
              <span className="text-xs text-muted-foreground font-mono">SIM Akademik MTsN 2 Cilacap</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">
              Struktur Akademik Terintegrasi
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl mt-1 leading-relaxed">
              Model terpusat di mana Admin menyusun struktur <strong className="text-foreground">Tahun Ajaran → Semester → Kelas (Tingkat) → Rombel → Pengampu → Jadwal Pelajaran Rombel</strong>. Guru & Siswa otomatis terhubung tanpa perlu menginput kelas ulang tiap tahun.
            </p>
          </div>
          <Button size="sm" className="gap-2 font-bold bg-primary text-primary-foreground shadow-md shrink-0" onClick={() => setIsWizardOpen(true)}>
            <Sparkles className="h-4 w-4" /> ⚡ Workflow Tahun Ajaran Baru
          </Button>
        </div>
      </div>

      {/* Stepper Flow Header Interactive */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {steps.map((s, idx) => (
          <div
            key={s.key}
            onClick={() => setActiveTab(s.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition shrink-0 ${
              activeTab === s.key ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <div className={`h-5 w-5 rounded-full text-[10px] grid place-items-center font-bold ${activeTab === s.key ? "bg-white text-primary" : "bg-muted text-foreground"}`}>
              {idx + 1}
            </div>
            <span>{s.title}</span>
          </div>
        ))}
      </div>

      {/* TAB 4: MATRIKS PENGAMPU MATA PELAJARAN (TABEL PALING PENTING) */}
      {activeTab === "pengampu" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" /> Matriks Guru Pengampu Mapel (Teaching Assignment)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Tabel utama penentu otomatisasi LMS: Menghubungkan <strong className="text-foreground">Guru + Mapel + Rombel</strong> pada Tahun Ajaran Aktif.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1.5 text-xs font-bold" onClick={() => setIsAddPengampuOpen(true)}>
              + Assign Guru Pengampu
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-y border-border">
                  <tr>
                    <th className="py-3 px-4">Guru Pengampu</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Target Rombel</th>
                    <th className="py-3 px-4">Beban Mengajar</th>
                    <th className="py-3 px-4 text-center">Status LMS</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pengampuList.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 font-bold text-foreground">{p.guru}</td>
                      <td className="py-3 px-4 font-semibold text-primary">{p.mapel}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-bold bg-primary/10 text-primary border-primary/20">
                          Kelas {p.rombel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{p.jam}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                          ✔ Otomatis Sync LMS
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/10" onClick={() => {
                          setPengampuList(pengampuList.filter(x => x.id !== p.id));
                          toast.success("Plotting pengampu berhasil dihapus.");
                        }}>
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 1: TAHUN AJARAN & PERIODE SEMESTER */}
      {activeTab === "ta" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Tahun Ajaran & Periode Semester SIAKAD</CardTitle>
              <CardDescription className="text-xs">Hanya 1 Tahun Ajaran yang dapat diaktifkan dalam satu waktu.</CardDescription>
            </div>
            <Button size="sm" className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground" onClick={() => setIsAddTaOpen(true)}>
              <Plus className="h-4 w-4" /> Tambah Tahun Ajaran
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {tahunAjaran.map((t) => (
              <div key={t.id} className={`p-4 rounded-xl border flex items-center justify-between ${t.status === "Aktif" ? "bg-primary/5 border-primary/40" : "bg-card border-border"}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl grid place-items-center font-bold ${t.status === "Aktif" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    📅
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      Tahun Ajaran {t.code}
                      {t.status === "Aktif" && <Badge className="bg-emerald-600 text-white text-[10px] font-bold">✔ AKTIF</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Semester {t.sem} • {t.totalSiswa} Siswa Terdaftar • {t.totalRombel} Rombel
                    </div>
                  </div>
                </div>
                {t.status !== "Aktif" && (
                  <Button size="sm" variant="outline" className="text-xs font-bold" onClick={() => {
                    setTahunAjaran(tahunAjaran.map(x => ({ ...x, status: x.id === t.id ? "Aktif" : "Arsip" })));
                    toast.success(`Tahun Ajaran ${t.code} telah diaktifkan secara global!`);
                  }}>
                    Aktifkan Sesi Ini
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: HIERARKI KELAS (TINGKAT) -> ROMBEL -> JADWAL PELAJARAN */}
      {activeTab === "kelas_rombel" && (
        <div className="space-y-6">
          {kelasTingkat.map((kt, i) => (
            <Card key={i} className="border-border shadow-xs">
              <CardHeader className="py-3 px-4 bg-muted/40 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>🏛️ {kt.tingkat}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{kt.rombels.length} Rombel</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kt.rombels.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl border border-border bg-card space-y-3 hover:border-primary/40 transition">
                      <div className="flex items-center justify-between">
                        <div className="font-black text-base text-foreground">Rombel {r.name}</div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                          {r.siswaCount} Siswa
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Wali Kelas: <span className="font-bold text-foreground">{r.wali}</span>
                      </div>
                      <div className="pt-2 border-t border-border flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs font-bold gap-1" onClick={() => setSelectedRombelJadwal(r.name)}>
                          <CalendarClock className="h-3.5 w-3.5 text-primary" /> Jadwal Pelajaran
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => toast.info(`Roster Siswa Rombel ${r.name}`)}>
                          👥 Siswa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: KATALOG MAPEL (PERSISTEN) */}
      {activeTab === "mapel" && (
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold">Katalog Mata Pelajaran (Persisten)</CardTitle>
            <CardDescription className="text-xs">
              Mata pelajaran dibuat 1x saja dan berlaku secara permanen lintas tahun ajaran.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {masterMapel.map((m) => (
              <div key={m.code} className="p-3 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-foreground">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{m.code} • {m.category}</div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold">Persisten</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 5: SARANA & RUANG KELAS */}
      {activeTab === "sarana" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" /> Master Sarana, Ruang Kelas & Laboratorium
              </CardTitle>
              <CardDescription className="text-xs">
                Inventarisasi ruang fisik & fasilitas laboratorium pendukung pembelajaran madrasah.
              </CardDescription>
            </div>
            <Button size="sm" className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground" onClick={() => setIsAddRuangOpen(true)}>
              <Plus className="h-4 w-4" /> Tambah Ruang Baru
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {ruangList.map((r, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border bg-card space-y-2 hover:border-primary/40 transition">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      <span>{r.icon}</span>
                      <span>{r.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono">{r.cap}</Badge>
                  </div>
                  <div className="text-xs font-semibold text-primary">{r.type}</div>
                  <div className="text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                    Fasilitas: {r.fas}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 7: KKTP & SKEMA PENILAIAN */}
      {activeTab === "penilaian_config" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-500" /> Kriteria KKTP & Konfigurasi Skema Penilaian
              </CardTitle>
              <CardDescription className="text-xs">
                Pengaturan batas KKM (75), pembobotan komponen nilai akhir, dan interval predikat huruf.
              </CardDescription>
            </div>
            <Button size="sm" className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black" onClick={() => toast.success("Pengaturan KKTP & Bobot Nilai Berhasil Disimpan!")}>
              Simpan Konfigurasi
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-6">
            {/* Form Setting Bobot & KKM */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                <Label className="text-xs font-semibold">Batas KKM / KKTP</Label>
                <Input defaultValue="75" className="font-mono text-base font-bold text-amber-600" />
                <p className="text-[10px] text-muted-foreground">Batas ketuntasan minimal</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                <Label className="text-xs font-semibold">Bobot Formatif (F1-F3)</Label>
                <Input defaultValue="40%" className="font-mono text-base font-bold text-emerald-600" />
                <p className="text-[10px] text-muted-foreground">Asesmen proses harian</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                <Label className="text-xs font-semibold">Bobot Sumatif / Tugas</Label>
                <Input defaultValue="30%" className="font-mono text-base font-bold text-blue-600" />
                <p className="text-[10px] text-muted-foreground">Tugas & Ujian Bab</p>
              </div>

              <div className="p-3.5 rounded-xl border border-border bg-card space-y-1">
                <Label className="text-xs font-semibold">Bobot CBT PAS/PAT</Label>
                <Input defaultValue="30%" className="font-mono text-base font-bold text-purple-600" />
                <p className="text-[10px] text-muted-foreground">Ujian Komputer Semester</p>
              </div>
            </div>

            {/* Tabel Conversion Interval Predikat */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-foreground">Interval Predikat Nilai Capaian Siswa:</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">Predikat A</span>
                    <div className="text-[11px] text-muted-foreground">Sangat Baik</div>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-mono">90 - 100</Badge>
                </div>

                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-blue-700 dark:text-blue-300">Predikat B</span>
                    <div className="text-[11px] text-muted-foreground">Baik</div>
                  </div>
                  <Badge className="bg-blue-600 text-white font-mono">80 - 89</Badge>
                </div>

                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-amber-700 dark:text-amber-300">Predikat C</span>
                    <div className="text-[11px] text-muted-foreground">Cukup (Lulus)</div>
                  </div>
                  <Badge className="bg-amber-600 text-white font-mono">75 - 79</Badge>
                </div>

                <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-destructive">Predikat D</span>
                    <div className="text-[11px] text-muted-foreground">Perlu Bimbingan</div>
                  </div>
                  <Badge variant="destructive" className="font-mono">&lt; 75</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL JADWAL PELAJARAN DI DALAM ROMBEL */}
      <Dialog open={!!selectedRombelJadwal} onOpenChange={() => setSelectedRombelJadwal(null)}>
        <DialogContent className="sm:max-w-xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> Jadwal Pelajaran Rombel {selectedRombelJadwal}
            </DialogTitle>
            <DialogDescription>
              Jadwal mingguan hasil plotting pengampu mata pelajaran untuk Rombel {selectedRombelJadwal}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {selectedRombelJadwal && (rombelJadwalMap[selectedRombelJadwal] || []).length === 0 && (
              <div className="text-xs text-muted-foreground py-4 text-center">Belum ada plotting jadwal untuk Rombel ini.</div>
            )}
            {selectedRombelJadwal && (rombelJadwalMap[selectedRombelJadwal] || []).map((j, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    {j.mapel}
                    <Badge variant="outline" className="text-[10px] font-mono">{j.hari}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{j.guru}</div>
                </div>
                <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                  {j.jam}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button size="sm" className="bg-primary text-primary-foreground font-bold" onClick={() => setSelectedRombelJadwal(null)}>
              Tutup Modal Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL FORM TAMBAH TAHUN AJARAN BARU */}
      <Dialog open={isAddTaOpen} onOpenChange={setIsAddTaOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> Terbitkan Tahun Ajaran / Periode Baru
            </DialogTitle>
            <DialogDescription className="text-xs">
              Buat struktur tahun ajaran dan semester aktif baru untuk SIAKAD MTsN 2 Cilacap.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTa} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Tahun Ajaran (Format: YYYY/YYYY)</Label>
              <Input
                placeholder="misal: 2027/2028"
                value={newTaYear}
                onChange={(e) => setNewTaYear(e.target.value)}
                required
                className="mt-1 text-xs font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Semester Target</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold"
                  value={newTaSem}
                  onChange={(e) => setNewTaSem(e.target.value as any)}
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Status Pengaktifan</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold"
                  value={newTaStatus}
                  onChange={(e) => setNewTaStatus(e.target.value as any)}
                >
                  <option value="Aktif">🟢 Aktifkan Sesi Ini</option>
                  <option value="Arsip">📁 Simpan Sebagai Arsip</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTaOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold gap-1.5">
                <Sparkles className="h-4 w-4" /> Terbitkan Tahun Ajaran
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL FORM TAMBAH RUANG KELAS / SARANA */}
      <Dialog open={isAddRuangOpen} onOpenChange={setIsAddRuangOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Tambah Ruang Pembelajaran / Sarana Baru
            </DialogTitle>
            <DialogDescription className="text-xs">
              Input data fisik ruang kelas, laboratorium, atau fasilitas pembelajaran madrasah.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRuang} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Nama Ruang Pembelajaran</Label>
              <Input
                placeholder="misal: Ruang A.03 / Lab Bahasa Digital"
                value={newRuangName}
                onChange={(e) => setNewRuangName(e.target.value)}
                required
                className="mt-1 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Kategori / Tipe Ruang</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1"
                  value={newRuangType}
                  onChange={(e) => setNewRuangType(e.target.value)}
                >
                  <option value="Ruang Teori">Ruang Teori (Kelas)</option>
                  <option value="Laboratorium Praktikum">Laboratorium Praktikum</option>
                  <option value="Laboratorium Komputer">Laboratorium Komputer CBT</option>
                  <option value="E-Library">E-Library & Perpus</option>
                  <option value="Fasilitas Outdoor">Fasilitas Outdoor</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Kapasitas Maksimal</Label>
                <Input
                  placeholder="misal: 36 Siswa"
                  value={newRuangCap}
                  onChange={(e) => setNewRuangCap(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Fasilitas Penunjang</Label>
              <Input
                placeholder="misal: Proyektor, AC, Sound System, Wi-Fi"
                value={newRuangFas}
                onChange={(e) => setNewRuangFas(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRuangOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
                Simpan Ruang Baru
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL FORM TAMBAH PENGAMPU */}
      <Dialog open={isAddPengampuOpen} onOpenChange={setIsAddPengampuOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Assign Guru Pengampu Baru
            </DialogTitle>
            <DialogDescription>
              Hubungkan Guru, Mata Pelajaran, dan Rombel untuk alokasi kelas otomatis.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPengampu} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Pilih Guru Pengampu</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={selectedGuru} onChange={(e) => setSelectedGuru(e.target.value)}>
                <option value="Bpk. Hendra Wijaya, M.Sc">Bpk. Hendra Wijaya, M.Sc</option>
                <option value="Dra. Hj. Siti Rahmah, M.Pd">Dra. Hj. Siti Rahmah, M.Pd</option>
                <option value="Ustadzah Nurul Hidayah, S.Pd.I">Ustadzah Nurul Hidayah, S.Pd.I</option>
                <option value="Ibu Ratna Dewi, M.Pd">Ibu Ratna Dewi, M.Pd</option>
                <option value="H. Ahmad Syukri, S.Kom">H. Ahmad Syukri, S.Kom</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Pilih Mata Pelajaran</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)}>
                <option value="Matematika">Matematika</option>
                <option value="Al-Quran Hadits">Al-Quran Hadits</option>
                <option value="Fiqih">Fiqih</option>
                <option value="Bahasa Arab">Bahasa Arab</option>
                <option value="Ilmu Pengetahuan Alam (IPA)">Ilmu Pengetahuan Alam (IPA)</option>
                <option value="Informatika & Coding">Informatika & Coding</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Pilih Target Rombel</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={selectedRombel} onChange={(e) => setSelectedRombel(e.target.value)}>
                <option value="VII A">VII A</option>
                <option value="VII B">VII B</option>
                <option value="VIII A">VIII A</option>
                <option value="VIII B">VIII B</option>
                <option value="IX A">IX A</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddPengampuOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Pengampu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL SIAKAD WORKFLOW WIZARD */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> SIAKAD Workflow: Pergantian Tahun Ajaran Baru
            </DialogTitle>
            <DialogDescription>
              Panduan 4-langkah otomatisasi kenaikan kelas massal dan alokasi semester baru.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs font-bold border-b border-border pb-2">
              <span className={wizardStep >= 1 ? "text-primary" : "text-muted-foreground"}>1. Aktifkan TA Baru</span>
              <span className={wizardStep >= 2 ? "text-primary" : "text-muted-foreground"}>2. Naik Kelas Massal</span>
              <span className={wizardStep >= 3 ? "text-primary" : "text-muted-foreground"}>3. Rombel & Wali</span>
              <span className={wizardStep >= 4 ? "text-primary" : "text-muted-foreground"}>4. Assign Pengampu</span>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm">Langkah 1: Aktifkan Tahun Ajaran Baru</div>
                <p className="text-muted-foreground">Sistem akan menyetujui penutupan TA 2026/2027 dan membuka TA 2027/2028 Ganjil.</p>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Target: 2027/2028 Ganjil</Badge>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm">Langkah 2: Process Kenaikan Kelas Massal</div>
                <p className="text-muted-foreground">Siswa Kelas VII dinaikkan ke VIII, VIII ke IX, dan IX dinyatakan Alumni secara otomatis.</p>
                <div className="p-3 bg-muted rounded-lg font-mono text-[11px]">
                  VII A (34 siswa) → VIII A<br />
                  VIII A (32 siswa) → IX A<br />
                  IX A (35 siswa) → Alumni (Graduated)
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm">Langkah 3: Re-Assign Wali Kelas</div>
                <p className="text-muted-foreground">Salin atau tetapkan struktur Wali Kelas baru untuk Rombel TA 2027/2028.</p>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm">Langkah 4: Re-Assign Guru Pengampu Mapel</div>
                <p className="text-muted-foreground">Salin alokasi guru pengampu dari TA sebelumnya atau sesuaikan dengan plotting terbaru.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            {wizardStep > 1 && (
              <Button variant="outline" size="sm" onClick={() => setWizardStep(wizardStep - 1)}>Kembali</Button>
            )}
            {wizardStep < 4 ? (
              <Button size="sm" className="bg-primary text-primary-foreground font-bold" onClick={() => setWizardStep(wizardStep + 1)}>
                Lanjut ke Langkah {wizardStep + 1} →
              </Button>
            ) : (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={handleRunWizard}>
                Eksekusi Workflow SIAKAD
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
