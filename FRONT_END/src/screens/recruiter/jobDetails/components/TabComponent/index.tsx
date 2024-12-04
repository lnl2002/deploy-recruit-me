import jobApi, { TJob } from "@/api/jobApi";
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
};

const TabComponent: React.FC<TabComponentProps> = ({
  handleTabChange,
  tabSelected,
  job,
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
        </div>
      </div>
      {job?.status !== "approved" && (
        <div>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <EllipsisVertical
                size={43}
                className="p-2.5 border rounded-full cursor-pointer"
                color="#000"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions">
              <DropdownItem
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
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      )}
    </div>
  );
};

export default TabComponent;
