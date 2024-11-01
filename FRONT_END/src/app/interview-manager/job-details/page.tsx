"use client";

import React, { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { InterviewManagerJobDetails } from "@/screens";
import { HrLayout } from "@/components";

export default function JobDetailsPage() {
  return (
    <main>
      <HrLayout>
        <Suspense fallback={<Spinner label="Loading..." color="primary" />}>
          <InterviewManagerJobDetails />
        </Suspense>
      </HrLayout>
    </main>
  );
}
