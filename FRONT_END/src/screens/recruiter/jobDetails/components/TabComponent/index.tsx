import jobApi, { JobStatus, TJob } from "@/api/jobApi";
import { getStatusJob } from "@/utils/getStatus";
import { isEmpty } from "@/utils/isEmpty";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type TabComponentProps = {
  tabSelected: string;
  handleTabChange: (tab: string) => void;
  job: Partial<TJob>;
  onOpenModalClose: () => void;
};

const TabComponent: React.FC<TabComponentProps> = ({
  handleTabChange,
  tabSelected,
  job,
  onOpenModalClose,
}): React.JSX.Element => {
  const router = useRouter();

  const handleDeleteJob = async () => {
    if (isEmpty(job)) return;
    const { job: newJob } = await jobApi.deleteJob(job?._id ?? "");
    if (newJob) {
      toast.success("Job deleted successfully!");
      router.push("/recruiter/list-job");
    }
  };

  return (
    <div className="flex justify-between">
      <div>
        <div className="flex flex-row gap-2">
          <div
            className={`cursor-pointer px-3 py-1 ${
              tabSelected === "overview" ? "border-b-2 border-themeDark" : ""
            }`}
            onClick={() => handleTabChange("overview")}
          >
            <p
              className={`${
                tabSelected === "overview"
                  ? "text-themeDark"
                  : "text-backgroundDecor500"
              }`}
            >
              Overview
            </p>
          </div>
          <div
            className={`cursor-pointer px-3 py-1 ${
              tabSelected === "applicants-list"
                ? "border-b-2 border-themeDark"
                : ""
            }`}
            onClick={() => handleTabChange("applicants-list")}
          >
            <p
              className={`${
                tabSelected === "applicants-list"
                  ? "text-themeDark"
                  : "text-backgroundDecor500"
              }`}
            >
              Applicants List
            </p>
          </div>
          <div
            className={`cursor-pointer px-3 py-1 ${
              tabSelected === "schedule-interview"
                ? "border-b-2 border-themeDark"
                : ""
            }`}
            onClick={() => handleTabChange("schedule-interview")}
          >
            <p
              className={`${
                tabSelected === "schedule-interview"
                  ? "text-themeDark"
                  : "text-backgroundDecor500"
              }`}
            >
              Schedule Interview
            </p>
          </div>
          <div
            className={`cursor-pointer px-3 py-1 ${
              tabSelected === "job-criteria"
                ? "border-b-2 border-themeDark"
                : ""
            }`}
            onClick={() => handleTabChange("job-criteria")}
          >
            <p
              className={`${
                tabSelected === "job-criteria"
                  ? "text-themeDark"
                  : "text-backgroundDecor500"
              }`}
            >
              Job Criteria
            </p>
          </div>
        </div>
      </div>
      {/* {job?.status !== "approved" && ( */}
      <div>
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <EllipsisVertical
              size={43}
              className="p-2.5 border rounded-full cursor-pointer"
              color="#000"
            />
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Static Actions"
            disabledKeys={[
              ...(job.status === JobStatus.COMPLETED ||
              job.status === JobStatus.REJECTED
                ? ["close"]
                : []),
              ...(job.status === JobStatus.APPROVED ? ["delete"] : []),
              ...(job.status === JobStatus.APPROVED &&
              getStatusJob(
                new Date(job.startDate as string),
                new Date(job.expiredDate as string),
                job.status
              ) !== JobStatus.EXPIRED
                ? ["edit"]
                : []),
              ...(job.isDelete ? ["edit"] : []),
            ]}
          >
            <DropdownItem
              key="close"
              className="text-themeDark"
              onClick={onOpenModalClose}
            >
              Close
            </DropdownItem>
            <DropdownItem
              key="edit"
              className="text-themeDark"
              onClick={() => {
                router.push(`/recruiter/update-job/${job?._id ?? ""}`);
              }}
            >
              Edit
            </DropdownItem>
            <DropdownItem
              key="delete"
              className="text-danger"
              color="danger"
              onClick={handleDeleteJob}
            >
              Hide
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
      {/* )} */}
    </div>
  );
};

export default TabComponent;
