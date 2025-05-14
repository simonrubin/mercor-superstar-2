"use client";

import cx from "classnames";
import useMap from "../hooks/useMap";

export default function Map({ className }: { className?: string }) {
  useMap();

  return (
    <div id="map" className={cx("w-full h-full rounded-lg", className)}></div>
  );
}
