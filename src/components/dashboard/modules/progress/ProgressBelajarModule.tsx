import { useState, useEffect, useMemo } from "react";
import { TrendingUp, Inbox, CheckCircle2, Building2, Users, BookOpen, Search, Eye, Filter, BarChart3, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { isSameClass, normalizeRombelName } from "@/utils/classNormalization";

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> {title}
      </h1>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export interface StudentProgressRow {
  id: string;
  name: string;
  nis: string;
  rombel: string;
  cp: number;
  tugas: number;
  status: string;
}

export interface RombelSummaryRow {
  rombel: string;
  totalSiswa: number;
  avgCp: number;
  avgTugas: number;
  tuntasCount: number;
  prosesCount: number;
  belumCount: number;
}

export function ProgressBelajarModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin" || activeRole === "kepala_madrasah";
  const isSiswa = activeRole === "siswa";

  const userSession = MysqlAuthService.getActiveUser();
  const rawClass = userProfile?.assignedClass || userProfile?.class_name || userProfile?.class || userSession?.class_name;
  
  let binaanRombel = "Rombel 8A";
  if (rawClass && rawClass !== "Semua" && rawClass !== "Semua Rombel") {
    binaanRombel = normalizeRombelName(rawClass);
  } else {
    const name = (userSession?.full_name || userProfile?.name || "").toLowerCase();
    const cleanNip = (userSession?.nis_nip || "").trim();
    if (name.includes("achmad makmun") || cleanNip.includes("272005011001")) binaanRombel = "Rombel 8B";
    else if (name.includes("sobiyati")) binaanRombel = "Rombel 8A";
    else if (name.includes("novantya")) binaanRombel = "Rombel 9A";
    else if (name.includes("indah nurrohmah")) binaanRombel = "Rombel 9B";
    else if (name.includes("maulidia")) binaanRombel = "Rombel 7A";
    else if (name.includes("rindang")) binaanRombel = "Rombel 7B";
  }

  const defaultRombel = isWaliKelas ? binaanRombel : normalizeRombelName(rawClass || "Rombel 8B");

  // Selected filter state: "ALL" for Kamad/executive, locked to binaanRombel for Wali Kelas
  const [selectedRombel, setSelectedRombel] = useState<string>(isWaliKelas ? binaanRombel : isExecutive ? "ALL" : defaultRombel);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (isWaliKelas) {
      setSelectedRombel(binaanRombel);
    }
  }, [isWaliKelas, binaanRombel]);

  const [allStudents, setAllStudents] = useState<StudentProgressRow[]>([]);
  const [rombelListOptions, setRombelListOptions] = useState<string[]>([]);
  const [mapelBreakdown, setMapelBreakdown] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      MysqlDataService.getUsers(),
      MysqlDataService.getSubjects(),
      MysqlDataService.getSubmissions(),
      MysqlDataService.getCbtResults(),
      MysqlDataService.getMasterRombels().catch(() => []),
      MysqlDataService.getAssignments().catch(() => []),
      MysqlDataService.getLkpdActivities("ALL", "ALL").catch(() => []),
      MysqlDataService.getKbmPresensi("ALL", "ALL", "ALL").catch(() => []),
    ])
      .then(([users, subjects, subs, cbts, masterRombels, assignments, lkpds, presensiList]) => {
        if (!isMounted) return;

        const userSession = MysqlAuthService.getActiveUser();
        const currentEmail = (userSession?.email || "").toLowerCase();
        const currentName = (userSession?.full_name || "").toLowerCase();

        // Build lookup map for assignment_id -> mapel name
        const assignmentMapelMap = new Map<string, string>();
        (assignments || []).forEach((a: any) => {
          if (a.id && (a.mapel || a.subject_name)) {
            assignmentMapelMap.set(String(a.id), a.mapel || a.subject_name);
          }
        });
        (lkpds || []).forEach((l: any) => {
          if (l.id && (l.mapel || l.subject_name)) {
            assignmentMapelMap.set(String(l.id), l.mapel || l.subject_name);
          }
        });

        // Build list of rombels
        const defaultRombelSet = new Set<string>(["Rombel 7A", "Rombel 7B", "Rombel 8A", "Rombel 8B", "Rombel 9A", "Rombel 9B"]);
        if (masterRombels && masterRombels.length > 0) {
          masterRombels.forEach((r: any) => {
            if (r.name) defaultRombelSet.add(normalizeRombelName(r.name));
            if (r.code) defaultRombelSet.add(normalizeRombelName(r.code));
          });
        }

        // Process all students across all rombel
        if (users && users.length > 0) {
          const siswaList = users.filter((u: any) => u.role === "siswa");
          
          siswaList.forEach((s: any) => {
            const rawCls = s.class_name || s.class;
            if (rawCls) {
              defaultRombelSet.add(normalizeRombelName(rawCls));
            }
          });

          const mapped: StudentProgressRow[] = siswaList.map((s: any, idx: number) => {
            const sEmail = (s.email || "").toLowerCase();
            const sName = (s.full_name || s.name || "").toLowerCase();
            const sRombel = normalizeRombelName(s.class_name || s.class || "Rombel 8B");

            const studentSubs = (subs || []).filter(
              (sub) => (sub.user_id && sub.user_id.toLowerCase() === sEmail) || (sub.student_name && sub.student_name.toLowerCase() === sName)
            );
            const studentCbts = (cbts || []).filter(
              (c) => (c.user_id && c.user_id.toLowerCase() === sEmail) || (c.student_name && c.student_name.toLowerCase() === sName)
            );
            const studentPres = (presensiList || []).filter(
              (p: any) => (p.student_name && p.student_name.toLowerCase() === sName) || (p.student_nis && p.student_nis === s.nis_nip)
            );

            const totalActs = studentSubs.length + studentCbts.length + (studentPres.length > 0 ? 1 : 0);
            const realCp = totalActs > 0 ? Math.min(100, Math.max(25, Math.round((totalActs / 4) * 100))) : 0;
            const statusLabel = realCp >= 75 ? "Sangat Baik" : realCp > 0 ? "Dalam Proses" : "Belum Ada Submisi (0%)";

            return {
              id: s.id || `s_${idx}`,
              name: s.full_name || s.name,
              nis: s.nis_nip || s.nis || "-",
              rombel: sRombel,
              cp: realCp,
              tugas: realCp,
              status: statusLabel,
            };
          });

          setAllStudents(mapped);
        } else {
          setAllStudents([]);
        }

        setRombelListOptions(Array.from(defaultRombelSet).sort());

        // Process real subjects breakdown
        if (subjects && subjects.length > 0) {
          const mappedSubj = subjects.map((sub: any) => {
            const mapelName = (sub.subject_name || sub.name || "").toLowerCase().trim();

            const subMatches = (subs || []).filter((s) => {
              const isUser = (s.user_id && s.user_id.toLowerCase() === currentEmail) || (s.student_name && s.student_name.toLowerCase() === currentName);
              const assignMapel = (assignmentMapelMap.get(String(s.assignment_id)) || "").toLowerCase().trim();
              const isMapelMatch = assignMapel ? assignMapel.includes(mapelName) || mapelName.includes(assignMapel) : true;
              return isUser && isMapelMatch;
            });

            const cbtMatches = (cbts || []).filter((c) => {
              const isUser = (c.user_id && c.user_id.toLowerCase() === currentEmail) || (c.student_name && c.student_name.toLowerCase() === currentName);
              const isMapel = (c.exam_title || "").toLowerCase().includes(mapelName);
              return isUser && isMapel;
            });

            const presMatches = (presensiList || []).filter((p: any) => {
              const isUser = (p.student_name && p.student_name.toLowerCase() === currentName) || (p.student_nis && p.student_nis === userSession?.nis_nip);
              const pMapel = (p.mapel || "").toLowerCase().trim();
              const isMapel = pMapel.includes(mapelName) || mapelName.includes(pMapel);
              return isUser && isMapel && p.status === "HADIR";
            });

            const totalCount = subMatches.length + cbtMatches.length + (presMatches.length > 0 ? 1 : 0);
            // Dynamic flow calculation: If student has attendance/submissions/CBT in MySQL, calculate real progress percentage
            const realPct = totalCount > 0 ? Math.min(100, Math.max(35, Math.round((totalCount / 3) * 100))) : 0;

            return {
              mapel: sub.subject_name || sub.name,
              teacher: sub.teacher || "Guru Pengampu MTsN 2",
              cp: realPct,
              tugas: realPct,
              pertemuan: "18 Pertemuan Semester",
            };
          });
          setMapelBreakdown(mappedSubj);
        } else {
          setMapelBreakdown([]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAllStudents([]);
          setMapelBreakdown([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute per-rombel summary for executive monitoring
  const rombelSummaries = useMemo<RombelSummaryRow[]>(() => {
    return rombelListOptions.map((rName) => {
      const rombelStudents = allStudents.filter((s) => isSameClass(s.rombel, rName));
      const totalSiswa = rombelStudents.length;
      if (totalSiswa === 0) {
        return {
          rombel: rName,
          totalSiswa: 0,
          avgCp: 0,
          avgTugas: 0,
          tuntasCount: 0,
          prosesCount: 0,
          belumCount: 0,
        };
      }

      const sumCp = rombelStudents.reduce((acc, s) => acc + s.cp, 0);
      const sumTugas = rombelStudents.reduce((acc, s) => acc + s.tugas, 0);
      const tuntasCount = rombelStudents.filter((s) => s.cp >= 75).length;
      const prosesCount = rombelStudents.filter((s) => s.cp > 0 && s.cp < 75).length;
      const belumCount = rombelStudents.filter((s) => s.cp === 0).length;

      return {
        rombel: rName,
        totalSiswa,
        avgCp: Math.round(sumCp / totalSiswa),
        avgTugas: Math.round(sumTugas / totalSiswa),
        tuntasCount,
        prosesCount,
        belumCount,
      };
    });
  }, [rombelListOptions, allStudents]);

  // Overall stats for Executive Dashboard
  const overallStats = useMemo(() => {
    const totalSiswa = allStudents.length;
    const totalCpSum = allStudents.reduce((acc, s) => acc + s.cp, 0);
    const totalTugasSum = allStudents.reduce((acc, s) => acc + s.tugas, 0);
    const avgCpMadrasah = totalSiswa > 0 ? Math.round(totalCpSum / totalSiswa) : 0;
    const avgTugasMadrasah = totalSiswa > 0 ? Math.round(totalTugasSum / totalSiswa) : 0;
    const totalTuntas = allStudents.filter((s) => s.cp >= 75).length;

    return {
      totalRombel: rombelListOptions.length,
      totalSiswa,
      avgCpMadrasah,
      avgTugasMadrasah,
      totalTuntas,
    };
  }, [allStudents, rombelListOptions]);

  // Filtered student list based on selectedRombel and searchQuery
  const filteredStudents = useMemo(() => {
    return allStudents.filter((s) => {
      const matchRombel = selectedRombel === "ALL" || isSameClass(s.rombel, selectedRombel);
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        s.rombel.toLowerCase().includes(q);
      return matchRombel && matchQuery;
    });
  }, [allStudents, selectedRombel, searchQuery]);

  if (isSiswa) {
    return (
      <div className="space-y-6">
        <StudentHeaderBanner
          title="Progress Belajar Saya"
          subtitle="Persentase penyelesaian modul KBM & ketuntasan Capaian Pembelajaran (CP) per mata pelajaran"
          icon={TrendingUp}
          statusText="Perkembangan Pembelajaran Aktif"
          statusVariant="success"
        />
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Memuat data progress belajar...</div>
        ) : mapelBreakdown.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 bg-card">
            <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <div className="font-semibold text-foreground text-sm">Belum Ada Data Progress Belajar</div>
            <p>Belum ada rekam nilai progress belajar untuk akun ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mapelBreakdown.map((x, i) => (
              <Card key={i} className="border-border/70 shadow-xs hover:border-emerald-500/40 transition bg-card">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-sm text-foreground">{x.mapel}</div>
                    <Badge variant="outline" className="text-xs font-mono font-bold border-emerald-500/30 text-emerald-600">
                      {x.cp}% Selesai
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                        style={{ width: `${x.cp}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium text-right">
                      Target CP {x.cp}% dari 18 Pertemuan
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <SectionHeader
        title={
          isWaliKelas
            ? `Monitoring Progress Belajar ${binaanRombel}`
            : selectedRombel === "ALL"
            ? "Monitoring Progress Belajar Seluruh Rombel"
            : `Monitoring Progress Belajar ${selectedRombel}`
        }
        sub={
          isExecutive
            ? "Dashboard Pengawasan Eksekutif Kepala Madrasah untuk Monitoring Capaian Pembelajaran & Submisi Tugas Seluruh Kelas"
            : "Tracking Capaian Pembelajaran (CP) dan Kelengkapan Submisi Tugas Siswa"
        }
      />

      <div className="space-y-6">
        {/* Rombel Filter & Control Bar */}
        <Card className="border-border shadow-xs bg-card p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-0.5">Pilih Rombel / Mode Monitoring</label>
                {isWaliKelas ? (
                  <div className="h-9 px-3 rounded-md border border-emerald-500/50 bg-emerald-500/10 flex items-center gap-2 font-extrabold text-xs text-emerald-700 dark:text-emerald-300">
                    <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Rombel Binaan: {binaanRombel}</span>
                  </div>
                ) : (
                  <select
                    className="h-9 rounded-md border border-emerald-500/40 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={selectedRombel}
                    onChange={(e) => setSelectedRombel(e.target.value)}
                  >
                    {isExecutive && (
                      <option value="ALL" className="font-bold">
                        ✨ Semua Rombel (Monitoring Eksekutif Kamad)
                      </option>
                    )}
                    {rombelListOptions.map((r) => (
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
                  <Building2 className="h-3.5 w-3.5 mr-1" /> Monitoring Kamad
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Executive Stat Summary Cards (Shown when Kamad/Executive logged in) */}
        {isExecutive && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Total Rombel Dimonitor</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">{overallStats.totalRombel} Rombel</h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Semua tingkat (VII - IX)</p>
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
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{overallStats.totalTuntas} Siswa CP Tuntas (&ge;75%)</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Rata-Rata Progress CP</p>
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{overallStats.avgCpMadrasah}%</h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Capaian Pembelajaran Madrasah</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-xs bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold">Submisi Tugas Madrasah</p>
                  <h3 className="text-2xl font-bold text-foreground mt-1">{overallStats.avgTugasMadrasah}%</h3>
                  <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Tugas & CBT Terkumpul</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <GraduationCap className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* SECTION 1: TABEL REKAP MONITORING SELURUH ROMBEL (Kamad Executive Overview) */}
        {selectedRombel === "ALL" && (
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-600" />
                  <span>Matriks Progress Belajar Per Rombel (Seluruh Kelas)</span>
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Overview performa Capaian Pembelajaran (CP) dan kelengkapan tugas di seluruh kelas madrasah.
                </CardDescription>
              </div>
              <Badge className="bg-emerald-600 text-white font-bold text-xs">{rombelSummaries.length} Rombel</Badge>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Memuat data rekap rombel...</div>
              ) : rombelSummaries.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Tidak ada data rombel tersedia.</div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-bold text-left border-b border-border">
                    <tr>
                      <th className="p-3">Nama Rombel</th>
                      <th className="p-3 text-center">Jumlah Siswa</th>
                      <th className="p-3 text-center">Rata-Rata Progress CP</th>
                      <th className="p-3 text-center">Submisi Tugas</th>
                      <th className="p-3 text-center">Ketuntasan Siswa</th>
                      <th className="p-3 text-right">Aksi Monitoring</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {rombelSummaries.map((r) => (
                      <tr key={r.rombel} className="hover:bg-muted/30 transition">
                        <td className="p-3 font-bold text-foreground flex items-center gap-2">
                          <Badge variant="outline" className="font-mono font-bold bg-muted/40">
                            {r.rombel}
                          </Badge>
                        </td>
                        <td className="p-3 text-center font-bold text-foreground">{r.totalSiswa} Siswa</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${r.avgCp}%` }} />
                            </div>
                            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">{r.avgCp}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-foreground">{r.avgTugas}%</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5 text-[11px]">
                            <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 font-bold bg-emerald-500/5">
                              {r.tuntasCount} Tuntas
                            </Badge>
                            {r.prosesCount > 0 && (
                              <Badge variant="outline" className="text-amber-600 border-amber-500/30 font-bold bg-amber-500/5">
                                {r.prosesCount} Proses
                              </Badge>
                            )}
                            {r.belumCount > 0 && (
                              <Badge variant="outline" className="text-rose-600 border-rose-500/30 font-bold bg-rose-500/5">
                                {r.belumCount} Belum
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-bold gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                            onClick={() => setSelectedRombel(r.rombel)}
                          >
                            <Eye className="h-3.5 w-3.5" /> Detail Rombel
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

        {/* SECTION 2: TABEL SISWA (Tergantung apakah ALL atau Rombel Spesifik) */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>
                Progress Capaian Pembelajaran (CP) Siswa{" "}
                {selectedRombel === "ALL" ? "Seluruh Kelas" : selectedRombel}
              </span>
              <Badge className="bg-emerald-600 text-white font-bold text-xs">
                {selectedRombel === "ALL" ? "Semua Rombel" : selectedRombel}
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Rincian persentase ketuntasan CP dan penyelesaian tugas per siswa pada{" "}
              {selectedRombel === "ALL" ? "seluruh kelas madrasah" : selectedRombel}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Memuat data progress siswa...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 m-4">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground text-sm">
                  Belum Ada Siswa Terdaftar pada {selectedRombel === "ALL" ? "Filter Ini" : selectedRombel}
                </div>
                <p>Database saat ini tidak memiliki akun siswa terdaftar untuk filter ini.</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-muted-foreground font-bold text-left border-b border-border">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3 font-mono">NISN</th>
                    <th className="p-3">Rombel / Kelas</th>
                    <th className="p-3 text-center">Progress CP</th>
                    <th className="p-3 text-center">Submisi Tugas</th>
                    <th className="p-3 text-right">Status Evaluasi</th>
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
                      <td className="p-3 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">{s.cp}%</td>
                      <td className="p-3 text-center font-mono">{s.tugas}%</td>
                      <td className="p-3 text-right">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 font-bold">
                          {s.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* SECTION 3: BREAKDOWN MAPEL (Muncul saat Rombel Spesifik dipilih atau untuk Wali Kelas/Guru) */}
        {selectedRombel !== "ALL" && (
          <Card className="border-border shadow-xs bg-card">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-bold">
                Breakdown Pertemuan & CP per Mata Pelajaran ({selectedRombel})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Memuat data mata pelajaran...</div>
              ) : mapelBreakdown.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Belum ada mata pelajaran terdaftar pada database.</div>
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 text-muted-foreground font-bold text-left border-b border-border">
                    <tr>
                      <th className="p-3">Mata Pelajaran</th>
                      <th className="p-3">Guru Pengampu</th>
                      <th className="p-3 text-center">Realisasi Pertemuan</th>
                      <th className="p-3 text-center">Target CP Tuntas</th>
                      <th className="p-3 text-right">Submisi Tugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {mapelBreakdown.map((m, idx) => (
                      <tr key={idx} className="hover:bg-muted/30 transition">
                        <td className="p-3 font-bold text-foreground">{m.mapel}</td>
                        <td className="p-3 text-muted-foreground">{m.teacher}</td>
                        <td className="p-3 text-center font-mono">{m.pertemuan}</td>
                        <td className="p-3 text-center font-bold font-mono text-emerald-600 dark:text-emerald-400">{m.cp}%</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">{m.tugas}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
