"use client";

import dynamic from "next/dynamic";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  User,
  MapPin,
  FileText,
  Heart,
  Gift,
  Save,
  Loader2,
  Pencil,
} from "lucide-react";

const MapPicker = dynamic(() => import("@/components/map-picker"), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full rounded-md border bg-muted flex items-center justify-center text-muted-foreground text-sm">
      Memuat peta…
    </div>
  ),
});

// ─── Constants (sama persis dengan Create) ────────────────────────────────────

const AGAMA = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"] as const;
const PENDIDIKAN = [
  "Tidak/Belum Sekolah",
  "Belum Tamat SD/Sederajat",
  "Tamat SD/Sederajat",
  "SLTP/Sederajat",
  "SLTA/Sederajat",
  "Diploma I/II",
  "Diploma III",
  "Diploma IV/Strata I",
  "Strata II",
  "Strata III",
] as const;
const STATUS_PERKAWINAN = [
  "Belum Kawin",
  "Kawin",
  "Cerai Hidup",
  "Cerai Mati",
] as const;
const DUSUN = [
  "Dusun Kaja",
  "Dusun Kelod",
  "Dusun Tengah",
  "Dusun Kangin",
  "Dusun Kauh",
] as const;
const BANTUAN_LIST = [
  { id: "pkh", label: "PKH (Program Keluarga Harapan)" },
  { id: "bpnt", label: "BPNT (Bantuan Pangan Non Tunai)" },
  { id: "blt", label: "BLT Dana Desa" },
  { id: "pip", label: "PIP (Program Indonesia Pintar)" },
  { id: "kip", label: "KIP Kuliah" },
  { id: "jkn", label: "JKN / BPJS Kesehatan PBI" },
] as const;

// ─── Schema (identik dengan Create) ──────────────────────────────────────────

const kkSchema = z.object({
  no_kk: z
    .string()
    .length(16, "No. KK harus 16 digit")
    .regex(/^\d+$/, "No. KK hanya boleh angka"),
  nik: z
    .string()
    .length(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK hanya boleh angka"),
  nama_lengkap: z.string().min(3, "Nama minimal 3 karakter"),
  tempat_lahir: z.string().min(2, "Tempat lahir wajib diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenis_kelamin: z.enum(["L", "P"], { required_error: "Pilih jenis kelamin" }),
  agama: z.enum(AGAMA, { required_error: "Pilih agama" }),
  pendidikan: z.enum(PENDIDIKAN, { required_error: "Pilih pendidikan" }),
  pekerjaan: z.string().min(2, "Pekerjaan wajib diisi"),
  status_perkawinan: z.enum(STATUS_PERKAWINAN, {
    required_error: "Pilih status perkawinan",
  }),
  alamat: z.string().min(5, "Alamat wajib diisi"),
  rt: z.string().regex(/^\d+$/, "RT hanya angka").max(3),
  rw: z.string().regex(/^\d+$/, "RW hanya angka").max(3),
  dusun: z.enum(DUSUN, { required_error: "Pilih dusun/banjar" }),
  status_penduduk: z.enum(["Permanen", "Non-Permanen"], {
    required_error: "Pilih status penduduk",
  }),
  bantuan: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type KKFormValues = z.infer<typeof kkSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className="mt-0.5 p-2 rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <h3 className="font-semibold text-sm">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

// Skeleton saat data sedang di-fetch
function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i}>
          <CardHeader >
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EditKepalaKeluargaPage() {
  const router = useRouter();
  const params = useParams();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
    refineCore: { onFinish, query },
  } = useForm<any, any, KKFormValues>({
    resolver: zodResolver(kkSchema),
    refineCoreProps: {
      resource: "kepala-keluarga",
      action: "edit",
      id: params?.id as string,
    },
    defaultValues: {
      bantuan: [],
    },
  });

  // Saat data dari API masuk, reset form agar semua field ter-populate
  // Refine sebenarnya auto-populate, tapi ini failsafe untuk field array (bantuan)
  const queryData = query?.data?.data as KKFormValues | undefined;
  useEffect(() => {
    if (queryData) {
      reset({
        ...queryData,
        bantuan: queryData.bantuan ?? [],
        // Pastikan latitude/longitude bertipe number
        latitude: queryData.latitude ? Number(queryData.latitude) : undefined,
        longitude: queryData.longitude ? Number(queryData.longitude) : undefined,
      });
    }
  }, [queryData, reset]);

  const isLoading = query?.isLoading;
  const bantuanValue = watch("bantuan") ?? [];
  const lat = watch("latitude");
  const lng = watch("longitude");

  const onSubmit = handleSubmit((data) => {
    onFinish(data);
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.push("/kepala-keluarga")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Kepala Keluarga
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              <Pencil className="h-3 w-3" />
              Mode Edit
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Memuat data…"
              : queryData?.nama_lengkap
              ? `Mengubah data: ${queryData.nama_lengkap}`
              : "Ubah data kepala keluarga"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <FormSkeleton />
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          {/* ── Identitas KK ── */}
          <Card>
            <CardHeader >
              <SectionHeader
                icon={FileText}
                title="Identitas Kartu Keluarga"
                description="Nomor KK dan NIK Kepala Keluarga"
              />
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="no_kk" className="mb-4 block">
                  No. KK <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="no_kk"
                  placeholder="16 digit nomor KK"
                  maxLength={16}
                  {...register("no_kk")}
                />
                <FieldError message={errors.no_kk?.message} />
              </div>
              <div>
                <Label htmlFor="nik" className="mb-4 block">
                  NIK <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nik"
                  placeholder="16 digit NIK"
                  maxLength={16}
                  {...register("nik")}
                />
                <FieldError message={errors.nik?.message} />
              </div>
            </CardContent>
          </Card>

          {/* ── Data Pribadi ── */}
          <Card>
            <CardHeader >
              <SectionHeader
                icon={User}
                title="Data Pribadi"
                description="Biodata lengkap kepala keluarga"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nama_lengkap" className="mb-4 block">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama_lengkap"
                  placeholder="Nama sesuai KTP"
                  {...register("nama_lengkap")}
                />
                <FieldError message={errors.nama_lengkap?.message} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tempat_lahir" className="mb-4 block">
                    Tempat Lahir <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="tempat_lahir"
                    placeholder="Kota/Kabupaten"
                    {...register("tempat_lahir")}
                  />
                  <FieldError message={errors.tempat_lahir?.message} />
                </div>
                <div>
                  <Label htmlFor="tanggal_lahir" className="mb-4 block">
                    Tanggal Lahir <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="tanggal_lahir"
                    type="date"
                    {...register("tanggal_lahir")}
                  />
                  <FieldError message={errors.tanggal_lahir?.message} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jenis_kelamin" className="mb-4 block">
                    Jenis Kelamin <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="jenis_kelamin"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kelamin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="L">Laki-laki</SelectItem>
                          <SelectItem value="P">Perempuan</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={errors.jenis_kelamin?.message} />
                </div>
                <div>
                  <Label htmlFor="agama" className="mb-4 block">
                    Agama <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="agama"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih agama" />
                        </SelectTrigger>
                        <SelectContent>
                          {AGAMA.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={errors.agama?.message} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pendidikan" className="mb-4 block">
                    Pendidikan Terakhir <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="pendidikan"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih pendidikan" />
                        </SelectTrigger>
                        <SelectContent>
                          {PENDIDIKAN.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={errors.pendidikan?.message} />
                </div>
                <div>
                  <Label htmlFor="pekerjaan" className="mb-4 block">
                    Pekerjaan <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="pekerjaan"
                    placeholder="Misal: Petani, Wiraswasta"
                    {...register("pekerjaan")}
                  />
                  <FieldError message={errors.pekerjaan?.message} />
                </div>
              </div>

              <div>
                <Label htmlFor="status_perkawinan" className="mb-4 block">
                  Status Perkawinan <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="status_perkawinan"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full sm:w-64">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_PERKAWINAN.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.status_perkawinan?.message} />
              </div>
            </CardContent>
          </Card>

          {/* ── Alamat ── */}
          <Card>
            <CardHeader >
              <SectionHeader
                icon={MapPin}
                title="Alamat & Domisili"
                description="Lokasi tempat tinggal keluarga"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="alamat" className="mb-4 block">
                  Alamat Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="alamat"
                  placeholder="Nama jalan, nomor rumah, dll."
                  {...register("alamat")}
                />
                <FieldError message={errors.alamat?.message} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="rt" className="mb-4 block">
                    RT <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rt"
                    placeholder="001"
                    maxLength={3}
                    {...register("rt")}
                  />
                  <FieldError message={errors.rt?.message} />
                </div>
                <div>
                  <Label htmlFor="rw" className="mb-4 block">
                    RW <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="rw"
                    placeholder="001"
                    maxLength={3}
                    {...register("rw")}
                  />
                  <FieldError message={errors.rw?.message} />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="dusun" className="mb-4 block">
                    Dusun / Banjar <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    control={control}
                    name="dusun"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih dusun" />
                        </SelectTrigger>
                        <SelectContent>
                          {DUSUN.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={errors.dusun?.message} />
                </div>
              </div>

              {/* Peta Leaflet */}
              <div>
                <Label htmlFor="lokasi" className="mb-4 block">
                  Titik Lokasi Rumah{" "}
                  <span className="text-muted-foreground font-normal">
                    (klik peta untuk ubah posisi)
                  </span>
                </Label>
                <MapPicker
                  latitude={lat}
                  longitude={lng}
                  onChange={(lat, lng) => {
                    setValue("latitude", lat);
                    setValue("longitude", lng);
                  }}
                />
                {lat && lng && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Koordinat: {lat.toFixed(6)}, {lng.toFixed(6)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Status Penduduk ── */}
          <Card>
            <CardHeader >
              <SectionHeader
                icon={Heart}
                title="Status Penduduk"
                description="Apakah penduduk permanen atau non-permanen?"
              />
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="status_penduduk"
                render={({ field }) => (
                  <div className="flex gap-4">
                    {(["Permanen", "Non-Permanen"] as const).map((s) => (
                      <label
                        key={s}
                        className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-md border text-sm transition-colors ${
                          field.value === s
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          value={s}
                          checked={field.value === s}
                          onChange={() => field.onChange(s)}
                        />
                        {s}
                      </label>
                    ))}
                  </div>
                )}
              />
              <FieldError message={errors.status_penduduk?.message} />
            </CardContent>
          </Card>

          {/* ── Bantuan ── */}
          <Card>
            <CardHeader >
              <SectionHeader
                icon={Gift}
                title="Data Bantuan Sosial"
                description="Centang bantuan yang diterima keluarga ini"
              />
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="bantuan"
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BANTUAN_LIST.map((item) => {
                      const checked = field.value?.includes(item.id) ?? false;
                      return (
                        <label
                          key={item.id}
                          className={`flex items-center gap-3 cursor-pointer px-3 py-2.5 rounded-md border text-sm transition-colors ${
                            checked
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(c) => {
                              if (c) {
                                field.onChange([...(field.value || []), item.id]);
                              } else {
                                field.onChange(
                                  (field.value || []).filter((v) => v !== item.id)
                                );
                              }
                            }}
                          />
                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </CardContent>
          </Card>

          {/* ── Actions ── */}
          <Separator />
          <div className="flex justify-between items-center pb-6">
            {/* Info last updated — opsional, isi dari queryData jika ada field updated_at */}
            <p className="text-xs text-muted-foreground">
              {(queryData as any)?.updated_at
                ? `Terakhir diperbarui: ${new Date(
                    (queryData as any).updated_at
                  ).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}`
                : ""}
            </p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/kepala-keluarga")}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}