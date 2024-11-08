import { TCareer } from "@/api/careerApi";
import { TJob } from "@/api/jobApi";
import { TUnit } from "@/api/unitApi";
import JobAppicationCard from "@/components/JobApplicationCard";
import JobSection from "@/components/JobSection";

type InformationJobProps = {
  job: Partial<TJob>;
};

const InformationJob: React.FC<InformationJobProps> = ({
  job,
}): React.JSX.Element => {
  if (!job?._id) return <div></div>;

  return (
    <div className="grid grid-flow-col grid-cols-3 mt-6">
      <div className="col-span-2">
        <p className="text-themeDark text-lg font-bold">Unit Information</p>
        <div className="mt-4 flex flex-col gap-8">
          <JobSection
            title={(job.unit as Partial<TUnit>)?.name ?? ""}
            content={(job.unit as Partial<TUnit>)?.introduction ?? ""}
          />

          {job.description && (
            <JobSection
              title={"Job Description:"}
              content={job.description ?? ""}
              isHtml={true}
            />
          )}

          {job.requests && (
            <JobSection
              title={"Requests:"}
              content={job.requests ?? ""}
              isHtml={true}
            />
          )}

          {job.benefits && (
            <JobSection
              title={"Benefits:"}
              content={job.benefits ?? ""}
              isHtml={true}
            />
          )}
        </div>
      </div>
      <div className="col-span-1 px-8">
        <div className="p-6 bg-white rounded-2xl shadow-xl border">
          <JobAppicationCard
            minSalary={job.minSalary ?? 0}
            maxSalary={job.maxSalary ?? 0}
            numberPerson={job.numberPerson ?? 0}
            address={job.address ?? ""}
            expiredDate={job.expiredDate ?? ""}
            career={(job.career as Partial<TCareer>)?.name ?? ""}
            type={job.type ?? ""}
          />
        </div>
      </div>
    </div>
  );
};

export default InformationJob;
