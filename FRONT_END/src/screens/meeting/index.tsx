"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import Video, {
  Room as TwilioRoom,
  LocalVideoTrack,
  LocalAudioTrack,
  LocalTrackPublication,
} from "twilio-video";
import { v4 as uuidv4 } from "uuid";
import meetingApi, { IMeeting } from "@/api/meetingApi";
// import Room from "./components/Room";
import Lobby from "./components/Lobby";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";
import { FRONTEND_URL } from "@/utils/env";
import applyApi, { IApply } from "@/api/applyApi";
import { TJob } from "@/api/jobApi";
import { IApplicantReport } from "@/api/applicantReportApi";
import HeaderMeeting from "./components/HeaderMeeting";

interface PageProps {
  params: {
    id: string;
  };
}

const Room = dynamic(() => import("./components/Room"), { ssr: false });

export const Meeting: React.FC<PageProps> = ({ params }): React.JSX.Element => {
  // const paramss = params;
  const { isLoggedIn, userInfo } = useAppSelector((state) => state.user);
  const router = useRouter();
  let mediaStreamRef = useRef<MediaStream | null>(null);
  const [isContactSegment, setIsContactSegment] = useState<boolean>(false);
  const [meetingUrl, setMeetingUrl] = useState<string>("");
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
        setMeetingUrl(data.url);
        const apply = await applyApi.getApplicationById({ _id: data.apply });
        if (apply) setApply(apply);
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

        // If permissions are granted, get media stream
        if (
          cameraPermission.state === "granted" ||
          microphonePermission.state === "granted"
        ) {
          mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
            video: cameraPermission.state === "granted",
            audio: microphonePermission.state === "granted",
          });
        }

        // Thêm sự kiện lắng nghe khi trạng thái quyền thay đổi
        cameraPermission.onchange = () =>
          setIsCameraOn(cameraPermission.state == "granted");
        microphonePermission.onchange = () =>
          setIsMicOn(microphonePermission.state == "granted");
      } catch (error) {
        console.error("Error checking permissions:", error);
      }
    })();
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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

  const createNewRoom = async () => {
    try {
      await meetingApi.createRoom(meetingUrl);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = useCallback(async () => {
    setConnecting(true);
    try {
      if (!username) {
        toast.error("user name is required");
        return;
      }
      const { data, status } = await meetingApi.getAccessToken(
        username + "6C1B01A16E67" + uuidv4(),
        meetingUrl
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
        name: meetingUrl,
        audio: isMicOn,
        video: isCameraOn,
      });

      console.log(connectedRoom.sid);

      // setRoomSid(connectedRoom.sid);
      setRoom(connectedRoom);
    } catch (error: any) {
      console.log(error);

      toast.error((error as Error).message);
    } finally {
      setConnecting(false);
    }
  }, [username, isMicOn, isCameraOn, meetingUrl]);

  const handleLogout = useCallback(() => {
    setRoom((prevRoom) => {
      if (prevRoom) {
        prevRoom.localParticipant.tracks.forEach(
          (trackPub: LocalTrackPublication) => {
            const track = trackPub.track;
            if (track) {
              if (
                track instanceof LocalAudioTrack ||
                track instanceof LocalVideoTrack
              ) {
                track.stop();
              }
            }
          }
        );
        prevRoom.disconnect();
        console.log(prevRoom.sid);

        return null;
      }
      return prevRoom;
    });
  }, [room]);

  useEffect(() => {
    if (room) {
      const tidyUp = (event: Event) => {
        if (!(event as PageTransitionEvent).persisted) {
          handleLogout();
        }
      };

      window.addEventListener("pagehide", tidyUp);
      window.addEventListener("beforeunload", tidyUp);

      return () => {
        window.removeEventListener("pagehide", tidyUp);
        window.removeEventListener("beforeunload", tidyUp);
      };
    }
  }, [room, handleLogout]);

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
          job={apply?.job as TJob}
          applicantReportIds={(
            apply?.applicantReports as IApplicantReport[]
          )?.map(
            (applicantReport) => (applicantReport as IApplicantReport)._id
          )}
          isContactSegment={isContactSegment}
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
    </>
  );
};
