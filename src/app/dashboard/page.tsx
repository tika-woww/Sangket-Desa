"use client";

import { useList } from "@refinedev/core";
import {
  Users,
  Home,
  Heart,
  Building2,
  FileText,
  UserCheck,
  Bell,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const pertumbuhanData = [
  { bulan: "Jul", permanen: 3600, nonPermanen: 710 },
  { bulan: "Agu", permanen: 3680, nonPermanen: 740 },
  { bulan: "Sep", permanen: 3720, nonPermanen: 760 },
  { bulan: "Okt", permanen: 3800, nonPermanen: 800 },
  { bulan: "Nov", permanen: 3850, nonPermanen: 820 },
  { bulan: "Des", permanen: 3892, nonPermanen: 839 },
];

const aktivitasTerbaru = [
  {
    id: 1,
    teks: "KK baru ditambahkan — I Wayan Sudana",
    waktu: "2 menit lalu",
    warna: "bg-blue-500",
  },
  {
    id: 2,
    teks: "Lapor diri — Ni Kadek Ayu Lestari",
    waktu: "15 menit lalu",
    warna: "bg-emerald-500",
  },
  {
    id: 3,
    teks: "Data bantuan diperbarui — PKH batch 3",
    waktu: "1 jam lalu",
    warna: "bg-amber-500",
  },
  {
    id: 4,
    teks: "Fasilitas baru — Pura Dalem Sangket",
    waktu: "3 jam lalu",
    warna: "bg-purple-500",
  },
];

const artikelTerbaru = [
  { id: 1, judul: "Paruman Desa Adat Sangket", tanggal: "4 Jan 2026" },
  { id: 2, judul: "Piodalan Pura Dalem Desa Adat", tanggal: "29 Nov 2025" },
  { id: 3, judul: "Realisasi program bantuan desa", tanggal: "10 Nov 2025" },
];

const distribusiBantuan = [
  { nama: "PKH", jumlah: 128, persen: 75, warna: "bg-green-500" },
  { nama: "BPNT", jumlah: 96, persen: 56, warna: "bg-amber-500" },
  { nama: "BLT Dana Desa", jumlah: 55, persen: 32, warna: "bg-orange-500" },
  { nama: "Lainnya", jumlah: 33, persen: 19, warna: "bg-gray-400" },
];

interface StatCardProps {
  label: string;
  value: string | number;
  badge: string;
  badgeVariant?: "default" | "secondary" | "outline";
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ label, value, badge, icon, iconBg }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
            <Badge variant="secondary" className="mt-2 text-xs font-normal">
              {badge}
            </Badge>
          </div>
          <div className={`p-2.5 rounded-lg ${iconBg}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
//   const { data: kkData } = useList({ resource: "kepala-keluarga", pagination: { pageSize: 1 } });
//   const { data: pendudukData } = useList({ resource: "penduduk", pagination: { pageSize: 1 } });
//   const { data: bantuanData } = useList({ resource: "penerima-bantuan", pagination: { pageSize: 1 } });
//   const { data: fasilitasData } = useList({ resource: "fasilitas", pagination: { pageSize: 1 } });
//   const { data: artikelData } = useList({ resource: "artikel", pagination: { pageSize: 1 } });
//   const { data: laporDiriData } = useList({ resource: "lapor-diri", pagination: { pageSize: 1 } });

//   const totalKK = kkData?.total ?? 1248;
//   const totalPenduduk = pendudukData?.total ?? 4731;
//   const totalBantuan = bantuanData?.total ?? 312;
//   const totalFasilitas = fasilitasData?.total ?? 27;
//   const totalArtikel = artikelData?.total ?? 84;
//   const totalLaporDiri = laporDiriData?.total ?? 193;

// nilai dummy:
const totalKK = 1248;
const totalPenduduk = 4731;
const totalBantuan = 312;
const totalFasilitas = 27;
const totalArtikel = 84;
const totalLaporDiri = 193;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selamat datang kembali, Operator — Desa Adat Sangket
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total KK"
          value={totalKK.toLocaleString("id-ID")}
          badge="Kepala keluarga"
          icon={<Home className="w-4 h-4 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          label="Total penduduk"
          value={totalPenduduk.toLocaleString("id-ID")}
          badge="Jiwa terdaftar"
          icon={<Users className="w-4 h-4 text-teal-600" />}
          iconBg="bg-teal-50"
        />
        <StatCard
          label="Penerima bantuan"
          value={totalBantuan.toLocaleString("id-ID")}
          badge="Aktif"
          icon={<Heart className="w-4 h-4 text-green-600" />}
          iconBg="bg-green-50"
        />
        <StatCard
          label="Fasilitas publik"
          value={totalFasilitas.toLocaleString("id-ID")}
          badge="Terdata"
          icon={<Building2 className="w-4 h-4 text-purple-600" />}
          iconBg="bg-purple-50"
        />
        <StatCard
          label="Artikel"
          value={totalArtikel.toLocaleString("id-ID")}
          badge="Dipublikasi"
          icon={<FileText className="w-4 h-4 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          label="Lapor diri"
          value={totalLaporDiri.toLocaleString("id-ID")}
          badge="Bulan ini"
          icon={<UserCheck className="w-4 h-4 text-orange-600" />}
          iconBg="bg-orange-50"
        />
      </div>

      {/* Chart + Aktivitas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Pertumbuhan penduduk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={pertumbuhanData} barSize={14} barGap={3}>
                <XAxis
                  dataKey="bulan"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                  width={36}
                />
                <Tooltip
                  formatter={(value: number) => value.toLocaleString("id-ID")}
                  labelStyle={{ fontWeight: 500 }}
                />
                <Legend
                  iconType="square"
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="permanen" name="Permanen" fill="#378ADD" radius={[3, 3, 0, 0]} />
                <Bar dataKey="nonPermanen" name="Non-permanen" fill="#1D9E75" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Aktivitas terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aktivitasTerbaru.map((item, idx) => (
                <div key={item.id}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.warna}`} />
                    <div>
                      <p className="text-sm leading-snug">{item.teks}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.waktu}</p>
                    </div>
                  </div>
                  {idx < aktivitasTerbaru.length - 1 && (
                    <div className="border-t border-border/50 mt-3" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Status Penduduk + Distribusi Bantuan + Artikel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Penduduk */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Status penduduk
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Permanen</span>
                <span className="font-medium">3.892 jiwa</span>
              </div>
              <Progress value={82} className="h-1.5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Non-permanen</span>
                <span className="font-medium">839 jiwa</span>
              </div>
              <Progress value={18} className="h-1.5" />
            </div>
            <div className="border-t border-border/50 pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Anggota lapor diri</span>
                <span className="font-medium">193 / 312</span>
              </div>
              <Progress value={62} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        {/* Distribusi Bantuan */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Distribusi bantuan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {distribusiBantuan.map((item) => (
              <div key={item.nama} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.nama}</span>
                  <span className="font-medium">{item.jumlah}</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.warna}`}
                    style={{ width: `${item.persen}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Artikel Terbaru */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Artikel terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {artikelTerbaru.map((item, idx) => (
                <div key={item.id}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-snug">{item.judul}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.tanggal}</p>
                    </div>
                  </div>
                  {idx < artikelTerbaru.length - 1 && (
                    <div className="border-t border-border/50 mt-3" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
