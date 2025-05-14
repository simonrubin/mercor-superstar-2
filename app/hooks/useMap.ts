import React, { SetStateAction, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import * as maptilersdk from "@maptiler/sdk";
import { LngLat } from "maplibre-gl";
import MapPopup from "../components/MapPopup";
import { Business } from "../components/MapPopup";

// Set the API key
// const maptiler_api_key = process.env.MAPTILER_API_KEY;
// maptilersdk.config.apiKey = maptiler_api_key ?? "";

// TODO - Remove this key
maptilersdk.config.apiKey = "TwDPXTUT5y62rnrJfTxN";

interface ShowBusinessesProps {
  businesses: Business[];
  color?: string;
  reset?: boolean;
  promising?: boolean;
  interested?: boolean;
}

export default function useMap() {
  const map = useRef<maptilersdk.Map>();
  var activeMarker = useRef<maptilersdk.Marker>();
  var markers = useRef<Map<string, maptilersdk.Marker>>(new Map());

  useEffect(() => {
    if (map.current) return;

    const mapRef = new maptilersdk.Map({
      container: "map",
      style: "streets-v2",
      center: [-97.74242805297416, 30.270557801221628],
      zoom: 0,
    });

    map.current = mapRef;
  }, []);

  const fitToBounds = (coordinates: any) => {
    if (coordinates.length > 1 && map.current) {
      (map.current as any).fitBounds(
        new maptilersdk.LngLatBounds(coordinates),
        {
          maxZoom: 9,
          linear: false,
        }
      );
    } else if (coordinates.length === 1 && map.current) {
      (map.current as any).panTo(coordinates[0]);
    }
  };

  const clearBusinesses = () => {
    // Remove all markers from the map
    markers.current.forEach((marker) => marker.remove());
    markers.current.clear();
    map.current?.zoomTo(0);
  };

  const showBusinesses = ({
    businesses,
    color = "#FF0000",
    reset = false,
    promising = false,
  }: ShowBusinessesProps) => {
    if (!map.current) return;

    if (reset) clearBusinesses();

    const coordinates: LngLat[] = [];
    businesses.forEach((business: any) => {
      const popupContainer = document.createElement("div");

      // eslint-disable-next-line react/no-deprecated
      ReactDOM.render(React.createElement(MapPopup, business), popupContainer);
      let el: HTMLElement | undefined;

      if (promising) {
        el = document.createElement("div");
        el.className = "svg-marker";
        el.style.background = `url(/favorite.svg) no-repeat center/cover`;
        el.style.width = "27px";
        el.style.height = "41px";
      }

      let marker = new maptilersdk.Marker({
        element: el,
        color: color,
        className: `map-marker marker-color-${color}`,
      });

      marker
        .setLngLat([business.longitude, business.latitude])
        .setPopup(
          new maptilersdk.Popup({
            offset: 25,
            closeButton: false,
          }).setDOMContent(popupContainer)
        )
        .addTo(map.current as any); // add the marker to the map

      // show popup on hover
      marker.getElement().addEventListener("mouseenter", () => {
        marker.togglePopup();
      });

      // hide popup on mouse leave
      marker.getElement().addEventListener("mouseleave", () => {
        if (activeMarker.current !== marker) marker.togglePopup();
      });

      // keep popup open when clicked
      marker.getElement().addEventListener("click", () => {
        activeMarker.current = marker;
        marker.togglePopup();
      });

      // keep track of the coordinates
      let coords = marker.getLngLat();
      coordinates.push(coords);

      // associate the marker with the business id
      markers.current.set(business.id, marker);
    });

    fitToBounds(coordinates);
  };

  const setMarkerColor = (marker: maptilersdk.Marker, color: string) => {
    marker
      .getElement()
      .querySelector("svg > g > g:nth-child(2)")
      ?.setAttribute("fill", color);
  };

  const getOriginalMarkerColor = (marker: maptilersdk.Marker) => {
    for (const clazz of marker.getElement().classList) {
      if (clazz.startsWith("marker-color-")) {
        return clazz.replace("marker-color-", "");
      }
    }
    return "#FF0000";
  };

  const setMarkerImg = (marker: maptilersdk.Marker, img: string) => {
    marker.getElement().style.background = `url(${img}) no-repeat center/cover`;
  };

  const highlightMarker = (marker: maptilersdk.Marker, highlight: boolean) => {
    const isCustomSVG = marker.getElement().classList.contains("svg-marker");

    if (isCustomSVG) {
      const svg = highlight ? "/favorite_highlighted.svg" : "/favorite.svg";
      setMarkerImg(marker, svg);
    } else {
      const color = highlight ? "#FFBF00" : getOriginalMarkerColor(marker);
      setMarkerColor(marker, color);
    }
  };

  const highlightBusiness = (business?: Business) => {
    const marker = markers.current.get(business?.id ?? "");

    // Deselect previously active marker
    if (activeMarker.current) {
      highlightMarker(activeMarker.current, false);
    }

    // Highlight the new marker
    activeMarker.current = marker;
    if (marker) highlightMarker(marker, true);
  };

  return {
    showBusinesses,
    clearBusinesses,
    highlightBusiness,
  };
}
