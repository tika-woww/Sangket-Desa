"use client";

import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Controller } from "react-hook-form";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useOne } from "@refinedev/core";
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  User,
  GraduationCap,
  Heart,
  Users,
  Save,
  Loader2,
  Home,
  Pencil,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const HUBUNGAN_KELUARGA = [
  "Kepala Keluarga",
  "Suami",
  "Istri",
  "Anak",
  "Menantu",
  "Cucu",
  "Orang Tua",
  "Mertua",
  "Famili Lain",
  "Pembantu",
  "Lainnya",
] as const;

// ─── Schema ───────────────────────────────────────────────────────────────────

const anggotaSchema = z.object({
  kk_id: z.union([z.string(), z.number()]),
  nik: z
    .string()
    .length(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK hanya boleh angka"),
  nama_lengkap: z.string().min(3, "Nama minimal 3 karakter"),
  hubungan_keluarga: z.enum(HUBUNGAN_KELUARGA, {
    required_error: "Pilih hubungan keluarga",
  }),
  tempat_lahir: z.string().min(2, "Tempat lahir wajib diisi"),
  tanggal_lahir: z.string().min(1, "Tanggal lahir wajib diisi"),
  jenis_kelamin: z.enum(["L", "P"], { required_error: "Pilih jenis kelamin" }),
  agama: z.enum(AGAMA, { required_error: "Pilih agama" }),
  pendidikan: z.enum(PENDIDIKAN, { required_error: "Pilih pendidikan" }),
  pekerjaan: z.string().min(2, "Pekerjaan wajib diisi"),
  status_perkawinan: z.enum(STATUS_PERKAWINAN, {
    required_error: "Pilih status perkawinan",
  }),
});

type AnggotaFormValues = z.infer<typeof anggotaSchema>;

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

function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl border p-6 space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((j) => (
              <div key={j} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EditAnggotaKeluargaPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const kkId = searchParams.get("kk_id") ?? "";

  // Info KK untuk header
  const { query: kkQuery } = useOne({
    resource: "kepala-keluarga",
    id: kkId,
    queryOptions: { enabled: !!kkId },
  });
  
  // Ekstrak data dari dalam objek kkQuery
  const kkNama = (kkQuery?.data?.data as any)?.nama_lengkap;
  const kkNoKK = (kkQuery?.data?.data as any)?.no_kk;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    refineCore: { onFinish, query },
  } = useForm<any, any, AnggotaFormValues>({
    resolver: zodResolver(anggotaSchema),
    refineCoreProps: {
      resource: "anggota-keluarga",
      action: "edit",
      id,
      redirect: false,
    },
  });

  const isLoading = query?.isLoading;
  const queryData = query?.data?.data as AnggotaFormValues | undefined;

  // Sync data API → form
  useEffect(() => {
    if (queryData) {
      reset({ ...queryData });
    }
  }, [queryData, reset]);

  const onSubmit = handleSubmit(async (data) => {
    await onFinish({ ...data, kk_id: kkId || data.kk_id });
    router.push(`/kepala-keluarga/show/${kkId}`);
  });

  const backUrl = kkId
    ? `/kepala-keluarga/show/${kkId}`
    : "/kepala-keluarga";

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.push(backUrl)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              Edit Anggota Keluarga
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
              <Pencil className="h-3 w-3" />
              Mode Edit
            </span>
          </div>
          {kkNama && (
            <div className="flex items-center gap-1.5 mt-1">
              <Home className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                KK: {kkNama}
              </span>
              {kkNoKK && (
                <Badge variant="outline" className="text-xs h-4 px-1.5">
                  {kkNoKK}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <FormSkeleton />
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          {/* ── Hubungan & NIK ── */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader
                icon={Users}
                title="Hubungan & Identitas"
                description="Posisi anggota dalam keluarga dan NIK"
              />
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hubungan_keluarga" className="mb-2 block">
                  Hubungan Keluarga <span className="text-destructive">*</span>
                </Label>
                <Controller
                  control={control}
                  name="hubungan_keluarga"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih hubungan" />
                      </SelectTrigger>
                      <SelectContent>
                        {HUBUNGAN_KELUARGA.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError message={errors.hubungan_keluarga?.message} />
              </div>
              <div>
                <Label htmlFor="nik" className="mb-2 block">
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
            <CardHeader className="pb-3">
              <SectionHeader
                icon={User}
                title="Data Pribadi"
                description="Biodata lengkap anggota keluarga"
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nama_lengkap" className="mb-2 block">
                  Nama Lengkap <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nama_lengkap"
                  placeholder="Nama sesuai KTP/Akta"
                  {...register("nama_lengkap")}
                />
                <FieldError message={errors.nama_lengkap?.message} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tempat_lahir" className="mb-2 block">
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
                  <Label htmlFor="tanggal_lahir" className="mb-2 block">
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
                  <Label htmlFor="jenis_kelamin" className="mb-2 block">
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
                  <Label htmlFor="agama" className="mb-2 block">
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
            </CardContent>
          </Card>

          {/* ── Pendidikan & Pekerjaan ── */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader
                icon={GraduationCap}
                title="Pendidikan & Pekerjaan"
              />
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pendidikan" className="mb-2 block">
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
                <Label htmlFor="pekerjaan" className="mb-2 block">
                  Pekerjaan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pekerjaan"
                  placeholder="Misal: Pelajar, Petani"
                  {...register("pekerjaan")}
                />
                <FieldError message={errors.pekerjaan?.message} />
              </div>
            </CardContent>
          </Card>

          {/* ── Status Perkawinan ── */}
          <Card>
            <CardHeader className="pb-3">
              <SectionHeader icon={Heart} title="Status Perkawinan" />
            </CardHeader>
            <CardContent>
              <Controller
                control={control}
                name="status_perkawinan"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-3">
                    {STATUS_PERKAWINAN.map((s) => (
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
              <FieldError message={errors.status_perkawinan?.message} />
            </CardContent>
          </Card>

          {/* ── Actions ── */}
          <Separator />
          <div className="flex justify-between items-center pb-6">
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
                onClick={() => router.push(backUrl)}
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