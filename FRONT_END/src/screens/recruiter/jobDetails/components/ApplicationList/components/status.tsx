import { Chip } from "@nextui-org/react";
import React from "react";

interface Props {
  status: string | undefined;
}

interface StatusConfig {
  message: string;
  label: string;
  styles: {
    base: string;
    content: string;
    dot: string;
  };
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  "New": {
    message: "You have applied to this job. Please check back frequently for updates.",
    label: "Applied",
    styles: {
      base: "bg-[#E0E0E1] border-none p-2",
      content: "text-[#000] font-bold",
      dot: "bg-[#000]"
    }
  },
  "Shortlisted": {
    message: "Your CV has been shortlisted for an interview. Please check back frequently for updates.",
    label: "Shortlisted",
    styles: {
      base: "bg-[#FCFDDA] border-none p-2",
      content: "text-[#EEDB32] font-bold",
      dot: "bg-[#EEDB32]"
    }
  },
  "Pending Interview Confirmation": {
    message: "We have successfully scheduled your interview. Kindly take note of the details.",
    label: "Interview Pending",
    styles: {
      base: "bg-[#E1F7FC] border-none p-2",
      content: "text-[#0FB1C5] font-bold",
      dot: "bg-[#0FB1C5]"
    }
  },
  "Interview Scheduled": {
    message: "We are pleased to inform you that you have successfully passed the interview. A formal job offer will be sent to you shortly.",
    label: "Accepted",
    styles: {
      base: "bg-[#E4FCE1] border-none p-2",
      content: "text-[#2A803E] font-bold",
      dot: "bg-[#2A803E]"
    }
  },
  "Interview Rescheduled": {
    message: "We have rescheduled your interview. Kindly review the updated details.",
    label: "Interview Rescheduled",
    styles: {
      base: "bg-[#FCEAE1] border-none p-2",
      content: "text-[#F36523] font-bold",
      dot: "bg-[#F36523]"
    }
  },
  "Interviewed": {
    message: "We have rescheduled your interview. Kindly review the updated details.",
    label: "Interviewed",
    styles: {
      base: "bg-[#E1F7FC] border-none p-2",
      content: "text-[#0FB1C5] font-bold",
      dot: "bg-[#0FB1C5]"
    }
  },
  "Accepted": {
    message: "Thank you for completing the interview. We will be in touch with you shortly regarding the results.",
    label: "Interviewed",
    styles: {
      base: "bg-[#E1F7FC] border-none p-2",
      content: "text-[#0FB1C5] font-bold",
      dot: "bg-[#0FB1C5]"
    }
  },
  "Rejected": {
    message: "Thank you for your interest in our company and for taking the time to interview. After careful consideration, we have decided to move forward with other candidates at this time. We wish you the best in your future endeavors.",
    label: "Rejected",
    styles: {
      base: "bg-[#FCE1E1] border-none p-2",
      content: "text-[#D91E2A] font-bold",
      dot: "bg-[#D91E2A]"
    }
  }
};

// Default configuration
const getDefaultConfig = (status: string) => {
  return {
    message: "Your CV is under our review. Please check back frequently for updates.",
    label: status + " (old)",
    styles: {
      base: "bg-[#E0E0E1] border-none p-2",
      content: "text-[#000] font-bold",
      dot: "bg-[#000]"
    }
  }
};

const Status: React.FC<Props> = ({ status }) => {
  if (!status) return (<></>)
  const config = STATUS_CONFIG[status] || getDefaultConfig(status);

  return (
    <div>
      {
        status && <Chip
          variant="dot"
          classNames={{
            base: config.styles.base,
            content: config.styles.content,
            dot: config.styles.dot,
          }}
        >
          {config.label}
        </Chip>
      }
    </div>
  );
};

// Export the getStateText function if needed elsewhere
export const getStateText = (status: string): [string, string] => {
  const config = STATUS_CONFIG[status] || getDefaultConfig(status);
  return [config.message, config.label];
};

export default Status;