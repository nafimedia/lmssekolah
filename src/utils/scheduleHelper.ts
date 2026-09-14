import { isSameSubject } from "./subjectNormalization.ts";

export interface MergedClassSchedule {
  id: string | number;
  mapel: string;
  guru: string;
  rombel: string;
  jamLabel: string;
  jpCount: number;
  rawItems: any[];
}

export function parseJamString(str: string) {
  const raw = str || "";
  const jamMatch = raw.match(/Jam\s*(\d+)/i);
  const num = jamMatch ? parseInt(jamMatch[1], 10) : null;
  let timeRange = "";
  const parenMatch = raw.match(/\(([^)]+)\)/);
  if (parenMatch) {
    timeRange = parenMatch[1].trim();
  } else if (raw.includes("-")) {
    timeRange = raw.trim();
  }
  let start = "";
  let end = "";
  if (timeRange.includes("-")) {
    const parts = timeRange.split("-").map((p) => p.trim());
    start = parts[0] || "";
    end = parts[1] || "";
  }
  return { num, start, end, raw };
}

export function mergeConsecutiveSchedules(schedules: any[]): MergedClassSchedule[] {
  if (!schedules || schedules.length === 0) return [];

  const result: MergedClassSchedule[] = [];

  for (const item of schedules) {
    const last = result[result.length - 1];
    const isSameSubj = last && isSameSubject(last.mapel, item.mapel);
    const isSameGuru =
      last &&
      (!last.guru ||
        !item.guru ||
        last.guru.trim().toLowerCase() === item.guru.trim().toLowerCase() ||
        last.guru === "Guru Pengampu");

    if (last && isSameSubj && isSameGuru) {
      last.jpCount += 1;
      last.rawItems.push(item);

      const firstParsed = parseJamString(last.rawItems[0].jam);
      const currentParsed = parseJamString(item.jam);

      const firstNum = firstParsed.num;
      const currentNum = currentParsed.num;
      const startTime = firstParsed.start;
      const endTime = currentParsed.end || currentParsed.start;

      if (firstNum && currentNum) {
        if (startTime && endTime) {
          last.jamLabel = `Jam ${firstNum} - ${currentNum} (${startTime} - ${endTime})`;
        } else {
          last.jamLabel = `Jam ${firstNum} - ${currentNum}`;
        }
      } else if (startTime && endTime) {
        last.jamLabel = `${startTime} - ${endTime}`;
      } else {
        last.jamLabel = `${last.rawItems[0].jam || ""} s/d ${item.jam || ""}`;
      }
    } else {
      const p = parseJamString(item.jam);
      let jamLabel = item.jam || "Jam KBM";
      if (p.num && p.start && p.end) {
        jamLabel = `Jam ${p.num} (${p.start} - ${p.end})`;
      }

      result.push({
        id: item.id,
        mapel: item.mapel,
        guru: item.guru,
        rombel: item.rombel,
        jamLabel,
        jpCount: 1,
        rawItems: [item],
      });
    }
  }

  return result;
}
