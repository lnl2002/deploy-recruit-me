"use client";

import React from "react";
import { MainLayout } from "@/components";
import { InterviewManagerListJob } from "@/screens";
import { Role } from "@/utils/constants";
import withAuth from "@/utils/auth";

function ContactUsPage() {
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
          <InterviewManagerListJob />
        </div>
      </MainLayout>
    </div>
  );
}

export default withAuth(ContactUsPage, [Role.interviewManager]);
