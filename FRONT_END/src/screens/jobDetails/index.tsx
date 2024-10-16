"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import Header from "./components/Header";
import jobApi, { TJob } from "@/api/jobApi";
import InformationJob from "./components/InformationJob.tsx";

const JobDetails = (): React.JSX.Element => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");
  const [job, setJob] = useState<Partial<TJob>>({});

  useEffect(() => {
    (async () => {
      const { job } = await jobApi.getJobById(jobId as string);
      setJob(job);
    })();
  }, [jobId]);

  return (
    <div>
      <Header bannerUrl={job.unit?.banner} imageUrl={job.unit?.image} />
      <InformationJob job={job} />
    </div>
  );
};

export default JobDetails;
