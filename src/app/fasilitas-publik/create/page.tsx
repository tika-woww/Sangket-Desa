"use client";

import React, { useState } from "react";
import { useCreate, useNavigation } from "@refinedev/core";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// ─── Dynamic import Leaflet (no SSR) ─────────────────────────────────────────
const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

// ─── Schema Validasi ──────────────────────────────────────────────────────────
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

// ─── Halaman Create ───────────────────────────────────────────────────────────
export default function FasilitasPublikCreatePage() {
  const { list } = useNavigation();
  const { mutate: createFasilitas, isLoading } = useCreate() as any;

  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any, any, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { kondisi: "Baik" },
  });

  const lat = watch("latitude");
  const lng = watch("longitude");

  const handleMapChange = (coords: { lat: number; lng: number }) => {
    setValue("latitude", coords.lat, { shouldValidate: true });
    setValue("longitude", coords.lng, { shouldValidate: true });
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: FormValues) => {
    // TODO: upload foto ke server, lalu kirim URL-nya
    createFasilitas(
      { resource: "fasilitas-publik", values: { ...data, foto_url: fotoPreview } },
      { onSuccess: () => list("fasilitas-publik") }
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => list("fasilitas-publik")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Fasilitas Publik</h1>
          <p className="text-muted-foreground text-sm">Isi data fasilitas umum baru</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ── Informasi Dasar ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informasi Fasilitas</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Nama Fasilitas */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="mb-2" htmlFor="nama_fasilitas">
                Nama Fasilitas <span className="text-red-500">*</span>
              </Label>
              <Input placeholder="contoh: Balai Banjar Kaje" {...register("nama_fasilitas")} />
              {errors.nama_fasilitas?.message && <p className="text-xs text-red-500">{String(errors.nama_fasilitas.message)}</p>}
            </div>

            {/* Jenis */}
            <div className="space-y-1.5">
              <Label className="mb-2" htmlFor="jenis_kategori">
                Jenis/Kategori <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(v) => setValue("jenis_kategori", v, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori..." />
                </SelectTrigger>
                <SelectContent>
                  {JENIS_OPTIONS.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.jenis_kategori?.message && <p className="text-xs text-red-500">{String(errors.jenis_kategori.message)}</p>}
            </div>

            {/* Dusun */}
            <div className="space-y-1.5">
              <Label className="mb-2" htmlFor="lokasi_dusun">
                Lokasi (Dusun/Banjar) <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(v) => setValue("lokasi_dusun", v, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih dusun..." />
                </SelectTrigger>
                <SelectContent>
                  {DUSUN_OPTIONS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.lokasi_dusun?.message && <p className="text-xs text-red-500">{String(errors.lokasi_dusun.message)}</p>}
            </div>

            {/* Kondisi */}
            <div className="space-y-1.5">
              <Label className="mb-2" htmlFor="kondisi">
                Kondisi Fasilitas <span className="text-red-500">*</span>
              </Label>
              <Select defaultValue="Baik" onValueChange={(v) => setValue("kondisi", v as FormValues["kondisi"], { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Baik">Baik</SelectItem>
                  <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
                  <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
                </SelectContent>
              </Select>
              {errors.kondisi?.message && <p className="text-xs text-red-500">{String(errors.kondisi.message)}</p>}
            </div>

            {/* Keterangan */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="mb-2" htmlFor="keterangan">
                Keterangan / Deskripsi
              </Label>
              <Textarea
                placeholder="Deskripsikan kondisi atau catatan penting tentang fasilitas ini..."
                className="resize-none"
                rows={3}
                {...register("keterangan")}
              />
              {errors.keterangan?.message && <p className="text-xs text-red-500">{String(errors.keterangan.message)}</p>}
            </div>
          </CardContent>
        </Card>

        {/* ── Foto ────────────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Foto Fasilitas</CardTitle>
          </CardHeader>
          <CardContent>
            {fotoPreview ? (
              <div className="relative w-full max-w-md">
                <img src={fotoPreview} alt="Preview" className="rounded-lg w-full object-cover max-h-60 border" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 h-7 w-7"
                  onClick={() => { setFotoPreview(null); setFotoFile(null); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full max-w-md h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/40 transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Klik untuk upload foto</span>
                <span className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP maks. 5MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
              </label>
            )}
          </CardContent>
        </Card>

        {/* ── Lokasi Peta ─────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Koordinat Lokasi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Klik pada peta untuk menentukan koordinat fasilitas.
            </p>
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
              <p className="text-xs text-red-500">Lokasi pada peta wajib dipilih</p>
            )}
          </CardContent>
        </Card>

        {/* ── Tombol ──────────────────────────────────────────────────────────── */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => list("fasilitas-publik")}>
            Batal
          </Button>
          <Button type="submit" disabled={status === "pending"} className="gap-2">
            <Save className="h-4 w-4" />
            {status === "pending" ? "Menyimpan..." : "Simpan Fasilitas"}
          </Button>
        </div>
      </form>
    </div>
  );
}