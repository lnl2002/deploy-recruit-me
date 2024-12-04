"use client";
import { useEffect, useState } from "react";

import jobApi, { TJob } from "@/api/jobApi";
import { Plus } from "lucide-react";
import { Button, useDisclosure } from "@nextui-org/react";
import { useSelector } from "react-redux";
import { RootState, useAppSelector } from "@/store/store";
import { useRouter } from "next/navigation";

import JobSection from "./components/jobSection";
import FilterSection from "./components/filterSection";
import ConfirmDeleteModal from "./components/customModal";
import { isEmpty } from "@/utils/isEmpty";
import { toast } from "react-toastify";

export const ListJob = (): React.JSX.Element => {
  const router = useRouter();
  const [limit] = useState(10);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { userInfo, isLoggedIn } = useAppSelector((state) => state.user);
  const { statusJobFilterIndex } = useSelector((state: RootState) => state.job);
  const [params, setParams] = useState<string>("");
  const [jobTotal, setJobTotal] = useState<number>(0);
  const [listJob, setListJob] = useState<TJob[]>([]);
  const [jobDelete, setJobDelete] = useState<Partial<TJob>>({});
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

    if (statusJobFilterIndex == 5) {
      params += "&isDelete=1";
    } else {
      params += "&isDelete=0";
    }

    if (currentPage) params += `&limit=${limitPage}&skip=${limitPage - limit}`;

    setParams(params);
  }, [statusJobFilterIndex, currentPage]);

  useEffect(() => {
    (async () => {
      const { jobs, total } = await jobApi.getJobList(
        `&owner=1${params}`,
        true
      );
      setListJob(jobs);
      setJobTotal(total);
    })();
  }, [params]);

  const handleChangePage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const confirmDelete = async () => {
    if (isEmpty(jobDelete)) return;

    const { job: newJob } = await jobApi.deleteJob(jobDelete?._id as string);
    if (!isEmpty(newJob)) {
      setListJob(listJob.filter((job) => job._id !== jobDelete._id));
      setJobDelete({});
    } else {
      toast.error("Failed to delete job");
    }
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
        <div className="grid grid-flow-col grid-cols-5">
          <div className="col-span-1">
            <FilterSection />
          </div>
          <div className="col-span-4">
            <JobSection
              listJob={listJob ?? []}
              setListJob={setListJob}
              setJobDelete={setJobDelete}
              totalPage={jobTotal / limit}
              statusJobFilterIndex={statusJobFilterIndex}
              handleChangePage={handleChangePage}
            />
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={!isEmpty(jobDelete)}
        onClose={() => setJobDelete({})}
        onConfirm={confirmDelete}
        jobName={jobDelete?.title || undefined}
      />
    </div>
  );
};
