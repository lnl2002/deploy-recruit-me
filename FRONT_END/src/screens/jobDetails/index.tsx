import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TJob } from "../home/ListJob";
import { Image } from "@nextui-org/react";
import Header from "./components/Header";
import InformationJob from "./components/InformationJob.tsx";

const JobDetails = (): React.JSX.Element => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");
  const [job, setJob] = useState<Partial<TJob>>({});

  async function getJobById(id: string) {
    try {
      const res = await fetch("http://localhost:9999/api/v1/jobs/" + id);
      const data = await res.json();
      if (data.status === 200) {
        return { job: data.data };
      } else {
        return { job: {} };
      }
    } catch (error) {
      return { job: {} };
    }
  }

  useEffect(() => {
    (async () => {
      const { job } = await getJobById(jobId as string);
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
