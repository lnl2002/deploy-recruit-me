"use client";

import { Button, Card, Tab, Tabs } from "@nextui-org/react";
import { Mic, MicOff, Phone, Video, VideoOff } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import {
  Room as TwilioRoom,
  Participant as TwilioParticipant,
  createLocalVideoTrack,
  createLocalAudioTrack,
} from "twilio-video";
import CameraOffView from "./CameraOffView";
import CriteriaEvaluation from "./CriteriaEvaluation";
import LiveChat from "./LiveChat";
import { TJob } from "@/api/jobApi";
// import Participant from "./Participant";

const Participant = dynamic(() => import("./Participant"), { ssr: false });

interface RoomProps {
  room: TwilioRoom;
  handleLogout?: () => void;
  setIsCameraOn: (isCameraOn: boolean) => void;
  setIsMicOn: (isCameraOn: boolean) => void;
  isCameraOn: boolean;
  isMicOn: boolean;
  isContactSegment: boolean;
  applicantReportIds: string[];
  job: TJob;
}

const Room: React.FC<RoomProps> = ({
  room,
  handleLogout,
  setIsCameraOn,
  setIsMicOn,
  isCameraOn,
  isMicOn,
  applicantReportIds,
  isContactSegment,
  job,
}) => {
  const [participants, setParticipants] = useState<TwilioParticipant[]>(
    Array.from(room?.participants.values()) ?? []
  );
  const [participantSelected, setParticipantSelected] =
    useState<TwilioParticipant | null>(null);

  const localParticipant = (localParticipant: TwilioParticipant) => {
    setParticipants((prevParticipants) => [
      ...prevParticipants,
      localParticipant,
    ]);
    setParticipantSelected(localParticipant);
  };

  const handleCameraOff = () => {
    if (!room) return;
    room.localParticipant.videoTracks.forEach((publication) => {
      publication.track.stop();
      publication.unpublish();
      setIsCameraOn(false);
    });
  };

  const handleMicOff = () => {
    if (!room) return;
    room.localParticipant.audioTracks.forEach((publication) => {
      publication.track.stop();
      publication.unpublish();
      setIsMicOn(false);
    });
  };

  const handleCameraOn = async () => {
    if (!room) return;
    createLocalVideoTrack()
      .then((localVideoTrack) => {
        return room.localParticipant.publishTrack(localVideoTrack);
      })
      .then(() => setIsCameraOn(true));
  };

  const handleMicOn = () => {
    if (!room) return;
    createLocalAudioTrack()
      .then((localAudioTrack) => {
        return room.localParticipant.publishTrack(localAudioTrack);
      })
      .then(() => setIsMicOn(true));
  };

  useEffect(() => {
    localParticipant(room.localParticipant);

    const participantConnected = (participant: TwilioParticipant) => {
      setParticipants((prevParticipants) => {
        return [...prevParticipants, participant];
      });
    };

    const participantDisconnected = (participant: TwilioParticipant) => {
      setParticipants((prevParticipants) =>
        prevParticipants.filter((p) => p !== participant)
      );
    };

    room?.on("participantConnected", participantConnected);
    room?.on("participantDisconnected", participantDisconnected);

    return () => {
      room?.off("participantConnected", participantConnected);
      room?.off("participantDisconnected", participantDisconnected);
    };
  }, [room]);

  const handleSelectedParticipant = (participant: TwilioParticipant) => {
    setParticipantSelected(participant);
  };

  const handleShowName = (identity: string) => {
    return identity?.split("6C1B01A16E67")[0];
  };

  const Participants = participants.map((participant, index) => {
    return (
      participantSelected !== participant && (
        <Card
          key={participant.sid + index}
          isPressable
          shadow="sm"
          onPress={() => handleSelectedParticipant(participant)}
          className="w-40 relative flex justify-center bg-themeDark"
        >
          <p className="absolute z-20 bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-center rounded-full px-3 bg-[#9f9f9f57] min-w-10 max-w-20 truncate text-ellipsis overflow-hidden">
            {participant.sid === room.localParticipant.sid
              ? "You"
              : handleShowName(participant.identity)}
          </p>
          {participant.videoTracks.size > 0 ? (
            <Participant
              videoStyle="bg-blurEffect rounded-lg"
              key={participant.sid + index}
              participant={participant}
              avatartStyle="h-10 w-10 text-xs"
            />
          ) : (
            <CameraOffView
              isAudioSubscribe={isMicOn}
              avatartStyle="h-10 w-10 text-xs"
              name={handleShowName(participant.identity)}
            />
          )}
        </Card>
      )
    );
  });

  return (
    <div
      className={`flex-1 ${
        isContactSegment
          ? "grid grid-cols-5"
          : "flex flex-col items-center justify-center"
      } my-6 w-10/12 mx-auto`}
    >
      <div className="flex-1 flex flex-col items-center justify-center col-span-3">
        <div className="w-[720px] flex flex-col gap-4">
          {participantSelected && (
            <div className="relative w-[720px] h-[540px] bg-themeDark rounded-2xl overflow-hidden shadow-lg border-1 border-textSecondary">
              <p className="absolute z-20 top-3 left-5 text-md text-themeWhite text-center rounded-full py-0.5 px-3 bg-[#797979b5] min-w-28 max-w-48 truncate text-ellipsis overflow-hidden">
                {participantSelected.sid === room.localParticipant.sid
                  ? "You"
                  : handleShowName(participantSelected.identity)}
              </p>
              <div className="z-10 absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-7">
                {isMicOn ? (
                  <Button
                    isIconOnly
                    onClick={handleMicOff}
                    className="cursor-pointer p-3 rounded-full bg-themeWhite"
                  >
                    <Mic size={24} color="#000" />
                  </Button>
                ) : (
                  <Button
                    isIconOnly
                    onClick={handleMicOn}
                    className="cursor-pointer p-3 rounded-full bg-[#ee0000]"
                  >
                    <MicOff size={24} color="#FFF" />
                  </Button>
                )}
                {isCameraOn ? (
                  <Button
                    isIconOnly
                    onClick={handleCameraOff}
                    className="cursor-pointer p-3 rounded-full bg-themeWhite"
                  >
                    <Video size={24} color="#000" />
                  </Button>
                ) : (
                  <Button
                    isIconOnly
                    onClick={handleCameraOn}
                    className="cursor-pointer p-3 rounded-full bg-[#ee0000]"
                  >
                    <VideoOff size={24} color="#FFF" />
                  </Button>
                )}
                <Button
                  isIconOnly
                  onClick={handleLogout}
                  className="cursor-pointer p-3 rounded-full bg-themeWhite"
                >
                  <Phone size={24} color="#D91E2A" />
                </Button>
              </div>

              {participantSelected.videoTracks.size > 0 ? (
                <Participant
                  videoStyle="h-full w-full"
                  key={participantSelected.sid}
                  participant={participantSelected}
                  avatartStyle={""}
                />
              ) : (
                <CameraOffView
                  isAudioSubscribe={isMicOn}
                  avatartStyle=""
                  name={participantSelected.identity}
                />
              )}
            </div>
          )}
          <div className="overflow-auto flex h-28 flex-row gap-2 justify-center">
            {Participants}
          </div>
        </div>
      </div>
      {isContactSegment && (
        <div className="col-span-2">
          <div className="flex flex-col items-center justify-start border-2 rounded-lg p-2">
            <Tabs aria-label="Options" classNames={{ panel: "py-0" }}>
              <Tab key="note" title="Note">
                <CriteriaEvaluation
                  job={job}
                  applicantReportIds={applicantReportIds}
                />
              </Tab>
              <Tab key="live-chat" title="Live chat">
                <LiveChat />
              </Tab>
            </Tabs>
          </div>
        </div>
      )}
    </div>
  );
};

export default Room;
