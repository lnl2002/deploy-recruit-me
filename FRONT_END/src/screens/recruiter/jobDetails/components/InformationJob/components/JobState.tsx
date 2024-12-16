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
  const job = useAppSelector((state: RootState) => state.job.job);
  const disclosure = useDisclosure();

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
    }

    disclosure.onClose();
    toast.success("Change status successfully");
    window.location.reload();
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
          <JobStatus status={state || ""}/>
        </div>
      </div>
      <div className="text-[#86868E]">{state !== 'rejected' ?  (description || "") : (`"${job?.rejectReason}"` || '')}</div>
    </div>
  );
};

export default JobState;
