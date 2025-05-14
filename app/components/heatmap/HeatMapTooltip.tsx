import { formatTime, RECT_SIZE, HeatMapDataPoint } from "./HeatMapUtils";

type HeatMapTooltipProps = {
  point?: HeatMapDataPoint;
  width: number;
  height: number;
};

export default function HeatMapTooltip({
  point,
  width,
  height,
}: HeatMapTooltipProps) {
  if (!point) return null;
  return (
    // Wrapper div: a rect on top of the viz area
    <div
      style={{
        width,
        height,
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
      }}
    >
      {/* The actual box with dark background */}
      <div
        style={{
          position: "absolute",
          backgroundColor: "white",
          border: "1px solid rgb(107 114 128)",
          borderRadius: 4,
          padding: 8,
          left: RECT_SIZE * point.x,
          top: RECT_SIZE * point.y,
          fontSize: 12,
          whiteSpace: "nowrap",
        }}
      >
        <span>{formatTime(point)}:</span>
        <span className="pl-2 font-medium ">{point.value}% of peak</span>
      </div>
    </div>
  );
}
