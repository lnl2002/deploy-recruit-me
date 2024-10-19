"use client";

import React from "react";
import { Footer, Header } from "@/components";
import { ListJob } from "@/screens";

export default function ContactUsPage() {
  return (
    <div
      className="flex flex-col w-screen h-screen"
      style={{
        background: `url("../background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />
      <div className="flex-1">
        <ListJob />
      </div>
      <Footer />
    </div>
  );
}
