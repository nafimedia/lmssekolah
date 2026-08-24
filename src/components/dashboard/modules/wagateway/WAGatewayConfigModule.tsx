import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  Bell,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FlaskConical,
  MessageSquare,
} from "lucide-react";
import { MysqlDataService, WaGatewayConfigRow } from "@/services/mysqlDataService";
import { toast } from "sonner";

export function WAGatewayConfigModule() {
  const [config, setConfig] = useState<WaGatewayConfigRow>({
    provider: "fonnte",
    api_token: "",
    sender_phone: "0812-3456-7890",
    api_url: "https://api.fonnte.com/send",
    is_presensi_active: true,
    is_tahfidz_active: true,
    is_pengumuman_active: false,
    is_rapor_active: true,
    template_presensi: "Assalamu'alaikum Bpk/Ibu wali dari {nama_siswa} ({rombel}), menginformasikan bahwa ananda hari ini {tanggal} tercatat status: {status_presensi}. Terima kasih.",
    template_tahfidz: "Assalamu'alaikum Bpk/Ibu, ananda {nama_siswa} baru saja menyelesaikan setoran Tahfidz {surah} ({ayat}) dengan nilai {nilai} - Status: {status_mutqin}.",
    template_pengumuman: "📢 PENGUMUMAN MADRASAH: {judul_pengumuman}\n\n{isi_pengumuman}",
    template_rapor: "Assalamu'alaikum Bpk/Ibu, E-Rapor digital semester {semester} ananda {nama_siswa} ({rombel}) telah terbit dengan rata-rata nilai {rata_nilai}.",
  });

  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [testPhone, setTestPhone] = useState("081234567890");
  const [testMessage, setTestMessage] = useState("Assalamu'alaikum, ini adalah pesan uji coba dari sistem WA Gateway LMS MTsN 2.");

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const dbCfg = await MysqlDataService.getWaGatewayConfig();
      if (dbCfg) {
        setConfig(dbCfg);
      }
    } catch (err) {
      console.warn("fetchConfig failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await MysqlDataService.saveWaGatewayConfig(config);
      if (res) {
        toast.success("✅ Pengaturan WA Gateway berhasil disimpan ke database!");
      } else {
        toast.error("Gagal menyimpan pengaturan WA Gateway.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone || !testMessage) {
      return toast.error("Isi nomor HP pengujian dan isi pesan uji coba!");
    }
    setIsTesting(true);
    try {
      const res = await MysqlDataService.sendTestWaMessage(testPhone, testMessage, config);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(`Gagal: ${err?.message || err}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Send className="h-5 w-5 text-emerald-600" /> Konfigurasi WA Gateway & API
            </h2>
            {config.api_token ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold gap-1">
                <CheckCircle2 className="h-3 w-3" /> Token Aktif ({config.provider.toUpperCase()})
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-bold gap-1">
                <AlertCircle className="h-3 w-3" /> Token Belum Dikonfigurasi
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola penyedia WA Gateway (Fonnte/Wablas/Whacenter), API Token, pemicu notifikasi otomatis, dan template pesan.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => handleSaveConfig()}
          disabled={isSaving || isLoading}
          className="gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
        >
          <Save className="h-4 w-4" /> {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground animate-pulse border border-dashed border-border rounded-xl">
          Memuat konfigurasi WA Gateway dari database...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Card 1: Provider & Credentials Settings */}
          <Card className="border-border shadow-2xs bg-card">
            <CardHeader className="p-4 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" /> Provider & Kredensial API
              </CardTitle>
              <CardDescription className="text-xs">
                Pilih penyedia layanan WA Gateway dan masukkan API Token resmi madrasah.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pilihan Provider WA Gateway</Label>
                <select
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs font-medium focus:ring-1 focus:ring-primary"
                  value={config.provider}
                  onChange={(e) => {
                    const p = e.target.value as any;
                    let defaultUrl = "https://api.fonnte.com/send";
                    if (p === "wablas") defaultUrl = "https://kudus.wablas.com/api/send-message";
                    else if (p === "whacenter") defaultUrl = "https://whacenter.com/api/send";
                    setConfig({ ...config, provider: p, api_url: defaultUrl });
                  }}
                >
                  <option value="fonnte">Fonnte.com (Disarankan — Flat Rate Rp 50rb/bln)</option>
                  <option value="wablas">Wablas.com (Wablas Server API)</option>
                  <option value="whacenter">Whacenter.com API</option>
                  <option value="custom">Custom REST API Endpoint</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">API Key / Token Provider</Label>
                <div className="relative">
                  <Input
                    type={showToken ? "text" : "password"}
                    placeholder="Masukkan API Token (misal: aB12cD34eF56...)"
                    value={config.api_token}
                    onChange={(e) => setConfig({ ...config, api_token: e.target.value })}
                    className="pr-10 h-9 text-xs font-mono"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-9 w-9 p-0 hover:bg-transparent"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-muted-foreground" />}
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <HelpCircle className="h-3 w-3 text-primary shrink-0" /> Token rahasia didapatkan dari dashboard provider (misal: Fonnte Dashboard).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Nomor WA Pengirim (WA Center)</Label>
                  <Input
                    placeholder="Misal: 081234567890"
                    value={config.sender_phone}
                    onChange={(e) => setConfig({ ...config, sender_phone: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">API Endpoint URL</Label>
                  <Input
                    placeholder="https://api.fonnte.com/send"
                    value={config.api_url || ""}
                    onChange={(e) => setConfig({ ...config, api_url: e.target.value })}
                    className="h-9 text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Live Test Message Sending */}
          <Card className="border-border shadow-2xs bg-card">
            <CardHeader className="p-4 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-emerald-600" /> Uji Coba Pengiriman Langsung (Live Test)
              </CardTitle>
              <CardDescription className="text-xs">
                Tes koneksi API dengan menguji kirim pesan WA ke nomor pengujian.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nomor HP Penerima Uji Coba</Label>
                <Input
                  placeholder="081234567890"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Isi Pesan Uji Coba</Label>
                <textarea
                  className="w-full min-h-[75px] rounded-md border border-input bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSendTestMessage}
                disabled={isTesting || !config.api_token}
                className="w-full font-bold text-xs gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
              >
                <Send className={`h-3.5 w-3.5 ${isTesting ? "animate-pulse" : ""}`} />
                {isTesting ? "Sedang Mengirim ke Provider..." : "🧪 Kirim Pesan Uji Coba"}
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Automated Notification Triggers */}
          <Card className="border-border shadow-2xs bg-card">
            <CardHeader className="p-4 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" /> Sakelar Notifikasi Otomatis (Auto Triggers)
              </CardTitle>
              <CardDescription className="text-xs">
                Aktifkan pemicu otomatis pengiriman WA saat guru memasukkan data di LMS.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                {
                  id: "is_presensi_active",
                  label: "Notifikasi Presensi Siswa",
                  desc: "Kirim WA ke orang tua jika siswa dicatat Sakit / Izin / Alpa.",
                  value: config.is_presensi_active,
                },
                {
                  id: "is_tahfidz_active",
                  label: "Notifikasi Setoran Tahfidz",
                  desc: "Kirim WA ke orang tua setiap ada setoran Surah/Juz baru.",
                  value: config.is_tahfidz_active,
                },
                {
                  id: "is_pengumuman_active",
                  label: "Notifikasi Pengumuman Resmi",
                  desc: "Kirim WA ke nomor orang tua saat pengumuman diterbitkan.",
                  value: config.is_pengumuman_active,
                },
                {
                  id: "is_rapor_active",
                  label: "Notifikasi E-Rapor Digital",
                  desc: "Kirim WA rekap nilai & e-rapor saat hasil ujian terbit.",
                  value: config.is_rapor_active,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <div className="font-bold text-xs text-foreground">{item.label}</div>
                    <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                    checked={item.value}
                    onChange={(e) => setConfig({ ...config, [item.id]: e.target.checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card 4: Message Template Customizer */}
          <Card className="border-border shadow-2xs bg-card">
            <CardHeader className="p-4 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" /> Kustomisasi Template Pesan WA
              </CardTitle>
              <CardDescription className="text-xs">
                Gunakan variabel placeholder dinamis: <code className="bg-muted px-1 rounded font-mono text-[10px]">{"{nama_siswa}"}</code>, <code className="bg-muted px-1 rounded font-mono text-[10px]">{"{rombel}"}</code>, <code className="bg-muted px-1 rounded font-mono text-[10px]">{"{status_presensi}"}</code>, <code className="bg-muted px-1 rounded font-mono text-[10px]">{"{surah}"}</code>, <code className="bg-muted px-1 rounded font-mono text-[10px]">{"{nilai}"}</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Template WA Presensi</Label>
                <textarea
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2.5 text-xs font-mono focus:ring-1 focus:ring-primary"
                  value={config.template_presensi}
                  onChange={(e) => setConfig({ ...config, template_presensi: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Template WA Setoran Tahfidz</Label>
                <textarea
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2.5 text-xs font-mono focus:ring-1 focus:ring-primary"
                  value={config.template_tahfidz}
                  onChange={(e) => setConfig({ ...config, template_tahfidz: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Template WA Pengumuman</Label>
                <textarea
                  className="w-full min-h-[60px] rounded-md border border-input bg-background p-2.5 text-xs font-mono focus:ring-1 focus:ring-primary"
                  value={config.template_pengumuman}
                  onChange={(e) => setConfig({ ...config, template_pengumuman: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
