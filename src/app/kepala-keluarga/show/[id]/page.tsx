"use client";

import dynamic from "next/dynamic";
import { useShow, useList, useDelete } from "@refinedev/core";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  UserPlus,
  MapPin,
  Phone,
  Users,
  FileText,
  User,
  Calendar,
  Briefcase,
  Heart,
  GraduationCap,
  Home,
  Gift,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

// ─── Dynamic Leaflet ──────────────────────────────────────────────────────────

const MapView = dynamic(() => import("@/components/map-view"), {
  ssr: false,
  loading: () => (
    <div className="h-52 w-full rounded-md border bg-muted flex items-center justify-center text-muted-foreground text-sm">
      Memuat peta…
    </div>
  ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface KepalaKeluarga {
  id: number | string;
  no_kk: string;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  status_perkawinan: string;
  alamat: string;
  rt: string;
  rw: string;
  dusun: string;
  status_penduduk: "Permanen" | "Non-Permanen";
  bantuan: string[];
  latitude?: number;
  longitude?: number;
  created_at?: string;
  updated_at?: string;
}

interface AnggotaKeluarga {
  id: number | string;
  kk_id: number | string;
  nik: string;
  nama_lengkap: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "L" | "P";
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  status_perkawinan: string;
  hubungan_keluarga: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BANTUAN_LABEL: Record<string, string> = {
  pkh: "PKH",
  bpnt: "BPNT",
  blt: "BLT Dana Desa",
  pip: "PIP",
  kip: "KIP Kuliah",
  jkn: "JKN/BPJS PBI",
};

function formatTanggal(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function hitungUmur(tanggalLahir: string) {
  if (!tanggalLahir) return null;
  const today = new Date();
  const lahir = new Date(tanggalLahir);
  let umur = today.getFullYear() - lahir.getFullYear();
  const m = today.getMonth() - lahir.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < lahir.getDate())) umur--;
  return umur;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 shrink-0 text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
      {children}
    </h2>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <div className="rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border p-6 space-y-3">
          <Skeleton className="h-4 w-32" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="h-10" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShowKepalaKeluargaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAnggotaId, setDeletingAnggotaId] = useState<
    string | number | null
  >(null);

// Data Dummy Kepala Keluarga
  const DUMMY_KK_DETAIL: KepalaKeluarga[] = [
    {
      id: "1",
      no_kk: "5108041203900001",
      nik: "5108041205800002",
      nama_lengkap: "I Wayan Sudarma",
      tempat_lahir: "Singaraja",
      tanggal_lahir: "1990-03-12",
      jenis_kelamin: "L",
      agama: "Hindu",
      pendidikan: "SMA/Sederajat",
      pekerjaan: "Wiraswasta",
      status_perkawinan: "Kawin",
      alamat: "Jl. Raya Sangket No. 14",
      rt: "01",
      rw: "02",
      dusun: "Dusun Kaja",
      status_penduduk: "Non-Permanen",
      bantuan: ["pkh", "blt"], 
      latitude: -8.1333, 
      longitude: 115.0833,
    },
    {
      id: "2",
      no_kk: "5108041506920003",
      nik: "5108041508930005",
      nama_lengkap: "Ni Made Sriati",
      tempat_lahir: "Buleleng",
      tanggal_lahir: "1992-08-17",
      jenis_kelamin: "P",
      agama: "Hindu",
      pendidikan: "Diploma IV/Strata I",
      pekerjaan: "Pegawai Swasta",
      status_perkawinan: "Kawin",
      alamat: "Perumahan Sangket Indah",
      rt: "02",
      rw: "01",
      dusun: "Dusun Tengah",
      status_penduduk: "Permanen",
      bantuan: ["bpnt"],
    }
  ];

  // Data Dummy Anggota Keluarga
  const DUMMY_ANGGOTA: AnggotaKeluarga[] = [
    {
      id: "101",
      kk_id: "1",
      nik: "5108041205800003",
      nama_lengkap: "Ni Luh Putu Eka",
      tempat_lahir: "Singaraja",
      tanggal_lahir: "1992-05-10",
      jenis_kelamin: "P",
      agama: "Hindu",
      pendidikan: "SMA/Sederajat",
      pekerjaan: "Mengurus Rumah Tangga",
      status_perkawinan: "Kawin",
      hubungan_keluarga: "Istri"
    },
    {
      id: "102",
      kk_id: "1",
      nik: "5108041205800004",
      nama_lengkap: "Putu Gede Darmawan",
      tempat_lahir: "Singaraja",
      tanggal_lahir: "2015-11-20",
      jenis_kelamin: "L",
      agama: "Hindu",
      pendidikan: "Belum Tamat SD/Sederajat",
      pekerjaan: "Pelajar/Mahasiswa",
      status_perkawinan: "Belum Kawin",
      hubungan_keluarga: "Anak"
    }
  ];

  // Simulasi Loading Instan
  const isLoading = false;
  const anggotaLoading = false;

  // Cari data menggunakan fungsi filter/find bawaan JavaScript
  const kk = DUMMY_KK_DETAIL.find((item) => item.id.toString() === id.toString());
  const anggotaList = DUMMY_ANGGOTA.filter((anggota) => anggota.kk_id.toString() === id.toString());

  // Delete KK
  const { mutate: deleteKK } = useDelete();
  const handleDeleteKK = () => {
    deleteKK(
      { resource: "kepala-keluarga", id },
      { onSuccess: () => router.push("/kepala-keluarga") }
    );
  };

  // Delete Anggota
  const { mutate: deleteAnggota } = useDelete();
  const handleDeleteAnggota = (anggotaId: string | number) => {
    deleteAnggota(
      { resource: "anggota-keluarga", id: anggotaId },
      { onSuccess: () => setDeletingAnggotaId(null) }
    );
  };

  if (isLoading) return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="h-9 w-9 rounded-md" />
        <Skeleton className="h-7 w-48" />
      </div>
      <DetailSkeleton />
    </div>
  );

  if (!kk) return (
    <div className="max-w-4xl mx-auto py-6 px-4 flex flex-col items-center justify-center gap-3 pt-24 text-center">
      <AlertCircle className="h-10 w-10 text-muted-foreground" />
      <p className="font-medium">Data tidak ditemukan</p>
      <p className="text-sm text-muted-foreground">
        Data kepala keluarga dengan ID {id} tidak tersedia.
      </p>
      <Button variant="outline" onClick={() => router.push("/kepala-keluarga")}>
        Kembali ke Daftar
      </Button>
    </div>
  );

  const umur = hitungUmur(kk.tanggal_lahir);

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-6">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/kepala-keluarga")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-xs text-muted-foreground">Detail Data</p>
            <h1 className="text-lg font-bold leading-tight">{kk.nama_lengkap}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/kepala-keluarga/edit/${id}`)
            }
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
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

      {/* ── Hero Card ── */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="shrink-0 h-14 w-14 rounded-full bg-primary/15 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary select-none">
                {kk.nama_lengkap.charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{kk.nama_lengkap}</h2>
                <Badge
                  variant={
                    kk.status_penduduk === "Permanen" ? "default" : "secondary"
                  }
                  className={
                  kk.status_penduduk === "Permanen"
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
                }
                >
                  {kk.status_penduduk}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {kk.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                {umur !== null ? ` · ${umur} tahun` : ""}
                {" · "}
                {kk.agama}
              </p>
            </div>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { label: "No. KK", value: kk.no_kk, icon: FileText },
              { label: "NIK", value: kk.nik, icon: User },
              {
                label: "Dusun/Banjar",
                value: kk.dusun,
                icon: Home,
              },
              {
                label: "Anggota Keluarga",
                value: anggotaLoading
                  ? "…"
                  : `${anggotaList.length} orang`,
                icon: Users,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-lg bg-background/70 border px-3 py-2.5"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Icon className="h-3 w-3" />
                  <span className="text-xs">{label}</span>
                </div>
                <p className="text-sm font-semibold truncate">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bantuan chips */}
        {kk.bantuan && kk.bantuan.length > 0 && (
          <div className="px-6 py-3 border-t bg-muted/30 flex items-center gap-2 flex-wrap">
            <Gift className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground mr-1">Bantuan:</span>
            {kk.bantuan.map((b) => (
              <Badge key={b} variant="outline" className="text-xs h-5">
                {BANTUAN_LABEL[b] ?? b}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Data Pribadi ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Data Pribadi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem
              icon={Calendar}
              label="Tempat, Tanggal Lahir"
              value={`${kk.tempat_lahir}, ${formatTanggal(kk.tanggal_lahir)}`}
            />
            <InfoItem
              icon={Heart}
              label="Status Perkawinan"
              value={kk.status_perkawinan}
            />
            <InfoItem
              icon={GraduationCap}
              label="Pendidikan Terakhir"
              value={kk.pendidikan}
            />
            <InfoItem
              icon={Briefcase}
              label="Pekerjaan"
              value={kk.pekerjaan}
            />
          </CardContent>
        </Card>

        {/* ── Alamat ── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Alamat & Domisili</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoItem icon={Home} label="Alamat" value={kk.alamat} />
            <InfoItem
              icon={MapPin}
              label="RT / RW"
              value={`RT ${kk.rt} / RW ${kk.rw}`}
            />
            <InfoItem icon={MapPin} label="Dusun / Banjar" value={kk.dusun} />

            {/* Peta mini */}
            {kk.latitude && kk.longitude ? (
              <div className="pt-1">
                <p className="text-xs text-muted-foreground mb-2">
                  Titik lokasi rumah
                </p>
                <MapView
                  latitude={kk.latitude}
                  longitude={kk.longitude}
                  label={kk.nama_lengkap}
                  height="200px"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {kk.latitude.toFixed(6)}, {kk.longitude.toFixed(6)}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  Belum ada titik lokasi
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="ml-auto h-auto p-0 text-xs"
                  onClick={() => router.push(`/kepala-keluarga/edit/${id}`)}
                >
                  Tambah
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Anggota Keluarga ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Anggota Keluarga</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {anggotaLoading
                ? "Memuat…"
                : `${anggotaList.length} anggota terdaftar`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() =>
              router.push(`/anggota-keluarga/create?kk_id=${id}`)
            }
          >
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
            Tambah Anggota
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {anggotaLoading ? (
            <div className="px-6 py-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : anggotaList.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Users className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Belum ada anggota keluarga
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(`/anggota-keluarga/create?kk_id=${id}`)
                }
              >
                <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                Tambah Anggota Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8 pl-6">#</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Hubungan</TableHead>
                    <TableHead>NIK</TableHead>
                    <TableHead>L/P</TableHead>
                    <TableHead>Tgl. Lahir</TableHead>
                    <TableHead>Pekerjaan</TableHead>
                    <TableHead className="text-right pr-6">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {anggotaList.map((anggota, idx) => (
                    <TableRow key={anggota.id}>
                      <TableCell className="pl-6 text-muted-foreground text-xs">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {anggota.nama_lengkap}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {anggota.hubungan_keluarga}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {anggota.nik}
                      </TableCell>
                      <TableCell>
                        {anggota.jenis_kelamin === "L" ? "L" : "P"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatTanggal(anggota.tanggal_lahir)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {anggota.pekerjaan}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              router.push(
                                `/anggota-keluarga/edit/${anggota.id}?kk_id=${id}`
                              )
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() =>
                              setDeletingAnggotaId(anggota.id)
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Meta info ── */}
      {(kk.created_at || kk.updated_at) && (
        <>
          <Separator />
          <div className="flex gap-6 pb-4 text-xs text-muted-foreground">
            {kk.created_at && (
              <span>Dibuat: {formatTanggal(kk.created_at)}</span>
            )}
            {kk.updated_at && (
              <span>Diperbarui: {formatTanggal(kk.updated_at)}</span>
            )}
          </div>
        </>
      )}

      {/* ── Dialog Hapus KK ── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Data Kepala Keluarga?</AlertDialogTitle>
            <AlertDialogDescription>
              Data <strong>{kk.nama_lengkap}</strong> (No. KK: {kk.no_kk}) dan
              seluruh anggota keluarganya akan dihapus secara permanen. Tindakan
              ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleDeleteKK}
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Dialog Hapus Anggota ── */}
      <AlertDialog
        open={!!deletingAnggotaId}
        onOpenChange={(open) => !open && setDeletingAnggotaId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Anggota Keluarga?</AlertDialogTitle>
            <AlertDialogDescription>
              Data anggota ini akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={() =>
                deletingAnggotaId && handleDeleteAnggota(deletingAnggotaId)
              }
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}