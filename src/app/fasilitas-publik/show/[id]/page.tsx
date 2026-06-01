"use client";

import React, { useState } from "react";
import { useNavigation } from "@refinedev/core";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  Building2,
  Tag,
  MapPinned,
  FileText,
  ImageIcon,
  CheckCircle2, 
  AlertTriangle,
  XCircle,
  Trash2, 
} from "lucide-react";

type FasilitasPublik = {
  id: number;
  nama_fasilitas: string;
  jenis_kategori: string;
  lokasi_dusun: string;
  kondisi: "Baik" | "Rusak Ringan" | "Rusak Berat";
  keterangan: string;
  latitude: number;
  longitude: number;
  foto_url?: string;
};

// ─── Data Dummy ───────────────────────────────────────────────────────────────
const DUMMY_FASILITAS: FasilitasPublik[] = [
  { id: 1, nama_fasilitas: "Balai Banjar Kaje", jenis_kategori: "Balai Pertemuan", lokasi_dusun: "Dusun Kaje", kondisi: "Baik", keterangan: "Kondisi sangat baik, baru direnovasi 2023", latitude: -8.1120, longitude: 115.0875 },
  { id: 2, nama_fasilitas: "Pura Desa Sangket", jenis_kategori: "Tempat Ibadah", lokasi_dusun: "Dusun Tengah", kondisi: "Baik", keterangan: "Pura utama desa, terawat dengan baik", latitude: -8.1135, longitude: 115.0892 },
  { id: 3, nama_fasilitas: "Lapangan Voli Kelod", jenis_kategori: "Olahraga", lokasi_dusun: "Dusun Kelod", kondisi: "Rusak Ringan", keterangan: "Net perlu diganti, lantai sedikit retak", latitude: -8.1155, longitude: 115.0910 },
  { id: 4, nama_fasilitas: "Polindes Sangket", jenis_kategori: "Kesehatan", lokasi_dusun: "Dusun Tengah", kondisi: "Baik", keterangan: "Operasional setiap hari kerja", latitude: -8.1128, longitude: 115.0885 },
  { id: 5, nama_fasilitas: "Jembatan Tukad Kaje", jenis_kategori: "Infrastruktur", lokasi_dusun: "Dusun Kaje", kondisi: "Rusak Berat", keterangan: "Perlu perbaikan segera, retak di tiang utama", latitude: -8.1108, longitude: 115.0860 },
  { id: 6, nama_fasilitas: "SD Negeri 1 Sangket", jenis_kategori: "Pendidikan", lokasi_dusun: "Dusun Tengah", kondisi: "Baik", keterangan: "6 ruang kelas aktif", latitude: -8.1140, longitude: 115.0900 },
  { id: 7, nama_fasilitas: "Wantilan Kelod", jenis_kategori: "Balai Pertemuan", lokasi_dusun: "Dusun Kelod", kondisi: "Rusak Ringan", keterangan: "Atap bocor di bagian timur", latitude: -8.1162, longitude: 115.0920 },
];

// ─── Badge Kondisi ────────────────────────────────────────────────────────────
function KondisiBadge({ kondisi }: { kondisi: FasilitasPublik["kondisi"] }) {
  const map = {
    Baik: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <CheckCircle2 className="h-3 w-3" /> },
    "Rusak Ringan": { cls: "bg-amber-100 text-amber-700 border-amber-200", icon: <AlertTriangle className="h-3 w-3" /> },
    "Rusak Berat": { cls: "bg-red-100 text-red-700 border-red-200", icon: <XCircle className="h-3 w-3" /> },
  };
  const { cls, icon } = map[kondisi];
  return (
    <Badge variant="outline" className={`${cls} hover:${cls} flex items-center gap-1 w-fit`}>
      {icon} {kondisi}
    </Badge>
  );
}

// ─── Dynamic import Leaflet (no SSR) ─────────────────────────────────────────
const MapView = dynamic(() => import("@/components/map-view"), { ssr: false });

export default function FasilitasPublikShowPage() {

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const params = useParams();
  const id = Number(params.id);
  const { list, edit } = useNavigation();

  // Ganti dengan useOne setelah backend siap
  const data = DUMMY_FASILITAS.find((f) => f.id === id);

  if (!data) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Data fasilitas tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => list("fasilitas-publik")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{data.nama_fasilitas}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Detail Fasilitas Publik</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm"
            variant="outline" 
            onClick={() => edit("fasilitas-publik", id)} >
            <Pencil 
            className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Kolom Kiri: Info + Foto ────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info Utama */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Informasi Fasilitas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoRow
                icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
                label="Nama Fasilitas"
                value={data.nama_fasilitas}
              />
              <Separator />
              <InfoRow
                icon={<Tag className="h-4 w-4 text-muted-foreground" />}
                label="Jenis / Kategori"
                value={<Badge variant="secondary">{data.jenis_kategori}</Badge>}
              />
              <Separator />
              <InfoRow
                icon={<MapPinned className="h-4 w-4 text-muted-foreground" />}
                label="Lokasi Dusun"
                value={data.lokasi_dusun}
              />
              <Separator />
              <InfoRow
                icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                label="Kondisi"
                value={<KondisiBadge kondisi={data.kondisi} />}
              />
              {data.keterangan && (
                <>
                  <Separator />
                  <InfoRow
                    icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                    label="Keterangan"
                    value={<span className="text-sm leading-relaxed">{data.keterangan}</span>}
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Foto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Foto Fasilitas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.foto_url ? (
                <img
                  src={data.foto_url}
                  alt={data.nama_fasilitas}
                  className="rounded-lg w-full object-cover max-h-72 border"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed text-muted-foreground gap-2">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-sm">Belum ada foto</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Kolom Kanan: Peta + Koordinat ─────────────────────────────────── */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Lokasi pada Peta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg overflow-hidden border h-64">
                <MapView
                  latitude={data.latitude}
                  longitude={data.longitude}
                  label={data.nama_fasilitas}
                />
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Latitude</span>
                  <span className="font-mono">{data.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Longitude</span>
                  <span className="font-mono">{data.longitude.toFixed(6)}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => window.open(`https://maps.google.com/?q=${data.latitude},${data.longitude}`, "_blank")}
              >
                <MapPin className="h-3.5 w-3.5" />
                Buka di Google Maps
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Row ───────────────────────────────────────────────────────────────
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}