"use client";

// Komponen ini HARUS di-import dengan dynamic() + { ssr: false }
// Contoh: const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false })

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon Leaflet (Next.js issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  /** Zoom default peta. Default 15 jika koordinat diberikan, 13 jika tidak */
  zoom?: number;
  /** Tinggi container peta. Default "256px" */
  height?: string;
}

// Koordinat default: Bali tengah
const DEFAULT_LAT = -8.3405;
const DEFAULT_LNG = 115.092;

export default function MapPicker({
  latitude,
  longitude,
  onChange,
  zoom,
  height = "256px",
}: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return; // sudah diinisialisasi

    const initialLat = latitude ?? DEFAULT_LAT;
    const initialLng = longitude ?? DEFAULT_LNG;
    const initialZoom = zoom ?? (latitude ? 15 : 13);

    const map = L.map(containerRef.current).setView(
      [initialLat, initialLng],
      initialZoom
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Jika koordinat sudah ada, tampilkan marker
    if (latitude && longitude) {
      const marker = L.marker([latitude, longitude], { draggable: true }).addTo(
        map
      );
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });
      markerRef.current = marker;
    }

    // Klik peta → set/pindah marker
    map.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          onChange(pos.lat, pos.lng);
        });
        markerRef.current = marker;
      }
      onChange(lat, lng);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync prop changes → update marker (misal saat edit)
  useEffect(() => {
    if (!mapRef.current || !latitude || !longitude) return;
    if (markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    } else {
      const marker = L.marker([latitude, longitude], { draggable: true }).addTo(
        mapRef.current
      );
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChange(pos.lat, pos.lng);
      });
      markerRef.current = marker;
    }
    mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%" }}
      className="rounded-md border overflow-hidden z-0"
    />
  );
}