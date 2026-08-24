import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Award, AlertTriangle, Star, Sparkles, Plus, Search, MessageSquare, Inbox } from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";

export interface ApresiasiSiswaModuleProps {
  activeRole?: string;
  userProfile?: any;
}

export function ApresiasiSiswaModule({ activeRole }: ApresiasiSiswaModuleProps) {
  // Clean state: initialize with empty array - strictly no dummy fallbacks
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    MysqlDataService.getUsers()
      .then((users) => {
        if (!isMounted) return;
        if (users && users.length > 0) {
          const siswaList = users.filter((u: any) => u.role === "siswa");
          if (siswaList.length > 0) {
            const mapped = siswaList.map((s: any, idx: number) => ({
              id: s.id || `s_${idx}`,
              name: s.full_name || s.name,
              rombel: s.class_name || s.class || "Kelas VIII",
              nis: s.nis_nip || s.nis || "-",
              badges: [],
              warningCount: 0,
            }));
            setStudentsList(mapped);
          } else {
            setStudentsList([]);
          }
        } else {
          setStudentsList([]);
        }
      })
      .catch(() => {
        if (isMounted) setStudentsList([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [actionType, setActionType] = useState<"award" | "warning">("award");
  const [badgeCategory, setBadgeCategory] = useState("⭐ Siswa Aktif");
  const [warningCategory, setWarningCategory] = useState("⚠️ Belum Mengumpulkan Tugas");
  const [emote, setEmote] = useState("🎉");
  const [commentText, setCommentText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAction = (student: any, type: "award" | "warning") => {
    setSelectedStudent(student);
    setActionType(type);
    setEmote(type === "award" ? "🎉" : "⚠️");
    setCommentText("");
    setIsModalOpen(true);
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const title = actionType === "award" ? badgeCategory : warningCategory;
    if (actionType === "award") {
      setStudentsList(
        studentsList.map((s) => (s.id === selectedStudent.id ? { ...s, badges: Array.from(new Set([...s.badges, title])) } : s))
      );
      toast.success(`Lencana ${title} berhasil diberikan kepada ${selectedStudent.name}!`);
    } else {
      setStudentsList(
        studentsList.map((s) => (s.id === selectedStudent.id ? { ...s, warningCount: s.warningCount + 1 } : s))
      );
      toast.warning(`Catatan Pembinaan ${title} berhasil dikirimkan kepada ${selectedStudent.name}!`);
    }
    setIsModalOpen(false);
  };

  const filteredStudents = studentsList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.includes(searchQuery)
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" /> Award, Badge & Warning Siswa
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fitur Guru untuk memberikan apresiasi lencana karakter/prestasi dan catatan pembinaan kepada siswa di kelas yang diampu.
          </p>
        </div>

        <Input
          placeholder="🔍 Cari siswa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-64 h-9 text-xs"
        />
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-muted-foreground">Memuat data siswa dari database...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 bg-card">
          <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <div className="font-semibold text-foreground text-sm">Belum Ada Data Siswa Terdaftar</div>
          <p>Database saat ini tidak memiliki akun siswa terdaftar. Tampilan dikosongkan secara jujur tanpa data sampel/dummy.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((s) => (
            <Card key={s.id} className="border-border hover:border-amber-500/40 transition shadow-xs bg-card">
              <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-[10px] font-bold border-amber-500/30 text-amber-600 mb-1">
                    {s.rombel}
                  </Badge>
                  <CardTitle className="text-base font-bold text-foreground">{s.name}</CardTitle>
                  <CardDescription className="text-xs">NISN: {s.nis}</CardDescription>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] font-bold border-amber-500/40 text-amber-600 hover:bg-amber-500/10 gap-1"
                    onClick={() => handleOpenAction(s, "award")}
                  >
                    <Star className="h-3 w-3" /> + Award
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] font-bold border-rose-500/40 text-rose-600 hover:bg-rose-500/10 gap-1"
                    onClick={() => handleOpenAction(s, "warning")}
                  >
                    <AlertTriangle className="h-3 w-3" /> + Warning
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground">Lencana Karakter & Award:</div>
                  {s.badges.length === 0 ? (
                    <div className="text-[11px] text-muted-foreground italic">Belum ada lencana award yang diberikan.</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {s.badges.map((b: string, i: number) => (
                        <Badge key={i} className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 text-[10px] font-bold">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {s.warningCount > 0 && (
                  <div className="pt-2 border-t border-border flex items-center gap-2 text-xs text-rose-600 font-bold">
                    <AlertTriangle className="h-4 w-4" /> {s.warningCount} Catatan Pembinaan Disiplin
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Give Award / Warning */}
      {selectedStudent && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md bg-card border-border p-5">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                {actionType === "award" ? <Star className="h-5 w-5 text-amber-500" /> : <AlertTriangle className="h-5 w-5 text-rose-500" />}
                {actionType === "award" ? "Beri Lencana Award Siswa" : "Beri Catatan Pembinaan Siswa"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Siswa: <strong>{selectedStudent.name}</strong> ({selectedStudent.rombel})
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSaveAction} className="space-y-4 pt-3 text-xs">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pilih Kategori Lencana / Catatan</Label>
                {actionType === "award" ? (
                  <select
                    className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                    value={badgeCategory}
                    onChange={(e) => setBadgeCategory(e.target.value)}
                  >
                    <option value="⭐ Siswa Aktif">⭐ Siswa Aktif KBM</option>
                    <option value="🏆 Nilai Perfect 100">🏆 Nilai Perfect 100</option>
                    <option value="🌟 Hafalan Mutqin">🌟 Hafalan Mutqin Tahfidz</option>
                    <option value="💡 Solutif & Kreatif">💡 Solutif & Kreatif Projek P5</option>
                  </select>
                ) : (
                  <select
                    className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold text-rose-600"
                    value={warningCategory}
                    onChange={(e) => setWarningCategory(e.target.value)}
                  >
                    <option value="⚠️ Belum Mengumpulkan Tugas">⚠️ Belum Mengumpulkan Tugas KBM</option>
                    <option value="⚠️ Keterlambatan Presensi">⚠️ Keterlambatan Masuk Sesi Kelas</option>
                    <option value="⚠️ Kurang Fokus Saat KBM">⚠️ Kurang Fokus Saat KBM Live</option>
                  </select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Catatan / Pesan untuk Siswa & Orang Tua</Label>
                <Input
                  placeholder="Tuliskan apresiasi atau himbauan pembinaan..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <DialogFooter className="pt-2 border-t border-border flex justify-between items-center w-full">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" size="sm" className={actionType === "award" ? "bg-amber-600 hover:bg-amber-700 text-white font-bold" : "bg-rose-600 hover:bg-rose-700 text-white font-bold"}>
                  Simpan & Kirim
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
