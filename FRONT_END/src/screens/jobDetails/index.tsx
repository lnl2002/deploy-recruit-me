"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import Header from "./components/Header";
import jobApi, { TJob } from "@/api/jobApi";
import InformationJob from "./components/InformationJob";
import { Dot } from "lucide-react";
import { Image } from "@nextui-org/react";

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
    <>
      <Header bannerUrl={job.unit?.banner} imageUrl={job.unit?.image} />
      <div className="flex justify-center">
        <div className="flex flex-col w-9/12 -mt-20 gap-4">
          <div className="flex flex-col gap-3">
            <Image
              src={job.unit?.image}
              alt=""
              radius="full"
              className="w-32 p-1 bg-themeWhite shadow-md"
            />
            <h1 className="text-themeDark text-3xl font-bold">{job.title}</h1>
            <div className="flex gap-1 items-center">
              <span className="text-sm text-blurEffect">
                {job.location?.city}
              </span>
              <Dot />
              {job.createdAt && (
                <span className="text-sm text-blurEffect">
                  {new Date(job.createdAt).toISOString().split("T")[0]}
                </span>
              )}
            </div>
          </div>

          <InformationJob job={job} />
        </div>
      </div>
    </>
  );
};

export default JobDetails;
