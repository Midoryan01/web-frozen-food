// app/dashboard/layout.tsx
import React from 'react';
import Sidebar from './components/Sidebar'; // Komponen Sidebar yang akan kita buat
import Header from './components/Header';   // Komponen Header yang akan kita buat

interface DashboardLayoutProps {
  children: React.ReactNode;
}


export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <>{children}</>
  );
}
