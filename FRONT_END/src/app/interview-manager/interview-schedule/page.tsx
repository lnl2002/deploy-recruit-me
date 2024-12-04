"use client";

import React, { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { InterviewerLayout } from "@/components";
import { InterviewSchedule } from "@/screens/interview-manager/inteviewSchedule";

export default function Page() {
  return (
    <div
      style={{
        background: `url("/background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <InterviewerLayout>
        <Suspense fallback={<Spinner label="Loading..." color="primary" />}>
          <InterviewSchedule />
        </Suspense>
      </InterviewerLayout>
    </div>
  );
}
