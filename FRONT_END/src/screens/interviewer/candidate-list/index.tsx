"use client";
import meetingApi from "@/api/meetingApi";
import LoadingSpinner from "@/components/LoadingSpinner";
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
  Chip,
  Avatar,
  useDisclosure,
  SortDescriptor,
} from "@nextui-org/react";
import { ArrowRight, Search } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import Empty from "../jobDetails/components/ApplicationList/components/empty";
import { formatDateTime } from "@/utils/formatDateTime";
import { IAccount } from "@/api/accountApi/accountApi";
import Status from "../jobDetails/components/ApplicationList/components/status";
import AIScoreModal, {
  Criterion,
} from "../jobDetails/components/ApplicationList/components/DetailScore";
import applyApi, { IApply } from "@/api/applyApi";
import ModalCommon from "@/components/Modals/ModalCommon";
import { CvViewer } from "@/components/CvViewer";

export const CandidateListInteviewer = () => {
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [filters, setFilters] = useState<any>({
    type: "",
    sort: "desc",
    sortField: "timeStart",
  });
  const [criterias, setCriterias] = useState<Criterion[]>([]);
  const [user, setUser] = useState<IApply | any>();
  const [url, setUrl] = useState("");
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "",
    direction: "descending",
  });
  

  const scoreDetailDisclosure = useDisclosure();
  const cvViewDisclosure = useDisclosure();

  const handleChangeFilter = (name: string, value: string) => {
    setFilters({
      ...filters,
      [name]: value,
    });
    if (name === "type") {
      setPage(1);
    }
  };

  const getCandidates = async ({
    limit,
    page,
    sortOrder,
    statusFilter,
    sortField
  }: {
    limit?: number;
    page?: number;
    sortOrder?: string;
    statusFilter?: string;
    sortField?: 'timeStart' | 'createdAt' | 'apply.cvScore.averageScore';
  }) => {
    setIsLoading(true);
    const data = await meetingApi.getCandidateListByInterview({
      limit: limit,
      page: page,
      sortOrder: sortOrder,
      statusFilter: statusFilter,
      sortField: sortField
    });
    setIsLoading(false);
    setCandidates(data?.data || []);
    setTotalPages(data?.totalPages || 1);
  };

  const onViewCv = async (id: string) => {
    cvViewDisclosure.onOpen();
    setUrl("");
    const url = await applyApi.getCvFileById({ cvId: id });
    setUrl(url ?? "");
  };

  const handleOpenScore = async (
    criteria: Criterion[],
    userId: string,
    cv: IApply
  ) => {
    setCriterias(criteria);
    setUser(cv);
    scoreDetailDisclosure.onOpen();
  };

  const onSort = (descriptor: SortDescriptor) => {
    const { column, direction } = descriptor;

    if (!column) return;

    const sortOrder = direction === "ascending" ? "asc" : "desc";

    // Update filters and trigger API call
    setFilters({
      ...filters,
      sort: sortOrder,
      sortField: column === "apply" ? "apply.cvScore.averageScore" : (column === "interview" ? "timeStart" : "createdAt"),
    });

    setSortDescriptor(descriptor);
    setPage(1);

    getCandidates({
      limit: 5,
      page: 1,
      sortOrder,
      sortField: column === "apply" ? "apply.cvScore.averageScore" : (column === "interview" ? "timeStart" : "createdAt"),
      statusFilter: filters.type,
    });
  };


  const renderCell = useCallback(
    (item: any, columnKey: any) => {
      const cellValue = item[columnKey];

      const dateFormat = (dateValue: string): string => {
        const date = new Date(dateValue);

        const formattedDate = date.toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });

        return formattedDate;
      };

      const statusFormat = (statusValue: string): string => {
        const words = statusValue?.split("-");

        // Chuyển mỗi từ thành chữ cái đầu viết hoa
        const formattedString = words
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        return formattedString;
      };

      switch (columnKey) {
        case "cv":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">{`${
                cellValue?.firstName || ""
              } ${cellValue?.lastName || ""}`}</p>
            </div>
          );
        case "job":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {cellValue?.title || ""}
              </p>
            </div>
          );
        case "interview":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-small capitalize">
                {formatDateTime(item.timeStart)}
              </p>
            </div>
          );
        case "participants":
          return (
            <div className="flex flex-col gap-1">
              {item?.participants &&
                item.participants.length > 0 &&
                item.participants?.map((participant: IAccount) => (
                  <Chip
                    classNames={{
                      content: "flex gap-1 items-center",
                      base: "py-5",
                    }}
                  >
                    <Avatar
                      src={participant.image}
                      alt={participant.name}
                      size="sm"
                    />
                    <div>{participant.email}</div>
                  </Chip>
                ))}
            </div>
          );
        case "apply":
          return (
            <div className="flex flex-col">
              <p
                className="text-bold text-small capitalize font-bold text-themeOrange cursor-pointer"
                onClick={() =>
                  handleOpenScore(
                    cellValue?.cvScore?.detailScore,
                    item.applyId,
                    item.cv
                  )
                }
              >
                {cellValue?.cvScore?.averageScore || (
                  <div className="flex gap-2 items-center">
                    <LoadingSpinner /> Caculating...
                  </div>
                )}
              </p>
            </div>
          );
        case "status":
          return (
            <div className="flex flex-col">
              <Status
                status={item.applyStatus?.name}
                key={item.applyStatus?.name}
              />
            </div>
          );
        case "action":
          return (
            <div className="flex flex-col">
              <button
                className="text-themeOrange rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex gap-1 items-center"
                onClick={() => onViewCv(item?.cv?._id || "")}
              >
                View CV <ArrowRight size="16px" />
              </button>
            </div>
          );
        default:
          return cellValue?.toString() || "";
      }
    },
    [candidates, filters]
  );

  useEffect(() => {
    getCandidates({
      limit: 5,
      page: page,
      sortOrder: filters.sort,
      statusFilter: filters.type,
      sortField: filters.sortField
    });
  }, [page, filters]);
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
              className={`text-[14px] cursor-pointer transition ${
                filters.type === ""
                  ? "border-b-1 border-themeDark"
                  : "opacity-70"
              } `}
              onClick={() => handleChangeFilter("type", "")}
            >
              Candidate Listing
            </div>
            <div
              className={`text-[14px] cursor-pointer transition ${
                filters.type === "Interview Scheduled"
                  ? "border-b-1 border-themeDark"
                  : "opacity-70"
              }`}
              onClick={() => handleChangeFilter("type", "Interview Scheduled")}
            >
              Waiting Interview
            </div>
            <div
              className={`text-[14px] cursor-pointer transition ${
                filters.type === "Interviewed"
                  ? "border-b-1 border-themeDark"
                  : "opacity-70"
              }`}
              onClick={() => handleChangeFilter("type", "Interviewed")}
            >
              Interviewed Candidates
            </div>
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
            onSortChange={onSort}
            sortDescriptor={sortDescriptor}
          >
            <TableHeader>
              <TableColumn key="cv">CANDIDATE NAME</TableColumn>
              <TableColumn key="job">JOB NAME</TableColumn>
              <TableColumn 
                key="interview" 
                allowsSorting={true}
                >
                INTERVIEW TIME
              </TableColumn>
              <TableColumn key="participants">PARTICIPANTS</TableColumn>
              <TableColumn key="status">STATUS</TableColumn>
              <TableColumn key="apply" allowsSorting={true}>
                AI Score
              </TableColumn>
              <TableColumn key="action">ACTION</TableColumn>
            </TableHeader>
            <TableBody
              items={candidates}
              emptyContent={<Empty />}
              isLoading={isLoading}
              loadingContent={
                <div className="flex gap-3 text-themeOrange">
                  <LoadingSpinner />
                  Loading...
                </div>
              }
            >
              {(item) => (
                <TableRow key={item._id}>
                  {(columnKey) => (
                    <TableCell key={item._id}>
                      {renderCell(item, columnKey)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <AIScoreModal
        isOpen={scoreDetailDisclosure.isOpen}
        onOpenChange={scoreDetailDisclosure.onOpenChange}
        criteria={criterias}
        onViewCv={() => onViewCv(user._id)} // cv _id
        name={`${user?.firstName || ""} ${user?.lastName || ""}`} // cv info: first name, last name
      />
      <ModalCommon size={"5xl"} disclosure={cvViewDisclosure}>
        <CvViewer url={url ?? ""} />
      </ModalCommon>
    </div>
  );
};
