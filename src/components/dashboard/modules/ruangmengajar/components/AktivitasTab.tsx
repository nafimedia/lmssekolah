import { useState, useEffect } from "react";
import { FileText, Plus, CheckCircle2, Trophy, PencilLine, Brain, Users, PenTool, FlaskConical, Target, BookCheck, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { ViewActivityDialog, ActivityDetail } from "./ViewActivityDialog";
import { CreateActivityForm, ActivityTypeOption } from "./CreateActivityDialog";

import { isSameClass } from "@/utils/classNormalization";

export interface LearningActivityItem {
  id: string;
  title: string;
  type: ActivityTypeOption | string;
  instructions?: string;
  dueDate: string;
  status: string;
  submittedCount: number;
  totalStudents: number;
  attachment_url?: string;
  submission_type?: string;
  quiz_data?: string;
  questions_data?: string;
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
    Promise.all([
      MysqlDataService.getLkpdActivities(activeRombel, activeMapel),
      MysqlDataService.getUsers(),
      MysqlDataService.getSubmissions(),
    ]).then(([dbItems, users, subs]) => {
      if (!isMounted) return;
      const rombelStudents = (users || []).filter(
        (u: any) => u.role === "siswa" && isSameClass(u.class_name || u.class, activeRombel)
      );
      const studentCount = rombelStudents.length;

      if (dbItems) {
        setActivities(
          dbItems.map((item, idx) => {
            const actId = String(item.id || idx);
            const matchingSubs = (subs || []).filter(
              (s: any) => String(s.assignment_id) === actId
            );
            return {
              id: actId,
              title: item.title,
              type: item.type || "LKPD",
              instructions: item.instructions,
              dueDate: item.due_date || "Hari ini",
              status: item.status || "AKTIF",
              submittedCount: matchingSubs.length,
              totalStudents:
                studentCount > 0
                  ? studentCount
                  : users?.filter((u: any) => u.role === "siswa").length || 0,
              attachment_url: item.attachment_url,
              submission_type: item.submission_type,
              quiz_data: item.quiz_data,
              questions_data: item.questions_data,
            };
          })
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
        await MysqlDataService.deleteLkpdActivity(id);
        toast.success(`🗑️ Aktivitas "${title}" berhasil dihapus dari database!`);
      } catch (e) {
        console.warn("Gagal hapus aktivitas di database:", e);
      }
    }
  };

  if (isCreateOpen) {
    return (
      <CreateActivityForm
        activeRombel={activeRombel}
        activeMapel={activeMapel}
        onCancel={() => setIsCreateOpen(false)}
        onActivityCreated={(newAct) => {
          handleActivityCreated(newAct);
          setIsCreateOpen(false);
        }}
      />
    );
  }

  return (
    <>
    <>
      <Card className="border-border shadow-xs bg-card overflow-hidden">
        {/* Header Bersih & Ringkas (Clean UI Mobile-First) */}
        <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between gap-2 bg-muted/15">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs sm:text-sm font-bold truncate text-foreground">
                  Tugas & LKPD
                </h3>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-mono font-semibold">
                  {activities.length}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                {activeMapel} · {activeRombel}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            className="h-8 px-2.5 text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            onClick={() => setIsCreateOpen(true)}
            title="Buat LKPD / Aktivitas Baru"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">+ Buat LKPD</span>
            <span className="sm:hidden">+ LKPD</span>
          </Button>
        </div>

        <CardContent className="p-3 sm:p-4 space-y-3">
          {activities.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-border rounded-xl bg-muted/20">
              <FileText className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <h4 className="font-bold text-xs text-foreground">Belum Ada Aktivitas / LKPD Digital</h4>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-sm mx-auto font-medium">
                Belum ada aktivitas pembelajaran untuk <strong>{activeRombel}</strong> ({activeMapel}).
              </p>
              <Button
                size="sm"
                variant="outline"
                className="text-xs font-semibold mt-2"
                onClick={() => setIsCreateOpen(true)}
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Buat LKPD Sekarang
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {activities.map((act) => (
                <div key={act.id} className="p-3 rounded-xl border border-border bg-card space-y-2.5 hover:shadow-xs transition">
                  <div className="flex items-center justify-between gap-1.5">
                    <Badge variant="outline" className="font-mono text-[9px] font-semibold gap-1 py-0 px-1.5 truncate">
                      {act.type === "LKPD" && <><FileText className="h-2.5 w-2.5 text-emerald-600" /> LKPD</>}
                      {act.type === "TUGAS_KELOMPOK" && <><Users className="h-2.5 w-2.5 text-blue-600" /> KELOMPOK</>}
                      {act.type === "QUIZ" && <><Brain className="h-2.5 w-2.5 text-purple-600" /> KUIS</>}
                      {act.type === "TUGAS_MANDIRI" && <><PenTool className="h-2.5 w-2.5 text-amber-600" /> MANDIRI</>}
                      {act.type === "PRAKTIKUM" && <><FlaskConical className="h-2.5 w-2.5 text-teal-600" /> PRAKTIKUM</>}
                      {act.type === "PROYEK_P5" && <><Target className="h-2.5 w-2.5 text-rose-600" /> P5</>}
                      {act.type === "HAFALAN" && <><BookCheck className="h-2.5 w-2.5 text-indigo-600" /> HAFALAN</>}
                      {!["LKPD", "TUGAS_KELOMPOK", "QUIZ", "TUGAS_MANDIRI", "PRAKTIKUM", "PROYEK_P5", "HAFALAN"].includes(act.type) && (
                        <><FileText className="h-2.5 w-2.5 text-primary" /> {act.type}</>
                      )}
                    </Badge>
                    <Badge
                      className={`text-white font-semibold text-[9px] py-0 px-1.5 ${
                        act.status === "DRAF"
                          ? "bg-amber-500 hover:bg-amber-600"
                          : "bg-emerald-600 hover:bg-emerald-700"
                      }`}
                    >
                      {act.status === "DRAF" ? "DRAF" : act.status}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-foreground truncate">{act.title}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-medium">Batas: {act.dueDate}</p>
                  </div>

                  <div className="p-2 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground font-medium">Terkumpul:</span>
                    <span className="font-bold font-mono text-emerald-600">{act.submittedCount} / {act.totalStudents}</span>
                  </div>

                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs font-semibold gap-1 text-primary border-primary/30 hover:bg-primary/5"
                      onClick={() => handleOpenViewActivity(act)}
                    >
                      <PencilLine className="h-3 w-3" />
                      {act.type === "TUGAS_KELOMPOK"
                        ? "Kelola"
                        : act.type === "QUIZ"
                        ? "Nilai Kuis"
                        : "Nilai LKPD"}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Hapus Aktivitas"
                      onClick={() => handleDeleteActivity(act.id, act.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
    </>
  );
}
