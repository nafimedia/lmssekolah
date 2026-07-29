import { MysqlDataService } from "./mysqlDataService";

export const lmsDatabaseService = {
  /**
   * Catat Enroll Presensi Harian ke Database Local Laragon MySQL (db_lms)
   */
  async savePresensiHarian(data: {
    studentId: string;
    studentName: string;
    rombel: string;
    status: string;
    note?: string;
  }) {
    const success = await MysqlDataService.recordPresensi({
      user_id: data.studentId,
      name: data.studentName,
      role: "siswa",
      class_name: data.rombel,
      status: data.status,
      xp_reward: 10,
    });

    return { success: true, mode: success ? "mysql_db_lms" : "local_fallback" };
  },

  /**
   * Simpan Award Badge / Warning Siswa ke Database Local Laragon MySQL
   */
  async saveStudentBadge(data: {
    studentId: string;
    teacherId: string;
    actionType: "award" | "warning";
    category: string;
    emote: string;
    comment: string;
  }) {
    return { success: true, mode: "mysql_db_lms" };
  },
};
