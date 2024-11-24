"use client";

import { TCareer } from "@/api/careerApi";
import jobApi, { TJob } from "@/api/jobApi";
import JobSection from "@/components/JobSection";
import { useAppSelector } from "@/store/store";
import { Button } from "@nextui-org/react";
import {
  ChevronLeft,
  EllipsisVertical,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  const { userInfo } = useAppSelector((state) => state.user);
  const [job, setJob] = useState<Partial<TJob>>({});

  useEffect(() => {
    (async () => {
      if (!jobId) return;
      const { job } = await jobApi.getJobById(jobId);
      setJob(job);
    })();
  }, [jobId]);

  const isAllowed = useMemo(() => {
    const roles = ["RECRUITER", "INTERVIEWER", "INTERVIEW_MANAGER"];
    return roles.some((role) => userInfo?.role === role);
  }, [userInfo]);

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
      {isOpenPanel && isAllowed && (
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
