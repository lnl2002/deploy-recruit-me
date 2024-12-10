"use client";

import React from "react";
import { MainLayout } from "@/components";
import { InterviewManagerListJobAdmin } from "@/screens";

export default function ContactUsPage() {
  return (
    <div
      className="flex flex-col"
      style={{
        background: `url('/background-login.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MainLayout>
        <div className="flex-1">
          <InterviewManagerListJobAdmin />
        </div>
      </MainLayout>
    </div>
  );
}
