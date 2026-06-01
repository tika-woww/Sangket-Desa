"use client";

import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import React from "react";

import routerProvider from "@refinedev/nextjs-router";

import "@/app/globals.css";
import { Toaster } from "@/components/refine-ui/notification/toaster";
import { useNotificationProvider } from "@/components/refine-ui/notification/use-notification-provider";
import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { authProviderClient } from "@providers/auth-provider/auth-provider.client";
import { dataProvider } from "@providers/data-provider";
import { 
  LayoutDashboard, 
  Users, 
  User, 
  Building2, 
  Gift, 
  Map 
} from "lucide-react";

type RefineContextProps = {
  children: React.ReactNode;
};

export const RefineContext = ({ children }: RefineContextProps) => {
  const notificationProvider = useNotificationProvider();

  return (
    <RefineKbarProvider>
      <ThemeProvider>
        <Refine
          dataProvider={dataProvider}
          notificationProvider={notificationProvider}
          authProvider={authProviderClient}
          routerProvider={routerProvider}
          resources={[
            {
              name: "dashboard",
              list: "/dashboard",
              meta: {
                icon: <LayoutDashboard size={18} />,
                label: "Dashboard",
              }
            },
            {
              name: "kepala-keluarga",
              list: "/kepala-keluarga",
              create: "/kepala-keluarga/create",
              edit: "/kepala-keluarga/edit/:id",
              show: "/kepala-keluarga/show/:id",
              meta: {
                icon: <Users size={18} />,
                label: "Kepala Keluarga",
                canDelete: true,
              },
            },
            {
              name: "anggota-keluarga",
              list: "/anggota-keluarga",
              create: "/anggota-keluarga/create",
              edit: "/anggota-keluarga/edit/:id",
              meta: { 
                icon: <User size={18} />,
                label: "Anggota Keluarga", 
                canDelete: true 
              },
            },
            {
              name: "fasilitas-publik",
              list: "/fasilitas-publik",
              create: "/fasilitas-publik/create",
              edit: "/fasilitas-publik/edit/:id",
              show: "/fasilitas-publik/show/:id",
              meta: { 
                icon: <Building2 size={18} />,
                label: "Fasilitas Publik", 
                canDelete: true 
              },
            },
            {
              name: "data-bantuan",
              list: "/data-bantuan",
              create: "/data-bantuan/create",
              edit: "/data-bantuan/edit/:id",
              show: "/data-bantuan/show/:id",
              meta: { 
                icon: <Gift size={18} />,
                label: "Data Bantuan", 
                canDelete: true 
              },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            // --- MENGGANTI LOGO DAN NAMA ---
            title: {
              text: "Sangket Desa",
              icon: <Map className="text-primary" />,
            },
          }}
        >
          {children}
          <Toaster />
          <RefineKbar />
        </Refine>
      </ThemeProvider>
    </RefineKbarProvider>
  );
};
