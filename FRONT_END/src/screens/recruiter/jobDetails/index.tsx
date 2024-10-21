import { useEffect, useState } from "react";
import jobApi, { TJob } from "@/api/jobApi";
import { Image, Tab, Tabs } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { Dot } from "lucide-react";
import InformationJob from "./components/InformationJob";
import TabComponent from "./components/TabComponent";
import ApplicationList from "./components/ApplicationList";

export const JobDetails = (): React.JSX.Element => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");
  const [job, setJob] = useState<Partial<TJob>>({});
  const [tabSelected, setTabSelected] = useState<string>("overview");

  useEffect(() => {
    (async () => {
      const { job } = await jobApi.getJobById(jobId as string);
      setJob(job);
    })();
  }, [jobId]);

  const handleTabChange = (tab: string) => {
    setTabSelected(tab);
  };

  return (
    <>
      <Image src={job.unit?.banner} alt="" radius="none" />
      <div className="flex justify-center">
        <div className="flex flex-col w-9/12 -mt-16 gap-4">
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
          <TabComponent
            handleTabChange={handleTabChange}
            tabSelected={tabSelected}
          />
          {tabSelected === "overview" && <InformationJob job={job} />}
          {tabSelected === "applicants-list" && <ApplicationList jobId={jobId || ''}/>}
        </div>
      </div>
    </>
  );
};
