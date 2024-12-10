"use client";

import React from "react";
import { ListAccount } from "@/screens";
import { MainLayout } from "@/components";

export default function CandidateList() {
  return (
    <div
      style={{
        background: `url("/background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MainLayout>
        <div className="flex-1">
          <ListAccount />
        </div>
      </MainLayout>
    </div>
  );
}
