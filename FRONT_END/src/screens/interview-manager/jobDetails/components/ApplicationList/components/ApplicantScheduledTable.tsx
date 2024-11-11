import applyApi, { IApply } from "@/api/applyApi";
import {
    Avatar,
    Chip,
  Pagination,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import Status from "./status";
import ApplicantCard from "./ApplicantCard";
import { formatVietnamPhoneNumber } from "@/utils/formatPhone";
import ModalCommon from "@/components/Modals/ModalCommon";
import { CvViewer } from "@/components/CvViewer";
import Empty from "./empty";
import { formatDateTime } from "@/utils/formatDateTime";
import meetingApi from "@/api/meetingApi";
import { IAccount } from "@/api/accountApi/accountApi";

type ApplicantScheduledTableProps = {
  _id: string;
  filter: {
    status: string;
    sort: string;
  };
};
export const ApplicantScheduledTable = ({
  _id,
  filter
}: ApplicantScheduledTableProps) => {
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
    const data = await meetingApi.getCandidateListByInterview({
        limit: 10,
        page,
        sortOrder: filter.sort,
        statusFilter: filter.status,
        jobId: _id
    });
    setLoadAgain(false);
    setUsers(data.data);
    setTotalPages(data.totalPages);
    setIsLoading(false);
  };

  const handleOpenModal = async (_id: string, meetingInfo: {
    _id: string,
    candidate: any,
    participants: any[],
    rejectCount: number,
    timeEnd: string
    timeStart: string
    url: string
  }) => {
    await getApplicant(_id, meetingInfo);
    setIsOpenModal(true);
  };
  const handleCloseModal = () => {
    setIsOpenModal(false);
  };
  const getApplicant = async (_id: string, meetingInfo: {
    _id: string,
    candidate: any,
    participants: any[],
    rejectCount: number,
    timeEnd: string
    timeStart: string
    url: string
  }) => {
    const data = await applyApi.getApplicationById({ _id });
    setUser({
      ...data,
      meetingInfo
    });
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
            <TableColumn key="role">INTERVIEW TIME</TableColumn>
            <TableColumn key="role">INTERVIEWERS</TableColumn>
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
                    {formatDateTime(user.timeStart)}
                  </TableCell>
                  <TableCell className="py-4 font-bold flex flex-wrap gap-2 max-w-[250px]" >
                    {
                        user?.participants && user.participants.length > 0 && user.participants?.map((participant: IAccount) =>  (
                            <Chip classNames={{
                                content: "flex gap-1 items-center",
                                base: "py-5"
                              }}>
                                <Avatar src={participant.image} alt={participant.name} size="sm"/>
                                <div>{participant.email}</div>
                            </Chip>
                        ))
                    }
                  </TableCell>
                  <TableCell className="py-4 font-bold">
                    <Status status={user.applyStatus?.name} key={user.applyStatus?.name} />
                  </TableCell>
                  <TableCell className="py-4 font-bold">
                    <button
                      className="text-themeOrange rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex gap-1 items-center"
                      onClick={() => handleOpenModal(user.applyId, {
                        _id: user._id,
                        candidate: user.candidate,
                        participants: user.participants,
                        rejectCount: user.rejectCount,
                        timeEnd: user.timeEnd,
                        timeStart: user.timeStart,
                        url: user.url
                      })}
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
        image={user?.candidate?.image}
        name={`${user?.cv?.firstName || ""} ${user?.cv?.lastName || ""}`}
        email={user?.candidate?.email || ""}
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
        user={user}
      />
      <ModalCommon size={"5xl"} disclosure={cvViewDisclosure}>
        <CvViewer url={url ?? ""} />
      </ModalCommon>
    </div>
  );
};
