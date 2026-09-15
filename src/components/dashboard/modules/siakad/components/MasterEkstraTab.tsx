import { useState, useEffect, useMemo } from "react";
import {
  Award,
  Search,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Calendar,
  MapPin,
  Inbox,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MasterEkstraRow } from "@/services/mysqlServerFns";

interface MasterEkstraTabProps {
  isKamad?: boolean;
  teachersList?: string[];
}

const KATEGORI_EKSTRA_OPTIONS = [
  "Wajib",
  "Pilihan",
  "Keagamaan",
  "Olahraga",
  "Seni & Budaya",
  "Sains & Teknologi",
] as const;

export function MasterEkstraTab({ isKamad, teachersList = [] }: MasterEkstraTabProps) {
  const [ekstraList, setEkstraList] = useState<MasterEkstraRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("semua");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);

  // Form Fields
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [kategori, setKategori] = useState<string>("Pilihan");
  const [pembina, setPembina] = useState("");
  const [hariKegiatan, setHariKegiatan] = useState("Jumat");
  const [tempat, setTempat] = useState("Madrasah");
  const [status, setStatus] = useState<string>("AKTIF");

  const [saving, setSaving] = useState(false);

  const loadEkstraList = async () => {
    setLoading(true);
    try {
      const data = await MysqlDataService.getMasterEkstraList();
      setEkstraList(data || []);
    } catch (e) {
      console.warn("Gagal memuat master ekstrakurikuler:", e);
      toast.error("Gagal memuat master ekstrakurikuler dari MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEkstraList();
  }, []);

  const openCreateDialog = () => {
    if (isKamad) {
      return toast.info("🏛️ Kepala Madrasah berada dalam Mode Supervisi (Hanya Baca).");
    }
    setIsEditing(false);
    setEditingId(undefined);
    setKode(`EKS-0${ekstraList.length + 1}`);
    setNama("");
    setKategori("Pilihan");
    setPembina(teachersList[0] || "");
    setHariKegiatan("Jumat");
    setTempat("Lapangan / Aula Madrasah");
    setStatus("AKTIF");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: MasterEkstraRow) => {
    if (isKamad) {
      return toast.info("🏛️ Kepala Madrasah berada dalam Mode Supervisi (Hanya Baca).");
    }
    setIsEditing(true);
    setEditingId(item.id);
    setKode(item.kode);
    setNama(item.nama);
    setKategori(item.kategori || "Pilihan");
    setPembina(item.pembina || "");
    setHariKegiatan(item.hari_kegiatan || "Jumat");
    setTempat(item.tempat || "Madrasah");
    setStatus(item.status || "AKTIF");
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isKamad) {
      return toast.error("🔒 Akses dibatasi: Kepala Madrasah berada dalam mode supervisi.");
    }
    if (!kode.trim() || !nama.trim()) {
      return toast.error("Kode dan Nama Ekstrakurikuler wajib diisi!");
    }

    setSaving(true);
    try {
      const payload: MasterEkstraRow = {
        id: editingId,
        kode: kode.trim().toUpperCase(),
        nama: nama.trim(),
        kategori,
        pembina: pembina.trim(),
        hari_kegiatan: hariKegiatan.trim(),
        tempat: tempat.trim(),
        status,
      };

      const ok = await MysqlDataService.saveMasterEkstra(payload);
      if (ok) {
        toast.success(
          isEditing
            ? `✅ Ekstrakurikuler "${nama}" berhasil diperbarui!`
            : `🎉 Ekstrakurikuler "${nama}" berhasil ditambahkan ke Master Data!`
        );
        setIsDialogOpen(false);
        loadEkstraList();
      } else {
        toast.error("Gagal menyimpan data ekstrakurikuler ke MySQL.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan ekstrakurikuler.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MasterEkstraRow) => {
    if (isKamad) {
      return toast.error("🔒 Akses dibatasi: Kepala Madrasah berada dalam mode supervisi.");
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus kegiatan "${item.nama}" (${item.kode})?`)) {
      return;
    }

    try {
      if (!item.id) return;
      const ok = await MysqlDataService.deleteMasterEkstra(item.id);
      if (ok) {
        toast.success(`🗑️ Kegiatan "${item.nama}" berhasil dihapus.`);
        loadEkstraList();
      } else {
        toast.error("Gagal menghapus kegiatan ekstrakurikuler.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus ekstrakurikuler.");
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return ekstraList.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.pembina && item.pembina.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        categoryFilter === "semua" ||
        (item.kategori && item.kategori.toLowerCase() === categoryFilter.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [ekstraList, searchQuery, categoryFilter]);

  // Metrics
  const totalEkstra = ekstraList.length;
  const wajibCount = ekstraList.filter((e) => (e.kategori || "").toLowerCase() === "wajib").length;
  const pilihanCount = ekstraList.filter((e) => (e.kategori || "").toLowerCase() !== "wajib").length;
  const aktifCount = ekstraList.filter((e) => (e.status || "AKTIF").toUpperCase() === "AKTIF").length;

  const getCategoryBadgeClass = (cat?: string) => {
    const c = (cat || "").toLowerCase();
    if (c === "wajib") {
      return "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30";
    }
    if (c === "keagamaan") {
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    }
    if (c === "olahraga") {
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    }
    if (c === "sains & teknologi") {
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";
    }
    return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Total Ekstrakurikuler</p>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground">{totalEkstra} Kegiatan</h3>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600 shrink-0">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Ekskul Wajib</p>
            <h3 className="text-base sm:text-lg font-extrabold text-rose-600 dark:text-rose-400">{wajibCount} Kegiatan</h3>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Ekskul Pilihan / Minat</p>
            <h3 className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-400">{pilihanCount} Kegiatan</h3>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Status Aktif</p>
            <h3 className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{aktifCount} Kegiatan</h3>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="p-4 border-b border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Master Kegiatan Ekstrakurikuler MTsN 2 Cilacap
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {!isKamad && (
              <Button
                size="sm"
                onClick={openCreateDialog}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Tambah Ekstrakurikuler
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari kegiatan, kode, atau pembina..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {["semua", "Wajib", "Pilihan", "Keagamaan", "Olahraga", "Seni & Budaya", "Sains & Teknologi"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  categoryFilter === cat
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "semua" ? "Semua Kategori" : cat}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2" />
              Memuat data master ekstrakurikuler dari MySQL...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-bold text-sm text-foreground">Belum Ada Kegiatan Ekstrakurikuler</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || categoryFilter !== "semua"
                  ? "Tidak ada kegiatan yang cocok dengan filter pencarian."
                  : "Belum ada kegiatan ekstrakurikuler yang didaftarkan. Silakan klik tombol Tambah Ekstrakurikuler untuk mendaftarkan kegiatan baru."}
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border">
                <tr>
                  <th className="p-3.5 w-14 text-center">No</th>
                  <th className="p-3.5 w-28">Kode</th>
                  <th className="p-3.5">Nama Ekstrakurikuler</th>
                  <th className="p-3.5 w-40">Kategori</th>
                  <th className="p-3.5">Guru Pembina</th>
                  <th className="p-3.5 w-32">Jadwal & Tempat</th>
                  <th className="p-3.5 text-center w-28">Status</th>
                  {!isKamad && <th className="p-3.5 text-right w-24">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredList.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-muted/20 transition">
                    <td className="p-3.5 text-center font-mono text-muted-foreground font-bold">
                      {idx + 1}
                    </td>

                    <td className="p-3.5">
                      <Badge variant="outline" className="font-mono text-[11px] font-bold border-border">
                        {item.kode}
                      </Badge>
                    </td>

                    <td className="p-3.5 font-bold text-foreground text-xs sm:text-sm">
                      {item.nama}
                    </td>

                    <td className="p-3.5">
                      <Badge variant="outline" className={`text-[10px] font-semibold ${getCategoryBadgeClass(item.kategori)}`}>
                        {item.kategori || "Pilihan"}
                      </Badge>
                    </td>

                    <td className="p-3.5 font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{item.pembina || "Belum Ditentukan"}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-muted-foreground">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>{item.hari_kegiatan || "Jumat"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>{item.tempat || "Madrasah"}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          (item.status || "AKTIF").toUpperCase() === "AKTIF"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {(item.status || "AKTIF").toUpperCase()}
                      </Badge>
                    </td>

                    {!isKamad && (
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => openEditDialog(item)}
                            title="Edit Kegiatan"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                            onClick={() => handleDelete(item)}
                            title="Hapus Kegiatan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Tambah / Edit Ekstrakurikuler */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              {isEditing ? "Edit Ekstrakurikuler" : "Tambah Ekstrakurikuler Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Konfigurasi data pokok kegiatan pengembangan diri & minat bakat siswa.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-2 text-xs">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Kode Ekskul *</Label>
                <Input
                  placeholder="EKS-01"
                  value={kode}
                  onChange={(e) => setKode(e.target.value.toUpperCase())}
                  disabled={isEditing}
                  className="font-mono text-xs font-bold"
                  required
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[11px] font-bold">Nama Ekstrakurikuler *</Label>
                <Input
                  placeholder="Contoh: Pramuka, PMR, Futsal..."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="text-xs font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Kategori</Label>
                <select
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs cursor-pointer font-medium"
                >
                  {KATEGORI_EKSTRA_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Hari Latihan</Label>
                <Input
                  placeholder="Jumat / Sabtu"
                  value={hariKegiatan}
                  onChange={(e) => setHariKegiatan(e.target.value)}
                  className="text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Guru Pembina</Label>
              {teachersList.length > 0 ? (
                <select
                  value={pembina}
                  onChange={(e) => setPembina(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs cursor-pointer"
                >
                  <option value="">-- Pilih Guru Pembina --</option>
                  {teachersList.map((t, idx) => (
                    <option key={idx} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="Nama guru pembina..."
                  value={pembina}
                  onChange={(e) => setPembina(e.target.value)}
                  className="text-xs"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Lokasi / Tempat</Label>
                <Input
                  placeholder="Lapangan / Aula..."
                  value={tempat}
                  onChange={(e) => setTempat(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Status Keaktifan</Label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs cursor-pointer font-bold"
                >
                  <option value="AKTIF">AKTIF</option>
                  <option value="NONAKTIF">NONAKTIF</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-border flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsDialogOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                {saving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambahkan Ekskul"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
