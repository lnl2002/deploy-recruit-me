import { Chip } from "@nextui-org/react";
import React from "react";

interface Props {
  status: string;
}

const JobStatus: React.FC<Props> = ({ status }: Props) => {
  return (
    <div className="flex justify-center items-center">
      <Chip
        variant="dot"
        classNames={{
          base: (() => {
            switch (status) {
              case "pending":
                return "bg-[#FCFDDA] border-none p-2";
              case "approved":
                return "bg-[#E1F7FC] border-none p-2";
              case "reopened":
                return "bg-[#FCEAE1] border-none p-2";
              case "published":
                return "bg-[#E4FCE1] border-none p-2";
              case "expired":
                return "bg-[#FCE1E1] border-none p-2";
              case "rejected":
                return "bg-[#FCE1E1] border-none p-2";
              default:
                return "bg-[#E0E0E1] border-none p-2"; // Mặc định
            }
          })(),
          content: (() => {
            switch (status) {
              case "pending":
                return "text-[#EEDB32] font-bold";
              case "approved":
                return "text-[#0FB1C5] font-bold";
              case "reopened":
                return "text-[#F36523] font-bold";
              case "published":
                return "text-[#2A803E] font-bold";
              case "expired":
                return "text-[#D91E2A] font-bold";
              case "rejected":
                return "text-[#D91E2A] font-bold";
              default:
                return "text-[#000] font-bold";
            }
          })(),
          dot: (() => {
            switch (status) {
              case "pending":
                return "bg-[#EEDB32]";
              case "approved":
                return "bg-[#0FB1C5]";
              case "reopened":
                return "bg-[#F36523]";
              case "published":
                return "bg-[#2A803E]";
              case "expired":
                return "bg-[#D91E2A]";
              case "rejected":
                return "bg-[#D91E2A]";
              default:
                return "bg-[#000]";
            }
          })(),
        }}
      >
        {status?.toUpperCase()}
      </Chip>
    </div>
  );
};

export default JobStatus;
