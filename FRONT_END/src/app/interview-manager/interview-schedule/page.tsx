"use client";

import React, { Suspense } from "react";
import { Spinner } from "@nextui-org/react";
import { InterviewerLayout } from "@/components";
import { InterviewSchedule } from "@/screens/interview-manager/inteviewSchedule";

export default function Page() {
  return (
    <main>
       <InterviewerLayout>
        <Suspense fallback={<Spinner label="Loading..." color="primary" />}>
          <InterviewSchedule />
        </Suspense>
        </InterviewerLayout>
    </main>
  );
}
