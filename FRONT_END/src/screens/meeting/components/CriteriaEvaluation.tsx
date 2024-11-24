import { Button, Textarea } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/store/store";
import applicantReportApi, { IDetailCriteria } from "@/api/applicantReportApi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import applyApi, { ICVScore } from "@/api/applyApi";

type CriteriaEvaluationProps = {
  cvScore: ICVScore;
  applicantReportIds: string[];
};

const CriteriaEvaluation: React.FC<CriteriaEvaluationProps> = ({
  cvScore,
  applicantReportIds,
}): React.JSX.Element => {
  const router = useRouter();
  const { userInfo } = useAppSelector((state) => state.user);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [detailsCriteria, setDetailsCriteria] = useState<IDetailCriteria[]>([]);
  const [criteriaIndex, setCriteriaIndex] = useState<number>(0);
  const [updateApplicantReportSegment, setUpdateApplicantReportSegment] =
    useState<string>("");

  //update
  useEffect(() => {
    const roles = ["RECRUITER", "INTERVIEWER", "INTERVIEW_MANAGER"];
    const isAllowed = roles.some((role) => userInfo?.role === role);
    if (!isAllowed || detailsCriteria.length === 0) return;

    const intervalId = setInterval(
      async () => {
        const { data, status } = await applicantReportApi.updateApplicantReport(
          {
            applicantReportIds,
            applicantReport: {
              details: detailsCriteria,
            },
          }
        );

        if (!data?._id) {
          if (status === 401) {
            toast.error("Unauthorized. Please login again.");
            clearInterval(intervalId);
            router.push("/login");
            return;
          }
          toast.error(`Error updating!`);
          setUpdateApplicantReportSegment("update-failed");
        } else {
          setUpdateApplicantReportSegment("update-successfully");
        }
      },
      updateApplicantReportSegment === "update-failed" ? 10000 : 1000
    );
    return () => clearInterval(intervalId);
  }, [detailsCriteria, updateApplicantReportSegment]);

  useEffect(() => {
    (async () => {
      const { applicantReport } =
        (await applyApi.getApplicationsByUser()) ?? {};

      if (applicantReport) {
        const { details } = applicantReport;
        setDetailsCriteria(
          details.map((detail) => ({
            criteriaName: detail.criteriaName,
            comment: detail.comment || "",
          }))
        );
      } else {
        const { detailScore } = cvScore;
        setDetailsCriteria(
          detailScore.map((detail) => ({
            criteriaName: detail.criterion,
            comment: "",
          }))
        );
      }
    })();
  }, [cvScore]);

  const handleScrollToElement = (index: number) => {
    if (targetRef.current) {
      const elementHeight =
        targetRef.current.scrollHeight / cvScore.detailScore.length;
      targetRef.current.scrollTo({
        top: elementHeight * index,
        behavior: "smooth",
      });
    }

    setCriteriaIndex(index);
  };

  const handleCommentChange = (index: number, value: string) => {
    setDetailsCriteria((prevs) =>
      prevs.map((detailsCriteria, detailsCriteriaIndex) => {
        if (detailsCriteriaIndex === index) {
          return {
            ...detailsCriteria,
            comment: value,
          };
        }
        return detailsCriteria;
      })
    );
  };

  if (!cvScore) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-h-[75vh] flex flex-col gap-8 p-2">
      <div className="bg-themeOrange h-1/4 px-2 rounded-lg custom-scrollbar-thin">
        {detailsCriteria.map((detail, index) => (
          <Button
            key={detail?._id + detail.criteriaName}
            className={`block truncate ${
              criteriaIndex === index
                ? "bg-themeWhite text-themeDark"
                : "bg-themeOrange text-themeWhite"
            }`}
            size="sm"
            fullWidth
            onPress={() => handleScrollToElement(index)}
          >
            <p className="text-md font-bold">
              {index + 1}. {detail.criteriaName}
            </p>
          </Button>
        ))}
      </div>
      <div
        ref={targetRef}
        className="flex flex-col gap-4 overflow-hidden h-3/4"
      >
        {detailsCriteria.map((detail, index) => (
          <div key={detail._id + detail.criteriaName}>
            <p className="text-themeDark text-md font-bold">
              {index + 1}. {detail.criteriaName}
            </p>
            <div>
              <Textarea
                onValueChange={(value: string) => {
                  handleCommentChange(index, value);
                }}
                value={detail.comment}
                minRows={4}
                fullWidth={true}
                variant="bordered"
                placeholder="Add your comment"
                className="text-themeDark"
                classNames={{
                  inputWrapper:
                    index === criteriaIndex ? "border-themeOrange" : "",
                }}
              />
              <p className="text-sm text-blurEffect text-end px-4">
                {cvScore.detailScore[index].score}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriteriaEvaluation;
