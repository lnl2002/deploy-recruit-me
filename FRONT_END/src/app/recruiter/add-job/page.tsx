"use client";
import React from "react";
import { MainLayout } from "@/components";
import { AddJob } from "@/screens";

export default function AddJobPage() {
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
