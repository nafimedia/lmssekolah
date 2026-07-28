import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, CheckCircle2, RefreshCw } from "lucide-react";
import { waGatewayService, WaLogEntry } from "@/services/waGateway";

export function WAGatewayLogModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [logs, setLogs] = useState<WaLogEntry[]>(waGatewayService.getLogs());
  const [phone, setPhone] = useState("081234567890");
  const [name, setName] = useState("Bpk. Suryanto");
  const [student, setStudent] = useState("Ahmad Fauzi");
  const [category, setCategory] = useState<"ABSENSI_ALPHA" | "WARNING_PEMBINAAN" | "AWARD_APRESIASI" | "ERAPOR_PUBLISHED">("ABSENSI_ALPHA");
  const [message, setMessage] = useState(
    waGatewayService.buildAbsensiAlert("Ahmad Fauzi", "Selasa, 28 Juli 2026", "Alpha (Belum Check-In)")
  );

  const handleCategoryChange = (cat: any) => {
    setCategory(cat);
    if (cat === "ABSENSI_ALPHA") {
      setMessage(waGatewayService.buildAbsensiAlert(student, "Selasa, 28 Juli 2026", "Alpha"));
    } else if (cat === "WARNING_PEMBINAAN") {
      setMessage(waGatewayService.buildWarningAlert(student, "Belum Mengumpulkan LKPD 15", "Harap tuntas hari ini."));
    } else if (cat === "AWARD_APRESIASI") {
      setMessage(waGatewayService.buildAwardAlert(student, "⭐ Siswa Aktif", "Sangat aktif dalam KBM!"));
    } else if (cat === "ERAPOR_PUBLISHED") {
      setMessage(waGatewayService.buildERaporAlert(student, "Ganjil 2026/2027", 92.5));
    }
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    await waGatewayService.sendNotification({
      recipientPhone: phone,
      recipientName: name,
      studentName: student,
      category,
      messageText: message,
    });
    setLogs(waGatewayService.getLogs());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl border-border bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-500" /> WhatsApp Gateway Notification Engine
          </DialogTitle>
          <DialogDescription className="text-xs">
            Integrasi Pengiriman Pesan Otomatis ke Wali Murid (Peringatan Alpha, Catatan Warning, & E-Rapor).
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-6">
          {/* Section 1: Form Simulasi Kirim WA */}
          <form onSubmit={handleTestSend} className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-3">
            <div className="font-bold text-xs text-foreground flex items-center justify-between">
              <span>⚡ Uji Pengiriman Pesan WhatsApp Gateway</span>
              <Badge className="bg-emerald-600 text-white text-[10px]">STATUS: GATEWAY READY 🟢</Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-semibold">Nama Wali Murid</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required className="h-8 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-[11px] font-semibold">No. HP WhatsApp Wali</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-8 text-xs mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[11px] font-semibold">Nama Siswa</Label>
                <Input value={student} onChange={(e) => setStudent(e.target.value)} required className="h-8 text-xs mt-1" />
              </div>
              <div>
                <Label className="text-[11px] font-semibold">Kategori Pesan WA</Label>
                <select className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs mt-1" value={category} onChange={(e) => handleCategoryChange(e.target.value)}>
                  <option value="ABSENSI_ALPHA">🚨 Alert Absensi Alpha / Izin</option>
                  <option value="WARNING_PEMBINAAN">⚠️ Catatan Warning Pembinaan</option>
                  <option value="AWARD_APRESIASI">🎉 Lencana Badge Apresiasi</option>
                  <option value="ERAPOR_PUBLISHED">📜 Penerbitan E-Rapor Semester</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-[11px] font-semibold">Isi Pesan WhatsApp</Label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full h-24 rounded-md border border-border bg-background p-2.5 text-xs mt-1" required />
            </div>

            <Button type="submit" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2">
              <Send className="h-4 w-4" /> Kirim Pesan WA Gateway Sekarang
            </Button>
          </form>

          {/* Section 2: Log Riwayat Pengiriman WA */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-foreground">📋 Log Riwayat Pengiriman Pesan (Real-time)</h3>
              <Button size="sm" variant="ghost" className="h-7 text-[11px]" onClick={() => setLogs(waGatewayService.getLogs())}>
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh Log
              </Button>
            </div>

            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg border border-border bg-card space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{log.recipientName} ({log.recipientPhone})</span>
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] font-mono">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> {log.status} • {log.sentAt}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground text-[11px] line-clamp-2">{log.messageText}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border">
          <Button size="sm" variant="outline" onClick={onClose}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
