"use client";

import React from "react";
import { ListJobOwner } from "@/screens";
import { Footer, Header } from "@/components";

export default function ContactUsPage() {
  return (
    <div
      className="w-screen h-screen"
      style={{
        background: `url("../background-login.png")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header />
      <ListJobOwner />
      <Footer />
    </div>
  );
}
