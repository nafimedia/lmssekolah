import { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Clock,
  ShieldCheck,
  UserCheck,
  Layers,
  Inbox,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { SubjectRow } from "@/services/mysqlServerFns";

interface MasterMapelTabProps {
  isKamad?: boolean;
  teachersList?: string[];
}

const CATEGORY_OPTIONS = [
  "Keagamaan",
  "Umum",
  "Muatan Lokal",
  "Pengembangan Diri",
] as const;

export function MasterMapelTab({ isKamad, teachersList = [] }: MasterMapelTabProps) {
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("semua");

  // Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);

  // Form Fields
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Umum");
  const [teacherName, setTeacherName] = useState("");
  const [jp, setJp] = useState<number>(2);
  const [kkm, setKkm] = useState<number>(75);
  const [status, setStatus] = useState<string>("AKTIF");
  const [icon, setIcon] = useState("📖");
  const [gradeLevel, setGradeLevel] = useState("Semua Tingkat");

  const [saving, setSaving] = useState(false);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await MysqlDataService.getSubjects();
      setSubjects(data || []);
    } catch (e) {
      console.warn("Gagal memuat mata pelajaran:", e);
      toast.error("Gagal memuat data master mata pelajaran dari MySQL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const openCreateDialog = () => {
    if (isKamad) {
      return toast.info("🏛️ Kepala Madrasah berada dalam Mode Supervisi (Hanya Baca).");
    }
    setIsEditing(false);
    setEditingId(undefined);
    setCode("");
    setName("");
    setCategory("Umum");
    setTeacherName(teachersList[0] || "");
    setJp(2);
    setKkm(75);
    setStatus("AKTIF");
    setIcon("📖");
    setGradeLevel("Semua Tingkat");
    setIsDialogOpen(true);
  };

  const openEditDialog = (sub: SubjectRow) => {
    if (isKamad) {
      return toast.info("🏛️ Kepala Madrasah berada dalam Mode Supervisi (Hanya Baca).");
    }
    setIsEditing(true);
    setEditingId(sub.id);
    setCode(sub.code);
    setName(sub.name);
    setCategory(sub.category || "Umum");
    setTeacherName(sub.teacher_name || "");
    setJp(Number(sub.jp) || 2);
    setKkm(Number(sub.kkm) || 75);
    setStatus(sub.status || "AKTIF");
    setIcon(sub.icon || "📖");
    setGradeLevel(sub.grade_level || "Semua Tingkat");
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isKamad) {
      return toast.error("🔒 Akses dibatasi: Kepala Madrasah berada dalam mode supervisi.");
    }
    if (!code.trim() || !name.trim()) {
      return toast.error("Kode dan Nama Mata Pelajaran wajib diisi!");
    }

    setSaving(true);
    try {
      const payload: SubjectRow = {
        id: editingId,
        code: code.trim().toUpperCase(),
        name: name.trim(),
        category,
        teacher_name: teacherName || "-",
        jp: Number(jp) || 2,
        kkm: Number(kkm) || 75,
        status,
        icon: icon || "📖",
        grade_level: gradeLevel,
      };

      const ok = await MysqlDataService.saveSubject(payload);
      if (ok) {
        toast.success(
          isEditing
            ? `✅ Mata Pelajaran "${name}" berhasil diperbarui!`
            : `🎉 Mata Pelajaran "${name}" berhasil ditambahkan ke Data Pokok!`
        );
        setIsDialogOpen(false);
        loadSubjects();
      } else {
        toast.error("Gagal menyimpan data mata pelajaran ke MySQL.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menyimpan mata pelajaran.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sub: SubjectRow) => {
    if (isKamad) {
      return toast.error("🔒 Akses dibatasi: Kepala Madrasah berada dalam mode supervisi.");
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${sub.name}" (${sub.code})?`)) {
      return;
    }

    try {
      const ok = await MysqlDataService.deleteSubject(sub.code);
      if (ok) {
        toast.success(`🗑️ Mata Pelajaran "${sub.name}" berhasil dihapus.`);
        loadSubjects();
      } else {
        toast.error("Gagal menghapus mata pelajaran.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat menghapus mata pelajaran.");
    }
  };

  // Filtered List
  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.teacher_name && s.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        categoryFilter === "semua" ||
        (s.category && s.category.toLowerCase() === categoryFilter.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [subjects, searchQuery, categoryFilter]);

  // Metric summaries
  const totalMapel = subjects.length;
  const mapelKeagamaan = subjects.filter((s) => (s.category || "").toLowerCase() === "keagamaan").length;
  const mapelUmum = subjects.filter((s) => (s.category || "").toLowerCase() === "umum").length;
  const totalJp = subjects.reduce((acc, curr) => acc + (Number(curr.jp) || 0), 0);

  const getCategoryBadgeClass = (cat?: string) => {
    const c = (cat || "").toLowerCase();
    if (c === "keagamaan") {
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30";
    }
    if (c === "umum") {
      return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30";
    }
    if (c === "muatan lokal") {
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30";
    }
    return "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Total Mapel</p>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground">{totalMapel} Mapel</h3>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Rumpun PAI</p>
            <h3 className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{mapelKeagamaan} Mapel</h3>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 shrink-0">
            <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Rumpun Umum</p>
            <h3 className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-400">{mapelUmum} Mapel</h3>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 shrink-0">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Alokasi Mingguan</p>
            <h3 className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400">{totalJp} JP / Mg</h3>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="p-4 border-b border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Master Mata Pelajaran MTsN 2 Cilacap
            </CardTitle>
            <CardDescription className="text-xs">
              Daftar resmi mata pelajaran kurikulum madrasah, alokasi beban jam (JP), KKM, dan guru pengampu utama.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {!isKamad && (
              <Button
                size="sm"
                onClick={openCreateDialog}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs shrink-0"
              >
                <Plus className="h-4 w-4" /> Tambah Mata Pelajaran
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-sm">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cari kode, nama mapel, atau guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-8 bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {["semua", "Keagamaan", "Umum", "Muatan Lokal", "Pengembangan Diri"].map((cat) => (
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
                {cat === "semua" ? "Semua Rumpun" : cat}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-2" />
              Memuat data master mata pelajaran dari MySQL...
            </div>
          ) : filteredSubjects.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-bold text-sm text-foreground">Tidak Ada Mata Pelajaran Ditemukan</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {searchQuery || categoryFilter !== "semua"
                  ? "Tidak ada mata pelajaran yang cocok dengan filter pencarian."
                  : "Belum ada mata pelajaran terdaftar di database MySQL."}
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border">
                <tr>
                  <th className="p-3.5 w-14 text-center">No</th>
                  <th className="p-3.5 w-24">Kode</th>
                  <th className="p-3.5">Nama Mata Pelajaran</th>
                  <th className="p-3.5">Rumpun Kategori</th>
                  <th className="p-3.5 text-center">Beban JP</th>
                  <th className="p-3.5 text-center">KKM</th>
                  <th className="p-3.5">Guru Pengampu / Koordinator</th>
                  <th className="p-3.5 text-center">Status</th>
                  {!isKamad && <th className="p-3.5 text-right w-24">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSubjects.map((sub, idx) => (
                  <tr key={sub.id || sub.code} className="hover:bg-muted/20 transition">
                    <td className="p-3.5 text-center font-mono text-muted-foreground font-bold">
                      {idx + 1}
                    </td>

                    <td className="p-3.5">
                      <Badge variant="outline" className="font-mono text-[11px] font-bold border-border">
                        {sub.code}
                      </Badge>
                    </td>

                    <td className="p-3.5 font-bold text-foreground text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{sub.icon || "📖"}</span>
                        <span>{sub.name}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <Badge variant="outline" className={`text-[10px] font-semibold ${getCategoryBadgeClass(sub.category)}`}>
                        {sub.category || "Umum"}
                      </Badge>
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-foreground">
                      {sub.jp || 2} JP
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-emerald-600">
                      {sub.kkm || 75}
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{sub.teacher_name || "Belum Ditentukan"}</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          (sub.status || "AKTIF").toUpperCase() === "AKTIF"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {(sub.status || "AKTIF").toUpperCase()}
                      </Badge>
                    </td>

                    {!isKamad && (
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => openEditDialog(sub)}
                            title="Edit Mata Pelajaran"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                            onClick={() => handleDelete(sub)}
                            title="Hapus Mata Pelajaran"
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

      {/* Dialog Tambah / Edit Mata Pelajaran */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              {isEditing ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Konfigurasi data pokok mata pelajaran kurikulum MTsN 2 Cilacap.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-3.5 py-2 text-xs">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Kode Mapel *</Label>
                <Input
                  placeholder="UMM-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isEditing}
                  className="font-mono text-xs font-bold"
                  required
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-[11px] font-bold">Nama Mata Pelajaran *</Label>
                <Input
                  placeholder="Nama resmi mapel..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Rumpun Kategori</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs cursor-pointer font-medium"
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Ikon Emoji</Label>
                <Input
                  placeholder="📖 / 💻 / 🕌"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="text-xs text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Beban JP (Jam/Minggu)</Label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={jp}
                  onChange={(e) => setJp(Number(e.target.value))}
                  className="text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Standar KKM / KKTP</Label>
                <Input
                  type="number"
                  min="50"
                  max="100"
                  value={kkm}
                  onChange={(e) => setKkm(Number(e.target.value))}
                  className="text-xs font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-bold">Guru Pengampu Utama / Koordinator</Label>
              {teachersList.length > 0 ? (
                <select
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-border bg-background text-xs cursor-pointer"
                >
                  <option value="-">-- Pilih Guru Pengampu --</option>
                  {teachersList.map((t, tIdx) => (
                    <option key={tIdx} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="Nama guru pengampu..."
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="text-xs"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
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

              <div className="space-y-1">
                <Label className="text-[11px] font-bold">Sasaran Tingkat</Label>
                <Input
                  placeholder="Semua Tingkat"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="text-xs"
                />
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
                {saving ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Tambahkan Mapel"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
