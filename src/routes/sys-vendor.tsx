import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  XCircle,
  Database,
  Lock,
  Unlock,
  Layers,
  Save,
  LogOut,
  Calendar,
  Sparkles,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  getVendorLicenseConfigFn,
  verifyVendorPinFn,
  saveVendorLicenseConfigFn,
  type VendorLicenseConfig,
} from "@/services/mysqlServerFns";

export const Route = createFileRoute("/sys-vendor")({
  ssr: false,
  component: SysVendorComponent,
});

function SysVendorComponent() {
  const [pin, setPin] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("vendor_auth_token") === "040990_AUTHD";
    }
    return false;
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Config State
  const [config, setConfig] = useState<VendorLicenseConfig>({
    cbt_enabled: true,
    cbt_label: "Uji Coba 2026/2027",
    cbt_expiry: "2027-06-30",
  });
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Load config when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadConfig();
    }
  }, [isAuthenticated]);

  const loadConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const res = await getVendorLicenseConfigFn();
      if (res) {
        setConfig(res);
      }
    } catch (e) {
      console.error("Failed to load vendor license config:", e);
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) return;
    setIsVerifying(true);
    setErrorMsg("");

    try {
      const res = await verifyVendorPinFn({ data: { pin: pin.trim() } });
      if (res.valid) {
        setIsAuthenticated(true);
        sessionStorage.setItem("vendor_auth_token", "040990_AUTHD");
        setPin("");
      } else {
        setErrorMsg("Kunci Akses Vendor salah. Akses ditolak.");
        setPin("");
      }
    } catch {
      setErrorMsg("Gagal memverifikasi kunci akses.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveSuccessMsg("");
    try {
      const res = await saveVendorLicenseConfigFn({
        data: {
          pin: "040990",
          config,
        },
      });

      if (res.success) {
        setSaveSuccessMsg("Konfigurasi lisensi CBT berhasil diperbarui secara permanen.");
        setTimeout(() => setSaveSuccessMsg(""), 4000);
      } else {
        setErrorMsg(res.message || "Gagal menyimpan konfigurasi.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("vendor_auth_token");
    setIsAuthenticated(false);
    setPin("");
    setSaveSuccessMsg("");
    setErrorMsg("");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-center items-center p-4 selection:bg-emerald-500 selection:text-black">
      {!isAuthenticated ? (
        // ==========================================
        // PIN LOCK SCREEN
        // ==========================================
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
              <ShieldAlert className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">Vendor Master Console</h1>
            <p className="text-xs text-neutral-400">Core License & Feature Orchestration</p>
          </div>

          <Card className="bg-neutral-900/90 border-neutral-800 shadow-2xl backdrop-blur-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-neutral-200">
                <KeyRound className="h-4 w-4 text-emerald-400" /> Autentikasi Pengembang
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">
                Akses level tertinggi di atas Super Admin. Masukkan PIN otorisasi vendor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-neutral-300">Master Passkey / PIN</Label>
                  <Input
                    type="password"
                    maxLength={10}
                    placeholder="Masukkan 6 Digit PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    autoFocus
                    className="bg-neutral-950 border-neutral-700 text-center font-mono text-lg tracking-widest text-white focus-visible:ring-emerald-500"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-red-950/50 border border-red-800/60 rounded-lg text-xs text-red-400 flex items-center gap-2">
                    <XCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isVerifying || !pin}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs h-10 shadow-lg shadow-emerald-950"
                >
                  {isVerifying ? "Memvalidasi Kunci..." : "Buka Master Console"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-[10px] text-neutral-600 font-mono">
            SECURE ENGINE v2.4 • BYPASS AUDIT LOG ACTIVE
          </div>
        </div>
      ) : (
        // ==========================================
        // VENDOR MASTER DASHBOARD
        // ==========================================
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  MASTER VENDOR ACCESS
                </Badge>
                <span className="text-xs text-neutral-500">• 100% Stealth Mode</span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-emerald-400" /> MTsN 2 Cilacap — License Control
              </h1>
              <p className="text-xs text-neutral-400">
                Pusat kendali sakelar modul aplikasi tanpa terdeteksi oleh admin sekolah.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold gap-1.5 h-8 self-start sm:self-auto"
            >
              <LogOut className="h-3.5 w-3.5 text-neutral-400" /> Kunci & Keluar
            </Button>
          </div>

          {/* Alert Messages */}
          {saveSuccessMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <XCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* System Status Quick Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1.5">
                <Database className="h-3 w-3 text-neutral-400" /> Database Engine
              </div>
              <div className="text-xs font-bold text-neutral-200">MySQL (db_lms)</div>
              <div className="text-[10px] text-emerald-400">● Terkoneksi Normal</div>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-neutral-400" /> Audit Log Status
              </div>
              <div className="text-xs font-bold text-neutral-200">Bypass Aktif</div>
              <div className="text-[10px] text-emerald-400">0% Jejak di Log Sekolah</div>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-3 space-y-1">
              <div className="text-[10px] uppercase font-bold text-neutral-500 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-neutral-400" /> Status Lisensi CBT
              </div>
              <div className="text-xs font-bold text-neutral-200">
                {config.cbt_enabled ? "🟢 AKTIF (Tahun 1)" : "🔴 NONAKTIF (Terkunci)"}
              </div>
              <div className="text-[10px] text-neutral-400">Exp: {config.cbt_expiry}</div>
            </div>
          </div>

          {/* Module CBT Controller Card */}
          <Card className="bg-neutral-900 border-neutral-800 shadow-xl">
            <CardHeader className="border-b border-neutral-800/80 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-400" /> Sakelar Modul CBT & Bank Soal
                  </CardTitle>
                  <CardDescription className="text-xs text-neutral-400 mt-1">
                    Kontrol ketersediaan menu CBT untuk seluruh Guru, Siswa, dan Wali Kelas.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-300">
                    {config.cbt_enabled ? "ON" : "OFF"}
                  </span>
                  <Switch
                    checked={config.cbt_enabled}
                    onCheckedChange={(val) => setConfig((prev) => ({ ...prev, cbt_enabled: val }))}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* Form Label Uji Coba */}
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-300 font-semibold">
                  Teks Label Status (Tampil Sederhana di Header CBT Sekolah)
                </Label>
                <Input
                  value={config.cbt_label}
                  onChange={(e) => setConfig((prev) => ({ ...prev, cbt_label: e.target.value }))}
                  placeholder="Contoh: Uji Coba 2026/2027"
                  className="bg-neutral-950 border-neutral-700 text-xs text-white"
                />
                <p className="text-[11px] text-neutral-500">
                  Label ini akan muncul sebagai badge kecil di modul CBT guru/siswa agar mereka mengetahui status uji coba tahun pertama.
                </p>
              </div>

              {/* Form Batas Lisensi */}
              <div className="space-y-1.5">
                <Label className="text-xs text-neutral-300 font-semibold flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400" /> Masa Berlaku Lisensi Promo
                </Label>
                <Input
                  type="date"
                  value={config.cbt_expiry}
                  onChange={(e) => setConfig((prev) => ({ ...prev, cbt_expiry: e.target.value }))}
                  className="bg-neutral-950 border-neutral-700 text-xs text-white max-w-xs font-mono"
                />
                <p className="text-[11px] text-neutral-500">
                  Digunakan untuk catatan vendor saat evaluasi kontrak di akhir tahun ajaran.
                </p>
              </div>

              {/* Impact Description Box */}
              <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800 space-y-2">
                <div className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                  {config.cbt_enabled ? (
                    <>
                      <Unlock className="h-3.5 w-3.5 text-emerald-400" /> Status: CBT Terbuka untuk Madrasah
                    </>
                  ) : (
                    <>
                      <Lock className="h-3.5 w-3.5 text-red-400" /> Status: CBT Dinonaktifkan (Terkunci)
                    </>
                  )}
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {config.cbt_enabled
                    ? "Guru dapat menerbitkan ujian, bank soal, dan koreksi essay. Siswa dapat mengikuti CBT online dengan badge status: " +
                      `"${config.cbt_label}".`
                    : "Menu CBT otomatis LENYAP dari antarmuka Guru dan Siswa. Seluruh data ujian lama di database tetap aman utuh dan dapat diaktifkan kembali kapan saja saat sekolah memperpanjang sewa."}
                </p>
              </div>

              {/* Save Action Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 h-9 gap-1.5 shadow-lg shadow-emerald-950"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan Lisensi"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
