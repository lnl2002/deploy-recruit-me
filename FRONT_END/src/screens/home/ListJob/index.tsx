import { useEffect, useState } from "react";
import FilterJob from "./components/FilterJob";
import HeaderListJob from "./components/HeaderListJob";
import ListJobView from "./components/ListJob";
import jobApi, { TJob } from "@/api/jobApi";

const ListJob = (): React.JSX.Element => {
  const [limit] = useState(10);
  const [jobList, setJobList] = useState<TJob[]>([]);
  const [jobTotal, setJobTotal] = useState<number>(0);
  const [selectedUnitId, setSelectedUnitId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedCareerId, setSelectedCareerId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTitle, setSearchTitle] = useState<string>("");
  const [params, setParams] = useState("");

  useEffect(() => {
    (async () => {
      const { jobs, total } = (await jobApi.getJobList(params)) as {
        jobs: TJob[];
        total: number;
      };
      setJobList(jobs);
      setJobTotal(total);
    })();
  }, [params]);

  useEffect(() => {
    let params = "";
    const limitPage = currentPage * limit;
    if (selectedLocationId) params += `&location=${selectedLocationId}`;
    if (selectedUnitId) params += `&unit=${selectedUnitId}`;
    if (searchTitle) params += `&title=${searchTitle}`;
    if (selectedCareerId) params += `&career=${selectedCareerId}`;
    if (currentPage) params += `&limit=${limitPage}&skip=${limitPage - limit}`;

    setParams(params);
  }, [
    selectedLocationId,
    selectedUnitId,
    searchTitle,
    selectedCareerId,
    currentPage,
  ]);

  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col gap-5">
      <HeaderListJob jobQuantity={jobTotal} />
      <div className="grid grid-flow-col grid-cols-3 mx-40">
        <FilterJob
          setSelectedUnitId={setSelectedUnitId}
          setSelectedLocationId={setSelectedLocationId}
          setSearchTitle={setSearchTitle}
          setSelectedCareerId={setSelectedCareerId}
        />
        <ListJobView
          jobs={jobList}
          totalPage={jobTotal / limit}
          handleChangePage={handleChangePage}
        />
      </div>
    </div>
  );
};

export default ListJob;
