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

const ApplicationList: React.FC<{ jobId: string }> = ({
  jobId,
}: {
  jobId: string;
}) => {
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
      <div className="mb-5">
        <img
          src="../autoscan.svg"
          alt="Auto Scan"
          className="w-full cursor-pointer"
        />
      </div>
      <div>
        <ApplicantTable _id={jobId} />
      </div>
      <div className="flex justify-center">
    </div>
    </div>
  );
};

export default ApplicationList;

type TableProps = {
  _id: string;
};
const ApplicantTable = ({ _id }: TableProps) => {
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
    if(_id && loadAgain){
      getApplicants();
    }
  }, [loadAgain])

  const getApplicants = async () => {
    setIsLoading(true);
    const data = await applyApi.getApplyByJob({ _id, page, limit: 10 });
    setLoadAgain(false)
    setUsers(data.data);
    setTotalPages(data.totalPages);
    setIsLoading(false);
  };

  const handleOpenModal = async (_id: string) => {
    await getApplicant(_id)
    setIsOpenModal(true);
  }
  const handleCloseModal = () => {
    setIsOpenModal(false);
  }
  const getApplicant = async (_id: string) => {
    const data = await applyApi.getApplicationById({_id})
    setUser(data)
  }

  const onViewCv = async(id:string) => {
    applyApi.getCvFileById({cvId: id})
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
        name={`${user?.cv?.firstName || ''} ${user?.cv?.lastName || ''}`}
        email={user?.cv?.email || ''}
        phoneNumber={formatVietnamPhoneNumber(user?.cv?.phoneNumber || '') }
        gender={user?.cv?.gender?.toUpperCase() || ''}
        address={user?.cv?.address || ''}
        state={user?.status?.name || ''}
        onViewCv={() => onViewCv(user?.cv._id)}
        onDecline={() => {
          console.log('Applicant Declined');
        }}
        onShortlist={() => {
          console.log('Applicant Declined');
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
    </div>
  );
};