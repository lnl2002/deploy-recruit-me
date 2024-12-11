"use client";

import React from "react";
import { ListAccount } from "@/screens";
import { MainLayout } from "@/components";
import { Role } from "@/utils/constants";
import withAuth from "@/utils/auth";

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
          <ListAccount />
        </div>
      </MainLayout>
    </div>
  );
}

export default withAuth(CandidateList, [Role.admin]);