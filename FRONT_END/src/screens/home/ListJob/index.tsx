import { useEffect, useState } from "react";
import FilterJob from "./components/FilterJob";
import HeaderListJob from "./components/HeaderListJob";
import ListJobView from "./components/ListJob";
import { Pagination } from "@nextui-org/react";

export type TJob = {
  _id: string;
  title: string;
  minSalary: number;
  maxSalary: number;
  numberPerson: number;
  unit: {
    _id: string;
    name: string;
    location: {
      _id: string;
      city: string;
      __v: number;
    };
    __v: number;
  };
  career: {
    _id: string;
    name: string;
    __v: number;
  };
  account: {
    _id: string;
    googleId: string;
    email: string;
    name: string;
    role: string;
    image: string;
    cv: any[]; // Assuming cv is an array, if it's an array of specific objects, you can specify the type accordingly
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  interviewer: {
    _id: string;
    googleId: string;
    email: string;
    name: string;
    role: string;
    image: string;
    cv: any[]; // Same assumption as above
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  expiredDate: string; // ISO date string
  type: string;
  isDelete: boolean;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
};

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

  async function getJobList(params: string) {
    let newParams = "?expiredDate=1&sort_by=createdAt&order=1" + params;

    // if (!params.includes("limit") || !params.includes("skip")) {
    //   newParams += "&limit=10&skip=0";
    // }

    try {
      const res = await fetch("http://localhost:9999/api/v1/jobs" + newParams);
      const data = await res.json();
      if (data.status === 200) {
        return { jobs: data.data.jobs, total: data.data.total };
      } else {
        return { jobs: [], total: 0 };
      }
    } catch (error) {
      return { jobs: [], total: 0 };
    }
  }

  useEffect(() => {
    (async () => {
      const { jobs, total } = (await getJobList(params)) as {
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
