"use client";

import React, { useState, useCallback, useEffect } from "react";
import Video, {
  Room as TwilioRoom,
  LocalTrack,
  LocalVideoTrack,
  LocalAudioTrack,
  LocalTrackPublication,
  ConnectOptions,
} from "twilio-video";
import meetingApi from "@/api/meetingApi";
// import Room from "./components/Room";
import Lobby from "./components/Lobby";
import dynamic from "next/dynamic";

const Room = dynamic(() => import("./components/Room"), { ssr: false });

export const Meeting = (): React.JSX.Element => {
  const [username, setUsername] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [room, setRoom] = useState<TwilioRoom | null>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [roomSid, setRoomSid] = useState<string>("");

  const handleUsernameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setUsername(event.target.value);
    },
    []
  );

  const handleRoomNameChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRoomName(event.target.value);
    },
    []
  );

  const createNewRoom = async () => {
    try {
      await meetingApi.createRoom(roomName);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = useCallback(async () => {
    //   event.preventDefault();
    setConnecting(true);
    try {
      const token = await meetingApi.getAccessToken(username, roomName);

      const connectedRoom = await Video.connect(token, {
        name: roomName,
      });

      console.log(connectedRoom.sid);
      connectedRoom.on("participantDisconnected", (participant) => {
        console.log("Participant Disconnected", participant.identity);
      });

      connectedRoom.on("participantReconnecting", (participant) => {
        console.log("Participant Reconnecting", participant.identity);
      });

      connectedRoom.on("participantReconnected", (participant) => {
        console.log("Participant Reconnected", participant.identity);
      });

      // setRoomSid(connectedRoom.sid);
      setRoom(connectedRoom);
    } catch (error) {
      console.log(error);
    } finally {
      setConnecting(false);
    }
  }, [roomName, username]);

  const handleLogout = useCallback(() => {
    console.log("sksksks");

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
  }, []);

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
      {room ? (
        <Room roomName={roomName} room={room} handleLogout={handleLogout} />
      ) : (
        <Lobby
          username={username}
          roomName={roomName}
          handleUsernameChange={handleUsernameChange}
          handleRoomNameChange={handleRoomNameChange}
          handleSubmit={handleSubmit}
          createNewRoom={createNewRoom}
          connecting={connecting}
        />
      )}
    </>
  );
};
