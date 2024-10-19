"use client";
import { Images } from "@/images";
import {
  getKeyValue,
  Input,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { ArrowRight, Search } from "lucide-react";
import React from "react";
import AutoScan from "@/images/autoscan.svg";
import Status from "./components/status";

const ApplicationList: React.FC = () => {
  return (
    <div className="h-screen px-20">
      <div className="flex justify-between items-center mb-4">
        <div>
          <Input
            type="text"
            placeholder="Find a candidate"
            className="min-w-[300px]"
            startContent={<Search className="text-themeDark" />}
          />
        </div>
        <div className="flex gap-2 text-themeDark">
          <Select
            isRequired
            defaultSelectedKeys={["all"]}
            className="min-w-[150px]"
          >
            <SelectItem key={"all"} className="text-themeDark">
              All status
            </SelectItem>
          </Select>
          <Select
            isRequired
            defaultSelectedKeys={["newest"]}
            className="min-w-[170px] text-themeDark"
          >
            <SelectItem key={"newest"} className="text-themeDark">
              Sort by newest
            </SelectItem>
            <SelectItem key={"lastest"} className="text-themeDark">
              Sort by latest
            </SelectItem>
            <SelectItem key={"score"} className="text-themeDark">
              Sort by score
            </SelectItem>
            
          </Select>
        </div>
      </div>
      <div className="mb-5">
        <img src="../autoscan.svg" alt="Auto Scan" className="w-full cursor-pointer" />
      </div>
      <div>
        <ApplicantTable />
      </div>
    </div>
  );
};

export default ApplicationList;

const users = [
  { name: "John Smith", role: "Developer", status: "New" },
  { name: "Jane Doe", role: "Project Manager", status: "Shortlisted" },
  { name: "Michael Brown", role: "Designer", status: "Interview Pending" },
  { name: "Emily Davis", role: "Developer", status: "Accepted" },
  { name: "David Wilson", role: "QA Engineer", status: "Rejected" },
  { name: "Sarah Johnson", role: "Product Owner", status: "New" },
  { name: "Chris Lee", role: "Scrum Master", status: "Interviewed" },
  { name: "Anna Taylor", role: "Business Analyst", status: "Interview Rescheduled" },
  { name: "Tom Harris", role: "Developer", status: "Rejected" },
  { name: "Laura White", role: "UX Researcher", status: "New" },
  { name: "James Hall", role: "DevOps Engineer", status: "Shortlisted" },
  { name: "Jessica Martin", role: "Technical Writer", status: "Interview Pending" },
  { name: "Robert Clark", role: "Developer", status: "Accepted" },
  { name: "Sophia Lewis", role: "Tester", status: "Rejected" },
  { name: "Daniel Walker", role: "UI Designer", status: "Interview Rescheduled" },
];


const ApplicantTable: React.FC = () => {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 10;

  const pages = Math.ceil(users.length / rowsPerPage);

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return users.slice(start, end);
  }, [page, users]);

  return (
    <Table
      bottomContent={
        <div className="flex w-full justify-center">
          <Pagination
            isCompact
            showControls
            showShadow
            color="warning"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </div>
      }
      classNames={{
        wrapper: "min-h-[222px]",
      }}
      className="text-themeDark "
      //   isStriped={true}
    >
      <TableHeader>
        <TableColumn key="name">CANDIDATE NAME</TableColumn>
        <TableColumn key="role">APPLIED TIME</TableColumn>
        <TableColumn key="status">STATUS</TableColumn>
        <TableColumn key="action">CV</TableColumn>
      </TableHeader>
      <TableBody items={items}>
        {(item) => (
          <TableRow key={item.name}>
            {(columnKey) => (
              <TableCell className="py-4 font-bold">
                {columnKey === "action" ? (
                  <button
                    className="text-themeOrange rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex gap-1 items-center"
                  >
                    View CV <ArrowRight size='16px' />
                  </button>
                ) : columnKey === "status" ? (
                  <Status status={item.status} />
                ) : (
                  getKeyValue(item, columnKey)  // Mặc định gọi hàm getKeyValue nếu không rơi vào "action" hoặc "status"
                )}
              </TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};