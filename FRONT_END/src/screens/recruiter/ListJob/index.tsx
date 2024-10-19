import { useEffect, useState } from "react";

import jobApi, { TJob } from "@/api/jobApi";
import { Plus } from "lucide-react";
import { Button } from "@nextui-org/react";

import JobSection from "./components/jobSection";
import FilterSection from "./components/filterSection";

export const ListJob = (): React.JSX.Element => {
  const [limit] = useState(10);
  const [params, setParams] = useState<string>("");
  const [jobTotal, setJobTotal] = useState<number>(0);
  const [listJob, setListJob] = useState<TJob[] | []>();
  const [filterValue, setFilterValue] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

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
      const { jobs, total } = await jobApi.getJobListOwn(
        params,
        "671124aa9578b132a235155d"
      );
      setListJob(jobs);
      setJobTotal(total);
    })();
  }, [params]);

  const handleChangePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex justify-center">
      <div className="w-[85vw] flex flex-col gap-8 py-6">
        <div className="w-full flex justify-between">
          <h1 className="font-bold text-themeDark text-3xl">My Job</h1>
          <Button
            radius="full"
            className="bg-themeOrange text-themeWhite px-12"
            startContent={<Plus color="#FFF" size={18} />}
          >
            Post New Job
          </Button>
        </div>
        <div className="grid grid-flow-col grid-cols-4">
          <div className="col-span-1">
            <FilterSection
              setFilterValue={setFilterValue}
              filterValue={filterValue}
            />
          </div>
          <div className="col-span-3">
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
