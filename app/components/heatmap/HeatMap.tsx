import { useState } from "react";
import CircleIcon from "@mui/icons-material/Circle";
import { green, red, amber } from "@mui/material/colors";
import HeatMapTooltip from "./HeatMapTooltip";
import {
  TrafficData,
  TrafficDayData,
  HeatMapDataPoint,
  RECT_SIZE,
  GRADIENT,
  formatHour,
  DAYS,
} from "./HeatMapUtils";

const MARGIN = { top: 10, right: 50, bottom: 30, left: 50 };
const GREEN = green[500];
const YELLOW = amber[500];
const RED = red[500];

export default function HeatMap(data: TrafficData) {
  const isSelected = (point: HeatMapDataPoint) => {
    switch (category) {
      case GREEN:
        return point.value < 33;
      case YELLOW:
        return point.value >= 33 && point.value < 66;
      case RED:
        return point.value >= 66;
      default:
        return true;
    }
  };

  const getHourRange = (data: TrafficData) => {
    const open = Math.min(
      ...[
        data.mon.open,
        data.tue.open,
        data.wed.open,
        data.thu.open,
        data.fri.open,
        data.sat.open,
        data.sun.open,
      ]
    );

    const close = Math.max(
      ...[
        data.mon.close,
        data.tue.close,
        data.wed.close,
        data.thu.close,
        data.fri.close,
        data.sat.close,
        data.sun.close,
      ]
    );

    return [open, close];
  };

  const [start, end] = getHourRange(data);
  const hours = Array.from(
    { length: end - start + 1 },
    (_, index) => start + index
  );

  const buildPoints = (data: TrafficData): HeatMapDataPoint[] => {
    const buildPointsForDay = (
      day: TrafficDayData,
      dayIndex: number
    ): HeatMapDataPoint[] => {
      return day.hours.slice(day.open, day.close + 1).map((value, hour) => ({
        x: hour,
        y: dayIndex,
        day: dayIndex,
        hour: start + hour,
        value: value,
      }));
    };

    const points: HeatMapDataPoint[] = [
      ...buildPointsForDay(data.mon, 0),
      ...buildPointsForDay(data.tue, 1),
      ...buildPointsForDay(data.wed, 2),
      ...buildPointsForDay(data.thu, 3),
      ...buildPointsForDay(data.fri, 4),
      ...buildPointsForDay(data.sat, 5),
      ...buildPointsForDay(data.sun, 6),
    ];

    points.forEach((point) => {
      const active =
        activePoint &&
        point.day == activePoint.day &&
        point.hour == activePoint.hour;
      point.opacity = !active && isSelected(point) ? 1 : 0.5;
      point.color = GRADIENT[Math.floor(point.value / 5)];
    });

    return points;
  };

  const [category, setCategory] = useState<string>();
  const [activePoint, setActivePoint] = useState<HeatMapDataPoint>();

  const width = RECT_SIZE * (end - start + 1) + MARGIN.left + MARGIN.right;
  const height = RECT_SIZE * 7 + MARGIN.top + MARGIN.bottom;
  // The bounds (=area inside the axis) is calculated by substracting the margins
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const points = buildPoints(data);

  const onSelectCategory = (category?: string) => {
    setCategory(category);
  };

  const mouseover = (e: any, d: any) => {
    setActivePoint(d);
  };

  const mouseleave = (e: any, d: any) => {
    setActivePoint(undefined);
  };

  const xLabels = hours.map((h, i) => {
    return (
      <text
        key={h}
        x={i * RECT_SIZE + RECT_SIZE / 2}
        y={boundsHeight + 12}
        textAnchor="middle"
        fontSize={10}
        width={10}
        height={20}
      >
        {i % 4 == 0 ? formatHour(h) : ""}
      </text>
    );
  });

  const yLabels = DAYS.map((name, i) => {
    return (
      <text
        key={i}
        x={-5}
        y={i * RECT_SIZE + RECT_SIZE / 2}
        textAnchor="end"
        dominantBaseline="middle"
        fontSize={10}
      >
        {name}
      </text>
    );
  });

  return (
    <div id="heatmap" className="flex flex-col items-center relative gap-2">
      <div className="flex flex-row items-center gap-3">
        <LegendItem
          label="Not busy"
          color={GREEN}
          onSelect={onSelectCategory}
        />
        <LegendItem
          label="A little busy"
          color={YELLOW}
          onSelect={onSelectCategory}
        />
        <LegendItem
          label="As busy as it gets"
          color={RED}
          onSelect={onSelectCategory}
        />
      </div>
      <svg id="svg" width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {points.map((point, i) => (
            <Rect
              key={i}
              point={point}
              onMouseLeave={mouseleave}
              onMouseOver={mouseover}
            />
          ))}
          {xLabels}
          {yLabels}
        </g>
      </svg>
      <HeatMapTooltip point={activePoint} width={width} height={height} />
    </div>
  );
}

type RectProps = {
  point: HeatMapDataPoint;
  onMouseOver: any;
  onMouseLeave: any;
};

export function Rect({ point, onMouseOver, onMouseLeave }: RectProps) {
  return (
    <rect
      x={RECT_SIZE * point.x}
      y={RECT_SIZE * point.y}
      rx={2}
      ry={2}
      width={RECT_SIZE}
      height={RECT_SIZE}
      opacity={point.opacity}
      fill={point.color}
      stroke={"white"}
      strokeWidth={2}
      onMouseLeave={(e) => onMouseLeave(e, point)}
      onMouseOver={(e) => onMouseOver(e, point)}
      cursor="pointer"
    />
  );
}

type LegendItemProps = {
  label: string;
  color: string;
  onSelect: (category?: string) => void;
};

const LegendItem = ({ label, color, onSelect }: LegendItemProps) => (
  <div
    className="flex flex-row items-center gap-1"
    onMouseEnter={() => onSelect(color)}
    onMouseLeave={() => onSelect("")}
  >
    <CircleIcon sx={{ fontSize: 16, color: color }}></CircleIcon>
    <span>{label}</span>
  </div>
);
