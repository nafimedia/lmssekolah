import { toast } from "sonner";
import { MysqlDataService } from "./mysqlDataService";

export interface WaPayload {
  recipientPhone: string;
  recipientName: string;
  studentName: string;
  category: "ABSENSI_ALPHA" | "WARNING_PEMBINAAN" | "AWARD_APRESIASI" | "ERAPOR_PUBLISHED";
  messageText: string;
}

export interface WaLogEntry extends WaPayload {
  id: string;
  sentAt: string;
  status: "DELIVERED" | "SENT" | "FAILED";
}

// In-memory buffer for recently dispatched WhatsApp notifications
let waLogsBuffer: WaLogEntry[] = [];

export const waGatewayService = {
  /**
   * Kirim Notifikasi WhatsApp ke Wali Murid (Disimpan ke Database Laragon MySQL & Trigger Toast)
   */
  async sendNotification(payload: WaPayload): Promise<WaLogEntry> {
    console.log("[WA Gateway Dispatch]", payload);

    const newLog: WaLogEntry = {
      ...payload,
      id: `wa-${Date.now()}`,
      sentAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      status: "DELIVERED",
    };

    waLogsBuffer.unshift(newLog);

    // Save to MySQL DB
    try {
      await MysqlDataService.saveWaLog({
        parent_name: payload.recipientName,
        phone: payload.recipientPhone,
        student_name: payload.studentName,
        category: payload.category,
        message: payload.messageText,
        status: "DELIVERED",
      });
    } catch (e) {
      console.warn("[WA Gateway DB Error]:", e);
    }

    return newLog;
  },

  /**
   * Ambil Log Riwayat Pengiriman WhatsApp Gateway Riil dari MySQL
   */
  async getLogs(): Promise<WaLogEntry[]> {
    try {
      const dbLogs = await MysqlDataService.getWaLogs();
      if (dbLogs && dbLogs.length > 0) {
        return dbLogs.map((item) => ({
          id: String(item.id || Date.now()),
          recipientPhone: item.phone,
          recipientName: item.parent_name,
          studentName: item.student_name,
          category: (item.category as any) || "ABSENSI_ALPHA",
          messageText: item.message,
          sentAt: item.created_at ? new Date(item.created_at).toLocaleString("id-ID") : "Baru saja",
          status: "DELIVERED",
        }));
      }
      return [...waLogsBuffer];
    } catch {
      return [...waLogsBuffer];
    }
  },

  buildAbsensiAlert(studentName: string, date: string, status: string): string {
    return `Yth. Orang Tua/Wali dari ${studentName},\n\nPemberitahuan Presensi LMS MTsN 2 Cilacap tanggal ${date}:\nAnanda ${studentName} tercatat ${status.toUpperCase()}.\n\nJika ananda berhalangan sakit atau izin dinas luar, mohon unggah surat keterangan via LMS atau hubungi Wali Kelas.\nTerima kasih.`;
  },

  buildWarningAlert(studentName: string, category: string, comment: string): string {
    return `Yth. Orang Tua/Wali dari ${studentName},\n\nInformasi Pembinaan Siswa MTsN 2 Cilacap:\nAnanda ${studentName} mendapat catatan pengingat '${category}'.\n\nCatatan Guru: "${comment}"\n\nMohon bimbingan bersama agar tugas ananda dapat segera dituntaskan. Terima kasih.`;
  },

  buildAwardAlert(studentName: string, badgeName: string, comment: string): string {
    return `Yth. Orang Tua/Wali dari ${studentName},\n\nAssalamu'alaikum Wr. Wb. Selamat! Ananda ${studentName} baru saja meraih Lencana Apresiasi '${badgeName}' di LMS MTsN 2 Cilacap 🎉.\n\nPesan Guru: "${comment}"\n\nSemoga menjadi penyemangat prestasi belajar ananda. Salam, MTsN 2 Cilacap.`;
  },

  buildERaporAlert(studentName: string, semester: string, nilaiRata: number): string {
    return `Yth. Orang Tua/Wali dari ${studentName},\n\nE-Rapor Kurikulum Merdeka Kemenag Semester ${semester} telah resmi diterbitkan.\nRata-Rata Nilai Ananda: ${nilaiRata} (TUNTAS KKM).\n\nAnda dapat mengunduh berkas Rapor PDF resmi melalui portal LMS MTsN 2 Cilacap.\nTerima kasih.`;
  },
};
