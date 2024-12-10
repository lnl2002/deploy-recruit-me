"use client";

import React from "react";
import { ListJob } from "@/screens";
import { MainLayout } from "@/components";

export default function ContactUsPage() {
  return (
    <div
      className="flex flex-col"
      style={{
        background: `url("/background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MainLayout>
        <div className="flex-1">
          <ListJob />
        </div>
      </MainLayout>
    </div>
  );
}
