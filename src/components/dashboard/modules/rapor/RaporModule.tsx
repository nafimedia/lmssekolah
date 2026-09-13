import { useState, useMemo, useEffect } from "react";
import {
  Award,
  Download,
  FileText,
  CheckCircle2,
  Inbox,
  Building2,
  Users,
  Search,
  Eye,
  Filter,
  BarChart3,
  GraduationCap,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { isSameClass, normalizeRombelName, resolveWaliKelasRombel, formatClassName } from "@/utils/classNormalization";
import { isSameSubject, normalizeSubjectName } from "@/utils/subjectNormalization";
import { exportToExcelXml } from "@/utils/excelExporter";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { toast } from "sonner";

export interface StudentLegerSummary {
  id: string;
  name: string;
  nis: string;
  rombel: string;
  email?: string;
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

export interface SubjectReportRow {
  code: string;
  mapel: string;
  teacher: string;
  tugas: number;
  cbt: number;
  avg: number;
  kkm: string;
  progressPct: number;
  tugasTotal: number;
  tugasDone: number;
  cbtTotal: number;
  cbtDone: number;
  cpDescription: string;
}

export function RaporModule({
  activeRole,
  initialTab = "nilai",
}: {
  activeRole?: string;
  initialTab?: "nilai" | "progress";
}) {
  const isExecutive =
    activeRole === "kamad" ||
    activeRole === "waka" ||
    activeRole === "admin" ||
    activeRole === "admin_akademik" ||
    activeRole === "kepala_madrasah";
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isSiswa = activeRole === "siswa";

  const activeUser = MysqlAuthService.getActiveUser();
  const rawClass =
    (activeUser as any)?.assignedClass ||
    activeUser?.class_name ||
    (activeUser as any)?.class;

  const binaanRombel = resolveWaliKelasRombel(activeUser, null, "kelas");

  const defaultRombel = isWaliKelas
    ? binaanRombel
    : normalizeRombelName(rawClass || "Kelas 8B");

  const [selectedClass, setSelectedClass] = useState<string>(
    isWaliKelas ? binaanRombel : isExecutive ? "ALL" : defaultRombel
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isPrintRaporOpen, setIsPrintRaporOpen] = useState(false);
  const [selectedStudentForRapor, setSelectedStudentForRapor] = useState<any>(null);

  // Sub-tabs for student: "nilai" (Transkrip Nilai & KKTP) vs "progress" (Progress Capaian Pembelajaran)
  const [activeStudentTab, setActiveStudentTab] = useState<"nilai" | "progress">(
    initialTab || "nilai"
  );

  useEffect(() => {
    if (initialTab) {
      setActiveStudentTab(initialTab);
    }
  }, [initialTab]);

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
  const [cbtExamsList, setCbtExamsList] = useState<any[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<any[]>([]);
  const [lkpdActivitiesList, setLkpdActivitiesList] = useState<any[]>([]);
  const [pengampuList, setPengampuList] = useState<any[]>([]);
  const [masterRombels, setMasterRombels] = useState<any[]>([]);
  const [hafalanList, setHafalanList] = useState<any[]>([]);
  const [p5ProjectsList, setP5ProjectsList] = useState<any[]>([]);
  const [lkpdGradesList, setLkpdGradesList] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      MysqlDataService.getUsers(),
      MysqlDataService.getSubjects(),
      MysqlDataService.getSubmissions(),
      MysqlDataService.getCbtResults(),
      MysqlDataService.getCbtExams().catch(() => []),
      MysqlDataService.getAssignments().catch(() => []),
      MysqlDataService.getLkpdActivities("ALL", "ALL").catch(() => []),
      MysqlDataService.getPengampuList().catch(() => []),
      MysqlDataService.getMasterRombels().catch(() => []),
      MysqlDataService.getHafalan().catch(() => []),
      MysqlDataService.getP5Projects().catch(() => []),
      MysqlDataService.getAllLkpdGrades().catch(() => []),
    ])
      .then(
        ([
          users,
          subjects,
          subs,
          cbts,
          cbtExams,
          assigns,
          lkpds,
          pengampus,
          rombels,
          hafalans,
          p5s,
          allLkpdGrades,
        ]) => {
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
          setCbtExamsList(cbtExams || []);
          setAssignmentsList(assigns || []);
          setLkpdActivitiesList(lkpds || []);
          setPengampuList(pengampus || []);
          setMasterRombels(rombels || []);
          setHafalanList(hafalans || []);
          setP5ProjectsList(p5s || []);
          setLkpdGradesList(allLkpdGrades || []);
        }
      )
      .catch(() => {
        if (isMounted) {
          setStudentsList([]);
          setSubjectsList([]);
          setSubmissionsList([]);
          setCbtResultsList([]);
          setCbtExamsList([]);
          setAssignmentsList([]);
          setLkpdActivitiesList([]);
          setPengampuList([]);
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
    const set = new Set<string>([
      "Kelas 7A",
      "Kelas 7B",
      "Kelas 8A",
      "Kelas 8B",
      "Kelas 9A",
      "Kelas 9B",
    ]);
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

  // Lookup map: assignment_id -> subject name
  const assignmentSubjectMap = useMemo(() => {
    const map = new Map<string, string>();
    assignmentsList.forEach((a: any) => {
      if (a.id && (a.mapel || a.subject_name)) {
        map.set(String(a.id), a.mapel || a.subject_name);
      }
    });
    lkpdActivitiesList.forEach((l: any) => {
      if (l.id && (l.mapel || l.subject_name)) {
        map.set(String(l.id), l.mapel || l.subject_name);
      }
    });
    return map;
  }, [assignmentsList, lkpdActivitiesList]);

  // Lookup map: cbt exam_id -> subject name
  const cbtExamSubjectMap = useMemo(() => {
    const map = new Map<string, string>();
    cbtExamsList.forEach((e: any) => {
      if (e.id && (e.subject_name || e.mapel)) {
        map.set(String(e.id), e.subject_name || e.mapel);
      }
    });
    return map;
  }, [cbtExamsList]);

  // Canonical list of Madrasah subjects (Kemenag standard, excluding non-academic counseling BK)
  const canonicalSubjects = useMemo(() => {
    const isExcluded = (name: string, code: string) => {
      const n = (name || "").toLowerCase();
      const c = (code || "").toLowerCase();
      return n.includes("bimbingan") || n.includes("konseling") || c === "pgb-01";
    };

    if (subjectsList && subjectsList.length > 0) {
      return subjectsList
        .filter((s: any) => !isExcluded(s.name || s.subject_name || "", s.code || ""))
        .map((s: any) => ({
          id: s.id,
          code: s.code || `MP-${s.id}`,
          name: s.name || s.subject_name,
          teacher: s.teacher_name || s.teacher || "Guru Pengampu",
        }));
    }
    return [
      { id: 1, code: "AGM-01", name: "Al Qur'an Hadis", teacher: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { id: 2, code: "AGM-02", name: "Akidah Akhlak", teacher: "WAKHIBUN, S.P" },
      { id: 3, code: "AGM-03", name: "Fikih", teacher: "CARYATI, S.Pd" },
      { id: 4, code: "AGM-04", name: "Sejarah Kebudayaan Islam", teacher: "H. DASIRUN, S.Ag., M.Pd.I" },
      { id: 5, code: "AGM-05", name: "Bahasa Arab", teacher: "ENDAH SUPRIHATIN, S.Pd" },
      { id: 6, code: "UMM-01", name: "Bahasa Indonesia", teacher: "SOBIYATI, S.Pd" },
      { id: 7, code: "UMM-02", name: "Bahasa Inggris", teacher: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
      { id: 8, code: "UMM-03", name: "Matematika", teacher: "SAYONO, S.Pd., M.Pd." },
      { id: 9, code: "UMM-04", name: "Ilmu Pendidikan Alam", teacher: "NOVANTYA KARTIKAWATI, S.Pd" },
      { id: 10, code: "UMM-05", name: "Ilmu Pendidikan Sosial", teacher: "UMI KHAFSOH, S.Pd" },
      { id: 11, code: "UMM-06", name: "Pendidikan Kewarganegaraan", teacher: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
      { id: 12, code: "UMM-07", name: "Pendidikan Jasmani, Olahraga dan Kesehatan", teacher: "NUR ROCHMAN SHODIQ, S.Pd.I" },
      { id: 13, code: "UMM-08", name: "Prakarya dan Seni Budaya", teacher: "ISNAENI HASANAH, S.Pd.I" },
      { id: 14, code: "MLK-01", name: "Bahasa Jawa", teacher: "RINDANG FARIHA IDANA, S.Pd" },
    ];
  }, [subjectsList]);

  // Active student profile when logged in as a student
  const currentStudentProfile = useMemo(() => {
    if (!isSiswa) return null;
    const userEmail = (activeUser?.email || "").toLowerCase();
    const userName = (activeUser?.full_name || (activeUser as any)?.name || "").toLowerCase();

    const matchedSiswa = studentsList.find(
      (s) =>
        (s.email && s.email.toLowerCase() === userEmail) ||
        (s.full_name && s.full_name.toLowerCase() === userName) ||
        (s.nis_nip && s.nis_nip === activeUser?.nis_nip)
    );

    const sRombel = normalizeRombelName(
      matchedSiswa?.class_name || matchedSiswa?.class || rawClass || "Rombel 8B"
    );

    return {
      id: matchedSiswa?.id || activeUser?.id || "s_me",
      name: matchedSiswa?.full_name || activeUser?.full_name || "Ananda Siswa",
      nis: matchedSiswa?.nis_nip || activeUser?.nis_nip || "-",
      rombel: sRombel,
      email: userEmail,
    };
  }, [isSiswa, studentsList, activeUser, rawClass]);

  // Compute REAL grades per student in school
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

      const studentLkpdGrades = lkpdGradesList.filter(
        (g) =>
          (g.student_name && g.student_name.toLowerCase() === sName) ||
          (g.student_nisn && g.student_nisn === (s.nis_nip || s.nis)) ||
          (g.student_id && String(g.student_id) === String(s.id))
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

      studentLkpdGrades.forEach((g) => {
        const sc = Number(g.score);
        if (sc && sc > 0) {
          totalScore += sc;
          scoreCount++;
        }
      });

      studentCbts.forEach((cbt) => {
        if (cbt.score && cbt.score > 0) {
          totalScore += cbt.score;
          scoreCount++;
        }
      });

      // REAL Average: 0 if no evaluated assessments
      const avgScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
      const statusLabel =
        avgScore >= 75
          ? "Tuntas (≥75)"
          : avgScore > 0
            ? "Perlu Bimbingan (<75)"
            : "Belum Ada Nilai (0 Poin)";

      return {
        id: s.id || `s_${idx}`,
        name: s.full_name || s.name,
        nis: s.nis_nip || s.nis || "-",
        rombel: sRombel,
        email: sEmail,
        avgScore,
        tugasCount: studentSubs.length + studentLkpdGrades.length,
        cbtCount: studentCbts.length,
        status: statusLabel,
      };
    });
  }, [studentsList, submissionsList, lkpdGradesList, cbtResultsList]);

  // Target student for Rapor view/dialog
  const targetStudent = useMemo(() => {
    if (isSiswa) return currentStudentProfile;
    return selectedStudentForRapor;
  }, [isSiswa, currentStudentProfile, selectedStudentForRapor]);

  // Helper to generate Kurikulum Merdeka Capaian Pembelajaran (CP) narrative
  const getCpDescription = (mapelName: string, score: number) => {
    if (score === 0) {
      return `Belum ada asesmen / evaluasi berkala yang terselesaikan pada mata pelajaran ${mapelName} (0 Poin).`;
    }
    if (score >= 90) {
      return `Menunjukkan penguasaan sangat istimewa dalam menguasai capaian pembelajaran utama ${mapelName} serta mampu bernalar kritis dan mandiri.`;
    }
    if (score >= 80) {
      return `Menunjukkan penguasaan baik dan cakap dalam menerapkan tujuan pembelajaran ${mapelName} pada kegiatan asesmen formatif dan sumatif.`;
    }
    if (score >= 75) {
      return `Telah mencapai kriteria ketuntasan minimal tujuan pembelajaran (KKTP) ${mapelName} dengan penguasaan materi yang cukup memadai.`;
    }
    return `Perlu bimbingan remedial dan penguatan materi inti secara bertahap pada mata pelajaran ${mapelName}.`;
  };

  // Subject Leger Breakdown for the target student (100% REAL DATA)
  const subjectLegerBreakdown = useMemo<SubjectReportRow[]>(() => {
    const sEmail = (targetStudent?.email || "").toLowerCase();
    const sName = (targetStudent?.name || "").toLowerCase();
    const sRombel = normalizeRombelName(targetStudent?.rombel || defaultRombel);

    return canonicalSubjects.map((sub, idx) => {
      const mapelName = sub.name;

      // 1. Resolve real teacher for target student's rombel from matriks_pengampu
      const matchedPengampu = pengampuList.find(
        (p: any) =>
          isSameSubject(p.mapel, mapelName) &&
          (isSameClass(p.rombel, sRombel) ||
            isSameClass(normalizeRombelName(p.rombel || ""), sRombel))
      );
      const teacherName = matchedPengampu?.guru || sub.teacher || "Guru Pengampu MTsN 2";

      // 2. Formatif (Tugas / LKPD from assignment_submissions and lkpd_grades)
      const subMatches = submissionsList.filter((s: any) => {
        const isUser =
          (s.user_id && s.user_id.toLowerCase() === sEmail) ||
          (s.student_name && s.student_name.toLowerCase() === sName);
        if (!isUser) return false;

        const mappedMapel = assignmentSubjectMap.get(String(s.assignment_id));
        if (mappedMapel) return isSameSubject(mappedMapel, mapelName);
        return isSameSubject(s.mapel || s.title || "", mapelName);
      });

      const lkpdGradeMatches = lkpdGradesList.filter((g: any) => {
        const isUser =
          (g.student_name && g.student_name.toLowerCase() === sName) ||
          (g.student_nisn && g.student_nisn.toLowerCase() === (targetStudent?.nis || "").toLowerCase()) ||
          (g.student_id && String(g.student_id) === String(targetStudent?.id));
        if (!isUser) return false;

        const mappedMapel = assignmentSubjectMap.get(String(g.activity_id));
        if (mappedMapel) return isSameSubject(mappedMapel, mapelName);
        return false;
      });

      const gradedSubs = subMatches.filter((s: any) => s.score && s.score > 0);
      const gradedLkpd = lkpdGradeMatches.filter((g: any) => Number(g.score) > 0);

      const allFormatifScores: number[] = [
        ...gradedSubs.map((s: any) => Number(s.score)),
        ...gradedLkpd.map((g: any) => Number(g.score)),
      ];

      const realTugas =
        allFormatifScores.length > 0
          ? Math.round(allFormatifScores.reduce((acc, curr) => acc + curr, 0) / allFormatifScores.length)
          : 0;

      // 3. Sumatif (CBT / Ujian)
      const cbtMatches = cbtResultsList.filter((c: any) => {
        const isUser =
          (c.user_id && c.user_id.toLowerCase() === sEmail) ||
          (c.student_name && c.student_name.toLowerCase() === sName);
        if (!isUser) return false;

        const mappedMapel = cbtExamSubjectMap.get(String(c.exam_id));
        if (mappedMapel) return isSameSubject(mappedMapel, mapelName);
        return (
          isSameSubject(c.exam_title || "", mapelName) ||
          (c.exam_title || "").toLowerCase().includes(mapelName.toLowerCase())
        );
      });

      const gradedCbts = cbtMatches.filter((c: any) => c.score && c.score > 0);
      const realCbt =
        gradedCbts.length > 0
          ? Math.round(gradedCbts.reduce((acc: number, curr: any) => acc + curr.score, 0) / gradedCbts.length)
          : 0;

      // 4. Nilai Akhir (NA) Kurikulum Merdeka: Formatif (40%) + Sumatif (60%)
      let realAvg = 0;
      if (realTugas > 0 && realCbt > 0) {
        realAvg = Math.round(realTugas * 0.4 + realCbt * 0.6);
      } else if (realTugas > 0) {
        realAvg = realTugas;
      } else if (realCbt > 0) {
        realAvg = realCbt;
      }

      // 5. Progress Capaian Pembelajaran (CP %)
      // Calculate based on total registered activities for this mapel & rombel vs completed
      const totalAssignmentsInRombel = assignmentsList.filter(
        (a: any) =>
          isSameSubject(a.mapel || a.subject_name || "", mapelName) &&
          (isSameClass(a.rombel, sRombel) || a.rombel === "Semua")
      ).length;

      const totalLkpdInRombel = lkpdActivitiesList.filter(
        (l: any) =>
          isSameSubject(l.mapel || l.subject_name || "", mapelName) &&
          (isSameClass(l.rombel, sRombel) || l.rombel === "Semua")
      ).length;

      const totalCbtsInMapel = cbtExamsList.filter((e: any) =>
        isSameSubject(e.subject_name || e.title || "", mapelName)
      ).length;

      const totalAvailable = totalAssignmentsInRombel + totalLkpdInRombel + totalCbtsInMapel;
      const totalDone = subMatches.length + cbtMatches.length;

      let progressPct = 0;
      if (totalAvailable > 0) {
        progressPct = Math.min(100, Math.round((totalDone / totalAvailable) * 100));
      } else if (totalDone > 0) {
        progressPct = 100;
      }

      const statusKktp =
        realAvg >= 75
          ? "Tuntas (≥75)"
          : realAvg > 0
            ? "Perlu Bimbingan (<75)"
            : "Belum Ada Nilai (0 Poin)";

      return {
        code: sub.code || `MP-${idx + 1}`,
        mapel: mapelName,
        teacher: teacherName,
        tugas: realTugas,
        cbt: realCbt,
        avg: realAvg,
        kkm: statusKktp,
        progressPct,
        tugasTotal: totalAssignmentsInRombel + totalLkpdInRombel,
        tugasDone: subMatches.length,
        cbtTotal: totalCbtsInMapel,
        cbtDone: cbtMatches.length,
        cpDescription: getCpDescription(mapelName, realAvg),
      };
    });
  }, [
    targetStudent,
    canonicalSubjects,
    pengampuList,
    submissionsList,
    cbtResultsList,
    assignmentsList,
    lkpdActivitiesList,
    cbtExamsList,
    assignmentSubjectMap,
    cbtExamSubjectMap,
    defaultRombel,
  ]);

  // Overall student summary metrics
  const studentMetrics = useMemo(() => {
    const scoredSubjects = subjectLegerBreakdown.filter((s) => s.avg > 0);
    const totalScoreSum = scoredSubjects.reduce((acc, s) => acc + s.avg, 0);
    const avgFinalScore =
      scoredSubjects.length > 0 ? Math.round(totalScoreSum / scoredSubjects.length) : 0;
    const tuntasCount = subjectLegerBreakdown.filter((s) => s.avg >= 75).length;
    const totalCompletedTasks = subjectLegerBreakdown.reduce((acc, s) => acc + s.tugasDone, 0);
    const totalCompletedCbts = subjectLegerBreakdown.reduce((acc, s) => acc + s.cbtDone, 0);
    const avgCpPct =
      subjectLegerBreakdown.length > 0
        ? Math.round(
          subjectLegerBreakdown.reduce((acc, s) => acc + s.progressPct, 0) /
          subjectLegerBreakdown.length
        )
        : 0;

    return {
      avgFinalScore,
      tuntasCount,
      totalSubjects: subjectLegerBreakdown.length,
      totalCompletedTasks,
      totalCompletedCbts,
      avgCpPct,
    };
  }, [subjectLegerBreakdown]);

  // Compute real Ekstrakurikuler & Kokurikuler records for target student
  const studentEkstraList = useMemo(() => {
    if (!targetStudent) return [];

    const list: Array<{ kegiatan: string; nilai: string; keterangan: string }> = [];
    const sName = (targetStudent.name || "").toLowerCase();
    const sNis = (targetStudent.nis || "").toLowerCase();
    const sRombel = normalizeRombelName(targetStudent.rombel || "");

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

    // 2. Match Kokurikuler Projects
    const matchedP5 = p5ProjectsList.filter(
      (p) => p.class_name && isSameClass(p.class_name, sRombel)
    );

    matchedP5.forEach((p) => {
      list.push({
        kegiatan: `Kokurikuler: ${p.title}`,
        nilai: (p.progress_pct || 0) >= 80 ? "A" : (p.progress_pct || 0) > 0 ? "B" : "-",
        keterangan: `Tema: ${p.theme || "Kokurikuler"}`,
      });
    });

    return list;
  }, [targetStudent, hafalanList, p5ProjectsList]);

  // Compute Class Summary Rows for Executive Kamad & Waka
  const classSummaries = useMemo<ClassReportSummary[]>(() => {
    return rombelOptions.map((rName) => {
      const rombelStudents = studentLegerData.filter((s) => isSameClass(s.rombel, rName));
      const totalSiswa = rombelStudents.length;

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

  // Filtered Students List for Leger View
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

  const handleExportExcelLeger = () => {
    // 1. Build List of Subjects
    const activeSubjects =
      subjectsList.length > 0
        ? subjectsList
        : [
          { code: "QUR", name: "Al-Qur'an Hadis" },
          { code: "AA", name: "Akidah Akhlak" },
          { code: "FIQ", name: "Fikih" },
          { code: "SKI", name: "Sejarah Kebudayaan Islam" },
          { code: "PKN", name: "Pendidikan Pancasila" },
          { code: "BIN", name: "Bahasa Indonesia" },
          { code: "BAR", name: "Bahasa Arab" },
          { code: "MTK", name: "Matematika" },
          { code: "IPA", name: "Ilmu Pengetahuan Alam" },
          { code: "IPS", name: "Ilmu Pengetahuan Sosial" },
          { code: "BIG", name: "Bahasa Inggris" },
          { code: "SBK", name: "Seni Budaya" },
          { code: "PJK", name: "PJOK" },
          { code: "TIK", name: "Informatika" },
          { code: "BJW", name: "Bahasa Jawa" },
        ];

    // 2. Column Headers for RDM-Ready Leger
    const headers = [
      "No",
      "NISN",
      "Nama Siswa",
      "Kelas / Rombel",
      ...activeSubjects.flatMap((sub: any) => [
        `${sub.name} (Formatif)`,
        `${sub.name} (Sumatif)`,
        `${sub.name} (NA)`,
      ]),
      "Rata-Rata Nilai Akhir",
      "Mata Pelajaran Tuntas",
      "Status Kelulusan KKTP",
      "Catatan Perkembangan",
    ];

    // 3. Map Rows
    const rows = filteredStudents.map((s, idx) => {
      const sName = (s.name || "").toLowerCase();
      const sEmail = (s.email || "").toLowerCase();
      const sNis = (s.nis || "").toLowerCase();

      let totalNaSum = 0;
      let scoredSubjectCount = 0;
      let tuntasMapelCount = 0;

      const subjectValues: (number | string)[] = [];

      activeSubjects.forEach((subObj: any) => {
        const mapelName = subObj.name;

        // Formatif matches (submissions + lkpd)
        const subMatches = submissionsList.filter((subItem: any) => {
          const isUser =
            (subItem.user_id && subItem.user_id.toLowerCase() === sEmail) ||
            (subItem.student_name && subItem.student_name.toLowerCase() === sName);
          if (!isUser) return false;
          const mapped = assignmentSubjectMap.get(String(subItem.assignment_id));
          return mapped
            ? isSameSubject(mapped, mapelName)
            : isSameSubject(subItem.mapel || subItem.title || "", mapelName);
        });

        const lkpdMatches = lkpdGradesList.filter((g: any) => {
          const isUser =
            (g.student_name && g.student_name.toLowerCase() === sName) ||
            (g.student_nisn && g.student_nisn.toLowerCase() === sNis) ||
            (g.student_id && String(g.student_id) === String(s.id));
          if (!isUser) return false;
          const mapped = assignmentSubjectMap.get(String(g.activity_id));
          return mapped ? isSameSubject(mapped, mapelName) : false;
        });

        const allFormatif = [
          ...subMatches
            .filter((sub: any) => sub.score && sub.score > 0)
            .map((sub: any) => Number(sub.score)),
          ...lkpdMatches
            .filter((g: any) => Number(g.score) > 0)
            .map((g: any) => Number(g.score)),
        ];

        const fScore =
          allFormatif.length > 0
            ? Math.round(allFormatif.reduce((a, b) => a + b, 0) / allFormatif.length)
            : 0;

        // Sumatif matches (CBT)
        const cbtMatches = cbtResultsList.filter((c: any) => {
          const isUser =
            (c.user_id && c.user_id.toLowerCase() === sEmail) ||
            (c.student_name && c.student_name.toLowerCase() === sName);
          if (!isUser) return false;
          const mapped = cbtExamSubjectMap.get(String(c.exam_id));
          return mapped
            ? isSameSubject(mapped, mapelName)
            : isSameSubject(c.exam_title || "", mapelName);
        });

        const scoredCbts = cbtMatches.filter((c: any) => c.score && c.score > 0);
        const sScore =
          scoredCbts.length > 0
            ? Math.round(
              scoredCbts.reduce((a: number, curr: any) => a + curr.score, 0) /
              scoredCbts.length
            )
            : 0;

        // Final Score (NA)
        let na = 0;
        if (fScore > 0 && sScore > 0) na = Math.round(fScore * 0.4 + sScore * 0.6);
        else if (fScore > 0) na = fScore;
        else if (sScore > 0) na = sScore;

        if (na > 0) {
          totalNaSum += na;
          scoredSubjectCount++;
          if (na >= 75) tuntasMapelCount++;
        }

        subjectValues.push(fScore > 0 ? fScore : "-");
        subjectValues.push(sScore > 0 ? sScore : "-");
        subjectValues.push(na > 0 ? na : "-");
      });

      const avg =
        scoredSubjectCount > 0
          ? Math.round(totalNaSum / scoredSubjectCount)
          : s.avgScore;
      const statusKktp =
        avg >= 75 ? "Tuntas" : avg > 0 ? "Perlu Remedial" : "Belum Ada Nilai";
      const catatan =
        avg >= 85
          ? "Sangat Baik. Terus pertahankan prestasi belajar ananda."
          : avg >= 75
            ? "Baik. Seluruh target capaian pembelajaran telah tuntas."
            : avg > 0
              ? "Perlu pendampingan belajar dan penuntasan tugas/asesmen."
              : "Belum mengikuti rangkaian asesmen semester.";

      return [
        idx + 1,
        s.nis,
        s.name,
        s.rombel,
        ...subjectValues,
        avg,
        `${tuntasMapelCount} / ${activeSubjects.length}`,
        statusKktp,
        catatan,
      ];
    });

    exportToExcelXml(
      `Leger_Nilai_RDM_Kemenag_${selectedClass.replace(/\s+/g, "_")}`,
      "Leger_Nilai_RDM",
      headers,
      rows
    );
    toast.success("📊 File Excel Leger Nilai Standar RDM Kemenag berhasil diunduh!");
  };

  const openStudentRaporModal = (student: StudentLegerSummary) => {
    setSelectedStudentForRapor(student);
    setIsPrintRaporOpen(true);
  };

  // Printable E-Rapor Component (Shared for both Siswa & Teacher modal)
  const renderPrintDialog = () => (
    <Dialog open={isPrintRaporOpen} onOpenChange={setIsPrintRaporOpen}>
      <DialogContent className="sm:max-w-4xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" /> Pratinjau E-Rapor Kurikulum Merdeka
            </div>
            <Badge className="bg-emerald-600 text-white font-mono text-xs">
              {targetStudent?.rombel || defaultRombel}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Lembar Rapor Hasil Belajar Resmi Peserta Didik MTsN 2 Cilacap.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-md font-sans space-y-4 print:p-0 print:border-none print:shadow-none">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-3">
            <div className="flex items-center gap-4 mb-2">
              <img
                src="/logomts.png"
                alt="Logo MTsN 2 Cilacap"
                className="h-14 w-14 object-contain shrink-0"
              />
              <div className="text-center flex-1 pr-14">
                <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                  KEMENTERIAN AGAMA REPUBLIK INDONESIA
                </div>
                <div className="text-base font-black tracking-wide text-slate-900 uppercase">
                  MADRASAH TSANAWIYAH NEGERI 2 CILACAP
                </div>
                <div className="text-[10px] text-slate-600">
                  Jl. Raya Sindangbarang KM.4 Karangpucung Kode Pos 53255
                </div>
              </div>
            </div>
            <div className="mt-2 py-1 bg-emerald-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs text-center">
              RAPOR HASIL BELAJAR PESERTA DIDIK
            </div>
          </div>

          {/* Student Profile Info */}
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
            <div>
              <div>
                Nama Siswa:{" "}
                <strong className="text-slate-950 font-bold">
                  {targetStudent?.name || "Ananda Siswa"}
                </strong>
              </div>
              <div>
                NISN / NIS:{" "}
                <span className="font-mono">{targetStudent?.nis || "-"}</span>
              </div>
            </div>
            <div>
              <div>
                Kelas / Rombel:{" "}
                <strong>{targetStudent?.rombel || defaultRombel}</strong>
              </div>
              <div>
                Tahun Ajaran:{" "}
                <strong className="text-emerald-900 font-extrabold">
                  2026/2027 (Semester Ganjil)
                </strong>
              </div>
            </div>
          </div>

          {/* Academic Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-2 text-center w-8">No</th>
                  <th className="border border-slate-300 p-2 text-left">Mata Pelajaran</th>
                  <th className="border border-slate-300 p-2 text-center">Guru Pengampu</th>
                  <th className="border border-slate-300 p-2 text-center">Formatif (40%)</th>
                  <th className="border border-slate-300 p-2 text-center">Sumatif (60%)</th>
                  <th className="border border-slate-300 p-2 text-center font-bold">Nilai Akhir</th>
                  <th className="border border-slate-300 p-2 text-left">
                    Capaian Pembelajaran (CP) Deskriptif
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjectLegerBreakdown.map((m, idx) => (
                  <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="border border-slate-300 p-2 text-center font-mono">
                      {idx + 1}
                    </td>
                    <td className="border border-slate-300 p-2 font-bold">{m.mapel}</td>
                    <td className="border border-slate-300 p-2 text-center text-slate-700">
                      {m.teacher}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono">
                      {m.tugas}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-mono">
                      {m.cbt}
                    </td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-emerald-900 text-xs">
                      {m.avg}
                    </td>
                    <td className="border border-slate-300 p-2 text-slate-700 leading-snug">
                      {m.cpDescription}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Kokurikuler & Presensi */}
          <div className="grid grid-cols-2 gap-4 text-xs font-medium">
            <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-2">
              <div className="font-bold text-slate-900">
                Kegiatan Kokurikuler & Karakter:
              </div>
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
                      <td
                        colSpan={3}
                        className="p-2 text-center text-slate-400 italic font-normal"
                      >
                        (Belum ada data nilai kegiatan kokurikuler)
                      </td>
                    </tr>
                  ) : (
                    studentEkstraList.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-1 font-semibold">{item.kegiatan}</td>
                        <td className="p-1 text-center font-bold text-emerald-700">
                          {item.nilai}
                        </td>
                        <td className="p-1">{item.keterangan}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-2">
              <div className="font-bold text-slate-900">
                Ketidakhadiran / Presensi Semester:
              </div>
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
                    <td className="py-1 text-right font-mono font-bold text-emerald-600">
                      0 Hari
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
            <div className="font-bold text-slate-900">Catatan Wali Kelas:</div>
            <div className="text-slate-700 italic">
              "Ananda {targetStudent?.name} menunjukkan perkembangan positif dalam pembelajaran di
              kelas. Pertahankan konsistensi belajar dan tuntaskan seluruh capaian pembelajaran
              dengan penuh semangat."
            </div>
          </div>

          {/* Signatures */}
          {(() => {
            const targetRombelName = targetStudent?.rombel || defaultRombel;
            const matchedMasterRombel = masterRombels.find((r: any) =>
              isSameClass(r.name || r.code || "", targetRombelName)
            );
            const resolvedWaliKelasName =
              matchedMasterRombel?.wali_kelas ||
              (isWaliKelas ? (activeUser?.full_name || "") : "Wali Kelas");
            const dynamicPrintDate = `Cilacap, ${new Date().toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`;

            return (
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-4 text-slate-800 border-t border-slate-200">
                <div className="text-center space-y-8">
                  <div>Orang Tua / Wali Siswa</div>
                  <div className="font-bold underline text-slate-950">( .......................... )</div>
                </div>
                <div className="text-center space-y-8">
                  <div>Wali Kelas</div>
                  <div className="font-bold underline text-slate-950">{resolvedWaliKelasName}</div>
                </div>
                <div className="text-center space-y-8">
                  <div>
                    {dynamicPrintDate}
                    <br />
                    Kepala MTsN 2 Cilacap
                  </div>
                  <div className="font-bold underline text-slate-950">H. Solihun, S.Pd., M.Si.</div>
                </div>
              </div>
            );
          })()}
        </div>

        <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPrintRaporOpen(false)}
          >
            Tutup
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
            onClick={() => {
              window.print();
              toast.success("🖨️ E-Rapor diproses untuk dicetak!");
            }}
          >
            <Printer className="h-4 w-4" /> Cetak E-Rapor PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // -------------------------------------------------------------
  // SISWA PORTAL VIEW (OPTI A: TERPADU REKAP NILAI & PROGRESS CP)
  // -------------------------------------------------------------
  if (isSiswa) {
    return (
      <div className="space-y-4">
        <StudentHeaderBanner
          title="Rekap Nilai & Progress Belajar"
          icon={Award}
          statusText={
            studentMetrics.avgFinalScore >= 75
              ? "Target Ketuntasan Belajar Terpenuhi"
              : studentMetrics.avgFinalScore > 0
                ? "Perlu Peningkatan / Remedial"
                : ""
          }
          statusVariant={
            studentMetrics.avgFinalScore >= 75
              ? "success"
              : studentMetrics.avgFinalScore > 0
                ? "warning"
                : "neutral"
          }
          actionButtons={
            <Button
              size="sm"
              onClick={() => setIsPrintRaporOpen(true)}
              className="h-8 gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs px-3"
            >
              <FileText className="h-3.5 w-3.5" /> Cetak E-Rapor PDF
            </Button>
          }
        />

        {/* Horizontal Compact Metric Strip (~42px) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Rata-Rata Nilai Akhir</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{studentMetrics.avgFinalScore} <span className="text-[10px] font-normal text-muted-foreground">(KKTP 75)</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Ketuntasan KKTP</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{studentMetrics.tuntasCount} / {studentMetrics.totalSubjects} Mapel</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <FileText className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Aktivitas & Asesmen</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{studentMetrics.totalCompletedTasks + studentMetrics.totalCompletedCbts} Selesai</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Rata-Rata Capaian (CP)</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{studentMetrics.avgCpPct}%</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation: Transkrip Nilai vs Progress Capaian Pembelajaran */}
        <Tabs
          value={activeStudentTab}
          onValueChange={(val: any) => setActiveStudentTab(val)}
          className="space-y-4"
        >
          <TabsList className="bg-muted/60 p-1 rounded-xl border border-border/70 h-9 w-fit flex gap-1">
            <TabsTrigger
              value="nilai"
              className="gap-2 text-xs font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <Award className="h-4 w-4 text-emerald-600" />
              <span>Transkrip Nilai</span>
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="gap-2 text-xs font-bold py-2 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span>Progress Belajar</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TRANSKRIP NILAI & KKTP */}
          <TabsContent value="nilai" className="space-y-4">
            <Card className="border-border shadow-xs bg-card">
              <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold">
                  Rekap Nilai Mata Pelajaran
                </CardTitle>
                <Badge variant="outline" className="font-mono text-xs border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                  Target KKTP: 75
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop / Tablet Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/50 text-muted-foreground font-bold text-left border-b border-border">
                      <tr>
                        <th className="p-3">Mata Pelajaran</th>
                        <th className="p-3">Guru Pengampu</th>
                        <th className="p-3 text-center">Formatif (Tugas/LKPD)</th>
                        <th className="p-3 text-center">Sumatif (CBT)</th>
                        <th className="p-3 text-center">Nilai Akhir</th>
                        <th className="p-3 text-right">Status KKTP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {subjectLegerBreakdown.map((m, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition">
                          <td className="p-3 font-bold text-foreground flex items-center gap-2">
                            <span className="font-mono text-[11px] text-muted-foreground w-12 shrink-0">
                              {m.code}
                            </span>
                            <span>{m.mapel}</span>
                          </td>
                          <td className="p-3 text-muted-foreground">{m.teacher}</td>
                          <td className="p-3 text-center font-mono font-bold">
                            {m.tugas > 0 ? (
                              <span className="text-foreground">{m.tugas}</span>
                            ) : (
                              <span className="text-muted-foreground/60">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono font-bold">
                            {m.cbt > 0 ? (
                              <span className="text-foreground">{m.cbt}</span>
                            ) : (
                              <span className="text-muted-foreground/60">-</span>
                            )}
                          </td>
                          <td className="p-3 text-center font-mono font-bold">
                            <span
                              className={
                                m.avg >= 75
                                  ? "text-emerald-600 dark:text-emerald-400 text-sm font-extrabold"
                                  : m.avg > 0
                                    ? "text-amber-600 text-sm font-extrabold"
                                    : "text-muted-foreground font-medium"
                              }
                            >
                              {m.avg}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <Badge
                              variant="outline"
                              className={
                                m.avg >= 75
                                  ? "text-emerald-600 border-emerald-500/30 font-bold bg-emerald-500/5"
                                  : m.avg > 0
                                    ? "text-amber-600 border-amber-500/30 font-bold bg-amber-500/5"
                                    : "text-muted-foreground border-border font-medium"
                              }
                            >
                              {m.kkm}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile-Friendly Card View (< 768px) */}
                <div className="block md:hidden p-3 space-y-3">
                  {subjectLegerBreakdown.map((m, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-border/80 bg-muted/20 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                              {m.code}
                            </Badge>
                            <span className="font-bold text-xs text-foreground">{m.mapel}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{m.teacher}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            m.avg >= 75
                              ? "text-emerald-600 border-emerald-500/30 font-bold bg-emerald-500/5 text-[10px]"
                              : m.avg > 0
                                ? "text-amber-600 border-amber-500/30 font-bold bg-amber-500/5 text-[10px]"
                                : "text-muted-foreground border-border font-medium text-[10px]"
                          }
                        >
                          {m.kkm}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50 text-center">
                        <div className="bg-background p-1.5 rounded-lg border border-border/60">
                          <div className="text-[10px] text-muted-foreground">Formatif</div>
                          <div className="font-mono font-bold text-xs text-foreground mt-0.5">
                            {m.tugas > 0 ? m.tugas : "-"}
                          </div>
                        </div>
                        <div className="bg-background p-1.5 rounded-lg border border-border/60">
                          <div className="text-[10px] text-muted-foreground">Sumatif</div>
                          <div className="font-mono font-bold text-xs text-foreground mt-0.5">
                            {m.cbt > 0 ? m.cbt : "-"}
                          </div>
                        </div>
                        <div className="bg-background p-1.5 rounded-lg border border-border/60">
                          <div className="text-[10px] text-muted-foreground">Nilai Akhir</div>
                          <div
                            className={`font-mono font-extrabold text-xs mt-0.5 ${m.avg >= 75
                              ? "text-emerald-600 dark:text-emerald-400"
                              : m.avg > 0
                                ? "text-amber-600"
                                : "text-muted-foreground"
                              }`}
                          >
                            {m.avg > 0 ? m.avg : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: PROGRESS CAPAIAN PEMBELAJARAN (CP %) */}
          <TabsContent value="progress" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectLegerBreakdown.map((x, i) => {
                const isOptimal = x.progressPct >= 75;
                const inProgress = x.progressPct > 0 && x.progressPct < 75;

                return (
                  <Card
                    key={i}
                    className="border-border/70 shadow-xs hover:border-emerald-500/40 transition bg-card"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-bold text-sm text-foreground">{x.mapel}</div>
                          <div className="text-[11px] text-muted-foreground">{x.teacher}</div>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            isOptimal
                              ? "text-xs font-mono font-bold border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                              : inProgress
                                ? "text-xs font-mono font-bold border-amber-500/30 text-amber-600 bg-amber-500/5"
                                : "text-xs font-mono font-medium border-border text-muted-foreground"
                          }
                        >
                          {x.progressPct}% Dicapai
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isOptimal
                              ? "bg-emerald-600"
                              : inProgress
                                ? "bg-amber-500"
                                : "bg-muted-foreground/30"
                              }`}
                            style={{ width: `${x.progressPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>
                            Tugas LKPD: {x.tugasDone} selesai
                          </span>
                          <span>
                            Ujian CBT: {x.cbtDone} selesai
                          </span>
                        </div>
                      </div>

                      {/* Deskripsi Capaian Pembelajaran Kurikulum Merdeka */}
                      <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground leading-snug">
                        <span className="font-semibold text-foreground">Keterangan: </span>
                        {x.progressPct >= 75
                          ? "Sangat baik. Seluruh tugas dan asesmen pada mata pelajaran ini telah diselesaikan dengan optimal."
                          : x.progressPct > 0
                            ? "Sedang berproses. Terus selesaikan tugas LKPD dan ujian CBT yang diberikan guru."
                            : "Belum ada aktivitas atau tugas yang dikumpulkan pada mata pelajaran ini."}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal Cetak E-Rapor PDF */}
        {renderPrintDialog()}
      </div>
    );
  }

  // -------------------------------------------------------------
  // GURU / WALI KELAS / KAMAD / WAKA DASHBOARD VIEW
  // -------------------------------------------------------------
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            {selectedClass === "ALL"
              ? "Laporan Pembelajaran & Rekap Leger Seluruh Kelas"
              : `Laporan Pembelajaran & Rekap Leger ${selectedClass}`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcelLeger}
            className="h-8 gap-1.5 text-xs font-semibold border-border px-3 text-muted-foreground hover:text-foreground"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" /> Unduh Leger (Excel)
          </Button>
        </div>
      </div>

      {/* Kelas Filter & Search Bar */}
      <div className="p-2.5 rounded-xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 shadow-2xs text-xs">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
            Pilih Kelas:
          </span>
          {isWaliKelas ? (
            <div className="h-8 px-2.5 rounded-lg border border-emerald-500/50 bg-emerald-500/10 flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-300">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Kelas Binaan: {binaanRombel}</span>
            </div>
          ) : (
            <select
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground cursor-pointer hover:border-primary/50 transition min-w-[200px]"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {isExecutive && (
                <option value="ALL" className="font-bold">
                  ✨ Semua Kelas (Monitoring Leger Madrasah)
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

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari siswa, NISN, atau kelas..."
              className="pl-8 h-8 text-xs rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Horizontal Compact Metric Strip (~42px) for Kamad & Waka */}
      {isExecutive && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Kelas</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{overallStats.totalRombel} Kelas Aktif</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Siswa</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{overallStats.totalSiswa} Siswa</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Rata-Rata Nilai</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{overallStats.avgMadrasah} Poin</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Ketuntasan KKTP (≥75)</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
                {overallStats.totalSiswa > 0
                  ? Math.round((overallStats.totalTuntas / overallStats.totalSiswa) * 100)
                  : 0}
                % Tuntas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: TABEL MATRIKS REKAPITULASI LEGER KELAS (Kamad & Waka Overview) */}
      {selectedClass === "ALL" && (
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-3.5 pb-2 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Matriks Rekapitulasi Leger Pembelajaran Per Kelas</span>
            </CardTitle>
            <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5">
              {classSummaries.length} Kelas
            </Badge>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Memuat rekapitulasi leger kelas...
              </div>
            ) : classSummaries.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Tidak ada kelas terdaftar.
              </div>
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
                      <td className="p-3 text-center font-bold text-foreground">
                        {c.totalSiswa} Siswa
                      </td>
                      <td className="p-3 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {c.avgScore} Poin
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-[11px]">
                          <Badge
                            variant="outline"
                            className="text-emerald-600 border-emerald-500/30 font-bold bg-emerald-500/5"
                          >
                            {c.tuntasCount} Tuntas
                          </Badge>
                          {c.prosesCount > 0 && (
                            <Badge
                              variant="outline"
                              className="text-amber-600 border-amber-500/30 font-bold bg-amber-500/5"
                            >
                              {c.prosesCount} Dalam Proses
                            </Badge>
                          )}
                          {c.belumCount > 0 && (
                            <Badge
                              variant="outline"
                              className="text-rose-600 border-rose-500/30 font-bold bg-rose-500/5"
                            >
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
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-emerald-600" />
            <span>
              Leger Nilai Siswa - {selectedClass === "ALL" ? "Seluruh Kelas" : selectedClass}
            </span>
          </CardTitle>
          <Badge className="bg-emerald-600 text-white font-bold text-xs">
            {filteredStudents.length} Siswa
          </Badge>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Memuat data leger siswa...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 m-4">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-semibold text-foreground text-sm">
                Belum Ada Data Siswa pada {selectedClass === "ALL" ? "Filter Ini" : selectedClass}
              </div>
              <p>Belum ada data siswa terdaftar untuk kelas ini.</p>
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
                    <td className="p-3 text-center font-mono font-bold">
                      {s.tugasCount} Submisi
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      {s.cbtCount} CBT
                    </td>
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
                        className="h-7 text-xs font-bold gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
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

      {/* 🖨️ MODAL PRATINJAU & CETAK E-RAPOR PDF (REAL DATA ONLY) */}
      {renderPrintDialog()}
    </div>
  );
}
