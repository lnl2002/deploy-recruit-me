"use client";

import React from "react";
import { CandidateListInteviewer as Candidates } from "@/screens";
import { MainLayout } from "@/components";
import withAuth from "@/utils/auth";
import { Role } from "@/utils/constants";

function CandidateList() {
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

export default withAuth(CandidateList, [Role.interviewer, Role.interviewManager]);
