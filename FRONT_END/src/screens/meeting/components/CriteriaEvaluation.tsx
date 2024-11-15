import { Button, Textarea } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { TJob } from "@/api/jobApi";
import applicantReportApi, { IDetailCriteria } from "@/api/applicantReportApi";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type CriteriaEvaluationProps = {
  job: TJob;
  applicantReportIds: string[];
};

const CriteriaEvaluation: React.FC<CriteriaEvaluationProps> = ({
  job,
  applicantReportIds,
}): React.JSX.Element => {
  const router = useRouter();
  const targetRef = useRef<HTMLDivElement | null>(null);
  const [detailsCriteria, setDetailsCriteria] = useState<IDetailCriteria[]>([]);
  const [criteriaIndex, setCriteriaIndex] = useState<number>(0);
  const [updateApplicantReportSegment, setUpdateApplicantReportSegment] =
    useState<string>("");

  //update
  useEffect(() => {
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
    if (!job) return;

    const { criterias } = job;

    setDetailsCriteria(
      criterias.map((criteria) => ({
        criteriaName: criteria.criteriaName,
        comment: "",
      }))
    );
  }, [job]);

  const handleScrollToElement = (index: number) => {
    if (targetRef.current) {
      const elementHeight =
        targetRef.current.scrollHeight / job.criterias.length;
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

  if (!job) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-h-[75vh] flex flex-col gap-8 p-2">
      <div className="bg-themeOrange h-1/4 px-2 rounded-lg custom-scrollbar-thin">
        {job?.criterias?.map((criteria, index) => (
          <Button
            key={criteria?._id}
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
              {index + 1}. {criteria.criteriaName}
            </p>
          </Button>
        ))}
      </div>
      <div
        ref={targetRef}
        className="flex flex-col gap-4 overflow-hidden h-3/4"
      >
        {job?.criterias.map((criteria, index) => (
          <div key={criteria._id}>
            <p className="text-themeDark text-md font-bold">
              {index + 1}. {criteria.criteriaName}
            </p>
            <div>
              <Textarea
                onValueChange={(value: string) => {
                  handleCommentChange(index, value);
                }}
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriteriaEvaluation;
