import { LottieApp } from "@/lotties";
import { MessageCircle } from "lucide-react";
import React, { useState, useEffect, Fragment } from "react";
import Lottie from "react-lottie";
import ModalCommon from "../Modals/ModalCommon";
import { useDisclosure } from "@nextui-org/react";
import ChatBox, { Message } from "./components/chatBox";
import { TJob } from "@/api/jobApi";
const padding = 20; // Padding from the edges

export const AIChat = () => {
  const chatBox = useDisclosure();
  const [position, setPosition] = useState({
    x: window.innerWidth - 150 - padding, // 220 is approximate width of component
    y: window.innerHeight - 200 - padding, // 140 is approximate height of component
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "start",
      content: "Start chat",
      sender: "user",
      inVisible: true,
      timestamp: new Date(),
    },
    {
      id: "welcome",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "model",
      timestamp: new Date(),
    },
  ]);

  // Calculate initial position at bottom right
  const calculatePosition = () => {
    return {
      x: window.innerWidth - 150 - padding, // 220 is approximate width of component
      y: window.innerHeight - 200 - padding, // 140 is approximate height of component
    };
  };

  // Set initial position and handle window resize
  useEffect(() => {
    const updatePosition = () => {
      // Only update position if not being dragged
      if (!isDragging) {
        setPosition({ ...position, x: window.innerWidth - 200 - padding });
      }
    };

    // Set initial position
    updatePosition();

    // Add resize listener
    window.addEventListener("resize", updatePosition);

    return () => window.removeEventListener("resize", updatePosition);
  }, [isDragging]);

  // Handle mouse down event to start dragging
  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Handle mouse move event while dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <Fragment>
      <div
        className="fixed cursor-move"
        style={{
          left: position.x,
          top: position.y,
          zIndex: 50,
          touchAction: "none",
        }}
        onMouseDown={handleMouseDown}
      >
        <button
          onClick={() => chatBox.onOpen()}
          className="flex flex-col items-center"
        >
          <Lottie
            style={{ width: 150 }}
            options={{
              loop: true,
              autoplay: true,
              animationData: LottieApp.AIBot,
              rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
              },
            }}
            isClickToPauseDisabled={true}
            width={"100%"}
          />
          <div className="bg-themeOrange border-1 border-themeWhite flex px-4 py-2 rounded-md items-center gap-3">
            <MessageCircle />
            <p className="text-sm text-themeWhite">AI Assistant</p>
          </div>
        </button>
      </div>
      <ModalCommon size={"2xl"} disclosure={chatBox}>
        <ChatBox messages={messages} setMessages={setMessages} onClose={() => {}} onSendMessage={(words) => {}} />
      </ModalCommon>
    </Fragment>
  );
};
