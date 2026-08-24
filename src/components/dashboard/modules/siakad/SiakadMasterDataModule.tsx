import { useState, useMemo, useEffect } from "react";
import { MysqlDataService, PengampuRow, RuangRow, JadwalRow } from "@/services/mysqlDataService";
import {
  Sparkles,
  CheckCircle2,
  Plus,
  Building2,
  BookOpen,
  Users,
  Layers,
  CalendarDays,
  Award,
  ShieldCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";

import { PengampuTab } from "./components/PengampuTab";
import { MasterRombelTab } from "./components/MasterRombelTab";
import { TahunAjaranTab } from "./components/TahunAjaranTab";
import { KktpSkemaTab } from "./components/KktpSkemaTab";
import { EditWaliKelasDialog } from "./components/EditWaliKelasDialog";

export function SiakadMasterDataModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isKamad = activeRole === "kamad";
  const [activeTab, setActiveTab] = useState<string>("pengampu");
  const [dbTeachersList, setDbTeachersList] = useState<string[]>([]);
  const [pengampuList, setPengampuList] = useState<PengampuRow[]>([]);

  const [isEditWaliOpen, setIsEditWaliOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<any>(null);

  const [rombelList, setRombelList] = useState([
    { id: "r1", name: "Rombel 7A", grade: "Kelas VII", waliKelas: "MISBAH AHMAD DANI, S.Pd", studentCount: 32 },
    { id: "r2", name: "Rombel 7B", grade: "Kelas VII", waliKelas: "ENDAH KURNIAWATI, S.Pd", studentCount: 32 },
    { id: "r3", name: "Rombel 8A", grade: "Kelas VIII", waliKelas: "Dra. Hj. SITI RAHMAH, M.Pd", studentCount: 32 },
    { id: "r4", name: "Rombel 8B", grade: "Kelas VIII", waliKelas: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", studentCount: 32 },
    { id: "r5", name: "Rombel 9A", grade: "Kelas IX", waliKelas: "SOBIYATI, S.Pd", studentCount: 32 },
    { id: "r6", name: "Rombel 9B", grade: "Kelas IX", waliKelas: "SAYONO, S.Pd.I", studentCount: 32 },
  ]);

  useEffect(() => {
    let isMounted = true;

    // Load persisted Wali Kelas overrides from localStorage
    if (typeof window !== "undefined") {
      try {
        const savedOverrides: Record<string, string> = JSON.parse(
          localStorage.getItem("lms_rombel_wali_overrides") || "{}"
        );
        if (Object.keys(savedOverrides).length > 0) {
          setRombelList((prev) =>
            prev.map((r) =>
              savedOverrides[r.id]
                ? { ...r, waliKelas: savedOverrides[r.id] }
                : r
            )
          );
        }
      } catch (e) {}
    }

    MysqlDataService.getUsers()
      .then((users) => {
        if (!isMounted) return;
        if (users && users.length > 0) {
          const teachers = users.filter((u) => u.role !== "siswa").map((u) => u.full_name);
          if (teachers.length > 0) setDbTeachersList(teachers);
        }
      })
      .catch(() => {});

    MysqlDataService.getPengampuList().then((data) => {
      if (isMounted && data && data.length > 0) setPengampuList(data);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveWaliKelas = (rombelId: string, newWaliKelas: string) => {
    if (isKamad) {
      toast.error("🔒 Akses ditolak: Kepala Madrasah hanya berhak memantau data (Read-Only).");
      return;
    }

    setRombelList((prev) =>
      prev.map((r) => (r.id === rombelId ? { ...r, waliKelas: newWaliKelas } : r))
    );

    if (typeof window !== "undefined") {
      try {
        const current = JSON.parse(
          localStorage.getItem("lms_rombel_wali_overrides") || "{}"
        );
        current[rombelId] = newWaliKelas;
        localStorage.setItem("lms_rombel_wali_overrides", JSON.stringify(current));
      } catch (e) {}
    }

    const targetRombel = rombelList.find((r) => r.id === rombelId);
    toast.success(
      `✅ Wali Kelas ${targetRombel?.name || "Rombel"} berhasil diperbarui menjadi "${newWaliKelas}"!`
    );
  };

  const handleDeletePengampu = (id: string, name: string) => {
    if (isKamad) {
      toast.error("🔒 Akses ditolak: Kepala Madrasah hanya berhak memantau data (Read-Only).");
      return;
    }
    setPengampuList((prev) => prev.filter((p) => p.id !== id));
    toast.success(`🗑️ Plotting pengampu "${name}" berhasil dihapus.`);
  };

  const handleAddPengampuClick = () => {
    if (isKamad) {
      toast.info("🏛️ Kepala Madrasah berada dalam Mode Monitoring (Read-Only). Pengolahan plotting dilakukan oleh Waka Kurikulum.");
      return;
    }
    toast.info("Gunakan tombol tambah pada matriks pengampu untuk mendaftarkan plotting guru baru.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> Akademik Madrasah
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pengelolaan data master akademik madrasah, tahun ajaran & periode, KKTP & skema nilai, rombel, dan matriks pengampu.
          </p>
        </div>
      </div>

      {isKamad && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0" />
            <span>🏛️ <strong>Mode Monitoring Eksekutif Kepala Madrasah</strong> — Tampilan Read-Only. Kepala Madrasah memantau data master akademik tanpa melakukan pengubahan data.</span>
          </span>
          <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-400 font-mono text-[10px]">READ ONLY MONITORING</Badge>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80">
        {[
          { id: "pengampu", label: "Matriks Pengampu", icon: Users },
          { id: "tahun_ajaran", label: "Tahun Ajaran & Periode", icon: CalendarDays },
          { id: "kktp_skema", label: "KKTP & Skema Nilai", icon: Sparkles },
          { id: "rombel", label: "Kelas & Rombel", icon: Building2 },
          { id: "mapel", label: "Master Mapel", icon: BookOpen },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === t.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "pengampu" && (
        <PengampuTab
          pengampuList={pengampuList.length > 0 ? pengampuList : [
            { id: "p1", guru: "SAYONO, S.Pd., M.Pd.", mapel: "Matematika", rombel: "Rombel 8A", jam: "4 JP" },
            { id: "p2", guru: "SOBIYATI, S.Pd", mapel: "Bahasa Indonesia", rombel: "Rombel 8A", jam: "4 JP" },
            { id: "p3", guru: "AH. SYARIF HIDAYAH, S.Pd.I", mapel: "Al Qur'an Hadis", rombel: "Rombel 8A", jam: "2 JP" },
          ]}
          onOpenAddModal={handleAddPengampuClick}
          onDeletePengampu={handleDeletePengampu}
        />
      )}

      {activeTab === "tahun_ajaran" && <TahunAjaranTab isKamad={isKamad} />}

      {activeTab === "kktp_skema" && <KktpSkemaTab />}

      {activeTab === "rombel" && (
        <MasterRombelTab
          rombelList={rombelList}
          onOpenAddModal={() => toast.success("Rombel baru siap ditambahkan!")}
          onEditWali={(r) => {
            if (isKamad) {
              toast.error("🔒 Akses ditolak: Kepala Madrasah hanya berhak memantau data (Read-Only).");
              return;
            }
            setEditingRombel(r);
            setIsEditWaliOpen(true);
          }}
          isKamad={isKamad}
        />
      )}

      {activeTab === "mapel" && (
        <Card className="border-border shadow-sm bg-card">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Master Mata Pelajaran Kurikulum Merdeka
            </CardTitle>
            <CardDescription className="text-xs">
              Daftar 18 Mata Pelajaran resmi Kurikulum Merdeka MTsN 2 Cilacap.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-3">Kode Mapel</th>
                  <th className="py-3 px-3 text-center">Kelompok</th>
                  <th className="py-3 px-3 text-center">KKTP Standard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {INITIAL_MASTER_MAPEL.map((m) => (
                  <tr key={m.code} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-bold text-foreground">{m.name}</td>
                    <td className="py-3 px-3 font-mono font-semibold">{m.code}</td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant="outline" className="text-[10px] font-bold">
                        {m.category || "PAI / Umum"}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">75</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* MODAL EDIT WALI KELAS UNTUK ADMIN AKADEMIK */}
      <EditWaliKelasDialog
        isOpen={isEditWaliOpen}
        onOpenChange={setIsEditWaliOpen}
        rombel={editingRombel}
        teacherList={dbTeachersList}
        onSave={handleSaveWaliKelas}
      />
    </div>
  );
}
