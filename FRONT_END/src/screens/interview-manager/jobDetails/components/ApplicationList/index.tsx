"use client";
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
  useDisclosure,
} from "@nextui-org/react";
import { ArrowRight, Filter, Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import applyApi, { IApply } from "@/api/applyApi";
import Status from "./components/status";
import { formatDate } from "date-fns";
import { formatDateTime } from "@/utils/formatDateTime";
import Empty from "./components/empty";
import ApplicantCard from "./components/ApplicantCard";
import { formatVietnamPhoneNumber } from "@/utils/formatPhone";
import ModalCommon from "@/components/Modals/ModalCommon";
import { CvViewer } from "@/components/CvViewer";
import { ApplicantScheduledTable } from "./components/ApplicantScheduledTable";

const ApplicationList: React.FC<{ jobId: string }> = ({
  jobId,
}: {
  jobId: string;
}) => {
  const [filter, setFilter] = useState({
    status: "Shortlisted",
    sort: "desc"
  })

  const handleChangeFilter = (name: string, value: string) => {
    setFilter({
      ...filter,
      [name]: value
    })
  }

  return (
    <div className="">
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
            defaultSelectedKeys={[filter.status]}
            className="min-w-[200px]"
            value={filter.status}
            onChange={(e) => handleChangeFilter("status", e.target.value)}
          >
            <SelectItem key={"Shortlisted"} value={"Shortlisted"} className="text-themeDark">
              Applicant shortlisted
            </SelectItem>
            <SelectItem key={"Waiting"} value={"Waiting"} className="text-themeDark">
              Interview Waiting 
            </SelectItem>
            <SelectItem key={"Inteviewed"} value={"Inteviewed"} className="text-themeDark">
              Applicant Inteviewed
            </SelectItem>
          </Select>
          <Select
            defaultSelectedKeys={["desc"]}
            className="min-w-[170px] text-themeDark"
            value={filter.sort}
            onChange={(e) => handleChangeFilter("sort", e.target.value)}
          >
            <SelectItem key={"desc"} value={"desc"} className="text-themeDark">
              Sort by newest
            </SelectItem>
            <SelectItem key={"asc"} value={"asc"} className="text-themeDark">
              Sort by latest
            </SelectItem>
          </Select>
        </div>
      </div>
      <div>
        {filter.status === "Shortlisted" ? (
          <ApplicantTable _id={jobId} filter={filter}/>
        ) : (
          <ApplicantScheduledTable _id={jobId} filter={filter}/>
        )}
      </div>
      <div className="flex justify-center"></div>
    </div>
  );
};

export default ApplicationList;

type TableProps = {
  _id: string;
  filter: {
    status: string
    sort: string
  }
};
const ApplicantTable = ({ _id, filter }: TableProps) => {
  const cvViewDisclosure = useDisclosure();
  const [url, setUrl] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<IApply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [user, setUser] = useState<IApply | any>();
  const [loadAgain, setLoadAgain] = useState(false);

  useEffect(() => {
    if (_id) {
      getApplicants();
    }
  }, [_id, page]);

  useEffect(() => {
    if (_id && loadAgain) {
      getApplicants();
    }
  }, [loadAgain]);

  const getApplicants = async () => {
    setIsLoading(true);
    const data = await applyApi.getApplyByJob({ _id, page, limit: 10, status: 'Shortlisted', sort: filter.sort });
    setLoadAgain(false);
    setUsers(data.data);
    setTotalPages(data.totalPages);
    setIsLoading(false);
  };

  const handleOpenModal = async (_id: string) => {
    await getApplicant(_id);
    setIsOpenModal(true);
  };
  const handleCloseModal = () => {
    setIsOpenModal(false);
  };
  const getApplicant = async (_id: string) => {
    const data = await applyApi.getApplicationById({ _id });
    setUser(data);
  };

  const onViewCv = async (id: string) => {
    cvViewDisclosure.onOpen();
    setUrl("");
    const url = await applyApi.getCvFileById({ cvId: id });
    setUrl(url ?? "");
  };

  return (
    <div>
      {users && users.length > 0 ? (
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
            <TableColumn key="role">APPLIED TIME</TableColumn>
            <TableColumn key="status">STATUS</TableColumn>
            <TableColumn key="action">CV</TableColumn>
          </TableHeader>
          <TableBody
            isLoading={isLoading}
            loadingContent={<Spinner label="Loading..." color="warning" />}
          >
            {users && users.length > 0 ? (
              users.map((user: any) => (
                <TableRow key={user._id}>
                  <TableCell className="py-4 font-bold">
                    {user.cv?.firstName} {user.cv?.lastName}
                  </TableCell>
                  <TableCell className="py-4 font-bold">
                    {formatDateTime(user.createdAt)}
                  </TableCell>
                  <TableCell className="py-4 font-bold">
                    <Status status={user.status.name} />
                  </TableCell>
                  <TableCell className="py-4 font-bold">
                    <button
                      className="text-themeOrange rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex gap-1 items-center"
                      onClick={() => handleOpenModal(user._id)}
                    >
                      View CV <ArrowRight size="16px" />
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
            {}
          </TableBody>
        </Table>
      ) : (
        <Empty />
      )}
      <ApplicantCard
        image={user?.createdBy?.image}
        name={`${user?.cv?.firstName || ""} ${user?.cv?.lastName || ""}`}
        email={user?.cv?.email || ""}
        phoneNumber={formatVietnamPhoneNumber(user?.cv?.phoneNumber || "")}
        gender={user?.cv?.gender?.toUpperCase() || ""}
        address={user?.cv?.address || ""}
        state={user?.status?.name || ""}
        onViewCv={() => onViewCv(user?.cv._id)}
        onDecline={() => {
          console.log("Applicant Declined");
        }}
        onShortlist={() => {
          console.log("Applicant Declined");
        }}
        isOpen={isOpenModal}
        onClose={() => handleCloseModal()}
        applyId={user?._id || ""}
        setLoadAgain={setLoadAgain}
        cv={{
          ...user?.cv,
          image: user?.createdBy?.image,
          name: `${user?.cv?.firstName || ""} ${user?.cv?.lastName || ""}`,
        }}
      />
      <ModalCommon size={"5xl"} disclosure={cvViewDisclosure}>
        <CvViewer url={url ?? ""} />
      </ModalCommon>
    </div>
  );
};
