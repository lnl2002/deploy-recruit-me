"use client";

import React from "react";
import { ListJob } from "@/screens";
import { MainLayout } from "@/components";
import withAuth from "@/utils/auth";
import { Role } from "@/utils/constants";

function ContactUsPage() {
  return (
    <div
      className="flex flex-col"
      style={{
        background: `url("/background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MainLayout>
        <div className="flex-1">
          <ListJob />
        </div>
      </MainLayout>
    </div>
  );
}

export default withAuth(ContactUsPage, [Role.recruiter]);