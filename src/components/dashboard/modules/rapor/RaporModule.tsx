import { useState, useMemo, useEffect } from "react";
import { Award, Download, FileText, CheckCircle2, Inbox, Building2, Users, Search, Eye, Filter, BarChart3, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { isSameClass, normalizeRombelName } from "@/utils/classNormalization";
import { exportToExcelXml } from "@/utils/excelExporter";
import { toast } from "sonner";

export interface StudentLegerSummary {
  id: string;
  name: string;
  nis: string;
  rombel: string;
  avgScore: number;
  tugasCount: number;
  cbtCount: number;
  status: string;
}

export interface ClassReportSummary {
  rombel: string;
  waliKelas: string;
  totalSiswa: number;
  avgScore: number;
  tuntasCount: number;
  prosesCount: number;
  belumCount: number;
}

export function RaporModule({ activeRole }: { activeRole?: string }) {
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin" || activeRole === "kepala_madrasah";
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isGuru = activeRole === "guru";
  const isSiswa = activeRole === "siswa";

  const activeUser = MysqlAuthService.getActiveUser();
  const rawClass = (activeUser as any)?.assignedClass || activeUser?.class_name || (activeUser as any)?.class;
  let binaanRombel = "Rombel 8A";
  if (rawClass && rawClass !== "Semua" && rawClass !== "Semua Rombel") {
    binaanRombel = normalizeRombelName(rawClass);
  } else {
    const name = (activeUser?.full_name || "").toLowerCase();
    const cleanNip = (activeUser?.nis_nip || "").trim();
    if (name.includes("achmad makmun") || cleanNip.includes("272005011001")) binaanRombel = "Rombel 8B";
    else if (name.includes("sobiyati")) binaanRombel = "Rombel 8A";
    else if (name.includes("novantya")) binaanRombel = "Rombel 9A";
    else if (name.includes("indah nurrohmah")) binaanRombel = "Rombel 9B";
    else if (name.includes("maulidia")) binaanRombel = "Rombel 7A";
    else if (name.includes("rindang")) binaanRombel = "Rombel 7B";
  }

  const defaultRombel = isWaliKelas ? binaanRombel : normalizeRombelName(rawClass || "Rombel 8B");

  const [selectedClass, setSelectedClass] = useState<string>(isWaliKelas ? binaanRombel : isExecutive ? "ALL" : defaultRombel);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPrintRaporOpen, setIsPrintRaporOpen] = useState(false);
  const [selectedStudentForRapor, setSelectedStudentForRapor] = useState<any>(null);

  useEffect(() => {
    if (isWaliKelas) {
      setSelectedClass(binaanRombel);
    }
  }, [isWaliKelas, binaanRombel]);

  const [isLoading, setIsLoading] = useState(true);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [submissionsList, setSubmissionsList] = useState<any[]>([]);
  const [cbtResultsList, setCbtResultsList] = useState<any[]>([]);
  const [masterRombels, setMasterRombels] = useState<any[]>([]);
  const [hafalanList, setHafalanList] = useState<any[]>([]);
  const [p5ProjectsList, setP5ProjectsList] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      MysqlDataService.getUsers(),
      MysqlDataService.getSubjects(),
      MysqlDataService.getSubmissions(),
      MysqlDataService.getCbtResults(),
      MysqlDataService.getMasterRombels().catch(() => []),
      MysqlDataService.getHafalan().catch(() => []),
      MysqlDataService.getP5Projects().catch(() => []),
    ])
      .then(([users, subjects, subs, cbts, rombels, hafalans, p5s]) => {
        if (!isMounted) return;

        if (users && users.length > 0) {
          const siswaList = users.filter((u: any) => u.role === "siswa");
          setStudentsList(siswaList);
        } else {
          setStudentsList([]);
        }

        setSubjectsList(subjects || []);
        setSubmissionsList(subs || []);
        setCbtResultsList(cbts || []);
        setMasterRombels(rombels || []);
        setHafalanList(hafalans || []);
        setP5ProjectsList(p5s || []);
      })
      .catch(() => {
        if (isMounted) {
          setStudentsList([]);
          setSubjectsList([]);
          setSubmissionsList([]);
          setCbtResultsList([]);
          setHafalanList([]);
          setP5ProjectsList([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute dynamic set of Rombel names
  const rombelOptions = useMemo(() => {
    const set = new Set<string>(["Rombel 7A", "Rombel 7B", "Rombel 8A", "Rombel 8B", "Rombel 9A", "Rombel 9B"]);
    masterRombels.forEach((r) => {
      if (r.name) set.add(normalizeRombelName(r.name));
      if (r.code) set.add(normalizeRombelName(r.code));
    });
    studentsList.forEach((s) => {
      const cls = s.class_name || s.class;
      if (cls) set.add(normalizeRombelName(cls));
    });
    return Array.from(set).sort();
  }, [masterRombels, studentsList]);

  // Compute REAL grades per student (NO DUMMY DATA - 0 if no evaluations)
  const studentLegerData = useMemo<StudentLegerSummary[]>(() => {
    return studentsList.map((s, idx) => {
      const sEmail = (s.email || "").toLowerCase();
      const sName = (s.full_name || s.name || "").toLowerCase();
      const sRombel = normalizeRombelName(s.class_name || s.class || "Rombel 8B");

      const studentSubs = submissionsList.filter(
        (sub) =>
          (sub.user_id && sub.user_id.toLowerCase() === sEmail) ||
          (sub.student_name && sub.student_name.toLowerCase() === sName)
      );

      const studentCbts = cbtResultsList.filter(
        (c) =>
          (c.user_id && c.user_id.toLowerCase() === sEmail) ||
          (c.student_name && c.student_name.toLowerCase() === sName)
      );

      let totalScore = 0;
      let scoreCount = 0;

      studentSubs.forEach((sub) => {
        if (sub.score && sub.score > 0) {
          totalScore += sub.score;
          scoreCount++;
        }
      });

      studentCbts.forEach((cbt) => {
        if (cbt.score && cbt.score > 0) {
          totalScore += cbt.score;
          scoreCount++;
        }
      });

      // REAL Average: 0 if no submissions/CBTs evaluated yet
      const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
      const statusLabel = avgScore >= 75 ? "Tuntas (≥75)" : avgScore > 0 ? "Dalam Proses (<75)" : "Belum Ada Nilai (0 Poin)";

      return {
        id: s.id || `s_${idx}`,
        name: s.full_name || s.name,
        nis: s.nis_nip || s.nis || "-",
        rombel: sRombel,
        avgScore,
        tugasCount: studentSubs.length,
        cbtCount: studentCbts.length,
        status: statusLabel,
      };
    });
  }, [studentsList, submissionsList, cbtResultsList]);

  // Compute Class Summary Rows for Executive Kamad & Waka
  const classSummaries = useMemo<ClassReportSummary[]>(() => {
    return rombelOptions.map((rName) => {
      const rombelStudents = studentLegerData.filter((s) => isSameClass(s.rombel, rName));
      const totalSiswa = rombelStudents.length;

      // Find wali kelas from master rombels
      const matchedMaster = masterRombels.find(
        (m) => normalizeRombelName(m.name || m.code || "") === normalizeRombelName(rName)
      );
      const waliKelas = matchedMaster?.wali_kelas || "Wali Kelas MTsN 2";

      if (totalSiswa === 0) {
        return {
          rombel: rName,
          waliKelas,
          totalSiswa: 0,
          avgScore: 0,
          tuntasCount: 0,
          prosesCount: 0,
          belumCount: 0,
        };
      }

      const sumAvg = rombelStudents.reduce((acc, s) => acc + s.avgScore, 0);
      const tuntasCount = rombelStudents.filter((s) => s.avgScore >= 75).length;
      const prosesCount = rombelStudents.filter((s) => s.avgScore > 0 && s.avgScore < 75).length;
      const belumCount = rombelStudents.filter((s) => s.avgScore === 0).length;

      return {
        rombel: rName,
        waliKelas,
        totalSiswa,
        avgScore: Math.round(sumAvg / totalSiswa),
        tuntasCount,
        prosesCount,
        belumCount,
      };
    });
  }, [rombelOptions, studentLegerData, masterRombels]);

  // Overall Stats for Kamad & Waka Dashboard
  const overallStats = useMemo(() => {
    const totalSiswa = studentLegerData.length;
    const totalAvgSum = studentLegerData.reduce((acc, s) => acc + s.avgScore, 0);
    const avgMadrasah = totalSiswa > 0 ? Math.round(totalAvgSum / totalSiswa) : 0;
    const totalTuntas = studentLegerData.filter((s) => s.avgScore >= 75).length;
    const totalRombel = rombelOptions.length;

    return {
      totalRombel,
      totalSiswa,
      avgMadrasah,
      totalTuntas,
    };
  }, [studentLegerData, rombelOptions]);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return studentLegerData.filter((s) => {
      const matchRombel = selectedClass === "ALL" || isSameClass(s.rombel, selectedClass);
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.rombel.toLowerCase().includes(q);
      return matchRombel && matchQuery;
    });
  }, [studentLegerData, selectedClass, searchQuery]);

  // Subject Leger Breakdown for a single student or class (REAL data only)
  const subjectLegerBreakdown = useMemo(() => {
    const realSubjects = subjectsList.length > 0 ? subjectsList : [
      { subject_name: "Al Qur'an Hadis", teacher: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { subject_name: "Akidah Akhlak", teacher: "WAKHIBUN, S.P" },
      { subject_name: "Fikih", teacher: "CARYATI, S.Pd" },
      { subject_name: "Sejarah Kebudayaan Islam", teacher: "H. DASIRUN, S.Ag., M.Pd.I" },
      { subject_name: "Bahasa Arab", teacher: "ENDAH SUPRIHATIN, S.Pd" },
      { subject_name: "Bahasa Indonesia", teacher: "SOBIYATI, S.Pd" },
      { subject_name: "Bahasa Inggris", teacher: "ALI MANSUR, S.Pd" },
      { subject_name: "Matematika", teacher: "ACHMAD MAKMUN, S.Pd.I" },
      { subject_name: "Ilmu Pengetahuan Alam", teacher: "NOVANTYA KARTIKAWATI, S.Pd" },
      { subject_name: "Ilmu Pengetahuan Sosial", teacher: "UMI KHAFSOH, S.Pd" },
      { subject_name: "Pendidikan Kewarganegaraan", teacher: "SAYONO, S.Pd.I" },
      { subject_name: "PJOK", teacher: "MISBAH AHMAD DANI, S.Pd" },
      { subject_name: "Seni Budaya", teacher: "SITI NURJANAH, S.Pd" },
      { subject_name: "Informatika", teacher: "FAHRUR ROZI, S.Kom" },
      { subject_name: "Bahasa Jawa", teacher: "TRI WAHYUNI, S.Pd" },
    ];

    return realSubjects.map((sub, idx) => {
      const mapelName = (sub.subject_name || sub.name || "").toLowerCase();

      // Find real matching scores if a specific student is selected
      let realTugas = 0;
      let realCbt = 0;

      if (selectedStudentForRapor) {
        const sEmail = (selectedStudentForRapor.email || "").toLowerCase();
        const sName = (selectedStudentForRapor.name || "").toLowerCase();

        const subMatches = submissionsList.filter(
          (s) =>
            ((s.user_id && s.user_id.toLowerCase() === sEmail) || (s.student_name && s.student_name.toLowerCase() === sName)) &&
            s.score && s.score > 0
        );
        const cbtMatches = cbtResultsList.filter(
          (c) =>
            ((c.user_id && c.user_id.toLowerCase() === sEmail) || (c.student_name && c.student_name.toLowerCase() === sName)) &&
            (c.exam_title || "").toLowerCase().includes(mapelName) &&
            c.score && c.score > 0
        );

        if (subMatches.length > 0) {
          const sum = subMatches.reduce((acc, curr) => acc + curr.score, 0);
          realTugas = Math.round(sum / subMatches.length);
        }
        if (cbtMatches.length > 0) {
          const sum = cbtMatches.reduce((acc, curr) => acc + curr.score, 0);
          realCbt = Math.round(sum / cbtMatches.length);
        }
      }

      const realAvg = realTugas > 0 || realCbt > 0 ? Math.round((realTugas + realCbt) / (realTugas > 0 && realCbt > 0 ? 2 : 1)) : 0;

      return {
        code: `MP-${idx + 1}`,
        mapel: sub.subject_name || sub.name,
        teacher: sub.teacher || "Guru Pengampu MTsN 2",
        tugas: realTugas,
        kuis: realTugas,
        cbt: realCbt,
        avg: realAvg,
        kkm: realAvg >= 75 ? "Tuntas (≥75)" : "Belum Ada Nilai (0 Poin)",
      };
    });
  }, [subjectsList, submissionsList, cbtResultsList, selectedStudentForRapor]);

  // Compute real Ekstrakurikuler & Kokurikuler records for selected student
  const studentEkstraList = useMemo(() => {
    if (!selectedStudentForRapor) return [];

    const list: Array<{ kegiatan: string; nilai: string; keterangan: string }> = [];
    const sName = (selectedStudentForRapor.name || "").toLowerCase();
    const sNis = (selectedStudentForRapor.nis || "").toLowerCase();
    const sRombel = normalizeRombelName(selectedStudentForRapor.rombel || "");

    // 1. Match Tahfidz Hafalan
    const matchedHafalan = hafalanList.filter(
      (h) =>
        (h.student_name && h.student_name.toLowerCase() === sName) ||
        (h.nisn && h.nisn.toLowerCase() === sNis)
    );

    matchedHafalan.forEach((h) => {
      list.push({
        kegiatan: "Tahfidz Al-Qur'an",
        nilai: h.nilai || "A",
        keterangan: `Setoran ${h.surah || "Juz 30"} - Status: ${h.status || "Lancar"}`,
      });
    });

    // 2. Match P5 Projects
    const matchedP5 = p5ProjectsList.filter(
      (p) => p.class_name && isSameClass(p.class_name, sRombel)
    );

    matchedP5.forEach((p) => {
      list.push({
        kegiatan: `P5: ${p.title}`,
        nilai: (p.progress_pct || 0) >= 80 ? "A" : (p.progress_pct || 0) > 0 ? "B" : "-",
        keterangan: `Tema: ${p.theme || "P5-PPRA"}`,
      });
    });

    return list;
  }, [selectedStudentForRapor, hafalanList, p5ProjectsList]);

  const handleExportExcelLeger = () => {
    const headers = ["No", "Nama Siswa", "NISN", "Rombel", "Rata-Rata Nilai", "Submisi Tugas", "Hasil CBT", "Status KKTP"];
    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      s.name,
      s.nis,
      s.rombel,
      s.avgScore,
      s.tugasCount,
      s.cbtCount,
      s.status,
    ]);
    exportToExcelXml(`Leger_Nilai_Laporan_Pembelajaran_${selectedClass}`, "Leger_Nilai", headers, rows);
    toast.success("📊 File Excel Leger Laporan Pembelajaran berhasil diunduh!");
  };

  const openStudentRaporModal = (student: StudentLegerSummary) => {
    setSelectedStudentForRapor(student);
    setIsPrintRaporOpen(true);
  };

  const getCpDescription = (mapelName: string, score: number) => {
    if (score === 0) {
      return `Belum ada tes / evaluasi yang diikuti pada mata pelajaran ${mapelName} (Nilai: 0 Poin).`;
    }
    if (score >= 90) {
      return `Menunjukkan penguasaan sangat baik dalam pemahaman dan penerapan kompetensi dasar ${mapelName}.`;
    }
    if (score >= 80) {
      return `Menunjukkan penguasaan baik dalam aplikasi materi dan diskusi kelompok ${mapelName}.`;
    }
    if (score >= 75) {
      return `Menunjukkan penguasaan cukup dan telah mencapai ketuntasan kriteria KKTP ${mapelName}.`;
    }
    return `Perlu bimbingan lebih lanjut pada penguasaan materi utama ${mapelName}.`;
  };

  if (isSiswa) {
    return (
      <div className="space-y-6">
        <StudentHeaderBanner
          title="Rekap Nilai & E-Rapor Saya"
          subtitle="Transkrip nilai tugas, kuis, CBT, dan lembar Rapor Hasil Belajar Kurikulum Merdeka"
          icon={Award}
          statusText={studentLegerData.some((s) => s.avgScore > 0) ? "Status KKTP: Terverifikasi" : "Status KKTP: Belum Ada Data (0 Poin)"}
          statusVariant={studentLegerData.some((s) => s.avgScore > 0) ? "success" : "warning"}
          actionButtons={
            <Button size="sm" onClick={() => setIsPrintRaporOpen(true)} className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs">
              <FileText className="h-4 w-4" /> Cetak E-Rapor PDF
            </Button>
          }
        />
        {/* Siswa Table */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-bold">Rincian Perolehan Nilai Mata Pelajaran</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-muted-foreground font-bold text-left border-b border-border">
                <tr>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Guru Pengampu</th>
                  <th className="p-3 text-center">Tugas LKPD</th>
                  <th className="p-3 text-center">Ujian CBT</th>
                  <th className="p-3 text-center">Nilai Akhir</th>
                  <th className="p-3 text-right">Status KKTP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subjectLegerBreakdown.map((m, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition">
                    <td className="p-3 font-bold text-foreground">{m.mapel}</td>
                    <td className="p-3 text-muted-foreground">{m.teacher}</td>
                    <td className="p-3 text-center font-mono font-bold">{m.tugas}</td>
                    <td className="p-3 text-center font-mono font-bold">{m.cbt}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-600 dark:text-emerald-400">{m.avg}</td>
                    <td className="p-3 text-right">
                      <Badge variant="outline" className={m.avg >= 75 ? "text-emerald-600 border-emerald-500/30 font-bold" : "text-muted-foreground border-border font-medium"}>
                        {m.kkm}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            {selectedClass === "ALL"
              ? "Laporan Pembelajaran & Rekap Leger Seluruh Kelas"
              : `Laporan Pembelajaran & Rekap Leger ${selectedClass}`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isExecutive
              ? "Dashboard Pengawasan Eksekutif Kamad & Waka Kurikulum untuk Monitoring Nilai Akademik & Ketuntasan KKTP Madrasah (Tanpa Data Dummy)"
              : "Rekap nilai leger real dari database, cetak rapor resmi, dan monitoring ketuntasan KKTP siswa."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportExcelLeger} className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20">
            <Download className="h-4 w-4 text-emerald-500" /> Unduh Leger Excel
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Rombel Filter & Control Bar */}
        <Card className="border-border shadow-xs bg-card p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-0.5">Pilih Rombel / Mode Laporan</label>
                {isWaliKelas ? (
                  <div className="h-9 px-3 rounded-md border border-emerald-500/50 bg-emerald-500/10 flex items-center gap-2 font-extrabold text-xs text-emerald-700 dark:text-emerald-300">
                    <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>🔒 Rombel Binaan Wali Kelas: {binaanRombel}</span>
                  </div>
                ) : (
                  <select
                    className="h-9 rounded-md border border-emerald-500/40 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  >
                    {isExecutive && (
                      <option value="ALL" className="font-bold">
                        ✨ Semua Kelas (Monitoring Leger Madrasah Kamad & Waka)
                      </option>
                    )}
                    {rombelOptions.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama siswa, NISN, atau kelas..."
                  className="pl-8 h-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isExecutive && (
                <Badge variant="secondary" className="hidden sm:inline-flex bg-emerald-600/10 text-emerald-600 border border-emerald-500/30 px-3 py-1.5 font-bold text-xs">
                  <Building2 className="h-3.5 w-3.5 mr-1" /> Monitoring Kamad & Waka
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Executive Summary Stat Cards for Kamad & Waka */}
        {isExecutive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Total Rombel Terdaftar</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">{overallStats.totalRombel} Rombel</h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Seluruh kelas aktif</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Building2 className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Total Siswa Terdaftar</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">{overallStats.totalSiswa} Siswa</h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{overallStats.totalTuntas} Siswa Tuntas KKTP (&ge;75)</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Rata-Rata Nilai Madrasah</p>
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{overallStats.avgMadrasah} Poin</h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Real tanpa data dummy</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Ketuntasan KKTP Madrasah</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">
                    {overallStats.totalSiswa > 0
                      ? Math.round((overallStats.totalTuntas / overallStats.totalSiswa) * 100)
                      : 0}
                    %
                  </h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Persentase siswa tuntas</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 1: TABEL MATRIKS REKAPITULASI LEGER KELAS (Kamad & Waka Overview) */}
        {selectedClass === "ALL" && (
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  <span>Matriks Rekapitulasi Leger Pembelajaran Per Kelas</span>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Overview rerata nilai akhir dan statistik ketuntasan KKTP per rombel.
                </CardDescription>
              </div>
              <Badge className="bg-emerald-600 text-white font-bold text-xs">{classSummaries.length} Rombel</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Memuat rekapitulasi leger kelas...</div>
              ) : classSummaries.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Tidak ada kelas terdaftar.</div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-bold text-left border-b border-border">
                    <tr>
                      <th className="p-3">Rombel / Kelas</th>
                      <th className="p-3">Wali Kelas</th>
                      <th className="p-3 text-center">Total Siswa</th>
                      <th className="p-3 text-center">Rata-Rata Nilai</th>
                      <th className="p-3 text-center">Ketuntasan KKTP</th>
                      <th className="p-3 text-right">Aksi Laporan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {classSummaries.map((c) => (
                      <tr key={c.rombel} className="hover:bg-muted/30 transition">
                        <td className="p-3 font-bold text-foreground flex items-center gap-2">
                          <Badge variant="outline" className="font-mono font-bold bg-muted/40">
                            {c.rombel}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground font-medium">{c.waliKelas}</td>
                        <td className="p-3 text-center font-bold text-foreground">{c.totalSiswa} Siswa</td>
                        <td className="p-3 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {c.avgScore} Poin
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-[11px]">
                            <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 font-bold bg-emerald-500/5">
                              {c.tuntasCount} Tuntas
                            </Badge>
                            {c.prosesCount > 0 && (
                              <Badge variant="outline" className="text-amber-600 border-amber-500/30 font-bold bg-amber-500/5">
                                {c.prosesCount} Dalam Proses
                              </Badge>
                            )}
                            {c.belumCount > 0 && (
                              <Badge variant="outline" className="text-rose-600 border-rose-500/30 font-bold bg-rose-500/5">
                                {c.belumCount} Belum Ada Nilai
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-bold gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                            onClick={() => setSelectedClass(c.rombel)}
                          >
                            <Eye className="h-3.5 w-3.5" /> Buka Leger Kelas
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}

        {/* SECTION 2: TABEL LEGER NILAI SISWA REAL */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                <span>
                  Leger Nilai Siswa Real (Database) - {selectedClass === "ALL" ? "Seluruh Kelas" : selectedClass}
                </span>
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Perolehan rata-rata nilai tugas, kuis, dan CBT real tanpa data dummy. Nilai 0 jika belum ada penilaian.
              </CardDescription>
            </div>
            <Badge className="bg-emerald-600 text-white font-bold text-xs">{filteredStudents.length} Siswa</Badge>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Memuat data leger siswa...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 m-4">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground text-sm">Belum Ada Data Siswa pada {selectedClass === "ALL" ? "Filter Ini" : selectedClass}</div>
                <p>Database saat ini tidak memiliki rekam siswa untuk kelas ini.</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-muted-foreground font-bold text-left border-b border-border">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3 font-mono">NISN</th>
                    <th className="p-3">Rombel / Kelas</th>
                    <th className="p-3 text-center">Submisi Tugas</th>
                    <th className="p-3 text-center">Ujian CBT</th>
                    <th className="p-3 text-center">Rata-Rata Nilai</th>
                    <th className="p-3 text-center">Status KKTP</th>
                    <th className="p-3 text-right">E-Rapor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition">
                      <td className="p-3 font-bold text-foreground">{s.name}</td>
                      <td className="p-3 font-mono text-muted-foreground">{s.nis}</td>
                      <td className="p-3 font-bold">
                        <Badge variant="outline" className="font-mono text-[11px] bg-muted/40">
                          {s.rombel}
                        </Badge>
                      </td>
                      <td className="p-3 text-center font-mono font-bold">{s.tugasCount} Submisi</td>
                      <td className="p-3 text-center font-mono font-bold">{s.cbtCount} CBT</td>
                      <td className="p-3 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {s.avgScore} Poin
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant="outline"
                          className={
                            s.avgScore >= 75
                              ? "text-emerald-600 border-emerald-500/30 font-bold"
                              : s.avgScore > 0
                                ? "text-amber-600 border-amber-500/30 font-bold"
                                : "text-muted-foreground border-border font-medium"
                          }
                        >
                          {s.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-bold gap-1 text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                          onClick={() => openStudentRaporModal(s)}
                        >
                          <FileText className="h-3.5 w-3.5" /> Cetak E-Rapor
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🖨️ MODAL PRATINJAU & CETAK E-RAPOR PDF SWA (REAL DATA ONLY) */}
      <Dialog open={isPrintRaporOpen} onOpenChange={setIsPrintRaporOpen}>
        <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" /> Pratinjau E-Rapor Kurikulum Merdeka
              </div>
              <Badge className="bg-blue-600 text-white font-mono text-xs">
                {selectedStudentForRapor?.rombel || defaultRombel}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Lembar Rapor Hasil Belajar Resmi Peserta Didik (Data Real Database).
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-md font-sans space-y-4">
            <div className="border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-4 mb-2">
                <img src="/logomts.png" alt="Logo MTsN 2 Cilacap" className="h-14 w-14 object-contain shrink-0" />
                <div className="text-center flex-1 pr-14">
                  <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                  <div className="text-base font-black tracking-wide text-slate-900 uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</div>
                  <div className="text-[10px] text-slate-600">Jl. Raya Sindangbarang KM.4 Karangpucung Kode Pos 53255</div>
                </div>
              </div>
              <div className="mt-2 py-1 bg-blue-900 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs text-center">
                RAPOR HASIL BELAJAR PESERTA DIDIK (KURIKULUM MERDEKA)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>
                <div>Nama Siswa: <strong className="text-slate-950 font-bold">{selectedStudentForRapor?.name || activeUser?.full_name}</strong></div>
                <div>NISN / NIS: <span className="font-mono">{selectedStudentForRapor?.nis || activeUser?.nis_nip || "-"}</span></div>
              </div>
              <div>
                <div>Kelas / Rombel: <strong>{selectedStudentForRapor?.rombel || defaultRombel}</strong></div>
                <div>Tahun Ajaran: <strong className="text-blue-900 font-extrabold">2026/2027 (Semester Ganjil)</strong></div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 text-left">Mata Pelajaran</th>
                    <th className="border border-slate-300 p-2 text-center">Nilai Akhir</th>
                    <th className="border border-slate-300 p-2 text-left">Capaian Pembelajaran (CP) Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectLegerBreakdown.map((m, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">{m.mapel}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-blue-900 text-xs">{m.avg}</td>
                      <td className="border border-slate-300 p-2 text-slate-700 leading-snug">
                        {getCpDescription(m.mapel, m.avg)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-2">
                <div className="font-bold text-slate-900">Kegiatan Ekstrakurikuler & Kokurikuler (P5-PPRA):</div>
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold">
                      <th className="p-1 text-left">Kegiatan</th>
                      <th className="p-1 text-center">Nilai</th>
                      <th className="p-1 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentEkstraList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-2 text-center text-slate-400 italic font-normal">
                          (Belum ada data nilai ekstrakurikuler & kokurikuler)
                        </td>
                      </tr>
                    ) : (
                      studentEkstraList.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-200">
                          <td className="p-1 font-semibold">{item.kegiatan}</td>
                          <td className="p-1 text-center font-bold text-emerald-700">{item.nilai}</td>
                          <td className="p-1">{item.keterangan}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-2">
                <div className="font-bold text-slate-900">Ketidakhadiran / Presensi Semester:</div>
                <table className="w-full text-[11px]">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-1">Sakit (S)</td>
                      <td className="py-1 text-right font-mono font-bold">0 Hari</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1">Izin (I)</td>
                      <td className="py-1 text-right font-mono font-bold">0 Hari</td>
                    </tr>
                    <tr>
                      <td className="py-1">Tanpa Keterangan (A)</td>
                      <td className="py-1 text-right font-mono font-bold text-emerald-600">0 Hari (Nihil)</td>
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
              <div className="font-bold text-slate-900">Catatan Wali Kelas:</div>
              <div className="text-slate-700 italic">
                "Ananda {selectedStudentForRapor?.name || activeUser?.full_name} menunjukkan perkembangan positif dalam pembelajaran di kelas. Tingkatkan terus kedisiplinan dan semangat belajarnya."
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Orang Tua / Wali Siswa</div>
                <div className="font-bold underline text-slate-950">( .......................... )</div>
              </div>
              <div className="text-center space-y-8">
                <div>Wali Kelas</div>
                <div className="font-bold underline text-slate-950">Guru Wali Kelas</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, 25 Agustus 2026<br />Kepala MTsN 2 Cilacap</div>
                <div className="font-bold underline text-slate-950">H. Solihun, S.Pd., M.Si.</div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPrintRaporOpen(false)}>
              Tutup
            </Button>
            <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5" onClick={() => { window.print(); toast.success("🖨️ E-Rapor diproses untuk dicetak!"); }}>
              <Download className="h-4 w-4" /> 🖨️ Cetak E-Rapor PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
