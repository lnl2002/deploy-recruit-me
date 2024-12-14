import applyApi, { IApply } from "@/api/applyApi";
import {
  Avatar,
  Button,
  Chip,
  Pagination,
  Select,
  SelectItem,
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import { ArrowRight, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Status from "./status";
import ApplicantCard from "./ApplicantCard";
import { formatVietnamPhoneNumber } from "@/utils/formatPhone";
import ModalCommon from "@/components/Modals/ModalCommon";
import { CvViewer } from "@/components/CvViewer";
import Empty from "./empty";
import { formatDateTime } from "@/utils/formatDateTime";
import meetingApi from "@/api/meetingApi";
import accountApi, { IAccount } from "@/api/accountApi/accountApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import AIScoreModal, { Criterion } from "./DetailScore";
import { toast } from "react-toastify";
import { RootState, useAppSelector } from "@/store/store";
import SelectUser from "./SelectUser";

type ApplicantScheduledTableProps = {
  _id: string;
  filter: {
    status: string;
    sort: string;
  };
};
export const ApplicantScheduledTable = ({
  _id,
  filter,
}: ApplicantScheduledTableProps) => {
  const { userInfo } = useAppSelector((root: RootState) => root.user);
  const cvViewDisclosure = useDisclosure();
  const scoreDetailDisclosure = useDisclosure();
  const confirmRemove = useDisclosure();
  const addParticipant = useDisclosure();
  const [url, setUrl] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<IApply[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [user, setUser] = useState<IApply | any>();
  const [loadAgain, setLoadAgain] = useState(false);
  const [criterias, setCriterias] = useState<Criterion[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState({
    participantId: "",
    meetingRoomId: "",
  });
  const [filtersCandidate, setFiltersCandidate] = useState<any>(filter);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "",
    direction: "descending",
  });
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [listAddParticipant, setListAddParticipant] = useState<any[]>([]);
  const [uniqueItems, setUniqueItems] = useState<any[]>([]);
  const [addMeetingRoomId, setAddMeetingRoomId] = useState<string>("");
  const { job } = useAppSelector((state: RootState) => state.job);

  useEffect(() => {
    setFiltersCandidate(filter);
  }, []);

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
      sortOrder: filtersCandidate.sort,
      statusFilter: filtersCandidate.status,
      jobId: _id,
      sortField: filtersCandidate.sortField,
    });
    setLoadAgain(false);
    setUsers(data.data);
    setTotalPages(data.totalPages);
    setIsLoading(false);
  };
  const getInterviewers = async () => {
    if (!job?.unit?._id) return;
    const data = await accountApi.getInterviewerByUnit(
      job?.unit?._id?.toString()
    );
    setInterviewers(data);
  };

  const handleOpenModal = async (
    _id: string,
    meetingInfo: {
      _id: string;
      candidate: any;
      participants: any[];
      rejectCount: number;
      timeEnd: string;
      timeStart: string;
      url: string;
    }
  ) => {
    await getApplicant(_id, meetingInfo);
    setIsOpenModal(true);
  };
  const handleCloseModal = () => {
    setIsOpenModal(false);
  };
  const getApplicant = async (
    _id: string,
    meetingInfo?: {
      _id: string;
      candidate: any;
      participants: any[];
      rejectCount: number;
      timeEnd: string;
      timeStart: string;
      url: string;
    }
  ) => {
    const data = await applyApi.getApplicationById({ _id });
    setUser({
      ...data,
      meetingInfo,
    });
  };

  const onViewCv = async (id: string) => {
    cvViewDisclosure.onOpen();
    setUrl("");
    const url = await applyApi.getCvFileById({ cvId: id });
    setUrl(url ?? "");
  };

  const handleOpenScore = async (criteria: Criterion[], userId: string) => {
    setCriterias(criteria);
    await getApplicant(userId);
    scoreDetailDisclosure.onOpen();
  };

  const openConfirmModal = (meetingRoomId: string, participantId: string) => {
    setSelectedParticipant({ meetingRoomId, participantId });
    confirmRemove.onOpen();
  };

  const removeParticipant = async () => {
    if (
      !selectedParticipant.meetingRoomId ||
      !selectedParticipant.participantId
    )
      return;

    const data = await meetingApi.removeParticipantFromMeetingRoom(
      selectedParticipant.meetingRoomId,
      selectedParticipant.participantId
    );
    if (!data) {
      toast.error("Something went wrong! Please try again");
      return;
    }

    getApplicants();
  };

  const onSort = (descriptor: SortDescriptor) => {
    const { column, direction } = descriptor;

    if (!column) return;

    const sortOrder = direction === "ascending" ? "asc" : "desc";

    // Update filters and trigger API call
    setFiltersCandidate({
      ...filtersCandidate,
      sort: sortOrder,
      sortField:
        column === "apply"
          ? "apply.cvScore.averageScore"
          : column === "interview"
          ? "timeStart"
          : "createdAt",
    });

    setSortDescriptor(descriptor);
    setPage(1);

    getApplicants();
  };

  const clickAddParticipant = (participants: any[], meetingId: string) => {

    const uniqueSet = interviewers.filter(
      (interviewer) =>
        !participants.some((user) => user._id === interviewer._id)
    );
  
    setUniqueItems(uniqueSet);
    setAddMeetingRoomId(meetingId)
    addParticipant.onOpen();
  };

  const handleAddParticipant = () => {
    listAddParticipant.forEach( async (participantId) => {
      await meetingApi.addParticipantToMeetingRoom(addMeetingRoomId, participantId)
    })
    toast.success('Added successfully!')
    addParticipant.onClose()
    getApplicants();
  }

  useEffect(() => {
    setFiltersCandidate(filter);
    getInterviewers();
  }, []);

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
          onSortChange={onSort}
          sortDescriptor={sortDescriptor}
        >
          <TableHeader>
            <TableColumn key="name">CANDIDATE NAME</TableColumn>
            <TableColumn key="interview" allowsSorting={true}>
              INTERVIEW TIME
            </TableColumn>
            <TableColumn key="participants">PARTICIPANTS INTERVIEW</TableColumn>
            <TableColumn key="status">STATUS</TableColumn>
            <TableColumn key="apply" allowsSorting={true}>
              AI Score
            </TableColumn>
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
                  <TableCell className="py-4 font-bold flex flex-wrap gap-2 max-w-[250px]">
                    {user?.participants &&
                      user.participants.length > 0 &&
                      user.participants?.map((participant: IAccount) => (
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
                          {[
                            "Pending Interview Confirmation",
                            "Interview Scheduled",
                            "Interview Rescheduled",
                          ].includes(user?.applyStatus?.name) &&
                            userInfo?._id !== participant._id &&
                            user?.candidate?._id !== participant._id && (
                              <div
                                className="text-themeOrange cursor-pointer"
                                onClick={() =>
                                  openConfirmModal(user._id, participant._id)
                                }
                              >
                                <X />
                              </div>
                            )}
                        </Chip>
                      ))}
                    {[
                      "Pending Interview Confirmation",
                      "Interview Scheduled",
                      "Interview Rescheduled",
                    ].includes(user?.applyStatus?.name) && (
                      <Button
                        className="flex gap-1 items-center cursor-pointer bg-[#007bff] text-[#fff]"
                        radius="full"
                        onPress={() =>
                          clickAddParticipant(user?.participants || [], user?._id || '')
                        }
                      >
                        <Plus /> <span>Add participant</span>
                      </Button>
                    )}
                  </TableCell>
                  <TableCell className="py-4 font-bold">
                    <Status
                      status={user.applyStatus?.name}
                      key={user.applyStatus?.name}
                    />
                  </TableCell>
                  <TableCell
                    className="py-4 font-bold text-themeOrange cursor-pointer"
                    onClick={() =>
                      handleOpenScore(
                        user?.apply?.cvScore?.detailScore,
                        user.applyId
                      )
                    }
                  >
                    {user?.apply?.cvScore?.averageScore || (
                      <div className="flex gap-2 items-center">
                        <LoadingSpinner /> Caculating...
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4 font-bold">
                    <button
                      className="text-themeOrange rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex gap-1 items-center"
                      onClick={() =>
                        handleOpenModal(user.applyId, {
                          _id: user._id,
                          candidate: user.candidate,
                          participants: user.participants,
                          rejectCount: user.rejectCount,
                          timeEnd: user.timeEnd,
                          timeStart: user.timeStart,
                          url: user.url,
                        })
                      }
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
        image={user?.meetingInfo?.candidate?.image}
        name={`${user?.cv?.firstName || ""} ${user?.cv?.lastName || ""}`}
        email={user?.meetingInfo?.candidate?.email || ""}
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
          candidateId: user?.createdBy?._id,
        }}
        user={user}
        apply={user}
      />
      <ModalCommon size={"5xl"} disclosure={cvViewDisclosure}>
        <CvViewer url={url ?? ""} />
      </ModalCommon>
      <ModalCommon size={"xl"} disclosure={confirmRemove}>
        <div className="text-themeDark pt-3 w-full">
          <div className="text-center mb-6 font-bold">
            Do you want to remove this user?
          </div>
          <div className="grid grid-cols-2 gap-2 w-full mb-[-10px]">
            <Button
              className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
              radius="full"
              onPress={() => confirmRemove.onClose()}
            >
              No
            </Button>
            <Button
              className="bg-themeOrange text-[#fff]"
              radius="full"
              onPress={() => {
                removeParticipant();
                confirmRemove.onClose();
              }}
            >
              Yes
            </Button>
          </div>
        </div>
      </ModalCommon>
      <AIScoreModal
        isOpen={scoreDetailDisclosure.isOpen}
        onOpenChange={scoreDetailDisclosure.onOpenChange}
        criteria={criterias}
        onViewCv={() => onViewCv(user?.cv._id)}
        name={`${user?.cv?.firstName || ""} ${user?.cv?.lastName || ""}`}
      />
      <ModalCommon size={"xl"} disclosure={addParticipant}>
        <div className="flex w-full  flex-col gap-2 mt-4">
          <Select
            items={uniqueItems}
            label="Participants"
            variant="bordered"
            isMultiline={true}
            selectionMode="multiple"
            placeholder="Select a user"
            labelPlacement="outside"
            classNames={{
              base: "w-full text-themeDark",
              trigger: "min-h-12 py-2",
              listbox: "text-themeDark",
              label: "min-w-[100px] flex items-center justify-center mt-1",
            }}
            renderValue={(items: any) => {
              return (
                <div className="flex flex-wrap gap-2 ">
                  {items.map((item: any) => (
                    <Chip
                      key={item?.key || ""}
                      classNames={{
                        content: "flex gap-1 items-center",
                        base: "py-5",
                      }}
                    >
                      <Avatar
                        alt={item.data.name}
                        size="sm"
                        src={item.data.image}
                      />
                      <div>
                        {userInfo?._id === item.data._id
                          ? "You"
                          : item.data.name}
                      </div>
                    </Chip>
                  ))}
                </div>
              );
            }}
            onChange={(e) => setListAddParticipant(e.target.value.split(","))}
          >
            {(user) => (
              <SelectItem key={user?._id || ""} textValue={user.name}>
                <div className="flex gap-2 items-center">
                  <Avatar
                    alt={user.name}
                    className="flex-shrink-0"
                    size="sm"
                    src={user.image}
                  />
                  <div className="flex flex-col">
                    <span className="text-small">
                      {userInfo?._id === user._id ? "You" : user.name}
                    </span>
                    <span className="text-tiny text-default-400">
                      {user.email}
                    </span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>
          <div className="grid grid-cols-2 gap-4 mt-2 mb-[-10px]">
            <Button
              className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
              radius="full"
              onPress={() => addParticipant.onClose()}
            >
              Cancel
            </Button>
            <Button 
              className="bg-themeOrange text-[#fff]" 
              radius="full"
              onPress={() => handleAddParticipant()}
              >
              Add
            </Button>
          </div>
        </div>
      </ModalCommon>
    </div>
  );
};
