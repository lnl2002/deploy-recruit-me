import meetingApi, { IMeeting } from "@/api/meetingApi";
import Status, {
  getStateText,
} from "@/screens/recruiter/jobDetails/components/ApplicationList/components/status";
import { AlarmClockIcon, CheckCircle2, XCircle } from "lucide-react";
import { ButtonApp } from "../ButtonApp";
import { useAppSelector } from "@/store/store";
import { useEffect, useState } from "react";
import { formatDateTimeSeperate } from "@/utils/formatDateTime";
import ModalCommon from "../Modals/ModalCommon";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Link,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";
import applyApi from "@/api/applyApi";
import systemApi from "@/api/systemApi";

type Props = {};

export const StateBox: React.FC<Props> = (props) => {
  const { applyInfo } = useAppSelector((state) => state.applyInfo);
  const [meeting, setMeeting] = useState<IMeeting>();
  const declineDisclosure = useDisclosure();
  const agreeDisclosure = useDisclosure();
  const route = useRouter();
  const { userInfo } = useAppSelector((state) => state.user);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (applyInfo?._id) {
      fetchMeeting(applyInfo?._id);
    }
  }, [applyInfo]);

  const fetchMeeting = async (applyId: string) => {
    const res = await meetingApi.getMeetingByApplyId(applyId);
    console.log(res);
    setMeeting(res?.data ?? undefined);
  };

  const acceptSchedule = async () => {
    await meetingApi.updateMeetingStatus({
      meetingRoomId: meeting?._id ?? "",
      status: "approved",
    });

    if (applyInfo) {
      const data = await applyApi.updateApplyStatus({
        applyId: applyInfo._id,
        newStatus: "Interview Scheduled",
      });
      window.location.reload();
    }

    if (applyInfo?._id) {
      fetchMeeting(applyInfo?._id);
    }
  };

  const declineSchedule = async () => {
    await meetingApi.updateMeetingStatus({
      meetingRoomId: meeting?._id ?? "",
      status: "rejected",
      declineReason: message,
    });

    if (applyInfo && meeting.rejectCount < 2) {
      const data = await applyApi.updateApplyStatus({
        applyId: applyInfo._id,
        newStatus: "Interview Rescheduled",
      });
      systemApi.createNotification({
        content: "A candidate have canceled the meeting schedule",
        receiver: apply?.job?.account ?? "",
        url: "/job-details?id=" + apply?.job?._id,
      });
    }
    window.location.reload();

    if (applyInfo?._id) {
      fetchMeeting(applyInfo?._id);
    }
  };

  const goMeeting = () => {
    if (meeting && applyInfo?.status.name == "Interview Scheduled")
      return (
        <Link href={meeting.url}>
          <ButtonApp
            className="bg-white text-textIconBrand border w-full col-span-1 mt-10"
            title="Go to Interview Room"
          />
        </Link>
      );
    if (meeting && applyInfo?.status.name == "Interview Rescheduled") {
      return (
        <>
          {meeting.participants
            .filter((e) => e.participant == userInfo?._id)
            .at(0)?.status == "rejected" && (
            <div className="flex flex-col gap-4 mt-10">
              <div className="flex items-center gap-5">
                <XCircle size={35} color="#f31260" />
                <p className="text-danger-500 font-medium text-base">
                  You have declined the schedule
                </p>
              </div>
            </div>
          )}
        </>
      );
    }
  };

  const conFirmMeeting = () => {
    if (meeting && applyInfo?.status.name === "Pending Interview Confirmation")
      return (
        <>
          {meeting.participants
            .filter((e) => e.participant == userInfo?._id)
            .at(0)?.status && (
            <div className="grid grid-cols-2 gap-4 mt-10">
              <ButtonApp
                onClick={() => {
                  declineDisclosure.onOpen();
                }}
                className="bg-white text-textIconBrand border w-full col-span-1"
                title="Decline"
              />
              <ButtonApp
                onClick={() => {
                  agreeDisclosure.onOpen();
                }}
                type="submit"
                className="w-full col-span-1 text-themeWhite"
                title="Accept"
              />
            </div>
          )}
        </>
      );
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <p className="text-themeDark font-bold text-2xl">State</p>
        <Status status={applyInfo?.status.name ?? "n/a"} />
      </div>
      <p className="text-base text-textTertiary mt-8">
        {getStateText(applyInfo?.status.name ?? "default")[0]}
      </p>
      {meeting && (
        <div className="flex flex-col gap-4 mt-10">
          <div className="flex gap-4">
            <div className="bg-surfaceTertiary p-3 rounded-full">
              <AlarmClockIcon color="#000000" />
            </div>
            <div>
              <p className="text-textPrimary text-lg font-semibold">
                {formatDateTimeSeperate(meeting?.timeStart ?? "").time}
              </p>
              <p className="text-textSecondary text-base">
                {formatDateTimeSeperate(meeting?.timeStart ?? "").formattedDate}
              </p>
            </div>
          </div>

          {conFirmMeeting()}
          {goMeeting()}
        </div>
      )}
      <ModalCommon size={"xl"} disclosure={declineDisclosure}>
        <Card className=" w-full  bg-white shadow-none">
          <CardHeader className="flex flex-col items-center justify-center gap-2 pt-6">
            <h1 className="text-xl font-semibold">
              Decline Interview Schedule
            </h1>
            <p className="text-sm text-textTertiary text-center">
              To assist us in scheduling future interviews, please provide a
              reason for declining and suggest alternative times that would be
              more convenient.
            </p>
          </CardHeader>

          <CardBody className="">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <label className="text-sm font-medium">Message</label>
                <span className="text-red-500">*</span>
              </div>
              <Textarea
                variant="bordered"
                placeholder="Please provide the recruiter with a rationale for declining this interview..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                minRows={4}
                className="w-full"
              />
              <div className="flex justify-end text-sm text-gray-400">
                {message.length}/3000
              </div>
            </div>
          </CardBody>

          <CardFooter className="flex flex-col gap-3">
            <div className="flex gap-3 w-full">
              <Button
                onClick={() => {
                  declineDisclosure.onClose();
                }}
                className="flex-1 bg-white border-2 border-themeOrange rounded-full text-themeOrange"
                variant="bordered"
              >
                Not now
              </Button>
              <Button
                onClick={() => {
                  declineDisclosure.onClose();
                  declineSchedule();
                }}
                className="flex-1 bg-surfaceTertiary text-black rounded-full"
              >
                Send
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-400"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12" y2="8" />
              </svg>
              <span className="text-textTertiary">
                Kindly note that 3 declines may impact your future interview
                opportunities.
              </span>
            </div>
          </CardFooter>
        </Card>
      </ModalCommon>
      <ModalCommon size={"xl"} disclosure={agreeDisclosure}>
        <Card className=" w-full  bg-white shadow-none">
          <CardHeader className="flex flex-col items-center justify-center gap-2 pt-6">
            <h1 className="text-xl font-semibold">Accept Interview Schedule</h1>
            <p className="text-sm text-textTertiary text-center">
              By accepting the schedule, you will be recorded as having agreed
              with the time and ready for the meeting.
            </p>
          </CardHeader>

          <CardFooter className="flex flex-col gap-3">
            <div className="flex gap-3 w-full">
              <Button
                onClick={() => {
                  agreeDisclosure.onClose();
                  acceptSchedule();
                }}
                className="flex-1 bg-white border-2 border-themeOrange rounded-full text-themeOrange"
              >
                Accept
              </Button>
            </div>
          </CardFooter>
        </Card>
      </ModalCommon>
    </div>
  );
};
