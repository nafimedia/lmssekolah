import { useState, useEffect } from "react";
import {
  Trophy,
  AlertTriangle,
  Users,
  Award,
  Lock,
  Sparkles,
  CheckCircle2,
  History,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";

export interface TeacherAwardItem {
  id: string;
  teacher: string;
  type: "award" | "warning";
  title: string;
  emote: string;
  comment: string;
  date: string;
  awardedBy: string;
}

export function ApresiasiGuruModule({ activeRole }: { activeRole?: string }) {
  const canManageAward = activeRole === "kamad" || activeRole === "admin" || activeRole === "waka";

  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [historyList, setHistoryList] = useState<TeacherAwardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [actionType, setActionType] = useState<"award" | "warning">("award");
  const [badgeCategory, setBadgeCategory] = useState("Guru Inovatif Pembelajaran");
  const [warningCategory, setWarningCategory] = useState("Presensi KBM Perlu Ditingkatkan");
  const [commentText, setCommentText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    MysqlDataService.getUsers()
      .then((users) => {
        if (!isMounted) return;
        const guruUsers = users.filter((u) => {
          const roleMatch =
            u.role === "guru" ||
            u.role === "walikelas" ||
            u.role === "wali_kelas" ||
            u.role === "waka" ||
            u.role === "admin_akademik";
          const notAdmin = !u.full_name.toLowerCase().includes("administrator") && u.role !== "admin" && u.role !== "superadmin";
          return roleMatch && notAdmin;
        });
        if (guruUsers.length > 0) {
          const mapped = guruUsers.map((g, idx) => {
            return {
              id: String(g.id || `g-${idx + 1}`),
              name: g.full_name,
              mapel: (g as any).assigned_mapel || (g as any).specialization || "Guru Pengampu KBM",
              nip: g.nis_nip || "-",
              badges: [] as string[],
              warningCount: 0,
              status: "Aktif Terpuji",
            };
          });
          setTeachersList(mapped);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    let persistedHistory: TeacherAwardItem[] = [];
    if (typeof window !== "undefined") {
      try {
        const savedHistory = localStorage.getItem("lms_teacher_awards_history_v2");
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) {
            persistedHistory = parsed;
          }
        }
      } catch (e) {}
    }

    MysqlDataService.getAwards().then((dbAwards) => {
      if (!isMounted) return;
      if (dbAwards && dbAwards.length > 0) {
        const dbMapped: TeacherAwardItem[] = dbAwards.map((item) => ({
          id: String(item.id || Date.now()),
          teacher: item.student_name,
          type: (item.warning_category ? "warning" : "award") as "award" | "warning",
          title: item.badge_category || item.warning_category || "Bintang Apresiasi",
          emote: item.warning_category ? "warning" : "award",
          comment: item.comment_text || "",
          date: item.created_at || "Hari ini",
          awardedBy: item.awarded_by || "H. SOLIHUN, S.Pd., M.Si (Kepala Madrasah)",
        }));

        const combined = [...dbMapped];
        persistedHistory.forEach((p) => {
          if (!combined.some((c) => c.id === p.id || (c.teacher === p.teacher && c.title === p.title))) {
            combined.push(p);
          }
        });
        setHistoryList(combined);
      } else {
        setHistoryList(persistedHistory);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (teachersList.length === 0 || historyList.length === 0) return;

    setTeachersList((prevTeachers) =>
      prevTeachers.map((t) => {
        const teacherHistory = historyList.filter(
          (h) => h.teacher.toLowerCase().trim() === t.name.toLowerCase().trim()
        );
        const awards = teacherHistory.filter((h) => h.type === "award").map((h) => h.title);
        const warnings = teacherHistory.filter((h) => h.type === "warning");

        return {
          ...t,
          badges: Array.from(new Set([...awards])),
          warningCount: warnings.length,
          status: warnings.length > 0 ? "Perlu Evaluasi Pembinaan Kamad" : "Aktif Terpuji",
        };
      })
    );
  }, [historyList]);

  const handleOpenAction = (teacher: any, type: "award" | "warning") => {
    if (!canManageAward) {
      toast.error("Fitur Pemberian Award & Warning khusus untuk Wewenang Eksekutif Kepala Madrasah.");
      return;
    }
    setSelectedTeacher(teacher);
    setActionType(type);
    setCommentText("");
    setIsModalOpen(true);
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    if (!canManageAward) {
      toast.error("Wewenang Eksekutif Kepala Madrasah diperlukan untuk menyimpan Award / Warning.");
      setIsModalOpen(false);
      return;
    }

    const title = actionType === "award" ? badgeCategory : warningCategory;
    const newHistory: TeacherAwardItem = {
      id: String(Date.now()),
      teacher: selectedTeacher.name,
      type: actionType,
      title: title.replace(/^[^\s]+\s/, ""),
      emote: actionType === "award" ? "award" : "warning",
      comment:
        commentText.trim() ||
        (actionType === "award"
          ? "Apresiasi atas dedikasi dan kinerja pembelajaran terbaik di MTsN 2 Cilacap."
          : "Catatan pembinaan resmi Kepala Madrasah untuk peningkatan kualitas KBM."),
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      awardedBy: "H. SOLIHUN, S.Pd., M.Si (Kepala Madrasah)",
    };

    MysqlDataService.saveAward({
      student_name: selectedTeacher.name,
      badge_category: actionType === "award" ? title : undefined,
      warning_category: actionType === "warning" ? title : undefined,
      comment_text: newHistory.comment,
      awarded_by: "H. SOLIHUN, S.Pd., M.Si (Kepala Madrasah)",
    }).catch((err) => console.warn("saveAward DB failed:", err));

    const updatedHistory = [newHistory, ...historyList];
    setHistoryList(updatedHistory);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("lms_teacher_awards_history_v2", JSON.stringify(updatedHistory));
      } catch (e) {}
    }

    if (actionType === "award") {
      toast.success(`Award & Lencana ${title} resmi diserahkan oleh Kepala Madrasah kepada ${selectedTeacher.name}!`);
    } else {
      toast.warning(`Catatan Pembinaan Eksekutif Kamad resmi dikirimkan kepada ${selectedTeacher.name}!`);
    }

    setIsModalOpen(false);
  };

  const totalAwardCount = historyList.filter((h) => h.type === "award").length;
  const totalWarningCount = historyList.filter((h) => h.type === "warning").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Apresiasi & Catatan Pembinaan Guru (Award & Warning)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Portal Eksekutif Kepala Madrasah untuk memberikan penghargaan (award/badge) atau catatan pembinaan (warning) kepada Guru Pengampu resmi MTsN 2 Cilacap.
          </p>
        </div>
      </div>

      {/* Eye-Friendly Stat Cards with Harmonized HSL Accent Backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/5 via-card to-card border-amber-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 grid place-items-center font-bold shrink-0">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Award Diberikan</div>
              <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">{totalAwardCount} Lencana</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/5 via-card to-card border-rose-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 grid place-items-center font-bold shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Catatan Warning Aktif</div>
              <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">{totalWarningCount} Warning</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/5 via-card to-card border-emerald-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center font-bold shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Guru Pengampu Database</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{teachersList.length} Guru</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="guru_list" className="space-y-4">
        <TabsList className="bg-muted/60 p-1 border border-border">
          <TabsTrigger value="guru_list" className="text-xs font-semibold gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" /> Daftar Guru Resmi ({teachersList.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-semibold gap-1.5">
            <History className="h-3.5 w-3.5" /> Riwayat Award & Warning ({historyList.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guru_list">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Memuat data Guru Resmi dari Database...</div>
          ) : teachersList.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
              Belum ada data Guru terdaftar pada database. Silakan periksa database GTK/User.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachersList.map((t) => (
                <Card key={t.id} className="border-border hover:border-primary/40 transition shadow-xs bg-card">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {t.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Badge variant={t.warningCount > 0 ? "outline" : "secondary"} className={t.warningCount > 0 ? "border-rose-500/30 text-rose-600 dark:text-rose-400 text-[10px] gap-1 font-semibold" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] gap-1 font-semibold"}>
                        {t.warningCount > 0 ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                        {t.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold mt-2 leading-snug">{t.name}</CardTitle>
                    <CardDescription className="text-xs">{t.mapel} • {t.nip}</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-2 space-y-3">
                    <div className="space-y-1">
                      <div className="text-[11px] text-muted-foreground font-medium">
                        Lencana & Apresiasi Diterima:
                      </div>
                      <div className="flex flex-wrap gap-1 min-h-[24px]">
                        {t.badges && t.badges.length > 0 ? (
                          t.badges.map((b: string, idx: number) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-semibold gap-1"
                            >
                              <Award className="h-3 w-3 text-amber-500" />
                              {b}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">Belum ada lencana</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                      {canManageAward ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-amber-500/90 hover:bg-amber-500 text-slate-950 font-bold text-xs h-8 gap-1.5 shadow-xs"
                            onClick={() => handleOpenAction(t, "award")}
                          >
                            <Trophy className="h-3.5 w-3.5" /> Beri Award
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/10 font-semibold text-xs h-8 gap-1.5"
                            onClick={() => handleOpenAction(t, "warning")}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" /> Warning
                          </Button>
                        </>
                      ) : (
                        <div className="col-span-2 text-center py-1">
                          <Badge variant="outline" className="text-[10px] text-muted-foreground font-medium gap-1">
                            <Lock className="h-3 w-3" /> Wewenang Eksekutif Kamad
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" /> Log Riwayat Apresiasi & Pembinaan Kepala Madrasah
              </CardTitle>
              <CardDescription className="text-xs">
                Catatan resmi penghargaan dan arahan pembinaan real yang telah dikirimkan oleh Kepala Madrasah.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {historyList.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  Belum ada riwayat Award atau Catatan Warning yang diberikan oleh Kepala Madrasah.
                </div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold text-left border-b border-border">
                    <tr>
                      <th className="p-3">Guru Penerima</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3 text-center">Tipe</th>
                      <th className="p-3">Komentar / Catatan Kamad</th>
                      <th className="p-3 text-right">Penetap / Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historyList.map((h) => (
                      <tr key={h.id} className="hover:bg-muted/30 transition">
                        <td className="p-3 font-bold text-foreground">{h.teacher}</td>
                        <td className="p-3">
                          <Badge
                            className={
                              h.type === "award"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold gap-1"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold gap-1"
                            }
                          >
                            {h.type === "award" ? <Trophy className="h-3 w-3 text-amber-500" /> : <AlertTriangle className="h-3 w-3 text-rose-500" />}
                            {h.title}
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          {h.type === "award" ? (
                            <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1">
                              <Sparkles className="h-3 w-3 text-amber-500" /> Award
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px] gap-1">
                              <AlertTriangle className="h-3 w-3 text-rose-500" /> Warning
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground max-w-xs truncate">{h.comment}</td>
                        <td className="p-3 text-right">
                          <div className="font-semibold text-foreground">{h.awardedBy}</div>
                          <div className="text-[10px] text-muted-foreground">{h.date}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {actionType === "award" ? (
                <Trophy className="h-5 w-5 text-amber-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-rose-500" />
              )}
              {actionType === "award" ? "Beri Lencana Award / Apresiasi Guru" : "Catatan Pembinaan / Warning Guru"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Penerima: <strong className="text-foreground">{selectedTeacher?.name}</strong> ({selectedTeacher?.mapel})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAction} className="space-y-4 py-2">
            {actionType === "award" ? (
              <div>
                <Label className="text-xs font-semibold">Pilih Lencana Kategori Award</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold"
                  value={badgeCategory}
                  onChange={(e) => setBadgeCategory(e.target.value)}
                >
                  <option value="Guru Inovatif Pembelajaran">Guru Inovatif Pembelajaran</option>
                  <option value="Teladan Kedisiplinan KBM">Teladan Kedisiplinan KBM</option>
                  <option value="Inovator Perangkat Pembelajaran">Inovator Perangkat Pembelajaran</option>
                  <option value="Dedikasi Pengabdian Madrasah">Dedikasi Pengabdian Madrasah</option>
                  <option value="Pembimbing Prestasi Siswa">Pembimbing Prestasi Siswa</option>
                </select>
              </div>
            ) : (
              <div>
                <Label className="text-xs font-semibold">Pilih Kategori Pembinaan / Warning</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold text-rose-600 dark:text-rose-400"
                  value={warningCategory}
                  onChange={(e) => setWarningCategory(e.target.value)}
                >
                  <option value="Presensi KBM Perlu Ditingkatkan">Presensi KBM Perlu Ditingkatkan</option>
                  <option value="Penyelesaian Perangkat KBM Terlambat">Penyelesaian Perangkat KBM Terlambat</option>
                  <option value="Evaluasi Pembetulan Nilai Rapor">Evaluasi Pembetulan Nilai Rapor</option>
                  <option value="Teguran Administrasi Madrasah">Teguran Administrasi Madrasah</option>
                </select>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold">Pesan / Catatan Khusus Kepala Madrasah</Label>
              <textarea
                rows={3}
                className="w-full rounded-md border border-border bg-background p-2.5 text-xs mt-1 focus:ring-1 focus:ring-primary"
                placeholder="Tuliskan catatan apresiasi atau arahan pembinaan resmi di sini..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className={
                  actionType === "award"
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-1.5"
                    : "bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5"
                }
              >
                {actionType === "award" ? <Trophy className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                {actionType === "award" ? "Serahkan Award" : "Kirim Catatan Warning"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
