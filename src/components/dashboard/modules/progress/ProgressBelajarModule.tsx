import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6 space-y-1">
      <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
        <TrendingUp className="h-6 w-6 text-primary" /> {title}
      </h1>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function ProgressBelajarModule({ activeRole }: { activeRole?: string }) {
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin";

  const studentsList8A = [
    { name: "ALIYA QIARA ABDULLAH", nis: "12123301000288", cp: 95, tugas: 92, status: "Mutqin & Tuntas" },
    { name: "ABIGAIL HASAN YUSUF PRAYOGA", nis: "0081928371", cp: 96, tugas: 94, status: "Sangat Baik" },
    { name: "ADITA AZ ZAHRA", nis: "0081928372", cp: 90, tugas: 88, status: "Tuntas KKM" },
    { name: "AFRIZA RAHMA AZZAHRA", nis: "0081928373", cp: 98, tugas: 95, status: "Sangat Baik" },
    { name: "AHMAD ZULFIKAR", nis: "0081928374", cp: 100, tugas: 98, status: "Sangat Baik" },
    { name: "AILEEN CALISTA SELENA", nis: "0081928375", cp: 94, tugas: 91, status: "Tuntas KKM" },
  ];

  const mapelProgressBreakdown = [
    { mapel: "Al Qur'an Hadis", teacher: "AH. SYARIF HIDAYAH, S.Pd.I", cp: 100, tugas: 95, pertemuan: "18 dari 18 Pertemuan" },
    { mapel: "Akidah Akhlak", teacher: "WAKHIBUN, S.P", cp: 90, tugas: 88, pertemuan: "16 dari 18 Pertemuan" },
    { mapel: "Fikih", teacher: "CARYATI,", cp: 92, tugas: 90, pertemuan: "17 dari 18 Pertemuan" },
    { mapel: "Matematika", teacher: "SAYONO, S.Pd., M.Pd.", cp: 85, tugas: 80, pertemuan: "15 dari 18 Pertemuan" },
    { mapel: "Ilmu Pendidikan Alam", teacher: "NOVANTYA KARTIKAWATI, S.Pd", cp: 88, tugas: 85, pertemuan: "16 dari 18 Pertemuan" },
    { mapel: "Teknologi Informasi dan Komunikasi", teacher: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", cp: 100, tugas: 96, pertemuan: "18 dari 18 Pertemuan" },
  ];

  if (!isExecutive && !isWaliKelas) {
    const studentMapel = [
      { m: "Matematika", p: 78 },
      { m: "B. Indonesia", p: 92 },
      { m: "IPA", p: 65 },
      { m: "Fikih", p: 88 },
      { m: "B. Arab", p: 85 },
    ];
    return (
      <div className="space-y-6">
        <StudentHeaderBanner
          title="Progress Belajar Saya"
          subtitle="Persentase penyelesaian modul KBM & ketuntasan Capaian Pembelajaran (CP) per mata pelajaran"
          icon={TrendingUp}
          studentClass="Kelas VIII A"
          statusText="Perkembangan Positif (Tuntas 86%)"
          statusVariant="success"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {studentMapel.map((x, i) => (
            <Card key={i} className="border-border/70 shadow-xs hover:border-emerald-500/40 transition">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-sm text-foreground">{x.m}</div>
                  <Badge variant="outline" className="text-xs font-mono font-bold border-emerald-500/30 text-emerald-600">
                    {x.p}% Selesai
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${x.p}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium text-right">
                    {x.p}% dari 18 Pertemuan Semester
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <SectionHeader title="Monitoring Progress Belajar Rombel" sub="Tracking Capaian Pembelajaran (CP) dan Kelengkapan Submisi Tugas Siswa" />

      <div className="space-y-6">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Progress Capaian Pembelajaran (CP) Siswa Rombel 8A</CardTitle>
            <CardDescription className="text-xs">Rincian persentase ketuntasan CP dan penyelesaian tugas per siswa.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground font-bold text-left">
                <tr>
                  <th className="p-3">Nama Siswa</th>
                  <th className="p-3 font-mono">NISN</th>
                  <th className="p-3 text-center">Progress CP</th>
                  <th className="p-3 text-center">Submisi Tugas</th>
                  <th className="p-3 text-right">Status Evaluasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {studentsList8A.map((s, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition">
                    <td className="p-3 font-bold text-foreground">{s.name}</td>
                    <td className="p-3 font-mono text-muted-foreground">{s.nis}</td>
                    <td className="p-3 text-center font-bold font-mono text-primary">{s.cp}%</td>
                    <td className="p-3 text-center font-mono">{s.tugas}%</td>
                    <td className="p-3 text-right">
                      <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 font-bold">
                        {s.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Breakdown Pertemuan & CP per Mata Pelajaran</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground font-bold text-left">
                <tr>
                  <th className="p-3">Mata Pelajaran</th>
                  <th className="p-3">Guru Pengampu</th>
                  <th className="p-3 text-center">Realisasi Pertemuan</th>
                  <th className="p-3 text-center">Target CP Tuntas</th>
                  <th className="p-3 text-right">Submisi Tugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mapelProgressBreakdown.map((m, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition">
                    <td className="p-3 font-bold text-foreground">{m.mapel}</td>
                    <td className="p-3 text-muted-foreground">{m.teacher}</td>
                    <td className="p-3 text-center font-mono">{m.pertemuan}</td>
                    <td className="p-3 text-center font-bold font-mono text-primary">{m.cp}%</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-500">{m.tugas}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
