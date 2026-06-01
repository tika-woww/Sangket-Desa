"use client";

import React, { useState, useEffect } from "react";
import { useUpdate, useOne, useNavigation } from "@refinedev/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, MapPin, Upload, X } from "lucide-react";

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

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

const schema = z.object({
  nama_fasilitas: z.string().min(3, "Nama fasilitas minimal 3 karakter"),
  jenis_kategori: z.string().min(1, "Pilih jenis/kategori fasilitas"),
  lokasi_dusun: z.string().min(1, "Pilih lokasi dusun"),
  kondisi: z.enum(["Baik", "Rusak Ringan", "Rusak Berat"]),
  keterangan: z.string().optional(),
  latitude: z.number({ required_error: "Pilih lokasi pada peta" }),
  longitude: z.number({ required_error: "Pilih lokasi pada peta" }),
});

type FormValues = z.infer<typeof schema>;

const JENIS_OPTIONS = ["Balai Pertemuan", "Tempat Ibadah", "Olahraga", "Kesehatan", "Infrastruktur", "Pendidikan", "Lainnya"];
const DUSUN_OPTIONS = ["Dusun Kaje", "Dusun Tengah", "Dusun Kelod"];

export default function FasilitasPublikEditPage() {
  const params = useParams();
  const id = Number(params.id);
  const { list, show } = useNavigation();
  const { mutate: updateFasilitas, isLoading } = useUpdate() as any;

  // Ambil data existing (ganti dengan useOne setelah backend siap)
  const existing = DUMMY_FASILITAS.find((f) => f.id === id);

  const [fotoPreview, setFotoPreview] = useState<string | null>(existing?.foto_url ?? null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<any, any, FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (existing) {
      reset({
        nama_fasilitas: existing.nama_fasilitas,
        jenis_kategori: existing.jenis_kategori,
        lokasi_dusun: existing.lokasi_dusun,
        kondisi: existing.kondisi,
        keterangan: existing.keterangan,
        latitude: existing.latitude,
        longitude: existing.longitude,
      });
    }
  }, [existing, reset]);

  const lat = watch("latitude");
  const lng = watch("longitude");

  const handleMapChange = (coords: { lat: number; lng: number }) => {
    setValue("latitude", coords.lat, { shouldValidate: true });
    setValue("longitude", coords.lng, { shouldValidate: true });
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: FormValues) => {
    updateFasilitas(
      { resource: "fasilitas-publik", id, values: { ...data, foto_url: fotoPreview } },
      { onSuccess: () => show("fasilitas-publik", id) }
    );
  };

  if (!existing) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Data fasilitas tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => show("fasilitas-publik", id)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Fasilitas Publik</h1>
          <p className="text-muted-foreground text-sm">{existing.nama_fasilitas}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Informasi Dasar ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader><CardTitle className="text-base">Informasi Fasilitas</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="mb-2" htmlFor="nama_fasilitas">Nama Fasilitas <span className="text-red-500">*</span></Label>
              <Input {...register("nama_fasilitas")} />
              {errors.nama_fasilitas?.message && <p className="text-xs text-red-500">{String(errors.nama_fasilitas.message)}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="mb-2" htmlFor="jenis_kategori">
                Jenis/Kategori <span className="text-red-500">*</span>
              </Label>
              <Select value={watch("jenis_kategori")} onValueChange={(v) => setValue("jenis_kategori", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JENIS_OPTIONS.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.jenis_kategori?.message && <p className="text-xs text-red-500">{String(errors.jenis_kategori.message)}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="mb-2" htmlFor="lokasi_dusun">
                Lokasi (Dusun/Banjar) <span className="text-red-500">*</span>
              </Label>
              <Select value={watch("lokasi_dusun")} onValueChange={(v) => setValue("lokasi_dusun", v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DUSUN_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.lokasi_dusun?.message && <p className="text-xs text-red-500">{String(errors.lokasi_dusun.message)}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="mb-2" htmlFor="kondisi">
                Kondisi Fasilitas <span className="text-red-500">*</span>
              </Label>
              <Select value={watch("kondisi")} onValueChange={(v) => setValue("kondisi", v as FormValues["kondisi"], { shouldValidate: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baik">Baik</SelectItem>
                  <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
                  <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
                </SelectContent>
              </Select>
              {errors.kondisi?.message && <p className="text-xs text-red-500">{String(errors.kondisi.message)}</p>}
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label className="mb-2" htmlFor="keterangan">
                Keterangan / Deskripsi
              </Label>
              <Textarea className="resize-none" rows={3} {...register("keterangan")} />
              {errors.keterangan?.message && <p className="text-xs text-red-500">{String(errors.keterangan.message)}</p>}
            </div>
          </CardContent>
        </Card>

        {/* ── Foto ────────────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader><CardTitle className="text-base">Foto Fasilitas</CardTitle></CardHeader>
          <CardContent>
            {fotoPreview ? (
              <div className="relative w-full max-w-md">
                <img src={fotoPreview} alt="Preview" className="rounded-lg w-full object-cover max-h-60 border" />
                <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => setFotoPreview(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full max-w-md h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/40 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Klik untuk upload foto baru</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
              </label>
            )}
          </CardContent>
        </Card>

        {/* ── Lokasi Peta ─────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Koordinat Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Klik pada peta untuk memperbarui koordinat fasilitas.</p>
            <div className="rounded-lg overflow-hidden border h-72">
              <MapPicker
                
                onChange={(lat, lng) => handleMapChange({ lat, lng })}
              />
            </div>
            {(lat && lng) && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Lat: <span className="font-mono text-foreground">{lat.toFixed(6)}</span></span>
                <span>Lng: <span className="font-mono text-foreground">{lng.toFixed(6)}</span></span>
              </div>
            )}
            {(errors.latitude?.message || errors.longitude?.message) && (
              <p className="text-xs text-red-500">{String(errors.latitude?.message || errors.longitude?.message)}</p>
            )}
          </CardContent>
        </Card>

        {/* ── Tombol ──────────────────────────────────────────────────────────── */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => show("fasilitas-publik", id)}>Batal</Button>
          <Button type="submit" disabled={status === "pending"} className="gap-2">
            <Save className="h-4 w-4" />
            {status === "pending" ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}