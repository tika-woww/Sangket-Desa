"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Gift, Plus, Search, Pencil, Trash2,
  ChevronLeft, ChevronRight, CheckCircle2, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── DUMMY DATA ────────────────────────────────────────────────────────────────
// TODO: ganti dengan useList({ resource: "data-bantuan" }) setelah backend siap
const DUMMY_BANTUAN = [
  { id: 1, kode: "pkh", nama_bantuan: "Program Keluarga Harapan (PKH)", keterangan: "Bantuan sosial bersyarat bagi keluarga miskin dan rentan.", sumber_dana: "Nasional", aktif: true, penerima: 42 },
  { id: 2, kode: "bpnt", nama_bantuan: "Bantuan Pangan Non Tunai (BPNT)", keterangan: "Bantuan sosial pangan dalam bentuk non tunai dari Pemerintah.", sumber_dana: "Nasional", aktif: true, penerima: 67 },
  { id: 3, kode: "blt_desa", nama_bantuan: "BLT Dana Desa", keterangan: "Bantuan tunai dari Dana Desa untuk mengurangi dampak ekonomi.", sumber_dana: "Desa", aktif: true, penerima: 35 },
  { id: 4, kode: "subsidi_listrik", nama_bantuan: "Subsidi Listrik 450VA", keterangan: "Subsidi tarif listrik untuk rumah tangga miskin dan tidak mampu.", sumber_dana: "Nasional", aktif: true, penerima: 89 },
  { id: 5, kode: "beasiswa_siswa", nama_bantuan: "Beasiswa Anak Tidak Mampu", keterangan: "Beasiswa pendidikan bagi anak dari keluarga kurang mampu.", sumber_dana: "Daerah", aktif: true, penerima: 24 },
  { id: 6, kode: "rutilahu", nama_bantuan: "Bantuan Rutilahu", keterangan: "Renovasi rumah tidak layak huni bagi warga miskin.", sumber_dana: "Daerah", aktif: true, penerima: 18 },
  { id: 7, kode: "jamkesmas", nama_bantuan: "Jaminan Kesehatan Masyarakat (Jamkesmas)", keterangan: "Jaminan layanan kesehatan gratis di Puskesmas dan RSUD.", sumber_dana: "Nasional", aktif: true, penerima: 110 },
  { id: 8, kode: "modal_umkm", nama_bantuan: "Bantuan Modal Usaha UMKM", keterangan: "Bantuan permodalan usaha mikro dari dana desa.", sumber_dana: "Desa", aktif: false, penerima: 15 },
];

const SUMBER_DANA_OPTIONS = ["Semua", "Nasional", "Daerah", "Desa"];

// ─── BADGE COLOR ──────────────────────────────────────────────────────────────
const sumberBadge: Record<string, string> = {
  Nasional: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800",
  Daerah:   "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800",
  Desa:     "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800",
};

export default function DataBantuanListPage() {
  const router = useRouter();
  const [data, setData] = useState(DUMMY_BANTUAN);
  const [search, setSearch] = useState("");
  const [filterSumber, setFilterSumber] = useState("Semua");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalBantuan  = data.length;
  const totalNasional = data.filter((d) => d.sumber_dana === "Nasional").length;
  const totalDaerah   = data.filter((d) => d.sumber_dana === "Daerah").length;
  const totalDesa     = data.filter((d) => d.sumber_dana === "Desa").length;

  // ── Filter + Search ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return data.filter((d) => {
      const matchSearch =
        d.nama_bantuan.toLowerCase().includes(search.toLowerCase()) ||
        d.kode.toLowerCase().includes(search.toLowerCase()) ||
        d.keterangan.toLowerCase().includes(search.toLowerCase());
      const matchSumber = filterSumber === "Semua" || d.sumber_dana === filterSumber;
      return matchSearch && matchSumber;
    });
  }, [data, search, filterSumber]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated  = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Data Bantuan</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Master referensi program bantuan sosial
          </p>
        </div>
        <Button onClick={() => router.push("/data-bantuan/create")}>
          <Plus className="w-4 h-4 mr-2" />
          Tambah Bantuan
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Program", value: totalBantuan, color: "bg-indigo-100 dark:bg-indigo-900/40", iconColor: "text-indigo-600 dark:text-indigo-400" },
          { label: "Nasional", value: totalNasional, color: "bg-blue-100 dark:bg-blue-900/40", iconColor: "text-blue-600 dark:text-blue-400" },
          { label: "Daerah", value: totalDaerah, color: "bg-purple-100 dark:bg-purple-900/40", iconColor: "text-purple-600 dark:text-purple-400" },
          { label: "Dana Desa", value: totalDesa, color: "bg-green-100 dark:bg-green-900/40", iconColor: "text-green-600 dark:text-green-400" },
        ].map((stat) => (
            <StatCard
              key={stat.label}
              icon={<Gift className="w-4 h-4" />}
              label={stat.label}
              value={stat.value}
              bg={stat.color}
            />
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* --- DROPDOWN PAGE --- */}
        <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden md:inline-block">Tampilkan:</span>
        <Select
            value={pageSize?.toString()} 
            onValueChange={(val) => {
            setPageSize(Number(val)); 
            setPage(1); 
            }}
        >
            <SelectTrigger className="w-[70px] h-9 text-sm">
            <SelectValue />
            </SelectTrigger>
            <SelectContent>
            {[5, 10, 25, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                {size}
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
        </div>
        {/* --------------------------------------------- */}

        <div className="flex gap-2 flex-wrap">
          {SUMBER_DANA_OPTIONS.map((k) => (
            <Button
              key={k}
              variant={filterSumber === k ? "default" : "outline"}
              size="sm"
              className="px-3 h-9"
              onClick={() => { setFilterSumber(k); setPage(1); }}
            >
              {k}
            </Button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama, kode, atau keterangan bantuan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 text-center">No.</TableHead>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Program Bantuan</TableHead>
                <TableHead>Sumber Dana</TableHead>
                <TableHead className="text-center">Penerima (KK)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right pr-4">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Tidak ada data bantuan ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground text-sm pl-4">
                      {(page - 1) * pageSize + idx + 1}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-muted text-foreground px-2 py-0.5 rounded">
                        {item.kode}
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-foreground">{item.nama_bantuan}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.keterangan}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={sumberBadge[item.sumber_dana] ?? ""}>
                        {item.sumber_dana}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-semibold text-foreground">
                      {item.penerima}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.aktif ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Nonaktif
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-5"
                          onClick={() => router.push(`/data-bantuan/edit/${item.id}`)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm"
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Data Bantuan</AlertDialogTitle>
                              <AlertDialogDescription>
                                Yakin ingin menghapus <strong>{item.nama_bantuan}</strong>?
                                Program ini mungkin sudah digunakan oleh Kepala Keluarga yang terdaftar.
                                Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Menampilkan {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
          {Math.min(page * pageSize, filtered.length)} dari {filtered.length} data
        </span>
        <div className="flex gap-1">
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={page === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline" size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Komponen Stat Card ───────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}