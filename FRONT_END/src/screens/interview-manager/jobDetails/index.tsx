"use client";
import { useEffect, useState } from "react";
import jobApi, { TJob } from "@/api/jobApi";
import { Image, Tab, Tabs } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dot } from "lucide-react";
import InformationJob from "./components/InformationJob";
import TabComponent from "./components/TabComponent";
import ApplicationList from "./components/ApplicationList";
import JobPosting from "@/type/job";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { setJob as saveJob } from "@/store/jobState";
import { TUnit } from "@/api/unitApi";
import { TLocation } from "@/api/locationApi";
import JobStatus from "./components/JobStatus";
import { getStatusJob } from "@/utils/getStatus";
import JobCriteria from "./components/JobCriteria";
import { toast } from "react-toastify";
import { isEmpty } from "@/utils/isEmpty";
import { IAccount } from "@/api/accountApi/accountApi";

//example: /job-details?id=67055dd3e22b9a4790729550
export const InterviewManagerJobDetails = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");
  const router = useRouter();
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.user);
  const [job, setJob] = useState<Partial<TJob>>({});
  const [tabSelected, setTabSelected] = useState<string>("overview");

  useEffect(() => {
    (async () => {
      if (!isLoggedIn) {
        toast.error("You need to login to access this page.");
        router.back();
        return;
      }

      if (userInfo?.role !== "INTERVIEW_MANAGER") {
        toast.error("You don't have permission to access this page.");
        router.back();
        return;
      }
      const { job } = await jobApi.getJobById(jobId as string);

      if (isEmpty(job)) {
        toast.error("Job not found.");
        router.push("/interview-manager/list-job");
        return;
      }

      if ((job.interviewManager as IAccount)?._id !== userInfo?._id) {
        toast.error("You don't have permission to access this page.");
        router.back();
        return;
      }
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
              <JobStatus
                status={getStatusJob(
                  new Date(job?.startDate ?? ""),
                  new Date(job?.expiredDate ?? ""),
                  job?.status ?? ""
                )}
                key={getStatusJob(
                  new Date(job.startDate ?? ""),
                  new Date(job.expiredDate ?? ""),
                  job?.status ?? ""
                )}
              />
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
          {tabSelected === "job-criteria" && <JobCriteria job={job} />}
        </div>
      </div>
    </>
  );
};
