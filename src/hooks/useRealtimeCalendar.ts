import { useState, useEffect } from "react";

export interface CalendarDayCell {
  date: Date;
  dayNumber: number;
  dateString: string; // YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  dayOfWeekName: string;
}

export const INDONESIAN_MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const INDONESIAN_DAY_NAMES = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export function useRealtimeCalendar() {
  const [now, setNow] = useState<Date>(new Date());
  const [viewDate, setViewDate] = useState<Date>(new Date());

  // Real-time live clock update every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth(); // 0 - 11

  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  // Navigation handlers
  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToToday = () => {
    const fresh = new Date();
    setViewDate(fresh);
  };

  const formattedTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + " WIB";

  const formattedFullDate = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentDayName = now.toLocaleDateString("id-ID", { weekday: "long" });

  // Generate calendar grid for the view month (Monday-start)
  const getCalendarDays = (): CalendarDayCell[] => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const jsFirstDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    // Convert to Monday=0, Sunday=6
    const startingDayOffset = (jsFirstDayOfWeek + 6) % 7;

    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    const cells: CalendarDayCell[] = [];

    for (let i = startingDayOffset - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const date = new Date(currentYear, currentMonth - 1, dayNum);
      const dateString = formatDateString(date);
      const dayOfWeekIdx = (date.getDay() + 6) % 7;
      cells.push({
        date,
        dayNumber: dayNum,
        dateString,
        isCurrentMonth: false,
        isToday: isTodayCheck(date, todayYear, todayMonth, todayDate),
        isWeekend: dayOfWeekIdx === 6,
        dayOfWeekName: INDONESIAN_DAY_NAMES[dayOfWeekIdx],
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(currentYear, currentMonth, d);
      const dateString = formatDateString(date);
      const dayOfWeekIdx = (date.getDay() + 6) % 7;
      cells.push({
        date,
        dayNumber: d,
        dateString,
        isCurrentMonth: true,
        isToday: isTodayCheck(date, todayYear, todayMonth, todayDate),
        isWeekend: dayOfWeekIdx === 6,
        dayOfWeekName: INDONESIAN_DAY_NAMES[dayOfWeekIdx],
      });
    }

    // Next month filler days (to make full 35 or 42 grid cells)
    const remainingCells = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const date = new Date(currentYear, currentMonth + 1, d);
      const dateString = formatDateString(date);
      const dayOfWeekIdx = (date.getDay() + 6) % 7;
      cells.push({
        date,
        dayNumber: d,
        dateString,
        isCurrentMonth: false,
        isToday: isTodayCheck(date, todayYear, todayMonth, todayDate),
        isWeekend: dayOfWeekIdx === 6,
        dayOfWeekName: INDONESIAN_DAY_NAMES[dayOfWeekIdx],
      });
    }

    return cells;
  };

  return {
    now,
    viewDate,
    currentYear,
    currentMonth,
    currentMonthName: INDONESIAN_MONTH_NAMES[currentMonth],
    formattedTime,
    formattedFullDate,
    currentDayName,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    getCalendarDays,
    todayYear,
    todayMonth,
    todayDate,
  };
}

function formatDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isTodayCheck(date: Date, tYear: number, tMonth: number, tDate: number): boolean {
  return (
    date.getFullYear() === tYear &&
    date.getMonth() === tMonth &&
    date.getDate() === tDate
  );
}
