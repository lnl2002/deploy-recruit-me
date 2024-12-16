import { TCareer } from "@/api/careerApi";
import { TJob } from "@/api/jobApi";
import { TUnit } from "@/api/unitApi";
import JobAppicationCard from "@/components/JobApplicationCard";
import JobSection from "@/components/JobSection";
import { Modal, ModalContent, useDisclosure } from "@nextui-org/react";
import JobState from "./components/JobState";
import { getStatusJob } from "@/utils/getStatus";

type InformationJobProps = {
  job: Partial<TJob>;
};

const InformationJob: React.FC<InformationJobProps> = ({
  job,
}): React.JSX.Element => {
  const disclosure = useDisclosure();
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
        <div className="p-6 bg-white rounded-2xl shadow-xl border mb-10">
          {/* <JobState state={job.status || ''} /> */}
          <JobState
            state={
              getStatusJob(
                new Date(job?.startDate ?? ""),
                new Date(job?.expiredDate ?? ""),
                job?.status ?? ""
              ) || ""
            }
          />
        </div>
        <div className="mb-5 flex justify-center" onClick={disclosure.onOpen}>
          <img
            src="../job_process.png"
            alt="Auto Scan"
            className="w-full cursor-pointer hover:bg-backgroundDecor200 transition-colors rounded-lg"
          />
        </div>
        <Modal
          className="min-w-[90vw]"
          isOpen={disclosure.isOpen}
          onClose={disclosure.onClose}
        >
          <ModalContent>
            <div className="flex justify-center">
              <img
                src="../job_process.png"
                alt="Auto Scan"
                className="max-w-full max-h-[80vh]"
              />
            </div>
          </ModalContent>
        </Modal>
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
