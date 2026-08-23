import { useState, useMemo, useEffect } from "react";
import { MysqlDataService, GtkLeaveRow, GtkDocumentRow } from "@/services/mysqlDataService";
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
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { AddGtkDialog } from "./components/AddGtkDialog";
import { EditGtkDialog } from "./components/EditGtkDialog";
import { DetailGtkDialog } from "./components/DetailGtkDialog";
import { PrintGtkDialog } from "./components/PrintGtkDialog";
import { CutiIzinDialog } from "./components/CutiIzinDialog";

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
  phone: string;
  mapel?: string;
  jabatan?: string;
}

const INITIAL_GTK_LIST: GtkItem[] = [
  {
    id: "gtk-1",
    nip: "199204042025051002",
    npk: "98204042025",
    name: "AH. SYARIF HIDAYAH, S.Pd.I",
    golongan: "Penata (III/c)",
    statusKepegawaian: "PNS",
    mapelUtama: "Al Qur'an Hadis",
    totalJp: 24,
    tugasTambahan: "Guru Pengampu Al Qur'an Hadis",
    isSertifikasi: true,
    email: "199204042025051002@guru.mtsn2cilacap.sch.id",
    phone: "081234567801",
  },
  {
    id: "gtk-2",
    nip: "197205122005011003",
    npk: "98205122005",
    name: "WAKHIBUN, S.P",
    golongan: "Pembina (IV/a)",
    statusKepegawaian: "PNS",
    mapelUtama: "Akidah Akhlak",
    totalJp: 24,
    tugasTambahan: "Guru Pengampu Akidah Akhlak",
    isSertifikasi: true,
    email: "197205122005011003@guru.mtsn2cilacap.sch.id",
    phone: "081234567802",
  },
  {
    id: "gtk-3",
    nip: "197807072007102001",
    npk: "98207072007",
    name: "CARYATI,",
    golongan: "Pembina (IV/a)",
    statusKepegawaian: "PNS",
    mapelUtama: "Fikih",
    totalJp: 24,
    tugasTambahan: "Guru Pengampu Fikih",
    isSertifikasi: true,
    email: "197807072007102001@guru.mtsn2cilacap.sch.id",
    phone: "081234567803",
  },
  {
    id: "gtk-4",
    nip: "197311232005011004",
    npk: "98211232005",
    name: "H. DASIRUN, S.Ag., M.Pd.I",
    golongan: "Pembina Tk. I (IV/b)",
    statusKepegawaian: "PNS",
    mapelUtama: "Sejarah Kebudayaan Islam",
    totalJp: 24,
    tugasTambahan: "Guru Pengampu SKI",
    isSertifikasi: true,
    email: "197311232005011004@guru.mtsn2cilacap.sch.id",
    phone: "081234567804",
  },
  {
    id: "gtk-5",
    nip: "199405142019032021",
    npk: "98205142019",
    name: "ENDAH SUPRIHATIN, S.Pd",
    golongan: "Penata (III/c)",
    statusKepegawaian: "PNS",
    mapelUtama: "Bahasa Arab",
    totalJp: 26,
    tugasTambahan: "Wali Kelas 7B & Guru Bahasa Arab",
    isSertifikasi: true,
    email: "199405142019032021@guru.mtsn2cilacap.sch.id",
    phone: "081234567805",
  },
];

export function SdmGtkModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const [activeTab, setActiveTab] = useState<"daftar" | "cuti">("daftar");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("semua");

  const [gtkList, setGtkList] = useState<GtkItem[]>(INITIAL_GTK_LIST);
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

  useEffect(() => {
    MysqlDataService.getUsers()
      .then((users) => {
        if (users && users.length > 0) {
          const teachers = users.filter((u: any) => u.role !== "siswa");
          if (teachers.length > 0) {
            const formatted = teachers.map((u: any) => ({
              id: String(u.id || u.email),
              nip: u.nis_nip || "-",
              npk: u.nis_nip ? u.nis_nip.substring(0, 11) : "-",
              name: u.full_name,
              golongan: "Penata (III/c)",
              statusKepegawaian: (u.role === "admin" ? "PNS" : "PNS") as any,
              mapelUtama: u.subject_specialty || "Umum",
              totalJp: 24,
              tugasTambahan: "Guru Pengampu",
              isSertifikasi: true,
              email: u.email,
              phone: u.phone || "081234567890",
            }));
            setGtkList(formatted);
          }
        }
      })
      .catch(() => {});

    MysqlDataService.getGtkLeaves()
      .then((leaves) => setLeavesList(leaves || []))
      .catch(() => {});
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

  const handleSaveGtk = (updated: GtkItem) => {
    setGtkList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteGtk = (item: GtkItem) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data pegawai GTK ${item.name}?`)) {
      setGtkList((prev) => prev.filter((g) => g.id !== item.id));
      toast.success(`Data pegawai GTK ${item.name} berhasil dihapus!`);
    }
  };

  const handleAddGtk = (newGtk: GtkItem) => {
    setGtkList((prev) => [newGtk, ...prev]);
    toast.success(`Data pegawai GTK ${newGtk.name} berhasil ditambahkan!`);
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

  const filteredGtk = useMemo(() => {
    return gtkList.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.nip.toLowerCase().includes(search.toLowerCase()) ||
        item.mapelUtama.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "semua" || item.statusKepegawaian === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [gtkList, search, filterStatus]);

  const totalPns = gtkList.filter((g) => g.statusKepegawaian === "PNS").length;
  const totalPppk = gtkList.filter((g) => g.statusKepegawaian === "PPPK").length;
  const totalSertifikasi = gtkList.filter((g) => g.isSertifikasi).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SDM & Data Kepegawaian GTK</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Database kepegawaian guru, sertifikasi, dan administrasi GTK.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold" onClick={() => setIsPrintOpen(true)}>
            <Printer className="h-4 w-4" /> Cetak Bio GTK PDF
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" /> Tambah Pegawai GTK
          </Button>
        </div>
      </div>

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
              <div className="text-xs text-muted-foreground font-medium">PNS & PPPK</div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalPns + totalPppk} Orang</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0 font-bold">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Tersertifikasi TPG</div>
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{totalSertifikasi} Guru</div>
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
          <div className="flex items-center gap-2">
            {[
              { id: "daftar", label: "Daftar Pegawai GTK", icon: Users },
              { id: "cuti", label: "Layanan Cuti & Izin", icon: FileSpreadsheet },
            ].map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={activeTab === t.id ? "default" : "outline"}
                className="text-xs font-bold gap-1.5"
                onClick={() => setActiveTab(t.id as any)}
              >
                <t.icon className="h-3.5 w-3.5" />
                <span>{t.label}</span>
              </Button>
            ))}
          </div>

          {activeTab === "daftar" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nama, NIP, mapel..."
                  className="pl-9 h-9 text-xs"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="h-9 rounded-md border border-border bg-background px-3 text-xs font-bold"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="semua">Semua Status</option>
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="GTT / Honor">GTT / Honor</option>
              </select>
            </div>
          )}

          {activeTab === "cuti" && (
            <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsAddLeaveOpen(true)}>
              + Pengajuan Cuti Baru
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {activeTab === "daftar" && (
            <table className="w-full text-xs">
              <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Nama Pegawai & NIP</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Golongan</th>
                  <th className="py-3 px-3">Mapel Utama</th>
                  <th className="py-3 px-3 text-center">Beban JP</th>
                  <th className="py-3 px-3 text-center">Sertifikasi</th>
                  <th className="py-3 px-4 text-center">Aksi & Kontrol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredGtk.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-semibold">
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">NIP: {item.nip}</div>
                    </td>
                    <td className="py-3 px-3">
                      <Badge className={item.statusKepegawaian === "PNS" ? "bg-emerald-600 text-white" : item.statusKepegawaian === "PPPK" ? "bg-purple-600 text-white" : "bg-amber-600 text-white"}>
                        {item.statusKepegawaian}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 font-semibold">{item.golongan}</td>
                    <td className="py-3 px-3 font-bold">{item.mapelUtama}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-primary">{item.totalJp} JP</td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="outline" className={item.isSertifikasi ? "border-emerald-500 text-emerald-600 bg-emerald-500/10" : "border-muted text-muted-foreground"}>
                        {item.isSertifikasi ? "✓ TPG" : "-"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-bold gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30"
                          onClick={() => handleOpenEdit(item)}
                          title="Edit Data Pegawai GTK"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-bold gap-1"
                          onClick={() => handleOpenDetail(item)}
                          title="Lihat Detail Profil & Berkas SK"
                        >
                          <Eye className="h-3.5 w-3.5" /> Detail
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs font-bold gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border border-rose-500/20"
                          onClick={() => handleDeleteGtk(item)}
                          title="Hapus Data Pegawai GTK"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === "cuti" && (
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
                {leavesList.map((l) => (
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
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

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

