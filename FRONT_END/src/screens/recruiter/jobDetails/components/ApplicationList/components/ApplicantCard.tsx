import { Avatar, Button, useDisclosure } from "@nextui-org/react";
import React, { useState } from "react";
import Status from "./status";
import { AlarmClock, ChevronLeft } from "lucide-react";
import { IStateProps } from "../types/status";
import applyApi from "@/api/applyApi";
import { toast } from "react-toastify";
import ScheduleInterviewModal from "./BookSchedule";

interface ApplicantCardProps {
  name: string;
  email: string;
  phoneNumber: string;
  gender: string;
  address: string;
  state: string;
  cvUrl: string;
  onDecline: () => void;
  onShortlist: () => void;
  isOpen: boolean;
  onClose: () => void;
  applyId: string;
}

const ApplicantCard: React.FC<ApplicantCardProps> = ({
  name,
  email,
  phoneNumber,
  gender,
  address,
  state,
  cvUrl,
  onDecline,
  onShortlist,
  isOpen,
  onClose,
  applyId,
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
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
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
                      <a
                        href={cvUrl}
                        target="_blank"
                        className="text-orange-500 hover:underline"
                        rel="noopener noreferrer"
                      >
                        View CV
                      </a>
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
          <State status={state} applyId={applyId} />
        </div>
      </div>
    </>
  );
};

export default ApplicantCard;

const State = ({ status, applyId = "" }: IStateProps) => {
  const changeStatus = async ({ status }: { status: string }) => {
    const data = await applyApi.updateApplyStatus({
      applyId,
      newStatus: status,
    });

    console.log(data);
    if (!data) {
      toast.error("Something went wrong! pls try again");
      return;
    }
    toast.success('Change status successfully')
  };

  switch (status) {
    case "New":
      return (
        <NewStatus
          status={status}
          changeStatus={changeStatus}
          description="By shortlisting this candidate, you have indicated your interest in interviewing them and they will be contacted shortly to schedule an interview."
        />
      );
    case "Shortlisted":
      return (
        <ShortlistedStatus
          status={status}
          changeStatus={changeStatus}
          description="Schedule an interview for the candidate now so you can interview them."
        />
      );
    case "Interview Pending":
      return (
        <InterviewPendingStatus
          status={status}
          changeStatus={changeStatus}
          description="You have scheduled an interview for the candidate. Kindly wait for their confirmation."
        />
      );
    case "Approval Interview Scheduled":
      return (
        <ApprovalInterviewScheduleStatus
          status={status}
          changeStatus={changeStatus}
          description="The interview has been confirmed by both the candidate and the interviewer."
        />
      );
    case "Interview Rescheduled":
      return (
        <RescheduleStatus
          status={status}
          changeStatus={changeStatus}
          description="The candidate has declined the current interview. Please review and suggest a new schedule or make a different decision regarding this candidate."
        />
      );
    case "Interviewed":
      return (
        <InterviewedStatus
          status={status}
          changeStatus={changeStatus}
          description="We are pleased to inform you that your interview was successful. Please wait to hear back from the interviewer."
        />
      );
    case "Accepted":
      return (
        <AcceptedStatus
          status={status}
          changeStatus={changeStatus}
          description="We have informed your candidate of your decision."
        />
      );
    case "Rejected":
      return (
        <RejectedStatus
          status={status}
          changeStatus={changeStatus}
          description="We have informed your candidate of your decision."
        />
      );
    default:
      return <div>Error</div>;
  }
};

const NewStatus = ({ status, description, changeStatus }: IStateProps) => {
  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} />
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
        >
          Decline
        </Button>
        <Button className="bg-themeOrange text-[#fff]" radius="full">
          Shortlisting
        </Button>
      </div>
    </div>
  );
};
const ApprovalInterviewScheduleStatus = ({
  status,
  description,
  changeStatus
}: IStateProps) => {
  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} />
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
            <strong>12:00</strong>
            <div>28 December 2024</div>
          </div>
        </div>
      </div>
    </div>
  );
};
const InterviewedStatus = ({ status, description, changeStatus }: IStateProps) => {
  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} />
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
            <Status status={status} />
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
            <Status status={status} />
          </p>
        </div>

        <p className="text-gray-500 mt-4 text-[14px] opacity-80">
          {description}
        </p>
      </div>
    </div>
  );
};
const ShortlistedStatus = ({ status, description, changeStatus }: IStateProps) => {
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
            <Status status={status} />
          </p>
        </div>

        <p className="text-gray-500 mt-4 text-[14px] opacity-80">
          {description}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        <Button className="bg-themeOrange text-[#fff]" radius="full" onClick={() => disclosure.onOpen()}>
          Schedule a interview time
        </Button>
      </div>
      <ScheduleInterviewModal 
        disclosure={disclosure}
        onClose={() => console.log('test')}
        onSend={() => console.log('test')}
        />
    </div>
  );
};
const InterviewPendingStatus = ({ status, description, changeStatus }: IStateProps) => {
  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} />
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
        >
          Decline
        </Button>
        <Button className="bg-themeOrange text-[#fff]" radius="full">
          Shortlisting
        </Button>
      </div>
    </div>
  );
};
const RescheduleStatus = ({ status, description, changeStatus }: IStateProps) => {
  return (
    <div className="flex-grow flex justify-between flex-col">
      <div className="mb-6">
        <div className="flex justify-between">
          <h3 className="text-lg font-semibold">Status</h3>
          <p className="text-gray-500 mb-2">
            <Status status={status} />
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
        >
          Decline
        </Button>
        <Button className="bg-themeOrange text-[#fff]" radius="full">
          Reschedule time
        </Button>
      </div>
    </div>
  );
};
