import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Award, AlertTriangle, Star, Sparkles, Plus, Search, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export interface ApresiasiSiswaModuleProps {
  activeRole?: string;
  userProfile?: any;
}

export function ApresiasiSiswaModule({ activeRole }: ApresiasiSiswaModuleProps) {
  const [studentsList, setStudentsList] = useState([
    { id: "1", name: "ALIYA QIARA ABDULLAH", rombel: "Kelas VIII A", nis: "12123301000288", badges: ["⭐ Siswa Aktif", "🏆 Nilai Perfect 100"], warningCount: 0 },
    { id: "2", name: "ABIGAIL HASAN YUSUF PRAYOGA", rombel: "Kelas VIII A", nis: "0081928371", badges: ["🌟 Hafalan Mutqin"], warningCount: 0 },
    { id: "3", name: "ADITA AZ ZAHRA", rombel: "Kelas VIII A", nis: "0081928372", badges: ["💡 Solutif & Kreatif"], warningCount: 0 },
    { id: "4", name: "AFRIZA RAHMA AZZAHRA", rombel: "Kelas VIII A", nis: "0081928373", badges: ["⭐ Siswa Aktif"], warningCount: 0 },
  ]);

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
          className="max-w-xs h-8 text-xs bg-background"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="border-border shadow-xs hover:border-primary/50 transition">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-[10px] font-bold">
                  {student.rombel}
                </Badge>
                <div className="flex items-center gap-1.5">
                  {student.warningCount > 0 && (
                    <Badge variant="destructive" className="text-[10px] font-bold gap-1">
                      <AlertTriangle className="h-3 w-3" /> {student.warningCount} Catatan
                    </Badge>
                  )}
                </div>
              </div>
              <CardTitle className="text-base font-bold mt-2">{student.name}</CardTitle>
              <CardDescription className="text-xs font-mono">NISN: {student.nis}</CardDescription>
            </CardHeader>

            <CardContent className="p-4 pt-1 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                  Lencana & Apresiasi:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {student.badges.map((b, idx) => (
                    <Badge key={idx} className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>

              {activeRole !== "siswa" && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-bold gap-1 text-amber-600 border-amber-500/30 hover:bg-amber-500/10 flex-1"
                    onClick={() => handleOpenAction(student, "award")}
                  >
                    <Star className="h-3.5 w-3.5" /> Beri Badge
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-bold gap-1 text-destructive border-destructive/30 hover:bg-destructive/10 flex-1"
                    onClick={() => handleOpenAction(student, "warning")}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" /> Catatan Pembinaan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              {actionType === "award" ? (
                <>
                  <Sparkles className="h-5 w-5 text-amber-500" /> Beri Apresiasi Badge ({selectedStudent?.name})
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" /> Beri Catatan Pembinaan ({selectedStudent?.name})
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {actionType === "award"
                ? "Pilih jenis lencana apresiasi & penghargaan untuk mengapresiasi keaktifan siswa."
                : "Pilih kategori pembinaan untuk memberikan teguran edukatif & motivasi perbaikan."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAction} className="space-y-4 py-2 text-xs">
            {actionType === "award" ? (
              <div>
                <Label className="text-xs font-semibold">Pilih Lencana Apresiasi</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-2 text-xs mt-1"
                  value={badgeCategory}
                  onChange={(e) => setBadgeCategory(e.target.value)}
                >
                  <option value="⭐ Siswa Aktif">⭐ Siswa Aktif KBM</option>
                  <option value="🏆 Nilai Perfect 100">🏆 Nilai Perfect 100</option>
                  <option value="🌟 Hafalan Mutqin">🌟 Hafalan Mutqin Tahfidz</option>
                  <option value="💡 Solutif & Kreatif">💡 Solutif & Kreatif</option>
                  <option value="👑 Bintang Kelas">👑 Bintang Kelas Bulan Ini</option>
                </select>
              </div>
            ) : (
              <div>
                <Label className="text-xs font-semibold">Pilih Kategori Pembinaan</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-2 text-xs mt-1"
                  value={warningCategory}
                  onChange={(e) => setWarningCategory(e.target.value)}
                >
                  <option value="⚠️ Belum Mengumpulkan Tugas">⚠️ Belum Mengumpulkan Tugas</option>
                  <option value="⏱️ Terlambat Masuk Kelas">⏱️ Terlambat Masuk Kelas</option>
                  <option value="💬 Kurang Fokus Saat Pembelajaran">💬 Kurang Fokus Saat KBM</option>
                  <option value="📕 Perlengkapan Belajar Tidak Lengkap">📕 Buku/Perlengkapan Kurang</option>
                </select>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold">Pesan / Catatan Motivasi Guru</Label>
              <Input
                placeholder="Tuliskan catatan apresiasi / motivasi perbaikan..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className={actionType === "award" ? "bg-amber-500 hover:bg-amber-600 text-black font-bold" : "bg-destructive text-destructive-foreground font-bold"}
              >
                {actionType === "award" ? "Kirim Lencana ✨" : "Kirim Catatan ⚠️"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
