import { useState, useMemo, useEffect } from "react";
import { MysqlDataService, GtkLeaveRow, GtkDocumentRow } from "@/services/mysqlDataService";
import { MysqlAuthService, saveUserProfileOverride } from "@/services/mysqlAuthService";
import {
  Users,
  UserCheck,
  Award,
  FileSpreadsheet,
  Printer,
  Plus,
  Search,
  Trash2,
  Pencil,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { exportToExcelXml } from "@/utils/excelExporter";

import { AddGtkDialog } from "./components/AddGtkDialog";
import { EditGtkDialog } from "./components/EditGtkDialog";
import { DetailGtkDialog } from "./components/DetailGtkDialog";
import { PrintGtkDialog } from "./components/PrintGtkDialog";
import { CutiIzinDialog } from "./components/CutiIzinDialog";
import { UserManagementModule } from "@/components/dashboard/modules/user/UserManagementModule";

export interface GtkItem {
  id: string;
  nip: string;
  npk: string;
  name: string;
  golongan: string;
  statusKepegawaian: "PNS" | "PPPK" | "GTT / Honor";
  mapelUtama: string;
  totalJp: number;
  tugasTambahan: string;
  isSertifikasi: boolean;
  email: string;
  phone?: string;
  role?: string;
  mapel?: string;
  jabatan?: string;
}

export function SdmGtkModule({
  activeRole,
  userProfile,
  initialTab = "daftar",
}: {
  activeRole?: string;
  userProfile?: any;
  initialTab?: "daftar" | "cuti" | "akun";
}) {
  const [activeTab, setActiveTab] = useState<"daftar" | "cuti" | "akun">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [gtkList, setGtkList] = useState<GtkItem[]>([]);
  const [leavesList, setLeavesList] = useState<GtkLeaveRow[]>([]);
  const [gtkDocs, setGtkDocs] = useState<GtkDocumentRow[]>([]);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [gtkToEdit, setGtkToEdit] = useState<GtkItem | null>(null);

  const [selectedGtk, setSelectedGtk] = useState<GtkItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isAddLeaveOpen, setIsAddLeaveOpen] = useState(false);

  const isKamad = activeRole === "kamad";
  const canDeleteGtk = activeRole === "admin" || activeRole === "superadmin" || activeRole === "kamad";

  useEffect(() => {
    Promise.all([
      MysqlDataService.getUsers(),
      MysqlDataService.getJadwalPelajaran(),
      MysqlDataService.getPengampuList(),
      MysqlDataService.getGtkLeaves(),
    ])
      .then(([users, schedules, pengampuList, leaves]) => {
        if (leaves) setLeavesList(leaves);
        if (users && users.length > 0) {
          const teachers = users.filter(
            (u: any) =>
              u.role !== "siswa" &&
              u.email !== "admin@mail.com" &&
              !u.full_name?.toLowerCase().includes("super administrator")
          );

          if (teachers.length > 0) {
            const formatted = teachers.map((u: any) => {
              const uNameLower = (u.full_name || "").toLowerCase().trim();

              // Sesi tatap muka dari jadwal pelajaran real (1 sesi = 1 JP)
              const scheduledJp = (schedules || []).filter((s: any) => {
                const guru = (s.guru || "").toLowerCase().trim();
                return guru && (guru.includes(uNameLower) || uNameLower.includes(guru));
              }).length;

              // Jam dari matriks pengampu
              const matriksJp = (pengampuList || [])
                .filter((p: any) => {
                  const guru = (p.guru || "").toLowerCase().trim();
                  return guru && (guru.includes(uNameLower) || uNameLower.includes(guru));
                })
                .reduce((sum: number, p: any) => {
                  const jpVal = parseInt(p.jam || "0", 10) || 0;
                  return sum + jpVal;
                }, 0);

              const baseTatapMuka = Math.max(scheduledJp, matriksJp);

              // Ekuivalensi Beban Tambahan Sesuai Regulasi Kemenag / Simpatika
              const rLower = (u.role || "").toLowerCase();
              let ekuivalensiTambahan = 0;
              let tugasLabel = "Guru Pengampu";

              if (rLower.includes("kamad")) {
                ekuivalensiTambahan = 24; // Ekuivalensi Manajerial Penuh Kepala Madrasah
                tugasLabel = "Kepala Madrasah";
              } else if (rLower.includes("waka")) {
                ekuivalensiTambahan = 12; // Ekuivalensi Wakil Kepala Madrasah
                tugasLabel = "Waka Kurikulum";
              } else if (rLower.includes("walikelas")) {
                ekuivalensiTambahan = 6; // Ekuivalensi Pembimbingan Rombel Wali Kelas
                tugasLabel = "Wali Kelas";
              }

              const calculatedTotalJp = rLower.includes("kamad") ? 24 : baseTatapMuka + ekuivalensiTambahan;

              return {
                id: String(u.id || u.email),
                nip: u.nis_nip || "-",
                npk: u.nis_nip ? u.nis_nip.substring(0, 11) : "-",
                name: u.full_name,
                role: u.role || "guru",
                golongan: "-",
                statusKepegawaian: "PNS" as any,
                mapelUtama: u.subject_specialty || "Umum",
                totalJp: calculatedTotalJp,
                tugasTambahan: tugasLabel,
                isSertifikasi: calculatedTotalJp >= 24,
                email: u.email,
                phone: u.phone || "-",
              };
            });
            setGtkList(formatted);
          }
        }
      })
      .catch((err) => {
        console.warn("Failed loading SDM GTK data:", err);
      });
  }, []);

  const handleOpenDetail = (item: GtkItem) => {
    setSelectedGtk(item);
    setIsDetailOpen(true);
    MysqlDataService.getGtkDocuments().then((docs) => setGtkDocs(docs || [])).catch(() => {});
  };

  const handleOpenEdit = (item: GtkItem) => {
    setGtkToEdit(item);
    setIsEditOpen(true);
  };

  const handleSaveGtk = async (updated: GtkItem) => {
    setGtkList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    try {
      saveUserProfileOverride(updated.email, {
        id: updated.id,
        email: updated.email,
        full_name: updated.name,
        nis_nip: updated.nip,
        phone: updated.phone || "",
      });

      await MysqlDataService.updateUserProfile({
        originalEmail: updated.email,
        id: updated.id,
        fullName: updated.name,
        email: updated.email,
        nipNis: updated.nip,
        phone: updated.phone || "",
      });
      toast.success(`Perubahan data GTK "${updated.name}" berhasil disimpan.`);
    } catch (e) {
      console.warn("Gagal simpan GTK ke MySQL:", e);
      toast.error("Gagal menyimpan perubahan data.");
    }
  };

  const handleDeleteGtk = async (item: GtkItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pegawai GTK ${item.name}?`)) {
      try {
        const res = await MysqlDataService.deleteUser(item.id, item.email);
        if (res) {
          setGtkList((prev) => prev.filter((g) => g.id !== item.id));
          toast.success(`Data pegawai GTK ${item.name} berhasil dihapus.`);
        } else {
          toast.error(`Gagal menghapus data ${item.name}: Anda tidak memiliki wewenang atau akun dilindungi.`);
        }
      } catch (e: any) {
        toast.error(`Gagal menghapus data pegawai: ${e?.message || "Kesalahan server"}`);
      }
    }
  };

  const handleAddGtk = async (newGtk: GtkItem) => {
    setGtkList((prev) => [newGtk, ...prev]);
    try {
      await MysqlAuthService.registerUser({
        full_name: newGtk.name,
        email: newGtk.email,
        nis_nip: newGtk.nip,
        role: "guru",
        subject_specialty: newGtk.mapelUtama,
        password: "asd123",
      });
      toast.success(`Data pegawai GTK ${newGtk.name} berhasil ditambahkan!`);
    } catch (e) {
      console.warn("Gagal tambah GTK ke MySQL:", e);
    }
  };

  const handleAddLeave = (leaveData: { teacherName: string; leaveType: string; startDate: string; endDate: string; reason: string }) => {
    const newLeave: GtkLeaveRow = {
      id: String(Date.now()),
      user_id: "u_gtk",
      guru_name: leaveData.teacherName,
      leave_type: leaveData.leaveType,
      start_date: leaveData.startDate,
      end_date: leaveData.endDate,
      reason: leaveData.reason,
      status: "Disetujui Kamad",
    };
    setLeavesList((prev) => [newLeave, ...prev]);
    MysqlDataService.saveGtkLeave(newLeave).catch(() => {});
    toast.success(`Pengajuan ${leaveData.leaveType} untuk ${leaveData.teacherName} berhasil disimpan!`);
  };

  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(colKey);
      setSortDir("asc");
    }
  };

  const filteredGtk = useMemo(() => {
    const list = gtkList.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.nip.toLowerCase().includes(search.toLowerCase()) ||
        item.email.toLowerCase().includes(search.toLowerCase()) ||
        item.mapelUtama.toLowerCase().includes(search.toLowerCase());
      const matchRole = filterStatus === "semua" || item.role === filterStatus;
      return matchSearch && matchRole;
    });

    return list.sort((a, b) => {
      let valA: any = "";
      let valB: any = "";
      if (sortColumn === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortColumn === "email") {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (sortColumn === "mapel") {
        valA = a.mapelUtama.toLowerCase();
        valB = b.mapelUtama.toLowerCase();
      } else if (sortColumn === "bebanJp") {
        valA = a.totalJp || 0;
        valB = b.totalJp || 0;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [gtkList, search, filterStatus, sortColumn, sortDir]);

  const countMemenuhi = gtkList.filter((g) => g.totalJp >= 24).length;
  const countKurang = gtkList.filter((g) => g.totalJp < 24).length;

  const handleExportGtkExcel = () => {
    const headers = [
      "Nama Pegawai GTK",
      "NIP / NPK",
      "Email / Akun",
      "Mata Pelajaran",
      "Tugas / Jabatan",
      "Beban Tatap Muka (JP)",
      "Status TPG Kemenag (≥24 JP)",
    ];
    const rows = filteredGtk.map((g) => [
      g.name,
      g.nip || "-",
      g.email,
      g.mapelUtama,
      g.tugasTambahan || "-",
      `${g.totalJp} JP`,
      g.totalJp >= 24 ? "Memenuhi Syarat (≥24 JP)" : "Belum Memenuhi (<24 JP)",
    ]);
    exportToExcelXml("Rekap_Beban_Kerja_GTK_24JP", "Beban_GTK", headers, rows);
    toast.success("Rekapitulasi Beban Kerja GTK berhasil diunduh ke Excel!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Manajemen SDM & Akun Madrasah
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pusat terpadu kepegawaian GTK, monitoring beban mengajar (≥24 JP), layanan cuti, serta manajemen akun & hak akses sistem.
          </p>
          {isKamad && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
              🏛️ Mode Pengawasan Eksekutif Kepala Madrasah — Monitoring kepatuhan jam mengajar TPG Kemenag & penugasan akun.
            </p>
          )}
        </div>
        {activeTab === "daftar" && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10" onClick={handleExportGtkExcel}>
              <FileSpreadsheet className="h-4 w-4" /> Export Excel Beban GTK
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold" onClick={() => setIsPrintOpen(true)}>
              <Printer className="h-4 w-4" /> Cetak Bio GTK PDF
            </Button>
            {!isKamad && (
              <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4" /> Tambah Pegawai GTK
              </Button>
            )}
          </div>
        )}
        {activeTab === "cuti" && !isKamad && (
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsAddLeaveOpen(true)}>
            <Plus className="h-4 w-4" /> Ajukan Cuti Baru
          </Button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        {[
          { id: "daftar", label: "Kepegawaian & Beban GTK", icon: Users },
          { id: "cuti", label: "Layanan Cuti & Izin", icon: FileSpreadsheet },
          { id: "akun", label: "Akun Pengguna & Hak Akses", icon: ShieldCheck },
        ].map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={activeTab === t.id ? "default" : "outline"}
            className={`text-xs font-bold gap-2 ${activeTab === t.id ? "shadow-xs" : ""}`}
            onClick={() => setActiveTab(t.id as any)}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </Button>
        ))}
      </div>

      {activeTab === "daftar" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Total Pegawai GTK</div>
                  <div className="text-xl font-extrabold text-foreground">{gtkList.length} Orang</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Memenuhi Beban (≥24 JP)</div>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{countMemenuhi} Guru</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Beban Kurang (&lt;24 JP)</div>
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{countKurang} Guru</div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-2xs">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Layanan Cuti Aktif</div>
                  <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{leavesList.length} Berkas</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="font-bold text-base text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> Data Induk GTK & Pemenuhan Jam Mengajar
                </div>
                <div className="text-xs text-muted-foreground">
                  Daftar guru & pegawai, validasi beban 24 JP sertifikasi Kemenag, dan status kepegawaian.
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama, NIP, email, mapel..."
                    className="pl-9 h-9 text-xs"
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  className="h-9 rounded-md border border-border bg-background px-3 text-xs font-bold"
                  value={filterStatus}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                >
                  <option value="semua">Semua Peran</option>
                  <option value="guru">Guru Pengampu</option>
                  <option value="walikelas">Wali Kelas</option>
                  <option value="waka">Waka Kurikulum</option>
                  <option value="kamad">Kepala Madrasah</option>
                </select>
              </div>
            </CardHeader>

            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs min-w-[950px]">
                <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4 cursor-pointer hover:bg-muted/80 select-none min-w-[220px]" onClick={() => handleSort("name")}>
                      <div className="flex items-center gap-1.5">
                        Nama Pegawai GTK
                        {sortColumn === "name" ? (
                          sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3 min-w-[140px]">NIP / NPK</th>
                    <th className="py-3 px-3 cursor-pointer hover:bg-muted/80 select-none min-w-[180px]" onClick={() => handleSort("email")}>
                      <div className="flex items-center gap-1.5">
                        Email / Akun
                        {sortColumn === "email" ? (
                          sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3 cursor-pointer hover:bg-muted/80 select-none min-w-[150px]" onClick={() => handleSort("mapel")}>
                      <div className="flex items-center gap-1.5">
                        Mapel Utama
                        {sortColumn === "mapel" ? (
                          sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3 cursor-pointer hover:bg-muted/80 select-none min-w-[110px]" onClick={() => handleSort("bebanJp")}>
                      <div className="flex items-center gap-1.5">
                        Beban Tatap Muka
                        {sortColumn === "bebanJp" ? (
                          sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-primary" /> : <ArrowDown className="h-3 w-3 text-primary" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-40" />
                        )}
                      </div>
                    </th>
                    <th className="py-3 px-3 text-center min-w-[120px]">Status 24 JP TPG</th>
                    <th className="py-3 px-4 text-center min-w-[180px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredGtk.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground font-semibold">
                        Tidak ada data pegawai GTK yang sesuai pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredGtk.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground text-xs">{item.name}</div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <span className="font-medium">{item.statusKepegawaian}</span>
                            {item.golongan && <span>• Gol. {item.golongan}</span>}
                            {item.tugasTambahan && <span className="text-primary font-semibold">• {item.tugasTambahan}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-muted-foreground">{item.nip || "-"}</td>
                        <td className="py-3 px-3 text-muted-foreground">{item.email}</td>
                        <td className="py-3 px-3 font-medium">{item.mapelUtama}</td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-foreground">{item.totalJp} JP</span>
                          <span className="text-[10px] text-muted-foreground ml-1">/minggu</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {item.totalJp >= 24 ? (
                            <Badge className="bg-emerald-600 text-white font-bold text-[10px] whitespace-nowrap">
                              ✓ Memenuhi
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-500/40 text-[10px] whitespace-nowrap">
                              Kurang {24 - item.totalJp} JP
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-bold gap-1"
                              onClick={() => handleOpenEdit(item)}
                              title="Edit Data GTK"
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-bold gap-1"
                              onClick={() => handleOpenDetail(item)}
                              title="Lihat Detail Profil"
                            >
                              <Eye className="h-3.5 w-3.5" /> Detail
                            </Button>
                            {canDeleteGtk && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs font-bold gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border border-rose-500/20"
                                onClick={() => handleDeleteGtk(item)}
                                title="Hapus Data Pegawai GTK"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Hapus
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "cuti" && (
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <div className="font-bold text-base text-foreground flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-amber-600" /> Layanan Cuti & Surat Izin GTK
              </div>
              <div className="text-xs text-muted-foreground">
                Rekapitulasi berkas pengajuan cuti tahunan, sakit, dan izin dinas tenaga pendidik.
              </div>
            </div>
            {!isKamad && (
              <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsAddLeaveOpen(true)}>
                <Plus className="h-4 w-4" /> Ajukan Cuti Baru
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Nama Pegawai</th>
                  <th className="py-3 px-3">Jenis Cuti</th>
                  <th className="py-3 px-3">Tanggal Mulai - Selesai</th>
                  <th className="py-3 px-3">Alasan</th>
                  <th className="py-3 px-4 text-center">Status Surat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {leavesList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground font-semibold">
                      Belum ada berkas pengajuan cuti yang tercatat.
                    </td>
                  </tr>
                ) : (
                  leavesList.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 font-bold text-foreground">{l.guru_name}</td>
                      <td className="py-3 px-3 font-semibold">{l.leave_type}</td>
                      <td className="py-3 px-3 font-mono">{l.start_date} s/d {l.end_date}</td>
                      <td className="py-3 px-3 text-muted-foreground">{l.reason}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                          ✓ {l.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {activeTab === "akun" && (
        <UserManagementModule activeRole={activeRole} userProfile={userProfile} hideHeader={true} />
      )}

      <AddGtkDialog
        isOpen={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAddGtk={handleAddGtk}
      />

      <EditGtkDialog
        selectedGtk={gtkToEdit}
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSaveGtk={handleSaveGtk}
      />

      <DetailGtkDialog
        selectedGtk={selectedGtk}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        gtkDocs={gtkDocs}
      />

      <PrintGtkDialog
        gtkList={gtkList}
        isOpen={isPrintOpen}
        onOpenChange={setIsPrintOpen}
      />

      <CutiIzinDialog
        isOpen={isAddLeaveOpen}
        onOpenChange={setIsAddLeaveOpen}
        onAddLeave={handleAddLeave}
      />
    </div>
  );
}

