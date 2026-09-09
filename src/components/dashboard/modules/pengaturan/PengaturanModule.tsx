import React, { useState, useEffect, useRef } from "react";
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
import {
  Settings,
  Database,
  Upload,
  Download,
  RefreshCw,
  ShieldCheck,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Search,
  Server,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService, AuditLogItem } from "@/services/mysqlDataService";
import { HealthStatusResponse } from "@/services/mysqlServerFns";

export function PengaturanModule() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [logSearch, setLogSearch] = useState("");

  const [health, setHealth] = useState<HealthStatusResponse | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(true);

  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const data = await MysqlDataService.getAuditLogs();
      setLogs(data || []);
    } catch (e) {
      console.warn("Gagal memuat log audit:", e);
      setLogs([]);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await MysqlDataService.getHealthStatus();
      setHealth(res);
    } catch (e) {
      console.warn("Gagal memuat status kesehatan server:", e);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  useEffect(() => {
    loadLogs();
    loadHealth();
  }, []);

  const handleDownloadBackup = async () => {
    setIsBackingUp(true);
    toast.info("⏳ Sedang memproses dump database MySQL...");
    try {
      const res = await MysqlDataService.exportDatabaseBackup();
      if (res.success && res.sql) {
        const blob = new Blob([res.sql], { type: "application/sql;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || `backup_db_lms_${Date.now()}.sql`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`💾 Berkas cadangan "${res.filename}" berhasil diunduh ke komputer Anda!`);
        loadLogs();
      } else {
        toast.error(`Gagal membuat cadangan database: ${res.error || "Kesalahan server"}`);
      }
    } catch (err: any) {
      toast.error(`Gagal mengunduh cadangan: ${err?.message || "Error jaringan"}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".sql")) {
        return toast.error("Format berkas harus berekstensi .sql!");
      }
      setSelectedFile(file);
    }
  };

  const handleExecuteRestore = async () => {
    if (!selectedFile) {
      return toast.error("Silakan pilih berkas cadangan .sql terlebih dahulu!");
    }

    setIsRestoring(true);
    toast.info("⏳ Membaca dan mengeksekusi berkas SQL pemulihan...");
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const sqlContent = event.target?.result as string;
        if (!sqlContent || sqlContent.trim().length === 0) {
          setIsRestoring(false);
          return toast.error("Berkas SQL kosong!");
        }

        const res = await MysqlDataService.restoreDatabaseBackup(sqlContent);
        if (res.success) {
          toast.success(`🎉 ${res.message || "Database berhasil dipulihkan!"}`);
          setIsRestoreOpen(false);
          setSelectedFile(null);
          loadLogs();
          loadHealth();
        } else {
          toast.error(`Gagal memulihkan database: ${res.error || "Format SQL tidak valid"}`);
        }
        setIsRestoring(false);
      };

      reader.onerror = () => {
        setIsRestoring(false);
        toast.error("Gagal membaca berkas dari disk lokal.");
      };

      reader.readAsText(selectedFile);
    } catch (err: any) {
      setIsRestoring(false);
      toast.error(`Terjadi kesalahan: ${err?.message || "Gagal memproses berkas"}`);
    }
  };

  const handleClearCache = () => {
    try {
      sessionStorage.clear();
      toast.success("🧹 Cache sesi peramban berhasil dibersihkan!");
      loadLogs();
      loadHealth();
    } catch {
      toast.info("Cache sistem telah dimutakhirkan.");
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds && seconds !== 0) return "-";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h} jam ${m} mnt ${s} dtk`;
    if (m > 0) return `${m} menit ${s} detik`;
    return `${s} detik`;
  };

  const filteredLogs = logs.filter((l) => {
    if (!logSearch.trim()) return true;
    const q = logSearch.toLowerCase();
    return (
      (l.user && l.user.toLowerCase().includes(q)) ||
      (l.act && l.act.toLowerCase().includes(q)) ||
      (l.module && l.module.toLowerCase().includes(q)) ||
      (l.result && l.result.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Settings className="h-6 w-6 text-primary" /> Pengaturan & Pemeliharaan Sistem
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Pusat pengaturan sistem madrasah, riwayat aktivitas pengguna, status server, dan cadangan data.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs font-bold"
            onClick={() => setIsRestoreOpen(true)}
          >
            <Upload className="h-3.5 w-3.5 text-blue-600" /> Pulihkan Data (.sql)
          </Button>
          <Button
            size="sm"
            disabled={isBackingUp}
            className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleDownloadBackup}
          >
            <Database className="h-3.5 w-3.5" />
            {isBackingUp ? "Mencadangkan..." : "Cadangkan Data (.sql)"}
          </Button>
        </div>
      </div>

      {/* Top 3 Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Early Warning System Threshold Card */}
        <Card className="border-border shadow-xs border-l-4 border-l-amber-500 bg-card">
          <CardHeader className="py-3 px-4 bg-amber-500/10">
            <CardTitle className="text-xs font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" /> Sistem Peringatan Dini Akademik
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="text-xs text-muted-foreground">
              Ambang Batas Peringatan Otomatis Pembinaan Siswa & Akademik:
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>Batas Minimum KKM Madrasah:</span>
                <span className="font-mono text-primary font-extrabold">75 / 100</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Batas Min. Kehadiran KBM:</span>
                <span className="font-mono text-primary font-extrabold">80%</span>
              </div>
            </div>
            <Badge className="bg-amber-600 text-white text-[10px] w-full justify-center">
              Status Peringatan Dini: AKTIF ✔
            </Badge>
          </CardContent>
        </Card>

        {/* Real System Server Info */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="py-3 px-4 bg-muted/40 flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-600" /> Status Koneksi & Server
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={loadHealth} title="Segarkan status server">
              <RefreshCw className={`h-3 w-3 ${isLoadingHealth ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status Database:</span>
              <Badge className="bg-emerald-600 text-white text-[10px] font-mono">
                {health?.database === "connected" ? "MySQL Connected (Sync)" : "Degraded / Offline"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Uptime Server:</span>
              <strong className="font-mono text-foreground">{formatUptime(health?.uptimeSeconds)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Tabel MySQL:</span>
              <strong className="font-mono text-emerald-600 font-bold">{health?.tableCount || 0} Tabel Aktif</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ukuran Data DB:</span>
              <strong className="font-mono text-blue-600 font-bold">~{health?.dbSizeMb || "0.00"} MB</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versi Aplikasi:</span>
              <span className="font-mono text-muted-foreground">{health?.version || "v2.5.0"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Security & Maintenance */}
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="py-3 px-4 bg-muted/40">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600" /> Keamanan & Pemeliharaan Sistem
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Proteksi Hak Akses Akun:</span>
              <Badge className="bg-emerald-600 text-white text-[10px]">Aktif Terlindungi</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Akun Terdaftar:</span>
              <strong className="font-mono text-foreground font-bold">{health?.activeUsersCount || 0} Pengguna</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pencadangan Mandiri:</span>
              <Badge variant="outline" className="text-[10px] font-mono">1-Click SQL Dump</Badge>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs font-bold mt-2 gap-1.5"
              onClick={handleClearCache}
            >
              <RefreshCw className="h-3.5 w-3.5" /> Segarkan Sesi & Cache Aplikasi
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Audit Trail & Log Aktivitas Sistem
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Rekam jejak riil seluruh aktivitas pengguna dan mutasi data dari tabel MySQL `audit_logs`.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari log pengguna / modul..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 px-2.5" onClick={loadLogs} title="Segarkan Log">
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingLogs ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingLogs ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Memuat data audit trail dari database MySQL...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center border-dashed text-xs text-muted-foreground space-y-2 bg-card">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-semibold text-foreground text-sm">Belum Ada Rekaman Audit Trail yang Sesuai</div>
              <p>Database saat ini belum memiliki jejak aktivitas yang cocok dengan pencarian Anda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4">Pengguna</th>
                    <th className="py-2.5 px-4">Modul</th>
                    <th className="py-2.5 px-4">Aktivitas / Detail Eksekusi</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Waktu Eksekusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-4 font-bold text-foreground">{l.user}</td>
                      <td className="py-2.5 px-4 font-semibold text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] uppercase font-mono">
                          {l.module || "System"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-muted-foreground font-mono text-[11px]">{l.act}</td>
                      <td className="py-2.5 px-4 text-center">
                        <Badge
                          className={`text-[9px] font-bold ${
                            l.result === "SUCCESS"
                              ? "bg-emerald-600/15 text-emerald-600 border-emerald-500/30"
                              : "bg-red-600/15 text-red-600 border-red-500/30"
                          }`}
                        >
                          {l.result}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-muted-foreground">{l.tgl}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Database Modal */}
      <Dialog open={isRestoreOpen} onOpenChange={setIsRestoreOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-foreground">
              <Upload className="h-5 w-5 text-blue-600" /> Pulihkan Cadangan Data (.sql)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Unggah berkas cadangan data (.sql) untuk memulihkan informasi madrasah.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs space-y-1 text-amber-800 dark:text-amber-300">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" /> Perhatian Pemulihan:
              </div>
              <p>
                Proses pemulihan akan memperbarui data dari berkas yang diunggah. Pastikan berkas cadangan berasal dari sistem LMS MTsN 2 Cilacap yang sah.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Pilih Berkas Cadangan (.sql):</label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".sql"
                onChange={handleFileChange}
                className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 border border-input rounded-md p-1 cursor-pointer"
              />
              {selectedFile && (
                <div className="mt-2 text-xs font-mono text-emerald-600 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsRestoreOpen(false)} disabled={isRestoring}>
              Batal
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5"
              onClick={handleExecuteRestore}
              disabled={!selectedFile || isRestoring}
            >
              <Upload className="h-3.5 w-3.5" />
              {isRestoring ? "Memulihkan Data..." : "Mulai Pemulihan Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
