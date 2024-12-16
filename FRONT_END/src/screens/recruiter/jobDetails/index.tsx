"use client";
import { useEffect, useState } from "react";
import jobApi, { TJob, JobStatus } from "@/api/jobApi";
import { Image, Tab, Tabs, useDisclosure } from "@nextui-org/react";
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
import { ScheduleInterview } from "./components/ScheduleInterview";
import { ConfirmCloseJobModal } from "./components/ConfirmCloseJobModal";
import { toast } from "react-toastify";
import { isEmpty } from "@/utils/isEmpty";
import { IAccount } from "@/api/accountApi/accountApi";
import JobCriteria from "./components/JobCriteria";

//example: /job-details?id=67055dd3e22b9a4790729550
export const JobDetails = (): React.JSX.Element => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.user);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const jobId = searchParams.get("id");
  const [job, setJob] = useState<Partial<TJob>>({});
  const [tabSelected, setTabSelected] = useState<string>("overview");

  useEffect(() => {
    (async () => {
      if (!isLoggedIn) {
        toast.error("You need to login to access this page.");
        router.back();
        return;
      }

      if (userInfo?.role !== "RECRUITER") {
        toast.error("You don't have permission to access this page.");
        router.back();
        return;
      }
      const { job } = await jobApi.getJobById(jobId as string);

      if (isEmpty(job)) {
        toast.error("Job not found.");
        router.push("/recruiter/list-job");
        return;
      }

      if ((job.account as IAccount)?._id !== userInfo?._id) {
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

  const handleConfirm = async () => {
    if (isEmpty(jobId)) {
      toast.warning(`Can not close ${job?.title}`);
      return;
    }

    const newJob = await jobApi.updateJobStatus({
      jobId: jobId ?? "",
      status: "completed",
    });

    console.log(newJob);

    if (!isEmpty(newJob)) {
      setJob((prev) => ({ ...prev, status: "completed" as JobStatus }));
      toast.success("Close job is successfully");
    } else {
      toast.error("Error closing job!");
    }
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
            <h1 className="text-themeDark text-3xl font-bold">{job.title}</h1>
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
            job={job}
            onOpenModalClose={onOpen}
          />
          {tabSelected === "overview" && <InformationJob job={job} />}
          {tabSelected === "applicants-list" && (
            <ApplicationList jobId={jobId ?? ""} />
          )}
          {tabSelected === "schedule-interview" && (
            <ScheduleInterview jobId={jobId ?? ""} />
          )}
          {tabSelected === "job-criteria" && <JobCriteria job={job} />}
        </div>
      </div>
      <ConfirmCloseJobModal
        isOpen={isOpen}
        onClose={onOpenChange}
        onConfirm={handleConfirm}
      />
    </>
  );
};
