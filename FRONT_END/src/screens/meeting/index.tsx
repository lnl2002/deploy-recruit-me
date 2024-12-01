"use client";

import React, { useState, useCallback, useEffect } from "react";
import Video, {
  Room as TwilioRoom,
  LocalVideoTrack,
  LocalAudioTrack,
  LocalTrackPublication,
} from "twilio-video";
import { v4 as uuidv4 } from "uuid";
import meetingApi from "@/api/meetingApi";
import Lobby from "./components/Lobby";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";
import { FRONTEND_URL } from "@/utils/env";
import applyApi, { IApply, ICVScore } from "@/api/applyApi";
import { TJob } from "@/api/jobApi";
import { IApplicantReport } from "@/api/applicantReportApi";
import HeaderMeeting from "./components/HeaderMeeting";
import { useDisclosure } from "@nextui-org/react";
import EndMeeting from "./components/EndMeeting";

interface PageProps {
  params: {
    id: string;
  };
}

const Room = dynamic(() => import("./components/Room"), { ssr: false });

export const Meeting: React.FC<PageProps> = ({ params }): React.JSX.Element => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { isLoggedIn, userInfo } = useAppSelector((state) => state.user);
  const router = useRouter();
  const [isContactSegment, setIsContactSegment] = useState<boolean>(false);
  const [meetingURL, setMeetingURL] = useState<string>("");
  const [apply, setApply] = useState<IApply | null>(null);
  const [username, setUsername] = useState<string>("");
  const [room, setRoom] = useState<TwilioRoom | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);

  // call api
  useEffect(() => {
    // Set room from meeting API
    (async () => {
      const data = await meetingApi.getMeetingRoomByUrl(
        FRONTEND_URL + "/meeting/" + params.id
      );

      if (data) {
        setMeetingURL(data.url);
        const apply = await applyApi.getApplicationById({ _id: data.apply });
        if (apply) {
          setApply(apply);
        }
      } else {
        toast.error("Meeting URL not exists!");
        router.push("/");
      }
    })();
  }, [params]);

  useEffect(() => {
    (async () => {
      try {
        // Kiểm tra quyền truy cập camera
        const cameraPermission = await navigator.permissions.query({
          name: "camera" as PermissionName,
        });
        setIsCameraOn(cameraPermission.state == "granted");

        // Kiểm tra quyền truy cập microphone
        const microphonePermission = await navigator.permissions.query({
          name: "microphone" as PermissionName,
        });
        setIsMicOn(microphonePermission.state == "granted");
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    })();
  }, []);

  useEffect(() => {
    return () => {
      disconnectRoom(room);
    };
  }, [room]);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    } else {
      setUsername(userInfo?.displayName as string);
    }
  }, [isLoggedIn, userInfo]);

  const handleUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(event.target.value);
    },
    []
  );

  const createNewRoom = useCallback(async () => {
    try {
      await meetingApi.createRoom(meetingURL);
    } catch (error) {
      console.log(error);
    }
  }, [meetingURL]);

  const handleSubmit = useCallback(async () => {
    setConnecting(true);
    try {
      if (!username) {
        toast.error("user name is required");
        return;
      }
      const { data, status } = await meetingApi.getAccessToken(
        username + "6C1B01A16E67" + uuidv4(),
        meetingURL
      );

      if (status !== 200) {
        if (data === "Invalid token") {
          toast.error("Login session has expired");
          router.push("/login");
          return;
        }

        toast.error(data);
        return;
      }

      const connectedRoom = await Video.connect(data, {
        name: meetingURL,
        audio: isMicOn,
        video: isCameraOn,
      });

      // setRoomSid(connectedRoom.sid);
      setRoom(connectedRoom);
    } catch (error: any) {
      console.log(error);

      toast.error((error as Error).message);
    } finally {
      setConnecting(false);
    }
  }, [username, isMicOn, isCameraOn, meetingURL]);

  const disconnectRoom = (room: TwilioRoom | null) => {
    if (room) {
      room.localParticipant.tracks.forEach(
        (trackPub: LocalTrackPublication) => {
          const track = trackPub.track;
          if (
            track &&
            (track instanceof LocalAudioTrack ||
              track instanceof LocalVideoTrack)
          ) {
            track.stop();
          }
        }
      );
      room.disconnect();
    }
    return null;
  };

  const handleLogout = useCallback(
    (isDisconnected?: boolean) => {
      const roles = ["INTERVIEWER", "INTERVIEW_MANAGER"];
      const isAllowed = roles.some((role) => userInfo?.role === role);
      if (isAllowed && !isDisconnected) {
        onOpen();
      } else {
        setRoom((prevRoom) => disconnectRoom(prevRoom));
        router.push("/");
      }
    },
    [userInfo]
  );

  const onEndMeeting = useCallback(async () => {
    if (room?.sid && isOpen) {
      setRoom((prevRoom) => disconnectRoom(prevRoom));
      await meetingApi.endMeeting(room.sid);
      await applyApi.updateApplyStatus({
        applyId: apply?._id as string,
        newStatus: "Interviewed",
      });
      setIsCameraOn(false);
      onOpenChange();
      router.push("/");
    }
  }, [room, isOpen, meetingApi, apply?._id]);

  useEffect(() => {
    const tidyUp = (event: Event) => {
      if (!(event as PageTransitionEvent).persisted) {
        disconnectRoom(room);
      }
    };

    window.addEventListener("pagehide", tidyUp);
    window.addEventListener("beforeunload", tidyUp);

    return () => {
      window.removeEventListener("pagehide", tidyUp);
      window.removeEventListener("beforeunload", tidyUp);
    };
  }, [room]);

  return (
    <>
      <HeaderMeeting
        jobId={(apply?.job as TJob)?._id ?? ""}
        setIsContactSegment={setIsContactSegment}
        isContactSegment={isContactSegment}
        isOpenPanel={!!room}
      />
      {room ? (
        <Room
          setIsCameraOn={setIsCameraOn}
          isCameraOn={isCameraOn}
          setIsMicOn={setIsMicOn}
          isMicOn={isMicOn}
          room={room}
          handleLogout={handleLogout}
          cvScore={apply?.cvScore as ICVScore}
          applicantReportIds={(
            apply?.applicantReports as IApplicantReport[]
          )?.map((applicantReport) => applicantReport._id)}
          isContactSegment={isContactSegment}
          applyId={apply?._id ?? ""}
        />
      ) : (
        <Lobby
          setIsCameraOn={setIsCameraOn}
          isCameraOn={isCameraOn}
          setIsMicOn={setIsMicOn}
          isMicOn={isMicOn}
          username={username}
          handleUsernameChange={handleUsernameChange}
          handleSubmit={handleSubmit}
          createNewRoom={createNewRoom}
          connecting={connecting}
        />
      )}
      {isOpen && (
        <EndMeeting
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          onEndMeeting={onEndMeeting}
        />
      )}
    </>
  );
};
