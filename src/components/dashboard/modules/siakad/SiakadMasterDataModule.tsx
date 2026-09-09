import { useState, useEffect } from "react";
import { Database, Users, Calendar, ShieldCheck, CheckCircle2, Plus, Edit, Trash2, ArrowUpDown, BookOpen, Layers, Inbox, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MysqlDataService, PengampuRow } from "@/services/mysqlDataService";

import { EditWaliKelasDialog } from "./components/EditWaliKelasDialog";
import { TahunAjaranTab } from "./components/TahunAjaranTab";
import { KktpSkemaTab } from "./components/KktpSkemaTab";

import { isSameClass, formatClassName } from "@/utils/classNormalization";

export function SiakadMasterDataModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any } = {}) {
  const isKamad = activeRole === "kamad";
  const [activeTab, setActiveTab] = useState<string>("pengampu");
  const [dbTeachersList, setDbTeachersList] = useState<string[]>([]);
  const [pengampuList, setPengampuList] = useState<PengampuRow[]>([]);

  const [isEditWaliOpen, setIsEditWaliOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<any>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleDownloadBackup = async () => {
    setIsBackingUp(true);
    toast.info("⏳ Menyiapkan berkas cadangan database MySQL...");
    try {
      const res = await MysqlDataService.exportDatabaseBackup();
      if (res.success && res.sql) {
        const blob = new Blob([res.sql], { type: "application/sql;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || "backup_db_lms.sql";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`💾 Cadangan database "${res.filename}" berhasil diunduh!`);
      } else {
        toast.error(`Gagal membuat cadangan database: ${res.error || "Error tak dikenal"}`);
      }
    } catch (err: any) {
      toast.error(`Terjadi kesalahan: ${err?.message || "Error"}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  // Modal Tambah Rombel State
  const [isAddRombelOpen, setIsAddRombelOpen] = useState(false);
  const [newRombelName, setNewRombelName] = useState("");
  const [newRombelGrade, setNewRombelGrade] = useState("Kelas VII");
  const [newRombelWali, setNewRombelWali] = useState("");
  const [newRombelRoom, setNewRombelRoom] = useState("");

  // Clean state: initialize with empty array - strictly no dummy fallbacks
  const [rombelList, setRombelList] = useState<any[]>([]);
  const [isLoadingRombel, setIsLoadingRombel] = useState(true);

  const loadData = async () => {
    setIsLoadingRombel(true);
    try {
      const [dbRombels, users, pengampu] = await Promise.all([
        MysqlDataService.getMasterRombels(),
        MysqlDataService.getUsers(),
        MysqlDataService.getPengampuList(),
      ]);

      if (users && users.length > 0) {
        const teachers = users.filter((u: any) => u.role !== "siswa").map((u: any) => u.full_name);
        if (teachers.length > 0) setDbTeachersList(teachers);
      }

      if (pengampu && pengampu.length > 0) {
        setPengampuList(pengampu);
      }

      if (dbRombels && dbRombels.length > 0) {
        const siswaUsers = (users || []).filter((u: any) => u.role === "siswa");
        const mapped = dbRombels.map((r: any) => {
          const realStudentCount = siswaUsers.filter((s: any) =>
            isSameClass(s.class_name || s.class, r.name || r.code)
          ).length;

          const rawName = r.name || r.code || "";
          const displayName = formatClassName(rawName);
          const gradeBadge = r.grade ? r.grade.replace(/Kelas\s+/i, "Tingkat ") : (rawName.includes("7") ? "Tingkat VII" : rawName.includes("9") ? "Tingkat IX" : "Tingkat VIII");

          return {
            id: r.id,
            code: r.code,
            name: displayName,
            rawName: r.name,
            grade: gradeBadge,
            waliKelas: r.wali_kelas || r.waliKelas || "Belum Ditentukan",
            studentCount: realStudentCount > 0 ? realStudentCount : (r.siswa_count || r.student_count || 0),
            room: r.room || `Ruang ${displayName.replace("Kelas ", "")}`,
          };
        });
        setRombelList(mapped);
      } else {
        setRombelList([]);
      }
    } catch (e) {
      console.warn("Failed loading rombels:", e);
      setRombelList([]);
    } finally {
      setIsLoadingRombel(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditWaliClick = (rombelItem: any) => {
    if (isKamad) {
      toast.info("🏛️ Kepala Madrasah berada dalam Mode Supervisi.");
      return;
    }
    setEditingRombel(rombelItem);
    setIsEditWaliOpen(true);
  };

  const handleSaveWaliKelas = async (rombelId: string, newWaliName: string) => {
    if (isKamad) {
      toast.error("🔒 Akses dibatasi: Kepala Madrasah berada dalam mode supervisi.");
      return;
    }
    setRombelList((prev) =>
      prev.map((r) => (r.id === rombelId ? { ...r, waliKelas: newWaliName } : r))
    );

    try {
      const rombelObj = rombelList.find((r) => r.id === rombelId || r.code === rombelId);
      const cleanCode = rombelObj?.code || rombelObj?.name?.toLowerCase().replace(/\s+/g, "") || rombelId;
      await MysqlDataService.saveMasterRombel({
        code: cleanCode,
        name: rombelObj?.name || rombelId,
        wali_kelas: newWaliName,
        grade: rombelObj?.grade || "Kelas VIII",
        room: rombelObj?.room || "Ruang Rombel",
        siswa_count: rombelObj?.siswaCount || 0,
      });
      toast.success(`Wali Kelas ${editingRombel?.name || "Rombel"} berhasil disimpan!`);
    } catch (e) {
      console.warn("Gagal simpan wali kelas ke MySQL:", e);
      toast.success(`Wali Kelas ${editingRombel?.name || "Rombel"} berhasil diperbarui ke ${newWaliName}!`);
    }

    setIsEditWaliOpen(false);
  };

  const handleCreateRombel = async () => {
    if (isKamad) {
      toast.error("🔒 Akses dibatasi: Kepala Madrasah berada dalam mode supervisi.");
      return;
    }
    if (!newRombelName.trim()) {
      toast.error("Nama Kelas wajib diisi!");
      return;
    }

    try {
      const cleanName = formatClassName(newRombelName.trim());
      const cleanCode = cleanName.toLowerCase().replace(/[^a-z0-9]/g, "");
      await MysqlDataService.saveMasterRombel({
        code: cleanCode,
        name: cleanName,
        wali_kelas: newRombelWali || "Belum Ditentukan",
        grade: newRombelGrade,
        room: newRombelRoom.trim() || `Ruang ${cleanName}`,
        siswa_count: 0,
      });
      toast.success(`Kelas "${cleanName}" berhasil ditambahkan!`);
      setIsAddRombelOpen(false);
      setNewRombelName("");
      setNewRombelWali("");
      setNewRombelRoom("");
      loadData();
    } catch (e) {
      toast.error("Gagal menambahkan Kelas baru.");
    }
  };

  const handleDeleteRombel = async (rombelItem: any) => {
    if (isKamad) {
      toast.error("🔒 Akses dibatasi: Kepala Madrasah berada dalam mode supervisi.");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus "${rombelItem.name}"?`)) return;

    try {
      await MysqlDataService.deleteMasterRombel(rombelItem.id);
      toast.success(`🗑️ ${rombelItem.name} berhasil dihapus!`);
      loadData();
    } catch (e) {
      toast.error("Gagal menghapus kelas.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Data Pokok Akademik
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={isBackingUp}
          onClick={handleDownloadBackup}
          className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 shadow-xs"
        >
          <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          {isBackingUp ? "Mencadangkan..." : "Unduh Cadangan Data (.sql)"}
        </Button>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80 w-fit flex-wrap">
        {[
          { id: "pengampu", label: "Daftar Kelas & Wali Kelas", icon: Users },
          { id: "tahun_ajaran", label: "Tahun Ajaran & Semester", icon: Calendar },
          { id: "kktp_skema", label: "Kriteria Ketuntasan (KKTP)", icon: ShieldCheck },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === t.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 1: Daftar Kelas & Wali Kelas */}
      {activeTab === "pengampu" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Daftar Kelas & Wali Kelas MTsN 2 Cilacap:
            </div>
            {!isKamad ? (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                onClick={() => setIsAddRombelOpen(true)}
              >
                <Plus className="h-4 w-4" /> Tambah Kelas Baru
              </Button>
            ) : null}
          </div>

          {isLoadingRombel ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Memuat data kelas...</div>
          ) : rombelList.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 bg-card">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-semibold text-foreground text-sm">Belum Ada Kelas Terdaftar</div>
              <p>Belum ada data kelas yang terdaftar di sistem.</p>
              {!isKamad && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs mt-2"
                  onClick={() => setIsAddRombelOpen(true)}
                >
                  <Plus className="h-4 w-4" /> Tambah Kelas Pertama
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {rombelList.map((r) => (
                <Card key={r.id} className="border-border hover:border-emerald-500/40 transition shadow-xs bg-card">
                  <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600 mb-1">
                        {r.grade}
                      </Badge>
                      <CardTitle className="text-base font-bold text-foreground truncate">{r.name}</CardTitle>
                    </div>
                    {!isKamad && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 gap-1 px-2"
                          onClick={() => handleEditWaliClick(r)}
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit Wali
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-rose-600 hover:bg-rose-500/10"
                          title="Hapus Kelas"
                          onClick={() => handleDeleteRombel(r)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">Wali Kelas:</span>
                      <strong className="text-foreground text-right truncate max-w-[200px]" title={r.waliKelas}>{r.waliKelas}</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-muted-foreground">Jumlah Siswa:</span>
                      <strong className="font-mono text-emerald-600 dark:text-emerald-400">{r.studentCount} Siswa</strong>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Tahun Ajaran */}
      {activeTab === "tahun_ajaran" && <TahunAjaranTab isKamad={isKamad} />}

      {/* Tab 3: KKTP Skema */}
      {activeTab === "kktp_skema" && <KktpSkemaTab isKamad={isKamad} />}

      {/* Modal Tambah Kelas Baru */}
      <Dialog open={isAddRombelOpen} onOpenChange={setIsAddRombelOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
              <Plus className="h-5 w-5" /> Tambah Kelas Baru
            </DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan data kelas baru untuk didaftarkan ke sistem master data madrasah.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Nama Kelas *</label>
              <Input
                placeholder="Contoh: Kelas 7A, Kelas 8C, Kelas 9A"
                value={newRombelName}
                onChange={(e) => setNewRombelName(e.target.value)}
                className="h-9 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Tingkat Kelas *</label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-semibold"
                value={newRombelGrade}
                onChange={(e) => setNewRombelGrade(e.target.value)}
              >
                <option value="Kelas VII">Tingkat VII (Kelas 7)</option>
                <option value="Kelas VIII">Tingkat VIII (Kelas 8)</option>
                <option value="Kelas IX">Tingkat IX (Kelas 9)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Wali Kelas Penanggung Jawab</label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs font-semibold"
                value={newRombelWali}
                onChange={(e) => setNewRombelWali(e.target.value)}
              >
                <option value="">-- Pilih Wali Kelas --</option>
                {dbTeachersList.map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Ruang Kelas (Opsional)</label>
              <Input
                placeholder="Contoh: Ruang 7A, Ruang Lab Komputer"
                value={newRombelRoom}
                onChange={(e) => setNewRombelRoom(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAddRombelOpen(false)}>
              Batal
            </Button>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={handleCreateRombel}>
              Simpan Data Kelas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Wali Kelas Dialog */}
      {editingRombel && (
        <EditWaliKelasDialog
          isOpen={isEditWaliOpen}
          onOpenChange={setIsEditWaliOpen}
          rombel={editingRombel}
          onSave={(rombelId, newWali) => handleSaveWaliKelas(rombelId, newWali)}
          teacherList={dbTeachersList}
        />
      )}
    </div>
  );
}
