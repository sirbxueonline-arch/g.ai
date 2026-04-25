export interface Holiday {
  month: number;
  day: number;
  name: string;
}

export const AZ_HOLIDAYS: Holiday[] = [
  { month: 1,  day: 1,  name: 'Yeni il' },
  { month: 1,  day: 2,  name: 'Yeni il (2-ci gün)' },
  { month: 1,  day: 20, name: 'Ümumxalq Hüzn Günü' },
  { month: 3,  day: 8,  name: 'Qadınlar Günü' },
  { month: 3,  day: 20, name: 'Novruz Bayramı' },
  { month: 3,  day: 21, name: 'Novruz Bayramı' },
  { month: 3,  day: 22, name: 'Novruz Bayramı' },
  { month: 3,  day: 23, name: 'Novruz Bayramı' },
  { month: 3,  day: 24, name: 'Novruz Bayramı' },
  { month: 5,  day: 9,  name: 'Faşizm üzərində Qələbə Günü' },
  { month: 5,  day: 28, name: 'Respublika Günü' },
  { month: 6,  day: 15, name: 'Azərbaycan Xalqının Milli Qurtuluş Günü' },
  { month: 6,  day: 26, name: 'Silahlı Qüvvələr Günü' },
  { month: 10, day: 18, name: 'Dövlət Müstəqilliyi Günü' },
  { month: 11, day: 8,  name: 'Zəfər Günü' },
  { month: 11, day: 12, name: 'Konstitusiya Günü' },
  { month: 11, day: 17, name: 'Milli Dirçəliş Günü' },
  { month: 12, day: 31, name: 'Dünya Azərbaycanlıları Həmrəyliyi Günü' },
];

const MONTHS: Record<number, string> = {
  1: 'yanvar', 2: 'fevral', 3: 'mart', 4: 'aprel',
  5: 'may', 6: 'iyun', 7: 'iyul', 8: 'avqust',
  9: 'sentyabr', 10: 'oktyabr', 11: 'noyabr', 12: 'dekabr',
};

export function getNextHoliday(): { holiday: Holiday; daysLeft: number; dateStr: string } {
  const now = new Date();
  const year = now.getFullYear();

  for (const h of AZ_HOLIDAYS) {
    const date = new Date(year, h.month - 1, h.day);
    const diff = Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
    if (diff >= 0) {
      return { holiday: h, daysLeft: diff, dateStr: `${h.day} ${MONTHS[h.month]}` };
    }
  }

  // Wrap to next year
  const first = AZ_HOLIDAYS[0]!;
  const date = new Date(year + 1, first.month - 1, first.day);
  const diff = Math.ceil((date.getTime() - now.getTime()) / 86_400_000);
  return { holiday: first, daysLeft: diff, dateStr: `${first.day} ${MONTHS[first.month]}` };
}
