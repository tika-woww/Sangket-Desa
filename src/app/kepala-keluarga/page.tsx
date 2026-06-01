"use client";

import { useState, useMemo } from "react";
import { useTable, useNavigation, useDelete } from "@refinedev/core";
import { 
  ColumnDef, 
  flexRender, 
  useReactTable, 
  getCoreRowModel 
} from "@tanstack/react-table";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Gift,
  Users,
  Upload,
  UserCheck,
  UserX,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
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
import { useRouter } from "next/navigation";

type BantuanItem = {
  id: number;
  nama: string;
};

type KepalaKeluarga = {
  id: number;
  no_kk: string;
  nik: string;
  nama_lengkap: string;
  dusun: string;
  rt: string;
  rw: string;
  status_penduduk: "permanen" | "non_permanen";
  bantuan: BantuanItem[];
};

const DUSUN_OPTIONS = ["Dusun Kaja", "Dusun Tengah", "Dusun Kelod"];

const DUMMY_DATA: KepalaKeluarga[] = [
  {
    id: 1,
    no_kk: "5108041203900001",
    nik: "5108041205800002",
    nama_lengkap: "I Wayan Sudarma",
    dusun: "Dusun Kaja",
    rt: "01",
    rw: "02",
    status_penduduk: "non_permanen",
    bantuan: [
      { id: 1, nama: "PKH" },
      { id: 2, nama: "BLT Dana Desa" },
    ],
  },
  {
    id: 2,
    no_kk: "5108041506920003",
    nik: "5108041508930005",
    nama_lengkap: "Ni Made Sriati",
    dusun: "Dusun Tengah",
    rt: "02",
    rw: "01",
    status_penduduk: "permanen",
    bantuan: [{ id: 3, nama: "Bantuan Pangan" }],
  },
  {
    id: 3,
    no_kk: "5108041809950004",
    nik: "5108041810960007",
    nama_lengkap: "Ketut Budiarta",
    dusun: "Dusun Kelod",
    rt: "03",
    rw: "01",
    status_penduduk: "permanen",
    bantuan: [],
  },
  {
    id: 4,
    no_kk: "5108042011980006",
    nik: "5108042012990008",
    nama_lengkap: "Ida Bagus Putu",
    dusun: "Dusun Kaja",
    rt: "01",
    rw: "03",
    status_penduduk: "permanen",
    bantuan: [{ id: 1, nama: "PKH" }],
  },
  {
    id: 5,
    no_kk: "5108042201010009",
    nik: "5108042203020010",
    nama_lengkap: "Komang Agus",
    dusun: "Dusun Kelod",
    rt: "04",
    rw: "02",
    status_penduduk: "non_permanen",
    bantuan: [],
  },
];

export default function KepalaKeluargaListPage() {

  const router = useRouter();

  const { show, create, edit } = useNavigation();
  const { mutate: deleteKK } = useDelete();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDusun, setFilterDusun] = useState("all");
  const [filterBantuan, setFilterBantuan] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { 
  tableQuery, 
  table 
  } = useTable({
    resource: "kepala-keluarga",
    filters: {
      permanent: [
        ...(filterStatus !== "all"
          ? [{ field: "status_penduduk", operator: "eq" as const, value: filterStatus }]
          : []),
        ...(filterDusun !== "all"
          ? [{ field: "dusun", operator: "eq" as const, value: filterDusun }]
          : []),
        ...(filterBantuan === "penerima"
          ? [{ field: "has_bantuan", operator: "eq" as const, value: true }]
          : filterBantuan === "tidak"
          ? [{ field: "has_bantuan", operator: "eq" as const, value: false }]
          : []),
        ...(search
          ? [{ field: "q", operator: "contains" as const, value: search }]
          : []),
      ],
    },
  }) as any;

  const {
    getState,
    setPageIndex,
    setPageSize,
    getPageCount,
  } = table ?? {
    getState: () => ({ pagination: { pageIndex: 0, pageSize: 10 } }),
    setPageIndex: () => {},
    getPageCount: () => 0,
    setPageSize: () => {}
  }

  const columns = useMemo<ColumnDef<KepalaKeluarga>[]>(() => [
    {
      header: "No",
      id: "no",
      cell: ({ row }) => {
        return ((getState().pageIndex ?? 1) - 1) * (getState().pageSize ?? 10) + row.index + 1;
      },
    },
    {
      header: "No. KK",
      accessorKey: "no_kk",
    },
    {
      header: "NIK",
      accessorKey: "nik",
    },
    {
      header: "Nama kepala keluarga",
      accessorKey: "nama_lengkap",
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue<string>()}</span>
      ),
    },
    {
      header: "Dusun/Banjar",
      accessorKey: "dusun",
    },
    {
      header: "RT/RW",
      accessorKey: "rt",
      cell: ({ row }) => `${row.original.rt}/${row.original.rw}`,
    },
    {
      header: "Status",
      accessorKey: "status_penduduk",
      cell: ({ getValue }) => {
        const val = getValue<string>();
        return (
          <Badge
            variant="secondary"
            className={
              val === "permanen"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
            }
          >
            {val === "permanen" ? "Permanen" : "Non-permanen"}
          </Badge>
        );
      },
    },
    {
      header: "Bantuan",
      accessorKey: "bantuan",
      cell: ({ getValue }) => {
        const bantuan = getValue<BantuanItem[]>();
        if (!bantuan || bantuan.length === 0) {
          return (
            <Badge variant="secondary" className="text-muted-foreground">
              -
            </Badge>
          );
        }
        return (
          <Badge
            variant="secondary"
            className="bg-blue-50 text-blue-800 hover:bg-blue-50"
          >
            {bantuan.map((b) => b.nama).join(", ")}
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      id: "aksi",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-50"
            onClick={() => show("kepala-keluarga", row.original.id)}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
            onClick={() => edit("kepala-keluarga", row.original.id)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
            onClick={() => setDeleteId(row.original.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], [show, edit]);;


  

  const tableInstance = useReactTable({
    data: DUMMY_DATA, 
    columns,
    getCoreRowModel: getCoreRowModel(), 
  });

  const permanen = 4;
  const nonPermanen = 1;
  const penerimaBantuan = 3;
  const total = DUMMY_DATA.length;
  const from = ((getState().pageIndex ?? 1) - 1) * (getState().pageSize ?? 10) + 1;
  const to = Math.min((getState().pageIndex ?? 1) * (getState().pageSize ?? 10), total);

  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      deleteKK({ resource: "kepala-keluarga", id: deleteId });
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Data kepala keluarga
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Desa Adat Sangket — total {total.toLocaleString("id-ID")} KK terdaftar
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-1.5"
            onClick={() => router.push("/kepala-keluarga/import")}>
            <Upload className="h-4 w-4" />
            Import Excel
            </Button>
            <Button
            className="gap-2"
            onClick={() => create("kepala-keluarga")}
            >
            <Plus className="h-4 w-4" />
            Tambah KK
            </Button>
        </div>
      </div>

      {/* Mini stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { 
            label: "Total KK", 
            value: total, 
            icon: <Users className="h-5 w-5 text-blue-600" />,
            bg: "bg-blue-100" 
          },
          { 
            label: "Permanen", 
            value: permanen, 
            icon: <UserCheck className="h-5 w-5 text-green-600" />,
            bg: "bg-green-100"
          },
          { 
            label: "Non-permanen", 
            value: nonPermanen, 
            icon: <UserX className="h-5 w-5 text-amber-600" />,
            bg: "bg-amber-100"
          },
          { 
            label: "Penerima bantuan", 
            value: penerimaBantuan, 
            icon: <Gift className="h-5 w-5 text-purple-600" />,
            bg: "bg-purple-100"
          },
        ].map((s) => (
          <StatCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            bg={s.bg}
          />
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* --- DROPDOWN PAGE --- */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden md:inline-block">Tampilkan:</span>
          <Select
            value={getState().pageSize?.toString()} 
            onValueChange={(val) => {
              setPageSize(Number(val)); 
              setPageIndex(1); 
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

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px] h-9 text-sm">
            <SelectValue placeholder="Semua status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="permanen">Permanen</SelectItem>
            <SelectItem value="non_permanen">Non-permanen</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterDusun} onValueChange={setFilterDusun}>
          <SelectTrigger className="w-[150px] h-9 text-sm">
            <SelectValue placeholder="Semua dusun" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua dusun</SelectItem>
            {DUSUN_OPTIONS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterBantuan} onValueChange={setFilterBantuan}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="Semua bantuan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua bantuan</SelectItem>
            <SelectItem value="penerima">Penerima bantuan</SelectItem>
            <SelectItem value="tidak">Tidak menerima</SelectItem>
          </SelectContent>
        </Select>

        <div className="w-px h-6 bg-border flex-shrink-0" />

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-9 text-sm"
            placeholder="Cari nama, NIK, atau No. KK..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            {tableInstance.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/50 hover:bg-muted/50">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="text-xs font-medium">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {false ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground text-sm">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : tableInstance.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-10 text-muted-foreground text-sm">
                  Tidak ada data ditemukan
                </TableCell>
              </TableRow>
            ) : (
              tableInstance.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Paginasi */}
        <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-muted-foreground">
          <span>
            Menampilkan{" "}
            <span className="font-medium text-foreground">
              {tableInstance.getRowModel().rows.length === 0 
                ? 0 
                : getState().pagination.pageIndex * getState().pagination.pageSize + 1}
              –
              {Math.min(
                (getState().pagination.pageIndex + 1) * getState().pagination.pageSize,
                total
              )}
            </span>{" "}
            dari{" "}
            <span className="font-medium text-foreground">{total.toLocaleString("id-ID")}</span>{" "}
            data
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPageIndex(0)}
              disabled={getState().pagination.pageIndex === 0}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPageIndex(Math.max(0, getState().pagination.pageIndex - 1))}
              disabled={getState().pagination.pageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="px-3 py-1 rounded border bg-background font-medium text-sm">
              {getState().pagination.pageIndex + 1} / {Math.max(1, getPageCount())}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPageIndex(Math.min(getPageCount() - 1, getState().pagination.pageIndex + 1))}
              disabled={getState().pagination.pageIndex >= getPageCount() - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPageIndex(getPageCount() - 1)}
              disabled={getState().pagination.pageIndex >= getPageCount() - 1}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog konfirmasi hapus */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus data kepala keluarga?</AlertDialogTitle>
            <AlertDialogDescription>
              Data KK beserta seluruh anggota keluarga akan dihapus permanen dan tidak bisa dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleConfirmDelete}
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