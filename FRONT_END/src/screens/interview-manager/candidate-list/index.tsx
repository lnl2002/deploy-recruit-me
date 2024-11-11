"use client";
import meetingApi from "@/api/meetingApi";
import {
  Input,
  Pagination,
  Select,
  SelectItem,
  Spinner,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Table,
} from "@nextui-org/react";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";

export const CandidateList = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState();
  const [filters, setFilters] = useState({
    type: "",
    sort: "desc",
  });

  const handleChangeFilter = (name: string,value: string) => {
    setFilters({
      ...filters,
      [name]: value,
    });
    if(name === "type"){
      setPage(1);
    }
  };

  const getCandidates = async ({
    limit,
    page,
    sortOrder,
    statusFilter,
  }: {
    limit?: number;
    page?: number;
    sortOrder?: string;
    statusFilter?: string;
  }) => {
    setIsLoading(true);
    const data = await meetingApi.getCandidateListByInterview({
      limit: limit,
      page: page,
      sortOrder: sortOrder,
      statusFilter: statusFilter
    })
    setIsLoading(false);
    console.log({data});
  }

  useEffect(() => {
    getCandidates({
      limit: 10,
      page: page,
      sortOrder: filters.sort,
      statusFilter: filters.type
    });
  }, [page])
  return (
    <div className=" text-themeDark flex justify-center">
      <div className="w-[80vw] flex flex-col gap-8 py-14">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-themeDark text-3xl">
            Candidate Listing
          </h1>
          <div className="min-w-[250px]">
            <Input
              placeholder="Find candidate list of a job"
              startContent={<Search />}
              className="w-full"
            />
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <div 
                className={`text-[14px] cursor-pointer transition ${filters.type === 'all' ? "border-b-1 border-themeDark" : "opacity-70"} `}
                onClick={() => handleChangeFilter('type', 'all')}
                >
              Candidate Listing
            </div>
            <div 
                className={`text-[14px] cursor-pointer transition ${filters.type === 'waiting' ? "border-b-1 border-themeDark" : "opacity-70"}`}
                onClick={() => handleChangeFilter('type', 'waiting')}
                >
              Waiting Interview
            </div>
            <div 
                className={`text-[14px] cursor-pointer transition ${filters.type === 'inteviewed' ? "border-b-1 border-themeDark" : "opacity-70"}`}
                onClick={() => handleChangeFilter('type', 'inteviewed')}
                >
              Interviewed Candidates
            </div>
          </div>
          <div className="flex gap-4">
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
        <div>
          <Table
            bottomContent={
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  color="warning"
                  page={page}
                  total={totalPages}
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
              <TableColumn key="name">JOB NAME</TableColumn>
              <TableColumn key="role">INTERVIEW TIME</TableColumn>
              <TableColumn key="status">PARTICIPANTS</TableColumn>
              <TableColumn key="status">STATUS</TableColumn>
              <TableColumn key="action">ACTION</TableColumn>
            </TableHeader>
            <TableBody
              loadingContent={<Spinner label="Loading..." color="warning" />}
            >
              <TableRow key="1">
                <TableCell className="py-4 font-bold"> </TableCell>
                <TableCell className="py-4 font-bold"> </TableCell>
                <TableCell className="py-4 font-bold"> </TableCell>
                <TableCell className="py-4 font-bold"> </TableCell>
                <TableCell className="py-4 font-bold"> </TableCell>
                <TableCell className="py-4 font-bold"> </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
