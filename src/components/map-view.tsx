"use client";

// Komponen ini HARUS di-import dengan dynamic() + { ssr: false }
// Read-only: hanya menampilkan marker, tidak bisa diklik/drag
// Berbeda dengan MapPicker yang interaktif untuk form

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapViewProps {
  latitude: number;
  longitude: number;
  /** Label popup marker */
  label?: string;
  zoom?: number;
  height?: string;
}

export default function MapView({
  latitude,
  longitude,
  label,
  zoom = 16,
  height = "200px",
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false, // nonaktifkan scroll zoom di halaman detail
      dragging: true,
    }).setView([latitude, longitude], zoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([latitude, longitude]).addTo(map);
    if (label) {
      marker.bindPopup(label).openPopup();
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      className="rounded-md border overflow-hidden z-0"
    />
  );
}