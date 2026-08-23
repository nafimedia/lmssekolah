import { UserCheck, Clock, Zap, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export interface KbmSession {
  id: string;
  mapel: string;
  class: string;
  time: string;
  meeting: string;
  topic: string;
  room: string;
  status: string;
}

export interface SessionStudent {
  id: string;
  nisn: string;
  name: string;
  class: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpa: number;
  pct: number;
  sessionStatus: "hadir" | "izin" | "sakit" | "alpa" | string;
  notes?: string;
}

interface PresensiKbmTabProps {
  activeSession: KbmSession;
  selectedKbmSession: string;
  setSelectedKbmSession: (session: string) => void;
  kbmSessions: KbmSession[];
  sessionStudents: SessionStudent[];
  handleMarkAllHadir: () => void;
  handleSavePresensiSesiKbm: () => void;
  handleSetSessionStatus: (studentId: string, status: string) => void;
  handleSetSessionNotes?: (studentId: string, notes: string) => void;
}

export function PresensiKbmTab({
  activeSession,
  selectedKbmSession,
  setSelectedKbmSession,
  kbmSessions,
  sessionStudents,
  handleMarkAllHadir,
  handleSavePresensiSesiKbm,
  handleSetSessionStatus,
  handleSetSessionNotes,
}: PresensiKbmTabProps) {
  const statusButtons = [
    { key: "hadir", label: "HADIR", activeClass: "bg-emerald-600 text-white shadow-xs" },
    { key: "izin", label: "IZIN", activeClass: "bg-blue-600 text-white shadow-xs" },
    { key: "sakit", label: "SAKIT", activeClass: "bg-amber-600 text-white shadow-xs" },
    { key: "alpa", label: "ALPA", activeClass: "bg-red-600 text-white shadow-xs" },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Sesi KBM Aktif */}
      <Card className="border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-sm">
        <CardHeader className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-emerald-600 text-white font-mono text-xs font-bold gap-1 animate-pulse">
                <Clock className="h-3.5 w-3.5" />
                <span>SESI KBM AKTIF SAAT INI</span>
              </Badge>
              <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                {activeSession.time}
              </Badge>
            </div>
            <CardTitle className="text-lg font-bold text-foreground">
              {activeSession.mapel} ({activeSession.class}) • {activeSession.meeting}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Materi: {activeSession.topic} • {activeSession.room}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground shrink-0">Pilih Sesi Mengajar:</span>
            <select
              className="h-9 rounded-md border border-emerald-500/40 bg-background px-3 text-xs font-bold"
              value={selectedKbmSession}
              onChange={(e) => setSelectedKbmSession(e.target.value)}
            >
              {kbmSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.mapel} ({s.class}) - {s.time}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
      </Card>

      {/* Tabel Checklist Presensi Siswa */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" /> Presensi Siswa Sesi KBM {activeSession.mapel}
            </CardTitle>
            <CardDescription className="text-xs">
              Checklist kehadiran siswa untuk {activeSession.class} pada {activeSession.meeting}.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5" onClick={handleMarkAllHadir}>
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Tandai Semua Hadir</span>
            </Button>
            <Button size="sm" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={handleSavePresensiSesiKbm}>
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Presensi Sesi & Sync Jurnal</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">NISN & Nama Siswa</th>
                <th className="py-3 px-3">Rombel</th>
                <th className="py-3 px-3 text-center">Status Presensi Sesi KBM</th>
                <th className="py-3 px-3">Keterangan / Catatan Sesi</th>
                <th className="py-3 px-3 text-center">Rekap Hadir Total</th>
                <th className="py-3 px-3 text-center">% Kehadiran Mapel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessionStudents.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition">
                  <td className="py-3 px-4 font-semibold">
                    <div className="font-bold text-foreground">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{s.nisn}</div>
                  </td>
                  <td className="py-3 px-3 font-bold">{s.class}</td>
                  <td className="py-3 px-3 text-center">
                    <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted border border-border">
                      {statusButtons.map((btn) => (
                        <button
                          key={btn.key}
                          type="button"
                          onClick={() => handleSetSessionStatus(s.id, btn.key)}
                          className={`px-2.5 py-1 rounded text-[10px] font-extrabold transition ${
                            s.sessionStatus === btn.key
                              ? btn.activeClass
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 min-w-[200px]">
                    <Input
                      placeholder="Catatan / Alasan..."
                      value={s.notes || ""}
                      onChange={(e) => handleSetSessionNotes?.(s.id, e.target.value)}
                      className="h-7 text-xs bg-background/80 border-border"
                    />
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{s.hadir} Hari</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-primary text-sm">{s.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
