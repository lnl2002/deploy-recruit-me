"use client";

import React, { Suspense } from "react";
import { CandidateList as Candidates } from "@/screens";
import { MainLayout } from "@/components";

export default function CandidateList() {
  return (
    <div
      className="flex flex-col w-screen h-screen"
      style={{
        background: `url("/background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MainLayout>
        <div className="flex-1">
          <Candidates />
        </div>
      </MainLayout>
    </div>
  );
}
