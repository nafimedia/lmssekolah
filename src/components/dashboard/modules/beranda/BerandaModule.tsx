import { useState, useEffect } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { useRealtimeCalendar } from "@/hooks/useRealtimeCalendar";

import { GuruDashboardView } from "./components/GuruDashboardView";
import { SiswaDashboardView } from "./components/SiswaDashboardView";
import { AdminDashboardView } from "./components/AdminDashboardView";

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
    totalUsers: liveStats?.totalUsers || dbStats?.totalUsers || 159,
    siswaCount: liveStats?.siswaCount || dbStats?.siswaCount || 117,
    guruStafCount: liveStats?.guruStafCount || dbStats?.guruStafCount || 42,
    totalRombel: liveStats?.totalRombel || dbStats?.totalRombel || 27,
    totalMapel: liveStats?.totalMapel || dbStats?.totalMapel || 18,
    cbtExamsCount: liveStats?.cbtExamsCount || dbStats?.cbtExamsCount || 12,
  };

  const role = (activeRole || "").toLowerCase().trim();

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
