"use client";

import { TCareer } from "@/api/careerApi";
import jobApi, { TJob } from "@/api/jobApi";
import JobSection from "@/components/JobSection";
import { Button } from "@nextui-org/react";
import {
  ChevronLeft,
  EllipsisVertical,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type HeaderMeetingProps = {
  setIsContactSegment: (value: boolean) => void;
  jobId: string;
  isContactSegment: boolean;
  isOpenPanel: boolean;
};

const HeaderMeeting: React.FC<HeaderMeetingProps> = ({
  jobId,
  setIsContactSegment,
  isContactSegment,
  isOpenPanel,
}): React.JSX.Element => {
  const router = useRouter();
  const [job, setJob] = useState<Partial<TJob>>({});

  useEffect(() => {
    (async () => {
      if (!jobId) return;
      const { job } = await jobApi.getJobById(jobId);
      setJob(job);
    })();
  }, [jobId]);

  return (
    <div className="w-10/12 mx-auto flex justify-between items-center mt-8">
      <div className="flex gap-4 items-center">
        <div>
          <Button
            onPress={() => router.push("/")}
            isIconOnly={true}
            radius="full"
          >
            <ChevronLeft />
          </Button>
        </div>
        <div>
          <JobSection
            title={job?.title as string}
            content={(job?.career as TCareer)?.name}
          />
        </div>
      </div>
      {isOpenPanel && (
        <Button
          onPress={() => setIsContactSegment(!isContactSegment)}
          isIconOnly={true}
          radius="sm"
          className="bg-transparent"
        >
          {isContactSegment ? <PanelRightClose /> : <PanelRightOpen />}
        </Button>
      )}
    </div>
  );
};

export default HeaderMeeting;
