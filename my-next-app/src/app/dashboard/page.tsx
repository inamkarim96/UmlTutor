"use client";

import dynamic from "next/dynamic";

const DashboardImpl = dynamic(() => import("@/pages/Dashboard"), {
  ssr: false,
});

export default function DashboardPage() {
  return <DashboardImpl />;
}
