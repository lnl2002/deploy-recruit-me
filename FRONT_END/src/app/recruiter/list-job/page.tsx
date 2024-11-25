"use client";

import React from "react";
import { HrLayout } from "@/components";
import { ListJob } from "@/screens";

export default function ContactUsPage() {
  return (
    <div
      className="flex flex-col"
      style={{
        background: `url("/background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <HrLayout>
        <div className="flex-1">
          <ListJob />
        </div>
      </HrLayout>
    </div>
  );
}
