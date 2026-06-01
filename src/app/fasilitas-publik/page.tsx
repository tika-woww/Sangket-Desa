"use client";

import React, { useState } from "react";
import { useDelete, useNavigation } from "@refinedev/core";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ─── Tipe Data ────────────────────────────────────────────────────────────────
export type FasilitasPublik = {
  id: number;
  nama_fasilitas: string;
  jenis_kategori: string;
  lokasi_dusun: string;
  kondisi: "Baik" | "Rusak Ringan" | "Rusak Berat";
  keterangan: string;
  foto_url?: string;
  latitude: number;
  longitude: number;
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

const JENIS_LIST = ["Semua Jenis", "Balai Pertemuan", "Tempat Ibadah", "Olahraga", "Kesehatan", "Infrastruktur", "Pendidikan"];
const DUSUN_LIST = ["Semua Dusun", "Dusun Kaje", "Dusun Tengah", "Dusun Kelod"];

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

// ─── Halaman List ─────────────────────────────────────────────────────────────
export default function FasilitasPublikListPage() {
  const { edit, create, show } = useNavigation();
  const { mutate: deleteFasilitas } = useDelete();

  const [search, setSearch] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua Jenis");
  const [filterKondisi, setFilterKondisi] = useState("all");
  const [filterDusun, setFilterDusun] = useState("Semua Dusun");
  const [deleteTarget, setDeleteTarget] = useState<FasilitasPublik | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState<number>(8);

  const filtered = DUMMY_FASILITAS.filter((f) => {
    const matchSearch = search === "" || f.nama_fasilitas.toLowerCase().includes(search.toLowerCase());
    const matchJenis = filterJenis === "Semua Jenis" || f.jenis_kategori === filterJenis;
    const matchKondisi = filterKondisi === "all" || f.kondisi === filterKondisi;
    const matchDusun = filterDusun === "Semua Dusun" || f.lokasi_dusun === filterDusun;
    return matchSearch && matchJenis && matchKondisi && matchDusun;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const resetPage = () => setPageIndex(0);

  const totalBaik = DUMMY_FASILITAS.filter((f) => f.kondisi === "Baik").length;
  const totalRusakRingan = DUMMY_FASILITAS.filter((f) => f.kondisi === "Rusak Ringan").length;
  const totalRusakBerat = DUMMY_FASILITAS.filter((f) => f.kondisi === "Rusak Berat").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fasilitas Publik</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola data fasilitas umum di wilayah desa
          </p>
        </div>
        <Button onClick={() => create("fasilitas-publik")} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Fasilitas
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={<Building2 className="h-5 w-5 text-blue-600" />} label="Total Fasilitas" value={DUMMY_FASILITAS.length} bg="bg-blue-50" />
        <StatCard icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} label="Kondisi Baik" value={totalBaik} bg="bg-emerald-50" />
        <StatCard icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} label="Rusak Ringan" value={totalRusakRingan} bg="bg-amber-50" />
        <StatCard icon={<XCircle className="h-5 w-5 text-red-500" />} label="Rusak Berat" value={totalRusakBerat} bg="bg-red-50" />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* --- DROPDOWN PAGE --- */}
        <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden md:inline-block">Tampilkan:</span>
        <Select
            value={pageSize?.toString()} 
            onValueChange={(val) => {
            setPageSize(Number(val)); 
            setPageIndex(0); 
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

        <Select value={filterJenis} onValueChange={(v) => { setFilterJenis(v); resetPage(); }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua Jenis" />
          </SelectTrigger>
          <SelectContent>
            {JENIS_LIST.map((j) => <SelectItem key={j} value={j}>{j}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterDusun} onValueChange={(v) => { setFilterDusun(v); resetPage(); }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua Dusun" />
          </SelectTrigger>
          <SelectContent>
            {DUSUN_LIST.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterKondisi} onValueChange={(v) => { setFilterKondisi(v); resetPage(); }}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua Kondisi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kondisi</SelectItem>
            <SelectItem value="Baik">Baik</SelectItem>
            <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
            <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama fasilitas..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12 text-center">No.</TableHead>
              <TableHead>Nama Fasilitas</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Lokasi (Dusun)</TableHead>
              <TableHead>Kondisi</TableHead>
              <TableHead>Keterangan</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Tidak ada data fasilitas yang ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((row, i) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  <TableCell className="text-center text-muted-foreground text-sm">
                    {pageIndex * pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{row.nama_fasilitas}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{row.jenis_kategori}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.lokasi_dusun}</TableCell>
                  <TableCell><KondisiBadge kondisi={row.kondisi} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {row.keterangan}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-50"
                        onClick={() => show("fasilitas-publik", row.id)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                        onClick={() => edit("fasilitas-publik", row.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteTarget(row)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginasi */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Menampilkan{" "}
          <span className="font-medium text-foreground">
            {filtered.length === 0 ? 0 : pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, filtered.length)}
          </span>{" "}
          dari <span className="font-medium text-foreground">{filtered.length}</span> data
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPageIndex(0)} disabled={pageIndex === 0}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPageIndex((p) => p - 1)} disabled={pageIndex === 0}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="px-3 py-1 rounded border bg-background font-medium">{pageIndex + 1} / {Math.max(1, pageCount)}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPageIndex((p) => p + 1)} disabled={pageIndex >= pageCount - 1}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex >= pageCount - 1}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* Dialog Hapus */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Fasilitas Publik</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data{" "}
              <span className="font-semibold text-foreground">{deleteTarget?.nama_fasilitas}</span>?{" "}
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                if (deleteTarget) {
                  deleteFasilitas({ resource: "fasilitas-publik", id: deleteTarget.id });
                  setDeleteTarget(null);
                }
              }}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}