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
import { ArrowRight, Search } from "lucide-react";
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
import LoadingSpinner from "@/components/LoadingSpinner";
import AIScoreModal, { Criterion } from "@/screens/interview-manager/jobDetails/components/ApplicationList/components/DetailScore";

const ApplicationList: React.FC<{ jobId: string }> = ({
  jobId,
}: {
  jobId: string;
}) => {
  const [filter, setFilter] = useState({
    status: "",
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
      <div className="mb-5 flex justify-center">
        <img
          src="../autoscan.png"
          alt="Auto Scan"
          className="w-full cursor-pointer "
        />
      </div>
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
            className="min-w-[250px]"
            value={filter.status}
            onChange={(e) => handleChangeFilter("status", e.target.value)}
          >
            <SelectItem key={""} value={""} className="text-themeDark">
              All status
            </SelectItem>
            <SelectItem key={"New"} value={"New"} className="text-themeDark">
              New
            </SelectItem>
            <SelectItem key={"Shortlisted"} value={"Shortlisted"} className="text-themeDark">
              Applicant shortlisted
            </SelectItem>
            <SelectItem key={"Pending Interview Confirmation"} value={"Pending Interview Confirmation"} className="text-themeDark">
              Pending Interview Confirmation
            </SelectItem>
            <SelectItem key={"Interview Rescheduled"} value={"Interview Rescheduled"} className="text-themeDark">
              Applicant Requests Reschedule
            </SelectItem>
            <SelectItem key={"Interview Scheduled"} value={"Interview Scheduled"} className="text-themeDark">
              Interview Waiting
            </SelectItem>
            <SelectItem key={"Interviewed"} value={"Inteviewed"} className="text-themeDark">
              Applicant Inteviewed
            </SelectItem>
            <SelectItem key={"Accepted"} value={"Accepted"} className="text-themeDark">
              Applicant Accepted
            </SelectItem>
            <SelectItem key={"Rejected"} value={"Rejected"} className="text-themeDark">
              Applicant Rejected
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
        <ApplicantTable _id={jobId} filter={filter} key={`${filter.status}-${filter.sort}`}/>
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
  const scoreDetailDisclosure = useDisclosure();
  const [url, setUrl] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<IApply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [user, setUser] = useState<IApply | any>();
  const [loadAgain, setLoadAgain] = useState(false);
  const [criterias, setCriterias] = useState<Criterion[]>([]);

  useEffect(() => {
    if (_id) {
      getApplicants();
    }
  }, [_id, page]);

  useEffect(() => {
    if(_id && loadAgain){
      getApplicants();
    }
  }, [loadAgain])

  const getApplicants = async () => {
    setIsLoading(true);
    const data = await applyApi.getApplyByJob({ _id, page, limit: 10, status: filter.status, sort: filter.sort });
    setLoadAgain(false)
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

  const handleOpenScore = async (criteria: Criterion[], userId: string) => {
    setCriterias(criteria)
    await getApplicant(userId);
    scoreDetailDisclosure.onOpen()
  }

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
            <TableColumn key="cvScore">AI Score</TableColumn>
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
                    {user.cv.firstName} {user.cv.lastName}
                  </TableCell>
                  <TableCell className="py-4 font-bold">
                    {formatDateTime(user.createdAt)}
                  </TableCell>
                  <TableCell className="py-4 font-bold">
                    <Status status={user.status.name} key={user.status.name}/>
                  </TableCell>
                  <TableCell className="py-4 font-bold text-themeOrange cursor-pointer" onClick={() => handleOpenScore(user?.cvScore?.detailScore, user._id)}>
                    {user?.cvScore?.averageScore || (
                      <div className="flex gap-2 items-center">
                        <LoadingSpinner/> Caculating...
                      </div>
                    )} 
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
        apply={user}
        image={user?.createdBy?.image}
        name={`${user?.cv?.firstName || ''} ${user?.cv?.lastName || ''}`}
        email={user?.cv?.email || ''}
        phoneNumber={formatVietnamPhoneNumber(user?.cv?.phoneNumber || '') }
        gender={user?.cv?.gender?.toUpperCase() || ''}
        address={user?.cv?.address || ''}
        state={user?.status?.name || ''}
        onViewCv={() => onViewCv(user?.cv._id)}
        onDecline={() => {
          console.log("Applicant Declined");
        }}
        onShortlist={() => {
          console.log("Applicant Declined");
        }}
        isOpen={isOpenModal}
        onClose={() => handleCloseModal()}
        applyId={user?._id || ''}
        setLoadAgain={setLoadAgain}
        cv={{
          ...user?.cv,
          image: user?.createdBy?.image,
          name: `${user?.cv?.firstName || ''} ${user?.cv?.lastName || ''}`
        }}
      />
      <ModalCommon size={"5xl"} disclosure={cvViewDisclosure}>
        <CvViewer url={url ?? ""} />
      </ModalCommon>
      <AIScoreModal
        isOpen={scoreDetailDisclosure.isOpen}
        onOpenChange={scoreDetailDisclosure.onOpenChange}
        criteria={criterias}
        onViewCv={() => onViewCv(user?.cv._id)}
        name={`${user?.cv?.firstName || ""} ${user?.cv?.lastName || ""}`}
      />
    </div>
  );
};
