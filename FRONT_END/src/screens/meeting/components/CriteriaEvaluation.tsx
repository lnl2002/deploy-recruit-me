import { Button, Textarea } from "@nextui-org/react";
import { useRef, useState } from "react";

const CriteriaEvaluation: React.FC = (): React.JSX.Element => {
  const targetRef = useRef<HTMLDivElement | null>(null);

  const [criteriaIndex, setCriteriaIndex] = useState<number>(0);

  // Hàm cuộn đến phần tử
  const handleScrollToElement = (index: number) => {
    if (targetRef.current) {
      const elementHeight = targetRef.current.scrollHeight / 12;
      targetRef.current.scrollTo({
        top: elementHeight * index,
        behavior: "smooth",
      });
    }

    setCriteriaIndex(index);
  };
  return (
    <div className="max-h-[75vh] flex flex-col gap-8">
      <h1>Criteria Evaluation</h1>
      <div className="bg-themeOrange h-1/4 px-4 py-2 rounded-lg custom-scrollbar-thin">
        {Array.from({ length: 12 }).map((_, index) => (
          <Button
            key={index}
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
              {index + 1}. Criteria {index}
            </p>
          </Button>
        ))}
      </div>
      <div
        ref={targetRef}
        className="flex flex-col gap-4 overflow-hidden h-3/4"
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index}>
            <p className="text-themeDark text-md font-bold">
              {index}. Criteria {index}
            </p>
            <div>
              <Textarea
                minRows={4}
                fullWidth={true}
                variant="bordered"
                placeholder="Add your comment"
                className="text-themeDark"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriteriaEvaluation;
