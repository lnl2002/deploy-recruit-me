import { TJob } from "@/api/jobApi";
import { Image } from "@nextui-org/react";
import { Dot } from "lucide-react";

type InformationJobProps = {
  job: Partial<TJob>;
};

const InformationJob: React.FC<InformationJobProps> = ({
  job,
}): React.JSX.Element => {
  if (!job?._id) return <div></div>;

  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-11/12 -mt-20">
        <Image
          src={job.unit?.image}
          alt=""
          radius="full"
          className="w-32 p-1 bg-themeWhite shadow-md"
        />
        <div className="flex flex-col gap-3 mt-14">
          <h1 className="text-themeDark text-3xl font-bold">{job.title}</h1>
          <div className="flex gap-1 items-center">
            <span className="text-sm text-blurEffect">
              {job.location?.city}
            </span>
            <Dot />
            <span className="text-sm text-blurEffect">
              {new Date(job.createdAt ?? "")?.toISOString().split("T")[0]}
            </span>
          </div>
        </div>
        <div className="grid grid-flow-col grid-cols-3">
          <div className="col-span-2"></div>
          <div className="col-span-1"></div>
        </div>
      </div>
    </div>
  );
};

export default InformationJob;
