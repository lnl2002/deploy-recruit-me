"use client";

import React, { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { InterviewManagerJobDetailsAdmin } from "@/screens";
import { InterviewerLayout } from "@/components";

export default function JobDetailsPage() {
  return (
    <main>
       <InterviewerLayout>
        <Suspense fallback={<Spinner label="Loading..." color="primary" />}>
          <InterviewManagerJobDetailsAdmin />
        </Suspense>
        </InterviewerLayout>
    </main>
  );
}
