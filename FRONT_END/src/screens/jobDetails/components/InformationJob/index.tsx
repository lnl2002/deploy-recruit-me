import { Dot } from "lucide-react";
import { Button, Image } from "@nextui-org/react";

import { TJob } from "@/api/jobApi";
import JobAppicationCard from "@/components/JobApplicationCard";
import JobSection from "@/components/JobSection";

type InformationJobProps = {
  job: Partial<TJob>;
  onApply: () => void;
};

const InformationJob: React.FC<InformationJobProps> = ({
  job,
  onApply,
}): React.JSX.Element => {
  const handleApply = () => {
    onApply();
  };

  if (!job?._id) return <div></div>;

  return (
    // <div className="flex justify-center">
    //   <div className="flex flex-col w-9/12 -mt-20">
    //     <Image
    //       src={job.unit?.image}
    //       alt=""
    //       radius="full"
    //       className="w-32 p-1 bg-themeWhite shadow-md"
    //     />
    //     <div className="flex flex-col gap-3 mt-14">
    //       <h1 className="text-themeDark text-3xl font-bold">{job.title}</h1>
    //       <div className="flex gap-1 items-center">
    //         <span className="text-sm text-blurEffect">
    //           {job.location?.city}
    //         </span>
    //         <Dot />
    //         <span className="text-sm text-blurEffect">
    //           {new Date(job.createdAt ?? "")?.toISOString().split("T")[0]}
    //         </span>
    //       </div>
    //     </div>
    <div className="grid grid-flow-col grid-cols-3 mt-6">
      <div className="col-span-2">
        <p className="text-themeDark text-lg font-bold">Unit Information</p>
        <div className="mt-4 flex flex-col gap-8">
          <JobSection
            title={job.unit?.name || ""}
            content={job.unit?.introduction || ""}
          />

          {job.description && (
            <JobSection
              title={"Job Description:"}
              content={job.description || ""}
            />
          )}

          {job.requests && (
            <JobSection title={"Requests:"} content={job.requests || ""} />
          )}

          {job.benefits && (
            <JobSection title={"Benefits:"} content={job.benefits || ""} />
          )}
        </div>
      </div>
      <div className="col-span-1 px-8 ">
        <div className="p-6 bg-white rounded-2xl shadow-xl border">
          <JobAppicationCard
            minSalary={job.minSalary || 0}
            maxSalary={job.maxSalary || 0}
            numberPerson={job.numberPerson || 0}
            address={job.address || ""}
            expiredDate={job.expiredDate || ""}
            career={job.career?.name || ""}
            type={job.type || ""}
          />
          <div className="mt-10">
            <Button
              onPress={handleApply}
              className="w-full py-2 bg-themeOrange text-themeWhite rounded-full hover:bg-themeOrange"
            >
              Apply Now
            </Button>
          </div>
        </div>
      </div>
    </div>
    //   </div>
    // </div>
  );
};

export default InformationJob;
