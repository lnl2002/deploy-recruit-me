"use client";

import React, { Suspense } from "react";
import { MainLayout } from "@/components";
import JobDetails from "@/screens/jobDetails";
import { Spinner } from "@nextui-org/react";

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
