"use client";

import React, { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { CandidateList as Candidates } from "@/screens";
import { HrLayout } from "@/components";

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
      <HrLayout>
        <div className="flex-1">
          <Candidates />
        </div>
      </HrLayout>
    </div>
  );
}
