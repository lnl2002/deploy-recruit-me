"use client";

import React, { Suspense } from "react";
import { CandidateList as Candidates } from "@/screens";
import { HrLayout, InterviewerLayout } from "@/components";

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
      <InterviewerLayout>
        <div className="flex-1">
          <Candidates />
        </div>
      </InterviewerLayout>
    </div>
  );
}
