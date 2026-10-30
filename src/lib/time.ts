import { addMinutes } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const TIME_ZONE = "Europe/Lisbon";

export function localDateTimeToUtc(date: string, time: string) {
  return fromZonedTime(`${date}T${time}:00`, TIME_ZONE);
}
export function localDayStart(date: string) {
  return fromZonedTime(`${date}T00:00:00`, TIME_ZONE);
}
export function nextLocalDayStart(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const nextDate = next.toISOString().slice(0, 10);
  return localDayStart(nextDate);
}
export function formatLocalTime(value: Date) {
  return formatInTimeZone(value, TIME_ZONE, "HH:mm");
}
export function addServiceDuration(start: Date, minutes: number) {
  return addMinutes(start, minutes);
}
export function dayOfWeek(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay();
}