"use client";
import applyApi, { IApply, IResposeApply, QApply } from "@/api/applyApi";
import {
  Button,
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
import { ArrowRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import Empty from "../recruiter/jobDetails/components/ApplicationList/components/empty";
import { formatDateTime } from "@/utils/formatDateTime";
import Status from "../recruiter/jobDetails/components/ApplicationList/components/status";
import { useRouter } from "next/navigation";

export const MyApplications = (): React.JSX.Element => {
  const route = useRouter();
  const [applies, setApplies] = useState<IResposeApply[]>();
  const [statuses, setStatuses] = useState<{ name: string; _id: string }[]>();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number>();
  const [query, setQuery] = useState<QApply>({
    status: undefined,
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    loadApplies(); // Call the function to load the applies
    loadStatuses();
  }, []);

  useEffect(() => {
    loadApplies();
  }, [query]);

  async function loadApplies() {
    try {
      const response = await applyApi.getApplicationsById(query);

      // Use the fetched applies data
      console.log(response.data.totalPages);
      setTotalPages(response.data.totalPages);
      setApplies(response.data.applies);
    } catch (error) {
      console.error("Error loading applies:", error);
    }
  }

  async function loadStatuses() {
    const response = await applyApi.fetchStatuses();
    setStatuses(response.data);
  }

  return (
    <div className="flex flex-col justify-center items-center  mt-10">
      <div className="w-9/12 flex flex-col items-center mb-4">
        <div className="flex flex-row w-full justify-between mb-5">
          <div>
            <p className="text-themeDark font-bold text-4xl">My Application</p>
          </div>
          <div className="flex gap-2 text-themeDark">
            <Select
              isRequired
              defaultSelectedKeys={["all"]}
              className="min-w-[150px]"
              onChange={(e) => {
                setQuery({
                  ...query,
                  status: e.target.value != "all" ? e.target.value : undefined,
                });
              }}
            >
              <SelectItem key={"all"} className="text-themeDark">
                All status
              </SelectItem>
              {statuses &&
                statuses.length > 0 &&
                statuses?.map((item) => (
                  <SelectItem key={item._id} className="text-themeDark">
                    {item.name}
                  </SelectItem>
                ))}
            </Select>
            <Select
              isRequired
              defaultSelectedKeys={["newest"]}
              className="min-w-[170px] text-themeDark"
              onChange={(e) => {
                console.log("Selected Status:", e.target.value); // Log the selected value
                setQuery({
                  ...query,
                  sortOrder: e.target.value == "newest" ? "desc" : "asc",
                });
              }}
            >
              <SelectItem key={"newest"} className="text-themeDark">
                Sort by newest
              </SelectItem>
              <SelectItem key={"lastest"} className="text-themeDark">
                Sort by latest
              </SelectItem>
            </Select>
          </div>
        </div>

        {applies && applies.length > 0 ? (
          <Table
            bottomContent={
              <div className="flex justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="warning"
                  page={query.page}
                  total={totalPages ?? 1}
                  onChange={(page) =>
                    setQuery({
                      ...query,
                      page,
                    })
                  }
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
              <TableColumn key="name">JOB NAME</TableColumn>
              <TableColumn key="name">Location</TableColumn>
              <TableColumn key="role">APPLIED TIME</TableColumn>
              <TableColumn key="status">STATUS</TableColumn>
              <TableColumn key="action">ACTION</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<Spinner label="Loading..." color="warning" />}
            >
              {applies && applies.length > 0 ? (
                applies.map((apply: IResposeApply) => (
                  <TableRow key={apply._id}>
                    <TableCell className="py-4 font-bold">
                      <Button
                        onClick={() =>
                          route.push("/job-details?id=" + apply.job._id)
                        }
                      >
                        {apply.job.title}
                      </Button>
                    </TableCell>
                    <TableCell className="py-4 font-bold">
                      {apply.job.address}
                    </TableCell>
                    <TableCell className="py-4 font-bold">
                      {formatDateTime(apply.createdAt)}
                    </TableCell>
                    <TableCell className="py-4 font-bold">
                      <Status status={apply.status.name} />
                    </TableCell>
                    <TableCell className="py-4 font-bold">
                      <button
                        className="text-themeOrange rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex gap-1 items-center"
                        onClick={() => {
                          route.push("/job-details?id=" + apply.job._id)
                        }}
                      >
                        View <ArrowRight size="16px" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow key="1">
                  <TableCell className="py-4 font-bold"> </TableCell>
                  <TableCell className="py-4 font-bold"> </TableCell>
                  <TableCell className="py-4 font-bold"> </TableCell>
                  <TableCell className="py-4 font-bold"> </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        ) : (
          <Empty />
        )}
      </div>
    </div>
  );
};
