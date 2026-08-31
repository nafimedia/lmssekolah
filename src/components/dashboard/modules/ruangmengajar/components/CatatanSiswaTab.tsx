import { useState, useEffect } from "react";
import { ClipboardList, Plus, Star, AlertTriangle, BookOpen, Rocket, HeartHandshake, CheckCircle2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";

export interface StudentBehaviorNote {
  id: string;
  studentName: string;
  type: "PRESTASI" | "PEMBELAJARAN" | "PERLU_PERHATIAN" | "REMEDIAL" | "PENGAYAAN";
  note: string;
  date: string;
}

interface CatatanSiswaTabProps {
  activeRombel: string;
  activeMapel: string;
}

export function CatatanSiswaTab({ activeRombel, activeMapel }: CatatanSiswaTabProps) {
  const [notes, setNotes] = useState<StudentBehaviorNote[]>([]);

  const [studentInput, setStudentInput] = useState("");
  const [noteType, setNoteType] = useState<StudentBehaviorNote["type"]>("PEMBELAJARAN");
  const [noteText, setNoteText] = useState("");
  const [realStudents, setRealStudents] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      MysqlDataService.getStudentKbmNotes(activeRombel, activeMapel),
      MysqlDataService.getUsers(),
    ]).then(([dbNotes, users]) => {
      if (!isMounted) return;

      const normActive = activeRombel.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
      const is7A = normActive.includes("VIIA") || normActive.includes("7A");
      const is7B = normActive.includes("VIIB") || normActive.includes("7B");
      const is8A = normActive.includes("VIIIA") || normActive.includes("8A");
      const is8B = normActive.includes("VIIIB") || normActive.includes("8B");
      const is9A = normActive.includes("IXA") || normActive.includes("9A");
      const is9B = normActive.includes("IXB") || normActive.includes("9B");

      const siswaList = (users || []).filter((u: any) => u.role === "siswa");
      let matched = siswaList.filter((u: any) => {
        const cls = (u.class_name || u.class || "").toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
        if (is7A) return cls.includes("VIIA") || cls.includes("7A");
        if (is7B) return cls.includes("VIIB") || cls.includes("7B");
        if (is8A) return cls.includes("VIIIA") || cls.includes("8A");
        if (is8B) return cls.includes("VIIIB") || cls.includes("8B");
        if (is9A) return cls.includes("IXA") || cls.includes("9A");
        if (is9B) return cls.includes("IXB") || cls.includes("9B");
        return true;
      });

      const displayList = matched.length > 0 ? matched : siswaList;
      setRealStudents(displayList.map((s: any) => ({ id: String(s.id || Math.random()), name: s.full_name || s.name || s.username })));

      if (dbNotes) {
        setNotes(
          dbNotes.map((n) => ({
            id: n.id || String(Date.now()),
            studentName: n.student_name,
            type: n.type,
            note: n.note,
            date: n.date_str,
          }))
        );
      } else {
        setNotes([]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeRombel, activeMapel]);

  const handleAddNote = async () => {
    if (!studentInput.trim() || !noteText.trim()) {
      return toast.error("Mohon pilih siswa dan tulis catatan observasi KBM!");
    }
    const me = MysqlAuthService.getActiveUser();
    const todayFormatted = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

    const newEntry: StudentBehaviorNote = {
      id: "n_" + Date.now(),
      studentName: studentInput.trim().toUpperCase(),
      type: noteType,
      note: noteText.trim(),
      date: todayFormatted,
    };
    setNotes((prev) => [newEntry, ...prev]);
    setStudentInput("");
    setNoteText("");

    await MysqlDataService.saveStudentKbmNote({
      rombel: activeRombel,
      mapel: activeMapel,
      teacher_name: me?.full_name || "Guru Pengampu",
      student_name: newEntry.studentName,
      type: newEntry.type,
      note: newEntry.note,
      date_str: newEntry.date,
    });

    toast.success(`Catatan untuk ${newEntry.studentName} berhasil disimpan!`);
  };

  const remedialCount = notes.filter((n) => n.type === "REMEDIAL").length;
  const pengayaanCount = notes.filter((n) => n.type === "PENGAYAAN").length;

  return (
    <div className="space-y-4">
      {/* Reflection & Remedial Follow-Up Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Refleksi KBM Hari Ini</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">KBM Berlangsung Sangat Baik</p>
          <p className="text-[11px] text-slate-500">Seluruh indikator TP berhasil dicapai siswa {activeRombel}.</p>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Siswa Perlu Remedial</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">{remedialCount} Siswa Terdokumentasi</p>
          <p className="text-[11px] text-slate-500">Tersambung otomatis ke modul Penilaian & Remedial.</p>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Siswa Siap Pengayaan</span>
            <Rocket className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-slate-100">{pengayaanCount} Siswa Berprestasi</p>
          <p className="text-[11px] text-slate-500">Dapat diberikan modul suplemen pengayaan lanjutan.</p>
        </Card>
      </div>

      {/* Main Student Notes Card */}
      <Card className="border-border shadow-sm bg-card">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" /> Catatan Siswa & Refleksi Pembelajaran ({activeRombel})
          </CardTitle>
          <CardDescription className="text-xs">
            Catat perkembangan, prestasi, atau siswa yang membutuhkan pendampingan khusus selama KBM {activeMapel}.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Quick Note Input Form */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-3">
            <h4 className="text-xs font-bold flex items-center gap-1.5 text-primary">
              <Plus className="h-4 w-4" /> Catat Observasi Siswa Sesi KBM Ini
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {realStudents.length > 0 ? (
                <select
                  className="h-8 rounded-md border border-border bg-background px-3 text-xs font-bold"
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                >
                  <option value="">-- Pilih Siswa --</option>
                  {realStudents.map((st) => (
                    <option key={st.id} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  placeholder="Nama Siswa"
                  value={studentInput}
                  onChange={(e) => setStudentInput(e.target.value)}
                  className="h-8 text-xs font-bold"
                />
              )}

              <select
                className="h-8 rounded-md border border-border bg-background px-3 text-xs font-bold"
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as any)}
              >
                <option value="PEMBELAJARAN">Catatan Pembelajaran</option>
                <option value="PRESTASI">Prestasi & Keaktifan</option>
                <option value="PERLU_PERHATIAN">Perlu Perhatian</option>
                <option value="REMEDIAL">Bimbingan Remedial</option>
                <option value="PENGAYAAN">Pengayaan Lanjutan</option>
              </select>

              <Button size="sm" className="h-8 text-xs font-bold bg-primary text-primary-foreground" onClick={handleAddNote}>
                + Simpan Catatan Siswa
              </Button>
            </div>

            <Textarea
              placeholder="Tuliskan catatan rinci observasi guru saat mengajar..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="text-xs min-h-[60px]"
            />
          </div>

          {/* Student Notes List */}
          <div className="space-y-2.5">
            {notes.map((n) => (
              <div key={n.id} className="p-3 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-foreground">{n.studentName}</span>
                    {n.type === "PRESTASI" && (
                      <Badge className="bg-amber-500 text-white font-bold text-[9px] gap-1">
                        <Star className="h-3 w-3" /> PRESTASI
                      </Badge>
                    )}
                    {n.type === "PEMBELAJARAN" && (
                      <Badge variant="outline" className="font-bold text-[9px] gap-1">
                        <ClipboardList className="h-3 w-3 text-primary" /> CATATAN
                      </Badge>
                    )}
                    {n.type === "PERLU_PERHATIAN" && (
                      <Badge className="bg-red-500 text-white font-bold text-[9px] gap-0.5">
                        <AlertTriangle className="h-3 w-3" /> PERLU PERHATIAN
                      </Badge>
                    )}
                    {n.type === "REMEDIAL" && (
                      <Badge className="bg-amber-600 text-white font-bold text-[9px] gap-0.5">
                        <BookOpen className="h-3 w-3" /> REMEDIAL
                      </Badge>
                    )}
                    {n.type === "PENGAYAAN" && (
                      <Badge className="bg-blue-600 text-white font-bold text-[9px] gap-0.5">
                        <Rocket className="h-3 w-3" /> PENGAYAAN
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{n.note}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground font-mono">{n.date}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                    title="Hapus Catatan Siswa"
                    onClick={async () => {
                      if (confirm(`Hapus catatan untuk ${n.studentName}?`)) {
                        setNotes((prev) => prev.filter((item) => item.id !== n.id));
                        await MysqlDataService.deleteStudentKbmNote(n.id);
                        toast.success(`🗑️ Catatan ${n.studentName} berhasil dihapus!`);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
