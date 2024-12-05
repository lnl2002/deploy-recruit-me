"use client";
import { useCallback, useEffect, useState } from "react";

import jobApi, { TJob } from "@/api/jobApi";
import { Plus, Search } from "lucide-react";
import { Button, Input } from "@nextui-org/react";
import { useRouter } from "next/navigation";

import JobSection from "./components/jobSection";
import FilterSection from "./components/filterSection";
import { debounce } from "@/utils/debounce";

export const InterviewManagerListJob = (): React.JSX.Element => {
  const router = useRouter();
  const [limit] = useState(10);
  const [params, setParams] = useState<string>("");
  const [jobTotal, setJobTotal] = useState<number>(0);
  const [listJob, setListJob] = useState<TJob[] | []>();
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");

  const fetchJobs = useCallback(
    debounce(async (searchTerm) => {
      const { data, totalPages } = await jobApi.getJobsByInterviewManager({
        limit: 10,
        page: currentPage,
        status: filterValue,
        search: searchTerm,
      });
      setListJob(data);
      setJobTotal(totalPages);
    }, 500),
    [currentPage, filterValue]
  );

  useEffect(() => {
    let params = "";
    const limitPage = currentPage * limit;
    if (filterValue) {
      params = `&status=${filterValue}`;
    }
    if (currentPage) params += `&limit=${limitPage}&skip=${limitPage - limit}`;

    setParams(params);
  }, [filterValue, currentPage]);

  useEffect(() => {
    (async () => {
      const { data, totalPages } = await jobApi.getJobsByInterviewManager({
        limit: 10,
        page: currentPage,
        status: filterValue,
        search,
      });
      setListJob(data);
      setJobTotal(totalPages);
    })();
  }, [params]);

  useEffect(() => {
    fetchJobs(search);
  }, [search, fetchJobs]);

  const handleChangePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex justify-center">
      <div className="w-[85vw] flex flex-col gap-8 py-6">
        <div className="w-full flex justify-between">
          <h1 className="font-bold text-themeDark text-3xl">My Job</h1>
          <div>
            <Input
              placeholder="Search Job"
              startContent={<Search className="text-themeDark" />}
              className="min-w-[300px]"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-flow-col grid-cols-5">
          <div className="col-span-1">
            <FilterSection
              setFilterValue={setFilterValue}
              filterValue={filterValue}
            />
          </div>
          <div className="col-span-4">
            <JobSection
              listJob={listJob ?? []}
              totalPage={jobTotal / limit}
              filterValue={filterValue}
              handleChangePage={handleChangePage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
