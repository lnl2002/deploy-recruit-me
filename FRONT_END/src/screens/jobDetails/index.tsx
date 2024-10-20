"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "./components/Header";
import jobApi, { TJob } from "@/api/jobApi";
import InformationJob from "./components/InformationJob";
import { Dot } from "lucide-react";
import { Image, useDisclosure } from "@nextui-org/react";
import ModalCommon from "@/components/Modals/ModalCommon";
import { FormApplyJob } from "@/components";
import { asyncState } from "@/utils/constants";
import Lottie from "react-lottie";
import { LottieApp } from "@/lotties";
import { applyApi } from "@/api/applyApi";

const JobDetails = (): React.JSX.Element => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("id");
  const [job, setJob] = useState<Partial<TJob>>({});
  const [state, setState] = useState<string>(asyncState.loading);
  const [responseMessage, setResponseMessage] = useState<string>();

  //disclosure
  const popupApplyJob = useDisclosure();
  const responseModal = useDisclosure();

  useEffect(() => {
    (async () => {
      const { job } = await jobApi.getJobById(jobId as string);
      setJob(job);
    })();
  }, [jobId]);

  const _applyJob = async (cv: Partial<TJob>) => {
    popupApplyJob.onClose();
    responseModal.onOpen();
    if (!jobId || jobId == "") return;
    try {
      setState(asyncState.loading);
      await applyApi.applyToJob(cv, jobId);
      setTimeout(() => {
        setState(asyncState.success);
        setResponseMessage(
          "Your applycation has been sent, response will be sent to your email."
        );
      }, 500);
    } catch (error) {
      setState(asyncState.error);
    }
  };

  const resetState = () => {
    setState(asyncState.loading);
    setResponseMessage("Please wait...");
  };

  return (
    <>
      <Header bannerUrl={job.unit?.banner} imageUrl={job.unit?.image} />
      <div className="flex justify-center">
        <div className="flex flex-col w-9/12 -mt-20 gap-4">
          <div className="flex flex-col gap-3">
            <Image
              src={job.unit?.image}
              alt=""
              radius="full"
              className="w-32 p-1 bg-themeWhite shadow-md"
            />
            <h1 className="text-themeDark text-3xl font-bold">{job.title}</h1>
            <div className="flex gap-1 items-center">
              <span className="text-sm text-blurEffect">
                {job.location?.city}
              </span>
              <Dot />
              {job.createdAt && (
                <span className="text-sm text-blurEffect">
                  {new Date(job.createdAt).toISOString().split("T")[0]}
                </span>
              )}
            </div>
          </div>

          <InformationJob job={job} onApply={() => popupApplyJob.onOpen()} />
        </div>
      </div>

      <ModalCommon size={"2xl"} disclosure={popupApplyJob}>
        <FormApplyJob
          onCancel={popupApplyJob.onClose}
          onApply={_applyJob}
          job={job as TJob}
        />
      </ModalCommon>

      <ModalCommon onCloseModal={resetState} disclosure={responseModal}>
        <p className="text-textPrimary text-xl my-5 text-center">
          {responseMessage}
        </p>
        {state === asyncState.loading ? (
          <Lottie
            style={{ width: 100, height: 100 }}
            options={{
              loop: true,
              autoplay: true,
              animationData: LottieApp.Loading,
              rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
              },
            }}
            isClickToPauseDisabled={true}
            width={"100%"}
          />
        ) : state === asyncState.success ? (
          <Lottie
            style={{ width: 100, height: 100 }}
            options={{
              loop: false,
              autoplay: true,
              animationData: LottieApp.Success,
              rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
              },
            }}
            isClickToPauseDisabled={true}
            width={"100%"}
          />
        ) : (
          <Lottie
            style={{ width: 100, height: 100 }}
            options={{
              loop: false,
              autoplay: true,
              animationData: LottieApp.Error,
              rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
              },
            }}
            isClickToPauseDisabled={true}
            width={"100%"}
          />
        )}
      </ModalCommon>
    </>
  );
};

export default JobDetails;
