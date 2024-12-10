"use client";

import React, { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { JobDetails } from "@/screens";
import { MainLayout } from "@/components";
import withAuth from "@/utils/auth";
import { Role } from "@/utils/constants";

function JobDetailsPage() {
  return (
    <main>
      <MainLayout>
        <Suspense fallback={<Spinner label="Loading..." color="primary" />}>
          <JobDetails />
        </Suspense>
      </MainLayout>
    </main>
  );
}

export default withAuth(JobDetailsPage, [Role.recruiter]);