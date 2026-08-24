import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  UserCheck,
  FileText,
  Eye,
  Download,
  Video,
  PencilLine,
  Upload,
  Plus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { filterSubjectsForUser, isSubjectAllowedForUser } from "@/services/teacherSubjectAccess";
import { GridCardsSkeleton } from "@/components/dashboard/components/ModuleSkeleton";
import { toast } from "sonner";

import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";

export function MataPelajaran({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  return <MataPelajaranModule activeRole={activeRole} userProfile={userProfile} />;
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
  const [forumList, setForumList] = useState([
    { name: "Muhammad Fairuz", time: "10 mnt lalu", text: "Assalamu'alaikum ustadzah, untuk hafalan hadits disetorkan dalam bentuk rekaman audio atau video?" },
    { name: "Dra. Hj. Siti Rahmah, M.Pd", time: "5 mnt lalu", text: "Wa'alaikumsalam Fairuz, boleh berupa rekaman audio MP3 atau video MP4 ya." }
  ]);
  const [presensiDone, setPresensiDone] = useState(false);
  const [isTeacherPresensiOpen, setIsTeacherPresensiOpen] = useState(false);
  const [previewPerangkatModal, setPreviewPerangkatModal] = useState<{ title: string; type: string; size: string; desc: string } | null>(null);

  const perangkatPdfUrl = useMemo(() => {
    if (!previewPerangkatModal) return null;
    const title = previewPerangkatModal.title || "Perangkat Ajar";
    const type = previewPerangkatModal.type || "Format PDF";
    const mapel = selectedMapel || "Mata Pelajaran";
    const pertemuan = selectedPertemuan || 1;

    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources 4 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >>
endobj
5 0 obj
<< /Length 500 >>
stream
BT
/F1 18 Tf
50 740 Td
(MADRASAH TSANAWIYAH NEGERI 2 CILACAP) Tj
/F2 11 Tf
0 -20 Td
(BERKAS MATERI PEMBELAJARAN DIGITAL KBM) Tj
/F1 14 Tf
0 -36 Td
(${title}) Tj
/F2 11 Tf
0 -18 Td
(Mata Pelajaran : ${mapel} | Pertemuan Ke-${pertemuan}) Tj
0 -16 Td
(Format Berkas   : ${type}) Tj
0 -30 Td
(RINGKASAN MATERI PEMBELAJARAN:) Tj
0 -16 Td
(- Penjelasan indikator kompetensi & tujuan pembelajaran pertemuan.) Tj
0 -14 Td
(- Eksplorasi konsep dasar, lembar observasi & latihan mandiri siswa.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000100 00000 n 
0000000200 00000 n 
0000000300 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
850
%%EOF`;
    const blob = new Blob([pdfContent], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  }, [previewPerangkatModal, selectedMapel, selectedPertemuan]);

  const [sessionStudents, setSessionStudents] = useState([
    { id: "s1", nisn: "12123301000288", name: "ALIYA QIARA ABDULLAH", status: "hadir" },
    { id: "s2", nisn: "0081928371", name: "ABIGAIL HASAN YUSUF PRAYOGA", status: "hadir" },
    { id: "s3", nisn: "0081928372", name: "ADITA AZ ZAHRA", status: "hadir" },
    { id: "s4", nisn: "0081928373", name: "AFRIZA RAHMA AZZAHRA", status: "hadir" },
    { id: "s5", nisn: "0081928374", name: "AHMAD ZULFIKAR", status: "hadir" },
  ]);

  const handleSetStudentStatus = (id: string, st: string) => {
    setSessionStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status: st } : s)));
  };

  const handleMarkAllSessionHadir = () => {
    setSessionStudents((prev) => prev.map((s) => ({ ...s, status: "hadir" })));
    toast.success("⚡ Seluruh siswa kelas ini ditandai HADIR untuk sesi KBM ini!");
  };

  const handleSaveSessionPresensi = () => {
    setPresensiDone(true);
    setIsTeacherPresensiOpen(false);
    toast.success(`✅ Presensi Tatap Muka Sesi KBM (${selectedMapel} - Pertemuan ${selectedPertemuan}) Berhasil Disimpan Guru!`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumComment.trim()) return;
    setForumList([...forumList, { name: "Siswa LMS", time: "Baru saja", text: forumComment }]);
    setForumComment("");
    toast.success("Komentar diskusi berhasil dikirim!");
  };

  const [mapelsStateList, setMapelsStateList] = useState(
    INITIAL_MASTER_MAPEL.map((m) => ({
      code: m.code,
      name: m.name,
      category: m.category,
      teacher: m.teacher || "Dra. Hj. Siti Rahmah, M.Pd",
      icon: m.icon || "📖",
      jp: parseInt(m.jp) || 2,
      kkm: 75,
      status: "Aktif",
    }))
  );

  const [isLoadingMapel, setIsLoadingMapel] = useState(true);

  useEffect(() => {
    setIsLoadingMapel(true);
    MysqlDataService.getSubjects().then((res) => {
      if (res && res.length >= 5) {
        setMapelsStateList(
          res.map((r) => {
            const masterMatch = INITIAL_MASTER_MAPEL.find(
              (m) => m.code === r.code || m.name.toLowerCase() === r.name?.toLowerCase()
            );
            return {
              code: r.code,
              name: r.name,
              category: ((r.category && r.category !== "Keagamaan" ? r.category : masterMatch?.category) || "Keagamaan") as any,
              teacher: r.teacher_name || masterMatch?.teacher || "Guru Pengampu",
              icon: r.icon || masterMatch?.icon || "📖",
              jp: r.jp || (masterMatch ? parseInt(masterMatch.jp) : 2),
              kkm: r.kkm || 75,
              status: r.status || "Aktif",
            };
          })
        );
      }
    }).finally(() => setIsLoadingMapel(false));
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");

  const [isAddMapelOpen, setIsAddMapelOpen] = useState(false);
  const [editingMapelCode, setEditingMapelCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputCategory, setInputCategory] = useState("Keagamaan");
  const [inputTeacher, setInputTeacher] = useState("");
  const [inputIcon, setInputIcon] = useState("📖");
  const [inputJp, setInputJp] = useState(2);
  const [inputKkm, setInputKkm] = useState(75);
  const [inputStatus, setInputStatus] = useState("Aktif");
  const [deletingMapel, setDeletingMapel] = useState<any | null>(null);

  const handleOpenAddMapel = () => {
    setEditingMapelCode(null);
    setInputCode(`MP-${String(mapelsStateList.length + 1).padStart(2, "0")}`);
    setInputName("");
    setInputCategory("Keagamaan");
    setInputTeacher("");
    setInputIcon("📖");
    setInputJp(2);
    setInputKkm(75);
    setInputStatus("Aktif");
    setIsAddMapelOpen(true);
  };

  const handleOpenEditMapel = (m: any) => {
    setEditingMapelCode(m.code);
    setInputCode(m.code);
    setInputName(m.name);
    setInputCategory(m.category || "Keagamaan");
    setInputTeacher(m.teacher || "");
    setInputIcon(m.icon || "📖");
    setInputJp(m.jp || 2);
    setInputKkm(m.kkm || 75);
    setInputStatus(m.status || "Aktif");
    setIsAddMapelOpen(true);
  };

  const handleSaveMapel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) {
      toast.error("Mohon isi Nama Mata Pelajaran.");
      return;
    }

    if (editingMapelCode) {
      setMapelsStateList((prev) =>
        prev.map((item) =>
          item.code === editingMapelCode
            ? {
                ...item,
                name: inputName,
                category: inputCategory as any,
                teacher: inputTeacher || "Guru Pengampu",
                icon: inputIcon,
                jp: inputJp,
                kkm: inputKkm,
                status: inputStatus,
              }
            : item
        )
      );
      MysqlDataService.saveSubject({
        code: editingMapelCode,
        name: inputName,
        category: inputCategory,
        teacher_name: inputTeacher,
        icon: inputIcon,
        jp: inputJp,
        kkm: inputKkm,
        status: inputStatus,
      }).catch((err: any) => console.warn("saveSubject DB error:", err));
      toast.success(`✅ Mata Pelajaran "${inputName}" berhasil diperbarui!`);
    } else {
      const newMapel = {
        code: inputCode || `MP-${Date.now()}`,
        name: inputName,
        category: inputCategory as any,
        teacher: inputTeacher || "Guru Pengampu",
        icon: inputIcon || "📖",
        jp: inputJp,
        kkm: inputKkm,
        status: inputStatus,
      };
      setMapelsStateList((prev) => [...prev, newMapel]);
      MysqlDataService.saveSubject({
        code: newMapel.code,
        name: newMapel.name,
        category: newMapel.category,
        teacher_name: newMapel.teacher,
        icon: newMapel.icon,
        jp: newMapel.jp,
        kkm: newMapel.kkm,
        status: newMapel.status,
      }).catch((err: any) => console.warn("saveSubject DB error:", err));
      toast.success(`✨ Mata Pelajaran "${inputName}" berhasil ditambahkan!`);
    }
    setIsAddMapelOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingMapel) return;
    setMapelsStateList((prev) => prev.filter((item) => item.code !== deletingMapel.code));
    MysqlDataService.deleteSubject(deletingMapel.code).catch((err: any) => console.warn("deleteSubject DB error:", err));
    toast.success(`🗑️ Mata Pelajaran "${deletingMapel.name}" berhasil dihapus.`);
    setDeletingMapel(null);
  };

  const visibleMapelsList = useMemo(() => {
    const listFilteredByRole = filterSubjectsForUser(mapelsStateList, userProfile);
    return listFilteredByRole.filter((m) => {
      const matchesCategory = selectedCategoryFilter === "All" || m.category === selectedCategoryFilter;
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.teacher.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [mapelsStateList, selectedCategoryFilter, searchQuery, userProfile]);

  if (selectedMapel && selectedPertemuan !== null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPertemuan(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Pertemuan {selectedMapel}
          </Button>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Pertemuan Ke-{selectedPertemuan}
          </Badge>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
              <span>{selectedMapel}</span> • <span>Pertemuan {selectedPertemuan} dari 18</span>
            </div>
            <CardTitle className="text-xl font-bold">
              {selectedPertemuan === 1 ? "Keutamaan Menuntut Ilmu dalam Hadits Riwayat Muslim" : `Materi Pembelajaran & Latihan Pertemuan ${selectedPertemuan}`}
            </CardTitle>
            <CardDescription>
              Tujuan Pembelajaran: Siswa mampu memahami dan mengamalkan kandungan hadits tentang pentingnya ilmu pengetahuan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isSiswa ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Presensi Kehadiran Pertemuan {selectedPertemuan}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Status Kehadiran Hari Ini: <span className="font-bold text-emerald-600 dark:text-emerald-400">HADIR (Terhubung ke Kalender Presensi Siswa)</span>
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold py-1 px-3">
                  ✅ TERVERIFIKASI KALENDER SISWA
                </Badge>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" /> Presensi Sesi KBM Pertemuan {selectedPertemuan}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {presensiDone
                      ? " Presensi tatap muka pertemuan ini telah diisi & disesuaikan oleh Guru Mapel."
                      : "⚡ Ter-sync otomatis dari Presensi Harian Pagi (30 Hadir, 1 Sakit, 1 Izin). Klik tombol di samping jika ingin menyesuaikan siswa."}
                  </div>
                </div>
                <Button
                  size="sm"
                  className={presensiDone ? "bg-emerald-600 text-white font-bold gap-1.5" : "bg-primary text-primary-foreground font-bold gap-1.5"}
                  onClick={() => setIsTeacherPresensiOpen(true)}
                >
                  <UserCheck className="h-4 w-4" />
                  {presensiDone ? "✅ Presensi Sesi Terdaftar (Edit)" : "🔍 Lihat / Sesuaikan Presensi Jam Ini"}
                </Button>
              </div>
            )}

            <Tabs defaultValue="modul" className="space-y-4">
              <TabsList className="bg-muted p-1 rounded-xl flex flex-wrap h-auto gap-1">
                <TabsTrigger value="modul" className="gap-2">📄 Modul PDF & PPT</TabsTrigger>
                <TabsTrigger value="video" className="gap-2">🎥 Video Tutorial</TabsTrigger>
                <TabsTrigger value="lkpd" className="gap-2">📝 LKPD</TabsTrigger>
                <TabsTrigger value="forum" className="gap-2">💬 Forum Diskusi ({forumList.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="modul" className="space-y-3">
                <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary grid place-items-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Modul_Pembelajaran_Pertemuan_{selectedPertemuan}.pdf</div>
                      <div className="text-xs text-muted-foreground">Ukuran Berkas: 2.4 MB • Format PDF</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-bold border-blue-500/40 text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 gap-1"
                      onClick={() =>
                        setPreviewPerangkatModal({
                          title: `Modul Pembelajaran Pertemuan ${selectedPertemuan}`,
                          type: "Format PDF",
                          size: "2.4 MB",
                          desc: `Modul ajar digital Kurikulum Merdeka mata pelajaran ${selectedMapel} untuk pertemuan ke-${selectedPertemuan}.`,
                        })
                      }
                    >
                      <Eye className="h-3.5 w-3.5" /> Pratinjau
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedMapel) {
    const p1To9 = Array.from({ length: 9 }, (_, i) => i + 1);
    const p10To18 = Array.from({ length: 9 }, (_, i) => i + 10);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
          <Button variant="ghost" size="sm" onClick={() => setSelectedMapel(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog Mata Pelajaran
          </Button>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Kelas {kelas} • 18 Pertemuan
          </Badge>
        </div>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <span>{selectedMapel}</span>
            </CardTitle>
            <CardDescription>
              Struktur Pembelajaran Digital Terpadu MTsN 2 Cilacap (Tahun Ajaran 2026/2027)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {p1To9.map((num) => (
                <Card key={num} className="hover:border-primary/50 transition cursor-pointer" onClick={() => setSelectedPertemuan(num)}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <Badge variant="secondary" className="text-[10px] mb-1">Pertemuan {num}</Badge>
                      <div className="text-sm font-semibold">
                        {num === 1 ? "Keutamaan Menuntut Ilmu" : num === 2 ? "Hafalan Surah Al-Mujadilah" : `Topik Pembelajaran ${num}`}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">Buka</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isSiswa ? (
        <StudentHeaderBanner
          title="Materi & Modul Ajar Saya"
          subtitle="Katalog 18 Mata Pelajaran resmi Kurikulum Merdeka MTsN 2 Cilacap & berkas materi KBM digital"
          icon={BookOpen}
          studentClass={`Kelas ${kelas} A`}
          statusText="Modul Digital Terverifikasi"
          statusVariant="success"
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mata Pelajaran (KBM)</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Katalog Mata Pelajaran Resmi MTsN 2 Cilacap & Akses Perangkat Pembelajaran Merdeka.
            </p>
          </div>

          {(activeRole === "admin" || activeRole === "waka" || activeRole === "kamad") && (
            <Button size="sm" className="gap-1.5 font-bold text-xs" onClick={handleOpenAddMapel}>
              <Plus className="h-4 w-4" /> Kelola / Tambah Mapel
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-2 rounded-xl border border-border">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Keagamaan", "Umum", "Mulok"] as const).map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategoryFilter === cat ? "default" : "ghost"}
              className="text-xs font-bold"
              onClick={() => setSelectedCategoryFilter(cat)}
            >
              {cat === "All" ? "Semua Mapel" : cat}
            </Button>
          ))}
        </div>

        <Input
          placeholder="🔍 Cari mata pelajaran / guru..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8 text-xs max-w-xs bg-background"
        />
      </div>

      {isLoadingMapel ? (
        <GridCardsSkeleton count={6} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleMapelsList.map((m) => (
            <Card key={m.code} className="hover:border-primary/50 transition cursor-pointer shadow-xs" onClick={() => setSelectedMapel(m.name)}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px] font-bold">
                    {m.code}
                  </Badge>
                  <Badge className="bg-primary/20 text-primary text-[10px]">{m.category}</Badge>
                </div>
                <CardTitle className="text-base font-bold mt-2 flex items-center gap-2">
                  <span>{m.icon}</span> <span>{m.name}</span>
                </CardTitle>
                <CardDescription className="text-xs">Guru: {m.teacher}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 flex justify-between items-center text-xs">
                <span className="text-muted-foreground font-mono">{m.jp} JP / Minggu</span>
                <div className="flex items-center gap-1">
                  {(!isSiswa && (activeRole === "admin" || activeRole === "waka" || activeRole === "kamad")) && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditMapel(m);
                        }}
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingMapel(m);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-primary">
                    Buka 18 Pertemuan →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isAddMapelOpen} onOpenChange={setIsAddMapelOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {editingMapelCode ? "Edit Data Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveMapel} className="space-y-4 py-2">
            <div>
              <Label htmlFor="mapel-code" className="text-xs font-semibold">Kode Mapel</Label>
              <Input
                id="mapel-code"
                name="mapelCode"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                required
                className="mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <Label htmlFor="mapel-name" className="text-xs font-semibold">Nama Mata Pelajaran</Label>
              <Input
                id="mapel-name"
                name="mapelName"
                placeholder="Contoh: Fikih / Matematika"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="mapel-category" className="text-xs font-semibold">Kategori</Label>
                <select
                  id="mapel-category"
                  name="mapelCategory"
                  className="w-full h-9 rounded-md border border-border bg-background px-2 text-xs mt-1"
                  value={inputCategory}
                  onChange={(e) => setInputCategory(e.target.value)}
                >
                  <option value="Keagamaan">Keagamaan</option>
                  <option value="Umum">Umum</option>
                  <option value="Mulok">Mulok</option>
                </select>
              </div>

              <div>
                <Label htmlFor="mapel-jp" className="text-xs font-semibold">Jam / Minggu (JP)</Label>
                <Input
                  id="mapel-jp"
                  name="mapelJp"
                  type="number"
                  min={1}
                  max={10}
                  value={inputJp}
                  onChange={(e) => setInputJp(Number(e.target.value))}
                  required
                  className="mt-1 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mapel-teacher" className="text-xs font-semibold">Guru Pengampu Utama</Label>
              <Input
                id="mapel-teacher"
                name="mapelTeacher"
                placeholder="Nama Guru Pengampu S.Pd..."
                value={inputTeacher}
                onChange={(e) => setInputTeacher(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddMapelOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
                {editingMapelCode ? "Simpan Perubahan" : "Simpan Mapel Baru"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
