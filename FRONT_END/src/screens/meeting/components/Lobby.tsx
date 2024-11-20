"use client";

import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button, Input } from "@nextui-org/react";
import CameraOffView from "./CameraOffView";

type LobbyProps = {
  username: string;
  handleUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  createNewRoom: () => void;
  connecting: boolean;
  setIsCameraOn: (isCameraOn: boolean) => void;
  setIsMicOn: (isCameraOn: boolean) => void;
  isCameraOn: boolean;
  isMicOn: boolean;
};

const Lobby: React.FC<LobbyProps> = ({
  username,
  handleUsernameChange,
  handleSubmit,
  createNewRoom,
  connecting,
  setIsCameraOn,
  setIsMicOn,
  isMicOn,
  isCameraOn,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  let videoStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    (async () => {
      try {
        videoStream.current = await navigator.mediaDevices.getUserMedia({
          video: isCameraOn,
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = videoStream.current;
          videoRef.current.play();
        }
      } catch (err: any) {
        console.log("Error accessing camera: ", err.message);
      }
    })();
    return () => {
      if (videoStream.current) {
        videoStream?.current.getTracks().forEach((track) => {
          track.stop();
        });
        videoStream.current = null;
      }
    };
  }, [isCameraOn]);

  const handleCameraOff = async () => {
    if (videoStream.current) {
      videoStream?.current.getVideoTracks().forEach((track) => {
        track.stop();
      });
      videoStream.current = null;
    }
    setIsCameraOn(false);
  };

  const handleMicOff = () => {
    setIsMicOn(false);
  };

  const handleCameraOn = () => {
    setIsCameraOn(true);
  };

  const handleMicOn = () => {
    setIsMicOn(true);
  };

  return (
    <div className="flex-1 justify-center gap-8 my-6 grid grid-cols-6 w-9/12 mx-auto">
      <div className="col-span-2">
        <div className="w-auto flex flex-col gap-4 items-center">
          <h2 className="text-themeDark text-2xl font-semibold">
            Enter a room
          </h2>
          <Input
            label="User name"
            labelPlacement="outside"
            variant="bordered"
            placeholder="Enter your user name"
            type={"text"}
            size={"sm"}
            value={username}
            onChange={handleUsernameChange}
            className="min-w-60"
            classNames={{
              inputWrapper: "shadow-none border-none rounded-none",
              input: "text-themeDark",
              innerWrapper: "border-b-2",
              label: "text-[14px]",
            }}
          />

          <Button
            className="font-bold"
            type="button"
            onClick={handleSubmit}
            color="primary"
            disabled={connecting}
            fullWidth={true}
          >
            {connecting ? "Connecting..." : "Join"}
          </Button>
          <Button
            className="font-bold"
            type="button"
            onClick={createNewRoom}
            color="primary"
            disabled={connecting}
            fullWidth={true}
          >
            Create New Room
          </Button>
        </div>
      </div>
      <div className="col-span-4 flex justify-center">
        <div className="relative w-[720px] h-[540px] bg-themeDark rounded-2xl overflow-hidden">
          {!isMicOn && (
            <MicOff
              className="absolute z-20 right-3 top-3"
              size={16}
              color={!isCameraOn ? "#FFF" : "#000"}
            />
          )}
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
          </div>
          {isCameraOn ? (
            <video
              className="rounded-xl h-full w-full"
              style={{ transform: "scaleX(-1)" }}
              ref={videoRef}
              autoPlay={isCameraOn}
            />
          ) : (
            <CameraOffView isAudioSubscribe={isMicOn} name={username} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
