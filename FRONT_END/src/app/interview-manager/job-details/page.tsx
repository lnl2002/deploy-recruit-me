"use client";

import React, { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { InterviewManagerJobDetails } from "@/screens";
import { MainLayout } from "@/components";
import { Role } from "@/utils/constants";
import withAuth from "@/utils/auth";

function JobDetailsPage() {
  return (
    <main>
       <MainLayout>
        <Suspense fallback={<Spinner label="Loading..." color="primary" />}>
          <InterviewManagerJobDetails />
        </Suspense>
        </MainLayout>
    </main>
  );
}

export default withAuth(JobDetailsPage, [Role.interviewManager]);