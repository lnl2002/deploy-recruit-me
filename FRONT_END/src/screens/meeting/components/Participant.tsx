"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Participant as TwilioParticipant,
  Track,
  TrackPublication,
  AudioTrack,
  VideoTrack,
  DataTrackPublication,
  VideoTrackPublication,
  AudioTrackPublication,
} from "twilio-video";

interface ParticipantProps {
  participant: TwilioParticipant;
  videoStyle: string;
}

const Participant: React.FC<ParticipantProps> = ({
  participant,
  videoStyle,
}) => {
  const [videoTracks, setVideoTracks] = useState<VideoTrack[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Helper function to convert track publications to actual tracks
  const trackpubsToTracks = (
    trackMap: Map<string, TrackPublication>
  ): Track[] =>
    Array.from(trackMap.values())
      .filter(
        (publication): publication is DataTrackPublication =>
          !!(publication as VideoTrackPublication).track ||
          !!(publication as AudioTrackPublication).track
      )
      .map((publication) => (publication as DataTrackPublication).track!);

  useEffect(() => {
    const videoTracks = trackpubsToTracks(
      participant.videoTracks
    ) as VideoTrack[];
    const audioTracks = trackpubsToTracks(
      participant.audioTracks
    ) as AudioTrack[];

    setVideoTracks(videoTracks);
    setAudioTracks(audioTracks);

    const trackSubscribed = (track: Track) => {
      if (track.kind === "video") {
        setVideoTracks((prevVideoTracks) => [
          ...prevVideoTracks,
          track as VideoTrack,
        ]);
      } else if (track.kind === "audio") {
        setAudioTracks((prevAudioTracks) => [
          ...prevAudioTracks,
          track as AudioTrack,
        ]);
      }
    };

    const trackUnsubscribed = (track: Track) => {
      if (track.kind === "video") {
        setVideoTracks((prevVideoTracks) =>
          prevVideoTracks.filter((v) => v !== track)
        );
      } else if (track.kind === "audio") {
        setAudioTracks((prevAudioTracks) =>
          prevAudioTracks.filter((a) => a !== track)
        );
      }
    };

    participant.on("trackSubscribed", trackSubscribed);
    participant.on("trackUnsubscribed", trackUnsubscribed);

    return () => {
      setVideoTracks([]);
      setAudioTracks([]);
      participant.removeAllListeners();
    };
  }, [participant]);

  useEffect(() => {
    const videoTrack = videoTracks[0];
    if (videoTrack && videoRef.current) {
      videoTrack.attach(videoRef.current);
      return () => {
        videoTrack.detach(videoRef.current!);
      };
    }
  }, [videoTracks]);

  useEffect(() => {
    const audioTrack = audioTracks[0];
    if (audioTrack && audioRef.current) {
      audioTrack.attach(audioRef.current);
      return () => {
        audioTrack.detach(audioRef.current!);
      };
    }
  }, [audioTracks]);

  if (!participant.sid) return;

  return (
    <>
      <video className={`w-40 ${videoStyle}`} ref={videoRef} autoPlay={true} />
      <audio ref={audioRef} autoPlay={true} muted={false} />
    </>
  );
};

export default Participant;
