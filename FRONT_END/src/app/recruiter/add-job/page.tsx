"use client";
import React from "react";
import { MainLayout } from "@/components";
import { AddJob } from "@/screens";
import withAuth from "@/utils/auth";
import { Role } from "@/utils/constants";

function AddJobPage() {
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
        <AddJob />
      </MainLayout>
    </div>
  );
}

export default withAuth(AddJobPage, [Role.recruiter]);