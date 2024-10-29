"use client";

import React, { Suspense } from "react";
import { MainLayout } from "@/components";
import { Spinner } from "@nextui-org/react";
import { Meeting } from "@/screens";

const MeetingPage: React.FC = () => {
  return (
    <main className="">
      <MainLayout>
        <Suspense fallback={<Spinner label="Loading..." color="primary" />}>
          <Meeting />
        </Suspense>
      </MainLayout>
    </main>
  );
};

export default MeetingPage;
