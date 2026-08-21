import React, { useState, useMemo } from "react";
import {
  Sparkles,
  CheckCircle2,
  Plus,
  CalendarClock,
  Building2,
  BarChart3,
  KeyRound,
  BookOpen,
  Search,
  Filter,
  Trash2,
  Edit,
  GraduationCap,
  Layers,
  Users,
  PencilLine,
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
import { INITIAL_MASTER_MAPEL, MasterMapelItem } from "@/services/masterMapelService";

export function SiakadMasterDataModule() {
  const [activeTab, setActiveTab] = useState<string>("pengampu");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedMapelForPerangkat, setSelectedMapelForPerangkat] = useState<MasterMapelItem | null>(null);
  const [selectedRombelJadwal, setSelectedRombelJadwal] = useState<string | null>(null);

  // Stepper Header Config (6 Kategori Master Data LMS MTsN 2 Cilacap)
  const steps = [
    { key: "ta", title: "Tahun Ajaran & Periode" },
    { key: "mapel", title: "Mata Pelajaran" },
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

  // Dynamic Master Mapel Catalog (Persistent Single Source of Truth)
  const [masterMapel, setMasterMapel] = useState<MasterMapelItem[]>(INITIAL_MASTER_MAPEL);

  // Modal State Form Tambah Mapel Baru
  const [isAddMapelOpen, setIsAddMapelOpen] = useState(false);
  const [newMapelCode, setNewMapelCode] = useState("");
  const [newMapelName, setNewMapelName] = useState("");
  const [newMapelCategory, setNewMapelCategory] = useState("Keagamaan");
  const [newMapelJp, setNewMapelJp] = useState("2 JP");
  const [newMapelTarget, setNewMapelTarget] = useState("Semua Tingkat");

  const [mapelFilterCategory, setMapelFilterCategory] = useState("ALL");
  const [mapelSearchQuery, setMapelSearchQuery] = useState("");

  const handleCreateMapel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMapelName.trim()) return toast.error("Harap isi nama mata pelajaran!");

    const code = newMapelCode.trim() || `MAPEL-${Date.now().toString().slice(-4)}`;
    const newItem = {
      code,
      name: newMapelName.trim(),
      category: newMapelCategory as any,
      jp: newMapelJp,
      target: newMapelTarget,
    };

    setMasterMapel((prev) => [newItem, ...prev]);
    toast.success(`🎉 Mata Pelajaran "${newMapelName}" (${code}) berhasil ditambahkan ke Katalog SIAKAD!`);
    setIsAddMapelOpen(false);
    setNewMapelCode("");
    setNewMapelName("");
  };

  const handleDeleteMapel = (code: string, name: string) => {
    setMasterMapel((prev) => prev.filter((m) => m.code !== code));
    toast.success(`🗑️ Mapel "${name}" (${code}) berhasil dihapus dari Katalog.`);
  };

  const filteredMapelList = useMemo(() => {
    return masterMapel.filter((m) => {
      const matchQuery =
        m.name.toLowerCase().includes(mapelSearchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(mapelSearchQuery.toLowerCase());
      const matchCat = mapelFilterCategory === "ALL" || m.category === mapelFilterCategory;
      return matchQuery && matchCat;
    });
  }, [masterMapel, mapelSearchQuery, mapelFilterCategory]);

  // Dynamic Hierarki Kelas (Tingkat) -> Rombel (Editable & Addable)
  const [kelasTingkat, setKelasTingkat] = useState([
    {
      tingkat: "Tingkat VII (Kelas 7)",
      rombels: [
        { id: "r1", name: "VII A", wali: "Ustadzah Nurul Hidayah, S.Pd.I", siswaCount: 34 },
        { id: "r2", name: "VII B", wali: "Bpk. Slamet Riyadi, M.Pd", siswaCount: 35 },
        { id: "r3", name: "VII C", wali: "Ibu Maryati, S.Pd", siswaCount: 34 },
      ],
    },
    {
      tingkat: "Tingkat VIII (Kelas 8)",
      rombels: [
        { id: "r4", name: "VIII A", wali: "Dra. Hj. Siti Rahmah, M.Pd", siswaCount: 32 },
        { id: "r5", name: "VIII B", wali: "Ust. Ahmad Syukri, S.Kom", siswaCount: 33 },
        { id: "r6", name: "VIII C", wali: "Ibu Ratna Dewi, M.Pd", siswaCount: 32 },
      ],
    },
    {
      tingkat: "Tingkat IX (Kelas 9)",
      rombels: [
        { id: "r7", name: "IX A", wali: "Bpk. Hendra Wijaya, M.Sc", siswaCount: 35 },
        { id: "r8", name: "IX B", wali: "Ust. H. Mohammad Fathoni, M.Pd", siswaCount: 34 },
        { id: "r9", name: "IX C", wali: "Bpk. Budi Santoso, M.Pd", siswaCount: 31 },
      ],
    },
  ]);

  // Modal State Form Tambah & Edit Rombel
  const [isAddRombelOpen, setIsAddRombelOpen] = useState(false);
  const [newRombelTingkat, setNewRombelTingkat] = useState("Tingkat VII (Kelas 7)");
  const [newRombelName, setNewRombelName] = useState("");
  const [newRombelWali, setNewRombelWali] = useState("Ustadzah Nurul Hidayah, S.Pd.I");
  const [newRombelSiswaCount, setNewRombelSiswaCount] = useState(34);

  const [isEditRombelOpen, setIsEditRombelOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<{
    id: string;
    tingkat: string;
    name: string;
    wali: string;
    siswaCount: number;
  } | null>(null);

  const handleCreateRombel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRombelName.trim()) return toast.error("Harap isi nama Rombel!");

    const newRombel = {
      id: `r-${Date.now()}`,
      name: newRombelName.trim(),
      wali: newRombelWali,
      siswaCount: Number(newRombelSiswaCount),
    };

    setKelasTingkat((prev) =>
      prev.map((kt) => {
        if (kt.tingkat === newRombelTingkat) {
          return { ...kt, rombels: [...kt.rombels, newRombel] };
        }
        return kt;
      })
    );

    toast.success(`🎉 Rombel "${newRombelName}" berhasil ditambahkan ke ${newRombelTingkat}!`);
    setIsAddRombelOpen(false);
    setNewRombelName("");
  };

  const handleOpenEditRombel = (tingkatTitle: string, rombel: { id: string; name: string; wali: string; siswaCount: number }) => {
    setEditingRombel({
      id: rombel.id,
      tingkat: tingkatTitle,
      name: rombel.name,
      wali: rombel.wali,
      siswaCount: rombel.siswaCount,
    });
    setIsEditRombelOpen(true);
  };

  const handleSaveEditRombel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRombel || !editingRombel.name.trim()) return toast.error("Harap isi nama Rombel!");

    setKelasTingkat((prev) =>
      prev.map((kt) => {
        if (kt.tingkat === editingRombel.tingkat) {
          return {
            ...kt,
            rombels: kt.rombels.map((r) =>
              r.id === editingRombel.id
                ? { ...r, name: editingRombel.name.trim(), wali: editingRombel.wali, siswaCount: Number(editingRombel.siswaCount) }
                : r
            ),
          };
        }
        return kt;
      })
    );

    toast.success(`💾 Data Rombel "${editingRombel.name}" berhasil diperbarui!`);
    setIsEditRombelOpen(false);
    setEditingRombel(null);
  };

  const handleDeleteRombel = (tingkatTitle: string, rombelId: string, rombelName: string) => {
    setKelasTingkat((prev) =>
      prev.map((kt) => {
        if (kt.tingkat === tingkatTitle) {
          return { ...kt, rombels: kt.rombels.filter((r) => r.id !== rombelId) };
        }
        return kt;
      })
    );
    toast.success(`🗑️ Rombel "${rombelName}" berhasil dihapus.`);
  };

  // Sample Data Jadwal di Dalam Rombel
  const rombelJadwalMap: Record<string, { hari: string; jam: string; mapel: string; guru: string }[]> = {
    "VII A": [
      { hari: "Senin", jam: "07.30 - 09.00", mapel: "Bahasa Arab", guru: "Ustadzah Nurul Hidayah, S.Pd.I" },
      { hari: "Senin", jam: "09.15 - 10.45", mapel: "Informatika & Coding AI", guru: "H. Ahmad Syukri, S.Kom" },
      { hari: "Selasa", jam: "07.30 - 09.00", mapel: "Bahasa Indonesia", guru: "Bpk. Slamet Riyadi, M.Pd" },
    ],
    "VIII A": [
      { hari: "Senin", jam: "07.30 - 09.00", mapel: "Matematika", guru: "Bpk. Hendra Wijaya, M.Sc" },
      { hari: "Senin", jam: "09.15 - 10.45", mapel: "Fiqih Kebangsaan", guru: "Dra. Hj. Siti Rahmah, M.Pd" },
      { hari: "Selasa", jam: "07.30 - 09.00", mapel: "Ilmu Pengetahuan Alam (IPA)", guru: "Ibu Ratna Dewi, M.Pd" },
    ],
    "IX A": [
      { hari: "Rabu", jam: "07.30 - 09.00", mapel: "Al-Quran Hadits", guru: "Dra. Hj. Siti Rahmah, M.Pd" },
    ],
  };

  // TABEL PALING PENTING: Pengampu Mata Pelajaran (Guru + Mapel + Rombel)
  const [pengampuList, setPengampuList] = useState([
    { id: "1", guru: "Bpk. Hendra Wijaya, M.Sc", mapel: "Matematika", rombel: "VIII A", jam: "4 JP / mgg" },
    { id: "2", guru: "Dra. Hj. Siti Rahmah, M.Pd", mapel: "Fiqih Kebangsaan", rombel: "VIII A", jam: "2 JP / mgg" },
    { id: "3", guru: "Dra. Hj. Siti Rahmah, M.Pd", mapel: "Al-Quran Hadits", rombel: "IX A", jam: "2 JP / mgg" },
    { id: "4", guru: "Ustadzah Nurul Hidayah, S.Pd.I", mapel: "Bahasa Arab", rombel: "VII A", jam: "3 JP / mgg" },
    { id: "5", guru: "Ibu Ratna Dewi, M.Pd", mapel: "Ilmu Pengetahuan Alam (IPA)", rombel: "VIII A", jam: "4 JP / mgg" },
    { id: "6", guru: "H. Ahmad Syukri, S.Kom", mapel: "Informatika & Coding AI", rombel: "VII A", jam: "2 JP / mgg" },
  ]);

  const [isAddPengampuOpen, setIsAddPengampuOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState("Bpk. Hendra Wijaya, M.Sc");
  const [selectedMapel, setSelectedMapel] = useState("Matematika");
  const [selectedRombel, setSelectedRombel] = useState("VIII A");

  const handleAddPengampu = (e: React.FormEvent) => {
    e.preventDefault();
    const newP = {
      id: String(Date.now()),
      guru: selectedGuru,
      mapel: selectedMapel,
      rombel: selectedRombel,
      jam: "2 JP / mgg",
    };

    setPengampuList([newP, ...pengampuList]);
    toast.success(`🎉 Sukses menetapkan ${selectedGuru} sebagai Pengampu ${selectedMapel} di Rombel ${selectedRombel}!`);
    setIsAddPengampuOpen(false);
  };

  const handleRunWizard = () => {
    toast.success("🚀 SIAKAD Workflow Selesai! TA 2027/2028 Ganjil Resmi Berjalan.");
    setIsWizardOpen(false);
    setWizardStep(1);
  };

  return (
    <div className="space-y-6 text-foreground font-sans">
      {/* HEADER UTAMA MODUL SIAKAD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Akademik Madrasah</h1>
            <Badge variant="outline" className="border-primary/40 text-primary font-mono text-[10px]">
              MTsN 2 Cilacap
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Pusat konfigurasi Akademik, Katalog Mapel, Matriks Pengampu Guru, dan Alokasi Jadwal Rombel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
            onClick={() => setIsWizardOpen(true)}
          >
            <Sparkles className="h-4 w-4" /> Workflow TA Baru
          </Button>
        </div>
      </div>

      {/* STEPPER NAVIGASI 6 KATEGORI MASTER DATA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {steps.map((step) => {
          const isActive = activeTab === step.key;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => setActiveTab(step.key)}
              className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between h-20 ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                  : "bg-card border-border hover:bg-muted/50 text-foreground"
              }`}
            >
              <div className="text-[10px] uppercase font-mono opacity-80">Master Data</div>
              <div className="text-xs font-extrabold leading-tight">{step.title}</div>
            </button>
          );
        })}
      </div>

      {/* TAB 4: MATRIKS PENGAMPU GURU (PENGAMPU) */}
      {activeTab === "pengampu" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Matriks Guru Pengampu Mata Pelajaran
              </CardTitle>
              <CardDescription className="text-xs">
                Plotting alokasi Guru ke Mata Pelajaran & Rombel target. Tersinkron langsung ke Ruang Mengajar.
              </CardDescription>
            </div>
            <Button size="sm" className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground" onClick={() => setIsAddPengampuOpen(true)}>
              <Plus className="h-4 w-4" /> Plotting Pengampu Baru
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <div className="border-t border-border overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="py-3 px-4 w-12">No</th>
                    <th className="py-3 px-4">Guru Pengampu</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4 text-center">Rombel Target</th>
                    <th className="py-3 px-4">Alokasi Waktu</th>
                    <th className="py-3 px-4 text-center">Status LMS</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pengampuList.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 text-muted-foreground font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-foreground">{p.guru}</td>
                      <td className="py-3 px-4 font-semibold text-primary">{p.mapel}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="font-mono font-bold text-xs">{p.rombel}</Badge>
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

      {/* TAB 3: HIERARKI KELAS (TINGKAT) -> ROMBEL (ENHANCED & EDITABLE) */}
      {activeTab === "kelas_rombel" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border shadow-xs">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
                <Layers className="h-5 w-5 text-primary" /> Master Data Kelas & Rombongan Belajar (Rombel)
              </h2>
              <p className="text-xs text-muted-foreground">
                Pengelolaan struktur rombel per tingkat kelas, penetapan Wali Kelas, & kapasitas kuota siswa.
              </p>
            </div>

            <Button
              size="sm"
              className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shrink-0"
              onClick={() => setIsAddRombelOpen(true)}
            >
              <Plus className="h-4 w-4" /> + Tambah Rombel Baru
            </Button>
          </div>

          {kelasTingkat.map((kt, i) => (
            <Card key={i} className="border-border shadow-xs">
              <CardHeader className="py-3 px-4 bg-muted/40 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>🏛️ {kt.tingkat}</span>
                  <Badge variant="outline" className="text-[10px] font-mono font-bold">{kt.rombels.length} Rombel Terdaftar</Badge>
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
                      <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs font-bold gap-1" onClick={() => setSelectedRombelJadwal(r.name)}>
                          <CalendarClock className="h-3.5 w-3.5 text-primary" /> Jadwal Pelajaran
                        </Button>

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                            title="Edit Data Rombel"
                            onClick={() => handleOpenEditRombel(kt.tingkat, r)}
                          >
                            <PencilLine className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            title="Hapus Rombel"
                            onClick={() => handleDeleteRombel(kt.tingkat, r.id, r.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: MATA PELAJARAN (MASTER DATA SAJA - APA YANG DIAJARMAN) */}
      {activeTab === "mapel" && (
        <Card className="border-border shadow-xs space-y-4">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Master Data Mata Pelajaran
              </CardTitle>
              <CardDescription className="text-xs">
                Data master mata pelajaran resmi MTsN 2 Cilacap (Kode Mapel, Nama, Kelompok Rumpun, Alokasi JP, & Status Aktif).
              </CardDescription>
            </div>

            <Button
              size="sm"
              className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shrink-0"
              onClick={() => setIsAddMapelOpen(true)}
            >
              <Plus className="h-4 w-4" /> + Tambah Mata Pelajaran
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/30 p-3 rounded-xl border border-border">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari Kode atau Nama Mapel..."
                  value={mapelSearchQuery}
                  onChange={(e) => setMapelSearchQuery(e.target.value)}
                  className="pl-9 text-xs h-9 bg-card"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-muted-foreground font-semibold">Filter Rumpun:</span>
                <select
                  className="h-9 px-3 text-xs font-semibold rounded-lg border border-border bg-card text-foreground cursor-pointer"
                  value={mapelFilterCategory}
                  onChange={(e) => setMapelFilterCategory(e.target.value)}
                >
                  <option value="ALL">Semua Rumpun Kategori</option>
                  <option value="Keagamaan">Rumpun Keagamaan</option>
                  <option value="Umum">Rumpun Umum</option>
                  <option value="Muatan Lokal">Muatan Lokal (Mulok)</option>
                  <option value="Pengembangan Diri">Pengembangan Diri</option>
                </select>
              </div>
            </div>

            {/* Grid Cards Mapel Master Data */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredMapelList.map((m) => (
                <div key={m.code} className="p-4 rounded-xl border border-border bg-card flex flex-col justify-between space-y-3 hover:border-primary/40 transition">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                        {m.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {m.category}
                        </Badge>
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                          ✔ Aktif
                        </Badge>
                      </div>
                    </div>

                    <div className="font-extrabold text-sm text-foreground">{m.name}</div>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{m.jp || "2 JP"}</span>
                      <span>·</span>
                      <span>{m.target || "Semua Tingkat"}</span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteMapel(m.code, m.name)}
                      title="Hapus Mapel"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
            </CardTitle>
            <CardDescription className="text-xs">
              Konfigurasi ambang batas KKM/KKTP dan bobot penilaian Kurikulum Merdeka.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">KKTP Standar Madrasah</div>
                <div className="text-2xl font-black text-emerald-600">75.0</div>
                <div className="text-[11px] text-muted-foreground">Batas Minimal Kelulusan TP</div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">Bobot Formatif vs Sumatif</div>
                <div className="text-2xl font-black text-primary">60% / 40%</div>
                <div className="text-[11px] text-muted-foreground">Skema Bobot Nilai E-Rapor</div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-card space-y-1">
                <div className="text-xs font-semibold text-muted-foreground">Predikat Kelulusan</div>
                <div className="text-xs font-bold text-foreground mt-1 space-y-1">
                  <div>≥ 90.0 : <span className="text-emerald-600 font-bold">Sangat Baik</span></div>
                  <div>≥ 80.0 : <span className="text-emerald-600 font-bold">Baik</span></div>
                  <div>≥ 75.0 : <span className="text-emerald-600 font-bold">Cukup</span></div>
                  <div>&lt; 75.0 : <span className="text-rose-600 font-bold">Perlu Bimbingan</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL 1: TAMBAH ROMBEL BARU */}
      <Dialog open={isAddRombelOpen} onOpenChange={setIsAddRombelOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Tambah Rombongan Belajar (Rombel) Baru
            </DialogTitle>
            <DialogDescription>Input rincian Rombel baru dan alokasi Wali Kelas pengampu.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRombel} className="space-y-4 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Tingkat Kelas Target</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                value={newRombelTingkat}
                onChange={(e) => setNewRombelTingkat(e.target.value)}
              >
                <option value="Tingkat VII (Kelas 7)">Tingkat VII (Kelas 7)</option>
                <option value="Tingkat VIII (Kelas 8)">Tingkat VIII (Kelas 8)</option>
                <option value="Tingkat IX (Kelas 9)">Tingkat IX (Kelas 9)</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Nama Rombel</Label>
              <Input
                placeholder="Contoh: VII D / VIII D / IX D"
                value={newRombelName}
                onChange={(e) => setNewRombelName(e.target.value)}
                required
                className="mt-1 text-xs font-bold"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Pilih Wali Kelas Pengampu</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                value={newRombelWali}
                onChange={(e) => setNewRombelWali(e.target.value)}
              >
                <option value="Ustadzah Nurul Hidayah, S.Pd.I">Ustadzah Nurul Hidayah, S.Pd.I</option>
                <option value="Bpk. Slamet Riyadi, M.Pd">Bpk. Slamet Riyadi, M.Pd</option>
                <option value="Dra. Hj. Siti Rahmah, M.Pd">Dra. Hj. Siti Rahmah, M.Pd</option>
                <option value="Ibu Maryati, S.Pd">Ibu Maryati, S.Pd</option>
                <option value="Ust. Ahmad Syukri, S.Kom">Ust. Ahmad Syukri, S.Kom</option>
                <option value="Ibu Ratna Dewi, M.Pd">Ibu Ratna Dewi, M.Pd</option>
                <option value="Bpk. Hendra Wijaya, M.Sc">Bpk. Hendra Wijaya, M.Sc</option>
                <option value="Ust. H. Mohammad Fathoni, M.Pd">Ust. H. Mohammad Fathoni, M.Pd</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Kapasitas / Jumlah Siswa</Label>
              <Input
                type="number"
                value={newRombelSiswaCount}
                onChange={(e) => setNewRombelSiswaCount(Number(e.target.value))}
                className="mt-1 text-xs font-mono font-bold"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRombelOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Rombel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 1B: EDIT DATA ROMBEL */}
      <Dialog open={isEditRombelOpen} onOpenChange={setIsEditRombelOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <PencilLine className="h-5 w-5 text-primary" /> Edit Data Rombel ({editingRombel?.name})
            </DialogTitle>
            <DialogDescription>Perbarui nama Rombel, Wali Kelas pengampu, dan kuota siswa.</DialogDescription>
          </DialogHeader>

          {editingRombel && (
            <form onSubmit={handleSaveEditRombel} className="space-y-4 py-2 text-xs">
              <div>
                <Label className="text-xs font-semibold">Nama Rombel</Label>
                <Input
                  value={editingRombel.name}
                  onChange={(e) => setEditingRombel({ ...editingRombel, name: e.target.value })}
                  required
                  className="mt-1 text-xs font-bold"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Pilih Wali Kelas Pengampu</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                  value={editingRombel.wali}
                  onChange={(e) => setEditingRombel({ ...editingRombel, wali: e.target.value })}
                >
                  <option value="Ustadzah Nurul Hidayah, S.Pd.I">Ustadzah Nurul Hidayah, S.Pd.I</option>
                  <option value="Bpk. Slamet Riyadi, M.Pd">Bpk. Slamet Riyadi, M.Pd</option>
                  <option value="Dra. Hj. Siti Rahmah, M.Pd">Dra. Hj. Siti Rahmah, M.Pd</option>
                  <option value="Ibu Maryati, S.Pd">Ibu Maryati, S.Pd</option>
                  <option value="Ust. Ahmad Syukri, S.Kom">Ust. Ahmad Syukri, S.Kom</option>
                  <option value="Ibu Ratna Dewi, M.Pd">Ibu Ratna Dewi, M.Pd</option>
                  <option value="Bpk. Hendra Wijaya, M.Sc">Bpk. Hendra Wijaya, M.Sc</option>
                  <option value="Ust. H. Mohammad Fathoni, M.Pd">Ust. H. Mohammad Fathoni, M.Pd</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Kapasitas / Jumlah Siswa</Label>
                <Input
                  type="number"
                  value={editingRombel.siswaCount}
                  onChange={(e) => setEditingRombel({ ...editingRombel, siswaCount: Number(e.target.value) })}
                  className="mt-1 text-xs font-mono font-bold"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditRombelOpen(false)}>Batal</Button>
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Perubahan</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 2: TAMBAH MATA PELAJARAN BARU */}
      <Dialog open={isAddMapelOpen} onOpenChange={setIsAddMapelOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Tambah Mata Pelajaran Baru
            </DialogTitle>
            <DialogDescription>Input master mata pelajaran persisten SIAKAD Kurikulum Merdeka.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateMapel} className="space-y-4 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Nama Mata Pelajaran</Label>
              <Input
                placeholder="Contoh: Robotika & AI Madrasah"
                value={newMapelName}
                onChange={(e) => setNewMapelName(e.target.value)}
                required
                className="mt-1 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Kode Mapel (Opsional)</Label>
                <Input
                  placeholder="Contoh: AGM-06 / UMM-08"
                  value={newMapelCode}
                  onChange={(e) => setNewMapelCode(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Rumpun Kategori</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                  value={newMapelCategory}
                  onChange={(e) => setNewMapelCategory(e.target.value)}
                >
                  <option value="Keagamaan">Keagamaan</option>
                  <option value="Umum">Umum</option>
                  <option value="Muatan Lokal">Muatan Lokal</option>
                  <option value="Pengembangan Diri">Pengembangan Diri</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Alokasi Waktu Standar</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                  value={newMapelJp}
                  onChange={(e) => setNewMapelJp(e.target.value)}
                >
                  <option value="2 JP">2 JP / Minggu</option>
                  <option value="3 JP">3 JP / Minggu</option>
                  <option value="4 JP">4 JP / Minggu</option>
                  <option value="5 JP">5 JP / Minggu</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Target Tingkat</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                  value={newMapelTarget}
                  onChange={(e) => setNewMapelTarget(e.target.value)}
                >
                  <option value="Semua Tingkat">Semua Tingkat (VII, VIII, IX)</option>
                  <option value="Tingkat VII">Tingkat VII (Kelas 7)</option>
                  <option value="Tingkat VIII">Tingkat VIII (Kelas 8)</option>
                  <option value="Tingkat IX">Tingkat IX (Kelas 9)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddMapelOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Mapel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: TAMBAH TAHUN AJARAN BARU */}
      <Dialog open={isAddTaOpen} onOpenChange={setIsAddTaOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> Tambah Tahun Ajaran SIAKAD Baru
            </DialogTitle>
            <DialogDescription>Input tahun ajaran baru untuk diterbitkan secara global.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTa} className="space-y-4 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Tahun Ajaran</Label>
              <Input
                placeholder="2027/2028"
                value={newTaYear}
                onChange={(e) => setNewTaYear(e.target.value)}
                required
                className="mt-1 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Semester</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                  value={newTaSem}
                  onChange={(e) => setNewTaSem(e.target.value as any)}
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Status Awal</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                  value={newTaStatus}
                  onChange={(e) => setNewTaStatus(e.target.value as any)}
                >
                  <option value="Aktif">Langsung Aktifkan</option>
                  <option value="Arsip">Simpan Sebagai Arsip</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTaOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Terbitkan TA</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: TAMBAH RUANG BARU */}
      <Dialog open={isAddRuangOpen} onOpenChange={setIsAddRuangOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Tambah Ruang Pembelajaran / Lab
            </DialogTitle>
            <DialogDescription>Input master ruang kelas fisik dan laboratorium madrasah.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRuang} className="space-y-4 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Nama Ruang / Laboratorium</Label>
              <Input
                placeholder="Contoh: Lab Bahasa Digital"
                value={newRuangName}
                onChange={(e) => setNewRuangName(e.target.value)}
                required
                className="mt-1 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Jenis Ruang</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                  value={newRuangType}
                  onChange={(e) => setNewRuangType(e.target.value)}
                >
                  <option value="Ruang Teori">Ruang Teori Kelas</option>
                  <option value="Laboratorium Praktikum">Laboratorium Praktikum</option>
                  <option value="E-Library & Perpus">E-Library & Perpus</option>
                  <option value="Fasilitas Outdoor">Fasilitas Outdoor</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Kapasitas</Label>
                <Input
                  value={newRuangCap}
                  onChange={(e) => setNewRuangCap(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Fasilitas Ruangan</Label>
              <Input
                value={newRuangFas}
                onChange={(e) => setNewRuangFas(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRuangOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Ruang</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: PLOTTING PENGAMPU MAPEL BARU */}
      <Dialog open={isAddPengampuOpen} onOpenChange={setIsAddPengampuOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Plotting Guru Pengampu Mapel
            </DialogTitle>
            <DialogDescription>Alokasikan Guru ke Mata Pelajaran dan Rombel tertentu.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPengampu} className="space-y-4 py-2 text-xs">
            <div>
              <Label className="text-xs font-semibold">Pilih Guru Pengampu</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                value={selectedGuru}
                onChange={(e) => setSelectedGuru(e.target.value)}
              >
                <option value="Bpk. Hendra Wijaya, M.Sc">Bpk. Hendra Wijaya, M.Sc</option>
                <option value="Dra. Hj. Siti Rahmah, M.Pd">Dra. Hj. Siti Rahmah, M.Pd</option>
                <option value="Ustadzah Nurul Hidayah, S.Pd.I">Ustadzah Nurul Hidayah, S.Pd.I</option>
                <option value="Ibu Ratna Dewi, M.Pd">Ibu Ratna Dewi, M.Pd</option>
                <option value="H. Ahmad Syukri, S.Kom">H. Ahmad Syukri, S.Kom</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Pilih Mata Pelajaran</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
              >
                {masterMapel.map((m) => (
                  <option key={m.code} value={m.name}>{m.name} ({m.code})</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Pilih Rombel Target</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs mt-1 font-semibold"
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
              >
                <option value="VII A">Rombel VII A</option>
                <option value="VII B">Rombel VII B</option>
                <option value="VIII A">Rombel VIII A</option>
                <option value="VIII B">Rombel VIII B</option>
                <option value="IX A">Rombel IX A</option>
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

      {/* MODAL DETAIL KELOLA PERANGKAT PEMBELAJARAN PER MAPEL */}
      <Dialog open={!!selectedMapelForPerangkat} onOpenChange={(open) => !open && setSelectedMapelForPerangkat(null)}>
        <DialogContent className="sm:max-w-xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Detail Perangkat Pembelajaran - {selectedMapelForPerangkat?.name} ({selectedMapelForPerangkat?.code})
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pengelolaan dokumen Kurikulum Merdeka untuk mata pelajaran {selectedMapelForPerangkat?.name}.
            </DialogDescription>
          </DialogHeader>

          {selectedMapelForPerangkat && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl border border-border flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-foreground">{selectedMapelForPerangkat.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Kode: <code className="font-mono text-primary">{selectedMapelForPerangkat.code}</code> · Rumpun: {selectedMapelForPerangkat.category} · Beban: {selectedMapelForPerangkat.jp}
                  </div>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                  Terverifikasi Waka
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-foreground flex items-center justify-between">
                  <span>Daftar Dokumen Pembelajaran Resmi:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] font-bold gap-1 text-primary"
                    onClick={() => toast.success("Silakan pilih berkas PDF dari komputer Anda untuk diunggah.")}
                  >
                    <Plus className="h-3.5 w-3.5" /> + Unggah Dokumen Baru
                  </Button>
                </div>

                <div className="space-y-2">
                  {[
                    { title: `Capaian Pembelajaran (CP) ${selectedMapelForPerangkat.name} Fase D`, type: "Capaian Pembelajaran", size: "1.2 MB", tag: "PDF" },
                    { title: `Alur Tujuan Pembelajaran (ATP) ${selectedMapelForPerangkat.name} TP 2026/2027`, type: "Alur Pembelajaran", size: "1.8 MB", tag: "PDF" },
                    { title: `Modul Ajar PDF Lengkap Pertemuan 1-18 (${selectedMapelForPerangkat.name})`, type: "Modul Ajar", size: "4.5 MB", tag: "PDF" },
                    { title: `Lembar Kerja Peserta Didik (LKPD) & Asesmen ${selectedMapelForPerangkat.name}`, type: "LKPD", size: "2.1 MB", tag: "PDF" },
                  ].map((doc, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between hover:bg-muted/30 transition">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary font-bold grid place-items-center text-xs">
                          📄
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-xs">{doc.title}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {doc.type} · {doc.size} · Format: {doc.tag}
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-bold gap-1"
                        onClick={() => {
                          const content = `=== ${doc.title} ===\nMapel: ${selectedMapelForPerangkat.name}\nKode: ${selectedMapelForPerangkat.code}\nStatus: Terverifikasi Waka Kurikulum MTsN 2 Cilacap.`;
                          const blob = new Blob([content], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${doc.type.replace(/\s+/g, "_")}_${selectedMapelForPerangkat.code}.txt`;
                          a.click();
                          URL.revokeObjectURL(url);
                          toast.success(`📄 ${doc.title} berhasil diunduh!`);
                        }}
                      >
                        📥 Unduh
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-3 border-t border-border flex items-center justify-between sm:justify-between">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                  onClick={() => {
                    const blob = new Blob([`📦 Paket Lengkap Perangkat Pembelajaran ${selectedMapelForPerangkat.name}`], { type: "application/zip" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Paket_Perangkat_${selectedMapelForPerangkat.code}.zip`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success(`📦 Paket Perangkat ${selectedMapelForPerangkat.name} (.ZIP) berhasil diunduh!`);
                  }}
                >
                  📦 Unduh Paket Modul Mapel ini (.ZIP)
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedMapelForPerangkat(null)}>
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL JADWAL PELAJARAN ROMBEL */}
      <Dialog open={!!selectedRombelJadwal} onOpenChange={(open) => !open && setSelectedRombelJadwal(null)}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> Jadwal Pelajaran - Rombel {selectedRombelJadwal}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Alokasi jam tatap muka KBM resmi Rombel {selectedRombelJadwal} TP 2026/2027.
            </DialogDescription>
          </DialogHeader>

          {selectedRombelJadwal && (
            <div className="space-y-3 py-2 text-xs">
              {(rombelJadwalMap[selectedRombelJadwal] || [
                { hari: "Senin", jam: "07.30 - 09.00", mapel: "Al-Quran Hadits", guru: "Dra. Hj. Siti Rahmah, M.Pd" },
                { hari: "Senin", jam: "09.15 - 10.45", mapel: "Matematika", guru: "Bpk. Hendra Wijaya, M.Sc" },
                { hari: "Selasa", jam: "07.30 - 09.00", mapel: "Bahasa Indonesia", guru: "Bpk. Slamet Riyadi, M.Pd" },
              ]).map((j, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-card flex items-center justify-between">
                  <div>
                    <div className="font-bold text-foreground">{j.mapel}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{j.guru}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-[10px] font-mono font-bold">{j.hari}</Badge>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{j.jam}</div>
                  </div>
                </div>
              ))}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRombelJadwal(null)}>
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
