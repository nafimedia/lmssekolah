import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  BookOpen,
  FileText,
  CheckCircle2,
  ExternalLink,
  Upload,
  Inbox,
  Clock,
  AlertTriangle,
  FileCheck,
  UserCheck,
  Check,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";
import { isSubjectAllowedForUser } from "@/services/teacherSubjectAccess";
import { UploadPerangkatDialog } from "./components/UploadPerangkatDialog";

export function MataPelajaranModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const isWaka = activeRole === "waka";
  const isKamad = activeRole === "kamad";
  // Peran supervisi & validasi operasional akademik (Waka Kurikulum, Kamad, Bagian Akademik & Admin)
  const canSupervisePerangkat = activeRole === "waka" || activeRole === "admin_akademik" || activeRole === "admin" || isKamad;
  const isWakaOrKamad = canSupervisePerangkat || isKamad;
  const me = MysqlAuthService.getActiveUser();
  const currentTeacherName = me?.full_name || userProfile?.full_name || userProfile?.name || (me as any)?.name || "Guru Pengampu";

  const rawClass = userProfile?.class_name || "VIII-A";
  const getStudentGradeKey = (cName: string): "VII" | "VIII" | "IX" => {
    if (cName.includes("7") || cName.toUpperCase().includes("VII")) return "VII";
    if (cName.includes("9") || cName.toUpperCase().includes("IX")) return "IX";
    return "VIII";
  };

  const [kelas, setKelas] = useState<"VII" | "VIII" | "IX">(isSiswa ? getStudentGradeKey(rawClass) : "VIII");
  const [selectedMapel, setSelectedMapel] = useState<string | null>(null);

  // Upload Perangkat Dialog States
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadMapelTarget, setUploadMapelTarget] = useState<string | null>(null);
  const [uploadKelasTarget, setUploadKelasTarget] = useState<"VII" | "VIII" | "IX">("VIII");

  const handleOpenUpload = (mapelName?: string | null, gradeName?: "VII" | "VIII" | "IX") => {
    setUploadMapelTarget(mapelName || selectedMapel || null);
    setUploadKelasTarget(gradeName || kelas);
    setIsUploadOpen(true);
  };

  // Dynamic Teacher & Subject Raw Data from MySQL
  const [rawSubjects, setRawSubjects] = useState<any[]>([]);
  const [rawSchedules, setRawSchedules] = useState<any[]>([]);
  const [rawUsers, setRawUsers] = useState<any[]>([]);
  const [isLoadingMapel, setIsLoadingMapel] = useState(true);

  // Real Database Perangkat Materials State
  const [realMaterials, setRealMaterials] = useState<any[]>([]);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [previewModal, setPreviewModal] = useState<any | null>(null);

  // Filter States
  const [jenisFilter, setJenisFilter] = useState<string>("semua");
  const [statusFilter, setStatusFilter] = useState<string>("semua");

  // Load Master Subjects and Dynamic Teacher Assignments from MySQL
  const fetchMapelsAndTeachers = async () => {
    setIsLoadingMapel(true);
    try {
      const [subjects, schedules, users] = await Promise.all([
        MysqlDataService.getSubjects(),
        MysqlDataService.getJadwalPelajaran(),
        MysqlDataService.getUsers(),
      ]);
      setRawSubjects(subjects || []);
      setRawSchedules(schedules || []);
      setRawUsers(users || []);
    } catch (err) {
      console.warn("Fetch mapel error:", err);
    } finally {
      setIsLoadingMapel(false);
    }
  };

  // Helper to test if a schedule entry belongs to the selected grade (VII, VIII, IX)
  const isScheduleMatchingGrade = (s: any, grade: "VII" | "VIII" | "IX") => {
    const rombel = (s.rombel || "").toUpperCase().trim();
    const tingkat = (s.tingkat || "").toUpperCase().trim();
    if (grade === "VII") {
      return rombel.includes("7") || rombel.includes("VII") || tingkat === "VII" || tingkat === "7";
    }
    if (grade === "VIII") {
      return rombel.includes("8") || rombel.includes("VIII") || tingkat === "VIII" || tingkat === "8";
    }
    if (grade === "IX") {
      return rombel.includes("9") || rombel.includes("IX") || tingkat === "IX" || tingkat === "9";
    }
    return true;
  };

  // Helper to match subject names flexibly (handles short names & aliases)
  const isSubjectNameMatch = (schedMapel: string, targetMapel: string) => {
    const s1 = schedMapel.toLowerCase().replace(/[^a-z0-9]/g, "");
    const s2 = targetMapel.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!s1 || !s2) return false;
    if (s1 === s2) return true;

    // Standard school subject aliases
    if ((s1 === "ipa" || s1 === "ilmupendidikanalam") && (s2 === "ipa" || s2 === "ilmupendidikanalam")) return true;
    if ((s1 === "ips" || s1 === "ilmupendidikansosial") && (s2 === "ips" || s2 === "ilmupendidikansosial")) return true;
    if (s1.includes("jawa") && s2.includes("jawa")) return true;
    if ((s1.includes("pjok") || s1.includes("jasmani")) && (s2.includes("pjok") || s2.includes("jasmani"))) return true;
    if ((s1.includes("bk") || s1.includes("bimbingan")) && (s2.includes("bk") || s2.includes("bimbingan"))) return true;
    if ((s1.includes("seni") || s1.includes("prakarya")) && (s2.includes("seni") || s2.includes("prakarya"))) return true;
    if ((s1.includes("quran") || s1.includes("hadis") || s1.includes("hadist")) && (s2.includes("quran") || s2.includes("hadis") || s2.includes("hadist"))) return true;
    if ((s1.includes("akidah") || s1.includes("akhlak")) && (s2.includes("akidah") || s2.includes("akhlak"))) return true;
    if ((s1.includes("sejarah") || s1.includes("ski")) && (s2.includes("sejarah") || s2.includes("ski"))) return true;
    if ((s1.includes("kewarganegaraan") || s1.includes("pkn")) && (s2.includes("kewarganegaraan") || s2.includes("pkn"))) return true;

    return s1.includes(s2) || s2.includes(s1);
  };

  // Smart teacher name deduplication (normalizes honorifics, degrees, and typo tolerance)
  const normalizeTeacherKey = (name: string) => {
    return name
      .toLowerCase()
      .replace(/^(drs\.|dr\.|h\.|hj\.|hjh\.|dra\.)\s+/gi, "")
      .replace(/,\s*(s\.pd|m\.pd|m\.si|m\.ag|s\.ag|m\.pd\.i|s\.p|s\.pd\.i|s\.kom|s)\.?$/gi, "")
      .replace(/[^a-z0-9]/gi, "")
      .replace(/idana/g, "diana") // handle Diana vs Idana typo
      .trim();
  };

  // Dynamic Mapel list computed for the selected Grade (Kelas VII, VIII, IX)
  const mapelsStateList = useMemo(() => {
    const baseList = (rawSubjects && rawSubjects.length >= 5) ? rawSubjects : INITIAL_MASTER_MAPEL;

    return baseList.map((r: any) => {
      const subjectName = r.subject_name || r.name || "Mata Pelajaran";
      const masterMatch = INITIAL_MASTER_MAPEL.find(
        (m) => m.name.toLowerCase() === subjectName.toLowerCase()
      );

      // 1. First priority: Real schedule matching the current grade (Tingkat VII/VIII/IX)
      const gradeSchedules = (rawSchedules || []).filter(
        (s: any) =>
          isScheduleMatchingGrade(s, kelas) &&
          isSubjectNameMatch(s.mapel || "", subjectName) &&
          s.guru &&
          s.guru.trim() !== "-" &&
          s.guru.trim() !== "Belum Ditentukan"
      );

      let foundTeachers: string[] = [];

      if (gradeSchedules.length > 0) {
        // Use ONLY teachers assigned to this grade schedule
        const uniqueGradeMap = new Map<string, string>();
        gradeSchedules.forEach((s: any) => {
          const gName = s.guru.trim();
          const k = normalizeTeacherKey(gName);
          if (!uniqueGradeMap.has(k)) {
            uniqueGradeMap.set(k, gName);
          }
        });
        foundTeachers = Array.from(uniqueGradeMap.values());
      } else {
        // 2. Fallback only if no schedule at all for this grade: check users table for specialists
        const matchingFromUsers = (rawUsers || [])
          .filter(
            (u: any) =>
              u.role !== "siswa" &&
              ((u.subject_specialty && isSubjectNameMatch(u.subject_specialty, subjectName)) ||
                (u.assignedSubject && isSubjectNameMatch(u.assignedSubject, subjectName)))
          )
          .map((u: any) => (u.full_name || u.name).trim());

        const uniqueUsersMap = new Map<string, string>();
        matchingFromUsers.forEach((uName: string) => {
          const k = normalizeTeacherKey(uName);
          if (!uniqueUsersMap.has(k)) {
            uniqueUsersMap.set(k, uName);
          }
        });
        foundTeachers = Array.from(uniqueUsersMap.values());
      }

      // Final teacher string
      const assignedTeacher =
        foundTeachers.length > 0
          ? foundTeachers.join(", ")
          : (r.teacher || masterMatch?.teacher || "Tim Guru Pengampu");

      return {
        code: r.code || masterMatch?.code || `MP-${r.id || Math.random()}`,
        name: subjectName,
        category: r.category || masterMatch?.category || "Umum",
        teacher: assignedTeacher,
        icon: masterMatch?.icon || "📖",
        jp: r.jp_per_week || (masterMatch ? parseInt(masterMatch.jp) : 2),
      };
    });
  }, [kelas, rawSubjects, rawSchedules, rawUsers]);

  // Helper to check whether a subject belongs to the current logged-in teacher
  const isSubjectBelongsToTeacher = (subjectName: string) => {
    if (isWakaOrKamad || isSiswa) return true;

    const teacherKey = normalizeTeacherKey(currentTeacherName);
    const userSpecialty = (me?.subject_specialty || userProfile?.subject_specialty || "").trim();
    const userAssigned = ((me as any)?.assignedSubject || userProfile?.assignedSubject || "").trim();

    // 1. Direct match with user's subject_specialty field
    if (userSpecialty) {
      const parts = userSpecialty.split(",").map((p: string) => p.trim());
      if (parts.some((p: string) => isSubjectNameMatch(p, subjectName))) return true;
    }

    // 2. Direct match with assignedSubject field
    if (userAssigned) {
      const parts = userAssigned.split(",").map((p: string) => p.trim());
      if (parts.some((p: string) => isSubjectNameMatch(p, subjectName))) return true;
    }

    // 3. Check real teaching schedule in rawSchedules
    const hasTeachingSchedule = (rawSchedules || []).some((s: any) => {
      if (!s.guru || !s.mapel) return false;
      const schedTeacherKey = normalizeTeacherKey(s.guru);
      const isTeacher =
        schedTeacherKey === teacherKey ||
        schedTeacherKey.includes(teacherKey) ||
        teacherKey.includes(schedTeacherKey);
      return isTeacher && isSubjectNameMatch(s.mapel, subjectName);
    });
    if (hasTeachingSchedule) return true;

    // 4. Check computed teacher string for this subject in the grade list
    const currentSubjectItem = mapelsStateList.find((m) => isSubjectNameMatch(m.name, subjectName));
    if (currentSubjectItem && currentSubjectItem.teacher) {
      const assignedTeacherKey = normalizeTeacherKey(currentSubjectItem.teacher);
      if (assignedTeacherKey.includes(teacherKey) || teacherKey.includes(assignedTeacherKey)) {
        return true;
      }
    }

    // 5. Fallback helper check (NIP mapping, etc.)
    if (isSubjectAllowedForUser(subjectName, me)) {
      return true;
    }

    return false;
  };

  // Strictly filter subjects: Guru Pengampu ONLY accesses their own assigned subject(s)
  const displayedMapels = useMemo(() => {
    if (isWakaOrKamad || isSiswa) {
      return mapelsStateList;
    }
    return mapelsStateList.filter((m) => isSubjectBelongsToTeacher(m.name));
  }, [mapelsStateList, isWakaOrKamad, isSiswa, currentTeacherName, me, userProfile, rawSchedules]);

  // Security Guard: Prevent unauthorized direct access to subjects outside teacher assignment
  useEffect(() => {
    if (selectedMapel && !isWakaOrKamad && !isSiswa) {
      const isAllowed = displayedMapels.some(
        (m) => m.name.toLowerCase() === selectedMapel.toLowerCase()
      );
      if (!isAllowed && displayedMapels.length > 0) {
        toast.warning("Akses Dibatasi: Anda hanya dapat mengakses mata pelajaran pengampuan Anda.");
        setSelectedMapel(null);
      }
    }
  }, [selectedMapel, displayedMapels, isWakaOrKamad, isSiswa]);

  // Fetch Perangkat Pembelajaran Materials for Selected Subject
  const fetchPerangkatMaterials = async () => {
    if (!selectedMapel) return;
    setIsLoadingMaterials(true);
    try {
      const items = await MysqlDataService.getMaterials();
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
    } catch (e) {
      setRealMaterials([]);
    } finally {
      setIsLoadingMaterials(false);
    }
  };

  useEffect(() => {
    fetchMapelsAndTeachers();
  }, [kelas]);

  useEffect(() => {
    if (selectedMapel) {
      fetchPerangkatMaterials();
    }
  }, [selectedMapel, kelas]);

  // Update Status Pengesahan Waka/Kamad
  const handleUpdateStatus = async (materialId: string, title: string, nextStatus: string) => {
    try {
      const target = realMaterials.find((m) => String(m.id) === String(materialId));
      if (target) {
        await MysqlDataService.saveMaterial({
          ...target,
          status: nextStatus,
        });
        toast.success(`✅ Status pengesahan "${title}" diperbarui menjadi "${nextStatus}"`);
        await fetchPerangkatMaterials();
      }
    } catch (err) {
      toast.error("Gagal memperbarui status pengesahan.");
    }
  };

  const selectedMapelTeacher = useMemo(() => {
    if (!selectedMapel) return "Belum Ada Guru Pengampu";
    const found = mapelsStateList.find((m) => m.name.toLowerCase() === selectedMapel.toLowerCase());
    return found?.teacher || "Belum Ada Guru Pengampu";
  }, [selectedMapel, mapelsStateList]);

  // Filtered Perangkat Materials (Separating Student Reading vs Teacher Admin Documents)
  const filteredMaterials = useMemo(() => {
    return realMaterials.filter((m) => {
      if (isSiswa) {
        const typeLower = (m.type || "").toLowerCase();
        const isTeacherAdmin =
          typeLower.includes("prota") ||
          typeLower.includes("promes") ||
          typeLower.includes("kktp") ||
          typeLower.includes("atp") ||
          typeLower.includes("silabus") ||
          typeLower.includes("kisi");
        if (isTeacherAdmin) return false;
      }
      const matchJenis = jenisFilter === "semua" || (m.type || "").toLowerCase().includes(jenisFilter.toLowerCase());
      const matchStatus =
        isSiswa ||
        statusFilter === "semua" ||
        (statusFilter === "verified" && m.status === "Terverifikasi Waka") ||
        (statusFilter === "pending" && m.status !== "Terverifikasi Waka" && m.status !== "Perlu Revisi") ||
        (statusFilter === "revisi" && m.status === "Perlu Revisi");
      return matchJenis && matchStatus;
    });
  }, [realMaterials, jenisFilter, statusFilter, isSiswa]);

  return (
    <div className="space-y-4">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            {isSiswa
              ? `Materi & Buku Pelajaran Siswa — Tingkat ${kelas}`
              : "Perangkat Pembelajaran & Modul Ajar"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isSiswa
              ? `Akses modul materi, silabus, dan buku pegangan siswa terdaftar tingkat ${kelas}.`
              : "Validasi silabus, RPP, modul ajar, dan kelengkapan perangkat kurikulum madrasah."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isSiswa && (
            <Button
              size="sm"
              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-2xs px-3"
              onClick={() => handleOpenUpload(selectedMapel, kelas)}
            >
              <Upload className="h-3.5 w-3.5" /> Unggah Dokumen
            </Button>
          )}

          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/70 h-8">
            {(["VII", "VIII", "IX"] as const).map((g) => (
              <Button
                key={g}
                size="sm"
                variant={kelas === g ? "default" : "ghost"}
                className={`text-xs font-bold h-6 px-2.5 rounded-lg ${kelas === g ? "bg-emerald-600 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => {
                  setKelas(g);
                  setSelectedMapel(null);
                }}
              >
                Tingkat {g}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Horizontal Compact Metric Strip (~42px) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Mata Pelajaran</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{displayedMapels.length} Mapel</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Tingkat Aktif</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">Tingkat {kelas}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <FileCheck className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Terverifikasi</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
              {realMaterials.filter((m: any) => (m.status || "").includes("Terverifikasi")).length} Dokumen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Status Supervisi</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">Supervisi Aktif</p>
          </div>
        </div>
      </div>

      {/* Main Content: Subject Selection Grid OR Subject Document Table */}
      {!selectedMapel ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {isWakaOrKamad || isSiswa
                ? `Daftar Mata Pelajaran Tingkat ${kelas}:`
                : `Mata Pelajaran Pengampuan Anda — Tingkat ${kelas}:`}
            </div>
            <Badge variant="outline" className="text-xs font-mono text-emerald-600 border-emerald-500/30 font-bold">
              {displayedMapels.length} Mata Pelajaran{isWakaOrKamad || isSiswa ? "" : " Pengampuan"}
            </Badge>
          </div>

          {isLoadingMapel ? (
            <div className="p-12 text-center text-xs text-muted-foreground animate-pulse">
              Memuat data mata pelajaran...
            </div>
          ) : displayedMapels.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-border rounded-2xl bg-card space-y-3">
              <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-foreground">Tidak Ada Mata Pelajaran Pengampuan di Tingkat {kelas}</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Anda tidak memiliki jadwal atau penugasan mengajar di Tingkat {kelas}. Silakan beralih ke jenjang kelas yang Anda ampu (Tingkat VII, VIII, atau IX) pada pilihan di sudut kanan atas.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedMapels.map((m) => (
                <Card
                  key={m.code}
                  className="border-border hover:border-emerald-500/50 transition shadow-xs cursor-pointer bg-card group"
                  onClick={() => setSelectedMapel(m.name)}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600">
                        {m.category}
                      </Badge>
                      <span className="text-xl group-hover:scale-110 transition-transform">{m.icon}</span>
                    </div>
                    <CardTitle className="text-base font-bold mt-2 text-foreground group-hover:text-emerald-600 transition">
                      {m.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-1">
                      👨‍🏫 <span>{m.teacher}</span>
                    </CardDescription>
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
          {/* Selected Subject Header */}
          <div className="p-5 bg-card rounded-2xl border border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <Button size="sm" variant="outline" className="h-9 text-xs font-bold gap-1 shrink-0" onClick={() => setSelectedMapel(null)}>
                ← Kembali
              </Button>
              <div>
                <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
                  <span>📖 {selectedMapel}</span>
                  <Badge className="bg-emerald-600 text-white font-bold text-xs">Tingkat {kelas}</Badge>
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  👨‍🏫 <strong>Guru Pengampu:</strong> <span className="text-foreground font-semibold">{selectedMapelTeacher}</span>
                </p>
              </div>
            </div>

            {!isSiswa && !canSupervisePerangkat && (
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="outline" className="text-xs font-bold border-emerald-500/40 text-emerald-600 bg-emerald-500/10">
                  👨‍🏫 Mata Pelajaran Pengampuan Anda
                </Badge>
              </div>
            )}
          </div>

          {/* Official Perangkat Pembelajaran Documents Table / Student Learning Resources */}
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="p-5 pb-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                  {isSiswa
                    ? `Bahan Ajar & Buku Siswa Digital (${selectedMapel})`
                    : `Berkas Perangkat Pembelajaran & Modul Ajar Resmi (${selectedMapel})`}
                </CardTitle>
                <CardDescription className="text-xs">
                  {isSiswa
                    ? `Koleksi buku teks Kurikulum Merdeka, modul belajar, dan bahan tayang materi ${selectedMapel} untuk Anda pelajari.`
                    : "Modul Ajar, RPP, CP/TP, Silabus, Prota, dan Promes resmi yang membutuhkan status pengesahan Waka Kurikulum."}
                </CardDescription>
              </div>

              {/* Status Filter Buttons & Action */}
              <div className="flex items-center gap-2 flex-wrap">
                {isSiswa ? (
                  <Badge className="bg-emerald-600 text-white text-xs font-bold gap-1 px-3 py-1">
                    <BookOpen className="h-3.5 w-3.5" /> Sumber Belajar Resmi Siswa
                  </Badge>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        size="sm"
                        variant={statusFilter === "semua" ? "default" : "outline"}
                        className={`h-7 text-[11px] font-bold ${statusFilter === "semua" ? "bg-emerald-600 text-white" : ""}`}
                        onClick={() => setStatusFilter("semua")}
                      >
                        Semua ({realMaterials.length})
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === "pending" ? "default" : "outline"}
                        className={`h-7 text-[11px] font-bold ${statusFilter === "pending" ? "bg-amber-600 text-white" : ""}`}
                        onClick={() => setStatusFilter("pending")}
                      >
                        ⏳ Menunggu ({realMaterials.filter((m) => m.status !== "Terverifikasi Waka" && m.status !== "Perlu Revisi").length})
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === "verified" ? "default" : "outline"}
                        className={`h-7 text-[11px] font-bold ${statusFilter === "verified" ? "bg-emerald-600 text-white" : ""}`}
                        onClick={() => setStatusFilter("verified")}
                      >
                        ✅ Disetujui ({realMaterials.filter((m) => m.status === "Terverifikasi Waka").length})
                      </Button>
                    </div>

                    {!isKamad && (
                      <Button
                        size="sm"
                        className="h-7 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-xs"
                        onClick={() => handleOpenUpload(selectedMapel, kelas)}
                      >
                        <Upload className="h-3.5 w-3.5" /> + Unggah Perangkat
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {isLoadingMaterials ? (
                <div className="py-12 text-center text-xs text-muted-foreground animate-pulse">
                  Memuat berkas bahan ajar...
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-border rounded-xl bg-muted/10 space-y-3">
                  <Inbox className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-foreground">
                      {isSiswa
                        ? `Belum Ada Bahan Ajar Digital untuk ${selectedMapel}`
                        : "Belum Ada Dokumen Perangkat Pembelajaran"}
                    </h4>
                    <p className="text-[11px] text-muted-foreground max-w-md mx-auto">
                      {isSiswa
                        ? `Guru pengampu (${selectedMapelTeacher}) belum mengunggah berkas modul atau bahan bacaan digital untuk mata pelajaran ${selectedMapel}.`
                        : `Belum ada berkas Modul Ajar / RPP / Administrasi KBM tersimpan di database untuk mata pelajaran ${selectedMapel} (Tingkat ${kelas}).`}
                    </p>
                  </div>
                  {!isSiswa && !isKamad && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                      onClick={() => handleOpenUpload(selectedMapel, kelas)}
                    >
                      <Upload className="h-3.5 w-3.5" /> Unggah Perangkat Sekarang
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMaterials.map((mat: any) => {
                    const statusStr = (mat.status || "").toLowerCase();
                    const isVerified = statusStr.includes("terverifikasi") || statusStr.includes("disahkan");
                    const isRevisi = mat.status === "Perlu Revisi";

                    return (
                      <div
                        key={mat.id}
                        className="p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600">
                              {isSiswa ? "Bahan Belajar Siswa" : (mat.type || "Modul Ajar / RPP")}
                            </Badge>
                            {!isSiswa && (
                              isVerified ? (
                                <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> {mat.status?.toLowerCase().includes("kamad") || mat.status?.toLowerCase().includes("kepala") ? "Disahkan Kepala Madrasah" : "Disahkan Waka Kurikulum"}
                                </Badge>
                              ) : isRevisi ? (
                                <Badge variant="destructive" className="font-bold text-[10px] gap-1">
                                  <AlertTriangle className="h-3 w-3" /> Perlu Revisi
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 font-bold text-[10px] gap-1">
                                  <Clock className="h-3 w-3" /> Menunggu Pengesahan
                                </Badge>
                              )
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-foreground">{mat.title}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>👨‍🏫 Pengunggah: <strong>{mat.uploaded_by || mat.teacher_name || selectedMapelTeacher}</strong></span>
                            {mat.size && <span>• Ukuran: {mat.size}</span>}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs font-bold gap-1"
                            onClick={() =>
                              setPreviewModal({
                                title: mat.title,
                                type: mat.type || "Bahan Ajar",
                                size: mat.size || "-",
                                file_url: mat.file_url,
                                status: mat.status,
                                uploaded_by: mat.uploaded_by || mat.teacher_name || selectedMapelTeacher,
                              })
                            }
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> {isSiswa ? "Baca Materi (PDF)" : "Buka Dokumen"}
                          </Button>

                          {/* Operational Approval Actions: Waka Kurikulum, Kamad, dan Admin */}
                          {canSupervisePerangkat && (
                            <>
                              {!isVerified && (
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                                  onClick={() => handleUpdateStatus(String(mat.id), mat.title, isKamad ? "Disahkan Kepala Madrasah" : "Terverifikasi Waka")}
                                >
                                  <Check className="h-3.5 w-3.5" /> Sahkan
                                </Button>
                              )}
                              {isVerified && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-amber-500/40 text-amber-600 text-xs font-bold gap-1"
                                  onClick={() => handleUpdateStatus(String(mat.id), mat.title, "Menunggu Pengesahan")}
                                >
                                  <RotateCcw className="h-3.5 w-3.5" /> Batalkan Pengesahan
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Document Preview Modal */}
      {previewModal && (
        <Dialog open={!!previewModal} onOpenChange={() => setPreviewModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" /> Preview Perangkat Pembelajaran
              </DialogTitle>
              <DialogDescription className="text-xs">
                Detail dokumen administrasi KBM {previewModal.title}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl space-y-1">
                <div className="font-bold text-foreground">{previewModal.title}</div>
                <div className="text-muted-foreground">Pengunggah: {previewModal.uploaded_by}</div>
                <div className="text-muted-foreground">Ukuran: {previewModal.size}</div>
                <div className="text-emerald-600 font-bold mt-1">Status: {previewModal.status || "Menunggu Verifikasi Waka"}</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button size="sm" variant="outline" onClick={() => setPreviewModal(null)}>
                Tutup
              </Button>
              {previewModal.file_url && (
                <a href={previewModal.file_url} target="_blank" rel="noreferrer">
                  <Button size="sm" className="bg-emerald-600 text-white font-bold gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> Download / Buka Berkas
                  </Button>
                </a>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      <UploadPerangkatDialog
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        defaultMapel={uploadMapelTarget}
        defaultKelas={uploadKelasTarget}
        allowedSubjectList={
          isWakaOrKamad ? undefined : displayedMapels.map((m) => m.name)
        }
        onSuccess={async () => {
          await fetchPerangkatMaterials();
        }}
      />
    </div>
  );
}
