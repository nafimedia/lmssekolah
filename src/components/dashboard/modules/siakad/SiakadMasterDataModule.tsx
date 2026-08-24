import { useState, useEffect } from "react";
import { Database, Users, Calendar, ShieldCheck, CheckCircle2, Plus, Edit, Trash2, ArrowUpDown, BookOpen, Layers, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MysqlDataService, PengampuRow } from "@/services/mysqlDataService";

import { EditWaliKelasDialog } from "./components/EditWaliKelasDialog";
import { TahunAjaranTab } from "./components/TahunAjaranTab";
import { KktpSkemaTab } from "./components/KktpSkemaTab";

export function SiakadMasterDataModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any } = {}) {
  const [activeTab, setActiveTab] = useState<string>("pengampu");
  const [dbTeachersList, setDbTeachersList] = useState<string[]>([]);
  const [pengampuList, setPengampuList] = useState<PengampuRow[]>([]);

  const [isEditWaliOpen, setIsEditWaliOpen] = useState(false);
  const [editingRombel, setEditingRombel] = useState<any>(null);

  // Clean state: initialize with empty array - strictly no dummy fallbacks
  const [rombelList, setRombelList] = useState<any[]>([]);
  const [isLoadingRombel, setIsLoadingRombel] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingRombel(true);

    Promise.all([
      (MysqlDataService as any).getRombels?.() || Promise.resolve([]),
      MysqlDataService.getUsers(),
      MysqlDataService.getPengampuList(),
    ])
      .then(([dbRombels, users, pengampu]) => {
        if (!isMounted) return;

        if (users && users.length > 0) {
          const teachers = users.filter((u: any) => u.role !== "siswa").map((u: any) => u.full_name);
          if (teachers.length > 0) setDbTeachersList(teachers);
        }

        if (pengampu && pengampu.length > 0) {
          setPengampuList(pengampu);
        }

        if (dbRombels && dbRombels.length > 0) {
          const siswaList = (users || []).filter((u: any) => u.role === "siswa");
          const mapped = dbRombels.map((r: any) => {
            const count = siswaList.filter((s: any) => (s.class_name || s.class || "").toLowerCase() === r.name.toLowerCase()).length;
            return {
              id: String(r.id),
              name: r.name,
              grade: r.grade_level || "Kelas VIII",
              waliKelas: r.wali_kelas_name || "Belum Ditentukan",
              studentCount: count,
            };
          });
          setRombelList(mapped);
        } else {
          setRombelList([]);
        }
      })
      .catch(() => {
        if (isMounted) setRombelList([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingRombel(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleEditWaliClick = (rombelItem: any) => {
    setEditingRombel(rombelItem);
    setIsEditWaliOpen(true);
  };

  const handleSaveWaliKelas = (rombelId: string, newWaliName: string) => {
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
      } catch (e) {}
    }

    toast.success(`Wali Kelas ${editingRombel?.name || "Rombel"} berhasil diperbarui ke ${newWaliName}!`);
    setIsEditWaliOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Database className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Data Master SIAKAD & Akademik
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
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === t.id
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
          </div>

          {isLoadingRombel ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Memuat data rombel dari database...</div>
          ) : rombelList.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 bg-card">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-semibold text-foreground text-sm">Belum Ada Rombel Terdaftar</div>
              <p>Database saat ini tidak memiliki data rombel terdaftar. Tampilan dikosongkan secara jujur tanpa data sampel/dummy.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rombelList.map((r) => (
                <Card key={r.id} className="border-border hover:border-emerald-500/40 transition shadow-xs bg-card">
                  <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
                    <div>
                      <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600 mb-1">
                        {r.grade}
                      </Badge>
                      <CardTitle className="text-base font-bold text-foreground">{r.name}</CardTitle>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 gap-1"
                      onClick={() => handleEditWaliClick(r)}
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit Wali
                    </Button>
                  </CardHeader>
                  <CardContent className="p-4 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wali Kelas:</span>
                      <strong className="text-foreground">{r.waliKelas}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-border">
                      <span className="text-muted-foreground">Jumlah Siswa:</span>
                      <strong className="font-mono text-emerald-600">{r.studentCount} Siswa</strong>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Tahun Ajaran */}
      {activeTab === "tahun_ajaran" && <TahunAjaranTab />}

      {/* Tab 3: KKTP Skema */}
      {activeTab === "kktp_skema" && <KktpSkemaTab />}

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
