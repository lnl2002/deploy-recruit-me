"use client";
import React, { useEffect, useState } from "react";
import JobStatus from "../../JobStatus";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { RootState, useAppSelector } from "@/store/store";
import jobApi from "@/api/jobApi";
import { toast } from "react-toastify";
import ModalConfirm from "@/components/Modals/ModalConfirm";
import LoadingSpinner from "@/components/LoadingSpinner";
import systemApi from "@/api/systemApi";

type JobStateProps = {
  state: string;
};

const JobState = ({ state }: JobStateProps) => {
  let description = "";
  switch (state) {
    case "pending":
      description = "Awaiting approval before being publicly listed.";
      break;
    case "approved":
      description = "Approved but not yet published.";
      break;
    case "reopened":
      description = "Reopened after being closed or expired.";
      break;
    case "published":
      description = "Publicly listed and open for applications.";
      break;
    case "expired":
      description = "No longer accepting applications due to expiration.";
      break;
    case "rejected":
      description = "Not approved and denied for publishing.";
      break;
    default:
      description = "";
      break;
  }

  const [btnChoosed, setButtonChoosed] = useState<string>("");
  const [isConfirm, setIsConfirm] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const job = useAppSelector((state: RootState) => state.job.job);
  const disclosure = useDisclosure();
  const rejectDisclosure = useDisclosure();

  const handleClickButton = (updateStatus: string) => {
    setButtonChoosed(updateStatus);
    disclosure.onOpen();
  };

  const handleUpdateStatus = async ({
    jobId,
    status,
    rejectReason,
  }: {
    jobId: string;
    status: string;
    rejectReason?: string;
  }) => {
    const data = await jobApi.updateJobStatus({
      jobId,
      status,
      rejectReason,
    });

    if (!data) {
      toast.error("Something went wrong. Please try again");
      return;
    } else{
      systemApi.createNotification({
        content: `Your JD's status is changed into: ` + status,
        receiver: job?.account ?? "",
        url: "/recruiter/job-details?id=" + job?._id,
      });
    }

    disclosure.onClose();
    toast.success("Change status successfully");
    window.location.reload();
  };

  const handleClickReject = async () => {
    if (!message || message.length === 0) {
      return;
    }

    if (!job) return;

    setIsLoading(true);
    await handleUpdateStatus({
      jobId: job?._id,
      status: "rejected",
      rejectReason: message,
    });
    setIsLoading(false);
  };

  useEffect(() => {
    if (
      isConfirm &&
      ["approved", "rejected"].includes(btnChoosed) &&
      job?._id
    ) {
      handleUpdateStatus({
        jobId: job._id,
        status: btnChoosed,
      });
    }
  }, [isConfirm]);

  return (
    <div className="text-themeDark">
      <div className="flex justify-between mb-5">
        <div className="text-[24px] font-bold">State</div>
        <div>
          <JobStatus status={state || ""} />
        </div>
      </div>
      <div className="text-[#86868E]">{description || ""}</div>
      {job && job.status === "pending" && (
        <div className="mt-8 grid grid-cols-2 gap-4">
          <Button
            radius="full"
            className="bg-themeOrange text-[#fff]"
            onClick={() => handleClickButton("approved")}
          >
            Approve
          </Button>
          <Button
            radius="full"
            className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
            onClick={() => rejectDisclosure.onOpen()}
          >
            Reject
          </Button>
        </div>
      )}

      <ModalConfirm
        title={`Are you sure you want to change to status </br><strong>${
          btnChoosed === "approved"
            ? "Approve"
            : btnChoosed === "rejected"
            ? "Reject"
            : "Error"
        }</strong>?`}
        description="You can not be undone !!"
        disclosure={disclosure}
        onCloseModal={() => setIsConfirm(false)}
        onConfirm={() => setIsConfirm(true)}
      />
      <Modal
        size={"xl"}
        isOpen={rejectDisclosure.isOpen}
        onClose={rejectDisclosure.onClose}
      >
        <ModalContent className="text-themeDark">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 justify-center">
                <div className="flex justify-center text-[22px]">
                  Reject Job
                </div>
                <div className="text-[#86868E] font-normal text-[16px] flex justify-center">
                  Please provide a reason for declining this job offer so that
                  the recruiter can make appropriate adjustments.
                </div>
              </ModalHeader>
              <ModalBody>
                <div>
                  Reason <span className="text-[#D91E2A]">*</span>
                </div>
                <div>
                  <Textarea
                    placeholder="Enter your reason here"
                    value={message}
                    onValueChange={setMessage}
                  />
                </div>
              </ModalBody>
              <ModalFooter className="grid grid-cols-2 gap-4">
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                  className="border-1 border-themeOrange bg-opacity-0 text-themeOrange"
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={() => handleClickReject()}
                  className={`${
                    message.length > 0
                      ? "bg-themeOrange text-[#fff] cursor-pointer"
                      : "bg-[#E0E0E1] text-[#86868E] cursor-not-allowed"
                  } `}
                   isLoading={isLoading}
                   spinner={
                    <LoadingSpinner/>
                  }
                >
                  Send
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default JobState;
