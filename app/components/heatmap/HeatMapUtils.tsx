import { green, red, amber } from "@mui/material/colors";

export type HeatMapDataPoint = {
  x: number;
  y: number;
  day: number;
  hour: number;
  value: number;
  opacity?: number;
  color?: string;
};

export type TrafficData = {
  mon: TrafficDayData;
  tue: TrafficDayData;
  wed: TrafficDayData;
  thu: TrafficDayData;
  fri: TrafficDayData;
  sat: TrafficDayData;
  sun: TrafficDayData;
};

export type TrafficDayData = {
  hours: number[];
  open: number;
  close: number;
};

const formatHour = (hour: number) => {
  const h = hour % 12 == 0 ? 12 : hour % 12;
  return `${h}${hour < 11 ? "AM" : "PM"}`;
};

const formatTime = (point: HeatMapDataPoint): string => {
  const hour = formatHour(point.hour);
  return `${DAYS[point.day]} ${hour}`;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const RECT_SIZE = 28;
const GRADIENT = [
  green[100],
  green[200],
  green[300],
  green[400],
  green[500],
  green[600],
  green[700],
  amber[100],
  amber[200],
  amber[300],
  amber[400],
  amber[500],
  amber[600],
  red[100],
  red[200],
  red[300],
  red[400],
  red[500],
  red[600],
  red[700],
  red[800],
];

export { formatTime, formatHour, RECT_SIZE, DAYS, GRADIENT };
