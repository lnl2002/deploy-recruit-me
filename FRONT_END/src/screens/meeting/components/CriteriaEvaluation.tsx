import {
  Accordion,
  AccordionItem,
  Button,
  Textarea,
  Spinner,
} from "@nextui-org/react";
import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/store/store";
import applicantReportApi, {
  IApplicantReport,
  IDetailCriteria,
} from "@/api/applicantReportApi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import applyApi, { ICVScore } from "@/api/applyApi";
import ScoreApplicant from "./ScoreApplicant";

type CriteriaEvaluationProps = {
  cvScore: ICVScore;
  applicantReportIds: string[];
  applyId: string;
};

const CriteriaEvaluation: React.FC<CriteriaEvaluationProps> = ({
  cvScore,
  applyId,
}): React.JSX.Element => {
  const router = useRouter();
  const { userInfo } = useAppSelector((state) => state.user);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [detailsCriteria, setDetailsCriteria] = useState<IDetailCriteria[]>([]);
  const [criteriaIndex, setCriteriaIndex] = useState<number>(0);
  const [updateApplicantReportSegment, setUpdateApplicantReportSegment] =
    useState<string>("");
  const [scoreSelected, setScoreSelected] = useState<number>(0);

  //update
  useEffect(() => {
    const roles = ["RECRUITER", "INTERVIEWER", "INTERVIEW_MANAGER"];
    const isAllowed = roles.some((role) => userInfo?.role === role);
    if (!isAllowed || detailsCriteria.length === 0) return;

    const intervalId = setInterval(
      async () => {
        const { data, status } = await applicantReportApi.updateApplicantReport(
          applyId,
          {
            details: detailsCriteria,
            score: scoreSelected,
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
  }, [detailsCriteria, updateApplicantReportSegment, scoreSelected, applyId]);

  useEffect(() => {
    (async () => {
      const { applicantReport } = await applyApi.getApplicationByApply(applyId);

      const otherCriteria = {
        criteriaName: "Other",
        comment: "",
      };

      if ((applicantReport as IApplicantReport)?.details?.length > 0) {
        const { details, score } = applicantReport as IApplicantReport;
        setScoreSelected((prev) => score || prev);

        setDetailsCriteria([
          ...details.map((detail) => ({
            criteriaName: detail.criteriaName,
            comment: detail.comment || "",
          })),
        ]);
      } else {
        const { detailScore } = cvScore;
        const newCriteriaReport = [
          ...detailScore.map((detail) => ({
            criteriaName: detail.criterion,
            comment: "",
          })),
          otherCriteria,
        ];
        await applicantReportApi.addApplicantReport(applyId, {});
        setDetailsCriteria(newCriteriaReport);
      }
    })();
  }, [cvScore, applyId]);

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

  if (!cvScore || detailsCriteria.length === 0) {
    return (
      <div className={"flex justify-center my-10"}>
        <Spinner />
      </div>
    );
  }

  const ViewScore = ({ average }: { average: string }): React.JSX.Element => {
    const [score, totalScore] = average.split("/");
    return (
      <p className="text-sm text-blurEffect text-end px-4">
        <span className="font-bold text-themeOrange">{score || "0"}</span>/
        {totalScore || "0"}
      </p>
    );
  };

  return (
    <div className="max-h-[75vh] flex flex-col gap-8 p-2">
      <ScoreApplicant
        scoreSelected={scoreSelected}
        setScoreSelected={setScoreSelected}
      />
      <div className="bg-themeOrange h-1/4 px-2 py-1 rounded-lg custom-scrollbar-thin">
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
        className="flex flex-col gap-4 custom-scrollbar-thin h-3/4"
      >
        {detailsCriteria.map((detail, index) => (
          <div key={detail._id + detail.criteriaName}>
            <Accordion>
              <AccordionItem
                key={detail._id + detail.criteriaName}
                aria-label={detail.criteriaName}
                title={
                  <p className="text-themeDark text-md font-bold px-1">
                    {index + 1}. {detail.criteriaName}
                  </p>
                }
              >
                <p className="text-blurEffect text-xs font-normal px-1">
                  {cvScore.detailScore[index]?.explanation}
                </p>
              </AccordionItem>
            </Accordion>
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
              <ViewScore
                average={(cvScore.detailScore[index]?.score as string) ?? ""}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriteriaEvaluation;
