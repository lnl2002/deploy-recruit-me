"use client";

import React from "react";
import { CandidateListInteviewer as Candidates } from "@/screens";
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
          <Candidates />
        </div>
      </MainLayout>
    </div>
  );
}
