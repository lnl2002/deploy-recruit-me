"use client";

import React, { Suspense } from "react";
import { MainLayout } from "@/components";
import { Spinner } from "@nextui-org/react";
import { JobDetails } from "@/screens";

export default function JobDetailsPage() {
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
