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

import { isSameClass } from "@/utils/classNormalization";

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
      const clean = raw.toUpperCase().replace("-", "").replace(/\s+/g, "");
      if (clean.includes("7B") || clean.includes("VIIB")) return "Rombel 7B";
      if (clean.includes("7A") || clean.includes("VIIA")) return "Rombel 7A";
      if (clean.includes("8B") || clean.includes("VIIIB")) return "Rombel 8B";
      if (clean.includes("8A") || clean.includes("VIIIA")) return "Rombel 8A";
      if (clean.includes("9B") || clean.includes("IXB")) return "Rombel 9B";
      if (clean.includes("9A") || clean.includes("IXA")) return "Rombel 9A";
    }

    const cleanName = (me?.full_name || "").toLowerCase();
    const cleanNip = (me?.nis_nip || "").trim();
    const cleanAssigned = (userProfile?.assignedClass || (me as any)?.assigned_class || "").toUpperCase();

    if (cleanAssigned.includes("7B")) return "Rombel 7B";
    if (cleanAssigned.includes("7A")) return "Rombel 7A";
    if (cleanAssigned.includes("8B")) return "Rombel 8B";
    if (cleanAssigned.includes("8A")) return "Rombel 8A";
    if (cleanAssigned.includes("9B")) return "Rombel 9B";
    if (cleanAssigned.includes("9A")) return "Rombel 9A";

    if (cleanName.includes("achmad makmun") || cleanNip.includes("272005011001")) return "Rombel 8B";
    if (cleanName.includes("misbah")) return "Rombel 7A";
    if (cleanName.includes("endah")) return "Rombel 7B";
    if (cleanName.includes("sobiyati")) return "Rombel 8A";
    if (cleanName.includes("novantya")) return "Rombel 9A";
    if (cleanName.includes("sayono")) return "Rombel 9B";

    return "Rombel 8A";
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

  const loadJadwalData = async () => {
    setIsLoadingJadwal(true);
    try {
      const data = await MysqlDataService.getJadwalList();
      setJadwalList(data || []);
    } catch (e) {
      console.warn("Gagal memuat jadwal dari MySQL:", e);
    } finally {
      setIsLoadingJadwal(false);
    }
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
    toast.success(`🖨️ Cetak Matriks Jadwal Pelajaran KBM (${filterRombel === "Semua" ? "Seluruh Rombel" : filterRombel}) berhasil diproses!`);
  };

  return (
    <>
      {isSiswa ? (
        <StudentHeaderBanner
          title="Jadwal Pelajaran Saya"
          subtitle="Roster jadwal jam KBM tatap muka & alokasi ruang kelas harian MTsN 2 Cilacap"
          icon={CalendarClock}
          statusText="Roster Pelajaran Aktif 2026/2027"
          statusVariant="success"
          actionButtons={
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20" onClick={() => setIsPrintJadwalOpen(true)}>
              <Printer className="h-3.5 w-3.5" /> Cetak Jadwal KBM PDF
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Jadwal Pelajaran {isGuru && <Badge className="bg-emerald-600 text-white font-bold text-xs">📖 Media Informasi Guru (Read-Only)</Badge>}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isGuru
                ? "Informasi matriks jadwal pelajaran tatap muka dan alokasi ruang kelas MTsN 2 Cilacap."
                : "Kelola jadwal pelajaran tatap muka dan alokasi ruang kelas."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20" onClick={() => setIsPrintJadwalOpen(true)}>
              <Printer className="h-3.5 w-3.5" /> Cetak Jadwal KBM PDF
            </Button>
            {!isReadOnlyRole && (
              <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Tambah Jadwal Pelajaran
              </Button>
            )}
          </div>
        </div>
      )}

      {!isRestrictedRole ? (
        <div className="p-3.5 rounded-xl bg-card border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 shadow-2xs">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <span className="text-xs font-bold text-muted-foreground shrink-0">Filter Rombel / Kelas:</span>
            <select
              className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer hover:border-primary/50 transition shrink-0 min-w-[220px]"
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
              <option value="Semua">Semua Rombel (Seluruh Tingkat)</option>
              <option value="Rombel 7A">Rombel 7A (Kelas VII)</option>
              <option value="Rombel 7B">Rombel 7B (Kelas VII)</option>
              <option value="Rombel 8A">Rombel 8A (Kelas VIII)</option>
              <option value="Rombel 8B">Rombel 8B (Kelas VIII)</option>
              <option value="Rombel 9A">Rombel 9A (Kelas IX)</option>
              <option value="Rombel 9B">Rombel 9B (Kelas IX)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span>📍 Menampilkan: <strong className="underline decoration-emerald-500 font-extrabold">{filterRombel === "Semua" ? "Seluruh Rombel" : filterRombel}</strong> ({filterKelas === "Semua" ? "Seluruh Tingkat" : filterKelas})</span>
            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[9px] font-bold shrink-0">
              ✔ {jadwalList.length} Sesi MySQL
            </Badge>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 mb-6 shadow-2xs">
          <div className="flex items-center gap-2.5 text-xs font-extrabold text-emerald-900 dark:text-emerald-200">
            <Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Jadwal Pelajaran <strong className="text-emerald-700 dark:text-emerald-400 font-black">{resolvedInitialRombel} ({resolvedInitialGrade})</strong></span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoadingJadwal ? (
          <div className="col-span-full py-12 text-center text-xs font-semibold text-muted-foreground">
            ⏳ Memuat Jadwal Pelajaran KBM dari Database MySQL...
          </div>
        ) : (
          hariList.map((h) => {
            let listForDay = (jadwalList || []).filter((s) => {
              if (s.hari !== h) return false;
              const matchKelas = filterKelas === "Semua" || s.tingkat === filterKelas;
              const matchRombel = filterRombel === "Semua" || isSameClass(s.rombel, filterRombel);
              return matchKelas && matchRombel;
            });

            if (listForDay.length === 0 && isSiswa) {
              const defaultMapels: Record<string, Array<{ jam: string; mapel: string; guru: string }>> = {
                Senin: [
                  { jam: "07:30 - 09:00", mapel: "Al Qur'an Hadis", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
                  { jam: "09:15 - 10:45", mapel: "Bahasa Indonesia", guru: "SOBIYATI, S.Pd" },
                  { jam: "11:00 - 12:30", mapel: "Matematika", guru: "SAYONO, S.Pd., M.Pd." },
                ],
                Selasa: [
                  { jam: "07:30 - 09:00", mapel: "Bahasa Inggris", guru: "MISBAHUL MUNIR, S.Pd" },
                  { jam: "09:15 - 10:45", mapel: "Fikih", guru: "CARYATI, S.Pd.I" },
                  { jam: "11:00 - 12:30", mapel: "Ilmu Pengetahuan Alam", guru: "NOVANTYA KARTIKAWATI, S.Pd" },
                ],
                Rabu: [
                  { jam: "07:30 - 09:00", mapel: "Akidah Akhlak", guru: "WAKHIBUN, S.Pd.I" },
                  { jam: "09:15 - 10:45", mapel: "Sejarah Kebudayaan Islam", guru: "H. DASIRUN, S.Ag., M.Pd.I" },
                  { jam: "11:00 - 12:30", mapel: "Bahasa Arab", guru: "ENDAH SUPRIHATIN, S.Pd" },
                ],
                Kamis: [
                  { jam: "07:30 - 09:00", mapel: "Pendidikan Kewarganegaraan", guru: "MISBAH AHMAD DANI, S.Pd" },
                  { jam: "09:15 - 10:45", mapel: "Informatika", guru: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
                ],
                Jumat: [
                  { jam: "07:30 - 09:00", mapel: "PJOK", guru: "TRIYONO, S.Pd" },
                ],
                Sabtu: [
                  { jam: "07:30 - 09:00", mapel: "Seni Budaya & Bahasa Jawa", guru: "DRA. ENDAH SRI W" },
                ],
              };

              const template = defaultMapels[h] || [];
              listForDay = template.map((item, idx) => ({
                id: `def-${h}-${idx}`,
                hari: h,
                jam: item.jam,
                mapel: item.mapel,
                tingkat: filterKelas,
                rombel: filterRombel,
                guru: item.guru,
              }));
            }

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
                  {listForDay.map((s) => (
                    <div key={s.id || `${s.hari}-${s.jam}-${s.rombel}`} className="flex items-start justify-between gap-2 border-l-4 border-primary pl-3 py-2 bg-card rounded-r-lg shadow-2xs group hover:border-primary/80 transition">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-foreground truncate">{s.mapel}</div>
                        <div className="flex items-center gap-1.5 my-1 flex-wrap">
                          <Badge variant="secondary" className="text-[9px] font-bold bg-muted text-foreground border-border">
                            🏛️ {s.tingkat}
                          </Badge>
                          <Badge className="text-[9px] font-bold bg-primary/15 text-primary border-primary/20">
                            🏫 {s.rombel}
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
                  ))}
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
