"use client";

import React from "react";
import { HrLayout } from "@/components";
import { UpdateJob } from "@/screens";

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
      <HrLayout>
        <UpdateJob id={"params.id"} />
      </HrLayout>
    </div>
  );
};

export default UpdateJobPage;
