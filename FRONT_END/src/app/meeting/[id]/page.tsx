"use client";

import React, { Suspense } from "react";
import { Footer, Header, MainLayout } from "@/components";
import { Spinner } from "@nextui-org/react";
import { Meeting } from "@/screens";

interface PageProps {
  params: {
    id: string;
  };
}

const MeetingPage: React.FC<PageProps> = ({ params }) => {
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
        <Meeting params={params} />
      </Suspense>
      <Footer />
    </div>
  );
};

export default MeetingPage;
