import React from "react";
import { Home } from "@/screens";
import { MainLayout } from "@/components";

export default function HomePage() {
  return (
    <main>
      <MainLayout>
        <Home />
      </MainLayout>
    </main>
  );
}
