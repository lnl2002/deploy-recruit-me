import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { EllipsisVertical } from "lucide-react";

type TabComponentProps = {
  tabSelected: string;
  handleTabChange: (tab: string) => void;
};

const TabComponent: React.FC<TabComponentProps> = ({
  handleTabChange,
  tabSelected,
}): React.JSX.Element => {
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
      <div>
        <Dropdown>
          <DropdownTrigger>
            <EllipsisVertical
              size={43}
              className="p-2.5 border rounded-full cursor-pointer"
              color="#000"
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Static Actions">
            <DropdownItem className="text-themeDark">Edit</DropdownItem>
            <DropdownItem key="delete" className="text-danger" color="danger">
              Delete
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
};

export default TabComponent;
