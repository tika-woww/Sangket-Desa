"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── SCHEMA ───────────────────────────────────────────────────────────────────
const schema = z.object({
  kode: z
    .string()
    .min(2, "Kode minimal 2 karakter")
    .max(20, "Kode maksimal 20 karakter")
    .regex(/^[a-z0-9_]+$/, "Kode hanya boleh huruf kecil, angka, dan underscore"),
  nama_bantuan: z
    .string()
    .min(3, "Nama bantuan minimal 3 karakter")
    .max(100, "Nama bantuan maksimal 100 karakter"),
  keterangan: z.string().optional(),
  sumber_dana: z.enum(["Nasional", "Daerah", "Desa"], {
    required_error: "Pilih sumber dana",
  }),
  aktif: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

// ─── SUMBER DANA OPTIONS ──────────────────────────────────────────────────────
const SUMBER_DANA_OPTIONS = [
  {
    value: "Nasional",
    label: "Nasional",
    desc: "Program dari Pemerintah Pusat (APBN)",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  {
    value: "Daerah",
    label: "Daerah",
    desc: "Program dari Pemkab/Pemkot (APBD)",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  },
  {
    value: "Desa",
    label: "Dana Desa",
    desc: "Program dari APBDes",
    color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800",
  },
] as const;

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
// TODO: ganti dengan useOne dari Refine setelah backend siap
const DUMMY_BANTUAN = [
  { id: 1, kode: "pkh", nama_bantuan: "Program Keluarga Harapan (PKH)", keterangan: "Bantuan sosial bersyarat bagi keluarga miskin dan rentan.", sumber_dana: "Nasional", aktif: true },
  { id: 2, kode: "bpnt", nama_bantuan: "Bantuan Pangan Non Tunai (BPNT)", keterangan: "Bantuan sosial pangan dalam bentuk non tunai.", sumber_dana: "Nasional", aktif: true },
  { id: 3, kode: "blt_desa", nama_bantuan: "BLT Dana Desa", keterangan: "Bantuan tunai dari Dana Desa untuk mengurangi dampak ekonomi.", sumber_dana: "Desa", aktif: true },
  { id: 4, kode: "subsidi_listrik", nama_bantuan: "Subsidi Listrik 450VA", keterangan: "Subsidi tarif listrik untuk rumah tangga miskin.", sumber_dana: "Nasional", aktif: true },
  { id: 5, kode: "beasiswa_siswa", nama_bantuan: "Beasiswa Anak Tidak Mampu", keterangan: "Beasiswa pendidikan bagi anak dari keluarga kurang mampu.", sumber_dana: "Daerah", aktif: true },
  { id: 6, kode: "rutilahu", nama_bantuan: "Bantuan Rutilahu", keterangan: "Renovasi rumah tidak layak huni bagi warga miskin.", sumber_dana: "Daerah", aktif: true },
  { id: 7, kode: "jamkesmas", nama_bantuan: "Jaminan Kesehatan Masyarakat (Jamkesmas)", keterangan: "Jaminan layanan kesehatan gratis di Puskesmas dan RSUD.", sumber_dana: "Nasional", aktif: true },
  { id: 8, kode: "modal_umkm", nama_bantuan: "Bantuan Modal Usaha UMKM", keterangan: "Bantuan permodalan usaha mikro dari dana desa.", sumber_dana: "Desa", aktif: false },
];

// ─── PREVIEW ─────────────────────────────────────────────────────────────────
function CheckboxPreview({ kode, nama }: { kode: string; nama: string }) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-dashed border-muted-foreground/30 bg-muted/40 px-3 py-2">
      <Checkbox disabled defaultChecked className="opacity-60" />
      <span className="text-sm text-muted-foreground">
        <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded mr-1.5 text-foreground/70">
          {kode || "kode"}
        </span>
        {nama || "Nama Bantuan"}
      </span>
    </div>
  );
}

export default function DataBantuanEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);

  const existingData = DUMMY_BANTUAN.find((d) => d.id === id);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<any, any, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { aktif: true },
  });

  const sumberDanaValue = watch("sumber_dana");
  const aktifValue = watch("aktif");
  const kodeValue = watch("kode") ?? "";
  const namaValue = watch("nama_bantuan") ?? "";

  // Pre-fill form
  useEffect(() => {
    if (existingData) {
      reset({
        kode: existingData.kode,
        nama_bantuan: existingData.nama_bantuan,
        keterangan: existingData.keterangan ?? "",
        sumber_dana: existingData.sumber_dana as FormValues["sumber_dana"],
        aktif: existingData.aktif,
      });
    }
  }, [existingData, reset]);

  const onSubmit = async (values: FormValues) => {
    // TODO: ganti dengan useUpdate dari Refine setelah backend siap
    console.log("Update data bantuan id:", id, values);
    await new Promise((r) => setTimeout(r, 500));
    router.push("/data-bantuan");
  };

  if (!existingData) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 min-h-64">
        <p className="text-muted-foreground">Data bantuan tidak ditemukan.</p>
        <Button variant="outline" onClick={() => router.push("/data-bantuan")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-6 px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push("/data-bantuan")}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Data Bantuan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Perbarui informasi program bantuan sosial
          </p>
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
        <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800 dark:text-amber-300">
          Perubahan di sini akan otomatis memperbarui tampilan di bagian{" "}
          <strong>Data Bantuan yang Diterima</strong> pada form Kepala Keluarga.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-foreground">Informasi Program Bantuan</CardTitle>
            <CardDescription>Perbarui data program bantuan sosial</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Kode */}
            <div className="space-y-2">
              <Label htmlFor="kode" className="text-foreground">
                Kode Bantuan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kode"
                placeholder="Contoh: pkh, bpnt, blt_desa"
                className="font-mono"
                {...register("kode")}
                onChange={(e) => {
                  e.target.value = e.target.value.toLowerCase().replace(/\s/g, "_");
                  register("kode").onChange(e);
                }}
              />
              <p className="text-xs text-muted-foreground">
                Huruf kecil, angka, dan underscore. Digunakan sebagai identifier unik.
              </p>
              {errors.kode?.message && <p className="text-xs text-destructive">{String(errors.kode.message)}</p>}
            </div>

            {/* Nama */}
            <div className="space-y-1.5">
              <Label htmlFor="nama_bantuan" className="text-foreground">
                Nama Program Bantuan <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nama_bantuan"
                placeholder="Contoh: Program Keluarga Harapan (PKH)"
                {...register("nama_bantuan")}
              />
              {errors.nama_bantuan?.message && (
                <p className="text-xs text-destructive">{String(errors.nama_bantuan.message)}</p>
              )}
            </div>

            {/* Sumber Dana */}
            <div className="space-y-2">
              <Label className="text-foreground">
                Sumber Dana <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SUMBER_DANA_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("sumber_dana", opt.value, { shouldValidate: true })}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-lg border-2 px-3 py-2.5 text-left transition-all",
                      sumberDanaValue === opt.value
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border bg-background hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <Badge variant="outline" className={cn("text-xs mb-1", opt.color)}>
                      {opt.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{opt.desc}</span>
                  </button>
                ))}
              </div>
              {errors.sumber_dana?.message && (
                <p className="text-xs text-destructive">{String(errors.sumber_dana.message)}</p>
              )}
            </div>

            {/* Keterangan */}
            <div className="space-y-1.5">
              <Label htmlFor="keterangan" className="text-foreground">
                Keterangan{" "}
                <span className="text-muted-foreground font-normal">(opsional)</span>
              </Label>
              <Textarea
                id="keterangan"
                placeholder="Jelaskan tujuan, sasaran, dan mekanisme program bantuan ini..."
                rows={3}
                {...register("keterangan")}
              />
              {errors.keterangan?.message && (
                <p className="text-xs text-destructive">{String(errors.keterangan.message)}</p>
              )}
            </div>

            {/* Status Aktif */}
            <div className="flex items-start gap-3 rounded-lg border bg-muted/30 dark:bg-muted/20 px-4 py-3">
              <Checkbox
                id="aktif"
                checked={aktifValue}
                onCheckedChange={(checked) => setValue("aktif", !!checked)}
                className="mt-0.5"
              />
              <div>
                <Label htmlFor="aktif" className="text-foreground cursor-pointer font-medium">
                  Aktifkan program bantuan ini
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hanya program yang aktif yang akan tampil sebagai pilihan di form Kepala Keluarga.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-2">
              <Gift className="w-3.5 h-3.5" />
              Preview — tampilan di form Kepala Keluarga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CheckboxPreview kode={kodeValue} nama={namaValue} />
            <p className="text-xs text-muted-foreground mt-2">
              Begini tampilan bantuan ini saat operator menginput data Kepala Keluarga.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={() => router.push("/data-bantuan")}>
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}