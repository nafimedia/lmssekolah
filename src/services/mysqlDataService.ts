import {
  getDatabaseStatsFn,
  getUsersFn,
  getUsersPaginatedFn,
  deleteUserFn,
  updateUserRoleFn,
  updateUserProfileFn,
  updateStudentParentContactFn,
  getSubjectsFn,
  saveSubjectFn,
  deleteSubjectFn,
  getPengampuFn,
  savePengampuFn,
  deletePengampuFn,
  getRuangFn,
  saveRuangFn,
  deleteRuangFn,
  getJadwalFn,
  saveJadwalFn,
  deleteJadwalFn,
  getAnnouncementsFn,
  saveAnnouncementFn,
  deleteAnnouncementFn,
  getAgendasFn,
  saveAgendaFn,
  deleteAgendaFn,
  getCalendarSettingsFn,
  saveCalendarSettingFn,
  getAttendancesFn,
  getAttendancesPaginatedFn,
  recordAttendanceFn,
  getAwardsFn,
  saveAwardFn,
  getWaLogsFn,
  saveWaLogFn,
  getCbtExamsFn,
  saveCbtExamFn,
  deleteCbtExamFn,
  getCbtQuestionsFn,
  saveCbtQuestionFn,
  deleteCbtQuestionFn,
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
  getP5SubmissionsFn,
  saveP5SubmissionFn,
  getJournalsFn,
  saveJournalFn,
  deleteJournalFn,
  getCbtResultsFn,
  saveCbtResultFn,
  deleteCbtResultFn,
  gradeCbtEssayFn,
  uploadCbtImageFn,
  getKktpConfigFn,
  saveKktpConfigFn,
  getAssignmentsFn,
  saveAssignmentFn,
  deleteAssignmentFn,
  getSubmissionsFn,
  saveSubmissionFn,
  deleteSubmissionFileFn,
  getElibraryLoansFn,
  saveElibraryLoanFn,
  updateElibraryLoanStatusFn,
  getGtkLeavesFn,
  saveGtkLeaveFn,
  getGtkDocumentsFn,
  saveGtkDocumentFn,
  getMasterRombelsFn,
  saveMasterRombelFn,
  deleteMasterRombelFn,
  getUserAchievementsFn,
  saveUserAchievementFn,
  getActiveKbmSessionsFn,
  saveActiveKbmSessionFn,
  getJadwalPelajaranFn,
  getKbmPresensiFn,
  saveKbmPresensiBatchFn,
  getDailyPresensiRombelFn,
  saveDailyPresensiRombelBatchFn,
  getStudentKbmNotesFn,
  saveStudentKbmNoteFn,
  deleteStudentKbmNoteFn,
  getLkpdActivitiesFn,
  saveLkpdActivityFn,
  deleteLkpdActivityFn,
  getLkpdGradesFn,
  getAllLkpdGradesFn,
  saveLkpdGradesBatchFn,
  getLkpdDiscussionsFn,
  postLkpdDiscussionFn,
  LkpdDiscussionRow,
  getPeerAssessmentsFn,
  savePeerAssessmentFn,
  PeerAssessmentRow,
  getWaGatewayConfigFn,
  saveWaGatewayConfigFn,
  sendTestWaMessageFn,
  getAuditLogsServerFn,
  exportDatabaseBackupFn,
  restoreDatabaseBackupFn,
  getKamadExecutiveMetricsFn,
  uploadUserAvatarFn,
  removeUserAvatarFn,
  KamadExecutiveMetrics,
  AuditLogItem,
  WaGatewayConfigRow,
  getHealthStatusFn,
  DatabaseStats,
  UserRow,
  SubjectRow,
  PengampuRow,
  RuangRow,
  JadwalRow,
  JournalRow,
  CbtResultRow,
  KktpConfigRow,
  AssignmentRow,
  SubmissionRow,
  ElibraryLoanRow,
  GtkLeaveRow,
  GtkDocumentRow,
  MasterRombelRow,
  UserAchievementRow,
  AnnouncementRow,
  AgendaRow,
  AttendanceRow,
  JurnalMengajarRow,
  KbmPresensiRow,
  StudentKbmNoteRow,
  LkpdActivityRow,
  LkpdGradeRow,
  StudentAwardRow,
  WaLogRow,
  CbtExamRow,
  CbtQuestionDbRow,
  MaterialRow,
  HafalanRow,
  ElibraryBookRow,
  P5ProjectRow,
  P5SubmissionRow,
  PaginatedParams,
  PaginatedResult,
  HealthStatusResponse,
} from "./mysqlServerFns";

export type {
  DatabaseStats,
  UserRow,
  SubjectRow,
  PengampuRow,
  RuangRow,
  JadwalRow,
  JournalRow,
  CbtResultRow,
  KktpConfigRow,
  AssignmentRow,
  SubmissionRow,
  ElibraryLoanRow,
  GtkLeaveRow,
  GtkDocumentRow,
  MasterRombelRow,
  UserAchievementRow,
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
  PeerAssessmentRow,
};

import { getPersistedUserProfileOverrides } from "./mysqlAuthService";

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
      return { totalUsers: 0, siswaCount: 0, guruStafCount: 0, totalRombel: 0, totalMapel: 0, cbtExamsCount: 0 };
    }
  }

  // Users
  static async getUsers(): Promise<UserRow[]> {
    try {
      const rawRes = (await getUsersFn()) || [];
      const overrides = getPersistedUserProfileOverrides();

      const res = rawRes.map((u) => {
        const ov = overrides[u.id] || overrides[u.email];
        if (ov) {
          return {
            ...u,
            full_name: ov.full_name || u.full_name,
            nis_nip: ov.nis_nip || u.nis_nip,
            class_name: ov.class_name || u.class_name,
          };
        }
        return u;
      });

      // Helper function to normalize teacher names for deduplication
      const normalizeName = (n: string) =>
        n
          .toLowerCase()
          .replace(/^(drs\.|dr\.|h\.|hj\.|hjh\.|dra\.)\s+/gi, "")
          .replace(/,\s*(s\.pd|m\.pd|m\.si|m\.ag|s\.ag|m\.pd\.i|s\.p|s\.pd\.i)\.?$/gi, "")
          .replace(/[^a-z0-9]/gi, "")
          .trim();

      // Deduplicate accounts by NIP or normalized full_name to prevent double entries (e.g., alias demo vs real NIP)
      const uniqueMap = new Map<string, UserRow>();
      res.forEach((u) => {
        const isSiswa = u.role === "siswa";
        const nameKey = normalizeName(u.full_name || "");
        const nipKey = (u.nis_nip && u.nis_nip !== "-" && u.nis_nip.length >= 10) ? u.nis_nip : "";

        let key = u.id || u.email;
        if (isSiswa) {
          key = nipKey || u.email || u.id;
        } else {
          key = nameKey || nipKey || u.email || u.id;
        }

        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, u);
        } else {
          const existing = uniqueMap.get(key)!;
          if ((!existing.subject_specialty && u.subject_specialty) || (existing.nis_nip?.length !== 18 && u.nis_nip?.length === 18)) {
            uniqueMap.set(key, u);
          }
        }
      });
      const deduplicatedRes = Array.from(uniqueMap.values());

      if (Object.keys(overrides).length === 0) return deduplicatedRes;

      return deduplicatedRes.map((u) => {
        const cleanEmail = (u.email || "").toLowerCase().trim();
        const cleanId = String(u.id || "").trim();
        const override = overrides[cleanEmail] || overrides[cleanId];
        if (override) {
          return {
            ...u,
            email: override.email || u.email,
            full_name: override.full_name || u.full_name,
            nis_nip: override.nis_nip || u.nis_nip,
            class_name: override.class_name || u.class_name,
          };
        }
        return u;
      });
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

  static async updateUserRole(id: string, role: string | string[], email?: string, nis_nip?: string): Promise<boolean> {
    try {
      const rolesArr = Array.isArray(role) ? role : [role];
      return await updateUserRoleFn({ data: { id, email, nis_nip, role: rolesArr[0], roles: rolesArr } });
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

  static async uploadUserAvatar(userId: string, dataUrl: string): Promise<{ success: boolean; avatarUrl: string }> {
    try {
      return await uploadUserAvatarFn({ data: { userId, dataUrl } });
    } catch (e) {
      console.warn("uploadUserAvatarFn failed:", e);
      return { success: false, avatarUrl: "" };
    }
  }

  static async removeUserAvatar(userId: string): Promise<boolean> {
    try {
      const res = await removeUserAvatarFn({ data: { userId } });
      return res.success;
    } catch (e) {
      console.warn("removeUserAvatarFn failed:", e);
      return false;
    }
  }

  static async updateStudentParentContact(data: {
    studentId: string;
    parentName?: string;
    parentWa?: string;
  }): Promise<boolean> {
    try {
      return await updateStudentParentContactFn({ data });
    } catch (e) {
      console.warn("updateStudentParentContactFn failed:", e);
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

  // Matriks Pengampu
  static async getPengampuList(): Promise<PengampuRow[]> {
    try {
      return await getPengampuFn();
    } catch (e) {
      console.warn("getPengampuFn failed:", e);
      return [];
    }
  }

  static async savePengampu(data: PengampuRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await savePengampuFn({ data });
    } catch (e) {
      console.warn("savePengampuFn failed:", e);
      return { success: false };
    }
  }

  static async deletePengampu(id: string): Promise<boolean> {
    try {
      const res = await deletePengampuFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deletePengampuFn failed:", e);
      return false;
    }
  }

  // Master Sarana & Ruang Kelas
  static async getRuangList(): Promise<RuangRow[]> {
    try {
      return await getRuangFn();
    } catch (e) {
      console.warn("getRuangFn failed:", e);
      return [];
    }
  }

  static async saveRuang(data: RuangRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveRuangFn({ data });
    } catch (e) {
      console.warn("saveRuangFn failed:", e);
      return { success: false };
    }
  }

  static async deleteRuang(id: string): Promise<boolean> {
    try {
      const res = await deleteRuangFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deleteRuangFn failed:", e);
      return false;
    }
  }

  // Jadwal Pelajaran KBM
  static async getJadwalList(): Promise<JadwalRow[]> {
    try {
      return await getJadwalFn();
    } catch (e) {
      console.warn("getJadwalFn failed:", e);
      return [];
    }
  }

  static async saveJadwal(data: JadwalRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveJadwalFn({ data });
    } catch (e) {
      console.warn("saveJadwalFn failed:", e);
      return { success: false };
    }
  }

  static async deleteJadwal(id: string): Promise<boolean> {
    try {
      const res = await deleteJadwalFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deleteJadwalFn failed:", e);
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

  // Calendar Settings
  static async getCalendarSettings(): Promise<Record<string, string>> {
    try {
      return await getCalendarSettingsFn();
    } catch (e) {
      console.warn("getCalendarSettingsFn failed:", e);
      return {};
    }
  }

  static async saveCalendarSetting(key: string, value: string): Promise<boolean> {
    try {
      return await saveCalendarSettingFn({ data: { key, value } });
    } catch (e) {
      console.warn("saveCalendarSettingFn failed:", e);
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

  static async saveCbtExam(data: CbtExamRow): Promise<{ success: boolean; id?: number }> {
    try {
      return await saveCbtExamFn({ data });
    } catch (e) {
      console.warn("saveCbtExamFn failed:", e);
      return { success: false };
    }
  }

  static async deleteCbtExam(id: number | string): Promise<boolean> {
    try {
      const res = await deleteCbtExamFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deleteCbtExamFn failed:", e);
      return false;
    }
  }

  // CBT Questions
  static async getCbtQuestions(): Promise<CbtQuestionDbRow[]> {
    try {
      return await getCbtQuestionsFn();
    } catch (e) {
      console.warn("getCbtQuestionsFn failed:", e);
      return [];
    }
  }

  static async saveCbtQuestion(data: CbtQuestionDbRow): Promise<{ success: boolean; id?: number | string }> {
    try {
      return await saveCbtQuestionFn({ data });
    } catch (e) {
      console.warn("saveCbtQuestionFn failed:", e);
      return { success: false };
    }
  }

  static async deleteCbtQuestion(id: number | string): Promise<boolean> {
    try {
      const res = await deleteCbtQuestionFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deleteCbtQuestionFn failed:", e);
      return false;
    }
  }

  static async uploadCbtImage(filename: string, dataUrl: string): Promise<{ success: boolean; imageUrl: string }> {
    try {
      return await uploadCbtImageFn({ data: { filename, dataUrl } });
    } catch (e) {
      console.warn("uploadCbtImageFn failed:", e);
      return { success: false, imageUrl: "" };
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

  // P5 Student Submissions
  static async getP5Submissions(params?: { student_id?: string; rombel?: string }): Promise<P5SubmissionRow[]> {
    try {
      return await getP5SubmissionsFn({ data: params || {} });
    } catch (e) {
      console.warn("getP5SubmissionsFn failed:", e);
      return [];
    }
  }

  static async saveP5Submission(data: P5SubmissionRow): Promise<{ success: boolean; id?: number }> {
    try {
      return await saveP5SubmissionFn({ data });
    } catch (e) {
      console.warn("saveP5SubmissionFn failed:", e);
      return { success: false };
    }
  }

  // Teacher Journals
  static async getJournals(): Promise<JournalRow[]> {
    try {
      const rows = await getJournalsFn();
      return (rows || []).map((r) => ({
        id: r.id,
        guru_name: r.guru_name,
        mapel: r.mapel,
        rombel: r.rombel,
        tanggal: r.tanggal,
        jam_ke: r.jam_ke || "07.30",
        materi: r.materi,
        catatan: r.catatan || "",
      }));
    } catch (e) {
      console.warn("getJournalsFn failed:", e);
      return [];
    }
  }

  static async saveJournal(data: JournalRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveJournalFn({
        data: {
          ...data,
          tujuan_pembelajaran: "",
          kegiatan: "",
          catatan: data.catatan || "",
          kendala: "",
          tindak_lanjut: "",
        },
      });
    } catch (e) {
      console.warn("saveJournalFn failed:", e);
      return { success: false };
    }
  }

  static async deleteJournal(id: string | number): Promise<boolean> {
    try {
      const res = await deleteJournalFn({ data: { id: String(id) } });
      return res.success;
    } catch (e) {
      console.warn("deleteJournalFn failed:", e);
      return false;
    }
  }

  // Active KBM Sessions
  static async getActiveKbmSessions(): Promise<any[]> {
    try {
      return await getActiveKbmSessionsFn();
    } catch (e) {
      console.warn("getActiveKbmSessionsFn failed:", e);
      return [];
    }
  }

  static async saveActiveKbmSession(data: { id: string; rombel: string; mapel: string; guru_name: string; status: string; date_str: string }): Promise<boolean> {
    try {
      const res = await saveActiveKbmSessionFn({ data });
      return res.success;
    } catch (e) {
      console.warn("saveActiveKbmSessionFn failed:", e);
      return false;
    }
  }

  static async getJadwalPelajaran(): Promise<any[]> {
    try {
      return await getJadwalPelajaranFn();
    } catch (e) {
      console.warn("getJadwalPelajaranFn failed:", e);
      return [];
    }
  }

  // CBT Exam Results
  static async getCbtResults(): Promise<CbtResultRow[]> {
    try {
      return await getCbtResultsFn();
    } catch (e) {
      console.warn("getCbtResultsFn failed:", e);
      return [];
    }
  }

  static async saveCbtResult(data: CbtResultRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveCbtResultFn({ data });
    } catch (e) {
      console.warn("saveCbtResultFn failed:", e);
      return { success: false };
    }
  }

  static async deleteCbtResult(id: string | number): Promise<boolean> {
    try {
      const res = await deleteCbtResultFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deleteCbtResultFn failed:", e);
      return false;
    }
  }

  static async gradeCbtEssay(data: {
    result_id: string | number;
    essay_score: number;
    total_score: number;
    status: string;
    student_answers: string;
  }): Promise<boolean> {
    try {
      const res = await gradeCbtEssayFn({ data });
      return res.success;
    } catch (e) {
      console.warn("gradeCbtEssayFn failed:", e);
      return false;
    }
  }

  // Master KKTP Config
  static async getKktpConfig(): Promise<KktpConfigRow> {
    try {
      return await getKktpConfigFn();
    } catch (e) {
      console.warn("getKktpConfigFn failed:", e);
      return { kktp_minimal: 75, bobot_formatif: 40, bobot_sumatif: 60, rentang_a: 90, rentang_b: 80, rentang_c: 75, updated_by: "Default" };
    }
  }

  static async saveKktpConfig(data: KktpConfigRow): Promise<boolean> {
    try {
      const res = await saveKktpConfigFn({ data });
      return res.success;
    } catch (e) {
      console.warn("saveKktpConfigFn failed:", e);
      return false;
    }
  }

  // Student Assignments & Submissions
  static async getAssignments(): Promise<AssignmentRow[]> {
    try {
      return await getAssignmentsFn();
    } catch (e) {
      console.warn("getAssignmentsFn failed:", e);
      return [];
    }
  }

  static async saveAssignment(data: AssignmentRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveAssignmentFn({ data });
    } catch (e) {
      console.warn("saveAssignmentFn failed:", e);
      return { success: false };
    }
  }

  static async deleteAssignment(id: string | number): Promise<boolean> {
    try {
      const res = await deleteAssignmentFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deleteAssignmentFn failed:", e);
      return false;
    }
  }

  static async getSubmissions(): Promise<SubmissionRow[]> {
    try {
      return await getSubmissionsFn();
    } catch (e) {
      console.warn("getSubmissionsFn failed:", e);
      return [];
    }
  }

  static async saveSubmission(data: SubmissionRow): Promise<{ success: boolean; id?: string; file_url?: string }> {
    try {
      return await saveSubmissionFn({ data });
    } catch (e) {
      console.warn("saveSubmissionFn failed:", e);
      return { success: false };
    }
  }

  static async deleteSubmissionFile(data: { assignment_id: string; user_id: string; student_name: string }): Promise<{ success: boolean }> {
    try {
      return await deleteSubmissionFileFn({ data });
    } catch (e) {
      console.warn("deleteSubmissionFileFn failed:", e);
      return { success: false };
    }
  }

  // Elibrary Loans
  static async getElibraryLoans(): Promise<ElibraryLoanRow[]> {
    try {
      return await getElibraryLoansFn();
    } catch (e) {
      console.warn("getElibraryLoansFn failed:", e);
      return [];
    }
  }

  static async saveElibraryLoan(data: ElibraryLoanRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveElibraryLoanFn({ data });
    } catch (e) {
      console.warn("saveElibraryLoanFn failed:", e);
      return { success: false };
    }
  }

  static async updateElibraryLoanStatus(id: string | number, status: string, return_date?: string): Promise<boolean> {
    try {
      const res = await updateElibraryLoanStatusFn({ data: { id, status, return_date } });
      return res.success;
    } catch (e) {
      console.warn("updateElibraryLoanStatusFn failed:", e);
      return false;
    }
  }

  // GTK Leaves & Documents
  static async getGtkLeaves(): Promise<GtkLeaveRow[]> {
    try {
      return await getGtkLeavesFn();
    } catch (e) {
      console.warn("getGtkLeavesFn failed:", e);
      return [];
    }
  }

  static async saveGtkLeave(data: GtkLeaveRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveGtkLeaveFn({ data });
    } catch (e) {
      console.warn("saveGtkLeaveFn failed:", e);
      return { success: false };
    }
  }

  static async getGtkDocuments(): Promise<GtkDocumentRow[]> {
    try {
      return await getGtkDocumentsFn();
    } catch (e) {
      console.warn("getGtkDocumentsFn failed:", e);
      return [];
    }
  }

  static async saveGtkDocument(data: GtkDocumentRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveGtkDocumentFn({ data });
    } catch (e) {
      console.warn("saveGtkDocumentFn failed:", e);
      return { success: false };
    }
  }

  // Master Rombels
  static async getMasterRombels(): Promise<MasterRombelRow[]> {
    try {
      return await getMasterRombelsFn();
    } catch (e) {
      console.warn("getMasterRombelsFn failed:", e);
      return [];
    }
  }

  static async saveMasterRombel(data: MasterRombelRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveMasterRombelFn({ data });
    } catch (e) {
      console.warn("saveMasterRombelFn failed:", e);
      return { success: false };
    }
  }

  static async deleteMasterRombel(code: string): Promise<boolean> {
    try {
      const res = await deleteMasterRombelFn({ data: { code } });
      return res.success;
    } catch (e) {
      console.warn("deleteMasterRombelFn failed:", e);
      return false;
    }
  }

  // User Achievements
  static async getUserAchievements(): Promise<UserAchievementRow[]> {
    try {
      return await getUserAchievementsFn();
    } catch (e) {
      console.warn("getUserAchievementsFn failed:", e);
      return [];
    }
  }

  static async saveUserAchievement(data: UserAchievementRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveUserAchievementFn({ data });
    } catch (e) {
      console.warn("saveUserAchievementFn failed:", e);
      return { success: false };
    }
  }

  // Ruang Mengajar Hub Live CRUD
  static async getKbmPresensi(rombel: string, mapel: string, date_str: string): Promise<KbmPresensiRow[]> {
    try {
      return await getKbmPresensiFn({ data: { rombel, mapel, date_str } });
    } catch (e) {
      console.warn("getKbmPresensiFn failed:", e);
      return [];
    }
  }

  static async saveKbmPresensiBatch(rombel: string, mapel: string, date_str: string, records: any[]): Promise<boolean> {
    try {
      const res = await saveKbmPresensiBatchFn({ data: { rombel, mapel, date_str, records } });
      return res.success;
    } catch (e) {
      console.warn("saveKbmPresensiBatchFn failed:", e);
      return false;
    }
  }

  // Presensi Harian Rombel Binaan Wali Kelas
  static async getDailyPresensiRombel(rombel: string, date_str?: string): Promise<any[]> {
    try {
      return await getDailyPresensiRombelFn({ data: { rombel, date_str } });
    } catch (e) {
      console.warn("getDailyPresensiRombelFn failed:", e);
      return [];
    }
  }

  static async saveDailyPresensiRombelBatch(rombel: string, wali_kelas: string, date_str: string, records: any[]): Promise<boolean> {
    try {
      const res = await saveDailyPresensiRombelBatchFn({ data: { rombel, wali_kelas, date_str, records } });
      return res.success;
    } catch (e) {
      console.warn("saveDailyPresensiRombelBatchFn failed:", e);
      return false;
    }
  }

  static async getStudentKbmNotes(rombel: string, mapel: string): Promise<StudentKbmNoteRow[]> {
    try {
      return await getStudentKbmNotesFn({ data: { rombel, mapel } });
    } catch (e) {
      console.warn("getStudentKbmNotesFn failed:", e);
      return [];
    }
  }

  static async saveStudentKbmNote(data: StudentKbmNoteRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveStudentKbmNoteFn({ data });
    } catch (e) {
      console.warn("saveStudentKbmNoteFn failed:", e);
      return { success: false };
    }
  }

  static async deleteStudentKbmNote(id: string): Promise<boolean> {
    try {
      const res = await deleteStudentKbmNoteFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deleteStudentKbmNoteFn failed:", e);
      return false;
    }
  }

  // LKPD & Digital Activities
  static async getLkpdActivities(rombel: string, mapel: string): Promise<LkpdActivityRow[]> {
    try {
      return await getLkpdActivitiesFn({ data: { rombel, mapel } });
    } catch (e) {
      console.warn("getLkpdActivitiesFn failed:", e);
      return [];
    }
  }

  static async saveLkpdActivity(data: LkpdActivityRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await saveLkpdActivityFn({ data });
    } catch (e) {
      console.warn("saveLkpdActivityFn failed:", e);
      return { success: false };
    }
  }

  static async deleteLkpdActivity(id: string | number): Promise<boolean> {
    try {
      const res = await deleteLkpdActivityFn({ data: { id } });
      return res.success;
    } catch (e) {
      console.warn("deleteLkpdActivityFn failed:", e);
      return false;
    }
  }

  static async getLkpdGrades(activityId: string): Promise<LkpdGradeRow[]> {
    try {
      return await getLkpdGradesFn({ data: { activity_id: activityId } });
    } catch (e) {
      console.warn("getLkpdGradesFn failed:", e);
      return [];
    }
  }

  static async getAllLkpdGrades(): Promise<LkpdGradeRow[]> {
    try {
      return await getAllLkpdGradesFn();
    } catch (e) {
      console.warn("getAllLkpdGradesFn failed:", e);
      return [];
    }
  }

  static async saveLkpdGradesBatch(activityId: string, grades: LkpdGradeRow[]): Promise<boolean> {
    try {
      const res = await saveLkpdGradesBatchFn({ data: { activity_id: activityId, grades } });
      return res.success;
    } catch (e) {
      console.warn("saveLkpdGradesBatchFn failed:", e);
      return false;
    }
  }

  static async getLkpdDiscussions(activityId: string): Promise<LkpdDiscussionRow[]> {
    try {
      return await getLkpdDiscussionsFn({ data: { activity_id: activityId } });
    } catch (e) {
      console.warn("getLkpdDiscussionsFn failed:", e);
      return [];
    }
  }

  static async postLkpdDiscussion(data: { activity_id: string; user_name: string; user_role: string; message: string }): Promise<{ success: boolean; id?: string }> {
    try {
      return await postLkpdDiscussionFn({ data });
    } catch (e) {
      console.warn("postLkpdDiscussionFn failed:", e);
      return { success: false };
    }
  }

  static async getPeerAssessments(activityId: string): Promise<PeerAssessmentRow[]> {
    try {
      return await getPeerAssessmentsFn({ data: { activity_id: activityId } });
    } catch (e) {
      console.warn("getPeerAssessmentsFn failed:", e);
      return [];
    }
  }

  static async savePeerAssessment(data: PeerAssessmentRow): Promise<{ success: boolean; id?: string }> {
    try {
      return await savePeerAssessmentFn({ data });
    } catch (e) {
      console.warn("savePeerAssessmentFn failed:", e);
      return { success: false };
    }
  }

  // WA Gateway System Config & Test Message
  static async getWaGatewayConfig(): Promise<WaGatewayConfigRow> {
    try {
      return await getWaGatewayConfigFn();
    } catch (e) {
      console.warn("getWaGatewayConfigFn failed:", e);
      return {
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
      };
    }
  }

  static async saveWaGatewayConfig(config: WaGatewayConfigRow): Promise<boolean> {
    try {
      const res = await saveWaGatewayConfigFn({ data: { config } });
      return res.success;
    } catch (e) {
      console.warn("saveWaGatewayConfigFn failed:", e);
      return false;
    }
  }

  static async sendTestWaMessage(target: string, message: string, config?: WaGatewayConfigRow): Promise<{ success: boolean; message: string; response?: any }> {
    try {
      return await sendTestWaMessageFn({ data: { target, message, config } });
    } catch (e: any) {
      console.warn("sendTestWaMessageFn failed:", e);
      return { success: false, message: e?.message || "Error sending test message" };
    }
  }

  static async getAuditLogs(): Promise<AuditLogItem[]> {
    try {
      return await getAuditLogsServerFn();
    } catch (e) {
      console.warn("getAuditLogsServerFn failed:", e);
      return [];
    }
  }

  static async exportDatabaseBackup(): Promise<{ success: boolean; sql?: string; filename?: string; error?: string }> {
    try {
      return await exportDatabaseBackupFn();
    } catch (e: any) {
      console.warn("exportDatabaseBackupFn failed:", e);
      return { success: false, error: e?.message || "Gagal membuat cadangan database." };
    }
  }

  static async restoreDatabaseBackup(sql: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      return await restoreDatabaseBackupFn({ data: { sql } });
    } catch (e: any) {
      console.warn("restoreDatabaseBackupFn failed:", e);
      return { success: false, error: e?.message || "Gagal memulihkan database." };
    }
  }

  static async getKamadExecutiveMetrics(): Promise<KamadExecutiveMetrics> {
    try {
      return await getKamadExecutiveMetricsFn();
    } catch (e) {
      console.warn("getKamadExecutiveMetricsFn failed:", e);
      return {
        nilaiRombel: [],
        presensiSiswa: [],
        presensiGuru: [],
        supervisiWaka: {
          totalMaterials: 0,
          verifiedCount: 0,
          pendingCount: 0,
          revisionCount: 0,
          percentage: 0,
        },
      };
    }
  }
}

export type { WaGatewayConfigRow, AuditLogItem, LkpdDiscussionRow, KamadExecutiveMetrics, CbtQuestionDbRow };
