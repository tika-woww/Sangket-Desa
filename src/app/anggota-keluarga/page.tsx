"use client";

import React, { useState } from "react";
import { useTable } from "@refinedev/react-table";
import { ColumnDef, flexRender } from "@tanstack/react-table";
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
  Users,
  UserCheck,
  UserX,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

// ─── Tipe Data ────────────────────────────────────────────────────────────────
type AnggotaKeluarga = {
  id: number;
  nik: string;
  nama_lengkap: string;
  hubungan_dalam_kk: string;
  status_penduduk: "Permanen" | "Non Permanen";
  no_kk: string;
  nama_kepala_keluarga: string;
};

// ─── Data Dummy (diganti useList nanti setelah backend siap) ─────────────────
const DUMMY_DATA: AnggotaKeluarga[] = [
  { id: 1, nik: "5108010101020001", nama_lengkap: "Ni Wayan Sari", hubungan_dalam_kk: "Istri", status_penduduk: "Permanen", no_kk: "5108011234567890", nama_kepala_keluarga: "I Wayan Sudarsana" },
  { id: 2, nik: "5108010203040002", nama_lengkap: "I Kadek Ari Putra", hubungan_dalam_kk: "Anak", status_penduduk: "Permanen", no_kk: "5108011234567890", nama_kepala_keluarga: "I Wayan Sudarsana" },
  { id: 3, nik: "5108010304050003", nama_lengkap: "Ni Komang Ayu Lestari", hubungan_dalam_kk: "Anak", status_penduduk: "Permanen", no_kk: "5108011234567890", nama_kepala_keluarga: "I Wayan Sudarsana" },
  { id: 4, nik: "5108010405060004", nama_lengkap: "I Made Suardika", hubungan_dalam_kk: "Istri", status_penduduk: "Non Permanen", no_kk: "5108019876543210", nama_kepala_keluarga: "I Nyoman Kartika" },
  { id: 5, nik: "5108010506070005", nama_lengkap: "Ni Luh Putu Indah", hubungan_dalam_kk: "Anak", status_penduduk: "Permanen", no_kk: "5108019876543210", nama_kepala_keluarga: "I Nyoman Kartika" },
  { id: 6, nik: "5108010607080006", nama_lengkap: "I Gede Wirawan", hubungan_dalam_kk: "Orang Tua", status_penduduk: "Non Permanen", no_kk: "5108015555666677", nama_kepala_keluarga: "I Putu Agus Setiawan" },
  { id: 7, nik: "5108010708090007", nama_lengkap: "Ni Made Sriasih", hubungan_dalam_kk: "Istri", status_penduduk: "Permanen", no_kk: "5108015555666677", nama_kepala_keluarga: "I Putu Agus Setiawan" },
  { id: 8, nik: "5108010809100008", nama_lengkap: "I Wayan Krisna", hubungan_dalam_kk: "Anak", status_penduduk: "Permanen", no_kk: "5108015555666677", nama_kepala_keluarga: "I Putu Agus Setiawan" },
  { id: 9, nik: "5108010910110009", nama_lengkap: "Ni Ketut Dewi Pratiwi", hubungan_dalam_kk: "Anak", status_penduduk: "Non Permanen", no_kk: "5108013333444455", nama_kepala_keluarga: "I Ketut Merta" },
  { id: 10, nik: "5108011011120010", nama_lengkap: "I Komang Bayu Saputra", hubungan_dalam_kk: "Saudara", status_penduduk: "Non Permanen", no_kk: "5108013333444455", nama_kepala_keluarga: "I Ketut Merta" },
];

// ─── Halaman Utama ────────────────────────────────────────────────────────────
export default function AnggotaKeluargaListPage() {
  const { edit, create } = useNavigation();
  const { mutate: deleteAnggota } = useDelete();

  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterKK, setFilterKK] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<AnggotaKeluarga | null>(null);
  const [pageSize, setPageSize] = useState<number>(8);

  // ── Filter data (akan diganti dengan server-side filter setelah backend siap)
  const filteredData = DUMMY_DATA.filter((item) => {
    const matchSearch =
      searchValue === "" ||
      item.nama_lengkap.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.nik.includes(searchValue);
    const matchStatus =
      filterStatus === "all" || item.status_penduduk === filterStatus;
    const matchKK =
      filterKK === "all" || item.no_kk === filterKK;
    return matchSearch && matchStatus && matchKK;
  });

  // ── Stat Cards
  const totalAnggota = DUMMY_DATA.length;
  const totalPermanen = DUMMY_DATA.filter((d) => d.status_penduduk === "Permanen").length;
  const totalNonPermanen = DUMMY_DATA.filter((d) => d.status_penduduk === "Non Permanen").length;

  // ── Daftar unik No. KK untuk filter
  const uniqueKKList = Array.from(
    new Map(DUMMY_DATA.map((d) => [d.no_kk, d.nama_kepala_keluarga])).entries()
  );

  // ── Definisi Kolom Tabel
  const columns: ColumnDef<AnggotaKeluarga>[] = [
    {
      header: "No.",
      id: "no",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.index + 1}</span>
      ),
      size: 50,
    },
    {
      accessorKey: "nik",
      header: "NIK",
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "nama_lengkap",
      header: "Nama Lengkap",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "hubungan_dalam_kk",
      header: "Hubungan KK",
      cell: ({ getValue }) => (
        <Badge variant="outline" className="text-xs">
          {getValue<string>()}
        </Badge>
      ),
    },
    {
      id: "no_kk_info",
      header: "No. KK / Kepala Keluarga",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.no_kk}
          </span>
          <span className="text-sm font-medium">{row.original.nama_kepala_keluarga}</span>
        </div>
      ),
    },
    {
      accessorKey: "status_penduduk",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue<string>();
        return (
          <Badge
            className={
              status === "Permanen"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
            }
            variant="outline"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "aksi",
      header: "Aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => edit("anggota-keluarga", row.original.id)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      size: 80,
    },
  ];

  // ── State tabel (paginasi manual karena data dummy)
  const [pageIndex, setPageIndex] = useState(0);
  const pageCount = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    pageIndex * pageSize,
    (pageIndex + 1) * pageSize
  );

  // ── Reset ke halaman 1 saat filter berubah
  const handleSearch = (v: string) => { setSearchValue(v); setPageIndex(0); };
  const handleFilterStatus = (v: string) => { setFilterStatus(v); setPageIndex(0); };
  const handleFilterKK = (v: string) => { setFilterKK(v); setPageIndex(0); };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anggota Keluarga</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Kelola data seluruh anggota keluarga terdaftar
          </p>
        </div>
        <Button onClick={() => create("anggota-keluarga")} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Anggota
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-blue-600" />}
          label="Total Anggota"
          value={totalAnggota}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<UserCheck className="h-5 w-5 text-emerald-600" />}
          label="Penduduk Permanen"
          value={totalPermanen}
          bg="bg-emerald-50"
        />
        <StatCard
          icon={<UserX className="h-5 w-5 text-amber-600" />}
          label="Non Permanen"
          value={totalNonPermanen}
          bg="bg-amber-50"
        />
      </div>

      {/* Toolbar Filter */}
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

        {/* Filter Status */}
        <Select value={filterStatus} onValueChange={handleFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="Permanen">Permanen</SelectItem>
            <SelectItem value="Non Permanen">Non Permanen</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter No. KK */}
        <Select value={filterKK} onValueChange={handleFilterKK}>
          <SelectTrigger className="w-full sm:w-[260px]">
            <SelectValue placeholder="Semua KK" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua KK</SelectItem>
            {uniqueKKList.map(([noKK, namaKK]) => (
              <SelectItem key={noKK} value={noKK}>
                {namaKK} — <span className="text-muted-foreground font-mono text-xs">{noKK}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau NIK..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
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
              <TableHead>NIK</TableHead>
              <TableHead>Nama Lengkap</TableHead>
              <TableHead>Hubungan KK</TableHead>
              <TableHead>No. KK / Kepala Keluarga</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Tidak ada data yang ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, i) => (
                <TableRow key={row.id} className="hover:bg-muted/30">
                  <TableCell className="text-center text-muted-foreground text-sm">
                    {pageIndex * pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{row.nik}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{row.nama_lengkap}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {row.hubungan_dalam_kk}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono text-xs text-muted-foreground">
                        {row.no_kk}
                      </span>
                      <span className="text-sm font-medium">
                        {row.nama_kepala_keluarga}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        row.status_penduduk === "Permanen"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
                      }
                    >
                      {row.status_penduduk}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                        onClick={() => edit("anggota-keluarga", row.id)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                        onClick={() => setDeleteTarget(row)}
                      >
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
            {filteredData.length === 0 ? 0 : pageIndex * pageSize + 1}–
            {Math.min((pageIndex + 1) * pageSize, filteredData.length)}
          </span>{" "}
          dari{" "}
          <span className="font-medium text-foreground">{filteredData.length}</span>{" "}
          data
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-3 py-1 rounded border bg-background font-medium">
            {pageIndex + 1} / {Math.max(1, pageCount)}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
            disabled={pageIndex >= pageCount - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={pageIndex >= pageCount - 1}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Anggota Keluarga</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus data{" "}
              <span className="font-semibold text-foreground">
                {deleteTarget?.nama_lengkap}
              </span>{" "}
              (NIK: {deleteTarget?.nik})? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                if (deleteTarget) {
                  deleteAnggota({
                    resource: "anggota-keluarga",
                    id: deleteTarget.id,
                  });
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