"use client";

import React from "react";

type LobbyProps = {
  username: string;
  handleUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  roomName: string;
  handleRoomNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  createNewRoom: () => void;
  connecting: boolean;
};

const Lobby: React.FC<LobbyProps> = ({
  username,
  handleUsernameChange,
  roomName,
  handleRoomNameChange,
  handleSubmit,
  createNewRoom,
  connecting,
}) => {
  return (
    <div className="flex-1">
      <h2 className="text-themeDark">Enter a room</h2>
      <div>
        <label className="text-themeDark" htmlFor="name">
          Name:
        </label>
        <input
          type="text"
          id="field"
          className="text-themeDark"
          value={username}
          onChange={handleUsernameChange}
          readOnly={connecting}
          required
        />
      </div>

      <div>
        <label className="text-themeDark" htmlFor="room">
          Room name:
        </label>
        <input
          type="text"
          id="room"
          className="text-themeDark"
          value={roomName}
          onChange={handleRoomNameChange}
          readOnly={connecting}
          required
        />
      </div>

      <button
        className="text-themeDark"
        type="submit"
        onClick={handleSubmit}
        disabled={connecting}
      >
        {connecting ? "Connecting" : "Join"}
      </button>
      <button className="text-themeDark" type="submit" onClick={createNewRoom}>
        Create New Room
      </button>
    </div>
  );
};

export default Lobby;
