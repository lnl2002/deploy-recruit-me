"use client";

import React, { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { InterviewScheduleInterviewer } from "@/screens";
import { MainLayout } from "@/components";
import withAuth from "@/utils/auth";
import { Role } from "@/utils/constants";

function Page() {
  return (
    <div
      style={{
        background: `url("/background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MainLayout>
        <Suspense fallback={<Spinner label="Loading..." color="primary" />}>
          <InterviewScheduleInterviewer />
        </Suspense>
      </MainLayout>
    </div>
  );
}

export default withAuth(Page, [Role.interviewer, Role.interviewManager]);

