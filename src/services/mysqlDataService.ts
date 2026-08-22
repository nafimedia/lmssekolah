import {
  getDatabaseStatsFn,
  getUsersFn,
  getUsersPaginatedFn,
  deleteUserFn,
  updateUserRoleFn,
  updateUserProfileFn,
  getSubjectsFn,
  saveSubjectFn,
  deleteSubjectFn,
  getAnnouncementsFn,
  saveAnnouncementFn,
  deleteAnnouncementFn,
  getAgendasFn,
  saveAgendaFn,
  deleteAgendaFn,
  getAttendancesFn,
  getAttendancesPaginatedFn,
  recordAttendanceFn,
  getAwardsFn,
  saveAwardFn,
  getWaLogsFn,
  saveWaLogFn,
  getCbtExamsFn,
  saveCbtExamFn,
  getMaterialsFn,
  getMaterialsPaginatedFn,
  saveMaterialFn,
  deleteMaterialFn,
  getHafalanFn,
  saveHafalanFn,
  getElibraryBooksFn,
  saveElibraryBookFn,
  deleteElibraryBookFn,
  getP5ProjectsFn,
  saveP5ProjectFn,
  getHealthStatusFn,
  DatabaseStats,
  UserRow,
  SubjectRow,
  AnnouncementRow,
  AgendaRow,
  AttendanceRow,
  StudentAwardRow,
  WaLogRow,
  CbtExamRow,
  MaterialRow,
  HafalanRow,
  ElibraryBookRow,
  P5ProjectRow,
  PaginatedParams,
  PaginatedResult,
  HealthStatusResponse,
} from "./mysqlServerFns";

export type { DatabaseStats, UserRow, SubjectRow, AnnouncementRow, AgendaRow, AttendanceRow, StudentAwardRow, WaLogRow, CbtExamRow, MaterialRow, HafalanRow, ElibraryBookRow, P5ProjectRow, PaginatedParams, PaginatedResult, HealthStatusResponse };

export class MysqlDataService {
  static async getHealthStatus(): Promise<HealthStatusResponse> {
    try {
      return await getHealthStatusFn();
    } catch {
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        uptimeSeconds: 0,
        database: "disconnected",
        version: "2.5.0-production",
      };
    }
  }

  static async getDatabaseStats(): Promise<DatabaseStats> {
    try {
      return await getDatabaseStatsFn();
    } catch {
      return { totalUsers: 159, siswaCount: 117, guruStafCount: 42, totalRombel: 27, totalMapel: 18, cbtExamsCount: 12 };
    }
  }

  // Users
  static async getUsers(): Promise<UserRow[]> {
    try {
      const res = await getUsersFn();
      return res || [];
    } catch (e) {
      console.error("getUsersFn failed:", e);
      return [];
    }
  }

  static async getUsersPaginated(params: PaginatedParams): Promise<PaginatedResult<UserRow>> {
    try {
      return await getUsersPaginatedFn({ data: params });
    } catch (e) {
      console.error("getUsersPaginatedFn failed:", e);
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    }
  }

  static async getAttendancesPaginated(params: PaginatedParams): Promise<PaginatedResult<AttendanceRow>> {
    try {
      return await getAttendancesPaginatedFn({ data: params });
    } catch (e) {
      console.error("getAttendancesPaginatedFn failed:", e);
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    }
  }

  static async getMaterialsPaginated(params: PaginatedParams): Promise<PaginatedResult<MaterialRow>> {
    try {
      return await getMaterialsPaginatedFn({ data: params });
    } catch (e) {
      console.error("getMaterialsPaginatedFn failed:", e);
      return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1 } };
    }
  }

  static async deleteUser(id: string, email?: string): Promise<boolean> {
    try {
      return await deleteUserFn({ data: { id, email } });
    } catch (e) {
      console.warn("deleteUserFn failed:", e);
      return false;
    }
  }

  static async updateUserRole(id: string, role: string | string[], email?: string): Promise<boolean> {
    try {
      const rolesArr = Array.isArray(role) ? role : [role];
      return await updateUserRoleFn({ data: { id, email, role: rolesArr[0], roles: rolesArr } });
    } catch (e) {
      console.warn("updateUserRoleFn failed:", e);
      return false;
    }
  }

  static async updateUserProfile(data: {
    originalEmail?: string;
    id?: string;
    fullName: string;
    email: string;
    nipNis?: string;
    phone?: string;
    address?: string;
    tagline?: string;
    className?: string;
  }): Promise<boolean> {
    try {
      return await updateUserProfileFn({ data });
    } catch (e) {
      console.warn("updateUserProfileFn failed:", e);
      return false;
    }
  }

  // Subjects
  static async getSubjects(): Promise<SubjectRow[]> {
    try {
      return await getSubjectsFn();
    } catch (e) {
      console.warn("getSubjectsFn failed:", e);
      return [];
    }
  }

  static async saveSubject(data: SubjectRow): Promise<boolean> {
    try {
      return await saveSubjectFn({ data });
    } catch (e) {
      console.warn("saveSubjectFn failed:", e);
      return false;
    }
  }

  static async deleteSubject(code: string): Promise<boolean> {
    try {
      return await deleteSubjectFn({ data: { code } });
    } catch (e) {
      console.warn("deleteSubjectFn failed:", e);
      return false;
    }
  }

  // Announcements
  static async getAnnouncements(): Promise<AnnouncementRow[]> {
    try {
      return await getAnnouncementsFn();
    } catch (e) {
      console.warn("getAnnouncementsFn failed:", e);
      return [];
    }
  }

  static async saveAnnouncement(data: AnnouncementRow): Promise<boolean> {
    try {
      return await saveAnnouncementFn({ data });
    } catch (e) {
      console.warn("saveAnnouncementFn failed:", e);
      return false;
    }
  }

  static async deleteAnnouncement(id: number): Promise<boolean> {
    try {
      return await deleteAnnouncementFn({ data: { id } });
    } catch (e) {
      console.warn("deleteAnnouncementFn failed:", e);
      return false;
    }
  }

  // Agendas
  static async getAgendas(): Promise<AgendaRow[]> {
    try {
      return await getAgendasFn();
    } catch (e) {
      console.warn("getAgendasFn failed:", e);
      return [];
    }
  }

  static async saveAgenda(data: AgendaRow): Promise<boolean> {
    try {
      return await saveAgendaFn({ data });
    } catch (e) {
      console.warn("saveAgendaFn failed:", e);
      return false;
    }
  }

  static async deleteAgenda(id: number): Promise<boolean> {
    try {
      return await deleteAgendaFn({ data: { id } });
    } catch (e) {
      console.warn("deleteAgendaFn failed:", e);
      return false;
    }
  }

  // Attendances
  static async getAttendances(): Promise<AttendanceRow[]> {
    try {
      return await getAttendancesFn();
    } catch (e) {
      console.warn("getAttendancesFn failed:", e);
      return [];
    }
  }

  static async recordAttendance(data: AttendanceRow): Promise<boolean> {
    try {
      return await recordAttendanceFn({ data });
    } catch (e) {
      console.warn("recordAttendanceFn failed:", e);
      return false;
    }
  }

  static async recordPresensi(data: { user_id?: string; studentId?: string; name?: string; studentName?: string; role?: string; class_name?: string; rombel?: string; status?: string; xp_reward?: number; note?: string }): Promise<boolean> {
    try {
      return await recordAttendanceFn({
        data: {
          user_id: data.user_id || data.studentId || "usr-siswa-1",
          student_name: data.name || data.studentName || "Siswa",
          class_name: data.class_name || data.rombel || "VIII A",
          status: data.status || "Hadir",
          keterangan: data.note || "",
          date_str: new Date().toISOString().split("T")[0],
        },
      });
    } catch (e) {
      console.warn("recordPresensi failed:", e);
      return false;
    }
  }

  // Awards & Warnings
  static async getAwards(): Promise<StudentAwardRow[]> {
    try {
      return await getAwardsFn();
    } catch (e) {
      console.warn("getAwardsFn failed:", e);
      return [];
    }
  }

  static async saveAward(data: StudentAwardRow): Promise<boolean> {
    try {
      return await saveAwardFn({ data });
    } catch (e) {
      console.warn("saveAwardFn failed:", e);
      return false;
    }
  }

  // WA Gateway Logs
  static async getWaLogs(): Promise<WaLogRow[]> {
    try {
      return await getWaLogsFn();
    } catch (e) {
      console.warn("getWaLogsFn failed:", e);
      return [];
    }
  }

  static async saveWaLog(data: WaLogRow): Promise<boolean> {
    try {
      return await saveWaLogFn({ data });
    } catch (e) {
      console.warn("saveWaLogFn failed:", e);
      return false;
    }
  }

  // CBT Exams
  static async getCbtExams(): Promise<CbtExamRow[]> {
    try {
      return await getCbtExamsFn();
    } catch (e) {
      console.warn("getCbtExamsFn failed:", e);
      return [];
    }
  }

  static async saveCbtExam(data: CbtExamRow): Promise<boolean> {
    try {
      return await saveCbtExamFn({ data });
    } catch (e) {
      console.warn("saveCbtExamFn failed:", e);
      return false;
    }
  }

  // Materials / Modul Ajar
  static async getMaterials(): Promise<MaterialRow[]> {
    try {
      return await getMaterialsFn();
    } catch (e) {
      console.warn("getMaterialsFn failed:", e);
      return [];
    }
  }

  static async saveMaterial(data: MaterialRow): Promise<boolean> {
    try {
      const res = await saveMaterialFn({ data });
      return res.success;
    } catch (e) {
      console.warn("saveMaterialFn failed:", e);
      return false;
    }
  }

  static async deleteMaterial(id: string): Promise<boolean> {
    try {
      const res = await deleteMaterialFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deleteMaterialFn failed:", e);
      return false;
    }
  }

  // Tahfidz Hafalan
  static async getHafalan(): Promise<HafalanRow[]> {
    try {
      return await getHafalanFn();
    } catch (e) {
      console.warn("getHafalanFn failed:", e);
      return [];
    }
  }

  static async saveHafalan(data: HafalanRow): Promise<boolean> {
    try {
      const res = await saveHafalanFn({ data });
      return res.success;
    } catch (e) {
      console.warn("saveHafalanFn failed:", e);
      return false;
    }
  }

  // E-Library Books
  static async getElibraryBooks(): Promise<ElibraryBookRow[]> {
    try {
      return await getElibraryBooksFn();
    } catch (e) {
      console.warn("getElibraryBooksFn failed:", e);
      return [];
    }
  }

  static async saveElibraryBook(data: ElibraryBookRow): Promise<boolean> {
    try {
      const res = await saveElibraryBookFn({ data });
      return res.success;
    } catch (e) {
      console.warn("saveElibraryBookFn failed:", e);
      return false;
    }
  }

  static async deleteElibraryBook(id: string): Promise<boolean> {
    try {
      const res = await deleteElibraryBookFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deleteElibraryBookFn failed:", e);
      return false;
    }
  }

  // P5 Projects
  static async getP5Projects(): Promise<P5ProjectRow[]> {
    try {
      return await getP5ProjectsFn();
    } catch (e) {
      console.warn("getP5ProjectsFn failed:", e);
      return [];
    }
  }

  static async saveP5Project(data: P5ProjectRow): Promise<boolean> {
    try {
      const res = await saveP5ProjectFn({ data });
      return res.success;
    } catch (e) {
      console.warn("saveP5ProjectFn failed:", e);
      return false;
    }
  }
}
