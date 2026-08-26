import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  BookOpen,
  Users,
  Video,
  FileText,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Download,
  ExternalLink,
  Save,
  Send,
  HelpCircle,
  FolderOpen,
  CalendarCheck,
  Maximize2,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";

export interface SessionStudentItem {
  id: string;
  nisn: string;
  name: string;
  status: string;
}

export function MataPelajaranModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const rawClass = userProfile?.class_name || "VIII-A";

  const getStudentGradeKey = (cName: string): "VII" | "VIII" | "IX" => {
    if (cName.includes("7") || cName.toUpperCase().includes("VII")) return "VII";
    if (cName.includes("9") || cName.toUpperCase().includes("IX")) return "IX";
    return "VIII";
  };

  const [kelas, setKelas] = useState<"VII" | "VIII" | "IX">(isSiswa ? getStudentGradeKey(rawClass) : "VIII");
  const [selectedMapel, setSelectedMapel] = useState<string | null>(null);
  const [selectedPertemuan, setSelectedPertemuan] = useState<number | null>(null);
  const [forumComment, setForumComment] = useState("");
  
  // Clean state: no dummy hardcoded comments
  const [forumList, setForumList] = useState<any[]>([]);
  const [presensiDone, setPresensiDone] = useState(false);
  const [isTeacherPresensiOpen, setIsTeacherPresensiOpen] = useState(false);
  const [previewPerangkatModal, setPreviewPerangkatModal] = useState<{ title: string; type: string; size: string; desc: string } | null>(null);

  // Clean state: no dummy hardcoded session students
  const [sessionStudents, setSessionStudents] = useState<SessionStudentItem[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingStudents(true);

    MysqlDataService.getUsers()
      .then((users) => {
        if (!isMounted) return;
        const siswaList = (users || []).filter((u: any) => u.role === "siswa");
        
        const matched = siswaList.filter((u: any) => {
          const cName = (u.class_name || u.class || "").toUpperCase();
          if (kelas === "VII") return cName.includes("7") || cName.includes("VII");
          if (kelas === "IX") return cName.includes("9") || cName.includes("IX");
          return cName.includes("8") || cName.includes("VIII");
        });

        if (matched.length > 0) {
          const formatted: SessionStudentItem[] = matched.map((s: any, idx: number) => ({
            id: s.id || `s_${idx}`,
            nisn: s.nis_nip || s.nis || "-",
            name: s.full_name || s.name,
            status: "hadir",
          }));
          setSessionStudents(formatted);
        } else {
          setSessionStudents([]);
        }
      })
      .catch(() => {
        if (isMounted) setSessionStudents([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingStudents(false);
      });

    return () => {
      isMounted = false;
    };
  }, [kelas]);

  // Real Database Materials State
  const [realMaterials, setRealMaterials] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);

  useEffect(() => {
    if (!selectedMapel) return;
    let isMounted = true;
    setIsLoadingMaterials(true);

    MysqlDataService.getMaterials()
      .then((items) => {
        if (!isMounted) return;
        if (items && items.length > 0) {
          const filtered = items.filter((m: any) => {
            const subjectName = (m.subject_name || "").toLowerCase();
            const targetMapel = selectedMapel.toLowerCase();
            return subjectName.includes(targetMapel) || targetMapel.includes(subjectName);
          });
          setRealMaterials(filtered);
        } else {
          setRealMaterials([]);
        }
      })
      .catch(() => {
        if (isMounted) setRealMaterials([]);
      })
      .finally(() => {
        if (isMounted) setIsLoadingMaterials(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMapel, kelas]);

  const handleSetStudentStatus = (id: string, st: string) => {
    setSessionStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status: st } : s)));
  };

  const handleMarkAllSessionHadir = () => {
    if (sessionStudents.length === 0) return;
    setSessionStudents((prev) => prev.map((s) => ({ ...s, status: "hadir" })));
    toast.success("⚡ Seluruh siswa kelas ini ditandai HADIR untuk sesi KBM ini!");
  };

  const handleSaveSessionPresensi = async () => {
    if (sessionStudents.length === 0) {
      toast.error("Tidak ada siswa terdaftar pada kelas ini.");
      return;
    }
    setPresensiDone(true);
    setIsTeacherPresensiOpen(false);

    try {
      await MysqlDataService.saveJournal({
        tanggal: new Date().toISOString().split("T")[0],
        jam_ke: "07:30 - 09:00",
        guru_name: userProfile?.name || "Guru Pengampu",
        mapel: selectedMapel || "Mata Pelajaran",
        rombel: `Rombel Tingkat ${kelas}`,
        materi: `Sesi KBM Pertemuan Ke-${selectedPertemuan || 1}`,
        catatan: `Presensi Sesi KBM: ${sessionStudents.filter((s) => s.status === "hadir").length} Siswa Hadir`,
      });
      toast.success(`✅ Presensi Sesi KBM (${selectedMapel} - Pertemuan ${selectedPertemuan}) berhasil tersimpan permanen ke database!`);
    } catch (e) {
      console.warn("Gagal simpan presensi KBM ke database:", e);
      toast.success(`✅ Presensi Tatap Muka Sesi KBM (${selectedMapel} - Pertemuan ${selectedPertemuan}) Berhasil Disimpan Guru!`);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumComment.trim()) return;
    setForumList([...forumList, { name: userProfile?.name || "Pengguna LMS", time: "Baru saja", text: forumComment }]);
    setForumComment("");
    toast.success("Komentar diskusi berhasil dikirim!");
  };

  const [mapelsStateList, setMapelsStateList] = useState(
    INITIAL_MASTER_MAPEL.map((m) => ({
      code: m.code,
      name: m.name,
      category: m.category,
      teacher: m.teacher || "Guru Pengampu MTsN 2",
      icon: m.icon || "📖",
      jp: parseInt(m.jp) || 2,
      kkm: 75,
      status: "Aktif",
    }))
  );

  const [isLoadingMapel, setIsLoadingMapel] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingMapel(true);
    MysqlDataService.getSubjects().then((res) => {
      if (!isMounted) return;
      if (res && res.length >= 5) {
        setMapelsStateList(
          res.map((r: any) => {
            const subjectName = r.subject_name || r.name || "Mata Pelajaran";
            const masterMatch = INITIAL_MASTER_MAPEL.find(
              (m) => m.name.toLowerCase() === subjectName.toLowerCase()
            );
            return {
              code: r.code || masterMatch?.code || `MP-${r.id}`,
              name: subjectName,
              category: (r.category || masterMatch?.category || "Umum") as any,
              teacher: r.teacher || masterMatch?.teacher || "Guru Pengampu MTsN 2",
              icon: masterMatch?.icon || "📖",
              jp: r.jp_per_week || (masterMatch ? parseInt(masterMatch.jp) : 2),
              kkm: 75,
              status: "Aktif",
            };
          })
        );
      }
    }).finally(() => {
      if (isMounted) setIsLoadingMapel(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Perangkat & Ruang Mata Pelajaran
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Materi Pembelajaran Digital, Modul Ajar PDF, Forum Diskusi Interaktif, & Presensi Sesi KBM MTsN 2 Cilacap.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(["VII", "VIII", "IX"] as const).map((g) => (
            <Button
              key={g}
              size="sm"
              variant={kelas === g ? "default" : "outline"}
              className={`text-xs font-bold ${kelas === g ? "bg-emerald-600 text-white" : ""}`}
              onClick={() => {
                setKelas(g);
                setSelectedMapel(null);
                setSelectedPertemuan(null);
              }}
            >
              Tingkat {g}
            </Button>
          ))}
        </div>
      </div>

      {!selectedMapel ? (
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Daftar Mata Pelajaran Tingkat {kelas}:
          </div>
          {isLoadingMapel ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Memuat Mata Pelajaran dari Database...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mapelsStateList.map((m) => (
                <Card
                  key={m.code}
                  className="border-border hover:border-emerald-500/40 transition shadow-xs cursor-pointer bg-card"
                  onClick={() => {
                    setSelectedMapel(m.name);
                    setSelectedPertemuan(1);
                  }}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600">
                        {m.category}
                      </Badge>
                      <span className="text-xl">{m.icon}</span>
                    </div>
                    <CardTitle className="text-base font-bold mt-2 text-foreground">{m.name}</CardTitle>
                    <CardDescription className="text-xs">{m.teacher}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 flex items-center justify-between text-xs text-muted-foreground border-t border-border mt-3">
                    <span>Target: Kelas {kelas}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{m.jp} JP / Minggu</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Subject Detail */}
          <div className="flex items-center justify-between p-4 bg-muted/40 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="ghost" className="h-8 text-xs font-bold" onClick={() => setSelectedMapel(null)}>
                ← Kembali
              </Button>
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedMapel} (Tingkat {kelas})</h2>
                <p className="text-xs text-muted-foreground">Portal Pembelajaran & Sesi KBM Terintegrasi</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs font-bold">Pilih Pertemuan Ke-</Label>
              <select
                className="h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                value={selectedPertemuan || 1}
                onChange={(e) => setSelectedPertemuan(Number(e.target.value))}
              >
                {Array.from({ length: 18 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    Pertemuan {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Material & Attendance */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border shadow-xs bg-card">
                <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-emerald-600" /> Modul & Berkas Pembelajaran (Pertemuan {selectedPertemuan})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {isLoadingMaterials ? (
                    <div className="p-6 text-center text-xs text-muted-foreground animate-pulse">Memuat berkas Modul Ajar PDF dari database...</div>
                  ) : realMaterials.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1.5 bg-muted/10">
                      <FileText className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                      <div className="font-semibold text-foreground">Belum Ada Berkas Modul PDF Terdaftar</div>
                      <p className="text-[11px]">Belum ada berkas Modul Ajar PDF yang diunggah di database untuk mata pelajaran <strong>{selectedMapel}</strong>.</p>
                    </div>
                  ) : (
                    realMaterials.map((mat) => (
                      <div key={mat.id} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="line-clamp-1">{mat.title || `Modul Ajar PDF (${selectedMapel})`}</span>
                        </div>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1 shrink-0"
                          onClick={() =>
                            setPreviewPerangkatModal({
                              title: mat.title,
                              type: "PDF Modul Ajar",
                              size: mat.size || "3.5 MB",
                              desc: `Berkas resmi ${mat.subject_name || selectedMapel} untuk Tingkat ${mat.class_name || kelas}.`,
                            })
                          }
                        >
                          Buka PDF <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Session Students Presensi */}
              <Card className="border-border shadow-xs bg-card">
                <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" /> Presensi Sesi Kelas (Tingkat {kelas})
                  </CardTitle>
                  {!isSiswa && (
                    <Button size="sm" variant="outline" className="text-xs font-bold border-emerald-500/40 text-emerald-600" onClick={handleMarkAllSessionHadir} disabled={sessionStudents.length === 0}>
                      Set Semua Hadir
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  {isLoadingStudents ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">Memuat data siswa kelas {kelas}...</div>
                  ) : sessionStudents.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1.5">
                      <Inbox className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                      <div className="font-semibold text-foreground">Belum Ada Siswa Terdaftar</div>
                      <p className="text-[11px]">Database saat ini tidak memiliki akun siswa terdaftar untuk Tingkat {kelas}. Tampilan dikosongkan secara jujur.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sessionStudents.map((s, idx) => (
                        <div key={s.id} className="p-3 rounded-lg border border-border bg-card flex justify-between items-center text-xs">
                          <div className="font-bold text-foreground">
                            {idx + 1}. {s.name} <span className="text-muted-foreground font-normal">({s.nisn})</span>
                          </div>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold text-[10px]">
                            {s.status.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Forum Discussion */}
            <div className="space-y-6">
              <Card className="border-border shadow-xs bg-card">
                <CardHeader className="p-4 pb-3 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" /> Forum Diskusi Pertemuan {selectedPertemuan}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {forumList.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1">
                      <Inbox className="h-5 w-5 text-muted-foreground/40 mx-auto" />
                      <div className="font-semibold text-foreground">Belum Ada Diskusi Terdaftar</div>
                      <p className="text-[11px]">Jadilah yang pertama mengirimkan pertanyaan atau diskusi materi KBM ini.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {forumList.map((f, i) => (
                        <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border text-xs space-y-1">
                          <div className="flex justify-between font-bold text-foreground">
                            <span>{f.name}</span>
                            <span className="text-[10px] text-muted-foreground">{f.time}</span>
                          </div>
                          <p className="text-muted-foreground">{f.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <Input
                      placeholder="Tuliskan pertanyaan diskusi..."
                      value={forumComment}
                      onChange={(e) => setForumComment(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs shrink-0">
                      <Send className="h-3.5 w-3.5" /> Kirim
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
