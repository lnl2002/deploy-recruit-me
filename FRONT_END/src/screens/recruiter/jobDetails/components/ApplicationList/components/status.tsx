import { Chip } from "@nextui-org/react";
import React from "react";

interface Props {
  status: string;
}

const Status: React.FC<Props> = ({ status }: Props) => {
  const chipColor = getChipColor(status);

  return (
    <div>
      <Chip
        variant="dot"
        classNames={{
          base: (() => {
            switch (status) {
              case "New":
                return "bg-[#E0E0E1] border-none p-2"; 
              case "Shortlisted":
                return "bg-[#FCFDDA] border-none p-2";
              case "Interview Pending":
                return "bg-[#E1F7FC] border-none p-2";
              case "Interview Rescheduled":
                return "bg-[#FCEAE1] border-none p-2";
              case "Approval Interview Scheduled":
              case "Interviewed":
                return "bg-[#E1F7FC] border-none p-2";
              case "Accepted":
                return "bg-[#E4FCE1] border-none p-2";
              case "Rejected":
                return "bg-[#FCE1E1] border-none p-2";
              default:
                return "bg-[#E0E0E1] border-none p-2"; // Mặc định
            }
          })(),
          content: (() => {
            switch (status) {
              case "New":
                return "text-[#000] font-bold";
              case "Shortlisted":
                return "text-[#EEDB32] font-bold";
              case "Interview Pending":
                return "text-[#0FB1C5] font-bold";
              case "Interview Rescheduled":
                return "text-[#F36523] font-bold";
              case "Approval Interview Scheduled":
              case "Interviewed":
                return "text-[#0FB1C5] font-bold";
              case "Accepted":
                return "text-[#2A803E] font-bold";
              case "Rejected":
                return "text-[#D91E2A] font-bold";
              default:
                return "text-[#000] font-bold";
            }
          })(),
          dot: (() => {
            switch (status) {
              case "New":
                return "bg-[#000]";
              case "Shortlisted":
                return "bg-[#EEDB32]";
              case "Interview Pending":
                return "bg-[#0FB1C5]";
              case "Interview Rescheduled":
                return "bg-[#F36523]";
              case "Approval Interview Scheduled":
              case "Interviewed":
                return "bg-[#0FB1C5]";
              case "Accepted":
                return "bg-[#2A803E]";
              case "Rejected":
                return "bg-[#D91E2A]";
              default:
                return "bg-[#000]";
            }
          })(),
        }}
      >
        {status}
      </Chip>
    </div>
  );
};

const getChipColor = (status: string) => {
  switch (status) {
    case "New":
      return {
        bg: "#E0E0E1",
        text: "#000",
      };
    case "Shortlisted":
      return {
        bg: "#FCFDDA",
        text: "#EEDB32",
      };
    case "Interview Pending":
      return {
        bg: "#E1F7FC",
        text: "#0FB1C5",
      };
    case "Interview Rescheduled":
      return {
        bg: "#FCEAE1",
        text: "#F36523",
      };
    case "Approval Interview Scheduled":
      return {
        bg: "#E1F7FC",
        text: "#0FB1C5",
      };
    case "Interviewed":
      return {
        bg: "#E1F7FC",
        text: "#0FB1C5",
      };
    case "Accepted":
      return {
        bg: "#E4FCE1",
        text: "#2A803E",
      };
    case "Rejected":
      return {
        bg: "#FCE1E1",
        text: "#D91E2A",
      };
    default:
      return {
        bg: "#E0E0E1",
        text: "#000",
      };
  }
};

export default Status;
