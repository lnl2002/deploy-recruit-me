"use client";

import { Button, Chip } from "@nextui-org/react";
import { Mic, MicOff, Phone, Video, VideoOff } from "lucide-react";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import TwilioVideo, {
  Room as TwilioRoom,
  Participant as TwilioParticipant,
  createLocalVideoTrack,
  LocalVideoTrackPublication,
  LocalTrackPublication,
  LocalAudioTrackPublication,
  createLocalAudioTrack,
} from "twilio-video";
// import Participant from "./Participant";

const Participant = dynamic(() => import("./Participant"), { ssr: false });

interface RoomProps {
  roomName?: string;
  room: TwilioRoom;
  handleLogout?: () => void;
  setIsCameraOn: (isCameraOn: boolean) => void;
  setIsMicOn: (isCameraOn: boolean) => void;
  isCameraOn: boolean;
  isMicOn: boolean;
}

const Room: React.FC<RoomProps> = ({
  roomName,
  room,
  handleLogout,
  setIsCameraOn,
  setIsMicOn,
  isCameraOn,
  isMicOn,
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
    // Khởi tạo lại video track
    createLocalVideoTrack()
      .then((localVideoTrack) => {
        return room.localParticipant.publishTrack(localVideoTrack);
      })
      .then((publication: LocalTrackPublication) => {
        // setParticipantSelected(room.localParticipant);
        setIsCameraOn(true);
      });
  };

  const handleMicOn = () => {
    if (!room) return;
    createLocalAudioTrack()
      .then((localAudioTrack) => {
        return room.localParticipant.publishTrack(localAudioTrack);
      })
      .then((publication: LocalTrackPublication) => {
        setIsMicOn(true);
      });
  };

  useEffect(() => {
    localParticipant(room.localParticipant);

    const participantConnected = (participant: TwilioParticipant) => {
      console.log("Participant connected:", participant.identity);

      setParticipants((prevParticipants) => {
        return [...prevParticipants, participant];
      });
    };

    const participantDisconnected = (participant: TwilioParticipant) => {
      console.log("Participant disconnected:", participant.identity);

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

  const Participants = participants.map(
    (participant, index) =>
      participantSelected !== participant && (
        <div
          key={participant.sid + index}
          onClick={() => handleSelectedParticipant(participant)}
          className="relative flex justify-center"
        >
          <p className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-center rounded-full px-3 bg-[#bebbbb57] min-w-10 max-w-20 truncate text-ellipsis overflow-hidden">
            {participant.sid === room.localParticipant.sid
              ? "You"
              : participant.identity}
          </p>
          <Participant
            videoStyle="bg-blurEffect w-40 rounded-lg"
            key={participant.sid + index}
            participant={participant}
          />
        </div>
      )
  );

  return (
    <div className="flex-1 flex flex-col items-center justify-center my-6">
      <div className="flex-1 w-[70vw] flex flex-col items-center justify-center">
        <h2 className="text-themeDark">Room: {roomName}</h2>
        <button className="text-themeDark" onClick={handleLogout}>
          Log out
        </button>

        <div className="w-2/3 flex flex-col gap-4">
          {participantSelected && (
            <div className="relative">
              <div className="z-10 absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-7">
                {isMicOn ? (
                  <Button
                    isIconOnly
                    onClick={handleMicOff}
                    className="bg-themeWhite"
                  >
                    <Mic size={24} color="#000" />
                  </Button>
                ) : (
                  <Button
                    isIconOnly
                    onClick={handleMicOn}
                    className="bg-themeWhite"
                  >
                    <MicOff size={24} color="#000" />
                  </Button>
                )}
                {isCameraOn ? (
                  <Button
                    isIconOnly
                    onClick={handleCameraOff}
                    className="bg-themeWhite"
                  >
                    <Video size={24} color="#000" />
                  </Button>
                ) : (
                  <Button
                    isIconOnly
                    onClick={handleCameraOn}
                    className="bg-themeWhite"
                  >
                    <VideoOff size={24} color="#000" />
                  </Button>
                )}
                <Button
                  isIconOnly
                  onClick={handleLogout}
                  className="bg-themeWhite"
                >
                  <Phone size={24} color="#D91E2A" />
                </Button>
              </div>
              {participantSelected.videoTracks.size > 0 ? (
                <Participant
                  videoStyle="w-full rounded-lg"
                  key={participantSelected.sid}
                  participant={participantSelected}
                />
              ) : (
                <div className="w-full rounded-lg h-full bg-blurEffectGold">
                  sssss
                </div>
              )}
            </div>
          )}
          <div className="overflow-auto flex flex-row gap-2 justify-center">
            {Participants}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
