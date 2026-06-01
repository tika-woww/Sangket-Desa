"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import {
  Upload,
  FileSpreadsheet,
  Download,
  X,
  DatabaseZap,
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type RowStatus = "valid" | "duplicate" | "no_coord";

interface KKRow {
  _rowIndex: number;
  no_kk: string;
  nik: string;
  nama_lengkap: string;
  dusun: string;
  rt: string;
  rw: string;
  status_penduduk: string;
  lat: string;
  lng: string;
  status: RowStatus;
  dupOf?: number; // row index of original duplicate
}

type Step = 1 | 2 | 3;

// ─── Constants ────────────────────────────────────────────────────────────────

const REQUIRED_COLUMNS = [
  "no_kk",
  "nik",
  "nama_lengkap",
  "dusun",
  "rt",
  "rw",
  "status_penduduk",
];

const COLUMN_MAP: Record<string, string> = {
  "no kk": "no_kk",
  "no_kk": "no_kk",
  "nomor kk": "no_kk",
  "nik": "nik",
  "nama": "nama_lengkap",
  "nama lengkap": "nama_lengkap",
  "nama_lengkap": "nama_lengkap",
  "nama kepala keluarga": "nama_lengkap",
  "dusun": "dusun",
  "banjar": "dusun",
  "dusun/banjar": "dusun",
  "rt": "rt",
  "rw": "rw",
  "status": "status_penduduk",
  "status penduduk": "status_penduduk",
  "status_penduduk": "status_penduduk",
  "lat": "lat",
  "latitude": "lat",
  "lng": "lng",
  "lon": "lng",
  "longitude": "lng",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeRow(raw: Record<string, string>): Partial<KKRow> {
  const result: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    const mapped = COLUMN_MAP[key.toLowerCase().trim()];
    if (mapped) result[mapped] = String(val ?? "").trim();
  }
  return result as Partial<KKRow>;
}

function validateRows(rows: Partial<KKRow>[]): KKRow[] {
  const seenKK = new Map<string, number>();
  const seenNIK = new Map<string, number>();

  return rows.map((r, i) => {
    const row: KKRow = {
      _rowIndex: i + 2, // Excel row number (1-indexed + header)
      no_kk: r.no_kk ?? "",
      nik: r.nik ?? "",
      nama_lengkap: r.nama_lengkap ?? "",
      dusun: r.dusun ?? "",
      rt: r.rt ?? "",
      rw: r.rw ?? "",
      status_penduduk: r.status_penduduk ?? "",
      lat: r.lat ?? "",
      lng: r.lng ?? "",
      status: "valid",
    };

    // Check duplicate
    const kkKey = row.no_kk;
    const nikKey = row.nik;
    if (kkKey && seenKK.has(kkKey)) {
      row.status = "duplicate";
      row.dupOf = seenKK.get(kkKey);
    } else if (nikKey && seenNIK.has(nikKey)) {
      row.status = "duplicate";
      row.dupOf = seenNIK.get(nikKey);
    } else {
      if (kkKey) seenKK.set(kkKey, row._rowIndex);
      if (nikKey) seenNIK.set(nikKey, row._rowIndex);
      // Check coord
      if (!row.lat || !row.lng) {
        row.status = "no_coord";
      }
    }

    return row;
  });
}

function generateTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    [
      "no_kk",
      "nik",
      "nama_lengkap",
      "dusun",
      "rt",
      "rw",
      "status_penduduk",
      "lat",
      "lng",
    ],
    [
      "5108010001001",
      "5108010101900001",
      "I Wayan Sudana",
      "Dusun Kaja",
      "001",
      "001",
      "permanen",
      "-8.1234",
      "115.0987",
    ],
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data KK");
  XLSX.writeFile(wb, "template_import_kk.xlsx");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: Step }) {
  const steps = [
    { n: 1, label: "Upload file" },
    { n: 2, label: "Preview & validasi" },
    { n: 3, label: "Selesai" },
  ];
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-colors",
                current > s.n
                  ? "bg-emerald-500 text-white"
                  : current === s.n
                  ? "bg-blue-500 text-white"
                  : "bg-muted text-muted-foreground border border-border"
              )}
            >
              {current > s.n ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.n}
            </div>
            <span
              className={cn(
                "text-xs font-medium",
                current >= s.n ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-8 md:w-16 h-px bg-border mx-3 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: RowStatus }) {
  if (status === "valid")
    return (
      <Badge className="bg-green-50 text-green-800 hover:bg-green-50 dark:bg-green-900/40 dark:text-green-300 text-xs">
        Siap import
      </Badge>
    );
  if (status === "duplicate")
    return (
      <Badge className="bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-900/40 dark:text-red-300 text-xs">
        Duplikat
      </Badge>
    );
  return (
    <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-900/40 dark:text-amber-300 text-xs">
      Koordinat kosong
    </Badge>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ImportKKPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<KKRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // ── Parse ──────────────────────────────────────────────────────────────────

  const processFile = useCallback((file: File) => {
    setParseError("");
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      setParseError("Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv");
      return;
    }

    setFileName(file.name);

    if (ext === "csv") {
      Papa.parse<Record<string, string>>(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const normalized = result.data.map(normalizeRow);
          setRows(validateRows(normalized));
          setStep(2);
        },
        error: () => setParseError("Gagal membaca file CSV."),
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws, {
            defval: "",
          });
          const normalized = data.map(normalizeRow);
          setRows(validateRows(normalized));
          setStep(2);
        } catch {
          setParseError("Gagal membaca file Excel. Pastikan format sesuai template.");
        }
      };
      reader.readAsArrayBuffer(file as Blob);
    }
  }, []);

  // ── Drag & drop ────────────────────────────────────────────────────────────

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  // ── Coord edit ─────────────────────────────────────────────────────────────

  const updateCoord = (index: number, field: "lat" | "lng", value: string) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const updated = { ...r, [field]: value };
        // re-evaluate status after coord fill
        if (updated.status === "no_coord" && updated.lat && updated.lng) {
          updated.status = "valid";
        } else if (
          updated.status === "valid" &&
          (!updated.lat || !updated.lng)
        ) {
          updated.status = "no_coord";
        }
        return updated;
      })
    );
  };

  // ── Stats ──────────────────────────────────────────────────────────────────

  const total = rows.length;
  const valid = rows.filter((r) => r.status === "valid").length;
  const duplicates = rows.filter((r) => r.status === "duplicate").length;
  const noCoord = rows.filter((r) => r.status === "no_coord").length;

  const filteredRows =
    activeTab === "all"
      ? rows
      : activeTab === "valid"
      ? rows.filter((r) => r.status === "valid")
      : activeTab === "duplicate"
      ? rows.filter((r) => r.status === "duplicate")
      : rows.filter((r) => r.status === "no_coord");

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async (onlyValid: boolean) => {
    setIsSaving(true);
    const payload = onlyValid ? rows.filter((r) => r.status === "valid") : rows;
    // TODO: ganti dengan useCreate / API call ke Laravel
    console.log("Payload import KK:", payload);
    await new Promise((r) => setTimeout(r, 1200)); // simulasi loading
    setIsSaving(false);
    setStep(3);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-7xl py-6 px-4 md:px-6 space-y-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="mb-3 -ml-2 text-muted-foreground"
            onClick={() => router.push("/kepala-keluarga")}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Kembali ke list KK
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Import Data Kepala Keluarga
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Upload file Excel atau CSV — data akan dipreview sebelum disimpan
          </p>
        </div>

        <StepIndicator current={step} />

        {/* ── Step 1: Upload ── */}
        {step === 1 && (
          <div className="max-w-2xl space-y-4">
            {/* Template download */}
            <div className="flex items-center justify-between bg-muted/40 border rounded-lg px-4 py-3">
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Info className="w-4 h-4 flex-shrink-0" />
                Belum punya template? Download dulu agar format kolom sesuai
              </div>
              <Button variant="outline" size="sm" onClick={generateTemplate}>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Template
              </Button>
            </div>

            {/* Drop zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
                isDragging
                  ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30"
                  : "border-border hover:border-blue-300 hover:bg-muted/30"
              )}
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground mb-1">
                Drag & drop file di sini, atau klik untuk pilih
              </p>
              <p className="text-xs text-muted-foreground">
                Format yang didukung: .xlsx, .xls, .csv
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processFile(f);
                }}
              />
            </div>

            {parseError && (
              <div className="flex items-center gap-2.5 text-sm text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {parseError}
              </div>
            )}

            {/* Kolom yang dibutuhkan */}
            <div className="bg-muted/40 border rounded-lg px-4 py-3">
              <p className="text-xs font-medium text-foreground mb-2">
                Kolom yang dibutuhkan di file:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {REQUIRED_COLUMNS.map((c) => (
                  <code
                    key={c}
                    className="text-xs bg-background border rounded px-1.5 py-0.5 text-muted-foreground"
                  >
                    {c}
                  </code>
                ))}
                <code className="text-xs bg-background border rounded px-1.5 py-0.5 text-blue-600">
                  lat
                </code>
                <code className="text-xs bg-background border rounded px-1.5 py-0.5 text-blue-600">
                  lng
                </code>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Kolom <span className="text-blue-600">lat</span> &{" "}
                <span className="text-blue-600">lng</span> opsional — bisa
                diisi manual di step preview.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: Preview ── */}
        {step === 2 && (
          <div className="space-y-4">
            {/* File info + ganti */}
            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2.5 text-sm">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium text-foreground">{fileName}</span>
                <span className="text-muted-foreground">
                  — {total} baris terdeteksi
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setStep(1); setRows([]); setFileName(""); }}
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Ganti file
              </Button>
            </div>

            {/* Summary pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-50 text-blue-800 hover:bg-blue-50 dark:bg-blue-900/40 dark:text-blue-300">
                {total} total
              </Badge>
              <Badge className="bg-green-50 text-green-800 hover:bg-green-50 dark:bg-green-900/40 dark:text-green-300">
                {valid} valid
              </Badge>
              {duplicates > 0 && (
                <Badge className="bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-900/40 dark:text-red-300">
                  {duplicates} duplikat
                </Badge>
              )}
              {noCoord > 0 && (
                <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-900/40 dark:text-amber-300">
                  <MapPin className="w-3 h-3 mr-1" />
                  {noCoord} koordinat kosong
                </Badge>
              )}
            </div>

            {noCoord > 0 && (
              <div className="flex items-start gap-2.5 text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {noCoord} baris belum memiliki koordinat. Isi langsung di
                  kolom <strong>Lat</strong> dan <strong>Lng</strong> pada tabel
                  di bawah, atau simpan dulu dan edit lokasi via halaman detail
                  KK.
                </span>
              </div>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="h-9">
                <TabsTrigger value="all" className="text-xs">
                  Semua ({total})
                </TabsTrigger>
                <TabsTrigger value="valid" className="text-xs">
                  Valid ({valid})
                </TabsTrigger>
                {duplicates > 0 && (
                  <TabsTrigger value="duplicate" className="text-xs">
                    Duplikat ({duplicates})
                  </TabsTrigger>
                )}
                {noCoord > 0 && (
                  <TabsTrigger value="no_coord" className="text-xs">
                    Koordinat kosong ({noCoord})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value={activeTab} className="mt-3">
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="text-xs w-10">#</TableHead>
                          <TableHead className="text-xs">No. KK</TableHead>
                          <TableHead className="text-xs">NIK</TableHead>
                          <TableHead className="text-xs">Nama kepala keluarga</TableHead>
                          <TableHead className="text-xs">Dusun</TableHead>
                          <TableHead className="text-xs w-16">RT/RW</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs w-28">
                            <div className="flex items-center gap-1">
                              Lat
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-3 h-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Contoh: -8.1234
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableHead>
                          <TableHead className="text-xs w-28">
                            <div className="flex items-center gap-1">
                              Lng
                              <Tooltip>
                                <TooltipTrigger>
                                  <Info className="w-3 h-3 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  Contoh: 115.0987
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </TableHead>
                          <TableHead className="text-xs">Validasi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRows.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={10}
                              className="text-center py-8 text-sm text-muted-foreground"
                            >
                              Tidak ada data
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredRows.map((row, i) => {
                            const originalIndex = rows.indexOf(row);
                            return (
                              <TableRow
                                key={i}
                                className={cn(
                                  row.status === "duplicate" &&
                                    "bg-red-50/50 dark:bg-red-950/20"
                                )}
                              >
                                <TableCell className="text-xs text-muted-foreground">
                                  {row._rowIndex}
                                </TableCell>
                                <TableCell className="text-xs font-mono">
                                  {row.no_kk}
                                </TableCell>
                                <TableCell className="text-xs font-mono">
                                  {row.nik}
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                  {row.nama_lengkap}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {row.dusun}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {row.rt}/{row.rw}
                                </TableCell>
                                <TableCell className="text-xs">
                                  {row.status_penduduk}
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className={cn(
                                      "h-7 text-xs w-24 font-mono",
                                      !row.lat &&
                                        "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                                    )}
                                    placeholder="-8.xxxx"
                                    value={row.lat}
                                    onChange={(e) =>
                                      updateCoord(
                                        originalIndex,
                                        "lat",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    className={cn(
                                      "h-7 text-xs w-24 font-mono",
                                      !row.lng &&
                                        "border-amber-300 bg-amber-50 dark:bg-amber-950/30"
                                    )}
                                    placeholder="115.xxxx"
                                    value={row.lng}
                                    onChange={(e) =>
                                      updateCoord(
                                        originalIndex,
                                        "lng",
                                        e.target.value
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={row.status} />
                                  {row.status === "duplicate" &&
                                    row.dupOf && (
                                      <p className="text-xs text-muted-foreground mt-0.5">
                                        sama dgn baris {row.dupOf}
                                      </p>
                                    )}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
              <Button
                variant="ghost"
                onClick={() => { setStep(1); setRows([]); setFileName(""); }}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Kembali
              </Button>
              <div className="flex items-center gap-2">
                {duplicates > 0 && (
                  <Button
                    variant="outline"
                    disabled={isSaving || valid === 0}
                    onClick={() => handleSave(true)}
                  >
                    Simpan valid saja ({valid})
                  </Button>
                )}
                <Button
                  disabled={isSaving || total === 0}
                  onClick={() => handleSave(false)}
                >
                  {isSaving ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <DatabaseZap className="w-4 h-4 mr-1.5" />
                      Simpan semua ({total})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: Sukses ── */}
        {step === 3 && (
          <div className="max-w-md mx-auto text-center py-12 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Data berhasil diimport!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Data kepala keluarga sudah tersimpan. Operator dapat melengkapi
                koordinat yang kosong via halaman detail KK.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => { setStep(1); setRows([]); setFileName(""); }}
              >
                Import lagi
              </Button>
              <Button onClick={() => router.push("/kepala-keluarga")}>
                Lihat data KK
              </Button>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}