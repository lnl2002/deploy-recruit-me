"use client";

import React from "react";
import { InterviewerLayout } from "@/components";
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
      <InterviewerLayout>
        <div className="flex-1">
          <InterviewManagerListJobAdmin />
        </div>
      </InterviewerLayout>
    </div>
  );
}
