import { useState, useEffect } from "react";
import { TrendingUp, Inbox, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  cp: number;
  tugas: number;
  status: string;
}

export function ProgressBelajarModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin";
  const isSiswa = activeRole === "siswa";

  // Determine dynamic Rombel from user profile
  const userRombelRaw = userProfile?.class_name || userProfile?.class || (isWaliKelas ? "Rombel 8B" : "Rombel 8B");
  const activeRombel = normalizeRombelName(userRombelRaw);

  const [students, setStudents] = useState<StudentProgressRow[]>([]);
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
    ])
      .then(([users, subjects, subs, cbts]) => {
        if (!isMounted) return;

        const userSession = MysqlAuthService.getActiveUser();
        const currentEmail = (userSession?.email || "").toLowerCase();
        const currentName = (userSession?.full_name || "").toLowerCase();

        // 1. Process real students for active Rombel
        if (users && users.length > 0) {
          const siswaList = users.filter((u: any) => u.role === "siswa");
          const matched = siswaList.filter((u: any) => isSameClass(u.class_name || u.class, activeRombel));

          if (matched.length > 0) {
            const mapped: StudentProgressRow[] = matched.map((s: any, idx: number) => {
              const sEmail = (s.email || "").toLowerCase();
              const sName = (s.full_name || s.name || "").toLowerCase();

              const studentSubs = (subs || []).filter(
                (sub) => (sub.user_id && sub.user_id.toLowerCase() === sEmail) || (sub.student_name && sub.student_name.toLowerCase() === sName)
              );
              const studentCbts = (cbts || []).filter(
                (c) => (c.user_id && c.user_id.toLowerCase() === sEmail) || (c.student_name && c.student_name.toLowerCase() === sName)
              );

              const totalActs = studentSubs.length + studentCbts.length;
              const realCp = totalActs > 0 ? Math.min(100, Math.round((totalActs / 5) * 100)) : 0;
              const statusLabel = realCp >= 75 ? "Sangat Baik" : realCp > 0 ? "Dalam Proses" : "Belum Ada Submisi (0%)";

              return {
                id: s.id || `s_${idx}`,
                name: s.full_name || s.name,
                nis: s.nis_nip || s.nis || "-",
                cp: realCp,
                tugas: realCp,
                status: statusLabel,
              };
            });
            setStudents(mapped);
          } else {
            setStudents([]);
          }
        } else {
          setStudents([]);
        }

        // 2. Process real subjects breakdown
        if (subjects && subjects.length > 0) {
          const mappedSubj = subjects.map((sub: any) => {
            const mapelName = (sub.subject_name || sub.name || "").toLowerCase();

            const subMatches = (subs || []).filter((s) => {
              const isUser = (s.user_id && s.user_id.toLowerCase() === currentEmail) || (s.student_name && s.student_name.toLowerCase() === currentName);
              return isUser && s.score && s.score > 0;
            });

            const cbtMatches = (cbts || []).filter((c) => {
              const isUser = (c.user_id && c.user_id.toLowerCase() === currentEmail) || (c.student_name && c.student_name.toLowerCase() === currentName);
              const isMapel = (c.exam_title || "").toLowerCase().includes(mapelName);
              return isUser && isMapel && c.score && c.score > 0;
            });

            const totalCount = subMatches.length + cbtMatches.length;
            const realPct = totalCount > 0 ? Math.min(100, Math.round((totalCount / 4) * 100)) : 0;

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
          setStudents([]);
          setMapelBreakdown([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeRombel]);

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
            <p>Database saat ini belum memiliki rekam nilai progress belajar untuk akun ini.</p>
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
        title={`Monitoring Progress Belajar ${activeRombel}`}
        sub="Tracking Capaian Pembelajaran (CP) dan Kelengkapan Submisi Tugas Siswa"
      />

      <div className="space-y-6">
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Progress Capaian Pembelajaran (CP) Siswa {activeRombel}</span>
              <Badge className="bg-emerald-600 text-white font-bold text-xs">{activeRombel}</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Rincian persentase ketuntasan CP dan penyelesaian tugas per siswa pada {activeRombel}.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Memuat data progress siswa...</div>
            ) : students.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 m-4">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground text-sm">Belum Ada Siswa Terdaftar pada {activeRombel}</div>
                <p>Database saat ini tidak memiliki akun siswa terdaftar untuk rombel ini. Tampilan dikosongkan secara jujur tanpa data sampel/dummy.</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-muted/50 text-muted-foreground font-bold text-left border-b border-border">
                  <tr>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3 font-mono">NISN</th>
                    <th className="p-3 text-center">Progress CP</th>
                    <th className="p-3 text-center">Submisi Tugas</th>
                    <th className="p-3 text-right">Status Evaluasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-muted/30 transition">
                      <td className="p-3 font-bold text-foreground">{s.name}</td>
                      <td className="p-3 font-mono text-muted-foreground">{s.nis}</td>
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

        {/* Breakdown per Mapel */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-bold">Breakdown Pertemuan & CP per Mata Pelajaran ({activeRombel})</CardTitle>
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
      </div>
    </>
  );
}
