import { useState, useEffect } from "react";
import { FileText, Plus, CheckCircle2, Trophy, PencilLine, Brain, Users, PenTool, FlaskConical, Target, BookCheck, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { ViewActivityDialog, ActivityDetail } from "./ViewActivityDialog";
import { CreateActivityDialog, ActivityTypeOption } from "./CreateActivityDialog";

export interface LearningActivityItem {
  id: string;
  title: string;
  type: ActivityTypeOption | string;
  dueDate: string;
  status: string;
  submittedCount: number;
  totalStudents: number;
}

interface AktivitasTabProps {
  activeRombel: string;
  activeMapel: string;
}

export function AktivitasTab({ activeRombel, activeMapel }: AktivitasTabProps) {
  const [activities, setActivities] = useState<LearningActivityItem[]>([]);

  const [selectedActivityForView, setSelectedActivityForView] = useState<ActivityDetail | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    MysqlDataService.getLkpdActivities(activeRombel, activeMapel).then((dbItems) => {
      if (!isMounted) return;
      if (dbItems) {
        setActivities(
          dbItems.map((item, idx) => ({
            id: String(item.id || idx),
            title: item.title,
            type: item.type || "LKPD",
            dueDate: item.due_date || "Hari ini",
            status: item.status || "AKTIF",
            submittedCount: 0,
            totalStudents: 30,
          }))
        );
      } else {
        setActivities([]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeRombel, activeMapel]);

  const handleOpenViewActivity = (act: LearningActivityItem) => {
    setSelectedActivityForView(act);
    setIsViewOpen(true);
  };

  const handleActivityCreated = (newAct: LearningActivityItem) => {
    setActivities((prev) => [newAct, ...prev]);
  };

  const handleDeleteActivity = async (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus aktivitas "${title}"?`)) {
      setActivities((prev) => prev.filter((a) => a.id !== id));
      try {
        await MysqlDataService.deleteAssignment(id);
        toast.success(`🗑️ Aktivitas "${title}" berhasil dihapus dari database!`);
      } catch (e) {
        console.warn("Gagal hapus aktivitas di database:", e);
      }
    }
  };

  return (
    <>
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" /> Aktivitas Pembelajaran & LKPD Digital ({activeMapel})
            </CardTitle>
            <CardDescription className="text-xs">
              Lembar kerja, tugas kelompok, praktikum, kuis formatif, dan projek P5 untuk {activeRombel}. Buat baru, periksa, dan nilai aktivitas secara langsung.
            </CardDescription>
          </div>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="h-4 w-4" /> Buat LKPD / Aktivitas Baru
          </Button>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {activities.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
              <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <h4 className="font-bold text-xs text-foreground">Belum Ada Aktivitas / LKPD Digital</h4>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto">
                Belum ada aktivitas pembelajaran yang dibuat untuk <strong>{activeRombel}</strong> ({activeMapel}). Klik tombol di atas untuk membuat LKPD baru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {activities.map((act) => (
                <div key={act.id} className="p-4 rounded-xl border border-border bg-card space-y-3 hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-[10px] font-bold gap-1">
                      {act.type === "LKPD" && <><FileText className="h-3 w-3 text-emerald-600" /> LKPD DIGITAL</>}
                      {act.type === "TUGAS_KELOMPOK" && <><Users className="h-3 w-3 text-blue-600" /> TUGAS KELOMPOK</>}
                      {act.type === "QUIZ" && <><Brain className="h-3 w-3 text-purple-600" /> KUIS FORMATIF</>}
                      {act.type === "TUGAS_MANDIRI" && <><PenTool className="h-3 w-3 text-amber-600" /> TUGAS MANDIRI</>}
                      {act.type === "PRAKTIKUM" && <><FlaskConical className="h-3 w-3 text-teal-600" /> PRAKTIKUM</>}
                      {act.type === "PROYEK_P5" && <><Target className="h-3 w-3 text-rose-600" /> PROYEK P5/PPRA</>}
                      {act.type === "HAFALAN" && <><BookCheck className="h-3 w-3 text-indigo-600" /> SETORAN HAFALAN</>}
                      {!["LKPD", "TUGAS_KELOMPOK", "QUIZ", "TUGAS_MANDIRI", "PRAKTIKUM", "PROYEK_P5", "HAFALAN"].includes(act.type) && (
                        <><FileText className="h-3 w-3 text-primary" /> {act.type}</>
                      )}
                    </Badge>
                    <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                      {act.status}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-foreground leading-snug">{act.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-1">Batas Pengumpulan: {act.dueDate}</p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground font-medium">Terkumpul:</span>
                    <span className="font-bold font-mono text-emerald-600">{act.submittedCount} / {act.totalStudents} Siswa</span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs font-bold gap-1 text-primary border-primary/30 hover:bg-primary/5"
                      onClick={() => handleOpenViewActivity(act)}
                    >
                      <PencilLine className="h-3.5 w-3.5" /> Nilai LKPD
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                      title="Hapus Aktivitas"
                      onClick={() => handleDeleteActivity(act.id, act.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ViewActivityDialog
        isOpen={isViewOpen}
        onOpenChange={setIsViewOpen}
        activity={selectedActivityForView}
        activeRombel={activeRombel}
        activeMapel={activeMapel}
      />

      <CreateActivityDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        activeRombel={activeRombel}
        activeMapel={activeMapel}
        onActivityCreated={handleActivityCreated}
      />
    </>
  );
}
