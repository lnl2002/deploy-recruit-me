import { Pagination } from "@nextui-org/react";
import { TJob } from "..";
import Job from "./Job";
import { useRouter } from "next/navigation";

type ListJobProps = {
  jobs: TJob[];
  totalPage: number;
  handleChangePage: (page: number) => void;
};

const ListJobView: React.FC<ListJobProps> = ({
  jobs,
  totalPage,
  handleChangePage,
}): React.JSX.Element => {
  const router = useRouter();
  const handleNavigate = (id: string) => {
    router.push(`/job-details?id=${id}`);
  };
  return (
    <div className="col-span-2 flex flex-col gap-4">
      {jobs.map((job) => (
        <Job
          id={job._id}
          key={job._id}
          title={job.title}
          unit={job.unit.name}
          location={job.unit.location.city}
          minSalary={job.minSalary}
          maxSalary={job.maxSalary}
          expiredDate={job.expiredDate}
          type={job.type}
          handleNavigate={handleNavigate}
        />
      ))}
      {jobs.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-2xl text-blurEffect text-center p-6 border-2 rounded-lg shadow-md">
            No jobs found...
          </h1>
        </div>
      )}
      {totalPage > 1 && (
        <div className="flex-1 flex flex-row justify-center mt-4">
          <Pagination
            radius={"full"}
            onChange={handleChangePage}
            loop
            showControls
            total={totalPage}
            initialPage={1}
          />
        </div>
      )}
    </div>
  );
};

export default ListJobView;
