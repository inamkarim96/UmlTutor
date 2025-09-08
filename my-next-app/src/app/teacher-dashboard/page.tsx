"use client";

import dynamic from 'next/dynamic';

const TeacherDashboard = dynamic(() => import('@/pages/TeacherDashboard').then(m => m.default), { ssr: false });

export default function TeacherDashboardPage() {
  return <TeacherDashboard />;
}


