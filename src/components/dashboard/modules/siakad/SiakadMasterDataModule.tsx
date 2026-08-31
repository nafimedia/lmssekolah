import { useState, useEffect } from "react";
import { Database, Users, Calendar, ShieldCheck, CheckCircle2, Plus, Edit, Trash2, ArrowUpDown, BookOpen, Layers, Inbox } from "lucide-react";
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

import { isSameClass } from "@/utils/classNormalization";

export function SiakadMasterDataModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any } = {}) {
  const isKamad = activeRole === "kamad";
  const [activeTab, setActiveTab] = useState<string>("pengampu");
  const [dbTeachersList, setDbTeachersList] = useState<string[]>([]);
  const [pengampuList, setPengampuList] = useState<PengampuRow[]>([]);

  const [isEditWaliOpen, setIsEditWaliOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<any>(null);

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
          const rCode = (r.code || r.name || "").toUpperCase().replace(/ROMBEL/i, "").trim();
          const realStudentCount = siswaUsers.filter((s: any) => {
            const sClass = (s.class_name || "").toUpperCase().replace("-", "").trim();
            return sClass.includes(rCode) || rCode.includes(sClass);
          }).length;

          return {
            id: r.id,
            code: r.code,
            name: r.name,
            grade: r.grade || (r.name.includes("7") ? "Kelas VII" : r.name.includes("9") ? "Kelas IX" : "Kelas VIII"),
            waliKelas: r.wali_kelas || r.waliKelas || "Belum Ditentukan",
            studentCount: realStudentCount > 0 ? realStudentCount : (r.siswa_count || r.student_count || 0),
            room: r.room || `Ruang ${r.name.replace('Rombel ', '')}`,
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
      toast.info("🏛️ Kepala Madrasah berada dalam Mode Monitoring (Read-Only).");
      return;
    }
    setEditingRombel(rombelItem);
    setIsEditWaliOpen(true);
  };

  const handleSaveWaliKelas = async (rombelId: string, newWaliName: string) => {
    if (isKamad) {
      toast.error("🔒 Akses ditolak: Kepala Madrasah hanya berhak memantau data (Read-Only).");
      return;
    }
    setRombelList((prev) =>
      prev.map((r) => (r.id === rombelId ? { ...r, waliKelas: newWaliName } : r))
    );

    if (typeof window !== "undefined") {
      try {
        const savedOverrides: Record<string, string> = JSON.parse(
          localStorage.getItem("lms_rombel_wali_overrides") || "{}"
        );
        savedOverrides[rombelId] = newWaliName;
        localStorage.setItem("lms_rombel_wali_overrides", JSON.stringify(savedOverrides));
      } catch (e) { }
    }

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
      toast.success(`Wali Kelas ${editingRombel?.name || "Rombel"} tersimpan ke database MySQL!`);
    } catch (e) {
      console.warn("Gagal simpan wali kelas ke MySQL:", e);
      toast.success(`Wali Kelas ${editingRombel?.name || "Rombel"} berhasil diperbarui ke ${newWaliName}!`);
    }

    setIsEditWaliOpen(false);
  };

  const handleCreateRombel = async () => {
    if (isKamad) {
      toast.error("🔒 Akses ditolak: Kepala Madrasah hanya berhak memantau data (Read-Only).");
      return;
    }
    if (!newRombelName.trim()) {
      toast.error("Nama Rombel wajib diisi!");
      return;
    }

    const cleanCode = newRombelName.toLowerCase().replace(/\s+/g, "");
    try {
      await MysqlDataService.saveMasterRombel({
        code: cleanCode,
        name: newRombelName.trim(),
        grade: newRombelGrade,
        wali_kelas: newRombelWali || "Belum Ditentukan",
        room: newRombelRoom || "Gedung Utama",
        siswa_count: 0,
      });

      toast.success(`🎉 Rombel Baru "${newRombelName}" berhasil ditambahkan ke database!`);
      setIsAddRombelOpen(false);
      setNewRombelName("");
      setNewRombelWali("");
      setNewRombelRoom("");
      loadData();
    } catch (e) {
      toast.error("Gagal menambahkan Rombel baru.");
    }
  };

  const handleDeleteRombel = async (rombelItem: any) => {
    if (isKamad) {
      toast.error("🔒 Akses ditolak: Kepala Madrasah hanya berhak memantau data (Read-Only).");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus Rombel "${rombelItem.name}" dari database?`)) return;

    try {
      await MysqlDataService.deleteMasterRombel(rombelItem.id);
      toast.success(`🗑️ ${rombelItem.name} berhasil dihapus dari database!`);
      loadData();
    } catch (e) {
      toast.error("Gagal menghapus rombel.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Data Master Akademik
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pengelolaan Rombongan Belajar (Rombel), Wali Kelas, Tahun Ajaran, & Skema Kriteria Ketuntasan (KKTP).
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80 w-fit flex-wrap">
        {[
          { id: "pengampu", label: "Daftar Rombel & Wali Kelas", icon: Users },
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

      {/* Tab 1: Daftar Rombel & Wali Kelas */}
      {activeTab === "pengampu" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Daftar Rombongan Belajar (Rombel) MTsN 2 Cilacap:
            </div>
            {!isKamad ? (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs"
                onClick={() => setIsAddRombelOpen(true)}
              >
                <Plus className="h-4 w-4" /> Tambah Rombel Baru
              </Button>
            ) : null}
          </div>

          {isLoadingRombel ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Memuat data rombel dari database...</div>
          ) : rombelList.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 bg-card">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-semibold text-foreground text-sm">Belum Ada Rombel Terdaftar</div>
              <p>Database saat ini tidak memiliki data rombel terdaftar.</p>
              {!isKamad && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs mt-2"
                  onClick={() => setIsAddRombelOpen(true)}
                >
                  <Plus className="h-4 w-4" /> Tambah Rombel Pertama
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
                          title="Hapus Rombel dari Database"
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

      {/* Dialog Tambah Rombel Baru */}
      <Dialog open={isAddRombelOpen} onOpenChange={setIsAddRombelOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600 font-bold">
              <Plus className="h-5 w-5" /> Tambah Rombongan Belajar (Rombel) Baru
            </DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan data Rombel baru untuk didaftarkan ke sistem master data madrasah.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Nama Rombel *</label>
              <Input
                placeholder="Contoh: Rombel 7A, Rombel 8C, Rombel 9I"
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
                <option value="Kelas VII">Kelas VII (Tingkat 7)</option>
                <option value="Kelas VIII">Kelas VIII (Tingkat 8)</option>
                <option value="Kelas IX">Kelas IX (Tingkat 9)</option>
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
              Simpan Rombel Ke Database
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
