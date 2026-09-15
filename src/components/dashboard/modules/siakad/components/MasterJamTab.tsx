import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Search,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Inbox,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MasterJamRow } from "@/services/mysqlServerFns";

interface MasterJamTabProps {
  isKamad?: boolean;
}

const KATEGORI_HARI_OPTIONS = [
  "Reguler (Selasa - Kamis)",
  "Senin / Upacara",
  "Jumat Pendek",
  "Sabtu / Ekstra",
] as const;

const TIPE_OPTIONS = ["KBM", "ISTIRAHAT", "UPACARA/PEMBIASAAN"] as const;

export function MasterJamTab({ isKamad }: MasterJamTabProps) {
  const [jamList, setJamList] = useState<MasterJamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<string>("semua");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);

  // Form Fields
  const [jamKe, setJamKe] = useState("Jam 1");
  const [jamMulai, setJamMulai] = useState("07.40");
  const [jamSelesai, setJamSelesai] = useState("08.20");
  const [kategoriHari, setKategoriHari] = useState<string>("Reguler (Selasa - Kamis)");
  const [tipe, setTipe] = useState<string>("KBM");
  const [status, setStatus] = useState<string>("AKTIF");

  const [saving, setSaving] = useState(false);

  const loadJamList = async () => {
    setLoading(true);
    try {
      const data = await MysqlDataService.getMasterJamList();
      setJamList(data || []);
    } catch (e) {
      console.warn("Gagal memuat master jam pelajaran:", e);
      toast.error("Gagal memuat master jam pelajaran dari MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJamList();
  }, []);

  const openCreateDialog = () => {
    if (isKamad) {
      return toast.info("🏛️ Kepala Madrasah berada dalam Mode Supervisi (Hanya Baca).");
    }
    setIsEditing(false);
    setEditingId(undefined);
    setJamKe(`Jam ${jamList.length + 1}`);
    setJamMulai("07.40");
    setJamSelesai("08.20");
    setKategoriHari("Reguler (Selasa - Kamis)");
    setTipe("KBM");
    setStatus("AKTIF");
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: MasterJamRow) => {
    if (isKamad) {
      return toast.info("🏛️ Kepala Madrasah berada dalam Mode Supervisi (Hanya Baca).");
    }
    setIsEditing(true);
    setEditingId(item.id);
    setJamKe(item.jam_ke);
    setJamMulai(item.jam_mulai);
    setJamSelesai(item.jam_selesai);
    setKategoriHari(item.kategori_hari || "Reguler (Selasa - Kamis)");
    setTipe(item.tipe || "KBM");
    setStatus(item.status || "AKTIF");
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isKamad) {
      return toast.error("🔒 Akses dibatasi: Kepala Madrasah berada dalam mode supervisi.");
    }
    if (!jamKe.trim() || !jamMulai.trim() || !jamSelesai.trim()) {
      return toast.error("Jam Ke, Jam Mulai, dan Jam Selesai wajib diisi!");
    }

    setSaving(true);
    try {
      const payload: MasterJamRow = {
        id: editingId,
        jam_ke: jamKe.trim(),
        jam_mulai: jamMulai.trim(),
        jam_selesai: jamSelesai.trim(),
        kategori_hari: kategoriHari,
        tipe,
        status,
      };

      const ok = await MysqlDataService.saveMasterJam(payload);
      if (ok) {
        toast.success(
          isEditing
            ? `✅ Sesi "${jamKe}" berhasil diperbarui!`
            : `🎉 Sesi "${jamKe}" berhasil ditambahkan ke Master Jam Pelajaran!`
        );
        setIsDialogOpen(false);
        loadJamList();
      } else {
        toast.error("Gagal menyimpan data jam pelajaran ke MySQL.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan jam pelajaran.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MasterJamRow) => {
    if (isKamad) {
      return toast.error("🔒 Akses dibatasi: Kepala Madrasah berada dalam mode supervisi.");
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus "${item.jam_ke} (${item.jam_mulai} - ${item.jam_selesai})"?`)) {
      return;
    }

    try {
      if (!item.id) return;
      const ok = await MysqlDataService.deleteMasterJam(item.id);
      if (ok) {
        toast.success(`🗑️ Sesi "${item.jam_ke}" berhasil dihapus.`);
        loadJamList();
      } else {
        toast.error("Gagal menghapus sesi jam.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus sesi jam.");
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return jamList.filter((j) => {
      const matchesSearch =
        j.jam_ke.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.jam_mulai.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.jam_selesai.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        kategoriFilter === "semua" ||
        (j.kategori_hari && j.kategori_hari.toLowerCase().includes(kategoriFilter.toLowerCase()));

      return matchesSearch && matchesCat;
    });
  }, [jamList, searchQuery, kategoriFilter]);

  // Metrics
  const totalSesi = jamList.length;
  const kbmCount = jamList.filter((j) => (j.tipe || "KBM").toUpperCase() === "KBM").length;
  const upacaraCount = jamList.filter((j) => (j.kategori_hari || "").includes("Senin") || (j.tipe || "").includes("UPACARA")).length;
  const aktifCount = jamList.filter((j) => (j.status || "AKTIF").toUpperCase() === "AKTIF").length;

  // Compute duration helper
  const getDurationMinutes = (mulai: string, selesai: string) => {
    try {
      const [mH, mM] = mulai.replace(".", ":").split(":").map(Number);
      const [sH, sM] = selesai.replace(".", ":").split(":").map(Number);
      if (!isNaN(mH) && !isNaN(mM) && !isNaN(sH) && !isNaN(sM)) {
        const diff = (sH * 60 + sM) - (mH * 60 + mM);
        return diff > 0 ? `${diff} Menit` : "-";
      }
    } catch {}
    return "40 Menit";
  };

  return (
    <div className="space-y-6">
      {/* Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Total Sesi Jam</p>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground">{totalSesi} Sesi</h3>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
            <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Sesi KBM Aktif</p>
            <h3 className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-400">{kbmCount} Sesi</h3>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Sesi Upacara/Senin</p>
            <h3 className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400">{upacaraCount} Sesi</h3>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Status Aktif</p>
            <h3 className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{aktifCount} Sesi</h3>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="p-4 border-b border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Master Jam Pelajaran & Alokasi Sesi KBM
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {!isKamad && (
              <Button
                size="sm"
                onClick={openCreateDialog}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Tambah Sesi Jam
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari jam ke, waktu mulai/selesai..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {["semua", "Reguler", "Senin", "Jumat"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setKategoriFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  kategoriFilter === cat
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat === "semua" ? "Semua Hari" : cat}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2" />
              Memuat data master jam pelajaran dari MySQL...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-bold text-sm text-foreground">Tidak Ada Sesi Jam Ditemukan</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || kategoriFilter !== "semua"
                  ? "Tidak ada sesi jam yang cocok dengan filter pencarian."
                  : "Belum ada sesi jam terdaftar di database MySQL."}
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border">
                <tr>
                  <th className="p-3.5 w-14 text-center">No</th>
                  <th className="p-3.5 w-28">Jam Ke-</th>
                  <th className="p-3.5 w-36">Waktu Mulai</th>
                  <th className="p-3.5 w-36">Waktu Selesai</th>
                  <th className="p-3.5 w-28 text-center">Durasi</th>
                  <th className="p-3.5">Kategori Hari</th>
                  <th className="p-3.5 text-center w-28">Tipe</th>
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

                    <td className="p-3.5 font-bold text-foreground">
                      <Badge variant="outline" className="font-mono text-[11px] font-bold border-border">
                        {item.jam_ke}
                      </Badge>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-600">
                      {item.jam_mulai}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-foreground">
                      {item.jam_selesai}
                    </td>

                    <td className="p-3.5 text-center font-mono text-muted-foreground">
                      {getDurationMinutes(item.jam_mulai, item.jam_selesai)}
                    </td>

                    <td className="p-3.5">
                      <Badge variant="secondary" className="text-[10px] font-medium">
                        {item.kategori_hari || "Reguler"}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          item.tipe === "KBM"
                            ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                            : item.tipe === "ISTIRAHAT"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                            : "bg-purple-500/10 text-purple-600 border-purple-500/30"
                        }`}
                      >
                        {item.tipe || "KBM"}
                      </Badge>
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
                            title="Edit Sesi Jam"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                            onClick={() => handleDelete(item)}
                            title="Hapus Sesi Jam"
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

      {/* Dialog Tambah / Edit Sesi Jam */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-600" />
              {isEditing ? "Edit Sesi Jam Pelajaran" : "Tambah Sesi Jam Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Konfigurasi alokasi waktu sesi jam belajar madrasah.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Label / Jam Ke- *</Label>
              <Input
                placeholder="Contoh: Jam 1, Jam 2, Istirahat Dhuha"
                value={jamKe}
                onChange={(e) => setJamKe(e.target.value)}
                className="text-xs font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Jam Mulai (WIB) *</Label>
                <Input
                  placeholder="07.40"
                  value={jamMulai}
                  onChange={(e) => setJamMulai(e.target.value)}
                  className="font-mono text-xs font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Jam Selesai (WIB) *</Label>
                <Input
                  placeholder="08.20"
                  value={jamSelesai}
                  onChange={(e) => setJamSelesai(e.target.value)}
                  className="font-mono text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Kategori Hari</Label>
                <select
                  value={kategoriHari}
                  onChange={(e) => setKategoriHari(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs cursor-pointer font-medium"
                >
                  {KATEGORI_HARI_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Tipe Sesi</Label>
                <select
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs cursor-pointer font-medium"
                >
                  {TIPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs cursor-pointer font-bold"
              >
                <option value="AKTIF">AKTIF</option>
                <option value="NONAKTIF">NONAKTIF</option>
              </select>
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
                {saving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambahkan Sesi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
