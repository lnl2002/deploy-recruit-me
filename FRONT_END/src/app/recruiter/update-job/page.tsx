"use client";

import React from "react";
import { UpdateJob } from "@/screens";
import { MainLayout } from "@/components";

interface PageProps {
  params: {
    id: string;
  };
}

const UpdateJobPage: React.FC<PageProps> = ({ params }) => {
  return (
    <div
      className="flex flex-col"
      style={{
        backgroundImage: 'url("/background-login.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MainLayout>
        <UpdateJob id={"params.id"} />
      </MainLayout>
    </div>
  );
};

export default UpdateJobPage;
