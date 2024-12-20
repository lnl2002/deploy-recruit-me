"use client";
import { useEffect, useState } from "react";
import jobApi, { TJob } from "@/api/jobApi";
import { Image, Tab, Tabs } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { Dot } from "lucide-react";
import InformationJob from "./components/InformationJob";
import TabComponent from "./components/TabComponent";
import ApplicationList from "./components/ApplicationList";
import JobPosting from "@/type/job";
import { useAppDispatch } from "@/store/store";
import { setJob as saveJob } from "@/store/jobState";
import { TUnit } from "@/api/unitApi";
import { TLocation } from "@/api/locationApi";
import JobStatus from "./components/JobStatus";

//example: /job-details?id=67055dd3e22b9a4790729550
export const InterviewManagerJobDetailsAdmin = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");
  const [job, setJob] = useState<Partial<TJob>>({});
  const [tabSelected, setTabSelected] = useState<string>("overview");

  useEffect(() => {
    (async () => {
      const { job } = await jobApi.getJobById(jobId as string);
      setJob(job);
      dispatch(saveJob(job as any));
    })();
  }, [jobId]);

  const handleTabChange = (tab: string) => {
    setTabSelected(tab);
  };

  return (
    <>
      <Image src={(job.unit as Partial<TUnit>)?.banner} alt="" radius="none" />
      <div className="flex justify-center">
        <div className="flex flex-col w-9/12 -mt-16 gap-4">
          <div className="flex flex-col gap-3">
            <Image
              src={(job.unit as Partial<TUnit>)?.image}
              alt=""
              radius="full"
              className="w-32 p-1 bg-themeWhite shadow-md"
            />
            <div className="flex items-center gap-2">
              <h1 className="text-themeDark text-3xl font-bold">{job.title}</h1>
              <JobStatus status={job.status || ""} key={job.status} />
            </div>
            <div className="flex gap-1 items-center">
              <span className="text-sm text-blurEffect">
                {(job.location as Partial<TLocation>)?.city}
              </span>
              <Dot />
              {job.startDate && (
                <span className="text-sm text-blurEffect">
                  {new Date(job.startDate).toISOString().split("T")[0]}
                </span>
              )}
            </div>
          </div>
          <TabComponent
            handleTabChange={handleTabChange}
            tabSelected={tabSelected}
          />
          {tabSelected === "overview" && <InformationJob job={job} />}
          {tabSelected === "applicants-list" && (
            <ApplicationList jobId={jobId ?? ""} />
          )}
        </div>
      </div>
    </>
  );
};
