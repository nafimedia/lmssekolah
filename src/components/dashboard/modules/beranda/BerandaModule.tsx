import { useState, useEffect } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { useRealtimeCalendar } from "@/hooks/useRealtimeCalendar";

import { GuruDashboardView } from "./components/GuruDashboardView";
import { SiswaDashboardView } from "./components/SiswaDashboardView";
import { AdminDashboardView } from "./components/AdminDashboardView";
import { WaliKelasDashboardView } from "./components/WaliKelasDashboardView";

interface BerandaModuleProps {
  activeRole: string;
  userProfile?: any;
  dbStats?: any;
  setActiveTab?: (key: string) => void;
}

export function BerandaModule({
  activeRole,
  userProfile,
  dbStats,
  setActiveTab,
}: BerandaModuleProps) {
  const {
    currentMonthName,
    currentYear,
    formattedTime,
    currentDayName,
  } = useRealtimeCalendar();

  const [liveStats, setLiveStats] = useState<any>(null);

  useEffect(() => {
    MysqlDataService.getDatabaseStats().then((res) => setLiveStats(res));
  }, []);

  const activeUser = MysqlAuthService.getActiveUser();
  const userName = activeUser?.full_name || userProfile?.name || userProfile?.full_name || "SOBIYATI, S.Pd";

  const stats = {
    totalUsers: liveStats?.totalUsers ?? dbStats?.totalUsers ?? 0,
    siswaCount: liveStats?.siswaCount ?? dbStats?.siswaCount ?? 0,
    guruStafCount: liveStats?.guruStafCount ?? dbStats?.guruStafCount ?? 0,
    totalRombel: liveStats?.totalRombel ?? dbStats?.totalRombel ?? 0,
    totalMapel: liveStats?.totalMapel ?? dbStats?.totalMapel ?? 0,
    cbtExamsCount: liveStats?.cbtExamsCount ?? dbStats?.cbtExamsCount ?? 0,
  };

  const role = (activeRole || "").toLowerCase().trim();

  if (role === "walikelas" || role === "wali_kelas") {
    return (
      <WaliKelasDashboardView
        userName={userName}
        currentDayName={currentDayName}
        formattedTime={formattedTime}
        setActiveTab={setActiveTab}
      />
    );
  }

  if (role === "guru" || role === "teacher") {
    return (
      <GuruDashboardView
        userName={userName}
        currentDayName={currentDayName}
        formattedTime={formattedTime}
        setActiveTab={setActiveTab}
      />
    );
  }

  if (role === "siswa" || role === "student") {
    return (
      <SiswaDashboardView
        userName={userName}
        currentDayName={currentDayName}
        formattedTime={formattedTime}
        setActiveTab={setActiveTab}
      />
    );
  }

  return (
    <AdminDashboardView
      userName={userName}
      role={role}
      stats={stats}
      currentDayName={currentDayName}
      formattedTime={formattedTime}
      setActiveTab={setActiveTab}
    />
  );
}
