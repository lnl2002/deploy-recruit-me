"use client";

import React, { Suspense } from "react";
import { Footer, Header, MainLayout } from "@/components";
import { Spinner } from "@nextui-org/react";
import { Meeting } from "@/screens";

const MeetingPage: React.FC = () => {
  return (
    <div
      className="w-screen h-screen overflow-auto"
      style={{
        background: `url("./background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />
      <Suspense fallback={<Spinner label="Loading..." color="primary" />}>
        <Meeting />
      </Suspense>
      <Footer />
    </div>
  );
};

export default MeetingPage;
