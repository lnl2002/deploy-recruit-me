"use client";

import React from "react";
import { CandidateListInteviewer as Candidates } from "@/screens";
import { InterviewerLayout } from "@/components";

export default function CandidateList() {
  return (
    <div
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
