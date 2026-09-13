import { useState, useEffect, useMemo } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService, JadwalRow } from "@/services/mysqlDataService";
import { toast } from "sonner";
import { Download, PencilLine, Trash2, Printer, Plus, CalendarClock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { AddJadwalDialog } from "./components/AddJadwalDialog";
import { EditJadwalDialog } from "./components/EditJadwalDialog";
import { PrintJadwalDialog } from "./components/PrintJadwalDialog";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";

import { isSameClass, formatClassForDisplay, resolveWaliKelasRombel, normalizeRombelName } from "@/utils/classNormalization";

export function JadwalModule({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const isGuru = activeRole === "guru";
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isRestrictedRole = isSiswa || isWaliKelas;
  const isReadOnlyRole = isSiswa || isGuru || isWaliKelas;
  const me = MysqlAuthService.getActiveUser();

  const resolvedInitialRombel = useMemo(() => {
    if (isSiswa) {
      const raw = userProfile?.class_name || (me as any)?.class_name || "VIII-A";
      return formatClassForDisplay(raw, "kelas");
    }
    return resolveWaliKelasRombel(me || userProfile, null, "kelas");
  }, [isSiswa, userProfile, me]);

  const resolvedInitialGrade = useMemo(() => {
    if (resolvedInitialRombel.includes("7")) return "Kelas VII";
    if (resolvedInitialRombel.includes("9")) return "Kelas IX";
    return "Kelas VIII";
  }, [resolvedInitialRombel]);

  const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const [filterKelas, setFilterKelas] = useState(resolvedInitialGrade);
  const [filterRombel, setFilterRombel] = useState(resolvedInitialRombel);

  const [jadwalList, setJadwalList] = useState<JadwalRow[]>([]);
  const [isLoadingJadwal, setIsLoadingJadwal] = useState(true);

  // Dialog States
  const [isOpen, setIsOpen] = useState(false);
  const [isEditJadwalOpen, setIsEditJadwalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<JadwalRow | null>(null);
  const [isPrintJadwalOpen, setIsPrintJadwalOpen] = useState(false);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  const loadJadwalData = async () => {
    setIsLoadingJadwal(true);
    try {
      const [data, sessions] = await Promise.all([
        MysqlDataService.getJadwalList(),
        MysqlDataService.getActiveKbmSessions().catch(() => []),
      ]);
      setJadwalList(data || []);
      setActiveSessions(sessions || []);
    } catch (e) {
      console.warn("Gagal memuat jadwal dari MySQL:", e);
    } finally {
      setIsLoadingJadwal(false);
    }
  };

  const checkIsLive = (s: any, h: string) => {
    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const currentDayName = dayNames[new Date().getDay()] || "";
    if (h.toLowerCase() !== currentDayName.toLowerCase()) return false;
    const sMapel = (s.mapel || "").toLowerCase().trim();
    return (activeSessions || []).some((sess: any) => {
      const sessMapel = (sess.mapel || "").toLowerCase().trim();
      const isMatchMapel = sMapel && (sessMapel.includes(sMapel) || sMapel.includes(sessMapel));
      return (
        sess.status === "SEDANG_BERLANGSUNG" &&
        isSameClass(sess.rombel, s.rombel) &&
        isMatchMapel
      );
    });
  };

  useEffect(() => {
    loadJadwalData();
  }, []);

  useEffect(() => {
    if (isRestrictedRole) {
      setFilterRombel(resolvedInitialRombel);
      setFilterKelas(resolvedInitialGrade);
    }
  }, [isRestrictedRole, resolvedInitialRombel, resolvedInitialGrade]);

  const handleAdd = async (data: { selectedHari: string; jam: string; mapel: string; inputTingkat: string; inputRombel: string; guru: string }) => {
    const res = await MysqlDataService.saveJadwal({
      hari: data.selectedHari,
      jam: data.jam,
      mapel: data.mapel,
      tingkat: data.inputTingkat,
      rombel: data.inputRombel,
      guru: data.guru,
    });

    if (res.success) {
      toast.success(`✅ Jadwal ${data.mapel} (${data.inputTingkat} - ${data.inputRombel}) hari ${data.selectedHari} berhasil ditambahkan!`);
      setIsOpen(false);
      await loadJadwalData();
    } else {
      toast.error("Gagal menyimpan jadwal ke database.");
    }
  };

  const handleOpenEdit = (item: JadwalRow) => {
    setEditingJadwal({ ...item });
    setIsEditJadwalOpen(true);
  };

  const handleSaveEdit = async (updated: JadwalRow) => {
    const res = await MysqlDataService.saveJadwal(updated);
    if (res.success) {
      toast.success(`✏️ Jadwal ${updated.mapel} (${updated.rombel}) berhasil diperbarui!`);
      setEditingJadwal(null);
      await loadJadwalData();
    } else {
      toast.error("Gagal memperbarui jadwal.");
    }
  };

  const handleDelete = async (id?: string, itemDesc?: string) => {
    if (!id) return;
    const ok = await MysqlDataService.deleteJadwal(id);
    if (ok) {
      toast.success(`🗑️ Jadwal ${itemDesc || "dipilih"} berhasil dihapus dari database.`);
      await loadJadwalData();
    } else {
      toast.error("Gagal menghapus jadwal.");
    }
  };

  const handlePrintJadwal = () => {
    window.print();
    toast.success(`🖨️ Cetak Matriks Jadwal Pelajaran KBM (${filterRombel === "Semua" ? "Seluruh Kelas" : filterRombel}) berhasil diproses!`);
  };

  return (
    <>
      {isSiswa ? (
        <StudentHeaderBanner
          title={`Jadwal Pelajaran ${resolvedInitialRombel}`}
          icon={CalendarClock}
          actionButtons={
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-bold border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-3" onClick={() => setIsPrintJadwalOpen(true)}>
              <Printer className="h-3.5 w-3.5" /> Cetak Jadwal (PDF)
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border mb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> Jadwal Pelajaran
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs font-semibold border-border px-3" onClick={() => setIsPrintJadwalOpen(true)}>
              <Printer className="h-3.5 w-3.5 text-muted-foreground" /> Cetak Jadwal (PDF)
            </Button>
            {!isReadOnlyRole && (
              <Button size="sm" className="h-8 gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-2xs px-3" onClick={() => setIsOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Tambah Jadwal
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Horizontal Compact Metric Strip (~42px) - Only for Admin / Non-Siswa */}
      {!isSiswa && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs mb-4">
          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CalendarClock className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Jadwal KBM</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{jadwalList.length} Sesi</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Kelas Terdaftar</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">6 Kelas Aktif</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${activeSessions.length > 0 ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
              <CalendarClock className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">KBM Live Berjalan</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{activeSessions.length} Sesi Live</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <CalendarClock className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Hari Pembelajaran</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">6 Hari (Senin - Sabtu)</p>
            </div>
          </div>
        </div>
      )}

      {!isRestrictedRole ? (
        <div className="p-2.5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-4 shadow-2xs text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Filter Kelas:</span>
            <select
              className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground cursor-pointer hover:border-primary/50 transition shrink-0 min-w-[200px]"
              value={filterRombel}
              onChange={(e) => {
                const val = e.target.value;
                setFilterRombel(val);
                if (val.includes("7")) setFilterKelas("Kelas VII");
                else if (val.includes("8")) setFilterKelas("Kelas VIII");
                else if (val.includes("9")) setFilterKelas("Kelas IX");
                else if (val === "Semua") setFilterKelas("Semua");
              }}
            >
              <option value="Semua">Semua Kelas</option>
              <option value="Kelas 7A">Kelas 7A</option>
              <option value="Kelas 7B">Kelas 7B</option>
              <option value="Kelas 8A">Kelas 8A</option>
              <option value="Kelas 8B">Kelas 8B</option>
              <option value="Kelas 9A">Kelas 9A</option>
              <option value="Kelas 9B">Kelas 9B</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span>Menampilkan: <strong className="text-foreground">{filterRombel === "Semua" ? "Seluruh Kelas" : filterRombel}</strong></span>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/25 text-[11px] font-mono font-bold shrink-0">
              {jadwalList.length} Sesi
            </Badge>
          </div>
        </div>
      ) : isWaliKelas ? (
        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-4 mb-4 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <span>Jadwal Pelajaran <strong className="text-primary font-bold">{resolvedInitialRombel}</strong></span>
          </div>
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingJadwal ? (
          <div className="col-span-full py-12 text-center text-xs font-semibold text-muted-foreground">
            ⏳ Memuat jadwal pelajaran...
          </div>
        ) : (
          hariList.map((h) => {
            let listForDay = (jadwalList || []).filter((s) => {
              if (s.hari !== h) return false;
              if (isSiswa) {
                return isSameClass(s.rombel, resolvedInitialRombel);
              }
              const matchKelas = filterKelas === "Semua" || s.tingkat === filterKelas;
              const matchRombel = filterRombel === "Semua" || isSameClass(s.rombel, filterRombel);
              return matchKelas && matchRombel;
            });


            return (
              <Card key={h} className="border-border shadow-xs">
                <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>📅 {h}</span>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-mono">
                      {listForDay.length} Sesi
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {listForDay.length === 0 && (
                    <div className="text-xs text-muted-foreground py-3 text-center">Belum ada jadwal untuk filter ini</div>
                  )}
                  {listForDay.map((s) => {
                    const isLive = checkIsLive(s, h);
                    return (
                      <div
                        key={s.id || `${s.hari}-${s.jam}-${s.rombel}`}
                        className={`flex items-start justify-between gap-2 border-l-4 pl-3 py-2 bg-card rounded-r-lg shadow-2xs group transition ${isLive
                          ? "border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/25 ring-1 ring-emerald-500/40"
                          : "border-primary hover:border-primary/80"
                          }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-foreground truncate">{s.mapel}</span>
                            {isLive && (
                              <Badge className="text-[9px] font-extrabold bg-emerald-600 text-white border-none animate-pulse px-1.5 py-0">
                                ● KBM LIVE
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 my-1 flex-wrap">
                            <Badge className="text-[9px] font-bold bg-primary/15 text-primary border-primary/20">
                              🏫 {normalizeRombelName(s.rombel)}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">
                            👨‍🏫 {s.guru && s.guru.trim() !== "-" ? s.guru : "Belum Ditentukan"}
                          </div>
                          <div className="text-[10px] font-mono font-bold text-primary mt-1">⏰ {s.jam}</div>
                        </div>

                        {!isReadOnlyRole && (
                          <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100 transition">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                              onClick={() => handleOpenEdit(s)}
                              title="Edit Jadwal"
                            >
                              <PencilLine className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => handleDelete(s.id, `${s.mapel} (${s.rombel})`)}
                              title="Hapus Jadwal"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <AddJadwalDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onAddJadwal={handleAdd}
      />

      <EditJadwalDialog
        editingJadwal={editingJadwal}
        isOpen={isEditJadwalOpen}
        onOpenChange={setIsEditJadwalOpen}
        onUpdateJadwal={handleSaveEdit}
        setEditingJadwal={setEditingJadwal}
      />

      <PrintJadwalDialog
        isOpen={isPrintJadwalOpen}
        onOpenChange={setIsPrintJadwalOpen}
        filterKelas={filterKelas}
        filterRombel={filterRombel}
        jadwalList={jadwalList}
        onPrint={handlePrintJadwal}
      />
    </>
  );
}
