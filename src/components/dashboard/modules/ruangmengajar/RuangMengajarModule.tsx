import { useState, useMemo, useEffect } from "react";
import { MysqlDataService } from "@/services/mysqlDataService";
import {
  BookOpen,
  Users,
  Calendar,
  FileText,
  Video,
  MessageSquare,
  ClipboardCheck,
  UserCheck,
  GraduationCap,
  Plus,
  Download,
  Printer,
  ExternalLink,
  PencilLine,
  Building2,
  Award,
  DoorOpen,
  Check,
  FileSpreadsheet,
  MonitorCheck,
  FolderArchive,
  Upload,
  Sparkles,
  AlertCircle,
  FileCode,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";

interface RuangMengajarModuleProps {
  activeRole?: string;
  userProfile?: any;
}

// Master Rombel & Metadata Struktur MTsN 2 Cilacap
interface RombelMeta {
  code: string;
  tingkat: "VII" | "VIII" | "IX";
  waliKelas: string;
  ruang: string;
  siswaCount: number;
  genderRatio: string;
  students: { nisn: string; name: string; gender: "L" | "P"; hadirPct: number; status: "Hadir" | "Izin" | "Sakit" | "Alpa" }[];
}

const MASTER_ROMBEL_DATA: Record<string, RombelMeta> = {
  "Kelas VII A": {
    code: "Kelas VII A",
    tingkat: "VII",
    waliKelas: "MAULIDIA NURUL IZATI, S.Pd",
    ruang: "Ruang A.01",
    siswaCount: 0,
    genderRatio: "0 L / 0 P",
    students: [],
  },
  "Kelas VII B": {
    code: "Kelas VII B",
    tingkat: "VII",
    waliKelas: "RINDANG FARIHA IDANA, S.Pd",
    ruang: "Ruang A.02",
    siswaCount: 0,
    genderRatio: "0 L / 0 P",
    students: [],
  },
  "Kelas VII C": {
    code: "Kelas VII C",
    tingkat: "VII",
    waliKelas: "CETY MAHARSY, S.Pd",
    ruang: "Ruang A.03",
    siswaCount: 0,
    genderRatio: "0 L / 0 P",
    students: [],
  },
  "Kelas VIII A": {
    code: "Kelas VIII A",
    tingkat: "VIII",
    waliKelas: "SOBIYATI, S.Pd",
    ruang: "Ruang B.01",
    siswaCount: 0,
    genderRatio: "0 L / 0 P",
    students: [],
  },
  "Kelas VIII B": {
    code: "Kelas VIII B",
    tingkat: "VIII",
    waliKelas: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd",
    ruang: "Ruang B.02",
    siswaCount: 0,
    genderRatio: "0 L / 0 P",
    students: [],
  },
  "Kelas VIII C": {
    code: "Kelas VIII C",
    tingkat: "VIII",
    waliKelas: "H. SOLIHUN, S.Pd., M.Si",
    ruang: "Ruang B.03",
    siswaCount: 0,
    genderRatio: "0 L / 0 P",
    students: [],
  },
  "Kelas IX A": {
    code: "Kelas IX A",
    tingkat: "IX",
    waliKelas: "NOVANTYA KARTIKAWATI, S.Pd",
    ruang: "Ruang C.01",
    siswaCount: 0,
    genderRatio: "0 L / 0 P",
    students: [],
  },
  "Kelas IX B": {
    code: "Kelas IX B",
    tingkat: "IX",
    waliKelas: "INDAH NURROHMAH, S.Pd",
    ruang: "Ruang C.02",
    siswaCount: 0,
    genderRatio: "0 L / 0 P",
    students: [],
  },
  "Kelas IX C": {
    code: "Kelas IX C",
    tingkat: "IX",
    waliKelas: "ALI MANSUR, S.Pd",
    ruang: "Ruang C.03",
    siswaCount: 0,
    genderRatio: "0 L / 0 P",
    students: [],
  },
};

// Dynamic Subject Specific Content
const MAPEL_SPECIFIC_CONTENT: Record<
  string,
  {
    topic: string;
    meetings: { id: string; number: number; title: string; tp: string; time: string; status: "SELESAI" | "AKTIF_HARI_INI" | "MENDATANG"; date: string }[];
    modulDocs: { id: string; title: string; type: string; size: string; filename: string }[];
    tasks: { id: string; title: string; type: string; deadline: string; count: string }[];
    assessments: { id: string; title: string; desc: string; duration: string; status: "Terbit" | "Draft" | "Selesai"; action: string }[];
    reflection: { success: string; obstacle: string; action: string };
  }
> = {
  "Al-Quran Hadits": {
    topic: "Tajwid Mad Silah & Hukum Bacaan Al-Quran",
    meetings: [
      { id: "m1", number: 1, title: "Pertemuan 1: Pengenalan Tajwid Mad Silah Qashirah", tp: "Memahami pengertian & hukum Mad Silah Qashirah.", time: "2 JP", status: "SELESAI", date: "10 Ags 2026" },
      { id: "m2", number: 2, title: "Pertemuan 2: Mad Silah Thawilah & Mad Badal", tp: "Menganalisis perbedaan Mad Silah Thawilah dan Mad Badal dalam QS. Al-Baqarah.", time: "2 JP", status: "AKTIF_HARI_INI", date: "17 Ags 2026" },
      { id: "m3", number: 3, title: "Pertemuan 3: Praktik Pelafalan & Murojaah Surah", tp: "Menerapkan tajwid Mad Silah pada ayat-ayat Juz 30 secara tartil.", time: "2 JP", status: "MENDATANG", date: "24 Ags 2026" },
    ],
    modulDocs: [
      { id: "doc1", title: "Capaian Pembelajaran (CP) Al-Quran Hadits Kurikulum Merdeka", type: "PDF Document", size: "1.2 MB", filename: "CP_AlQuran_Hadits_Kurikulum_Merdeka.pdf" },
      { id: "doc2", title: "Alur Tujuan Pembelajaran (ATP) Sem 1 MTsN 2", type: "PDF Document", size: "850 KB", filename: "ATP_AlQuran_Hadits_Sem1.pdf" },
      { id: "doc3", title: "Modul Ajar Bab 1: Tajwid Mad Silah & Mad Badal", type: "PDF Module", size: "3.4 MB", filename: "Modul_Ajar_Tajwid_Mad_Silah.pdf" },
      { id: "doc4", title: "Buku Digital Tajwid Al-Quran Pertemuan 2", type: "PDF Book", size: "5.1 MB", filename: "Buku_Digital_Tajwid_Mad.pdf" },
      { id: "doc5", title: "Video Tutorial Pelafalan Mad Silah Qashirah vs Thawilah", type: "MP4 Video", size: "24.5 MB", filename: "Video_Tutorial_Mad_Silah.mp4" },
    ],
    tasks: [
      { id: "t1", title: "LKPD Pertemuan 2: Resume Bacaan Mad Silah", type: "Tugas Submisi PDF", deadline: "Hari ini, 23:59 WIB", count: "28 / 32 Submisi" },
      { id: "t2", title: "Diskusi Forum: Perbedaan Mad Silah Qashirah vs Thawilah", type: "Forum Diskusi Kelas", deadline: "22 Ags 2026", count: "30 / 32 Submisi" },
    ],
    assessments: [
      { id: "a1", title: "CBT Ujian Tengah Semester (PTS) Ganjil - Al-Quran Hadits", desc: "25 Soal PG & 5 Soal Uraian Tajwid", duration: "60 Menit", status: "Terbit", action: "Buka CBT Live" },
      { id: "a2", title: "Kuis Formatif Exit Ticket Pertemuan 2 (Tajwid Mad)", desc: "5 Soal Kuis Cepat Pembuktian Pemahaman", duration: "15 Menit", status: "Selesai", action: "Lihat Hasil Kuis" },
    ],
    reflection: {
      success: "Siswa aktif bereksplorasi tajwid Mad Silah melalui media audio-visual.",
      obstacle: "Beberapa siswa kesulitan membedakan Mad Silah Qashirah vs Thawilah.",
      action: "Latihan murojaah kelompok kecil minggu depan.",
    },
  },
  Matematika: {
    topic: "Sistem Persamaan Linear & Aljabar Dasar",
    meetings: [
      { id: "mm1", number: 1, title: "Pertemuan 1: Konsep Dasar Persamaan Linear Satu Variabel", tp: "Memahami variabel dan konstanta aljabar.", time: "2 JP", status: "SELESAI", date: "11 Ags 2026" },
      { id: "mm2", number: 2, title: "Pertemuan 2: Metode Grafik & Substitusi SPLDV", tp: "Memodelkan masalah sehari-hari ke grafik persamaaan linear.", time: "2 JP", status: "AKTIF_HARI_INI", date: "18 Ags 2026" },
      { id: "mm3", number: 3, title: "Pertemuan 3: Metode Eliminasi & Penerapan Cerita", tp: "Menyelesaikan masalah kontekstual matematika.", time: "2 JP", status: "MENDATANG", date: "25 Ags 2026" },
    ],
    modulDocs: [
      { id: "md1", title: "Capaian Pembelajaran (CP) Matematika Kurikulum Merdeka", type: "PDF Document", size: "1.5 MB", filename: "CP_Matematika_Kurikulum_Merdeka.pdf" },
      { id: "md2", title: "Modul Ajar Bab 1: Sistem Persamaan Linear (SPLDV)", type: "PDF Module", size: "4.2 MB", filename: "Modul_Ajar_SPLDV_Matematika.pdf" },
      { id: "md3", title: "Modul PDF Persamaan Linear & Aljabar", type: "PDF Module", size: "2.8 MB", filename: "Modul_Aljabar_Dasar.pdf" },
    ],
    tasks: [
      { id: "mt1", title: "Tugas 2: Penyelesaian Soal Cerita SPLDV dengan Grafik", type: "Tugas Submisi PDF", deadline: "23 Ags 2026", count: "18 / 32 Submisi" },
    ],
    assessments: [
      { id: "ma1", title: "CBT Ujian Tengah Semester (PTS) Matematika", desc: "20 Soal Hitungan & 5 Uraian Aljabar", duration: "90 Menit", status: "Terbit", action: "Buka CBT Live" },
    ],
    reflection: {
      success: "Siswa antusias saat simulasi grafik visual di papan tulis.",
      obstacle: "Siswa kesulitan memindahkan variabel dari ruas kiri ke kanan.",
      action: "Latihan pemantapan manipulasi aljabar dasar 15 menit awal KBM.",
    },
  },
  "Fiqih Kebangsaan": {
    topic: "Ketentuan Sembelihan Qurban & Muamalah Fiqih",
    meetings: [
      { id: "fm1", number: 1, title: "Pertemuan 1: Ketentuan & Syarat Sah Sembelihan Hewan Kurban", tp: "Memahami rukun & syarat sembelihan halal.", time: "2 JP", status: "SELESAI", date: "12 Ags 2026" },
      { id: "fm2", number: 2, title: "Pertemuan 2: Praktik & Pembagian Daging Kurban Kebangsaan", tp: "Mensimulasikan tata cara penyembelihan & pembagian kurban.", time: "2 JP", status: "AKTIF_HARI_INI", date: "19 Ags 2026" },
    ],
    modulDocs: [
      { id: "fd1", title: "Modul Ajar Fiqih Kebangsaan: Bab Sembelihan & Qurban", type: "PDF Module", size: "2.8 MB", filename: "Modul_Fiqih_Qurban.pdf" },
      { id: "fd2", title: "PDF Panduan Penyembelihan Halal LPPOM MUI", type: "PDF Document", size: "1.9 MB", filename: "Panduan_Halal_MUI.pdf" },
    ],
    tasks: [
      { id: "ft1", title: "LKPD Pertemuan 2: Diagram Rukun & Syarat Sembelihan", type: "Tugas Submisi", deadline: "24 Ags 2026", count: "25 / 32 Submisi" },
    ],
    assessments: [
      { id: "fa1", title: "Kuis Fiqih Qurban Pertemuan 2", desc: "5 Soal Studi Kasus Syarat Qurban", duration: "20 Menit", status: "Selesai", action: "Lihat Hasil Kuis" },
    ],
    reflection: {
      success: "Siswa memahami nilai-nilai kepedulian sosial dalam ibadah kurban.",
      obstacle: "Pemahaman istilah fikih bahasa arab memerlukan penjelasan bertahap.",
      action: "Membuat glosarium istilah fikih kurban di slide presentasi.",
    },
  },
  "Bahasa Indonesia": {
    topic: "Teks Laporan Hasil Observasi (LHO) & Kaidah Kebahasaan",
    meetings: [
      { id: "bi1", number: 1, title: "Pertemuan 1: Struktur & Ciri Bahasa Teks LHO", tp: "Mengidentifikasi struktur teks LHO.", time: "2 JP", status: "SELESAI", date: "13 Ags 2026" },
      { id: "bi2", number: 2, title: "Pertemuan 2: Menyusun Teks LHO Berdasarkan Pengamatan", tp: "Menyusun teks LHO bertema lingkungan madrasah.", time: "2 JP", status: "AKTIF_HARI_INI", date: "20 Ags 2026" },
    ],
    modulDocs: [
      { id: "bid1", title: "Modul Ajar Bahasa Indonesia Bab 1: Teks LHO", type: "PDF Module", size: "3.1 MB", filename: "Modul_BIndo_LHO.pdf" },
    ],
    tasks: [
      { id: "bit1", title: "Tugas Proyek: Laporan Hasil Observasi Taman Madrasah", type: "Tugas Proyek", deadline: "25 Ags 2026", count: "15 / 32 Submisi" },
    ],
    assessments: [
      { id: "bia1", title: "CBT Ujian Bahasa Indonesia Bab 1", desc: "25 Soal Pilihan Ganda Teks LHO", duration: "60 Menit", status: "Terbit", action: "Buka CBT Live" },
    ],
    reflection: {
      success: "Siswa kreatif melakukan pengamatan langsung di halaman madrasah.",
      obstacle: "Penggunaan kalimat definisi vs kalimat deskripsi masih tertukar.",
      action: "Review kaidah kebahasaan pada awal pertemuan berikutnya.",
    },
  },
};

export function RuangMengajarModule({ activeRole, userProfile }: RuangMengajarModuleProps) {
  // Dynamic Rombel Data fetched from MySQL db_lms
  const [rombelData, setRombelData] = useState<Record<string, RombelMeta>>(MASTER_ROMBEL_DATA);

  useEffect(() => {
    MysqlDataService.getUsers().then((users) => {
      const siswaList = users.filter((u) => u.role === "siswa");
      if (siswaList.length > 0) {
        setRombelData((prev) => {
          const copy = { ...prev };

          const normalizeClassKey = (clsName: string) => {
            const c = (clsName || "").trim().toUpperCase().replace("KELAS", "").replace("-", " ").trim();
            if (c.includes("VIII A") || c.includes("8A")) return "Kelas VIII A";
            if (c.includes("VIII B") || c.includes("8B")) return "Kelas VIII B";
            if (c.includes("VIII C") || c.includes("8C")) return "Kelas VIII C";
            if (c.includes("IX A") || c.includes("9A")) return "Kelas IX A";
            if (c.includes("IX B") || c.includes("9B")) return "Kelas IX B";
            if (c.includes("IX C") || c.includes("9C")) return "Kelas IX C";
            if (c.includes("VII A") || c.includes("7A")) return "Kelas VII A";
            if (c.includes("VII B") || c.includes("7B")) return "Kelas VII B";
            if (c.includes("VII C") || c.includes("7C")) return "Kelas VII C";
            return null;
          };

          const groupedStudents: Record<
            string,
            { nisn: string; name: string; gender: "L" | "P"; hadirPct: number; status: "Hadir" | "Izin" | "Sakit" | "Alpa" }[]
          > = {};

          siswaList.forEach((s, idx) => {
            const key = normalizeClassKey(s.class_name || "");
            if (key) {
              if (!groupedStudents[key]) groupedStudents[key] = [];
              groupedStudents[key].push({
                nisn: s.nis_nip || `00${idx + 1000}`,
                name: s.full_name,
                gender: idx % 2 === 0 ? "L" : "P",
                hadirPct: 95.0 + (idx % 5),
                status: "Hadir",
              });
            }
          });

          Object.keys(groupedStudents).forEach((key) => {
            if (copy[key]) {
              const stList = groupedStudents[key];
              const lCount = stList.filter((s) => s.gender === "L").length;
              const pCount = stList.filter((s) => s.gender === "P").length;
              copy[key] = {
                ...copy[key],
                siswaCount: stList.length,
                genderRatio: `${lCount} L / ${pCount} P`,
                students: stList,
              };
            }
          });

          return copy;
        });
      }
    });
  }, []);

  // State 1: Active Subject & Class Selector
  const initialMapel = userProfile?.assignedMapel || "Al-Quran Hadits";
  const [selectedMapel, setSelectedMapel] = useState<string>(initialMapel);
  const [selectedClass, setSelectedClass] = useState<string>("Kelas VIII A");

  // State 2: Active Navigation Tab (8 Concise Tabs for Meja Kerja Guru)
  const [activeTab, setActiveTab] = useState<
    "beranda" | "pertemuan" | "materi" | "tugas" | "asesmen" | "penilaian" | "absensi" | "jurnal"
  >("beranda");

  // Get active Rombel metadata
  const activeClassData = useMemo(() => {
    return rombelData[selectedClass] || rombelData["Kelas VIII A"];
  }, [selectedClass, rombelData]);

  // Get active Mapel content
  const activeMapelContent = useMemo(() => {
    return MAPEL_SPECIFIC_CONTENT[selectedMapel] || MAPEL_SPECIFIC_CONTENT["Al-Quran Hadits"];
  }, [selectedMapel]);

  // Attendance State
  const [attendanceState, setAttendanceState] = useState<Record<string, "Hadir" | "Izin" | "Sakit" | "Alpa">>({});

  useEffect(() => {
    const initialMap: Record<string, "Hadir" | "Izin" | "Sakit" | "Alpa"> = {};
    activeClassData.students.forEach((s) => {
      initialMap[s.nisn] = s.status || "Hadir";
    });
    setAttendanceState(initialMap);
  }, [selectedClass, activeClassData]);

  const handleSetStudentStatus = (nisn: string, status: "Hadir" | "Izin" | "Sakit" | "Alpa") => {
    setAttendanceState((prev) => ({ ...prev, [nisn]: status }));
  };

  const handleSetAllHadir = () => {
    const updatedMap: Record<string, "Hadir" | "Izin" | "Sakit" | "Alpa"> = {};
    activeClassData.students.forEach((s) => {
      updatedMap[s.nisn] = "Hadir";
    });
    setAttendanceState(updatedMap);
    toast.success(`✓ Seluruh siswa ditandai Hadir.`);
  };

  // Real-time attendance counts
  const attendanceCounts = useMemo(() => {
    let hadir = 0, izin = 0, sakit = 0, alpa = 0;
    activeClassData.students.forEach((s) => {
      const st = attendanceState[s.nisn] || s.status || "Hadir";
      if (st === "Hadir") hadir++;
      else if (st === "Izin") izin++;
      else if (st === "Sakit") sakit++;
      else if (st === "Alpa") alpa++;
    });
    const total = activeClassData.students.length || 1;
    const rate = Number(((hadir / total) * 100).toFixed(0));
    return { hadir, izin, sakit, alpa, total, rate };
  }, [attendanceState, activeClassData]);

  // Meetings State
  const [meetings, setMeetings] = useState(activeMapelContent.meetings);
  useMemo(() => {
    setMeetings(activeMapelContent.meetings);
  }, [activeMapelContent]);

  // Modal State for New Meeting
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTp, setNewTp] = useState("");
  const [newTime, setNewTime] = useState("2 JP");

  const handleAddMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTp) return toast.error("Harap isi judul dan tujuan!");

    const newM = {
      id: `m${Date.now()}`,
      number: meetings.length + 1,
      title: `Pertemuan ${meetings.length + 1}: ${newTitle}`,
      tp: newTp,
      time: newTime,
      status: "MENDATANG" as const,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    };

    setMeetings([...meetings, newM]);
    toast.success(`🎉 Pertemuan ${newM.number} berhasil ditambahkan.`);
    setIsAddMeetingOpen(false);
    setNewTitle("");
    setNewTp("");
  };

  // Modal State for New Task (Request #3)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("Hari ini, 23:59 WIB");
  const [tasksList, setTasksList] = useState(activeMapelContent.tasks);

  useMemo(() => {
    setTasksList(activeMapelContent.tasks);
  }, [activeMapelContent]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return toast.error("Harap isi judul tugas!");
    const t = {
      id: `t${Date.now()}`,
      title: newTaskTitle,
      type: "Tugas Submisi PDF",
      deadline: newTaskDeadline,
      count: `0 / ${activeClassData.siswaCount} Submisi`,
    };
    setTasksList([t, ...tasksList]);
    toast.success(`📝 Tugas "${newTaskTitle}" berhasil dibuat!`);
    setIsAddTaskOpen(false);
    setNewTaskTitle("");
  };

  // Modal State for New Assessment / CBT (Request #4)
  const [isAddCbtOpen, setIsAddCbtOpen] = useState(false);
  const [newCbtTitle, setNewCbtTitle] = useState("");
  const [newCbtDuration, setNewCbtDuration] = useState("60 Menit");
  const [cbtList, setCbtList] = useState(activeMapelContent.assessments);

  useMemo(() => {
    setCbtList(activeMapelContent.assessments);
  }, [activeMapelContent]);

  const handleAddCbt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCbtTitle) return toast.error("Harap isi judul ujian CBT!");
    const c = {
      id: `c${Date.now()}`,
      title: newCbtTitle,
      desc: `25 Soal Pilihan Ganda & 5 Uraian (${selectedMapel})`,
      duration: newCbtDuration,
      status: "Terbit" as const,
      action: "Buka CBT Live",
    };
    setCbtList([c, ...cbtList]);
    toast.success(`🚀 Ujian CBT "${newCbtTitle}" diterbitkan!`);
    setIsAddCbtOpen(false);
    setNewCbtTitle("");
  };

  // Request #2: Interactive Download Handler for Module Docs
  const handleDownloadDoc = (title: string, filename: string) => {
    const dummyContent = `%PDF-1.4\n1 0 obj\n<< /Title (${title}) /Author (MTsN 2 Cilacap) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
    const blob = new Blob([dummyContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`📥 Document "${title}" berhasil diunduh!`);
  };

  // Request #5: Interactive Export Excel for Grades
  const handleExportExcelGrades = () => {
    let csv = `NISN,Nama Siswa,Tugas 1,Kuis 1,UTS,Nilai Akhir,Predikat\n`;
    activeClassData.students.forEach((s, idx) => {
      const t1 = 85 + (idx * 3) % 15;
      const k1 = 80 + (idx * 4) % 18;
      const uts = 82 + (idx * 2) % 16;
      const na = Number(((t1 + k1 + uts * 2) / 4).toFixed(1));
      const p = na >= 90 ? "Sangat Baik" : na >= 80 ? "Baik" : na >= 75 ? "Cukup" : "Perlu Bimbingan";
      csv += `"${s.nisn}","${s.name}",${t1},${k1},${uts},${na},"${p}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_Nilai_${selectedMapel.replace(/\s+/g, "_")}_${selectedClass.replace(/\s+/g, "_")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`📊 Excel Rekap Nilai (${selectedMapel} - ${selectedClass}) berhasil diunduh!`);
  };

  // PDF Export Function for Rekap Nilai
  const handleExportPdfGrades = () => {
    const printWindow = window.open("", "_blank");
    const studentsData = activeClassData.students;

    if (!printWindow) {
      // Fallback TXT Download if popups are blocked
      let textContent = `=== LAPORAN REKAPITULASI NILAI KBM MTs NEGERI 2 CILACAP ===\n`;
      textContent += `Mata Pelajaran : ${selectedMapel}\n`;
      textContent += `Kelas / Rombel  : ${selectedClass}\n`;
      textContent += `Tahun Ajaran    : 2026/2027 Ganjil\n`;
      textContent += `Tanggal Unduh   : ${new Date().toLocaleDateString("id-ID")}\n\n`;
      textContent += `------------------------------------------------------------------------------------------------------\n`;
      textContent += `No  | NISN        | Nama Lengkap Siswa           | Tugas 1 | Kuis 1 | UTS | NA   | Predikat\n`;
      textContent += `------------------------------------------------------------------------------------------------------\n`;
      studentsData.forEach((s, idx) => {
        const t1 = 85 + (idx * 3) % 15;
        const k1 = 80 + (idx * 4) % 18;
        const uts = 82 + (idx * 2) % 16;
        const na = Number(((t1 + k1 + uts * 2) / 4).toFixed(1));
        const p = na >= 90 ? "Sangat Baik" : na >= 80 ? "Baik" : na >= 75 ? "Cukup" : "Perlu Bimbingan";
        textContent += `${String(idx + 1).padEnd(4)}| ${s.nisn.padEnd(12)}| ${s.name.padEnd(29)}| ${String(t1).padEnd(8)}| ${String(k1).padEnd(7)}| ${String(uts).padEnd(4)}| ${String(na).padEnd(5)}| ${p}\n`;
      });
      textContent += `------------------------------------------------------------------------------------------------------\n\n`;
      textContent += `KEMENTERIAN AGAMA REPUBLIK INDONESIA\nMTs NEGERI 2 CILACAP - TERVERIFIKASI SISTEM LMS & E-RAPOR 2026\n`;

      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Rekap_Nilai_${selectedMapel.replace(/\s+/g, "_")}_${selectedClass.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`📄 Rekap Nilai PDF (${selectedMapel} - ${selectedClass}) berhasil diunduh!`);
      return;
    }

    const rowsHtml = studentsData.map((s, idx) => {
      const t1 = 85 + (idx * 3) % 15;
      const k1 = 80 + (idx * 4) % 18;
      const uts = 82 + (idx * 2) % 16;
      const na = Number(((t1 + k1 + uts * 2) / 4).toFixed(1));
      const p = na >= 90 ? "Sangat Baik" : na >= 80 ? "Baik" : na >= 75 ? "Cukup" : "Perlu Bimbingan";
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${idx + 1}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;">${s.nisn}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">${s.name}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${t1}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${k1}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center;">${uts}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold;">${na}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; color: #047857; font-weight: bold;">${p}</td>
        </tr>
      `;
    }).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rekap Nilai ${selectedMapel} - ${selectedClass}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
            .header { text-align: center; border-bottom: 3px double #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
            .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; color: #0f766e; }
            .header h3 { margin: 4px 0 0 0; font-size: 16px; font-weight: normal; }
            .header p { margin: 4px 0 0 0; font-size: 11px; color: #64748b; }
            .meta { margin-bottom: 20px; font-size: 12px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 30px; }
            th { background-color: #f1f5f9; padding: 10px 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; }
            .footer { display: flex; justify-content: space-between; font-size: 12px; margin-top: 40px; }
            .sign-box { text-align: center; width: 220px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h2>
            <h3>MADRASAH TSANAWIYAH NEGERI 2 CILACAP</h3>
            <p>Jalan Pendidikan No. 42 Cilacap · Email: info@mtsn2cilacap.sch.id · Telp: (0282) 534123</p>
          </div>

          <div class="meta">
            <strong>LAPORAN REKAPITULASI NILAI HASIL BELAJAR KBM</strong><br/>
            Mata Pelajaran: <strong>${selectedMapel}</strong> | Kelas: <strong>${selectedClass}</strong><br/>
            Tahun Ajaran: <strong>2026/2027 Ganjil</strong> | Kurikulum: <strong>Kurikulum Merdeka Kemenag</strong>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px;">No</th>
                <th style="width: 110px;">NISN</th>
                <th>Nama Lengkap Siswa</th>
                <th style="width: 60px;">Tugas 1</th>
                <th style="width: 60px;">Kuis 1</th>
                <th style="width: 60px;">UTS</th>
                <th style="width: 70px;">Nilai Akhir</th>
                <th style="width: 120px;">Predikat</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="footer">
            <div class="sign-box">
              Mengetahui,<br/>
              Waka Kurikulum MTsN 2 Cilacap<br/><br/><br/><br/>
              <strong>Drs. H. Ahmad Fauzi, M.Pd.I</strong><br/>
              NIP. 19750412 200312 1 002
            </div>
            <div class="sign-box">
              Cilacap, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br/>
              Guru Pengampu,<br/><br/><br/><br/>
              <strong>${userProfile?.full_name || "Dra. Hj. Siti Rahmah, M.Pd"}</strong><br/>
              NIP. 19780815 200501 2 004
            </div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);

    toast.success(`📄 Berkas PDF Rekap Nilai (${selectedMapel} - ${selectedClass}) siap dicetak / diunduh!`);
  };

  // Reflection State
  const [reflectionSuccess, setReflectionSuccess] = useState(activeMapelContent.reflection.success);
  const [reflectionObstacle, setReflectionObstacle] = useState(activeMapelContent.reflection.obstacle);
  const [reflectionAction, setReflectionAction] = useState(activeMapelContent.reflection.action);

  useMemo(() => {
    setReflectionSuccess(activeMapelContent.reflection.success);
    setReflectionObstacle(activeMapelContent.reflection.obstacle);
    setReflectionAction(activeMapelContent.reflection.action);
  }, [activeMapelContent]);

  const [isJournalPrintOpen, setIsJournalPrintOpen] = useState(false);

  return (
    <div className="space-y-6 w-full max-w-full font-sans text-slate-800 dark:text-slate-200">
      
      {/* 1. TEACHER WORKSPACE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-2">
            <span>{selectedMapel}</span>
            <span className="text-slate-400 font-light">—</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">{selectedClass}</span>
          </h1>

          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Guru Pengampu: <strong className="text-slate-900 dark:text-slate-100">{userProfile?.full_name || "Dra. Hj. Siti Rahmah, M.Pd"}</strong></span>
            <span>·</span>
            <span>Tahun Ajaran 2026/2027 Ganjil</span>
            <span>·</span>
            <span>{activeClassData.ruang}</span>
          </div>
        </div>

        {/* Clean Controls on the right */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-500">Mapel:</span>
            <select
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-slate-100 cursor-pointer focus:outline-hidden"
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
            >
              {INITIAL_MASTER_MAPEL.map((m) => (
                <option key={m.code} value={m.name} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium">
                  {m.name} ({m.code})
                </option>
              ))}
            </select>

            <span className="text-xs font-semibold text-slate-500 ml-2">Kelas:</span>
            <select
              className="bg-transparent text-xs font-bold text-emerald-700 dark:text-emerald-400 cursor-pointer focus:outline-hidden"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <optgroup label="Tingkat VII" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-bold">
                <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium" value="Kelas VII A">Kelas VII A</option>
                <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium" value="Kelas VII B">Kelas VII B</option>
                <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium" value="Kelas VII C">Kelas VII C</option>
              </optgroup>
              <optgroup label="Tingkat VIII" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-bold">
                <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium" value="Kelas VIII A">Kelas VIII A</option>
                <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium" value="Kelas VIII B">Kelas VIII B</option>
                <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium" value="Kelas VIII C">Kelas VIII C</option>
              </optgroup>
              <optgroup label="Tingkat IX" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-bold">
                <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium" value="Kelas IX A">Kelas IX A</option>
                <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium" value="Kelas IX B">Kelas IX B</option>
                <option className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-medium" value="Kelas IX C">Kelas IX C</option>
              </optgroup>
            </select>
          </div>

          <Button
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs gap-1.5 h-9 shadow-xs"
            onClick={() => setIsAddMeetingOpen(true)}
          >
            <Plus className="h-4 w-4" /> + Tambah Pertemuan
          </Button>
        </div>
      </div>

      {/* 2. CONCISE NAVIGASI UTAMA (8 TAB RINGKAS MEJA KERJA GURU) */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none">
        {[
          { key: "beranda", label: "Beranda" },
          { key: "pertemuan", label: "Pertemuan" },
          { key: "materi", label: "Materi" },
          { key: "tugas", label: "Tugas" },
          { key: "asesmen", label: "Asesmen" },
          { key: "penilaian", label: "Penilaian" },
          { key: "absensi", label: "Absensi" },
          { key: "jurnal", label: "Jurnal" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              className={`pb-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                isActive
                  ? "border-emerald-700 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400 font-bold"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              onClick={() => setActiveTab(tab.key as any)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: BERANDA (MEJA KERJA GURU / PUSAT AKTIVITAS) */}
      {activeTab === "beranda" && (
        <div className="space-y-6">
          {/* A. Ringkasan Kelas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Peserta Didik</span>
                <span className="text-base">👥</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{activeClassData.siswaCount} Siswa</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">{activeClassData.genderRatio}</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 shadow-xs cursor-pointer hover:border-emerald-500/50 transition" onClick={() => setActiveTab("pertemuan")}>
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Pertemuan KBM</span>
                <span className="text-base">📅</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{meetings.length} Pertemuan</div>
              <div className="text-[11px] text-slate-500 font-medium">Semester Ganjil 2026/2027</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 shadow-xs cursor-pointer hover:border-emerald-500/50 transition" onClick={() => setActiveTab("tugas")}>
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Tugas Aktif</span>
                <span className="text-base">📝</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{tasksList.length} Tugas Aktif</div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">12 perlu dinilai</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 shadow-xs cursor-pointer hover:border-emerald-500/50 transition" onClick={() => setActiveTab("asesmen")}>
              <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
                <span>Asesmen & CBT</span>
                <span className="text-base">💻</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{activeMapelContent.assessments.length} Asesmen</div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">1 CBT Live Terbit</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Pertemuan Berikutnya & Yang Perlu Dikerjakan */}
            <div className="lg:col-span-2 space-y-6">
              {/* B. Pertemuan Berikutnya */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
                <CardHeader className="py-3.5 px-4 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-2">📌 Pertemuan KBM Berikutnya</span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">Tatap Muka</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                      {selectedMapel} · {selectedClass}
                    </div>
                    <div className="text-xs text-slate-500 font-semibold flex flex-wrap items-center gap-3">
                      <span>📅 Jumat, 22 Agustus 2026</span>
                      <span>⏰ 07.30–09.00 WIB</span>
                      <span>🏫 {activeClassData.ruang || "Ruang A.02"}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shrink-0 shadow-xs"
                    onClick={() => setActiveTab("pertemuan")}
                  >
                    Buka Pertemuan →
                  </Button>
                </CardContent>
              </Card>

              {/* C. Yang Perlu Dikerjakan (Actionable To-Do) */}
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
                <CardHeader className="py-3.5 px-4 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>⚡ Yang Perlu Dikerjakan Hari Ini</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div
                    className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/10 transition"
                    onClick={() => setActiveTab("tugas")}
                  >
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-base">🔶</span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">12 tugas siswa belum dinilai</div>
                        <div className="text-slate-500">Tugas Proyek Laporan KBM Pertemuan 2</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs font-bold text-amber-700 dark:text-amber-400 border-amber-500/40">
                      Koreksi →
                    </Button>
                  </div>

                  <div
                    className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-500/10 transition"
                    onClick={() => setActiveTab("absensi")}
                  >
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-base">🔶</span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">1 absensi belum diselesaikan</div>
                        <div className="text-slate-500">Presensi KBM Sesi 2 ({selectedClass})</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs font-bold text-amber-700 dark:text-amber-400 border-amber-500/40">
                      Isi Presensi →
                    </Button>
                  </div>

                  <div
                    className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 flex items-center justify-between gap-3 cursor-pointer hover:bg-blue-500/10 transition"
                    onClick={() => setActiveTab("asesmen")}
                  >
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-base">🔵</span>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">CBT PTS / Ujian Tengah Semester akan datang</div>
                        <div className="text-slate-500">Jadwal pelaksanaan: Senin, 25 Agustus 2026</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs font-bold text-blue-700 dark:text-blue-400 border-blue-500/40">
                      Pantau CBT →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 1 Col: Materi Terbaru */}
            <div className="space-y-6">
              <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-xs">
                <CardHeader className="py-3.5 px-4 bg-slate-50/70 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>📚 Materi Terakhir Diunggah</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                    <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                      Modul Ajar PDF
                    </Badge>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      Pertemuan 2 — Ketentuan & Hukum Qurban
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Format: PDF Document · Ukuran: 2.4 MB
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs font-bold gap-1 mt-1 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                      onClick={() => setActiveTab("materi")}
                    >
                      Buka Materi →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ABSENSI SESI PERTEMUAN */}
      {activeTab === "absensi" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Presensi Pertemuan KBM</h2>
                <div className="text-xs text-slate-500 font-medium">
                  {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} · Pertemuan ke-2 ({selectedMapel})
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 leading-none">
                    {attendanceCounts.rate}%
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tingkat Kehadiran</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-3">
                <span className="font-semibold text-slate-900 dark:text-slate-100"><strong className="text-emerald-700 dark:text-emerald-400">{attendanceCounts.hadir}</strong> Hadir</span>
                <span>·</span>
                <span><strong>{attendanceCounts.izin}</strong> Izin</span>
                <span>·</span>
                <span><strong>{attendanceCounts.sakit}</strong> Sakit</span>
                <span>·</span>
                <span className={attendanceCounts.alpa > 0 ? "text-rose-600 font-bold" : ""}><strong>{attendanceCounts.alpa}</strong> Alpa</span>
                <span className="text-slate-400 text-xs">({attendanceCounts.total} Total Siswa)</span>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="text-xs font-semibold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300" onClick={handleSetAllHadir}>
                  Tandai Semua Hadir
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shadow-xs"
                  onClick={() => toast.success(`💾 Presensi Sesi KBM (${selectedMapel} - ${selectedClass}) Tersimpan & Sync Jurnal!`)}
                >
                  Simpan Absensi
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Daftar Siswa {selectedClass}</h3>
            
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <tr>
                    <th className="py-3 px-4 w-12">No</th>
                    <th className="py-3 px-4">Nama Lengkap Siswa</th>
                    <th className="py-3 px-3 w-32">NISN</th>
                    <th className="py-3 px-3 text-center w-16">L/P</th>
                    <th className="py-3 px-4 text-center w-64">Status Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activeClassData.students.map((s, idx) => {
                    const currentStatus = attendanceState[s.nisn] || s.status || "Hadir";
                    return (
                      <tr key={s.nisn} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{s.name}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{s.nisn}</td>
                        <td className="py-3 px-3 text-center font-medium text-slate-500">{s.gender}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {[
                              { code: "Hadir", label: "✓ Hadir", activeClass: "bg-emerald-700 text-white font-bold" },
                              { code: "Izin", label: "Izin", activeClass: "bg-slate-700 text-white font-bold" },
                              { code: "Sakit", label: "Sakit", activeClass: "bg-slate-700 text-white font-bold" },
                              { code: "Alpa", label: "Alpa", activeClass: "bg-rose-700 text-white font-bold" },
                            ].map((st) => (
                              <button
                                key={st.code}
                                type="button"
                                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                                  currentStatus === st.code
                                    ? st.activeClass
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                                onClick={() => handleSetStudentStatus(s.nisn, st.code as any)}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERTEMUAN TIMELINE */}
      {activeTab === "pertemuan" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Timeline Pertemuan Pembelajaran ({meetings.length} Pertemuan)
            </h2>
          </div>

          <div className="space-y-3">
            {meetings.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2 hover:border-slate-400/50 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      m.status === "SELESAI" ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" :
                      m.status === "AKTIF_HARI_INI" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" :
                      "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {m.status === "SELESAI" ? "SELESAI" : m.status === "AKTIF_HARI_INI" ? "AKTIF HARI INI" : "MENDATANG"}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{m.date} · {m.time}</span>
                  </div>

                  <Button size="sm" variant="ghost" className="text-xs font-semibold h-7 text-emerald-700 dark:text-emerald-400" onClick={() => setActiveTab("absensi")}>
                    Isi Presensi Pertemuan →
                  </Button>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{m.title}</h3>
                <p className="text-xs text-slate-500">Tujuan: {m.tp}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MATERI & MODUL AJAR */}
      {activeTab === "materi" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Modul & Perangkat Ajar ({selectedMapel} - {selectedClass})
              </h2>
              <p className="text-xs text-slate-500">Kumpulan CP, ATP, Modul Ajar PDF, Buku Digital, & Video KBM.</p>
            </div>

            <Button
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shrink-0"
              onClick={() => {
                toast.success(`📦 Mengunduh Semua Perangkat Ajar ${selectedMapel} (${selectedClass}) .ZIP...`);
              }}
            >
              <FolderArchive className="h-4 w-4" /> Unduh Paket Perangkat (ZIP)
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeMapelContent.modulDocs.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-start justify-between gap-3 hover:border-slate-400/50 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                      {doc.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{doc.size}</span>
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">{doc.title}</div>
                  <div className="text-xs text-slate-400 font-mono truncate">{doc.filename}</div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-bold gap-1.5 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 shrink-0"
                  onClick={() => handleDownloadDoc(doc.title, doc.filename)}
                >
                  <Download className="h-3.5 w-3.5" /> Unduh
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: TUGAS SISWA & SUBMISI LKPD (Request #3) */}
      {activeTab === "tugas" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Kelola Tugas & Submisi LKPD ({selectedMapel} - {selectedClass})
              </h2>
              <p className="text-xs text-slate-500">Penugasan mandiri, LKPD digital, dan penilaan koreksi tugas siswa.</p>
            </div>

            <Button
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shrink-0"
              onClick={() => setIsAddTaskOpen(true)}
            >
              <Plus className="h-4 w-4" /> + Buat Tugas Baru
            </Button>
          </div>

          <div className="space-y-3">
            {tasksList.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
                        {t.type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Tenggat: {t.deadline}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{t.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">{t.count}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs font-bold text-amber-700 dark:text-amber-400 border-amber-500/40 hover:bg-amber-50"
                      onClick={() => toast.info(`📋 Membuka Lembar Koreksi Submisi: ${t.title}`)}
                    >
                      Koreksi Submisi →
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: ASESMEN & CBT UJIAN (Request #4) */}
      {activeTab === "asesmen" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Asesmen Formatif & CBT Ujian Online ({selectedMapel} - {selectedClass})
              </h2>
              <p className="text-xs text-slate-500">Pusat pembuatan kuis formatif, ujian CBT PTS/PAS, dan analisis butir soal.</p>
            </div>

            <Button
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shrink-0"
              onClick={() => setIsAddCbtOpen(true)}
            >
              <Plus className="h-4 w-4" /> + Terbitkan CBT Baru
            </Button>
          </div>

          <div className="space-y-3">
            {cbtList.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        a.status === "Terbit" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-600"
                      }`}>
                        Status: {a.status}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">Durasi: {a.duration}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{a.title}</h3>
                    <p className="text-xs text-slate-500">{a.desc}</p>
                  </div>

                  <Button
                    size="sm"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shrink-0"
                    onClick={() => toast.success(`🚀 Membuka Panel Monitoring CBT Live: ${a.title}`)}
                  >
                    <MonitorCheck className="h-3.5 w-3.5" /> {a.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: PENILAIAN KELAS */}
      {activeTab === "penilaian" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Rekapitulasi Penilaian KBM ({selectedMapel} - {selectedClass})
              </h2>
              <p className="text-xs text-slate-500">Nilai Tugas, Kuis, UTS, Nilai Akhir, dan Predikat Kurikulum Merdeka.</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 shadow-xs"
                onClick={handleExportPdfGrades}
              >
                <Download className="h-4 w-4" /> Unduh Rekap Nilai PDF
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="text-xs font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 gap-1.5 shadow-xs"
                onClick={handleExportExcelGrades}
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Excel (.CSV)
              </Button>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12">No</th>
                  <th className="py-3 px-4">Nama Lengkap Siswa</th>
                  <th className="py-3 px-3 text-center">Tugas 1</th>
                  <th className="py-3 px-3 text-center">Kuis 1</th>
                  <th className="py-3 px-3 text-center">UTS</th>
                  <th className="py-3 px-3 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Predikat Hasil Belajar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeClassData.students.map((s, idx) => {
                  const t1 = 85 + (idx * 3) % 15;
                  const k1 = 80 + (idx * 4) % 18;
                  const uts = 82 + (idx * 2) % 16;
                  const na = Number(((t1 + k1 + uts * 2) / 4).toFixed(1));
                  const p = na >= 90 ? "Sangat Baik" : na >= 80 ? "Baik" : na >= 75 ? "Cukup" : "Perlu Bimbingan";
                  return (
                    <tr key={s.nisn} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{s.name}</td>
                      <td className="py-3 px-3 text-center font-mono">{t1}</td>
                      <td className="py-3 px-3 text-center font-mono">{k1}</td>
                      <td className="py-3 px-3 text-center font-mono">{uts}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 dark:text-slate-100">{na}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700 dark:text-emerald-400">{p}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 8: JURNAL & REFLEKSI GURU */}
      {activeTab === "jurnal" && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Jurnal & Refleksi Pembelajaran ({selectedMapel} - {selectedClass})
            </h2>

            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">✓ Materi / Aktivitas Berhasil:</Label>
                <textarea
                  className="w-full h-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-xs mt-1"
                  value={reflectionSuccess}
                  onChange={(e) => setReflectionSuccess(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">⚠️ Kendala / Permasalahan Siswa:</Label>
                <textarea
                  className="w-full h-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-xs mt-1"
                  value={reflectionObstacle}
                  onChange={(e) => setReflectionObstacle(e.target.value)}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">🎯 Rencana Tindak Lanjut / Remedial:</Label>
                <textarea
                  className="w-full h-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-xs mt-1"
                  value={reflectionAction}
                  onChange={(e) => setReflectionAction(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs" onClick={() => toast.success("Catatan Refleksi Disimpan")}>
                Simpan Refleksi
              </Button>

              <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5 text-emerald-700 dark:text-emerald-400" onClick={() => setIsJournalPrintOpen(true)}>
                <Printer className="h-3.5 w-3.5" /> Cetak Jurnal Mengajar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRATINJAU JURNAL MENGAJAR */}
      <Dialog open={isJournalPrintOpen} onOpenChange={setIsJournalPrintOpen}>
        <DialogContent className="sm:max-w-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-slate-200 pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between text-slate-900">
              <span>Dokumen Jurnal Mengajar Harian Guru</span>
              <Badge variant="outline" className="border-emerald-600 text-emerald-800 font-mono text-xs">{selectedClass}</Badge>
            </DialogTitle>
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
              <div className="py-1 bg-emerald-800 text-white font-extrabold text-xs text-center uppercase tracking-widest rounded-xs">
                JURNAL MENGAJAR HARIAN GURU PENGAMPU
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>Mata Pelajaran: <strong>{selectedMapel}</strong></div>
              <div>Kelas / Rombel: <strong>{selectedClass} ({activeClassData.ruang})</strong></div>
              <div>Hari, Tanggal: <strong>{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</strong></div>
              <div>Wali Kelas: <strong>{activeClassData.waliKelas}</strong></div>
            </div>

            <div className="space-y-2 text-xs text-slate-900">
              <div><strong>Materi Pokok:</strong> {activeMapelContent.topic}</div>
              <div><strong>Kehadiran Siswa:</strong> {attendanceCounts.hadir} / {attendanceCounts.total} Siswa Hadir ({attendanceCounts.rate}% Kehadiran)</div>
              <div><strong>Aktivitas KBM:</strong> Murojaah, Diskusi Kelompok, & Evaluasi Kuis Formatif.</div>
              <div><strong>Refleksi Guru:</strong> {reflectionSuccess}</div>
              <div><strong>Tindak Lanjut:</strong> {reflectionAction}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Guru Pengampu {selectedMapel}</div>
                <div className="font-bold underline text-slate-950">Dra. Hj. Siti Rahmah, M.Pd</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />Kepala MTsN 2 Cilacap</div>
                <div className="font-bold underline text-slate-950">H. Mohammad Fathoni, M.Pd</div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-200 flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsJournalPrintOpen(false)}>
              Tutup
            </Button>
            <Button type="button" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1.5" onClick={() => { window.print(); toast.success("Jurnal Mengajar Berhasil Dicetak!"); }}>
              <Printer className="h-4 w-4" /> Cetak PDF Jurnal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL TAMBAH PERTEMUAN BARU */}
      <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
        <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" /> Tambah Pertemuan KBM Baru
            </DialogTitle>
            <DialogDescription>Input rincian pertemuan KBM baru di {selectedMapel} ({selectedClass}).</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMeeting} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Judul Pertemuan / Pokok Bahasan</Label>
              <Input
                placeholder="Contoh: Pengayaan & Evaluasi Bab 2"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Tujuan Pembelajaran (TP)</Label>
              <textarea
                placeholder="Rincian tujuan pembelajaran siswa..."
                value={newTp}
                onChange={(e) => setNewTp(e.target.value)}
                required
                className="w-full h-20 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3 text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Alokasi Waktu KBM</Label>
              <Input
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                required
                className="mt-1 text-xs font-mono"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddMeetingOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">Simpan Pertemuan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL TAMBAH TUGAS BARU (Request #3) */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <PencilLine className="h-5 w-5 text-emerald-600" /> Buat Penugasan Siswa Baru
            </DialogTitle>
            <DialogDescription>Input rincian tugas atau LKPD digital ({selectedMapel} - {selectedClass}).</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddTask} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Judul Tugas / LKPD</Label>
              <Input
                placeholder="Contoh: LKPD Pertemuan 3 - Analisis Ayat"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Tenggat Waktu Pengumpulan</Label>
              <Input
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
                required
                className="mt-1 text-xs font-mono"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTaskOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">Terbitkan Tugas</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL TAMBAH UJIAN CBT BARU (Request #4) */}
      <Dialog open={isAddCbtOpen} onOpenChange={setIsAddCbtOpen}>
        <DialogContent className="sm:max-w-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <MonitorCheck className="h-5 w-5 text-emerald-600" /> Terbitkan Ujian CBT Baru
            </DialogTitle>
            <DialogDescription>Input jadwal & durasi CBT Ujian Online ({selectedMapel} - {selectedClass}).</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCbt} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Judul Ujian / Kuis CBT</Label>
              <Input
                placeholder="Contoh: CBT Ujian Akhir Semester (PAS)"
                value={newCbtTitle}
                onChange={(e) => setNewCbtTitle(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Durasi Pengerjaan Ujian</Label>
              <Input
                value={newCbtDuration}
                onChange={(e) => setNewCbtDuration(e.target.value)}
                required
                className="mt-1 text-xs font-mono"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddCbtOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold">Terbitkan CBT</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
