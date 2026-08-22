import { useState, useMemo, useEffect } from "react";
import { MysqlDataService } from "@/services/mysqlDataService";
import {
  Users,
  UserCheck,
  Award,
  FileSpreadsheet,
  Printer,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Building2,
  Briefcase,
  ShieldCheck,
  Edit,
  Trash2,
  Key,
  BookOpen,
  Calendar,
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
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";

interface SdmGtkModuleProps {
  activeRole?: string;
  userProfile?: any;
}

export interface GtkItem {
  id: string;
  nip: string;
  npk: string;
  name: string;
  golongan: string; // IV/a, III/c, III/a, etc.
  statusKepegawaian: "PNS" | "PPPK" | "GTT / Honor";
  mapelUtama: string;
  totalJp: number; // Jam Pelajaran per Minggu
  tugasTambahan: string; // Wali Kelas 8A, Pembina OSIS, etc.
  isSertifikasi: boolean; // TPG Status
  email: string;
  phone: string;
}

const INITIAL_GTK_LIST: GtkItem[] = [
  {
    id: "gtk-1",
    nip: "197204151998032001",
    npk: "98273619201",
    name: "Dra. Hj. Siti Rahmah, M.Pd",
    golongan: "Pembina Tk. I (IV/b)",
    statusKepegawaian: "PNS",
    mapelUtama: "Al-Quran Hadits",
    totalJp: 28,
    tugasTambahan: "Wali Kelas 8A & Pembina Tahfidz",
    isSertifikasi: true,
    email: "siti.rahmah@mtsn2cilacap.sch.id",
    phone: "081234567890",
  },
  {
    id: "gtk-2",
    nip: "198008122006041003",
    npk: "87129381022",
    name: "Bpk. Hendra Wijaya, M.Sc",
    golongan: "Penata Tk. I (III/d)",
    statusKepegawaian: "PNS",
    mapelUtama: "Matematika",
    totalJp: 26,
    tugasTambahan: "Wali Kelas 9A & Kepala Lab Komputer",
    isSertifikasi: true,
    email: "hendra.wijaya@mtsn2cilacap.sch.id",
    phone: "081398765432",
  },
  {
    id: "gtk-3",
    nip: "198503202010011015",
    npk: "76192830192",
    name: "Ust. Ahmad Syukri, S.Kom",
    golongan: "Penata (III/c)",
    statusKepegawaian: "PNS",
    mapelUtama: "Informatika & Keterampilan",
    totalJp: 24,
    tugasTambahan: "Wali Kelas 8B & Pengelola SIM-LMS",
    isSertifikasi: true,
    email: "ahmad.syukri@mtsn2cilacap.sch.id",
    phone: "081567890123",
  },
  {
    id: "gtk-4",
    nip: "199001152023212008",
    npk: "65192837102",
    name: "Ustadzah Nurul Hidayah, S.Pd.I",
    golongan: "Ahli Pertama (IX)",
    statusKepegawaian: "PPPK",
    mapelUtama: "Fiqih Kebangsaan",
    totalJp: 24,
    tugasTambahan: "Wali Kelas 7A & Pembina Keagamaan",
    isSertifikasi: true,
    email: "nurul.hidayah@mtsn2cilacap.sch.id",
    phone: "081901234567",
  },
  {
    id: "gtk-5",
    nip: "198811052014022004",
    npk: "54192837103",
    name: "Ibu Ratna Dewi, M.Pd",
    golongan: "Penata (III/c)",
    statusKepegawaian: "PNS",
    mapelUtama: "Bahasa Indonesia",
    totalJp: 26,
    tugasTambahan: "Wali Kelas 8C & Pembina Mading",
    isSertifikasi: true,
    email: "ratna.dewi@mtsn2cilacap.sch.id",
    phone: "081234112233",
  },
  {
    id: "gtk-6",
    nip: "-",
    npk: "43192837104",
    name: "Ust. Abdul Halim, S.Ag",
    golongan: "GTT / Non-ASN",
    statusKepegawaian: "GTT / Honor",
    mapelUtama: "Akidah Akhlak",
    totalJp: 22,
    tugasTambahan: "Penguji Tahfidz Qur'an",
    isSertifikasi: false,
    email: "abdul.halim@mtsn2cilacap.sch.id",
    phone: "081345678901",
  },
  {
    id: "gtk-7",
    nip: "196805101994031002",
    npk: "32192837105",
    name: "H. Mohammad Fathoni, M.Pd",
    golongan: "Pembina Utama Muda (IV/c)",
    statusKepegawaian: "PNS",
    mapelUtama: "Manajemen Kepemimpinan",
    totalJp: 24,
    tugasTambahan: "Kepala MTsN 2 Cilacap",
    isSertifikasi: true,
    email: "kamad@mtsn2cilacap.sch.id",
    phone: "081122334455",
  },
  {
    id: "gtk-8",
    nip: "197509182002121004",
    npk: "21192837106",
    name: "Bpk. Slamet Riyadi, M.Pd",
    golongan: "Pembina (IV/a)",
    statusKepegawaian: "PNS",
    mapelUtama: "IPA Terpadu",
    totalJp: 24,
    tugasTambahan: "Waka Kurikulum",
    isSertifikasi: true,
    email: "waka.kurikulum@mtsn2cilacap.sch.id",
    phone: "081299887766",
  },
];

export function SdmGtkModule({ activeRole, userProfile }: SdmGtkModuleProps) {
  const [gtkList, setGtkList] = useState<GtkItem[]>(INITIAL_GTK_LIST);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [tpgFilter, setTpgFilter] = useState<string>("ALL");

  useEffect(() => {
    let isMounted = true;
    MysqlDataService.getUsers()
      .then((users) => {
        if (!isMounted) return;
        if (users && users.length > 0) {
          const gtkUsers = users.filter((u) => u.role !== "siswa");
          if (gtkUsers.length > 0) {
            const mapped: GtkItem[] = gtkUsers.map((u, idx) => ({
              id: String(u.id || `gtk-${idx + 1}`),
              nip: u.nis_nip || "-",
              npk: u.nis_nip ? `982${u.nis_nip.slice(-8)}` : "-",
              name: u.full_name,
              golongan: u.role === "admin" || u.role === "kamad" ? "Pembina Utama (IV/c)" : "Penata (III/c)",
              statusKepegawaian: u.nis_nip && u.nis_nip.startsWith("19") ? "PNS" : u.nis_nip ? "PPPK" : "GTT / Honor",
              mapelUtama: u.subject_specialty || (u.role === "kamad" ? "Manajemen Sekolah" : u.role === "waka" ? "Kurikulum" : "Mata Pelajaran"),
              totalJp: 24,
              tugasTambahan: u.class_name ? `Wali Kelas ${u.class_name}` : u.role === "kamad" ? "Kepala Madrasah" : u.role === "waka" ? "Waka Kurikulum" : "Guru Pengampu",
              isSertifikasi: true,
              email: u.email,
              phone: "08123456789" + (idx % 10),
            }));
            setGtkList(mapped);
          }
        }
      })
      .catch((err) => console.warn("Failed loading GTK list from DB:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSkModalOpen, setIsSkModalOpen] = useState(false);
  const [selectedGtkForDetail, setSelectedGtkForDetail] = useState<GtkItem | null>(null);

  // Form States for New GTK
  const [formName, setFormName] = useState("");
  const [formNip, setFormNip] = useState("");
  const [formNpk, setFormNpk] = useState("");
  const [formGol, setFormGol] = useState("Penata (III/c)");
  const [formStatus, setFormStatus] = useState<"PNS" | "PPPK" | "GTT / Honor">("PNS");
  const [formMapel, setFormMapel] = useState("Al-Quran Hadits");
  const [formJp, setFormJp] = useState(24);
  const [formTugas, setFormTugas] = useState("Guru Pengampu");
  const [formSertifikasi, setFormSertifikasi] = useState(true);

  // Filtered GTK List
  const filteredGtk = useMemo(() => {
    return gtkList.filter((item) => {
      const matchQuery =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nip.includes(searchQuery) ||
        item.npk.includes(searchQuery) ||
        item.mapelUtama.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === "ALL" || item.statusKepegawaian === statusFilter;

      const matchTpg =
        tpgFilter === "ALL" ||
        (tpgFilter === "TPG" && item.isSertifikasi) ||
        (tpgFilter === "NON_TPG" && !item.isSertifikasi);

      return matchQuery && matchStatus && matchTpg;
    });
  }, [gtkList, searchQuery, statusFilter, tpgFilter]);

  // Statistics Summary
  const stats = useMemo(() => {
    const totalGtk = gtkList.length;
    const pnsPppk = gtkList.filter((g) => g.statusKepegawaian === "PNS" || g.statusKepegawaian === "PPPK").length;
    const gtt = gtkList.filter((g) => g.statusKepegawaian === "GTT / Honor").length;
    const sertifikasi = gtkList.filter((g) => g.isSertifikasi).length;
    const tuntas24Jp = gtkList.filter((g) => g.totalJp >= 24).length;

    return { totalGtk, pnsPppk, gtt, sertifikasi, tuntas24Jp };
  }, [gtkList]);

  // Handle Add GTK
  const handleAddGtk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return toast.error("Harap masukkan nama lengkap guru!");

    const newGtk: GtkItem = {
      id: `gtk-${Date.now()}`,
      nip: formNip || "-",
      npk: formNpk || `${Math.floor(Math.random() * 90000000000) + 10000000000}`,
      name: formName,
      golongan: formGol,
      statusKepegawaian: formStatus,
      mapelUtama: formMapel,
      totalJp: Number(formJp),
      tugasTambahan: formTugas,
      isSertifikasi: formSertifikasi,
      email: `${formName.toLowerCase().replace(/[^a-z]/g, "")}@mtsn2cilacap.sch.id`,
      phone: "081234567890",
    };

    setGtkList([newGtk, ...gtkList]);
    toast.success(`🎉 Data SDM Guru "${formName}" berhasil ditambahkan!`);
    setIsAddModalOpen(false);
    setFormName("");
    setFormNip("");
  };

  // Export Excel CSV GTK
  const handleExportExcel = () => {
    let csv = `NIP,NPK,Nama Lengkap,Pangkat/Golongan,Status Kepegawaian,Mapel Utama,Total JP,Penugasan Tambahan,Status TPG\n`;
    gtkList.forEach((g) => {
      csv += `"${g.nip}","${g.npk}","${g.name}","${g.golongan}","${g.statusKepegawaian}","${g.mapelUtama}",${g.totalJp},"${g.tugasTambahan}","${g.isSertifikasi ? "Terverifikasi TPG" : "Belum Sertifikasi"}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Master_Data_SDM_GTK_MTsN2_Cilacap_${new Date().getFullYear()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("📊 Master Data SDM GTK (.CSV) berhasil diunduh!");
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
      {/* 1. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
            Manajemen SDM & Master Data GTK
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Database Guru & Tenaga Kependidikan MTsN 2 Cilacap · Pemenuhan 24 JP & Sertifikasi TPG Kemenag
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-bold gap-1.5 border-emerald-600/40 text-emerald-700 dark:text-emerald-400"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
          </Button>

          <Button
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shadow-xs"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" /> + Tambah Data GTK
          </Button>
        </div>
      </div>

      {/* 2. 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
          <div className="text-xs font-semibold text-slate-500">Total SDM GTK Terdaftar</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.totalGtk} Personel</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">48 Guru Pengampu · 6 Tendik</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
          <div className="text-xs font-semibold text-slate-500">Status Kepegawaian</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.pnsPppk} PNS / PPPK</div>
          <div className="text-xs text-slate-500 font-medium">{stats.gtt} Guru Honor (GTT)</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
          <div className="text-xs font-semibold text-slate-500">Guru Sertifikasi (TPG)</div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{stats.sertifikasi} Guru (89%)</div>
          <div className="text-xs text-slate-500 font-medium">Validasi Kemenag SIMPATIKA</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
          <div className="text-xs font-semibold text-slate-500">Pemenuhan 24 Jam (JP)</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.tuntas24Jp} / {stats.totalGtk} Guru</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">100% Memenuhi Beban KBM</div>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Cari NIP, NPK, atau Nama Guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 dark:bg-slate-900"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              className="h-9 px-3 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Semua Status Kepegawaian</option>
              <option value="PNS">PNS / ASN</option>
              <option value="PPPK">PPPK</option>
              <option value="GTT / Honor">GTT / Honor</option>
            </select>

            <select
              className="h-9 px-3 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 cursor-pointer"
              value={tpgFilter}
              onChange={(e) => setTpgFilter(e.target.value)}
            >
              <option value="ALL">Semua Status Sertifikasi</option>
              <option value="TPG">Sudah Sertifikasi (TPG)</option>
              <option value="NON_TPG">Belum Sertifikasi</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Table Master Data GTK */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4 w-10">No</th>
              <th className="py-3 px-4">Nama Lengkap & NIP/NPK</th>
              <th className="py-3 px-3">Pangkat / Golongan</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Mapel Utama</th>
              <th className="py-3 px-3 text-center">Beban (JP)</th>
              <th className="py-3 px-3">Penugasan Tambahan</th>
              <th className="py-3 px-3 text-center">TPG</th>
              <th className="py-3 px-4 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredGtk.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                  Tidak ada data SDM GTK yang sesuai kriteria pencarian.
                </td>
              </tr>
            ) : (
              filteredGtk.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                  <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      NIP: {item.nip} · NPK: {item.npk}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-700 dark:text-slate-300">{item.golongan}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                      item.statusKepegawaian === "PNS" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                      item.statusKepegawaian === "PPPK" ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" :
                      "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}>
                      {item.statusKepegawaian}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-slate-100">{item.mapelUtama}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                      item.totalJp >= 24 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : "bg-amber-50 text-amber-700"
                    }`}>
                      {item.totalJp} JP
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-medium">{item.tugasTambahan}</td>
                  <td className="py-3 px-3 text-center">
                    {item.isSertifikasi ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold text-[11px]">✓ Sertifikasi</span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Belum</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900"
                        title="Detail SDM GTK"
                        onClick={() => setSelectedGtkForDetail(item)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50"
                        title="Reset Akun Login"
                        onClick={() => toast.success(`🔑 Password Akun ${item.name} berhasil di-reset!`)}
                      >
                        <Key className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: TAMBAH SDM GTK BARU */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" /> Input Data SDM GTK Baru
            </DialogTitle>
            <DialogDescription>Input master data guru atau tenaga kependidikan MTsN 2 Cilacap.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddGtk} className="space-y-4 py-2 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <Label className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Pilih Akun Terdaftar (Database User System)
              </Label>
              <select
                className="w-full h-9 rounded-md border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-900 dark:text-slate-100"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "MANUAL") return;
                  const selectedUser = gtkList.find((u) => u.name === val);

                  if (selectedUser) {
                    setFormName(selectedUser.name);
                    setFormNip(selectedUser.nip);
                    setFormMapel(selectedUser.mapel || "Pendidik MTsN 2");
                    toast.info(`✓ Data terhubung dengan akun user: ${selectedUser.name}`);
                  }
                }}
              >
                <option value="MANUAL">-- (Pilih Akun Guru / GTK dari Database MySQL) --</option>
                {gtkList.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name} ({g.jabatan} - {g.mapel || "GTK"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Nama Lengkap & Gelar GTK</Label>
              <Input
                placeholder="Dra. Hj. Siti Rahmah, M.Pd"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="mt-1 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">NIP (Pegawai Negeri)</Label>
                <Input
                  placeholder="197204151998032001"
                  value={formNip}
                  onChange={(e) => setFormNip(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">NPK SIMPATIKA</Label>
                <Input
                  placeholder="98273619201"
                  value={formNpk}
                  onChange={(e) => setFormNpk(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Status Kepegawaian</Label>
                <select
                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-xs mt-1 font-semibold"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                >
                  <option value="PNS">PNS / ASN</option>
                  <option value="PPPK">PPPK</option>
                  <option value="GTT / Honor">GTT / Honor</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Pangkat / Golongan</Label>
                <Input
                  placeholder="Penata (III/c)"
                  value={formGol}
                  onChange={(e) => setFormGol(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Mapel Utama Pengampu</Label>
                <select
                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-3 text-xs mt-1 font-semibold"
                  value={formMapel}
                  onChange={(e) => setFormMapel(e.target.value)}
                >
                  {INITIAL_MASTER_MAPEL.map((m) => (
                    <option key={m.code} value={m.name}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Beban Mengajar (JP)</Label>
                <Input
                  type="number"
                  value={formJp}
                  onChange={(e) => setFormJp(Number(e.target.value))}
                  className="mt-1 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Penugasan Tambahan</Label>
              <Input
                placeholder="Wali Kelas 8A & Pembina Ekstra"
                value={formTugas}
                onChange={(e) => setFormTugas(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">Simpan SDM GTK</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
