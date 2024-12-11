"use client";

import React from "react";
import { UpdateJob } from "@/screens";
import { MainLayout } from "@/components";
import withAuth from "@/utils/auth";
import { Role } from "@/utils/constants";

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
        <UpdateJob jobId={"params.id"} />
      </MainLayout>
    </div>
  );
};

export default withAuth(UpdateJobPage, [Role.recruiter]);
