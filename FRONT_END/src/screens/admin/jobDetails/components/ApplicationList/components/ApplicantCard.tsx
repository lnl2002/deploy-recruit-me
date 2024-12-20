import { Avatar, Button, useDisclosure, user } from "@nextui-org/react";
import React, { useEffect, useState } from "react";
import Status from "./status";
import { AlarmClock, ArrowRight, ChevronLeft } from "lucide-react";
import { IStateProps } from "../types/status";
import applyApi, { IApply } from "@/api/applyApi";
import { toast } from "react-toastify";
import ScheduleInterviewModal from "./BookSchedule";
import ModalConfirm from "@/components/Modals/ModalConfirm";
import {
  formatISOToDateString,
  formatTimeToHHMM,
} from "@/utils/formatDateTime";
import { useRouter } from "next/navigation";
import meetingApi from "@/api/meetingApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import systemApi from "@/api/systemApi";

interface ApplicantCardProps {
  name: string;
  email: string;
  phoneNumber: string;
  gender: string;
  address: string;
  state: string;
  image: string;
  onViewCv: () => void;
  onDecline: () => void;
  onShortlist: () => void;
  isOpen: boolean;
  onClose: () => void;
  applyId: string;
  setLoadAgain: (loadAgain: boolean) => void;
  cv: any;
  user?: any;
  apply?: IApply;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  name,
  email,
  phoneNumber,
  gender,
  address,
  state,
  onViewCv,
  onDecline,
  onShortlist,
  isOpen,
  onClose,
  applyId,
  setLoadAgain,
  image,
  cv,
  user,
  apply,
}) => {
  return (
    <>
      {/* Overlay làm mờ nền khi sidebar mở */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#000] bg-opacity-50 transition-opacity z-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-128 bg-white shadow-lg transform transition-transform duration-300 text-themeDark bg-[#fff] z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-6 min-h-screen flex flex-col">
          <div>
            <button
              className="text-sm text-gray-500 mb-4 flex gap-3 items-center font-bold"
              onClick={onClose}
            >
              <ChevronLeft /> Back to Applicant List
            </button>
            <div className="flex items-center space-x-4 mb-6 mt-16">
              <Avatar
                src={image}
                alt="avatar"
                className="w-20 h-20 text-large"
              />
              <div>
                <h2 className="text-lg font-semibold">{name}</h2>
                <p className="text-gray-500">{email}</p>
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Information</h3>
              <ul className="border-1 border-themeDark border-opacity-15 rounded-xl p-4 text-[14px]">
                <li className="mb-4 border-b-1 border-themeDark border-opacity-10">
                  <div className="grid grid-cols-2 ">
                    <strong>Phone number:</strong>
                    <strong>{phoneNumber}</strong>
                  </div>
                </li>
                <li className="mb-4 border-b-1 border-themeDark border-opacity-10">
                  <div className="grid grid-cols-2">
                    <strong>Gender:</strong>
                    <strong>{gender}</strong>
                  </div>
                </li>
                <li className="mb-4 border-b-1 border-themeDark border-opacity-10">
                  <div className="grid grid-cols-2">
                    <strong>CV:</strong>{" "}
                    <strong>
                      <button
                        onClick={onViewCv}
                        className="text-orange-500 hover:underline"
                        rel="noopener noreferrer"
                      >
                        View CV
                      </button>
                    </strong>
                  </div>
                </li>
                <li className="mb-4 border-b-1 border-themeDark border-opacity-10">
                  <div className="grid grid-cols-2">
                    <strong>Address:</strong>
                    <strong>{address}</strong>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <State
            key={state}
            status={state}
            applyId={applyId}
            setLoadAgain={setLoadAgain}
            cv={cv}
            meetingInfo={user}
            apply={apply}
          />
        </div>
      </div>
    </>
  );
};

export default ApplicantCard;

const State: React.FC<IStateProps> = ({
  status: initialStatus,
  applyId = "",
  setLoadAgain,
  cv,
  meetingInfo,
  apply,
}: IStateProps) => {
  const [status, setStatus] = useState(initialStatus);
  useEffect(() => {
    setStatus(initialStatus);
  }, []);

  const changeStatus = async ({ status }: { status: string }) => {
    const data = await applyApi.updateApplyStatus({
      applyId,
      newStatus: status,
    });

    if (!data) {
      toast.error("Something went wrong! pls try again");
      return;
    } else {
      systemApi.createNotification({
        content:
          "Your CV have been reviewed and be switched to state: " + status,
        receiver: apply?.createdBy?._id ?? "",
        url: "/job-details?id=" + apply?.job?._id,
      });
    }
    toast.success("Change status successfully");
    setLoadAgain?.(true);
    setStatus(status);
  };

  return (
    <>
      {status === "New" && (
        <NewStatus
          status={status}
          changeStatus={changeStatus}
          setLoadAgain={setLoadAgain}
          cv={cv}
          description="By shortlisting this candidate, you have indicated your interest in interviewing them and they will be contacted shortly to schedule an interview."
        />
      )}
      {status === "Shortlisted" && (
        <ShortlistedStatus
          status={status}
          changeStatus={changeStatus}
          setLoadAgain={setLoadAgain}
          cv={cv}
          description="Schedule an interview for the candidate now so you can interview them."
          applyId={applyId}
        />
      )}
      {status === "Pending Interview Confirmation" && (
        <InterviewPendingStatus
          status={status}
          changeStatus={changeStatus}
          setLoadAgain={setLoadAgain}
          cv={cv}
          meetingInfo={meetingInfo}
          description="You have scheduled an interview for the candidate. Kindly wait for their confirmation."
        />
      )}
      {status === "Interview Scheduled" && (
        <ApprovalInterviewScheduleStatus
          status={status}
          changeStatus={changeStatus}
          setLoadAgain={setLoadAgain}
          cv={cv}
          meetingInfo={meetingInfo}
          description="The interview has been confirmed by both the candidate and the interviewer."
        />
      )}
      {status === "Interview Rescheduled" && (
        <RescheduleStatus
          status={status}
          changeStatus={changeStatus}
          setLoadAgain={setLoadAgain}
          cv={cv}
          meetingInfo={meetingInfo}
          applyId={applyId}
          description="The candidate has declined the current interview. Please review and create a new schedule or make a different decision regarding this candidate."
        />
      )}
      {status === "Interviewed" && (
        <InterviewedStatus
          status={status}
          changeStatus={changeStatus}
          setLoadAgain={setLoadAgain}
          cv={cv}
          meetingInfo={meetingInfo}
          description="We are pleased to inform you that your interview was successful. Please wait to hear back from the interviewer."
        />
      )}
      {status === "Accepted" && (
        <AcceptedStatus
          status={status}
          changeStatus={changeStatus}
          setLoadAgain={setLoadAgain}
          cv={cv}
          description="We have informed your candidate of your decision."
        />
      )}
      {status === "Rejected" && (
        <RejectedStatus
          status={status}
          changeStatus={changeStatus}
          setLoadAgain={setLoadAgain}
          cv={cv}
          description="We have informed your candidate of your decision."
        />
      )}
      {![
        "New",
        "Shortlisted",
        "Pending Interview Confirmation",
        "Interview Scheduled",
        "Interview Rescheduled",
        "Interviewed",
        "Accepted",
        "Rejected",
      ].includes(status) && <div>Error</div>}
    </>
  );
};

const NewStatus = ({ status, description, changeStatus }: IStateProps) => {
  const [isConfirm, setIsConfirm] = useState<boolean>(false);
  const [btnChoosed, setButtonChoosed] = useState<string>("");
  const disclosure = useDisclosure();

  const handleClickButton = (updateStatus: string) => {
    setButtonChoosed(updateStatus);
    disclosure.onOpen();
  };

  useEffect(() => {
    if (isConfirm && changeStatus) {
      changeStatus({ status: btnChoosed });
      disclosure.onClose();
    }
  }, [isConfirm]);

  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} key={status} />
          </p>
        </div>

        <p className="text-gray-500 mt-4 text-[14px] opacity-80">
          {description}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
          radius="full"
          onClick={() => handleClickButton("Rejected")} // status name in db
        >
          Reject
        </Button>
        <Button
          className="bg-themeOrange text-[#fff]"
          radius="full"
          onClick={() => handleClickButton("Shortlisted")} // status name in db
        >
          Shortlisting
        </Button>
      </div>
      <ModalConfirm
        title={`Are you sure you want to change to status </br><strong>${btnChoosed}</strong>?`}
        description="You can not be undone !!"
        disclosure={disclosure}
        onCloseModal={() => setIsConfirm(false)}
        onConfirm={() => setIsConfirm(true)}
      />
    </div>
  );
};
const ApprovalInterviewScheduleStatus = ({
  status,
  description,
  changeStatus,
  meetingInfo,
}: IStateProps) => {
  const router = useRouter();
  const timeStart = meetingInfo?.meetingInfo?.timeStart || "";
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const scheduledTime = new Date(timeStart);

  useEffect(() => {
    const checkTime = () => {
      const currentTime = new Date();
      setIsButtonDisabled(currentTime < scheduledTime);
    };

    checkTime();

    const intervalId = setInterval(checkTime, 60000);

    return () => clearInterval(intervalId);
  }, [scheduledTime]);

  const handleNavigateToAdmin = (url: string) => {
    const currentTime = new Date();
    if (currentTime >= scheduledTime) {
      router.push(url);
    }
  };

  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} key={status} />
          </p>
        </div>

        <p className="text-gray-500 mt-4 text-[14px] opacity-80 mb-5">
          {description}
        </p>
        <div className="flex gap-4 items-center">
          <div className="bg-[#F6F5F9] rounded-full size-12 flex justify-center items-center">
            <AlarmClock />
          </div>
          <div>
            <strong>
              {meetingInfo &&
                formatTimeToHHMM(meetingInfo?.meetingInfo?.timeStart as string)}
            </strong>
            <div>
              {meetingInfo &&
                formatISOToDateString(
                  meetingInfo?.meetingInfo?.timeStart as string
                )}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Button
          className={`${
            isButtonDisabled
              ? "bg-[#E0E0E1] text-[#86868E] cursor-not-allowed"
              : "bg-themeOrange text-[#fff]"
          }`}
          radius="full"
          disabled={isButtonDisabled}
          onClick={() => handleNavigateToAdmin(meetingInfo?.meetingInfo?.url)}
        >
          {isButtonDisabled ? (
            "Not yet time"
          ) : (
            <div className="flex justify-center items-center gap-2">
              Go to Interview room <ArrowRight />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};
const InterviewedStatus = ({
  status,
  description,
  changeStatus,
}: IStateProps) => {
  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} key={status} />
          </p>
        </div>

        <p className="text-gray-500 mt-4 text-[14px] opacity-80">
          {description}
        </p>
      </div>
    </div>
  );
};
const AcceptedStatus = ({ status, description, changeStatus }: IStateProps) => {
  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} key={status} />
          </p>
        </div>

        <p className="text-gray-500 mt-4 text-[14px] opacity-80">
          {description}
        </p>
      </div>
    </div>
  );
};
const RejectedStatus = ({ status, description, changeStatus }: IStateProps) => {
  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} key={status} />
          </p>
        </div>

        <p className="text-gray-500 mt-4 text-[14px] opacity-80">
          {description}
        </p>
      </div>
    </div>
  );
};
const ShortlistedStatus = ({
  status,
  description,
  changeStatus,
  cv,
  applyId,
}: IStateProps) => {
  const disclosure = useDisclosure();

  const handleSend = (data: any) => {
    console.log("Scheduled Interview Data:", data);
  };

  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} key={status} />
          </p>
        </div>

        <p className="text-gray-500 mt-4 text-[14px] opacity-80">
          {description}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Button
          className="bg-themeOrange text-[#fff]"
          radius="full"
          onClick={() => disclosure.onOpen()}
        >
          Schedule a interview time
        </Button>
      </div>
      <ScheduleInterviewModal
        disclosure={disclosure}
        onClose={() => disclosure.onClose()}
        onSend={() => console.log("test")}
        cv={cv}
        changeStatus={changeStatus}
        applyId={applyId || ""}
      />
    </div>
  );
};
const InterviewPendingStatus = ({
  status,
  description,
  changeStatus,
  applyId,
  meetingInfo,
}: IStateProps) => {
  const isButtonDisabled = true;

  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} key={status} />
          </p>
        </div>

        <p className="text-gray-500 mt-4 text-[14px] opacity-80 mb-5">
          {description}
        </p>
        <div className="flex gap-4 items-center">
          <div className="bg-[#F6F5F9] rounded-full size-12 flex justify-center items-center">
            <AlarmClock />
          </div>
          <div>
            <strong>
              {meetingInfo &&
                formatTimeToHHMM(meetingInfo?.meetingInfo?.timeStart as string)}
            </strong>
            <div>
              {meetingInfo &&
                formatISOToDateString(
                  meetingInfo?.meetingInfo?.timeStart as string
                )}
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Button
          className={"bg-[#E0E0E1] text-[#86868E] cursor-not-allowed"}
          radius="full"
          disabled={isButtonDisabled}
        >
          <div className="flex justify-center items-center gap-2">
            Go to Interview room <ArrowRight size={"16px"} />
          </div>
        </Button>
      </div>
    </div>
  );
};
const RescheduleStatus = ({
  status,
  description,
  changeStatus,
  cv,
  applyId,
}: IStateProps) => {
  const disclosure = useDisclosure();
  const [isConfirm, setIsConfirm] = useState<boolean>(false);
  const [btnChoosed, setButtonChoosed] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const disclosureConfirm = useDisclosure();

  const handleClickButton = (updateStatus: string) => {
    setButtonChoosed(updateStatus);
    disclosureConfirm.onOpen();
  };

  const getReajectReason = async () => {
    if (!applyId) return;

    setIsLoading(true);
    const reason = await meetingApi.getCandidateRejectReason(applyId);
    setReason(reason?.reason || "");
    setIsLoading(false);
  };

  useEffect(() => {
    if (isConfirm && changeStatus) {
      changeStatus({ status: btnChoosed });
      disclosureConfirm.onClose();
    }
  }, [isConfirm]);

  useEffect(() => {
    getReajectReason();
  }, [applyId]);
  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} key={status} />
          </p>
        </div>

        <p className="text-gray-500 mt-4 text-[14px] opacity-80">
          {description}
        </p>
        <p className="mt-4 text-themeDark font-semibold">
          {isLoading && (
            <div className="flex gap-2 text-themeOrange">
              <LoadingSpinner />
              <span>Reason loading...</span>
            </div>
          )}
          {!isLoading && reason ? `"${reason}"` : ""}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button
          className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
          radius="full"
          onClick={() => handleClickButton("Rejected")}
        >
          Disqualify Candidate
        </Button>
        <Button
          className="bg-themeOrange text-[#fff]"
          radius="full"
          onClick={() => disclosure.onOpen()}
        >
          Reschedule time
        </Button>
      </div>
      <ScheduleInterviewModal
        disclosure={disclosure}
        onClose={() => disclosure.onClose()}
        onSend={() => console.log("test")}
        cv={cv}
        changeStatus={changeStatus}
        applyId={applyId || ""}
      />
      <ModalConfirm
        title={`Are you sure you want to change to status </br><strong>${btnChoosed}</strong>?`}
        description="You can not be undone !!"
        disclosure={disclosureConfirm}
        onCloseModal={() => setIsConfirm(false)}
        onConfirm={() => setIsConfirm(true)}
      />
    </div>
  );
};
