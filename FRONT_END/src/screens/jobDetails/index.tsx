import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TJob } from "../home/ListJob";

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
      const job = await getJobById(jobId as string);
      console.log(job);
    })();
  }, [jobId]);
  return <div>aalla</div>;
};

export default JobDetails;
