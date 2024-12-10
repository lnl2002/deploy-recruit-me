"use client";

import React, { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { InterviewManagerJobDetails } from "@/screens";
import { MainLayout } from "@/components";

export default function JobDetailsPage() {
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
