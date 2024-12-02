"use client";

import React from "react";
import { HrLayout, InterviewerLayout } from "@/components";
import { InterviewManagerListJob } from "@/screens";

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
      <InterviewerLayout>
        <div className="flex-1">
          <InterviewManagerListJob />
        </div>
      </InterviewerLayout>
    </div>
  );
}
