"use client";
import React from "react";
import { MainLayout } from "@/components";
import JobDetails from "@/screens/jobDetails";

export default function JobDetailsPage() {
  return (
    <main>
      <MainLayout>
        <JobDetails />
      </MainLayout>
    </main>
  );
}
