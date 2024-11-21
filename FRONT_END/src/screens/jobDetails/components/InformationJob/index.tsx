import { Dot } from "lucide-react";
import {
  Button,
  Image,
  Modal,
  ModalContent,
  useDisclosure,
} from "@nextui-org/react";

import { TJob } from "@/api/jobApi";
import JobAppicationCard from "@/components/JobApplicationCard";
import JobSection from "@/components/JobSection";
import { StateBox } from "@/components/StateBox";
import { TUnit } from "@/api/unitApi";
import { TCareer } from "@/api/careerApi";
import { useAppSelector } from "@/store/store";

type InformationJobProps = {
  job: Partial<TJob>;
  onApply: () => void;
  applied?: boolean;
};

const InformationJob: React.FC<InformationJobProps> = ({
  job,
  onApply,
  applied = false,
}): React.JSX.Element => {
  const { applyInfo } = useAppSelector((state) => state.applyInfo);
  const disclosure = useDisclosure();

  const handleApply = () => {
    onApply();
  };

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
      <div className="col-span-1 px-8 ">
        
        {applyInfo?.status && (
          <div className="p-6 bg-white rounded-2xl shadow-md mb-8 border">
            <StateBox />
          </div>
        )}
        <div className="mb-5 flex justify-center" onClick={disclosure.onOpen}>
          <img
            src="../autoscan.png"
            alt="Auto Scan"
            className="w-full cursor-pointer hover:bg-backgroundDecor200 transition-colors rounded-lg"
          />
        </div>
        <Modal className="min-w-[90vw]" isOpen={disclosure.isOpen} onClose={disclosure.onClose}>
          <ModalContent>
            <div className="flex justify-center">
              <img
                src="../autoscan.png"
                alt="Auto Scan"
                className="max-w-full max-h-[80vh]"
              />
            </div>
          </ModalContent>
        </Modal>
        <div className="p-6 bg-white rounded-2xl shadow-md border">
          <JobAppicationCard
            minSalary={job.minSalary ?? 0}
            maxSalary={job.maxSalary ?? 0}
            numberPerson={job.numberPerson ?? 0}
            address={job.address ?? ""}
            expiredDate={job.expiredDate ?? ""}
            career={(job.career as Partial<TCareer>)?.name ?? ""}
            type={job.type ?? ""}
          />
          {!applied && (
            <div className="mt-10">
              <Button
                onPress={handleApply}
                className="w-full py-2 bg-themeOrange text-themeWhite rounded-full hover:bg-themeOrange"
              >
                Apply Now
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
    //   </div>
    // </div>
  );
};

export default InformationJob;
