export interface CalendarData {
  year: number;
  month: number;
  monthName: string;
  weddingDay: number;
  daysInMonth: number;
  firstDayOfMonth: number;
  days: (number | null)[];
  monthNames: string[];
  dayNames: string[];
}

export function useCalendar(eventDate: string): CalendarData {
  const date = new Date(eventDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const weddingDay = date.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return {
    year,
    month,
    monthName: monthNames[month],
    weddingDay,
    daysInMonth,
    firstDayOfMonth,
    days,
    monthNames,
    dayNames,
  };
}
