"use client";
import { useEffect, useState } from "react";

import jobApi, { TJob } from "@/api/jobApi";
import { Plus } from "lucide-react";
import { Button } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { RootState, useAppSelector } from "@/store/store";
import { useRouter } from "next/navigation";

import JobSection from "./components/jobSection";
import FilterSection from "./components/filterSection";

export const ListJob = (): React.JSX.Element => {
  const router = useRouter();
  const [limit] = useState(10);
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.user);
  const { statusJobFilterIndex } = useSelector((state: RootState) => state.job);
  const [params, setParams] = useState<string>("");
  const [jobTotal, setJobTotal] = useState<number>(0);
  const [listJob, setListJob] = useState<TJob[] | []>();
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    let params = "";
    const limitPage = currentPage * limit;
    if (statusJobFilterIndex == 2) {
      params = `&status=pending,rejected`;
    } else if (statusJobFilterIndex == 3) {
      params = `&status=reopened,approved,published`;
    } else if (statusJobFilterIndex == 4) {
      params = `&status=expired`;
    }
    if (currentPage) params += `&limit=${limitPage}&skip=${limitPage - limit}`;

    setParams(params);
  }, [statusJobFilterIndex, currentPage]);

  useEffect(() => {
    (async () => {
      const { jobs, total } = await jobApi.getJobList(
        `&account=${userInfo?._id}${params}`
      );
      setListJob(jobs);
      setJobTotal(total);
    })();
  }, [params]);

  useEffect(() => {
    console.log(listJob);
  }, [listJob]);

  const handleChangePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="flex justify-center">
      <div className="w-[85vw] flex flex-col gap-8 py-6">
        <div className="w-full flex justify-between">
          <h1 className="font-bold text-themeDark text-3xl">My Job</h1>
          <Button
            onPress={() => router.push("/recruiter/add-job")}
            radius="full"
            className="bg-themeOrange text-themeWhite px-12"
            startContent={<Plus color="#FFF" size={18} />}
          >
            Post New Job
          </Button>
        </div>
        <div className="grid grid-flow-col grid-cols-4">
          <div className="col-span-1">
            <FilterSection />
          </div>
          <div className="col-span-3">
            <JobSection
              listJob={listJob ?? []}
              totalPage={jobTotal / limit}
              statusJobFilterIndex={statusJobFilterIndex}
              handleChangePage={handleChangePage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
