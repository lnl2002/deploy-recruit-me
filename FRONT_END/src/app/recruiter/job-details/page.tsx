"use client";

import React, { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { JobDetails } from "@/screens";
import { HrLayout } from "@/components";

export default function JobDetailsPage() {
  return (
    <main>
      <HrLayout>
        <Suspense fallback={<Spinner label="Loading..." color="primary" />}>
          <JobDetails />
        </Suspense>
      </HrLayout>
    </main>
  );
}
