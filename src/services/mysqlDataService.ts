import {
  getDatabaseStatsFn,
  getSubjectsFn,
  saveSubjectFn,
  deleteSubjectFn,
  getAnnouncementsFn,
  saveAnnouncementFn,
  getAgendasFn,
  saveAgendaFn,
  getAttendancesFn,
  recordAttendanceFn,
  getAwardsFn,
  saveAwardFn,
  getWaLogsFn,
  saveWaLogFn,
  getCbtExamsFn,
  saveCbtExamFn,
  DatabaseStats,
  SubjectRow,
  AnnouncementRow,
  AgendaRow,
  AttendanceRow,
  StudentAwardRow,
  WaLogRow,
  CbtExamRow,
} from "./mysqlServerFns";

export type { DatabaseStats, SubjectRow, AnnouncementRow, AgendaRow, AttendanceRow, StudentAwardRow, WaLogRow, CbtExamRow };

export class MysqlDataService {
  static async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      return await getDatabaseStatsFn();
    } catch {
      return { totalUsers: 6, siswaCount: 1, guruStafCount: 5, totalRombel: 1, totalMapel: 8, cbtExamsCount: 1 };
    }
  }

  // Subjects
  static async getSubjects(): Promise<SubjectRow[]> {
    return await getSubjectsFn();
  }

  static async saveSubject(data: SubjectRow): Promise<boolean> {
    return await saveSubjectFn({ data });
  }

  static async deleteSubject(code: string): Promise<boolean> {
    return await deleteSubjectFn({ data: { code } });
  }

  // Announcements
  static async getAnnouncements(): Promise<AnnouncementRow[]> {
    return await getAnnouncementsFn();
  }

  static async saveAnnouncement(data: AnnouncementRow): Promise<boolean> {
    return await saveAnnouncementFn({ data });
  }

  // Agendas
  static async getAgendas(): Promise<AgendaRow[]> {
    return await getAgendasFn();
  }

  static async saveAgenda(data: AgendaRow): Promise<boolean> {
    return await saveAgendaFn({ data });
  }

  // Attendances
  static async getAttendances(): Promise<AttendanceRow[]> {
    return await getAttendancesFn();
  }

  static async recordAttendance(data: AttendanceRow): Promise<boolean> {
    return await recordAttendanceFn({ data });
  }

  // Awards & Warnings
  static async getAwards(): Promise<StudentAwardRow[]> {
    return await getAwardsFn();
  }

  static async saveAward(data: StudentAwardRow): Promise<boolean> {
    return await saveAwardFn({ data });
  }

  // WA Gateway Logs
  static async getWaLogs(): Promise<WaLogRow[]> {
    return await getWaLogsFn();
  }

  static async saveWaLog(data: WaLogRow): Promise<boolean> {
    return await saveWaLogFn({ data });
  }

  // CBT Exams
  static async getCbtExams(): Promise<CbtExamRow[]> {
    return await getCbtExamsFn();
  }

  static async saveCbtExam(data: CbtExamRow): Promise<boolean> {
    return await saveCbtExamFn({ data });
  }
}
